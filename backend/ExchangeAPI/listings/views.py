#from django.shortcuts import render
#from django.db.migrations import serializer

#from django.db.migrations import serializer
#from matplotlib import category

from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import FurnitureItem
from .serializers import FurnitureItemSerializer, CreateListingSerializer
from rest_framework.pagination import PageNumberPagination

class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'pageSize'


@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_listings(request):
    paginator = StandardPagination()
    listings = FurnitureItem.objects.filter(
    statues='new'
    ).order_by('-created_at')
    page = paginator.paginate_queryset(listings, request)
    serializer = FurnitureItemSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)

    #serializer = FurnitureItemSerializer(listings, many=True)
    #return Response(serializer.data, status=status.HTTP_200_OK)
@api_view(['GET'])
@permission_classes([AllowAny])
def get_listing_by_id(request, listing_id):
    try:
        listing = FurnitureItem.objects.get(id=listing_id)
        serializer = FurnitureItemSerializer(listing)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except FurnitureItem.DoesNotExist:
        return Response({'error': 'Listing not found'},
                        status=status.HTTP_404_NOT_FOUND)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_listing(request):
    serializer = CreateListingSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_listing(request, listing_id):
    try:
        listing = FurnitureItem.objects.get(id=listing_id, user=request.user)
    except FurnitureItem.DoesNotExist:
        return Response({'error': 'Listing not found or you do not have permission to edit it.'},
                        status=status.HTTP_404_NOT_FOUND)

    serializer = CreateListingSerializer(listing, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_listing(request,listing_id):
    try:
        listing= FurnitureItem.objects.get(id=listing_id, user=request.user)
        if str(listing.userID) != str(request.user.userID):
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        listing.delete()
        return Response({'message': 'Listing deleted successfully'},
                        status=status.HTTP_200_OK)
    except FurnitureItem.DoesNotExist:
        return Response({'error': 'Listing not found or you do not have permission to delete it.'},
                        status=status.HTTP_404_NOT_FOUND)
@api_view(['GET'])
@permission_classes([AllowAny])
def get_listings_by_category(request):
    try:
        paginator= StandardPagination()
        category = request.data.get("category")
        listing= FurnitureItem.objects.filter(
        category= category,
        statues='new'
        ).order_by('-created_at')
        #serializer=FurnitureItemSerializer(listing,many=True)
        page= paginator.paginate_queryset(listing,request)
        serializer= FurnitureItemSerializer(page,many=True)
        return paginator.get_paginated_response(serializer.data)
    except FurnitureItem.DoesNotExist:
        return Response({'error': 'Listing not found or you do not have permission to view it.'},
                        status=status.HTTP_404_NOT_FOUND)   
@api_view(['GET'])
@permission_classes([AllowAny])
def get_listings_by_user(request, user_id):
    try:
        paginator= StandardPagination()
        listing= FurnitureItem.objects.filter(
        user_id= user_id
        ).order_by('-created_at')
        #serializer=FurnitureItemSerializer(listing,many=True)
        page= paginator.paginate_queryset(listing,request)
        serializer= FurnitureItemSerializer(page,many=True)
        return paginator.get_paginated_response(serializer.data)
    except FurnitureItem.DoesNotExist:
        return Response({'error': 'Listing not found or you do not have permission to view it.'},
                        status=status.HTTP_404_NOT_FOUND) 
# Create your views here.
