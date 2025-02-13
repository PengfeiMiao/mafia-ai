FROM nikolaik/python-nodejs:python3.9-nodejs20-slim

RUN apt-get update && \
    apt-get install curl lsof libmagic1 poppler-utils tesseract-ocr -y

WORKDIR /app

COPY backend/requirements.txt .

RUN pip install -r requirements.txt

COPY client/package.json ./client/
COPY client/package-lock.json ./client/

#RUN npm config set registry https://registry.npm.taobao.org/
RUN cd client && npm install && cd ..

COPY backend/ ./backend/

COPY client/ ./client/

COPY scripts/ ./scripts/

CMD bash scripts/start.sh