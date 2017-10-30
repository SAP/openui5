(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/dt/test/report/QUnit",
		"sap/ui/dt/test/ElementEnablementTest",
		"sap/m/Dialog",
		"sap/m/Text",
		"sap/ui/rta/test/controlEnablingCheck"
	], function (QUnitReport, ElementEnablementTest, Dialog, Text, rtaControlEnablingCheck) {

		var oElementEnablementTest = new ElementEnablementTest({
			type: "sap.m.Dialog",
			create: function () {
				return new Dialog({
					content: [
						new Text({text: "Text"}),
						new Text({text: "Text"})
					],
					subHeader: new sap.m.Bar(),
					beginButton: new sap.m.Button({ text: "begin" }),
					endButton: new sap.m.Button({ text: "end" }),
					customHeader: new sap.m.Bar(),
					buttons: [new sap.m.Button()]
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
				oViewAfterAction.byId("dialog").getContent()[2].getId(),
				"then the control has been moved to the right position");
		};
		var fnConfirmElement1IsOn1stPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text1").getId(),
				oViewAfterAction.byId("dialog").getContent()[0].getId(),
				"then the control has been moved to the previous position");
		};

		rtaControlEnablingCheck("Checking the move action for Dialog control", {
			xmlView:
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
				'<Dialog id="dialog">' +
					'<Text text="Text 1" id="text1" />' +
					'<Text text="Text 2" id="text2" />' +
					'<Text text="Text 3" id="text3" />' +
				'</Dialog>' +
			'</mvc:View>'
			,
			action: {
				name: "move",
				controlId: "dialog",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("text1"),
							sourceIndex: 0,
							targetIndex: 2
						}],
						source: {
							aggregation: "content",
							parent: oView.byId("dialog"),
							publicAggregation: "content",
							publicParent: oView.byId("dialog")
						},
						target: {
							aggregation: "content",
							parent: oView.byId("dialog"),
							publicAggregation: "content",
							publicParent: oView.byId("dialog")
						}
					};
				}
			},
			afterAction: fnConfirmElement1IsOn3rdPosition,
			afterUndo: fnConfirmElement1IsOn1stPosition,
			afterRedo: fnConfirmElement1IsOn3rdPosition
		});


		// Rename title action module
		var fnConfirmDialogTextRenamedWithNewValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("dialog").getTitle(),
				"New Title",
				"then the dialog title has been renamed to the new value (New Title)");
		};

		var fnConfirmDialogTextIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("dialog").getTitle(),
				"Old Title",
				"then the dialog title has been renamed to the old value (Old Title)");
		};

		rtaControlEnablingCheck("Checking the rename action for a Dialog title", {
			xmlView:
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<Dialog id="dialog" title="Old Title">' +
						'<Text text="Text 1" id="text1" />' +
					'</Dialog>' +
				'</mvc:View>',
			action: {
				name: "rename",
				controlId: "dialog",
				parameter: function (oView) {
					return {
						newValue: "New Title",
						renamedElement: oView.byId("dialog")
					};
				}
			},
			afterAction: fnConfirmDialogTextRenamedWithNewValue,
			afterUndo: fnConfirmDialogTextIsRenamedWithOldValue,
			afterRedo: fnConfirmDialogTextRenamedWithNewValue
		});
	});
})();