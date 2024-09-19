// 1. Déclare works et catégories en tableaux
const allWorks = [];
const allCategories = [];
// Permet de stocker
let file = "";

const token = sessionStorage.getItem('accessToken');
const worksContainer = document.querySelector(`.worksContainer`);
const modalContainer = document.querySelector(".modalContainer");
const modal1 = document.querySelector(".modal1");
const modal2 = document.querySelector(".modal2");
const upTitle = document.getElementById(`titre`);
const selectCategory = document.getElementById("categorie");
const submitButton = document.querySelector(".valid");
const preview = document.querySelector("#preview");
const login = document.getElementById("login");
const divGallery = document.querySelector(".gallery"); 

function init() {
 
  if (token) {
    filterContainer.style.display = 'none'; 
  } else {
    filterContainer.style.display = 'flex'; 
  }
}

// 3. Fonction pour récupérer les données de la BDD
async function getAllDatabaseInfo(type) {
  const response = await fetch("http://localhost:5678/api/" + type);
  if (response.ok) {
    return response.json();
  } else {
    console.error(`Erreur lors de la récupération des ${type}:`, response.statusText);
    return [];
  }
}

// 4. Fonction pour gérer l'affichage en mode édition
function modalFlex() {
  const edition = document.querySelector('.edition');
  const editBtns = document.querySelectorAll('.editBtn');

  if (token) {
    edition.style.display = 'flex'; // Affiche la barre d'édition
    login.innerText = 'logout'; // Change le bouton en logout

    // Affiche tous les boutons d'édition et attache les écouteurs d'événements
    editBtns.forEach(btn => {
      btn.style.display = 'flex';
      btn.addEventListener('click', openModal);
    });
  } else {
    edition.style.display = 'none'; // Cache la barre d'édition
    login.innerText = 'login'; // Change le bouton en login

    // Cache tous les boutons d'édition
    editBtns.forEach(btn => {
      btn.style.display = 'none';
    });
  }
}

// 5. Fonction pour ouvrir la modale
function openModal() {
  modalContainer.style.display = 'flex';
  modal1.style.display = 'flex';
  showWorksInModal(); // Met à jour la galerie dans la modale
}

// 6. Fonction pour afficher la galerie dans la modale
function showWorksInModal() {
  worksContainer.innerHTML = "";
  allWorks.forEach((work) => {
    // Créer l'élément figure
    const figureModal = document.createElement("figure");
    figureModal.classList.add("figure-modal"); // Ajouter une classe pour le styliser

    // Créer l'image
    const figureImgModal = document.createElement("img");
    figureImgModal.src = work.imageUrl;
    figureImgModal.alt = work.title;
    figureImgModal.classList.add("modal-image"); // Ajouter une classe pour le styliser

    // Créer le figcaption
    const figcaption = document.createElement("figcaption");
    figcaption.textContent = "éditer";

    // Créer l'icône de la poubelle
    const trashIcon = document.createElement("i");
    trashIcon.classList.add("material-symbols-outlined", "trash-icon");
    trashIcon.textContent = "delete";

    // Positionner l'icône de la poubelle en haut à droite de l'image
    trashIcon.style.position = "absolute";
    trashIcon.style.top = "5px";
    trashIcon.style.right = "5px";
    trashIcon.style.cursor = "pointer";

    // Ajouter un événement pour la suppression
    trashIcon.addEventListener("click", () => {
      if (confirm("Voulez-vous vraiment supprimer cette image ?")) {
        fetch(`http://localhost:5678/api/works/${work.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`, // Assurez-vous que le token est défini
            'Content-Type': 'application/json',
          },
        })
          .then(response => {
            if (response.ok) {
              console.log('Image supprimée du serveur.');

              // Supprimer l'élément du DOM (de la modale)
              figureModal.remove();

              // Supprimer l'élément du tableau allWorks
              const index = allWorks.findIndex(item => item.id === work.id);
              if (index !== -1) {
                allWorks.splice(index, 1);

                // Régénérer la galerie principale
                genererWorks();
              }
            } else {
              console.error('Erreur lors de la suppression sur le serveur.');
            }
          })
          .catch(error => {
            console.error('Erreur réseau :', error);
          });
      }
    });

    // Assembler les éléments dans la figure
    figureModal.appendChild(figureImgModal);
    figureModal.appendChild(trashIcon); // Ajouter l'icône de la poubelle
    figureModal.appendChild(figcaption);

    // Ajouter la figure au conteneur
    worksContainer.appendChild(figureModal);
  });
}

