/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
		"jquery.sap.global",
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/Component",
		"sap/ui/core/ComponentContainer",
		"sap/ui/documentation/sdk/controller/util/ControlsInfo",
		"sap/ui/documentation/sdk/util/ToggleFullScreenHandler",
		"sap/m/Text",
		"sap/ui/core/HTML",
		"sap/ui/Device",
		"sap/ui/core/routing/History",
		"sap/m/library"
	], function (jQuery, BaseController, JSONModel, Component, ComponentContainer, ControlsInfo, ToggleFullScreenHandler, Text, HTML, Device, History, mobileLibrary) {
		"use strict";

		// shortcut for sap.m.URLHelper
		var URLHelper = mobileLibrary.URLHelper;

		return BaseController.extend("sap.ui.documentation.sdk.controller.Sample", {

			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			onInit: function () {
				this.getRouter().getRoute("sample").attachPatternMatched(this._onSampleMatched, this);

				this._viewModel = new JSONModel({
					showNavButton : true,
					showNewTab: false
				});

				// Load runtime authoring asynchronously
				Promise.all([
					sap.ui.getCore().loadLibrary("sap.ui.fl", {async: true}),
					sap.ui.getCore().loadLibrary("sap.ui.rta", {async: true})
				]).then(this._loadRTA.bind(this));

				this.getView().setModel(this._viewModel);
			},

			/* =========================================================== */
			/* begin: internal methods									 */
			/* =========================================================== */

			_onSampleMatched: function (event) {

				this.getModel("headerView").setProperty("/bShowSubHeader", false);

				var oPage = this.byId("page");

				oPage.setBusy(true);

				this._sId = event.getParameter("arguments").id;

				ControlsInfo.loadData().then(function (oData) {
					this._loadSample(oData);
				}.bind(this));
			},

			_loadSample: function(oData) {
				var oPage = this.byId("page"),
					oHistory = History.getInstance(),
					oPrevHash = oHistory.getPreviousHash(),
					oModelData = this._viewModel.getData(),
					oSample = oData.samples[this._sId],
					oContent;

				if (!oSample) {
					jQuery.sap.delayedCall(0, this, function () {
						oPage.setBusy(false);
					});
					this.getRouter().myNavToWithoutHash("sap.ui.documentation.sdk.view.NotFound", "XML", false);
					return;
				}

				// set nav button visibility
				oModelData.showNavButton = Device.system.phone || !!oPrevHash;
				oModelData.previousSampleId = oSample.previousSampleId;
				oModelData.nextSampleId = oSample.nextSampleId;
				// we need this property to navigate to API reference
				this.entityId = oSample.entityId;

				// set page title
				oModelData.title = "Sample: " + oSample.name;

				try {
					oContent = this._createComponent();
				} catch (ex) {
					oPage.removeAllContent();
					oPage.addContent(new Text({ text : "Error while loading the sample: " + ex }));
					jQuery.sap.delayedCall(0, this, function () {
						oPage.setBusy(false);
					});
					return;
				}

				// Store a reference to the currently opened sample on the application component
				this.getOwnerComponent()._oCurrentOpenedSample = oContent ? oContent : undefined;

				//get config
				var oConfig = (this._oComp.getMetadata()) ? this._oComp.getMetadata().getConfig() : null;
				var oSampleConfig = oConfig && oConfig.sample || {};

				// only have the option to run standalone if there is an iframe
				oModelData.showNewTab = !!oSampleConfig.iframe;

				if (oSampleConfig.iframe) {
					oContent = this._createIframe(oContent, oSampleConfig.iframe);
				} else {
					this.sIFrameUrl = null;
				}

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

				this._viewModel.setData(oModelData);

				jQuery.sap.delayedCall(0, this, function () {
					oPage.setBusy(false);
				});

			},

			onAPIRefPress: function () {
				this.getRouter().navTo("apiId", {id: this.entityId});
			},

			onNewTab : function () {
				URLHelper.redirect(this.sIFrameUrl, true);
			},

			onPreviousSample: function (oEvent) {
				this.getRouter().navTo("sample", {
					id: this._viewModel.getProperty("/previousSampleId")
				}, true);
			},

			onNextSample: function (oEvent) {
				this.getRouter().navTo("sample", {
					id: this._viewModel.getProperty("/nextSampleId")
				}, true);
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
					this.sIFrameUrl = jQuery.sap.getModulePath(sIframePath + "/" + sIframeWithoutUI5Ending, sFileEnding || ".html");
				} else {
					jQuery.sap.log.error("no iframe source was provided");
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
				this.getRouter().navTo("entity", { id : this.entityId }, true);
			},

			onNavToCode : function (evt) {
				this.getRouter().navTo("code", {
					id : this._sId
				}, false);
			},

			onToggleFullScreen : function (oEvt) {
				ToggleFullScreenHandler.updateMode(oEvt, this.getView(), this);
			},

			_oRTA : null,

			_loadRTA: function () {
				sap.ui.require([
					"sap/ui/fl/Utils",
					"sap/ui/fl/FakeLrepConnectorLocalStorage"
				], function (
					Utils,
					FakeLrepConnectorLocalStorage
				) {

					// fake stable IDs
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
						this._oRTA = new RuntimeAuthoring({flexSettings: {
							developerMode: false
						}});
						this._oRTA.setRootControl(this.byId("page"));
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
