from sqlalchemy.orm import Session
from models.models import Product


def search_products(db: Session, category: str | None, budget: float | None, keyword: str | None = None):
    """Tool: search_products(). Filters the product catalog by category and budget."""
    query = db.query(Product)

    if category:
        query = query.filter(Product.category == category)

    if budget:
        # allow a small 5% headroom so near-budget items aren't excluded unfairly
        query = query.filter(Product.price <= budget * 1.05)

    if keyword:
        like = f"%{keyword}%"
        query = query.filter(
            (Product.name.ilike(like)) | (Product.brand.ilike(like)) | (Product.features.ilike(like))
        )

    return query.all()
