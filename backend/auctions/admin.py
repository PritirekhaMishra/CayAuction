from django.contrib import admin
from .models import (
    Auction, Wallet, Deposit, Bid, UserProfile, Listing, Transaction
)


# =========================
# USER PROFILE ADMIN 🔐
# =========================
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'status', 'is_seller', 'created_at']
    list_filter = ['status', 'is_seller']
    search_fields = ['user__username', 'user__email']
    actions = ['approve_users', 'reject_users', 'enable_seller']

    def approve_users(self, request, queryset):
        queryset.update(status='approved')
    approve_users.short_description = "Approve selected users"

    def reject_users(self, request, queryset):
        queryset.update(status='rejected')
    reject_users.short_description = "Reject selected users"

    def enable_seller(self, request, queryset):
        queryset.update(is_seller=True)
    enable_seller.short_description = "Enable seller role"


# =========================
# LISTING ADMIN 📋
# =========================
@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ['title', 'seller', 'status', 'starting_price', 'created_at']
    list_filter = ['status', 'category']
    search_fields = ['title', 'seller__username']
    actions = ['approve_listings', 'reject_listings']

    def approve_listings(self, request, queryset):
        for listing in queryset:
            if listing.status == 'pending':
                listing.status = 'approved'
                listing.save()
                # Note: API endpoint handles auction creation
    approve_listings.short_description = "Approve listings (auto-creates auction)"

    def reject_listings(self, request, queryset):
        queryset.update(status='rejected')
    reject_listings.short_description = "Reject selected listings"


# =========================
# AUCTION ADMIN 🏷️
# =========================
@admin.register(Auction)
class AuctionAdmin(admin.ModelAdmin):
    list_display = ['title', 'seller', 'status', 'current_price', 'end_time', 'is_settled']
    list_filter = ['status', 'category', 'is_settled']
    search_fields = ['title', 'seller__username']
    readonly_fields = ['current_price', 'created_at', 'updated_at']
    actions = ['make_live', 'end_auction', 'settle_auction']

    def make_live(self, request, queryset):
        queryset.update(status='live')
    make_live.short_description = "Set auctions LIVE"

    def end_auction(self, request, queryset):
        queryset.update(status='ended')
    end_auction.short_description = "End selected auctions"

    def settle_auction(self, request, queryset):
        from .views import settle_auction  # Avoid circular import
        for auction in queryset.filter(status='ended', is_settled=False):
            # Manual settlement logic similar to view
            pass
    settle_auction.short_description = "Settle ended auctions (admin panel)"


# =========================
# WALLET ADMIN 💰
# =========================


# =========================
# TRANSACTION ADMIN 📊
# =========================
@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'transaction_type', 'amount', 'reference_id', 'created_at']
    list_filter = ['transaction_type', 'created_at']
    search_fields = ['user__username', 'reference_id']
    readonly_fields = ['created_at']


# =========================
# BID ADMIN 🔥
# =========================
@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ['user', 'auction', 'amount', 'created_at']
    list_filter = ['auction', 'created_at']
    search_fields = ['user__username', 'auction__title']


# =========================
# DEPOSIT ADMIN 🏦
# =========================
@admin.register(Deposit)
class DepositAdmin(admin.ModelAdmin):
    list_display = ['user', 'amount', 'utr_number', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['utr_number', 'user__username']
    actions = ['mark_review', 'approve_deposits', 'reject_deposits']

    def mark_review(self, request, queryset):
        queryset.update(status='review')
    mark_review.short_description = "Mark as UNDER REVIEW"

    def approve_deposits(self, request, queryset):
        for obj in queryset:
            if obj.status != 'approved':
                obj.status = 'approved'
                obj.save()
                wallet, _ = Wallet.objects.get_or_create(user=obj.user)
                wallet.available_balance += obj.amount
                wallet.save()
    approve_deposits.short_description = "Approve deposits & add funds"

    def reject_deposits(self, request, queryset):
        queryset.update(status='rejected')
    reject_deposits.short_description = "Reject deposits"

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ['user', 'available_balance', 'hold_balance']

    def available_balance(self, obj):
        return obj.balance - obj.hold_balance

    available_balance.short_description = "Available Balance"