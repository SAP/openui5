/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Fragment",
	"sap/ui/core/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/Utils",
	"sap/ui/rta/plugin/iframe/SettingsDialogController"
], function (
	Log,
	ManagedObject,
	Fragment,
	coreLibrary,
	JSONModel,
	RtaUtils,
	SettingsDialogController
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	var _oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
	var _mText = {
		dialogTitle: _oTextResources.getText("IFRAME_SETTINGS_DIALOG_TITLE"),
		sectionTitle: _oTextResources.getText("IFRAME_SETTINGS_DIALOG_SECTION_TITLE"),
		newSectionLabel: _oTextResources.getText("IFRAME_SETTINGS_DIALOG_NEW_SECTION_LABEL"),
		nameLabel: _oTextResources.getText("IFRAME_SETTINGS_DIALOG_NAME_LABEL"),
		sizeTitle: _oTextResources.getText("IFRAME_SETTINGS_DIALOG_SIZE_TITLE"),
		widthLabel: _oTextResources.getText("IFRAME_SETTINGS_DIALOG_WIDTH_LABEL"),
		heightLabel: _oTextResources.getText("IFRAME_SETTINGS_DIALOG_HEIGHT_LABEL"),
		sizeWarning: _oTextResources.getText("IFRAME_SETTINGS_DIALOG_SIZE_WARNING"),
		urlTitle: _oTextResources.getText("IFRAME_SETTINGS_DIALOG_URL_TITLE"),
		saveText: _oTextResources.getText("IFRAME_SETTINGS_DIALOG_BUTTON_SAVE"),
		cancelText: _oTextResources.getText("IFRAME_SETTINGS_DIALOG_BUTTON_CANCEL"),
		urlBuilderText: _oTextResources.getText("IFRAME_SETTINGS_DIALOG_BUTTON_URL_BUILDER")
	};

	function _createJSONModel() {
		return new JSONModel({
			text: _mText,
			section: {
				visible: false
			},
			asNewSection: {
				value: false
			},
			sectionName: {
				value: "",
				valueState: ValueState.None
			},
			frameWidth: {
				value: "",
				valueState: ValueState.None
			},
			frameWidthUnit: {
				value: "px"
			},
			frameHeight: {
				value: "",
				valueState: ValueState.None
			},
			frameHeightUnit: {
				value: "px"
			},
			frameUrl: {
				value: "",
				valueState: ValueState.None
			},
			urlBuilderParameters: {
				value: []
			},
			unitsOfMeasure: [{
				name: "px"
			}, {
				name: "%"
			}, {
				name: "rem"
			}]
		});
	}

	/**
	 * Constructor for a new sap.ui.rta.plugin.iframe.SettingsDialog control.
	 *
	 * @class Context - Dialog for iFrame settings in Runtime Authoring
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.74
	 * @alias sap.ui.rta.plugin.iframe.SettingsDialog
	 */
	var SettingsDialog = ManagedObject.extend("sap.ui.rta.plugin.iframe.SettingsDialog", {
		metadata: {
			library: "sap.ui.rta",
			events: {
				opened: {}
			}
		}
	});

	/**
	 * Open the Settings Dialog
	 *
	 * @param {object|undefined} mSettings - existing iframe settings
	 * @returns {Promise} promise resolving to iframe settings
	 * @public
	 */
	SettingsDialog.prototype.open = function (mSettings) {
		return new Promise(function (resolve) {
			this._fnResolve = resolve;
			this._createDialog(mSettings);
		}.bind(this));
	};

	/**
	 * Create the Settings Dialog
	 *
	 * @param {object|undefined} mSettings - existing iframe settings
	 * @private
	 */
	SettingsDialog.prototype._createDialog = function (mSettings) {
		this._oJSONModel = _createJSONModel();
		this._oController = new SettingsDialogController(this._oJSONModel, mSettings);
		Fragment.load({
			name: "sap.ui.rta.plugin.iframe.SettingsDialog",
			controller: this._oController
		}).then(function (oSettingsDialog) {
			this._oDialog = oSettingsDialog;
			this._oDialog.addStyleClass(RtaUtils.getRtaStyleClassName());
			this._oDialog.setModel(this._oJSONModel);
			this._openDialog();
		}.bind(this)).catch(function (oError) {
			Log.error("Error loading fragment sap.ui.rta.plugin.iframe.SettingsDialog: ", oError);
		});
	};

	/**
	 * Open and set up Settings Dialog
	 *
	 * @private
	 */
	SettingsDialog.prototype._openDialog = function () {
		this._oDialog.attachAfterOpen(function () {
			this.fireOpened();
		}.bind(this));

		this._oDialog.attachAfterClose(function () {
			this._oDialog.destroy();
			this._oDialog = null;
			this._fnResolve(this._oController.getSettings());
			this._oController = null;
		}.bind(this));

		this._oDialog.open();
	};

	return SettingsDialog;
}, /* bExport= */ false);