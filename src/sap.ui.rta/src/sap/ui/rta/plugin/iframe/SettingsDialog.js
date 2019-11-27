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
	"sap/ui/rta/plugin/iframe/SettingsDialogController",
	"sap/ui/fl/util/getContainerUserInfo"
], function (
	Log,
	ManagedObject,
	Fragment,
	coreLibrary,
	JSONModel,
	RtaUtils,
	SettingsDialogController,
	getContainerUserInfo
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
				value: undefined,
				valueState: ValueState.None
			},
			frameWidthUnit: {
				value: "%"
			},
			frameHeight: {
				value: undefined,
				valueState: ValueState.None
			},
			frameHeightUnit: {
				value: "%"
			},
			frameUrl: {
				value: "",
				valueState: ValueState.None
			},
			urlBuilderParameters: {
				value: []
			},
			unitsOfMeasure: [{
				name: "%"
			}, {
				name: "px"
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

	/**
	 * Helper to extract current context URL parameters for the URL builder
	 *
	 * @param {sap.ui.base.ManagedObject} oObject - Managed object to extract the context from
	 * @return {array} Parameters array for URL builder exposed by the settings dialog
	 */
	SettingsDialog.buildUrlBuilderParametersFor = function (oObject) {
		var oUserInfo = getContainerUserInfo();
		var oUserParameters = Object.keys(oUserInfo)
			.map(function (sUserSetting) {
				return {
					label: sUserSetting,
					key: "{$user>/" + sUserSetting + "}",
					value: oUserInfo[sUserSetting]
				};
			});
		var oBindingContext = oObject.getBindingContext();
		var oDefaultBoundObjectParameters;
		if (oBindingContext) {
			var oDefaultBoundObject = oBindingContext.getObject();
			oDefaultBoundObjectParameters = Object.keys(oDefaultBoundObject)
				.filter(function (sProperty) {
					return typeof oDefaultBoundObject[sProperty] !== "object";
				})
				.map(function (sProperty) {
					return {
						label: sProperty,
						key: "{" + sProperty + "}",
						value: oDefaultBoundObject[sProperty]
					};
				});
		} else {
			oDefaultBoundObjectParameters = [];
		}
		return oUserParameters.concat(oDefaultBoundObjectParameters);
	};

	return SettingsDialog;
});
