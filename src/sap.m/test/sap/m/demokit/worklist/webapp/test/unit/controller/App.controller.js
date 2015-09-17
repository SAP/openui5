sap.ui.define([
		"sap/ui/demo/worklist/controller/App.controller",
		"sap/ui/core/Control",
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	], function(AppController, Control, Controller, JSONModel) {
		"use strict";

		QUnit.module("Initialization", {

			setup : function () {
				this.oViewStub = new Control();
				this.oComponentStub = new Control();

				this.fnMetadataThen = jQuery.noop;
				var oODataModelStub = new JSONModel();
				oODataModelStub.metadataLoaded = function () {
					return {
						then: this.fnMetadataThen
					};
				}.bind(this);

				this.oComponentStub.setModel(oODataModelStub);
				this.oComponentStub.getContentDensityClass = function() {
					return "sapUiSizeCompact";
				};

				sinon.config.useFakeTimers = false;

				sinon.stub(Controller.prototype, "getOwnerComponent").returns(this.oComponentStub);
				sinon.stub(Controller.prototype, "getView").returns(this.oViewStub);
			},

			teardown : function () {
				Controller.prototype.getOwnerComponent.restore();
				Controller.prototype.getView.restore();

				this.oViewStub.destroy();
				this.oComponentStub.destroy();
			}
		});

		QUnit.test("Should set the control busy without delay", function (assert) {
			// Arrange
			var oModelData,
				oAppController;

			// Act
			oAppController = new AppController();
			oAppController.onInit();

			oModelData = this.oViewStub.getModel("appView").getData();
			// Assert
			assert.strictEqual(oModelData.delay, 0, "The root view has no busy indicator delay set.");
			assert.strictEqual(oModelData.busy, true, "The root view is busy.");
		});

		QUnit.test("Should set the control not busy and reset the delay", function (assert) {
			var oModelData,
				oAppController;

			this.fnMetadataThen = function (fnThenCallback) {
				// invoke the thenable immediately
				fnThenCallback();

				oModelData = this.oViewStub.getModel("appView").getData();
				// Assert
				assert.strictEqual(oModelData.delay, this.oViewStub.getBusyIndicatorDelay(), "The root view has the default busy indicator delay set.");
				assert.strictEqual(oModelData.busy, false, "The root view is not busy.");
			}.bind(this);

			// Act
			oAppController = new AppController();
			oAppController.onInit();
		});

	}
);
