import csv
import os
from database.db import SessionLocal, engine, Base
from models.models import Product, PaymentOffer

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


def seed_if_empty():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Product).count() == 0:
            with open(os.path.join(DATA_DIR, "products.csv"), newline="", encoding="utf-8") as f:
                for row in csv.DictReader(f):
                    db.add(Product(
                        id=int(row["id"]),
                        name=row["name"],
                        category=row["category"],
                        brand=row["brand"],
                        price=float(row["price"]),
                        rating=float(row["rating"]) if row["rating"] else 0,
                        battery_life_hours=float(row["battery_life_hours"]) if row["battery_life_hours"] else None,
                        camera_score=float(row["camera_score"]) if row["camera_score"] else None,
                        weight_grams=float(row["weight_grams"]) if row["weight_grams"] else None,
                        features=row["features"],
                        stock=int(row["stock"]) if row["stock"] else 0,
                    ))
        if db.query(PaymentOffer).count() == 0:
            with open(os.path.join(DATA_DIR, "offers.csv"), newline="", encoding="utf-8") as f:
                for row in csv.DictReader(f):
                    db.add(PaymentOffer(
                        id=int(row["id"]),
                        bank=row["bank"],
                        payment_method=row["payment_method"],
                        discount_percent=float(row["discount_percent"]),
                        cashback_flat=float(row["cashback_flat"]),
                        minimum_amount=float(row["minimum_amount"]),
                        maximum_cashback=float(row["maximum_cashback"]),
                    ))
        db.commit()
    finally:
        db.close()
