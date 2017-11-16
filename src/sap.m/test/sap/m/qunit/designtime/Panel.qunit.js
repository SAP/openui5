/* global QUnit */
(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/dt/test/report/QUnit",
		"sap/ui/dt/test/ElementEnablementTest",
		"sap/m/Panel",
		"sap/m/Toolbar",
		"sap/ui/rta/test/controlEnablingCheck"
	], function (QUnitReport, ElementEnablementTest, Panel, Toolbar, rtaControlEnablingCheck) {

		var oElementEnablementTest = new ElementEnablementTest({
			type: "sap.m.Panel",
			create: function () {
				return new Panel({
					headerText: "Text",
					headerToolbar: new Toolbar(),
					infoToolbar: new Toolbar()
				});
			}
		});
		oElementEnablementTest.run().then(function (oData) {
			new QUnitReport({
				data: oData
			});
		});

		// Rename title action module
		var fnConfirmPanelHeaderTextRenamedWithNewValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myPanelId").getHeaderText(),
				"New Header Text",
				"then the panel header text has been renamed to the new value (New Header Text)");
		};

		var fnConfirmPanelHeaderTextIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myPanelId").getHeaderText(),
				"Old Header Text",
				"then the panel header text has been renamed to the old value (Old Header Text)");
		};

		rtaControlEnablingCheck("Checking the rename action for a Panel header text", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
				'<Panel headerText="Old Header Text" id="myPanelId" />' +
			'</mvc:View>'
			,
			action: {
				name: "rename",
				controlId: "myPanelId",
				parameter: function (oView) {
					return {
						newValue: "New Header Text",
						renamedElement: oView.byId("myPanelId")
					};
				}
			},
			afterAction: fnConfirmPanelHeaderTextRenamedWithNewValue,
			afterUndo: fnConfirmPanelHeaderTextIsRenamedWithOldValue,
			afterRedo: fnConfirmPanelHeaderTextRenamedWithNewValue
		});

		QUnit.test("Rename Action for Panel with header text and header toolbar", function (assert) {
			var done = assert.async(),
				oPanel = new sap.m.Panel("myPanel", {
					headerText: "Test",
					headerToolbar: new sap.m.Toolbar()
				});

			return oPanel.getMetadata().loadDesignTime().then(function (oDesignTime) {
				assert.ok(oDesignTime, "DesignTime was passed");

				var fnRename = oDesignTime.actions.rename;
				assert.strictEqual(fnRename(oPanel), undefined, "The rename action is not available");

				oPanel.destroy();
				oPanel = null;
				done();
			});
		});

		// Move content action module
		var fnConfirmText1IsOn3rdPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text1").getId(),
				oViewAfterAction.byId("myPanelId").getContent()[2].getId(),
				"then the control has been moved to the right position");
		};

		var fnConfirmText1IsOn1rdPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text1").getId(),
				oViewAfterAction.byId("myPanelId").getContent()[0].getId(),
				"then the control has been moved to the previous position");
		};

		rtaControlEnablingCheck("Checking the move action for Panel content", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
				'<Panel id="myPanelId">' +
					'<content>' +
						'<Text text="Text1" id="text1" />' +
						'<Text text="Text2" id="text2" />' +
						'<Text text="Text3" id="text3" />' +
					'</content>' +
				'</Panel>' +
			'</mvc:View>'
			,
			action: {
				name: "move",
				controlId: "myPanelId",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("text1"),
							sourceIndex: 0,
							targetIndex: 2
						}],
						source: {
							aggregation: "content",
							parent: oView.byId("myPanelId"),
							publicAggregation: "content",
							publicParent: oView.byId("myPanelId")
						},
						target: {
							aggregation: "content",
							parent: oView.byId("myPanelId"),
							publicAggregation: "content",
							publicParent: oView.byId("myPanelId")
						}
					};
				}
			},
			afterAction: fnConfirmText1IsOn3rdPosition,
			afterUndo: fnConfirmText1IsOn1rdPosition,
			afterRedo: fnConfirmText1IsOn3rdPosition
		});

		// Remove and reveal actions
		var fnConfirmPanelIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myPanelId").getVisible(), false, "then the Panel element is invisible");
		};

		var fnConfirmPanelIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myPanelId").getVisible(), true, "then the Panel element is visible");
		};

		rtaControlEnablingCheck("Checking the remove action for Panel", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
				'<Panel headerText="Simple Text" id="myPanelId" />' +
			'</mvc:View>'
			,
			action: {
				name: "remove",
				controlId: "myPanelId"
			},
			afterAction: fnConfirmPanelIsInvisible,
			afterUndo: fnConfirmPanelIsVisible,
			afterRedo: fnConfirmPanelIsInvisible
		});

		rtaControlEnablingCheck("Checking the reveal action for a Panel", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
				'<Panel headerText="Simple Text" id="myPanelId" visible="false"/>' +
			'</mvc:View>'
			,
			action: {
				name: "reveal",
				controlId: "myPanelId"
			},
			afterAction: fnConfirmPanelIsVisible,
			afterUndo: fnConfirmPanelIsInvisible,
			afterRedo: fnConfirmPanelIsVisible
		});
	});
})();