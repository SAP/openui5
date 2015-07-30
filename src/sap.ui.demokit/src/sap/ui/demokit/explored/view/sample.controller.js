/*!
 * @copyright@
 */

sap.ui.controller("sap.ui.demokit.explored.view.sample", {

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
		this.router.navTo("sample", {
			id: this._viewModel.getProperty("/previousSampleId")
		}, false);
	},

	onNextSample: function (oEvent) {
		this.router.navTo("sample", {
			id: this._viewModel.getProperty("/nextSampleId")
		}, false);
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

		var oHtmlControl = new sap.ui.core.HTML({
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
		if (!this._oComp) {
			this._oComp = sap.ui.getCore().createComponent({
				id : sCompId,
				name : sCompName
			});
		}

		// create component container
		return new sap.ui.core.ComponentContainer({
			component: this._oComp
		});
	},

	onNavBack : function (oEvt) {
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
