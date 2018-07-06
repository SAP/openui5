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
	"sap/ui/support/supportRules/ui/models/Documentation"
], function (BaseController, SelectionUtils, PresetsUtils, Fragment, MessageToast, MessageBox, Documentation) {
	"use strict";

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
		IMPORT_FRAGMENT_ID: "presetImport"
	};

	/**
	 * Controller for selection presets
	 *
	 * @class Provides methods for switching presets and for import/export of presets
	 *
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @alias sap.ui.support.supportRules.ui.models.PresetsController
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
			this._oPresetsPopover = sap.ui.xmlfragment(
				Constants.SELECT_FRAGMENT_ID,
				"sap.ui.support.supportRules.ui.views.Presets",
				this
			);
			this.oView.addDependent(this._oPresetsPopover);
		}

		if (!this._oPresetsPopover.isOpen()) {
			// set correct focus in the popover
			this._oPresetsPopover.setInitialFocus(
				Fragment.byId(Constants.SELECT_FRAGMENT_ID, "select").getSelectedItem().getId()
			);

			this._oPresetsPopover.openBy(oBtn);
		} else {
			this._oPresetsPopover.close();
		}
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
		this._oPresetsPopover.close();
	};

	/**
	 * Handles the deletion of a preset item from the variant select
	 * @param {sap.ui.base.Event} oEvent The event which was fired.
	 */
	PresetsController.prototype.onPresetItemDelete = function (oEvent) {
		var sPath = oEvent.getSource().getBindingContext().getPath(),
			oDeletePreset = this.oModel.getProperty(sPath);

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

		PresetsUtils.persistSelectionPresets();

		this.oModel.setProperty("/selectionPresets", aPresets);
	};

	/**
	 * Opens the import dialog
	 */
	PresetsController.prototype.onImportPress = function () {
		if (!this._oImportDialog) {
			this._oImportDialog = sap.ui.xmlfragment(
				Constants.IMPORT_FRAGMENT_ID,
				"sap.ui.support.supportRules.ui.views.PresetImport",
				this
			);
			this.oView.addDependent(this._oImportDialog);
		}

		this._oImportDialog.open();
	};

	/**
	 * Handles a change in the preset import file uploader
	 * @param {sap.ui.base.Event} oEvent The event which was fired.
	 */
	PresetsController.prototype.onImportFileChange = function (oEvent) {
		var oFile = Fragment.byId(Constants.IMPORT_FRAGMENT_ID, "fileUpload"),
			/* global FileReader */
			oReader = new FileReader();

		if (!oFile.getValue()) {
			// the file was changed, but the new one is not valid (handled by onImportFileMismatch)
			return;
		}

		oReader.onloadend = this.onImportFileLoaded.bind(this);
		oReader.onerror = this.onImportFileError.bind(this);

		oReader.readAsText(oEvent.oSource.oFileUpload.files[0], "UTF-8");
	};

	/**
	 * Handles the wrong file type
	 * @param {sap.ui.base.Event} oEvent The event which was fired.
	 */
	PresetsController.prototype.onImportFileMismatch = function (oEvent) {
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
			this._clearImportFileError();

			// parse the date exported value, so it can be displayed
			if (oFileData.dateExported) {
				oFileData.dateExported = new Date(oFileData.dateExported);
			}

			this.oModel.setProperty("/currentImportData", oFileData);
			Fragment.byId(Constants.IMPORT_FRAGMENT_ID, "importBtn").setEnabled(true);
		}
	};

	/**
	 * Handles the pressing of the cancel button on import
	 */
	PresetsController.prototype.onImportCancelPress = function () {
		this._oImportDialog.close();
	};

	/**
	 * Handles the import of the current file
	 */
	PresetsController.prototype.onImportFinalizePress = function () {
		var oPresetOptions = this.oModel.getProperty("/currentImportData");

		this._importPreset(oPresetOptions);

		var successMessage = "The Rule Preset \"" + oPresetOptions.title + "\" was successfully imported.";
		if (!PresetsUtils.isPersistingAllowed()) {
			successMessage += " This import can be stored for your next visit if you check "
				+ "\"I agree to use local storage persistency\" from Support Assistant settings.";
		}
		MessageToast.show(successMessage, {width: "50%"});

		this._oImportDialog.close();
	};

	/**
	 * Handles the closing of the import dialog. Resets the form
	 */
	PresetsController.prototype.onImportDialogClose = function () {
		this._clearImportFileError();
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
			"title": oCurrentPreset.title,
			"descriptionValue": oCurrentPreset.description, // there is an issue on build if we use ${description}
			"dateExportedForDisplay": new Date(), // the current date is shown as export date
			"isMySelection": oCurrentPreset.isMySelection
		});

		if (!this._oExportDialog) {
			this._oExportDialog = sap.ui.xmlfragment(
				Constants.EXPORT_FRAGMENT_ID,
				"sap.ui.support.supportRules.ui.views.PresetExport",
				this
			);
			this.oView.addDependent(this._oExportDialog);
		}

		this._oExportDialog.open();
	};

	/**
	 * Cancels an export
	 */
	PresetsController.prototype.onExportCancelPress = function () {
		this._oExportDialog.close();
	};

	/**
	 * Finalizes an export - sends the file to the user
	 */
	PresetsController.prototype.onExportFinalizePress = function () {
		var title = Fragment.byId(Constants.EXPORT_FRAGMENT_ID, "title").getValue(),
			description = Fragment.byId(Constants.EXPORT_FRAGMENT_ID, "description").getValue();

		PresetsUtils.exportSelectionsToFile(
			title,
			description,
			SelectionUtils.getSelectedRules()
		);

		MessageToast.show("The Rule Preset \"" + title + "\" was successfully exported.", {width: "50%"});

		this._oExportDialog.close();
	};

	/**
	 * Opens the documentation
	 */
	PresetsController.prototype.openHelp = function () {
		Documentation.openTopic("3fc864acf926406194744375aa464fe7"); //@todo put the correct topic id
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
	 * Hides the last error for the import file
	 * @private
	 */
	PresetsController.prototype._clearImportFileError = function () {
		Fragment.byId(Constants.IMPORT_FRAGMENT_ID, "fileError")
			.setText("")
			.setVisible(false);

		Fragment.byId(Constants.IMPORT_FRAGMENT_ID, "fileName").removeStyleClass("sapUiSupportToolError");
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
	 * @param {Object} oPresetOptions A valid preset options object
	 */
	PresetsController.prototype._importPreset = function (oPresetOptions) {
		var aPresets = this.oModel.getProperty("/selectionPresets");

		aPresets.forEach(function (oDeselectPreset) {
			oDeselectPreset.selected = false;
		});
		oPresetOptions.selected = true;

		aPresets.push(oPresetOptions);

		this._applyPreset(oPresetOptions);

		if (PresetsUtils.isPersistingAllowed) {
			PresetsUtils.persistSelectionPresets();
		}
	};

	/**
	 * Applies the rules selection from the given preset
	 * @private
	 * @param {Object} oPresetOptions A valid preset options object
	 */
	PresetsController.prototype._applyPreset = function (oPresetOptions) {
		this.oModel.setProperty("/selectionPresetsCurrent", oPresetOptions);

		SelectionUtils.setSelectedRules(oPresetOptions.selections);
	};

	return PresetsController;
});