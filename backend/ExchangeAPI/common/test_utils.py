from io import BytesIO

from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image


def image_file(name="chair.png", color=(120, 84, 60)):
    stream = BytesIO()
    Image.new("RGB", (32, 32), color=color).save(stream, format="PNG")
    return SimpleUploadedFile(name, stream.getvalue(), content_type="image/png")
