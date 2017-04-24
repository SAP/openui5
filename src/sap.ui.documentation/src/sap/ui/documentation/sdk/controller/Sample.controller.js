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
		"sap/ui/fl/FakeLrepConnectorLocalStorage",
		"sap/ui/fl/Utils",
		"sap/m/Text",
		"sap/ui/core/HTML",
		"sap/ui/Device",
		"sap/ui/core/routing/History"
	], function (BaseController, JSONModel, ComponentContainer, ControlsInfo, ToggleFullScreenHandler, FakeLrepConnectorLocalStorage, Utils, Text, HTML, Device, History) {
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

				this._initFakeLREP();
				this._loadRuntimeAuthoring();

				this.getView().setModel(this._viewModel);

				var that = this;

				ControlsInfo.listeners.push(function () {
					that._loadSample();
				});
			},

			onBeforeRendering: function() {
				Device.orientation.detachHandler(jQuery.proxy(this._fnOrientationChange, this));
			},

			onAfterRendering: function() {
				Device.orientation.attachHandler(jQuery.proxy(this._fnOrientationChange, this));
			},

			onExit: function() {
				Device.orientation.detachHandler(jQuery.proxy(this._fnOrientationChange, this));
			},

			/* =========================================================== */
			/* begin: internal methods									 */
			/* =========================================================== */

			_onSampleMatched: function (event) {
				this._sId = event.getParameter("arguments").id;

				if (this._oRTA && jQuery.sap.byId("RTA-Toolbar")[0]) {
					this._oRTA.stop(true);
				}

				this._loadSample();
			},

			_loadSample: function() {
				var oModelData = this._viewModel.getData();

				if (!ControlsInfo.data) {
					return;
				}

				// retrieve sample object
				var oSample = ControlsInfo.data.samples[this._sId];
				if (!oSample) {
					return;
				}

				// set nav button visibility
				var oPage = this.getView().byId("page");
				var oHistory = History.getInstance();
				var oPrevHash = oHistory.getPreviousHash();
				oModelData.showNavButton = Device.system.phone || !!oPrevHash;
				oModelData.previousSampleId = oSample.previousSampleId;
				oModelData.nextSampleId = oSample.nextSampleId;

				// set page title
				oPage.setTitle("Sample: " + oSample.name);

				try {
					var oContent = this._createComponent();
				} catch (ex) {
					oPage.removeAllContent();
					oPage.addContent(new Text({ text : "Error while loading the sample: " + ex }));
					return;
				}

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

				var oHtmlControl = new HTML({
					content : '<iframe src="' + this.sIFrameUrl + '" id="sampleFrame" frameBorder="0"></iframe>'
				}).addEventDelegate({
						onAfterRendering : function () {
							oHtmlControl.$().on("load", function () {
								oIframeContent.placeAt("body");
							});
						}
					});

				return oHtmlControl;

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
			_initFakeLREP : function(){
				// fake stable IDs
				Utils.checkControlId = function() {
					return true;
				};

				FakeLrepConnectorLocalStorage.enableFakeConnector({
					"isKeyUser": true,
					"isAtoAvailable": false,
					"isProductiveSystem": true
				});
			},

			/*
			* Loades runtime authoring asynchronously (will fail if the rta library is not loaded)
			*/
			_loadRuntimeAuthoring : function() {
				try {
					sap.ui.require(["sap/ui/rta/RuntimeAuthoring"], function (RuntimeAuthoring) {
						this._oRTA = new RuntimeAuthoring();
						this.getView().byId("toggleRTA").setVisible(true);
					}.bind(this));
				} catch (oException) {
					jQuery.sap.log.info("sap.ui.rta.RuntimeAuthoring could not be loaded, UI adaptation mode is disabled");
				}
			},

			onToggleAdaptationMode : function (oEvt) {
				var oRTA = this._oRTA;
				if (oRTA) {
					oRTA.setRootControl(this.getView().byId("page").getContent()[0]);
					oRTA.start();
					setTimeout(function() {
						oRTA._oToolsMenu._oButtonPublish.setVisible(false);
					}, 0);
				}
			}
		});
	}
);