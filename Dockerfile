FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Generate Prisma client during build
RUN npx prisma generate

EXPOSE 7000

CMD ["npm", "run", "dev"]

