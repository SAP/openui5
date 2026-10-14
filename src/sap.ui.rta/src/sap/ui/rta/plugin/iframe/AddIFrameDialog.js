/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Element",
	"sap/ui/core/Fragment",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/fl/util/getContainerUserInfo",
	"sap/ui/fl/util/FocusPolicy",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/rta/plugin/iframe/AddIFrameDialogController",
	"sap/ui/rta/Utils"
], function(
	Log,
	ManagedObject,
	Element,
	Fragment,
	Lib,
	coreLibrary,
	getContainerUserInfo,
	FocusPolicy,
	JSONModel,
	ResourceModel,
	AddIFrameDialogController,
	RtaUtils
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	const { ValueState } = coreLibrary;
	const _oTextResources = Lib.getResourceBundleFor("sap.ui.rta");

	const _aAdvancedSettings = [
		{ key: "allowForms", label: "allow-forms" },
		{ key: "allowScripts", label: "allow-scripts" },
		{ key: "allowSameOrigin", label: "allow-same-origin" },
		{ key: "allowPopups", label: "allow-popups" },
		{ key: "allowModals", label: "allow-modals" },
		{ key: "allowTopNavigation", label: "allow-top-navigation" },
		{ key: "allowDownloads", label: "allow-downloads" },
		{ key: "additionalSandboxParameters", isMultiInput: true }
	];

	function createJSONModel(mOptions) {
		const {
			updateMode: bUpdateMode,
			asContainer: bAsContainer,
			frameWidth: sFrameWidthValue,
			frameHeight: sFrameHeightValue,
			advancedSettings: oAdvancedSettings,
			allowFocusWithoutUserActivation: bAllowFocusWithoutUserActivation
		} = mOptions;
		var sSelectAdditionalTextPercent = bAsContainer
			? _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_SELECT_ADDITIONAL_TEXT_PERCENT_SECTION")
			: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_SELECT_ADDITIONAL_TEXT_PERCENT_HEADER");

		const mDocumentationUrls = {
			btpUrl: "https://help.sap.com/docs/ui5-flexibility-for-key-users/ui5-flexibility-for-key-users/embedding-content",
			s4HanaCloudUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/4fc8d03390c342da8a60f8ee387bca1a/8db25610e91342919fcf63d4e5868ae9.html",
			s4HanaOnPremUrl: "https://help.sap.com/docs/ABAP_PLATFORM_NEW/a7b390faab1140c087b8926571e942b7/8db25610e91342919fcf63d4e5868ae9.html"
		};

		return new JSONModel({
			dialogTitle: bUpdateMode ?
				_oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_UPDATE_TITLE") :
				_oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_TITLE"),
			documentationUrl: {
				value: RtaUtils.getSystemSpecificDocumentationUrl(mDocumentationUrls)
			},
			asContainer: {
				value: bAsContainer
			},
			// The title field is only shown when adding an iFrame as a section or subsection.
			// In update mode the title is hidden so that renaming is done exclusively via the
			// standard section/subsection rename, keeping section and subsection titles consistent.
			showTitle: {
				value: bAsContainer && !bUpdateMode
			},
			title: {
				value: bAsContainer && !bUpdateMode
					? _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_CONTAINER_TITLE_DEFAULT_VALUE_TEXT") : null,
				originalValue: bAsContainer && !bUpdateMode
					? _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_CONTAINER_TITLE_DEFAULT_VALUE_TEXT") : null,
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
				value: parseFloat(sFrameHeightValue) || 35,
				valueState: ValueState.None,
				id: "sapUiRtaAddIFrameDialog_HeightInput"
			},
			frameHeightUnit: {
				value: "vh"
			},
			// The URL entered by the user (without resolving bindings)
			frameUrl: {
				value: "",
				valueState: ValueState.None
			},
			// URL value when the dialog was opened (without resolving bindings), to detect changes for update
			initialFrameUrl: {
				value: ""
			},
			// URL value when the last preview was generated (with resolved bindings), to control the preview button state
			previousFrameUrl: {
				value: ""
			},
			frameUrlError: {
				value: undefined
			},
			// URL used for the iframe preview (with resolved bindings)
			previewUrl: { value: "" },
			parameters: { value: [] },
			unitsOfWidthMeasure: [{
				unit: "%",
				descriptionText: sSelectAdditionalTextPercent
			}, {
				unit: "px",
				descriptionText: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_SELECT_ADDITIONAL_TEXT_PX")
			}, {
				unit: "rem",
				descriptionText: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_SELECT_ADDITIONAL_TEXT_REM")
			}],
			unitsOfHeightMeasure: [{
				unit: "vh",
				descriptionText: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_SELECT_ADDITIONAL_TEXT_VH")
			}, {
				unit: "px",
				descriptionText: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_SELECT_ADDITIONAL_TEXT_PX")
			}, {
				unit: "rem",
				descriptionText: _oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_SELECT_ADDITIONAL_TEXT_REM")
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
			advancedSettingsConfig: _aAdvancedSettings,
			settingsUpdate: {
				value: false
			},
			allowFocusWithoutUserActivation: {
				// In update mode, fall back to true to preserve the legacy default for iframes
				// persisted before this property existed; in add mode, fall back to false so newly
				// created iframes adopt the safer no-focus-stealing default where the browser
				// supports the Permissions Policy (on unsupported browsers the value is still
				// persisted but has no runtime effect).
				value: bAllowFocusWithoutUserActivation ?? bUpdateMode
			},
			focusPolicySupported: {
				value: FocusPolicy.isFocusPolicySupported()
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
	 * @param {object} oAction - Action object as defined in the designtime
	 * @returns {Promise} Promise resolving to IFrame settings
	 * @public
	 */
	AddIFrameDialog.prototype.open = function(mSettings, oReferenceControl, oAction) {
		return new Promise(function(resolve) {
			this._fnResolve = resolve;
			this._createDialog(mSettings, oReferenceControl, oAction);
		}.bind(this));
	};

	/**
	 * Create the Add IFrame Dialog
	 *
	 * @param {object|undefined} mSettings - Existing IFrame settings
	 * @param {sap.ui.core.Control} oReferenceControl - Control to take the default model from
	 * @param {object} oAction - Action object as defined in the designtime
	 * @private
	 */
	AddIFrameDialog.prototype._createDialog = function(mSettings, oReferenceControl, oAction) {
		this._oJSONModel = createJSONModel({
			updateMode: !!mSettings?.updateMode,
			asContainer: !!mSettings?.asContainer,
			frameWidth: mSettings?.frameWidth,
			frameHeight: mSettings?.frameHeight,
			advancedSettings: mSettings?.advancedSettings,
			allowFocusWithoutUserActivation: mSettings?.allowFocusWithoutUserActivation
		});
		// Increase the size limit of the JSON model to allow more parameters for the URL builder
		this._oJSONModel.setSizeLimit(1000);
		this._oController = new AddIFrameDialogController(this._oJSONModel, mSettings, oAction);
		Fragment.load({
			name: "sap.ui.rta.plugin.iframe.AddIFrameDialog",
			controller: this._oController
		}).then(function(oAddIFrameDialog) {
			this._oDialog = oAddIFrameDialog;
			this._oDialog.addStyleClass(RtaUtils.getRtaStyleClassName());
			this._oDialog.setModel(this._oJSONModel, "dialogInfo");
			this._oDialog.setModel(oReferenceControl.getModel());
			this._oDialog.setBindingContext(oReferenceControl.getBindingContext());
			const oI18nModel = new ResourceModel({ bundleName: "sap.ui.rta.messagebundle" });
			this._oDialog.setModel(oI18nModel, "i18n");
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
