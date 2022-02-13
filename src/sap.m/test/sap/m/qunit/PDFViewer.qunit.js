/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/thirdparty/jquery",
	"./PDFViewer.static.qunit",
	"./PDFViewer.binding.qunit",
	"./PDFViewer.embedded.qunit",
	"./PDFViewer.popup.qunit",
	"./PDFViewer.accessibility.qunit",
	"./PDFViewer.noPlugin.qunit",
	"./PDFViewer.specialUseCases.qunit"
], function(createAndAppendDiv, jQuery) {
	"use strict";


	document.documentElement.style.height =
	document.body.style.height =
	createAndAppendDiv("content").style.height =
	createAndAppendDiv("qunit_results").style.height = "100%";

	QUnit.jUnitReport = function(report) {
		if (typeof console !== 'undefined') {
			jQuery("#qunit_results").text(report.xml);
		}
	};

	QUnit.done(function () {
		jQuery("#content").hide();
	});

});