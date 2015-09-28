sap.ui.define([
		"sap/ui/demo/worklist/controller/Worklist.controller",
		"sap/ui/demo/worklist/controller/BaseController",
		"sap/ui/base/ManagedObject",
		"test/unit/helper/FakeI18nModel",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	], function(WorklistController, BaseController ,ManagedObject, FakeI18n) {
		"use strict";

		QUnit.module("Table busy indicator delay", {

			setup : function () {
				this.oWorklistController = new WorklistController();
				this.oTableStub = new ManagedObject();
				this.oTableStub.getBusyIndicatorDelay = sinon.stub();
				this.oViewStub = new ManagedObject();
				this.oComponentStub = new ManagedObject();
				this.oComponentStub.setModel(new FakeI18n(), "i18n");

				sinon.stub(this.oWorklistController, "getOwnerComponent").returns(this.oComponentStub);
				sinon.stub(this.oWorklistController, "getView").returns(this.oViewStub);
				sinon.stub(this.oWorklistController, "byId").returns(this.oTableStub);
			},

			teardown : function () {
				this.oWorklistController.destroy();
				this.oTableStub.destroy();
				this.oViewStub.destroy();
				this.oComponentStub.destroy();
			}
		});

		QUnit.test("Should set the initial busyindicator delay to 0", function (assert) {
			// Act
			this.oWorklistController.onInit();

			// Assert
			assert.strictEqual(this.oWorklistController.getModel("worklistView").getData().tableBusyDelay, 0, "The original busy delay was restored");
		});

		QUnit.test("Should reset the busy indicator to the original one after the first request completed", function (assert) {
			// Arrange
			var iOriginalBusyDelay = 1;

			this.oTableStub.getBusyIndicatorDelay.returns(iOriginalBusyDelay);

			// Act
			this.oWorklistController.onInit();
			this.oTableStub.fireEvent("updateFinished");

			// Assert
			assert.strictEqual(this.oWorklistController.getModel("worklistView").getData().tableBusyDelay, iOriginalBusyDelay, "The original busy delay was restored");
		});

	}
);
