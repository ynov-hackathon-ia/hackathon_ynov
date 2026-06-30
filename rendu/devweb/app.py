import os

import requests
import streamlit as st

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
MODEL_NAME = os.getenv("MODEL_NAME", "techcorp-financial")
MAX_PROMPT_LENGTH = 4000


def check_ollama() -> tuple[bool, str]:
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=3)
        response.raise_for_status()
        return True, "Connecte"
    except requests.RequestException as exc:
        return False, f"Deconnecte: {exc}"


def ask_ollama(messages: list[dict[str, str]]) -> str:
    response = requests.post(
        f"{OLLAMA_BASE_URL}/api/chat",
        json={"model": MODEL_NAME, "stream": False, "messages": messages},
        timeout=120,
    )
    response.raise_for_status()
    data = response.json()
    return (
        data.get("message", {}).get("content", "").strip() or "Reponse vide du modele."
    )


st.set_page_config(
    page_title="TechCorp Financial Chat", page_icon="TC", layout="centered"
)
st.title("TechCorp Financial Chat")

connected, status_text = check_ollama()
if connected:
    st.success(f"{status_text} - {OLLAMA_BASE_URL} - modele `{MODEL_NAME}`")
else:
    st.error(f"{status_text} - {OLLAMA_BASE_URL}")

if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

prompt = st.chat_input("Posez une question finance au modele")
if prompt:
    if len(prompt) > MAX_PROMPT_LENGTH:
        st.warning(
            f"Votre message depasse {MAX_PROMPT_LENGTH} caracteres et a ete tronque."
        )
        prompt = prompt[:MAX_PROMPT_LENGTH]
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        try:
            answer = ask_ollama(st.session_state.messages)
            st.markdown(answer)
        except requests.RequestException as exc:
            answer = f"Erreur Ollama: {exc}"
            st.error(answer)

    st.session_state.messages.append({"role": "assistant", "content": answer})
