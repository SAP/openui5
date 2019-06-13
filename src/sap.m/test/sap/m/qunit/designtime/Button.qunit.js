/*global QUnit*/

sap.ui.define([
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/ui/rta/enablement/elementActionTest",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/CustomData",
	"sap/ui/thirdparty/sinon-4"
], function (
	elementDesigntimeTest,
	elementActionTest,
	JSONModel,
	CustomData,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
			type: "sap.m.Button"
		});
	})
	.then(function() {
		// Rename action
		var fnConfirmButtonRenamedWithNewValue = function (oButton, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("button").getText(),
				"New Option",
				"then the control has been renamed to the new value (New Option)");
		};

		var fnConfirmButtonIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("button").getText(),
				"Option 1",
				"then the control has been renamed to the old value (Option 1)");
		};

		elementActionTest("Checking the rename action for a Button", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
			'<m:Button text="Option 1" id="button" />' +
			'</mvc:View>'
			,
			action: {
				name: "rename",
				controlId: "button",
				parameter: function (oView) {
					return {
						newValue: 'New Option',
						renamedElement: oView.byId("button")
					};
				}
			},
			afterAction: fnConfirmButtonRenamedWithNewValue,
			afterUndo: fnConfirmButtonIsRenamedWithOldValue,
			afterRedo: fnConfirmButtonRenamedWithNewValue
		});

		// Remove and reveal actions
		var fnConfirmButtonIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("button").getVisible(), false, "then the Button element is invisible");
		};

		var fnConfirmButtonIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("button").getVisible(), true, "then the Button element is visible");
		};

		elementActionTest("Checking the remove action for Button", {
			xmlView:
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
					'<m:Button text="Option 1" id="button" />' +
				'</mvc:View>',
			action: {
				name: "remove",
				controlId: "button",
				parameter: function (oView) {
					return {
						removedElement: oView.byId("button")
					};
				}
			},
			afterAction: fnConfirmButtonIsInvisible,
			afterUndo: fnConfirmButtonIsVisible,
			afterRedo: fnConfirmButtonIsInvisible
		});

		elementActionTest("Checking the reveal action for a Button", {
			xmlView:
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
					'<m:Button text="Option 1" id="button" visible="false"/>' +
				'</mvc:View>',
			action: {
				name: "reveal",
				controlId: "button",
				parameter: function () {
					return {};
				}
			},
			afterAction: fnConfirmButtonIsVisible,
			afterUndo: fnConfirmButtonIsInvisible,
			afterRedo: fnConfirmButtonIsVisible
		});

		var fnPressEventFiredCorrectlyAfterCombine = function (oButton, oViewAfterAction, assert) {
			var oCreatedMenuButton = oViewAfterAction.byId("bar0").getContentMiddle()[0];
			var oFirstMenuItem = oCreatedMenuButton.getMenu().getItems()[0];
			oFirstMenuItem.firePress();
			assert.strictEqual(window.oPressSpy.callCount, 1, "then the press event handler on the original button was called once");
			window.oPressSpy.resetHistory();
		};

		var fnPressEventFiredCorrectlyAfterUndo = function (oButton, oViewAfterAction, assert) {
			var oButton = oViewAfterAction.byId("btn0");
			oButton.firePress();
			assert.strictEqual(window.oPressSpy.callCount, 1, "then the press event handler on the original button was called once");
			window.oPressSpy.resetHistory();
		};

		elementActionTest("Checking the press action for a Button", {
			jsOnly: true,
			xmlView:
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<Page id="page0" >' +
						'<customHeader>' +
							'<Bar id="bar0">' +
								'<contentMiddle>' +
									'<Button id="btn0" text="button0" press="oPressSpy" />' +
									'<Button id="btn1" text="button1" />' +
									'<Button id="btn2" text="button2" />' +
								'</contentMiddle>' +
							'</Bar>' +
						'</customHeader>' +
					'</Page>' +
				'</mvc:View>',
			action: {
				name: "combine",
				controlId: "btn0",
				parameter: function(oView){
					return {
						source: oView.byId("btn0"),
						combineElements : [
							oView.byId("btn0"),
							oView.byId("btn1"),
							oView.byId("btn2")
						]
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
			afterAction: fnPressEventFiredCorrectlyAfterCombine,
			afterUndo: fnPressEventFiredCorrectlyAfterUndo,
			afterRedo: fnPressEventFiredCorrectlyAfterCombine
		});

		var fnEnableDisableAfterCombine = function (oButton, oViewAfterAction, assert) {
			var oButton = oViewAfterAction.byId("btn0");
			var oCreatedMenuButton = oViewAfterAction.byId("bar0").getContentMiddle()[0];
			var oFirstMenuItem = oCreatedMenuButton.getMenu().getItems()[0];

			assert.strictEqual(oFirstMenuItem.getEnabled(), false, "enabled is correct");
			assert.strictEqual(oFirstMenuItem.getText(), "Title 1", "text is correct");
			assert.strictEqual(oFirstMenuItem.getVisible(), false, "visible is correct");

			var mOriginalModelData = oButton.getModel().getData();
			oButton.getModel().setData(
				Object.assign({}, mOriginalModelData, { enabled: true })
			);
			assert.strictEqual(oFirstMenuItem.getEnabled(), true, "enabled is correct");
			oButton.getModel().setData(mOriginalModelData);
		};

		var fnEnableDisableAfterUndo = function (oButton, oViewAfterAction, assert) {
			var oButton = oViewAfterAction.byId("btn0");
			assert.strictEqual(oButton.getEnabled(), false, "enabled false");
		};

		elementActionTest("Enable / Disable Button when the property is bound", {
			jsOnly: true,
			xmlView:
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<Page id="page0" >' +
						'<customHeader>' +
							'<Bar id="bar0">' +
								'<contentMiddle>' +
									'<Button id="btn0" text="{/text}" enabled="{/enabled}" visible="{/visible}" icon="{/icon}" />' +
									'<Button id="btn1" text="button1" />' +
									'<Button id="btn2" text="button2" />' +
								'</contentMiddle>' +
							'</Bar>' +
						'</customHeader>' +
					'</Page>' +
				'</mvc:View>',
				model: new JSONModel({
					enabled: false,
					visible: false,
					text: "Title 1",
					icon: "sap-icon://accept"
				}),
				action: {
					name: "combine",
					controlId: "btn0",
					parameter: function(oView){
						return {
							source : oView.byId("btn0"),
							combineElements : [
								oView.byId("btn0"),
								oView.byId("btn1"),
								oView.byId("btn2")
							]
						};
					}
				},
				layer: "VENDOR",
			afterAction: fnEnableDisableAfterCombine,
			afterUndo: fnEnableDisableAfterUndo,
			afterRedo: fnEnableDisableAfterCombine
		});

		var fnCustomDataAfterCombine = function (oButton, oViewAfterAction, assert) {
			var oMyCustomData = new CustomData({
				key: "myCustomData",
				value: "my custom data value"
			});
			var oCreatedMenuButton = oViewAfterAction.byId("bar0").getContentMiddle()[0];
			var oFirstMenuItem = oCreatedMenuButton.getMenu().getItems()[0];
			var aCustomData = oFirstMenuItem.getCustomData();
			var bIsFound = aCustomData.some(function (oCustomData) {
				return (
					oCustomData.getKey() === oMyCustomData.getKey()
					&& oCustomData.getValue() === oMyCustomData.getValue()
				);
			});

			assert.ok(bIsFound, "First menuItem has the the customData that was set to the button from which was created");
		};

		var fnCustomDataAfterUndo = function (oButton, oViewAfterAction, assert) {
			var oMyCustomData = new CustomData({
				key: "myCustomData",
				value: "my custom data value"
			});
			var oButton = oViewAfterAction.byId("btn0");
			var aCustomData = oButton.getCustomData();
			var bIsFound = aCustomData.some(function (oCustomData) {
				return (
					oCustomData.getKey() === oMyCustomData.getKey()
					&& oCustomData.getValue() === oMyCustomData.getValue()
				);
			});

			assert.ok(bIsFound, "Button has the correct customData after undo");
		};

		elementActionTest("CustomData of the Button is copied to MenuItem", {
			jsOnly: true,
			xmlView:
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:core="sap.ui.core">' +
					'<Page id="page0" >' +
						'<customHeader>' +
							'<Bar id="bar0">' +
								'<contentMiddle>' +
									'<Button id="btn0">' +
										'<customData>' +
											'<core:CustomData key="myCustomData" value="my custom data value"/>' +
										'</customData>' +
									'</Button>' +
									'<Button id="btn1"/>' +
									'<Button id="btn2"/>' +
								'</contentMiddle>' +
							'</Bar>' +
						'</customHeader>' +
					'</Page>' +
				'</mvc:View>',
				action: {
					name: "combine",
					controlId: "btn0",
					parameter: function(oView){
						return {
							source: oView.byId("btn0"),
							combineElements : [
								oView.byId("btn0"),
								oView.byId("btn1"),
								oView.byId("btn2")
							]
						};
					}
				},
				layer: "VENDOR",
			afterAction: fnCustomDataAfterCombine,
			afterUndo: fnCustomDataAfterUndo,
			afterRedo: fnCustomDataAfterCombine
		});

		/* 'CustomData of the MenuItem contains original button id */
		var fnCustomDataOriginalBtnIdAfterCombine = function (oButton, oViewAfterAction, assert) {
			var sOriginalButtonId = oViewAfterAction.byId("btn0").getId();
			var oCreatedMenuButton = oViewAfterAction.byId("bar0").getContentMiddle()[0];
			var oFirstMenuItem = oCreatedMenuButton.getMenu().getItems()[0];
			var aCustomData = oFirstMenuItem.getCustomData();
			var bIsFound = aCustomData.some(function (oCustomData) {
				return (
						oCustomData.getKey() === "originalButtonId"
						&& oCustomData.getValue() === sOriginalButtonId
				);
			});

			assert.ok(bIsFound, "First menuItem contains in the customData the original Button id");
		};

		var fnCustomDataOriginalBtnIdAfterUndo = function (oButton, oViewAfterAction, assert) {
			assert.ok(true, "original Button id");
		};

		elementActionTest("CustomData of the MenuItem contains original button id", {
			jsOnly: true,
			xmlView:
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<Page id="page0" >' +
						'<customHeader>' +
							'<Bar id="bar0">' +
								'<contentMiddle>' +
									'<Button id="btn0" />' +
									'<Button id="btn1"/>' +
									'<Button id="btn2"/>' +
								'</contentMiddle>' +
							'</Bar>' +
						'</customHeader>' +
					'</Page>' +
				'</mvc:View>',
				action: {
					name: "combine",
					controlId: "btn0",
					parameter: function(oView){
						return {
							source: oView.byId("btn0"),
							combineElements: [
								oView.byId("btn0"),
								oView.byId("btn1"),
								oView.byId("btn2")
							]
						};
					}
				},
				layer: "VENDOR",
			afterAction: fnCustomDataOriginalBtnIdAfterCombine,
			afterUndo: fnCustomDataOriginalBtnIdAfterUndo,
			afterRedo: fnCustomDataOriginalBtnIdAfterCombine
		});

		/* MenuButton text should be created from the original Buttons names in reverse order in RTL mode */
		var fnTextInRTLAfterCombine = function (oButton, oViewAfterAction, assert) {
			var sMenuButtonText = "button2/button1/button0";
			var oCreatedMenuButton = oViewAfterAction.byId("bar0").getContentMiddle()[0];
			assert.equal(oCreatedMenuButton.getText(), sMenuButtonText, "MenuButton text is correct in RTL");
		};

		var fnTextInRTLAfterUndo = function (oButton, oViewAfterAction, assert) {
			assert.ok(true, "text in RTL");
		};

		elementActionTest("MenuButton text should be created from the original Buttons names in reverse order in RTL mode", {
			jsOnly: true,
			xmlView:
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<Page id="page0" >' +
						'<customHeader>' +
							'<Bar id="bar0">' +
								'<contentMiddle>' +
									'<Button id="btn0" text="button0" />' +
									'<Button id="btn1" text="button1" />' +
									'<Button id="btn2" text="button2" />' +
								'</contentMiddle>' +
							'</Bar>' +
						'</customHeader>' +
					'</Page>' +
				'</mvc:View>',
			action: {
				name: "combine",
				controlId: "btn0",
				parameter: function(oView){
					return {
						source: oView.byId("btn0"),
						combineElements: [
							oView.byId("btn0"),
							oView.byId("btn1"),
							oView.byId("btn2")
						]
					};
				}
			},
			layer: "VENDOR",
			before: function () {
				var config = sap.ui.getCore().getConfiguration();
				//turn on rtl for this test
				sandbox.stub(config, "getRTL").returns(true);
			},
			after: function () {
				sandbox.reset();
			},
			afterAction: fnTextInRTLAfterCombine,
			afterUndo: fnTextInRTLAfterUndo,
			afterRedo: fnTextInRTLAfterCombine
		});

		/* MenuButton enabled property is bound to the original Buttons enablement */
		var fnEnableAfterCombine = function (oButton, oViewAfterAction, assert) {
			var oCreatedMenuButton = oViewAfterAction.byId("bar0").getContentMiddle()[0];
			assert.equal(oCreatedMenuButton.getEnabled(), false, "MenuButton is disabled when the combined buttons are disabled");
		};

		var fnEnableAfterUndo = function (oButton, oViewAfterAction, assert) {
			// just return OK, since the tested MenuButton doesn't exist
			assert.ok(true, "MenuButton enabled");
		};

		elementActionTest("MenuButton visibility is bound to the original Buttons enablement", {
			jsOnly: true,
			xmlView:
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<Page id="page0" >' +
						'<customHeader>' +
							'<Bar id="bar0">' +
								'<contentMiddle>' +
									'<Button id="btn0" text="button0" enabled="false" />' +
									'<Button id="btn1" text="button1" enabled="false" />' +
									'<Button id="btn2" text="button2" enabled="false" />' +
								'</contentMiddle>' +
							'</Bar>' +
						'</customHeader>' +
					'</Page>' +
				'</mvc:View>',
			action: {
				name: "combine",
				controlId: "btn0",
				parameter: function(oView){
					return {
						source: oView.byId("btn0"),
						combineElements: [
							oView.byId("btn0"),
							oView.byId("btn1"),
							oView.byId("btn2")
						]
					};
				}
			},
			layer: "VENDOR",
			afterAction: fnEnableAfterCombine,
			afterUndo: fnEnableAfterUndo,
			afterRedo: fnEnableAfterCombine
		});

		/* MenuButton visible property is bound to the original Buttons visibility */
		var fnVisibilityAfterCombine = function (oButton, oViewAfterAction, assert) {
			var oCreatedMenuButton = oViewAfterAction.byId("bar0").getContentMiddle()[0];
			assert.equal(oCreatedMenuButton.getVisible(), false, "MenuButton is not visible when the combined buttons are not visible");
		};

		var fnVisibilityAfterUndo = function (oButton, oViewAfterAction, assert) {
			// just return OK, since the tested MenuButton doesn't exist
			assert.ok(true, "MenuButton visibility");
		};

		elementActionTest("MenuButton visibility is bound to the original Buttons visibility", {
			jsOnly: true,
			xmlView:
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<Page id="page0" >' +
						'<customHeader>' +
							'<Bar id="bar0">' +
								'<contentMiddle>' +
									'<Button id="btn0" text="button0" visible="false" />' +
									'<Button id="btn1" text="button1" visible="false" />' +
									'<Button id="btn2" text="button2" visible="false" />' +
								'</contentMiddle>' +
							'</Bar>' +
						'</customHeader>' +
					'</Page>' +
				'</mvc:View>',
			action: {
				name: "combine",
				controlId: "btn0",
				parameter: function(oView){
					return {
						source: oView.byId("btn0"),
						combineElements: [
							oView.byId("btn0"),
							oView.byId("btn1"),
							oView.byId("btn2")
						]
					};
				}
			},
			layer: "VENDOR",
			afterAction: fnVisibilityAfterCombine,
			afterUndo: fnVisibilityAfterUndo,
			afterRedo: fnVisibilityAfterCombine
		});

		/* Buttons are reverted in the initial order */
		var fnButtonsOrderAfterCombine = function (oButton, oViewAfterAction, assert) {
			assert.ok(true, "change applied");
		};

		var fnButtonsOrderAfterUndo = function (oButton, oViewAfterAction, assert) {
			var oBar = oViewAfterAction.byId("bar0");
			var oButton1 = oViewAfterAction.byId("btn1");
			var oButton2 = oViewAfterAction.byId("btn2");
			var oButton3 = oViewAfterAction.byId("btn3");
			assert.strictEqual(oBar.getContentMiddle().indexOf(oButton1), 1);
			assert.strictEqual(oBar.getContentMiddle().indexOf(oButton2), 2);
			assert.strictEqual(oBar.getContentMiddle().indexOf(oButton3), 3);
		};

		elementActionTest("Buttons are reverted in the initial order", {
			jsOnly: true,
			xmlView:
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<Page id="page0" >' +
						'<customHeader>' +
							'<Bar id="bar0">' +
								'<contentMiddle>' +
									'<Button id="btn0" text="button0"/>' +
									'<Button id="btn1" text="button1"/>' +
									'<Button id="btn2" text="button2"/>' +
									'<Button id="btn3" text="button3"/>' +
									'<Button id="btn4" text="button4"/>' +
								'</contentMiddle>' +
							'</Bar>' +
						'</customHeader>' +
					'</Page>' +
				'</mvc:View>',
				action: {
					name: "combine",
					controlId: "btn2",
					parameter: function(oView){
						return {
							source: oView.byId("btn3"),
							combineElements: [
								oView.byId("btn3"),
								oView.byId("btn1"),
								oView.byId("btn2")
							]
						};
					}
				},
				layer: "VENDOR",
			afterAction: fnButtonsOrderAfterCombine,
			afterUndo: fnButtonsOrderAfterUndo,
			afterRedo: fnButtonsOrderAfterCombine
		});

		QUnit.done(function() {
			jQuery("#content").hide();
		});
	});

});
