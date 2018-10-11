sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/actions/EnterText",
	"sap/ui/core/format/DateFormat",
	"sap/ui/thirdparty/sinon"
], function(Opa5, Press, PropertyStrictEquals, EnterText, DateFormat, sinon) {
	"use strict";

	var sViewName = "Analysis",
		sViewNameSpace = "sap.ui.support.supportRules.ui.views.";

	function getSelectedRules(oTable) {
		var aSelected = [];
		jQuery.each(oTable.getModel().getData().treeModel, function(iLibInd, oLibrary) {
			oLibrary.nodes.forEach(function(oRule) {
				if (oRule.selected) {
					aSelected.push(oRule);
				}
			});
		});

		return aSelected;
	}

	function areExactRulesSelected(oTable, aRulesIds) {
		var aSelectedRules = getSelectedRules(oTable);

		if (aSelectedRules.length !== aRulesIds.length) {
			return false;
		}

		return aRulesIds.every(function(sRuleId) {
			return aSelectedRules.some(function(oSelectedRule) {
				return sRuleId == oSelectedRule.id;
			});
		});
	}

	Opa5.createPageObjects({
		onThePresetsPage: {
			actions : {
				iPressPresetsVariantSelect: function() {
					return this.waitFor({
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						id: "presetVariantBtn",
						actions: new Press(),
						success: function() {
							Opa5.assert.ok(true, "Presets variant select was pressed");
						},
						errorMessage: "Was not able to press presets variant select"
					});
				},

				iOpenPresetsPopover: function() {
					// check if the popover is opened and open it when it is not
					// for this to work - it has to ensure it is closed, so it closes it first
					var oPopover = Opa5.getWindow().sap.ui.getCore().byId("presetsSelect--presetsPopover");
					if (oPopover) {
						oPopover.close();
					}

					return this.waitFor({
						check: function() {
							var isOpen;

							if (!oPopover) {
								oPopover = Opa5.getWindow().sap.ui.getCore().byId("presetsSelect--presetsPopover");
								isOpen = false; // oPopover is not initialized, so it is closed
							} else {
								isOpen = oPopover.isOpen();

								if (isOpen) {
									oPopover.close();
								}
							}

							return !isOpen;
						},
						success: function() {
							this.iPressPresetsVariantSelect();
							Opa5.assert.ok(true, "Presets popover was opened");
						},
						errorMessage: "Was not able to locate presets variant button"
					});
				},

				iPressImport: function() {
					return this.waitFor({
						id: "presetsSelect--presetImport",
						actions: new Press(),
						success: function() {
							Opa5.assert.ok(true, "Presets import was pressed");
						},
						errorMessage: "Was not able to press presets import"
					});
				},

				iOpenImportDialog: function() {
					return this.iOpenPresetsPopover()
						.and.waitFor({
							id: "presetsSelect--presetImport",
							success: function() {
								var dialog = Opa5.getWindow().sap.ui.getCore().byId("presetImport--importDialog");

								if (dialog && dialog.isOpen()) {
									Opa5.assert.ok(true, "Preset import dialog is already open");
								} else {
									this.iPressImport();
								}
							},
							errorMessage: "Was not able to locate presets import"
						});
				},

				iReopenImportDialog: function() {
					return this.iPressImportCancel()
						.and.iOpenImportDialog();
				},

				iPressExport: function() {
					return this.waitFor({
						id: "presetsSelect--presetExport",
						actions: new Press(),
						success: function() {
							Opa5.assert.ok(true, "Presets export was pressed");
						},
						errorMessage: "Was not able to press presets export"
					});
				},

				iUploadExamplePreset: function(sFileName, sMimeType) {
					return this.waitFor({
						id: "presetImport--fileUpload",
						success: function(oFileUploader) {
							var sFileContent = jQuery.sap.syncGet("test-resources/sap/ui/support/integration/ui/data/Presets/" + sFileName).data;

							var oFile = new Blob(
								[sFileContent],
								{"type": sMimeType ? sMimeType : "application/json"}
							);

							oFileUploader.setValue(sFileName);
							oFileUploader.fireChange({
								files: [oFile],
								newValue: sFileName
							});

							Opa5.assert.ok(true, "File '" + sFileName + "' was uploaded");
						},
						errorMessage: "Was not able to find import file uploader"
					});
				},

				iPressImportCancel: function() {
					return this.waitFor({
						id: "presetImport--cancel",
						actions: new Press(),
						success: function() {
							Opa5.assert.ok(true, "Presets import cancel was pressed");
						},
						errorMessage: "Was not able to press import cancel"
					});
				},

				iPressImportFinalize: function() {
					return this.waitFor({
						id: "presetImport--importBtn",
						actions: new Press(),
						success: function() {
							Opa5.assert.ok(true, "Presets import finalize was pressed");
						},
						errorMessage: "Was not able to press import finalize"
					});
				},

				iEnterExportData: function(sId, sValue) {
					return this.waitFor({
						id: "presetExport--" + sId,
						actions: new EnterText({ text: sValue }),
						success: function() {
							Opa5.assert.ok(true, "I enter text '" + sValue + "' in '" + sId + "' in export dialog");
						},
						errorMessage: "Was not able to enter text '" + sValue + "' in '" + sId + "' in export dialog"
					});
				},

				iPressExportFinalize: function() {
					// stub for file save
					var File = Opa5.getWindow().sap.ui.require("sap/ui/core/util/File");
					Opa5.getContext().fileSaveStub = sinon.stub(File, "save");

					return this.waitFor({
						id: "presetExport--exportBtn",
						actions: new Press(),
						success: function() {
							Opa5.assert.ok(true, "Finalize export was pressed");
							Opa5.getContext().fileSaveStub.restore();
						},
						error: function() {
							Opa5.getContext().fileSaveStub.restore();
						},
						errorMessage: "Was not able to press export finalize"
					});
				},

				iPressPresetInPopover: function(sTitle) {
					return this.waitFor({
						controlType: "sap.m.CustomListItem",
						searchOpenDialogs: true,
						timeout: 3,
						matchers: function(oListItem) {
							return oListItem.$().find(".sapMFT").html() == sTitle;
						},
						actions: new Press(),
						success: function() {
							Opa5.assert.ok(true, "Preset '" + sTitle + "' was pressed");
						},
						errorMessage: "Was not able to locate correct preset in popover"
					});
				},

				iPressDeletePresetInPopover: function(sTitle) {
					return this.waitFor({
						controlType: "sap.m.Button",
						searchOpenDialogs: true,
						timeout: 3,
						matchers: function(oButton) {
							return  oButton.getIcon() === "sap-icon://sys-cancel" && oButton.$().parents("li").find(".sapMFT").html() == sTitle;
						},
						actions: new Press(),
						success: function() {
							Opa5.assert.ok(true, "Delete for preset '" + sTitle + "' was pressed");
						},
						errorMessage: "Was not able to locate delete button for preset '" + sTitle + "'"
					});
				},

				iPressUndoButton: function(sTitle) {
					return this.waitFor({
						controlType: "sap.m.Button",
						searchOpenDialogs: true,
						timeout: 3,
						matchers: function(oButton) {
							return oButton.getIcon() === "sap-icon://refresh" && oButton.$().parents("li").find(".sapMFT").html() == sTitle;
						},
						actions: new Press(),
						success: function() {
							Opa5.assert.ok(true, "'Undo' button was pressed");
						},
						errorMessage: "Was not able to press 'Undo' button"
					});
				}
			},

			assertions: {
				iShouldSeePresetsVariantSelect: function() {
					return this.waitFor({
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						id: "presetVariantBtn",
						success: function() {
							Opa5.assert.ok(true, "Presets variant select is visible");
						},
						errorMessage: "Was not able to locate presets variant select"
					});
				},

				iShouldSeePresetsPopover: function() {
					return this.waitFor({
						id: "presetsSelect--presetsPopover",
						success: function() {
							Opa5.assert.ok(true, "I see presets popover");
						},
						errorMessage: "Was not able to locate presets popover"
					});
				},

				iShouldNotSeePresetsPopover: function() {
					// check if the popover is not opened
					// achieved by waiting for the button and then do the checking
					return this.waitFor({
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						id: "presetVariantBtn",
						check: function() {
							var oPopover = Opa5.getWindow().sap.ui.getCore().byId("presetsSelect--presetsPopover");
							return !(oPopover && oPopover.isOpen());
						},
						success: function() {
							Opa5.assert.ok(true, "Presets popover is not opened");
						},
						errorMessage: "Was not able to locate presets variant button"
					});
				},

				iShouldSeeHelpIcon: function() {
					return this.waitFor({
						id: "presetsSelect--help",
						success: function() {
							Opa5.assert.ok(true, "I see the help icon");
						},
						errorMessage: "Was not able to locate help icon"
					});
				},

				iShouldSeeImportDialog: function() {
					return this.waitFor({
						id: "presetImport--importDialog",
						success: function() {
							Opa5.assert.ok(true, "I see presets import dialog");
						},
						errorMessage: "Was not able to locate import dialog"
					});
				},

				iShouldSeeExportDialog: function() {
					return this.waitFor({
						id: "presetExport--exportDialog",
						success: function() {
							Opa5.assert.ok(true, "I see presets export dialog");
						},
						errorMessage: "Was not able to locate export dialog"
					});
				},

				iShouldSeeImportFileError: function() {
					return this.waitFor({
						id: "presetImport--fileError",
						success: function() {
							Opa5.assert.ok(true, "I see import file error");
						},
						errorMessage: "Was not able to locate import file error"
					});
				},

				iShouldSeeImportDuplicateIdError: function(sText) {
					return this.waitFor({
						id: "presetImport--duplicateIdError",
						matchers: new PropertyStrictEquals({name: "text", value: sText}),
						success: function() {
							Opa5.assert.ok(true, "I see import duplicate id error with correct text");
						},
						errorMessage: "Was not able to locate import duplicate id error"
					});
				},

				iShouldSeeImportData: function(sId, sText) {
					return this.waitFor({
						id: "presetImport--" + sId,
						matchers: new PropertyStrictEquals({name: "text", value: sText}),
						success: function() {
							Opa5.assert.ok(true, "I see import data '" + sId + "' with text '" + sText + "'");
						},
						errorMessage: "Was not able to locate import data '" + sId + "' with text '" + sText + "'"
					});
				},

				iShouldSeeExportData: function(sId, sValue) {
					return this.waitFor({
						id: "presetExport--" + sId,
						matchers: new PropertyStrictEquals({name: "value", value: sValue}),
						success: function() {
							Opa5.assert.ok(true, "I see export data '" + sId + "' with value '" + sValue + "'");
						},
						errorMessage: "Was not able to locate export data '" + sId + "' with value '" + sValue + "'"
					});
				},

				iShouldReceiveOneExportFile: function() {
					return this.waitFor({
						check: function () {
							return Opa5.getContext().fileSaveStub.calledOnce;
						},
						success: function() {
							Opa5.assert.ok(true, "I receive one export file");
						},
						errorMessage: "Was not able to receive one export file"
					});
				},

				iShouldReceiveCorrectExportFile: function(oDataToMatch) {
					return this.waitFor({
						check: function () {
							return Opa5.getContext().fileSaveStub.calledOnce;
						},
						success: function() {
							var oStub = Opa5.getContext().fileSaveStub;

							var sMatchFile = sinon.match(function (sValue) {
								var fileData = JSON.parse(sValue);
								return sinon.deepEqual(
									sinon.match(oDataToMatch),
									fileData
								);
							});

							var isFileCorrect = oStub.calledWith(
								sMatchFile,
								sinon.match.truthy, // some file name
								"json",
								"text/plain"
							);

							Opa5.assert.ok(isFileCorrect, "I receive correct export file");
						},
						errorMessage: "Was not able to receive correct export file"
					});
				},

				iShouldSeeEmptyImportDialog: function() {
					return this.iShouldSeeImportData("fileName", "")
						.and.iShouldSeeImportData("title", "")
						.and.iShouldSeeImportData("dateExported", "")
						.and.iShouldSeeImportData("description", "");
				},

				iShouldSeeImportDataForPreset: function(sFileName, oPreset) {
					return this.iShouldSeeImportData("fileName", sFileName)
						.and.iShouldSeeImportData("title", oPreset.title)
						.and.iShouldSeeImportData("rulesCount", " (" + oPreset.selections.length + " rules selected)")
						.and.iShouldSeeImportData("dateExported", DateFormat.getDateTimeInstance({style: "medium"}).format(new Date(oPreset.dateExported)))
						.and.iShouldSeeImportData("description", oPreset.description);
				},

				iShouldSeePresetTitleInVariantSelect: function(sTitle) {
					return this.waitFor({
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						id: "presetVariantTxt",
						matchers: new PropertyStrictEquals({name: "htmlText", value: sTitle}),
						success: function() {
							Opa5.assert.ok(true, "I see correct preset title '" + sTitle + "' in variant select");
						},
						errorMessage: "Was not able to locate correct preset in variant select"
					});
				},

				iShouldSeePresetInPopover: function(sTitle) {
					return this.waitFor({
						controlType: "sap.m.CustomListItem",
						searchOpenDialogs: true,
						timeout: 3,
						matchers: function(oListItem) {
							return oListItem.$().find(".sapMFT").html() == sTitle;
						},
						success: function() {
							Opa5.assert.ok(true, "I see preset '" + sTitle + "' in the popover");
						},
						errorMessage: "Was not able to locate correct preset in popover"
					});
				},

				iShouldSeeNumberOfPresetsInPopover: function(iExpectedCount) {
					return this.waitFor({
						controlType: "sap.m.CustomListItem",
						searchOpenDialogs: true,
						timeout: 3,
						success: function(aListItems) {
							Opa5.assert.strictEqual(aListItems.length, iExpectedCount, "I see '" + iExpectedCount + "' presets in the popover");
						},
						errorMessage: "I don't see '" + iExpectedCount + "' in the popover"
					});
				},

				iShouldSeeSelectedPreset: function(sTitle) {
					return this.waitFor({
						controlType: "sap.m.CustomListItem",
						searchOpenDialogs: true,
						timeout: 3,
						matchers: new PropertyStrictEquals({name: "selected", value: true}),
						success: function(aListItems) {
							Opa5.assert.ok(
								aListItems.length == 1,
								"One preset is selected"
							);

							Opa5.assert.ok(
								aListItems[0].$().find(".sapMFT").html() == sTitle,
								"The selected preset is '" + sTitle + "'"
							);
						},
						errorMessage: "The selected preset is not correct"
					});
				},

				iShouldSeeSelectedRules: function(aRulesIds) {
					return this.waitFor({
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						id: "ruleList",
						success: function(oTable) {
							Opa5.assert.ok(
								areExactRulesSelected(oTable, aRulesIds),
								"I see that the expected rules are selected"
							);
						},
						errorMessage: "The expected rules are not selected"
					});
				},

				iShouldSeeCorrectValueState: function(sId, sValueState) {
					return this.waitFor({
						id: "presetExport--" + sId,
						success: function(oInput) {
							Opa5.assert.strictEqual(oInput.getValueState(), sValueState, sId + " Input have correct ValueState");
						},
						errorMessage: "Was not able to locate input " + sId + " with ValueState " + sValueState
					});
				},

				iShouldSeeGroupWithTitle: function(sTitle) {
					return this.waitFor({
						controlType: "sap.m.GroupHeaderListItem",
						searchOpenDialogs: true,
						matchers: new PropertyStrictEquals({name: "title", value: sTitle}),
						success: function(oGroupHeader) {
							Opa5.assert.ok(true, "Group header with title: '" + sTitle + "' was found.");
						},
						errorMessage: "Group header with title: '" + sTitle + "' was NOT found."
					});
				}
			}
		}
	});
});