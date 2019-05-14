sap.ui.define([
	"sap/ui/demo/cardExplorer/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	"sap/ui/model/BindingMode",
	"../model/ExploreNavigationModel",
	"../model/ExploreSettingsModel"
], function(
	BaseController,
	JSONModel,
	BindingMode,
	exploreNavigationModel,
	exploreSettingsModel
) {
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
				sManifestUrl = oSubSample.manifestUrl;
			} else {
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

		_updateSample :function (sValue) {
			if (!sValue) {
				// TODO hide the card or something like that. Currently it shows busy indicator which might be confusing
				this.byId("cardSample").setManifest(null);
				return;
			}

			// TODO try/catch, handle errors, handle json validation, schema validation and etc.
			var oData = JSON.parse(sValue);
			this.byId("cardSample").setManifest(oData);
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
		onManifestEdited: function (oEvent) {
			var sValue = oEvent.getParameter("value");

			if (exploreSettingsModel.getProperty("/autoRun")) {
				this._updateSample(sValue);
			}
		},
		onRunPressed:function (oEvent) {
			var sValue = this.getView().byId("editor").getValue();
			this._updateSample(sValue);
		},
		onChangeSplitterOrientation:function (oEvent) {
			//Toggles the value of splitter orientation
			exploreSettingsModel.setProperty("/splitViewVertically", !exploreSettingsModel.getProperty("/splitViewVertically"));
			var isOrientationVertical = exploreSettingsModel.getProperty("/splitViewVertically");
			this.getView().byId("splitView").getRootPaneContainer().setOrientation(isOrientationVertical ? "Vertical" : "Horizontal");
		}
	});
});