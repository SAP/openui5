sap.ui.define([
	"sap/ui/core/IconPool",
	"sap/ui/core/Theming",
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/ui/demo/iconexplorer/model/models",
	"sap/ui/demo/iconexplorer/model/IconModel",
	"sap/ui/demo/iconexplorer/model/FavoriteModel",
	"sap/ui/demo/iconexplorer/controller/ErrorHandler",
	"sap/ui/documentation/sdk/controller/util/ConfigUtil",
	"sap/ui/model/json/JSONModel",
	"sap/ui/VersionInfo"
], function(
	IconPool,
	Theming,
	UIComponent,
	Device,
	models,
	IconModel,
	FavoriteModel,
	ErrorHandler,
	ConfigUtil,
	JSONModel,
	VersionInfo
) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.iconexplorer.Component", {

		metadata : {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this function, the device models are set and the router is initialized.
		 * @public
		 * @override
		 */
		init : function () {

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set up a helper model to manage OpenUI5/SAPUI5
			VersionInfo.load().then(function (oVersionInfo) {
				var oVersionModel = new JSONModel({
					isOpenUI5: !!(oVersionInfo && oVersionInfo.gav && /openui5/i.test(oVersionInfo.gav))
				});
				this.setModel(oVersionModel, "versionData");

				// set up a helper model to manage favorite icons
				var oFavoriteModel = new FavoriteModel();
				this.setModel(oFavoriteModel, "fav");

				// set up an icon model that loads icons from the icon font
				var oIconModel = new IconModel(this._oIconsLoadedPromise);
				this.setModel(oIconModel);

				// set the device model
				this.setModel(models.createDeviceModel(), "device");

				// set the current year model
				var oModel = models.createSharedParamsModel();
				this.setModel(oModel, "sharedParams");

				var aFontsLoaded = [];
				var sLocalFontFolder = sap.ui.require.toUrl("sap/ui/demo/iconexplorer/fonts/base/");

				var oFontConfigs = {};
				oFontConfigs["SAP-icons"] = {
					fontFamily: "SAP-icons",
					fontURI: sap.ui.require.toUrl("sap/ui/core/themes/base/fonts/"),
					downloadURI: sLocalFontFolder,
					downloadURIForHorizon: sap.ui.require.toUrl("sap/ui/demo/iconexplorer/fonts/sap_horizon/")
				};

				var oTNTConfig = {
					fontFamily: "SAP-icons-TNT",
					fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts/"),
					downloadURI: sLocalFontFolder,
					downloadURIForHorizon: sap.ui.require.toUrl("sap/ui/demo/iconexplorer/fonts/sap_horizon/")
				};

				// register TNT icon font
				IconPool.registerFont(oTNTConfig);
				aFontsLoaded.push(IconPool.fontLoaded("SAP-icons-TNT"));
				oFontConfigs["SAP-icons-TNT"] = oTNTConfig;

				// load SAPUI5 fonts on demand
				if (!oVersionModel.getProperty("/isOpenUI5")) {
					var oBusinessSuiteConfig = {
						fontFamily: "BusinessSuiteInAppSymbols",
						fontURI: sap.ui.require.toUrl("sap/ushell/themes/base/fonts/")
					};

					// register BusinessSuiteInAppSymbols icon font
					IconPool.registerFont(oBusinessSuiteConfig);
					aFontsLoaded.push(IconPool.fontLoaded("BusinessSuiteInAppSymbols"));
					oFontConfigs["BusinessSuiteInAppSymbols"] = oBusinessSuiteConfig;
				}

				// create wrapper promise so controllers can register to it
				this.iconsLoaded();

				// init icon model when all promises have finished
				Promise.all(aFontsLoaded).then(function () {
					oIconModel.init(Object.keys(oFontConfigs));
					// We resolve the helper promise on component level when the promise in the icon model is resolved.
					// The app controller is instantiated before the component's init method, so it cannot directly
					// register to the icon model.
					oIconModel.iconsLoaded().then(function () {
						this._fnIconsLoadedResolve();
					}.bind(this));
				}.bind(this));
				this._oFontConfigs = oFontConfigs;

				// initialize the error handler with the component
				this._oErrorHandler = new ErrorHandler(this);

				// create the views based on the url/hash
				this.getRouter().initialize();
			}.bind(this));

			this.getCookiesManagement().then(function(oCookieMgmtComponent) {
				oCookieMgmtComponent.enable(this.getRootControl());
			}.bind(this));
		},

		/**
		 * Wrapper for the iconModel promise as the controller is instantiated earlier than the model
		 * @return {Promise|*} the icons loaded promise
		 */
		iconsLoaded: function () {
			if (!this._oIconsLoadedPromise) {
				this._oIconsLoadedPromise = new Promise(function (fnResolve, fnReject) {
					this._fnIconsLoadedResolve = fnResolve;
					this._fnIconsLoadedReject = fnReject;
				}.bind(this));
			}
			return this._oIconsLoadedPromise;
		},

		getConfigUtil: function() {
			if (!this._oConfigUtil) {
				this._oConfigUtil = new ConfigUtil(this);
			}
			return this._oConfigUtil;
		},

		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ErrorHandler is destroyed.
		 * @public
		 * @override
		 */
		destroy : function () {
			this._oErrorHandler.destroy();

			this._pCookiesComponent && this._pCookiesComponent.then(function(oCookiesMgmtComponent) {
				oCookiesMgmtComponent.destroy();
			});
			this._oConfigUtil.destroy();
			this._oConfigUtil = null;

			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass : function() {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},

		getCookiesManagement: function() {
			var sId = "sap.ui.documentation.sdk.cookieSettingsDialog";

			if (!this._pCookiesComponent) {
				this._pCookiesComponent = this.createComponent({
					usage: "cookieSettingsDialog",
					id: 'cookiesComp-' + sId
				});
			}

			return this._pCookiesComponent;
		}
	});

});