from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pharmacy.db")

settings = Settings()
