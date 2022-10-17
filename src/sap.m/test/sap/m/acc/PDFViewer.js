sap.ui.define([
	"sap/m/FlexBox",
	"sap/m/PDFViewer",
	"sap/m/Button",
	"sap/m/FlexItemData"
], function (FlexBox, PDFViewer, Button, FlexItemData) {
	"use strict";

	var oPDFViewer = new PDFViewer({
		source: "../qunit/pdfviewer/sample-file.pdf",
		title: "PDF Viewer"
	});

	var oFlexBox = new FlexBox({
		fitContainer: true,
		wrap: "Wrap",
		renderType: "Bare",
		direction: "Column",
		items: [
			new PDFViewer({
				source: "../qunit/pdfviewer/sample-file.pdf",
				title: "PDF Viewer",
				height: "50%",
				layoutData: new FlexItemData({
					growFactor: 1
				})
			}),
			new Button({
				text: "Open PDF Popup",
				tooltip: "Open PDFViewer in Popup mode",
				press: [oPDFViewer.open, oPDFViewer],
				layoutData: new FlexItemData({
					alignSelf: "Start"
				})
			})
		]
	});

	oFlexBox.placeAt("content");
});
