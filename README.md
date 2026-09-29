# Geo Plot
### Intelligent Multilingual Land Record Digitization & Validation Platform
**Smart India Hackathon (SIH) Prototype** | **Team:** The Straw Hats (**Team ID:** 137647)

---

## 🌟 Executive Overview
Legacy land records across India are predominantly scanned paper documents that suffer from fading, skewing, low resolution, diverse regional languages/scripts, and inconsistent formatting. 

**Geo Plot** is an intelligent, end-to-end land record digitization and validation platform designed to automate document ingestion, OpenCV image enhancement, multilingual text extraction, rule-based entity parsing, business validation, confidence scoring, Human-in-the-Loop (HITL) officer review, and GIS cadastral mapping.

---

## 🏗️ Architecture & Pipeline Workflow

```mermaid
graph TD
    A[Scanned Document PDF/JPG] --> B[OpenCV Preprocessing Engine]
    B -->|Deskew + Denoise + CLAHE| C[Multilingual OCR Engine]
    C --> D[Entity Extractor & Regex Parser]
    D --> E[Business Rule Validation Service]
    E --> F{Confidence Scoring >= 85%?}
    F -->|Yes| G[Verified Digital Land Record]
    F -->|No (<85%)| H[Revenue Officer HITL Review Queue]
    H -->|Officer Correction| I[Active Learning Feedback Loop]
    I --> G
    G --> J[GIS Cadastral Map Layer & Audit Log]
```

---

## 🚀 Key Features

1. **OpenCV Image Preprocessing Pipeline**:
   - Automated skew angle detection & rotation (`warpAffine`).
   - Edge-preserving bilateral noise filtering.
   - Adaptive histogram equalization (CLAHE) & Otsu binarization.
2. **Multilingual OCR & Entity Extractor**:
   - Extracts Landowner Name, Father Name, Khasra Number, Khata Number, Area, Village, Tehsil, District, State, Mutation No., Date, and Land Classification.
3. **Automated Business Validation Engine**:
   - 6-Point automated checks (Document Date, Khasra format, Positive Area calculation, Duplicate audit, Lineage consistency, Cadastral spatial match).
4. **Human-in-the-Loop (HITL) & Active Learning Queue**:
   - Fields with confidence score `< 85%` (e.g. blurred Khasra `12/45` @ `72%`) are automatically queued for Revenue Officers.
   - Officer corrections update the record status to `✓ Verified by Revenue Officer` and feed into the Active Learning model log.
5. **GIS Spatial Cadastral Map**:
   - Interactive Leaflet map displaying village parcel polygons, ULPIN (`28-GNT-2024-9982`), and land record attributes upon parcel selection (*clearly labeled as Prototype / Sample Spatial Data*).
6. **Immutable System Audit Trail**:
   - Complete record of user actions, AI processing timestamps, old values, and corrected values.
7. **1-Click Judge Automated Demo Mode**:
   - Instant end-to-end workflow execution for hackathon evaluation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, React Router v7, Axios, Recharts, Leaflet / React-Leaflet |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, Pydantic v2, OpenCV (`opencv-python-headless`), NumPy, Pillow, PyTesseract / Fallback OCR Parser |
| **Database** | SQLite (Zero-Setup out-of-the-box local dev) / PostgreSQL with SQLAlchemy ORM |
| **Containerization** | Docker, Docker Compose |

---

## 📂 Project Structure

```
geo-plot/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── UploadPage.tsx
│   │   │   ├── ExtractionPage.tsx
│   │   │   ├── ValidationPage.tsx
│   │   │   ├── HumanReviewPage.tsx
│   │   │   ├── GISMapPage.tsx
│   │   │   ├── RecordDetailsPage.tsx
│   │   │   ├── AuditLogsPage.tsx
│   │   │   └── ArchitecturePage.tsx
│   │   ├── layouts/
│   │   │   └── AppLayout.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.css
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── ocr/
│   │   │   ├── preprocessor.py
│   │   │   └── ocr_engine.py
│   │   ├── validation/
│   │   │   ├── entity_extractor.py
│   │   │   └── validation_service.py
│   │   ├── database/
│   │   │   └── session.py
│   │   ├── services/
│   │   └── utils/
│   │       └── seed_data.py
│   └── requirements.txt
├── sample-data/
│   ├── documents/
│   └── extracted-records/
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔑 Demo Credentials

- **Revenue Officer Login**: `officer@bhurishti.gov.in` | Password: `officer123`
- **Admin Login**: `admin@bhurishti.gov.in` | Password: `admin123`
- **Instant Demo**: Click **"Quick Demo Login"** or **"Run Automated Demo"** on top bar.

---

## 💻 Local Development Setup

### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend API interactive documentation available at: `http://localhost:8000/docs`

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend application accessible at: `http://localhost:3000`

---

## 🐳 Running with Docker

To spin up the entire full-stack application (PostgreSQL + FastAPI Backend + React Frontend):
```bash
docker compose up --build
```
Access the application at `http://localhost:3000`.

---

## 🔮 Future-Ready Architecture Extensions

The codebase contains modular integration hooks for:
- **TrOCR (Transformer OCR)** for handwritten archival land deeds.
- **LayoutLMv3 Multimodal Transformer** for structural form parsing.
- **IndicNLP Engine** for native multi-script translations (Hindi, Telugu, Tamil, Bengali).
- **YOLOv8 Segmentor** for automated map boundary detection.
- **PostGIS / GeoServer** for live government cadastral GIS integration.
- **NGDRS & DILRMP API Connectors** for official land registry sync.

---

*Developed by **The Straw Hats** (Team ID: **137647**) for Smart India Hackathon.*
