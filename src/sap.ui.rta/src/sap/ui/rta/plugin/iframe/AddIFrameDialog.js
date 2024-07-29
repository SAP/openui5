/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Fragment",
	"sap/ui/core/library",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/Utils",
	"sap/ui/rta/plugin/iframe/AddIFrameDialogController",
	"sap/ui/fl/util/getContainerUserInfo"
], function(
	Log,
	ManagedObject,
	Fragment,
	coreLibrary,
	Element,
	Lib,
	JSONModel,
	RtaUtils,
	AddIFrameDialogController,
	getContainerUserInfo
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var {ValueState} = coreLibrary;
	var _oTextResources = Lib.getResourceBundleFor("sap.ui.rta");
	var _sDocumentationURL = "https://help.sap.com/docs/search?q=Embedding%20Content%20%28Object%20Pages%29";
	var _sDocumentationHTML = `${_oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_URL_WARNING_TEXT")} (` + `<a href=${_sDocumentationURL}>${_oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_URL_WARNING_LINKTEXT")}</a>` + `)`;
	var _mText = {
		dialogTitle: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_TITLE"),
		dialogCreateTitle: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_TITLE"),
		dialogUpdateTitle: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_UPDATE_TITLE"),
		sizeTitle: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_SIZE_TITLE"),
		widthLabel: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_WIDTH_LABEL"),
		widthUnitLabel: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_WIDTH_UNITLABEL"),
		heightLabel: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_HEIGHT_LABEL"),
		heightUnitLabel: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_HEIGHT_UNITLABEL"),
		dimensionsErrorText: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_DIMENSIONS_ERROR"),
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
		columnUiValueLabel: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_TABLE_UI_VALUE_LABEL"),
		containerTitleLabel: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_CONTAINER_TITLE_LABEL"),
		containerTitleDefaultValue: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_CONTAINER_TITLE_DEFAULT_VALUE_TEXT"),
		selectAdditionalTextPercentSection: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_SELECT_ADDITIONAL_TEXT_PERCENT_SECTION"),
		selectAdditionalTextPercentHeader: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_SELECT_ADDITIONAL_TEXT_PERCENT_HEADER"),
		selectAdditionalTextVh: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_SELECT_ADDITIONAL_TEXT_VH"),
		selectAdditionalTextPx: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_SELECT_ADDITIONAL_TEXT_PX"),
		selectAdditionalTextRem: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_SELECT_ADDITIONAL_TEXT_REM"),
		advancedSettingsTitle: _oTextResources.getText("IFRAME_ADDIFRAME_ADVANCED_SETTINGS"),
		additionalParametersSecurityWarningText: _oTextResources.getText("IFRAME_ADDIFRAME_ADDITIONAL_PARAMETERS_SECURITY_WARNING_TEXT"),
		additionalParametersWarningMoreInfoText: _oTextResources.getText("IFRAME_ADDIFRAME_ADDITIONAL_PARAMETERS_WARNING_MORE_INFO_TEXT"),
		additionalSandboxParametersLabel: _oTextResources.getText("IFRAME_ADDIFRAME_ADD_ADDITIONAL_SANDBOX_PARAMETERS_LABEL"),
		additionalSandboxParametersPlaceholder: _oTextResources.getText("IFRAME_ADDIFRAME_ADD_ADDITIONAL_SANDBOX_PARAMETERS_PLACEHOLDER")
	};

	function createJSONModel(bSetUpdateTitle, bAsContainer, sFrameWidthValue, sFrameHeightValue, oAdvancedSettings) {
		_mText.dialogTitle = bSetUpdateTitle ? _mText.dialogUpdateTitle : _mText.dialogCreateTitle;

		var sSelectAdditionalTextPercent = bAsContainer
			? _mText.selectAdditionalTextPercentSection
			: _mText.selectAdditionalTextPercentHeader;

		return new JSONModel({
			text: _mText,
			asContainer: {
				value: bAsContainer
			},
			title: {
				value: _mText.containerTitleDefaultValue,
				valueState: ValueState.None,
				id: "sapUiRtaAddIFrameDialog_ContainerTitle_TitleInput"
			},
			frameWidth: {
				value: parseFloat(sFrameWidthValue) || 100,
				valueState: ValueState.None,
				id: "sapUiRtaAddIFrameDialog_WidthInput"
			},
			frameWidthUnit: {
				value: "%"
			},
			frameHeight: {
				value: parseFloat(sFrameHeightValue) || 50,
				valueState: ValueState.None,
				id: "sapUiRtaAddIFrameDialog_HeightInput"
			},
			frameHeightUnit: {
				value: "vh"
			},
			frameUrl: {
				value: "",
				valueState: ValueState.None
			},
			previousFrameUrl: {
				value: ""
			},
			frameUrlError: {
				value: undefined
			},
			previewUrl: { value: "" },
			documentationLink: {
				HTML: _sDocumentationHTML
			},
			parameters: { value: [] },
			unitsOfWidthMeasure: [{
				unit: "%",
				descriptionText: sSelectAdditionalTextPercent
			}, {
				unit: "px",
				descriptionText: _mText.selectAdditionalTextPx
			}, {
				unit: "rem",
				descriptionText: _mText.selectAdditionalTextRem
			}],
			unitsOfHeightMeasure: [{
				unit: "vh",
				descriptionText: _mText.selectAdditionalTextVh
			}, {
				unit: "px",
				descriptionText: _mText.selectAdditionalTextPx
			}, {
				unit: "rem",
				descriptionText: _mText.selectAdditionalTextRem
			}],
			advancedSettings: {
				value: {
					allowForms: true,
					allowScripts: true,
					allowSameOrigin: true,
					additionalSandboxParameters: [],
					...oAdvancedSettings
				}
			},
			settingsUpdate: {
				value: false
			}
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
	 * @param {object|undefined} mSettings - Existing IFrame settings
	 * @param {sap.ui.core.Control} oReferenceControl - Control to take the default model from
	 * @returns {Promise} Promise resolving to IFrame settings
	 * @public
	 */
	AddIFrameDialog.prototype.open = function(mSettings, oReferenceControl) {
		return new Promise(function(resolve) {
			this._fnResolve = resolve;
			this._createDialog(mSettings, oReferenceControl);
		}.bind(this));
	};

	/**
	 * Create the Add IFrame Dialog
	 *
	 * @param {object|undefined} mSettings - Existing IFrame settings
	 * @param {sap.ui.core.Control} oReferenceControl - Control to take the default model from
	 * @private
	 */
	AddIFrameDialog.prototype._createDialog = function(mSettings, oReferenceControl) {
		this._oJSONModel = createJSONModel(
			!!mSettings?.updateMode,
			!!mSettings?.asContainer,
			mSettings?.frameWidth,
			mSettings?.frameHeight,
			mSettings?.advancedSettings
		);
		this._oController = new AddIFrameDialogController(this._oJSONModel, mSettings);
		Fragment.load({
			name: "sap.ui.rta.plugin.iframe.AddIFrameDialog",
			controller: this._oController
		}).then(function(oAddIFrameDialog) {
			this._oDialog = oAddIFrameDialog;
			this._oDialog.addStyleClass(RtaUtils.getRtaStyleClassName());
			this._oDialog.setModel(this._oJSONModel, "dialogInfo");
			this._oDialog.setModel(oReferenceControl.getModel());
			this._oDialog.setBindingContext(oReferenceControl.getBindingContext());
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
			const oIframe = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewFrame");
			const oUserModel = oIframe.getModel("$user");
			this._oDialog.setModel(oUserModel, "$user");
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
		var oPanelButton = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewLinkPanel").getDependents()[0];
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
	AddIFrameDialog.buildUrlBuilderParametersFor = async function(oObject) {
		const oUserInfo = await getContainerUserInfo();
		const oUserParameters = Object.keys(oUserInfo)
		.map(function(sUserSetting) {
			return {
				label: sUserSetting,
				key: `{$user>/${sUserSetting}}`,
				value: oUserInfo[sUserSetting]
			};
		});
		const oBindingContext = oObject.getBindingContext();
		let aDefaultBoundObjectParameters;
		if (oBindingContext) {
			const oDefaultBoundObject = oBindingContext.getObject();
			aDefaultBoundObjectParameters = Object.keys(oDefaultBoundObject)
			.filter(function(sProperty) {
				return typeof oDefaultBoundObject[sProperty] !== "object";
			})
			.map(async function(sProperty) {
				const oModel = oBindingContext.getModel();
				const oReturn = {
					label: sProperty,
					key: `{${sProperty}}`,
					value: oDefaultBoundObject[sProperty]
				};
				// V4 Models automatically adjust values for certain data types based on localization settings,
				// which can make them different from what we display on the table of parameters. We get the data
				// type here to add the parameter to the URL later with the same value that was displayed on the table.
				if (oModel.isA("sap.ui.model.odata.v4.ODataModel")) {
					const oMetaModel = oModel.getMetaModel();
					const sMetaPath = oMetaModel.getMetaPath(oBindingContext.getPath());
					const sType = await oMetaModel.requestObject(`${sMetaPath}/${sProperty}/$Type`);
					if (sType) {
						oReturn.type = sType;
					}
				}
				return oReturn;
			});
		} else {
			aDefaultBoundObjectParameters = [];
		}
		return oUserParameters.concat(await Promise.all(aDefaultBoundObjectParameters));
	};

	return AddIFrameDialog;
});
