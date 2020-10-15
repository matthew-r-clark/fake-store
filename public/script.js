$(function() {
  Array.prototype.uniq = function() {
    let arr = [];
    this.forEach(item => {
      if (arr.includes(item)) { return; }
      arr.push(item);
    });
    return arr;
  }

  $('#location').text(location.href);

  let $categories = $('#category-list');
  let $products = $('#product-list');
  let $productListTitle = $('#product-list-title');
  let $productDisplay = $('#product-display');

  let productManager = {
    categories: [],
    products: [],

    processProducts: function(products) {
      this.products = products.sort((a, b) => {
        return alphaSort(a.title, b.title);
      });
      this.categories = products.map(p => p.category)
                                .uniq()
                                .sort(alphaSort);
    },

    displayCategories: function() {
      this.categories.forEach(category => {
        let $li = create('li', capitalize(category));
        $li.data('category', category)
           .addClass('category');
        $categories.append($li);
      });
    },

    displayProducts: function(category) {
      $products.empty().toggle(true);
      let products = this.products;

      if (category) {
        products = products.filter(p => p.category === category);
      }
      
      products.forEach(product => {
        let $li = create('li');
        $li.data('product', product.id)
           .addClass('product');
        let $title = create('h3', product.title);
        let $price = create('p', formatPrice(product.price));
        let $desc = create('p', formatPreview(product.description));
        let $img = create('img');
        $img.attr('src', product.image);
        $li.append($title, $img, $price, $desc);
        $products.append($li);
      });
      $products.children().click(this.handleProductSelection.bind(this));
    },

    displayClearFilter: function() {
      let $last = $categories.children().last();
      if (!$last.hasClass('clear')) {
        let $li = create('li', 'Clear Filter');
        $li.addClass('category clear');
        $categories.append($li);
      }
    },

    bindEvents: function() {
      $categories.click(this.handleCategorySelection.bind(this));
      $('#back').click(this.closeProduct);
    },

    handleCategorySelection: function(event) {
      let $el = $(event.target);
      if ($el.hasClass('category')) {
        $categories.children().removeClass('selected');
        this.closeProduct();
        if ($el.hasClass('clear')) {
          this.displayProducts();
          $categories.children().last().remove();
          $productListTitle.text(capitalize('All Products'));
        } else {
          let category = $el.data('category');
          $el.addClass('selected');
          $productListTitle.text(capitalize(category));
          this.displayProducts(category);
          this.displayClearFilter();
        }
      }
    },

    displayProduct: function(id) {
      let product = this.products.filter(p => p.id === id)[0];
      $('#products').toggle(false);
      this.buildProduct(product);
      $productDisplay.toggle(true);
    },

    buildProduct: function(product) {
      $('#product-image').attr('src', product.image);
      $('#product-title').text(product.title);
      $('#price').text(formatPrice(product.price));
      $('#description').text(product.description);
    },

    closeProduct: function() {
      $('#products').toggle(true);
      $productDisplay.toggle(false);
    },

    handleProductSelection: function(event) {
      let $el = $(event.currentTarget);
      if ($el.hasClass('product')) {
        let id = $el.data('product');
        this.displayProduct(id);
      }
    },

    init: function(data) {
      this.processProducts(data);
      this.displayCategories();
      this.displayProducts();
      this.bindEvents();
    }
  };

  function alphaSort(a, b) {
    if (a[0] > b[0]) {
      return 1;
    } else if (a[0] < b[0]) {
      return -1;
    } else {
      return 0;
    }
  }

  function formatPrice(price) {
    price = String(price).split('.');
    let dollars = price[0];
    let cents = price[1] || "";
    while (cents.length < 2) {
      cents = cents + "0";
    }
    return "$" + dollars + "." + cents;
  }

  function formatPreview(description) {
    let text = description.slice(0, 75);
    return text.split(' ').slice(0, -1).join(' ') + '...';
  }

  function create(tag, contents) {
    let $el =  $(document.createElement(tag));
    if (contents) {
      $el.html(contents);
    }
    return $el;
  }

  function capitalize(text) {
    return text.split(' ')
               .map(w => w[0].toUpperCase() + w.slice(1))
               .join(' ');
  }

  fetch('https://fakestoreapi.com/products')
        .then(res => res.json())
        .then(json => productManager.init(json));
});