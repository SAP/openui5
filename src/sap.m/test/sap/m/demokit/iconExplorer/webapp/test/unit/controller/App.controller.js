/*global QUnit,sinon*/

sap.ui.define([
	"sap/ui/demo/iconexplorer/controller/App.controller",
	"sap/ui/core/Control",
	"sap/ui/core/mvc/Controller"
], function (AppController, Control, Controller) {
	"use strict";

	QUnit.module("App controller tests", {

		beforeEach : function () {
			this.oViewStub = new Control();
			this.oComponentStub = new Control();

			this.fnMetadataThen = function() {};

			this.oComponentStub.iconsLoaded = function () {
				return {
					then: this.fnMetadataThen
				};
			}.bind(this);

			this.oComponentStub.getContentDensityClass = function() {
				return "sapUiSizeCompact";
			};

			sinon.config.useFakeTimers = false;

			sinon.stub(Controller.prototype, "getOwnerComponent").returns(this.oComponentStub);
			sinon.stub(Controller.prototype, "getView").returns(this.oViewStub);
		},

		afterEach : function () {
			Controller.prototype.getOwnerComponent.restore();
			Controller.prototype.getView.restore();

			this.oViewStub.destroy();
			this.oComponentStub.destroy();
		}
	});

	QUnit.test("Should set the app view busy without delay", function (assert) {
		// Arrange
		var oModelData,
			oAppController;

		// Act
		oAppController = new AppController();
		oAppController.onInit();

		oModelData = this.oViewStub.getModel("view").getData();
		// Assert
		assert.strictEqual(oModelData.delay, 0, "The root view has no busy indicator delay set.");
		assert.strictEqual(oModelData.busy, true, "The root view is busy.");
	});

	QUnit.test("Should set the app view not busy and reset the delay", function (assert) {
		var oModelData,
			oAppController;

		this.fnMetadataThen = function (fnThenCallback) {
			// invoke the thenable immediately
			fnThenCallback();

			oModelData = this.oViewStub.getModel("view").getData();
			// Assert
			assert.strictEqual(oModelData.delay, this.oViewStub.getBusyIndicatorDelay(), "The root view has the default busy indicator delay set.");
			assert.strictEqual(oModelData.busy, false, "The root view is not busy.");
		}.bind(this);

		// Act
		oAppController = new AppController();
		oAppController.onInit();
	});

});
