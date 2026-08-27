from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import os

from database.db import get_db
from database.seed import seed_if_empty
from models.models import Product, PaymentOffer
from agent.orchestrator import run_agent

app = FastAPI(title="PayPilot API", description="AI Commerce & Payment Agent", version="1.0.0")

origins = os.getenv("FRONTEND_ORIGIN", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origins] if origins != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    seed_if_empty()


class AskRequest(BaseModel):
    query: str


@app.get("/")
def root():
    return {"status": "ok", "service": "PayPilot API"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/ask")
async def ask(payload: AskRequest, db: Session = Depends(get_db)):
    result = await run_agent(db, payload.query)
    return result


@app.get("/products")
def list_products(category: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    return query.all()


@app.get("/offers")
def list_offers(db: Session = Depends(get_db)):
    return db.query(PaymentOffer).all()
