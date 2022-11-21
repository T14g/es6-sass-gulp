const TRAY_URL = "https://www.mesachiq.com.br/web_api/products";
const VARIANTS_URL = "https://www.mesachiq.com.br/web_api/products/variants";
let FILTER_CURRENT_PAGE = 0;
let FILTER_PRODUCTS_ARRAY = [];
let FILTER_REQUEST_COUNT = 0;
let FILTER_TIMEOUT_RESET;

const startRequestReset = () =>
  setInterval(() => {
    FILTER_REQUEST_COUNT = 0;
    clearTimeout(FILTER_TIMEOUT_RESET);
  }, 60000);

const showLoadMore = () =>
  document.getElementById("btn-load-more").classList.remove("hidden-btn");

const hideLoadMore = () =>
  document.getElementById("btn-load-more").classList.add("hidden-btn");

const setDisabled = (id) => (document.getElementById(id).disabled = true);

const unsetDisabled = (id) => (document.getElementById(id).disabled = false);

const showErrorMessage = () =>
  document
    .getElementById("new-filter-error-message")
    .classList.remove("hidden");

const hideErrorMessage = () =>
  document.getElementById("new-filter-error-message").classList.add("hidden");

const hideUnavailableProducts = () =>
  document
    .getElementById("filtered-products-list")
    .classList.add("hide-unavailable");

const showUnavailableProducts = () =>
  document
    .getElementById("filtered-products-list")
    .classList.remove("hide-unavailable");

const setFilterNoResults = () =>
  document.getElementById("filtered-products-list").classList.add("no-results");

const unsetFilterNoResults = () =>
  document
    .getElementById("filtered-products-list")
    .classList.remove("no-results");

const toggleSearch = () => {
  if (!validateSearch()) {
    setDisabled("btn-filtro-buscar");
  } else {
    unsetDisabled("btn-filtro-buscar");
  }
};

const clearSelects = () => {
  document.querySelector(".select-comprimento").value = "";
  document.querySelector(".select-largura").value = "";
  document.querySelector(".select-diametro").value = "";
};

const toggleDiametro = () => {
  clearSelects();
  setDisabled("btn-filtro-buscar");

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
  const filterOne = getValue(".select-largura");
  const filterTwo = getValue(".select-comprimento");
  const filterThree = getValue(".select-diametro");

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

const getValue = (selector) => document.querySelector(selector).value;

document
  .getElementById("checkboxRedondas")
  .addEventListener("change", toggleDiametro);

document
  .getElementById("btn-filtro-buscar")
  .addEventListener("click", () => fetchProducts());

document
  .getElementById("btn-load-more")
  .addEventListener("click", () => loadMoreProducts());

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

  if (getValue(".select-largura") !== "") {
    valid = true;
  }

  if (getValue(".select-comprimento") !== "") {
    valid = true;
  }

  if (getValue(".select-diametro") !== "") {
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

  data.forEach((variant) => {
    let item = {};
    item.var_id = variant.Variant.id;
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
  if (FILTER_REQUEST_COUNT >= 150) {
    alert("Por favor aguarde um instante e clique novamente");
    return;
  }

  if (validateSearch()) {
    setDisabled("btn-filtro-buscar");

    fetch(getURL())
      .then((result) => result.json())
      .then((data) => {
        FILTER_TIMEOUT_RESET = startRequestReset();

        const { Variants } = data;
        const prods = getProductList(Variants);
        const urls = getParentsURLS(prods);

        FILTER_REQUEST_COUNT += urls.length + 1;

        Promise.all(
          urls.map((url) =>
            fetch(url).then((result) => {
              return result.json();
            })
          )
        ).then((data) => {
          setParentData(data, prods);
          FILTER_PRODUCTS_ARRAY = prods;
          renderProducts(FILTER_PRODUCTS_ARRAY);
          unsetDisabled("btn-filtro-buscar");
        });
      });
  }
};

const loadMoreProducts = () => {
  if (FILTER_REQUEST_COUNT >= 150) {
    alert("Por favor aguarde um instante e clique novamente");
    return;
  }

  let url = getURL();
  url += `&page=${FILTER_CURRENT_PAGE + 1}`;

  if (validateSearch()) {
    setDisabled("btn-load-more");

    fetch(url)
      .then((result) => result.json())
      .then((data) => {
        if (data.Variants.length > 0) {
          const { Variants } = data;
          const prods = getProductList(Variants);
          const urls = getParentsURLS(prods);
          clearTimeout(FILTER_TIMEOUT_RESET);
          FILTER_TIMEOUT_RESET = startRequestReset();
          FILTER_REQUEST_COUNT += urls.length + 1;

          Promise.all(
            urls.map((url) =>
              fetch(url).then((result) => {
                return result.json();
              })
            )
          ).then((data) => {
            setParentData(data, prods);
            FILTER_PRODUCTS_ARRAY = [...FILTER_PRODUCTS_ARRAY, ...prods];
            FILTER_CURRENT_PAGE += 1;
            renderProducts(FILTER_PRODUCTS_ARRAY);
            unsetDisabled("btn-load-more");
          });
        } else {
          alert("Sem mais resultados.");
          unsetDisabled("btn-load-more");
        }
      });
  }
};

const renderProducts = (data) => {
  let html = ``;
  let productsListEl = document.getElementById("filtered-products-list");
  let countAvailable = 0;

  if (data.length > 0) {
    unsetDisabled("btn-load-more");
    showLoadMore();
    hideErrorMessage();
    unsetFilterNoResults();
  } else {
    hideLoadMore();
    setDisabled("btn-load-more");
    showErrorMessage();
    setFilterNoResults();
  }

  data.forEach((item) => {
    if (item.img) {
      if (item.available == 1) {
        countAvailable++;
      }

      html += `
      <div class="filter-product-single ${
        item.available == 0 ? "product-unavailable" : ""
      }">
        <a class="filter-product-link" href="${item.url}" target="_blank">
          <img class="filter-product-img" src="${item.img}" />
          <div class="name">${item.name}</div>
          <div class="variant-id">Variação #${item.var_id}</div>
          ${
            item.available == 1
              ? `<div class="price">A partir de R$ ${item.price}</div>`
              : `<div class="available">Indisponível</div>`
          }
        </a>
      </div>
      `;
    }
  });

  if (countAvailable > 0) {
    hideUnavailableProducts();
  } else {
    showUnavailableProducts();
  }

  productsListEl.innerHTML = html;
};
