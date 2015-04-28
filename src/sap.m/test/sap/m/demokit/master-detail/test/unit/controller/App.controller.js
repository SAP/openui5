/*global expect*/
//declare unusual global vars for JSLint/SAPUI5 validation
sap.ui.define(
	[
		"sap/ui/demo/masterdetail/controller/App.controller",
		"sap/ui/demo/masterdetail/controller/ListSelector",
		"sap/m/SplitApp",
		"sap/m/List",
		"sap/ui/base/EventProvider",
		"sap/ui/core/Control",
		'sap/ui/model/json/JSONModel',
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	],
	function(AppController, ListSelector, SplitApp, List, EventProvider, Control, JSONModel) {
		"use strict";

		QUnit.module("Hide master");

		QUnit.test("Should hide the master of a SplitApp when selection in the list changes", function (assert) {
			// Arrange
			var oList = new List(),
				oListSelector = new ListSelector(),
				oViewStub = new Control(),
				oODataModelStub = new JSONModel(),
				oComponentStub = new Control();


			oComponentStub.oListSelector = oListSelector;
			oComponentStub.getCompactCozyClass = jQuery.noop;

			oODataModelStub.metadataLoaded = function () {
				return {
					then: jQuery.noop
				};
			};
			oComponentStub.setModel(oODataModelStub);

			// Don't resolve the list
			//oListSelector._fnResolveListHasBeenSet = jQuery.noop;
			oListSelector._oWhenListHasBeenSet.then(function() {
				sinon.stub(oList, "getBinding").withArgs("items").returns(new EventProvider());
			});

			oListSelector.setBoundMasterList(oList);

			// System under Test
			var oAppController = new AppController();

			this.stub(oAppController, "getView").returns(oViewStub);
			this.stub(oAppController, "getOwnerComponent").returns(oComponentStub);


			// Act
			oAppController.onInit();

			return oListSelector._oWhenListHasBeenSet.then(function () {
				var oSplitApp = new SplitApp(),
					fnHideMasterSpy = sinon.spy(oSplitApp,"hideMaster");
				sinon.stub(oAppController, "byId").withArgs("idAppControl").returns(oSplitApp);
				oList.fireEvent("selectionChange");

				// Assert
				assert.strictEqual(fnHideMasterSpy.callCount, 1, "Did hide the master");
				oList.getBinding.restore();
				oAppController.byId.restore();
			});
		});
	}

);
