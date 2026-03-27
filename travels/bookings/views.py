from django.shortcuts import render
from rest_framework import generics, permissions,filters
from .permissions import IsAdminOrReadOnly
from .models import User, Bus, Destination, Package, Booking,Payment,Review
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    BusSerializer,
    DestinationSerializer,
    PackageSerializer,
    BookingSerializer,
    PaymentSerializer,
    ReviewSerializer
)
from rest_framework.views import APIView
from rest_framework.response import Response
import uuid

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

class BusListCreateView(generics.ListCreateAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [IsAdminOrReadOnly]


class BusDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [IsAdminOrReadOnly]


class DestinationListCreateView(generics.ListCreateAPIView):
    queryset = Destination.objects.all()
    serializer_class = DestinationSerializer
    permission_classes = [IsAdminOrReadOnly]


class DestinationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Destination.objects.all()
    serializer_class = DestinationSerializer
    permission_classes = [IsAdminOrReadOnly]


class PackageListCreateView(generics.ListCreateAPIView):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer
    permission_classes = [IsAdminOrReadOnly]

class PackageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer
    permission_classes = [IsAdminOrReadOnly]



class BookingListCreateView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        package = serializer.validated_data.get('package')
        bus = serializer.validated_data.get('bus')
        number_of_people = serializer.validated_data['number_of_people']

        price = 0
        if package:
            price = package.price
        elif bus:
            price = bus.price

        total_price = price * number_of_people

        serializer.save(
            user=self.request.user,
            total_price=total_price
        )


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)

class ClearBookingHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        Booking.objects.filter(user=request.user).delete()
        return Response({"status": "History cleared"})
    
class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user or request.method in permissions.SAFE_METHODS


class PaymentListCreateView(generics.ListCreateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['payment_status', 'payment_method', 'transaction_id']
    

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]


class ReviewListCreateView(generics.ListCreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [filters.SearchFilter]
    search_fields = ['comment', 'rating']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]


class CreateRazorpayOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking_id')
        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
            # Mock Razorpay order creation
            order_id = f"order_{uuid.uuid4().hex[:12]}"
            return Response({
                "id": order_id,
                "amount": int(booking.total_price * 100), # Amount in paise
                "currency": "INR",
                "receipt": f"receipt_{booking.id}"
            })
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=404)


class VerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        
        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
            booking.status = 'confirmed'
            booking.save()

            # Create Payment record
            Payment.objects.create(
                user=request.user,
                booking=booking,
                amount=booking.total_price,
                payment_status='completed',
                payment_method='razorpay',
                transaction_id=razorpay_payment_id
            )

            return Response({"status": "Payment verified and booking confirmed"})
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=404)
