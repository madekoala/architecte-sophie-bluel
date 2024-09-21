console.log("je suis sur la home" + Date.now());
const button = document.querySelector(".ouvrir");
const modalContainer = document.querySelector(".modalContainer");
const modal3 = document.querySelector(".modal3");
const toto = document.querySelector(".toto");
const testboutton = document.querySelector(".testboutton");

testboutton.addEventListener("click", handleDelete);
button.addEventListener("click", showWorksInModal);
async function showWorksInModal() {
  modalContainer.style.display = "flex";
  modal3.style.display = "flex";
  // Retirer l'ancien événement s'il existe
  toto.removeEventListener("click", handleDelete);
  // Ajouter le nouvel événement
  toto.addEventListener("click", handleDelete);
}
function handleDelete(event) {
  event.preventDefault();
  event.stopPropagation();
  if (confirm("Voulez-vous vraiment supprimer cette image ?")) {
    fetch(`http://localhost:5678/api/works/5`, {
      method: "DELETE",
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcyNjc2NDc2MywiZXhwIjoxNzI2ODUxMTYzfQ.bEecrVoNOFRHp7V1Dj49GQH8Z9bGq4qfp49jCE5SAoU",
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          console.log("Image supprimée du serveur.");
        } else {
          console.error("Erreur lors de la suppression sur le serveur.");
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la requête :", error);
      });
  }
}
