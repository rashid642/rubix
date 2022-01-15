const path = require("path");
const fs = require('fs');
const databasepath = path.join(__dirname, "../database/drdetails.json")
const loadDrDetails = () => {
	try {
		const dataBuffer = fs.readFileSync('./database/drdetails.json');
		const dataJSON = dataBuffer.toString();
		return JSON.parse(dataJSON);
	} catch (e) {
		console.log("inside catch "+e);
		return [];
	}
}

module.exports = {
    loadDrDetails,
}