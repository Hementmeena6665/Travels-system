
from django.urls import path
from .views import (
    RegisterView,

    BusListCreateView, BusDetailView,
    DestinationListCreateView, DestinationDetailView,
    PackageListCreateView, PackageDetailView,
    BookingListCreateView, BookingDetailView,
    PaymentListCreateView, PaymentDetailView,
    ReviewListCreateView, ReviewDetailView,
    CreateRazorpayOrderView, VerifyPaymentView,
    ClearBookingHistoryView
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('buses/', BusListCreateView.as_view(), name='bus-list-create'),
    path('buses/<int:pk>/', BusDetailView.as_view(), name='bus-detail'),
   
    path('destinations/', DestinationListCreateView.as_view(), name='destination-list-create'),
    path('destinations/<int:pk>/', DestinationDetailView.as_view(), name='destination-detail'),

    path('packages/', PackageListCreateView.as_view(), name='package-list-create'),
    path('packages/<int:pk>/', PackageDetailView.as_view(), name='package-detail'),

    path('bookings/', BookingListCreateView.as_view(), name='booking-list-create'),
    path('bookings/<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),

    path('payments/', PaymentListCreateView.as_view()),
    path('payments/<int:pk>/', PaymentDetailView.as_view()),

    path('reviews/', ReviewListCreateView.as_view()), 
    path('reviews/<int:pk>/', ReviewDetailView.as_view()),

    path('razorpay-order/', CreateRazorpayOrderView.as_view(), name='razorpay-order'),
    path('verify-payment/', VerifyPaymentView.as_view(), name='verify-payment'),
    path('clear-history/', ClearBookingHistoryView.as_view(), name='clear-history'),
]