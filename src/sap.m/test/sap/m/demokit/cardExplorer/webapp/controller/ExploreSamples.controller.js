sap.ui.define([
	"sap/ui/demo/cardExplorer/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	"../model/ExploreNavigationModel",
	"../model/ExploreSettingsModel"
], function(
	BaseController,
	JSONModel,
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
			this.getView().setModel(exploreSettingsModel, "settings");
		},

		_onRouteMatched: function (oEvent) {
			var oArgs = oEvent.getParameter("arguments"),
				sSampleKey = oArgs["key"],
				oSample = this._findSample(sSampleKey);

			if (!oSample) {
				//TODO sample not found
				return;
			}

			this._showSample(oSample);
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

		_showSample: function (oSample) {
			this.getView().setModel(new JSONModel(oSample), "sample");

			var sUrl = jQuery.sap.getModulePath("sap.ui.demo.cardExplorer") + "/" + oSample.manifestUrl;

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