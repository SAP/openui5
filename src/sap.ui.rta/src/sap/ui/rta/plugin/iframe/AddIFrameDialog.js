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
	"sap/ui/rta/plugin/iframe/AddIFrameDialogController",
	"sap/ui/fl/util/getContainerUserInfo"
], function(
	Log,
	ManagedObject,
	Fragment,
	coreLibrary,
	JSONModel,
	RtaUtils,
	AddIFrameDialogController,
	getContainerUserInfo
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;
	var _oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
	var _sDocumentationURL = "https://help.sap.com/viewer/4fc8d03390c342da8a60f8ee387bca1a/latest/en-US/8db25610e91342919fcf63d4e5868ae9.html";
	var _sDocumentationHTML = _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_URL_WARNING_TEXT") + " (" + "<a href=" + _sDocumentationURL + ">" + _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_URL_WARNING_LINKTEXT") + "</a>" + ")";
	var _mText = {
		dialogTitle: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_TITLE"),
		dialogCreateTitle: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_TITLE"),
		dialogUpdateTitle: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_UPDATE_TITLE"),
		sizeTitle: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_SIZE_TITLE"),
		widthLabel: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_WIDTH_LABEL"),
		widthUnitLabel: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_WIDTH_UNITLABEL"),
		heightLabel: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_HEIGHT_LABEL"),
		heightUnitLabel: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_HEIGHT_UNITLABEL"),
		percentUseLabel: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_PERCENT_USED"),
		saveText: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_BUTTON_SAVE"),
		cancelText: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_BUTTON_CANCEL"),
		previewUrlLabel: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_PREVIEW_URL_LABEL"),
		previewUrlMessage: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_BUTTON_PREVIEW_MESSAGE"),
		previewButtonText: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_BUTTON_SHOW_PREVIEW"),
		showPreviewButton: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_BUTTON_SHOW_PREVIEW"),
		updatePreviewButton: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_BUTTON_UPDATE_PREVIEW"),
		previewFrameLabel: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_PREVIEW_FRAME_LABEL"),
		parameterSearchLabel: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_PARAMETER_SEARCH_LABEL"),
		editUrlLabel: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_EDIT_URL_LABEL"),
		parametersLabel: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_PARAMETERS_LABEL"),
		columnParameterLabel: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_TABLE_PARAMETER_LABEL"),
		columnUiValueLabel: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_TABLE_UI_VALUE_LABEL")
	};

	function createJSONModel(bSetUpdateTitle) {
		if (bSetUpdateTitle) {
			_mText.dialogTitle = _mText.dialogUpdateTitle;
		} else {
			_mText.dialogTitle = _mText.dialogCreateTitle;
		}
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
				value: 100,
				valueState: ValueState.None,
				id: "sapUiRtaAddIFrameDialog_WidthInput"
			},
			frameWidthUnit: {
				value: "%"
			},
			frameHeight: {
				value: 100,
				valueState: ValueState.None,
				id: "sapUiRtaAddIFrameDialog_HeightInput"
			},
			frameHeightUnit: {
				value: "%"
			},
			frameUrl: {
				value: "",
				valueState: ValueState.None
			},
			previewUrl: { value: "" },
			documentationLink: {
				HTML: _sDocumentationHTML
			},
			parameters: { value: [] },
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
	 * Constructor for a new sap.ui.rta.plugin.IFrame.AddIFrameDialog control.
	 *
	 * @class Context - Dialog for IFrame settings in Runtime Authoring
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.78
	 * @alias sap.ui.rta.plugin.iframe.AddIFrameDialog
	 */
	var AddIFrameDialog = ManagedObject.extend("sap.ui.rta.plugin.iframe.AddIFrameDialog", {
		metadata: {
			library: "sap.ui.rta",
			events: {
				opened: {}
			}
		}
	});

	/**
	 * Open the Add IFrame Dialog
	 *
	 * @param {object|undefined} mSettings - existing IFrame settings
	 * @returns {Promise} promise resolving to IFrame settings
	 * @public
	 */
	AddIFrameDialog.prototype.open = function(mSettings) {
		return new Promise(function(resolve) {
			this._fnResolve = resolve;
			this._createDialog(mSettings);
		}.bind(this));
	};

	/**
	 * Create the Add IFrame Dialog
	 *
	 * @param {object|undefined} mSettings - existing IFrame settings
	 * @private
	 */
	AddIFrameDialog.prototype._createDialog = function(mSettings) {
		// set the correct title
		var bSetUpdateTitle = false;
		if (mSettings) {
			bSetUpdateTitle = mSettings.updateMode ? mSettings.updateMode : false;
		}
		this._oJSONModel = createJSONModel(bSetUpdateTitle);
		this._oController = new AddIFrameDialogController(this._oJSONModel, mSettings);
		Fragment.load({
			name: "sap.ui.rta.plugin.iframe.AddIFrameDialog",
			controller: this._oController
		}).then(function(oAddIFrameDialog) {
			this._oDialog = oAddIFrameDialog;
			this._oDialog.addStyleClass(RtaUtils.getRtaStyleClassName());
			this._oDialog.setModel(this._oJSONModel);
			this._openDialog();
		}.bind(this)).catch(function(oError) {
			Log.error("Error loading fragment sap.ui.rta.plugin.iframe.AddIFrameDialog: ", oError);
		});
	};

	/**
	 * Open and set up Add IFrame Dialog
	 *
	 * @private
	 */
	AddIFrameDialog.prototype._openDialog = function() {
		this._oDialog.attachAfterOpen(function() {
			this._disablePanelExpand();
			this.fireOpened();
		}.bind(this));

		this._oDialog.attachAfterClose(function() {
			this._oDialog.destroy();
			this._oDialog = null;
			this._fnResolve(this._oController.getSettings());
			this._oController = null;
		}.bind(this));

		this._oDialog.open();
	};

	/**
	 * Disables the opening of the Panel at start
	 *
	 * @private
	 */
	AddIFrameDialog.prototype._disablePanelExpand = function() {
		var oPanelButton = sap.ui.getCore().byId("sapUiRtaAddIFrameDialog_PreviewLinkPanel").getDependents()[0];
		if (oPanelButton) {
			oPanelButton.setEnabled(false);
		}
	};

	/**
	 * Helper to extract current context URL parameters for the URL builder
	 *
	 * @param {sap.ui.base.ManagedObject} oObject - Managed object to extract the context from
	 * @return {Promise<object[]>} Resolving to parameters array for URL builder exposed by the Add IFrame dialog
	 */
	AddIFrameDialog.buildUrlBuilderParametersFor = function(oObject) {
		return getContainerUserInfo()
			.then(function(oUserInfo) {
				var oUserParameters = Object.keys(oUserInfo)
					.map(function(sUserSetting) {
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
						.filter(function(sProperty) {
							return typeof oDefaultBoundObject[sProperty] !== "object";
						})
						.map(function(sProperty) {
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
			});
	};

	return AddIFrameDialog;
});
