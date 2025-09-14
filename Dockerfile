FROM node:23.3.0 as build
RUN mkdir -p /var/www/html/
RUN mkdir -p /home/page
WORKDIR /home/page
COPY package.json /home/page/package.json
COPY . /home/page
RUN npm install -g @angular/cli
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY --from=build /home/page/dist/rg2025-web/browser/ /usr/share/nginx/html/
COPY nginx/nginx.conf /etc/nginx/

