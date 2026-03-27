from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    is_customer = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    phone = models.CharField(max_length=15, blank=True)
    def __str__(self):
        return self.username



class Bus(models.Model):
    bus_name = models.CharField(max_length=100)
    number = models.CharField(max_length=20, unique=True)
    origin = models.CharField(max_length=50)
    destination = models.CharField(max_length=50)
    features = models.TextField()
    start_time = models.TimeField()
    reach_time = models.TimeField() 
    price = models.DecimalField(max_digits=8,decimal_places=2)
    def __str__(self):
        return f"{self.bus_name} ({self.number})"

class Destination(models.Model):
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)

    description = models.TextField()
    image = models.ImageField(upload_to='destinations/')

    price = models.DecimalField(max_digits=10, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Package(models.Model):
    title = models.CharField(max_length=255)
    destination = models.ForeignKey(Destination, on_delete=models.CASCADE, related_name='packages')

    duration_days = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    description = models.TextField()
    available_slots = models.IntegerField()

    start_date = models.DateField()
    end_date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    package = models.ForeignKey(Package, on_delete=models.CASCADE, null=True, blank=True)
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, null=True, blank=True)

    number_of_people = models.IntegerField()
    seat_numbers = models.CharField(max_length=255, blank=True, null=True) # e.g. "1,4,8"

    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    booking_date = models.DateTimeField(auto_now_add=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        item = self.package.title if self.package else self.bus.bus_name if self.bus else "Unknown"
        return f"{self.user.username} - {item}"

class  Payment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    payment_status = models.CharField(
    max_length=20,
    choices=[
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed')
    ]
)
    payment_method = models.CharField(max_length=20)
    transaction_id = models.CharField(max_length=50,unique=True)

    def __str__(self):
        return f"{self.user.username} - {self.booking.id}"
    

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    package = models.ForeignKey(Package, on_delete=models.CASCADE)
    rating = models.IntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.package.title}"