# Spring E‑Commerce (Spring Boot + React)

A full-stack e-commerce platform — backend powered by Spring Boot and frontend built with React + MUI. This README reflects the current project status (Spring Boot backend) and the deployed URLs.

---

**Homepage (Frontend / Client):** https://spring-ecommerce-app.vercel.app/

**Backend (Admin):** https://springecommerceapp.fly.dev/SpringEcommerceApp/

---

**Architecture overview**
- Backend: `SpringEcommerceApp/` — Spring Boot (REST API) secured with Spring Security, persistence via Hibernate/MySQL, admin UI (Thymeleaf).
- Frontend: `ecommerceweb/` — React (Create React App) with Material-UI.
- Database: MySQL 8+ (Hibernate).

---

## Key features
- Authentication: JWT + social login (Google / Facebook)
- User & role management (User / Seller / Admin)
- Product, category and seller store management
- Cart, wishlist, and multi-step checkout flow
- Payment integrations (MoMo & PayPal sandbox)
- Real-time chat between buyers and sellers (WebSocket)

---

## Important links
- Frontend (production): https://spring-ecommerce-app.vercel.app/
- Backend (production): https://springecommerceapp.fly.dev/SpringEcommerceApp/

---

## Running locally (summary)

1) Prerequisites

   - Java JDK 21
   - Apache Maven 3.9+
   - Node.js 18+ and npm
   - MySQL 8+

2) Backend (Spring Boot)

   - Create a MySQL database named `ecommercedb` and update connection settings in `SpringEcommerceApp/src/main/resources/database.properties`.
   - (Optional) import demo seed data to quickly populate sample data: [SpringEcommerceApp/sql/demo_seed_no_users.sql](SpringEcommerceApp/sql/demo_seed_no_users.sql).
   - Build and run:

   ```powershell
   cd SpringEcommerceApp
   mvn clean package
   mvn spring-boot:run
   ```

   - Local API base: `http://localhost:8080/SpringEcommerceApp/` (or configured in `application.yml`).

3) Frontend (React)

   ```powershell
   cd ecommerceweb
   npm install
   npm start
   ```

   - Dev server: `http://localhost:3000` — frontend dev server proxies API requests to the backend per dev config.

---

## Environment configuration
- Frontend: use the `.env` file (if needed) to set `REACT_APP_BASE_URL` to point the client to a local or production backend.
- Backend: update `application.yml` / `database.properties` for environment-specific settings and database credentials.

---

*This project was developed by Nguyen Hoang Trieu Vy & Vo Tran Yen Nhu.*

