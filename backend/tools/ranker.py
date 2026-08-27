from sqlalchemy.orm import Session
from models.models import Product, PaymentOffer
from tools.offer_search import get_payment_offers
from tools.calculator import calculate_effective_price


def _normalize(value, lo, hi):
    if hi == lo:
        return 1.0
    return (value - lo) / (hi - lo)


def rank_products(db: Session, products: list[Product], priority: str | None, payment_preference: str | None):
    """Tool: rank_products(). Scores and ranks candidate products using effective
    price, rating, and the user's stated priority (battery/camera/rating/price)."""
    if not products:
        return []

    enriched = []
    for p in products:
        offers = get_payment_offers(db, p.price, payment_preference)
        best_offer = offers[0] if offers else None
        calc = calculate_effective_price(p.price, best_offer)
        enriched.append({"product": p, "offers": offers, "calc": calc})

    prices = [e["calc"]["effective_price"] for e in enriched]
    ratings = [e["product"].rating or 0 for e in enriched]
    batteries = [e["product"].battery_life_hours or 0 for e in enriched]
    cameras = [e["product"].camera_score or 0 for e in enriched]
    benefits = [e["calc"]["benefit"] for e in enriched]

    p_lo, p_hi = min(prices), max(prices)
    r_lo, r_hi = min(ratings), max(ratings)
    b_lo, b_hi = min(batteries), max(batteries)
    c_lo, c_hi = min(cameras), max(cameras)
    cb_lo, cb_hi = min(benefits), max(benefits)

    # base weights
    weights = {"price": 0.35, "rating": 0.25, "priority": 0.25, "cashback": 0.15}

    priority = (priority or "").lower()

    for e in enriched:
        price_score = 1 - _normalize(e["calc"]["effective_price"], p_lo, p_hi)  # lower price -> higher score
        rating_score = _normalize(e["product"].rating or 0, r_lo, r_hi)
        cashback_score = _normalize(e["calc"]["benefit"], cb_lo, cb_hi)

        if priority == "battery":
            priority_score = _normalize(e["product"].battery_life_hours or 0, b_lo, b_hi)
        elif priority == "camera":
            priority_score = _normalize(e["product"].camera_score or 0, c_lo, c_hi)
        elif priority == "cashback":
            priority_score = cashback_score
            weights["cashback"] = 0.30
            weights["priority"] = 0.10
        else:
            priority_score = rating_score  # default: treat "best overall" as rating-led

        score = (
            weights["price"] * price_score
            + weights["rating"] * rating_score
            + weights["priority"] * priority_score
            + weights["cashback"] * cashback_score
        )
        e["score"] = round(score * 100, 2)
        e["breakdown"] = {
            "price": round(price_score * 100, 1),
            "rating": round(rating_score * 100, 1),
            "priority": round(priority_score * 100, 1),
            "cashback": round(cashback_score * 100, 1),
        }
        e["weights"] = weights.copy()

    return sorted(enriched, key=lambda e: e["score"], reverse=True)
