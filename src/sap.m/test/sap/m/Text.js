sap.ui.define([
	"sap/m/App",
	"sap/ui/layout/form/SimpleForm",
	"sap/m/Text",
	"sap/m/Label",
	"sap/m/Page",
	"sap/ui/core/library",
	"sap/m/Toolbar"
], function(App, SimpleForm, MText, Label, Page, coreLibrary, Toolbar) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// create and add app
	var app = new App("myApp", {initialPage:"tabBarPage"});
	app.placeAt("body");

	// create and add a page with texts
	var lorem = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.";
	var loremLineBreaks = "Lorem ipsum dolor sit amet\rNew line\nNew line\n\rNew line\r\nNew line";
	var form = new SimpleForm({
		maxContainerCols : 2,
		editable: false,
		content : [
			new MText("heading", {
				text: 'Below are examples for testing the right-to-left special cases such as numerals, phone numbers, etc. To switch the page direction to right-to-left, please paste the following parameter at the end of the URL -> &sap-ui-rtl=true'
			}),
			new Label({
				text: 'default behavior'
			}),
			new MText({
				text: '(012) 345 678'
			}),
			new Label({
				text: 'textDirection -> ltr'
			}),
			new MText({
				textDirection: 'LTR',
				text: '(012) 345 678'
			}),
			new Label({
				text: 'textDirection -> ltr, textAlign -> right'
			}),
			new MText({
				textDirection: 'LTR',
				textAlign: 'Right',
				text: '(012) 345 678'
			})
		]
	});

	var initialPage = new Page("tabBarPage", {
		showHeader: false,
		content: [
			new MText("text8", {
				text: "[8. INVISIBLE] " + lorem,
				visible: false
			}),
			new MText("text1", {
				text: "[1. STANDARD] " + lorem
			}),
			new MText("text2", {
				text: "[2. NO WRAPPING] " + lorem,
				wrapping: false
			}),
			new MText("text3", {
				text: "[3. FIXED WIDTH in em] " + lorem,
				width: "15em"
			}),
			new MText("text3a", {
				text: "[3a. FIXED WIDTH in %] " + lorem,
				width: "50%"
			}),
			new MText("text3b", {
				text: "[3b. FIXED WIDTH in px] " + lorem,
				width: "250px"
			}),
			new MText("text4", {
				text: "[4. CUSTOM STYLED] " + lorem
			}),
			new MText("text5", {
				text: "[5. ALIGN RIGHT] " + lorem,
				textAlign: TextAlign.Right
			}),
			new MText("text5a", {
				text: "[5a. ALIGN LEFT] " + lorem,
				textAlign: TextAlign.Left
			}),
			new MText("text5b", {
				text: "[5b. ALIGN END] " + lorem,
				textAlign: TextAlign.End
			}),
			new MText("text5c", {
				text: "[5c. ALIGN BEGIN] " + lorem,
				textAlign: TextAlign.Begin
			}),
			new MText("text5d", {
				text: "[5d. ALIGN CENTER] " + lorem,
				textAlign: TextAlign.Center
			}),
			new MText("text5e", {
				text: "[5e. ALIGN INITIAL] " + lorem,
				textAlign: TextAlign.Inititial
			}),
			new MText("text6", {
				text: "Text [6. RTL] " + lorem,
				textDirection: TextDirection.RTL
			}),
			new MText("text6a", {
				text: "Text [6a. LTR] " + lorem,
				textDirection: TextDirection.LTR
			}),
			new MText("text6b", {
				text: "Text [6b. DIRECTION INHERIT] " + lorem,
				textDirection: TextDirection.Inherit
			}),
			new MText("text7", {
				text: "[7. LINE BREAKS]\n...\n" + lorem
			}),
			new MText("text9", {
				text: "[9. MAXLINES:3] " + lorem + lorem + lorem,
				maxLines: 3
			}),
			new MText("text10", {
				text: "Text [10. RTL + MAXLINE:2] " + lorem,
				textDirection: "RTL",
				maxLines: 2
			}),
			new MText("text11", {
				text: "Text [11. Text with line breaks] " + loremLineBreaks
			}),
			new MText("text12", {
				text: "Text [12. Text with renderWhiteSpace]  This text contains whitespace and it shall not wrap, still preserving the whitespace." +
				"\n This is the(3 tabs follow)\t\t\tfirst line." +
				"\n This is the second(10 spaces follow)         line.",
				renderWhitespace:true,
				wrapping:true
			}),
			new MText("text13", {
				text: "Text [13. Escaping characters examples] C:\\newFolder C:\\NewFolder C:\\TestFolder C:\\testFolder",
				width: "100%"
			}),
			new MText("text14", {
				text: "Text [14. Hyphenation] An aggregation is a special relation between two UI element types. It is used to define the parent-child relationship within the tree structure. The parent end of the aggregation has cardinality 0..1, while the child end may have 0..1 or 0..*. The element's API offers convenient and consistent methods to deal with aggregations (e.g. to get, set, or remove target elements). Examples are table rows and cells, or the content of a table cell.",
				wrappingType: "Hyphenated",
				width: "200px"
			}),
			new MText("text15", {
				textDirection: 'LTR',
				text: 'קמח: some latin chars'
			}),
			form,
			new Toolbar({
				design: "Transparent",
				content: [
					new MText({
						text: "Text in Toolbar with Transparent design."
					})
				]
			})
		]
	});
	app.addPage(initialPage);
});
