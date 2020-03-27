sap.ui.define([
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/ui/rta/enablement/elementActionTest",
	"sap/f/DynamicPageTitle",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/Button",
	"sap/ui/core/Core"
],
function (
	elementDesigntimeTest,
	elementActionTest,
	DynamicPageTitle,
	Text,
	Title,
	Button,
	Core
) {
	"use strict";

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
			type: "sap.f.DynamicPageTitle",
			create: function () {
				return new DynamicPageTitle({
					heading : [new Title({text: "This is title"})],
					content : [
						new Text({text: "Title content 1"}),
						new Text({text: "Title content 2"}),
						new Text({text: "Title content 3"})
					],
					actions : [
						new Button({text: "Action1"}),
						new Button({text: "Action2"})
					],
					snappedContent : [
						new Text({text: "Snapped content 1"}),
						new Text({text: "Snapped content 2"})
					],
					expandedContent : [
						new Text({text: "Expanded content 1"}),
						new Text({text: "Expanded content 2"})
					]
				});
			}
		});
	})
	.then(function () {
		return elementDesigntimeTest({
			type: "sap.f.DynamicPageTitle (with snapped/expanded heading)",
			create: function () {
				return new DynamicPageTitle({
					snappedHeading : new Title({text: "This is title"}),
					expandedHeading : [
						new Title({text: "This is title"}),
						new Title({text: "This is title 0.1"})
					],
					content : [
						new Text({text: "Title content 1"}),
						new Text({text: "Title content 2"}),
						new Text({text: "Title content 3"})
					],
					actions : [
						new Button({text: "Action1"}),
						new Button({text: "Action2"})
					],
					snappedContent : [
						new Text({text: "Snapped content 1"}),
						new Text({text: "Snapped content 2"})
					],
					expandedContent : [
						new Text({text: "Expanded content 1"}),
						new Text({text: "Expanded content 2"})
					]
				});
			}
		});
	})
	.then(function() {
		// ------------ HIDING THE CONTROL --------------
		// Check if the remove action is working properly
		var fnConfirmDynamicPageTitleIsInvisible = function(oAppComponent, oViewAfterAction, assert){
			assert.ok(oViewAfterAction.byId("title").getVisible() === false, "then the DynamicPageTitle is invisible");
		};

		var fnConfirmDynamicPageTitleIsVisible = function(oAppComponent, oViewAfterAction, assert){
			assert.ok(oViewAfterAction.byId("title").getVisible() === true, "then the DynamicPageTitle is visible");
		};

		// Use elementActionTest to check if your control is ready for the remove action of UI adaptation
		elementActionTest("Checking the remove action for DynamicPageTitle", {
			xmlView :
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.f">' +
					'<DynamicPageTitle id="title" >' +
						'<heading>' +
							'<m:Title text="Title text" />' +
						'</heading>' +
					'</DynamicPageTitle>' +
				'</mvc:View>'
			,
			action : {
				name : "remove",
				controlId : "title",
				parameter : function(oView){
					return {
						removedElement : oView.byId("title")
					};
				}
			},
			afterAction : fnConfirmDynamicPageTitleIsInvisible,
			afterUndo : fnConfirmDynamicPageTitleIsVisible,
			afterRedo : fnConfirmDynamicPageTitleIsInvisible
		});

		// ----------- UNHIDING THE CONTROL -------------
		// Check if the reveal action is working properly
		var fnConfirmDynamicPageTitleIsRevealed = function (oAppComponent, oView, assert) {
			var oGroupElement = oView.byId("title");
			assert.ok(oGroupElement.getVisible(), "then the DynamicPageTitle is visible");
		};
		var fnConfirmDynamicPageTitleIsHidden = function (oAppComponent, oView, assert) {
			var oGroupElement = oView.byId("title");
			assert.notOk(oGroupElement.getVisible(), "then the DynamicPageTitle is hidden");
		};
		elementActionTest("Checking the reveal action for a DynamicPageTitle", {
			xmlView :
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.f">' +
					'<DynamicPageTitle id="title" visible="false">' +
						'<heading>' +
							'<m:Title text="Title text" />' +
						'</heading>' +
					'</DynamicPageTitle>' +
				'</mvc:View>'
			,
			action : {
				name : "reveal",
				controlId : "title"
			},
			afterAction : fnConfirmDynamicPageTitleIsRevealed,
			afterUndo : fnConfirmDynamicPageTitleIsHidden,
			afterRedo : fnConfirmDynamicPageTitleIsRevealed
		});

		// --------- MOVING THE CONTROL'S CONTENT ---------
		// Check if the move action is working properly
		var fnConfirmContentElement1IsOn3rdPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("text1").getId(),                   // Id of element at first position in original view
								oViewAfterAction.byId("title").getContent() [2].getId(),   // Id of third element in group after change has been applied
								"then the control has been moved to the right position");
		};
		var fnConfirmContentElement1IsOn1stPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("text1").getId(),                   // Id of element at first position in original view
								oViewAfterAction.byId("title").getContent() [0].getId(),   // Id of third element in group after change has been applied
								"then the control has been moved to the previous position");
		};
		// Use elementActionTest to check if a control is ready for the move action of UI adaptation
		elementActionTest("Checking the move action for a simple control in DynamicPageTitle's content aggregation", {
			xmlView :
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.f">' +
					'<DynamicPageTitle id="title">' +
						'<content>' +
							'<m:Text id="text1" text="Simple header text 1" />' +
							'<m:Text id="text2" text="Simple header text 2" />' +
							'<m:Text id="text3" text="Simple header text 3" />' +
						'</content>' +
					'</DynamicPageTitle>' +
				'</mvc:View>'
			,
			action : {
				name : "move",
				controlId : "title",
				parameter : function(oView){
					return {
						movedElements : [{
							element : oView.byId("text1"),
							sourceIndex : 0,
							targetIndex : 2
						}],
						source : {
							aggregation: "content",
							parent: oView.byId("title")
						},
						target : {
							aggregation: "content",
							parent: oView.byId("title")
						}
					};
				}
			},
			afterAction : fnConfirmContentElement1IsOn3rdPosition,
			afterUndo : fnConfirmContentElement1IsOn1stPosition,
			afterRedo : fnConfirmContentElement1IsOn3rdPosition
		});

		// --------- MOVING THE CONTROL'S EXPANDED CONTENT ---------
		// Check if the move action is working properly
		var fnConfirmExpandedContentElement1IsOn3rdPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("text1").getId(),                   // Id of element at first position in original view
								oViewAfterAction.byId("title").getExpandedContent() [2].getId(),   // Id of third element in group after change has been applied
								"then the control has been moved to the right position");
		};
		var fnConfirmExpandedContentElement1IsOn1stPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("text1").getId(),                   // Id of element at first position in original view
								oViewAfterAction.byId("title").getExpandedContent() [0].getId(),   // Id of third element in group after change has been applied
								"then the control has been moved to the previous position");
		};
		// Use elementActionTest to check if a control is ready for the move action of UI adaptation
		elementActionTest("Checking the move action for a simple control in DynamicPageTitle's expandedContent aggregation", {
			xmlView :
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.f">' +
					'<DynamicPageTitle id="title">' +
						'<expandedContent>' +
							'<m:Text id="text1" text="Simple header text 1" />' +
							'<m:Text id="text2" text="Simple header text 2" />' +
							'<m:Text id="text3" text="Simple header text 3" />' +
						'</expandedContent>' +
					'</DynamicPageTitle>' +
				'</mvc:View>'
			,
			action : {
				name : "move",
				controlId : "title",
				parameter : function(oView){
					return {
						movedElements : [{
							element : oView.byId("text1"),
							sourceIndex : 0,
							targetIndex : 2
						}],
						source : {
							aggregation: "expandedContent",
							parent: oView.byId("title")
						},
						target : {
							aggregation: "expandedContent",
							parent: oView.byId("title")
						}
					};
				}
			},
			afterAction : fnConfirmExpandedContentElement1IsOn3rdPosition,
			afterUndo : fnConfirmExpandedContentElement1IsOn1stPosition,
			afterRedo : fnConfirmExpandedContentElement1IsOn3rdPosition
		});

		// --------- MOVING THE CONTROL'S SNAPPED CONTENT ---------
		// Check if the move action is working properly
		var fnConfirmSnappedContentElement1IsOn3rdPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("text1").getId(),                   // Id of element at first position in original view
								oViewAfterAction.byId("title").getSnappedContent() [2].getId(),   // Id of third element in group after change has been applied
								"then the control has been moved to the right position");
		};
		var fnConfirmSnappedContentElement1IsOn1stPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("text1").getId(),                   // Id of element at first position in original view
								oViewAfterAction.byId("title").getSnappedContent() [0].getId(),   // Id of third element in group after change has been applied
								"then the control has been moved to the previous position");
		};
		// Use elementActionTest to check if a control is ready for the move action of UI adaptation
		elementActionTest("Checking the move action for a simple control in DynamicPageTitle's snappedContent aggregation", {
			xmlView :
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.f">' +
					'<DynamicPageTitle id="title">' +
						'<snappedContent>' +
							'<m:Text id="text1" text="Simple header text 1" />' +
							'<m:Text id="text2" text="Simple header text 2" />' +
							'<m:Text id="text3" text="Simple header text 3" />' +
						'</snappedContent>' +
					'</DynamicPageTitle>' +
				'</mvc:View>'
			,
			action : {
				name : "move",
				controlId : "title",
				parameter : function(oView){
					return {
						movedElements : [{
							element : oView.byId("text1"),
							sourceIndex : 0,
							targetIndex : 2
						}],
						source : {
							aggregation: "snappedContent",
							parent: oView.byId("title")
						},
						target : {
							aggregation: "snappedContent",
							parent: oView.byId("title")
						}
					};
				}
			},
			afterAction : fnConfirmSnappedContentElement1IsOn3rdPosition,
			afterUndo : fnConfirmSnappedContentElement1IsOn1stPosition,
			afterRedo : fnConfirmSnappedContentElement1IsOn3rdPosition
		});

		// --------- MOVING THE CONTROL'S ACTIONS CONTENT ---------
		// Check if the move action is working properly
		var fnConfirmActionsContentElement1IsOn3rdPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("btn1").getId(),                   // Id of element at first position in original view
								oViewAfterAction.byId("title").getActions() [2].getId(),   // Id of third element in group after change has been applied
								"then the control has been moved to the right position");
		};
		var fnConfirmActionsContentElement1IsOn1stPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("btn1").getId(),                   // Id of element at first position in original view
								oViewAfterAction.byId("title").getActions() [0].getId(),   // Id of third element in group after change has been applied
								"then the control has been moved to the previous position");
		};
		// Use elementActionTest to check if a control is ready for the move action of UI adaptation
		elementActionTest("Checking the move action for a simple control in DynamicPageTitle's actions aggregation", {
			xmlView :
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.f">' +
					'<DynamicPageTitle id="title">' +
						'<actions>' +
							'<m:Button id="btn1" text="Action 1" />' +
							'<m:Button id="btn2" text="Action 2" />' +
							'<m:Button id="btn3" text="Action 3" />' +
						'</actions>' +
					'</DynamicPageTitle>' +
				'</mvc:View>'
			,
			action : {
				name : "move",
				controlId : "title",
				parameter : function(oView){
					return {
						movedElements : [{
							element : oView.byId("btn1"),
							sourceIndex : 0,
							targetIndex : 2
						}],
						source : {
							aggregation: "actions",
							parent: oView.byId("title")
						},
						target : {
							aggregation: "actions",
							parent: oView.byId("title")
						}
					};
				}
			},
			afterAction : fnConfirmActionsContentElement1IsOn3rdPosition,
			afterUndo : fnConfirmActionsContentElement1IsOn1stPosition,
			afterRedo : fnConfirmActionsContentElement1IsOn3rdPosition
		});

		// --------- COMBINING THE CONTROL'S ACTIONS ---------
		// Check if the combine action is working properly
		var fnConfirmActionElementsAreCombined = function (oUiComponent,oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("title").getActions().length, 1, "then the DynamicPageTitle contains 1 combined action");
			// destroy controls which are no longer part of the view after combine command
			// to avoid duplicate id errors
			Core.byId("comp---view--action1").destroy();
			Core.byId("comp---view--action2").destroy();
			Core.byId("comp---view--action3").destroy();
		};
		var fnConfirmCombinedActionElementsAreSplit = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("title").getActions().length, 3, "then the DynamicPageTitle contains 3 actions");
		};

		// Use elementActionTest to check if your control is ready for the remove action of UI adaptation
		elementActionTest("Checking the combine action for group elements", {
			jsOnly : true,
			xmlView :
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.f">' +
					'<DynamicPageTitle id="title">' +
						'<actions>' +
							'<m:Button id="action1" text="Action 1" />' +
							'<m:Button id="action2" text="Action 2" />' +
							'<m:Button id="action3" text="Action 3" />' +
						'</actions>' +
					'</DynamicPageTitle>' +
				'</mvc:View>',
			action : {
				name : "combine",
				controlId : "action1",
				parameter : function(oView){
					return {
						source : oView.byId("action1"),
						combineElements : [
							oView.byId("action1"),
							oView.byId("action2"),
							oView.byId("action3")
						]
					};
				}
			},
			layer : "VENDOR",
			afterAction : fnConfirmActionElementsAreCombined,
			afterUndo : fnConfirmCombinedActionElementsAreSplit,
			afterRedo : fnConfirmActionElementsAreCombined
		});


		// --------- SPLITTING THE CONTROL'S ACTIONS ---------
		// Check if the combine action is working properly
		var fnConfirmActionElementsAreSplit = function (oUiComponent,oViewAfterAction, assert) {
			var aActions = oViewAfterAction.byId("title").getActions();

			assert.strictEqual( aActions.length, 2,
				"then the DynamicPageTitle contains 2 buttons");
			assert.strictEqual( aActions[1].getText(), "item 2",
				"then the second button has the correct text");
			assert.strictEqual( aActions[1].getId(), "btn2",
				"then the second button has the correct id");

			Core.byId("comp---view--menubtn").destroy();
		};

		var fnConfirmSplitActionElementsAreCombined = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("title").getActions().length, 1, "then the Toolbar contains 1 menuButton");
		};

		elementActionTest("Checking the split action for group elements", {
			jsOnly : true,
			xmlView :
				 '<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.f" xmlns="sap.m">' +
					'<f:DynamicPageTitle id="title">' +
						'<f:actions>' +
							'<MenuButton id="menubtn">' +
								'<menu>' +
									'<Menu>' +
										'<items>' +
											'<MenuItem text="item 1" id="item1"/>' +
											'<MenuItem text="item 2" id="item2"/>' +
										'</items>' +
									'</Menu>' +
								'</menu>' +
							'</MenuButton>' +
						'</f:actions>' +
					'</f:DynamicPageTitle>' +
				'</mvc:View>'
			,
			action : {
				name : "split",
				controlId : "menubtn",
				parameter : function(oView){
					return {
						newElementIds : ["btn1", "btn2"],
						source : oView.byId("menubtn"),
						parentElement : oView.byId("title")
					};
				}
			},
			layer: "VENDOR",
			afterAction : fnConfirmActionElementsAreSplit,
			afterUndo : fnConfirmSplitActionElementsAreCombined,
			afterRedo : fnConfirmActionElementsAreSplit
		});

		// --------- MOVING THE CONTROL'S ACTIONS CONTENT ---------
		// Check if the move action is working properly
		var fnConfirmActionsElement1IsOn3rdPosition = function(oAppComponent, oViewAfterAction, assert) {

		assert.strictEqual(oViewAfterAction.byId("action1").getId(),                   // Id of element at first position in original view
			oViewAfterAction.byId("title").getActions()[2].getId(),   // Id of third element in group after change has been applied
			"then the control has been moved to the right position");
		};
		var fnConfirmActionsElement1IsOn1stPosition = function(oAppComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("action1").getId(),                   // Id of element at first position in original view
			oViewAfterAction.byId("title").getActions()[0].getId(),   // Id of first element in group after change has been undone
			"then the control has been moved to the previous position");
		};
		// Use elementActionTest to check if a control is ready for the move action of UI adaptation
		elementActionTest("Checking the move action for a simple control in DynamicPageTitle's action aggregation", {
			xmlView : '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.f">' +
				'<DynamicPageTitle id="title">' +
					'<actions>' +
					'<m:Button id="action1" text="Action 1" />' +
					'<m:Button id="action2" text="Action 2" />' +
					'<m:Button id="action3" text="Action 3" />' +
					'</actions>' +
				'</DynamicPageTitle>' +
			'</mvc:View>'
			,
			action : {
				name : "move",
				controlId : "title",
				parameter : function(oView) {
					return {
						movedElements : [{
							element : oView.byId("action1"),
							sourceIndex : 0,
							targetIndex : 2
						}],
						source : {
							aggregation: "actions",
							parent: oView.byId("title")
						},
						target : {
							aggregation: "actions",
							parent: oView.byId("title")
						}
					};
				}
			},
			afterAction : fnConfirmActionsElement1IsOn3rdPosition,
			afterUndo : fnConfirmActionsElement1IsOn1stPosition,
			afterRedo : fnConfirmActionsElement1IsOn3rdPosition
		});
	});
});