FROM python:3.8

WORKDIR /swapus

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY ./* ./

CMD ["python3", "main.py"]