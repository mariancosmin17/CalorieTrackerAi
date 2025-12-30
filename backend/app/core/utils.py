import random
import re
import string
from datetime import datetime,timedelta

def validate_email(email:str)->bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern,email) is not None

def validate_password(password:str)->tuple[bool,str]:
    if len(password)<8:
        return False,"Password must be at least 8 characters long."
    if not re.search(r'[A-Z]',password):
        return False,"Password must contain at least one uppercase letter."
    if not re.search(r'[a-z]',password):
        return False,"Password must contain at least one lowercase letter."
    if not re.search(r'[0-9]',password):
        return False,"Password must contain at least one digit."
    return True,""

def generate_code()->str:
    return ''.join(random.choices(string.digits,k=6))

def is_code_expired(expires_at:datetime)->bool:
    return datetime.utcnow()>expires_at
