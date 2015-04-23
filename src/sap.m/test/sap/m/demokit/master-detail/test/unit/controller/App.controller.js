/*global expect*/
//declare unusual global vars for JSLint/SAPUI5 validation
sap.ui.require(
	[
		"sap/ui/demo/masterdetail/controller/App.controller",
		"sap/ui/demo/masterdetail/controller/ListSelector",
		"sap/m/SplitApp",
		"sap/m/List",
		"sap/ui/base/EventProvider",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	],
	function(AppController, ListSelector, SplitApp, List, EventProvider) {
		"use strict";

		QUnit.module("Hide master");

		QUnit.test("Should hide the master of a SplitApp when selection in the list changes", function (assert) {
			expect(0);
			// Arrange
			var oList = new List(),
				oListSelector = new ListSelector();

			// Don't resolve the list
			//oListSelector._fnResolveListHasBeenSet = jQuery.noop;
			oListSelector._oWhenListHasBeenSet.then(function() {
				this.stub(oList, "getBinding").withArgs("items").returns(new EventProvider());
			}.bind(this));

			oListSelector.setBoundMasterList(oList);

			// System under Test
			var oAppController = new AppController();

			this.stub(oAppController, "getView").returns({
				addStyleClass: jQuery.noop,
				getBusyIndicatorDelay: jQuery.noop,
				setModel: jQuery.noop
			});
			this.stub(oAppController, "getOwnerComponent").returns({
				oListSelector : oListSelector,
				getCompactCozyClass : jQuery.noop,
				oWhenMetadataIsLoaded : new Promise(function (fnResolveMetaDataLoaded) {})
			});


			// Act
			oAppController.onInit();

			return oListSelector._oWhenListHasBeenSet.then(function () {
				var oSplitApp = new SplitApp(),
					fnHideMasterSpy = this.spy(oSplitApp,"hideMaster");
				this.stub(oAppController, "byId").withArgs("idAppControl").returns(oSplitApp);
				oList.fireEvent("selectionChange");
				// Assert
				assert.strictEqual(fnHideMasterSpy.callCount, 1, "Did hide the master");
			}.bind(this));
		});
	}

);
