sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/Drag",
	"sap/ui/test/actions/Drop",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Lib",
	"test-resources/sap/ui/fl/api/FlexTestAPI"
], function(
	Opa5,
	PropertyStrictEquals,
	EnterText,
	Press,
	Drag,
	Drop,
	QUnitUtils,
	KeyCodes,
	Lib,
	FlexTestAPI
) {
	"use strict";

	const oContextMenuEvent = new MouseEvent("contextmenu", {
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
				iPressOnAdaptUi() {
					const sId = "RTA_Plugin_ActionButton";
					return this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers(oListItem) {
							return oListItem.data().actionItemId === sId;
						},
						errorMessage: "Did not find the Adapt-Ui-Button",
						actions: new Press()
					});
				},
				iPressOnAdaptUiWithNoFlp() {
					this.waitFor({
						controlType: "sap.m.Button",
						viewName: "sap.ui.rta.test.variantManagement.view.Main",
						bindingPath: {
							path: "",
							propertyPath: "/showAdaptButton",
							modelName: "app"
						},
						errorMessage: "Did not find the Adapt-Ui-Button",
						actions: new Press()
					});
				},
				iSwitchToVisualizationMode() {
					const oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
					const sButtonText = oRtaResourceBundle.getText("BTN_VISUALIZATION");
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
					const oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
					const sButtonText = oRtaResourceBundle.getText("BTN_ADAPTATION");
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
				iClickTheRedoButton() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers(oButton) {
							return oButton.getDomRef().closest(".sapUiRtaToolbar") && oButton.getIcon() === "sap-icon://redo";
						},
						actions: new Press(),
						errorMessage: "Did not find the redo button"
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
				iClickTheButtonWithText(sText) {
					const oResources = Lib.getResourceBundleFor("sap.ui.rta");
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: oResources.getText(sText)
						}),
						actions: new Press(),
						errorMessage: "The button could not be pressed"
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
				iCanNotRightClickOnAnElementOverlay(sId) {
					return this.waitFor({
						autoWait: true,
						controlType: "sap.ui.dt.ElementOverlay",
						matchers(oOverlay) {
							return oOverlay.getElement().getId() !== sId;
						},
						success() {
							Opa5.assert.ok(true, "The wrong Overlay for the element is shown.");
						},
						errorMessage: "Found the right Element Overlay"
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
							const oAggregationOverlay = oOverlay[0].getAggregationOverlay(sAggregationName);
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
					const oResources = Lib.getResourceBundleFor("sap.ui.rta");
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
								const oOverlayDOM = oOverlay.getDomRef().querySelector(".sapUiRtaEditableField");
								const oEditableFieldDomNode = oOverlayDOM.children[0];
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
							const sBindingContextPath = oListItem.getBindingContextPath();
							const oBindingData = oListItem.getBindingContext().getModel().getProperty(sBindingContextPath);
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
					const oResources = Lib.getResourceBundleFor("sap.ui.rta");
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
				iActivateAVersion(sVersionName) {
					sVersionName ||= "Version X";
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers(oButton) {
							return oButton.getId().includes("sapUiRta_activate");
						},
						actions: new Press(),
						success(aButtons) {
							Opa5.assert.equal(aButtons.length, 1, "'Activate Version' button found");
							return this.waitFor({
								controlType: "sap.m.Input",
								matchers(oInput) {
									return oInput.getId().includes("sapUiRta_activateVersionDialog--versionTitleInput");
								},
								actions: new EnterText({
									text: sVersionName
								}),
								success(aInputs) {
									Opa5.assert.equal(aInputs.length, 1, "'Version Name' input found in the activate version dialog");
									return this.waitFor({
										controlType: "sap.m.Button",
										matchers(oButton) {
											return oButton.getId().includes("sapUiRta_activateVersionDialog--confirmVersionTitleButton");
										},
										actions: new Press(),
										success(aButtons) {
											Opa5.assert.ok(aButtons.length > 0,
												`Dialog closed with click on 'Confirm' and a version name of ${sVersionName}' `);

											// await the version activation by waiting for the versions model update after the activation
											return this.waitFor({
												controlType: "sap.m.Button",
												matchers(oButton) {
													return oButton.getId().includes("sapUiRta_versionButton")
														&& oButton.getText() === sVersionName;
												},
												success() {
													Opa5.assert.ok(true,
														`The version '${sVersionName}' is activated.`);
												}
											});
										}
									});
								}
							});
						}
					});
				},
				iExitRtaMode(bDontSaveOnExit, bNoChanges, bActivateVersion = true) {
					if (bActivateVersion && !bDontSaveOnExit && !bNoChanges) {
						this.iActivateAVersion();
					}

					const oResources = Lib.getResourceBundleFor("sap.ui.rta");

					return this.waitFor({
						controlType: "sap.m.Button",
						matchers(oButton) {
							return oButton.getId().includes("sapUiRta_exit");
						},
						actions: new Press(),
						success(aButtons) {
							Opa5.assert.equal(aButtons.length, 1, "'Exit' button found");
							// If a version was just activated or no changes were done, the "save changes" pop-up doesn't come up
							if (bActivateVersion || bNoChanges) {
								return true;
							}
							const sButtonTextKey = bDontSaveOnExit
								? "BTN_UNSAVED_CHANGES_ON_CLOSE_DONT_SAVE"
								: "BTN_UNSAVED_DRAFT_CHANGES_ON_CLOSE_SAVE";
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
				},
				iScrollIntoView(sElementId) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers(oOverlay) {
							return oOverlay.getElement().getId() === sElementId;
						},
						success(aOverlays) {
							aOverlays[0].getDomRef().scrollIntoView();
						},
						errorMessage: "Did not find the Element Overlay"
					});
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
				iShouldNotSeeTheToolbar() {
					return this.waitFor({
						success() {
							const oToolbar = Opa5.getJQuery()(".sapUiRtaToolbar").length > 0;
							Opa5.assert.notOk(oToolbar, "The Toolbar is not rendered.");
						},
						errorMessage: "The toolbar is still visible"
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
							const oFioriToolbar = oToolbar[0];
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
					let oApp;
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
				iShouldSeeTheElementWithText(sText) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers(oOverlay) {
							if (oOverlay.getElement().getText) {
								return oOverlay.getElement().getText() === sText;
							}
							return undefined;
						},
						success(aOverlays) {
							Opa5.assert.ok(aOverlays[0].getElement(), "The element with the Text was found");
						},
						errorMessage: "Did not find the element"
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
							const oOpa5Window = Opa5.getWindow();
							const oHashChanger = new oOpa5Window.sap.ui.core.routing.HashChanger();
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
							const oOpa5Window = Opa5.getWindow();
							const oHashChanger = new oOpa5Window.sap.ui.core.routing.HashChanger();
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
							const aIsContextEntries = [];
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
							let iItems = 0;
							oMenu[0].getItems().forEach(function(oItem) {
								if (oItem.getVisible()) {
									iItems++;
								}
							});
							Opa5.assert.deepEqual(iActions, iItems, `expected ${iItems} context entries found`);
						},
						errorMessage: "Did not find the Context Menu entries"
					});
				},
				iShouldSeeTheDialog(sId, sType) {
					return this.waitFor({
						controlType: "sap.m.Dialog",
						id: sId,
						searchOpenDialogs: true,
						success(oDialog) {
							const oControl = oDialog[0] || oDialog;
							Opa5.assert.strictEqual(oControl.getTitle(), sType, "The dialog is shown");
						},
						errorMessage: "Did not find the Dialog"
					});
				},
				iShouldNotSeeARestartFlag() {
					return this.waitFor({
						autoWait: true,
						success() {
							const oOpa5Window = Opa5.getWindow();
							Opa5.assert.notOk(
								!!oOpa5Window.sessionStorage.getItem("sap.ui.rta.restart.CUSTOMER"),
								"The session storage was cleared by RTA"
							);
						},
						errorMessage: "The RTA restart parameter is not cleaned up"
					});
				},
				iShouldSeeTheMessageStrip(sMessage, sType) {
					return this.waitFor({
						controlType: "sap.m.MessageStrip",
						check(aMessageStrips) {
							const oMessageStrip = aMessageStrips[0];
							const bSameText = oMessageStrip.getText() === sMessage;
							const bSameType = oMessageStrip.getType() === sType;
							return bSameText && bSameType;
						},
						success() {
							Opa5.assert.ok(true, "The correct MessageStrip exists.");
						},
						errorMessage: "Did not find the MessageStrip, the text was wrong or the type was wrong."
					});
				}
			}
		}
	});
});