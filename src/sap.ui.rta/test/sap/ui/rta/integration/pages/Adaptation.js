sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/test/actions/Drag",
	"sap/ui/test/actions/Drop",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/fl/api/FlexTestAPI"
], function(
	Lib,
	Drag,
	Drop,
	EnterText,
	Press,
	PropertyStrictEquals,
	Opa5,
	FlexTestAPI
) {
	"use strict";

	const oContextMenuEvent = new MouseEvent("contextmenu", {
		bubbles: true,
		cancelable: true,
		view: window,
		buttons: 2
	});

	// these are the keys of the context menu entries that should be excluded from the check
	// because they are added dynamically and are not actions
	// CTX_CONTROL_NAME is the key for the name of the control
	// CTX_EXTENDED_MENU_TITLE is the key for the title of the extended menu area
	// CTX_PROPAGATED_CONTROL_NAME is the first part of the key for the name of the propagated control
	const aExcludedContextMenuEntryKeys = ["CTX_CONTROL_NAME", "CTX_EXTENDED_MENU_TITLE", "CTX_PROPAGATED_CONTROL_NAME"];

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
				iSwitchToAdaptationMode() {
					return this.waitFor({
						controlType: "sap.m.Switch",
						matchers: (oModeSwitcher) => {
							return oModeSwitcher.getId().includes("sapUiRta_modeSwitcher");
						},
						success(oModeSwitcher) {
							if (!oModeSwitcher[0].getState()) {
								new Press().executeOn(oModeSwitcher[0]);
							}
						},
						errorMessage: "Did not find UI-Adaptation-Button"
					});
				},
				iSwitchToNavigationMode() {
					return this.waitFor({
						controlType: "sap.m.Switch",
						matchers: (oModeSwitcher) => {
							return oModeSwitcher.getId().includes("sapUiRta_modeSwitcher") && oModeSwitcher.getState() === true;
						},
						success(oModeSwitcher) {
							if (oModeSwitcher[0].getState()) {
								new Press().executeOn(oModeSwitcher[0]);
							}
						},
						errorMessage: "Did not find Navigation-Button"
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
							return oButton.getId().includes("sapUiRta_undo");
						},
						actions: new Press(),
						errorMessage: "Did not find the undo button"
					});
				},
				iClickTheRedoButton() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers(oButton) {
							return oButton.getId().includes("sapUiRta_redo");
						},
						actions: new Press(),
						errorMessage: "Did not find the redo button"
					});
				},
				iClickTheSaveButton() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers(oButton) {
							return oButton.getId().includes("sapUiRta_save");
						},
						actions: new Press(),
						errorMessage: "Did not find the save button"
					});
				},
				iClickTheButtonWithTextKey(sKey) {
					const oResources = Lib.getResourceBundleFor("sap.ui.rta");
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: oResources.getText(sKey)
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
				iSelectOverlays(aElementIds) {
					aElementIds.forEach((sElementId, iIndex) => {
						this.waitFor({
							controlType: "sap.ui.dt.ElementOverlay",
							matchers(oOverlay) {
								return oOverlay.getElement().getId() === sElementId;
							},
							actions: new Press({ ctrlKey: iIndex !== 0 }),
							errorMessage: `Did not find the Element Overlay for ${sElementId}`
						});
					});
					return this;
				},
				iRightClickOnACombinedElementOverlay() {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers(oOverlay) {
							const oElement = oOverlay.getElement();
							return oElement.getFields?.().length > 1;
						},
						success(aOverlays) {
							aOverlays[0].getDomRef().dispatchEvent(oContextMenuEvent);
						},
						errorMessage: "Did not find a combined Element Overlay"
					});
				},
				iClickOnAContextMenuEntryWithKey(sKey) {
					return this.waitFor({
						controlType: "sap.m.MenuItem",
						matchers(oMenuItem) {
							return oMenuItem.getKey() === sKey;
						},
						success(aMenuItem) {
							aMenuItem[0].getDomRef().click();
						},
						errorMessage: "Did not find the Context Menu"
					});
				},
				iClickOnAVariantMenu(sVariantName) {
					const oResources = Lib.getResourceBundleFor("sap.ui.rta");
					return this.waitFor({
						controlType: "sap.m.MenuItem",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: oResources.getText(sVariantName)
						}),
						actions: new Press(),
						errorMessage: "The Menu Item was not pressable"
					});
				},
				iEnterANewName(sNewLabel) {
					return this.waitFor({
						controlType: "sap.m.Dialog",
						matchers(oRenameDialog) {
							return oRenameDialog.getId().includes("sapUiRtaRenameDialog");
						},
						actions(oDialog) {
							const oInput = oDialog.getContent()[0].getItems()[1];
							new EnterText({
								text: sNewLabel
							}).executeOn(oInput);
							new Press().executeOn(oDialog.getBeginButton());
						},
						errorMessage: "Did not find the rename dialog"
					});
				},
				iEnterANewAnnotationLabel(sNewLabel) {
					return this.waitFor({
						controlType: "sap.m.Dialog",
						id: "sapUiRtaChangeAnnotationDialog",
						actions(oDialog) {
							const oInput = oDialog.getContent()[0].getItems()[3].getFormContainers()[0].getFormElements()[0].getFields()[0];
							new EnterText({
								text: sNewLabel
							}).executeOn(oInput);
							new Press().executeOn(oDialog.getBeginButton());
						},
						errorMessage: "Did not find the change annotation dialog"
					});
				},
				iEnterANewAnnotationLabelForProperty(sPropertyLabel, sNewLabel) {
					return this.waitFor({
						controlType: "sap.m.Dialog",
						id: "sapUiRtaChangeAnnotationDialog",
						actions(oDialog) {
							const oForm = oDialog.getContent()[0].getItems()[3];
							const aFormElements = oForm.getFormContainers()[0].getFormElements();
							const oFormElement = aFormElements.find((oElement) => {
								const vLabel = oElement.getLabel();
								const sLabelText = typeof vLabel === "string" ? vLabel : vLabel?.getText?.();
								return sLabelText === sPropertyLabel;
							});
							const oInput = oFormElement.getFields()[0];
							new EnterText({
								text: sNewLabel
							}).executeOn(oInput);
							new Press().executeOn(oDialog.getBeginButton());
						},
						errorMessage: `Did not find the property '${sPropertyLabel}' in the change annotation dialog`
					});
				},
				iCancelTheAnnotationDialog() {
					return this.waitFor({
						controlType: "sap.m.Button",
						id: "sapUiRtaChangeAnnotationDialog_cancelButton",
						actions: new Press(),
						errorMessage: "Did not find the cancel button of the change annotation dialog"
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
				iSelectAnElementByLabelInTheCombineDialog(sLabel) {
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.CheckBox",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: sLabel
						}),
						actions: new Press(),
						errorMessage: `Combine dialog checkbox with label '${sLabel}' not found`
					});
				},
				iSelectTheFirstEnabledElementInTheCombineDialog() {
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.List",
						matchers(oList) {
							return oList.getId().includes("rta_combineDialogList");
						},
						actions(oList) {
							const oCheckBox = oList.getItems()
							.map((oItem) => oItem.getContent()[0])
							.find((oBox) => oBox.getEnabled() && !oBox.getSelected());
							new Press().executeOn(oCheckBox);
						},
						errorMessage: "No selectable element found in the Combine dialog"
					});
				},
				iPressCancel() {
					const oResources = Lib.getResourceBundleFor("sap.ui.rta");
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: oResources.getText("BTN_FREP_CANCEL")
						}),
						actions: new Press(),
						errorMessage: "Cancel Button not found"
					});
				},
				iActivateAVersion(sVersionName) {
					sVersionName ||= "Version X";
					return this.waitFor({
						controlType: "sap.m.MenuButton",
						matchers(oMenuButton) {
							return oMenuButton.getId().includes("sapUiRta_versionButton");
						},
						actions: new Press(),
						success(aMenuButtons) {
							Opa5.assert.equal(aMenuButtons.length, 1, "'Version' button found");
							return this.waitFor({
								controlType: "sap.m.MenuItem",
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
				},
				iClickOnRTABackButton() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers(oButton) {
							return oButton.getId().includes("sapUiRta_backButton");
						},
						actions: new Press(),
						errorMessage: "Did not find the RTA Back button"
					});
				},
				iClickTheAddIFrameParametersInfoButton() {
					return this.waitFor({
						id: "sapUiRtaAddIFrameDialog_ParametersInfoButton",
						controlType: "sap.m.Button",
						actions: new Press(),
						errorMessage: "Did not find the Add iFrame parameters info button"
					});
				}
			},
			assertions: {
				iShouldSeeTheToolbar() {
					return this.waitFor({
						autoWait: false,
						timeout: 100,
						id: "sapUIRta_toolbar",
						success(oToolbar) {
							Opa5.assert.ok(oToolbar.getVisible(), "The Toolbar is shown.");
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
						id: "sapUIRta_toolbar",
						success(oToolbar) {
							Opa5.assert.ok(oToolbar.getVisible(), "The Toolbar is shown.");
							Opa5.assert.ok(oToolbar.getControl("icon"), "The FLP Icon is part of the Toolbar");

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
				iShouldSeeTheFLPToolbarAndChangesInLRep(iCount, sReference) {
					return this.waitFor({
						id: "shell-header",
						success(oToolbar) {
							Opa5.assert.ok(oToolbar.getVisible(), "the FLP Toolbar is shown");
							Opa5.assert.equal(
								FlexTestAPI.getNumberOfChangesSynchronous("SessionStorage", sReference),
								iCount,
								"the number of changes is correct"
							);
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
				iShouldSeeACombinedElementOverlay() {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers(oOverlay) {
							const oElement = oOverlay.getElement();
							return oElement.getFields?.().length > 1;
						},
						success(aOverlays) {
							Opa5.assert.ok(aOverlays[0].getElement().getVisible(), "The combined element is visible on the UI");
						},
						errorMessage: "Did not find a combined Element Overlay"
					});
				},
				iShouldNotSeeACombinedElementOverlay() {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						check(aOverlays) {
							return !aOverlays.some((oOverlay) => oOverlay.getElement().getFields?.().length > 1);
						},
						success() {
							Opa5.assert.ok(true, "There is no combined element anymore");
						},
						errorMessage: "A combined Element Overlay is still present"
					});
				},
				iShouldSeeTheElementWithText(sText, iExpectedCount) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers(oOverlay) {
							const oElement = oOverlay.getElement();
							if (oElement.getLabelText) {
								return oElement.getLabelText() === sText;
							}
							if (oElement.getText) {
								return oElement.getText() === sText;
							}
							return undefined;
						},
						check(aOverlays) {
							return iExpectedCount === undefined || aOverlays.length === iExpectedCount;
						},
						success(aOverlays) {
							if (iExpectedCount === undefined) {
								Opa5.assert.ok(aOverlays[0].getElement(), `Found an element with the text '${sText}'`);
							} else {
								Opa5.assert.strictEqual(aOverlays.length, iExpectedCount,
									`Found ${iExpectedCount} element(s) with the text '${sText}'`);
							}
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
						async check() {
							const oOpa5Window = Opa5.getWindow();
							const oHasher = await oOpa5Window.sap.ui.require(["sap/ui/thirdparty/hasher"]);
							return oHasher.getHash().includes("sap-ui-fl-control-variant-id");
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
						async check() {
							const oOpa5Window = Opa5.getWindow();
							const oHasher = await oOpa5Window.sap.ui.require(["sap/ui/thirdparty/hasher"]);
							return !oHasher.getHash().includes("sap-ui-fl-control-variant-id");
						},
						success() {
							Opa5.assert.ok(true, "The URL parameter for variant id is not present");
						},
						errorMessage: "The URL parameter for variant id is being added"
					});
				},
				iShouldSeetheContextMenu() {
					return this.waitFor({
						controlType: "sap.m.Popover",
						matchers(oPopover) {
							return oPopover.hasStyleClass("sapUiDtContextMenu");
						},
						success(aPopover) {
							Opa5.assert.ok(aPopover[0], "The context menu is shown.");
						},
						errorMessage: "Did not find the Context Menu"
					});
				},
				iShouldSeeTheCombineDialogInfoText(sTextKey, aPlaceholders) {
					const oResources = Lib.getResourceBundleFor("sap.ui.rta");
					const sExpectedText = oResources.getText(sTextKey, aPlaceholders);
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.MessageStrip",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: sExpectedText
						}),
						success(aStrips) {
							Opa5.assert.ok(aStrips.length > 0, `The Combine dialog shows the info text '${sExpectedText}'`);
						},
						errorMessage: `Did not find the Combine dialog info text '${sExpectedText}'`
					});
				},
				iShouldSeeACombineDialogElementDisabled(sLabel) {
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.CheckBox",
						matchers(oCheckBox) {
							return oCheckBox.getText() === sLabel && !oCheckBox.getEnabled();
						},
						success() {
							Opa5.assert.ok(true, `The Combine dialog element '${sLabel}' is disabled`);
						},
						errorMessage: `The Combine dialog element '${sLabel}' is not disabled`
					});
				},
				iShouldSeeACombineDialogElementEnabled(sLabel) {
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.CheckBox",
						matchers(oCheckBox) {
							return oCheckBox.getText() === sLabel && oCheckBox.getEnabled();
						},
						success() {
							Opa5.assert.ok(true, `The Combine dialog element '${sLabel}' is enabled`);
						},
						errorMessage: `The Combine dialog element '${sLabel}' is not enabled`
					});
				},
				iShouldSeeCombineDialogElements(iEnabledCount, iDisabledCount) {
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.List",
						matchers(oList) {
							return oList.getId().includes("rta_combineDialogList");
						},
						check(aLists) {
							const aCheckBoxes = aLists[0].getItems().map((oItem) => oItem.getContent()[0]);
							const iEnabled = aCheckBoxes.filter((oCheckBox) => oCheckBox.getEnabled()).length;
							const iDisabled = aCheckBoxes.filter((oCheckBox) => !oCheckBox.getEnabled()).length;
							return iEnabled === iEnabledCount && iDisabled === iDisabledCount;
						},
						success() {
							Opa5.assert.ok(
								true,
								`The Combine dialog shows ${iEnabledCount} enabled and ${iDisabledCount} disabled element(s)`
							);
						},
						errorMessage: `The Combine dialog does not show ${iEnabledCount} enabled and ${iDisabledCount} disabled element(s)`
					});
				},
				iShouldSeeAllCombineDialogElementsEnabled() {
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.List",
						matchers(oList) {
							return oList.getId().includes("rta_combineDialogList");
						},
						check(aLists) {
							const aCheckBoxes = aLists[0].getItems().map((oItem) => oItem.getContent()[0]);
							return aCheckBoxes.length > 0 && aCheckBoxes.every((oCheckBox) => oCheckBox.getEnabled());
						},
						success() {
							Opa5.assert.ok(true, "All elements in the Combine dialog are selectable");
						},
						errorMessage: "Not all elements in the Combine dialog are selectable"
					});
				},
				iShouldSeeAtLeastOneCombineDialogElementDisabled() {
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.List",
						matchers(oList) {
							return oList.getId().includes("rta_combineDialogList");
						},
						check(aLists) {
							const aCheckBoxes = aLists[0].getItems().map((oItem) => oItem.getContent()[0]);
							return aCheckBoxes.some((oCheckBox) => !oCheckBox.getEnabled());
						},
						success() {
							Opa5.assert.ok(true, "At least one element in the Combine dialog is disabled at the limit");
						},
						errorMessage: "No element in the Combine dialog became disabled at the limit"
					});
				},
				iShouldSeetheContextMenuEntriesWithKeys(aContextEntriesKeys) {
					return this.waitFor({
						controlType: "sap.m.Popover",
						matchers(oPopover) {
							return oPopover.hasStyleClass("sapUiDtContextMenu");
						},
						success(aPopover) {
							const oMenu = aPopover[0].getContent()[0];
							const aItems = oMenu.getItems();
							const aFilteredItems = aItems.filter((oItem) => {
								const bHasExcludedKey =
									aExcludedContextMenuEntryKeys.some((sKeyToExclude) => oItem.getKey().includes(sKeyToExclude));
								return !bHasExcludedKey;
							});
							Opa5.assert.deepEqual(aFilteredItems.map((oItem) => oItem.getKey()), aContextEntriesKeys, `expected [${aContextEntriesKeys}] context entries found`);
						},
						errorMessage: "Did not find the Context Menu entries"
					});
				},
				iShouldSeetheNumberOfContextMenuActions(iActions) {
					return this.waitFor({
						controlType: "sap.m.Popover",
						matchers(oPopover) {
							return oPopover.hasStyleClass("sapUiDtContextMenu");
						},
						success(aPopover) {
							const oMenu = aPopover[0].getContent()[0];
							const aItems = oMenu.getItems();
							const iItems = aItems.filter((oItem) => {
								return !aExcludedContextMenuEntryKeys.some((sKeyToExclude) =>
									oItem.getKey().includes(sKeyToExclude)) && oItem.getVisible();
							}).length;
							Opa5.assert.deepEqual(iActions, iItems, `expected ${iItems} context entries found`);
						},
						errorMessage: "Did not find the Context Menu entries"
					});
				},
				iShouldSeeTheContextMenuEntryInfoButton(sKey) {
					return this.waitFor({
						controlType: "sap.m.Popover",
						matchers(oPopover) {
							return oPopover.hasStyleClass("sapUiDtContextMenu");
						},
						success(aPopover) {
							const oMenu = aPopover[0].getContent()[0];
							const oMenuItem = oMenu.getItems().find((oItem) => oItem.getKey() === sKey);
							Opa5.assert.ok(oMenuItem, `Found the context menu entry with key '${sKey}'`);
							const oInfoButton = oMenuItem.getEndContent().find((oControl) => {
								return oControl.isA("sap.m.Button") && oControl.getIcon() === "sap-icon://message-information";
							});
							Opa5.assert.ok(oInfoButton, `The entry '${sKey}' has an additional info button`);
							const sTooltip = oInfoButton?.getTooltip();
							Opa5.assert.ok(typeof sTooltip === "string" && sTooltip.length > 0,
								`The additional info button of '${sKey}' has a non-empty tooltip`);
						},
						errorMessage: "Did not find the Context Menu"
					});
				},
				iShouldSeeTheDialog(sId, sTitle) {
					return this.waitFor({
						controlType: "sap.m.Dialog",
						id: sId,
						searchOpenDialogs: true,
						success(oDialog) {
							const oControl = oDialog[0] || oDialog;
							Opa5.assert.strictEqual(oControl.getTitle(), sTitle, "The dialog is shown");
						},
						errorMessage: "Did not find the Dialog"
					});
				},
				iShouldSeeTheAnnotationDialog() {
					return this.waitFor({
						controlType: "sap.m.Dialog",
						id: "sapUiRtaChangeAnnotationDialog",
						searchOpenDialogs: true,
						success(oDialog) {
							const oControl = oDialog[0] || oDialog;
							Opa5.assert.ok(oControl.isOpen(), "The change annotation dialog is open");
						},
						errorMessage: "Did not find the change annotation dialog"
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
				},
				iShouldSeeTheReloadButtonInTheToolbar() {
					return this.waitFor({
						id: "sapUIRta_toolbar_fragment--sapUiRta_hardReloadButton",
						controlType: "sap.m.Button",
						success() {
							Opa5.assert.ok(true, "Found the Reload Button in the Toolbar");
						},
						errorMessage: "Did not find the Reload Button in the Toolbar"
					});
				},
				iShouldSeeTheAddIFrameParametersInfoPopoverAndCloseIt() {
					return this.waitFor({
						id: "sapUiRtaAddIFrameDialog_ParametersInfoPopover",
						controlType: "sap.m.Popover",
						success(vPopover) {
							const oPopover = vPopover.length ? vPopover[0] : vPopover;
							Opa5.assert.ok(oPopover.isOpen(), "The Add iFrame parameters info popover is shown");
							oPopover.close();
						},
						errorMessage: "Did not find the Add iFrame parameters info popover"
					});
				}
			}
		}
	});
});