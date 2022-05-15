CREATE database language_db;

/* Add a notes table */

CREATE TABLE language_db.languagees(
id INT auto_increment,
primary key(id),
language_of_user VARCHAR(12)
);

CREATE TABLE language_db.users(
id INT auto_increment,
primary key(id),
languagee INT,
mail VARCHAR(20),
passwordd VARCHAR(20),
foreign key (languagee) references language_db.languagees(id)
);

CREATE TABLE language_db.users_users(
id INT auto_increment,
primary key(id),
teacher INT,
student INT,
foreign key (teacher) references language_db.users(id),
foreign key (student) references language_db.users(id)
);


CREATE TABLE language_db.languages(
id INT auto_increment,
primary key(id),
the_language VARCHAR(10),
note INT,
amount_of_sentences INT
); 

SELECT * FROM language_db.sentences l;

select * from language_db.notes n;
SELECT l.the_language FROM language_db.languages l LIMIT 1, 1;
SELECT n.id, n.note, l.the_language FROM language_db.notes n, language_db.languages l WHERE l.id = n.id_language AND l.the_language LIKE "English" ORDER BY n.id DESC LIMIT 1;
SELECT COUNT(s.id_language) AS number FROM language_db.languages l, language_db.sentences s WHERE s.id_language = l.id AND l.the_language = 'English';

select * from  language_db.languages;
SELECT n.note FROM language_db.notes n, language_db.languages l WHERE l.id = n.id_language AND l.the_language LIKE 'English' ORDER BY n.id DESC LIMIT 1;
CREATE TABLE language_db.sentences(
id INT auto_increment,
primary key(id),
id_language INT,
mother VARCHAR(100),
other VARCHAR(100),
foreign key (id_language) references language_db.languages(id)
); 
alter table language_db.sentences drop column dirty_bit;
update  language_db.sentences
set     dirty_bit = 2
where   id >3;
SELECT MAX(s2.dirty_bit) FROM language_db.sentences s2;
ALTER table language_db.sentences add column dirty_bit INT;
ALTER TABLE language_db.sentences MODIFY mother VARCHAR(100);
ALTER TABLE language_db.sentences MODIFY other VARCHAR(100);
CREATE TABLE language_db.notes(
id INT auto_increment,
primary key(id),
note INT,
t_time DATETIME DEFAULT CURRENT_TIMESTAMP,
id_language INT,
foreign key (id_language) references language_db.languages(id)
);

INSERT into language_db.sentences (id_language, mother, other) values (1, "un", "one"), (1, "deux", "two"), (1, "un", "one"), (1, "deux", "two"),(1, "un", "one"), (1, "deux", "two"),(1, "un", "one"), (1, "deux", "two"),(1, "un", "one"), (1, "deux", "two"),(1, "un", "one"), (1, "deux", "two"),(1, "un", "one"), (1, "deux", "two"),(1, "un", "one"), (1, "deux", "two"),(1, "un", "one"), (1, "deux", "two"),(1, "un", "one"), (1, "deux", "two"),(1, "un", "one"), (1, "deux", "two");
INSERT INTO language_db.notes (note, id_language) VALUES (1, 1), (2, 1), (3, 1),(4, 1),(5, 1),(6, 1),(7, 1),(8, 1),(9, 1),(10, 1),(10, 2), (9, 2), (8, 2),(7, 2),(6, 2),(5, 2),(4, 2),(3, 2),(2, 2),(1, 2);

SELECT * from language_db.sentences s, language_db.languages l where l.id = s.id_language and l.the_language like "English";
SELECT * from language_db.sentences s;
SELECT * from language_db.notes n where n.id_language = 2;
SELECT l.id FROM language_db.languages l WHERE l.the_language LIKE "russian";

SELECT * from language_db.sentences s, language_db.languages l where l.id = s.id_language and l.the_language like "English";

delete from language_db.notes s where s.id_language IS NULL;
/*
call after insert into language_db.sentences in order to update the amount of sentences
*/
DELIMITER |
create procedure language_db.update_amount_value(the_language varchar(10))

   begin
   declare amount INT;
   set @amount_column = 't.amount_of_sentences';
   select @amount_column FROM language_db.languages t WHERE t.the_language LIKE the_language into amount;
   insert into language_db.languages(amount_of_sentences) values(yourValue1);
end |

/*drop procedure language_db.yourProcedureName; */
DELIMITER |
create procedure language_db.insert_into_sentences (IN the_language varchar(10), my_mother varchar(45), my_other varchar(45))
	begin
   declare id_of_language INT;
   set @id_column = 't.id';
   select @id_column FROM language_db.languages t WHERE t.the_language LIKE the_language INTO id_of_language;
   insert into language_db.sentences(id_language, mother, other) values(id_of_language, my_mother, my_other);
   call language_db.update_amount_value(the_language);
end |


INSERT into language_db.languages (the_language, note, amount_of_sentences) values ("English", 0, 0), ("russian", 0, 0);
CALL language_db.insert_into_sentences("English", "Bonjour le monde", "Hello world");