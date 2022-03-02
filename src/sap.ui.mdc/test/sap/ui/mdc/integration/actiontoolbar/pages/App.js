/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/test/Opa5",
    "sap/ui/test/matchers/Ancestor",
    "sap/ui/test/matchers/PropertyStrictEquals",
    "sap/ui/test/matchers/Properties",
    "sap/ui/test/actions/Press",
    "testutils/opa/actions/OpenContextMenu",
    "testutils/opa/p13n/waitForP13nDialog",
    "testutils/opa/p13n/Util"
], function (Opa5, Ancestor, PropertyStrictEquals, Properties, Press, OpenContextMenu, waitForP13nDialog, Util) {

	"use strict";

    var oMDCBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

    var iChangeSelectedActions = function(oP13nDialog, aActions) {
        this.waitFor({
			controlType: "sap.m.p13n.SelectionPanel",
			matchers: new Ancestor(oP13nDialog, false),
			success: function(aListViews) {
				var oListView = aListViews[0];
                this.waitFor({
					controlType: "sap.m.ColumnListItem",
					matchers: new Ancestor(oListView, false),
					actions: function(oColumnListItem) {
						this.waitFor({
							controlType: "sap.m.Label",
							matchers: new Ancestor(oColumnListItem, false),
							success: function(aLabels) {
								var oLabelControl = aLabels[0];
								this.waitFor({
									controlType: "sap.m.CheckBox",
									matchers: [
										new Ancestor(oColumnListItem, false)
									],
									actions: function(oCheckBox) {
										if ((!oCheckBox.getSelected() && aActions.includes(oLabelControl.getText())) ||
											(oCheckBox.getSelected() && !aActions.includes(oLabelControl.getText()))) {
											new Press().executeOn(oCheckBox);
										}
									}
                                });
                            }
                        });
                    }.bind(this)
                });
            }
        });
    };

    var iMoveAction = function(sActionLabel, sDirection) {
        return waitForP13nDialog.call(this, {
            matchers: [
                new Properties({
                    title: oMDCBundle.getText("actiontoolbar.RTA_TITLE")
                })
            ],
            success: function(oP13nDialog) {
                this.waitFor({
                    controlType: "sap.m.p13n.SelectionPanel",
                    matchers: new Ancestor(oP13nDialog, false),
                    success: function(aListViews) {
                        var oListView = aListViews[0];
                        this.waitFor({
                            controlType: "sap.m.ColumnListItem",
                            matchers: function(oColumnListItem) {
                                return new Ancestor(oListView, false)(oColumnListItem) && oColumnListItem.getCells()[0].getItems()[0].getText() === sActionLabel;
                            },
                            actions: new Press(),
                            success: function(aColumnListItem) {
                                var oColumnListItem = aColumnListItem[0];
                                this.waitFor({
                                    controlType: "sap.m.CheckBox",
                                    matchers: [
                                        new Ancestor(oColumnListItem, false)
                                    ],
                                    success: function(aCheckBoxes) {
                                        if (aCheckBoxes[0].getSelected()) {
                                            this.waitFor({
                                                controlType: "sap.m.Button",
                                                matchers: [
                                                    new PropertyStrictEquals({
                                                        name: "icon",
                                                        value: sDirection
                                                    }),
                                                    new Ancestor(oColumnListItem, false)
                                                ],
                                                actions: new Press()
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    };

    Opa5.createPageObjects({
		onTheApp: {
			actions: {
                iPressOnStartRtaButton: function() {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        matchers: new PropertyStrictEquals({
                            name: "icon",
                            value: "sap-icon://wrench"
                        }),
                        actions: new Press()
                    });
                },
                iWaitUntilTheBusyIndicatorIsGone: function(sId) {
                    return this.waitFor({
                        id: sId,
                        check: function(oRootView) {
                            return !!oRootView && oRootView.getBusy() === false;
                        },
                        success: function() {
                            Opa5.assert.ok(true, "the App is not busy anymore");
                        },
                        errorMessage: "The app is still busy.."
                    });
                },
                iSelectActions: function(aActions) {
                    return waitForP13nDialog.call(this, {
                        matchers: [
                            new Properties({
                                title: oMDCBundle.getText("actiontoolbar.RTA_TITLE")
                            })
                        ],
                        success: function(oP13nDialog) {
                            iChangeSelectedActions.call(this, oP13nDialog, aActions);
                        }
                    });
                },
                iMoveActionUp: function(sActionLabel) {
                    iMoveAction.call(this, sActionLabel, Util.icons.moveup);
                },
                iMoveActionDown: function(sActionLabel) {
                    iMoveAction.call(this, sActionLabel, Util.icons.movedown);
                },
                iMoveActionToTop: function(sActionLabel) {
                    iMoveAction.call(this, sActionLabel, Util.icons.movetotop);
                },
                iMoveActionToBottom: function(sActionLabel) {
                    iMoveAction.call(this, sActionLabel, Util.icons.movetobottom);
                },
                iPressOkButtonOnP13nDialog: function() {
                    return waitForP13nDialog.call(this, {
                        matchers: [
                            new Properties({
                                title: oMDCBundle.getText("actiontoolbar.RTA_TITLE")
                            })
                        ],
                        success: function(oP13nDialog) {
                            this.waitFor({
                                searchOpenDialogs: true,
                                controlType: "sap.m.Button",
                                matchers: [
                                    new PropertyStrictEquals({
                                        name: "text",
                                        value: Util.texts.ok
                                    }),
                                    new Ancestor(oP13nDialog, false)
                                ],
                                actions: new Press(),
                                errorMessage: "Could not find the '" + Util.texts.ok + "' button"
                            });
                        }
                    });
                }
            },
			assertions: {
                iShouldSeeActionToolbarWithActions: function(sActionToolbarId, mActions) {
                    return this.waitFor({
                        controlType: "sap.ui.mdc.ActionToolbar",
                        id: sActionToolbarId,
                        success: function(oActionToolbar) {
                            var aExpectedTexts = Object.keys(mActions);
                            var mFoundActions = {};
                            Opa5.assert.ok(oActionToolbar, "ActionToolbar found");
                            this.waitFor({
                                controlType: "sap.ui.mdc.actiontoolbar.ActionToolbarAction",
                                matchers: function(oActionToolbarAction) {
                                    var sActionText = oActionToolbarAction.getAction().getText();
                                    var oActionLayoutInformation = oActionToolbarAction.getLayoutInformation();
                                    var aActions = oActionToolbar.getContent().filter(function(oContent){
                                        return oContent.getVisible() && oContent.isA("sap.ui.mdc.actiontoolbar.ActionToolbarAction");
                                    });
                                    var iActionIndex = aActions.indexOf(oActionToolbarAction);

                                    var bAncestor = new Ancestor(oActionToolbar, true)(oActionToolbarAction);
                                    var bCorrectIndex = false;
                                    var bCorrectLayoutInformation = false;

                                    if (mActions[sActionText]) {
                                        var oExpectedLayoutInformation = mActions[sActionText];
                                        var iExpectedIndex = aExpectedTexts.indexOf(sActionText);

                                        bCorrectIndex = iExpectedIndex === iActionIndex;
                                        bCorrectLayoutInformation = oExpectedLayoutInformation.alignment === oActionLayoutInformation.alignment && oExpectedLayoutInformation.aggregationName === oActionLayoutInformation.aggregationName;
                                    }

                                    if (bAncestor) {
                                        mFoundActions[sActionText] = {};
                                        mFoundActions[sActionText].hasCorrectIndex = bCorrectIndex;
                                        mFoundActions[sActionText].hasCorrectLayoutInformation = bCorrectLayoutInformation;
                                    }

                                    return bAncestor && bCorrectIndex && bCorrectLayoutInformation;
                                },
                                success: function(aActionToolbarActions) {
                                    Object.keys(mFoundActions).forEach(function(sActionText) {
                                        Opa5.assert.ok(mFoundActions[sActionText].hasCorrectIndex, sActionText + " has the correct index on the ActionToolbar.");
                                        Opa5.assert.ok(mFoundActions[sActionText].hasCorrectLayoutInformation, sActionText + " has the correct layout information.");
                                    });
                                    Opa5.assert.equal(aActionToolbarActions.length, aExpectedTexts.length, "Correct amount of ActionToolbarActions found.");
                                }
                            });
                        }
                    });
                }
            }
		}
	});

});