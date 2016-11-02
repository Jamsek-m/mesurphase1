var express = require('express');
var router = express.Router();
var config = require('../config.json');
var mysql = require('mysql');
var formidable = require('formidable');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'uporabnik',
	password : 'uporabnik',
	database : 'mesurvey'
});


/* GET home page. */
router.get('/', function (req, res, next) {
	var currentDate = new Date();
	var surveyEnd = new Date(config.surveyEnd);
	currentDate = currentDate.getTime();
	surveyEnd = surveyEnd.getTime();
	console.log("Trenutni datum: ",currentDate);
	console.log("Koncni datum: ", surveyEnd);
	
	if (currentDate > surveyEnd) {
		res.render('index', { isOver: true });
	} else {
		res.render('index', { isOver: false });
	}
});

router.post('/submit', function (req, res, next) {
	var form = formidable.IncomingForm();
	form.parse(req, function (err, polja) {
		if (err) throw err;
		
		var char_name = polja.Char_name;
		var sug_name = polja.Sug_name;
		var link = polja.Sug_name;
		var desc = polja.Sug_desc;
		var goal = polja.Sug_goal;

		var sql = "INSERT INTO phase_one(CHAR_NAME, SUG_NAME, SUG_LINK, SUG_GOALS, SUG_DESC) VALUES ('" +
				char_name + "','" +
				sug_name + "','" +
				link + "','" +
				goal + "','" +
				desc + "')";
		
		connection.query(sql, function (err, rows) {
			if(err) throw err;
			res.render('finish', {greeting: char_name});
		});
	});
});


module.exports = router;
