from django.urls import path
from .views import (
    get_all_listings,get_listing_by_id,create_listing,
    update_listing,delete_listing,get_listings_by_user,
    get_listings_by_category
)
urlpatterns = [
    path('', get_all_listings, name='get_all_listings'),
    path('<int:listing_id>/', get_listing_by_id, name='get_listing_by_id'),
    path('create/', create_listing, name='create_listing'),
    path('<int:listing_id>/update/', update_listing, name='update_listing'),
    path('<int:listing_id>/delete/', delete_listing, name='delete_listing'),
    path('user/<int:user_id>/', get_listings_by_user, name='get_listings_by_user'),
    path('category/', get_listings_by_category, name='get_listings_by_category'),
]
