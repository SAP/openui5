sap.ui.define([
		"sap/ui/demo/masterdetail/controller/App.controller",
		"sap/m/SplitApp",
		"sap/ui/core/Control",
		"sap/ui/model/json/JSONModel",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	], function(AppController, SplitApp, Control, JSONModel) {
		"use strict";

		QUnit.module("AppController - Hide master");

		QUnit.test("Should hide the master of a SplitApp when selection in the list changes", function (assert) {
			// Arrange
			var fnOnSelectionChange,
				oViewStub = new Control(),
				oODataModelStub = new JSONModel(),
				oComponentStub = new Control(),
				oSplitApp = new SplitApp(),
				fnHideMasterSpy = sinon.spy(oSplitApp,"hideMaster");

			oComponentStub.oListSelector = {
				attachListSelectionChange : function (fnFunctionToCall, oListener) {
					fnOnSelectionChange = fnFunctionToCall.bind(oListener);
				}
			};
			oComponentStub.getContentDensityClass = jQuery.noop;

			oODataModelStub.metadataLoaded = function () {
				return {
					then : jQuery.noop
				};
			};
			oComponentStub.setModel(oODataModelStub);

			// System under Test
			var oAppController = new AppController();

			this.stub(oAppController, "byId").withArgs("idAppControl").returns(oSplitApp);
			this.stub(oAppController, "getView").returns(oViewStub);
			this.stub(oAppController, "getOwnerComponent").returns(oComponentStub);

			// Act
			oAppController.onInit();
			assert.ok(fnOnSelectionChange, "Did register to the change event of the ListSelector");
			// Simulate the event of the list
			fnOnSelectionChange();

			// Assert
			assert.strictEqual(fnHideMasterSpy.callCount, 1, "Did hide the master");
		});

	}
);