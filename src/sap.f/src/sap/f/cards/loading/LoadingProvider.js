/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Core",
	"sap/f/cards/loading/GenericPlaceholder",
	"sap/f/cards/loading/ListPlaceholder"
], function (ManagedObject, Core, GenericPlaceholder, ListPlaceholder) {
	"use strict";

	/**
	 * Constructor for a new <code>LoadingProvider</code>.
	 *
	 * @param {string} [sId] ID for the new data provider, generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new data provider.
	 *
	 * @class
	 *
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.f.cards.LoadingProvider
	 */
	var LoadingProvider = ManagedObject.extend("sap.f.cards.loading.LoadingProvider", {});

	/**
	 * Creates initial loading state.
	 *
	 * @private
	 * @param {Object} oDataProvider Data Provider
	 */
	LoadingProvider.prototype.createLoadingState = function (oDataProvider) {
		this._bLoading = true;
		this._bJSON = false;

		if (oDataProvider) {

			//loading not needed
			if (oDataProvider.getSettings()['json']) {
				this._bJSON = true;
			}

		} else {
			this._bLoading = false;
		}
	};

	LoadingProvider.prototype.getDataProviderJSON = function () {
	   return  this._bJSON;
	};

	LoadingProvider.prototype.setLoading =   function (bLoading) {
		this._bLoading = bLoading;

		return this._bLoading;
	};

	LoadingProvider.prototype.getLoadingState =   function () {

		return this._bLoading;
	};

	LoadingProvider.prototype.removeHeaderPlaceholder = function (oControl) {
		if (oControl && oControl.getDomRef()) {
			oControl.removeStyleClass("sapFCardHeaderLoading");
			oControl.getDomRef().classList.remove("sapFCardHeaderLoading");
		}
	};

	LoadingProvider.prototype.destroy = function () {
		this._bLoading = null;
		this._bJSON = null;

		if (this._oContentPlaceholder) {
			this._oContentPlaceholder.destroy();
			this._oContentPlaceholder = null;
		}

		ManagedObject.prototype.destroy.apply(this, arguments);
	};

	LoadingProvider.prototype.createContentPlaceholder = function (oConfiguration, sType) {
			switch (sType) {
				case "List":
					this._oContentPlaceholder =  new ListPlaceholder({
						maxItems: oConfiguration.maxItems ? parseInt(oConfiguration.maxItems) : 2,
						item: oConfiguration.item
					});
				break;
				default:
					this._oContentPlaceholder = new GenericPlaceholder();
			}

		return this._oContentPlaceholder;
	};

	return LoadingProvider;
});
