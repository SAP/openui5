(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/dt/test/report/QUnit",
		"sap/ui/dt/test/ElementEnablementTest",
		"sap/m/Popover",
		"sap/m/Text",
		"sap/ui/rta/test/controlEnablingCheck"
	], function (QUnitReport, ElementEnablementTest, Popover, Text, rtaControlEnablingCheck) {

		var oElementEnablementTest = new ElementEnablementTest({
			type: "sap.m.Popover",
			create: function () {
				return new Popover({
					subHeader: new sap.m.Text({ text: "subheader" }),
					footer: new sap.m.Text({ text: "footer" }),
					beginButton: new sap.m.Button({ text: "begin" }),
					endButton: new sap.m.Button({ text: "end" }),
					contentWidth: "150px",
					content: [
						new Text({text: "Text"}),
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
				oViewAfterAction.byId("popover").getContent()[2].getId(),
				"then the control has been moved to the right position");
		};
		var fnConfirmElement1IsOn1stPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text1").getId(),
				oViewAfterAction.byId("popover").getContent()[0].getId(),
				"then the control has been moved to the previous position");
		};

		rtaControlEnablingCheck("Checking the move action for Popover control", {
			xmlView:
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
				'<Popover id="popover">' +
					'<Text text="Text 1" id="text1" />' +
					'<Text text="Text 2" id="text2" />' +
					'<Text text="Text 3" id="text3" />' +
				'</Popover>' +
			'</mvc:View>'
			,
			action: {
				name: "move",
				controlId: "popover",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("text1"),
							sourceIndex: 0,
							targetIndex: 2
						}],
						source: {
							aggregation: "content",
							parent: oView.byId("popover"),
							publicAggregation: "content",
							publicParent: oView.byId("popover")
						},
						target: {
							aggregation: "content",
							parent: oView.byId("popover"),
							publicAggregation: "content",
							publicParent: oView.byId("popover")
						}
					};
				}
			},
			afterAction: fnConfirmElement1IsOn3rdPosition,
			afterUndo: fnConfirmElement1IsOn1stPosition,
			afterRedo: fnConfirmElement1IsOn3rdPosition
		});

		// Rename title action module
		var fnConfirmPopoverTextRenamedWithNewValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("popover").getTitle(),
				"New Title",
				"then the popover title has been renamed to the new value (New Title)");
		};

		var fnConfirmPopoverTextIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("popover").getTitle(),
				"Old Title",
				"then the popover title has been renamed to the old value (Old Title)");
		};

		rtaControlEnablingCheck("Checking the rename action for a Popover title", {
			xmlView:
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<Popover id="popover" title="Old Title">' +
						'<Text text="Text 1" id="text1" />' +
					'</Popover>' +
				'</mvc:View>',
			action: {
				name: "rename",
				controlId: "popover",
				parameter: function (oView) {
					return {
						newValue: "New Title",
						renamedElement: oView.byId("popover")
					};
				}
			},
			afterAction: fnConfirmPopoverTextRenamedWithNewValue,
			afterUndo: fnConfirmPopoverTextIsRenamedWithOldValue,
			afterRedo: fnConfirmPopoverTextRenamedWithNewValue
		});
	});
})();