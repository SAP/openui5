sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/rta/enablement/elementActionTest"
], function (
	Element,
	createAndAppendDiv,
	elementActionTest
) {
	"use strict";
	createAndAppendDiv("content");

	var fnConfirmGroupMenuButtonIsSplited = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("OverflowToolbar").getContent().length, 2,
			"then the overflow toolbar contains 2 buttons");
		Element.getElementById("comp---view--menubtn").destroy();
	};

	var fnConfirmSplitedMenuButtonIsCombined = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("OverflowToolbar").getContent().length, 1,
			"then the overflow toolbar contains 1 menuButton");
	};

	elementActionTest("Checking the combine action for MenuButton in an OverflowToolbar", {
		jsOnly: true,
		xmlView:
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
				'<OverflowToolbar id="OverflowToolbar">' +
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
				'</OverflowToolbar>' +
			'</mvc:View>',
		action: {
			name: "split",
			controlId: "menubtn",
			parameter : function(oView) {
				return {
					newElementIds: ["btn1", "btn2"],
					source: oView.byId("menubtn"),
					parentElement: oView.byId("OverflowToolbar")
				};
			}
		},
		afterAction: fnConfirmGroupMenuButtonIsSplited,
		afterUndo: fnConfirmSplitedMenuButtonIsCombined,
		afterRedo: fnConfirmGroupMenuButtonIsSplited
	});
});