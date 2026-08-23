from pathlib import Path
import os
from dotenv import load_dotenv


# =====================================================
# BASE DIRECTORY
# =====================================================

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")


# =====================================================
# SECURITY
# =====================================================

SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "replace-this-with-a-secure-secret"
)

DEBUG = os.environ.get("DEBUG", "False") == "True"

_allowed_hosts = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
ALLOWED_HOSTS = [host.strip() for host in _allowed_hosts if host.strip()]


# =====================================================
# APPLICATIONS
# =====================================================

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "rest_framework",
    "corsheaders",
    "django_filters",

    "rest_framework_simplejwt.token_blacklist",

    "journal",
    "academy",
    "rsre_core",
    "rsre_payments",
]


# =====================================================
# MIDDLEWARE
# =====================================================

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.security.SecurityMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",

    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",

    "django.contrib.messages.middleware.MessageMiddleware",

    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# =====================================================
# URL / TEMPLATES
# =====================================================

ROOT_URLCONF = "rmsj.urls"


TEMPLATES = [
    {
        "BACKEND":
            "django.template.backends.django.DjangoTemplates",

        "DIRS": [],

        "APP_DIRS": True,

        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


WSGI_APPLICATION = "rmsj.wsgi.application"


# =====================================================
# DATABASE
# =====================================================

USE_SQLITE = (
    os.environ.get("USE_SQLITE", "False") == "True"
)


if USE_SQLITE:

    DATABASES = {
        "default": {
            "ENGINE":
                "django.db.backends.sqlite3",

            "NAME":
                BASE_DIR / "db.sqlite3",
        }
    }

else:
    _database_url = os.environ.get("DATABASE_URL", "").strip()
    if _database_url:
        from urllib.parse import urlparse, unquote
        _db = urlparse(_database_url)
        DATABASES = {
            "default": {
                "ENGINE": "django.db.backends.postgresql",
                "NAME": _db.path.lstrip("/"),
                "USER": unquote(_db.username or ""),
                "PASSWORD": unquote(_db.password or ""),
                "HOST": _db.hostname,
                "PORT": str(_db.port or 5432),
                "OPTIONS": {"sslmode": "require"},
            }
        }
    else:
        DATABASES = {
            "default": {
                "ENGINE": "django.db.backends.postgresql",
                "NAME": os.environ.get("POSTGRES_DB", "rmsj"),
                "USER": os.environ.get("POSTGRES_USER", "postgres"),
                "PASSWORD": os.environ.get("POSTGRES_PASSWORD", ""),
                "HOST": os.environ.get("DB_HOST", "localhost"),
                "PORT": os.environ.get("DB_PORT", "5432"),
                "OPTIONS": {"sslmode": os.environ.get("PGSSLMODE", "require")},
            }
        }
    }


# =====================================================
# PASSWORD VALIDATION
# =====================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME":
            "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },

    {
        "NAME":
            "django.contrib.auth.password_validation.MinimumLengthValidator",
    },

    {
        "NAME":
            "django.contrib.auth.password_validation.CommonPasswordValidator",
    },

    {
        "NAME":
            "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# =====================================================
# CUSTOM USER
# =====================================================

AUTH_USER_MODEL = "journal.User"


# =====================================================
# LANGUAGE / TIME
# =====================================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# =====================================================
# STATIC / MEDIA
# =====================================================

STATIC_URL = "/static/"

STATIC_ROOT = BASE_DIR / "staticfiles"


MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"


# =====================================================
# DEFAULT PRIMARY KEY
# =====================================================

DEFAULT_AUTO_FIELD = (
    "django.db.models.BigAutoField"
)


# =====================================================
# DJANGO REST FRAMEWORK
# =====================================================

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "journal.authentication.RMSJWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),
    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ),
    "DEFAULT_THROTTLE_RATES": {
        "anon": "120/min",
        "user": "600/min",
    },
}


# =====================================================
# SIMPLE JWT
# =====================================================

from datetime import timedelta


SIMPLE_JWT = {

    "ACCESS_TOKEN_LIFETIME":
        timedelta(minutes=30),

    "REFRESH_TOKEN_LIFETIME":
        timedelta(days=7),

    "ROTATE_REFRESH_TOKENS":
        True,

    "BLACKLIST_AFTER_ROTATION":
        True,

    "UPDATE_LAST_LOGIN":
        True,

}


# =====================================================
# CORS
# =====================================================

_cors_origins = os.environ.get("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
CORS_ALLOWED_ORIGINS = [origin.strip().rstrip("/") for origin in _cors_origins if origin.strip()]

CORS_ALLOW_CREDENTIALS = True

_csrf_origins = os.environ.get("CSRF_TRUSTED_ORIGINS", os.environ.get("FRONTEND_URL", "http://localhost:3000"))
CSRF_TRUSTED_ORIGINS = [origin.strip().rstrip("/") for origin in _csrf_origins.split(",") if origin.strip()]

if not DEBUG:
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = "same-origin"
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = os.environ.get("SECURE_SSL_REDIRECT", "True") == "True"
    SECURE_HSTS_SECONDS = int(os.environ.get("SECURE_HSTS_SECONDS", "31536000"))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    X_FRAME_OPTIONS = "DENY"

FRONTEND_URL=os.environ.get("FRONTEND_URL","http://localhost:3000")
EMAIL_BACKEND=os.environ.get("EMAIL_BACKEND","django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST=os.environ.get("EMAIL_HOST",""); EMAIL_PORT=int(os.environ.get("EMAIL_PORT","587")); EMAIL_HOST_USER=os.environ.get("EMAIL_HOST_USER",""); EMAIL_HOST_PASSWORD=os.environ.get("EMAIL_HOST_PASSWORD",""); EMAIL_USE_TLS=os.environ.get("EMAIL_USE_TLS","True")=="True"
DEFAULT_FROM_EMAIL=os.environ.get("DEFAULT_FROM_EMAIL","RSRE <researchrwandahub@gmail.com>")





