/*global QUnit */
sap.ui.define(["sap/ui/util/XMLHelper"], function(XMLHelper) {
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

	QUnit.module("sap.ui.util.XMLHelper");

	QUnit.test("parse XML string no error", function(assert) {
		var oXMLDocument = XMLHelper.parse(testdata);
		assert.equal(oXMLDocument.parseError.errorCode, 0, "no parse Error");
		assert.equal(oXMLDocument.getElementsByTagName("teamMembers")[0].childNodes.length, 7, "check length");
		assert.equal(oXMLDocument.getElementsByTagName("member").length, 7, "check length");

		assert.equal(oXMLDocument.getElementsByTagName("member")[0].getAttribute("firstName"), "Andreas", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[1].getAttribute("firstName"), "Peter", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[2].getAttribute("firstName"), "Gina", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[3].getAttribute("firstName"), "Steave", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[4].getAttribute("firstName"), "Michael", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[5].getAttribute("firstName"), "Marc", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[6].getAttribute("firstName"), "Frank", "name check");
	});

	QUnit.test("parse XML string parse error", function(assert) {
		var oXMLDocument = XMLHelper.parse(testdataError);
		assert.equal(oXMLDocument.parseError.errorCode, -1, "parse Error");
		if (oXMLDocument.getElementsByTagName){
			assert.equal(oXMLDocument.getElementsByTagName("teamMembers").length, 0, "check length");
			assert.equal(oXMLDocument.getElementsByTagName("member").length, 0, "check length");
		}
	});

	QUnit.test("get parse error", function(assert) {
		var oParseError = XMLHelper.getParseError(XMLHelper.parse(testdataError));
		assert.ok(oParseError, "error found");
	});


	QUnit.test("serialize XML document with DOMParser", function(assert) {
		var oXMLDocument = XMLHelper.parse(testdata);
		var sXMLText = XMLHelper.serialize(oXMLDocument);
		assert.ok(sXMLText, "check not undefined");

		// parse again
		oXMLDocument = XMLHelper.parse(sXMLText);
		assert.equal(oXMLDocument.parseError.errorCode, 0, "no parse Error");
		assert.equal(oXMLDocument.getElementsByTagName("teamMembers")[0].childNodes.length, 7, "check length");
		assert.equal(oXMLDocument.getElementsByTagName("member").length,7, "check length");

		assert.equal(oXMLDocument.getElementsByTagName("member")[0].getAttribute("firstName"), "Andreas", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[1].getAttribute("firstName"), "Peter", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[2].getAttribute("firstName"), "Gina", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[3].getAttribute("firstName"), "Steave", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[4].getAttribute("firstName"), "Michael", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[5].getAttribute("firstName"), "Marc", "name check");
		assert.equal(oXMLDocument.getElementsByTagName("member")[6].getAttribute("firstName"), "Frank", "name check");
	});
});
