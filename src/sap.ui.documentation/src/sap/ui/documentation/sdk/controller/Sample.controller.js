/*!
 * ${copyright}
 */


sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ui/documentation/sdk/controller/SampleBaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Component",
    "sap/ui/core/ComponentContainer",
    "sap/ui/documentation/sdk/controller/util/ControlsInfo",
    "sap/ui/documentation/sdk/util/ToggleFullScreenHandler",
    "sap/m/Text",
    "sap/ui/core/HTML",
    "sap/m/library",
    "sap/base/Log",
	"sap/ui/core/Fragment",
	"sap/ui/documentation/sdk/util/Resources"
], function(
    jQuery,
	SampleBaseController,
	JSONModel,
	Component,
	ComponentContainer,
	ControlsInfo,
	ToggleFullScreenHandler,
	Text,
	HTML,
	mobileLibrary,
	Log,
	Fragment,
	ResourcesUtil
) {
		"use strict";

		// shortcut for sap.m.URLHelper
		var URLHelper = mobileLibrary.URLHelper;

		return SampleBaseController.extend("sap.ui.documentation.sdk.controller.Sample", {
			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			onInit: function () {
				SampleBaseController.prototype.onInit.call(this);

				this.getRouter().getRoute("sample").attachPatternMatched(this._onSampleMatched, this);

				this.oModel = new JSONModel({
					showNavButton : true,
					showNewTab: false,
					rtaLoaded: false
				});

				this._sId = null; // Used to hold sample ID
				this._sEntityId = null; // Used to hold entity ID for the sample currently shown

				// Load runtime authoring asynchronously
				Promise.all([
					sap.ui.getCore().loadLibrary("sap.ui.fl", {async: true}),
					sap.ui.getCore().loadLibrary("sap.ui.rta", {async: true})
				]).then(this._loadRTA.bind(this));

				this.getView().setModel(this.oModel);

				this.bus = sap.ui.getCore().getEventBus();
				this.setDefaultSampleTheme();
				this.bus.subscribe("themeChanged", "onDemoKitThemeChanged", this.onDemoKitThemeChanged, this);
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

				this._createComponent()
					.then(function (oComponentContainer) {
						// Store a reference to the currently opened sample on the application component
						this.getOwnerComponent()._oCurrentOpenedSample = oComponentContainer ? oComponentContainer : undefined;

						//get config
						var oComponent = Component.get(oComponentContainer.getComponent());
						var oConfig = (oComponent.getMetadata()) ? oComponent.getMetadata().getConfig() : null;
						var oSampleConfig = oConfig && oConfig.sample || {};

						// only have the option to run standalone if there is an iframe
						oModelData.showNewTab = !!oSampleConfig.iframe || !!ResourcesUtil.getHasProxy();
						oModelData.id = oSample.id;
						oModelData.name = oSample.name;
						oModelData.details = oSample.details;
						oModelData.description = oSample.description;

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

							if (oSampleConfig.iframe || ResourcesUtil.getHasProxy()) {
								oComponentContainer = this._createIframe(oComponentContainer, oSampleConfig.iframe);
							} else {
								this.sIFrameUrl = null;
							}
						}

						// Sets the current iframe URL or restores it to "undefined"
						oModelData.iframe = oSampleConfig.iframe || ResourcesUtil.getHasProxy();

						// handle stretch content
						var bStretch = !!oSampleConfig.stretch;
						var sHeight = bStretch ? "100%" : null;
						oPage.setEnableScrolling(!bStretch);
						if (oComponentContainer.setHeight) {
							oComponentContainer.setHeight(sHeight);
						}
						// add content
						oPage.removeAllContent();
						oPage.addContent(oComponentContainer);

						// scroll to top of page
						oPage.scrollTo(0);

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

			onNewTab : function () {
				this._applySearchParamValueToIframeURL('sap-ui-theme', this._sDefaultSampleTheme);
				URLHelper.redirect(this.sIFrameUrl, true);
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
			 * @param {string} sIframe
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

			_createIframe : function (oIframeContent, vIframe) {
				var sSampleId = this._sId,
					sIframePath = "",
					rExtractFilename = /\/([^\/]*)$/,// extracts everything after the last slash (e.g. some/path/index.html -> index.html)
					rStripUI5Ending = /\..+$/,// removes everything after the first dot in the filename (e.g. someFile.qunit.html -> .qunit.html)
					aFileNameMatches,
					sFileName,
					sFileEnding;

				if (typeof vIframe === "string") {
					sIframePath = this._resolveIframePath(sSampleId, vIframe);

					// strip the file extension to be able to use jQuery.sap.getModulePath
					aFileNameMatches = rExtractFilename.exec(vIframe);
					sFileName = (aFileNameMatches && aFileNameMatches.length > 1 ? aFileNameMatches[1] : vIframe);
					sFileEnding = rStripUI5Ending.exec(sFileName)[0];
					var sIframeWithoutUI5Ending = sFileName.replace(rStripUI5Ending, "");

					// combine namespace with the file name again
					this.sIFrameUrl = sap.ui.require.toUrl((sIframePath + "/" + sIframeWithoutUI5Ending).replace(/\./g, "/")) + sFileEnding || ".html";
				} else if (ResourcesUtil.getHasProxy()) {
					var sSamplePath =  ResourcesUtil.getResourceOriginPath(sap.ui.require.toUrl(this._sId.replace(/\./g, "/"))),
						sSampleOrigin = (window['sap-ui-documentation-config'] && window['sap-ui-documentation-config'].demoKitResourceOrigin) || "",
						sSampleVersion = ResourcesUtil.getResourcesVersion();

					this.sIFrameUrl =
						"resources/sap/ui/documentation/sdk/index.html" +
						"?sap-ui-xx-sample-id=" + sSampleId
						+ "&&sap-ui-xx-sample-path=" + sSamplePath
						+ "&&sap-ui-xx-sample-origin=" + sSampleOrigin
						+ "&&sap-ui-xx-sample-version=" + sSampleVersion;
				} else {
					Log.error("no iframe source was provided");
					return;
				}

				if (!this._oHtmlControl) {
					this._oHtmlControl = new HTML({
						id : "sampleFrame",
						content : '<iframe src="' + this.sIFrameUrl + '" id="sampleFrame" frameBorder="0"></iframe>'
					}).addEventDelegate({
						onAfterRendering : function () {

							// Do not attach on "load" event on every onAfterRendering of the HTML control
							if (!this._oHtmlControl._jQueryHTMLControlLoadEventAttached) {
								this._oHtmlControl.$().on("load", function () {
									var oSampleFrame = this._oHtmlControl.$()[0].contentWindow,
										oSampleFrameCore = oSampleFrame.sap.ui.getCore();

									// Apply theme settings to iframe sample
									oSampleFrame.sap.ui.getCore().attachInit(function () {
										var bCompact = jQuery(document.body).hasClass("sapUiSizeCompact");

										oSampleFrameCore.applyTheme(ResourcesUtil.getHasProxy() ? this._sDefaultSampleTheme : this._oCore.getConfiguration().getTheme());
										oSampleFrameCore.getConfiguration().setRTL(this._oCore.getConfiguration().getRTL());
										oSampleFrame.jQuery('body')
											.toggleClass("sapUiSizeCompact", bCompact)
											.toggleClass("sapUiSizeCozy", !bCompact);

										// Notify Core for content density change
										oSampleFrameCore.notifyContentDensityChanged();
									}.bind(this));
								}.bind(this));

								this._oHtmlControl._jQueryHTMLControlLoadEventAttached = true;
							}

						}.bind(this)
					});
				} else {
					// If we already have the control just navigate to the new URL
					this._oHtmlControl.getDomRef().src = this.sIFrameUrl;
				}

				return this._oHtmlControl;

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
				if (this._oHtmlControl) {
					this._oHtmlControl.$()[0].contentWindow.sap.ui.getCore().applyTheme(oData.sThemeActive);
				}
				this.setDefaultSampleTheme();
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
				sap.ui.require([
					"sap/ui/fl/Utils",
					"sap/ui/fl/FakeLrepConnectorLocalStorage",
					"sap/ui/core/util/reflection/JsControlTreeModifier"
				], function (
					Utils,
					FakeLrepConnectorLocalStorage,
					JsControlTreeModifier
				) {
					var oModelData = this.oModel.getData();

					// fake stable IDs
					JsControlTreeModifier.checkControlId = function () {
						return true;
					};
					Utils.checkControlId = function() {
						return true;
					};

					FakeLrepConnectorLocalStorage.enableFakeConnector({
						"isProductiveSystem": true
					});
					oModelData.rtaLoaded = true;

					this.oModel.setData(oModelData);

					this.getRouter().attachRouteMatched(function () {
						if (this._oRTA) {
							this._oRTA.destroy();
							this._oRTA = null;
						}
					}, this);
				}.bind(this));
			},

			onToggleAdaptationMode : function (oEvt) {
				sap.ui.require([
					"sap/ui/rta/api/startKeyUserAdaptation"
				], function (
					startKeyUserAdaptation
				) {
					if (!this._oRTA) {
						startKeyUserAdaptation({
							rootControl : this.byId("page").getContent()[0].getComponentInstance()
						}).then(function(oRta) {
							this._oRTA = oRta;
							this._oRTA.attachStop(function () {
								this._oRTA.destroy();
								delete this._oRTA;
							}.bind(this));
						}.bind(this));
					}
				}.bind(this));
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
