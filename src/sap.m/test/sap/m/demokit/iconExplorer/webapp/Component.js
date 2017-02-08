sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/ui/demo/iconexplorer/model/models",
	"sap/ui/demo/iconexplorer/model/IconModel",
	"sap/ui/demo/iconexplorer/model/FavoriteModel",
	"sap/ui/demo/iconexplorer/controller/ErrorHandler"
], function (UIComponent, Device, models, IconModel, FavoriteModel, ErrorHandler) {
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

			// set up a helper model to manage favorite icons
			var oFavoriteModel = new FavoriteModel();
			this.setModel(oFavoriteModel, "fav");

			// set up an icon model that loads icons from the icon font
			var oIconModel = new IconModel(this._oIconsLoadedPromise);
			this.setModel(oIconModel);

			// We resolve the helper promise on component level when the promise in the icon model is resolved.
			// The app controller is instantiated before the components init method, so it cannot directly
			// register to the icon model.
			oIconModel.iconsLoaded().then(function () {
				this._fnIconsLoadedResolve();
			}.bind(this));

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// initialize the error handler with the component
			this._oErrorHandler = new ErrorHandler(this);

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		/**
		 * Wrapper for the iconModel promise as the controller is instantiated earlier than the model
		 * @return {Promise|*}
		 */
		iconsLoaded: function () {
			if (!this._oIconsLoadedPromise) {
				this._oIconsLoadedPromise = new Promise(function (fnResolve, fnReject) {
					this._fnIconsLoadedResolve = fnResolve;
					this._fnIconsLoadedReject = fnReject;
				}.bind(this))
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