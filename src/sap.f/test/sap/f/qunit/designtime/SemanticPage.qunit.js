(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/dt/test/report/QUnit",
		"sap/ui/dt/test/ElementEnablementTest",
		"sap/ui/rta/test/controlEnablingCheck",
		"sap/m/Text",
		"sap/m/Title",
		"sap/m/OverflowToolbarButton",
		"sap/m/Button"
	], function (
		QUnitReport,
		ElementEnablementTest,
		rtaControlEnablingCheck,
		Text,
		Title,
		OverflowToolbarButton,
		Button) {

		var oElementEnablementTest = new ElementEnablementTest({
			type: "sap.f.DynamicPage",
			create: function () {
				return new sap.f.semantic.SemanticPage({
					showFooter : true,
					titleHeading : new Title({text : "Title text"}),
					titleSnappedContent : [new Text({text : "Collapsed subheading"})],
					titleExpandedContent : [new Text({text : "Expanded subheading"})],
					titleMainAction : new sap.f.semantic.TitleMainAction({text : "TitleMainAction Text"}),
					titleContent: [
						new sap.m.Text({text: "Title Content 1"}),
						new sap.m.Text({text: "Title Content 2"}),
						new sap.m.Text({text: "Title Content 3"})
					],
					editAction : new sap.f.semantic.EditAction({
						layoutData : [
							new sap.m.OverflowToolbarLayoutData({
								priority : "NeverOverflow"
							})
						]
					}),
					addAction : new sap.f.semantic.AddAction({
						layoutData : [
							new sap.m.OverflowToolbarLayoutData({
								priority : "NeverOverflow"
							})
						]
					}),
					deleteAction : new sap.f.semantic.DeleteAction({
						layoutData : [
							new sap.m.OverflowToolbarLayoutData({
								priority : "NeverOverflow"
							})
						]
					}),
					copyAction : new sap.f.semantic.CopyAction({
						layoutData : [
							new sap.m.OverflowToolbarLayoutData({
								priority : "NeverOverflow"
							})
						]
					}),
					flagAction : new sap.f.semantic.FlagAction({
						layoutData : [
							new sap.m.OverflowToolbarLayoutData({
								priority : "NeverOverflow"
							})
						]
					}),
					favoriteAction : new sap.f.semantic.FavoriteAction({
						layoutData : [
							new sap.m.OverflowToolbarLayoutData({
								priority : "NeverOverflow"
							})
						]
					}),
					fullScreenAction : new sap.f.semantic.FullScreenAction({
						layoutData : [
							new sap.m.OverflowToolbarLayoutData({
								priority : "NeverOverflow"
							})
						]
					}),
					exitFullScreenAction : new sap.f.semantic.ExitFullScreenAction({
						layoutData : [
							new sap.m.OverflowToolbarLayoutData({
								priority : "NeverOverflow"
							})
						]
					}),
					closeAction : new sap.f.semantic.CloseAction({
						layoutData : [
							new sap.m.OverflowToolbarLayoutData({
								priority : "NeverOverflow"
							})
						]
					}),
					titleCustomTextActions: [
						new Button({
							text : "Title Custom Text Actions",
							layoutData : [
								new sap.m.OverflowToolbarLayoutData({
									priority : "NeverOverflow"
								})
							]
						})
					],
					titleCustomIconActions : [
						new OverflowToolbarButton({
							icon: "sap-icon://cart",
							layoutData : [
								new sap.m.OverflowToolbarLayoutData({
									priority : "NeverOverflow"
								})
							]
						})
					],
					headerContent : [
						new Text({text : "Some Header Content"})
					],
					content : new Text({text : "Some sample content"}),
					footerMainAction : new sap.f.semantic.FooterMainAction(),
					messagesIndicator : new sap.f.semantic.MessagesIndicator({
						visible: true
					}),
					draftIndicator : new sap.m.DraftIndicator(),
					positiveAction : new sap.f.semantic.PositiveAction(),
					negativeAction : new sap.f.semantic.NegativeAction(),
					footerCustomActions : new Button({text : "Footer Custom Action"}),
					discussInJamAction : new sap.f.semantic.DiscussInJamAction(),
					saveAsTileAction : new Button({text : "Save as Tile Action"}),
					shareInJamAction : new sap.f.semantic.ShareInJamAction(),
					sendMessageAction : new sap.f.semantic.SendMessageAction(),
					sendEmailAction : new sap.f.semantic.SendEmailAction(),
					printAction : new sap.f.semantic.PrintAction(),
					customShareActions : new Button({text : "Custom Share Action"}),
					titleBreadcrumbs : new sap.m.Breadcrumbs({
						currentLocationText : "test",
						links : [
							new sap.m.Link({text: "link1"}),
							new sap.m.Link({text: "link2"})
						]
					})
				});
			}
		});
		oElementEnablementTest.run().then(function (oData) {
			new QUnitReport({
				data: oData
			});
		});

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

		// Use rtaControlEnablingCheck to check if a control is ready for the move action of UI adaptation
		rtaControlEnablingCheck("Checking the move action for SemanticPage's TitleExpandedContent aggregation", {
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

		// Use rtaControlEnablingCheck to check if a control is ready for the move action of UI adaptation
		rtaControlEnablingCheck("Checking the move action for SemanticPage's TitleCollapsedContent aggregation", {
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

		// Use rtaControlEnablingCheck to check if a control is ready for the move action of UI adaptation
		rtaControlEnablingCheck("Checking the move action for SemanticPage's TitleContent aggregation", {
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

		// Use rtaControlEnablingCheck to check if a control is ready for the move action of UI adaptation
		rtaControlEnablingCheck("Checking the move action for SemanticPage's HeaderContent aggregation", {
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
})();