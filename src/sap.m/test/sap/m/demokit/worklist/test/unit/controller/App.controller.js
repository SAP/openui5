sap.ui.require(
	[
		"sap/ui/demo/worklist/controller/App.controller",
		"sap/ui/core/mvc/Controller",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	],
	function(AppController, Controller) {
		"use strict";

		QUnit.module("Initialization", {
			setup: function () {
				var oViewStub = {
						getModel: function () {
							return this.oViewModel;
						}.bind(this),
						setModel: function (oModel) {
							this.oViewModel = oModel;
						}.bind(this),
						getBusyIndicatorDelay: function () {
							return null;
						}
					};

				this.oComponentStub = {
					oWhenMetadataIsLoaded: {
					}
				};

				sinon.config.useFakeTimers = false;

				sinon.stub(Controller.prototype, "getOwnerComponent").returns(this.oComponentStub);
				sinon.stub(Controller.prototype, "getView").returns(oViewStub);
			},
			teardown: function () {
				Controller.prototype.getOwnerComponent.restore();
				Controller.prototype.getView.restore();

				this.oViewModel.destroy();
			}
		});

		QUnit.test("Should set the control busy without delay", function (assert) {
			// Arrange
			var oModelData,
				oAppController;

			// Do not resolve the thenable
			this.oComponentStub.oWhenMetadataIsLoaded.then = jQuery.noop;

			// Act
			oAppController = new AppController();
			oAppController.onInit();

			oModelData = this.oViewModel.getData();
			// Assert
			assert.strictEqual(oModelData.delay, 0, "The root view has no busy indicator delay set.");
			assert.strictEqual(oModelData.busy, true, "The root view is busy.");
		});

		QUnit.test("Should set the control not busy and reset the delay", function (assert) {
			var oModelData,
				oAppController;

			this.oComponentStub.oWhenMetadataIsLoaded.then = function (fnThenCallback) {
					// invoke the thenable immediately
					fnThenCallback();

					oModelData = this.oViewModel.getData();
					// Assert
					assert.strictEqual(oModelData.delay, null, "The root view has the default busy indicator delay set.");
					assert.strictEqual(oModelData.busy, false, "The root view is not busy.");
			}.bind(this);

			// Act
			oAppController = new AppController();
			oAppController.onInit();
		});
	}
);
