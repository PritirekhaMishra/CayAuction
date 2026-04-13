from django.db import transaction
from ..models import Auction, Transaction, SellerBalance


@transaction.atomic
def settle_auction(auction):
    if auction.is_settled:
        return

    winning_bid = auction.bids.order_by('-amount').first()
    if not winning_bid:
        return

    buyer = winning_bid.user
    seller = auction.seller
    amount = winning_bid.amount

    commission_rate = getattr(auction, "commission_rate", 10)
    commission = (amount * commission_rate) / 100
    seller_amount = amount - commission

    # =========================
    # 1. DEDUCT BUYER HOLD
    # =========================
    wallet = buyer.wallet
    wallet.hold_balance -= amount
    wallet.save()

    # =========================
    # 2. BUYER TRANSACTION
    # =========================
    Transaction.objects.create(
        user=buyer,
        transaction_type="win",
        amount=amount,
        auction=auction,
        description="Winning bid deducted"
    )

    # =========================
    # 3. COMMISSION
    # =========================
    Transaction.objects.create(
        user=buyer,
        transaction_type="commission",
        amount=commission,
        auction=auction,
        description="Platform commission"
    )

    # =========================
    # 4. SELLER BALANCE
    # =========================
    seller_balance, _ = SellerBalance.objects.get_or_create(seller=seller)

    seller_balance.total_earned += seller_amount
    seller_balance.pending_payout += seller_amount
    seller_balance.save()

    # =========================
    # 5. SELLER TRANSACTION
    # =========================
    Transaction.objects.create(
        user=seller,
        transaction_type="seller_credit",
        amount=seller_amount,
        auction=auction,
        description="Auction earning"
    )

    # =========================
    # 6. MARK SETTLED
    # =========================
    auction.is_settled = True
    auction.status = "settled"
    auction.winning_bid = winning_bid
    auction.save()