/*!
 * ${copyright}
 */

/*global location */
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
    "sap/base/Log"
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
	Log
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
					showNewTab: false
				});

				this._sId = null; // Used to hold sample ID
				this._sEntityId = null; // Used to hold entity ID for the sample currently shown

				// Load runtime authoring asynchronously
				Promise.all([
					sap.ui.getCore().loadLibrary("sap.ui.fl", {async: true}),
					sap.ui.getCore().loadLibrary("sap.ui.rta", {async: true})
				]).then(this._loadRTA.bind(this));

				this.getView().setModel(this.oModel);
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
					oSampleContext,
					oContent;

				if (!oSample) {
					setTimeout(function () {
						oPage.setBusy(false);
					}, 0);
					this.getRouter().myNavToWithoutHash("sap.ui.documentation.sdk.view.NotFound", "XML", false);
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
						this.getRouter().myNavToWithoutHash("sap.ui.documentation.sdk.view.NotFound", "XML", false);
						return;
					}
				}

				// set page title
				oModelData.title = "Sample: " + oSample.name;

				try {
					oContent = this._createComponent();
				} catch (ex) {
					oPage.removeAllContent();
					oPage.addContent(new Text({ text : "Error while loading the sample: " + ex }));
					setTimeout(function () {
						oPage.setBusy(false);
					}, 0);
					return;
				}

				// Store a reference to the currently opened sample on the application component
				this.getOwnerComponent()._oCurrentOpenedSample = oContent ? oContent : undefined;

				//get config
				var oConfig = (this._oComp.getMetadata()) ? this._oComp.getMetadata().getConfig() : null;
				var oSampleConfig = oConfig && oConfig.sample || {};

				// only have the option to run standalone if there is an iframe
				oModelData.showNewTab = !!oSampleConfig.iframe;
				oModelData.id = oSample.id;
				oModelData.name = oSample.name;

				if (oSampleConfig) {

					oModelData.stretch = oSampleConfig.stretch;
					oModelData.includeInDownload = oSampleConfig.additionalDownloadFiles;

					// retrieve files
					if (oSampleConfig.files) {
						var sRef = sap.ui.require.toUrl((oSample.id).replace(/\./g, "/"));
						oModelData.files = [];
						for (var i = 0; i < oSampleConfig.files.length; i++) {
							var sFile = oSampleConfig.files[i];
							var sContent = this.fetchSourceFile(sRef, sFile);

							oModelData.files.push({
								name : sFile,
								raw : sContent
							});
						}
					}

					if (oSampleConfig.iframe) {
						oContent = this._createIframe(oContent, oSampleConfig.iframe);
					} else {
						this.sIFrameUrl = null;
					}
				}

				// Sets the current iframe URL or restores it to "undefined"
				oModelData.iframe = oSampleConfig.iframe;

				// handle stretch content
				var bStretch = !!oSampleConfig.stretch;
				var sHeight = bStretch ? "100%" : null;
				oPage.setEnableScrolling(!bStretch);
				if (oContent.setHeight) {
					oContent.setHeight(sHeight);
				}
				// add content
				oPage.removeAllContent();
				oPage.addContent(oContent);

				// scroll to top of page
				oPage.scrollTo(0);

				this.getAPIReferenceCheckPromise(oSample.entityId).then(function (bHasAPIReference) {
					this.getView().byId("apiRefButton").setVisible(bHasAPIReference);
				}.bind(this));

				this.oModel.setData(oModelData);

				setTimeout(function () {
					oPage.setBusy(false);
				}, 0);

			},

			onAPIRefPress: function () {
				this.getRouter().navTo("apiId", {id: this.entityId});
			},

			onNewTab : function () {
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

										oSampleFrameCore.applyTheme(this._oCore.getConfiguration().getTheme());
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

				this._oComp = sap.ui.component(sCompId);

				if (this._oComp) {
					this._oComp.destroy();
				}

				return oMainComponent.runAsOwner(function() {
					this._oComp = sap.ui.getCore().createComponent({
						id: sCompId,
						name: sCompName
					});

					// create component container
					return new ComponentContainer({
						component: this._oComp
					});
				}.bind(this));
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
					this.byId("toggleRTA").setVisible(true);

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
					"sap/ui/rta/RuntimeAuthoring"
				], function (
					RuntimeAuthoring
				) {
					if (!this._oRTA) {
						// default developerMode for CUSTOMER-layer is 'true'
						this._oRTA = new RuntimeAuthoring({
							rootControl : this.byId("page").getContent()[0],
							flexSettings: {
								developerMode: false
							}
						});
						this._oRTA.attachStop(function () {
							this._oRTA.destroy();
							delete this._oRTA;
						}.bind(this));
						this._oRTA.start();
					}
				}.bind(this));
			}
		});
	}
);