/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"jquery.sap.storage"
	], function (jQuery, Controller/* jQuerySapStorage */) {
	"use strict";

	return Controller.extend("sap.ui.demokit.explored.view.base", {

		//========= members =======================================================================

		_oViewSettings: null, // set on init

		_oStorage: jQuery.sap.storage(jQuery.sap.storage.Type.local),

		_sStorageKey: "UI5_EXPLORED_VIEW_SETTINGS",

		_oDefaultSettings: {
			filter: {},
			groupProperty: "category",
			groupDescending: false,
			compactOn: false,
			themeActive: "sap_belize",
			rtl: false,
			version: jQuery.sap.Version(sap.ui.version).getMajor() + "." + jQuery.sap.Version(sap.ui.version).getMinor()
		},


		// ========= internal ===========================================================================

		/**
		 * Makes sure the view settings are initialized and updates the filter bar dispay and list binding
		 */
		_applyViewConfigurations: function () {
			if (!this._oViewSettings) {

				// init the view settings
				this._initViewSettings();

				// apply app settings
				this.getOwnerComponent().getEventBus().publish("app", "applyAppConfiguration", {
					themeActive: this._oViewSettings.themeActive,
					compactOn: this._oViewSettings.compactOn
				});

			}
		},

		/**
		 * Inits the view settings. At first local storage is checked. If this is empty defaults are applied.
		 */
		_initViewSettings: function () {

			var sJson = this._oStorage.get(this._sStorageKey);
			if (!sJson) {

				// local storage is empty, apply defaults
				this._oViewSettings = this._oDefaultSettings;

			} else {
				// parse
				this._oViewSettings = JSON.parse(sJson);

				// clean filter and remove values that do not exist any longer in the data model
				// (the cleaned filter are not written back to local storage, this only happens on changing the view settings)
				//var oFilterData = this.getView().getModel("filter").getData();
				var oFilterData = this.getOwnerComponent().getModel("filter").getData();
				var oCleanFilter = {};
				jQuery.each(this._oViewSettings.filter, function (sProperty, aValues) {
					var aNewValues = [];
					jQuery.each(aValues, function (i, aValue) {
						var bValueIsClean = false;
						jQuery.each(oFilterData[sProperty], function (i, oValue) {
							if (oValue.id === aValue) {
								bValueIsClean = true;
								return false;
							}
						});
						if (bValueIsClean) {
							aNewValues.push(aValue);
						}
					});
					if (aNewValues.length > 0) {
						oCleanFilter[sProperty] = aNewValues;
					}
				});
				this._oViewSettings.filter = oCleanFilter;

				// handling data stored with an older explored versions
				if (!this._oViewSettings.hasOwnProperty("compactOn")) { // compactOn was introduced later
					this._oViewSettings.compactOn = false;
				}

				if (!this._oViewSettings.hasOwnProperty("themeActive")) { // themeActive was introduced later
					this._oViewSettings.themeActive = "sap_bluecrystal";
				} else if (this._oViewSettings.version !== this._oDefaultSettings.version) {
					var oVersion = jQuery.sap.Version(sap.ui.version);
					if (oVersion.compareTo("1.40.0") >= 0) { 	// Belize theme is available since 1.40
						this._oViewSettings.themeActive = "sap_belize";
					} else { // Fallback to BlueCrystal for older versions
						this._oViewSettings.themeActive = "sap_bluecrystal";
					}
				}

				if (!this._oViewSettings.hasOwnProperty("rtl")) { // rtl was introduced later
					this._oViewSettings.rtl = false;
				}

				// handle RTL-on in settings as this need a reload
				if (this._oViewSettings.rtl && !jQuery.sap.getUriParameters().get('sap-ui-rtl')) {
					this._handleRTL(true);
				}
			}
		},

		// trigger reload w/o URL-Parameter;
		_handleRTL: function (bSwitch) {

			jQuery.sap.require("sap.ui.core.routing.HashChanger");
			var HashChanger = sap.ui.require("sap/ui/core/routing/HashChanger");
			var oHashChanger = new HashChanger();
			var sHash = oHashChanger.getHash();
			var oUri = window.location;

			// TODO: remove this fix when microsoft fix this under IE11 on Win 10
			if (!window.location.origin) {
				window.location.origin = window.location.protocol + "//" +
					window.location.hostname +
					(window.location.port ? ':' + window.location.port : '');
			}

			if (bSwitch) {
				// add the parameter
				window.location = oUri.origin + oUri.pathname + "?sap-ui-rtl=true#" + sHash;
			} else {
				// or remove it
				window.location = oUri.origin + oUri.pathname + "#/" + sHash;
			}

		}

	});
});
