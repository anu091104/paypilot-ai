from sqlalchemy import Column, Integer, String, Float, Text
from database.db import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, index=True, nullable=False)
    brand = Column(String)
    price = Column(Float, nullable=False)
    rating = Column(Float, default=0)
    battery_life_hours = Column(Float, nullable=True)
    camera_score = Column(Float, nullable=True)
    weight_grams = Column(Float, nullable=True)
    features = Column(Text)
    stock = Column(Integer, default=0)


class PaymentOffer(Base):
    __tablename__ = "payment_offers"

    id = Column(Integer, primary_key=True, index=True)
    bank = Column(String, nullable=False)
    payment_method = Column(String, nullable=False)
    discount_percent = Column(Float, default=0)
    cashback_flat = Column(Float, default=0)
    minimum_amount = Column(Float, default=0)
    maximum_cashback = Column(Float, default=0)
