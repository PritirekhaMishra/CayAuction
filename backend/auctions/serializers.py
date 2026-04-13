from rest_framework import serializers
from .models import (
    Auction, Wallet, Deposit, Bid, Listing, Transaction, UserProfile
)
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Auction

# =========================
# USER
# =========================
class UserSerializer(serializers.ModelSerializer):
    profile_status = serializers.CharField(source='userprofile.status', read_only=True)
    is_seller = serializers.BooleanField(source='userprofile.is_seller', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile_status', 'is_seller']


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = UserProfile
        fields = '__all__'


# =========================
# WALLET / FINANCE
# =========================
class WalletSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Wallet
        fields = ['user', 'username', 'available_balance', 'hold_balance', 'updated_at']


class DepositSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Deposit
        fields = '__all__'


class TransactionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Transaction
        fields = '__all__'


# =========================
# BID
# =========================
class BidSerializer(serializers.ModelSerializer):
    bidder_name = serializers.CharField(source='user.username', read_only=True)
    auction_title = serializers.CharField(source='auction.title', read_only=True)

    class Meta:
        model = Bid
        fields = [
            'id', 'user', 'bidder_name',
            'auction', 'auction_title',
            'amount', 'created_at'
        ]


# =========================
# AUCTION (USER SIDE)
# =========================
class AuctionSerializer(serializers.ModelSerializer):

    # ✅ FIXED IMAGE
    status = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    seller_name = serializers.CharField(source='seller.username', read_only=True)
    bid_count = serializers.IntegerField(read_only=True, source='bids.count')
    time_remaining = serializers.SerializerMethodField()

    increment_value = serializers.SerializerMethodField()
    final_price = serializers.SerializerMethodField()
    previous_bid = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    video = serializers.SerializerMethodField()

    class Meta:
        model = Auction
        fields = [
            'id', 'title', 'description', 'category',
            'seller', 'seller_name',
            'starting_price',
            'current_price',
            'reserve_price',
            'final_price',
            'increment',
            'increment_value',
            'image',
            'images',
            'end_time',
            'status', 'is_settled',
            'bid_count', 'time_remaining',
            'previous_bid',
            'created_at',
            'video',
            'updated_at'
            
        ]

    # =========================
    # IMAGE FIX
    # =========================
    def get_image(self, obj):
        request = self.context.get("request")

        try:
            if obj.listing:
                images = getattr(obj.listing, "images", None)
                if images:
                    first_img = images.first()
                    if first_img and first_img.image:
                        if request:
                            return request.build_absolute_uri(first_img.image.url)
                        return first_img.image.url
        except Exception as e:
            print("IMAGE ERROR:", e)

        return None
    def get_images(self, obj):
        request = self.context.get("request")
        images = []

        if obj.listing:
            for img in obj.listing.images.all():
                if img.image:
                    url = img.image.url

                    if request:
                        url = request.build_absolute_uri(url)

                    images.append(url)

        return images

        
    def get_previous_bid(self, obj):
        try:
            bids = obj.bids.order_by('-amount')

            if bids.count() >= 2:
                return bids[1].amount
            elif bids.count() == 1:
                return obj.starting_price
        except Exception as e:
            print("BID ERROR:", e)

        return obj.starting_price    

    # =========================
    # TIME REMAINING
    # =========================
    def get_time_remaining(self, obj):
        from django.utils.timezone import now

        if obj.end_time:
            remaining = obj.end_time - now()
            if remaining.total_seconds() <= 0:
                return "Ended"
            return str(remaining).split('.')[0]

        return None

    # =========================
    # INCREMENT
    # =========================
    def get_increment_value(self, obj):
        return obj.admin_increment if obj.admin_increment else obj.increment

    # =========================
    # FINAL PRICE
    # =========================
    def get_final_price(self, obj):
        try:
            if hasattr(obj, 'get_final_price') and callable(obj.get_final_price):
                return obj.get_final_price()
        except Exception as e:
            print("FINAL PRICE ERROR:", e)

        return obj.current_price

    def get_video(self, obj):
        request = self.context.get("request")

        if obj.listing and obj.listing.video:
            video = str(obj.listing.video)

            if video.startswith("http"):
                return video

            if request:
                return request.build_absolute_uri(video)

        return None 

    def get_status(self, obj):
        from django.utils import timezone

        now = timezone.now()

        # 🔥 ONLY use start_time IF EXISTS
        if hasattr(obj, "start_time") and obj.start_time:
            if obj.start_time > now:
                return "upcoming"

            if obj.end_time and obj.start_time <= now <= obj.end_time:
                return "live"

            return "ended"

        # fallback (your current working logic)
        if obj.end_time and obj.end_time < now:
            return "ended"

        if obj.status == "live":
            return "live"

        return "upcoming"
# =========================
# AUCTION DETAIL
# =========================
class AuctionDetailSerializer(AuctionSerializer):
    recent_bids = BidSerializer(many=True, read_only=True)
    highest_bid = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
        source='current_price'
    )

    class Meta(AuctionSerializer.Meta):
        fields = AuctionSerializer.Meta.fields + ['recent_bids', 'highest_bid']


# =========================
# CREATE LISTING
# =========================
class CreateListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = [
            'title', 'description', 'category',
            'starting_price',
            'reserve_price',
            'end_time_duration_hours'
        ]
        extra_kwargs = {
            'end_time_duration_hours': {'required': False}
        }


# =========================
# LISTING (SELLER SIDE)
# =========================
class ListingSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()

    final_price = serializers.SerializerMethodField()
    admin_updated_price = serializers.SerializerMethodField()
    admin_increment = serializers.SerializerMethodField()
    admin_commission = serializers.SerializerMethodField()
    admin_duration = serializers.SerializerMethodField()
    video = serializers.URLField(required=False, allow_null=True)
    

    class Meta:
        model = Listing
        fields = "__all__"
    
    
    # =========================
    # MULTIPLE IMAGES
    # =========================
    
    def get_images(self, obj):
        request = self.context.get("request")

        return [
            request.build_absolute_uri(img.image.url)
            for img in obj.images.all()
            if img.image
        ]
    # =========================
    # FINAL PRICE (ONLY AFTER APPROVAL)
    # =========================
    def get_current_bid(self, obj):
        auction = obj.auction.first()
        return auction.current_price if auction else None

    def get_final_price(self, obj):
        auction = obj.auction.first()

        if not auction or obj.status != "approved":
            return None

        return auction.current_price

    def get_admin_updated_price(self, obj):
        auction = obj.auction.first()
        return auction.admin_price if auction else None
    # =========================
    # ADMIN DATA
    # =========================
    def get_admin_price(self, obj):
        auction = obj.auction.first()
        return auction.admin_price if auction else None

    def get_admin_increment(self, obj):
        auction = obj.auction.first()
        if not auction:
            return None
        return auction.admin_increment if auction.admin_increment else auction.increment

    def get_admin_commission(self, obj):
        auction = obj.auction.first()
        if not auction:
            return None
        return auction.admin_commission if auction.admin_commission else auction.commission_rate

    def get_admin_duration(self, obj):
        auction = obj.auction.first()
        if not auction:
            return None
        return auction.admin_duration_hours if auction.admin_duration_hours else auction.duration
     
class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ['available_balance', 'hold_balance']    

