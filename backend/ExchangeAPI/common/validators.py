from pathlib import Path

from django.core.exceptions import ValidationError
from PIL import Image, UnidentifiedImageError


MAX_IMAGE_SIZE = 5 * 1024 * 1024
ALLOWED_IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}


def validate_image_upload(upload) -> None:
    if upload.size > MAX_IMAGE_SIZE:
        raise ValidationError("Images must be 5 MB or smaller.")
    if Path(upload.name).suffix.lower() not in ALLOWED_IMAGE_SUFFIXES:
        raise ValidationError("Use a JPG, PNG, or WebP image.")
    try:
        image = Image.open(upload)
        image.verify()
        upload.seek(0)
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        raise ValidationError("The uploaded file is not a valid image.") from exc
