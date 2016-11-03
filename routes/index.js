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
	currentDate.getTime();

	var phaseIstart = new Date(config.phaseIstart);
	var phaseIend = new Date(config.phaseIend);
	var phaseIIstart = new Date(config.phaseIIstart);
	var phaseIIend = new Date(config.phaseIIend);

	if (currentDate > phaseIstart && currentDate < phaseIend) {
		//nalozi prvo fazo
		res.render('index', { isOver : false, faza: "Phase I." });
	} else if (currentDate > phaseIIstart && currentDate < phaseIIend) {
		//nalozi drugo fazo
		connection.query("SELECT ID, SUG_NAME, SUG_LINK, SUG_DESC, SUG_GOALS FROM phase_one", function (err, rows) {
			if (err) throw err;
			res.render('second', { items: rows });
		});
	} else {
		res.render('index', { isOver: true, faza: "Phase II." });
	}
});

router.post('/submit', function (req, res, next) {
	var form = formidable.IncomingForm();
	form.parse(req, function (err, polja) {
		if (err) throw err;
		
		var char_name = makeStringSafe(polja.Char_name);
		var sug_name = makeStringSafe(polja.Sug_name);
		var link = makeStringSafe(polja.Sug_link);
		var desc = makeStringSafe(polja.Sug_desc);
		var goal = makeStringSafe(polja.Sug_goal);
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

router.get('/test', function (req, res, next) {
	connection.query("SELECT ID, SUG_NAME, SUG_LINK, SUG_DESC, SUG_GOALS FROM phase_one", function (err, rows) {
		if (err) throw err;
		res.render('second', {items: rows});
	});
});

router.post('/glasuj', function (req, res, next) {
	var form = formidable.IncomingForm();
	form.parse(req, function (err, polja) {
		if (err) throw err;
		var ime = makeStringSafe(polja.Char_name);
		var vote = makeStringSafe(polja.radijo);
		var sql = "INSERT INTO phase_two(CHAR_NAME, VOTED) VALUES ('" +
		ime + "' , " +
		vote + ")";
		connection.query(sql, function (err, rows) {
			res.render('finish', { greeting: ime });
		});
	});
});

function makeStringSafe(str){
	str = str.replace(/'/g, "\'");
	str = str.replace(/"/g, "\"");
	str = str.replace(/\\/g, "\\");
	return str;
}

module.exports = router;
