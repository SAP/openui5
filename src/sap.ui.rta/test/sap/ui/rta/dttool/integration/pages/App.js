sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/rta/dttool/integration/pages/Common",
	"sap/ui/rta/dttool/integration/pages/Code",
	"sap/ui/fl/FlexControllerFactory"
], function(
	Opa5,
	Press,
	EnterText,
	Properties,
	AggregationLengthEquals,
	Common,
	Code,
	FlexControllerFactory
) {
	"use strict";

	Opa5.createPageObjects({
		onTheAppView: {
			baseClass: Common,
			actions: {
				thePaletteIsLoaded: function () {
					return this.waitFor({
						id: "palette",
						viewName: "App",
						success: function (oPalette) {
							return this.waitFor({
								controlType: "sap.m.ListItemBase",
								matchers: function(oListItem) {
									return oListItem.getParent() === oPalette;
								},
								errorMessage: "Palette not loaded"
							});
						}.bind(this)
					});
				},
				theOutlineIsLoaded: function () {
					return this.waitFor({
						id: "Tree",
						viewName: "App",
						success: function (oOutlineTree) {
							return this.waitFor({
								controlType: "sap.m.ListItemBase",
								matchers: function(oListItem) {
									return oListItem.getParent() === oOutlineTree;
								},
								errorMessage: "Outline not loaded"
							});
						}.bind(this)
					});
				},
				iClickTheAddControlButton: function () {
					return this.waitFor({
						id: "addControlButton",
						viewName: "App",
						actions: new Press(),
						errorMessage: "Couldn't find control with id addControlButton"
					});
				},

				/*
				Use this when you want to test to change Properties which have a Switch as Control
				iIndex is the element in the Dropdown
				 */
				iClickTheSwitchForThePassedPropertyNameAndClickThePassedIndex: function(sProperty, iIndex) {
					return this.waitFor({
						controlType: "sap.ui.rta.dttool.controls.DTToolListItem",
						matchers: [
							new Properties({
								propertyName: sProperty
							})
						],
						actions: function(oControl) {
							return new Press().executeOn(oControl.getContent()[0]);
						},
						success: function (oControl) {
							return this.waitFor({
								actions: function() {
									return new Press().executeOn(oControl[0].getContent()[0].getItems()[iIndex]);
								}
							});
						},
						errorMessage: "Was not able to find " + this.controlType + " with Property " + sProperty + " or given Index " + iIndex
					});
				},

				iClickOnControlWithId: function (id) {
					return this.waitFor({
						id: id,
						viewName: "App",
						actions: new Press(),
						errorMessage: "Couldn't find control with id " + id
					});
				},
				iEnterAModulePathIntoTheInput: function (sModulePath) {
					return this.waitFor({
						id: "addDialogInput",
						actions: new EnterText({
							text: sModulePath
						}),
						errorMessage: "Couldn't find control with id addDialogInput"
					});
				},
				iPressTheAddButton: function () {
					return this.waitFor({
						id: "addControlButton",
						actions: new Press(),
						errorMessage: "Couldn't find control with id addControlButton"
					});
				},
				iExpandTheOutlineByNLevels: function (iLevels, aLengths, aIndexes) {
					return this.waitFor({
						id: "Tree",
						viewName: "App",
						matchers: function (oTree) {
							return oTree.getAggregation("items").length >= aLengths.shift() || 0;
						},
						// new AggregationLengthEquals({
						// 	name : "items",
						// 	length : aLengths.shift()
						// }),
						success: function (oTree) {
							if (iLevels > 0) {
								oTree.onItemExpanderPressed(oTree.getItems()[aIndexes.shift()], true);
								this.and.iExpandTheOutlineByNLevels(iLevels - 1, aLengths, aIndexes);
							}
						},
						errorMessage: "Couldn't find control with id Tree"
					});
				},
				iChangeTheHashToTheSwitchSample: function () {
					return this.waitFor({
						success: function () {
							Opa5.getHashChanger().setHash("/sample/sap.m.sample.Switch");
						}
					});
				},
				iSelectTheNthTreeItem: function (iIndex) {
					return this.waitFor({
						id: "__item0-__component0---app--Tree-" + iIndex,
						actions: new Press(),
						errorMessage: "Couldn't find control with id __item0-__component0---app--Tree-" + iIndex
					});
				},
				iCollapseTheTree: function () {
					return this.waitFor({
						id: "Tree",
						viewName: "App",
						success: function (oTree) {
							if (oTree.getAggregation("items").length > 1) {
								return this.iSelectTheNthTreeItem(0);
							}

							Opa5.assert.ok(true, "Outline is already collapsed");
						}.bind(this)
					});
				},
				iNavigateToTheSampleTestApp: function () {
					Opa5.getHashChanger().setHash("/sample/sap.ui.rta.dttool.sample");
					return this.waitFor({
						success: function () {}
					});
				},
				iSelectAnItemFromThePalette: function (numberOfGroups) {
					return this.waitFor({
						id: "palette",
						viewName: "App",
						matchers: function (oPalette) {
							return oPalette.getItems().length >= numberOfGroups;
						},
						success: function (oPalette) {
							oPalette.getItems()[0].getContent()[0].setExpanded(true);
						},
						errorMessage: "Couldn't find Switch in palette"
					});
				},
				iStartDragging: function () {
					return this.waitFor({
						id: "palette",
						viewName: "App",
						matchers: function(oPalette) {
							return oPalette.getItems()[0].getContent()[0].getDomRef("content").style.display !== "none";
						},
						success: function(oPalette) {
							var oElementToDrag = oPalette.getItems()[0].getContent()[0].getContent()[0].getItems()[2];
							var windowIFrame = window.frames[0];
							var createdOverlay;

							oElementToDrag.getDomRef().click();
							oElementToDrag.getDomRef().focus();
							oElementToDrag.getDomRef().dispatchEvent(new Event("dragstart"));
							oElementToDrag.getDomRef().dispatchEvent(new Event("drag"));

							windowIFrame._oRTA._oDesignTime.attachEventOnce("elementOverlayCreated", function (oData) {
								if (oData.getParameters().elementOverlay.getElement().getMetadata().getName() === "sap.m.Button") {
									createdOverlay = oData.getParameters().elementOverlay.getElement();
								}
							});

							var oTarget = windowIFrame.sap.ui.dt.OverlayRegistry.getOverlay("sampleComp-sap.ui.rta.dttool.sample---app--stable-hbox-1").getAggregationOverlay("items");
							var oTargetToHover = windowIFrame.sap.ui.dt.OverlayRegistry.getOverlay("sampleComp-sap.ui.rta.dttool.sample---app--stable-hbox-2").getAggregationOverlay("items");
							return this.waitFor({
								check: function() {
									return windowIFrame && createdOverlay && windowIFrame.sap.ui.dt.OverlayRegistry.getOverlay(createdOverlay).$().hasClass("sapUiRtaOverlayPlaceholder");
								},
								success: function () {
									// Hover over first HBox, than drop into second one to simulate realistic drag
									oTargetToHover.$().trigger("dragenter");
									oTargetToHover.$().trigger("dragover");
									oTargetToHover.$().trigger("dragleave");
									oTarget.$().trigger("dragenter");
									oTarget.$().trigger("dragover");
									oElementToDrag.getDomRef().dispatchEvent(new Event("dragend"));
								},
								errorMessage: "The element mover did not start the drag"
							});
						}.bind(this)
					});
				},
				iDragAnItemInsideFrame: function () {
					var windowIFrame = window.frames[0];
					return this.waitFor({
						success: function () {
							var oOverlayToDrag = windowIFrame.sap.ui.dt.OverlayRegistry.getOverlay("sampleComp-sap.ui.rta.dttool.sample---app--stable-switch-1");
							var oTargetOverlay = windowIFrame.sap.ui.dt.OverlayRegistry.getOverlay("sampleComp-sap.ui.rta.dttool.sample---app--stable-switch-2");

							oOverlayToDrag.$().trigger("click");
							oOverlayToDrag.setSelected(true);
							oOverlayToDrag.$().trigger("dragstart");
							oOverlayToDrag.$().trigger("drag");
							oTargetOverlay.$().trigger("dragenter");
							oTargetOverlay.$().trigger("dragover");
							oOverlayToDrag.$().trigger("dragend");
						},
						errorMessage: "Couldn't drag inside the iframe"
					});
				},
				iRemoveAnElement: function () {
					return this;
				},
				iUndoTheLastChange: function () {
					return this.waitFor({
						id: "undo",
						viewName: "App",
						actions: new Press(),
						errorMessage: "Couldn't find the button to undo changes."
					});
				},
				iStopRta: function () {
					return this.waitFor({
						id: "stopRTA-button",
						viewName: "App",
						actions: new Press(),
						errorMessage: "Couldn't find the button to stop RTA."
					});
				},
				iCleanupLocalChanges: function () {
					var aChangesToClean;
					var oChangePersistence = FlexControllerFactory.create("sap.ui.rta.dttool.sample")._oChangePersistence;
					oChangePersistence.getChangesForComponent().then(function(aChanges) {
						aChangesToClean = aChanges;
					});
					return this.waitFor({
						check: function () {
							return !!oChangePersistence;
						},
						success: function () {
							aChangesToClean.forEach(function (oChangeToClean) {
								oChangePersistence.deleteChange(oChangeToClean);
							});
							oChangePersistence.saveDirtyChanges();
						}
					});
				}
			},
			assertions: {
				thePassedPropertyShouldBeDisplayedInPropertyPanel: function(sProperty) {
					return this.waitFor({
						controlType: "sap.ui.rta.dttool.controls.DTToolListItem",
						matchers: [
							new Properties({
								label: sProperty
							})
						],
						success: function (oListItem) {
							Opa5.assert.ok(true, "Was able to find " + oListItem + " with given Property: " + sProperty);
						}
					});
				},
				thePassedPropertyInPropertyPanelItemHasContent: function(sProperty) {
					return this.waitFor({
						controlType: "sap.ui.rta.dttool.controls.DTToolListItem",
						matchers: [
							new Properties({
								label: sProperty
							})
						],
						check: function(oListItem) {
							var oListItemContent = oListItem[0].getContent()[0];
							if (oListItemContent) {
								return true;
							}
						},
						success: function (oListItem) {
							Opa5.assert.ok(true, "Was able to find " + oListItem + " with Property " + sProperty + " and has content");
						}
					});
				},
				theSampleSelectShouldBeShown: function () {
					return this.waitFor({
						id: "__component0---app--sampleInput",
						viewName: "App",
						success: function () {
							Opa5.assert.ok(true, "sampleInput is displayed");
						},
						errorMessage: "Couldn't find control with id sampleInput"
					});
				},
				thePropertyPanelToolbarShouldDisplayTheCorrectLabel: function (sControlName) {
					return this.waitFor({
						id: "__title5",
						matchers: function(oTitle) {
							return oTitle.getText().indexOf(sControlName) >= 0;
						},
						success: function () {
							Opa5.assert.ok(true, "Selected control displays the correct title: " + sControlName);
						},
						errorMessage: sControlName + " is not part of the property panel title"
					});
				},
				thePaletteShouldHaveTheGivenNumberOfGroups: function (iNumberOfPaletteGroups) {
					return this.waitFor({
						id: "palette",
						viewName: "App",
						matchers: new AggregationLengthEquals({
							name: "items",
							length: iNumberOfPaletteGroups
						}),
						success: function () {
							Opa5.assert.ok(true, "Palette has " + iNumberOfPaletteGroups + " groups.");
						},
						errorMessage: "Couldn't find control with id palette"
					});
				},
				theControlWasAddedToThePalette: function () {
					return this.waitFor({
						id: "palette",
						viewName: "App",
						matchers: new AggregationLengthEquals({
							name: "items",
							length: 8
						}),
						success: function (oPalette) {
							var bControlAdded = oPalette.getItems().some(function (oItem) {
								if (oItem.getContent()[0].getHeaderToolbar().getContent()[0].getText() === "action") {
									return oItem.getContent()[0].getContent()[0].getItems().some(function (oItem) {
										if (oItem.getCells()[1].getText() === "Custom Button") {
											return true;
										}
									});
								}
							});

							Opa5.assert.ok(bControlAdded, "Control was added to the palette.");
						},
						errorMessage: "Couldn't find control with id palette"
					});
				},
				theHashWasChanged: function () {
					return this.waitFor({
						id: "Tree",
						viewName: "App",
						success: function () {
							Opa5.assert.ok(true, "Hash has changed.");
						}
					});
				},
				theCorrectOverlayIsSelected: function (sId) {
					return this.waitFor({
						id: "theIFrame",
						viewName: "App",
						matchers: function() {
							var oElement = jQuery("#__component0---app--theIFrame").contents().find("#" + sId);
							return oElement.hasClass("sapUiDtOverlaySelected");
						},
						success: function () {
							Opa5.assert.ok(true, sId + " has Class sapUiDtOverlaySelected (is selected)");
						},
						errorMessage: sId + " doesn't have Class sapUiDtOverlaySelected (is not selected)"
					});
				},
				theNewElementShouldBeDisplayedInTheOutline: function () {
					return this.waitFor({
						id: "Tree",
						viewName: "App",
						matchers: function (oTree) {
							return oTree.getAggregation("items")[9].getContent()[0].getItems()[1].getProperty("text") === "sap.m.Button";
						},
						success: function () {
							Opa5.assert.ok(true, "The new item ist displayed in the outline.");
						},
						errorMessage: "Couldn't find new item in the outline."
					});
				},
				theElementShouldBeRemoved: function () {
					return this;
				},
				anAddXMLChangeShouldExist: function () {
					var oSavedChange;
					FlexControllerFactory.create("sap.ui.rta.dttool.sample")._oChangePersistence.getChangesForComponent().then(function(aChanges) {
						oSavedChange = aChanges[0].getDefinition();
					});
					//TODO: Add more properties to the mocked change to toughen the check
					var oMockedChange = {changeType: "addXML"};
					return this.waitFor({
						matchers: function () {
							return oSavedChange;
						},
						success: function () {
							var oFilteredChange = ["changeType"].reduce(function(oChangeProperties, sChangeKey) {
								oChangeProperties[sChangeKey] = oSavedChange[sChangeKey];
								return oChangeProperties;
							}, {});
							Opa5.assert.deepEqual(oMockedChange, oFilteredChange, "The AddXML change was properly created.");
						}
					});
				},
				aMoveControlsChangeShouldExist: function () {
					var oSavedChange;
					FlexControllerFactory.create("sap.ui.rta.dttool.sample")._oChangePersistence.getChangesForComponent().then(function(aChanges) {
						oSavedChange = aChanges[1].getDefinition();
					});
					//TODO: Add more properties to the mocked change to toughen the check
					var oMockedChange = {changeType: "moveControls"};
					return this.waitFor({
						matchers: function () {
							return oSavedChange;
						},
						success: function () {
							var oFilteredChange = ["changeType"].reduce(function(oChangeProperties, sChangeKey) {
								oChangeProperties[sChangeKey] = oSavedChange[sChangeKey];
								return oChangeProperties;
							}, {});
							Opa5.assert.deepEqual(oMockedChange, oFilteredChange, "The MoveControls change was properly created.");
						}
					});
				},
				theDraggedItemShouldBePartOfTheTargetGroup: function () {
					return this.waitFor({
						check: function() {
							return window.frames[0].sap.ui.getCore().byId("sampleComp-sap.ui.rta.dttool.sample---app--stable-hbox-1").getItems().length === 4;
						},
						success: function () {
							Opa5.assert.ok(true, "The dragged item was added to the target group");
						},
						errorMessage: "The dragged item is not inside the target group"
					});
				},
				theElementPositionShouldChange: function () {
					return this.waitFor({
						check: function() {
							var aItems = window.frames[0].sap.ui.getCore().byId("sampleComp-sap.ui.rta.dttool.sample---app--stable-hbox-1").getItems();
							return aItems[1].sId === "sampleComp-sap.ui.rta.dttool.sample---app--stable-switch-2";
						},
						success: function () {
							Opa5.assert.ok(true, "The item was moved");
						},
						errorMessage: "The items position has not changed"
					});
				},
				theElementShouldBeInTheOutline: function () {
					return this;
				},
				theUndoStateShouldBeCorrect: function (bUndoShouldBeEnabled) {
					return this.waitFor({
						id: "undo",
						viewName: "App",
						matchers: function (undoBtn) {
							return undoBtn.getEnabled() === bUndoShouldBeEnabled;
						},
						success: function () {
							Opa5.assert.ok(true, "Undo is " + (bUndoShouldBeEnabled ? "" : "not ") + "possible.");
						},
						errorMessage: "The undo button should be " + (bUndoShouldBeEnabled ? "enabled" : "disabled")
					});
				},
				theRedoStateShouldBeCorrect: function (bRedoShouldBeEnabled) {
					return this.waitFor({
						id: "redo",
						viewName: "App",
						matchers: function (redoBtn) {
							return redoBtn.getEnabled() === bRedoShouldBeEnabled;
						},
						success: function () {
							Opa5.assert.ok(true, "Redo is " + (bRedoShouldBeEnabled ? "" : "not ") + "possible.");
						},
						errorMessage: "The redo button should be " + (bRedoShouldBeEnabled ? "enabled" : "disabled")
					});
				},
				theAppShouldContainNChanges: function (n) {
					var oPromise;
					var bChangesAreThere = false;
					var oFlexControllerFactory = FlexControllerFactory.create("sap.ui.rta.dttool.sample");
					return this.waitFor({
						check: function () {
							if (!oPromise) {
								oPromise = oFlexControllerFactory._oChangePersistence.getChangesForComponent().then(function(aChanges) {
									if (aChanges && aChanges.length >= n) {
										bChangesAreThere = true;
									} else {
										oPromise = null;
									}
								});
							}
							return bChangesAreThere;
						},
						success: function () {
							Opa5.assert.ok(true, "The app contains " + n + " changes");
						},
						errorMessage: "Not all changes were created"
					});
				},
				theAppShouldBeClean: function () {
					var oPromise;
					var bChangesAreClean = false;
					var oFlexControllerFactory = FlexControllerFactory.create("sap.ui.rta.dttool.sample");
					return this.waitFor({
						check: function () {
							if (!oPromise) {
								oPromise = oFlexControllerFactory._oChangePersistence.getChangesForComponent().then(function(aChanges) {
									if (aChanges && aChanges.length === 0) {
										bChangesAreClean = true;
									} else {
										oPromise = null;
									}
								});
							}
							return bChangesAreClean;
						},
						success: function () {
							Opa5.assert.ok(true, "The app is clean");
						},
						errorMessage: "Not all changes were cleaned up"
					});
				}
			}
		},
		onTheCodeView: Code
	});
});