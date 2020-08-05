sap.ui.define([
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/ui/rta/enablement/elementActionTest",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/OverflowToolbarButton",
	"sap/m/Button",
	"sap/m/Breadcrumbs",
	"sap/m/DraftIndicator",
	"sap/m/Link",
	"sap/m/OverflowToolbarLayoutData",
	"sap/f/semantic/TitleMainAction",
	"sap/f/semantic/SemanticPage",
	"sap/f/semantic/EditAction",
	"sap/f/semantic/AddAction",
	"sap/f/semantic/DeleteAction",
	"sap/f/semantic/CopyAction",
	"sap/f/semantic/FlagAction",
	"sap/f/semantic/FavoriteAction",
	"sap/f/semantic/FullScreenAction",
	"sap/f/semantic/ExitFullScreenAction",
	"sap/f/semantic/CloseAction",
	"sap/f/semantic/FooterMainAction",
	"sap/f/semantic/MessagesIndicator",
	"sap/f/semantic/PositiveAction",
	"sap/f/semantic/NegativeAction",
	"sap/f/semantic/DiscussInJamAction",
	"sap/f/semantic/ShareInJamAction",
	"sap/f/semantic/SendMessageAction",
	"sap/f/semantic/SendEmailAction",
	"sap/f/semantic/PrintAction"
], function (
	elementDesigntimeTest,
	elementActionTest,
	Text,
	Title,
	OverflowToolbarButton,
	Button,
	Breadcrumbs,
	DraftIndicator,
	Link,
	OverflowToolbarLayoutData,
	TitleMainAction,
	SemanticPage,
	EditAction,
	AddAction,
	DeleteAction,
	CopyAction,
	FlagAction,
	FavoriteAction,
	FullScreenAction,
	ExitFullScreenAction,
	CloseAction,
	FooterMainAction,
	MessagesIndicator,
	PositiveAction,
	NegativeAction,
	DiscussInJamAction,
	ShareInJamAction,
	SendMessageAction,
	SendEmailAction,
	PrintAction
) {
	"use strict";

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
			type: "sap.f.DynamicPage",
			create: function () {
				return new SemanticPage({
					showFooter : true,
					titleHeading : new Title({text : "Title text"}),
					titleSnappedHeading : [new Text({text : "Collapsed header content"})],
					titleExpandedHeading : [new Text({text : "Expanded header content"})],
					titleSnappedContent : [new Text({text : "Collapsed subheading"})],
					titleExpandedContent : [new Text({text : "Expanded subheading"})],
					titleMainAction : new TitleMainAction({text : "TitleMainAction Text"}),
					titleContent: [
						new Text({text: "Title Content 1"}),
						new Text({text: "Title Content 2"}),
						new Text({text: "Title Content 3"})
					],
					editAction : new EditAction({
						layoutData : [
							new OverflowToolbarLayoutData({
								priority : "NeverOverflow"
							})
						]
					}),
					addAction : new AddAction({
						layoutData : [
							new OverflowToolbarLayoutData({
								priority : "NeverOverflow"
							})
						]
					}),
					deleteAction : new DeleteAction({
						layoutData : [
							new OverflowToolbarLayoutData({
								priority : "NeverOverflow"
							})
						]
					}),
					copyAction : new CopyAction({
						layoutData : [
							new OverflowToolbarLayoutData({
								priority : "NeverOverflow"
							})
						]
					}),
					flagAction : new FlagAction({
						layoutData : [
							new OverflowToolbarLayoutData({
								priority : "NeverOverflow"
							})
						]
					}),
					favoriteAction : new FavoriteAction({
						layoutData : [
							new OverflowToolbarLayoutData({
								priority : "NeverOverflow"
							})
						]
					}),
					fullScreenAction : new FullScreenAction({
						layoutData : [
							new OverflowToolbarLayoutData({
								priority : "NeverOverflow"
							})
						]
					}),
					exitFullScreenAction : new ExitFullScreenAction({
						layoutData : [
							new OverflowToolbarLayoutData({
								priority : "NeverOverflow"
							})
						]
					}),
					closeAction : new CloseAction({
						layoutData : [
							new OverflowToolbarLayoutData({
								priority : "NeverOverflow"
							})
						]
					}),
					titleCustomTextActions: [
						new Button({
							text : "Title Custom Text Actions",
							layoutData : [
								new OverflowToolbarLayoutData({
									priority : "NeverOverflow"
								})
							]
						})
					],
					titleCustomIconActions : [
						new OverflowToolbarButton({
							icon: "sap-icon://cart",
							layoutData : [
								new OverflowToolbarLayoutData({
									priority : "NeverOverflow"
								})
							]
						})
					],
					headerContent : [
						new Text({text : "Some Header Content"})
					],
					content : new Text({text : "Some sample content"}),
					footerMainAction : new FooterMainAction(),
					messagesIndicator : new MessagesIndicator({
						visible: true
					}),
					draftIndicator : new DraftIndicator(),
					positiveAction : new PositiveAction(),
					negativeAction : new NegativeAction(),
					footerCustomActions : new Button({text : "Footer Custom Action"}),
					discussInJamAction : new DiscussInJamAction(),
					saveAsTileAction : new Button({text : "Save as Tile Action"}),
					shareInJamAction : new ShareInJamAction(),
					sendMessageAction : new SendMessageAction(),
					sendEmailAction : new SendEmailAction(),
					printAction : new PrintAction(),
					customShareActions : new Button({text : "Custom Share Action"}),
					titleBreadcrumbs : new Breadcrumbs({
						currentLocationText : "test",
						links : [
							new Link({text: "link1"}),
							new Link({text: "link2"})
						]
					})
				});
			}
		});
	})
	.then(function() {
		var fnConfirmMoveExpandedContentOn3rdPosition = function (oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("button1").getId(),                 // Id of element at first position in original view
				oViewAfterAction.byId("semanticPage").getTitleExpandedContent() [2].getId(), // Id of third element in group after change has been applied
				"then the control has been moved to the right position");
		};
		var fnConfirmMoveExpandedContentOn1stPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("button1").getId(),                 // Id of element at first position in original view
				oViewAfterAction.byId("semanticPage").getTitleExpandedContent() [0].getId(), // Id of third element in group after change has been applied
				"then the control has been moved to the previous position");
		};

		// Use elementActionTest to check if a control is ready for the move action of UI adaptation
		elementActionTest("Checking the move action for SemanticPage's TitleExpandedContent aggregation", {
			xmlView :
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.f.semantic">' +
				'<SemanticPage id="semanticPage">' +
					'<titleExpandedContent>' +
						'<m:Button text="Content1" id="button1" />' +
						'<m:Button text="Content2" id="button2" />' +
						'<m:Button text="Content3" id="button3" />' +
					'</titleExpandedContent>' +
				'</SemanticPage>' +
			'</mvc:View>'
			,
			action : {
				name : "move",
				controlId : "semanticPage",
				parameter : function(oView){
					return {
						movedElements : [{
							element : oView.byId("button1"),
							sourceIndex : 0,
							targetIndex : 2
						}],
						source : {
							aggregation: "titleExpandedContent",
							parent: oView.byId("semanticPage")
						},
						target : {
							aggregation: "titleExpandedContent",
							parent: oView.byId("semanticPage")
						}
					};
				}
			},
			afterAction : fnConfirmMoveExpandedContentOn3rdPosition,
			afterUndo : fnConfirmMoveExpandedContentOn1stPosition,
			afterRedo : fnConfirmMoveExpandedContentOn3rdPosition
		});

		var fnConfirmMoveCollapsedContentOn3rdPosition = function (oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("button1").getId(),                 // Id of element at first position in original view
				oViewAfterAction.byId("semanticPage").getTitleSnappedContent() [2].getId(), // Id of third element in group after change has been applied
				"then the control has been moved to the right position");
		};
		var fnConfirmMoveCollapsedContentOn1stPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("button1").getId(),                 // Id of element at first position in original view
				oViewAfterAction.byId("semanticPage").getTitleSnappedContent() [0].getId(), // Id of third element in group after change has been applied
				"then the control has been moved to the previous position");
		};

		// Use elementActionTest to check if a control is ready for the move action of UI adaptation
		elementActionTest("Checking the move action for SemanticPage's TitleCollapsedContent aggregation", {
			xmlView :
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.f.semantic">' +
				'<SemanticPage id="semanticPage" headerExpanded="false">' +
					'<titleSnappedContent>' +
						'<m:Button text="Content1" id="button1" />' +
						'<m:Button text="Content2" id="button2" />' +
						'<m:Button text="Content3" id="button3" />' +
					'</titleSnappedContent>' +
				'</SemanticPage>' +
			'</mvc:View>'
			,
			action : {
				name : "move",
				controlId : "semanticPage",
				parameter : function(oView){
					return {
						movedElements : [{
							element : oView.byId("button1"),
							sourceIndex : 0,
							targetIndex : 2
						}],
						source : {
							aggregation: "titleSnappedContent",
							parent: oView.byId("semanticPage")
						},
						target : {
							aggregation: "titleSnappedContent",
							parent: oView.byId("semanticPage")
						}
					};
				}
			},
			afterAction : fnConfirmMoveCollapsedContentOn3rdPosition,
			afterUndo : fnConfirmMoveCollapsedContentOn1stPosition,
			afterRedo : fnConfirmMoveCollapsedContentOn3rdPosition
		});

		var fnConfirmMoveTitleContentOn3rdPosition = function (oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("button1").getId(),                 // Id of element at first position in original view
				oViewAfterAction.byId("semanticPage").getTitleContent() [2].getId(), // Id of third element in group after change has been applied
				"then the control has been moved to the right position");
		};
		var fnConfirmMoveTitleContentOn1stPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("button1").getId(),                 // Id of element at first position in original view
				oViewAfterAction.byId("semanticPage").getTitleContent() [0].getId(), // Id of third element in group after change has been applied
				"then the control has been moved to the previous position");
		};

		// Use elementActionTest to check if a control is ready for the move action of UI adaptation
		elementActionTest("Checking the move action for SemanticPage's TitleContent aggregation", {
			xmlView :
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.f.semantic">' +
				'<SemanticPage id="semanticPage">' +
					'<titleContent>' +
						'<m:Button text="Content1" id="button1" />' +
						'<m:Button text="Content2" id="button2" />' +
						'<m:Button text="Content3" id="button3" />' +
					'</titleContent>' +
				'</SemanticPage>' +
			'</mvc:View>'
			,
			action : {
				name : "move",
				controlId : "semanticPage",
				parameter : function(oView){
					return {
						movedElements : [{
							element : oView.byId("button1"),
							sourceIndex : 0,
							targetIndex : 2
						}],
						source : {
							aggregation: "titleContent",
							parent: oView.byId("semanticPage")
						},
						target : {
							aggregation: "titleContent",
							parent: oView.byId("semanticPage")
						}
					};
				}
			},
			afterAction : fnConfirmMoveTitleContentOn3rdPosition,
			afterUndo : fnConfirmMoveTitleContentOn1stPosition,
			afterRedo : fnConfirmMoveTitleContentOn3rdPosition
		});

		var fnConfirmMoveHeaderContentOn3rdPosition = function (oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("button1").getId(),                 // Id of element at first position in original view
				oViewAfterAction.byId("semanticPage").getHeaderContent() [2].getId(), // Id of third element in group after change has been applied
				"then the control has been moved to the right position");
		};
		var fnConfirmMoveHeaderContentOn1stPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("button1").getId(),                 // Id of element at first position in original view
				oViewAfterAction.byId("semanticPage").getHeaderContent() [0].getId(), // Id of third element in group after change has been applied
				"then the control has been moved to the previous position");
		};

		// Use elementActionTest to check if a control is ready for the move action of UI adaptation
		elementActionTest("Checking the move action for SemanticPage's HeaderContent aggregation", {
			xmlView :
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.f.semantic">' +
				'<SemanticPage id="semanticPage">' +
					'<headerContent>' +
						'<m:Button text="Content1" id="button1" />' +
						'<m:Button text="Content2" id="button2" />' +
						'<m:Button text="Content3" id="button3" />' +
					'</headerContent>' +
				'</SemanticPage>' +
			'</mvc:View>'
			,
			action : {
				name : "move",
				controlId : "semanticPage",
				parameter : function(oView){
					return {
						movedElements : [{
							element : oView.byId("button1"),
							sourceIndex : 0,
							targetIndex : 2
						}],
						source : {
							aggregation: "headerContent",
							parent: oView.byId("semanticPage")
						},
						target : {
							aggregation: "headerContent",
							parent: oView.byId("semanticPage")
						}
					};
				}
			},
			afterAction : fnConfirmMoveHeaderContentOn3rdPosition,
			afterUndo : fnConfirmMoveHeaderContentOn1stPosition,
			afterRedo : fnConfirmMoveHeaderContentOn3rdPosition
		});
	});
});