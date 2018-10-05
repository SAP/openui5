/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/dt/test/report/QUnit",
	"sap/ui/dt/test/ElementEnablementTest",
	"dt/Bar",
	"sap/ui/rta/test/controlEnablingCheck"
], function(createAndAppendDiv, QUnitReport, ElementEnablementTest, Bar, rtaControlEnablingCheck) {
	createAndAppendDiv("content");


	var oElementEnablementTest = new ElementEnablementTest({
			type: "sap.m.Bar",
			create : Bar.create,
			timeout : Bar.timeout
	});
	oElementEnablementTest.run().then(function(oData) {
			var oReport = new QUnitReport({
					data: oData
			});
	});

	var fnTestBarMoveActionInAggregation = function (sAggregationName) {
		// Move action
		var fnConfirmElement1IsOn3rdPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("button1").getId(),
					oViewAfterAction.byId("bar").getAggregation(sAggregationName)[2].getId(),
					"then the control has been moved to the right position");
		};
		var fnConfirmElement1IsOn1stPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("button1").getId(),
					oViewAfterAction.byId("bar").getAggregation(sAggregationName)[0].getId(),
					"then the control has been moved to the previous position");
		};

		rtaControlEnablingCheck("Checking the move action for a Bar control in " + sAggregationName + " aggregation", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
			'<Bar id="bar">' +
			'<' + sAggregationName + '>' +
			'<Button text="Button 1" id="button1" />' +
			'<Button text="Button 2" id="button2" />' +
			'<Button text="Button 3" id="button3" />' +
			'</' + sAggregationName + '>' +
			'</Bar>' +
			'</mvc:View>'
			,
			action: {
				name: "move",
				controlId: "bar",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("button1"),
							sourceIndex: 0,
							targetIndex: 2
						}],
						source: {
							aggregation: sAggregationName,
							parent: oView.byId("bar"),
							publicAggregation: sAggregationName,
							publicParent: oView.byId("bar")
						},
						target: {
							aggregation: sAggregationName,
							parent: oView.byId("bar"),
							publicAggregation: sAggregationName,
							publicParent: oView.byId("bar")
						}
					};
				}
			},
			afterAction: fnConfirmElement1IsOn3rdPosition,
			afterUndo: fnConfirmElement1IsOn1stPosition,
			afterRedo: fnConfirmElement1IsOn3rdPosition
		});
	};

	fnTestBarMoveActionInAggregation("contentLeft");
	fnTestBarMoveActionInAggregation("contentMiddle");
	fnTestBarMoveActionInAggregation("contentRight");

});