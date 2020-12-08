/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/m/library",
	"sap/m/HBox",
	"sap/ui/integration/cards/Filter"
], function (
	BaseObject,
	mLibrary,
	HBox,
	Filter
) {
	"use strict";

	var FlexWrap = mLibrary.FlexWrap;

	var RenderType = mLibrary.FlexRendertype;

	/**
	 * Constructor for a card Filter bar.
	 *
	 * @class
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.84
	 * @alias sap.ui.integration.util.FilterBarFactory
	 */
	var FilterBarFactory = BaseObject.extend("sap.ui.integration.util.FilterBarFactory", {
		metadata: {
			library: "sap.ui.integration"
		},
		constructor: function (oCard) {
			BaseObject.call(this);

			this._oCard = oCard;
		}
	});

	/**
	 * Creates a new filter bar which holds drop-down menus for filtering. Those drop-down menus are created based on the parameters configuration.
	 *
	 * @param {map} mFiltersConfig A map of the parameters config - the same that is defined in sap.card/configuration/parameters.
	 * @param {map} mFiltersValues The combined (runtime + manifest) values of the parameters.
	 * @returns {sap.m.HBox} The Filter bar.
	 */
	FilterBarFactory.prototype.create = function (mFiltersConfig, mFiltersValues) {
		var aFilters = [],
			aReadyPromises = [],
			mConfig,
			sKey,
			oFilter,
			oFilterBarStrip;

		for (sKey in mFiltersConfig) {
			mConfig = mFiltersConfig[sKey];

			oFilter = new Filter({
				card: this._oCard,
				key: sKey,
				config: mConfig,
				value: mFiltersValues[sKey] ? mFiltersValues[sKey].value : mConfig.value
			});

			this._awaitEvent(aReadyPromises, oFilter, "_ready");
			oFilter._setDataConfiguration(mConfig.data);

			aFilters.push(oFilter);
		}

		if (!aFilters.length) {
			return null;
		}

		for (var i = 0; i < aFilters.length - 1; i++) {
			aFilters[i].addStyleClass("sapUiTinyMarginEnd");
		}

		oFilterBarStrip = new HBox({
			wrap: FlexWrap.Wrap,
			renderType: RenderType.Bare,
			items: aFilters
		});

		Promise.all(aReadyPromises).then(function () {
			oFilterBarStrip.fireEvent("_filterBarDataReady");
		});

		return oFilterBarStrip;
	};

	/**
	 * Await for an event on a filter.
	 *
	 * @private
	 * @param {Promise[]} aPromises Array of promises that receives a new Promise
	 * @param {sap.ui.integration.cards.Filter} oFilter Filter instance that throws the event
	 * @param {string} sEvent Name of the event
	 */
	FilterBarFactory.prototype._awaitEvent = function (aPromises, oFilter, sEvent) {
		aPromises.push(new Promise(function (resolve) {
			oFilter.attachEventOnce(sEvent, function () {
				resolve();
			});
		}));
	};

	return FilterBarFactory;
});