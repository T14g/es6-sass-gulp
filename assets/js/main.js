const TRAY_URL = "https://www.mesachiq.com.br/web_api/products";
const VARIANTS_URL = "https://www.mesachiq.com.br/web_api/products/variants";

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

document.getElementById("checkboxRedondas").addEventListener("change", () => {
  toggleDiametro();
});

document.getElementById("btn-filtro-buscar").addEventListener("click", () => {
  fetchProducts();
  console.log("fire");
});

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
