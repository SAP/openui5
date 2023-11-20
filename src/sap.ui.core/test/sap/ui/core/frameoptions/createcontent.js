sap.ui.require([
	"sap/ui/core/Core",
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/SearchField"
], function(Core, Button, Input, SearchField) {
	"use strict";
	Core.ready().then(function () {
		new Button({text: "Press me!"}).placeAt("ui5content");
		new Input({value: "Change me!"}).placeAt("ui5content");
		new SearchField({value: "Change me!"}).placeAt("ui5content");
		document.getElementById("htmlcontent").innerHTML =
			"<button>Press me!</button><input type=\"text\" value=\"Change me!\">";
	});
});
