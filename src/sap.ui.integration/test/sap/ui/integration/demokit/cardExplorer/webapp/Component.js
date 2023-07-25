sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/IconPool",
	"sap/ui/Device",
	"sap/ui/core/Core"
], function (
	UIComponent,
	IconPool,
	Device,
	oCore
) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.cardExplorer.Component", {

		metadata: {
			includes: [
				"css/style.css",
				"css/FileEditor.css"
			]
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this function, the device models are set and the router is initialized.
		 * @public
		 * @override
		 */
		init: function () {

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// specify the only supported language
			oCore.getConfiguration().setLanguage("en");

			// register TNT icon font
			IconPool.registerFont({
				fontFamily: "SAP-icons-TNT",
				fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts/")
			});

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ErrorHandler is destroyed.
		 * @public
		 * @override
		 */
		destroy: function () {
			if (this._pCookiesMgmtComponent) {
				this._pCookiesMgmtComponent.then(function(oCookiesMgmtComp) {
					oCookiesMgmtComp.destroy();
				});
			}

			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass: function () {
			if (document.body.classList.contains("sapUiSizeCompact") && !Device.support.touch) { // apply "compact" mode if touch is not supported
				return "sapUiSizeCompact";
			}
			// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
			return "sapUiSizeCozy";
		},

		getCookiesManagement: function() {
			var sId = "sap.ui.documentation.sdk.cookieSettingsDialog";

			if (!this._pCookiesMgmtComponent) {
				this._pCookiesMgmtComponent = this.createComponent({
					id: "cookiesMgmtComp-" + sId,
					usage: "cookieSettingsDialog"
				});
			}

			return this._pCookiesMgmtComponent;
		}
	});
});