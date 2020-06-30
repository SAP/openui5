/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/m/library",
	"sap/m/HBox",
	"sap/m/Select",
	"sap/ui/core/ListItem"
], function (
	BaseObject,
	mLibrary,
	HBox,
	Select,
	ListItem
) {
	"use strict";

	var FlexWrap = mLibrary.FlexWrap;

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
		var oFilterBar,
			aSelects = [],
			sKey,
			mConfig,
			sValue;

		for (sKey in mFiltersConfig) {
			mConfig = mFiltersConfig[sKey];
			sValue = mFiltersValues.get(sKey) || mConfig.value;

			aSelects.push(
				this._createSelect(sKey, mConfig, sValue)
			);
		}

		if (!aSelects.length) {
			return null;
		}

		oFilterBar = new HBox({
			wrap: FlexWrap.Wrap,
			items: aSelects
		});

		return oFilterBar;
	};

	FilterBarFactory.prototype._createSelect = function(sKey, mConfig, sValue) {
		var aItems = mConfig.items || [],
			oSelect;

		oSelect = new Select();

		aItems.forEach(function (mItem) {
			oSelect.addItem(new ListItem({
				key: mItem.key,
				text: mItem.title
			}));
		});

		oSelect.setSelectedKey(sValue);

		oSelect.attachChange(function () {
			this._oCard._setFilterValue(sKey, oSelect.getSelectedKey());
		}.bind(this));

		return oSelect;
	};

	return FilterBarFactory;
});
