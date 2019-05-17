/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Element"
], function(Element) {
	"use strict";

	QUnit.module("Element base functionality");

	QUnit.test("Element registry access", function(assert) {
		var oFooA = new Element("A");
		var oFooB = new Element("B");
		var oFooC = new Element("C");
		var fnCallbackSpy = sinon.spy(function() {});
		var aFilteredElements = [];

		assert.ok(Element.hasOwnProperty("registry"), "Element has static method to access registry");
		assert.equal(Element.registry.size, 3, "Return number of registered element instances");
		assert.deepEqual(Object.keys(Element.registry.all()), ["A", "B", "C"], "Return all registered element instances");
		assert.deepEqual(Element.registry.get("B"), oFooB, "Return reference of element B from registry by ID");

		Element.registry.forEach(fnCallbackSpy);
		assert.ok(fnCallbackSpy.calledThrice, "Callback was executed 3 times");

		aFilteredElements = Element.registry.filter(function(oComponent) {
			return ["B", "C"].indexOf(oComponent.getId()) > -1;
		});

		assert.equal(aFilteredElements.length, 2, "Return 2 components matching the filter criteria");

		oFooA.destroy();
		oFooB.destroy();
		oFooC.destroy();

		fnCallbackSpy.reset();
	});

});