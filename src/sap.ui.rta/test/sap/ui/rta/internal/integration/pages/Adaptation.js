/* global assert */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/fl/FakeLrepConnectorSessionStorage",
	"sap/ui/events/KeyCodes"
], function(
	Opa5,
	Press,
	QUnitUtils,
	FakeLrepConnectorSessionStorage,
	KeyCodes
) {
	"use strict";

	Opa5.createPageObjects({
		onPageWithRTA: {
			actions: {
				iGoToMeArea: function() {
					return this.waitFor({
						id: "meAreaHeaderButton",
						errorMessage: "Did not find the Me-Area",
						actions: new Press()
					});
				},
				iPressOnAdaptUi: function(bPersonalize) {
					var sButtonType = bPersonalize ? "PERSONALIZE" : "RTA";
					var sId = sButtonType + "_Plugin_ActionButton";
					return this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: function(oListItem) {
							return oListItem.data().actionItemId === sId;
						},
						errorMessage: "Did not find the Adapt-Ui-Button",
						actions: new Press()
					});
				},
				iWaitUntilTheBusyIndicatorIsGone: function(sId, sViewName) {
					return this.waitFor({
						autoWait: false,
						id: sId,
						viewName: sViewName,
						matchers: function(oRootView) {
							// we set the view busy, so we need to query the parent of the app
							return oRootView.getBusy() === false;
						},
						success: function() {
							assert.ok(true, "the App is not busy anymore");
						},
						errorMessage: "The app is still busy.."
					});
				},
				iWaitUntilTheCompactContextMenuAppears: function(sContextMenuButtonIcon, sContextMenuButtonTooltip) {
					return this.waitFor({
						autoWait: false,
						controlType: "sap.m.Button",
						matchers: function(oButton) {
							// we set the view busy, so we need to query the parent of the app
							return (oButton.getTooltip() === sContextMenuButtonTooltip &&
									oButton.getIcon() === sContextMenuButtonIcon &&
									oButton.isActive() === true);
						},
						success: function() {
							assert.ok(true, "the compact contextMenu is open now");
						},
						errorMessage: "The compact contextMenu is still closed"
					});
				},
				iRightClickOnAnElementOverlay: function(sId) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers: function(oOverlay) {
							return oOverlay.getElementInstance().getId() === sId;
						},
						success: function(aOverlays) {
							aOverlays[0].$().trigger('contextmenu');
						},
						errorMessage: "Did not find the Element Overlay"
					});
				},
				iClickOnAnElementOverlay: function(sId) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers: function(oOverlay) {
							return oOverlay.getElementInstance().getId() === sId;
						},
						errorMessage: "Did not find the Element Overlay",
						actions: new Press()
					});
				},
				iRightClickOnAnAggregationOverlay: function(sId, sAggregationName) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers: function(oOverlay) {
							return oOverlay.getElementInstance().getId() === sId;
						},
						success: function(oOverlay) {
							var oAggregationOverlay = oOverlay[0].getAggregationOverlay(sAggregationName);
							oAggregationOverlay.$().trigger('contextmenu');
						},
						errorMessage: "Did not find the Element Overlay"
					});
				},
				iClickOnAContextMenuEntry: function(iIndex) {
					return this.waitFor({
						controlType: "sap.m.Popover",
						matchers: function(oMenu) {
							return oMenu.$().hasClass("sapUiDtContextMenu");
						},
						success: function(aPopover) {
							aPopover[0].getContent()[0].getItems()[iIndex].firePress();
						},
						errorMessage: "Did not find the Context Menu"
					});
				},
				iEnterANewName: function(sNewLabel) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers: function(oOverlay) {
							if (oOverlay.$().hasClass("sapUiDtOverlaySelected")) {
								var $Overlay = oOverlay.$().find(".sapUiRtaEditableField");
								var oEditableFieldDomNode = $Overlay.children()[0];
								return oEditableFieldDomNode;
							}
						},
						actions: function(oEditableFieldDomNode) {
							oEditableFieldDomNode.innerHTML = sNewLabel;
							QUnitUtils.triggerEvent("keypress", oEditableFieldDomNode, {which: KeyCodes.ENTER, keyCode: KeyCodes.ENTER});
							oEditableFieldDomNode.blur();
						},
						errorMessage: "Did not find the Selected Element Overlay"
					});
				},
				iSelectAFieldByBindingPathInTheAddDialog: function(sBindingPath) {
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.CustomListItem",
						matchers: function(oListItem) {
							var sBindingContextPath = oListItem.getBindingContextPath();
							var oBindingData = oListItem.getBindingContext().getModel().getProperty(sBindingContextPath);
							return oBindingData.bindingPath && oBindingData.bindingPath === sBindingPath;
						},
						actions: new Press(),
						errorMessage: "List Item with this label not found"
					});
				},
				iSelectAFieldByLabelInTheAddSectionDialog: function(sLabel) {
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.CustomListItem",
						matchers: function(oListItem) {
							return oListItem.getContent()[0].getItems()[0].getText() === sLabel;
						},
						actions: new Press(),
						errorMessage: "List Item with this label not found"
					});
				},
				iPressOK: function() {
					var oResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.Button",
						matchers: new sap.ui.test.matchers.PropertyStrictEquals({
							name: "text",
							value: oResources.getText("BTN_FREP_OK")
						}),
						actions: new Press(),
						errorMessage: "OK Button not found"
					});
				},
				iExitRtaMode: function() {
					var oResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: function(oButton) {
							return oButton.$().closest(".sapUiRtaToolbar").length > 0 && oButton.getProperty("text") === oResources.getText("BTN_EXIT");
						},
						actions: new Press()
					});
				},
				// Only for UI Personalization. Plese do not use in UI Adaptation tests
				iPressOnRemoveSection: function(sSectionId) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers: function(oOverlay) {
							return oOverlay.getElementInstance().getId() === sSectionId;
						},
						success: function(aOverlays) {
							var oOverlay = aOverlays[0];
							var sOverlayId = oOverlay.getId();
							oOverlay.$().find("#" + sOverlayId + "-DeleteIcon").trigger("click");
						},
						errorMessage: "Did not find the Remove Button on the section"
					});
				},
				// Only for UI Personalization. Plese do not use in UI Adaptation tests
				iPressOnAddSection: function(sSectionId) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers: function(oOverlay) {
							return oOverlay.getElementInstance().getId() === sSectionId;
						},
						success: function(aOverlays) {
							var oOverlay = aOverlays[0];
							var sOverlayId = oOverlay.getId();
							oOverlay.$().find("#" + sOverlayId + "-AddButton").trigger("click");
						},
						errorMessage: "Did not find the Add Button on the section"
					});
				},
				iExitRtaPersonalizationMode: function() {
					var oResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: function(oButton) {
							return oButton.getParent().$ && oButton.getParent().$().hasClass("sapUiRtaToolbar")
								&& oButton.getParent().$().hasClass("type_personalization")
								&& oButton.getProperty("text") === oResources.getText("BTN_DONE");
						},
						actions: new Press()
					});
				}
			},

			assertions: {
				iShouldSeeTheToolbar: function() {
					return this.waitFor({
						autoWait: false,
						timeout: 100,
						controlType: "sap.m.HBox",
						matchers: function(oToolbar) {
							return oToolbar.$().hasClass("sapUiRtaToolbar");
						},
						success: function(oToolbar) {
							assert.ok(oToolbar[0].getVisible(), "The Toolbar is shown.");
						},
						errorMessage: "Did not find the Toolbar"
					});
				},
				iShouldSeeTheToolbarAndTheLogo: function () {
					return this.waitFor({
						autoWait: false,
						controlType: "sap.m.HBox",
						matchers: function (oToolbar) {
							return oToolbar.$().hasClass("sapUiRtaToolbar");
						},
						success: function (oToolbar) {
							var oFioriToolbar = oToolbar[0];
							assert.ok(oFioriToolbar.getVisible(), "The Toolbar is shown.");
							assert.ok(oFioriToolbar.getControl("icon"), "The FLP Icon is part of the Toolbar");

							return this.waitFor({
								controlType: "sap.m.Image",
								matchers: function (oImage) {
									return oImage.$().closest(".sapUiRtaToolbar").length > 0;
								},
								success: function (aLogo) {
									assert.ok(aLogo.length > 0, "the logo is found on the UI");
								}
							});
						},
						errorMessage: "Did not find the Toolbar"
					});
				},
				iShouldSeeTheFLPToolbarAndChangesInLRep: function(iCount, sReference) {
					return this.waitFor({
						id: "shell-header",
						success: function(oToolbar) {
							assert.ok(oToolbar.getVisible(), "the FLP Toolbar is shown");
							assert.equal(FakeLrepConnectorSessionStorage.forTesting.synchronous.getNumberOfChanges(sReference), iCount, "the number of changes is correct");
						},
						errorMessage: "the FLP-Toolbar was not found"
					});
				},
				iShouldSeeTheOverlayForTheApp: function(sId, sViewName) {
					var oApp;
					this.waitFor({
						id: sId,
						viewName: sViewName,
						errorMessage: "The app is still busy..",
						success: function(oAppControl) {
							oApp = oAppControl;
						}
					});

					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers: function(oOverlay) {
							return oOverlay.getElementInstance() === oApp;
						},
						success: function(oOverlay) {
							assert.ok(oOverlay[0].getVisible(), "The Overlay is shown.");
						},
						errorMessage: "Did not find the Element Overlay for the App Control"
					});
				},
				iShouldSeeChangesInLRepWhenTheBusyIndicatorIsGone: function(sId, sViewName, iCount, sReference) {
					return this.waitFor({
						id: sId,
						viewName: sViewName,
						success: function() {
							assert.equal(FakeLrepConnectorSessionStorage.forTesting.synchronous.getNumberOfChanges(sReference), iCount, "the number of changes is correct");
						},
						errorMessage: "The app is still busy.."
					});
				},
				iShouldNotSeeTheElement: function(sId) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						visible: false,
						matchers: function(oOverlay) {
							return oOverlay.getElementInstance().getId() === sId;
						},
						success: function(aOverlays) {
							assert.notOk(aOverlays[0].getElementInstance().getVisible(), "The section is not shown on the UI");
						},
						errorMessage: "Did not find the element or it is still visible"
					});
				},
				iShouldSeeTheElement: function(sId) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						visible: false,
						matchers: function(oOverlay) {
							return oOverlay.getElementInstance().getId() === sId;
						},
						success: function(aOverlays) {
							assert.ok(aOverlays[0].getElementInstance().getVisible(), "The section is again visible on the UI");
						},
						errorMessage: "Did not find the element or it is still invisible"
					});
				},
				iShouldSeeThePopUp: function(bWithAction) {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: function(oButton) {
							return oButton.getId().indexOf("__mbox") > -1;
						},
						success: function(aButtons) {
							assert.ok(aButtons[0].getVisible(), "The Dialog is shown.");
						},
						actions: bWithAction ? new Press() : undefined,
						errorMessage: "Did not find the Dialog"
					});
				},
				iShouldSeeTheVariantURLParameter: function () {
					return this.waitFor({
						autoWait: true,
						check: function () {
							var oOpa5Window = Opa5.getWindow();
							var oHashChanger = new oOpa5Window.sap.ui.core.routing.HashChanger();
							return oHashChanger.getHash().includes("sap-ui-fl-control-variant-id");
						},
						success: function () {
							assert.ok(true, "The URL parameter for variant id is present");
						},
						errorMessage: "The URL parameter for variant id is not being added"
					});
				},
				iShouldNotSeeTheVariantURLParameter: function () {
					return this.waitFor({
						autoWait: true,
						check: function () {
							var oOpa5Window = Opa5.getWindow();
							var oHashChanger = new oOpa5Window.sap.ui.core.routing.HashChanger();
							return !oHashChanger.getHash().includes("sap-ui-fl-control-variant-id");
						},
						success: function () {
							assert.ok(true, "The URL parameter for variant id is present");
						},
						errorMessage: "The URL parameter for variant id is not being added"
					});
				}
			}
		}
	});
});
