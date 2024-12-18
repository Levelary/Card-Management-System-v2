document.addEventListener("DOMContentLoaded", () => {
    window.aId = null;
    const logoutBtn = document.getElementById('logout-btn');
    currentUser = localStorage.getItem('currentUser');

    if(!currentUser)
        window.location.href = '/login.html';
    else
    {
        fetchCards();
        fetchUsers();
    }


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
    document.getElementById('heading').textContent = 'Add User:';
    document.getElementById('add-card-btn').textContent = 'Add User';
    window.aId = null;
}
    

async function fetchCards() {
    try {
        const response = await fetch('/user');
        if(! response.ok)
            throw new Error("Network response was not ok");

        const cards = await response.json();
        displayCards(cards);
    } catch (error) {
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
                <th>Added by</th>
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

            <td>${card.added_by}</td>
        `;
        tbody.appendChild(row);
    });

    cardList.appendChild(table);
}


async function fetchUsers() {
    try {
        const response = await fetch('/admin');
        if(! response.ok)
            throw new Error("Network response was not ok");
        
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

function displayUsers(users) {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Password</th>
                <th>Role</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td><p>******</p></td>
            <td>${user.role}</td>
            <td>
                ${user.role !== 'Admin' ? `
                    <button onclick="deleteUser(${user.id})">Delete</button>
                    <button class="update-button" onclick="updateUser(${user.id}, '${user.username}', '${user.password}')">Update</button>
                ` : '<p>Cannot operate on Admins</p>'}
            </td>
        `;
        tbody.appendChild(row);
    });

    userList.appendChild(table);
    clearForm();
}



async function deleteUser(id) {
    try {
        const response = await fetch(`/admin/${id}`);
        const user = await response.json();

        // if(user.role === 'Admin')
        // {
        //     alert('Admin data cannot be deleted directly');
        //     return;
        // }

        await fetch(`/admin/${id}`, {
            method: 'DELETE'
        });

        fetchUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

async function updateUser(id, username, password) {
    // const response = await fetch(`/admin/${id}`);
    // const user = await response.json();
    document.getElementById('username').value = username;
    document.getElementById('password').value = password;
    // document.getElementById('role').value = role;

    // if(role === 'Admin') // user.role
    // {
    //     alert('Admin data cannot be deleted directly.');
    //     return;
    // }

    // Save id for updating the date
    window.aId = id;

    document.getElementById('heading').textContent = 'Update Card:'
    document.getElementById('add-card-btn').textContent = 'Update Card'
}


async function saveUser() { // document.getElementById('user_form').addEventListener('submit', async function (event) {  
    //event.preventDefault();

    const userData = {
        username : document.getElementById('username').value,
        password : document.getElementById('password').value,
        //role : 'User'
    }

    try {
        if(window.aId) {
            console.log(`Updating user with id: ${window.aId}`);
            await fetch(`/admin/${window.aId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( userData )
            });
            window.aId = null;
        }
        else {
            await fetch('/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( userData )
            });
        }
        fetchUsers();
        clearForm();
    } 
    catch(error) {
        console.error('Error adding user:', error);
    }
}