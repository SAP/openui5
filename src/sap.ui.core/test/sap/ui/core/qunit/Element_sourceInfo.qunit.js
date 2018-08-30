/*global QUnit */
sap.ui.define([
	"sap/ui/core/Element"
], function(Element) {
	"use strict";

	QUnit.module("Declarative Source Info");

	QUnit.test("only elements created from XML view should have _sapui_declarativeSourceInfo", function(assert) {
		var element = new Element();
		assert.notOk(element._sapui_declarativeSourceInfo);
	});

	QUnit.test("Cloning elements with declarativeSourceInfo", function(assert) {
		var element = new Element();
		element._sapui_declarativeSourceInfo = {
			xmlNode: {}
		};
		var clone = element.clone();
		assert.notStrictEqual(clone._sapui_declarativeSourceInfo, element._sapui_declarativeSourceInfo);
		assert.deepEqual(clone._sapui_declarativeSourceInfo.xmlNode, element._sapui_declarativeSourceInfo.xmlNode);
	});

});