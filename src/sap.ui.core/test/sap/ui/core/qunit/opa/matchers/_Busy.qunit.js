/*global QUnit, sinon*/
sap.ui.define([
	'sap/ui/test/matchers/_Busy',
	'sap/m/Button',
	'sap/m/Toolbar',
	'sap/m/Page',
	'sap/m/VBox'
], function (_Busy, Button, Toolbar, Page, VBox) {
	"use strict";

	QUnit.module("_Busy", {
		beforeEach: function () {
			this.oButton = new Button();
			this.oToolbar = new Toolbar({
				content: [this.oButton]
			});
			this.oPage = new Page({
				content: [this.oToolbar]
			});
			this.oPage.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			this.oBusyMatcher = new _Busy();
			this.oSpy = sinon.spy(this.oBusyMatcher._oLogger, "debug");
		},
		afterEach: function () {
			this.oPage.destroy();
			sap.ui.getCore().applyChanges();
			this.oSpy.restore();
		}
	});

	QUnit.test("Should match when control is busy", function (assert) {
		this.oPage.setBusy(true);
		assert.ok(this.oBusyMatcher.isMatching(this.oPage));
		sinon.assert.calledWithMatch(this.oSpy, /Control 'Element sap.m.Page.*' is busy/);
	});

	QUnit.test("Should match when control has a busy parent", function (assert) {
		this.oPage.setBusy(true);
		assert.ok(this.oBusyMatcher.isMatching(this.oButton));
		sinon.assert.calledWithMatch(this.oSpy, /has a parent 'Element sap.m.Page.*' that is busy/);
	});

	QUnit.test("Should not match when control is not busy", function (assert) {
		assert.ok(!this.oBusyMatcher.isMatching(this.oButton));
		assert.ok(!this.oBusyMatcher.isMatching(this.oPage));
		sinon.assert.notCalled(this.oSpy);
	});

	QUnit.module("_Busy in ComponentContainer");

	QUnit.test("Should match when parent is ComponentContainer", function (assert) {
		// Arrange
		var oButton = new Button({text: "Hello World"}),
			oVBox = new VBox({
				items: [oButton]
			}),
			oBusy = new _Busy(),
			fnDone = assert.async();

		sap.ui.define("my/Component", [
			"sap/ui/core/UIComponent"
		], function(UIComponent) {

			return UIComponent.extend("my.Component", {

				metadata: {
					manifest: {}
				},

				createContent: function() {
					return oVBox;
				}

			});

		});

		sap.ui.require([
			"my/Component", "sap/ui/core/ComponentContainer"
		], function(MyComponent, ComponentContainer) {

			var oContainer = new ComponentContainer({
				//name: "my"
				component: new MyComponent()
			});

			oContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// Assert
			assert.strictEqual(oBusy.isMatching(oButton), false, "Button is not busy");

			// Act
			oContainer.setBusy(true);

			// Assert
			assert.strictEqual(oBusy.isMatching(oButton), true, "Button is busy");

			// Clean up
			oContainer.destroy();
			fnDone();
		});
	});
});
