from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import ollama


# ==========================================
# CONFIGURATION DU MODÈLE
# ==========================================
class ModelConfig:
    """
    Conteneur de données pour les hyperparamètres du modèle.
    """

    def __init__(
        self,
        temperature: float = 0.1,  
        top_p: float = 0.9,
        num_ctx: int = 4096,  
        repeat_penalty: float = 1.2,  # AJOUT : Évite les listes infinies constatées au test précédent
        system_prompt: Optional[str] = None,
    ):
        self.temperature = temperature
        self.top_p = top_p
        self.num_ctx = num_ctx
        self.repeat_penalty = repeat_penalty
        self.system_prompt = system_prompt

    def to_ollama_options(self) -> Dict[str, Any]:
        """Convertit les paramètres génériques au format attendu par Ollama."""
        return {
            "temperature": self.temperature,
            "top_p": self.top_p,
            "num_ctx": self.num_ctx,
            "repeat_penalty": self.repeat_penalty,
        }


# ==========================================
# 2. ABSTRACTION
# ==========================================
class LanguageModel(ABC):
    @abstractmethod
    def generate(self, prompt: str, config: Optional[ModelConfig] = None) -> str:
        pass


# ==========================================
# 3. IMPLÉMENTATION CONCRÈTE
# ==========================================
class OllamaModel(LanguageModel):
    def __init__(self, model_name: str):
        self.model_name = model_name

    def generate(self, prompt: str, config: Optional[ModelConfig] = None) -> str:
        try:
            active_config = config if config else ModelConfig()
            options = active_config.to_ollama_options()

            messages = []
            if active_config.system_prompt:
                messages.append(
                    {"role": "system", "content": active_config.system_prompt}
                )

            messages.append({"role": "user", "content": prompt})

            response = ollama.chat(
                model=self.model_name, messages=messages, options=options
            )
            return response.get("message", {}).get("content", "")

        except Exception as e:
            return f"Erreur lors de la génération : {str(e)}"


# ==========================================
# 4. INFERENCE SERVICE
# ==========================================
class InferenceService:
    def __init__(self, model: LanguageModel):
        self.model = model

    def run_query(self, prompt: str, config: Optional[ModelConfig] = None) -> str:
        return self.model.generate(prompt, config)


# ==========================================
# 5. SCRIPT DE TEST MODIFIÉ
# ==========================================
if __name__ == "__main__":
    # CORRECTION : On cible maintenant le modèle customisé avec l'adapter financier
    MODEL_NAME = "phi3.5-financial" 
    
    phi_model = OllamaModel(model_name=MODEL_NAME)
    ai_service = InferenceService(model=phi_model)

    # Configuration de production optimale : Précise et anti-boucle
    finance_expert_config = ModelConfig(
        temperature=0.2,  # Léger filet de sécurité au-dessus de 0 pour éviter le blocage
        repeat_penalty=1.2,
        system_prompt=(
            "Tu es un expert en ingénierie financière et analyse de risques. "
            "Tu réponds de manière purement analytique, factuelle, sans fioritures, "
            "en utilisant le jargon financier approprié."
        ),
    )

    finance_prompt = """
    Une entreprise souhaite contracter un emprunt à un taux d'intérêt de 4% pour financer un projet 
    dont la rentabilité économique (ROI) estimée est de 8%.
    
    1. Explique l'impact de ce différentiel sur la rentabilité des capitaux propres.
    2. Quels sont les principaux risques financiers associés ?
    """

    print(f"Génération du rapport avec le modèle validé : {MODEL_NAME}...")
    reponse = ai_service.run_query(finance_prompt, config=finance_expert_config)

    print("\n--- Réponse du modèle Phi 3.5 Financial ---")
    print(reponse)