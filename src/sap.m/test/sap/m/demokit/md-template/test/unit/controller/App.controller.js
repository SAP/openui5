sap.ui.require(
	[
		"sap/ui/demo/mdtemplate/controller/App.controller",
		"sap/ui/demo/mdtemplate/controller/ListSelector",
		"sap/m/SplitApp",
		"sap/m/List",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	],
	function(AppController, ListSelector, SplitApp, List) {
		"use strict";

		QUnit.module("Hide master");

		QUnit.test("Should hide the master of a SplitApp when selection in the list changes", function (assert) {
			// Arrange
			var oList = new List(),
				oSplitApp = new SplitApp(),
				fnHideMasterSpy = this.spy(oSplitApp,"hideMaster"),
				oListSelector = new ListSelector();

			// Don't resolve the list
			oListSelector._fnResolveListHasBeenSet = jQuery.noop;

			oListSelector.setBoundMasterList(oList);

			// System under Test
			var oAppController = new AppController();
			this.stub(oAppController, "byId").withArgs("idAppControl").returns(oSplitApp);
			this.stub(oAppController, "getView").returns({
				addStyleClass: jQuery.noop
			});
			this.stub(oAppController, "getOwnerComponent").returns({
				oListSelector : oListSelector,
				getCompactCozyClass : jQuery.noop
			});

			// Act
			oAppController.onInit();
			oList.fireEvent("selectionChange");

			// Assert
			assert.strictEqual(fnHideMasterSpy.callCount, 1, "Did hide the master");
		});
	}

);
