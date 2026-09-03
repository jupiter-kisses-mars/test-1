import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add backend directory to sys.path so modules can be imported smoothly
backend_dir = str(Path(__file__).resolve().parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from database import engine, Base, auto_migrate_database
import auth_router
import trips_router
import itinerary_router
import chat_router

from expense.routes import users, expenses, balances, dashboard as expense_dashboard

# Create database tables and auto-migrate missing columns for all modules
auto_migrate_database(engine, Base)


app = FastAPI(
    title="TripMate & Expense Calculator API",
    description="Backend API for TripMate and Expense Calculator",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router.router)
app.include_router(trips_router.router)
app.include_router(itinerary_router.router)
app.include_router(chat_router.router)
app.include_router(users.router)
app.include_router(expenses.router)
app.include_router(balances.router)
app.include_router(expense_dashboard.router)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "Welcome to TripMate & Expense Calculator API!"}
