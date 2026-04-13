from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from rest_framework import serializers


# ========================
# AUCTION MODEL 🏷️ (EXTENDED)
# ========================

class Auction(models.Model):
    STATUS_CHOICES = (
        ('upcoming', 'Upcoming'),
        ('live', 'Live'),
        ('ended', 'Ended'),
        ('settled', 'Settled'),
    )

    # 🔗 LINK TO LISTING (CRITICAL FIX)
    listing = models.ForeignKey(
        'Listing',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='auction'
    )

    # BASIC INFO
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    is_settled = models.BooleanField(default=False)
    winning_bid = models.ForeignKey('Bid', null=True, blank=True, on_delete=models.SET_NULL)

    seller = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='auctions_sold'
    )

    # PRICING
    starting_price = models.DecimalField(max_digits=12, decimal_places=2)
    current_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    reserve_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    # ADMIN CONTROL (🔥 IMPORTANT)
    admin_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    admin_increment = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    admin_commission = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    admin_duration_hours = models.FloatField(null=True, blank=True)

    # FALLBACK VALUES
    increment = models.DecimalField(max_digits=10, decimal_places=2, default=100)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=5)
    duration = models.FloatField(default=24)

    # MEDIA
    image = models.URLField(blank=True, null=True)

    # TIME
    end_time = models.DateTimeField()
    start_time = models.DateTimeField(null=True, blank=True)

    # STATUS
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    is_settled = models.BooleanField(default=False)

    winning_bid = models.ForeignKey(
        'Bid',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='winning_auction'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # 🔥 AUTO STATUS UPDATE
    def save(self, *args, **kwargs):
        now = timezone.now()

        if self.end_time <= now and self.status != 'settled':
            if self.is_settled:
                self.status = 'settled'
            else:
                self.status = 'ended'

        super().save(*args, **kwargs)

    # 🔥 FINAL PRICE CALCULATION (VERY IMPORTANT)
    def get_final_price(self):
        if self.status != "ended" and self.status != "settled":
            return None

        highest_bid = self.bids.order_by('-amount').first()
        if not highest_bid:
            return None

        return highest_bid.amount

    # 🔥 NEXT MIN BID
    def get_min_next_bid(self):
        base = self.current_price or self.starting_price
        increment = self.admin_increment or self.increment
        return base + increment
    def get_final_price(self):
        if self.status != "ended" and self.status != "settled":
            return None

        highest_bid = self.bids.order_by('-amount').first()
        if not highest_bid:
            return None

        return highest_bid.amount
    def __str__(self):
        return f"{self.title} ({self.status})"

# ========================
# WALLET MODEL 
# ========================
from django.db import models
from django.contrib.auth.models import User

class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    available_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    hold_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.user.username} Wallet"


class WithdrawRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.amount} - {self.status}"


# ========================
# AUTO CREATE WALLET 🔥
# ========================
@receiver(post_save, sender=User)
def create_wallet(sender, instance, created, **kwargs):
    if created:
        Wallet.objects.get_or_create(user=instance)


# ========================
# DEPOSIT MODEL 🏦
# ========================
class Deposit(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    amount = models.DecimalField(max_digits=12, decimal_places=2)
    utr_number = models.CharField(max_length=100)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)

    proof_image = models.ImageField(upload_to='deposits/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - ₹{self.amount} ({self.status})"


# ========================
# BID MODEL 🔥
# ========================
class Bid(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bids')
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name='bids')

    amount = models.DecimalField(max_digits=12, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} bid ₹{self.amount} on {self.auction.title}"



# ========================
# LISTING MODEL (SELLER SUBMISSION)
# ========================
class Listing(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='listings')

    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)

    #ADD VIDEO 
    video = models.URLField(null=True, blank=True)

    starting_price = models.DecimalField(max_digits=12, decimal_places=2)

    end_time_duration_hours = models.FloatField(default=24)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
# ========================
# USER PROFILE 🔐
# ========================
class UserProfile(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_seller = models.BooleanField(default=False)  # Seller capability

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.status})"

class ListingImage(models.Model):
    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name='images'   
    )
    image = models.ImageField(upload_to='auctions/')

    def __str__(self):
        return f"{self.listing.title} Image"

class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('deposit', 'Deposit'),
        ('hold', 'Hold'),
        ('release', 'Release'),
        ('win', 'Win'),
        ('commission', 'Commission'),
        ('seller_credit', 'Seller Credit'),
        ('payout', 'Payout'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    transaction_type = models.CharField(
        max_length=50,
        choices=TRANSACTION_TYPES
    )

    amount = models.DecimalField(max_digits=12, decimal_places=2)

    # 🔥 IMPORTANT LINKS
    auction = models.ForeignKey(
        'Auction',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    bid = models.ForeignKey(
        'Bid',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    reference_id = models.CharField(max_length=255, null=True, blank=True)

    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta


class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    max_listings = models.IntegerField()
    duration_days = models.IntegerField()

    
    free_trial_days = models.IntegerField(default=0)
    is_free = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class SellerSubscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE)

    start_date = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)  # ✅ ADD THIS
    end_date = models.DateTimeField()

    listings_used = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.end_date:
            self.end_date = timezone.now() + timedelta(days=self.plan.duration_days)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.plan.name}"

class AdminBank(models.Model):
    account_holder = models.CharField(max_length=255, default="")
    bank_name = models.CharField(max_length=255, default="")
    account_number = models.CharField(max_length=50, default="")
    ifsc_code = models.CharField(max_length=20, default="")
    upi_id = models.CharField(max_length=100, blank=True, null=True)

    updated_at = models.DateTimeField(auto_now=True)

class Purchase(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)



class SellerBank(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    account_holder = models.CharField(max_length=100)
    bank_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=50)
    ifsc_code = models.CharField(max_length=20)
    upi_id = models.CharField(max_length=100, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)   

# consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
import json

class AuctionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("auctions", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("auctions", self.channel_name)

    async def send_update(self, event):
        await self.send(text_data=json.dumps(event["data"]))     

from decimal import Decimal

class Settlement(models.Model):
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE)

    # 🔥 FIXED (IMPORTANT)
    seller = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="seller_settlements"
    )

    buyer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    winning_amount = models.DecimalField(max_digits=12, decimal_places=2)
    commission = models.DecimalField(max_digits=12, decimal_places=2)
    seller_amount = models.DecimalField(max_digits=12, decimal_places=2)

    status = models.CharField(
        max_length=20,
        choices=[("pending", "Pending"), ("paid", "Paid")],
        default="pending"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Auction {self.auction.id} - ₹{self.winning_amount}"       

class SubscriptionPayment(models.Model):    
    stripe_payment_intent = models.CharField(max_length=255, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE)

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    status = models.CharField(max_length=20, default="pending")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.amount}"        


class SellerBalance(models.Model):
    seller = models.ForeignKey(User, on_delete=models.CASCADE)

    total_earned = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    pending_payout = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    updated_at = models.DateTimeField(auto_now=True)

class SellerBankAccount(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    account_holder = models.CharField(max_length=255)
    bank_name = models.CharField(max_length=255)
    account_number = models.CharField(max_length=50)
    ifsc_code = models.CharField(max_length=20)

    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)    
