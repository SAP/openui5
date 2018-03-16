/*global QUnit */
sap.ui.define(["sap/ui/xml/serializeXML", "sap/ui/xml/XMLParser"], function(serializeXML, XMLParser) {
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

	QUnit.module("sap.ui.xml.serializeXML");

	QUnit.test("serialize XML document with DOMParser", function(assert) {
		var oXMLDocument = XMLParser.parse(testdata);
		var sXMLText = serializeXML(oXMLDocument);
		assert.ok(sXMLText, "check not undefined");

		// parse again
		oXMLDocument = XMLParser.parse(sXMLText);
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
