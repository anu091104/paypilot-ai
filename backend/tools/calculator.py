from models.models import PaymentOffer


def calculate_effective_price(price: float, offer: PaymentOffer | None):
    """Tool: calculate_effective_price(). Applies the best matching offer's
    cashback/discount to a product's price."""
    if not offer:
        return {"effective_price": round(price, 2), "benefit": 0, "offer": None}

    if offer.cashback_flat:
        benefit = offer.cashback_flat
    elif offer.discount_percent:
        benefit = min(price * offer.discount_percent / 100, offer.maximum_cashback or float("inf"))
    else:
        benefit = 0

    return {
        "effective_price": round(max(price - benefit, 0), 2),
        "benefit": round(benefit, 2),
        "offer": {
            "bank": offer.bank,
            "payment_method": offer.payment_method,
            "discount_percent": offer.discount_percent,
            "cashback_flat": offer.cashback_flat,
        },
    }
