import pyotp
import qrcode
import io
import base64

def generate_totp_secret()->str:
    return pyotp.random_base32()
def generate_qr_code(username:str,secret:str,issuer:str="CalorieTrackerAi")->str:
    totp=pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=username, issuer_name=issuer)
    qr=qrcode.QRCode(version=1,box_size=10,border=5)
    qr.add_data(uri)
    qr.make(fit=True)
    img=qr.make_image(fill_color="black",back_color="white")
    buffer=io.BytesIO()
    img.save(buffer,format='PNG')
    img_base64=base64.b64encode(buffer. getvalue()).decode()
    return f"data:image/png;base64,{img_base64}"
def verify_totp_code(secret:str,code:str)->bool:
    totp=pyotp.TOTP(secret)
    return totp.verify(code,valid_window=1)
def get_current_totp_code(secret:str)->str:
    totp = pyotp.TOTP(secret)
    return totp.now()