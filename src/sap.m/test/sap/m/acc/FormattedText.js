sap.ui.define([
	"sap/m/App",
	"sap/m/FormattedText",
	"sap/m/Page",
	"sap/m/VBox",
	"sap/ui/core/library"
], function(App, FormattedText, Page, VBox, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	var htmlText = '<h2>Header 2</h2>\n';
	htmlText += '<p><a HREF="//www.sap.com">link to sap.com</a> - links open in a new window.\n';
	htmlText += '<p>List:<ul>\n';
	htmlText += '<li>list item 1</li>\n';
	htmlText += '<li>list item 2</li>\n';
	htmlText += '</ul>\n';
	htmlText += '<dl><dt>Definition list:</dt><dd>This is a description of the definition list.</dd></dl>\n';
	htmlText += '<br><cite>Cite is a reference to a source.</cite>\n';

	var oFT = new FormattedText("FormattedText", { htmlText: htmlText }).addStyleClass("sapUiLargeMargin");

	var oPage = new Page({
		title : "FormattedText Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		enableScrolling : true,
		content : new VBox({ items: [
			oFT
		]})
	});

	var oApp = new App();
	oApp.addPage(oPage);
	oApp.placeAt("body");
});
