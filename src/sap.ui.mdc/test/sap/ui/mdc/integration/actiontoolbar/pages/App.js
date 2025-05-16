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
	"testutils/opa/p13n/Util",
	"sap/ui/core/Lib"
], function(Opa5, Ancestor, PropertyStrictEquals, Properties, Press, OpenContextMenu, waitForP13nDialog, Util, Library) {

	"use strict";

	const oMDCBundle = Library.getResourceBundleFor("sap.ui.mdc");

	const iChangeSelectedActions = function(oP13nDialog, aActions) {
		this.waitFor({
			controlType: "sap.m.p13n.SelectionPanel",
			matchers: new Ancestor(oP13nDialog, false),
			success: function(aListViews) {
				const oListView = aListViews[0];
				this.waitFor({
					controlType: "sap.m.ColumnListItem",
					matchers: new Ancestor(oListView, false),
					actions: function(oColumnListItem) {
						this.waitFor({
							controlType: "sap.m.Label",
							matchers: new Ancestor(oColumnListItem, false),
							success: function(aLabels) {
								const oLabelControl = aLabels[0];
								this.waitFor({
									controlType: "sap.m.CheckBox",
									searchOpenDialogs: true,
									visible: false,
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

	const waitForP13nColumListItem = function(sActionLabel, fnSuccess) {
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
						const oListView = aListViews[0];
						this.waitFor({
							controlType: "sap.m.ColumnListItem",
							visible: false,
							matchers: function(oColumnListItem) {
								return new Ancestor(oListView, false)(oColumnListItem) && oColumnListItem.getCells()[0].getItems()[0].getText() === sActionLabel;
							},
							actions: new Press(),
							success: function(aColumnListItem) {
								fnSuccess([aColumnListItem[0]]);
							}
						});
					}
				});
			}
		});
	};

	const iMoveAction = function(sActionLabel, sDirection) {
		return waitForP13nColumListItem.call(this, sActionLabel, (aArgs) => {
			const oColumnListItem = aArgs[0];
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
		});
	};

	const iCannotMoveAction = function(sActionLabel, aDirection) {
		return waitForP13nColumListItem.call(this, sActionLabel, (aArgs) => {
			const oColumnListItem = aArgs[0];
			const aItems = oColumnListItem.getCells()[1].getItems();
			Opa5.assert.ok(aItems.length == 1, "No buttons visible");
		});
	};

	const iCannotDeselectAction = function(sActionLabel) {
		return waitForP13nColumListItem.call(this, sActionLabel, (aArgs) => {
			const oColumnListItem = aArgs[0];
			const bEnabled = oColumnListItem.getMultiSelectControl().getEnabled();
			Opa5.assert.notOk(bEnabled, "Checkbox is disabled");
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
				iCannotMoveAction: function(sActionLabel) {
					iCannotMoveAction.call(this, sActionLabel, [
						Util.icons.moveup,
						Util.icons.movedown,
						Util.icons.movetotop,
						Util.icons.movetobottom
					]);
				},
				iCannotDeselect: function(sActionLabel) {
					iCannotDeselectAction.call(this, sActionLabel);
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
				},
				iSelectElementOverlaysOfActions: function(sActionToolbarId, aActions) {
					return this.waitFor({
						controlType: "sap.ui.mdc.ActionToolbar",
						id: sActionToolbarId,
						success: function(oActionToolbar) {
							Opa5.assert.ok(oActionToolbar, "ActionToolbar found");
							this.waitFor({
								controlType: "sap.ui.mdc.actiontoolbar.ActionToolbarAction",
								matchers: function(oActionToolbarAction) {
									const bAncestor = new Ancestor(oActionToolbar, true)(oActionToolbarAction);
									const sLabel = oActionToolbarAction.getLabel();

									return bAncestor && aActions.includes(sLabel);
								},
								success: function(aActionToolbarActions) {
									Opa5.assert.equal(aActionToolbarActions.length, aActions.length, "should find correct amount of actions");
									for (let i = 0; i < aActionToolbarActions.length; i++) {
										this.waitFor({
											controlType: "sap.ui.dt.ElementOverlay",
											matchers(oOverlay) {
												return oOverlay.getElement().getId() === aActionToolbarActions[i].getAction().getId();
											},
											errorMessage: "Did not find the Element Overlay",
											actions: new Press({ ctrlKey: i !== 0 })
										});
									}
								}
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
							const aExpectedTexts = Object.keys(mActions);
							const mFoundActions = {};
							Opa5.assert.ok(oActionToolbar, "ActionToolbar found");
							this.waitFor({
								controlType: "sap.ui.mdc.actiontoolbar.ActionToolbarAction",
								matchers: function(oActionToolbarAction) {
									const sActionLabel = oActionToolbarAction.getLabel();
									const oActionLayoutInformation = oActionToolbarAction.getLayoutInformation();
									const aActions = oActionToolbar.getContent().filter(function(oContent) {
										return oContent.getVisible() && oContent.isA("sap.ui.mdc.actiontoolbar.ActionToolbarAction");
									});
									const iActionIndex = aActions.indexOf(oActionToolbarAction);

									const bAncestor = new Ancestor(oActionToolbar, true)(oActionToolbarAction);
									let bCorrectIndex = false;
									let bCorrectLayoutInformation = false;

									if (mActions[sActionLabel]) {
										const oExpectedLayoutInformation = mActions[sActionLabel];
										const iExpectedIndex = aExpectedTexts.indexOf(sActionLabel);

										bCorrectIndex = iExpectedIndex === iActionIndex;
										bCorrectLayoutInformation = oExpectedLayoutInformation.alignment === oActionLayoutInformation.alignment && oExpectedLayoutInformation.aggregationName === oActionLayoutInformation.aggregationName;
									}

									if (bAncestor) {
										mFoundActions[sActionLabel] = {};
										mFoundActions[sActionLabel].hasCorrectIndex = bCorrectIndex;
										mFoundActions[sActionLabel].hasCorrectLayoutInformation = bCorrectLayoutInformation;
									}

									return bAncestor && bCorrectIndex && bCorrectLayoutInformation;
								},
								success: function(aActionToolbarActions) {
									Object.keys(mFoundActions).forEach(function(sActionLabel) {
										Opa5.assert.ok(mFoundActions[sActionLabel].hasCorrectIndex, sActionLabel + " has the correct index on the ActionToolbar.");
										Opa5.assert.ok(mFoundActions[sActionLabel].hasCorrectLayoutInformation, sActionLabel + " has the correct layout information.");
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