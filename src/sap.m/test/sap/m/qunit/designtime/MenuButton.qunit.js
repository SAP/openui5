sap.ui.define([
	"sap/m/MenuButton",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/ui/rta/enablement/elementActionTest",
	"sap/ui/thirdparty/sinon-4"
], function (
	MenuButton,
	Menu,
	MenuItem,
	elementDesigntimeTest,
	elementActionTest,
	sinon
) {
	"use strict";

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
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
	})
	.then(function() {
		// Rename action
		var fnConfirmMenuButtonIsRenamedWithNewValue = function (oMenuButton, oViewAfterAction, assert) {
			assert.strictEqual(
				oViewAfterAction.byId("menubtn").getText(),
				"MenuButton New Value",
				"then the control has been renamed to the new value (New Value)"
			);
		};

		var fnConfirmMenuButtonIsRenamedWithOldValue = function (oMenuButton, oViewAfterAction, assert) {
			assert.strictEqual(
				oViewAfterAction.byId("menubtn").getText(),
				"Menu Button",
				"then the control has been renamed to the old value (Menu Button)"
			);
		};

		elementActionTest("Checking the rename action for a MenuButton", {
			xmlView:
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
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
				'</mvc:View>',
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

		// Split action: basic functionality
		var fnConfirmGroupMenuButtonIsSplited = function (oUiComponent,oViewAfterAction, assert) {
			assert.strictEqual(
				oViewAfterAction.byId("toolbar").getContent().length,
				2,
				"then the Toolbar contains 2 buttons"
			);
		};

		var fnConfirmSplitedMenuButtonIsCombined = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(
				oViewAfterAction.byId("toolbar").getContent().length,
				1,
				"then the Toolbar contains 1 menuButton"
			);
		};

		elementActionTest("Split / basic functionality", {
			jsOnly: true,
			xmlView:
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<Page id="page" >' +
						'<customHeader>' +
							'<Toolbar id="toolbar">' +
								'<content>' +
									'<MenuButton id="menubtn">' +
										'<menu>' +
											'<Menu>' +
												'<items>' +
													'<MenuItem id="menuItem1" text="item1"/>' +
													'<MenuItem id="menuItem2" text="item2"/>' +
												'</items>' +
											'</Menu>' +
										'</menu>' +
									'</MenuButton>' +
								'</content>' +
							'</Toolbar>' +
						'</customHeader>' +
					'</Page>' +
				'</mvc:View>',
			action: {
				name: "split",
				controlId: "menubtn",
				parameter: function (oView) {
					return {
						newElementIds: ["btn1" + Math.floor(Math.random() * 100), "btn2" + Math.floor(Math.random() * 100)],
						source: oView.byId("menubtn"),
						parentElement: oView.byId("toolbar")
					};
				}
			},
			layer: "VENDOR",
			afterAction: fnConfirmGroupMenuButtonIsSplited,
			afterUndo: fnConfirmSplitedMenuButtonIsCombined,
			afterRedo: fnConfirmGroupMenuButtonIsSplited
		});

		// Split action: press event propagation
		var fnPressEventFiredCorrectlyAfterSplit = function (oUiComponent,oViewAfterAction, assert) {
			var oButton1 = oViewAfterAction.byId("toolbar").getContent()[0];
			oButton1.firePress();
			assert.strictEqual(window.oPressSpy.callCount, 1, "then the press event handler on the original menu item is called once");
			window.oPressSpy.resetHistory();
		};

		var fnPressEventFiredCorrectlyAfterUndo = function (oUiComponent, oViewAfterAction, assert) {
			var oMenuItem = oViewAfterAction.byId("menuItem1");
			oMenuItem.firePress();
			assert.strictEqual(window.oPressSpy.callCount, 1, "then the press event handler on the original menu item is called once");
			window.oPressSpy.resetHistory();
		};

		elementActionTest("Split / press event propagation", {
			jsOnly: true,
			xmlView:
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<Page id="page" >' +
						'<customHeader>' +
							'<Toolbar id="toolbar">' +
								'<content>' +
									'<MenuButton id="menubtn">' +
										'<menu>' +
											'<Menu>' +
												'<items>' +
													'<MenuItem id="menuItem1" text="item1" press="oPressSpy" />' +
													'<MenuItem id="menuItem2" text="item2"/>' +
												'</items>' +
											'</Menu>' +
										'</menu>' +
									'</MenuButton>' +
								'</content>' +
							'</Toolbar>' +
						'</customHeader>' +
					'</Page>' +
				'</mvc:View>',
			action: {
				name: "split",
				controlId: "menubtn",
				parameter: function (oView) {
					return {
						newElementIds: ["btn1" + Math.floor(Math.random() * 100), "btn2" + Math.floor(Math.random() * 100)],
						source: oView.byId("menubtn"),
						parentElement: oView.byId("toolbar")
					};
				}
			},
			layer: "VENDOR",
			before: function () {
				window.oPressSpy = sinon.spy();
			},
			after: function () {
				delete window.oPressSpy;
			},
			afterAction: fnPressEventFiredCorrectlyAfterSplit,
			afterUndo: fnPressEventFiredCorrectlyAfterUndo,
			afterRedo: fnPressEventFiredCorrectlyAfterSplit
		});

	// The following tests were commented because they rely on "originalButtonId".
	// Reuse of original button is dropped for now, because of 2 things:
	// 1. the case is a bit more complex as it might seem to be since we have ManagedObjectModel in place
	// and reuse has to be implemented in both change handler — Combine and Split, not only in Split;
	// 2. it’s an additional optimization and can be postponed. Implementing this optimization later will not break existent changes.

		// // Split action with button in dependents aggregation and custom data for it
		// var fnConfirmButtonIsTakenOutSuccessfully = function (oUiComponent, oViewAfterAction, assert) {
		// 	var aContent = oViewAfterAction.byId("toolbar").getContent();
		//
		// 	assert.strictEqual(aContent.length, 2, "then the Toolbar contains 2 buttons");
		// 	assert.strictEqual(aContent[1].getText(), "The right button", "then the second button has the correct text");
		// 	assert.strictEqual(aContent[1].getId(), "comp---view--combinedButtonId", "then the second button has the correct id");
		// };
		//
		// var fnConfirmButtonIsSavedAsMenuItemDependent = function (oUiComponent, oViewAfterAction, assert) {
		// 	var oMenuButton = oViewAfterAction.byId("toolbar").getContent()[0];
		// 	var oSecondItem = oMenuButton.getMenu().getItems()[1];
		//
		// 	assert.strictEqual( oViewAfterAction.byId("toolbar").getContent().length, 1,
		// 		"then the Toolbar contains 1 menuButton");
		// 	assert.strictEqual( oSecondItem.getCustomData().length, 1,
		// 		"then the second menu item has 1 customData object");
		// 	assert.strictEqual( oSecondItem.getDependents().length, 2,
		// 		"then the second menu item has 2 dependents");
		// 	assert.strictEqual( oSecondItem.getDependents()[0].getText(), "The right button",
		// 		"then the second menu item's first dependent has the correct text");
		// };
		//
		// elementActionTest("Checking the split action for sap.m.MenuButton with button in dependents aggregation", {
		// 	jsOnly: true,
		// 	xmlView:
		// 		'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:core="sap.ui.core">' +
		// 			'<Page id="page" >' +
		// 				'<customHeader>' +
		// 					'<Toolbar id="toolbar">' +
		// 						'<content>' +
		// 							'<MenuButton id="menubtn">' +
		// 								'<menu>' +
		// 									'<Menu>' +
		// 										'<items>' +
		// 											'<MenuItem text="item1" id="item1"/>' +
		// 											'<MenuItem text="item2" id="item2">' +
		// 												'<customData>' +
		// 													'<core:CustomData id="item2-originalButtonId" key="originalButtonId" value="comp---view--combinedButtonId" />' +
		// 												'</customData>' +
		// 												'<dependents>' +
		// 													'<Button text="The right button" id="combinedButtonId"/>' +
		// 													'<Button text="Not The right button" id="notCombinedButtonId"/>' +
		// 												'</dependents>' +
		// 											'</MenuItem>' +
		// 										'</items>' +
		// 									'</Menu>' +
		// 								'</menu>' +
		// 							'</MenuButton>' +
		// 						'</content>' +
		// 					'</Toolbar>' +
		// 				'</customHeader>' +
		// 			'</Page>' +
		// 		'</mvc:View>',
		// 	action: {
		// 		name: "split",
		// 		controlId: "menubtn",
		// 		parameter: function(oView){
		// 			return {
		// 				newElementIds: ["btn1" + Math.floor(Math.random() * 100), "btn2" + Math.floor(Math.random() * 100)],
		// 				source: oView.byId("menubtn"),
		// 				parentElement: oView.byId("toolbar")
		// 			};
		// 		}
		// 	},
		// 	layer: "VENDOR",
		// 	afterAction: fnConfirmButtonIsTakenOutSuccessfully,
		// 	afterUndo: fnConfirmButtonIsSavedAsMenuItemDependent,
		// 	afterRedo: fnConfirmButtonIsTakenOutSuccessfully
		// });
	});
});