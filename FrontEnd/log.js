// Sélectionne le formulaire et ajoute un écouteur d'événements pour la soumission
const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Récupère l'e-mail et le mot de passe entrés par l'utilisateur
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // Vérifie que l'email et le mot de passe ne sont pas vides
  if (!email || !password) {
    displayError("L'email et le mot de passe doivent être renseignés.");
    return;
  }

  try {
    // Affiche un indicateur de chargement
    toggleLoading(true);

    // Envoie une requête POST à l'API pour se connecter avec les informations d'identification de l'utilisateur
    const response = await fetch("http://localhost:5678/api-docs/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // Si la réponse est réussie
    if (response.ok) {
      const data = await response.json();
      sessionStorage.setItem("accessToken", data.token);
      window.location.href = "index.html"; 
    } else {
      // Gestion des erreurs spécifiques en fonction du code d'erreur
      if (response.status === 401) {
        displayError("Identifiant ou mot de passe incorrect.");
      } else {
        displayError("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  } catch (error) {
    // Gestion des erreurs réseau ou autres exceptions
    displayError("Erreur réseau. Veuillez vérifier votre connexion.");
  } finally {
    // Désactive l'indicateur de chargement
    toggleLoading(false);
  }
});

// Fonction pour afficher les messages d'erreur
function displayError(message) {
  const connexion = document.querySelector("div");
  const error = document.createElement("p");
  error.innerText = message;
  error.style.textAlign = "center";
  error.style.color = "red";
  error.style.marginBottom = "15px";

  // Supprime les anciens messages d'erreur s'ils existent
  const existingError = connexion.querySelector("p");
  if (existingError) {
    existingError.remove();
  }

  // Insère le message d'erreur
  connexion.insertBefore(error, connexion.lastElementChild);
}

// Fonction pour gérer l'affichage de l'indicateur de chargement
function toggleLoading(isLoading) {
  const submitButton = form.querySelector('button[type="submit"]');
  if (isLoading) {
    submitButton.disabled = true;
    submitButton.innerText = "Connexion en cours...";
  } else {
    submitButton.disabled = false;
    submitButton.innerText = "Se connecter";
  }
}
