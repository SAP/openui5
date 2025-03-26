/* global sinon */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/core/util/File",
	"sap/ui/thirdparty/jszip"
], function(Opa5, Press, File, JSZip) {
	"use strict";

	const sViewName = "ExploreSamples";
	let oFileSaveStub;
	let oJSZipFileStub;
	let oActionEventStub;

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
				iSpyOnCardActionEvent: function () {
					return this.waitFor({
						id: "cardSample",
						actions: function (oCard) {
							oActionEventStub = sinon.stub();
							oCard.attachAction(oActionEventStub);
						},
						success: function () {
							Opa5.assert.ok(true, "Action event spy is attached.");
						},
						errorMessage: "Could not find card"
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
				iShouldSeeSampleCard: function (sManifestId) {
					return this.waitFor({
						controlType: "sap.ui.integration.widgets.Card",
						matchers: function (oCard) {
							return oCard.isReady() && oCard.getManifest()?.["sap.app"].id === sManifestId;
						},
						success: function () {
							Opa5.assert.ok(true, "The card with manifest id " + sManifestId + " is displayed.");
						},
						errorMessage: "Could not find card with manifest id " + sManifestId
					});
				},
				iShouldSeeNoCardActionEventCalls: function () {
					return this.waitFor({
						check: function () {
							return !oActionEventStub.called;
						},
						success: function () {
							Opa5.assert.ok(true, "Action event was not called.");
						},
						errorMessage: "Action event was called."
					}).and.waitFor({
						id: "cardSample",
						success: function (oCard) {
							oCard.detachAction(oActionEventStub);
						}
					});
				}
			}
		}
	});
});
