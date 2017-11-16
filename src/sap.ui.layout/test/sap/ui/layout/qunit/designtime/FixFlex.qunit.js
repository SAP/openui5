(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/dt/test/report/QUnit",
		"sap/ui/dt/test/ElementEnablementTest",
		"sap/ui/layout/FixFlex",
		"sap/m/Text",
		"sap/ui/rta/test/controlEnablingCheck"
	], function (QUnitReport, ElementEnablementTest, FixFlex, Text, rtaControlEnablingCheck) {

		var oElementEnablementTest = new ElementEnablementTest({
			type: "sap.ui.layout.FixFlex",
			create: function () {
				return new FixFlex({
					fixContent: [
						new Text({text: "Text"})
					],
					flexContent: [
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
			assert.strictEqual(oViewAfterAction.byId("txt1").getId(),
				oViewAfterAction.byId("idFixFlex").getFixContent()[1].getId(),
				"then the control has been moved to the right position");
		};
		var fnConfirmElement1IsOn1stPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("txt1").getId(),
				oViewAfterAction.byId("idFixFlex").getFixContent()[0].getId(),
				"then the control has been moved to the previous position");
		};

		rtaControlEnablingCheck("Checking the move action for FixFlex control", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:l="sap.ui.layout">' +
			'<l:FixFlex id="idFixFlex">' +
				'<l:fixContent>' +
					'<Text id="txt1" text="Text 1"/>' +
					'<Text id="txt2" text="Text 2"/>' +
				'</l:fixContent>' +
				'<l:flexContent>' +
					'<Text id="txt3" text="Text 3"/>' +
				'</l:flexContent>' +
			'</l:FixFlex>' +
			'</mvc:View>'
			,
			action: {
				name: "move",
				controlId: "idFixFlex",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("txt1"),
							sourceIndex: 0,
							targetIndex: 1
						}],
						source: {
							aggregation: "fixContent",
							parent: oView.byId("idFixFlex")
						},
						target: {
							aggregation: "fixContent",
							parent: oView.byId("idFixFlex")
						}
					};
				}
			},
			afterAction: fnConfirmElement1IsOn3rdPosition,
			afterUndo: fnConfirmElement1IsOn1stPosition,
			afterRedo: fnConfirmElement1IsOn3rdPosition
		});

		// Remove and reveal actions
		var fnConfirmFixFlexIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("idFixFlex").getVisible(), false, "then the FixFlex element is invisible");
		};

		var fnConfirmFixFLexIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("idFixFlex").getVisible(), true, "then the FixFlex element is visible");
		};

		rtaControlEnablingCheck("Checking the remove action for FixFlex", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:l="sap.ui.layout">"' +
			'<l:FixFlex id="idFixFlex">' +
				'<l:fixContent>' +
					'<Text id="txt1" text="Text 1"/>' +
				'</l:fixContent>' +
				'<l:flexContent>' +
					'<Text id="txt3" text="Text 3"/>' +
				'</l:flexContent>' +
			'</l:FixFlex>' +
			'</mvc:View>'
			,
			action: {
				name: "remove",
				controlId: "idFixFlex"
			},
			afterAction: fnConfirmFixFlexIsInvisible,
			afterUndo: fnConfirmFixFLexIsVisible,
			afterRedo: fnConfirmFixFlexIsInvisible
		});

		rtaControlEnablingCheck("Checking the reveal action for a FixFlex", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:l="sap.ui.layout">"' +
			'<l:FixFlex id="idFixFlex" visible="false">' +
				'<l:fixContent>' +
					'<Text id="txt1" text="Text 1"/>' +
				'</l:fixContent>' +
				'<l:flexContent>' +
					'<Text id="txt3" text="Text 3"/>' +
				'</l:flexContent>' +
			'</l:FixFlex>' +
			'</mvc:View>'
			,
			action: {
				name: "reveal",
				controlId: "idFixFlex"
			},
			afterAction: fnConfirmFixFLexIsVisible,
			afterUndo: fnConfirmFixFlexIsInvisible,
			afterRedo: fnConfirmFixFLexIsVisible
		});

	});
})();
