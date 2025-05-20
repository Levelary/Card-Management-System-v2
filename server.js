// install express, cors, mysql

const express = require("express");
const app = express();
app.use(express.json());

// const bodyParser = require("body-parser"); // app.use(bodyParser.json());            
const cors = require('cors'); 
app.use(cors());

app.use(express.static('public'));


const mysql = require("mysql"); 
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // mysql username here
    password: 'abc', // mysql password here
    database: 'carddb1'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the database.');
});

app.get('/', (req,res) => { res.redirect('login.html') });

app.post('/login', /*authentication ,*/ async (req, res) => { 
    // res.send(`Welcome, ${req.user.username}!`);
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username or password missing' });
    }
    console.log("Login attempt:", username, password);

    db.query('select username, role from users where username=? and password=?', [username, password], (err, result) => {
        if (err) {
            // console.error('Error during login query:', error);
            return res.status(500).json({ success: false, message: 'Internal server error', error: err });
        }

        if (result.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        } 
        else {
            if(result[0].role === 'Admin')
                res.json({ success: true, url: '/admin.html'});
            else
                res.json({ success: true, url: '/user.html'});

            //return res.json(result[0]); // sends back username, role to login()
        }
    });
});

// app.post('/logout', (req, res) => { res.redirect('/login.html'); });



/*----------------------- CARD MANAGEMENT -----------------------*/


// insert
app.post("/user", /*authentication, /*isAdmin,*/ async (req, res) => { // req -> request, res -> response
    if(!req.body) {
        res.status(400).send({ message: "Content empty"});
    }

    const query = "insert into cards set card_number = ?, cardholder_name = ?, card_type = ?, expiration_date = ?, cvv = ?, bank_name = ?, issuing_country = ?, added_by = ?"; // where id = ?
    const { card_number, cardholder_name, card_type, expiration_date, cvv, bank_name, issuing_country, added_by} = req.body;

    db.query(query, [card_number, cardholder_name, card_type, expiration_date, cvv, bank_name, issuing_country, added_by], (err, result) => {
        if(err)
            res.status(500).send({message:"Error adding cards", error: err.message});
        else
        {
            res.status(201).send({message: "Card added successfully",
                        card: {id: result.insertId, card_number, cardholder_name, card_type, expiration_date, cvv, bank_name, issuing_country} });
        }
    });
});


// getAll
app.get("/user", /*authentication,*/ async (req, res) => {
    const query = "select * from cards";
    
    db.query(query, (err, result) => {
        if(err)
            res.send({message:"Error retrieving cards", error: err.message});
        else
            res.send(result);
    });
});



// get
app.get("/user/:id", /*autentication,*/ async (req, res) => {
    
    db.query(`select * from cards where id = ${req.params.id}`, (err, result) => {
        if(err)
            res.status(500).send({message:"Error retrieving the card", error: err.message});
        else if(result.affectedRows === 0)
            res.status(404).send({message:`No card with id ${req.params.id}`});
        else
            res.status(200).send(result[0]);
    });
});


// update
app.put("/user/:id", /*autentication,*/ async (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content empty"});
    }

    const query = "update cards set card_number = ?, cardholder_name = ?, card_type = ?, expiration_date = ?, cvv = ?, bank_name = ?, issuing_country = ? where id = ?";
    const { card_number, cardholder_name, card_type, expiration_date, cvv, bank_name, issuing_country} = req.body;

    db.query(query, [card_number, cardholder_name, card_type, expiration_date, cvv, bank_name, issuing_country, req.params.id], (err, result) => {
        // console.log("res",result);

        if(err)
        {
            console.error('Error executing query:', err);
            res.status(500).send({message:"Error updating the card", error: err.message});
        }
        else if(result.affectedRows === 0)
            res.status(404).send({message:`No card with id ${req.params.id}`});
        else
            res.status(200).send({message: "Card updated successfully"});
    });
});


// delete
app.delete("/user/:id", /*autentication,*/ (req, res) => {

    const query = "delete from cards where id = ?";

    db.query(query, [req.params.id], (err, result) => {
        if(err)
            res.status(500).send({message:"Error deleting the card", error: err.message});
        else if(result.affectedRows === 0)
            res.status(404).send({message:`No card with id ${req.params.id}`});
        else
            res.status(200).send({message: "Card deleted successfully"
        });
    });
});


/*----------------------- USER MANAGEMENT -----------------------*/


app.post('/admin', /*authentication, isAdmin,*/ async (req, res) => {
    const {username, password} = req.body;
    const role = 'User';
    db.query("insert into users (username, password, role) values (?,?,?)", [username, password, role], (err, result) => {
        if(err) 
            res.status(500).send({message:"Error adding users", error: err.message});
        else
        {
            res.status(201).send({message:"User created Successfully", 
                        user: {id: result.insertId, username, password, role} });
        }
    });
});

// fetch users
app.get('/admin', /*authentication, isAdmin,*/ async (req, res) => {
    db.query('select id, username, role from users', (error, result) => {
        if(error) 
            res.send({message:"Error retrieving users", error: err.message});
        else
            res.json(result);
    });
});

app.get("/admin/:id", async (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content empty"});
    }
    
    db.query(`select * from users where id = ${req.params.id}`, (err, result) => {
        if(err)
            res.status(500).send({message:"Error retrieving the user", error: err.message});
        else if(result.length === 0)
            res.status(404).send({message:`No user with id ${req.params.id}`});
        else
            res.status(200).send(result[0]);
    });
});

app.put("/admin/:id", /*autentication,*/ async (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content empty"});
    }

    const query = "update users set username=?, password=? where id = ?";
    const {username, password} = req.body;

    db.query(query, [username, password, req.params.id], (err, result) => {
        // console.log("res",result);

        if(err)
        {
            console.error('Error executing query:', err);
            res.status(500).send({message:"Error updating the user", error: err.message});
        }
        else if(result.length === 0) // .affectedRows
            res.status(404).send({message:`No user with id ${req.params.id}`});
        else
            res.status(200).send({message: "User updated successfully"});
    });
});

app.delete("/admin/:id", /*autentication,*/ (req, res) => {

    const query = "delete from users where id = ?";

    db.query(query, [req.params.id], (err, result) => {
        if(err)
        {
            console.log("Error deleting the user", err);
            return res.status(500).send({message:"Error deleting the user"});
        }
        // else if(result.affectedRows === 0)
        //     res.status(404).send({message:`No user with id ${req.params.id}`});
        // else
        res.status(200).send({message: "User deleted successfully"
        });
    });
});


const port = 8080;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
