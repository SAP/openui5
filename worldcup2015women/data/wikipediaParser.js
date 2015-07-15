/*
 * Parses the teams and players from http://en.wikipedia.org/wiki/2014_FIFA_World_Cup_squads into a JS object/array.
 * Run it e.g. in the debug console of that web page. The result is in aTeams.
 */

var oTeams = {},
	mPositions = {
		"GK": "1",
		"DF": "2",
		"MF": "3",
		"FW": "4"
	};

var $countries = $("h3 > .mw-headline");
$countries.each(function(i,e){
	var sCountryName = e.innerText.replace("Bosnia and Herzegovina","Bosnia-Herzegovina"); // special case, adapt to football.db notation
	
	if (sCountryName.indexOf("representation") == -1) { // filter out unwanted sections
		var oCurrentTeam = oTeams[sCountryName] = {};
		var $trainer = $(e).parent().next().children().filter("a");
		oCurrentTeam.trainer = $trainer.text();
		
		// team
		var $teamBody = $(e).parent().next().next().next().children().children().children().children().children(":first-child").next();
		oCurrentTeam.players = [];
		
		var $playerRows = $teamBody.children();
		$playerRows.each(function(j,f){
			var oPlayer = {}, $player = $(f);
			oCurrentTeam.players.push(oPlayer);
		
			oPlayer.number = $player.children(":nth-child(1)").text();
			var positionCode = $player.children(":nth-child(2)").children(":nth-child(2)").text();
			oPlayer.positionCode = mPositions[positionCode];
			oPlayer.name = $player.children(":nth-child(3)").children(":first-child").text();
			oPlayer.birthDate = $player.children(":nth-child(4)").children(":first-child").children(":first-child").text();
			oPlayer.games = $player.children(":nth-child(5)").text();
			oPlayer.leagueTeam = $player.children(":nth-child(6)").children(":nth-child(2)").attr("title"); //text();
			oPlayer.leagueCountry = $player.children(":nth-child(6)").children(":first-child").children(":first-child").attr("title"); //text();
		});
	}
});

