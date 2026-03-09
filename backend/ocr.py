"""
ocr.py — Document OCR Pipeline
Extracts text from PDFs and images.
"""

import io
import logging

logger = logging.getLogger(__name__)

# Hard imports — these must be installed
from PIL import Image
import pytesseract

# Tell pytesseract exactly where Tesseract is installed on Windows
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

try:
    from pdf2image import convert_from_bytes
    PDF2IMAGE_AVAILABLE = True
except ImportError:
    PDF2IMAGE_AVAILABLE = False
    logger.warning("pdf2image not installed — PDF upload disabled")


class OCRPipeline:

    def __init__(self):
        # Test that Tesseract is actually found
        try:
            ver = pytesseract.get_tesseract_version()
            logger.info(f"✅ OCR Pipeline ready (Tesseract {ver})")
        except Exception as e:
            logger.warning(f"⚠️ Tesseract not found: {e}")
            logger.warning("Download from: https://github.com/UB-Mannheim/tesseract/wiki")

    def extract(self, file_bytes: bytes, content_type: str, filename: str = "") -> str:
        logger.info(f"OCR: processing {content_type} ({len(file_bytes)/1024:.1f} KB)")

        # Plain text — no OCR needed
        if content_type == "text/plain":
            return file_bytes.decode("utf-8", errors="ignore")

        # PDF — convert pages to images first
        if content_type == "application/pdf":
            return self._process_pdf(file_bytes)

        # Images (JPEG, PNG, TIFF, WEBP)
        if content_type.startswith("image/"):
            image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
            return self._process_image(image)

        raise ValueError(f"Unsupported content type: {content_type}")

    def _process_pdf(self, pdf_bytes: bytes) -> str:
        if not PDF2IMAGE_AVAILABLE:
            raise RuntimeError(
                "pdf2image not installed.\n"
                "Run: pip install pdf2image\n"
                "Also install poppler for Windows:\n"
                "https://github.com/oschwartz10612/poppler-windows/releases"
            )

        # Convert PDF pages to images in memory
        images = convert_from_bytes(pdf_bytes, dpi=200)
        logger.info(f"PDF has {len(images)} page(s)")

        all_text = []
        for i, image in enumerate(images):
            logger.info(f"OCR page {i+1}/{len(images)}")
            page_text = self._process_image(image)
            if page_text.strip():
                all_text.append(f"--- Page {i+1} ---\n{page_text}")

        return "\n\n".join(all_text)

    def _process_image(self, image: Image.Image) -> str:
        # psm 6 = assume uniform block of text (good for medical reports)
        # oem 3 = use LSTM neural network engine
        config = "--psm 6 --oem 3"
        text = pytesseract.image_to_string(image, config=config)
        return text.strip()