sap.ui.define([
	"sap/ui/core/Icon",
	"sap/ui/core/InvisibleText"
], function(Icon, InvisibleText) {
	"use strict";

	// a purely decorative icon
	new Icon({
		src: "sap-icon://manager",
		size: "32px",
		decorative: true
	}).placeAt("uiarea0");

	// Icon with default label
	new Icon({
		src: "sap-icon://add-photo",
		size: "32px",
		decorative: false
	}).placeAt("uiarea1");

	// Icon with overwritten label
	new Icon({
		decorative: false,
		src: "sap-icon://activate",
		size: "32px",
		alt: "new alt text"
	}).placeAt("uiarea2");

	// Icon with labelled by
	var oLabelForIcon = new InvisibleText({
		id: "labelForIcon",
		text: "label for the good icon"
	});
	oLabelForIcon.toStatic();

	new Icon({
		decorative: false,
		size: "32px",
		ariaLabelledBy: "labelForIcon",
		src: "sap-icon://exit-full-screen"
	}).placeAt("uiarea3");

	// Icon with handler
	new Icon({
		decorative: false,
		size: "32px",
		src: "sap-icon://expand-group",
		press: function() {
		}
	}).placeAt("uiarea4");
});
