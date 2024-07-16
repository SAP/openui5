// Note: the HTML page 'AlignedFlowLayoutGallery.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/core/Core",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Text",
	"sap/ui/core/Icon",
	"sap/ui/layout/AlignedFlowLayout"
], async function(Core, App, Page, Text, Icon, AlignedFlowLayout) {
	"use strict";

	await Core.ready();

	var oAlignedFlowLayout = new AlignedFlowLayout({
		content: [
			new Icon({
				src:"sap-icon://loan",
				size: "5rem"
			}),
			new Icon({
				src:"sap-icon://loan",
				size: "5rem"
			}),
			new Icon({
				src:"sap-icon://loan",
				size: "5rem"
			}),
			new Icon({
				src:"sap-icon://loan",
				size: "5rem"
			}),
			new Icon({
				src:"sap-icon://loan",
				size: "5rem"
			}),
			new Icon({
				src:"sap-icon://loan",
				size: "5rem"
			}),
			new Icon({
				src:"sap-icon://loan",
				size: "5rem"
			}),
			new Icon({
				src:"sap-icon://loan",
				size: "5rem"
			}),
			new Icon({
				src:"sap-icon://loan",
				size: "5rem"
			}),
			new Icon({
				src:"sap-icon://loan",
				size: "5rem"
			}),
			new Icon({
				src:"sap-icon://loan",
				size: "5rem"
			}),
			new Icon({
				src:"sap-icon://loan",
				size: "5rem"
			}),
			new Icon({
				src:"sap-icon://loan",
				size: "5rem"
			}),
			new Icon({
				src:"sap-icon://loan",
				size: "5rem"
			}),
			new Icon({
				src:"sap-icon://loan",
				size: "5rem"
			}),
			new Icon({
				src:"sap-icon://loan",
				size: "5rem"
			}),
			new Icon({
				src:"sap-icon://loan",
				size: "5rem"
			}),
			new Icon({
				src:"sap-icon://loan",
				size: "5rem"
			}),
			new Icon({
				src:"sap-icon://loan",
				size: "5rem"
			}),
			new Icon({
				src:"sap-icon://loan",
				size: "5rem"
			}),
			new Icon({
				src:"sap-icon://loan",
				size: "5rem"
			})
		],
		minItemWidth: "8rem",
		maxItemWidth: "20rem"
	});

	new App({
		pages: new Page({
			title: "AlignedFlowLayout Test Page",
			content: [
				new Text({
					text: "A sort of Gallery"
				}),
				oAlignedFlowLayout
			]
		})
	}).placeAt("content");
});