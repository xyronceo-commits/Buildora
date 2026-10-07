# CONSTRORA

> **Find what you need to build.**  
> A premier construction discovery and procurement platform for building materials, heavy equipment, site logistics, and verified industrial contractors.

---

## 🌟 Overview

**CONSTRORA** bridges project managers, contractors, site managers, and construction suppliers into a unified industrial ecosystem. Whether you are sourcing bulk cement in Osogbo, renting heavy excavators, hiring certified civil engineers, or coordinating site logistics, CONSTRORA simplifies resource discovery, price comparisons, cost estimations, and supplier verification.

---

## ✨ Key Features

- 🏗️ **Resource Discovery & Marketplace**: Filter and search through verified construction materials, heavy machinery rentals, logistics transport, and specialized contractor services.
- 🗺️ **Interactive Site Map**: Visual geospatial locator for nearby suppliers, distributors, and logistics hubs.
- 🧮 **Procurement & Material Cost Estimator**: Built-in calculators for estimating concrete, steel, blocks, roofing, and equipment rental budgets.
- ⚖️ **Side-by-Side Comparison Drawer**: Compare up to 4 listings simultaneously across pricing, delivery terms, minimum order quantities (MOQ), and verification status.
- 🛡️ **Supplier Verification & Onboarding**: Multi-step onboarding workflow for suppliers and contractors with compliance document submission.
- 🔐 **Admin Control Portal**: Comprehensive administrative dashboard for managing supplier verifications, listing approvals, user roles, and platform activity.
- 🌓 **Industrial Dark / High-Contrast Light Mode**: Tailored UI dark theme designed for high visibility on active job sites and field operations.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Custom Industrial Design Tokens
- **Icons**: Lucide React
- **Animations**: Motion (`motion/react`)
- **Backend & Database**: Firebase Firestore, Firebase Authentication
- **AI Integration**: Google GenAI SDK (Gemini API)
- **Tooling**: ESLint, TypeScript Compiler

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone or Extract the repository**:
   ```bash
   git clone <repository-url>
   cd constrora
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and configure your keys:
   ```bash
   cp .env.example .env
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:3000`.

---

## 🚀 Production Deployment Notes (Cloud Run)

### 1. Build and Container Deployment
Deploying the full-stack service to Google Cloud Run:
```bash
# Build the production bundle
npm run build

# Deploy container service to Cloud Run (use --allow-unauthenticated for public web traffic)
gcloud run deploy constrora \
  --image gcr.io/buildora-ed329/constrora:latest \
  --region europe-west2 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars FIREBASE_PROJECT_ID=buildora-ed329,FIRESTORE_DATABASE_ID=ai-studio-buildora-e6d60954-84ab-4902-b369-54ba7da18316
```
> **Note on `--allow-unauthenticated`**: This flag is required so that external public visitors and construction clients can access the web application interface without needing GCP IAM-level authentication headers.

### 2. Cross-Project IAM Policy Bindings
If the Cloud Run service runs inside a compute/staging project different from the primary Firebase project (`buildora-ed329`), the service account executing Cloud Run (e.g. `PROJECT_NUMBER-compute@developer.gserviceaccount.com` or custom service account) requires explicit IAM roles granted on `buildora-ed329`:

```bash
# 1. Grant Firestore / Datastore User access
gcloud projects add-iam-policy-binding buildora-ed329 \
  --member="serviceAccount:<SERVICE_ACCOUNT_EMAIL>" \
  --role="roles/datastore.user"

# 2. Grant Firebase Authentication Admin access (for user claims, disabling accounts, and token revocation)
gcloud projects add-iam-policy-binding buildora-ed329 \
  --member="serviceAccount:<SERVICE_ACCOUNT_EMAIL>" \
  --role="roles/firebaseauth.admin"
```

---

## 🔒 Admin Portal Access

The CONSTRORA Admin Portal provides administrative management over platform listings, verified suppliers, and site logistics. Authorized administrative credentials (`buildsafe247@gmail.com`) automatically receive administrative privileges upon signing in.

---

## 📜 License

This project is created and maintained for **CONSTRORA Construction Discovery Platform**. All rights reserved.
