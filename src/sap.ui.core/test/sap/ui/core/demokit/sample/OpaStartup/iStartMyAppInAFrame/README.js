sap.ui.require(
	[
	  "sap/ui/core/Core"
	],
	async function(Core) {
	"use strict";

	await Core.ready();
	sap.ui.require(
		[
			"sap/m/Panel",
			"sap/m/Text"
		], function(Panel, Text) {

		var oPanel = new Panel({
			headerText: "README",
			expandable: true,
			expanded: true
		});
		var oText = new Text();

		oText.setText("******Definition******\n" +
			"	The function iStartMyAppInAFrame allows starting an app by using a (index).html\n" +
			"	The (index).html file will be displayed in a new iFrame\n\n" +
			"******Use Case******\n" +
			"	Use iStartMyAppInAFrame if you would like to run your app isolated in its own iFrame\n\n" +
			"******Advantages******\n" +
			"+ Isolated testing environment for your app\n\n" +
			"******Disadvantages******\n" +
			"- Debugging is more complex because you have to switch between different frames\n" +
			"- Client side code coverage is not available\n" +
			"- Tests are very slow because each frame has to load the sap.ui.core separately\n" +
			"	");

		oPanel.addContent(oText);
		oPanel.placeAt("readme");

	});
});