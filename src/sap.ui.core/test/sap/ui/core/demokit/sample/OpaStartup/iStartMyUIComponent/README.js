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

	oPanel.addContent(oText);
	oPanel.placeAt("readme");

});