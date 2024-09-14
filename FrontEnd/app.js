//1 Déclare works et catégorie en tableau Set
const allWorks = new Set();
const allCategories = new Set();
// Permet de stocker
let file = "";

const token = sessionStorage.accessToken;
const worksContainer = document.querySelector(`.worksContainer`);
const modalContainer = document.querySelector(".modalContainer");
const pushModal = document.querySelector(".publier");
const modal1 = document.querySelector(".modal1");

const modal2 = document.querySelector(".modal2");
const upTitle = document.getElementById(`titre`);
const selectCategory = document.getElementById("categorie");
const submitButton = document.querySelector(".valid");

//2 fonction qui récupére les info de la bdd
async function getAllDatabaseInfo(type) {
  //on enregistre dans une letiable la réponse de la bdd que l'on a attendu
  const response = await fetch("http://localhost:5678/api/" + type);
  // si il n'ya aucune erreur, on renvoie le contenu de la réponse
  if (response.ok) {
    return response.json();
    //si une erreur est présente, on l'affiche dans le log et on ne fait rien
  } else {
    console.log(response.error);
  }
}

//3 Function flex pour la modale
function modalFlex() {
  const edition = document.querySelector(`.edition`);
  const editBtn = document.querySelectorAll(".editBtn");

  edition.style = `display : flex`;
  login.innerText = `logout`;

  //4 Afichage btn modif pour modal
  for (const modifBtn of editBtn) {
    modifBtn.style = "display : flex";
    modifBtn.addEventListener("click", (e) => {
      modal1.style.display = `flex`;
      modalContainer.style = `display : flex`;
    });
  }
}

// 5 Function affichage galérie modale
function showWorksInModal() {
  //Vide le contenu de la fenêtre modale
  worksContainer.innerHTML = "";
  // Pour chaque travail je :
  allWorks.forEach((work) => {
    const figureModal = document.createElement(`figure`);
    const figureImgModal = document.createElement(`img`);
    const editButton = document.createElement(`button`);
    const delButton = document.createElement(`button`);

    // récupère l'image et le titre
    figureModal.dataset.id = work.id;
    figureImgModal.src = work.imageUrl;
    figureImgModal.alt = work.title;
    editButton.innerText = `éditer`;
    editButton.classList.add(`editer`);
    delButton.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
    delButton.classList.add(`delete`);

    // Ajout d'un event pour la suppression
    delButton.addEventListener("click", async (e) => {
      const figure = e.target.closest("figure");
      const id = figure.dataset.id;
      const isDelete = await confirmDelWork(id);
console.log(isDelete)
      if (isDelete) {
        const deleteStatus = await delWork(id);
        console.log(deleteStatus)

        // chaque cas ... un code d'erreur différent
        switch (deleteStatus) {
          case 204:
            figure.remove();
            const galleryFigure = document.querySelector("#figure-" + id);
            galleryFigure.remove();

            // Permet de supp l'img dans le Set
            for (const work of allWorks) {
              if (work.id == id) {
                allWorks.delete(work);
                break;
              }
            }
            break;
          case 401:
            alert("accès non autorisé");
            break;
          case 500:
            alert("problème de serveur, veuillez réesayez plus tard");
            break;
          case "abort":
            alert("opération annulé");
            break;
          default:
            alert("cas imprévu :" + deleteStatus);
            break;
        }
      }
    });

    worksContainer.appendChild(figureModal);
    figureModal.append(figureImgModal, editButton, delButton);
  });
}

// ** Ininitialisation de chargements des projets ** /
async function init() {
  try {
    // initialisation des 2 tableau SET en appelant la base de données et enregistrant les info une par une
    const works = await getAllDatabaseInfo("works");
    for (const work of works) {
      allWorks.add(work);
    }
    const categories = await getAllDatabaseInfo("categories");
    for (const categorie of categories) {
      allCategories.add(categorie);
    }

    //Modal
    if (token) {
      // ** Affichage modal ** //
      modalFlex();
      // ** Affichage galérie ** //
      showWorksInModal();
      // ** Permet de se déloguer ** //
      setLogoutButton();
      // ** Permet de selectionner les Cat ** //
      getSelectCategory();
      // ** Permet d'ajouté un Work ** //
      initAddModale();
    } else {
      displayFilterButton();
    }
    genererWorks();
  } catch (error) {
    console.log(
      `Erreur chargement Fonction init cartes des projets:  ${error}`
    );
  }
}
init();

