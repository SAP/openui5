/* global QUnit */

sap.ui.define(["jquery.sap.xml"], function(jQuery) {
	"use strict";

	var testdata = "<?xml version=\"1.0\"?><teamMembers>" +
		"<member firstName=\"Andreas\" lastName=\"Klark\"></member>" +
		"<member firstName=\"Peter\" lastName=\"Miller\"></member>" +
		"<member firstName=\"Gina\" lastName=\"Rush\"></member>" +
		"<member firstName=\"Steave\" lastName=\"Ander\"></member>" +
		"<member firstName=\"Michael\" lastName=\"Spring\"></member>" +
		"<member firstName=\"Marc\" lastName=\"Green\"></member>" +
		"<member firstName=\"Frank\" lastName=\"Wallace\"></member>" +
		"</teamMembers>";

	var testdataError = "<?xml version=\"1.0\"><teamMembers>" +
		"<member firstName=\"Andreas\" lastName=\"Klark\"></member>" +
		"<member firstName=\"Peter\" lastName=\"Miller\"></member>" +
		"<member firstName=\"Gina\" lastName=\"Rush\"></member>" +
		"<member firstName=\"Steave\" lastName=\"Ander\"></member>" +
		"<member firstName=\"Michael\" lastName=\"Spring\"></member>" +
		"<member firstName=\"Marc\" lastName=\"Green\"></member>" +
		"<member firstName=\"Frank\" lastName=\"Wallace\"></member>" +
		"</teamMembers>";

	QUnit.test("parse XML string no error", function(assert) {
		var oXMLDocument = jQuery.sap.parseXML(testdata);
		assert.ok(oXMLDocument.parseError.errorCode == 0, "check parse Error");
		assert.equal(oXMLDocument.getElementsByTagName("teamMembers")[0].childNodes.length,7, "check length");
		assert.equal(oXMLDocument.getElementsByTagName("member").length,7, "check length");

		assert.equal(oXMLDocument.getElementsByTagName("member")[0].getAttribute("firstName"), "Andreas", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[1].getAttribute("firstName"), "Peter", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[2].getAttribute("firstName"), "Gina", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[3].getAttribute("firstName"), "Steave", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[4].getAttribute("firstName"), "Michael", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[5].getAttribute("firstName"), "Marc", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[6].getAttribute("firstName"), "Frank", "name check");
	});

	QUnit.test("parse XML string parse error", function(assert) {
		var oXMLDocument = jQuery.sap.parseXML(testdataError);
		assert.ok(oXMLDocument.parseError.errorCode != 0, "check parse Error");
		if (oXMLDocument.getElementsByTagName){
			assert.equal(oXMLDocument.getElementsByTagName("teamMembers").length,0, "check length");
			assert.equal(oXMLDocument.getElementsByTagName("member").length,0, "check length");
		}
	});

	QUnit.test("serialize XML document", function(assert) {
		var oXMLDocument = jQuery.sap.parseXML(testdata);
		var sXMLText = jQuery.sap.serializeXML(oXMLDocument);
		assert.ok(sXMLText, "check not undefined");

		// parse again
		oXMLDocument = jQuery.sap.parseXML(sXMLText);
		assert.ok(oXMLDocument.parseError.errorCode == 0, "check parse Error");
		assert.equal(oXMLDocument.getElementsByTagName("teamMembers")[0].childNodes.length,7, "check length");
		assert.equal(oXMLDocument.getElementsByTagName("member").length,7, "check length");

		assert.equal(oXMLDocument.getElementsByTagName("member")[0].getAttribute("firstName"), "Andreas", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[1].getAttribute("firstName"), "Peter", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[2].getAttribute("firstName"), "Gina", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[3].getAttribute("firstName"), "Steave", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[4].getAttribute("firstName"), "Michael", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[5].getAttribute("firstName"), "Marc", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[6].getAttribute("firstName"), "Frank", "name check");

	});

	QUnit.test("get parse error", function(assert) {
		var oParseError = jQuery.sap.getParseError(jQuery.sap.parseXML(testdataError));
		assert.ok(oParseError, "error found");
	});

});