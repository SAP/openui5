sap.ui.define([
	"sap/ui/demo/iconexplorer/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/library",
	"sap/ui/core/Core"
], function (BaseController, JSONModel, mobileLibrary, Core) {
	"use strict";

	var SUPPORTED_FONTS = {
		business: "BusinessSuiteInAppSymbols",
		tnt: "SAP-icons-TNT",
		sap: "SAP-icons"
	};

	var BTP_EXPERIENCE_ICONOGRAPHY_LINK = "https://btpx.frontify.com/document/223120#/design-language/iconography-p7615";

	var URLHelper = mobileLibrary.URLHelper;

	return BaseController.extend("sap.ui.demo.iconexplorer.controller.Info", {
		onInit : function () {
			var svgCard = sap.ui.require.toUrl("sap/m/demokit/iconExplorer/webapp/images/UI5PhoenixCardSVG.svg").replace("resources/", "test-resources/"),
				oInfoModel = new JSONModel({
					svgCard : svgCard
				});

			this.setModel(oInfoModel, "info");
		},

		/**
		 * Navigates to the overview when the link is pressed
		 * @public
		 */
		onIconExplorerLinkPressed : function () {
			this.getRouter().navTo("overview");
		},

		onInfoBTPIconographyPress: function() {
			URLHelper.redirect(BTP_EXPERIENCE_ICONOGRAPHY_LINK, false);
		},

		onDownloadBusinessSuiteIcons: function () {
			this._onDownload(SUPPORTED_FONTS.business);
		},

		onDownloadSAPIcons: function () {
			this._onDownload(SUPPORTED_FONTS.sap);
		},

		onDownloadTNTIcons: function () {
			this._onDownload(SUPPORTED_FONTS.tnt);
		},

		/**
		 * Downloads the icon font relatively from the respective button pressed
		 * @public
		 * @param {string} sFontName the original font name
		 */
		_onDownload: function (sFontName) {
			var oConfigs = this.getOwnerComponent()._oFontConfigs;
			var sDownloadURI = oConfigs[sFontName].downloadURI || oConfigs[sFontName].fontURI;

			if (Core.getConfiguration().getTheme().startsWith("sap_horizon")) {
				sDownloadURI = oConfigs[sFontName].downloadURIForHorizon || sDownloadURI;
			}

			mobileLibrary.URLHelper.redirect(sDownloadURI + sFontName + ".ttf");
		}

	});

}
);