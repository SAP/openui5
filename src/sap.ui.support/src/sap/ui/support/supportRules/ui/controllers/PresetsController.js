/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/support/supportRules/ui/controllers/BaseController",
	"sap/ui/support/supportRules/ui/models/SelectionUtils",
	"sap/ui/support/supportRules/ui/models/PresetsUtils",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/support/supportRules/ui/models/Documentation",
	"sap/ui/support/supportRules/util/Utils",
	"sap/m/GroupHeaderListItem",
	"sap/base/util/deepExtend",
	"sap/ui/core/library"
], function (
	BaseController,
	SelectionUtils,
	PresetsUtils,
	Fragment,
	MessageToast,
	MessageBox,
	Documentation,
	Utils,
	GroupHeaderListItem,
	deepExtend,
	coreLibrary
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	/**
	 * Constants used internally
	 * @constant
	 * @type {Object}
	 */
	var Constants = {
		/**
		 * The id of the fragment used to render presets select popover
		 * @constant
		 * @type {string}
		 */
		SELECT_FRAGMENT_ID: "presetsSelect",

		/**
		 * The id of the fragment used to render export dialog
		 * @constant
		 * @type {string}
		 */
		EXPORT_FRAGMENT_ID: "presetExport",

		/**
		 * The id of the fragment used to render import dialog
		 * @constant
		 * @type {string}
		 */
		IMPORT_FRAGMENT_ID: "presetImport",

		/**
		 * @constant
		 * @type {string}
		 */
		PRESET_GROUP_NONE: "None",

		/**
		 * Title for the group of system presets
		 * @constant
		 * @type {string}
		 */
		PRESET_GROUP_SYSTEM: "System Presets",

		/**
		 * Title for the group of custom presets
		 * @constant
		 * @type {string}
		 */
		PRESET_GROUP_CUSTOM: "Custom Presets"
	};

	/**
	 * Controller for selection presets
	 *
	 * @class Provides methods for switching presets and for import/export of presets
	 *
	 * @extends sap.ui.support.supportRules.ui.controllers.BaseController
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @alias sap.ui.support.supportRules.ui.controllers.PresetsController
	 */
	var PresetsController = BaseController.extend("sap.ui.support.supportRules.ui.controllers.PresetsController", {
		constructor : function(oModel, oView) {
			BaseController.call(this);
			this.oModel = oModel;
			this.oView = oView;
		}
	});

	/**
	 * Opens the preset variant select
	 */
	PresetsController.prototype.openPresetVariant = function () {
		var oBtn = this.oView.byId("presetVariantBtn");
		oBtn.focus();

		if (!this._oPresetsPopover) {
			this._oPresetsPopover = Fragment.load({
				id: Constants.SELECT_FRAGMENT_ID,
				name: "sap.ui.support.supportRules.ui.views.Presets",
				controller: this
			}).then(function (oPresetsPopover) {
				this.oView.addDependent(oPresetsPopover);
				return oPresetsPopover;
			}.bind(this));
		}

		this._oPresetsPopover.then(function (oPresetsPopover) {
			if (!oPresetsPopover.isOpen()) {
				// set correct focus in the popover
				oPresetsPopover.setInitialFocus(
					Fragment.byId(Constants.SELECT_FRAGMENT_ID, "select").getSelectedItem().getId()
				);

				oPresetsPopover.openBy(oBtn);
			} else {
				oPresetsPopover.close();
			}
		});
	};

	/**
	 * Handles the changes of the selected preset by the user
	 * @param {sap.ui.base.Event} oEvent The event which was fired.
	 */
	PresetsController.prototype.onPresetChange = function (oEvent) {
		var sPath = oEvent.getParameter("listItem").getBindingContext().getPath();

		this._applyPreset(
			this.oModel.getProperty(sPath)
		);
	};

	/**
	 * Closes the variant select when an item is clicked
	 */
	PresetsController.prototype.onPresetItemPress = function () {
		Fragment.byId(Constants.SELECT_FRAGMENT_ID, "presetsPopover").close();
	};

	/**
	 * Handles the deletion of a preset item from the variant select
	 * @param {sap.ui.base.Event} oEvent The event which was fired.
	 */
	PresetsController.prototype.onPresetItemDelete = function (oEvent) {
		var sPath = oEvent.getSource().getBindingContext().getPath(),
			oDeletePreset = this.oModel.getProperty(sPath),
			aCustomPresets = this.oModel.getProperty("/customPresets"),
			sDeletedItemId = oEvent.getSource().$().closest(".sapMLIB").attr("id");

		// use the path to find and delete
		var aPresets = this.oModel.getProperty("/selectionPresets");

		var iDeletedPresetIndex = aPresets.indexOf(oDeletePreset);
		if (iDeletedPresetIndex !== -1) {
			aPresets.splice(iDeletedPresetIndex, 1);
		}

		if (oDeletePreset.selected) {
			// selects the first preset if the deleted one was selected
			aPresets[0].selected = true;
			this._applyPreset(aPresets[0]);
		}

		this.oModel.setProperty("/selectionPresets", aPresets);

		if (oDeletePreset.isCustomPreset) {
			aCustomPresets = aCustomPresets.filter(function (oPreset) {
				return oPreset.id !== oDeletePreset.id;
			});

			this.oModel.setProperty("/customPresets", aCustomPresets);
		}

		if (PresetsUtils.isPersistingAllowed()) {
			PresetsUtils.persistSelectionPresets();
			PresetsUtils.persistCustomPresets();
		}

		// deleting item fires tap event
		// for the next item in the list which needs to be suppressed
		if (iDeletedPresetIndex !== aPresets.length) {
			var oNextListItem = sap.ui.getCore().byId(sDeletedItemId),
				fnOntap = oNextListItem.ontap;

			oNextListItem.ontap = function() {
				oNextListItem.ontap = fnOntap;
			};
		}

	};

	/**
	 * Handles the return to default selection of system presets
	 * @param {sap.ui.base.Event} oEvent The event which was fired.
	 */
	PresetsController.prototype.onPresetItemReset = function (oEvent) {
		var sPath = oEvent.getSource().getBindingContext().getPath(),
			oPreset = this.oModel.getProperty(sPath),
			aPresets = oPreset.isSystemPreset ? PresetsUtils.getSystemPresets() : this.oModel.getProperty("/customPresets"),
			oCLI = oEvent.getSource().getParent().getParent().getParent();

		// We hide the focused item (the button), so we have to restore the focus manually,
		// because the ResponsivePopover can't restore it on Chrome.
		// This way the popover is kept open on all browsers, which provides consistency.
		oCLI.focus();

		aPresets.forEach(function (oInitialPreset) {
			if (oInitialPreset.id === oPreset.id) {
				this.oModel.setProperty(sPath + "/title", oInitialPreset.title);
				this.oModel.setProperty(sPath + "/selections", oInitialPreset.selections);
				this.oModel.setProperty(sPath + "/isModified", false);
			}
		}.bind(this));

		if (oPreset.selected) {
			this._applyPreset(oPreset);
		}
	};

	/**
	 * Opens the import dialog
	 */
	PresetsController.prototype.onImportPress = function () {
		if (!this._oImportDialog) {
			this._oImportDialog = Fragment.load({
				id: Constants.IMPORT_FRAGMENT_ID,
				name: "sap.ui.support.supportRules.ui.views.PresetImport",
				controller: this
			}).then(function (oImportDialog) {
				this.oView.addDependent(oImportDialog);
				return oImportDialog;
			}.bind(this));
		}

		this._oImportDialog.then(function (oImportDialog) {
			oImportDialog.open();
		});
	};

	/**
	 * Handles a change in the preset import file uploader
	 * @param {sap.ui.base.Event} oEvent The event which was fired.
	 */
	PresetsController.prototype.onImportFileChange = function (oEvent) {
		var oFile = oEvent.getSource(),
			/* global FileReader */
			oReader = new FileReader();

		if (!oFile.getValue()) {
			// the file was changed, but the new one is not valid (handled by onImportFileMismatch)
			return;
		}

		this._clearImportErrors();

		oReader.onloadend = this.onImportFileLoaded.bind(this);
		oReader.onerror = this.onImportFileError.bind(this);

		oReader.readAsText(oEvent.getParameter("files")[0], "UTF-8");
	};

	/**
	 * Handles the wrong file type
	 * @param {sap.ui.base.Event} oEvent The event which was fired.
	 */
	PresetsController.prototype.onImportFileMismatch = function (oEvent) {
		this._clearImportErrors();
		this._reportImportFileError(
			"Invalid file type \"" + oEvent.getParameter("mimeType") + "\". Please, import a valid \"application/json\" file.",
			oEvent.getParameter("fileName")
		);
	};

	/**
	 * Handles an error during file reading
	 * @param {ProgressEvent} oEvent The event which was fired.
	 */
	PresetsController.prototype.onImportFileError = function (oEvent) {
		this._reportImportFileError(
			"Error while reading file: \"" + oEvent.target.error + "\"."
		);
	};

	/**
	 * Processes the chosen file
	 * @param {ProgressEvent} oEvent The event which was fired.
	 */
	PresetsController.prototype.onImportFileLoaded = function (oEvent) {
		var oFileData = this._tryParseImportFile(oEvent.target.result);
		if (oFileData) {
			this._clearImportErrors();

			// ensure all imported presets have an id
			if (!oFileData.id) {
				oFileData.id = Utils.generateUuidV4();
			}

			// parse the date exported value, so it can be displayed
			if (oFileData.dateExported) {
				oFileData.dateExported = new Date(oFileData.dateExported);
			}

			this.oModel.setProperty("/currentImportData", oFileData);

			if (!this._isAlreadyImported(oFileData.id)) {
				Fragment.byId(Constants.IMPORT_FRAGMENT_ID, "importBtn").setEnabled(true);
			}
		}
	};

	/**
	 * Handles the pressing of the cancel button on import
	 */
	PresetsController.prototype.onImportCancelPress = function () {
		Fragment.byId(Constants.IMPORT_FRAGMENT_ID, "importDialog").close();
	};

	/**
	 * Handles the import of the current file
	 */
	PresetsController.prototype.onImportFinalizePress = function () {
		var oImportData = this.oModel.getProperty("/currentImportData"),
			sMessage = "";

		this._importPreset(oImportData);

		sMessage = "The Rule Preset \"" + oImportData.title + "\" was successfully imported.";
		if (!PresetsUtils.isPersistingAllowed()) {
			sMessage += " This import can be stored for your next visit if you check "
				+ "\"I agree to use local storage persistency\" from Support Assistant settings.";
		}

		Fragment.byId(Constants.IMPORT_FRAGMENT_ID, "importDialog").close();

		MessageToast.show(sMessage, { width: "50%" });
	};

	/**
	 * Handles the closing of the import dialog. Resets the form
	 */
	PresetsController.prototype.onImportDialogClose = function () {
		this._clearImportErrors();
		Fragment.byId(Constants.IMPORT_FRAGMENT_ID, "fileUpload").setValue(null);
		this.oModel.setProperty("/currentImportData", null);
		Fragment.byId(Constants.IMPORT_FRAGMENT_ID, "importBtn").setEnabled(false);
	};

	/**
	 * Exports the current selection preset
	 */
	PresetsController.prototype.onExportPress = function () {
		var oCurrentPreset = this.oModel.getProperty("/selectionPresetsCurrent");
		if (!oCurrentPreset.selections.length) {
			MessageBox.error(
				"Cannot export Rule Preset without selections."
			);
			return;
		}

		this.oModel.setProperty("/currentExportData", {
			"id": (oCurrentPreset.isMySelection || oCurrentPreset.isSystemPreset) ? "" : oCurrentPreset.id,
			"title": oCurrentPreset.title,
			"descriptionValue": oCurrentPreset.description, // there is an issue on build if we use ${description}
			"dateExportedForDisplay": new Date(), // the current date is shown as export date
			"isMySelection": oCurrentPreset.isMySelection
		});

		if (!this._oExportDialog) {
			this._oExportDialog = Fragment.load({
				id: Constants.EXPORT_FRAGMENT_ID,
				name: "sap.ui.support.supportRules.ui.views.PresetExport",
				controller: this
			}).then(function (oExportDialog) {
				this.oView.addDependent(oExportDialog);
				return oExportDialog;
			}.bind(this));
		}

		this._oExportDialog.then(function (oExportDialog) {
			oExportDialog.open();
		});
	};

	/**
	 * Initialized the export dialog's validations.
	 */
	PresetsController.prototype.initializeExportValidations = function () {
		var aInputs = this._getInputsToValidate();

		aInputs.forEach(function (oInput) {
			Fragment.byId(Constants.EXPORT_FRAGMENT_ID, oInput.id).attachChange(function (oEvent) {
				this._changeHandler(oEvent, oInput.validateMessage);
			}.bind(this));
		}, this);
	};

	/**
	 * Handle change of export input
	 * @param {sap.ui.base.Event} oEvent The change event
	 * @param {string} sValidateMessage Validation message for when the value exists but is not valid
	 */
	PresetsController.prototype._changeHandler = function (oEvent, sValidateMessage) {
		this._validateInput(oEvent.getSource(), sValidateMessage);
	};

	/**
	 * Validate all inputs
	 * @return {boolean} True if form is valid
	 */
	PresetsController.prototype._validateForm = function () {
		var bResult = true,
			aInputs = this._getInputsToValidate();

		aInputs.forEach(function (oInputValidationInfo) {
			var oInput = Fragment.byId(Constants.EXPORT_FRAGMENT_ID, oInputValidationInfo.id);
			if (!this._validateInput(oInput, oInputValidationInfo.validateMessage)) {
				bResult = false;
			}
		}, this);

		return bResult;
	};

	/**
	 * Validate the given export input
	 * @param {sap.m.Input} oInput The input to validated
	 * @param {string} sValidateMessage The error message
	 * @return {boolean} True if the input is valid
	 */
	PresetsController.prototype._validateInput = function (oInput, sValidateMessage) {
		var oBinding = oInput.getBinding("value"),
			sValueState = ValueState.None,
			bValid = true;

		try {
			if (oInput.getRequired() && !oInput.getValue().trim()) {
				throw {
					name: "RequiredException",
					message: oInput.getLabels()[0].getText() + " is required."
				};
			}

			if (oBinding && oBinding.getType()) {
				oBinding.getType().validateValue(oInput.getValue());
			}
		} catch (oException) {
			var sMessage = oException.message;
			if (oException.name === "ValidateException" && sValidateMessage) {
				sMessage = sValidateMessage;
			}
			oInput.setValueStateText(sMessage);
			sValueState = ValueState.Error;
			bValid = false;
		}

		oInput.setValueState(sValueState);

		return bValid;
	};

	/**
	 * Get list of inputs to be validated.
	 * @return {array} List of inputs to be validated
	 */
	PresetsController.prototype._getInputsToValidate = function () {
		return [
			{
				id: "title"
			},
			{
				id: "presetId",
				validateMessage: "Invalid value. Possible characters are: a-z A-Z 0-9 - . _"
			}
		];
	};

	/**
	 * Clear all error value states from export form.
	 */
	PresetsController.prototype._clearValidationState = function () {
		var aInputs = this._getInputsToValidate();
		aInputs.forEach(function (oInput) {
			Fragment.byId(Constants.EXPORT_FRAGMENT_ID, oInput.id).setValueState(ValueState.None);
		});
	};

	/**
	 * Cancels an export
	 */
	PresetsController.prototype.onExportCancelPress = function () {
		Fragment.byId(Constants.EXPORT_FRAGMENT_ID, "exportDialog").close();
	};

	/**
	 * Finalizes an export - sends the file to the user
	 */
	PresetsController.prototype.onExportFinalizePress = function () {
		var id = Fragment.byId(Constants.EXPORT_FRAGMENT_ID, "presetId").getValue(),
			title = Fragment.byId(Constants.EXPORT_FRAGMENT_ID, "title").getValue(),
			description = Fragment.byId(Constants.EXPORT_FRAGMENT_ID, "description").getValue();

		if (!this._validateForm()) {
			return;
		}

		if (!id) {
			id = Utils.generateUuidV4();
		}

		PresetsUtils.exportSelectionsToFile(
			id,
			title,
			description,
			SelectionUtils.getSelectedRules()
		);

		MessageToast.show("The Rule Preset \"" + title + "\" was successfully exported.", {width: "50%"});
		Fragment.byId(Constants.EXPORT_FRAGMENT_ID, "exportDialog").close();
	};

	/**
	 * Opens the documentation
	 */
	PresetsController.prototype.openHelp = function () {
		Documentation.openTopic("3fc864acf926406194744375aa464fe7");
	};

	/**
	 * Shows an error related to the import file
	 * @private
	 * @param {string} sMessage The error message
	 * @param {string} [sErrorFileName] Pass a file name related to the error
	 */
	PresetsController.prototype._reportImportFileError = function (sMessage, sErrorFileName) {
		var oError = Fragment.byId(Constants.IMPORT_FRAGMENT_ID, "fileError"),
			oFileUpload = Fragment.byId(Constants.IMPORT_FRAGMENT_ID, "fileUpload"),
			oFileName = Fragment.byId(Constants.IMPORT_FRAGMENT_ID, "fileName"),
			oImportBtn = Fragment.byId(Constants.IMPORT_FRAGMENT_ID, "importBtn");

		oError.setText(sMessage)
			.setVisible(true);

		oFileName.addStyleClass("sapUiSupportToolError");

		this.oModel.setProperty("/currentImportData", {
			fileName: sErrorFileName || oFileUpload.getValue()
		});

		oImportBtn.setEnabled(false);
	};

	/**
	 * Validates if the import preset is already imported
	 * @private
	 * @param {string} sPresetId The ID of the preset to be imported
	 * @return {boolean} True if already imported
	 */
	PresetsController.prototype._isAlreadyImported = function (sPresetId) {
		var aPresets = this.oModel.getProperty("/selectionPresets"),
			bExists = aPresets.some(function (oPreset) { return oPreset.id === sPresetId; });

		if (bExists) {
			Fragment.byId(Constants.IMPORT_FRAGMENT_ID, "duplicateIdError")
				.setText("A preset with ID '" + sPresetId + "' is already imported.")
				.setVisible(true);
			Fragment.byId(Constants.IMPORT_FRAGMENT_ID, "presetId").addStyleClass("sapUiSupportToolError");
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Hides the last error for the import file
	 * @private
	 */
	PresetsController.prototype._clearImportErrors = function () {
		Fragment.byId(Constants.IMPORT_FRAGMENT_ID, "fileError")
			.setText("")
			.setVisible(false);
		Fragment.byId(Constants.IMPORT_FRAGMENT_ID, "fileName").removeStyleClass("sapUiSupportToolError");

		Fragment.byId(Constants.IMPORT_FRAGMENT_ID, "duplicateIdError")
			.setText("")
			.setVisible(false);
		Fragment.byId(Constants.IMPORT_FRAGMENT_ID, "presetId").removeStyleClass("sapUiSupportToolError");
	};

	/**
	 * Tries to parse and validate the import file. Reports any errors
	 * @private
	 * @param {string} sFileContent The content of the chosen json file
	 * @return {Object|boolean} False if parsing fails. File data if parsing succeeds
	 */
	PresetsController.prototype._tryParseImportFile = function (sFileContent) {
		var oFileData = {};
		var invalidFileMsg = "The file cannot be uploaded. Please, choose an \"application/json\" file exported from the Support Assistant.";

		try {
			oFileData = JSON.parse(sFileContent);
		} catch (oErr) {
			this._reportImportFileError(invalidFileMsg);
			return false;
		}

		var aErrors = [];
		if (!PresetsUtils.isValidSelectionImport(oFileData, aErrors)) {
			this._reportImportFileError(invalidFileMsg);
			return false;
		}

		oFileData.fileName = Fragment.byId(Constants.IMPORT_FRAGMENT_ID, "fileUpload").getValue();

		return oFileData;
	};

	/**
	 * Makes an import of a preset. Selects the newly imported preset
	 * @private
	 * @param {Object} oImportData A valid preset import data
	 */
	PresetsController.prototype._importPreset = function (oImportData) {
		var aSelectedPresets = this.oModel.getProperty("/selectionPresets"),
			aCustomPresets = this.oModel.getProperty("/customPresets");

		// do not import all data, only import what is expected to stay in the model
		var oPresetOptions = {
			"id": oImportData.id,
			"title": oImportData.title,
			"description": oImportData.description,
			"dateExported": oImportData.dateExported,
			"version": oImportData.version,
			"selections": oImportData.selections
		};

		aSelectedPresets.forEach(function (oDeselectPreset) {
			oDeselectPreset.selected = false;
		});

		oPresetOptions.selected = true;
		oPresetOptions.isCustomPreset = true;

		aSelectedPresets.push(oPresetOptions);

		// keep the original version of the preset
		aCustomPresets.push(deepExtend({}, oPresetOptions));

		if (PresetsUtils.isPersistingAllowed()) {
			PresetsUtils.persistCustomPresets();
		}

		this._applyPreset(oPresetOptions);
	};

	/**
	 * Applies the rules selection from the given preset
	 * @private
	 * @param {Object} oPresetOptions A valid preset options object
	 */
	PresetsController.prototype._applyPreset = function (oPresetOptions) {
		this.oModel.setProperty("/selectionPresetsCurrent", oPresetOptions);

		SelectionUtils.setSelectedRules(oPresetOptions.selections);

		if (PresetsUtils.isPersistingAllowed()) {
			PresetsUtils.persistSelectionPresets();
		}
	};

	/**
	 * Determines preset group according to its properties
	 * @param {object} oContext Current preset
	 * @returns {string} Title of the group
	 * @public
	 */
	PresetsController.prototype.grouper = function (oContext) {
		if (oContext.getProperty("isSystemPreset")) {
			return Constants.PRESET_GROUP_SYSTEM;
		}

		if (oContext.getProperty("isCustomPreset")) {
			return Constants.PRESET_GROUP_CUSTOM;
		}

		return Constants.PRESET_GROUP_NONE;
	};

	/**
	 * Factory for creating list group header objects for the presets list.
	 * @param {Object} oGroup - group data passed from the list model binding
	 * @returns {sap.m.GroupHeaderListItem} Group header control
	 * @public
	 */
	PresetsController.prototype.getGroupHeader = function (oGroup) {
		var bVisible = !(oGroup.key === Constants.PRESET_GROUP_NONE);

		return new GroupHeaderListItem({
			title: oGroup.key,
			visible: bVisible
		}).addStyleClass("sapUiSupportToolGHLI");
	};

	return PresetsController;
});