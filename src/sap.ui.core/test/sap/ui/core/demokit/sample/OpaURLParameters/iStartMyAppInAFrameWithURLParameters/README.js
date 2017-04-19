jQuery(function() {
	"use strict"

	jQuery.sap.require("sap/m/Panel");
	jQuery.sap.require("sap/m/Text");

	var oPanel = new sap.m.Panel({
		headerText: "README",
		expandable: true,
		expanded: true
	});
	var oText = new sap.m.Text();

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