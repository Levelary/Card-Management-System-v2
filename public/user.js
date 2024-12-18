
// let currentUser = null;
// fetchCards();


document.addEventListener("DOMContentLoaded", () => {
    window.id = null;
    const logoutBtn = document.getElementById('logout-btn');
    currentUser = localStorage.getItem('currentUser');

    if(!currentUser)
        window.location.href = '/login.html';
    else
        fetchCards();

    logoutBtn.addEventListener('click', () => {
        logout();
    });
});

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    window.location.href = '/login.html';
}

function clearForm() { // Reset form
    document.querySelectorAll('input').forEach(input => input.value = '');
    document.getElementById('heading').textContent = 'Add Card:';
    document.getElementById('add-card-btn').textContent = 'Add Card';
    window.id = null;
}

async function fetchCards() {
    try {
        const response = await fetch('/user');
        if(! response.ok)
            throw new Error("Network response was not ok");

        const cards = await response.json();
        displayCards(cards);
    } catch(error) {
        console.error('Error fetching cards:', error);
    }
}

function displayCards(cards) {
    const cardList = document.getElementById('card-list');
    cardList.innerHTML = '';

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Card Number</th>
                <th>Cardholder Name</th>
                <th>Card Type</th>
                <th>Expiration Date</th>
                <th>CVV</th>
                <th>Bank Name</th>
                <th>Issuing Country</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    const tbody = table.querySelector('tbody');

    cards.forEach(card => {
        const row = document.createElement('tr');
        const formattedDate = new Date(card.expiration_date).toLocaleDateString('en-CA');
        row.innerHTML = `
            <td>${card.id}</td>
            <td>${card.card_number}</td>
            <td>${card.cardholder_name}</td>
            <td>${card.card_type}</td>
            <td>${formattedDate}</td>
            <td>${card.cvv}</td>
            <td>${card.bank_name}</td>
            <td>${card.issuing_country}</td>
            <td>
                <button onclick="deleteCard(${card.id})">Delete</button>
                <button class="update-button" onclick="updateCard(${card.id}, '${card.card_number}', '${card.cardholder_name}', '${card.card_type}', '${card.expiration_date}', '${card.cvv}', '${card.bank_name}', '${card.issuing_country}')">Update</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    cardList.appendChild(table);
}


function updateCard(id, card_number, cardholder_name, card_type, expiration_date, cvv, bank_name, issuing_country) {
    const formattedDate = new Date(expiration_date).toLocaleDateString('en-CA');
    document.getElementById('card_number').value = card_number;
    document.getElementById('cardholder_name').value = cardholder_name;
    document.getElementById('card_type').value = card_type;
    document.getElementById('expiration_date').value = formattedDate;
    document.getElementById('cvv').value = cvv;
    document.getElementById('bank_name').value = bank_name;
    document.getElementById('issuing_country').value = issuing_country;

    // Save id for updating the date
    window.id = id;

    document.getElementById('heading').textContent = 'Update Card:'
    document.getElementById('add-card-btn').textContent = 'Update Card'
}

async function saveCard() {
    const cardData = {
        card_number: document.getElementById('card_number').value,
        cardholder_name: document.getElementById('cardholder_name').value,
        card_type: document.getElementById('card_type').value,
        expiration_date: document.getElementById('expiration_date').value,
        cvv: document.getElementById('cvv').value,
        bank_name: document.getElementById('bank_name').value,
        issuing_country: document.getElementById('issuing_country').value,
        added_by: currentUser
    };
    console.log('Card data being saved:', cardData); // Inspect the data
    console.log('id: ',window.id);
    console.log('CurrentUser', currentUser);

    try {
        if(window.id) {
            console.log(`Updating card with id: ${window.id}`);
            await fetch(`/user/${window.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cardData)
            });
            window.id = null;
        }
        else {
            await fetch('/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cardData)
            });
        }
        fetchCards();
        clearForm();
    }
    catch(error) {  
        console.error("Error saving cards", error);  
    }
}

async function deleteCard(id) {
    try {
        await fetch(`/user/${id}`, {
            method: 'DELETE'
        });
        fetchCards();
        clearForm();
    } 
    catch (error) {
        console.error('Error deleting card:', error);
    }
}

// function clearDetails() {
//     document.querySelectorAll('input').forEach(input => input.value = '');
// }