// 7 Permet d'afficher les Works de la Bdd //
function genererWorks(filtre = 0) {
  // On initialise une letiable "filtredWorks" avec tous les travaux
  let filtredWorks = allWorks;
  // Si un filtre est sélectionné, on filtre les travaux en fonction de la catégorie sélectionnée
  if (filtre != 0) {
    // On utilise la méthode "filter" pour filtrer les travaux en fonction de la catégorie sélectionnée
    filtredWorks = [...allWorks].filter((work) => work.categoryId == filtre);
  }

  // On récupère l'élément du DOM qui accueillera les fiches
  const divGallery = document.querySelector(".gallery");
  // On vide le contenu de la div
  divGallery.innerHTML = "";

  // On boucle sur tous les travaux filtrés
  for (const filtredWork of filtredWorks) {
    // On crée une letiable "work" pour stocker le travail actuel
    const work = filtredWork;
    // On crée une balise "figure" pour chaque travail
    const worksElement = document.createElement("figure");
    worksElement.id = "figure-" + work.id;

    // On crée une balise "img" pour l'image du travail
    const imgElement = document.createElement("img");
    imgElement.src = work.imageUrl;
    imgElement.alt = work.title;

    // On crée une balise "figcaption" pour le titre du travail
    const nameElement = document.createElement("figcaption");
    nameElement.textContent = work.title;

    // On ajoute la balise "figure" à la div "gallery"
    divGallery.appendChild(worksElement);
    // On ajoute la balise "img" à la balise "figure"
    worksElement.appendChild(imgElement);
    // On ajoute la balise "figcaption" à la balise "figure"
    worksElement.appendChild(nameElement);
  }
}
// Fonctionnement des filtres //
function displayFilterButton() {
  // On cherche l'élément HTML avec la classe "filtres"
  const divButtons = document.querySelector(".filtres");
  // On crée un fragment de document pour y ajouter les boutons
  const fragment = document.createDocumentFragment();

  // On crée un bouton "Tous" qui est activé par défaut
  const allFilter = document.createElement("div");
  allFilter.classList.add("active");
  allFilter.classList.add("filter");
  allFilter.dataset.id = 0;
  allFilter.textContent = "Tous";
  // On ajoute le bouton "Tous" au fragment
  fragment.appendChild(allFilter);

  // On crée un bouton pour chaque catégorie dans la liste "allCategories"
  for (const categorie of allCategories) {
    const filterButton = document.createElement("div");
    filterButton.classList.add("filter");
    filterButton.dataset.id = categorie.id;
    filterButton.textContent = categorie.name;
    // On ajoute chaque bouton de catégorie au fragment
    fragment.appendChild(filterButton);
  }

  // On ajoute le fragment complet à l'élément HTML avec la classe "filtres"
  divButtons.appendChild(fragment);

  // On appelle la fonction "setFilterEvent" pour ajouter des écouteurs d'événements aux boutons de filtre
  setFilterEvent();
}
// ** Permet de filtrer les Works avec l'event ** //
function setFilterEvent() {
  // Récupère tous les boutons de filtre
  const buttons = document.querySelectorAll(".filter");

  // Ajoute un écouteur d'événements à chaque bouton de filtre
  for (const button of buttons) {
    button.addEventListener("click", (e) => {
      // Récupère le bouton qui a été cliqué
      const clickedButton = e.target;

      // Récupère l'ID de la catégorie associée au bouton cliqué
      const categoryId = parseInt(clickedButton.dataset.id);

      // Génère les travaux correspondant à la catégorie sélectionnée
      genererWorks(categoryId);

      // Supprime la classe 'active' du bouton qui était actif précédemment
      document.querySelector(".active").classList.remove("active");

      // Ajoute la classe 'active' au bouton qui a été cliqué
      clickedButton.classList.add("active");
    });
  }
}
//**************************************************************** */
// Permet d'appuyer et d'afficher la modale
pushModal.addEventListener("click", () => {
  modalContainer.style = `display : flex`;
  modal1.style.display = `flex`;
});
// -- Permet de passer de la modal 1 à 2
function RedirectionModale() {
  const addWork = document.querySelector(".addWork");
  addWork.addEventListener("click", () => {
    modal1.style.display = `none`;
    modal2.style.display = "flex";
  });

  const closeModal1 = document.querySelector(`.closeModal1`);

  closeModal1.addEventListener("click", () => {
    modal2.style.display = `none`;
    modal1.style.display = `none`;
    modalContainer.style = `display : none`;
  });
  const closeModal2 = document.querySelector(`.closeModal2`);

  closeModal2.addEventListener("click", () => {
    modal2.style.display = `none`;
    modal1.style.display = `none`;
    modalContainer.style = `display : none`;
  });
}

