const token = sessionStorage.accessToken;
const worksContainer = document.querySelector(`.worksContainer`);
const modalContainer = document.querySelector(".modalContainer");
const pushModal = document.querySelector(".publier");
const modal1 = document.querySelector(".modal1");

const modal2 = document.querySelector(".modal2");
const upTitle = document.getElementById(`titre`);
const selectCategory = document.getElementById("categorie");
const submitButton = document.querySelector(".valid");

// Sélectionne les éléments nécessaires
const openModalBtns = document.querySelectorAll(".editBtn"); 
const closeModalBtn = modal1.querySelector(".closeModal2"); // Bouton pour fermer la modale

// Ouvre la modale quand un bouton "Modifier" est cliqué
openModalBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    modal1.style.display = "block";
  });
});

// Ferme la modale quand l'utilisateur clique sur la croix
closeModalBtn.addEventListener("click", () => {
  modal1.style.display = "none";
});

// Ferme la modale quand l'utilisateur clique en dehors de la modale
window.addEventListener("click", (event) => {
  if (event.target == modal1) {
    modal1.style.display = "none";
  }
});
