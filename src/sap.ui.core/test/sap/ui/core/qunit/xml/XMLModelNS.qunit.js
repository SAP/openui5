/*global QUnit */
sap.ui.define([
	"sap/ui/model/xml/XMLModel"
], function(XMLModel) {
	"use strict";

	var testdata =
		"<teamMembers xmlns=\"http://tempuri.org/x\" xmlns:a=\"http://tempuri.org/a\" xmlns:b=\"http://tempuri.org/b\">" +
			"<a:member firstName=\"Andreas\" lastName=\"Klark\"></a:member>" +
			"<a:member firstName=\"Peter\" lastName=\"Miller\"></a:member>" +
			"<a:member firstName=\"Gina\" lastName=\"Rush\"></a:member>" +
			"<b:member firstName=\"Steave\" lastName=\"Ander\"></b:member>" +
			"<b:member firstName=\"Michael\" lastName=\"Spring\"></b:member>" +
			"<b:member firstName=\"Marc\" lastName=\"Green\"></b:member>" +
			"<b:member firstName=\"Frank\" lastName=\"Wallace\"></b:member>" +
			"<test a:value=\"Namespace a\" b:value=\"Namespace b\" />" +
		"</teamMembers>";

	QUnit.module("sap.ui.model.XMLModel with namespace");

	QUnit.test("test model namespace same prefix", function(assert) {
		var oModel = new XMLModel();
		oModel.setNameSpace("http://tempuri.org/x");
		oModel.setNameSpace("http://tempuri.org/a", "a");
		oModel.setNameSpace("http://tempuri.org/b", "b");
		oModel.setXML(testdata);
		var value = oModel.getProperty("/a:member/1/@lastName");
		assert.equal(value, "Miller", "model value");
		value = oModel.getProperty("/b:member/1/@lastName");
		assert.equal(value, "Spring", "model value");
	});

	QUnit.test("test model namespace custom prefix", function(assert) {
		var oModel = new XMLModel();
		oModel.setNameSpace("http://tempuri.org/a");
		oModel.setNameSpace("http://tempuri.org/x", "x");
		oModel.setNameSpace("http://tempuri.org/b", "y");
		oModel.setXML(testdata);
		var value = oModel.getProperty("/member/1/@lastName");
		assert.equal(value, "Miller", "model value");
		value = oModel.getProperty("/y:member/1/@lastName");
		assert.equal(value, "Spring", "model value");
	});

	QUnit.test("test model namespace attributes", function(assert) {
		var oModel = new XMLModel();
		oModel.setNameSpace("http://tempuri.org/x");
		oModel.setNameSpace("http://tempuri.org/a", "a");
		oModel.setNameSpace("http://tempuri.org/b", "b");
		oModel.setXML(testdata);
		var value = oModel.getProperty("/test/@a:value");
		assert.equal(value, "Namespace a", "model value");
		value = oModel.getProperty("/test/@b:value");
		assert.equal(value, "Namespace b", "model value");
	});

});
