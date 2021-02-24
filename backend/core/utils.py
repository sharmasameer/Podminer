from django.core.mail import EmailMessage
import datetime

import threading


class EmailThread(threading.Thread):

    def __init__(self, email):
        self.email = email
        threading.Thread.__init__(self)

    def run(self):
        self.email.send()


class Util:
    @staticmethod
    def send_email(data):
        email = EmailMessage(
            subject=data['email_subject'], body=data['email_body'], to=[data['to_email']])
        EmailThread(email).start()

class Util2:
    @staticmethod
    def send_email(datarr):
        email = EmailMessage(
            subject=datarr['email_subject'], body=datarr['email_body'], to=[datarr['to_email']])
        for ins in datarr['qq']:
            nam="-"+ins['attname']
            newnam=""
            last=0
            first=0
            for ch in nam:
                if ch=='-':
                    if first:
                        newnam=newnam+"_"
                    first=1
                    last=1
                elif last:
                    newnam=newnam+ch.upper()
                    last=0
                else:
                    newnam=newnam+ch
            newnam=newnam+"("+str(datetime.datetime.today().date())+")"

            email.attach(newnam+'.pdf', ins['att'])
        EmailThread(email).start() 