FROM node:20-bullseye

# Install canvas system dependencies
RUN apt-get update && apt-get install -y \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --build-from-source=canvas

COPY . .

CMD ["node", "index.js"]
