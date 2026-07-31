from django.urls import path
#from .views import RegisterView, LoginView, UserProfileView, LogoutView
from .views import (
    register, login, logout, get_profile, update_profile
    #,prof
)
#from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('profile/', get_profile, name='get_profile'),
    path('update-profile/', update_profile, name='update_profile'),
    #path('prof/', prof, name='prof')
]