// 7. Fonction pour initialiser l'application
async function init() {
  try {
    // Récupération des données
    const works = await getAllDatabaseInfo("works");
    works.forEach(work => allWorks.push(work)); // Utiliser push au lieu de add

    const categories = await getAllDatabaseInfo("categories");
    categories.forEach(categorie => allCategories.push(categorie)); // Utiliser push

    // Gestion de l'affichage en mode édition
    modalFlex();

    // Gestion spécifique si l'utilisateur est connecté
    if (token) {
      getSelectCategory();
      initAddModale();
      initModalNavigation();
      // Afficher les boutons de filtre même si l'utilisateur est connecté
      displayFilterButton();
    } else {
      displayFilterButton();
    }

    // Affichage des travaux
    genererWorks();
  } catch (error) {
    console.error(`Erreur lors de l'initialisation: ${error}`);
  }
}
init();

// 8. Fonction pour afficher les travaux
function genererWorks(filtre = 0) {
  divGallery.innerHTML = ""; // Vider la galerie existante
  const filtredWorks = filtre
    ? allWorks.filter(work => work.categoryId === filtre)
    : allWorks;

  filtredWorks.forEach(work => {
    const worksElement = document.createElement("figure");
    worksElement.id = "figure-" + work.id;

    const imgElement = document.createElement("img");
    imgElement.src = work.imageUrl;
    imgElement.alt = work.title;
    imgElement.classList.add("gallery-image");

    const nameElement = document.createElement("figcaption");
    nameElement.textContent = work.title;

    worksElement.appendChild(imgElement);
    worksElement.appendChild(nameElement);
    divGallery.appendChild(worksElement);
  });
}

// 9. Fonction pour afficher les boutons de filtre
function displayFilterButton() {
  const divButtons = document.querySelector(".filtres");
  divButtons.innerHTML = ""; // Nettoie les boutons existants
  const fragment = document.createDocumentFragment();

  const allFilter = document.createElement("div");
  allFilter.classList.add("active", "filter");
  allFilter.dataset.id = 0;
  allFilter.textContent = "Tous";
  fragment.appendChild(allFilter);

  allCategories.forEach(categorie => {
    const filterButton = document.createElement("div");
    filterButton.classList.add("filter");
    filterButton.dataset.id = categorie.id;
    filterButton.textContent = categorie.name;
    fragment.appendChild(filterButton);
  });

  divButtons.appendChild(fragment);
  setFilterEvent();
}

// 10. Fonction pour gérer les événements de filtre
function setFilterEvent() {
  const buttons = document.querySelectorAll(".filter");

  buttons.forEach(button => {
    button.addEventListener("click", (e) => {
      const clickedButton = e.target;
      const categoryId = parseInt(clickedButton.dataset.id);
      genererWorks(categoryId);

      document.querySelector(".filter.active").classList.remove("active");
      clickedButton.classList.add("active");
    });
  });
}

// 11. Gestion de la déconnexion
login.addEventListener("click", function (e) {
  if (token) {
    e.preventDefault();
    sessionStorage.removeItem("accessToken");
    window.location.reload();
  }
});

// 12. Fonction pour récupérer les catégories dans le formulaire
function getSelectCategory() {
  selectCategory.innerHTML = ""; // Vide les options existantes
  allCategories.forEach(categorie => {
    const option = document.createElement("option");
    option.textContent = categorie.name;
    option.value = categorie.id;
    selectCategory.appendChild(option);
  });
}