// -- Test modal 2 ----
function closeEvent() {}
if (modal2) {
  // PAssage de la modale 1 à 2 //
  RedirectionModale();
  // --- Flèche retour ---//
  const back = document.querySelector(`.back`);
  // Flèche permetant de sortir de la modale //
  back.addEventListener("click", () => {
    modal1.style.display = `flex`;
    modal2.style.display = `none`;
  });
  closeEvent();
}

// --- Récupération dynamique des catégories pour ajout de projet ---
function getSelectCategory() {
  // Récupère l'élément HTML 'select' avec l'ID 'categorie'
  const selectCategory = document.getElementById("categorie");

  // Parcourt toutes les catégories disponibles
  for (const categorie of allCategories) {
    // Crée un nouvel élément HTML 'option'
    const option = document.createElement("option");

    // Définit le texte affiché dans l'option comme le nom de la catégorie
    option.textContent = categorie.name;

    // Définit la valeur de l'option comme l'ID de la catégorie
    option.value = categorie.id;

    // Ajoute l'option au select
    selectCategory.appendChild(option);
  }
}

function initAddModale() {
  // Récupère l'élément HTML avec l'ID 'uploadImg'
  const img = document.querySelector("#uploadImg");
  const closeImg = document.querySelector("#closeImg i");
  const labelUpload = document.querySelector("#sendImg label");

  // Ajoute un écouteur d'événements 'change' sur l'élément img
  img.addEventListener("change", (e) => {
    // Récupère le fichier sélectionné
    let tempFile = e.target.files[0];

    // Définit les types de fichiers autorisés
    const fileTypes = ["image/jpg", "image/jpeg", "image/png"];
    let testFormat = false;

    // Vérifie si le type de fichier sélectionné est autorisé
    for (let i = 0; i < fileTypes.length; i++) {
      if (tempFile.type === fileTypes[i]) {
        testFormat = true;
      }
    }

    // Si le type de fichier est autorisé
    if (testFormat) {
      // Vérifie si la taille du fichier est inférieure ou égale à 4Mo
      if (tempFile.size <= 1024 * 1024 * 1024) {
        // Récupère l'élément HTML avec l'ID 'preview'
        const preview = document.querySelector("#preview");

        // Crée une URL pour l'image sélectionnée
        const imageUrl = URL.createObjectURL(tempFile);

        // Définit l'URL de l'image sélectionnée comme source de l'élément 'preview'
        preview.src = imageUrl;

        // Définit le fichier sélectionné comme letiable globale
        file = tempFile;

        submitButton.style = `background : #1D6154`;
        // Fait apparaitre la croix pour supprimer l'image
        closeImg.style = `display : flex`;
        // Permet de faire disparaitre le label depassant
        labelUpload.style = `display : none`;
        // Reset le formulaire
        closeImg.addEventListener("click", () => {
          labelUpload.style = `display : flex`;
          upTitle.value = "";
          uploadImg.files[0] = "";
          preview.src = "";
          file = "";
        });
      } else {
        // Si la taille du fichier est supérieure à 4Mo, affiche une alerte
        return alert("taille incorrect 4mo max");
      }
    } else {
      // Si le type de fichier n'est pas autorisé, affiche une alerte
      return alert("ce format est incorrect PNG/JPG attendu");
    }
  });

  // --- Requete POST pour envoyer un nouveau work ---
  submitButton.addEventListener("click", async (e) => {
    //permet d'éviter la page de s'ouvrir
    e.preventDefault();
    // Création d'un objet FormData et ajout des données du formulaire
    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", upTitle.value);
    formData.append("category", selectCategory.value);
    // Vérification si l'utilisateur a ajouté une image et un titre
    if (file != "" && upTitle != "") {
      modal2.style.display = `none`;
      modal1.style.display = `flex`;
      alert("Votre projet à bien été ajouté ");
      // Ajout du nouveau travail à la liste de travaux
      const newWork = await AddWork(formData);
      allWorks.add(newWork);
      // Rappel des fonctions pour les Works
      showWorksInModal();
      genererWorks();
      // Réinitialisation du formulaire
      upTitle.value = "";
      uploadImg.files[0] = "";
      preview.src = "";
      file = "";
      URL.revokeObjectURL(file);
    } else {
      // Création d'un élément contenant un message d'erreur
      const error = document.createElement("p");
      error.innerText = "Titre, Catégorie, Taille < 4Mo requis";
      error.style.textAlign = `center`;
      error.style.color = `red`;
      // Affichage du message d'erreur
      sendImg.appendChild(error);
    }
  });
}

