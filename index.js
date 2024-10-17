// Fetch all books from the server (db.json)
async function fetchBooks() {
    const response = await fetch('http://localhost:3000/books');
    const books = await response.json();
    return books;
}

// Display all books in the table
async function displayBooks() {
    const books = await fetchBooks();
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // Clear table content

    books.forEach(book => {
        const tr = document.createElement('tr');
        tr.classList.add('book-row'); // Add class for highlighting

        // Create table cells for book details
        tr.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.type}</td>
            <td>
                ${book.borrowed ? 
                    `<button class="btn btn-secondary btn-sm" disabled>Borrowed</button>
                    <button class="btn btn-warning btn-sm" onclick="returnBook(${book.id})">Return</button>`
                    : `<button class="btn btn-success btn-sm" onclick="borrowBook(${book.id})">Borrow</button>`}
                <button class="btn btn-danger btn-sm" onclick="deleteBook(${book.id})">Delete</button>
            </td>`
        ;

        tableBody.appendChild(tr); // Append the row to the table
    });
}

// Add a new book
async function addNewBook(book) {
    await fetch('http://localhost:3000/books', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(book),
    });

    displayBooks(); // Refresh the book list
}

// Handle the form submission for adding a new book
document.getElementById('libraryForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the default form submission behavior

    // Get the form values
    const title = document.getElementById('inputBook3').value;
    const author = document.getElementById('inputAuthor3').value;
    const type = document.querySelector('input[name="gridRadios"]:checked').value;

    // Validate form input
    if (!title || !author || !type) {
        alert("Please fill in all the fields.");
        return;
    }

    // Create a new book object
    const newBook = {
        title: title,
        author: author,
        type: type,
        borrowed: false, // Set default borrowed status to false
        borrowerName: null,
        borrowDate: null
    };

    // Add the new book
    addNewBook(newBook);

    // Clear the form inputs
    document.getElementById('libraryForm').reset();
});

// Search books based on user input and highlight matches using filter()
document.getElementById('searchInput').addEventListener('input', async function (e) {
    const searchQuery = e.target.value.toLowerCase(); // Get the search query from the input
    const books = await fetchBooks(); // Fetch the books from the server

    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(searchQuery) || 
        book.author.toLowerCase().includes(searchQuery)
    ); // Filter books based on the query

    const bookRows = document.querySelectorAll('.book-row'); // Get all book rows

    let firstMatchFound = false; // To scroll to the first match

    bookRows.forEach(row => {
        const title = row.children[0].innerText.toLowerCase(); // Book title
        const author = row.children[1].innerText.toLowerCase(); // Book author

        // Check if the current row is in the filtered list
        const isInFilteredBooks = filteredBooks.some(book => book.title.toLowerCase() === title && book.author.toLowerCase() === author);

        if (isInFilteredBooks) {
            row.style.backgroundColor = '#ffff99'; // Highlight matched row
            if (!firstMatchFound) {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Scroll to the first match
                firstMatchFound = true;
            }
        } else {
            row.style.backgroundColor = ''; // Reset background if no match
        }
    });
});

// Borrow a book
async function borrowBook(bookId) {
    const borrowerName = prompt("Enter your name:");
    if (!borrowerName) return; // If no name entered, do nothing

    // Fetch the book by ID and update its data
    const response = await fetch(`http://localhost:3000/books/${bookId}`);
    const book = await response.json();

    book.borrowed = true;
    book.borrowerName = borrowerName;
    book.borrowDate = new Date().toLocaleDateString(); // Borrow date as the current date

    // Send updated book data to the server
    await fetch(`http://localhost:3000/books/${bookId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(book),
    });

    displayBooks(); // Refresh the book list
}

// Return a borrowed book
async function returnBook(bookId) {
    // Fetch the book by ID and update its data
    const response = await fetch(`http://localhost:3000/books/${bookId}`);
    const book = await response.json();

    book.borrowed = false;
    book.borrowerName = null;
    book.borrowDate = null;

    // Send updated book data to the server
    await fetch(`http://localhost:3000/books/${bookId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(book),
    });

    displayBooks(); // Refresh the book list
}

// Delete a book
async function deleteBook(bookId) {
    await fetch(`http://localhost:3000/books/${bookId}`, {
        method: 'DELETE',
    });

    displayBooks(); // Refresh the book list after deletion
}

// Initial call to display books when the page loads
document.addEventListener('DOMContentLoaded', displayBooks);
