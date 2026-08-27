from sqlalchemy.orm import Session
from models.models import PaymentOffer


def get_payment_offers(db: Session, price: float, payment_method: str | None = None):
    """Tool: get_payment_offers(). Returns offers applicable to a given price (and
    optionally a preferred payment method), sorted by best benefit first."""
    query = db.query(PaymentOffer).filter(PaymentOffer.minimum_amount <= price)

    if payment_method:
        query = query.filter(PaymentOffer.payment_method.ilike(f"%{payment_method}%"))

    offers = query.all()

    def benefit(offer: PaymentOffer) -> float:
        if offer.cashback_flat:
            return offer.cashback_flat
        if offer.discount_percent:
            return min(price * offer.discount_percent / 100, offer.maximum_cashback or float("inf"))
        return 0

    return sorted(offers, key=benefit, reverse=True)
