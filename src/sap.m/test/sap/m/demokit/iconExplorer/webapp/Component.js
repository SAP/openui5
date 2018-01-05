sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/ui/demo/iconexplorer/model/models",
	"sap/ui/demo/iconexplorer/model/IconModel",
	"sap/ui/demo/iconexplorer/model/FavoriteModel",
	"sap/ui/demo/iconexplorer/controller/ErrorHandler",
	"sap/ui/core/IconPool"
], function (UIComponent, Device, JSONModel, models, IconModel, FavoriteModel, ErrorHandler, IconPool) {
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
			var oVersionInfo = sap.ui.getVersionInfo();
			var oVersionModel = new JSONModel({
				isOpenUI5: oVersionInfo && oVersionInfo.gav && /openui5/i.test(oVersionInfo.gav)
			});
			this.setModel(oVersionModel, "version");

			// set up a helper model to manage favorite icons
			var oFavoriteModel = new FavoriteModel();
			this.setModel(oFavoriteModel, "fav");

			// set up an icon model that loads icons from the icon font
			var oIconModel = new IconModel(this._oIconsLoadedPromise);
			this.setModel(oIconModel);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			var aFontLoaded = [],
				aFontNames = ["SAP-icons"];

			// register TNT icon font
			IconPool.registerFont({
				fontFamily: "SAP-icons-TNT",
				fontURI: jQuery.sap.getModulePath("sap.tnt.themes.base.fonts")
			});
			aFontLoaded.push(IconPool.fontLoaded("SAP-icons-TNT"));
			aFontNames.push("SAP-icons-TNT");

			// load SAPUI5 fonts on demand
			if (!oVersionModel.getProperty("/isOpenUI5")) {
				// register BusinessSuiteInAppSymbols icon font
				IconPool.registerFont({
					fontFamily: "BusinessSuiteInAppSymbols",
					fontURI: jQuery.sap.getModulePath("sap.ushell.themes.base.fonts")
				});
				aFontLoaded.push(IconPool.fontLoaded("BusinessSuiteInAppSymbols"));
				aFontNames.push("BusinessSuiteInAppSymbols");
			}

			// create wrapper promise so controllers can register to it
			this.iconsLoaded();

			// init icon model when all promises have finished
			Promise.all(aFontLoaded).then(function () {
				oIconModel.init(aFontNames);
				// We resolve the helper promise on component level when the promise in the icon model is resolved.
				// The app controller is instantiated before the component's init method, so it cannot directly
				// register to the icon model.
				oIconModel.iconsLoaded().then(function () {
					this._fnIconsLoadedResolve();
				}.bind(this));
			}.bind(this));

			// initialize the error handler with the component
			this._oErrorHandler = new ErrorHandler(this);

			// create the views based on the url/hash
			this.getRouter().initialize();
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

		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ErrorHandler is destroyed.
		 * @public
		 * @override
		 */
		destroy : function () {
			this._oErrorHandler.destroy();

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
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls
					// but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}

	});

});
