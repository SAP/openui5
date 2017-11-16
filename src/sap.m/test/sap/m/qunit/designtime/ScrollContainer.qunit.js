(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/dt/test/report/QUnit",
		"sap/ui/dt/test/ElementEnablementTest",
		"sap/m/ScrollContainer",
		"sap/m/Text",
		"sap/ui/rta/test/controlEnablingCheck"
	], function (QUnitReport, ElementEnablementTest, ScrollContainer, Text, rtaControlEnablingCheck) {

		var oElementEnablementTest = new ElementEnablementTest({
			type: "sap.m.ScrollContainer",
			create: function () {
				return new ScrollContainer({
					content: [
						new Text({text: "Text"})
					]
				});
			}
		});
		oElementEnablementTest.run().then(function (oData) {
			new QUnitReport({
				data: oData
			});
		});

		// Move action
		var fnConfirmElement1IsOn3rdPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text1").getId(),
				oViewAfterAction.byId("myContainer").getContent()[2].getId(),
				"then the control has been moved to the right position");
		};
		var fnConfirmElement1IsOn1stPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text1").getId(),
				oViewAfterAction.byId("myContainer").getContent()[0].getId(),
				"then the control has been moved to the previous position");
		};

		rtaControlEnablingCheck("Checking the move action for ScrollContainer control", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
				'<ScrollContainer id="myContainer">' +
					'<Text text="Text 1" id="text1" />' +
					'<Text text="Text 2" id="text2" />' +
					'<Text text="Text 3" id="text3" />' +
				'</ScrollContainer>' +
			'</mvc:View>'
			,
			action: {
				name: "move",
				controlId: "myContainer",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("text1"),
							sourceIndex: 0,
							targetIndex: 2
						}],
						source: {
							aggregation: "content",
							parent: oView.byId("myContainer"),
							publicAggregation: "content",
							publicParent: oView.byId("myContainer")
						},
						target: {
							aggregation: "content",
							parent: oView.byId("myContainer"),
							publicAggregation: "content",
							publicParent: oView.byId("myContainer")
						}
					};
				}
			},
			afterAction: fnConfirmElement1IsOn3rdPosition,
			afterUndo: fnConfirmElement1IsOn1stPosition,
			afterRedo: fnConfirmElement1IsOn3rdPosition
		});

		// Remove and reveal actions
		var fnConfirmScrollContainerIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myContainer").getVisible(), false, "then the ScrollContainer element is invisible");
		};

		var fnConfirmScrollContainerIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myContainer").getVisible(), true, "then the ScrollContainer element is visible");
		};

		rtaControlEnablingCheck("Checking the remove action for ScrollContainer", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
				'<ScrollContainer id="myContainer">' +
					'<Text text="Text 1" id="text1" />' +
				'</ScrollContainer>' +
			'</mvc:View>'
			,
			action: {
				name: "remove",
				controlId: "myContainer"
			},
			afterAction: fnConfirmScrollContainerIsInvisible,
			afterUndo: fnConfirmScrollContainerIsVisible,
			afterRedo: fnConfirmScrollContainerIsInvisible
		});

		rtaControlEnablingCheck("Checking the reveal action for a ScrollContainer", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
				'<ScrollContainer id="myContainer" visible="false">' +
					'<Text text="Text 1" id="text1" />' +
				'</ScrollContainer>' +
			'</mvc:View>'
			,
			action: {
				name: "reveal",
				controlId: "myContainer"
			},
			afterAction: fnConfirmScrollContainerIsVisible,
			afterUndo: fnConfirmScrollContainerIsInvisible,
			afterRedo: fnConfirmScrollContainerIsVisible
		});
	});
})();