sap.ui.define([
	"sap/m/Button",
	"sap/m/FlexBox",
	"sap/m/Text",
	"sap/m/library",
	"sap/ui/core/library",
	"sap/ui/layout/Splitter"
], function(Button, FlexBox, Text, mLibrary, coreLibrary, Splitter) {
	"use strict";

	var Orientation = coreLibrary.Orientation;
	const FlexWrap = mLibrary.FlexWrap;

	document.getElementById("content").style.height = "500px";

	var sLorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vitae congue diam. Donec venenatis justo sed bibendum finibus.",
		oSplitter = new Splitter("mySplitter", {
			contentAreas: [
				new FlexBox({
					width: 'auto',
					wrap: FlexWrap.Wrap,
					items: [
						new Text({text: sLorem}),
						new Button({text: "Press me"})
					]
				}),
				new FlexBox({
					width: 'auto',
					wrap: FlexWrap.Wrap,
					items: [
						new Text({text: sLorem}),
						new Button({text: "Press me 2"})
					]
				}),
				new FlexBox({
					width: 'auto',
					wrap: FlexWrap.Wrap,
					items: [
						new Text({text: sLorem}),
						new Button({text: "Press me 3"})
					]
				})
			]
		});
	oSplitter.placeAt("content");

	new Button({
		text: "Switch Orientation",
		press: function () {
			var sOrientation = oSplitter.getOrientation() === Orientation.Vertical ? Orientation.Horizontal : Orientation.Vertical;
			oSplitter.setOrientation(sOrientation);
		}
	}).placeAt("content");
});
