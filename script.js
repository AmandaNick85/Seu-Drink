// Função para buscar os ingredientes e popular o select
async function fetchIngredients() {
    const url = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list';
    try {
        const response = await fetch(url);
        const data = await response.json();
        populateIngredientSelect(data.drinks);
    } catch (error) {
        console.error('Erro ao buscar os ingredientes:', error);
    }
}

// Função para popular o select com ingredientes
function populateIngredientSelect(ingredients) {
    const select = document.getElementById('ingredient-select');
    ingredients.forEach(ingredient => {
        const option = document.createElement('option');
        option.value = ingredient.strIngredient1;
        option.textContent = ingredient.strIngredient1;
        select.appendChild(option);
    });
}

// Função para buscar drinks baseados no ingrediente selecionado
async function fetchDrinksByIngredient(ingredient) {
    const url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ingredient}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayDrinks(data.drinks);
    } catch (error) {
        console.error('Erro ao buscar os drinks:', error);
    }
}

// Função para buscar 10 drinks de exemplo
async function fetchRandomDrinks() {
    const url = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Alcoholic';
    try {
        const response = await fetch(url);
        const data = await response.json();
        const exampleDrinks = data.drinks.slice(0, 10);
        displayDrinks(exampleDrinks);
    } catch (error) {
        console.error('Erro ao buscar os drinks de exemplo:', error);
    }
}

// Função para exibir os drinks na página
function displayDrinks(drinks) {
    const container = document.getElementById('drink-container');
    container.innerHTML = '';

    drinks.forEach(drink => {
        const drinkCard = document.createElement('div');
        drinkCard.classList.add('drink-card');
        drinkCard.innerHTML = `
            <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
            <h3>${drink.strDrink}</h3>
        `;
        // Adiciona evento de clique no drink para abrir o modal com detalhes
        drinkCard.addEventListener('click', () => {
            fetchDrinkDetails(drink.idDrink);
        });

        container.appendChild(drinkCard);
    });
}

// Função para buscar detalhes do drink ao clicar
async function fetchDrinkDetails(drinkId) {
    const url = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drinkId}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        showDrinkModal(data.drinks[0]);
    } catch (error) {
        console.error('Erro ao buscar detalhes do drink:', error);
    }
}

// Função para exibir o modal com os detalhes do drink
function showDrinkModal(drink) {
    const modal = document.getElementById('drinkModal');
    const modalContent = document.getElementById('drinkDetails');

    const isFavorite = getFavorites().find(fav => fav.idDrink === drink.idDrink);

    modalContent.innerHTML = `
      <h2>${drink.strDrink}</h2>
      <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" style="width: 100%;">
      <p><strong>Categoria:</strong> ${drink.strCategory}</p>
      <p><strong>Tipo de copo:</strong> ${drink.strGlass}</p>
      <p><strong>Instruções:</strong> ${drink.strInstructions}</p>
      <h3>Ingredientes:</h3>
      <ul>${getIngredients(drink)}</ul>
      <button onclick="toggleFavorite(${JSON.stringify(drink)})">${isFavorite ? 'Remover dos Favoritos' : 'Favoritar'}</button>
    `;

    modal.style.display = 'block';

    document.getElementById('closeModal').onclick = function () {
        modal.style.display = 'none';
    }

    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
}

// Função auxiliar para pegar os ingredientes e medidas do drink
function getIngredients(drink) {
    let ingredients = '';
    for (let i = 1; i <= 15; i++) {
        const ingredient = drink[`strIngredient${i}`];
        const measure = drink[`strMeasure${i}`];
        if (ingredient) {
            ingredients += `<li>${measure ? measure : ''} ${ingredient}</li>`;
        }
    }
    return ingredients;
}

// Adiciona evento ao botão de filtro para buscar drinks por ingrediente
document.getElementById('filter-button').addEventListener('click', () => {
    const selectedIngredient = document.getElementById('ingredient-select').value;
    if (selectedIngredient) {
        fetchDrinksByIngredient(selectedIngredient);
    }
});

// Selecionar o container onde os drinks favoritos serão exibidos
const favoriteContainer = document.getElementById("favoriteContainer");

// Função para salvar um drink nos favoritos
function toggleFavorite(drink) {
    let favorites = getFavorites(); // Recupera os favoritos existentes

    const isFavorite = favorites.find(fav => fav.idDrink === drink.idDrink);

    if (isFavorite) {
        // Se o drink já é um favorito, remove-o
        favorites = favorites.filter(fav => fav.idDrink !== drink.idDrink);
        alert("Drink removido dos favoritos!");
    } else {
        // Se não é favorito, adiciona-o
        if (favorites.length < 10) { // Limite de 10 favoritos
            favorites.push(drink);
            alert("Drink adicionado aos favoritos!");
        } else {
            alert("Você só pode favoritar até 10 drinks.");
        }
    }

    // Armazena a lista atualizada de favoritos no localStorage
    localStorage.setItem("favoriteDrinks", JSON.stringify(favorites));

    // Atualiza a exibição dos drinks favoritos
    renderFavoriteDrinks();
}

// Função para recuperar os favoritos do localStorage
function getFavorites() {
    const favorites = localStorage.getItem("favoriteDrinks"); // Obtém os dados do localStorage
    return favorites ? JSON.parse(favorites) : []; // Converte para objeto, ou retorna um array vazio
}

// Função para renderizar os drinks favoritos no menu de favoritos
function renderFavoriteDrinks() {
    const favorites = getFavorites(); // Recupera os favoritos
    const favoriteContainer = document.getElementById("favoriteContainer");
    favoriteContainer.innerHTML = ''; // Limpa o container

    // Se não há favoritos, exibe uma mensagem
    if (favorites.length === 0) {
        favoriteContainer.innerHTML = '<p>Nenhum drink favoritado.</p>';
        return;
    }

    // Para cada drink favorito, cria um card e adiciona ao container
    favorites.forEach(drink => {
        const drinkCard = document.createElement("div");
        drinkCard.classList.add("drink-card");
        drinkCard.innerHTML = `
            <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
            <h3>${drink.strDrink}</h3>
            <button onclick="removeFromFavorites('${drink.idDrink}')">Remover</button>
        `;
        favoriteContainer.appendChild(drinkCard);
    });
}
// Função para remover um drink dos favoritos
function removeFromFavorites(drinkId) {
    let favorites = getFavorites(); // Recupera os favoritos
    favorites = favorites.filter(fav => fav.idDrink !== drinkId); // Filtra o drink a ser removido
    localStorage.setItem("favoriteDrinks", JSON.stringify(favorites)); // Atualiza o localStorage
    renderFavoriteDrinks(); // Atualiza a exibição dos favoritos
}

// Chama a função para renderizar os drinks favoritos ao carregar a página
renderFavoriteDrinks();

// Chamada das funções ao carregar a página
fetchIngredients();
fetchRandomDrinks(); // Mostra os 10 drinks de exemplo ao carregar a página
