sap.ui.define([
	"sap/ui/demo/cardExplorer/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	"sap/ui/model/BindingMode",
	"../model/ExploreNavigationModel",
	"../model/ExploreSettingsModel",
	"sap/m/MessageStrip",
	"sap/ui/Device"
], function (BaseController,
             JSONModel,
             BindingMode,
             exploreNavigationModel,
             exploreSettingsModel,
             MessageStrip,
             Device) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cardExplorer.controller.ExploreSamples", {

		/**
		 * Called when the controller is instantiated.
		 */
		onInit: function () {
			var oRouter = this.getRouter();
			oRouter.getRoute("exploreSamples").attachMatched(this._onRouteMatched, this);

			this.oModel = new JSONModel();
			this.oModel.setDefaultBindingMode(BindingMode.OneWay);

			this.getView().setModel(this.oModel);
			this.getView().setModel(exploreSettingsModel, "settings");
			this._editor = this.byId("editor");
			//This will prevent all auto complete and suggestions of the editor
			this._editor._oEditor.completers = [];

			//This catches any "json" validation errors that ware made inside the editor
			this._editor._oEditor.session.on("changeAnnotation", this._onSyntaxError.bind(this));

			//This catches any error that was produced by the card
			this.byId("cardSample").attachEvent("_error", this._onCardError, this);

			this._errorMessageStrip = this.getView().byId("errorMessageStrip");
			this._registerResize();
		},

		onExit: function () {
			this._deregisterResize();
		},

		onManifestEdited: function (oEvent) {
			var sValue = oEvent.getParameter("value");

			if (exploreSettingsModel.getProperty("/autoRun")) {
				this._updateSample(sValue);
			}
		},
		onRunPressed: function (oEvent) {
			var sValue = this.getView().byId("editor").getValue();
			this._updateSample(sValue);
		},

		onChangeSplitterOrientation: function (oEvent) {
			//Toggles the value of splitter orientation
			exploreSettingsModel.setProperty("/splitViewVertically", !exploreSettingsModel.getProperty("/splitViewVertically"));
			var isOrientationVertical = exploreSettingsModel.getProperty("/splitViewVertically");
			this.getView().byId("splitView").getRootPaneContainer().setOrientation(isOrientationVertical ? "Vertical" : "Horizontal");
		},

		showError: function (sMessage) {
			this._errorMessageStrip.setVisible(true);
			this._errorMessageStrip.setText(sMessage);
		},

		onSubSampleChange: function (oEvent) {
			var item = oEvent.getParameter('selectedItem');

			this.getRouter().navTo(
				"exploreSamples",
				{
					key: this.oModel.getProperty("/sample").key,
					subSampleKey: item.getKey()
				}
			);
		},

		_onSyntaxError: function () {
			var aErrorAnnotations = this._editor._oEditor.session.$annotations,
				sMessage = "";
			if (aErrorAnnotations.length) {
				aErrorAnnotations.forEach(function (oError) {
					sMessage += "Line " + String(oError.row) + ": " + oError.text + '\n';
				});
				this.showError(sMessage);
			}
		},

		_onCardError: function (oEvent) {
			this.showError(oEvent.getParameters().message);
		},

		_deregisterResize: function () {
			Device.media.detachHandler(this._onResize, this);
		},

		_registerResize: function () {
			Device.media.attachHandler(this._onResize, this);
		},

		_onResize: function (oEvent) {
			var isOrientationVertical = exploreSettingsModel.getProperty("/splitViewVertically");

			if (oEvent.name == "Tablet" || oEvent.name == "Phone" && !isOrientationVertical) {
				exploreSettingsModel.setProperty("/splitViewVertically", true);
				this.getView().byId("splitView").getRootPaneContainer().setOrientation("Vertical");
			}
		},

		_onRouteMatched: function (oEvent) {
			var oArgs = oEvent.getParameter("arguments"),
				sSampleKey = oArgs["key"],
				oSample = this._findSample(sSampleKey),
				sSubSampleKey = oArgs["subSampleKey"],
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

		_showSample: function (oSample, oSubSample) {
			var sManifestUrl;

			this.oModel.setProperty("/sample", oSample);

			if (oSubSample) {
				this.oModel.setProperty("/subSample", oSubSample);
				this.oModel.setProperty("/sampleSettings", oSubSample.settings);
				sManifestUrl = oSubSample.manifestUrl;
			} else {
				this.oModel.setProperty("/sampleSettings", oSample.settings);
				sManifestUrl = oSample.manifestUrl;
			}

			if (!sManifestUrl) {
				// TODO no manifest for the given sample or sub sample
				return;
			}

			this._loadManifest(sManifestUrl);
		},

		_loadManifest: function (sManifestUrl) {
			var sUrl = jQuery.sap.getModulePath("sap.ui.demo.cardExplorer") + "/" + sManifestUrl;

			jQuery.ajax(sUrl, {
				async: true,
				dataType: "text",
				success: function (sValue) {
					this.byId("editor").setValue(sValue);
				}.bind(this)
			});
		},

		_updateSample: function (sValue) {
			if (!sValue) {
				// TODO hide the card or something like that. Currently it shows busy indicator which might be confusing
				this.byId("cardSample").setManifest(null);
				return;
			}

			try {
				var oData = JSON.parse(sValue);
				this.byId("cardSample").setManifest(oData);
				this._errorMessageStrip.setVisible(false);
			} catch (oException) {
				this.byId("cardSample").setManifest(null);
			}

		}
	});
});