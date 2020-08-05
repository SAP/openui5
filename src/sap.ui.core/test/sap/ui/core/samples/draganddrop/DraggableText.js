sap.ui.define(['sap/m/Text'], function(Text) {
		"use strict";

	// Control extension
	var DraggableText = Text.extend("my.DraggableText", {
		renderer: {}
	});

	// Control extension for custom ghost
	DraggableText.prototype.getDragGhost = function (oEvent) {
		var oGhost = document.createElement("span");
		oGhost.innerText = this.getText();
		oGhost.style.border = "3px solid red";
		oGhost.style.backgroundColor = "pink";
		return oGhost;
	};

	return DraggableText;

});