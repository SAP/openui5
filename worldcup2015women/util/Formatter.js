jQuery.sap.declare("util.Formatter");
util.Formatter = {

	getFlagUrl: function(sCountry) {
		if(!sCountry){
			return sCountry;
		}
		sCountry = sCountry.toLowerCase()
			.replace(" ", "_")
			.replace("-", "_");
		return "img/flags/"  + sCountry + "_flag.gif";
	},

	// score formatter needed to get the right value (after overtime/penalties) and to display a colon between the goal counts
	formatScore: function(sScore1, sScore1ot, sScore1p, sScore2, sScore2ot, sScore2p) {

		if (sScore1ot === null) { // game over after normal time
			// use the normal result values
		} else if (sScore1p === null) { // game over after overtime
			sScore1 = sScore1ot;
			sScore2 = sScore2ot;
		} else { // game over after penalties
			sScore1 = sScore1p;
			sScore2 = sScore2p;
		}

		return sScore1 + ":" + sScore2;
	}

};
