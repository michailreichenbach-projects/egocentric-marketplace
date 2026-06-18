"""Synchronous Postgres client for the pipeline worker."""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager

DATABASE_URL = os.getenv("DATABASE_URL")

@contextmanager
def get_conn():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def update_clip_status(clip_id: str, status: str, **kwargs):
    """Update a clip's status and any extra fields."""
    fields = {"status": status, **kwargs}
    set_clause = ", ".join(f"{k} = %s" for k in fields)
    values = list(fields.values()) + [clip_id]
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE video_clips SET {set_clause} WHERE id = %s",
                values,
            )
