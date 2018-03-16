(function () {
	'use strict';

	sap.ui.require([
		"sap/ui/dt/test/report/QUnit",
		"sap/ui/dt/test/ElementEnablementTest",
		"sap/m/InputListItem",
		"sap/m/InputBase",
		"sap/ui/rta/test/controlEnablingCheck"
	], function (QUnitReport, ElementEnablementTest, InputListItem, InputBase, rtaControlEnablingCheck) {

		var oElementEnablementTest = new ElementEnablementTest({
			type: "sap.m.InputListItem",
			create: function () {
				return new InputListItem({
					label: "Label",
					content: [
						new InputBase()
					]
				});
			}
		});
		oElementEnablementTest.run().then(function (oData) {
			new QUnitReport({
				data: oData
			});
		});

		// Move content
		var fnConfirmInput1IsOn3rdPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("input1").getId(),
				oViewAfterAction.byId("inputListItem").getContent()[2].getId(),
				"then the control has been moved to the right position");
		};

		var fnConfirmInput1IsOn1rdPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("input1").getId(),
				oViewAfterAction.byId("inputListItem").getContent()[0].getId(),
				"then the control has been moved to the previous position");
		};

		rtaControlEnablingCheck("Checking the move action for InputListItem content", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
			'<m:List id="list">' +
			'<m:InputListItem id="inputListItem" label="Checkbox">' +
				'<m:CheckBox id="input1"/>' +
				'<m:CheckBox id="input2"/>' +
				'<m:CheckBox id="input3"/>' +
			'</m:InputListItem>' +
			'</m:List>' +
			'</mvc:View>'
			,
			action: {
				name: "move",
				controlId: "inputListItem",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("input1"),
							sourceIndex: 0,
							targetIndex: 2
						}],
						source: {
							aggregation: "content",
							parent: oView.byId("inputListItem"),
							publicAggregation: "content",
							publicParent: oView.byId("inputListItem")
						},
						target: {
							aggregation: "content",
							parent: oView.byId("inputListItem"),
							publicAggregation: "content",
							publicParent: oView.byId("inputListItem")
						}
					};
				}
			},
			afterAction: fnConfirmInput1IsOn3rdPosition,
			afterUndo: fnConfirmInput1IsOn1rdPosition,
			afterRedo: fnConfirmInput1IsOn3rdPosition
		});
	});
})();