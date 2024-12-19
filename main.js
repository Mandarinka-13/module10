let currentPage = 1;
const productsPerPage = 6;
 
const categorySelect = document.getElementById('categorySelect');
const productContainer = document.getElementById('productContainer');
const addProductForm = document.getElementById('addProductForm');
const messageDiv = document.getElementById('message');

async function fetchCategories() {
    const response = await fetch('https://fakestoreapi.com/products/categories');
    const categories = await response.json();
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

async function fetchProductsByCategory(category) {
    const response = await fetch(`https://fakestoreapi.com/products/category/${category}`);
    const products = await response.json();
    
    displayProducts(products);
}

async function fetchCategories() {
    try {
        const response = await fetch('https://fakestoreapi.com/products/categories');
        const categories = await response.json();
        populateCategorySelect(categories);
    } catch (error) {
        showMessage('Ошибка при загрузке категорий.');
    }
}

function populateCategorySelect(categories) {
    const categorySelect = document.getElementById('category-select');
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categorySelect.appendChild(option);
    });
}

async function fetchProducts(category = '') {
    try {
        const response = await fetch(`https://fakestoreapi.com/products${category ? '/category/' + category : ''}`);
        const products = await response.json();
        displayProducts(products);
        createLoadMoreButton();
    } catch (error) {
        showMessage('Ошибка при загрузке товаров.');
    }
}


function displayProducts(products) {
    const productContainer = document.getElementById('product-container');
    
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;

    const productsToDisplay = products.slice(startIndex, endIndex);

    productsToDisplay.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <h2>${product.title}</h2>
            <p>${product.description}</p>
            <p>Цена: $${product.price}</p>
            <img src="${product.image}" alt="${product.title}">
            <button class="delete-button" data-id="${product.id}">Удалить товар</button>
        `;
        
        productCard.querySelector('.delete-button').addEventListener('click', () => deleteProduct(product.id));
        
        productContainer.appendChild(productCard);
    });
}

function createLoadMoreButton() {
    const loadMoreButton = document.getElementById('load-more-button');
    
    loadMoreButton.onclick = async () => {
        currentPage++;
        await fetchProducts(document.getElementById('category-select').value);
    };
}

async function addProduct(event) {
    event.preventDefault();

    const title = document.getElementById('productTitle').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const description = document.getElementById('productDescription').value;
    const category = document.getElementById('productCategory').value;

    try {
        const response = await fetch('https://fakestoreapi.com/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, price, description, category })
        });

        if (!response.ok) throw new Error('Ошибка при добавлении товара');

        showMessage('Товар успешно добавлен!');
        resetAddProductForm();
        
        currentPage = 1; 
        document.getElementById('product-container').innerHTML = ''; 
        await fetchProducts();
        
    } catch (error) {
        showMessage(error.message);
    }
}

async function deleteProduct(id) {
    try {
        const response = await fetch(`https://fakestoreapi.com/products/${id}`, { 
        method: 'DELETE' });
        
        if (!response.ok) throw new Error('Ошибка при удалении товара');

        showMessage('Товар успешно удален!');
        
        currentPage = 1; 
        document.getElementById('product-container').innerHTML = ''; 
        await fetchProducts();
        
    } catch (error) {
        showMessage(error.message);
    }
}

function resetAddProductForm() {
    document.getElementById('add-product-form').reset();
}

function showMessage(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    
    setTimeout(() => {
        messageDiv.textContent = '';
    }, 3000);
}

document.getElementById('add-product-form').addEventListener('submit', addProduct);
document.getElementById('category-select').addEventListener('change', async (e) => {
    currentPage = 1; 
    document.getElementById('product-container').innerHTML = ''; 
    await fetchProducts(e.target.value);
});

fetchCategories();
fetchProducts();

