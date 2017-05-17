/*global QUnit*/

(function () {
	"use strict";

	jQuery.sap.require("sap/ui/support/supportRules/ExecutionScope");

	var core;

	sap.ui.getCore().registerPlugin({
		startPlugin: function (oCore) {
			core = oCore;
		}
	});

	QUnit.module("Execution Scope API test", {
		setup: function () {
			this.page = new sap.m.Page({
				content: [
					new sap.m.Panel({
						id: "innerPanel",
						content: [
							new sap.m.Panel({
								content: [
									new sap.m.Input(),
									new sap.m.Input()
								]
							}),
							new sap.m.Button()
						]
					}),
					new sap.m.MaskInput(),
					new sap.m.ComboBox(),
					new sap.m.Button()
				]
			});
			this.page.placeAt("qunit-fixture");

			this.es = sap.ui.support.supportRules.ExecutionScope(core, {
				type: "global"
			});
		},
		teardown: function () {
			this.es = null;
			this.page.destroy();
		}
	});

	QUnit.test("Fixed public methods", function (assert) {
		var getElementsIsAMethod = this.es.getElements && typeof this.es.getElements == "function",
			getLoggedObjectsIsAMethod = this.es.getLoggedObjects && typeof this.es.getLoggedObjects == "function",
			getElementsByClassName = this.es.getElementsByClassName && typeof this.es.getElementsByClassName == "function";

		assert.ok(getElementsIsAMethod, " should not be changed");
		assert.ok(getLoggedObjectsIsAMethod, " should not be changed");
		assert.ok(getElementsByClassName, " should not be changed");
	});

	QUnit.test("getElementsByClassName", function (assert) {
		var pageElements = this.es.getElementsByClassName("sap.m.Page"),
			buttonElements = this.es.getElementsByClassName(sap.m.Button),
			inputBaseElements = this.es.getElementsByClassName(sap.m.InputBase);

		assert.equal(pageElements[0], this.page, "should select the sap.m.Page");
		assert.equal(buttonElements.length, 2, "should select 2 elements");
		assert.equal(inputBaseElements.length, 4, "should select 4 inherited elements");
	});

	QUnit.test("Return type of get functions", function (assert) {
		var elements = this.es.getElements(),
			elementsById = this.es.getElementsByClassName("sap.m.Page");
		assert.equal(elements.constructor, Array, "type should be array");
		assert.equal(elementsById.constructor, Array, "type should be array");
	});

	QUnit.test("getElements with global context", function (assert) {
		var elements = this.es.getElements();
		assert.equal(elements.length, Object.keys(core.mElements).length, " should be equal to core mElements");
	});

	QUnit.test("getElements with subtree context", function (assert) {
		var elementsInCore = this.es.getElements();
		var esNew = sap.ui.support.supportRules.ExecutionScope(core, {
			type: "subtree",
			parentId: "innerPanel"
		});

		var elements = esNew.getElements();

		assert.ok(elements.length >= 4, "atleast 4 elements should be in this context");
		assert.ok(elements.length < elementsInCore.length, "should be with less elements than global scope");
	});
}());
