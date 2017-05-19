(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/dt/test/report/QUnit",
		"sap/ui/dt/test/ElementEnablementTest",
		"sap/ui/layout/Grid",
		"sap/m/Text",
		"sap/ui/rta/test/controlEnablingCheck"
	], function (QUnitReport, ElementEnablementTest, Grid, Text, rtaControlEnablingCheck) {

		var oElementEnablementTest = new ElementEnablementTest({
			type: "sap.ui.layout.Grid",
			create: function () {
				return new Grid({
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
				oViewAfterAction.byId("myGrid").getContent()[2].getId(),
				"then the control has been moved to the right position");
		};
		var fnConfirmElement1IsOn1stPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text1").getId(),
				oViewAfterAction.byId("myGrid").getContent()[0].getId(),
				"then the control has been moved to the previous position");
		};

		rtaControlEnablingCheck("Checking the move action for Grid control", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:l="sap.ui.layout">' +
				'<l:Grid id="myGrid">' +
					'<m:Text text="Text 1" id="text1" />' +
					'<m:Text text="Text 2" id="text2" />' +
					'<m:Text text="Text 3" id="text3" />' +
				'</l:Grid>' +
			'</mvc:View>'
			,
			action: {
				name: "move",
				controlId: "myGrid",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("text1"),
							sourceIndex: 0,
							targetIndex: 2
						}],
						source: {
							aggregation: "content",
							parent: oView.byId("myGrid")
						},
						target: {
							aggregation: "content",
							parent: oView.byId("myGrid")
						}
					};
				}
			},
			afterAction: fnConfirmElement1IsOn3rdPosition,
			afterUndo: fnConfirmElement1IsOn1stPosition,
			afterRedo: fnConfirmElement1IsOn3rdPosition
		});

		// Remove and reveal actions
		var fnConfirmGridIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myGrid").getVisible(), false, "then the Grid element is invisible");
		};

		var fnConfirmGridIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myGrid").getVisible(), true, "then the Grid element is visible");
		};

		rtaControlEnablingCheck("Checking the remove action for Grid", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:l="sap.ui.layout">"' +
				'<l:Grid id="myGrid">' +
					'<m:Text text="Text 1" id="text1" />' +
				'</l:Grid>' +
			'</mvc:View>'
			,
			action: {
				name: "remove",
				controlId: "myGrid"
			},
			afterAction: fnConfirmGridIsInvisible,
			afterUndo: fnConfirmGridIsVisible,
			afterRedo: fnConfirmGridIsInvisible
		});

		rtaControlEnablingCheck("Checking the reveal action for a Grid", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:l="sap.ui.layout">"' +
				'<l:Grid id="myGrid" visible="false">' +
					'<m:Text text="Text 1" id="text1" />' +
				'</l:Grid>' +
			'</mvc:View>'
			,
			action: {
				name: "reveal",
				controlId: "myGrid"
			},
			afterAction: fnConfirmGridIsVisible,
			afterUndo: fnConfirmGridIsInvisible,
			afterRedo: fnConfirmGridIsVisible
		});
	});
})();
