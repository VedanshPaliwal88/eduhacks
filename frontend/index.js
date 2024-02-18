let transactions = [];

baseEndpoint = "http://localhost:8080";
getEndpoint = baseEndpoint + "/get";
createEndpoint = baseEndpoint + "/create";
updateEndpoint = baseEndpoint + "/update";

const getTransactions = async () => {
    console.log("getTransactions");

    transactions = [];

    await fetch(getEndpoint, {
        method: "GET",
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    })
    .then(response => response.json())
    .then(data => {
        for (let i = 0; i < data.length; i++) {
            transactions.push(data[i]);
        }
    });
};

const createTransactions = async (name, amount, date) => {
    console.log("createTransactions");

    await fetch(createEndpoint, {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            name: name,
            amount: amount,
            date: date,
        })
    }).then(response => {
        if (response.status !== 200) {
            console.log("Error when creating transaction");
        }
    });
};

const updateTransactions = async (id, name, amount, date) => {
    console.log("updateTransactions");

    await fetch(updateEndpoint, {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            id: id,
            name: name,
            amount: amount,
            date: date,
        })
    }).then(response => {
        if (response.status !== 200) {
            console.log("Error when updating transaction");
        }
    });
};

function updateBalanceAndTransactionCount(transactions) {
    let balance = 0;
    let transactionCount = 0;
  
    transactions.forEach(transaction => {
        // Add or subtract the transaction value based on its sign
        balance += transaction.amount;
        transactionCount++;
    });
  
    // Display balance
    const balanceSpan = document.getElementById('balance');
    balanceSpan.textContent = `INR ${balance.toFixed(2)}`;
  
    // Display transaction count
    const transactionCountSpan = document.getElementById('transaction-count');
    transactionCountSpan.textContent = `${transactionCount} transactions`;
}
  
function updateIncomeExpense(transactions) {
    let income = 0;
    let expense = 0;

    transactions.forEach(transaction => {
        if (transaction.amount >= 0) {
            income += transaction.amount;
        } else {
            expense += transaction.amount;
        }
    });

    const incomeSpan = document.getElementById('income');
    incomeSpan.textContent = `${income.toFixed(2)}`;

    expense *= -1;
    const expensesSpan = document.getElementById('expenses');
    expensesSpan.textContent = `${expense.toFixed(2)}`;
}
  
