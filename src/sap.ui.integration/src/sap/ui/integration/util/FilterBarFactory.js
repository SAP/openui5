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
	 * @param {map} mParamsConfig A map of the parameters config - the same that is defined in sap.card/configuration/parameters.
	 * @param {map} mParamsValues The combined (runtime + manifest) values of the parameters.
	 * @returns {sap.m.HBox} The Filter bar.
	 */
	FilterBarFactory.prototype.create = function (mParamsConfig, mParamsValues) {
		var oFilterBar,
			aSelects = [],
			sKey,
			mConfig,
			sValue;

		for (sKey in mParamsConfig) {
			mConfig = mParamsConfig[sKey];
			sValue = mParamsValues[sKey];

			if (!mConfig.filter) {
				continue;
			}

			aSelects.push(
				this._createSelect(sKey, mConfig.filter, sValue)
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
			this._oCard.setParameter(sKey, oSelect.getSelectedKey());
		}.bind(this));

		return oSelect;
	};

	return FilterBarFactory;
});
