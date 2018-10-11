/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	'sap/ui/dt/test/report/QUnit',
	'sap/ui/dt/test/ElementEnablementTest',
	'dt/Toolbar',
	'sap/ui/rta/test/controlEnablingCheck'
], function(createAndAppendDiv, QUnitReport, ElementEnablementTest, Toolbar, rtaControlEnablingCheck) {
	createAndAppendDiv("content");


	var oElementEnablementTest = new ElementEnablementTest({
		type: "sap.m.Toolbar",
		create: Toolbar.create,
		timeout: Toolbar.timeout
	});
	oElementEnablementTest.run().then(function (oData) {
		var oReport = new QUnitReport({
			data: oData
		});
	});

	// Move action
	var fnConfirmElement1IsOn3rdPosition = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("button1").getId(),
				oViewAfterAction.byId("toolbar").getContent()[2].getId(),
				"then the control has been moved to the right position");
	};
	var fnConfirmElement1IsOn1stPosition = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("button1").getId(),
				oViewAfterAction.byId("toolbar").getContent()[0].getId(),
				"then the control has been moved to the previous position");
	};

	rtaControlEnablingCheck("Checking the move action for a Toolbar control", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
		'<Toolbar id="toolbar">' +
		'<Button text="Button 1" id="button1" />' +
		'<Button text="Button 2" id="button2" />' +
		'<Button text="Button 3" id="button3" />' +
		'</Toolbar>' +
		'</mvc:View>'
		,
		action: {
			name: "move",
			controlId: "toolbar",
			parameter: function (oView) {
				return {
					movedElements: [{
						element: oView.byId("button1"),
						sourceIndex: 0,
						targetIndex: 2
					}],
					source: {
						aggregation: "content",
						parent: oView.byId("toolbar"),
						publicAggregation: "content",
						publicParent: oView.byId("toolbar")
					},
					target: {
						aggregation: "content",
						parent: oView.byId("toolbar"),
						publicAggregation: "content",
						publicParent: oView.byId("toolbar")
					}
				};
			}
		},
		afterAction: fnConfirmElement1IsOn3rdPosition,
		afterUndo: fnConfirmElement1IsOn1stPosition,
		afterRedo: fnConfirmElement1IsOn3rdPosition
	});

});