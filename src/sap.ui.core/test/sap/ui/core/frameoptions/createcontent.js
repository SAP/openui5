sap.ui.getCore().attachInit(function() {
	"use strict";
	sap.ui.require([
		"sap/m/Button",
		"sap/m/Input",
		"sap/m/SearchField"
	], function(Button, Input, SearchField) {
		new Button({text: "Press me!"}).placeAt("ui5content");
		new Input({value: "Change me!"}).placeAt("ui5content");
		new SearchField({value: "Change me!"}).placeAt("ui5content");
		document.getElementById("htmlcontent").innerHTML =
			"<button>Press me!</button><input type=\"text\" value=\"Change me!\">";
	});
});
