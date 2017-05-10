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
			new QUnitReport({
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

		// Move headerContent action module
		var fnConfirmButton1IsOn2rdPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("button1").getId(),
				oViewAfterAction.byId("myPageId").getHeaderContent()[1].getId(),
				"then the control has been moved to the right position");
		};

		var fnConfirmButton1IsOn1rdPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("button1").getId(),
				oViewAfterAction.byId("myPageId").getHeaderContent()[0].getId(),
				"then the control has been moved to the previous position");
		};

		rtaControlEnablingCheck("Checking the move action for Page headerContent", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
				'<Page id="myPageId">' +
					'<headerContent>' +
						'<Button text="Button1" id="button1" />' +
						'<Button text="Button2" id="button2" />' +
					'</headerContent>' +
				'</Page>' +
			'</mvc:View>'
			,
			action: {
				name: "move",
				controlId: "myPageId",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("button1"),
							sourceIndex: 0,
							targetIndex: 1
						}],
						source: {
							aggregation: "headerContent",
							parent: oView.byId("myPageId"),
							publicAggregation: "headerContent",
							publicParent: oView.byId("myPageId")
						},
						target: {
							aggregation: "headerContent",
							parent: oView.byId("myPageId"),
							publicAggregation: "headerContent",
							publicParent: oView.byId("myPageId")
						}
					};
				}
			},
			afterAction: fnConfirmButton1IsOn2rdPosition,
			afterUndo: fnConfirmButton1IsOn1rdPosition,
			afterRedo: fnConfirmButton1IsOn2rdPosition
		});

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

		// Combine buttons in headerContent action module
		var fnConfirmButtonsAreCombined = function (oUiComponent,oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("page").getHeaderContent().length, 1, "then the contentHeader contains 1 button");
			// destroy controls which are no longer part of the view after combine command
			// to avoid duplicate id errors
			sap.ui.getCore().byId("comp---view--btn0").destroy();
			sap.ui.getCore().byId("comp---view--btn1").destroy();
		};

		var fnConfirmButtonsAreSplited = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("page").getHeaderContent().length, 2, "then the contentHeader contains 2 buttons"
			);
		};

		rtaControlEnablingCheck("Checking the combine action for sap.m.Button in sap.m.Page headerContent", {
			jsOnly : true,
			xmlView :
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
			'<Page id="page" >' +
				'<headerContent>' +
					'<Button id="btn0"/>' +
					'<Button id="btn1"/>' +
				'</headerContent>' +
			'</Page>' +
			'</mvc:View>'     ,
			action : {
				name : "combine",
				controlId : "btn0",
				parameter : function(oView){
					return {
						source : oView.byId("btn0"),
						combineFields : [
							oView.byId("btn0"),
							oView.byId("btn1")
						]
					};
				}
			},
			layer : "VENDOR",
			afterAction : fnConfirmButtonsAreCombined,
			afterUndo : fnConfirmButtonsAreSplited,
			afterRedo : fnConfirmButtonsAreCombined
		});

		// Split buttons in headerContent action module
		var fnConfirmGroupMenuButtonIsSplited = function (oUiComponent,oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("page").getHeaderContent().length, 2,
				"then the headerContent contains 2 buttons");

			sap.ui.getCore().byId("comp---view--menubtn").destroy();
		};

		var fnConfirmSplitedMenuButtonIsCombined = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("page").getHeaderContent().length, 1,
				"then the headerContent contains 1 menuButton");

		};

		rtaControlEnablingCheck("Checking the split action for sap.m.MenuButton in sap.m.Page headerContent", {
			jsOnly : true,
			xmlView :
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
				'<Page id="page" >' +
					'<headerContent>' +
						'<MenuButton id="menubtn">' +
						'<menu>' +
						'<Menu>' +
						'<items>' +
						'<MenuItem text="item1"/>' +
						'<MenuItem text="item2"/>' +
						'</items>' +
						'</Menu>' +
						'</menu>' +
						'</MenuButton>' +
					'</headerContent>' +
				'</Page>' +
			'</mvc:View>'
			,
			action : {
				name : "split",
				controlId : "menubtn",
				parameter : function(oView){
					return {
						newElementIds : ["btn1", "btn2"],
						source : oView.byId("menubtn"),
						parentElement : oView.byId("page")
					};
				}
			},
			layer: "VENDOR",
			afterAction : fnConfirmGroupMenuButtonIsSplited,
			afterUndo : fnConfirmSplitedMenuButtonIsCombined,
			afterRedo : fnConfirmGroupMenuButtonIsSplited
		});

	});
})();