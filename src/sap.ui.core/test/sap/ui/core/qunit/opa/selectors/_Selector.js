/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/test/selectors/_Selector",
	"sap/ui/core/Element",
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/XMLView",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (_Selector, Element, View, XMLView, Button, Dialog, nextUIUpdate) {
	"use strict";

	var singleStub = sinon.stub();
	var multiStub = sinon.stub();
	var SingleSelector = _Selector.extend("SingleSelector", {
		_generate: singleStub
	});
	var MultiSelector = _Selector.extend("MultiSelector", {
		_generate: multiStub
	});

	QUnit.module("_Selector", {
		beforeEach: function (assert) {
			// Note: This test is executed with QUnit 1 and QUnit 2.
			//       We therefore cannot rely on the built-in promise handling of QUnit 2.
			return XMLView.create({
				id: "myView",
				definition:
					'<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<App id="myApp"><Page id="page1"><Input id="myInput"></Input></Page></App>' +
					'</mvc:View>'
			}).then(function(oView) {
				this.oView = oView.placeAt("qunit-fixture");
				this.oInput = this.oView.byId("myInput");
				return nextUIUpdate();
			}.bind(this), function(oErr) {
				assert.strictEqual(oErr, undefined, "failed to load view");
			});
		},
		afterEach: function () {
			this.oView.destroy();
		}
	});

	QUnit.test("Should add basic selectors", function (assert) {
		singleStub.returns({
			property: "value"
		});
		var oSelector = new SingleSelector();
		var mSelector = oSelector.generate(this.oInput);
		assert.strictEqual(mSelector.property, "value", "Should add _generate result");
		assert.strictEqual(mSelector.controlType, "sap.m.Input", "Should add controlType");
		assert.strictEqual(mSelector.viewId, "myView", "Should add view ID");
		assert.ok(!mSelector.searchOpenDialogs, "Should not add searchOpenDialogs by default");
	});

	QUnit.test("Should skip basic matchers when requested", function (assert) {
		singleStub.returns({
			skipBasic: true
		});
		var oSelector = new SingleSelector();
		var mSelector = oSelector.generate(this.oInput);
		assert.ok(!Object.keys(mSelector).length, "Should skip basic selectors");
	});

	QUnit.test("Should handle multiple selectors", function (assert) {
		multiStub.returns([{
			property: "value0"
		}, {
			property: "value1"
		}]);
		var oSelector = new MultiSelector();
		var aSelectors = oSelector.generate(this.oInput);
		aSelectors.forEach(function (mSelector, i) {
			assert.strictEqual(mSelector.property, "value" + i, "Should add _generate result");
			assert.strictEqual(mSelector.controlType, "sap.m.Input", "Should add controlType");
			assert.strictEqual(mSelector.viewId, "myView", "Should add view ID");
		});
	});

	QUnit.test("Should handle selector with multiple parts", function (assert) {
		multiStub.returns([[{
			bindingPath: { path: "value0" }
		}, {
			bindingPath: { path: "value1" }
		}]]);
		var oSelector = new MultiSelector();
		var aSelectors = oSelector.generate(this.oInput)[0];
		aSelectors.forEach(function (mSelector, i) {
			assert.strictEqual(mSelector.bindingPath.path, "value" + i, "Should add _generate result");
			assert.strictEqual(mSelector.controlType, "sap.m.Input", "Should add controlType");
			assert.strictEqual(mSelector.viewId, "myView", "Should add view ID");
		});
	});

	QUnit.test("Should find ancestor satisfying a condition", function (assert) {
		var oSelector = new SingleSelector();
		var oAncestor = oSelector._findAncestor(this.oInput, function (oControl) {
			return oControl instanceof View;
		});
		assert.strictEqual(oAncestor.getId(), "myView", "Should find correct ancestor");
	});

	QUnit.test("Should not require ancestor and validation root by default", function (assert) {
		var oSelector = new SingleSelector();
		assert.ok(!oSelector._isAncestorRequired());
		assert.ok(!oSelector._isValidationRootRequired());
		assert.strictEqual(oSelector._getAncestor(), null);
		assert.strictEqual(oSelector._getValidationRoot(), null);
	});

	QUnit.test("Should add searchOpenDialogs flag when control is in static area", function (assert) {
		this.oDialogButton = new Button({
			text: "Close",
			press: function () {
				this.oDialog.close();
			}.bind(this)
		});
		this.oDialog = new Dialog({
			title: "static area test",
			beginButton: this.oDialogButton
		});
		singleStub.returns({
			property: "value"
		});
		var oSelector = new SingleSelector();
		var mSelector = oSelector.generate(this.oDialogButton);
		assert.strictEqual(mSelector.property, "value", "Should add _generate result");
		assert.ok(!mSelector.searchOpenDialogs, "Should not add searchOpenDialogs when dialog is not open");

		this.oDialog.open();
		mSelector = oSelector.generate(this.oDialogButton);
		assert.strictEqual(mSelector.property, "value", "Should add _generate result");
		assert.ok(mSelector.searchOpenDialogs, "Should add searchOpenDialogs when dialog is open");

		this.oDialog.destroy();
	});

	// simulate the way generic tiles are rendered inside a JS view in certain apps
	// (to avoid legacy APIs, a typed view is used instead of a JS view)
	sap.ui.define("tileWrapperView", [
		"sap/m/GenericTile",
		"sap/m/NumericContent",
		"sap/m/TileContent",
		"sap/ui/core/mvc/View"
	], function(GenericTile, NumericContent, TileContent, View) {
		var i = -1;
		return View.extend("tileWRapperView", {
			createContent: function () {
				i += 1;
				return new GenericTile({
					id: "tile-" + i,
					header: "Tile " + i,
					tileContent: [new TileContent({
						footer: "Footer notes " + i,
						content: new NumericContent({
							value: 123 + i
						})
					})]
				});
			},
			getControllerName: function() {
				return ""; // no controller
			}
		});
	});

	QUnit.module("_Selector - views", {
		beforeEach: function (assert) {
			// Note: This test is executed with QUnit 1 and QUnit 2.
			//       We therefore cannot rely on the built-in promise handling of QUnit 2.

			// create 3 new numeric tiles.
			return XMLView.create({
				id: "myView",
				definition:
					'<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'  <App id="myApp"><Page id="page1">' +
					'    <mvc:View viewName="module:tileWrapperView"/>' +
					'    <mvc:View viewName="module:tileWrapperView"/>' +
					'    <mvc:View viewName="module:tileWrapperView"/>' +
					'  </Page></App>' +
					'</mvc:View>'
			}).then(function(oView) {
				this.oView = oView.placeAt("qunit-fixture");
				return nextUIUpdate();
			}.bind(this), function(oErr) {
				assert.strictEqual(oErr, undefined, "failed to load view");
			});
		},
		afterEach: function () {
			this.oView.destroy();
		}
	});

	QUnit.test("Should skip viewName when multiple views will match", function (assert) {
		var oTile = Element.getElementById("tile-0");
		singleStub.returns({
			property: "value"
		});
		var oSelector = new SingleSelector();
		var mSelector = oSelector.generate(oTile);
		assert.strictEqual(mSelector.property, "value", "Should add _generate result");
		assert.strictEqual(mSelector.controlType, "sap.m.GenericTile", "Should add controlType");
		assert.ok(!mSelector.viewId, "myView", "Should not add generated view ID");
		assert.ok(!mSelector.viewName, "myView", "Should not add non-unique view name");
	});
});
