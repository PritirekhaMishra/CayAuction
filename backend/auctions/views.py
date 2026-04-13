from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
from rest_framework.permissions import IsAdminUser
from calendar import month_abbr
from django.db.models import Sum
from rest_framework.decorators import parser_classes
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from .models import ListingImage
from django.shortcuts import get_object_or_404
import tempfile
from decimal import Decimal
from django.db import transaction
from .models import SellerSubscription, SubscriptionPlan
from .models import SubscriptionPlan
import stripe
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import cloudinary.uploader
from django.db.models.functions import TruncMonth
from django.contrib.auth.models import User
from django.db.models import Count
from django.db.models.functions import TruncDay
from datetime import timedelta
from django.utils.timezone import now
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from datetime import datetime
from collections import defaultdict
from .models import Settlement

from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
from rest_framework.permissions import IsAdminUser
from calendar import month_abbr
from django.db.models import Sum
from rest_framework.decorators import parser_classes
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from .models import ListingImage
from django.shortcuts import get_object_or_404
import tempfile
from decimal import Decimal
from django.db import transaction
from .models import SellerSubscription, SubscriptionPlan
from .models import SubscriptionPlan
import stripe
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from django.db.models.functions import TruncDay
from django.db.models import Count
from datetime import timedelta
from django.utils.timezone import now
from .models import Settlement, SellerSubscription, SubscriptionPlan, Auction
import os

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
from .models import Transaction
from .models import Wallet, WithdrawRequest

from .models import (
    Auction, Wallet, Deposit, Bid, UserProfile, Listing, Transaction
)
from .serializers import (
    AuctionSerializer, AuctionDetailSerializer, ListingSerializer,
    CreateListingSerializer, DepositSerializer, BidSerializer,
    TransactionSerializer, UserProfileSerializer, WalletSerializer
)
import logging

logger = logging.getLogger(__name__)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seller_dashboard(request):

    # =========================
    # ✅ USER PROFILE
    # =========================
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    # =========================
    # ✅ FETCH LISTINGS
    # =========================
    listings = Listing.objects.filter(seller=request.user)

    # =========================
    # ✅ STATS
    # =========================
    stats = {
        "total_listings": listings.count(),
        "approved": listings.filter(status="approved").count(),
        "pending": listings.filter(status="pending").count(),
        "rejected": listings.filter(status="rejected").count(),
        "total_sales": 0,
        "total_earnings": 0
    }

    data = []

    # =========================
    # 🔁 LOOP LISTINGS
    # =========================
    for listing in listings:
        auction = listing.auction.first()

        admin_price = None
        increment = None
        commission = None
        duration = None
        current_price = None
        final_price = None

        now = timezone.now()

        # =========================
        # FINAL PRICE
        # =========================
        if auction and auction.end_time < now:
            final_price = auction.current_price

        # =========================
        # IMAGES
        # =========================
        images = []
        for img in listing.images.all():
            if img.image:
                images.append(request.build_absolute_uri(img.image.url))

        # =========================
        # ADMIN DATA
        # =========================
        if listing.status == "approved" and auction:
            admin_price = auction.admin_price
            increment = auction.admin_increment
            commission = auction.admin_commission
            duration = auction.admin_duration_hours
            current_price = auction.current_price

        # =========================
        # VIDEO FIX (FINAL)
        # =========================
        video_url = None

        if listing.video:
            video_str = str(listing.video)

            if video_str.startswith("http"):
                video_url = video_str
            else:
                video_url = request.build_absolute_uri("/media/" + video_str)
            

        # =========================
        # RESPONSE ITEM
        # =========================
        data.append({
            "id": listing.id,
            "title": listing.title,
            "status": listing.status,
            "starting_price": listing.starting_price,
            "current_price": current_price,
            "admin_price": admin_price,
            "admin_increment": increment,
            "admin_commission": commission,
            "admin_duration_hours": duration,
            "final_price": final_price,
            "images": images,
           # "video": video_url   # ✅ FINAL FIX
            "video": video_url
        })

    # =========================
    # ✅ SUBSCRIPTION
    # =========================
    subscription = SellerSubscription.objects.filter(
        user=request.user,
        is_active=True
    ).first()

    subscription_data = None

    if subscription:
        if subscription.end_date < timezone.now():
            subscription.is_active = False
            subscription.save()
        else:
            subscription_data = {
                "plan": subscription.plan.name,
                "end_date": subscription.end_date.isoformat(),  # 🔥 BEST
                "used": subscription.listings_used,
                "limit": subscription.plan.max_listings,
                "remaining": subscription.plan.max_listings - subscription.listings_used
            }

    # =========================
    # ✅ FINAL RESPONSE
    # =========================
    return Response({
        "stats": stats,
        "listings": data,
        "is_seller": profile.is_seller,
        "subscription": subscription_data
    })

# =========================
# AUCTIONS - Enhanced
# ========================



@api_view(['GET'])
def bid_history(request, auction_id):
    try:
        bids = Bid.objects.select_related('user', 'auction').filter(auction_id=auction_id).order_by('-created_at')
        serializer = BidSerializer(bids, many=True)
        return Response(serializer.data)
    except:
        return Response({"error": "Bid history not found"}, status=404)


