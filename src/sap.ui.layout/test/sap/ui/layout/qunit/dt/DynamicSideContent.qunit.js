(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/dt/test/report/QUnit",
		"sap/ui/dt/test/ElementEnablementTest",
		"sap/ui/layout/DynamicSideContent",
		"sap/m/Text",
		"sap/ui/rta/test/controlEnablingCheck"
	], function (QUnitReport, ElementEnablementTest, DynamicSideContent, Text, rtaControlEnablingCheck) {

		var oElementEnablementTest = new ElementEnablementTest({
			type: "sap.ui.layout.DynamicSideContent",
			create: function () {
				return new DynamicSideContent({});
			}
		});


		oElementEnablementTest.run().then(function (oData) {
			new QUnitReport({
				data: oData
			});
		});

		// Remove and reveal actions
		var fnConfirmDynamicSideContentInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("dynamicsc").getVisible(), false, "then the DynamicSideContent element is invisible");
		};

		var fnConfirmDynamicSideContentIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("dynamicsc").getVisible(), true, "then the DynamicSideContent element is visible");
		};

		rtaControlEnablingCheck("Checking the remove action for DynamicSideContent", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:l="sap.ui.layout">' +
				'<l:DynamicSideContent id="dynamicsc">' +
					'<l:mainContent>' +
						'<Text id="text1" text="Text1"></Text>' +
						'<Text id="text2" text="Text2"></Text>' +
					'</l:mainContent>' +
					'<l:sideContent>' +
						'<Text id="text3" text="Text3"></Text>' +
						'<Text id="text4" text="Text4"></Text>' +
					'</l:sideContent>' +
				'</l:DynamicSideContent>' +
			'</mvc:View>',
			action: {
				name: "remove",
				controlId: "dynamicsc",
				parameter: function (oView) {
					return {
						removedElement: oView.byId("dynamicsc")
					};
				}
			},
			afterAction: fnConfirmDynamicSideContentInvisible,
			afterUndo: fnConfirmDynamicSideContentIsVisible,
			afterRedo: fnConfirmDynamicSideContentInvisible
		});

		rtaControlEnablingCheck("Checking the reveal action for a DynamicSideContent", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:l="sap.ui.layout">' +
				'<l:DynamicSideContent id="dynamicsc" visible="false">' +
					'<l:mainContent>' +
						'<Text id="text1" text="Text1"></Text>' +
						'<Text id="text2" text="Text2"></Text>' +
					'</l:mainContent>' +
					'<l:sideContent>' +
						'<Text id="text3" text="Text3"></Text>' +
						'<Text id="text4" text="Text4"></Text>' +
					'</l:sideContent>' +
				'</l:DynamicSideContent>' +
			'</mvc:View>',
			action: {
				name: "reveal",
				controlId: "dynamicsc",
				parameter: function(oView){
					return {};
				}
			},
			afterAction: fnConfirmDynamicSideContentIsVisible,
			afterUndo: fnConfirmDynamicSideContentInvisible,
			afterRedo: fnConfirmDynamicSideContentIsVisible
		});

		// Move action of mainContent aggregation
		var fnConfirmMainContentElement1IsOn2ndPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text1").getId(),
				oViewAfterAction.byId("dynamicsc").getMainContent()[1].getId(),
				"then the control has been moved to the right position");
		};
		var fnConfirmMainContentElement1IsOn1stPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text1").getId(),
				oViewAfterAction.byId("dynamicsc").getMainContent()[0].getId(),
				"then the control has been moved to the previous position");
		};

		rtaControlEnablingCheck("Checking the move action for mainContent of DynamicSideContent", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:l="sap.ui.layout">' +
				'<l:DynamicSideContent id="dynamicsc">' +
					'<l:mainContent>' +
						'<Text id="text1" text="Text1"></Text>' +
						'<Text id="text2" text="Text2"></Text>' +
					'</l:mainContent>' +
					'<l:sideContent>' +
						'<Text id="text3" text="Text3"></Text>' +
						'<Text id="text4" text="Text4"></Text>' +
					'</l:sideContent>' +
				'</l:DynamicSideContent>' +
			'</mvc:View>',
			action: {
				name: "move",
				controlId: "dynamicsc",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("text1"),
							sourceIndex: 0,
							targetIndex: 1
						}],
						source: {
							aggregation: "mainContent",
							parent: oView.byId("dynamicsc")
						},
						target: {
							aggregation: "mainContent",
							parent: oView.byId("dynamicsc")
						}
					};
				}
			},
			afterAction: fnConfirmMainContentElement1IsOn2ndPosition,
			afterUndo: fnConfirmMainContentElement1IsOn1stPosition,
			afterRedo: fnConfirmMainContentElement1IsOn2ndPosition
		});

		// Move action of sideContent aggregation
		var fnConfirmSideContentElement1IsOn2ndPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text3").getId(),
				oViewAfterAction.byId("dynamicsc").getSideContent()[1].getId(),
				"then the control has been moved to the right position");
		};
		var fnConfirmSideContentElement1IsOn1stPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text3").getId(),
				oViewAfterAction.byId("dynamicsc").getSideContent()[0].getId(),
				"then the control has been moved to the previous position");
		};

		rtaControlEnablingCheck("Checking the move action for sideContent of DynamicSideContent", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:l="sap.ui.layout">' +
				'<l:DynamicSideContent id="dynamicsc">' +
					'<l:mainContent>' +
						'<Text id="text1" text="Text1"></Text>' +
						'<Text id="text2" text="Text2"></Text>' +
					'</l:mainContent>' +
					'<l:sideContent>' +
						'<Text id="text3" text="Text3"></Text>' +
						'<Text id="text4" text="Text4"></Text>' +
					'</l:sideContent>' +
				'</l:DynamicSideContent>' +
			'</mvc:View>',
			action: {
				name: "move",
				controlId: "dynamicsc",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("text3"),
							sourceIndex: 0,
							targetIndex: 1
						}],
						source: {
							aggregation: "sideContent",
							parent: oView.byId("dynamicsc")
						},
						target: {
							aggregation: "sideContent",
							parent: oView.byId("dynamicsc")
						}
					};
				}
			},
			afterAction: fnConfirmSideContentElement1IsOn2ndPosition,
			afterUndo: fnConfirmSideContentElement1IsOn1stPosition,
			afterRedo: fnConfirmSideContentElement1IsOn2ndPosition
		});
	});
})();