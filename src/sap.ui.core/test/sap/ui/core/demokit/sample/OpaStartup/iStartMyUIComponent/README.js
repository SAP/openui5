/*global QUnit */

sap.ui.require(
	[
		"sap/m/Panel",
		"sap/m/Text"
	], function(Panel, Text) {
	"use strict";

	Object.assign(document.getElementById("readme").style, {
		top: "350px",
		position: "fixed",
		left: 0,
		width: "20%"
	});

	QUnit.done(function () {
		Object.assign(document.getElementById("readme").style, {
			width: "100%",
			top: "190px"
		});
	});

	var oText = new Text(),
		oPanel = new Panel({
			headerText: "README",
			expandable: true,
			expanded: true,
			content: oText
		});

	oText.setText("******Definition******\n" +
		"	The function iStartMyUIComponent allows starting a UIComponent by using a component.js file" +
		"	instead of an index.html file.\n" +
		"	It means that starting a UIComponent will not create an additional window (iFrame) into the initial frame/window.\n\n" +
		"******Use Case******\n" +
		"	For all who want faster testing (compared to starting the app in an iFrame) and would like to start their UIComponent.\n\n" +
		"******Advantages******\n" +
		"+ Debugging is easier because you do not need to switch between different frames\n" +
		"+ Client side code coverage is available\n" +
		"+ Tests run faster because all resources are loaded at once\n" +
		"+ You have full control over the Mockserver compared to starting the app in a frame(e.g Start and Stop time)\n\n" +
		"******Disadvantages******\n" +
		"- No isolated execution environment\n" +
		"	");

	oPanel.placeAt("readme");

});