sap.ui.define([
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/m/Button"
], function(Dialog, Text, Button) {
	"use strict";
	return {
		createContent: function () {
			return [
				new Dialog({
					title: "JavaScript Fragment Dialog",
					content: [
						new Text({text: "{/dialogText}"})
					],
					buttons: [
						new Button({text: "Close"})
					]
				}),
				new Button({text: "Apply"})
			];
		}
	};
});