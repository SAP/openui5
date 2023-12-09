/*global QUnit */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/ElementRegistry"
], function(Element, ElementRegistry) {
	"use strict";

	function cleanUpRegistry() {
		ElementRegistry.forEach(function(oElement) {
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

		/**
		 * @deprecated As of 1.120, Element.registry has been deprecated
		 */
		assert.ok(Element.hasOwnProperty("registry"), "Element has static property to access registry");
		assert.equal(ElementRegistry.size, 3, "Return number of registered element instances");
		assert.deepEqual(Object.keys(ElementRegistry.all()).sort(), ["A", "B", "C"], "Return all registered element instances");
		assert.ok(Element.getElementById("B") === oFooB, "Return reference of element B from registry by ID");

		ElementRegistry.forEach(fnCallbackSpy);
		assert.ok(fnCallbackSpy.calledThrice, "Callback was executed 3 times");

		aFilteredElements = ElementRegistry.filter(function(oElement) {
			return ["B", "C"].indexOf(oElement.getId()) > -1;
		});

		assert.equal(aFilteredElements.length, 2, "Return 2 components matching the filter criteria");

		oFooA.destroy();
		oFooB.destroy();
		oFooC.destroy();
	});

});