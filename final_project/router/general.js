const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(409).json({message: "User already exists!"});    
    }
  } 
  return res.status(400).json({message: "Username and password are required."})
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  let get_books_promise = new Promise((resolve, reject) => {
        resolve(books);
  });

  get_books_promise.then((book_list) => {
    res.send(JSON.stringify(book_list, null, 4));
  }).catch((err) => {
    res.status(500).send("Error fetching books");
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  let get_book_promise = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  });

  get_book_promise.then((book) => {
    return res.json(book);
  }).catch((err) => {
    return res.status(404).json({message: err});
  });
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  const get_books_by_author = new Promise((resolve, reject) => {
    const authorBooks = [];
    for (const bookId in books) {
      if (books[bookId].author === author) {
        authorBooks.push(books[bookId]);
      }
    }
    if (authorBooks.length > 0) {
      resolve(authorBooks);
    } else {
      reject("No books found by this author");
    }
  });

  try {
    const result = await get_books_by_author;
    return res.json(result);
  } catch (err) {
    return res.status(404).json({ message: err });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  const get_books_by_title = new Promise((resolve, reject) => {
    const titleBooks = [];
    for (const bookId in books) {
      if (books[bookId].title === title) {
        titleBooks.push(books[bookId]);
      }
    }
    if (titleBooks.length > 0) {
      resolve(titleBooks);
    } else {
      reject("No books found with this title");
    }
  });

  try {
    const result = await get_books_by_title;
    return res.json(result);
  } catch (err) {
    return res.status(404).json({ message: err });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.json(books[isbn].reviews);
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
