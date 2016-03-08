/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller"
], function ($, Controller) {
	"use strict";

	return Controller.extend("sap.ui.demokit.explored.view.sample", {

		onInit : function () {
			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.router.attachRoutePatternMatched(this.onRouteMatched, this);
			this._viewModel = new sap.ui.model.json.JSONModel({
				showNavButton : true,
				showNewTab: false
			});
			this.getView().setModel(this._viewModel);
		},

		onRouteMatched : function (oEvt) {

			if (oEvt.getParameter("name") !== "sample") {
				return;
			}

			var oModelData = this._viewModel.getData();
			this._sId = oEvt.getParameter("arguments").id;

			// retrieve sample object
			var oSample = sap.ui.demokit.explored.data.samples[this._sId];
			if (!oSample) {
				this.router.myNavToWithoutHash("sap.ui.demokit.explored.view.notFound", "XML", false, { path: this._sId });
				return;
			}

			// set nav button visibility
			var oPage = this.getView().byId("page");
			var oHistory = sap.ui.core.routing.History.getInstance();
			var oPrevHash = oHistory.getPreviousHash();
			oModelData.showNavButton = sap.ui.Device.system.phone || !!oPrevHash;
			oModelData.previousSampleId = oSample.previousSampleId;
			oModelData.nextSampleId = oSample.nextSampleId;

			// set page title
			oPage.setTitle("Sample: " + oSample.name);

			try {
				var oContent = this._createComponent();
			} catch (ex) {
				oPage.removeAllContent();
				oPage.addContent(new sap.m.Text({ text : "Error while loading the sample: " + ex }));
				return;
			}

			//get config
			var oConfig = (this._oComp.getMetadata()) ? this._oComp.getMetadata().getConfig() : null;
			var oSampleConfig = oConfig && oConfig.sample || {};

			// only have the option to run standalone if there is an iframe
			oModelData.showNewTab = !!oSampleConfig.iframe;

			if (oSampleConfig.iframe) {
				oContent = this._createIframe(oSampleConfig.iframe);
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
			this.router.navTo("sample", {
				id: this._viewModel.getProperty("/previousSampleId")
			}, true);
		},

		onNextSample: function (oEvent) {
			this.router.navTo("sample", {
				id: this._viewModel.getProperty("/nextSampleId")
			}, true);
		},

		_createIframe : function (vIframe) {
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
				sIframeWithoutUI5Ending = jQuery.sap.getModulePath(sSampleId + "." + sIframeWithoutUI5Ending, sFileEnding || ".html");

				// construct iFrame URL based on the index file and the current query parameters
				var sSearch = window.location.search,
					sThemeUrlParameter = "sap-ui-theme=" + sap.ui.getCore().getConfiguration().getTheme();

				// applying the theme after the bootstrap causes flickering, so we inject a URL parameter
				// to override the bootstrap parameter of the iFrame example
				if (sSearch) {
					var oRegExp = /sap-ui-theme=[a-z0-9\-]+/;
					if (sSearch.match(oRegExp)) {
						sSearch = sSearch.replace(oRegExp, sThemeUrlParameter);
					} else {
						sSearch += "&" + sThemeUrlParameter;
					}
				} else {
					sSearch = "?" + sThemeUrlParameter;
				}
				this.sIFrameUrl = sIframeWithoutUI5Ending + sSearch;
			} else {
				jQuery.sap.log.error("no iframe source was provided");
				return;
			}

			// destroy previous sample iframe
			var oHtmlControl = sap.ui.getCore().byId("sampleFrame");
			if (oHtmlControl) {
				oHtmlControl.destroy();
			}


			oHtmlControl = new sap.ui.core.HTML({
				id : "sampleFrame",
				content : '<iframe src="' + this.sIFrameUrl + '" id="sampleFrame" frameBorder="0"></iframe>'
			}).addEventDelegate({
				onAfterRendering : function () {
					oHtmlControl.$().on("load", function () {
						var oSampleFrame = oHtmlControl.$()[0].contentWindow;

						oSampleFrame.sap.ui.getCore().attachInit(function() {
							var oSampleFrame = oHtmlControl.$()[0].contentWindow;
							oSampleFrame.sap.ui.getCore().applyTheme(sap.ui.getCore().getConfiguration().getTheme());
							oSampleFrame.jQuery('body').toggleClass("sapUiSizeCompact", $("body").hasClass("sapUiSizeCompact")).toggleClass("sapUiSizeCozy", $("body").hasClass("sapUiSizeCozy"));
						});
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
			return new sap.ui.core.ComponentContainer({
				component: this._oComp
			});
		},

		onNavBack : function (oEvt) {
			if (this._oComp && this._oComp.exit) {
				this._oComp.exit();
			}
			this.router.myNavBack("home", {});
		},

		onNavToCode : function (evt) {
			this.router.navTo("code", {
				id : this._sId
			}, false);
		},

		onToggleFullScreen : function (oEvt) {
			sap.ui.demokit.explored.util.ToggleFullScreenHandler.updateMode(oEvt, this.getView());
		}
	});
});
