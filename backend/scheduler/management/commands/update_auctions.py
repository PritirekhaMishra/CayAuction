from django.core.management.base import BaseCommand
from django.utils import timezone
from auctions.models import Auction  # 🔥 change if your app name is different

class Command(BaseCommand):
    help = 'Update auction statuses'

    def handle(self, *args, **kwargs):
        now = timezone.now()

        live = Auction.objects.filter(
            status="upcoming",
            start_time__lte=now
        ).update(status="live")

        ended = Auction.objects.filter(
            status="live",
            end_time__lte=now
        ).update(status="ended")

        self.stdout.write(f"Live: {live}, Ended: {ended}")