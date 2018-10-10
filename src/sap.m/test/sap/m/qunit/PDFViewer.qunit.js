/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"./PDFViewer.static.qunit",
	"./PDFViewer.binding.qunit",
	"./PDFViewer.embedded.qunit",
	"./PDFViewer.popup.qunit",
	"./PDFViewer.accessibility.qunit",
	"./PDFViewer.noPlugin.qunit",
	"./PDFViewer.specialUseCases.qunit"
], function(createAndAppendDiv) {
	"use strict";


	createAndAppendDiv("content").setAttribute("style", "height:100%;");
	createAndAppendDiv("qunit_results").setAttribute("style", "height:100%;");
	var styleElement = document.createElement("style");
	styleElement.textContent =
		"html, body {" +
		"	height: 100%;" +
		"}";
	document.head.appendChild(styleElement);

	QUnit.jUnitReport = function(report) {
		if (typeof console !== 'undefined') {
			jQuery("#qunit_results").text(report.xml);
		}
	};

	QUnit.done(function () {
		jQuery("#content").hide();
	});

});