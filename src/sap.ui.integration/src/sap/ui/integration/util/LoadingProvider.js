/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/library",
	"sap/ui/core/Element",
	"sap/f/cards/loading/GenericPlaceholder",
	"sap/f/cards/loading/ListPlaceholder"
], function (library, Element, GenericPlaceholder, ListPlaceholder) {
	"use strict";

	/**
	 * Constructor for a new <code>LoadingProvider</code>.
	 *
	 * @param {string} [sId] ID for the new data provider, generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new data provider.
	 *
	 * @class
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.f.cards.LoadingProvider
	 */
	var LoadingProvider = Element.extend("sap.ui.integration.util.LoadingProvider", {
		metadata: {
			library: "sap.ui.integration",

			properties: {
				/**
				 * The current loading state.
				 */
				loading: { type: "boolean", defaultValue: false }
			}
		}
	});

	LoadingProvider.prototype.setLoading = function (bLoading) {
		if (this.isDataProviderJson()) {
			return;
		}

		this.setProperty("loading", bLoading);
	};

	LoadingProvider.prototype.isDataProviderJson = function () {
		return !!(this._oDataProvider && this._oDataProvider.getSettings() && this._oDataProvider.getSettings()["json"]);
	};

	LoadingProvider.prototype.setDataProvider = function (oDataProvider) {
		this._oDataProvider = oDataProvider;
	};

	LoadingProvider.prototype.destroy = function () {
		if (this._oContentPlaceholder) {
			this._oContentPlaceholder.destroy();
			this._oContentPlaceholder = null;
		}

		this._oDataProvider = null;

		Element.prototype.destroy.apply(this, arguments);
	};

	LoadingProvider.prototype.createContentPlaceholder = function (oConfiguration, sType) {
		switch (sType) {
			case "List":
				this._oContentPlaceholder = new ListPlaceholder({
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