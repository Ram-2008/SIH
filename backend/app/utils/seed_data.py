import os
import json
import datetime
from sqlalchemy.orm import Session
from app.models.models import User, Document, ExtractedField, LandRecord, ValidationResult, ReviewTask, AuditLog, GISParcel
from app.utils.auth_utils import get_password_hash

def seed_database(db: Session):
    # 1. Seed Users if not present
    if not db.query(User).filter(User.email == "officer@bhurishti.gov.in").first():
        officer = User(
            email="officer@bhurishti.gov.in",
            password_hash=get_password_hash("officer123"),
            full_name="Rajesh Sharma",
            role="REVENUE_OFFICER",
            department="Revenue & Land Records - Guntur Circle"
        )
        admin = User(
            email="admin@bhurishti.gov.in",
            password_hash=get_password_hash("admin123"),
            full_name="Priya Patel",
            role="ADMIN",
            department="Directorate of Land Records"
        )
        db.add(officer)
        db.add(admin)
        db.commit()

    # 2. Seed GIS Parcels for Leaflet Map Page
    if db.query(GISParcel).count() == 0:
        parcels = [
            GISParcel(
                id="PARCEL-001",
                ulpin="28-GNT-2024-9982",
                owner_name="Ramesh Kumar",
                khasra_number="123/45",
                village="Peddakakani",
                district="Guntur",
                area=2.45,
                land_type="Agricultural / Wet Land",
                center_lat=16.3350,
                center_lng=80.5050,
                coordinates_json=json.dumps([
                    [16.3360, 80.5040],
                    [16.3362, 80.5065],
                    [16.3340, 80.5068],
                    [16.3338, 80.5042]
                ]),
                status="Verified"
            ),
            GISParcel(
                id="PARCEL-002",
                ulpin="28-GNT-2024-9983",
                owner_name="Lakshmi Narayana",
                khasra_number="123/46",
                village="Peddakakani",
                district="Guntur",
                area=1.85,
                land_type="Agricultural / Dry Land",
                center_lat=16.3375,
                center_lng=80.5080,
                coordinates_json=json.dumps([
                    [16.3385, 80.5070],
                    [16.3388, 80.5095],
                    [16.3365, 80.5098],
                    [16.3362, 80.5073]
                ]),
                status="Verified"
            ),
            GISParcel(
                id="PARCEL-003",
                ulpin="28-GNT-2024-9984",
                owner_name="Venkat Rao",
                khasra_number="124/01",
                village="Peddakakani",
                district="Guntur",
                area=3.10,
                land_type="Residential / Homestead",
                center_lat=16.3325,
                center_lng=80.5020,
                coordinates_json=json.dumps([
                    [16.3335, 80.5010],
                    [16.3337, 80.5035],
                    [16.3315, 80.5038],
                    [16.3313, 80.5012]
                ]),
                status="Under Review"
            ),
            GISParcel(
                id="PARCEL-004",
                ulpin="28-GNT-2024-9985",
                owner_name="Srinivasa Reddy",
                khasra_number="124/02",
                village="Peddakakani",
                district="Guntur",
                area=4.20,
                land_type="Commercial",
                center_lat=16.3395,
                center_lng=80.5030,
                coordinates_json=json.dumps([
                    [16.3405, 80.5020],
                    [16.3408, 80.5045],
                    [16.3385, 80.5048],
                    [16.3383, 80.5022]
                ]),
                status="Verified"
            )
        ]
        for p in parcels:
            db.add(p)
        db.commit()

    # 3. Seed Demo Document DOC-101 if not present
    doc1 = db.query(Document).filter(Document.id == "DOC-101").first()
    if not doc1:
        # Create uploads folder and a dummy sample document image if needed
        os.makedirs("sample-data/documents", exist_ok=True)
        sample_img_path = "sample-data/documents/sample_khasra_record.jpg"
        if not os.path.exists(sample_img_path):
            # Create a simple synthetic sample image using PIL
            from PIL import Image, ImageDraw
            img = Image.new('RGB', (800, 1000), color=(250, 248, 242))
            d = ImageDraw.Draw(img)
            d.rectangle([(20, 20), (780, 980)], outline=(100, 100, 100), width=2)
            d.text((250, 50), "GOVERNMENT OF ANDHRA PRADESH", fill=(0, 51, 102))
            d.text((220, 80), "REVENUE DEPARTMENT - LAND RECORD EXTRACT", fill=(0, 51, 102))
            d.text((50, 140), "District: Guntur          Tehsil: Guntur          Village: Peddakakani", fill=(0, 0, 0))
            d.text((50, 180), "Landowner Name: Ramesh Kumar", fill=(0, 0, 0))
            d.text((50, 210), "Father/Guardian Name: Suresh Kumar", fill=(0, 0, 0))
            d.text((50, 250), "Khata Number: 78          Khasra Number: 12/45 (Skewed)", fill=(0, 0, 0))
            d.text((50, 280), "Plot Number: P-402         Area: 2.45 Acres", fill=(0, 0, 0))
            d.text((50, 310), "Mutation Number: MUT-2024-889     Date: 14-02-2023", fill=(0, 0, 0))
            d.text((50, 350), "ULPIN: 28-GNT-2024-9982", fill=(0, 102, 0))
            img.save(sample_img_path)

        doc1 = Document(
            id="DOC-101",
            filename="sample_khasra_record.jpg",
            file_path=sample_img_path,
            file_size=245000,
            mime_type="image/jpeg",
            status="Under Review",
            confidence_score=91.4,
            uploaded_by="Rajesh Sharma (Revenue Officer)",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
        )
        db.add(doc1)

        # Seed Fields for DOC-101
        fields_data = [
            ("owner_name", "Landowner Name", "Ramesh Kumar", 96.0, "high"),
            ("father_name", "Father/Guardian Name", "Suresh Kumar", 94.0, "high"),
            ("khasra_number", "Khasra Number", "12/45", 72.0, "low"), # LOW CONFIDENCE!
            ("khata_number", "Khata Number", "78", 90.0, "high"),
            ("plot_number", "Plot Number", "P-402", 88.0, "high"),
            ("area", "Land Area", "2.45 Acres", 91.0, "high"),
            ("village", "Village", "Peddakakani", 95.0, "high"),
            ("tehsil", "Tehsil", "Guntur", 95.0, "high"),
            ("district", "District", "Guntur", 98.0, "high"),
            ("state", "State", "Andhra Pradesh", 99.0, "high"),
            ("mutation_number", "Mutation Number", "MUT-2024-889", 89.0, "high"),
            ("document_date", "Document Date", "14-02-2023", 93.0, "high"),
            ("land_type", "Land Type", "Agricultural / Wet Land", 92.0, "high")
        ]

        for fk, fn, fv, conf, st in fields_data:
            ef = ExtractedField(
                document_id="DOC-101",
                field_key=fk,
                field_name=fn,
                field_value=fv,
                confidence=conf,
                status=st,
                original_value=fv
            )
            db.add(ef)

        # Seed Land Record
        lr = LandRecord(
            id="REC-001",
            document_id="DOC-101",
            owner_name="Ramesh Kumar",
            father_name="Suresh Kumar",
            khasra_number="12/45",
            khata_number="78",
            plot_number="P-402",
            area=2.45,
            area_unit="Acres",
            village="Peddakakani",
            tehsil="Guntur",
            district="Guntur",
            state="Andhra Pradesh",
            mutation_number="MUT-2024-889",
            document_date="14-02-2023",
            land_type="Agricultural / Wet Land",
            ulpin="28-GNT-2024-9982",
            status="Under Review",
            validation_score=94.0
        )
        db.add(lr)

        # Seed Validation checks
        v_checks = [
            ("DOCUMENT VALIDATION", "Document Date Format", "valid", "Document date (14-02-2023) valid.", 100.0),
            ("ENTITY VALIDATION", "Khasra Number Format", "warning", "Khasra number '12/45' has low OCR confidence.", 75.0),
            ("AREA VALIDATION", "Land Area Positive & Valid", "valid", "Area value 2.45 Acres is valid.", 100.0),
            ("DUPLICATE CHECK", "Duplicate Khasra Audit", "valid", "No duplicate record found in regional revenue ledger.", 100.0),
            ("OWNERSHIP CHECK", "Ownership Information", "warning", "Ownership information requires officer verification.", 85.0),
            ("GIS VALIDATION", "Cadastral Geo-Reference", "valid", "Parcel geometry successfully matched with prototype spatial layer.", 100.0)
        ]

        for cat, cn, st, msg, sc in v_checks:
            vr = ValidationResult(
                document_id="DOC-101",
                category=cat,
                check_name=cn,
                status=st,
                message=msg,
                score=sc
            )
            db.add(vr)

        # Seed Review Task for Human Review Queue
        rt = ReviewTask(
            id="REV-001",
            document_id="DOC-101",
            field_key="khasra_number",
            field_name="Khasra Number",
            extracted_value="12/45",
            confidence=72.0,
            reason="Low confidence score (72%) — Digit '3' potentially unreadable or blurred in source scan",
            status="Pending",
            assigned_to="Revenue Officer"
        )
        db.add(rt)

        # Seed Audit Logs
        audits = [
            AuditLog(
                document_id="DOC-101",
                user_name="Rajesh Sharma",
                action="Document Uploaded",
                details="Uploaded scanned document sample_khasra_record.jpg (245 KB)"
            ),
            AuditLog(
                document_id="DOC-101",
                user_name="Bhu-Drishti AI Pipeline",
                action="OpenCV Preprocessing & OCR Completed",
                details="Applied Deskew (+1.2° correction), Bilateral Filtering, Adaptive Binarization, and Entity Extraction."
            ),
            AuditLog(
                document_id="DOC-101",
                user_name="Bhu-Drishti AI Pipeline",
                action="Validation Engine Executed",
                details="Overall Validation Score: 94.0%. 1 Warning generated for low-confidence Khasra Number."
            ),
            AuditLog(
                document_id="DOC-101",
                user_name="System Queue",
                action="Review Task Created",
                details="Created Review Task REV-001 for low confidence field 'Khasra Number' (72.0%)."
            )
        ]
        for a in audits:
            db.add(a)

        # Seed Additional verified records (DOC-102, DOC-103) for dashboard statistics
        doc2 = Document(
            id="DOC-102",
            filename="khatauni_peddakakani_104.png",
            file_path="sample-data/documents/sample_khasra_record.jpg",
            file_size=310000,
            mime_type="image/png",
            status="Verified",
            confidence_score=96.8,
            uploaded_by="Priya Patel (Admin)",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
        )
        db.add(doc2)

        lr2 = LandRecord(
            id="REC-002",
            document_id="DOC-102",
            owner_name="Lakshmi Narayana",
            father_name="Venkateswarlu",
            khasra_number="123/46",
            khata_number="104",
            plot_number="P-403",
            area=1.85,
            area_unit="Acres",
            village="Peddakakani",
            tehsil="Guntur",
            district="Guntur",
            state="Andhra Pradesh",
            mutation_number="MUT-2024-890",
            document_date="20-01-2023",
            land_type="Agricultural / Dry Land",
            ulpin="28-GNT-2024-9983",
            status="Verified",
            validation_score=98.0
        )
        db.add(lr2)

        doc3 = Document(
            id="DOC-103",
            filename="land_deed_venkat_rao.pdf",
            file_path="sample-data/documents/sample_khasra_record.jpg",
            file_size=512000,
            mime_type="application/pdf",
            status="Verified",
            confidence_score=94.2,
            uploaded_by="Rajesh Sharma",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
        )
        db.add(doc3)

        lr3 = LandRecord(
            id="REC-003",
            document_id="DOC-103",
            owner_name="Venkat Rao",
            father_name="Subba Rao",
            khasra_number="124/01",
            khata_number="112",
            plot_number="P-501",
            area=3.10,
            area_unit="Acres",
            village="Peddakakani",
            tehsil="Guntur",
            district="Guntur",
            state="Andhra Pradesh",
            mutation_number="MUT-2024-712",
            document_date="05-11-2022",
            land_type="Residential / Homestead",
            ulpin="28-GNT-2024-9984",
            status="Verified",
            validation_score=96.5
        )
        db.add(lr3)

        db.commit()
