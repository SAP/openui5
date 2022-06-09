/*!
 * ${copyright}
 */


sap.ui.define([
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
	"sap/base/util/UriParameters",
	"sap/ui/core/Fragment",
	"sap/ui/documentation/sdk/util/Resources",
	"./config/sampleForwardingConfig",
	"sap/base/strings/capitalize"
], function(
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
	UriParameters,
	Fragment,
	ResourcesUtil,
	sampleForwardingConfig,
	capitalize
) {
		"use strict";

		// shortcut for sap.m.URLHelper
		var URLHelper = mobileLibrary.URLHelper;

		var ALLOWLIST_SAMPLES_SEARCH_PARAMS = [
			"sap-ui-rtl",
			"sap-ui-language"
		];

		return SampleBaseController.extend("sap.ui.documentation.sdk.controller.Sample", {
			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			onInit: function () {
				var oConfiguration = sap.ui.getCore().getConfiguration();
				SampleBaseController.prototype.onInit.call(this);

				this.getRouter().getRoute("sample").attachPatternMatched(this._onSampleMatched, this);

				this.oModel = new JSONModel({
					showNavButton : true,
					showNewTab: false,
					rtaLoaded: false,
					density: this.getOwnerComponent().getContentDensityClass(),
					rtl: oConfiguration.getRTL(),
					theme: oConfiguration.getTheme()
				});

				this._sId = null; // Used to hold sample ID
				this._sEntityId = null; // Used to hold entity ID for the sample currently shown
				this.router = this.getRouter();

				this.getView().setModel(this.oModel);

				this.bus = sap.ui.getCore().getEventBus();
				this.setDefaultSampleTheme();
				this.bus.subscribe("themeChanged", "onDemoKitThemeChanged", this.onDemoKitThemeChanged, this);

				this.getOwnerComponent()._sSampleIframeOrigin = ResourcesUtil.getConfig() !== "." ? ResourcesUtil.getConfig() : window.origin;
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
					return this.router.navTo("sample", {
						entityId: sampleForwardingConfig[this._sId].entityId,
						sampleId: sampleForwardingConfig[this._sId].sampleId
					}, true);
				}

				this.getModel("appView").setProperty("/bHasMaster", false);

				ControlsInfo.loadData().then(this._loadSample.bind(this));
			},

			_loadSample: function(oData) {
				var oPage = this.byId("page"),
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

				oModelData.sEntityId = this.entityId;

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
				oModelData.showSettings = true;

				this._createIframe()
					.then(function (oSampleConfig) {
						// Store a reference to the currently opened sample on the application component
						this.getOwnerComponent()._oCurrentOpenedSample = this._oHtmlControl;

						if (oSampleConfig) {

							oModelData.stretch = oSampleConfig.stretch;
							oModelData.includeInDownload = oSampleConfig.additionalDownloadFiles;

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
							oModelData.iframe = oSampleConfig.iframe;
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
			 * Opens the View settings dialog
			 * @public
			 */
			handleSettings: function () {

				if (!this._oMessageBundle) {
					this._oMessageBundle = new ResourceModel({
						bundleName: "sap.ui.documentation.messagebundle"
					});
				}

				if (!this._oSettingsDialog) {
					this._oSettingsDialog = sap.ui.xmlfragment("sample", "sap.ui.documentation.sdk.view.appSettingsDialog", this);

					this._oSettingsDialog.setModel(this._oMessageBundle, "i18n");
				}

				this.loadSampleSettings(this.applySampleSettings.bind(this)).then(function() {
					this._oSettingsDialog.open();
				}.bind(this)).catch(function(err) {
					Log.error(err);
				});
			},

			applySampleSettings: function(eMessage) {
				if (eMessage.data.type === "SETTINGS") {
					var oThemeSelect = sap.ui.getCore().byId("sample--ThemeSelect");

					// Theme select
					oThemeSelect.setSelectedKey(eMessage.data.data.theme);

					// RTL
					sap.ui.getCore().byId("sample--RTLSwitch").setState(eMessage.data.data.RTL);

					// Density mode select
					sap.ui.getCore().byId("sample--DensityModeSwitch").setSelectedKey(this._presetDensity(eMessage.data.data.density, true));

				}
			},

			loadSampleSettings: function(fnCallback) {
				return new Promise(function (resolve, reject) {
					var oIframe = this._oHtmlControl.getDomRef();
					oIframe.contentWindow.postMessage({
						type: "SETTINGS",
						reason: "get"
					}, this.getOwnerComponent()._sSampleIframeOrigin);

					window.addEventListener("message", loadSettings);

					function loadSettings(eMessage) {
						fnCallback(eMessage);
						window.removeEventListener("message", loadSettings);
						resolve();
					}
					setTimeout(function() {
						reject("The sample iframe is not loading settings");
					},3000);
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
				var	sDensityMode = sap.ui.getCore().byId("sample--DensityModeSwitch").getSelectedKey(),
					sTheme = sap.ui.getCore().byId("sample--ThemeSelect").getSelectedKey(),
					bRTL = sap.ui.getCore().byId("sample--RTLSwitch").getState();

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
				var sDensityMode = this._presetDensity(sDensityMode);
				this.getView().getModel().setData({
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
				var oIframe = this._oHtmlControl.getDomRef(),
					sDensityMode = this._presetDensity(sDensityMode);
				oIframe.contentWindow.postMessage({
					type: "SETTINGS",
					reason: "set",
					data: {
						"density": sDensityMode,
						"RTL": bRTL,
						"theme": sThemeActive
					}
				}, this.getOwnerComponent()._sSampleIframeOrigin);
			},

			/**
			 * Handles View settings dialog
			 * @public
			 */
			_handleBusyDialog : function () {
				this._oBusyDialog.open();
				setTimeout(function () {
					this._oBusyDialog.close();
				}.bind(this), 1000);
			},

			_updateFileContent: function(sRef, sFile) {
				this.fetchSourceFile(sRef + "/" + sFile).then(function(vContent) {
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
				this.getRouter().navTo("apiId", {id: this.entityId});
			},

			onNewTab: function () {
				if (this.oModel.getProperty("/iframe")) {
					URLHelper.redirect(this.sIFrameUrl, true);
					return;
				}
				// this._applySearchParamValueToIframeURL('sap-ui-theme', this._sDefaultSampleTheme);
				this.loadSampleSettings(function(eMessage){
					this._applySearchParamValueToIframeURL('sap-ui-theme', eMessage.data.data.theme);
					this._applySearchParamValueToIframeURL('sap-ui-rtl', eMessage.data.data.RTL);
					this._applySearchParamValueToIframeURL('sap-ui-density', eMessage.data.data.density);
				}.bind(this)).then(function(){
					URLHelper.redirect(this.sIFrameUrl, true);
				}.bind(this)).catch(function(err){
					Log.error(err);
				});
			},

			onPreviousSample: function (oEvent) {
				this.getRouter().navTo("sample", {
					entityId: this.entityId,
					sampleId: this.oModel.getProperty("/previousSampleId")
				});
			},

			onNextSample: function (oEvent) {
				this.getRouter().navTo("sample", {
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

			/**
			 * Extends the sSampleId with the relative path defined in sIframePath and returns the resulting path.
			 * @param {string} sSampleId
			 * @param {string} sIframePath
			 * @returns {string}
			 * @private
			 */
			_resolveIframePath: function (sSampleId, sIframePath) {
				var aIFramePathParts = sIframePath.split("/"),
					i;

				for (i = 0; i < aIFramePathParts.length - 1; i++) {
					if (aIFramePathParts[i] == "..") {
						// iframe path has parts pointing one folder up so remove last part of the sSampleId
						sSampleId = sSampleId.substring(0, sSampleId.lastIndexOf("."));
					} else {
						// append the part of the iframe path to the sample's id
						sSampleId += "." + aIFramePathParts[i];
					}
				}

				return sSampleId;
			},

			_createIframe : function () {
				return new Promise(function (resolve, reject) {
					var sSampleId = this._sId,
					sIframePath = "",
					rExtractFilename = /\/([^\/]*)$/,// extracts everything after the last slash (e.g. some/path/index.html -> index.html)
					rStripUI5Ending = /\..+$/,// removes everything after the first dot in the filename (e.g. someFile.qunit.html -> .qunit.html)
					aFileNameMatches,
					sFileName,
					sFileEnding,
					vIframe;

					this.fResolve = resolve;
					this.fReject = reject;
					var sSampleOrigin = (window['sap-ui-documentation-config'] && window['sap-ui-documentation-config'].demoKitResourceOrigin) || "",
						sSampleVersion = ResourcesUtil.getResourcesVersion(),
						sSampleSearchParams = "";

					// Assigning allowed query parameters from Demo Kit URL
					ALLOWLIST_SAMPLES_SEARCH_PARAMS.forEach(function(oParam, index){
						if (new URL(document.location.href).searchParams.get(oParam)){
							sSampleSearchParams += (sSampleSearchParams === "" ? "?" : "&") + oParam + "=" + new URL(document.location.href).searchParams.get(oParam);
						}
					});

					sSampleSearchParams = (sSampleSearchParams === "" ? "?" : sSampleSearchParams + "&") +
					"sap-ui-xx-sample-id=" + sSampleId
					+ "&sap-ui-xx-sample-origin=" + sSampleOrigin + sSampleVersion
					+ "&sap-ui-xx-dk-origin=" + window.location.origin;

					this.sIFrameUrl = ResourcesUtil.getResourceOrigin() + "/resources/sap/ui/documentation/sdk/index.html" + sSampleSearchParams;

					if (this._oHtmlControl) {
						this._oHtmlControl.destroy();
					}

					var fnMessage =  function (eMessage) {
						var oSettingsData = this.getView().getModel().getData();
						if (eMessage.data.type === "INIT") {
							if (eMessage.data.config && eMessage.data.config.sample && eMessage.data.config.sample.iframe) {
								sSampleId = this._sId;
								vIframe = eMessage.data.config.sample.iframe;
								sIframePath = this._resolveIframePath(sSampleId, vIframe);

								//vlaid only for samples that contains own index.html
								// strip the file extension to be able to use jQuery.sap.getModulePath
								aFileNameMatches = rExtractFilename.exec(vIframe);
								sFileName = (aFileNameMatches && aFileNameMatches.length > 1 ? aFileNameMatches[1] : vIframe);
								sFileEnding = rStripUI5Ending.exec(sFileName)[0];
								var sIframeWithoutUI5Ending = sFileName.replace(rStripUI5Ending, "");

								// combine namespace with the file name again
								this.sIFrameUrl = (sap.ui.require.toUrl((sIframePath + "/" + sIframeWithoutUI5Ending).replace(/\./g, "/")) + sFileEnding || ".html")
								+ "?sap-ui-theme=" + sap.ui.getCore().getConfiguration().getTheme();
								this._oHtmlControl.getDomRef().src = this.sIFrameUrl;
							}
							this._oHtmlControl.getDomRef().contentWindow.postMessage({
								type: "SETTINGS",
								reason: "set",
								data: {
									"density": oSettingsData.density,
									"RTL": oSettingsData.rtl,
									"theme": oSettingsData.theme
								}
							}, this.getOwnerComponent()._sSampleIframeOrigin);
							this.fResolve(eMessage.data.config.sample);
						} else if (eMessage.data.type === "ERR") {
							this.fReject(eMessage.data.data.msg);
						} else if (eMessage.data.type === "RTA") {
							this._loadRTA.call(this);
						}
					}.bind(this);

					this._oHtmlControl = new HTML({
						id : "sampleFrame",
						content : '<iframe src="' + this.sIFrameUrl + '" id="sampleFrame" frameBorder="0"></iframe>'
					}).addEventDelegate({
						onBeforeRendering: function () {
							window.removeEventListener("message", fnMessage);
						}
					})
					.addEventDelegate({
						onAfterRendering: function () {
							window.addEventListener("message", fnMessage);
						}
					});

					this.byId("page").removeAllContent();
					this.byId("page").addContent(this._oHtmlControl);

				}.bind(this));
			},

			_createComponent : function () {

				// create component only once
				var sCompId = 'sampleComp-' + this._sId;
				var sCompName = this._sId;
				var oMainComponent = this.getOwnerComponent();

				var oComp = Component.get(sCompId);

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
				this._sDefaultSampleTheme = sSampleVersion && parseInt(sSampleVersion.slice(3,5)) < 68 ?
					"sap_belize" : sap.ui.getCore().getConfiguration().getTheme();
			},

			onDemoKitThemeChanged: function(sChannelId, sEventId, oData) {
				if (this._oHtmlControl && this.getModel().getProperty("/iframe")) {
					this._applySearchParamValueToIframeURL("sap-ui-theme", oData.sThemeActive);
					this._oHtmlControl.getDomRef().src = this.sIFrameUrl;
				}
			},

			onNavBack : function (oEvt) {
				this.getRouter().navTo("entity", { id : this.entityId });
			},

			onNavToCode : function (evt) {
				this.getRouter().navTo("code", {
					entityId: this.entityId,
					sampleId: this._sId
				}, false);
			},

			onToggleFullScreen : function (oEvt) {
				ToggleFullScreenHandler.updateMode(oEvt, this.getView(), this);
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

					this.oModel.setData(oModelData);

					this.getRouter().attachRouteMatched(function () {
						if (this._oRTA) {
							this._oRTA.destroy();
							this._oRTA = null;
						}
					}, this);
			},

			onToggleAdaptationMode : function (oEvt) {
				if (!this._oHtmlControl || !this._oHtmlControl.getDomRef()) {
					return false;
				}

				var oIframe = this._oHtmlControl.getDomRef();
				oIframe.contentWindow.postMessage({
					type: "RTA",
					data: {
						"msg": "Start the RTA"
					}
				}, this.getOwnerComponent()._sSampleIframeOrigin);
			},

			onRouteNotFound: function() {
				var sNotFoundTitle = this.getModel("i18n").getProperty("NOT_FOUND_SAMPLE_TITLE");

				this.getRouter().myNavToWithoutHash("sap.ui.documentation.sdk.view.SampleNotFound", "XML", false);
				setTimeout(this.appendPageTitle.bind(this, sNotFoundTitle));
				return;
			}
		});
	}
);
