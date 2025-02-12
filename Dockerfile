FROM nikolaik/python-nodejs:python3.9-nodejs20-slim

RUN apt-get update && \
    apt-get install curl lsof libmagic1 poppler-utils tesseract-ocr -y

WORKDIR /app

COPY . .

RUN pip install --quiet -r backend/requirements.txt

#RUN npm config set registry https://registry.npm.taobao.org/
RUN cd client && npm install && cd ..

CMD bash scripts/start.sh