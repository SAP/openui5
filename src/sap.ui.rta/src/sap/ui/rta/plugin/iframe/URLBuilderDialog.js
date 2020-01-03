/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/Utils",
	"sap/ui/rta/plugin/iframe/URLBuilderDialogController"
], function (
	Log,
	ManagedObject,
	Fragment,
	JSONModel,
	RtaUtils,
	URLBuilderDialogController
) {
	"use strict";

	var _oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
	var _mText = {
		dialogTitle: _oTextResources.getText("IFRAME_URLBUILDER_DIALOG_TITLE"),
		urlTitle: _oTextResources.getText("IFRAME_URLBUILDER_DIALOG_URL_TITLE"),
		previewUrlLabel: _oTextResources.getText("IFRAME_URLBUILDER_DIALOG_PREVIEW_URL_LABEL"),
		showPreviewButton: _oTextResources.getText("IFRAME_URLBUILDER_DIALOG_BUTTON_SHOW_PREVIEW"),
		editUrlLabel: _oTextResources.getText("IFRAME_URLBUILDER_DIALOG_EDIT_URL_LABEL"),
		parametersLabel: _oTextResources.getText("IFRAME_URLBUILDER_DIALOG_PARAMETERS_LABEL"),
		columnParameterLabel: _oTextResources.getText("IFRAME_URLBUILDER_DIALOG_TABLE_PARAMETER_LABEL"),
		columnUiValueLabel: _oTextResources.getText("IFRAME_URLBUILDER_DIALOG_TABLE_UI_VALUE_LABEL"),
		saveText: _oTextResources.getText("IFRAME_URLBUILDER_DIALOG_BUTTON_SAVE"),
		cancelText: _oTextResources.getText("IFRAME_URLBUILDER_DIALOG_BUTTON_CANCEL")
	};

	function _createJSONModel() {
		return new JSONModel({
			text: _mText,
			previewUrl: { value: "" },
			parameters: { value: [] },
			editURL: { value: "" }
		});
	}

	/**
	 * Constructor for a new sap.ui.rta.plugin.iframe.URLBuilderDialog control.
	 *
	 * @class Context - Dialog for iFrame settings in Runtime Authoring
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.74
	 * @alias sap.ui.rta.plugin.iframe.URLBuilderDialog
	 */
	var URLBuilderDialog = ManagedObject.extend("sap.ui.rta.plugin.iframe.URLBuilderDialog", {
		metadata: {
			library: "sap.ui.rta",
			events: {
				opened: {},
				closed: {}
			}
		}
	});

	/**
	 * Open URL Builder Dialog
	 *
	 * @param {object|undefined} mParameters - URL parameters
	 * @returns {Promise} Promise resolving to the built URL
	 * @public
	 */
	URLBuilderDialog.prototype.open = function (mParameters) {
		return new Promise(function (resolve) {
			this._fnResolve = resolve;
			this._createDialog(mParameters);
		}.bind(this));
	};

	/**
	 * Create Builder Dialog
	 *
	 * @param {object|undefined} mParameters - URL parameters
	 * @private
	 */
	URLBuilderDialog.prototype._createDialog = function (mParameters) {
		this._oJSONModel = _createJSONModel();
		this._oController = new URLBuilderDialogController(this._oJSONModel, mParameters);
		Fragment.load({
			name: "sap.ui.rta.plugin.iframe.URLBuilderDialog",
			controller: this._oController
		}).then(function (oURLBuilderDialog) {
			this._oDialog = oURLBuilderDialog;
			this._oDialog.addStyleClass(RtaUtils.getRtaStyleClassName());
			this._oDialog.setModel(this._oJSONModel);
			this._openDialog();
		}.bind(this)).catch(function (oError) {
			Log.error("Error loading fragment sap.ui.rta.plugin.iframe.URLBuilderDialog: ", oError);
		});
	};

	/**
	 * Open and set up URL Builder Dialog
	 *
	 * @private
	 */
	URLBuilderDialog.prototype._openDialog = function () {
		this._oDialog.attachAfterOpen(function () {
			this.fireOpened();
		}.bind(this));

		this._oDialog.attachAfterClose(function () {
			var sURL = this._oController.getURL();
			this._oDialog.destroy();
			this._oDialog = null;
			this._fnResolve(sURL);
			this._oController = null;
			this.fireClosed({ url: sURL });
		}.bind(this));

		this._oDialog.open();
	};

	return URLBuilderDialog;
});