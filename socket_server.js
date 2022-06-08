const express = require('express')
;const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require('fs');
const mysql = require('mysql');
var nodemailer = require('nodemailer'); 

const client = mysql.createConnection({
host: '127.0.0.1',
  port: 3306,
  user: 'root',
  database: 'language_db',
password: 'Seychelles89&'
})

client.connect()


/*
var sql = 'INSERT INTO language_db.notes (note, id_language) VALUES ?';
	var values = [10, 1];
	client.query(sql, [values], function(err, result) {
					//console.log("Number of records inserted: " + result.affectedRows);
});*/

/* client.query('SELECT * from language_db.sentences s, language_db.languages l where l.id = s.id_language and l.the_language like "English"',(err, rows, res) => {
			
			switch (msg) {
				case 'English' : 
					for (var i = 0; i<rows.length; i++) {
						console.log("rows[i].mother" + rows[i].mother);
						json.msg[0].mother = rows[i].mother;
						json.msg[0].other = rows[i].other;
					}
					break;
					default:
						console.log(`Sorry, we are out of ${msg}.`);
				
			}
			console.log("json : " + json);
						console.log("rows[0].other" + rows[0].other) // Hello World!

			console.log(err ? err.stack : rows[0].other) // Hello World!
		});	
 */
 
const users = [];

