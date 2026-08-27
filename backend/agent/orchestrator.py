from sqlalchemy.orm import Session
from agent.intent_parser import parse_intent
from tools.product_search import search_products
from tools.ranker import rank_products


def _template_explanation(top: dict, intent: dict) -> str:
    p = top["product"]
    calc = top["calc"]
    reasons = []

    if intent.get("priority") == "battery" and p.battery_life_hours:
        reasons.append(f"strong {int(p.battery_life_hours)}h battery life")
    if intent.get("priority") == "camera" and p.camera_score:
        reasons.append("a camera setup tuned for your use case")
    if calc["benefit"] > 0:
        reasons.append(f"₹{calc['benefit']:.0f} in payment offers")
    reasons.append(f"a {p.rating}★ rating")

    reason_text = ", ".join(reasons[:-1]) + (" and " + reasons[-1] if len(reasons) > 1 else reasons[0])

    return (
        f"I recommend {p.name} because it balances {reason_text}. "
        f"After applicable offers, its effective price is ₹{calc['effective_price']:.0f}."
    )


async def run_agent(db: Session, query: str):
    """
    Full agentic pipeline:
      1. parse_intent      -> understand what the user wants
      2. search_products   -> tool: query the product catalog
      3. rank_products      -> tool: score candidates (internally also calls
                                get_payment_offers + calculate_effective_price)
      4. generate_explanation -> turn the winner into a human-readable recommendation
    """
    steps_log = []

    intent = await parse_intent(query)
    steps_log.append({"step": "parse_intent", "output": intent})

    candidates = search_products(db, intent.get("category"), intent.get("budget"))
    steps_log.append({"step": "search_products", "output": f"{len(candidates)} candidates found"})

    if not candidates:
        return {
            "intent": intent,
            "steps": steps_log,
            "recommendation": None,
            "alternatives": [],
            "message": "No products matched that budget/category — try widening your budget.",
        }

    ranked = rank_products(db, candidates, intent.get("priority"), intent.get("payment_preference"))
    steps_log.append({"step": "rank_products", "output": f"ranked {len(ranked)} candidates"})

    top = ranked[0]
    explanation = _template_explanation(top, intent)
    steps_log.append({"step": "generate_explanation", "output": explanation})

    def serialize(entry):
        p = entry["product"]
        return {
            "id": p.id,
            "name": p.name,
            "brand": p.brand,
            "category": p.category,
            "price": p.price,
            "rating": p.rating,
            "battery_life_hours": p.battery_life_hours,
            "camera_score": p.camera_score,
            "features": p.features,
            "score": entry["score"],
            "effective_price": entry["calc"]["effective_price"],
            "benefit": entry["calc"]["benefit"],
            "offer": entry["calc"]["offer"],
            "breakdown": entry.get("breakdown"),
            "weights": entry.get("weights"),
        }

    return {
        "intent": intent,
        "steps": steps_log,
        "recommendation": {**serialize(top), "explanation": explanation},
        "alternatives": [serialize(e) for e in ranked[1:4]],
        "message": None,
    }
