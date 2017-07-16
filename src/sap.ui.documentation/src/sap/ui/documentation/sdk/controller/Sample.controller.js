/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/ComponentContainer",
		"sap/ui/documentation/sdk/controller/util/ControlsInfo",
		"sap/ui/documentation/sdk/util/ToggleFullScreenHandler",
		"sap/m/Text",
		"sap/ui/core/HTML",
		"sap/ui/Device",
		"sap/ui/core/routing/History"
	], function (BaseController, JSONModel, ComponentContainer, ControlsInfo, ToggleFullScreenHandler, Text, HTML, Device, History) {
		"use strict";

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
				this._sId = event.getParameter("arguments").id;

				ControlsInfo.loadData().then(function (oData) {
					this._loadSample(oData);
				}.bind(this));
			},

			_loadSample: function(oData) {
				var oSample = oData.samples[this._sId],
					oContent;

				if (!oSample) {
					return;
				}

				// set nav button visibility
				var oPage = this.getView().byId("page");
				var oHistory = History.getInstance();
				var oPrevHash = oHistory.getPreviousHash();
				var oModelData = this._viewModel.getData();
				oModelData.showNavButton = Device.system.phone || !!oPrevHash;
				oModelData.previousSampleId = oSample.previousSampleId;
				oModelData.nextSampleId = oSample.nextSampleId;

				// set page title
				oPage.setTitle("Sample: " + oSample.name);

				try {
					oContent = this._createComponent();
				} catch (ex) {
					oPage.removeAllContent();
					oPage.addContent(new Text({ text : "Error while loading the sample: " + ex }));
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
				this._viewModel.setData(oModelData);
			},


			onNewTab : function () {
				sap.m.URLHelper.redirect(this.sIFrameUrl, true);
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

			_createIframe : function (oIframeContent, vIframe) {
				var sSampleId = this._sId,
					rExtractFilename = /\/([^\/]*)$/,// extracts everything after the last slash (e.g. some/path/index.html -> index.html)
					rStripUI5Ending = /\..+$/,// removes everything after the first dot in the filename (e.g. someFile.qunit.html -> .qunit.html)
					aFileNameMatches,
					sFileName,
					sFileEnding;

				if (typeof vIframe === "string") {
					// strip the file extension to be able to use jQuery.sap.getModulePath
					aFileNameMatches = rExtractFilename.exec(vIframe);
					sFileName = (aFileNameMatches && aFileNameMatches.length > 1 ? aFileNameMatches[1] : vIframe);
					sFileEnding = rStripUI5Ending.exec(sFileName)[0];
					var sIframeWithoutUI5Ending = vIframe.replace(rStripUI5Ending, "");

					// combine namespace with the file name again
					this.sIFrameUrl = jQuery.sap.getModulePath(sSampleId + "." + sIframeWithoutUI5Ending, sFileEnding || ".html");
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
									var oSampleFrame = this._oHtmlControl.$()[0].contentWindow;

									// Apply theme settings to iframe sample
									oSampleFrame.sap.ui.getCore().attachInit(function () {
										var bCompact = this.getRootView().hasStyleClass("sapUiSizeCompact");

										oSampleFrame.sap.ui.getCore().applyTheme(this._oCore.getConfiguration().getTheme());
										oSampleFrame.sap.ui.getCore().getConfiguration().setRTL(this._oCore.getConfiguration().getRTL());
										oSampleFrame.jQuery('body')
											.toggleClass("sapUiSizeCompact", bCompact)
											.toggleClass("sapUiSizeCozy", bCompact);
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

				this._oComp = sap.ui.component(sCompId);

				if (this._oComp) {
					this._oComp.destroy();
				}

				this._oComp = sap.ui.getCore().createComponent({
					id : sCompId,
					name : sCompName
				});
				// create component container
				return new ComponentContainer({
					component: this._oComp
				});
			},

			onNavBack : function (oEvt) {
				this.getRouter().myNavBack("home", {});
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
					this.getView().byId("toggleRTA").setVisible(true);

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
						this._oRTA = new RuntimeAuthoring();
						this._oRTA.setRootControl(this.getView().byId("page").getContent()[0]);
						this._oRTA.start();
					}
				}.bind(this));
			}
		});
	}
);