// 13. Fonction pour initialiser la modale d'ajout
function initAddModale() {
  const imgInput = document.querySelector("#uploadImg");
  const closeImg = document.querySelector("#closeImg i");
  const labelUpload = document.querySelector("#sendImg label");
  const addImgDiv = document.querySelector(".addImg");

  imgInput.addEventListener("change", (e) => {
    let tempFile = e.target.files[0];
    const fileTypes = ["image/jpg", "image/jpeg", "image/png"];
    let testFormat = fileTypes.includes(tempFile.type);

    if (testFormat) {
      if (tempFile.size <= 4 * 1024 * 1024) { // 4Mo
        const imageUrl = URL.createObjectURL(tempFile);
        preview.src = imageUrl;
        preview.style.display = "block"; // Affiche l'image
        file = tempFile;

        submitButton.style.backgroundColor = '#1D6154';
        closeImg.style.display = 'block';
        labelUpload.style.display = 'none';
        addImgDiv.style.background = 'none';

        closeImg.addEventListener("click", resetForm);
      } else {
        alert("Taille incorrecte. 4Mo max");
        resetForm();
      }
    } else {
      alert("Format incorrect. PNG/JPG attendu");
      resetForm();
    }
  });

  function resetForm() {
    labelUpload.style.display = 'block';
    preview.src = "";
    preview.style.display = "none";
    file = "";
    imgInput.value = "";
    submitButton.style.backgroundColor = '#A7A7A7';
    closeImg.style.display = 'none';
    addImgDiv.style.background = '#E8F1F6';
  }

  // Requête POST pour ajouter un nouveau travail
  submitButton.addEventListener("click", async (e) => {
    e.preventDefault();
    if (file && upTitle.value.trim()) {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("title", upTitle.value.trim());
      formData.append("category", selectCategory.value);

      const newWork = await AddWork(formData);
      if (newWork) {
        modal2.style.display = 'none';
        modalContainer.style.display = 'none';
        alert("Votre projet a bien été ajouté.");
        allWorks.push(newWork); // Utiliser push au lieu de add
        genererWorks();
        resetForm();
        upTitle.value = "";
        showWorksInModal(); // Met à jour la galerie dans la modale
      }
    } else {
      alert("Veuillez remplir tous les champs et ajouter une image.");
    }
  });
}

// 14. Fonction pour naviguer entre les modales
function initModalNavigation() {
  const addWorkButton = document.querySelector(".addWork");
  const closeModal1 = document.querySelector(`.closeModal1`);
  const closeModal2 = document.querySelector(`.closeModal2`);
  const backButton = document.querySelector(`.back`);

  addWorkButton.addEventListener("click", () => {
    modal1.style.display = 'none';
    modal2.style.display = 'flex';
  });

  closeModal1.addEventListener("click", closeModal);
  closeModal2.addEventListener("click", closeModal);
  backButton.addEventListener("click", () => {
    modal2.style.display = 'none';
    modal1.style.display = 'flex';
  });
}

// 15. Fonction pour fermer la modale
function closeModal() {
  modalContainer.style.display = 'none';
  modal1.style.display = 'none';
  modal2.style.display = 'none';
}

// 16. Fermeture de la modale en cliquant en dehors
window.addEventListener("click", function (e) {
  if (e.target === modalContainer) {
    closeModal();
  }
});

// 17. Fonction pour supprimer un travail
async function delWork(id) {
  const response = await fetch("http://localhost:5678/api/works/" + id, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.status;
}

// 18. Fonction pour ajouter un travail
async function AddWork(formData) {
  const response = await fetch("http://localhost:5678/api/works", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (response.ok) {
    return response.json();
  } else {
    alert("Erreur lors de l'ajout du projet");
    return null;
  }
}

// 19. Fonction de confirmation pour suppression
function confirmDelWork(workId) {
  return confirm("Êtes-vous sûr de vouloir supprimer ce projet ?");
}

