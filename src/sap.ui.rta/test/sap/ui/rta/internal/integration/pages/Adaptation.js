sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/Drag",
	"sap/ui/test/actions/Drop",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Core",
	"test-resources/sap/ui/fl/api/FlexTestAPI"
], function(
	Opa5,
	PropertyStrictEquals,
	Press,
	Drag,
	Drop,
	QUnitUtils,
	KeyCodes,
	oCore,
	FlexTestAPI
) {
	"use strict";

	var oContextMenuEvent = new MouseEvent("contextmenu", {
		bubbles: true,
		cancelable: true,
		view: window,
		buttons: 2
	});

	Opa5.createPageObjects({
		onPageWithRTA: {
			actions: {
				iGoToMeArea() {
					return this.waitFor({
						id: "userActionsMenuHeaderButton",
						errorMessage: "Did not find the User Action Menu",
						actions: new Press()
					});
				},
				iPressOnAdaptUi(bPersonalize) {
					var sButtonType = bPersonalize ? "PERSONALIZE" : "RTA";
					var sId = `${sButtonType}_Plugin_ActionButton`;
					return this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers(oListItem) {
							return oListItem.data().actionItemId === sId;
						},
						errorMessage: "Did not find the Adapt-Ui-Button",
						actions: new Press()
					});
				},
				iSwitchToVisualizationMode() {
					var oRtaResourceBundle = oCore.getLibraryResourceBundle("sap.ui.rta");
					var sButtonText = oRtaResourceBundle.getText("BTN_VISUALIZATION");
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers(oButton) {
							return oButton.getText() === sButtonText;
						},
						actions: new Press(),
						errorMessage: "Did not find Visualization-Button"
					});
				},
				iSwitchToAdaptationMode() {
					var oRtaResourceBundle = oCore.getLibraryResourceBundle("sap.ui.rta");
					var sButtonText = oRtaResourceBundle.getText("BTN_ADAPTATION");
					return this.waitFor({
						autoWait: false,
						controlType: "sap.m.Button",
						matchers(oButton) {
							return oButton.getText() === sButtonText;
						},
						actions: new Press(),
						errorMessage: "Did not find UI-Adaptation-Button"
					});
				},
				iDragAndDropAnElement(sElementDragId, sElementDropId) {
					this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers(oOverlay) {
							return oOverlay.getElement().getId() === sElementDragId;
						},
						// Start the dragging
						actions: new Drag(),
						errorMessage: "Could not find the drag element"
					});
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers(oOverlay) {
							return oOverlay.getElement().getId() === sElementDropId;
						},
						// Finish dragging and drop the item right before this one.
						actions: new Drop({
							before: true
						}),
						errorMessage: "Could not find the drop zone"
					});
				},
				iClickTheUndoButton() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers(oButton) {
							return oButton.getDomRef().closest(".sapUiRtaToolbar") && oButton.getIcon() === "sap-icon://undo";
						},
						actions: new Press(),
						errorMessage: "Did not find the undo button"
					});
				},
				iClickTheSaveButton() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers(oButton) {
							return oButton.getDomRef().closest(".sapUiRtaToolbar") && oButton.getIcon() === "sap-icon://save";
						},
						actions: new Press(),
						errorMessage: "Did not find the save button"
					});
				},
				iWaitUntilTheBusyIndicatorIsGone(sId, sViewName) {
					return this.waitFor({
						autoWait: false,
						id: sId,
						viewName: sViewName,
						matchers(oRootView) {
							// we set the view busy, so we need to query the parent of the app
							return oRootView.getBusy() === false;
						},
						success() {
							Opa5.assert.ok(true, "the App is not busy anymore");
						},
						errorMessage: "The app is still busy.."
					});
				},
				iRightClickOnAnElementOverlay(sId) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers(oOverlay) {
							return oOverlay.getElement().getId() === sId;
						},
						success(aOverlays) {
							aOverlays[0].getDomRef().dispatchEvent(oContextMenuEvent);
						},
						errorMessage: "Did not find the Element Overlay"
					});
				},
				iClickOnAnElementOverlay(sId) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers(oOverlay) {
							return oOverlay.getElement().getId() === sId;
						},
						errorMessage: "Did not find the Element Overlay",
						actions: new Press()
					});
				},
				iRightClickOnAnAggregationOverlay(sId, sAggregationName) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers(oOverlay) {
							return oOverlay.getElement().getId() === sId;
						},
						success(oOverlay) {
							var oAggregationOverlay = oOverlay[0].getAggregationOverlay(sAggregationName);
							oAggregationOverlay.getDomRef().dispatchEvent(oContextMenuEvent);
						},
						errorMessage: "Did not find the Element Overlay"
					});
				},
				iClickOnAContextMenuEntry(iIndex) {
					return this.waitFor({
						controlType: "sap.ui.unified.Menu",
						matchers(oMenu) {
							return oMenu.getDomRef().classList.contains("sapUiDtContextMenu");
						},
						success(aMenu) {
							aMenu[0].getItems()[iIndex].getDomRef().click();
						},
						errorMessage: "Did not find the Context Menu"
					});
				},
				iClickOnAContextMenuEntryWithText(sText) {
					var oResources = oCore.getLibraryResourceBundle("sap.ui.rta");
					return this.waitFor({
						controlType: "sap.ui.unified.MenuItem",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: oResources.getText(sText)
						}),
						actions: new Press(),
						errorMessage: "The Menu Item was not pressable"
					});
				},
				iClickOnAContextMenuEntryWithIcon(sIcon) {
					return this.waitFor({
						controlType: "sap.ui.unified.MenuItem",
						matchers: [
							new PropertyStrictEquals({
								name: "icon",
								value: sIcon
							})],
						actions: new Press(),
						errorMessage: "The Menu Item was not pressable"
					});
				},
				iEnterANewName(sNewLabel) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers(oOverlay) {
							if (oOverlay.getDomRef().classList.contains("sapUiDtOverlaySelected")) {
								var oOverlayDOM = oOverlay.getDomRef().querySelector(".sapUiRtaEditableField");
								var oEditableFieldDomNode = oOverlayDOM.children[0];
								return oEditableFieldDomNode;
							}
							return undefined;
						},
						actions(oEditableFieldDomNode) {
							oEditableFieldDomNode.innerHTML = sNewLabel;
							QUnitUtils.triggerEvent("keypress", oEditableFieldDomNode, { which: KeyCodes.ENTER, keyCode: KeyCodes.ENTER });
							oEditableFieldDomNode.blur();
						},
						errorMessage: "Did not find the Selected Element Overlay"
					});
				},
				iSelectAFieldByBindingPathInTheAddDialog(sBindingPath) {
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.CustomListItem",
						matchers(oListItem) {
							var sBindingContextPath = oListItem.getBindingContextPath();
							var oBindingData = oListItem.getBindingContext().getModel().getProperty(sBindingContextPath);
							return oBindingData.bindingPath && oBindingData.bindingPath === sBindingPath;
						},
						actions: new Press(),
						errorMessage: "List Item with this label not found"
					});
				},
				iSelectAFieldByLabelInTheAddSectionDialog(sLabel) {
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.CustomListItem",
						matchers(oListItem) {
							return oListItem.getContent()[0].getItems()[0].getText() === sLabel;
						},
						actions: new Press(),
						errorMessage: "List Item with this label not found"
					});
				},
				iPressOK() {
					var oResources = oCore.getLibraryResourceBundle("sap.ui.rta");
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: oResources.getText("BTN_FREP_OK")
						}),
						actions: new Press(),
						errorMessage: "OK Button not found"
					});
				},
				iExitRtaMode(bDontSaveOnExit, bNoChanges) {
					var oResources = oCore.getLibraryResourceBundle("sap.ui.rta");
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers(oButton) {
							return oButton.getDomRef().closest(".sapUiRtaToolbar")
								&& oButton.getId().includes("sapUiRta_exit");
						},
						actions: new Press(),
						success(aButtons) {
							Opa5.assert.equal(aButtons.length, 1, "'Exit' button found");
							// If no changes were done, the "save changes" pop-up doesn't come up
							if (bNoChanges) {
								return undefined;
							}
							var sButtonTextKey = bDontSaveOnExit
								? "BTN_UNSAVED_CHANGES_ON_CLOSE_DONT_SAVE"
								: "BTN_UNSAVED_CHANGES_ON_CLOSE_SAVE";
							return this.waitFor({
								controlType: "sap.m.Button",
								matchers(oButton) {
									return oButton.getDomRef().closest(".sapUiRTABorder")
										&& oButton.getProperty("text") === oResources.getText(sButtonTextKey);
								},
								actions: new Press(),
								success(aButtons) {
									Opa5.assert.ok(aButtons.length > 0,
										`Messagebox closed with click on '${oResources.getText(sButtonTextKey)}' `);
								}
							});
						}
					});
				},
				// Only for UI Personalization. Please do not use in UI Adaptation tests
				iPressOnRemoveSection(sSectionId) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers(oOverlay) {
							return oOverlay.getElement().getId() === sSectionId;
						},
						success(aOverlays) {
							var oOverlay = aOverlays[0];
							var sQueryString = `#${oOverlay.getId()}-DeleteIcon`;
							oOverlay.getDomRef().querySelector(sQueryString).click();
						},
						errorMessage: "Did not find the Remove Button on the section"
					});
				},
				// Only for UI Personalization. Please do not use in UI Adaptation tests
				iPressOnAddSection(sSectionId) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers(oOverlay) {
							return oOverlay.getElement().getId() === sSectionId;
						},
						success(aOverlays) {
							var oOverlay = aOverlays[0];
							var sQueryString = `#${oOverlay.getId()}-AddButton`;
							oOverlay.getDomRef().querySelector(sQueryString).click();
						},
						errorMessage: "Did not find the Add Button on the section"
					});
				},
				iExitRtaPersonalizationMode() {
					var oResources = oCore.getLibraryResourceBundle("sap.ui.rta");
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers(oButton) {
							return oButton.getParent().getDomRef && oButton.getParent().getDomRef() && oButton.getParent().getDomRef().classList.contains("sapUiRtaToolbar")
								&& oButton.getParent().getDomRef().classList.contains("type_personalization")
								&& oButton.getProperty("text") === oResources.getText("BTN_DONE");
						},
						actions: new Press()
					});
				},
				enableAndDeleteLrepLocalStorageAfterRta() {
					return this.waitFor({
						check() {
							return !(Opa5.getJQuery()(".sapUiRtaToolbar").length > 0);
						},
						success() {
							FlexTestAPI.clearStorage("LocalStorage");
						}
					});
				},
				clearRtaRestartSessionStorage() {
					window.sessionStorage.removeItem("sap.ui.rta.restart.CUSTOMER");
					window.sessionStorage.removeItem("sap.ui.rta.restart.USER");
				},
				clearChangesFromSessionStorage() {
					FlexTestAPI.clearStorage("SessionStorage");
				},
				iPressOnEscape() {
					window.dispatchEvent(new KeyboardEvent("keydown", {
						key: "escape"
					}));
				}
			},

			assertions: {
				iShouldSeeTheToolbar() {
					return this.waitFor({
						autoWait: false,
						timeout: 100,
						controlType: "sap.m.HBox",
						matchers(oToolbar) {
							return oToolbar.getDomRef().classList.contains("sapUiRtaToolbar");
						},
						success(oToolbar) {
							Opa5.assert.ok(oToolbar[0].getVisible(), "The Toolbar is shown.");
						},
						errorMessage: "Did not find the Toolbar"
					});
				},
				iShouldSeeTheToolbarAndTheLogo() {
					return this.waitFor({
						autoWait: false,
						controlType: "sap.m.HBox",
						matchers(oToolbar) {
							return oToolbar.getDomRef().classList.contains("sapUiRtaToolbar");
						},
						success(oToolbar) {
							var oFioriToolbar = oToolbar[0];
							Opa5.assert.ok(oFioriToolbar.getVisible(), "The Toolbar is shown.");
							Opa5.assert.ok(oFioriToolbar.getControl("icon"), "The FLP Icon is part of the Toolbar");

							return this.waitFor({
								controlType: "sap.m.Image",
								matchers(oImage) {
									return oImage.getDomRef().closest(".sapUiRtaToolbar");
								},
								success(aLogo) {
									Opa5.assert.ok(aLogo.length > 0, "the logo is found on the UI");
								}
							});
						},
						errorMessage: "Did not find the Toolbar"
					});
				},
				iShouldSeeTheUndoButton() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers(oButton) {
							return oButton.getDomRef().closest(".sapUiRtaToolbar") && oButton.getIcon() === "sap-icon://undo";
						},
						success(oButton) {
							Opa5.assert.ok(oButton.getVisible(), "then the button is visible");
						},
						errorMessage: "Did not find UndoButton"
					});
				},
				iShouldSeeTheFLPToolbarAndChangesInLRep(iCount, sReference) {
					return this.waitFor({
						id: "shell-header",
						success(oToolbar) {
							Opa5.assert.ok(oToolbar.getVisible(), "the FLP Toolbar is shown");
							Opa5.assert.equal(FlexTestAPI.getNumberOfChangesSynchronous("SessionStorage", sReference), iCount, "the number of changes is correct");
						},
						errorMessage: "the FLP-Toolbar was not found"
					});
				},
				iShouldSeeTheOverlayForTheApp(sId, sViewName) {
					var oApp;
					this.waitFor({
						id: sId,
						viewName: sViewName,
						errorMessage: "The app is still busy..",
						success(oAppControl) {
							oApp = oAppControl;
						}
					});
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers(oOverlay) {
							return oOverlay.getElement() === oApp;
						},
						success(oOverlay) {
							Opa5.assert.ok(oOverlay[0].getVisible(), "The Overlay is shown.");
						},
						errorMessage: "Did not find the Element Overlay for the App Control"
					});
				},
				iShouldSeeChangesInLRepWhenTheBusyIndicatorIsGone(sId, sViewName, iCount, sReference) {
					return this.waitFor({
						id: sId,
						viewName: sViewName,
						success() {
							Opa5.assert.strictEqual(
								FlexTestAPI.getNumberOfChangesSynchronous("SessionStorage", sReference),
								iCount,
								"the number of changes is correct"
							);
						},
						errorMessage: "The app is still busy.."
					});
				},
				iShouldNotSeeTheElement(sId) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						visible: false,
						matchers(oOverlay) {
							return oOverlay.getElement().getId() === sId;
						},
						success(aOverlays) {
							Opa5.assert.notOk(aOverlays[0].getElement().getVisible(), "The element is not visible on the UI");
						},
						errorMessage: "Did not find the element or it is still visible"
					});
				},
				iShouldSeeTheElement(sId) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						visible: false,
						matchers(oOverlay) {
							return oOverlay.getElement().getId() === sId;
						},
						success(aOverlays) {
							Opa5.assert.ok(aOverlays[0].getElement().getVisible(), "The element is visible on the UI");
						},
						errorMessage: "Did not find the element or it is still invisible"
					});
				},
				iShouldSeeTheElementWithTitle(sTitle) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						visible: false,
						matchers(oOverlay) {
							if (oOverlay.getElement().getTitle) {
								return oOverlay.getElement().getTitle() === sTitle;
							}
							return undefined;
						},
						success(aOverlays) {
							Opa5.assert.ok(aOverlays[0].getElement().getVisible(), "The element is visible on the UI");
						},
						errorMessage: "Did not find the element or it is still invisible"
					});
				},
				iShouldSeeThePopUp(bWithAction) {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers(oButton) {
							return oButton.getId().indexOf("__mbox") > -1;
						},
						success(aButtons) {
							Opa5.assert.ok(aButtons[0].getVisible(), "The Dialog is shown.");
						},
						actions: bWithAction ? new Press() : undefined,
						errorMessage: "Did not find the Dialog"
					});
				},
				iShouldSeeTheVariantURLParameter() {
					return this.waitFor({
						autoWait: true,
						check() {
							var oOpa5Window = Opa5.getWindow();
							var oHashChanger = new oOpa5Window.sap.ui.core.routing.HashChanger();
							return oHashChanger.getHash().includes("sap-ui-fl-control-variant-id");
						},
						success() {
							Opa5.assert.ok(true, "The URL parameter for variant id is present");
						},
						errorMessage: "The URL parameter for variant id is not being added"
					});
				},
				iShouldNotSeeTheVariantURLParameter() {
					return this.waitFor({
						autoWait: true,
						check() {
							var oOpa5Window = Opa5.getWindow();
							var oHashChanger = new oOpa5Window.sap.ui.core.routing.HashChanger();
							return !oHashChanger.getHash().includes("sap-ui-fl-control-variant-id");
						},
						success() {
							Opa5.assert.ok(true, "The URL parameter for variant id is present");
						},
						errorMessage: "The URL parameter for variant id is not being added"
					});
				},
				iShouldSeetheContextMenu() {
					return this.waitFor({
						controlType: "sap.ui.unified.Menu",
						matchers(oMenu) {
							return oMenu.hasStyleClass("sapUiDtContextMenu");
						},
						success(oMenu) {
							Opa5.assert.ok(oMenu[0], "The context menu is shown.");
						},
						errorMessage: "Did not find the Context Menu"
					});
				},
				iShouldSeetheContextMenuEntries(aContextEntries) {
					return this.waitFor({
						controlType: "sap.ui.unified.Menu",
						matchers(oMenu) {
							return oMenu.hasStyleClass("sapUiDtContextMenu");
						},
						success(oMenu) {
							var aIsContextEntries = [];
							oMenu[0].getItems().forEach(function(oItem) {
								aIsContextEntries.push(oItem.getText());
							});
							Opa5.assert.deepEqual(aIsContextEntries, aContextEntries, `expected [${aContextEntries}] context entries found`);
						},
						errorMessage: "Did not find the Context Menu entries"
					});
				},
				iShouldSeetheNumberOfContextMenuActions(iActions) {
					return this.waitFor({
						controlType: "sap.ui.unified.Menu",
						matchers(oMenu) {
							return oMenu.hasStyleClass("sapUiDtContextMenu");
						},
						success(oMenu) {
							var iItems = 0;
							oMenu[0].getItems().forEach(function(oItem) {
								if (oItem.getVisible()) {
									iItems++;
								}
							});
							Opa5.assert.deepEqual(iActions, iItems, `expected ${iItems} context entries found`);
						},
						errorMessage: "Did not find the Context Menu entries"
					});
				}
			}
		}
	});
});