sap.ui.define([
	"sap/m/App",
	"sap/m/FormattedText",
	"sap/m/Page",
	"sap/m/VBox"
], function(App, FormattedText, Page, VBox) {
	"use strict";

	var htmlText = '<h2>Header 2</h2>\n';
	// link
	htmlText += '<p><a HREF="//www.sap.com">link to sap.com</a> - links open in a new window.\n';
	// list
	htmlText += '<p>List:<ul>\n';
	htmlText += '<li>list item 1</li>\n';
	htmlText += '<li>list item 2</li>\n';
	htmlText += '</ul>\n';
	// dl - dt - dd
	htmlText += '<dl><dt>Definition list:</dt><dd>This is a description of the definition list.</dd></dl>\n';
	htmlText += '<br><cite>Cite is a reference to a source.</cite>\n';

	var oFT = new FormattedText("FormattedText", { htmlText: htmlText }).addStyleClass("sapUiLargeMargin");

	var page = new Page({
		title : "sap.m.FormattedText Control",
		titleLevel: "H1",
		enableScrolling : true,
		content : new VBox({ items: [
			oFT
		]})
	});

	new App().addPage(page).placeAt("body");
});
