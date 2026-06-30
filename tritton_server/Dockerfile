FROM nvcr.io/nvidia/tritonserver:24.08-pyt-python-py3

RUN pip install --no-cache-dir \
    transformers==4.45.2 \
    accelerate==0.34.2 \
    sentencepiece==0.2.0 \
    einops==0.8.0 \
    protobuf==4.25.3

COPY model_repository /models

EXPOSE 8000 8001 8002

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/v2/health/ready')" || exit 1

CMD ["tritonserver", "--model-repository=/models", "--http-port=8000", "--grpc-port=8001", "--metrics-port=8002"]