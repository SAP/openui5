(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/dt/test/report/QUnit",
		"sap/ui/rta/test/controlEnablingCheck",
		"sap/ui/dt/test/ElementEnablementTest",
		"sap/uxap/ObjectPageDynamicHeaderTitle",
        "sap/m/Text",
        "sap/m/Title",
        "sap/m/Button"
	], function (
		QUnitReport,
		rtaControlEnablingCheck,
		ElementEnablementTest,
		ObjectPageDynamicHeaderTitle,
		Text,
		Title,
		Button) {

		var sXmlView = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.uxap" xmlns:m="sap.m" xmlns:f="sap.f">' +
							'<ObjectPageDynamicHeaderTitle id="title">' +
								'<breadcrumbs>' +
									'<m:Breadcrumbs>' +
										'<m:Link text="My Company"/>' +
										'<m:Link text="My Department"/>' +
										'<m:Link text="Employees"/>' +
									'</m:Breadcrumbs>' +
								'</breadcrumbs>' +
								'<expandedHeading>' +
									'<m:FlexBox wrap="Wrap" fitContainer="true" alignItems="Center">' +
										'<m:Title text="Denise Smith" wrapping="true"/>' +
										'<m:FlexBox wrap="NoWrap" fitContainer="true" alignItems="Center">' +
											'<m:ObjectMarker type="Favorite"/>' +
											'<m:ObjectMarker type="Flagged"/>' +
											'<m:Button icon="sap-icon://private" type="Transparent"/>' +
											'<m:Button icon="sap-icon://arrow-down" type="Transparent"/>' +
										'</m:FlexBox>' +
									'</m:FlexBox>' +
								'</expandedHeading>' +
								'<snappedHeading>' +
									'<m:FlexBox wrap="Wrap" fitContainer="true" alignItems="Center">' +
										'<m:FlexBox wrap="NoWrap" fitContainer="true" alignItems="Center">' +
											'<f:Avatar displaySize="S"/>' +
											'<m:Title text="Denise Smith" wrapping="true"/>' +
										'</m:FlexBox>' +
										'<m:FlexBox wrap="NoWrap" fitContainer="true" alignItems="Center">' +
											'<m:ObjectMarker type="Favorite"/>' +
											'<m:ObjectMarker type="Flagged"/>' +
											'<m:Button icon="sap-icon://private" type="Transparent"/>' +
											'<m:Button icon="sap-icon://arrow-down" type="Transparent"/>' +
										'</m:FlexBox>' +
									'</m:FlexBox>' +
								'</snappedHeading>' +
								'<expandedContent>' +
									'<m:Text id="expandedContent1" text="Senior Developer"/>' +
									'<m:Text id="expandedContent2" text="UI5 Department"/>' +
								'</expandedContent>' +
								'<snappedContent>' +
									'<m:Text id="snappedContent1" text="Senior Developer"/>' +
									'<m:Text id="snappedContent2" text="UI5 Department"/>' +
								'</snappedContent>' +
								'<actions>' +
									'<m:OverflowToolbarButton id="action1" type="Transparent" icon="sap-icon://copy"/>' +
									'<m:OverflowToolbarButton id="action2" type="Transparent" icon="sap-icon://delete"/>' +
									'<m:OverflowToolbarButton id="action3" type="Transparent" icon="sap-icon://add"/>' +
									'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://paste"/>' +
								'</actions>' +
								'<navigationActions>' +
									'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://full-screen" tooltip="Enter Full Screen Mode"/>' +
									'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://decline" tooltip="Close column"/>' +
								'</navigationActions>' +
							'</ObjectPageDynamicHeaderTitle>' +
						'</mvc:View>';

		// ------------ HIDING THE CONTROL --------------
		// Check if the remove action is working properly

		var fnConfirmTitleIsInvisible = function(oAppComponent, oViewAfterAction, assert){
			assert.ok(oViewAfterAction.byId("title").getVisible() === false, "then the ObjectPageDynamicHeaderTitle is invisible");
		};

		var fnConfirmTitleIsVisible = function(oAppComponent, oViewAfterAction, assert){
			assert.ok(oViewAfterAction.byId("title").getVisible() === true, "then the ObjectPageDynamicHeaderTitle is visible");
		};

		// Use rtaControlEnablingCheck to check if your control is ready for the remove action of UI adaptation
		rtaControlEnablingCheck("Checking the remove action for ObjectPageDynamicHeaderTitle", {
			xmlView : sXmlView,
			action : {
				name : "remove",
				controlId : "title",
				parameter : function(oView){
					return {
						removedElement : oView.byId("title")
					};
				}
			},
			afterAction : fnConfirmTitleIsInvisible,
			afterUndo : fnConfirmTitleIsVisible,
			afterRedo : fnConfirmTitleIsInvisible
		});

		// ----------- UNHIDING THE CONTROL -------------
        // Check if the reveal action is working properly
        var fnConfirmTitleIsRevealed = function (oAppComponent, oView, assert) {
            var oGroupElement = oView.byId("title");
            assert.ok(oGroupElement.getVisible(), "then the ObjectPageDynamicHeaderTitle is visible");
        };
        var fnConfirmTitleIsHidden = function (oAppComponent, oView, assert) {
            var oGroupElement = oView.byId("title");
            assert.notOk(oGroupElement.getVisible(), "then the ObjectPageDynamicHeaderTitle is hidden");
        };
        rtaControlEnablingCheck("Checking the reveal action for a ObjectPageDynamicHeaderTitle", {
            xmlView : '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.uxap">' +
                    '<ObjectPageDynamicHeaderTitle id="title" visible="false">' +
                        '<heading>' +
                            '<m:Title text="Title text" />' +
                        '</heading>' +
                    '</ObjectPageDynamicHeaderTitle>' +
                '</mvc:View>',
            action : {
                name : "reveal",
                controlId : "title"
            },
            afterAction : fnConfirmTitleIsRevealed,
            afterUndo : fnConfirmTitleIsHidden,
            afterRedo : fnConfirmTitleIsRevealed
        });

		// --------- MOVING THE CONTROL'S EXPANDED CONTENT ---------
		// Check if the move action is working properly
		var fnConfirmExpandedContentElement1IsOn2ndPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("expandedContent1").getId(),                   // Id of element at first position in original view
								oViewAfterAction.byId("title").getExpandedContent() [1].getId(),   // Id of third element in group after change has been applied
								"then the control has been moved to the right position");
		};
		var fnConfirmExpandedContentElement1IsOn1stPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("expandedContent1").getId(),                   // Id of element at first position in original view
								oViewAfterAction.byId("title").getExpandedContent() [0].getId(),   // Id of third element in group after change has been applied
								"then the control has been moved to the previous position");
		};
		// Use rtaControlEnablingCheck to check if a control is ready for the move action of UI adaptation
		rtaControlEnablingCheck("Checking the move action for a simple control in ObjectPageDynamicHeaderTitle's expandedContent aggregation", {
			xmlView : sXmlView,
			action : {
				name : "move",
				controlId : "title",
				parameter : function(oView){
					return {
						movedElements : [{
							element : oView.byId("expandedContent1"),
							sourceIndex : 0,
							targetIndex : 1
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
			afterAction : fnConfirmExpandedContentElement1IsOn2ndPosition,
			afterUndo : fnConfirmExpandedContentElement1IsOn1stPosition,
			afterRedo : fnConfirmExpandedContentElement1IsOn2ndPosition
		});

		// --------- MOVING THE CONTROL'S SNAPPED CONTENT ---------
		// Check if the move action is working properly
		var fnConfirmSnappedContentElement1IsOn2ndPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("snappedContent1").getId(),                   // Id of element at first position in original view
								oViewAfterAction.byId("title").getSnappedContent() [1].getId(),   // Id of third element in group after change has been applied
								"then the control has been moved to the right position");
		};
		var fnConfirmSnappedContentElement1IsOn1stPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("snappedContent1").getId(),                   // Id of element at first position in original view
								oViewAfterAction.byId("title").getSnappedContent() [0].getId(),   // Id of third element in group after change has been applied
								"then the control has been moved to the previous position");
		};
		// Use rtaControlEnablingCheck to check if a control is ready for the move action of UI adaptation
		rtaControlEnablingCheck("Checking the move action for a simple control in ObjectPageDynamicHeaderTitle's snappedContent aggregation", {
			xmlView : sXmlView,
			action : {
				name : "move",
				controlId : "title",
				parameter : function(oView){
					return {
						movedElements : [{
							element : oView.byId("snappedContent1"),
							sourceIndex : 0,
							targetIndex : 1
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
			afterAction : fnConfirmSnappedContentElement1IsOn2ndPosition,
			afterUndo : fnConfirmSnappedContentElement1IsOn1stPosition,
			afterRedo : fnConfirmSnappedContentElement1IsOn2ndPosition
		});

		// --------- COMBINING THE CONTROL'S ACTIONS ---------
        // Check if the combine action is working properly
        var fnConfirmActionElementsAreCombined = function (oUiComponent,oViewAfterAction, assert) {
            assert.strictEqual( oViewAfterAction.byId("title").getActions().length, 2, "then the ObjectPageDynamicHeaderTitle contains 1 combined action and one other action");
            // destroy controls which are no longer part of the view after combine command
            // to avoid duplicate id errors
            sap.ui.getCore().byId("comp---view--action1").destroy();
            sap.ui.getCore().byId("comp---view--action2").destroy();
            sap.ui.getCore().byId("comp---view--action3").destroy();
        };
        var fnConfirmCombinedActionElementsAreSplit = function (oUiComponent, oViewAfterAction, assert) {
            assert.strictEqual( oViewAfterAction.byId("title").getActions().length, 4, "then the DynamicPageTitle contains 4 actions");
        };

        // Use rtaControlEnablingCheck to check if your control is ready for the remove action of UI adaptation
        rtaControlEnablingCheck("Checking the combine action for group elements", {
			jsOnly : true,
            xmlView : sXmlView,
            action : {
                name : "combine",
                controlId : "action1",
                parameter : function(oView){
                    return {
                        source : oView.byId("action1"),
                        combineFields : [
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
			assert.strictEqual( aActions[1].getText(), "The right button",
				"then the second button has the correct text");
			assert.strictEqual( aActions[1].getId(), "comp---view--combinedButtonId",
				"then the second button has the correct id");

			sap.ui.getCore().byId("comp---view--menubtn").destroy();
        };

        var fnConfirmSplitActionElementsAreCombined = function (oUiComponent, oViewAfterAction, assert) {
            var oMenuButton = oViewAfterAction.byId("title").getActions()[0],
				oSecondItem = oMenuButton.getMenu().getItems()[1];

			assert.strictEqual( oViewAfterAction.byId("title").getActions().length, 1,
				"then the Toolbar contains 1 menuButton");
			assert.strictEqual( oSecondItem.getCustomData().length, 1,
				"then the second menu item has 1 customData object");
			assert.strictEqual( oSecondItem.getDependents().length, 2,
				"then the second menu item has 2 dependents");
			assert.strictEqual( oSecondItem.getDependents()[0].getText(), "The right button",
				"then the second menu item's first dependent has the correct text");
        };

        rtaControlEnablingCheck("Checking the split action for group elements", {
			jsOnly : true,
            xmlView :
                 '<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns:uxap="sap.uxap" xmlns="sap.m">' +
                    '<uxap:ObjectPageDynamicHeaderTitle id="title">' +
                        '<uxap:actions>' +
                            '<MenuButton id="menubtn">' +
                                '<menu>' +
                                    '<Menu>' +
                                        '<items>' +
                                            '<MenuItem text="item 1" id="item1"/>' +
                                            '<MenuItem text="item 2" id="item2">' +
                                                '<customData>' +
                                                    '<core:CustomData id="item2-originalButtonId" key="originalButtonId" value="comp---view--combinedButtonId" />' +
                                                '</customData>' +
                                                '<dependents>' +
                                                    '<Button text="The right button" id="combinedButtonId"/>' +
                                                    '<Button text="Not the right button" id="notCombinedButtonId"/>' +
                                                '</dependents>' +
                                            '</MenuItem>' +
                                        '</items>' +
                                    '</Menu>' +
                                '</menu>' +
                            '</MenuButton>' +
                        '</uxap:actions>' +
                    '</uxap:ObjectPageDynamicHeaderTitle>' +
                '</mvc:View>'
            ,
            action : {
                name : "split",
                controlId : "menubtn",
                parameter : function(oView){
                    return {
                        newElementIds : ["combinedButtonId"],
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
        var fnConfirmActionsContentElement1IsOn3rdPosition = function(oAppComponent, oViewAfterAction, assert) {
            assert.strictEqual( oViewAfterAction.byId("action1").getId(),                   // Id of element at first position in original view
                                oViewAfterAction.byId("title").getActions() [2].getId(),   // Id of third element in group after change has been applied
                                "then the control has been moved to the right position");
        };
        var fnConfirmActionsContentElement1IsOn1stPosition = function(oAppComponent, oViewAfterAction, assert) {
            assert.strictEqual( oViewAfterAction.byId("action1").getId(),                   // Id of element at first position in original view
                                oViewAfterAction.byId("title").getActions() [0].getId(),   // Id of third element in group after change has been applied
                                "then the control has been moved to the previous position");
        };
        // Use rtaControlEnablingCheck to check if a control is ready for the move action of UI adaptation
        rtaControlEnablingCheck("Checking the move action for a simple control in DynamicPageTitle's actions aggregation", {
            xmlView : sXmlView,
            action : {
                name : "move",
                controlId : "title",
                parameter : function(oView){
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
            afterAction : fnConfirmActionsContentElement1IsOn3rdPosition,
            afterUndo : fnConfirmActionsContentElement1IsOn1stPosition,
            afterRedo : fnConfirmActionsContentElement1IsOn3rdPosition
        });
	});
})();