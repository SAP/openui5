sap.ui.require(["sap/ui/core/Core"], Core => Core.ready(function() {
	"use strict";

	sap.ui.require([
		"sap/f/FlexibleColumnLayout",
		"sap/f/library",
		"sap/m/Button",
		"sap/m/Page"
	], function(FlexibleColumnLayout, fioriLibrary, Button, Page) {

		var LayoutType = fioriLibrary.LayoutType;

		var aPages = [],
		iBusyStateDuration = 3000; // ms

		var oFCL;

		function onPress() {
			oFCL.setBusy(true);
			setTimeout(oFCL.setBusy.bind(oFCL, false), iBusyStateDuration);
		}

		for (var i = 0; i <= 20; i++) {
			aPages.push(new Page("page" + i, {
				title: "Page " + i,
				content: [
					new Button("button" + i, {
						text: "Press me",
						press: onPress
					})
				]
			}));
		}

		oFCL = new FlexibleColumnLayout("fcl", {
			beginColumnPages: [aPages[1], aPages[2], aPages[3]],
			initialBeginColumnPage: "page2",

			midColumnPages: [aPages[4], aPages[5], aPages[6]],
			initialMidColumnPage: "page6",

			endColumnPages: [aPages[7], aPages[8], aPages[9]],
			initialEndColumnPage: "page7",

			layout: LayoutType.ThreeColumnsMidExpanded
		});

		oFCL.placeAt("content");

	});
}));