let id;
io.on('connection', (socket) => {
	const user = { socket : socket };
	console.log(`Connecté au client ${socket.id}`)
	
	socket.on("id", (msg) => { 
		console.log("id : " + msg);
		id = msg;
	});
	
	socket.on("lobby", (msg) => {
		/*
		select last note + number of sentences
		*/
		
		//var languages = ["English", "russian"];
		
		var json = {
			"the_languages" : [],
		}
		
		let lan;

		
		var p0 = new Promise((resolve, reject) => {
			client.query('SELECT l.the_language FROM language_db.languages l', (err, res, field) => {
				lan = res;
				console.log("p0 the_langauge ?       " + res[0].the_language);

				resolve(res);
			});
					
		});
		
		p0.then((result0) => {
			for (let i = 0, p = Promise.resolve(); i < result0.length; i++) {
   
			p.then(() => {



				var json2 = {
						"the_language" : "English",
						"note" : "",
						"number" : ""
				}
				
				
				
				
				var p1 = new Promise((resolve, reject) => {

					client.query('SELECT n.note FROM language_db.notes n, language_db.languages l WHERE l.id = n.id_language AND l.the_language LIKE ' + mysql.escape(result0[i].the_language) + ' ORDER BY n.id DESC LIMIT 1', (err, res, field) => {
						console.log(res);
						console.log("p1 note ?       " + res[0].note);
						resolve(res[0].note);
					});
				});
				
				var p2 = new Promise((resolve, reject) => {

					client.query('SELECT COUNT(s.id_language) AS number FROM language_db.languages l, language_db.sentences s WHERE s.id_language = l.id AND l.the_language LIKE ' + mysql.escape(result0[i].the_language), (err, res, field) => {
						console.log(res);
						console.log("p2 number ?        " + res[0].number);
						resolve(res[0].number);
					});
					
				});	
					
				p1.then(result => {
					console.log("first then p1 (resulve note).then " + result);
					json2.note = result;
						
				}).then(function(result) {
					/* console.log("sencond then : " + result); // undefined
					json2.number = result; */
					return p2;
					
				}).then( (result) => {
					console.log("third then (resulve number) : " + result);
					json2.number = result;
					json2.the_language = result0[i].the_language;
					json.the_languages.push(json2);
					var str2 = JSON.stringify(json, null, 2); // spacing level = 2
					console.log(str2); 

					socket.emit("lobby_return", json);
					
				});
			
			
			});
		
		}
		});
		
		
		
		console.log("-------------");
		

		
		
		
	});
	
	socket.on("notes", (msg) => {
		console.log("notes");
		// todo check if the order by work
		client.query('SELECT l.the_language, n.note, n.t_time from language_db.notes n, language_db.languages l where l.id = n.id_language ORDER BY n.id DESC LIMIT 10',(err, res, field) => {
			/*
			[SS
				{ the_language: 'English', note: 1 },
				{ the_language: 'English', note: 2 },
				{ the_language: 'English', note: 3 },
				{ the_language: 'English', note: 4 },
				...
			*/
			
			var set = new Set();
			
			res.map(v => v.the_language).forEach(val => set.add(val));
			//var setIter = set.values();
			
			
			
			set = Array.from(set);

			var json = {
			  "languages" : [
				
			  ]
			}

			for (var i=0; i<set.length; i++) {
				
				var notes = {
				  "language" : "",
				  "notes" : [],
				  "data_times" : []
				}
				
				notes.language = set[i];
				notes.notes = res.filter(v => v.the_language === set[i]).map(v => v.note);
				notes.t_time = res.filter(v => v.the_language === set[i]).map(v => v.data_times);

				console.log(notes.notes);
				json.languages.push(notes);
			}
			//console.log(setIter.next().value); 
			//console.log(setIter.next().value); 
			
			
			socket.emit("notes", json);
			console.log(json);
		});
		
	});
	
	socket.on("add_sentences", (msg) => {
		//var array = msg.split(" - ");
		console.log("------language : " + msg.language);
		console.table("------sentences : " + msg.sentences);
		
		var p1 = new Promise((resolve, reject) => {
				client.query('SELECT l.id FROM language_db.languages l WHERE l.the_language LIKE ' + mysql.escape(msg.language) ,(err, res, field) => {
				console.log("res 1 " + res[0].id);
//console.log("field 1 " + field[0].id);

				resolve(res[0].id);
			});
		});
		
		var sql = 'INSERT INTO language_db.sentences (id_language, mother, other) VALUES ?';
		var values = [];
		
		
		
		p1.then(value => {
			for (var i=0; i<msg.sentences.length; i++) {
				var s = msg.sentences[i];
				var d = [value, s.mother, s.other];
				values.push(d);
			}
			console.log("values[0][1] " + values[0][1]);
			client.query(sql, [values], function(err, result) {
				if (err) {
					throw err;
					return;
				}
				if (msg.appareil != undefined && msg.appareil === "swing") {
					console.log("Number of records inserted: " + result.affectedRows);
					//socket.emit("notify", result.affectedRows);
					console.log(id);
					io.to(id).emit("notify", result.affectedRows);
				}
			});
		});
		
	});
		
			
	
	socket.on("Language", (msg) => {  
		var json = {
			"Sentences" : []
		};
		console.log('Language message ' + msg);
		client.query('SELECT * from language_db.sentences s, language_db.languages l where l.id = s.id_language and l.the_language like ' + mysql.escape(msg),(err, res, field) => {
			
			console.log("res : " + res);

			/* switch (msg) {
				case 'English' : 
					for (var i = 0; i<rows.length; i++) {
						console.log("rows[i].mother" + rows[i].mother);
						json.msg[0].mother = rows[i].mother;
						json.msg[0].other = rows[i].other;
					}
					break;
					default:
						console.log(`Sorry, we are out of ${msg}.`);
				
			}
			console.log("json : " + json);
			console.log(err ? err.stack : rows[0].other) // Hello World! */
			json.Sentences = res;
			console.log("json" + json);
			socket.emit("json_all_included", res); 

		});	
		
		
  //client.end()
	});
	
	socket.on("put_note", (msg) => {
		console.log(msg);
		var stringArray = msg.split(" ");
		console.log("stringArray 0 " + stringArray[0]);	// English
		console.log("stringArray 1 " + stringArray[1]);	// note
		
		var p1 = new Promise((resolve, reject) => {
				client.query('SELECT l.id FROM language_db.languages l WHERE l.the_language LIKE ' + mysql.escape(stringArray[0]) ,(err, res, field) => {
				console.log("res 1 " + res[0].id);
//console.log("field 1 " + field[0].id);

				resolve(res[0].id);
			});
		});
		
		
		p1.then(value => {
				var sql = 'INSERT INTO language_db.notes (note, id_language) VALUES ?';
				var values = [[stringArray[1], value]];
				client.query(sql, [values], function(err, result) {
					//console.log("Number of records inserted: " + result.affectedRows);
				});
		});
		
			
		

	});
	
	
	socket.on("number_to_delete", (msg) => {
		console.log("number to delete : " + msg);
		
			client.query('SELECT s.id, s.mother, s.other from language_db.sentences s, language_db.languages l where l.id = s.id_language and l.the_language like "English" ORDER BY s.id DESC LIMIT ' + mysql.escape(msg), (err, res, field) => {
				console.log(JSON.stringify(res, null, 2));
				socket.emit("json_added", res);
			});

		
	});
	
	socket.on("delete_several", (msg) => {
		var sql = 'DELETE FROM language_db.sentences s WHERE s.id IN (?)';
		var inn = msg.split(" ");
		var inn = msg.split(' ').map(Number);
		console.log(inn);
		inn = removeElementsWithValue(inn, 0);
		client.query(sql, [inn], function(err, result) {
			if (err) {
				throw err;
				return;
			}
			console.log(result.affectedRows);
		});
	});
	
	socket.on("login", (msg) => {
		var login = msg.split(" ");
		console.log(login[0]);
		
		client.query('SELECT * from language_db.users u where u.mail like ' + mysql.escape(login[0]), (err, res, field) => {
			if (err) {
				throw err;
				socket.emit("logged", "-1 0");

				return;
			} else if (res.length == 0) {
				
				client.query('INSERT INTO language_db.users (mail, passwordd) VALUES (' + mysql.escape(login[0]) + ', ' + mysql.escape(login[1]) + ')', (err, res) => {
					var user;
					var ran = random(1, 9999);
					client.query('SELECT * from language_db.users u where u.mail like ' + mysql.escape(login[0]), (err, res, field) => {
						
						

						if (err) {
							throw err;

							return;
						}	
						user = {
							id : res[0].id,
							random : ran
						}
						
						users.push(user);
						
					});
					if (err) {
						throw err;

						return;
					}	
					
					/* now we have to send an email */
					var transporter = nodemailer.createTransport({
					  service: 'one',
					  auth: {
						user: 'inbox@gaetannavez.be',
						pass: 'Seychelles89&'
					  }
					});

					var mailOptions = {
					  from: 'inbox@gaetannavez.be',
					  to: login[0],
					  subject: 'valid your inscription',
					  text: 'Welcome! To continue with the application please enter the number ' + ran + ' to the interface'
					};

					transporter.sendMail(mailOptions, function(error, info){
					  if (error) {
						console.log(error);
					  } else {
						console.log('Email sent: ' + info.response);
					  }
					}); 
					
					socket.emit("logged", "2 " + user.id);

				});
				

				return;
			} else {
				client.query('SELECT * from language_db.users u where u.mail like ' + mysql.escape(login[0]) + ' and u.passwordd like ' + mysql.escape(login[1]), (err, res, field) => {
					if (err) {
						throw err;
						socket.emit("logged", "-1 0");

						return;
					} else if (res.length == 0) {
						socket.emit("logged", "-1 0");

						return;
					}
					console.log("res : ");
					console.log(JSON.stringify(res, null, 2));
					socket.emit("logged", "1 " + res[0].id);
				});
			}
			console.log("res : ");
			console.log(JSON.stringify(res, null, 2));
			//socket.emit("logged", "2");
		});
		
		
	});
	
	socket.on("check_pin", (msg) => {
		var login = msg.split(" ");
		var us = users.filter(v => id === login[0]);
		if (us[0].random === login[1]) {
			socket.emit("pin_ok", "OK");
			return;
		}
		socket.emit("pin_ok", "KO");
	});
	
});
function random(min, max) {
	Math.floor(Math.random() * (max - min + 1) + min)
}
function removeElementsWithValue(arr, val) {
    var i = arr.length;
    while (i--) {
        if (arr[i] === val) {
            arr.splice(i, 1);
        }
    }
    return arr;
}
	

	
	
//	io.emit("to client android", "hi i am the server");


server.listen(3000, () => {  
	console.log('listening on port:3000');
	
});