# =========================
# WALLET / DEPOSITS / TRANSACTIONS
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wallet(request):
    wallet, _ = Wallet.objects.get_or_create(user=request.user)

    return Response({
        "available_balance": wallet.available_balance,
        "hold_balance": wallet.hold_balance
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_deposits(request):
    deposits = Deposit.objects.filter(user=request.user).order_by('-created_at')
    serializer = DepositSerializer(deposits, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transactions(request):
    transactions = Transaction.objects.filter(user=request.user).order_by('-created_at')[:50]
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data)


# =========================
# LISTINGS (Seller)
# =========================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_listings(request):
    listings = Listing.objects.filter(seller=request.user).order_by('-created_at')
    serializer = ListingSerializer(
        listings,
        many=True,
        context={"request": request}
    )
    return Response(serializer.data)


# =========================
# BIDDING - Enhanced
# =========================
from decimal import Decimal, InvalidOperation

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_bid(request):
    print("REQUEST DATA:", request.data)

    try:
        auction_id = request.data.get('auction_id')
        amount_raw = request.data.get('amount')

        if not auction_id or not amount_raw:
            return Response({"error": "Missing auction_id or amount"}, status=400)

        try:
            amount = Decimal(str(amount_raw).strip())
        except Exception as e:
            print("AMOUNT ERROR:", amount_raw, e)
            return Response({"error": "Invalid amount format"}, status=400)

        if amount <= 0:
            return Response({"error": "Amount must be greater than 0"}, status=400)

        auction = Auction.objects.get(id=auction_id)
        wallet = Wallet.objects.get(user=request.user)

    except Auction.DoesNotExist:
        return Response({"error": "Auction not found"}, status=404)

    except Wallet.DoesNotExist:
        return Response({"error": "Wallet not found"}, status=404)

    # ✅ STATUS CHECK
    now = timezone.now()
    if auction.end_time <= now or auction.status not in ['live', 'upcoming']:
        return Response({"error": "Auction not active"}, status=400)

    # ✅ FORCE DECIMAL (FIXED)
    current_price = Decimal(str(auction.current_price or auction.starting_price))

    increment = Decimal(str(
        auction.admin_increment if auction.admin_increment else auction.increment
    ))

    min_bid = current_price + increment

    if amount < min_bid:
        return Response({
            "error": f"Minimum bid is ₹{min_bid}"
        }, status=400)

    # ✅ PREVENT SAME USER
    highest_bid = Bid.objects.filter(auction=auction).order_by('-amount').first()

    if highest_bid and highest_bid.user == request.user:
        return Response({"error": "You already have highest bid"}, status=400)

    # ✅ WALLET CHECK
    if amount > wallet.available_balance:
        return Response({"error": "Insufficient funds"}, status=400)

    # ✅ RELEASE PREVIOUS BID
    if highest_bid and highest_bid.user != request.user:
        prev_wallet = Wallet.objects.get(user=highest_bid.user)

        prev_wallet.hold_balance -= highest_bid.amount
        prev_wallet.available_balance += highest_bid.amount
        prev_wallet.save()

        Transaction.objects.create(
            user=highest_bid.user,
            transaction_type='bid_release',
            amount=highest_bid.amount,
            reference_id=f"bid_{highest_bid.id}",
            description=f"Bid released on {auction.title}"
        )

    # ✅ HOLD NEW BID
    wallet.available_balance -= amount
    wallet.hold_balance += amount
    wallet.save()

    Transaction.objects.create(
        user=request.user,
        transaction_type='bid_hold',
        amount=amount,
        reference_id=f"auction_{auction.id}",
        description=f"Bid placed on {auction.title}"
    )

    # ✅ CREATE BID
    bid = Bid.objects.create(
        user=request.user,
        auction=auction,
        amount=amount
    )

    # ✅ UPDATE AUCTION
    auction.current_price = amount
    auction.status = 'live'
    auction.save()

    return Response({
        "message": "Bid placed successfully",
        "current_price": str(auction.current_price),
        "previous_bid": str(current_price),
        "min_next_bid": str(auction.current_price + increment)
    })
# =========================
# ADMIN ENDPOINTS - Enhanced
# =========================

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def settle_auction(request, auction_id):

    try:
        auction = Auction.objects.get(id=auction_id, status='ended')

        if auction.is_settled:
            return Response({"error": "Already settled"}, status=400)

        highest_bid = Bid.objects.filter(
            auction=auction
        ).order_by('-amount').first()

        if not highest_bid:
            return Response({"error": "No bids"}, status=400)

        # 🔥 CALCULATIONS
        commission_rate = auction.admin_commission or 0
        commission = highest_bid.amount * (commission_rate / 100)
        seller_amount = highest_bid.amount - commission

        # 🔥 BUYER WALLET (HOLD RELEASE)
        buyer_wallet = Wallet.objects.get(user=highest_bid.user)
        buyer_wallet.hold_balance -= highest_bid.amount
        buyer_wallet.save()

        # 🔥 SELLER WALLET CREDIT (MAIN LOGIC)
        seller_wallet, _ = Wallet.objects.get_or_create(
            user=auction.seller
        )
        seller_wallet.available_balance += seller_amount
        seller_wallet.save()

        # 🔥 SAVE SETTLEMENT (TRACKING ONLY)
        Settlement.objects.create(
            auction=auction,
            seller=auction.seller,          # ✅ ADD THIS
            buyer=highest_bid.user,         # ✅ FIX NAME
            winning_amount=final_price,
            commission=commission,
            seller_amount=seller_amount
        )

        # 🔥 MARK AUCTION
        auction.is_settled = True
        auction.winning_bid = highest_bid
        auction.status = 'settled'
        auction.save()

        # 🔥 TRANSACTIONS
        Transaction.objects.create(
            user=highest_bid.user,
            transaction_type='auction_win_hold',
            amount=-highest_bid.amount,
            reference_id=f"auction_{auction.id}",
            description="Auction settled"
        )

        Transaction.objects.create(
            user=auction.seller,
            transaction_type='seller_earning',
            amount=seller_amount,
            reference_id=f"auction_{auction.id}",
            description=f"Earning from {auction.title}"
        )

        return Response({
            "message": "Auction settled",
            "seller_amount": seller_amount
        })

    except Auction.DoesNotExist:
        return Response({"error": "Auction not found"}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def approve_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        user.is_active = True
        user.save()

        # ✅ IMPORTANT FIX
        profile = UserProfile.objects.get(user=user)
        profile.status = "approved"
        profile.save()

        return Response({"message": "User approved"})
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_deposits(request):

    deposits = Deposit.objects.select_related('user').all().order_by('-created_at')

    data = []

    for d in deposits:
        data.append({
            "id": d.id,
            "amount": float(d.amount),
            "utr_number": d.utr_number,
            "status": d.status,
            "created_at": d.created_at,
            "user_name": d.user.username,
            "user_email": d.user.email,
            "user_id": d.user.id,
        })

    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_settlements(request):
    try:
        settlements = Settlement.objects.select_related('winner', 'auction')

        data = []

        for s in settlements:
            data.append({
                "id": s.id,
                "buyer": s.winner.username,
                "winning_amount": float(s.winning_amount),
                "commission": float(s.commission),
                "seller_amount": float(s.seller_amount),
                "created_at": s.created_at.isoformat()
            })

        return Response(data)

    except Exception as e:
        print(f"Admin settlements error: {str(e)}")
        return Response([], status=200)





from .models import (
    Auction, Wallet, Deposit, Bid, UserProfile, Listing, Transaction
)
from .serializers import (
    AuctionSerializer, AuctionDetailSerializer, ListingSerializer,
    CreateListingSerializer, DepositSerializer, BidSerializer,
    TransactionSerializer, UserProfileSerializer, WalletSerializer
)
import logging

logger = logging.getLogger(__name__)

# =========================
# ADMIN CHECK
# =========================


# =========================
# AUTH - Existing
# =========================
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')

    if not all([username, password, email]):
        return Response({"error": "All fields required"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "User already exists"}, status=400)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    # ❗ IMPORTANT FIX
    user.is_active = False
    user.save()

    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.is_seller = False
    profile.status = "pending"
    profile.save()

    return Response({
        "message": "Registered successfully. Await admin approval."
    })
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    try:
        identifier = request.data.get("username") or request.data.get("email")
        password = request.data.get("password")

        if not identifier or not password:
            return Response({"error": "Missing credentials"}, status=400)

        if "@" in identifier:
            user_obj = User.objects.filter(email=identifier).first()

            if not user_obj:
                return Response({"error": "User not found"}, status=404)

            user = authenticate(username=user_obj.username, password=password)
        else:
            user = authenticate(username=identifier, password=password)

        if user is None:
            return Response({"error": "Invalid credentials"}, status=400)

        try:
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
        except Exception as e:
            print("JWT ERROR:", str(e))
            return Response({"error": "JWT failed"}, status=500)

        response = Response({
            "message": "Login successful",
            "is_admin": user.is_staff,
            "token": access_token
        })

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="Lax",
            path="/"
        )

        return response

    except Exception as e:
        print("LOGIN ERROR:", str(e))
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
def logout(request):
    response = Response({"message": "Logged out"})
    response.delete_cookie("access_token")
    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    serializer = UserProfileSerializer(profile)
    return Response({
        "name": request.user.username,
        "email": request.user.email,
        "is_admin": request.user.is_staff,
        **serializer.data
    })


# =========================
# AUCTIONS - Enhanced
# =========================
@api_view(['GET'])
@permission_classes([AllowAny])
def get_auctions(request):
    try:
        queryset = Auction.objects.select_related('seller', 'listing') \
                                  .prefetch_related('bids', 'listing__images') \
                                  .filter(listing__isnull=False)   # ✅ FIX

        serializer = AuctionSerializer(
            queryset,
            many=True,
            context={'request': request}
        )

        return Response(serializer.data)

    except Exception as e:
        print("🔥 AUCTION ERROR:", str(e))
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def auction_detail(request, auction_id):
    try:
        auction = Auction.objects.select_related('listing').get(id=auction_id)

        listing = auction.listing

        # =========================
        # ✅ IMAGES FIX (FINAL)
        # =========================
        images = []

        if listing:
            for img in listing.images.all():
                if img.image:
                    images.append(
                        request.build_absolute_uri(img.image.url)
                    )

        # =========================
        # ✅ VIDEO FIX (FINAL)
        # =========================
        video_url = None

        if listing and listing.video:
            try:
                video_url = request.build_absolute_uri(listing.video.url)
            except:
                video_url = str(listing.video)

        return Response({
            "id": auction.id,
            "title": auction.title,
            "current_price": auction.current_price,
            "starting_price": auction.starting_price,
            "increment": auction.increment,
            "previous_bid": None,
            "end_time": auction.end_time,
            "images": images,
            "video": video_url
        })

    except Auction.DoesNotExist:
        return Response({"error": "Auction not found"}, status=404)

@api_view(['GET'])
def bid_history(request, auction_id):
    try:
        bids = Bid.objects.select_related('user', 'auction').filter(auction_id=auction_id).order_by('-created_at')
        serializer = BidSerializer(bids, many=True)
        return Response(serializer.data)
    except:
        return Response({"error": "Bid history not found"}, status=404)


# =========================
# WALLET / DEPOSITS / TRANSACTIONS
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wallet(request):
    wallet, _ = Wallet.objects.get_or_create(user=request.user)
    serializer = WalletSerializer(wallet)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_deposits(request):
    deposits = Deposit.objects.filter(user=request.user).order_by('-created_at')
    serializer = DepositSerializer(deposits, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transactions(request):
    transactions = Transaction.objects.filter(user=request.user).order_by('-created_at')[:50]
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data)


# =========================
# LISTINGS (Seller)
# =========================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def create_listing(request):

    import cloudinary.uploader

    try:
        # =========================
        # ✅ VALIDATE INPUT
        # =========================
        title = request.data.get("title")
        description = request.data.get("description")
        category = request.data.get("category")
        starting_price = request.data.get("starting_price")
        duration = request.data.get("end_time_duration_hours")

        if not all([title, description, category, starting_price, duration]):
            return Response({"error": "All fields are required"}, status=400)

        try:
            starting_price = Decimal(starting_price)
            duration = int(float(duration))
        except:
            return Response({"error": "Invalid price or duration"}, status=400)

        # =========================
        # ✅ USER PROFILE
        # =========================
        profile, _ = UserProfile.objects.get_or_create(user=request.user)

        if not profile.is_seller:
            return Response({
                "error": "You are not a seller. Please subscribe first."
            }, status=403)

        # =========================
        # ✅ SUBSCRIPTION CHECK
        # =========================
        subscription = SellerSubscription.objects.filter(
            user=request.user,
            is_active=True
        ).first()

        if not subscription:
            return Response({"error": "No active subscription"}, status=403)

        if subscription.end_date < timezone.now():
            subscription.is_active = False
            subscription.save()
            return Response({"error": "Subscription expired"}, status=403)

        if subscription.listings_used >= subscription.plan.max_listings:
            return Response({"error": "Listing limit reached"}, status=403)

        # =========================
        # ✅ CREATE LISTING + IMAGES
        # =========================
        with transaction.atomic():

            listing = Listing.objects.create(
                seller=request.user,
                title=title,
                description=description,
                category=category,
                starting_price=starting_price,
                end_time_duration_hours=duration,
                status="pending"
            )

            images = request.FILES.getlist("images")

            if len(images) > 5:
                return Response({"error": "Maximum 5 images allowed"}, status=400)

            for img in images:
                ListingImage.objects.create(
                    listing=listing,
                    image=img
                )

        # =========================
        # ✅ VIDEO UPLOAD (IMPORTANT)
        # =========================
        
        video_url = request.data.get("video")

        if video_url:
            listing.video = video_url
            listing.save()

        # =========================
        # ✅ UPDATE SUBSCRIPTION
        # =========================
        subscription.listings_used += 1
        subscription.save()

        # =========================
        # ✅ FINAL RESPONSE (MISSING BEFORE)
        # =========================
        return Response({
            "message": "Listing submitted successfully",
            "listing_id": listing.id,
            "status": listing.status,
            "remaining_listings": subscription.plan.max_listings - subscription.listings_used
        }, status=201)

    except Exception as e:
        print("MAIN ERROR:", str(e))
        return Response({
            "error": "Something went wrong",
            "details": str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_listings(request):
    listings = Listing.objects.filter(seller=request.user).order_by('-created_at')
    serializer = ListingSerializer(
        listings,
        many=True,
        context={"request": request}
    )
    return Response(serializer.data)


# =========================
# BIDDING - Enhanced
# =========================
from decimal import Decimal, InvalidOperation

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_bid(request):
    print("REQUEST DATA:", request.data)

    try:
        auction_id = request.data.get('auction_id')
        amount_raw = request.data.get('amount')

        if not auction_id or not amount_raw:
            return Response({"error": "Missing auction_id or amount"}, status=400)

        try:
            amount = Decimal(str(amount_raw).strip())
        except Exception as e:
            print("AMOUNT ERROR:", amount_raw, e)
            return Response({"error": "Invalid amount format"}, status=400)

        if amount <= 0:
            return Response({"error": "Amount must be greater than 0"}, status=400)

        auction = Auction.objects.get(id=auction_id)
        wallet = Wallet.objects.get(user=request.user)

    except Auction.DoesNotExist:
        return Response({"error": "Auction not found"}, status=404)

    except Wallet.DoesNotExist:
        return Response({"error": "Wallet not found"}, status=404)

    # ✅ STATUS CHECK
    now = timezone.now()
    if auction.end_time <= now or auction.status not in ['live', 'upcoming']:
        return Response({"error": "Auction not active"}, status=400)

    # ✅ FORCE DECIMAL (FIXED)
    current_price = Decimal(str(auction.current_price or auction.starting_price))

    increment = Decimal(str(
        auction.admin_increment if auction.admin_increment else auction.increment
    ))

    min_bid = current_price + increment

    if amount < min_bid:
        return Response({
            "error": f"Minimum bid is ₹{min_bid}"
        }, status=400)

    # ✅ PREVENT SAME USER
    highest_bid = Bid.objects.filter(auction=auction).order_by('-amount').first()

    if highest_bid and highest_bid.user == request.user:
        return Response({"error": "You already have highest bid"}, status=400)

    # ✅ WALLET CHECK
    if amount > wallet.available_balance:
        return Response({"error": "Insufficient funds"}, status=400)

    # ✅ RELEASE PREVIOUS BID
    if highest_bid and highest_bid.user != request.user:
        prev_wallet = Wallet.objects.get(user=highest_bid.user)

        prev_wallet.hold_balance -= highest_bid.amount
        prev_wallet.available_balance += highest_bid.amount
        prev_wallet.save()

        Transaction.objects.create(
            user=highest_bid.user,
            transaction_type='bid_release',
            amount=highest_bid.amount,
            reference_id=f"bid_{highest_bid.id}",
            description=f"Bid released on {auction.title}"
        )

    # ✅ HOLD NEW BID
    wallet.available_balance -= amount
    wallet.hold_balance += amount
    wallet.save()

    Transaction.objects.create(
        user=request.user,
        transaction_type='bid_hold',
        amount=amount,
        reference_id=f"auction_{auction.id}",
        description=f"Bid placed on {auction.title}"
    )

    # ✅ CREATE BID
    bid = Bid.objects.create(
        user=request.user,
        auction=auction,
        amount=amount
    )

    # ✅ UPDATE AUCTION
    auction.current_price = amount
    auction.status = 'live'
    auction.save()

    return Response({
        "message": "Bid placed successfully",
        "current_price": str(auction.current_price),
        "previous_bid": str(current_price),
        "min_next_bid": str(auction.current_price + increment)
    })
# =========================
# ADMIN ENDPOINTS - Enhanced
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_listings(request):

    listings = Listing.objects.select_related('seller').all().order_by("-created_at")
    data = []

    for listing in listings:

        # =========================
        # VIDEO FIX (FIRST)
        # =========================
        video_url = None

        if listing.video:
            video_str = str(listing.video)

            if video_str.startswith("http"):
                video_url = video_str
            else:
                video_url = request.build_absolute_uri("/media/" + video_str)

        # =========================
        # BASE DATA
        # =========================
        listing_data = {
            "id": listing.id,
            "title": listing.title,
            "description": listing.description,
            "starting_price": float(listing.starting_price),
            "category": listing.category,
            "status": listing.status,
            "seller": listing.seller.username,
            "seller_email": listing.seller.email,
            "video": video_url,   # ✅ correct
        }

        # =========================
        # PRICE
        # =========================
        auction = listing.auction.first()
        now = timezone.now()

        if auction:
            final_price = float(auction.current_price) if auction.end_time < now else None
        else:
            final_price = float(listing.starting_price or 0)

        listing_data["price"] = final_price
        listing_data["final_price"] = final_price

        # =========================
        # IMAGES
        # =========================
        listing_data["images"] = []

        for img in listing.images.all():
            if img.image:
                try:
                    listing_data["images"].append(
                        request.build_absolute_uri(img.image.url)
                    )
                except:
                    continue

        # =========================
        # EXTRA FIELDS
        # =========================
        listing_data["duration_hours"] = listing.end_time_duration_hours or 24

        listing_data["admin_updated_price"] = (
            float(auction.admin_price) if auction and auction.admin_price else None
        )

        listing_data["admin_commission"] = (
            float(auction.admin_commission) if auction and auction.admin_commission else 0
        )

        listing_data["admin_duration_hours"] = (
            int(auction.admin_duration_hours) if auction and auction.admin_duration_hours else 0
        )

        listing_data["increment"] = (
            float(auction.admin_increment) if auction and auction.admin_increment else 0
        )

        listing_data["current_price"] = (
            float(auction.current_price) if auction else float(listing.starting_price)
        )

        data.append(listing_data)

    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def approve_listing(request, listing_id):

    # =========================
    # GET LISTING
    # =========================
    listing = Listing.objects.get(id=listing_id)

    # =========================
    # ADMIN INPUTS
    # =========================
    reserve_price = float(request.data.get("reserve_price", listing.starting_price))
    commission = float(request.data.get("commission", 10))
    duration = int(request.data.get("duration_hours", listing.end_time_duration_hours or 24))
    increment = float(request.data.get("increment", 100))

    # 🔥 NEW INPUTS (IMPORTANT)
    start_delay = int(request.data.get("start_delay", 0))
    delay_type = request.data.get("delay_type", "hours")

    # =========================
    # CALCULATE START TIME
    # =========================
    now = timezone.now()

    if delay_type == "minutes":
        start_time = now + timedelta(minutes=start_delay)
    elif delay_type == "hours":
        start_time = now + timedelta(hours=start_delay)
    elif delay_type == "days":
        start_time = now + timedelta(days=start_delay)
    else:
        start_time = now

    # =========================
    # DETERMINE STATUS
    # =========================
    if start_time > now:
        status = "upcoming"
    else:
        status = "live"

    # =========================
    # APPROVE LISTING
    # =========================
    listing.status = 'approved'
    listing.save()

    # =========================
    # IMAGE FIX
    # =========================
    first_image = listing.images.first()

    image_url = None
    if first_image and first_image.image:
        try:
            image_url = request.build_absolute_uri(first_image.image.url)
        except:
            image_url = None

    # =========================
    # CREATE AUCTION
    # =========================
    auction = Auction.objects.create(
        listing=listing,
        title=listing.title,
        description=listing.description,
        category=listing.category,
        seller=listing.seller,

        # PRICING
        starting_price=listing.starting_price,
        current_price=reserve_price,
        reserve_price=reserve_price,

        # ADMIN CONFIG
        admin_price=reserve_price,
        admin_increment=increment,
        admin_commission=commission,
        admin_duration_hours=duration,

        # FALLBACK
        increment=increment,
        commission_rate=commission,

        # IMAGE
        image=image_url,

        # 🔥 TIME FIX
        start_time=start_time,
        end_time=start_time + timedelta(hours=duration),

        # 🔥 STATUS FIX
        status=status
    )

    return Response({
        "message": f"Auction scheduled ({status})",
        "auction_id": auction.id,
        "start_time": start_time,
        "end_time": auction.end_time
    })




@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_users(request):
    try:
        # ✅ Fetch users with join optimization
        users = UserProfile.objects.select_related('user').order_by('-user__date_joined')

        data = []
        for u in users:
            user = u.user

            # ✅ FIX: define status first
            if not user.is_active:
                if u.status == "rejected":
                    status = "rejected"
                else:
                    status = "pending"
            else:
                status = "approved"

            data.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "status": status,   # ✅ use here
                "joined": user.date_joined.isoformat() if user.date_joined else None,
                "phone": getattr(u, "phone", None),
                "role": getattr(u, "role", "user"),
            })
        return Response(data, status=200)

    except Exception as e:
        print(f"Admin users error: {str(e)}")

        return Response({
            "error": "Failed to fetch users"
        }, status=500)




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_deposit(request):
    try:
        amount = request.data.get("amount")
        utr = request.data.get("utr_number")   # ✅ FIXED NAME

        if not amount or not utr:
            return Response({"error": "Amount and UTR required"}, status=400)

        Deposit.objects.create(
            user=request.user,
            amount=amount,
            utr_number=utr,
            status="pending"
        )

        return Response({"message": "Deposit submitted successfully"})

    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def reject_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        user.is_active = False
        user.save()

        profile = UserProfile.objects.get(user=user)
        profile.status = "rejected"
        profile.save()

        return Response({"message": "User rejected"})
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def revenue_chart(request):
    from django.db.models import Sum
    from django.db.models.functions import TruncMonth
    from auctions.models import Settlement

    data = (
        Settlement.objects
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(revenue=Sum('commission'))
        .order_by('month')
    )

    result = []

    for item in data:
        result.append({
            "month": item['month'].strftime("%b"),
            "revenue": float(item['revenue'] or 0),
            "target": 0
        })

    return Response(result)    

@api_view(['GET'])
def check_auth(request):
    if request.user.is_authenticated:
        return Response({"auth": True})
    return Response({"auth": False}, status=401)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def become_seller(request):
    profile = request.user.userprofile

    if profile.is_seller:
        return Response({"message": "Already a seller"})

    subscription = SellerSubscription.objects.filter(
        user=request.user,
        is_active=True
    ).first()

    if not subscription:
        return Response({"error": "Subscription required"}, status=403)

    if subscription.end_date < timezone.now():
        subscription.is_active = False
        subscription.save()
        return Response({"error": "Subscription expired"}, status=403)

    profile.is_seller = True
    profile.save()

    return Response({"message": "Seller access granted"})



@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_plans(request):
    plans = SubscriptionPlan.objects.filter(is_active=True)

    data = []
    for p in plans:
        data.append({
            "id": p.id,
            "name": p.name,
            "price": float(p.price),
            "max_listings": p.max_listings,
            "duration_days": p.duration_days,
            "free_trial_days": p.free_trial_days,
            "is_free": p.is_free
        })

    return Response(data)

import stripe
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_plan(request):
    try:
        plan_id = request.data.get("plan_id")
        plan = SubscriptionPlan.objects.get(id=plan_id)

        # ✅ CREATE STRIPE CHECKOUT SESSION
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            mode='payment',

            customer_email=request.user.email,

            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': plan.name,
                    },
                    'unit_amount': int(plan.price * 100),
                },
                'quantity': 1,
            }],
            success_url="http://127.0.0.1:5173/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="http://127.0.0.1:5173/subscription",


            metadata={
                "user_id": request.user.id,
                "plan_id": plan.id
            }
        )

        return Response({
            "checkout_url": session.url
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def deposit_history(request):
    deposits = Deposit.objects.filter(user=request.user).order_by('-id')
    serializer = DepositSerializer(deposits, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def reject_deposit(request, deposit_id):
    try:
        deposit = Deposit.objects.get(id=deposit_id)

        deposit.status = "rejected"
        deposit.save()

        return Response({"message": "Deposit rejected"})

    except Deposit.DoesNotExist:
        return Response({"error": "Deposit not found"}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def reject_listing(request, listing_id):

    listing = get_object_or_404(Listing, id=listing_id)

    # 🔒 SAFETY CHECK
    if listing.status == "rejected":
        return Response({"error": "Already rejected"}, status=400)

    # 🔥 DELETE ASSOCIATED AUCTIONS
    auctions = listing.auction.all()
    for auction in auctions:
        auction.delete()

    # ✅ UPDATE STATUS
    listing.status = 'rejected'
    listing.save()

    return Response({
        "message": "Listing rejected and auction removed"
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def revenue_chart(request):

    from django.db.models import Sum
    from django.db.models.functions import TruncMonth

    qs = (
        Settlement.objects
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(revenue=Sum('commission'))
        .order_by('month')
    )

    data = []

    for row in qs:
        data.append({
            "month": row['month'].strftime('%b'),
            "revenue": float(row['revenue'] or 0)
        })

    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def chat_stats(request):
    from django.contrib.auth.models import User
    from django.db.models.functions import TruncMonth
    from django.db.models import Count

    data = (
        User.objects
        .annotate(month=TruncMonth('date_joined'))
        .values('month')
        .annotate(users=Count('id'))
        .order_by('month')
    )

    result = []

    for item in data:
        result.append({
            "month": item['month'].strftime("%b"),
            "new_users": item['users'],
            "users": item['users']
        })

    return Response(result)            

@api_view(['GET'])
def check_auth(request):
    if request.user.is_authenticated:
        return Response({"auth": True})
    return Response({"auth": False}, status=401)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def become_seller(request):
    profile = request.user.userprofile

    if profile.is_seller:
        return Response({"message": "Already a seller"})

    subscription = SellerSubscription.objects.filter(
        user=request.user,
        is_active=True
    ).first()

    if not subscription:
        return Response({"error": "Subscription required"}, status=403)

    if subscription.end_date < timezone.now():
        subscription.is_active = False
        subscription.save()
        return Response({"error": "Subscription expired"}, status=403)

    profile.is_seller = True
    profile.save()

    return Response({"message": "Seller access granted"})

@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_plan(request):
    try:
        name = request.data.get("name")
        price = request.data.get("price")
        max_listings = request.data.get("max_listings")
        duration_days = request.data.get("duration_days")
        free_trial_days = request.data.get("free_trial_days", 0)

        # ✅ VALIDATION
        if not all([name, price, max_listings, duration_days]):
            return Response({"error": "All required fields missing"}, status=400)

        try:
            price = float(price)
            max_listings = int(max_listings)
            duration_days = int(duration_days)
            free_trial_days = int(free_trial_days)
        except:
            return Response({"error": "Invalid data types"}, status=400)

        # ✅ CREATE PLAN
        plan = SubscriptionPlan.objects.create(
            name=name,
            price=price,
            max_listings=max_listings,
            duration_days=duration_days,
            free_trial_days=free_trial_days,
            is_free=(price == 0)
        )

        return Response({
            "message": "Plan created successfully",
            "plan_id": plan.id
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)
@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_plans(request):
    plans = SubscriptionPlan.objects.filter(is_active=True)

    data = []
    for p in plans:
        data.append({
            "id": p.id,
            "name": p.name,
            "price": float(p.price),
            "max_listings": p.max_listings,
            "duration_days": p.duration_days,
            "free_trial_days": p.free_trial_days,
            "is_free": p.is_free
        })

    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def activate_subscription(request):
    try:
        plan_id = request.data.get("plan_id")

        # 🔍 VALIDATION
        if not plan_id:
            return Response({"error": "plan_id is required"}, status=400)

        try:
            plan = SubscriptionPlan.objects.get(id=plan_id)
        except SubscriptionPlan.DoesNotExist:
            return Response({"error": "Invalid plan"}, status=404)

        # 🔥 DEACTIVATE OLD SUBSCRIPTIONS
        SellerSubscription.objects.filter(
            user=request.user,
            is_active=True
        ).update(is_active=False)

        # ✅ CREATE NEW SUBSCRIPTION
        SellerSubscription.objects.create(
            user=request.user,
            plan=plan,
            end_date=timezone.now() + timedelta(days=plan.duration_days),
            listings_used=0,
            is_active=True
        )

        # 🔥 SAFE PAYMENT CREATION (NO DUPLICATES EVER)
        payment_created = False
        attempts = 0

        while not payment_created and attempts < 2:
            try:
                SubscriptionPayment.objects.create(
                    user=request.user,
                    plan=plan,
                    amount=plan.price,
                    stripe_payment_intent=str(uuid.uuid4()),  # ✅ UNIQUE
                    status="completed"
                )
                payment_created = True
            except IntegrityError:
                attempts += 1

        if not payment_created:
            return Response({"error": "Payment creation failed"}, status=500)

        # ✅ MAKE USER SELLER
        profile = request.user.userprofile
        profile.is_seller = True
        profile.save()

        return Response({
            "message": "Subscription activated successfully"
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def public_plans(request):
    plans = SubscriptionPlan.objects.filter(is_active=True)

    data = []
    for p in plans:
        data.append({
            "id": p.id,
            "name": p.name,
            "price": float(p.price),
            "max_listings": p.max_listings,
            "duration_days": p.duration_days,
            "free_trial_days": p.free_trial_days,
            "is_free": p.is_free
        })

    return Response(data)



from .models import AdminBank
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_plans(request):
    plans = SubscriptionPlan.objects.all()

    data = []

    for p in plans:
        data.append({
            "id": p.id,
            "name": p.name,
            "price": float(p.price),
            "max_listings": p.max_listings,
            "duration_days": p.duration_days,
            "free_trial_days": p.free_trial_days
        })

    return Response(data)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_bank(request):

    bank = AdminBank.objects.first()

    if not bank:
        bank = AdminBank.objects.create()

    if request.method == "GET":
        return Response({
            "account_holder": bank.account_holder,
            "bank_name": bank.bank_name,
            "account_number": bank.account_number,
            "ifsc": bank.ifsc_code,
            "upi": bank.upi_id
        })

    if request.method == "POST":
        if not request.user.is_staff:
            return Response({"error": "Unauthorized"}, status=403)

        bank.account_holder = request.data.get("account_holder")
        bank.bank_name = request.data.get("bank_name")
        bank.account_number = request.data.get("account_number")
        bank.ifsc_code = request.data.get("ifsc")
        bank.upi_id = request.data.get("upi")
        bank.save()

        return Response({"message": "Saved successfully"})

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def approve_deposit(request, deposit_id):
    deposit = get_object_or_404(Deposit, id=deposit_id)

    if deposit.status == "approved":
        return Response({"error": "Already approved"}, status=400)

    with transaction.atomic():
        deposit.status = "approved"
        deposit.save()

        wallet, _ = Wallet.objects.get_or_create(user=deposit.user)
        wallet.available_balance += deposit.amount
        wallet.save()

    return Response({"message": "Deposit approved & wallet updated"})        

from django.db.models.functions import TruncMonth
from django.db.models import Sum

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_revenue_chart(request):

    # 🔹 Commission revenue
    commission_qs = (
        Settlement.objects
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(total=Sum('commission'))
    )

    # 🔹 Subscription revenue
    subscription_qs = (
        SubscriptionPayment.objects
        .filter(status="completed")
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(total=Sum('amount'))
    )

    # 🔹 Merge both
    revenue_map = {}

    for row in commission_qs:
        key = row["month"].strftime("%Y-%m")
        revenue_map[key] = revenue_map.get(key, 0) + (row["total"] or 0)

    for row in subscription_qs:
        key = row["month"].strftime("%Y-%m")
        revenue_map[key] = revenue_map.get(key, 0) + (row["total"] or 0)

    result = [
        {
            "month": key,
            "revenue": float(value)
        }
        for key, value in sorted(revenue_map.items())
    ]

    return Response(result)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_activity(request):

    from django.db.models.functions import TruncDay

    data = (
        User.objects
        .annotate(day=TruncDay('date_joined'))
        .values('day')
        .annotate(users=Count('id'))
        .order_by('day')
    )

    result = []

    for d in data:
        result.append({
            "day": d['day'].strftime("%a"),
            "users": d['users'],
            "messages": d['users'] * 2   # optional placeholder
        })

    return Response(result)    



@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_chat_stats(request):
    last_7_days = now() - timedelta(days=7)

    qs = (
        User.objects
        .filter(date_joined__gte=last_7_days)
        .annotate(day=TruncDay('date_joined'))
        .values('day')
        .annotate(count=Count('id'))
        .order_by('day')
    )

    result = []

    for row in qs:
        result.append({
            "day": row['day'].strftime("%a"),
            "users": row['count']
        })

    return Response(result)

@api_view(['GET'])
def get_single_auction(request, auction_id):
    try:
        auction = Auction.objects.select_related('listing').get(id=auction_id)
        listing = auction.listing

        # =========================
        # ✅ IMAGES
        # =========================
        images = []
        if listing:
            for img in listing.images.all():
                if img.image:
                    images.append(
                        request.build_absolute_uri(img.image.url)
                    )

        # =========================
        # ✅ VIDEO
        # =========================
        video_url = None
        if listing and listing.video:
            try:
                video_url = request.build_absolute_uri(listing.video.url)
            except:
                video_url = str(listing.video)

        # =========================
        # ✅ BIDS
        # =========================
        bids = Bid.objects.filter(auction=auction).order_by('-amount')[:2]

        highest_bid = bids[0] if len(bids) > 0 else None
        second_highest = bids[1] if len(bids) > 1 else None

        return Response({
            "id": auction.id,
            "title": auction.title,
            "current_price": highest_bid.amount if highest_bid else auction.starting_price,
            "starting_price": auction.starting_price,
            "increment": auction.increment,
            "previous_bid": second_highest.amount if second_highest else auction.starting_price,
            "end_time": auction.end_time,

            # 🔥 ADD THESE (THIS IS YOUR MISSING PART)
            "images": images,
            "video": video_url
        })

    except Auction.DoesNotExist:
        return Response({"error": "Not found"}, status=404)
import stripe
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt



from django.db.models import Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from .models import SubscriptionPayment, Settlement

from django.db.models import Sum

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_revenue(request):

    # 🔥 AUCTION COMMISSION
    auction_revenue = Settlement.objects.aggregate(
        total=Sum('commission')
    )['total'] or 0

    # 🔥 SUBSCRIPTION REVENUE
    subscription_revenue = SubscriptionPayment.objects.filter(
        status="completed"
    ).aggregate(
        total=Sum('amount')
    )['total'] or 0

    # 🔥 TOTAL
    total_revenue = auction_revenue + subscription_revenue

    return Response({
        "total_revenue": float(total_revenue),
        "auction_revenue": float(auction_revenue),
        "subscription_revenue": float(subscription_revenue)
    })

from django.db import transaction
from django.utils import timezone


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_auctions(request):
    from django.utils import timezone

    auctions = Auction.objects.all().order_by('-created_at')

    data = []

    for a in auctions:
        data.append({
            "id": a.id,
            "title": a.title,
            "seller": a.seller.username,
            "current_price": float(a.current_price),
            "highest_bid": float(a.current_price),
            "status": a.status,
            "end_time": a.end_time,
            "winner": None  # optional
        })

    return Response(data)   

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def delete_plan(request, plan_id):
    try:
        plan = SubscriptionPlan.objects.get(id=plan_id)
        plan.delete()
        return Response({"message": "Deleted"})
    except SubscriptionPlan.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_plan(request, plan_id):
    try:
        plan = SubscriptionPlan.objects.get(id=plan_id)

        plan.name = request.data.get("name", plan.name)
        plan.price = request.data.get("price", plan.price)
        plan.max_listings = request.data.get("max_listings", plan.max_listings)
        plan.duration_days = request.data.get("duration_days", plan.duration_days)
        plan.free_trial_days = request.data.get("free_trial_days", plan.free_trial_days)

        plan.save()

        return Response({"message": "Updated"})
    except SubscriptionPlan.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

@api_view(['GET'])
def refresh_auction_status(request):
    now = timezone.now()

    auctions = Auction.objects.all()

    for a in auctions:
        if a.start_time > now:
            a.status = "upcoming"
        elif a.start_time <= now <= a.end_time:
            a.status = "live"
        else:
            a.status = "ended"
        a.save()

    return Response({"message": "updated"})        

@api_view(['GET'])
def auto_update_auctions(request):
    now = timezone.now()

    # 🔥 UPCOMING → LIVE
    Auction.objects.filter(
        status="upcoming",
        start_time__lte=now
    ).update(status="live")

    # 🔥 LIVE → ENDED
    Auction.objects.filter(
        status="live",
        end_time__lte=now
    ).update(status="ended")

    return Response({"message": "Auction status updated"})
    
from django.utils import timezone
from django.db import transaction
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Auction, Bid, Wallet, Settlement

@api_view(['GET'])
def auto_end_auctions(request):
    now = timezone.now()

    # 🔥 STEP 1: MARK AS ENDED
    ended_auctions = Auction.objects.filter(
        end_time__lt=now,
        status__in=["live", "upcoming"]
    )

    for auction in ended_auctions:
        auction.status = "ended"
        auction.save()

    # 🔥 STEP 2: SETTLEMENT
    auctions = Auction.objects.filter(
        end_time__lt=now,
        status="ended",
        is_settled=False
    )

    processed = 0
    skipped = 0
    errors = 0

    for auction in auctions:
        try:
            with transaction.atomic():

                if auction.is_settled or Settlement.objects.filter(auction=auction).exists():
                    skipped += 1
                    continue

                highest_bid = Bid.objects.filter(
                    auction=auction
                ).order_by('-amount').first()

                # ✅ NO BIDS → JUST END (NO SETTLEMENT)
                if not highest_bid:
                    auction.is_settled = True
                    auction.status = "ended"
                    auction.save()
                    skipped += 1
                    continue

                final_price = highest_bid.amount

                commission_rate = (
                    auction.admin_commission
                    if auction.admin_commission is not None
                    else auction.commission_rate or 0
                )

                commission = (final_price * commission_rate) / 100
                seller_amount = final_price - commission

                buyer_wallet = Wallet.objects.select_for_update().get(user=highest_bid.user)
                buyer_wallet.hold_balance -= final_price
                buyer_wallet.save()

                seller_wallet, _ = Wallet.objects.select_for_update().get_or_create(user=auction.seller)
                seller_wallet.available_balance += seller_amount
                seller_wallet.save()

                Settlement.objects.create(
                    auction=auction,
                    winner=highest_bid.user,
                    winning_amount=final_price,
                    commission=commission,
                    seller_amount=seller_amount
                )

                Transaction.objects.create(
                    user=highest_bid.user,
                    transaction_type='auction_win_hold',
                    amount=-final_price,
                    reference_id=f"auction_{auction.id}",
                    description="Auction settled"
                )

                Transaction.objects.create(
                    user=auction.seller,
                    transaction_type='seller_earning',
                    amount=seller_amount,
                    reference_id=f"auction_{auction.id}",
                    description=f"Earning from {auction.title}"
                )

                auction.is_settled = True
                auction.status = "settled"
                auction.winning_bid = highest_bid
                auction.save()

                processed += 1

        except Exception as e:
            print("❌ ERROR:", str(e))
            errors += 1

    return Response({
        "message": "Auction process completed",
        "processed": processed,
        "skipped": skipped,
        "errors": errors
    })
from datetime import timedelta
from django.utils import timezone
import stripe
from datetime import timedelta
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User

from .models import SubscriptionPlan, SellerSubscription, SubscriptionPayment

import stripe
from django.conf import settings
from datetime import timedelta
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User

import stripe
from django.conf import settings
from datetime import timedelta
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User

from .models import SubscriptionPlan, SellerSubscription, SubscriptionPayment, UserProfile

# =========================================
# ✅ VERIFY PAYMENT (FINAL STABLE VERSION)
# =========================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    try:
        session_id = request.data.get("session_id")

        if not session_id:
            return Response({"error": "Session ID missing"}, status=400)

        # 🔥 Retrieve Stripe session
        try:
            session = stripe.checkout.Session.retrieve(session_id)
        except Exception as e:
            print("STRIPE ERROR:", str(e))
            return Response({"error": "Invalid Stripe session"}, status=400)

        # ✅ DEBUG LOGS
        print("SESSION STATUS:", session.status)
        print("PAYMENT STATUS:", session.payment_status)
        print("METADATA:", session.metadata)

        # ✅ CHECK PAYMENT STATUS
        if session.status != "complete" or session.payment_status != "paid":
            return Response({"error": "Payment not completed"}, status=400)

        # =========================================
        # ✅ FIXED METADATA ACCESS (NO .get())
        # =========================================
        metadata = session.metadata or {}

        try:
            user_id = metadata["user_id"]
            plan_id = metadata["plan_id"]
        except KeyError:
            return Response({"error": "Metadata missing"}, status=400)

        # =========================================
        # ✅ SAFE USER FETCH
        # =========================================
        try:
            user = User.objects.get(id=int(user_id))
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        except Exception:
            return Response({"error": "Invalid user_id"}, status=400)

        # =========================================
        # ✅ SAFE PLAN FETCH
        # =========================================
        try:
            plan = SubscriptionPlan.objects.get(id=int(plan_id))
        except SubscriptionPlan.DoesNotExist:
            return Response({"error": "Plan not found"}, status=404)
        except Exception:
            return Response({"error": "Invalid plan_id"}, status=400)

        # =========================================
        # ✅ FIXED PAYMENT INTENT ACCESS
        # =========================================
        payment_intent = session.payment_intent

        if not payment_intent:
            payment_intent = f"temp_{session.id}"

        # =========================================
        # ✅ PREVENT DUPLICATE
        # =========================================
        if SubscriptionPayment.objects.filter(
            stripe_payment_intent=payment_intent
        ).exists():
            return Response({"message": "Already processed"}, status=200)

        # =========================================
        # ✅ SAVE PAYMENT
        # =========================================
        payment = SubscriptionPayment.objects.create(
            user=user,
            plan=plan,
            amount=plan.price,
            stripe_payment_intent=payment_intent,
            status="completed"
        )

        print("PAYMENT SAVED:", payment.id)

        # =========================================
        # ✅ ACTIVATE SUBSCRIPTION
        # =========================================
        SellerSubscription.objects.filter(
            user=user,
            is_active=True
        ).update(is_active=False)

        SellerSubscription.objects.create(
            user=user,
            plan=plan,
            start_date=timezone.now(),
            end_date=timezone.now() + timedelta(days=plan.duration_days),
            is_active=True
        )

        # =========================================
        # ✅ MAKE USER SELLER (SAFE)
        # =========================================
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.is_seller = True
        profile.save()

        return Response({"message": "Subscription activated"})

    except Exception as e:
        print("🔥 FULL ERROR:", str(e))
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


# =========================================
# ✅ CREATE CHECKOUT SESSION (FINAL)
# =========================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    try:
        plan_id = request.data.get("plan_id")

        if not plan_id:
            return Response({"error": "plan_id required"}, status=400)

        try:
            plan = SubscriptionPlan.objects.get(id=plan_id)
        except SubscriptionPlan.DoesNotExist:
            return Response({"error": "Plan not found"}, status=404)

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",

            customer_email=request.user.email,

            line_items=[{
                "price_data": {
                    "currency": "inr",
                    "product_data": {
                        "name": plan.name,
                    },
                    "unit_amount": int(plan.price * 100),
                },
                "quantity": 1,
            }],

            success_url="http://127.0.0.1:5173/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="http://127.0.0.1:5173/subscription",

            # ✅ FIXED METADATA
            metadata={
                "user_id": str(request.user.id),
                "plan_id": str(plan.id)
            }
        )

        return Response({"url": session.url})

    except Exception as e:
        print("CHECKOUT ERROR:", str(e))
        return Response({"error": "Checkout failed"}, status=500)

def close_auction(auction):

    highest_bid = auction.bids.order_by('-amount').first()

    if not highest_bid:
        return

    final_price = highest_bid.amount
    commission_rate = 0.10  # 10%

    commission = final_price * commission_rate
    seller_amount = final_price - commission

    # ✅ Save platform commission
    Settlement.objects.create(
        auction=auction,
        commission=commission
    )

    # ✅ Save seller earning
    SellerTransaction.objects.create(
        seller=auction.seller,
        amount=seller_amount,
        auction=auction
    )

    # ✅ OPTIONAL: Stripe payout
    # stripe.Transfer.create(
    #     amount=int(seller_amount * 100),
    #     currency="usd",
    #     destination=auction.seller.stripe_account_id,
    # )

    auction.status = "completed"
    auction.save()      




@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_seller_banks(request):

    banks = SellerBankAccount.objects.select_related('user').all()

    data = []

    for b in banks:
        # ✅ FILTER ONLY SELLERS
        profile = getattr(b.user, "userprofile", None)

        if profile and profile.is_seller:
            data.append({
                "id": b.id,
                "username": b.user.username,
                "email": b.user.email,
                "account_holder": b.account_holder,
                "bank_name": b.bank_name,
                "account_number": b.account_number,
                "ifsc": b.ifsc_code,
                "verified": b.is_verified
            })

    return Response(data)   

from .models import SellerBankAccount

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_bank(request):
    user = request.user

    # ✅ CHECK SELLER
    if not user.userprofile.is_seller:
        return Response({"error": "Only sellers can add bank"}, status=403)

    bank, created = SellerBankAccount.objects.get_or_create(user=user)

    bank.account_holder = request.data.get("account_holder")
    bank.bank_name = request.data.get("bank_name")
    bank.account_number = request.data.get("account_number")
    bank.ifsc_code = request.data.get("ifsc")

    bank.save()

    return Response({"message": "Bank saved"})     

@api_view(['POST'])
@permission_classes([IsAdminUser])
def verify_bank(request, id):
    bank = SellerBankAccount.objects.get(id=id)
    bank.is_verified = True
    bank.save()
    return Response({"message": "Verified"})

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from .models import SellerBankAccount, Settlement, SellerBalance
from django.db import transaction

from django.db import transaction

@api_view(['POST'])
@permission_classes([IsAdminUser])
def pay_seller(request, id):

    with transaction.atomic():  # 🔒 CRITICAL

        bank = SellerBankAccount.objects.select_for_update().get(id=id)
        seller = bank.user

        # 🔥 GET LOCKED SETTLEMENTS
        settlements = Settlement.objects.select_for_update().filter(
            seller=seller,
            status="pending"
        )

        if not settlements.exists():
            return Response({"error": "No pending payouts"}, status=400)

        total_amount = 0

        for s in settlements:
            total_amount += s.seller_amount
            s.status = "paid"
            s.save()

        # 🔥 UPDATE SELLER BALANCE TABLE
        balance, _ = SellerBalance.objects.get_or_create(seller=seller)
        balance.pending_payout -= total_amount
        balance.save()

        # 🔥 🔥 MOST IMPORTANT FIX (YOU MISSED THIS)
        wallet, _ = Wallet.objects.select_for_update().get_or_create(user=seller)
        wallet.available_balance += total_amount
        wallet.save()

        # 🔥 LOG TRANSACTION
        Transaction.objects.create(
            user=seller,
            transaction_type="seller_credit",
            amount=total_amount,
            description="Auction payout credited"
        )

    return Response({
        "message": f"₹{total_amount} credited to seller wallet"
    })

from decimal import Decimal, InvalidOperation
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Wallet
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_withdraw(request):
    try:
        print("🔥 WITHDRAW CALLED")

        amount = Decimal(str(request.data.get("amount")))

        wallet = Wallet.objects.get(user=request.user)

        if wallet.available_balance < amount:
            return Response({"error": "Insufficient balance"}, status=400)

        wallet.available_balance -= amount
        wallet.hold_balance += amount
        wallet.save()

        WithdrawRequest.objects.create(
            user=request.user,
            amount=amount,
            status="pending"
        )

        print("✅ CREATED WITHDRAW REQUEST")

        return Response({"message": "Success"})

    except Exception as e:
        print("🔥 ERROR:", str(e))
        return Response({"error": "Server error"}, status=500)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def approve_withdraw(request, id):
    withdraw = WithdrawRequest.objects.get(id=id)

    if withdraw.status != "pending":
        return Response({"error": "Already processed"}, status=400)

    wallet = Wallet.objects.get(user=withdraw.user)

    # ✅ Remove from hold (money leaves system)
    wallet.hold_balance -= withdraw.amount
    wallet.save()

    withdraw.status = "approved"
    withdraw.save()

    return Response({"message": "Approved"})

from .models import WithdrawRequest

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_withdrawals(request):

    withdrawals = WithdrawRequest.objects.select_related('user').all().order_by('-created_at')

    data = []

    for w in withdrawals:
        data.append({
            "id": w.id,
            "username": w.user.username,
            "email": w.user.email,
            "amount": float(w.amount),
            "status": w.status,
            "created_at": w.created_at
        })

    return Response(data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def reject_withdraw(request, id):
    withdraw = WithdrawRequest.objects.get(id=id)

    if withdraw.status != "pending":
        return Response({"error": "Already processed"}, status=400)

    wallet = Wallet.objects.get(user=withdraw.user)

    # ✅ Return money
    wallet.hold_balance -= withdraw.amount
    wallet.available_balance += withdraw.amount
    wallet.save()

    withdraw.status = "rejected"
    withdraw.save()

    return Response({"message": "Rejected"})