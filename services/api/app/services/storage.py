import os
from typing import Optional
from google.cloud import storage
from app.core.config import settings


class StorageService:
    def __init__(self):
        self.bucket_name = settings.GCS_BUCKET_NAME
        self.credentials_file = settings.GCS_CREDENTIALS_FILE
        self._client: Optional[storage.Client] = None

    @property
    def client(self) -> storage.Client:
        if self._client is None:
            if self.credentials_file and os.path.exists(self.credentials_file):
                self._client = storage.Client.from_service_account_json(self.credentials_file)
            else:
                self._client = storage.Client(project=settings.GCS_PROJECT_ID)
        return self._client

    def upload_file(self, destination_blob_name: str, file_data: bytes, content_type: str = "image/jpeg") -> str:
        bucket = self.client.bucket(self.bucket_name)
        blob = bucket.blob(destination_blob_name)
        blob.upload_from_string(file_data, content_type=content_type)
        return f"https://storage.googleapis.com/{self.bucket_name}/{destination_blob_name}"

    def delete_file(self, blob_name: str) -> bool:
        bucket = self.client.bucket(self.bucket_name)
        blob = bucket.blob(blob_name)
        if blob.exists():
            blob.delete()
            return True
        return False


storage_service = StorageService()
