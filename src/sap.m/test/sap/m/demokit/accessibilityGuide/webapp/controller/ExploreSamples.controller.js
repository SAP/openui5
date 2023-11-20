sap.ui.define([
	"./BaseController",
	"../model/ExploreNavigationModel",
	"../model/ExploreSettingsModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/BindingMode",
	"sap/ui/Device"
], function (
	BaseController,
	exploreNavigationModel,
	exploreSettingsModel,
	JSONModel,
	BindingMode,
	Device
) {
	"use strict";

	return BaseController.extend("sap.ui.demo.accessibilityGuide.controller.ExploreSamples", {

		/**
		 * Called when the controller is instantiated.
		 */
		onInit: function () {
			var oRouter = this.getRouter();
			oRouter.getRoute("exploreSamples").attachMatched(this._onRouteMatched, this);

			this.oModel = new JSONModel({});
			this.oModel.setDefaultBindingMode(BindingMode.OneWay);

			this.getView().setModel(this.oModel);
			this.getView().setModel(exploreSettingsModel, "settings");

			this._oFileEditor = this.byId("fileEditor");
			this._oSampleView = this.byId("sampleView");

			this._registerResize();
			this._initIFrameCreation();
		},

		onExit: function () {
			this._deregisterResize();
		},

		onFileSwitch: function (oEvent) {
			exploreSettingsModel.setProperty("/editable", oEvent.getParameter("editable"));
		},

		onRunPressed: function (oEvent) {
			this._oFileEditor.getManifestContent().then(this._updateSample.bind(this));
		},

		onChangeSplitterOrientation: function (oEvent) {
			//Toggles the value of splitter orientation
			exploreSettingsModel.setProperty("/splitViewVertically", !exploreSettingsModel.getProperty("/splitViewVertically"));
			var isOrientationVertical = exploreSettingsModel.getProperty("/splitViewVertically");
			this.getView().byId("splitView").getRootPaneContainer().setOrientation(isOrientationVertical ? "Vertical" : "Horizontal");
		},

		onSubSampleChange: function (oEvent) {
			var item = oEvent.getParameter('selectedItem');

			this.getRouter().navTo(
				"exploreSamples",
				{
					sample: this.oModel.getProperty("/sample").key,
					subSample: item.getKey()
				}
			);
		},

		_deregisterResize: function () {
			Device.media.detachHandler(this._onResize, this);
		},

		_registerResize: function () {
			Device.media.attachHandler(this._onResize, this);
			this._onResize();
		},

		_onResize: function () {
			var isOrientationVertical = exploreSettingsModel.getProperty("/splitViewVertically"),
				sRangeName = Device.media.getCurrentRange("StdExt").name;

			if (sRangeName == "Tablet" || sRangeName == "Phone" && !isOrientationVertical) {
				exploreSettingsModel.setProperty("/splitViewVertically", true);
				this.getView().byId("splitView").getRootPaneContainer().setOrientation("Vertical");
			}
		},

		_onRouteMatched: function (oEvent) {
			var oArgs = oEvent.getParameter("arguments"),
				sSampleKey = oArgs.sample,
				oSample = this._findSample(sSampleKey),
				sSubSampleKey = oArgs.subSample,
				oSubSample;

			// reset the model
			this.oModel.setData({});

			if (!oSample) {
				//TODO sample not found
				return;
			}

			if (oSample.subSamples && !sSubSampleKey) {
				// select the first sub sample
				sSubSampleKey = oSample.subSamples[0].key;
			}

			oSubSample = this._findSubSample(oSample, sSubSampleKey);
			if (sSubSampleKey && !oSubSample) {
				//TODO sub sample not found
				return;
			}

			var oSubSampleOrSample = oSubSample || oSample;

			exploreSettingsModel.setProperty("/isApplication", !!oSubSampleOrSample.isApplication);
			this.byId("splitView").setBusy(true);
			this._showSample(oSample, oSubSample);
		},

		_findSample: function (sSampleKey) {
			var aSections = exploreNavigationModel.getProperty("/navigation"),
				oFoundSample;

			// loops through all samples in the navigation and gets the current one
			aSections.some(function (oSection) {
				oSection.items.some(function (oSample) {
					if (oSample.key === sSampleKey) {
						oFoundSample = oSample;
						return true;
					}
				});
			});

			return oFoundSample;
		},

		_findSubSample: function (oSample, sSubSampleKey) {
			var oFoundSubSample;

			if (!sSubSampleKey) {
				return null;
			}

			oSample.subSamples.some(function (oSubSample) {
				if (oSubSample.key === sSubSampleKey) {
					oFoundSubSample = oSubSample;
					return true;
				}
			});

			return oFoundSubSample;
		},

		getCurrentSampleKey: function () {
			return this.oModel.getProperty("/currentSampleKey");
		},

		_showSample: function (oSample, oSubSample) {
			var oCurrentSample = oSubSample || oSample,
				oFrameWrapperEl = this.byId("iframeWrapper"),
				bUseIFrame = !!oCurrentSample.useIFrame;

			this.oModel.setProperty("/currentSampleKey", oCurrentSample.key);
			this._oFileEditor.setFiles(oCurrentSample.files);

			exploreSettingsModel.setProperty("/useIFrame", bUseIFrame);
			this.oModel.setProperty("/sample", oSample);

			if (oSubSample) {
				this.oModel.setProperty("/subSample", oSubSample);
			}

			oFrameWrapperEl._sSample = oSubSample ? oSample.key + "/" + oSubSample.key : oSample.key;
			oFrameWrapperEl.invalidate();
			this.byId("splitView").setBusy(false);
		},

		_initIFrameCreation: function () {
			var oFrameWrapperEl = this.byId("iframeWrapper"),
				oDelegate = {
					onAfterRendering: function () {
						var oFrameWrapperElDomRef = oFrameWrapperEl.getDomRef(),
							oFrame;

						if (oFrameWrapperElDomRef.firstChild) {
							oFrameWrapperElDomRef.removeChild(oFrameWrapperElDomRef.firstChild);
						}

						if (oFrameWrapperEl._sSample) {
							oFrame = this.createFrame(oFrameWrapperEl._sSample);
							oFrameWrapperElDomRef.appendChild(oFrame);
						}
					}
				};

			oFrameWrapperEl.addEventDelegate(oDelegate, this);
		},

		createFrame: function (sSample) {
			var oFrameEl = document.createElement("iframe");
			// index.html will load separate scripts to enable editing the manifest.
			// in the file editor indexTemplate.html will be shown
			oFrameEl.src = sap.ui.require.toUrl("sap/ui/demo/accessibilityGuide/samples/" + sSample + "/index.html");
			oFrameEl.width = "100%";
			oFrameEl.className = "sapUiTopicsIframe";
			oFrameEl.sandbox = "allow-same-origin allow-forms allow-modals allow-pointer-lock allow-popups allow-scripts";
			return oFrameEl;
		},

		/**
		 * Reflects changes in the code editor to the example.
		 * @param {string} sValue The value of the manifest.json file.
		 */
		_updateSample: function (sValue) {

			if (!sValue) {
				return;
			}

			if (exploreSettingsModel.getProperty("/useIFrame")) {
				var oFrameWrapperEl = this.byId('iframeWrapper');
				var oFrame = oFrameWrapperEl.$().find("iframe")[0];

				if (oFrame.contentWindow) {
					// send value of the edited manifest to the card inside the iframe
					oFrame.contentWindow.postMessage({ "manifest": sValue }, "*");
				}
			}
		}

	});
});