// Cette fonction permet à l'utilisateur de se déconnecter
function setLogoutButton() {
  // Récupère l'élément HTML avec l'id "login"
  const logout = document.getElementById(`login`);
  // Modifie le texte de l'élément "login" pour afficher "logout"
  logout.textContent = "logout";
  // Ajoute un événement de clic à l'élément "login"
  logout.addEventListener("click", (e) => {
    // Empêche le comportement par défaut de l'événement
    e.preventDefault();
    // Efface toutes les données de session stockées dans le navigateur
    sessionStorage.clear();
    // Recharge la page
    window.location.reload();
  });
}

// --- Fermeture de la modale ---
window.addEventListener("click", function (e) {
  if (e.target === modalContainer) {
    modalContainer.style.display = "none";
    modal2.style.display = `none`;
  }
});
// --- Suppression du token si logout ---
login.addEventListener("click", function () {
  if (token) {
    location.href = "http://" + location.hostname + ":5500/index.html";
    sessionStorage.removeItem("accessToken");
    //location.reload();
  }
});

// Cette fonction supprime un travail en envoyant une requête DELETE à l'API
async function delWork(id) {
  // Envoie une requête DELETE à l'API pour supprimer le travail avec l'ID spécifié
  const response = await fetch("http://localhost:5678/api/works/" + id, {
    method: "DELETE",
    headers: {
      // Ajoute l'en-tête d'autorisation avec le jeton d'accès
      Authorization: `Bearer ${token}`,
    },
  });
  // Affiche la réponse dans la console
  console.log(response);
  // Renvoie le code d'état de la réponse
  return response.status;
}

// Cette fonction ajoute un travail en envoyant une requête POST à l'API
async function AddWork(formData) {
  // Envoie une requête POST à l'API pour ajouter un travail
  const response = await fetch("http://localhost:5678/api/works", {
    method: "POST",
    headers: {
      // Ajoute l'en-tête d'autorisation avec le jeton d'accès
      Authorization: `Bearer ${token}`,
    },
    // Ajoute les données du formulaire à la requête
    body: formData,
  });
  // Si la réponse est OK, renvoie les données JSON de la réponse
  if (response.ok) {
    return response.json();
  }
}

// ** Confirmation pour suppression ** //
async function confirmDelWork(workId) {
  return confirm("Êtes-vous sûr de vouloir supprimer ce projet ?");
}

