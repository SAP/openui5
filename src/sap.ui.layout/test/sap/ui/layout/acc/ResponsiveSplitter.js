sap.ui.define([
	"sap/m/Panel",
	"sap/m/Text",
	"sap/ui/layout/PaneContainer",
	"sap/ui/layout/ResponsiveSplitter",
	"sap/ui/layout/SplitPane",
	"sap/ui/layout/SplitterLayoutData"
], function(Panel, Text, PaneContainer, ResponsiveSplitter, SplitPane, SplitterLayoutData) {
	"use strict";

	var lorem = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr.";

	var oDefaultPane = new SplitPane("defaultPane", {
		content: new Panel({
			headerText: "2",
			content: new Text({text: lorem + lorem})
		}),
		requiredParentWidth: 900,
		demandPane: true
	});

	var oResponsiveSplitter = new ResponsiveSplitter("responsiveSplitter", {
		width: "500px",
		defaultPane: "defaultPane",
		rootPaneContainer: [
			new PaneContainer({
				orientation: "Horizontal",
				panes: [

					new PaneContainer({
						orientation: "Vertical",
						panes: [
							new SplitPane({
								demandPane: true,
								content:  new Panel({
									headerText: "3",
									content: new Text({text: lorem + lorem})
								}),
								requiredParentWidth: 900
							}),
							new SplitPane({
								demandPane: true,
								content:  new Panel({
									headerText: "4",
									content: new Text({text: lorem + lorem})
								}),
								requiredParentWidth: 800
							}),
							new SplitPane({
								demandPane: true,
								content: new Panel({
									headerText: "1.5",
									content: new Text({text: lorem + lorem})
								}),
								requiredParentWidth: 950
							})
						]
					}),
					new SplitPane({
						demandPane: true,
						content: new Panel({
							headerText: "7",
							content: new Text({text: lorem + lorem})
						}),
						requiredParentWidth: 400
					}),
					new SplitPane({
						demandPane: true,
						content: new Panel({
							headerText: "8",
							content: new Text({text: lorem + lorem})
						}),
						requiredParentWidth: 500
					}),
					oDefaultPane,
					new SplitPane({
						demandPane: true,
						content: new Panel({
							headerText: "1",
							content: new Text({text: lorem + lorem})
						}),
						requiredParentWidth: 1000,
						layoutData: new SplitterLayoutData({
							size: "30%"
						})
					}),
					new PaneContainer({
						orientation: "Vertical",
						panes: [
							new SplitPane({
								demandPane: true,
								content:  new Panel({
									headerText: "7 ",
									content: new Text({text: lorem + lorem})
								}),
								requiredParentWidth: 400
							}),
							new SplitPane({
								demandPane: true,
								content:  new Panel({
									headerText: "6.5",
									content: new Text({text: lorem + lorem})
								}),
								requiredParentWidth: 600
							}),
							new SplitPane({
								demandPane: true,
								content: new Panel({
									headerText: "6",
									content: new Text({text: lorem + lorem})
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
