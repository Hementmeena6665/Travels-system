import os
import django
import random
from datetime import time, date, timedelta

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travels.settings')
django.setup()

from bookings.models import Bus, Destination, Package

def seed_data():
    print("Seeding Madhya Pradesh data...")
    
    # 1. Create Destinations in MP
    mp_destinations = [
        {"name": "Khajuraho Temples", "city": "Khajuraho", "description": "Famous for its stunning Hindu and Jain temples with intricate carvings."},
        {"name": "Bhedaghat Marble Rocks", "city": "Jabalpur", "description": "Beautiful marble rocks on the banks of Narmada river."},
        {"name": "Pachmarhi Hill Station", "city": "Pachmarhi", "description": "The Queen of Satpura, known for its waterfalls and caves."},
        {"name": "Kanha National Park", "city": "Mandla", "description": "One of India's largest national parks and a tiger reserve."},
        {"name": "Mahakaleshwar Jyotirlinga", "city": "Ujjain", "description": "One of the twelve Jyotirlingas, a sacred pilgrimage site."},
        {"name": "Sanchi Stupa", "city": "Sanchi", "description": "Great Stupa at Sanchi, a UNESCO World Heritage site."},
    ]

    dest_objs = []
    for d in mp_destinations:
        dest, created = Destination.objects.get_or_create(
            name=d['name'],
            defaults={
                "city": d['city'],
                "country": "India",
                "description": d['description'],
                "price": random.randint(500, 2000),
                "image": "destinations/watch.png" # Using existing file as placeholder
            }
        )
        dest_objs.append(dest)
        if created:
            print(f"Created Destination: {dest.name}")

    # 2. Create Packages
    package_titles = [
        "Heritage Tour of Khajuraho",
        "Wild Safari in Kanha",
        "Spiritual Journey to Ujjain",
        "Nature Retreat in Pachmarhi",
        "MP Golden Triangle Tour",
        "Jabalpur Marble Rocks & Waterfalls"
    ]

    for title in package_titles:
        dest = random.choice(dest_objs)
        pkg, created = Package.objects.get_or_create(
            title=title,
            defaults={
                "destination": dest,
                "duration_days": random.randint(2, 7),
                "price": random.randint(5000, 15000),
                "description": f"Explore the beauty of {dest.name} with our exclusive package including guide and transport.",
                "available_slots": random.randint(10, 50),
                "start_date": date.today() + timedelta(days=random.randint(5, 30)),
                "end_date": date.today() + timedelta(days=random.randint(31, 60)),
            }
        )
        if created:
            print(f"Created Package: {pkg.title}")

    # 3. Create Buses
    bus_names = ["MP Tourism Express", "Narmada Travels", "Satpura Royal", "Vindhya Deluxe", "Bhopal Scania", "Indore Volvo"]
    mp_cities = ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Rewa"]
    
    for i in range(10):
        origin = random.choice(mp_cities)
        dest_city = random.choice([c for c in mp_cities if c != origin])
        bus_name = random.choice(bus_names)
        number = f"MP-{random.randint(10, 99)}-{chr(random.randint(65, 90))}{chr(random.randint(65, 90))}-{random.randint(1000, 9999)}"
        
        bus, created = Bus.objects.get_or_create(
            number=number,
            defaults={
                "bus_name": bus_name,
                "origin": origin,
                "destination": dest_city,
                "features": "AC, WiFi, Charging point, Reclining seats",
                "start_time": time(random.randint(5, 22), 0),
                "reach_time": time(random.randint(5, 23), 0),
                "price": random.randint(500, 2500),
            }
        )
        if created:
            print(f"Created Bus: {bus.bus_name} ({bus.number})")

    print("Seeding completed successfully!")

if __name__ == "__main__":
    seed_data()
