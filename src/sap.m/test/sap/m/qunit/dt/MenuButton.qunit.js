(function () {
	'use strict';

	sap.ui.require([
		"sap/ui/dt/test/report/QUnit",
		"sap/ui/dt/test/ElementEnablementTest",
		"sap/m/MenuButton",
		"sap/m/Menu",
		"sap/m/MenuItem",
		"sap/ui/rta/test/controlEnablingCheck"
	], function (QUnitReport, ElementEnablementTest, MenuButton, Menu, MenuItem, rtaControlEnablingCheck) {

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
				})
			}
		});

		oElementEnablementTest.run().then(function (oData) {
			var oReport = new QUnitReport({
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
	});
})();