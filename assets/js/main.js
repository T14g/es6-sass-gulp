const TRAY_URL = "https://www.mesachiq.com.br/web_api/products";
const VARIANTS_URL = "https://www.mesachiq.com.br/web_api/products/variants";

const enableSearch = () =>
  (document.getElementById("btn-filtro-buscar").disabled = false);

const disableSearch = () =>
  (document.getElementById("btn-filtro-buscar").disabled = true);

const showLoadMore = () =>
  document.getElementById("btn-load-more").classList.remove("hidden-btn");

const hideLoadMore = () =>
  document.getElementById("btn-load-more").classList.add("hidden-btn");

const enableLoadMore = () =>
  (document.getElementById("btn-load-more").disabled = false);

const disableLoadMore = () =>
  (document.getElementById("btn-load-more").disabled = true);

const toggleSearch = () => {
  if (!validateSearch()) {
    disableSearch();
  } else {
    enableSearch();
  }
};

const toggleDiametro = () => {
  const selectDiametro = document.querySelector(".select-diametro");
  const selectLargura = document.querySelector(".select-largura");
  const selectComprimento = document.querySelector(".select-comprimento");

  if (selectDiametro && selectDiametro.classList.contains("hidden-select")) {
    selectDiametro.classList.remove("hidden-select");
    selectLargura.classList.add("hidden-select");
    selectComprimento.classList.add("hidden-select");
  } else {
    selectDiametro.classList.add("hidden-select");
    selectLargura.classList.remove("hidden-select");
    selectComprimento.classList.remove("hidden-select");
  }
};

const getURL = () => {
  let url = VARIANTS_URL;
  const filterOne = getLargura();
  const filterTwo = getComprimento();
  const filterThree = getDiametro();
  console.log(filterOne);
  console.log(filterTwo);
  console.log(filterThree);

  if (filterThree !== "") {
    url += `?type_1=Diametro&value_1=${filterThree}`;
  } else {
    if (filterOne !== "") {
      url += `?type_1=Largura&value_1=${filterOne}`;

      if (filterTwo !== "") {
        url += `&type_2=Comprimento&value_2=${filterTwo}`;
      }
    } else {
      if (filterTwo !== "") {
        url += `?type_2=Comprimento&value_2=${filterTwo}`;
      }
    }
  }

  return url;
};
const getLargura = () => document.querySelector(".select-largura").value;

const getComprimento = () =>
  document.querySelector(".select-comprimento").value;

const getDiametro = () => document.querySelector(".select-diametro").value;

document
  .getElementById("checkboxRedondas")
  .addEventListener("change", toggleDiametro);

document
  .getElementById("btn-filtro-buscar")
  .addEventListener("click", () => fetchProducts());

document
  .getElementById("select-largura")
  .addEventListener("change", toggleSearch);

document
  .getElementById("select-comprimento")
  .addEventListener("change", toggleSearch);

document.getElementById("select-diametro").addEventListener("change", () => {
  toggleSearch();
});

const validateSearch = () => {
  let valid = false;

  if (getLargura() !== "") {
    valid = true;
  }

  if (getComprimento() !== "") {
    valid = true;
  }

  if (getDiametro() !== "") {
    valid = true;
  }

  return valid;
};

const getParentsURLS = (data) => {
  const urls = [];

  data.forEach((prod) => {
    urls.push(TRAY_URL + "/" + prod.prod_id);
  });

  return urls;
};

const setParentData = (data, prods) => {
  data.forEach((prod) => {
    prods.forEach((p) => {
      if (p.prod_id === prod.Product.id) {
        p.name = prod.Product.name;
        p.available = prod.Product.available;
      }
    });
  });
};

const getProductList = (data) => {
  const prods = [];
  console.log(data);
  data.forEach((variant) => {
    let item = {};
    item.prod_id = variant.Variant.product_id;
    item.img = variant.Variant.VariantImage[0]?.https;
    item.name = "";
    item.url = variant.Variant.url.https;
    item.price = variant.Variant.price;
    item.available = "";
    prods.push(item);
  });

  return prods;
};

const fetchProducts = () => {
  fetch(getURL())
    .then((result) => result.json())
    .then((data) => {
      const { Variants } = data;
      const prods = getProductList(Variants);
      const urls = getParentsURLS(prods);
      // setRequestsCount(requestsCount + urls.length + 1);
      // console.log(urls);
      Promise.all(
        urls.map((url) =>
          fetch(url).then((result) => {
            return result.json();
          })
        )
      ).then((data) => {
        setParentData(data, prods);
        renderProducts(prods);
      });
    });
};

const renderProducts = (data) => {
  let html = ``;
  let productsListEl = document.getElementById("filtered-products-list");

  if (data.length > 0) {
    enableLoadMore();
    showLoadMore();
  } else {
    hideLoadMore();
    disableLoadMore();
  }

  data.forEach((item) => {
    html += `
    <div class="filter-product-single">
      <a href="${item.url}" target="_blank">
        <img src="${item.img}" />
        <div className="name">${item.url}</div>
        ${
          item.available
            ? `<div className="price">A Partir de R$ ${item.price}</div>`
            : `<div className="available">Indisponível</div>`
        }
      </a>
    </div>
    `;
  });

  productsListEl.innerHTML = html;
};
