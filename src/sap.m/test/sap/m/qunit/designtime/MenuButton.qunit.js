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
		"sap/f/DynamicPageTitle",
		"sap/ui/fl/changeHandler/JsControlTreeModifier",
		"sap/ui/fl/Change",
		"sap/ui/core/UIComponent",
		"sap/ui/core/ComponentContainer"
	], function (
		QUnitReport,
		ElementEnablementTest,
		MenuButton,
		Menu,
		MenuItem,
		rtaControlEnablingCheck,
		SplitMenuButton,
		DynamicPageTitle,
		JsControlTreeModifier,
		Change,
		UIComponent,
		ComponentContainer) {

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

		function createChangeDefinition() {
			return jQuery.extend(true, {}, {
				"changeType": "splitMenuButton",
				"content": {
					"newFieldIndex": 1
				},
				"selector": {
					"id": "view--idToolbar",
					"idIsLocal": true
				}
			});
		}

		QUnit.module("Reverts Action on MenuButton", {
			beforeEach: function() {
				var oXmlString = [
					'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">',
						'<Toolbar id="idToolbar">',
							'<content>',
								'<MenuButton id="menubtn">',
									'<menu>',
										'<Menu>',
											'<items>',
												'<MenuItem/>',
												'<MenuItem/>',
											'</items>',
										'</Menu>',
									'</menu>',
								'</MenuButton>',
							'</content>',
						'</Toolbar>',
					'</mvc:View>'
				].join('');

				var Comp = UIComponent.extend("test", {
					metadata: {
						manifest : {
							"sap.app": {
								"id": "test",
								"type": "application"
							}
						}
					},
					createContent : function() {
						return sap.ui.xmlview({
							id : this.createId("view"),
							viewContent : oXmlString
						});
					}
				});

				this.oUiComponent = new Comp("comp");
				this.oUiComponentContainer = new ComponentContainer({
					component : this.oUiComponent
				});

				this.oUiComponentContainer.placeAt("content");
				sap.ui.getCore().applyChanges();
			},

			afterEach: function() {
				this.oUiComponentContainer.destroy();
			}
		});

		QUnit.test("Revert split action ", function(assert) {

			var oChange = new Change(createChangeDefinition()),
				oChangeHandler = SplitMenuButton;

			var oToolbar = this.oUiComponent.getRootControl().getContent()[0],
				oPropertyBag = {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent
				};

			oChangeHandler.completeChangeContent(oChange, {
				newElementIds: ["idNew"],
				sourceControlId: "comp---view--menubtn"
			}, oPropertyBag);

			oChangeHandler.applyChange(oChange, oToolbar, oPropertyBag);
			assert.strictEqual(oToolbar.getContent().length, 2, "The change was successfully executed.");

			oChangeHandler.revertChange(oChange, oToolbar, oPropertyBag);
			assert.strictEqual(oToolbar.getContent().length, 1, "The change was successfully reverted.");
		});
	});
})();