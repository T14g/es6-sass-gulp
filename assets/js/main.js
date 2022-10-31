const toggleDiametro = () => {
  const selectDiametro = document.querySelector(".select-diametro");
  const selectLargura = document.querySelector(".select-largura");
  const selectComprimento = document.querySelector(".select-comprimento");

  if (selectDiametro && selectDiametro.style.display === "none") {
    selectDiametro.style.display = "block";
    selectLargura.style.display = "none";
    selectComprimento.style.display = "none";
  } else {
    selectDiametro.style.display = "none";
    selectLargura.style.display = "block";
    selectComprimento.style.display = "block";
  }
};

document.getElementById("checkboxRedondas").addEventListener("change", () => {
  toggleDiametro();
});
