from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

from listings.models import FurnitureItem
from .models import TransactionRequest


@transaction.atomic
def accept_request(request_id: int, actor) -> TransactionRequest:
    request_obj = (
        TransactionRequest.objects.select_for_update()
        .select_related("listing__user", "offered_item")
        .get(pk=request_id)
    )
    if request_obj.listing.user_id != actor.id:
        raise PermissionDenied("Only the listing owner can accept this request.")
    if request_obj.status != TransactionRequest.Status.PENDING:
        raise ValidationError("Only pending requests can be accepted.")

    item_ids = [request_obj.listing_id]
    if request_obj.offered_item_id:
        item_ids.append(request_obj.offered_item_id)
    locked_items = {
        item.id: item
        for item in FurnitureItem.objects.select_for_update().filter(id__in=sorted(item_ids))
    }
    target = locked_items[request_obj.listing_id]
    if target.status != FurnitureItem.Status.AVAILABLE:
        raise ValidationError("This listing is no longer available.")

    involved_ids = {target.id}
    if request_obj.request_type == TransactionRequest.RequestType.PURCHASE:
        target.status = FurnitureItem.Status.SOLD
        target.save(update_fields=("status", "updated_at"))
    else:
        offered = locked_items.get(request_obj.offered_item_id)
        if not offered or offered.status != FurnitureItem.Status.AVAILABLE:
            raise ValidationError("The offered listing is no longer available.")
        if offered.user_id != request_obj.requester_id:
            raise ValidationError("The requester no longer owns the offered listing.")
        target.status = FurnitureItem.Status.EXCHANGED
        offered.status = FurnitureItem.Status.EXCHANGED
        target.save(update_fields=("status", "updated_at"))
        offered.save(update_fields=("status", "updated_at"))
        involved_ids.add(offered.id)

    now = timezone.now()
    request_obj.status = TransactionRequest.Status.ACCEPTED
    request_obj.resolved_at = now
    request_obj.save(update_fields=("status", "resolved_at", "updated_at"))

    TransactionRequest.objects.filter(status=TransactionRequest.Status.PENDING).filter(
        Q(listing_id__in=involved_ids) | Q(offered_item_id__in=involved_ids)
    ).exclude(pk=request_obj.pk).update(status=TransactionRequest.Status.REJECTED, resolved_at=now)
    return request_obj


@transaction.atomic
def resolve_request(request_id: int, actor, new_status: str) -> TransactionRequest:
    request_obj = TransactionRequest.objects.select_for_update().select_related("listing").get(pk=request_id)
    if request_obj.status != TransactionRequest.Status.PENDING:
        raise ValidationError("Only pending requests can be changed.")
    if new_status == TransactionRequest.Status.CANCELLED:
        if request_obj.requester_id != actor.id:
            raise PermissionDenied("Only the requester can cancel this request.")
    elif new_status == TransactionRequest.Status.REJECTED:
        if request_obj.listing.user_id != actor.id:
            raise PermissionDenied("Only the listing owner can reject this request.")
    else:
        raise ValidationError("Unsupported request transition.")
    request_obj.status = new_status
    request_obj.resolved_at = timezone.now()
    request_obj.save(update_fields=("status", "resolved_at", "updated_at"))
    return request_obj
