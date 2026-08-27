import os
import re
import json
import httpx

CATEGORY_KEYWORDS = {
    "headphones": ["headphone", "headphones", "over-ear", "over ear"],
    "earbuds": ["earbud", "earbuds", "buds", "tws"],
    "laptops": ["laptop", "laptops", "notebook"],
    "smartphones": ["phone", "smartphone", "smartphones", "mobile"],
}

PRIORITY_KEYWORDS = {
    "battery": ["battery", "battery life", "long lasting", "backup"],
    "camera": ["camera", "photography", "photos", "selfie"],
    "cashback": ["cashback", "cash back", "max discount", "maximize cashback", "best offer"],
    "rating": ["best rated", "top rated", "highest rating"],
}

PAYMENT_KEYWORDS = {
    "Credit Card": ["credit card"],
    "Debit Card": ["debit card"],
    "UPI": ["upi"],
    "Wallet": ["wallet"],
}


def _extract_budget(text: str):
    text = text.lower().replace(",", "")
    # e.g. "under 8000", "under ₹8,000", "below 40k", "70k budget"
    k_match = re.search(r"(\d+(?:\.\d+)?)\s*k\b", text)
    if k_match:
        return float(k_match.group(1)) * 1000

    num_match = re.search(r"(?:under|below|within|less than|budget of|around)?\s*₹?\s*(\d{3,7})", text)
    if num_match:
        return float(num_match.group(1))
    return None


def _rule_based_parse(query: str):
    q = query.lower()

    category = None
    for cat, kws in CATEGORY_KEYWORDS.items():
        if any(kw in q for kw in kws):
            category = cat
            break

    priority = None
    for pri, kws in PRIORITY_KEYWORDS.items():
        if any(kw in q for kw in kws):
            priority = pri
            break

    payment_preference = None
    for method, kws in PAYMENT_KEYWORDS.items():
        if any(kw in q for kw in kws):
            payment_preference = method
            break

    budget = _extract_budget(q)

    return {
        "category": category,
        "budget": budget,
        "priority": priority,
        "payment_preference": payment_preference,
        "source": "rule_based",
    }


async def _llm_parse(query: str):
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    system_prompt = (
        "Extract shopping intent from the user's message. Respond ONLY with compact JSON, "
        "no prose, no markdown fences, matching this schema exactly: "
        '{"category": one of ["headphones","earbuds","laptops","smartphones"] or null, '
        '"budget": number or null, '
        '"priority": one of ["battery","camera","cashback","rating"] or null, '
        '"payment_preference": one of ["Credit Card","Debit Card","UPI","Wallet"] or null}'
    )

    try:
        if gemini_key:
            url = (
                "https://generativelanguage.googleapis.com/v1beta/models/"
                f"gemini-1.5-flash:generateContent?key={gemini_key}"
            )
            payload = {
                "contents": [{"parts": [{"text": f"{system_prompt}\n\nUser message: {query}"}]}]
            }
            async with httpx.AsyncClient(timeout=15) as client:
                r = await client.post(url, json=payload)
                r.raise_for_status()
                data = r.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                cleaned = re.sub(r"^```json|```$", "", text.strip(), flags=re.MULTILINE).strip()
                parsed = json.loads(cleaned)
                parsed["source"] = "gemini"
                return parsed

        if openai_key:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {openai_key}"}
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query},
                ],
                "temperature": 0,
            }
            async with httpx.AsyncClient(timeout=15) as client:
                r = await client.post(url, headers=headers, json=payload)
                r.raise_for_status()
                data = r.json()
                text = data["choices"][0]["message"]["content"]
                cleaned = re.sub(r"^```json|```$", "", text.strip(), flags=re.MULTILINE).strip()
                parsed = json.loads(cleaned)
                parsed["source"] = "openai"
                return parsed
    except Exception:
        # any LLM/network failure silently falls back to rule-based parsing
        return None

    return None


async def parse_intent(query: str):
    """Agent step 1: understand the user's request.
    Tries an LLM if an API key is configured; otherwise (or on any failure)
    falls back to a deterministic rule-based extractor so the product always works.
    """
    llm_result = await _llm_parse(query)
    if llm_result and llm_result.get("category"):
        rule_result = _rule_based_parse(query)
        # fill any gaps the LLM missed using the rule-based pass
        for k, v in rule_result.items():
            if k != "source" and not llm_result.get(k):
                llm_result[k] = v
        return llm_result

    return _rule_based_parse(query)
