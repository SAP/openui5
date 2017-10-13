/*global QUnit*/

(function () {
	'use strict';

	sap.ui.require([
		"sap/ui/dt/test/report/QUnit",
		"sap/ui/dt/test/ElementEnablementTest",
		"sap/m/MenuButton",
		"sap/m/Menu",
		"sap/m/MenuItem",
		"sap/ui/rta/test/controlEnablingCheck",
		"sap/m/changeHandler/SplitMenuButton",
		"sap/f/DynamicPageTitle"
	], function (
		QUnitReport,
		ElementEnablementTest,
		MenuButton,
		Menu,
		MenuItem,
		rtaControlEnablingCheck,
		SplitMenuButton,
		DynamicPageTitle) {

		var oElementEnablementTest = new ElementEnablementTest({
			type: "sap.m.MenuButton",
			create: function () {
				return new MenuButton({
					menu: new Menu({
						items: [
							new MenuItem(),
							new MenuItem()
						]
					})
				});
			}
		});

		oElementEnablementTest.run().then(function (oData) {
			new QUnitReport({
				data: oData
			});
		});

		// Rename action
		var fnConfirmMenuButtonIsRenamedWithNewValue = function (oMenuButton, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("menubtn").getText(),
				"MenuButton New Value",
				"then the control has been renamed to the new value (New Value)");
		};

		var fnConfirmMenuButtonIsRenamedWithOldValue = function (oMenuButton, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("menubtn").getText(),
				"Menu Button",
				"then the control has been renamed to the old value (Menu Button)");
		};

		rtaControlEnablingCheck("Checking the rename action for a MenuButton", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
			'<MenuButton id="menubtn" text="Menu Button">' +
			'<menu>' +
			'<Menu>' +
			'<items>' +
			'<MenuItem text="item1"/>' +
			'<MenuItem text="item2"/>' +
			'</items>' +
			'</Menu>' +
			'</menu>' +
			'</MenuButton>' +
			'</mvc:View>'
			,
			action: {
				name: "rename",
				controlId: "menubtn",
				parameter: function (oView) {
					return {
						newValue: 'MenuButton New Value',
						renamedElement: oView.byId("menubtn")
					};
				}
			},
			afterAction: fnConfirmMenuButtonIsRenamedWithNewValue,
			afterUndo: fnConfirmMenuButtonIsRenamedWithOldValue,
			afterRedo: fnConfirmMenuButtonIsRenamedWithNewValue
		});

		// Split action
		var fnConfirmGroupMenuButtonIsSplited = function (oUiComponent,oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("toolbar").getContent().length, 2,
				"then the Toolbar contains 2 buttons");

			sap.ui.getCore().byId("comp---view--menubtn").destroy();
		};

		var fnConfirmSplitedMenuButtonIsCombined = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("toolbar").getContent().length, 1,
				"then the Toolbar contains 1 menuButton");

		};

		rtaControlEnablingCheck("Checking the split action for sap.m.MenuButton", {
			jsOnly : true,
			xmlView :
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
			'<Page id="page" >' +
			'<customHeader>' +
			'<Toolbar id="toolbar">' +
			'<content>' +
			'<MenuButton id="menubtn">' +
			'<menu>' +
			'<Menu>' +
			'<items>' +
			'<MenuItem text="item1"/>' +
			'<MenuItem text="item2"/>' +
			'</items>' +
			'</Menu>' +
			'</menu>' +
			'</MenuButton>' +
			'</content>' +
			'</Toolbar>' +
			'</customHeader>' +
			'</Page>' +
			'</mvc:View>'
			,
			action : {
				name : "split",
				controlId : "menubtn",
				parameter : function(oView){
					return {
						newElementIds : ["btn1", "btn2"],
						source : oView.byId("menubtn"),
						parentElement : oView.byId("toolbar")
					};
				}
			},
			layer: "VENDOR",
			afterAction : fnConfirmGroupMenuButtonIsSplited,
			afterUndo : fnConfirmSplitedMenuButtonIsCombined,
			afterRedo : fnConfirmGroupMenuButtonIsSplited
		});

		// Split action with button in dependents aggregation and custom data for it
		var fnConfirmButtonIsTakenOutSuccessfully = function (oUiComponent, oViewAfterAction, assert) {
			var aContent = oViewAfterAction.byId("toolbar").getContent();

			assert.strictEqual( aContent.length, 2,
				"then the Toolbar contains 2 buttons");
			assert.strictEqual( aContent[1].getText(), "The right button",
				"then the second button has the correct text");
			assert.strictEqual( aContent[1].getId(), "comp---view--combinedButtonId",
				"then the second button has the correct id");

			sap.ui.getCore().byId("comp---view--menubtn").destroy();
		};

		var fnConfirmButtonIsSavedAsMenuItemDependent = function (oUiComponent, oViewAfterAction, assert) {
			var oMenuButton = oViewAfterAction.byId("toolbar").getContent()[0],
				oSecondItem = oMenuButton.getMenu().getItems()[1];

			assert.strictEqual( oViewAfterAction.byId("toolbar").getContent().length, 1,
				"then the Toolbar contains 1 menuButton");
			assert.strictEqual( oSecondItem.getCustomData().length, 1,
				"then the second menu item has 1 customData object");
			assert.strictEqual( oSecondItem.getDependents().length, 2,
				"then the second menu item has 2 dependents");
			assert.strictEqual( oSecondItem.getDependents()[0].getText(), "The right button",
				"then the second menu item's first dependent has the correct text");
		};

		rtaControlEnablingCheck("Checking the split action for sap.m.MenuButton with button in dependents aggregation", {
			jsOnly : true,
			xmlView :
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:core="sap.ui.core">' +
			'<Page id="page" >' +
			'<customHeader>' +
			'<Toolbar id="toolbar">' +
			'<content>' +
			'<MenuButton id="menubtn">' +
			'<menu>' +
			'<Menu>' +
			'<items>' +
			'<MenuItem text="item1" id="item1"/>' +
			'<MenuItem text="item2" id="item2">' +
			'<customData>' +
			'<core:CustomData id="item2-originalButtonId" key="originalButtonId" value="comp---view--combinedButtonId" />' +
			'</customData>' +
			'<dependents>' +
			'<Button text="The right button" id="combinedButtonId"/>' +
			'<Button text="Not The right button" id="notCombinedButtonId"/>' +
			'</dependents>' +
			'</MenuItem>' +
			'</items>' +
			'</Menu>' +
			'</menu>' +
			'</MenuButton>' +
			'</content>' +
			'</Toolbar>' +
			'</customHeader>' +
			'</Page>' +
			'</mvc:View>'
			,
			action : {
				name : "split",
				controlId : "menubtn",
				parameter : function(oView){
					return {
						newElementIds : ["btn1"],
						source : oView.byId("menubtn"),
						parentElement : oView.byId("toolbar")
					};
				}
			},
			layer: "VENDOR",
			afterAction : fnConfirmButtonIsTakenOutSuccessfully,
			afterUndo : fnConfirmButtonIsSavedAsMenuItemDependent,
			afterRedo : fnConfirmButtonIsTakenOutSuccessfully
		});

		QUnit.module("Additional tests: ");

		// Sometimes the menu button can be in a control with overwritten aggregation methods.
		// That is why we need new helper function which will find the index of the control in its parrent
		// aggregation by applying the method with the overwritten logic.
		QUnit.test("Find indexes in aggregation named content: ", function(assert) {
			var oToolbar = new sap.m.Toolbar();
			var oButton1 = new sap.m.Button({
				text : "Button 1"
			});
			var oButton2 = new sap.m.Button({
				text : "Button 2"
			});

			oToolbar.addContent(oButton1);
			oToolbar.addContent(oButton2);
			sap.ui.getCore().applyChanges();

			var fnSplitHandlerHelper = SplitMenuButton.ADD_HELPER_FUNCTIONS._fnFindIndexInAggregation;

			assert.ok(fnSplitHandlerHelper, "The '_fnFindIndexInAggregation' helper function exists.");
			assert.strictEqual(fnSplitHandlerHelper(oToolbar, oButton1, "content"), 0, "The function finds the corect index of the first button in its parrent aggregation.");
			assert.strictEqual(fnSplitHandlerHelper(oToolbar, oButton2, "content"), 1, "The function finds the corect index of the second button in its parrent aggregation.");
		});

		QUnit.test("Find indexes in aggregation named actions: ", function(assert) {
			var oTitle = new DynamicPageTitle();
			var oAction1 = new sap.m.Button({
				text : "Action 1"
			});
			var oAction2 = new sap.m.Button({
				text : "Action 2"
			});

			oTitle.addAction(oAction1);
			oTitle.addAction(oAction2);
			sap.ui.getCore().applyChanges();

			var fnSplitHandlerHelper = SplitMenuButton.ADD_HELPER_FUNCTIONS._fnFindIndexInAggregation;

			assert.strictEqual(fnSplitHandlerHelper(oTitle, oAction1, "actions"), 0, "The function finds the corect index of the first action in its parrent aggregation.");
			assert.strictEqual(fnSplitHandlerHelper(oTitle, oAction2, "actions"), 1, "The function finds the corect index of the second action in its parrent aggregation.");
		});

	});
})();