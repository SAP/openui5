/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Fragment",
	"sap/ui/core/ValueState",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/plugin/iframe/controller/SettingsDialogController"
], function (
	ManagedObject,
	Fragment,
	ValueState,
	JSONModel,
	SettingsDialogController
) {
	"use strict";

	var _oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
	var _mText = {
		dialogTitle: _oTextResources.getText("IFRAME_SETTINGS_DIALOG_TITLE"),
		sectionTitle: _oTextResources.getText("IFRAME_SETTINGS_DIALOG_SECTION_TITLE"),
		newSectionLabel: _oTextResources.getText("IFRAME_SETTINGS_DIALOG_NEW_SECTION_LABEL"),
		nameLabel: _oTextResources.getText("IFRAME_SETTINGS_DIALOG_NAME_LABEL"),
		sizeTitle: _oTextResources.getText("IFRAME_SETTINGS_DIALOG_SIZE_TITLE"),
		widthLabel: _oTextResources.getText("IFRAME_SETTINGS_DIALOG_WIDTH_LABEL"),
		heigthLabel: _oTextResources.getText("IFRAME_SETTINGS_DIALOG_HEIGTH_LABEL"),
		sizeWarning: _oTextResources.getText("IFRAME_SETTINGS_DIALOG_SIZE_WARNING"),
		urlTitle: _oTextResources.getText("IFRAME_SETTINGS_DIALOG_URL_TITLE"),
		OKText: _oTextResources.getText("BTN_FREP_OK"),
		cancelText: _oTextResources.getText("BTN_FREP_CANCEL")
	};

	function _createJSONModel() {
		return new JSONModel({
			text: _mText,
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
			frameHeigth: {
				value: "",
				valueState: ValueState.None
			},
			frameHeigthUnit: {
				value: "px"
			},
			frameUrl: {
				value: "",
				valueState: ValueState.None
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
	 * @since 1.72
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
	 * @returns {Promise} empty promise
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
			name: "sap.ui.rta.view.SettingsDialog",
			controller: this._oController
		}).then(function (oSettingsDialog) {
			this._oDialog = oSettingsDialog;
			this._oDialog.setModel(this._oJSONModel);
			this._openDialog();
		}.bind(this));
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
			this._oDialog = undefined;
			this._fnResolve(this._oController.getSettings());
		}.bind(this));

		this._oDialog.open();
	};

	return SettingsDialog;
}, /* bExport= */ false);