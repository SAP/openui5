/*global QUnit, sinon*/
sap.ui.define([
	'sap/ui/test/matchers/_Busy',
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/Toolbar',
	'sap/m/Page',
	'sap/m/VBox',
	"sap/ui/core/mvc/XMLView",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/test/OpaPlugin"
], function (_Busy, Button, Dialog, Toolbar, Page, VBox, XMLView, nextUIUpdate) {
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
			this.oBusyMatcher = new _Busy();
			this.oSpy = sinon.spy(this.oBusyMatcher._oLogger, "debug");
			return nextUIUpdate();
		},
		afterEach: function () {
			this.oPage.destroy();
			this.oSpy.restore();
			return nextUIUpdate();
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
			nextUIUpdate().then(function() {
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

		QUnit.test("Should not block Dialog, when parent is ComponentContainer, placed in Busy control/view", function (assert) {
			// Arrange
			var oDialog = new Dialog(),
				oVBox = new VBox(),
				oBusy = new _Busy(),
				fnDone = assert.async();

			var oXmlString = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">',
				'</mvc:View>'
			];

			XMLView.create({
				id: "comp---view",
				definition: oXmlString
			}).then(function (oView) {

				sap.ui.define("my2/Component", [
					"sap/ui/core/UIComponent"
				], function(UIComponent) {

					return UIComponent.extend("my2.Component", {

						metadata: {
							manifest: {}
						},

						createContent: function() {
							return oView;
						}

					});
				});

				sap.ui.require([
					"my2/Component", "sap/ui/core/ComponentContainer"
				], function(MyComponent, ComponentContainer) {

					var oContainer = new ComponentContainer({
						//name: "my"
						component: new MyComponent()
					});

					oVBox.addItem(oContainer);
					oVBox.placeAt("qunit-fixture");
					oView.addDependent(oDialog);
					nextUIUpdate().then(function() {
						// Assert
						assert.strictEqual(oBusy.isMatching(oDialog), false, "Button is not busy");

						// Act
						oVBox.setBusy(true);
						oDialog.open();

						// Assert
						assert.strictEqual(oBusy.isMatching(oDialog), false, "Button is not busy");

						// Clean up
						oContainer.destroy();
						fnDone();
					});
				});

			});

		});

	});
});
