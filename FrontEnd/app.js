// Déclare works et catégorie en tableau Set
const allWorks = new Set();
const allCategories = new Set();
// Permet de stocker le fichier
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

// Fonction qui récupère les informations de la BDD
async function getAllDatabaseInfo(type) {
    try {
        const response = await fetch("http://localhost:5678/api/" + type);
        if (!response.ok) throw new Error(`Erreur: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
    }
}

// Fonction pour afficher la modale
function modalFlex() {
    const edition = document.querySelector(`.edition`);
    const editBtn = document.querySelectorAll(".editBtn");

    edition.style.display = 'flex';
    login.innerText = 'logout';

    // Affichage des boutons de modification pour la modale
    for (const modifBtn of editBtn) {
        modifBtn.style.display = 'flex';
        modifBtn.addEventListener("click", (e) => {
            modal1.style.display = 'flex';
            modalContainer.style.display = 'flex';
        });
    }
}

// Affichage de la galerie dans la modale
function showWorksInModal() {
    worksContainer.innerHTML = "";  // Vide le contenu de la fenêtre modale
    allWorks.forEach((work) => {
        const figureModal = document.createElement("figure");
        figureModal.dataset.id = work.id;

        const figureImgModal = document.createElement("img");
        figureImgModal.src = work.imageUrl;
        figureImgModal.alt = work.title;

        const editButton = document.createElement("button");
        editButton.classList.add("editer");
        editButton.innerText = "Éditer";

        const delButton = document.createElement("button");
        delButton.classList.add("delete");
        delButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

        // Ajout d'un événement pour la suppression
        delButton.addEventListener("click", async (e) => {
            const figure = e.target.closest("figure");
            const id = figure.dataset.id;

            if (await confirmDelWork(id) === 204) {
                figure.remove(); // Supprime l'élément du DOM

                // Supprime le travail du Set allWorks
                allWorks.forEach((work) => {
                    if (work.id == id) {
                        allWorks.delete(work);
                    }
                });
            }
        });

        figureModal.append(figureImgModal, editButton, delButton);
        worksContainer.appendChild(figureModal);
    });
}

// Initialisation des chargements des projets
async function init() {
    try {
        const works = await getAllDatabaseInfo("works");
        for (const work of works) {
            allWorks.add(work);
        }
        const categories = await getAllDatabaseInfo("categories");
        for (const categorie of categories) {
            allCategories.add(categorie);
        }

        if (token) {
            modalFlex();
            showWorksInModal();
            setLogoutButton();
            getSelectCategory();
            initAddModale();
        } else {
            displayFilterButton();
        }
        genererWorks();
    } catch (error) {
        console.log(`Erreur lors du chargement des projets: ${error}`);
    }
}
init();

// Affichage des travaux de la BDD
function genererWorks(filtre = 0) {
    let filtredWorks = Array.from(allWorks);  // Convertit le Set en tableau

    if (filtre !== 0) {
        filtredWorks = filtredWorks.filter(work => work.categoryId == filtre);
    }

    const divGallery = document.querySelector(".gallery");
    divGallery.innerHTML = "";  // Vide la galerie

    filtredWorks.forEach(work => {
        const worksElement = document.createElement("figure");
        worksElement.id = `figure-${work.id}`;

        const imgElement = document.createElement("img");
        imgElement.src = work.imageUrl;
        imgElement.alt = work.title;

        const nameElement = document.createElement("figcaption");
        nameElement.textContent = work.title;

        worksElement.append(imgElement, nameElement);
        divGallery.appendChild(worksElement);
    });
}

// Fonctionnement des filtres
function displayFilterButton() {
    const divButtons = document.querySelector(".filtres");
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

// Permet de filtrer les travaux avec l'événement
function setFilterEvent() {
    const buttons = document.querySelectorAll(".filter");

    buttons.forEach(button => {
        button.addEventListener("click", (e) => {
            const clickedButton = e.target;
            const categoryId = parseInt(clickedButton.dataset.id);
            genererWorks(categoryId);
            document.querySelector(".active").classList.remove("active");
            clickedButton.classList.add("active");
        });
    });
}

// Fonction pour fermer les modales
function closeModals() {
    modal1.style.display = "none";
    modal2.style.display = "none";
    modalContainer.style.display = "none";
}

// Permet d'afficher et de gérer la navigation entre les modales
function RedirectionModale() {
    const addWork = document.querySelector(".addWork");
    addWork.addEventListener("click", () => {
        modal1.style.display = "none";
        modal2.style.display = "flex";
    });

    document.querySelector(".closeModal1").addEventListener("click", closeModals);
    document.querySelector(".closeModal2").addEventListener("click", closeModals);
}

RedirectionModale();

// Fermeture de la modale en cliquant à l'extérieur
window.addEventListener("click", function (e) {
    if (e.target === modalContainer) {
        closeModals();
    }
});

// Ajout d'un nouveau projet dans la BDD
function initAddModale() {
    const img = document.querySelector("#uploadImg");
    const closeImg = document.querySelector("#closeImg i");
    const labelUpload = document.querySelector("#sendImg label");

    img.addEventListener("change", (e) => {
        let tempFile = e.target.files[0];
        const fileTypes = ["image/jpg", "image/png"];
        let testFormat = fileTypes.includes(tempFile.type);

        if (testFormat && tempFile.size <= 4 * 1024 * 1024) {  // 4 Mo max
            const preview = document.querySelector("#preview");
            const imageUrl = URL.createObjectURL(tempFile);
            preview.src = imageUrl;

            file = tempFile;
            submitButton.style.background = "#1D6154";
            closeImg.style.display = "flex";
            labelUpload.style.display = "none";

            closeImg.addEventListener("click", () => {
                labelUpload.style.display = "flex";
                upTitle.value = "";
                img.value = "";
                preview.src = "";
                file = "";
            });
        } else {
            alert("Type de fichier incorrect ou taille supérieure à 4 Mo.");
        }
    });

    submitButton.addEventListener("click", async (e) => {
        e.preventDefault();

        if (file !== "" && upTitle.value !== "") {
            const formData = new FormData();
            formData.append("image", file);
            formData.append("title", upTitle.value);
            formData.append("category", selectCategory.value);

            const newWork = await AddWork(formData);
            if (newWork) {
                allWorks.add(newWork);
                showWorksInModal();
                genererWorks();
                closeModals();
            }
        } else {
            alert("Titre, Catégorie et Taille < 4 Mo requis.");
        }
    });
}

// Fonction pour ajouter un projet via une requête POST
async function AddWork(formData) {
    const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });
    if (response.ok) {
        return await response.json();
    }
}

// Fonction pour la suppression d'un travail
async function delWork(id) {
    const response = await fetch("http://localhost:5678/api/works/" + id, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.status;
}

// Confirmation de la suppression
async function confirmDelWork(workId) {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
        return await delWork(workId);
    }
}

// Fonction de déconnexion
function setLogoutButton() {
    const logout = document.getElementById("login");
    logout.textContent = "logout";
    logout.addEventListener("click", (e) => {
        e.preventDefault();
        sessionStorage.clear();
        window.location.reload();
    });
}