// Function to display all existing transactions
async function displayAllTransactions() {
    await getTransactions();

    const transactionsContainer = document.getElementById('transactions-container');
    transactionsContainer.innerHTML = '';

    // Create a table element
    const table = document.createElement('table');
    table.classList.add('transactions-table');

    // Create table header row
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th class="transaction-header">Title</th>
        <th class="transaction-header">Date</th>
        <th class="transaction-header" onclick="sortTransactionsByAmount()">Amount &#8597;</th>
        <th class="transaction-header">Action</th>
    `;
    table.appendChild(headerRow);

    // Iterate through all transactions and create table rows
    transactions.forEach((transaction, index) => {
        const row = document.createElement('tr');
        row.id = `row-${index}`;
        const displaySign = transaction.amount < 0 ? "Dr" : "Cr";
        const bulletColor = transaction.amount < 0 ? "red" : "yellowgreen";
        const displayedValue = `${Math.abs(transaction.amount).toFixed(2)} ${displaySign}`;
        row.innerHTML = `
            <td>${transaction.name}</td>
            <td>${transaction.date}</td>
            <td><span style="color: ${bulletColor};">&#8226;</span> ${displayedValue}</td>
            <td><button class="edit" onclick="editTransaction(${index}, event)">Edit</button></td>
        `;
        if (transaction.amount < 0) {
          row.style.backgroundColor = '#111418'; // Change background color for negative transactions
        }
        table.appendChild(row);
    });

    transactionsContainer.appendChild(table);
}

// Function to handle editing of a transaction
function editTransaction(index, event) {
    event.stopPropagation();
    
    const tableRow = document.getElementById(`row-${index}`);
    const transaction = transactions[index];

    // Create input fields for editing
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = transaction.name;

    const dateInput = document.createElement('input');
    dateInput.type = 'datetime-local';
    dateInput.value = transaction.date;

    const valueInput = document.createElement('input');
    valueInput.type = 'number';
    valueInput.value = transaction.amount;

    // Create save button
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', () => saveTransaction(index));

    // Replace "Edit" button with "Save" button and populate input fields
    const tdActions = tableRow.querySelector('td:last-child');
    tdActions.innerHTML = '';
    tdActions.appendChild(saveButton);

    // Replace row content with input fields
    const tdName = tableRow.querySelector('td:first-child');
    tdName.innerHTML = '';
    tdName.appendChild(nameInput);

    const tdDate = tableRow.querySelector('td:nth-child(2)');
    tdDate.innerHTML = '';
    tdDate.appendChild(dateInput);

    const tdValue = tableRow.querySelector('td:nth-child(3)');
    tdValue.innerHTML = '';
    tdValue.appendChild(valueInput);
}

async function saveTransaction(index) {
    const tableRow = document.getElementById(`row-${index}`);
    const nameInput = tableRow.querySelector('input[type="text"]');
    const dateInput = tableRow.querySelector('input[type="datetime-local"]');
    const valueInput = tableRow.querySelector('input[type="number"]');

    await updateTransactions(
        transactions[index].id,
        nameInput.value,
        parseFloat(valueInput.value),
        dateInput.value
    );

    // Update the button text back to "Edit"
    const editButton = document.createElement('button');
    editButton.classList.add('edit');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => editTransaction(index));
    const tdActions = tableRow.querySelector('td:last-child');
    tdActions.innerHTML = '';
    tdActions.appendChild(editButton);

    // Update the display
    await displayAllTransactions();
    updateBalanceAndTransactionCount(transactions);
    updateIncomeExpense(transactions);
}

// Update the addTransaction function to check for edit mode
async function addTransaction() {
    const transactionName = document.getElementById('transaction-name').value;
    const transactionDateTime = document.getElementById('transaction-date').value;
    const [datePart, timePart] = transactionDateTime.split('T');
    const transactionDate = `${datePart}  ${timePart}`;
    const transactionValue = parseFloat(document.getElementById('transaction-value').value);

    if (!transactionName || isNaN(transactionValue)) {
        alert('Please enter valid transaction details.');
        return;
    }

    const newTransaction = {
        name: transactionName,
        date: transactionDate,
        value: transactionValue,
    };

    // transactions.push(newTransaction);
    await createTransactions(
        transactionName,
        transactionValue,
        transactionDate,
    );

    await displayAllTransactions();
    updateBalanceAndTransactionCount(transactions);
    updateIncomeExpense(transactions);
    document.getElementById('transaction-form').style.display = 'none';

    // Clear input fields after adding transaction
    document.getElementById('transaction-name').value = "";
    document.getElementById('transaction-date').value = "";
    document.getElementById('transaction-value').value = "";
}

// Function to toggle visibility of the transaction form
function toggleTransactionForm() {
    const transactionForm = document.getElementById('transaction-form');
    if (transactionForm.style.display === 'none') {
        transactionForm.style.display = 'flex';
    } else {
        transactionForm.style.display = 'none';
    }
}

let amountSortOrder = 'asc'; // Initial sort order

function sortTransactionsByAmount() {
    amountSortOrder = amountSortOrder === 'asc' ? 'desc' : 'asc';
    transactions.sort((a, b) => {
        return amountSortOrder === 'asc' ? a.value - b.value : b.value - a.value;
    });

    displayAllTransactions();
}

const initApp = async () => {
    await displayAllTransactions();
    await updateBalanceAndTransactionCount(transactions);
    await updateIncomeExpense(transactions);
};

initApp();