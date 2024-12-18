create database carddb1;
-- drop database carddb1;
use carddb1;

-- drop table users;
-- truncate users;
create table users (
	id INT auto_increment PRIMARY KEY,
	username VARCHAR(20) not null UNIQUE,
    password VARCHAR(20) not null,
    role ENUM('User', 'Admin') not null
);
-- drop table cards;
-- truncate cards;
create table cards (
	id INT auto_increment PRIMARY KEY,
    card_number INT not null UNIQUE,
    cardholder_name VARCHAR(50) not null,
    card_type ENUM('Debit', 'Credit', 'Prepaid') not null,
    expiration_date DATE not null,
    cvv VARCHAR(20) not null,
    bank_name VARCHAR(50) not null,
    issuing_country VARCHAR(50) not null,
    added_by VARCHAR(50) not null
    -- INDEX( card_number ),
	-- constraint fore_key_added_by FOREIGN KEY (added_by) references users(username)
);


insert into cards(card_number, cardholder_name, card_type, expiration_date, cvv, bank_name, issuing_country, added_by) values ('123', 'John Doe', 'Credit', '2024-12-01', '123', 'ABC Bank', 'USA', 'user1');
-- truncate cards;
-- UPDATE cards SET card_number = '123', cardholder_name = 'John Doe', card_type = 'Credit', expiration_date = '2024-12-01', cvv = '123', bank_name = 'ABC Bank', issuing_country = 'USA' WHERE id = 1;
select * from cards;

insert into users (username, password, role) values ('admin1', 'admin123', 'Admin'), ('user1', 'user123', 'User');
select * from users;