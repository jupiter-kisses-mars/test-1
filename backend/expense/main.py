from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from expense.database import engine, Base
from database import auto_migrate_database
from expense.routes import users, expenses, balances, dashboard


# Create database tables and auto-migrate missing columns if needed
auto_migrate_database(engine, Base)



app = FastAPI(
    title="Expense Calculator API",
    description="Backend API for Expense Calculator - manage users, expenses, balances, and settlements.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Include API Routers
app.include_router(users.router)
app.include_router(expenses.router)
app.include_router(balances.router)
app.include_router(dashboard.router)

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}

@app.get("/", tags=["Health"])
def read_root():
    return {
        "message": "Welcome to Expense Calculator API",
        "docs": "/docs",
        "redoc": "/redoc"
    }
