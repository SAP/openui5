sap.ui.define([
	"sap/m/Panel",
	"sap/m/Text",
	"sap/ui/layout/PaneContainer",
	"sap/ui/layout/ResponsiveSplitter",
	"sap/ui/layout/SplitPane"
], function(Panel, Text, PaneContainer, ResponsiveSplitter, SplitPane) {
	"use strict";

	var lorem = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr.";


	var oResponsiveSplitter = new ResponsiveSplitter("responsiveSplitter", {
		defaultPane: "defaultPane",
		rootPaneContainer: [
			new PaneContainer({
				orientation: "Horizontal",
				panes: [
					new SplitPane({
						demandPane: true,
						content: new Panel({
							content: new Text({text: "1. " + lorem + lorem})
						}),
						requiredParentWidth: 400
					}),
					new PaneContainer({
						orientation: "Vertical",
						panes: [
							new SplitPane({
								demandPane: true,
								content:  new Panel({
									content: new Text({text: "2. " + lorem + lorem})
								}),
								requiredParentWidth: 400
							}),
							new SplitPane({
								demandPane: true,
								content:  new Panel({
									content: new Text({text: "3. " + lorem + lorem})
								}),
								requiredParentWidth: 600
							})
						]
					})
				]
			})
		]
	});

	oResponsiveSplitter.placeAt("content");
});
