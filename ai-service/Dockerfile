FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/app/.cache/huggingface

WORKDIR /app

# CPU-only PyTorch first (the default wheel bundles CUDA and is several GB)
RUN pip install --index-url https://download.pytorch.org/whl/cpu \
                --extra-index-url https://pypi.org/simple torch

COPY requirements.txt .
RUN pip install -r requirements.txt

# Bake the embedding model into the image so the first RAG request
# doesn't have to download it
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

COPY app ./app

RUN useradd --system --uid 10001 aibi && chown -R aibi /app
USER aibi

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
