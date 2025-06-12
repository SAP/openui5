/*!
 * ${copyright}
 */


sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/EventBus",
	"sap/ui/core/Theming",
	"sap/ui/documentation/sdk/controller/SampleBaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/documentation/sdk/controller/util/ControlsInfo",
	"sap/ui/documentation/sdk/util/ToggleFullScreenHandler",
	"sap/m/BusyDialog",
	"sap/m/Text",
	"sap/ui/core/HTML",
	"sap/m/library",
	"sap/base/Log",
	"sap/ui/core/Fragment",
	"sap/ui/documentation/sdk/util/Resources",
	"./config/sampleForwardingConfig",
	"sap/base/strings/capitalize",
	"sap/base/i18n/Localization"
], function(
	Element,
	EventBus,
	Theming,
	SampleBaseController,
	JSONModel,
	ResourceModel,
	Component,
	ComponentContainer,
	ControlsInfo,
	ToggleFullScreenHandler,
	BusyDialog,
	Text,
	HTML,
	mobileLibrary,
	Log,
	Fragment,
	ResourcesUtil,
	sampleForwardingConfig,
	capitalize,
	Localization
) {
		"use strict";

		// shortcut for sap.m.URLHelper
		var URLHelper = mobileLibrary.URLHelper;

		var ALLOWLIST_SAMPLES_SEARCH_PARAMS = [
			"sap-ui-rtl",
			"sap-ui-language"
		];

		// Constants for better maintainability
		var CONSTANTS = {
			LEGACY_THEME_VERSION_THRESHOLD: 68,
			LEGACY_DEFAULT_THEME: "sap_belize",
			SETTINGS_TIMEOUT: 3000,
			BUSY_DIALOG_TIMEOUT: 1000,
			EXTERNAL_SAMPLE_RENDERING_DELAY: 100
		};

		return SampleBaseController.extend("sap.ui.documentation.sdk.controller.Sample", {
			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			onInit: function () {
				SampleBaseController.prototype.onInit.call(this);

				this.oRouter = this.getRouter();
				this._attachPaternMatched();

				this.oModel = new JSONModel({
					showNavButton : true,
					showNewTab: false,
					rtaLoaded: false,
					density: this.getOwnerComponent().getContentDensityClass(),
					rtl: Localization.getRTL(),
					theme: Theming.getTheme(),
					showWarning: false
				});

				this._sId = null; // Used to hold sample ID
				this._sEntityId = null; // Used to hold entity ID for the sample currently shown

				this.getView().setModel(this.oModel);

				this.bus = EventBus.getInstance();
				this.setDefaultSampleTheme();

				this.getOwnerComponent()._sSampleIframeOrigin = ResourcesUtil.getConfig() !== "." ? ResourcesUtil.getResourceOrigin() : window.origin;
			},

			_attachPaternMatched: function () {
				this.oRouter.getRoute("sample").attachPatternMatched(this._onSampleMatched, this);
			},

			/* =========================================================== */
			/* begin: internal methods									 */
			/* =========================================================== */

			/**
			 * Navigate handler
			 * @param event
			 * @private
			 */
			_onSampleMatched: function (event) {

				this._sId = event.getParameter("arguments").sampleId;
				this._sEntityId = event.getParameter("arguments").entityId;

				this.byId("page").setBusy(true);

				if (sampleForwardingConfig[this._sId]) {
					return this.oRouter.navTo("sample", {
						entityId: sampleForwardingConfig[this._sId].entityId,
						sampleId: sampleForwardingConfig[this._sId].sampleId
					}, true);
				}

				this.getModel("appView").setProperty("/bHasMaster", false);

				ControlsInfo.loadData().then(this._loadSample.bind(this));
			},

			_loadSample: function(oData) {
				var searchParams = window.location.search,
					bShouldRedirect = searchParams.includes("dk-sample-standalone"),
					oPage = this._getPage(),
					oModelData = this.oModel.getData(),
					oSample = oData.samples[this._sId],
					oSampleContext;

				if (!oSample) {
					setTimeout(function () {
						oPage.setBusy(false);
					}, 0);
					this.onRouteNotFound();
					return;
				}

				// we need this property to navigate to API reference
				this.entityId = this._sEntityId ? this._sEntityId : oSample.entityId;
				// we need the lib name in order to fetch dependencies for the sample
				this._sLib = oSample.library;

				oModelData.sEntityId = this.entityId;

				// check whether to open sample standalone
				if (bShouldRedirect) {
					this._handleRedirect(oSample);
				}

				// If we are in a scenario without contexts - this is the case for tutorials
				if (oSample.previousSampleId || oSample.nextSampleId) {
					oModelData.previousSampleId = oSample.previousSampleId;
					oModelData.nextSampleId = oSample.nextSampleId;
				}

				// If we have context we configure back to entity, previous and next sample according to the
				// sample context (e.g. Opened by entity X)
				if (oSample.contexts) {
					oSampleContext = oSample.contexts[this.entityId];
					if (oSampleContext) {
						oModelData.previousSampleId = oSampleContext.previousSampleId;
						oModelData.nextSampleId = oSampleContext.nextSampleId;
					} else {
						// If we are here someone probably tried to load a sample in a context that the sample does not
						// really exist. This can happen if someone tempered with the URL manually. In this case as
						// such sample does not exist in the context from the URL we redirect to not found page.
						this.onRouteNotFound();
						return;
					}
				}

				// set page title
				oModelData.title = "Sample: " + oSample.name;
				oModelData.showNewTab = true;
				oModelData.id = oSample.id;
				oModelData.name = oSample.name;
				oModelData.details = oSample.details;
				oModelData.description = oSample.description;
				oModelData.showSettings = !oSample.external; // Disable settings for external samples
				oModelData.external = oSample.external;
				oModelData.externalAppRef = oSample.externalAppRef;
				oModelData.externalSourceRef = oSample.externalSourceRef;
				oModelData.externalResourceRef = oSample.externalResourceRef;

				var sLocalStorageDKSamples = this._getChangedSamplesLocalStorage();
				if (sLocalStorageDKSamples && JSON.parse(sLocalStorageDKSamples).indexOf(oSample.id) > -1) {
					oModelData.showWarning = true;
				} else {
					oModelData.showWarning = false;
				}

				this._createIframe()
					.then(function (oSampleConfig) {
						// Store a reference to the currently opened sample on the application component
						this.getOwnerComponent()._oCurrentOpenedSample = this._oHtmlControl;

						if (oSampleConfig) {

							oModelData.stretch = oSampleConfig.stretch;
							oModelData.includeInDownload = oSampleConfig.additionalDownloadFiles;
							oModelData.customIndexHTML = oSampleConfig.customIndexHTML;

							// retrieve files
							if (oSampleConfig.files) {
								var sRef = sap.ui.require.toUrl((oSample.id).replace(/\./g, "/"));
								oModelData.files = [];
								for (var i = 0; i < oSampleConfig.files.length; i++) {
									var sFile = oSampleConfig.files[i];
									oModelData.files.push({
										name: sFile
									});
									this._updateFileContent(sRef, sFile);
								}
							}
							// Sets the current iframe URL or restores it to "undefined"
							oModelData.iframe = oSampleConfig.iframe || null;
							oPage.setProperty("enableScrolling", !!oSampleConfig.stretch, true);
						}

						this.getAPIReferenceCheckPromise(oSample.entityId).then(function (bHasAPIReference) {
							this.getView().byId("apiRefButton").setVisible(bHasAPIReference);
						}.bind(this));

						this.oModel.setData(oModelData);
						this.appendPageTitle(this.getModel().getProperty("/name"));
					}.bind(this))
					.catch(function (oError) {
						oPage.removeAllContent();
						oPage.addContent(new Text({ text: "Error while loading the sample: " + oError }));
					})
					.finally(function(){
						setTimeout(function () {
							oPage.setBusy(false);
						}, 0);
					});
			},

			/**
			 * Handles redirection from DemoKit to the sample page, rather than loading it as an iFrame.
			 * The 'dk-sample-standalone' query parameter must be in the URI to take effect.
			 * @param {object} oSample - The sample object containing metadata
			 * @private
			 */
			_handleRedirect : function (oSample) {
				if (this._isExternalSample(oSample)) {
					URLHelper.redirect(oSample.externalAppRef, false);
					return;
				}

				this._initIframeURL();
				this._applySearchParamValueToIframeURL('sap-ui-theme', this._sDefaultSampleTheme);
				this.sIFrameUrl += "&dk-sample-standalone";
				URLHelper.redirect(this.sIFrameUrl, false);
			},

			/**
			 * Checks if the given sample is external
			 * @param {object} oSample - The sample object
			 * @returns {boolean} True if the sample is external
			 * @private
			 */
			_isExternalSample: function(oSample) {
				return oSample && oSample.external;
			},

			/**
			 * Gets the iframe content window safely
			 * @returns {Window|null} The iframe content window or null if not available
			 * @private
			 */
			_getIframeContentWindow: function() {
				var oIframeDomRef = this._oHtmlControl && this._oHtmlControl.getDomRef();
				return oIframeDomRef ? oIframeDomRef.contentWindow : null;
			},

			/**
			 * Posts a message to the iframe content window safely
			 * @param {object} oMessage - The message to post
			 * @private
			 */
			_postMessageToIframe: function(oMessage) {
				var oContentWindow = this._getIframeContentWindow();
				if (oContentWindow) {
					oContentWindow.postMessage(oMessage, this.getOwnerComponent()._sSampleIframeOrigin);
				}
			},

			/**
			 * Initializes the URL of the sample itself, loaded either in an iFrame or standalone.
			 * @private
			 */
			_initIframeURL : function () {
				var oModelData = this.oModel && this.oModel.getData();

				// Check if this is an external sample
				if (oModelData && this._isExternalSample(oModelData) && oModelData.externalAppRef) {
					this.sIFrameUrl = oModelData.externalAppRef;
					// No need to proceed further for external samples
					return;
				}

				var sSampleOrigin = ResourcesUtil.getConfig(),
					sSampleVersion = ResourcesUtil.getResourcesVersion(),
					sSampleSearchParams = "";

				// Assigning allowed query parameters from Demo Kit URL
				ALLOWLIST_SAMPLES_SEARCH_PARAMS.forEach(function (oParam, index) {
					if (new URL(document.location.href).searchParams.get(oParam)) {
						sSampleSearchParams += (sSampleSearchParams === "" ? "?" : "&") + oParam + "=" + new URL(document.location.href).searchParams.get(oParam);
					}
				});

				sSampleSearchParams = (sSampleSearchParams === "" ? "?" : sSampleSearchParams + "&") +
					"sap-ui-xx-sample-id=" + this._sId
					+ "&sap-ui-xx-sample-lib=" + (this._sLib || "")
					+ "&sap-ui-xx-sample-origin=" + sSampleOrigin + sSampleVersion
					+ "&sap-ui-xx-dk-origin=" + window.location.origin;

				this.sIFrameUrl = ResourcesUtil.getResourceOrigin() + "/resources/sap/ui/documentation/sdk/index.html" + sSampleSearchParams;
			},

			getSettingsDialog: function () {
				return new Promise(function (resolve, reject) {
					if (!this._oSettingsDialog) {
						Fragment.load({
							id: "sample",
							name: "sap.ui.documentation.sdk.view.appSettingsDialog",
							controller: this
						}).then(function (oSettingsDialog) {
							this._oSettingsDialog = oSettingsDialog;
							this._oSettingsDialog.setModel(this._oMessageBundle, "i18n");
							resolve(this._oSettingsDialog);
						}.bind(this));
					} else {
						resolve(this._oSettingsDialog);
					}
				}.bind(this));
			},

			_getChangedSamplesLocalStorage: function () {
				return localStorage.getItem("dk_changed_samples");
			},

			_setChangedSamplesLocalStorage: function (oValue) {
				localStorage.setItem("dk_changed_samples", oValue);
			},

			/**
			 * Opens the View settings dialog
			 * @public
			 */
			handleSettings: function () {

				if (!this._oMessageBundle) {
					this._oMessageBundle = new ResourceModel({
						bundleName: "sap.ui.documentation.messagebundle"
					});
				}

				this.getSettingsDialog()
					.then(function (oSettingsDialog) {
						this.loadSampleSettings(this.applySampleSettings.bind(this));
						return oSettingsDialog;
					}.bind(this))
					.then(function(oSettingsDialog) {
						oSettingsDialog.open();
					})
					.catch(function(err) {
						Log.error(err);
					});
			},

			applySampleSettings: function(eMessage) {
				if (eMessage.data.type === "SETTINGS") {
					var oThemeSelect = Element.getElementById("sample--ThemeSelect");

					// Theme select
					oThemeSelect.setSelectedKey(eMessage.data.data.theme);

					// RTL
					Element.getElementById("sample--RTLSwitch").setState(eMessage.data.data.RTL);

					// Density mode select
					Element.getElementById("sample--DensityModeSwitch").setSelectedKey(this._presetDensity(eMessage.data.data.density, true));

				}
			},

			loadSampleSettings: function(fnCallback) {
				return new Promise(function (resolve, reject) {
					this._postMessageToIframe({
						type: "SETTINGS",
						reason: "get"
					});

					var fnLoadSettings = function(eMessage) {
						fnCallback(eMessage);
						window.removeEventListener("message", fnLoadSettings);
						resolve();
					};

					window.addEventListener("message", fnLoadSettings);

					setTimeout(function() {
						window.removeEventListener("message", fnLoadSettings);
						reject("The sample iframe is not loading settings");
					}, CONSTANTS.SETTINGS_TIMEOUT);
				}.bind(this));
			},

			/**
			 * Closes the View settings dialog
			 * @public
			 */
			handleCloseAppSettings: function () {
				this._oSettingsDialog.close();
			},

			handleSaveAppSettings: function () {
				var	sDensityMode = Element.getElementById("sample--DensityModeSwitch").getSelectedKey(),
					sTheme = Element.getElementById("sample--ThemeSelect").getSelectedKey(),
					bRTL = Element.getElementById("sample--RTLSwitch").getState();

				this._oSettingsDialog.close();

				// Lazy loading of busy dialog
				if (!this._oBusyDialog) {
					this._oBusyDialog = new BusyDialog();
					// oView.addDependent(this._oBusyDialog);
					this._handleBusyDialog();
				} else {
					this._handleBusyDialog();
				}

				// handle settings change
				this._applyAppConfiguration(sTheme, sDensityMode, bRTL);
				this._saveLocalSettings(sTheme, sDensityMode, bRTL);
			},

			_saveLocalSettings: function(sTheme, sDensityMode, bRTL) {
				sDensityMode = this._presetDensity(sDensityMode);
				this.oModel.setData({
					theme: sTheme,
					rtl: bRTL,
					density: sDensityMode
				}, true);

			},

			_presetDensity: function(sDensity, bToValue) {
				return bToValue ? sDensity.slice(9).toLowerCase() : "sapUiSize" + capitalize(sDensity);
			},

			/**
			 * Apply content configuration
			 * @param {string} sThemeActive name of the theme
			 * @param {string} sDensityMode content density mode
			 * @param {boolean} bRTL right to left mode
			 * @private
			 */
			_applyAppConfiguration: function(sThemeActive, sDensityMode, bRTL){
				var oModelData = this.oModel.getData();

				// Skip settings application for external samples
				if (this._isExternalSample(oModelData)) {
					return;
				}

				if (this.getModel().getProperty('/iframe')) {
					this._setStandAloneIndexIframeSetting(sThemeActive, sDensityMode, bRTL);
				} else {
					this._postMessageToIframe({
						type: "SETTINGS",
						reason: "set",
						data: {
							"density": this._presetDensity(sDensityMode),
							"RTL": bRTL,
							"theme": sThemeActive
						}
					});
				}
			},

			_setStandAloneIndexIframeSetting: function(sThemeActive, sDensityMode, bRTL) {
				this._applySearchParamValueToIframeURL('sap-ui-theme', sThemeActive);
				this._applySearchParamValueToIframeURL('sap-ui-density', sDensityMode);
				this._applySearchParamValueToIframeURL('sap-ui-rtl', bRTL);

				var oIframeDomRef = this._oHtmlControl && this._oHtmlControl.getDomRef();
				if (oIframeDomRef) {
					oIframeDomRef.src = this.sIFrameUrl;
				}
			},

			/**
			 * Handles View settings dialog
			 * @public
			 */
			_handleBusyDialog : function () {
				this._oBusyDialog.open();
				setTimeout(function () {
					this._oBusyDialog.close();
				}.bind(this), CONSTANTS.BUSY_DIALOG_TIMEOUT);
			},

			_updateFileContent: function(sRef, sFile, bForceFetch) {
				this.fetchSourceFile(sRef + "/" + sFile, undefined, bForceFetch).then(function(vContent) {
					var aFiles = this.oModel.getProperty("/files");
					aFiles.some(function(oFile) {
						if (oFile.name === sFile) {
							oFile.raw = vContent;
							return true;
						}
					});
					this.oModel.setProperty("/files", aFiles);
				}.bind(this));
			},

			onAPIRefPress: function () {
				this.oRouter.navTo("apiId", {id: this.entityId});
			},

			onNewTab: function () {
				var oModelData = this.oModel.getData();

				// For external samples, open the external URL directly
				if (this._isExternalSample(oModelData) && oModelData.externalAppRef) {
					URLHelper.redirect(oModelData.externalAppRef, true);
					return;
				}

				if (this.oModel.getProperty("/iframe")) {
					URLHelper.redirect(this.sIFrameUrl, true);
					return;
				}

				this._openNewTabWithSettings();
			},

			/**
			 * Opens a new tab with current sample settings applied
			 * @private
			 */
			_openNewTabWithSettings: function() {
				this.loadSampleSettings(function(eMessage){
					this._applySearchParamValueToIframeURL('sap-ui-theme', eMessage.data.data.theme);
					this._applySearchParamValueToIframeURL('sap-ui-rtl', eMessage.data.data.RTL);
					this._applySearchParamValueToIframeURL('sap-ui-density', eMessage.data.data.density);
				}.bind(this))
				.then(function(){
					URLHelper.redirect(this.sIFrameUrl, true);
				}.bind(this))
				.catch(function(err){
					Log.error("Failed to load sample settings for new tab", err);
				});
			},

			onPreviousSample: function (oEvent) {
				this.oRouter.navTo("sample", {
					entityId: this.entityId,
					sampleId: this.oModel.getProperty("/previousSampleId")
				});
			},

			onNextSample: function (oEvent) {
				this.oRouter.navTo("sample", {
					entityId: this.entityId,
					sampleId: this.oModel.getProperty("/nextSampleId")
				});
			},

			onInfoSample: function (oEvent) {
				var oButton = oEvent.getSource();
				if (!this._oPopover) {
					Fragment.load({
						name: "sap.ui.documentation.sdk.view.samplesInfo",
						controller: this
					}).then(function (oPopover) {
						// connect popover to the root view of this component (models, lifecycle)
						this.getView().addDependent(oPopover);
						this._oPopover = oPopover;
						this._oPopover.openBy(oButton);
					}.bind(this));
				} else {
					this._oPopover.openBy(oButton);
				}
			},

			onWarningSample: function (oEvent) {
				var oButton = oEvent.getSource();
				if (!this._oWarningPopover) {
					Fragment.load({
						name: "sap.ui.documentation.sdk.view.samplesWarning",
						controller: this
					}).then(function (oPopover) {
						// connect popover to the root view of this component (models, lifecycle)
						this.getView().addDependent(oPopover);
						this._oWarningPopover = oPopover;
						this._oWarningPopover.openBy(oButton);
					}.bind(this));
				} else {
					this._oWarningPopover.openBy(oButton);
				}
			},

			_createIframe : function () {
				return new Promise(function (resolve, reject) {

					this.fResolve = resolve;
					this.fReject = reject;

					this._initIframeURL();

					if (this._oHtmlControl) {
						this._oHtmlControl.destroy();
					}

					this._oHtmlControl = this._createHTMLControl()
						.addEventDelegate({
							onBeforeRendering: this._onBeforeIframeRendering.bind(this)
						})
						.addEventDelegate({
							onAfterRendering: this._onAfterIframeRendering.bind(this)
						});

					this._getPage().removeAllContent();
					this._getPage().addContent(this._oHtmlControl);

				}.bind(this));
			},

			/**
			 * Handler executed before the iframe rendering
			 * @private
			 */
			_onBeforeIframeRendering: function() {
				window.removeEventListener("message", this.onMessage.bind(this));
			},

			/**
			 * Handler executed after the iframe rendering
			 * @private
			 */
			_onAfterIframeRendering: function() {
				var oModelData = this.oModel.getData();

				// For external samples, resolve immediately after rendering since they don't use our messaging protocol
				if (this._isExternalSample(oModelData)) {
					setTimeout(function() {
						this.fResolve({});
					}.bind(this), CONSTANTS.EXTERNAL_SAMPLE_RENDERING_DELAY);
				} else {
					window.addEventListener("message", this.onMessage.bind(this));
				}
			},

			_createHTMLControl: function () {
				return new HTML({
					id : "sampleFrame",
					content : '<iframe src="' + this.sIFrameUrl + '" id="sampleFrame" frameBorder="0"></iframe>'
				});
			},

			_getPage: function () {
				return this.byId("page");
			},

			onMessage: function(eMessage) {
				var oModelData = this.oModel.getData();

				if (this._isExternalSample(oModelData)) {
					return;
				}

				if (eMessage.origin !== this.getOwnerComponent()._sSampleIframeOrigin) {
					return;
				}
				if (eMessage.source !== this._oHtmlControl.getDomRef().contentWindow) {
					return;
				}

				if (eMessage.data.type === "INIT") {
					this.fnMessageInit(eMessage);
				} else if (eMessage.data.type === "ERR") {
					this.fnMessageError(eMessage);
				} else if (eMessage.data.type === "LOAD") {
					this.fnMessageLoad(eMessage);
				} else if (eMessage.data.type === "RTA") {
					this._loadRTA.call(this);
				}
			},

			fnMessageInit: function(eMessage) {
				var oSettingsData = this.oModel.getData();

				if (eMessage.data.config?.sample?.iframe) {
					this.sIFrameUrl = sap.ui.require.toUrl(this._sId.replace(/\./g, "/")) + "/" + eMessage.data.config.sample.iframe;
					this._setStandAloneIndexIframeSetting(oSettingsData.theme, oSettingsData.density, oSettingsData.rtl);
				}

				// Skip settings initialization for external samples
				if (!this._isExternalSample(oSettingsData)) {
					this._postMessageToIframe({
						type: "SETTINGS",
						reason: "set",
						data: {
							"density": oSettingsData.density,
							"RTL": oSettingsData.rtl,
							"theme": oSettingsData.theme
						}
					});
				}

				this.fResolve(eMessage.data.config?.sample || {});
			},
			fnMessageLoad: function() {
				Log.info("Sample Iframe for sample " + this._sId + " is loaded");
			},

			fnMessageError: function(eMessage) {
				this.fReject(eMessage.data.data.msg);
			},

			_createComponent : function () {

				// create component only once
				var sCompId = 'sampleComp-' + this._sId;
				var sCompName = this._sId;
				var oMainComponent = this.getOwnerComponent();

				var oComp = Component.getComponentById(sCompId);

				if (oComp) {
					oComp.destroy();
				}

				return oMainComponent.runAsOwner(function(){
					return Component.create({
						id: sCompId,
						name: sCompName
					}).then(function (oComponent) {
						return new ComponentContainer({component : oComponent});
					});
				});
			},

			setDefaultSampleTheme: function() {
				var sSampleVersion = ResourcesUtil.getResourcesVersion();
				this._sDefaultSampleTheme = sSampleVersion && parseInt(sSampleVersion.slice(3,5)) < CONSTANTS.LEGACY_THEME_VERSION_THRESHOLD ?
					CONSTANTS.LEGACY_DEFAULT_THEME : Theming.getTheme();
			},

			onNavBack : function (oEvt) {
				this.oRouter.navTo("entity", { id : this.entityId });
			},

			/**
			 * Handles the navigation to the code view or to the external source code
			 * @override
			 */
			onNavToCode: function () {
				var oModelData = this.oModel.getData();

				// For external samples, redirect to the external source code repository
				if (this._isExternalSample(oModelData) && oModelData.externalSourceRef) {
					URLHelper.redirect(oModelData.externalSourceRef, true);
					return;
				}

				// For internal samples, navigate to the code view as usual
				this.oRouter.navTo("code", {
					entityId: this.entityId,
					sampleId: this._sId
				}, false);
			},

			onToggleFullScreen : function (oEvt) {
				ToggleFullScreenHandler.updateMode(oEvt, this.getView(), this);
			},

			/**
			 * Handles the download of the sample source code.
			 * If the sample is external, it redirects to the external URL instead.
			 * @override
			 */
			onDownload: function () {
				var oModelData = this.oModel.getData();

				// For external samples, open the external URL directly since they don't have downloadable source files
				if (this._isExternalSample(oModelData) && oModelData.externalResourceRef) {
					URLHelper.redirect(oModelData.externalResourceRef, true);
					return;
				}

				// Call the parent's download method for internal samples
				if (SampleBaseController.prototype.onDownload) {
					SampleBaseController.prototype.onDownload.call(this);
				}
			},

			_oRTA : null,

			_applySearchParamValueToIframeURL: function(sSearchParam, sNewVal) {
				var URL = window.URL,
					oIFrameURL;

				try {
					oIFrameURL = new URL(this.sIFrameUrl, document.location);
				} catch (err) {
					Log.warning("window.URL is not supported. The search param value won't be applied.");
					return;
				}

				this.sIFrameUrl = this.sIFrameUrl.replace(oIFrameURL.search, "");

				oIFrameURL.searchParams.set(sSearchParam, sNewVal);

				this.sIFrameUrl = this.sIFrameUrl + decodeURI(oIFrameURL.search);
			},

			_loadRTA: function () {
					var oModelData = this.oModel.getData();

					oModelData.rtaLoaded = true;

					this.oModel.setData(oModelData, true);

					this.oRouter.attachRouteMatched(function () {
						if (this._oRTA) {
							this._oRTA.destroy();
							this._oRTA = null;
						}
					}, this);
			},

			onToggleAdaptationMode : function (oEvt) {
				var oContentWindow = this._getIframeContentWindow();
				if (!oContentWindow) {
					return false;
				}

				this._postMessageToIframe({
					type: "RTA",
					data: {
						"msg": "Start the RTA"
					}
				});
			},

			onRouteNotFound: function() {
				var sNotFoundTitle = this.getModel("i18n").getProperty("NOT_FOUND_SAMPLE_TITLE");

				this.oRouter.myNavToWithoutHash("sap.ui.documentation.sdk.view.SampleNotFound", "XML", false);
				setTimeout(this.appendPageTitle.bind(this, sNotFoundTitle));
			}
		});
	}
);
