/* global QUnit */
(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/dt/test/report/QUnit",
		"sap/ui/dt/test/ElementEnablementTest",
		"dt/Page",
		"sap/ui/rta/test/controlEnablingCheck"
	], function (QUnitReport, ElementEnablementTest, Page, rtaControlEnablingCheck) {

		var oElementEnablementTest = new ElementEnablementTest({
			type: "sap.m.Page",
			create: Page.create
		});
		oElementEnablementTest.run().then(function (oData) {
			var oReport = new QUnitReport({
				data: oData
			});
		});

		// Rename title action module
		var fnConfirmPageTitleRenamedWithNewValue = function (oRadioButton, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("page").getTitle(),
				"New Title",
				"then the page title has been renamed to the new value (New Title)");
		};

		var fnConfirmPageTitleIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("page").getTitle(),
				"Old Title",
				"then the page title has been renamed to the old value (Old Title)");
		};

		rtaControlEnablingCheck("Checking the rename action for a Page title", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
			'<m:Page title="Old Title" id="page" />' +
			'</mvc:View>'
			,
			action: {
				name: "rename",
				controlId: "page",
				parameter: function (oView) {
					return {
						newValue: "New Title",
						renamedElement: oView.byId("page")
					};
				}
			},
			afterAction: fnConfirmPageTitleRenamedWithNewValue,
			afterUndo: fnConfirmPageTitleIsRenamedWithOldValue,
			afterRedo: fnConfirmPageTitleRenamedWithNewValue
		});

		QUnit.test("Rename Action for Page with Title and custom header", function (assert) {
			var done = assert.async(),
				oPage = new sap.m.Page("myPage", {
					title: "Test",
					customHeader: new sap.m.Bar()
				});

			return oPage.getMetadata().loadDesignTime().then(function (oDesignTime) {
				assert.ok(oDesignTime, "DesignTime was passed");

				var fnRename = oDesignTime.actions.rename;
				assert.strictEqual(fnRename(oPage), undefined, "The rename action is not available");

				oPage.destroy();
				oPage = null;
				done();
			});
		});

		// Move content action module
		var fnConfirmText1IsOn3rdPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text1").getId(),
				oViewAfterAction.byId("myPageId").getContent()[2].getId(),
				"then the control has been moved to the right position");
		};

		var fnConfirmText1IsOn1rdPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text1").getId(),
				oViewAfterAction.byId("myPageId").getContent()[0].getId(),
				"then the control has been moved to the previous position");
		};

		rtaControlEnablingCheck("Checking the move action for Page content", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
				'<Page id="myPageId">' +
					'<content>' +
						'<Text text="Text1" id="text1" />' +
						'<Text text="Text2" id="text2" />' +
						'<Text text="Text3" id="text3" />' +
					'</content>' +
				'</Page>' +
			'</mvc:View>'
			,
			action: {
				name: "move",
				controlId: "myPageId",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("text1"),
							sourceIndex: 0,
							targetIndex: 2
						}],
						source: {
							aggregation: "content",
							parent: oView.byId("myPageId"),
							publicAggregation: "content",
							publicParent: oView.byId("myPageId")
						},
						target: {
							aggregation: "content",
							parent: oView.byId("myPageId"),
							publicAggregation: "content",
							publicParent: oView.byId("myPageId")
						}
					};
				}
			},
			afterAction: fnConfirmText1IsOn3rdPosition,
			afterUndo: fnConfirmText1IsOn1rdPosition,
			afterRedo: fnConfirmText1IsOn3rdPosition
		});

	});
})();
