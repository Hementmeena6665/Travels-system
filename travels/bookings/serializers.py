from rest_framework import serializers
from .models import User, Bus, Booking, Destination, Package,Payment, Review


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'phone']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class BusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus
        fields = '__all__'


class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destination
        fields = '__all__'


class PackageSerializer(serializers.ModelSerializer):
    destination = DestinationSerializer(read_only=True)
    destination_id = serializers.PrimaryKeyRelatedField(
        queryset=Destination.objects.all(),
        source='destination',
        write_only=True
    )

    class Meta:
        model = Package
        fields = '__all__'


class BookingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    package = PackageSerializer(read_only=True)

    package_id = serializers.PrimaryKeyRelatedField(
        queryset=Package.objects.all(),
        source='package',
        write_only=True,
        required=False,
        allow_null=True
    )

    bus = BusSerializer(read_only=True)
    bus_id = serializers.PrimaryKeyRelatedField(
        queryset=Bus.objects.all(),
        source='bus',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['user', 'total_price']

    def validate(self, data):
        if not data.get('package') and not data.get('bus'):
            raise serializers.ValidationError("Either package or bus must be selected for booking.")
        return data

class PaymentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    booking = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id',
            'user',
            'booking',
            'amount',
            'payment_status',
            'payment_method',
            'transaction_id',
            'payment_date'
        ]
        read_only_fields = ['transaction_id', 'payment_date']
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value

    def validate_payment_status(self, value):
        allowed = ['pending', 'completed', 'failed']
        if value.lower() not in allowed:
            raise serializers.ValidationError("Invalid payment status")
        return value

   
    def create(self, validated_data):
        import uuid
        validated_data['transaction_id'] = str(uuid.uuid4())
        return super().create(validated_data)
    


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    package = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = [
            'id',
            'user',
            'package',
            'rating',
            'comment',
            'created_at'
        ]
        read_only_fields = ['created_at']

  
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value

  
    def validate_comment(self, value):
        if len(value.strip()) < 5:
            raise serializers.ValidationError("Comment too short")
        return value
