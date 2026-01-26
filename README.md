
# Spring & React E-Commerce Platform 🚀

A full-featured e-commerce platform built with a Spring MVC backend and a React frontend. This monorepo includes a comprehensive set of features, from user authentication and product management to payment integration and real-time chat.

---

## System Architecture 🏗️

The application is designed as a monorepo with a clear separation between the backend and frontend, communicating via a REST API.


-   **Backend (`SpringEcommerceApp/`)** 🖥️: A robust Java-based application built with Spring MVC. Handles business logic, persistence, REST API and a server-side admin panel (Thymeleaf).

-   **Frontend (`ecommerceweb/`)** ⚛️: A modern SPA built with React + Material-UI. Responsive UI, development proxy to backend to simplify cross-origin calls.

-   **Database** 🗄️: MySQL (managed with Hibernate ORM).


---

## Core Features ✨

### Backend Features 🛠️
-   🔐 **Authentication**: JWT + Google/Facebook social login.
-   👥 **User Management**: Registration, profiles, role-based access (User / Seller / Admin).
-   📦 **Product & Catalog**: CRUD for products, categories, and seller stores.
-   🛒 **E-Commerce Core**: Cart, wishlist, multi-step order flow.
-   💳 **Payments**: MoMo and PayPal integrations (sandbox support).
-   🏪 **Seller Portal**: Seller registration and store/order management.
-   📊 **Admin Dashboard**: Thymeleaf-based admin UI for management & reports.
-   💬 **Real-time Chat**: WebSocket chat between users and sellers.

### Frontend Features 🎨
-   ✨ **UI**: Responsive, Material-UI based components.
-   🔍 **Discovery**: Search, filters, product comparison, rich product pages.
-   🛍️ **Shopping Flow**: Add-to-cart, wishlist, checkout steps.
-   👤 **Account**: User dashboard, order history, profile management.
-   🧑‍💼 **Seller Dashboard**: Manage products, view sales stats.
-   💬 **Chat**: In-app chat dialog for buyer ↔ seller conversations.

---

## Tech Stack 🧰

| Category      | Technology                                                                                             |
| :------------ | :----------------------------------------------------------------------------------------------------- |
| **Backend**   | Java 21, Spring MVC 6, Spring Security 6, Hibernate 6, MySQL, Maven, Tomcat, JWT, Thymeleaf, Ehcache     |
| **Frontend**  | React ⚛️, Material-UI (MUI), React Router, Axios, Context API                                           |
| **Database**  | MySQL 8+ 🗄️                                                                                             |
| **DevOps**    | Git, Maven, npm, Tomcat, HTTPS/SSL                                                                        |
| **APIs**      | Cloudinary ☁️, MoMo & PayPal 💳, Google & Facebook OAuth                                                    |

---

## Getting Started ▶️

Follow these instructions to get the project up and running on your local machine.

### Prerequisites ✅
-   Java JDK 21
-   Apache Maven 3.9+
-   Node.js 18+ and npm
-   MySQL 8+

### 1. Backend Setup (HTTPS)

1.  **Create database**: create a MySQL database named `ecommercedb`.
2.  **Configure**: edit `SpringEcommerceApp/src/main/resources/database.properties` with your DB credentials.
3.  **Run** (from project root):
    ```powershell
    mvn clean package
    mvn org.apache.tomcat.maven:tomcat7-maven-plugin:2.2:run
    ```
    The backend is available at `https://localhost:8443/SpringEcommerceApp-1.0-SNAPSHOT` (self-signed cert).

### 2. Frontend Setup

1.  Install dependencies:
    ```powershell
    cd ecommerceweb
    npm install
    ```

2.  Run dev server:
    ```powershell
    npm start
    ```
    Frontend: `http://localhost:3000` (proxies `/SpringEcommerceApp-1.0-SNAPSHOT` to backend HTTPS).

> **Note**: When you first access the application in your browser, you may see a privacy warning due to the self-signed SSL certificate. You can safely proceed.

---

## API Documentation 📡

The backend exposes a RESTful API that the frontend consumes.

-   **Base URL**: All API endpoints are prefixed with `/SpringEcommerceApp-1.0-SNAPSHOT/api`.
-   **Authentication**:
    -   Most endpoints are protected and require a `Bearer Token` in the `Authorization` header.
    -   The token is obtained by authenticating via the `/api/login`, `/api/login/google`, or `/api/login/facebook` endpoints.
    -   The frontend automatically handles attaching the token to authenticated requests.

-   **Public Endpoints**:
    -   `POST /api/login`, `POST /api/register`
    -   `POST /api/login/google`, `POST /api/login/facebook`
    -   `GET /api/products`, `GET /api/products/{productId}`
    -   `GET /api/categories`

-   **Protected Endpoints**:
    -   `GET /api/users/current-user` (Requires auth)
    -   `POST /api/carts/` (Requires auth)
    -   `POST /api/orders/` (Requires auth)
    -   And many more related to user-specific data.

---
*This project was developed by Nguyen Hoang Trieu Vy & Vo Tran Yen Nhu.*

