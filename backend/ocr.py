"""
ocr.py — Document OCR Pipeline
Extracts text from PDFs and images.
"""

import io
import logging

logger = logging.getLogger(__name__)

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False

try:
    from pdf2image import convert_from_bytes
    PDF2IMAGE_AVAILABLE = True
except ImportError:
    PDF2IMAGE_AVAILABLE = False


class OCRPipeline:

    def __init__(self):
        logger.info("✅ OCR Pipeline ready")

    def extract(self, file_bytes: bytes, content_type: str, filename: str = "") -> str:
        logger.info(f"OCR: processing {content_type} ({len(file_bytes)/1024:.1f} KB)")

        if content_type == "text/plain":
            return file_bytes.decode("utf-8", errors="ignore")

        if content_type == "application/pdf":
            return self._process_pdf(file_bytes)

        if content_type.startswith("image/"):
            image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
            return self._process_image(image)

        raise ValueError(f"Unsupported content type: {content_type}")

    def _process_pdf(self, pdf_bytes: bytes) -> str:
        if not PDF2IMAGE_AVAILABLE:
            raise RuntimeError(
                "pdf2image not installed. Run: pip install pdf2image\n"
                "Also install poppler: https://github.com/oschwartz10612/poppler-windows/releases"
            )
        images = convert_from_bytes(pdf_bytes, dpi=200)
        logger.info(f"PDF has {len(images)} page(s)")
        all_text = []
        for i, image in enumerate(images):
            page_text = self._process_image(image)
            if page_text.strip():
                all_text.append(f"--- Page {i+1} ---\n{page_text}")
        return "\n\n".join(all_text)

    def _process_image(self, image) -> str:
        if not TESSERACT_AVAILABLE:
            raise RuntimeError(
                "pytesseract not installed. Run: pip install pytesseract\n"
                "Also install Tesseract: https://github.com/UB-Mannheim/tesseract/wiki"
            )
        import pytesseract
        config = "--psm 6 --oem 3"
        return pytesseract.image_to_string(image, config=config).strip()