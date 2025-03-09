import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from config.config import smtp_address, smtp_pwd


class STMPHelper:
    def __init__(self):
        self.sender_email = smtp_address()
        self.sender_password = smtp_pwd()

    def build_email(self, receiver: str, subject: str, body: str):
        message = MIMEMultipart()
        message["From"] = self.sender_email
        message["To"] = receiver
        message["Subject"] = subject
        message.attach(MIMEText(body, "plain"))
        return message

    def send_email(self, receiver: str, subject: str, body: str):
        try:
            with smtplib.SMTP("smtp.qq.com", 587) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                message = self.build_email(receiver, subject, body)
                server.sendmail(self.sender_email, receiver, message.as_string())
                print("Succeed to send email.")
        except smtplib.SMTPResponseException as e:
            if '\\x00\\x00\\x00' not in str(e):
                raise e
