/*global QUnit */
sap.ui.define([
	"sap/ui/core/Element"
], function(Element) {
	"use strict";

	function cleanUpRegistry() {
		Element.registry.forEach(function(oElement) {
			oElement.destroy();
		});
	}

	QUnit.module("Element registry", {
		beforeEach: function () {
			cleanUpRegistry();
		},
		afterEach: function() {
			cleanUpRegistry();
		}
	});

	QUnit.test("Element registry access", function(assert) {
		var oFooA = new Element("A");
		var oFooB = new Element("B");
		var oFooC = new Element("C");
		var fnCallbackSpy = this.spy(function() {});
		var aFilteredElements = [];

		assert.ok(Element.hasOwnProperty("registry"), "Element has static method to access registry");
		assert.equal(Element.registry.size, 3, "Return number of registered element instances");
		assert.deepEqual(Object.keys(Element.registry.all()).sort(), ["A", "B", "C"], "Return all registered element instances");
		assert.ok(Element.getElementById("B") === oFooB, "Return reference of element B from registry by ID");

		Element.registry.forEach(fnCallbackSpy);
		assert.ok(fnCallbackSpy.calledThrice, "Callback was executed 3 times");

		aFilteredElements = Element.registry.filter(function(oElement) {
			return ["B", "C"].indexOf(oElement.getId()) > -1;
		});

		assert.equal(aFilteredElements.length, 2, "Return 2 components matching the filter criteria");

		oFooA.destroy();
		oFooB.destroy();
		oFooC.destroy();
	});

});