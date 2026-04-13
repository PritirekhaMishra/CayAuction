from django.urls import path
from . import views
from .views import approve_listing, reject_listing
from .views import check_auth, get_user
from .views import create_plan, get_plans
from .views import buy_plan, activate_subscription
from .views import create_deposit, deposit_history
from .views import public_plans
from .views import admin_users, approve_user, reject_user,admin_auctions,delete_plan,update_plan 
from .views import verify_payment,save_bank,admin_seller_banks


urlpatterns = [
    # Auth
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('user/', views.get_user, name='user'),
    path('admin/reject-user/<int:user_id>/', views.reject_user),

    # Auctions
    path('auctions/', views.get_auctions, name='auctions'),
    path('auctions/<int:auction_id>/', views.auction_detail, name='auction_detail'),
    path('auctions/<int:auction_id>/bids/', views.bid_history, name='bid_history'),
    path('auction/<int:auction_id>/', views.get_single_auction),
    # Wallet & Financial
    path('wallet/', views.get_wallet, name='wallet'),
    path('deposits/', views.get_deposits, name='deposits'),
    path('transactions/', views.get_transactions, name='transactions'),
    path('deposit/', views.create_deposit, name='create_deposit'),
    path('admin/reject-deposit/<int:deposit_id>/', views.reject_deposit, name='reject_deposit'),
    path('admin/reject-listing/<int:listing_id>/', views.reject_listing, name='reject_listing'),

    # Bids
    path('bid/', views.place_bid, name='place_bid'),

    # Seller Listings
    path('listings/', views.get_listings, name='listings'),
    path('listings/create/', views.create_listing, name='create_listing'),
    path('seller/dashboard/', views.seller_dashboard),

    # Admin
    #path('admin/users/', views.admin_users, name='admin_users'),
    #path('admin/approve-user/<int:user_id>/', views.approve_user, name='approve_user'),
    path('admin/users/', admin_users),
    path('admin/users/<int:user_id>/approve/', approve_user),
    path('admin/users/<int:user_id>/reject/', reject_user),
    path('admin/deposits/', views.admin_deposits, name='admin_deposits'),
    path('admin/approve-deposit/<int:deposit_id>/', views.approve_deposit, name='approve_deposit'),
    path('admin/listings/', views.admin_listings, name='admin_listings'),
    path('admin/approve-listing/<int:listing_id>/', views.approve_listing, name='approve_listing'),
    path('admin/settlements/', views.admin_settlements, name='admin_settlements'),
    path('admin/settle/<int:auction_id>/', views.settle_auction, name='settle_auction'),
    path('admin/revenue-chart/', views.revenue_chart),
    path('admin/chat-stats/', views.chat_stats),
    path('admin/listings/<int:listing_id>/approve/', approve_listing),
    path('admin/listings/<int:listing_id>/reject/', reject_listing),
    path("check-auth/", views.check_auth),
    path("user/", views.get_user),
    path("deposit/", create_deposit),
    path("deposit-history/", deposit_history),
    # plan 
    path("admin/plans/create/", create_plan),
    path("admin/plans/", get_plans),
    path("buy-plan/", buy_plan),
    path("activate-subscription/", activate_subscription),
    path("plans/", public_plans),
    path('admin/plans/<int:plan_id>/delete/', delete_plan),
    path('admin/plans/<int:plan_id>/update/', update_plan),
    path('auto-end-auctions/', views.auto_end_auctions),
    
    path('admin/revenue/', views.admin_revenue),
    path("activate-subscription/", activate_subscription),
    path('admin/auctions/', admin_auctions),    
    # bank approval
    path("admin/bank/", views.admin_bank),
    path("admin/deposits/<int:deposit_id>/approve/", views.approve_deposit),
    path("admin/deposits/<int:deposit_id>/reject/", views.reject_deposit),
   # path("seller/bank/", views.seller_bank),
    path('verify-payment/', verify_payment),

    # seller bank account 
    path("save-bank/", save_bank),
    path("admin/seller-banks/", admin_seller_banks),
    path("withdraw/", views.request_withdraw),

    path("admin/withdrawals/", views.admin_withdrawals),
    path("admin/withdraw/<int:id>/approve/", views.approve_withdraw),
    path("admin/withdraw/<int:id>/reject/", views.reject_withdraw),  # optional
    
]

