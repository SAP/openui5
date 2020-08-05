sap.ui.require([
	"sap/ui/thirdparty/jquery",
	"sap/ui/integration/widgets/Card",
	"sap/m/CheckBox",
	"sap/m/Page",
	"sap/m/App",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer"
], function (jQuery, Card, CheckBox, Page, App, Toolbar, ToolbarSpacer) {
	"use strict";

	delete Document.prototype.adoptedStyleSheets;

	var oCard = new Card("AdaptiveCard", {
			manifest: "./adaptivecardvisualtests-manifest.json"
		}),
		oCompactMode = new CheckBox("compactMode", {
			text: "Compact Mode",
			selected: false,
			select: function () {
				jQuery("body").toggleClass("sapUiSizeCompact");
			}
		}),
		oApp = new App("myApp", {
			initialPage: "page1"
		});

	oApp.addPage(new Page("page1", {
		title: "Adaptive Card Test Page",
		content: [
			oCard
		],
		footer: new Toolbar({
			content: [
				new ToolbarSpacer(),
				oCompactMode
			]
		})
	}));
	oApp.placeAt("body");
});