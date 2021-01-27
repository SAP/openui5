/* global sinon */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/core/util/File",
	"sap/ui/thirdparty/jszip",
	"sap/ui/Device",
	"sap/ui/events/KeyCodes"
], function(Opa5, Press, File, JSZip, Device, KeyCodes) {
	"use strict";

	var sViewName = "ExploreSamples",
		oFileSaveStub,
		oJSZipFileStub;

	Opa5.createPageObjects({
		onTheExploreSamplesPage: {

			actions: {
				iPressDownload: function (sDownloadType) {
					return this.waitFor({
						viewName: sViewName,
						id: "downloadSampleButton",
						actions: function (oMenuBtn) {
							oFileSaveStub = sinon.stub(File, "save");
							oJSZipFileStub = sinon.stub(JSZip.prototype, "file");
							oMenuBtn._getButtonControl().firePress();
						},
						errorMessage: "Could not find tab with name download sample menu",
						success: function (oMenuBtn) {
							return this.waitFor({
								viewName: sViewName,
								controlType: "sap.ui.unified.MenuItem",
								actions: new Press(),
								matchers: {
									ancestor: oMenuBtn,
									properties: {
										text: sDownloadType
									}
								},
								errorMessage: "Could not find MenuItem with text: " + sDownloadType
							});
						}
					});
				},
				iChangeDropdownValue: function (sText) {
					// on Internet Explorer opening the dropdown of the ComboBox by click is unreliable,
					// so we have to do it programmatically
					if (Device.browser.msie) {
						return this.waitFor({
							viewName: sViewName,
							id: "subSample",
							actions: function (oComboBox) {
								var oItem = oComboBox.getItems().find(function (oItem) {
									return oItem.getText() === sText;
								});

								oComboBox.fireSelectionChange({selectedItem: oItem});
							},
							errorMessage: "Could not open the ComboBox"
						});
					}

					// on all other browsers interact with the ComboBox as a user would
					return this.waitFor({
						viewName: sViewName,
						id: "subSample",
						actions: new Press(),
						success: function(oComboBox) {
							this.waitFor({
								controlType: "sap.m.StandardListItem",
								matchers: {
									ancestor: oComboBox,
									properties: {
										title: sText
									}
								},
								actions: new Press(),
								errorMessage: "Cannot select " + sText + " from the ComboBox"
							});
						},
						errorMessage: "Could not open the ComboBox"
					});
				},
				// opens the overflow of the toolbar, in case the button we need has been placed there
				iPressOnToolbarOverflowIfButtonIsThere: function (sBtnId) {
					return this.waitFor({
						viewName: sViewName,
						id: sBtnId,
						visible: false,
						success: function (oBtn) {
							if (oBtn.getDomRef() && Opa5.getJQuery()(oBtn.getDomRef()).is(":visible")) {
								Opa5.assert.ok(true, sBtnId + " is not in the overflow, no need to expand it");
							} else {
								this.waitFor({
									id: "toolbar",
									viewName: sViewName,
									success: function (oToolbar) {
										this.waitFor({
											controlType: "sap.m.ToggleButton",
											matchers: {
												ancestor: oToolbar
											},
											actions: new Press()
										});
									}
								});
							}
						}
					});
				},
				iPressOpenAdministratorEditor: function () {
					var sMenuBtnId = "openConfigurationEditorButton";

					return this.iPressOnToolbarOverflowIfButtonIsThere(sMenuBtnId).and.waitFor({
						viewName: sViewName,
						id: sMenuBtnId,
						actions: function (oMenuBtn) {
							oMenuBtn._getButtonControl().firePress();
						},
						success: function (oMenuBtn) {
							return this.waitFor({
								viewName: sViewName,
								controlType: "sap.ui.unified.MenuItem",
								actions: new Press(),
								matchers: {
									ancestor: oMenuBtn,
									properties: {
										text: "Administrator"
									}
								},
								errorMessage: "Could not find MenuItem with text: 'Administrator'"
							});
						}
					});
				},
				iSelectFile: function (sName) {
					return this.waitFor({
						controlType: "sap.m.IconTabFilter",
						viewName: sViewName,
						properties: {
							text: sName
						},
						actions: new Press()
					});
				},
				iEnterValueInTextEditor: function (sValue) {
					return this.waitFor({
						id: "fileEditor",
						viewName: sViewName,
						success: function (oFileEditor) {
							this.waitFor({
								controlType: "sap.ui.codeeditor.CodeEditor",
								matchers: {
									ancestor: oFileEditor
								},
								actions: function(oCodeEditor) {
									oCodeEditor.setValue(sValue);
								},
								errorMessage: "Couldn't enter value in the text editor"
							});
						}
					});
				},
				iPressEscape: function() {
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.Dialog",
						actions: function (oDialog) {
							Opa5.getUtils().triggerKeydown(oDialog.getDomRef(), KeyCodes.ESCAPE);
						}
					});
				}
			},

			assertions: {
				iShouldHaveFile: function (vContent) {
					return this.waitFor({
						check: function () {
							return oFileSaveStub.called;
						},
						success: function () {
							Opa5.assert.ok(true, "File should be downloaded.");

							if (vContent) {
								Opa5.assert.strictEqual(oFileSaveStub.args[0][0], vContent, "Downloaded file content should be correct.");
							}

							// clean up
							oFileSaveStub.restore();
							oJSZipFileStub.restore();
						},
						errorMessage: "Manifest.json file was not downloaded."
					});
				},
				iShouldHaveZip: function (aFilesNames) {
					return this.waitFor({
						check: function () {
							return oFileSaveStub.called;
						},
						success: function () {
							Opa5.assert.ok(true, "Zip file should be downloaded.");

							if (aFilesNames) {
								aFilesNames.forEach(function (sName) {
									Opa5.assert.ok(oJSZipFileStub.calledWith(sName), "Bundle should contain file: " + sName);
								});
							}

							// clean up
							oFileSaveStub.restore();
							oJSZipFileStub.restore();
						},
						errorMessage: "Bundle as zip file was not downloaded."
					});
				},
				iShouldSeeSampleTitle: function (sTitle) {
					return this.waitFor({
						viewName: sViewName,
						controlType: "sap.m.Title",
						matchers: {
							properties: {
								text: sTitle
							}
						},
						success: function () {
							Opa5.assert.ok(true, "The navigation ended on the correct topic: " + sTitle);
						},
						errorMessage: "The navigation isn't ended on the correct topic: " + sTitle
					});
				},
				iShouldSeeSubSample: function (sKey) {
					return this.waitFor({
						viewName: sViewName,
						controlType: "sap.m.ComboBox",
						matchers: {
							properties: {
								selectedKey: sKey
							}
						},
						success: function () {
							Opa5.assert.ok(true, "The navigation ended on the correct sub sample: " + sKey);
						},
						errorMessage: "The navigation isn't ended on the correct sub sample: " + sKey
					});
				},
				iShouldSeeAdministratorEditorDialog: function () {
					return this.waitFor({
						controlType: "sap.ui.integration.designtime.editor.CardEditor",
						searchOpenDialogs: true,
						success: function () {
							Opa5.assert.ok("Successfully opened Administrator Editor");
						},
						errorMessage: "Administrator Editor didn't open"
					});
				},
				iShouldSeeGeneralSettingsInAdministratorDialog: function () {
					return this.waitFor({
						controlType: "sap.m.Panel",
						properties: {
							headerText: "General Settings"
						},
						searchOpenDialogs: true,
						success: function () {
							Opa5.assert.ok("Configuration is visible in Administrator Editor");
						},
						errorMessage: "Settings didn't appear in the Administrator Editor"
					});
				}
			}
		}
	});
});
