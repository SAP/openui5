/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseFilter",
	"sap/base/Log",
	"sap/ui/core/library",
	"sap/ui/integration/util/DateRangeHelper"
], function (
	BaseFilter,
	Log,
	coreLibrary,
	DateRangeHelper
) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>DateRangeFilter</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.ui.integration.cards.filters.BaseFilter
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.96
	 * @alias sap.ui.integration.cards.filters.DateRangeFilter
	 */
	var DateRangeFilter = BaseFilter.extend("sap.ui.integration.cards.filters.DateRangeFilter", {
		metadata: {
			library: "sap.ui.integration",
			aggregations: {
				/**
				 * The internally used sap.m.DynamicDateRange control instance.
				 */
				_ddr: { type: "sap.m.DynamicDateRange", multiple: false, visibility: "hidden" }
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	/**
	 * @override
	 */
	DateRangeFilter.prototype.getField = function () {
		return this._getDdr();
	};

	/**
	 * @override
	 */
	DateRangeFilter.prototype.setValueFromOutside = function (vValue) {
		Log.error("Setting a filter value programatically on a DateRangeFilter is currently unsupported.", null, "sap.ui.integration.widgets.Card");
	};

	/**
	 * @override
	 */
	DateRangeFilter.prototype.getValueForModel = function () {
		return DateRangeHelper.getValueForModel(this._getDdr());
	};

	DateRangeFilter.prototype._getDdr = function () {
		var oControl = this.getAggregation("_ddr");
		if (!oControl) {
			oControl = this._createDdr();
			this.setAggregation("_ddr", oControl);
		}

		return oControl;
	};

	/**
	 * Constructs a DynamicDateRange control configured with the Filter's properties.
	 *
	 * @private
	 * @returns {sap.m.DynamicDateRange} configured instance
	 */
	DateRangeFilter.prototype._createDdr = function () {
		var oConfig = Object.assign({}, this.getConfig());

		oConfig.options = oConfig.options || this._getDefaultOptions();

		var oDdr = DateRangeHelper.createInput(oConfig, this.getCardInstance(), false);

		oDdr.addStyleClass("sapFCardDateRangeField");
		oDdr.attachChange(function (oEvent) {
			if (oEvent.getParameter("valid")) {
				oDdr.setValueState(ValueState.None);
				this._syncValue();
			} else {
				oDdr.setValueState(ValueState.Error);
			}
		}.bind(this));

		var oLabel = this.createLabel(oConfig);
		if (oLabel) {
			oDdr.addAriaLabelledBy(oLabel);
		}

		return oDdr;
	};

	DateRangeFilter.prototype._getDefaultOptions = function () {
		return [
			"date",
			"today",
			"dateRange",
			"from",
			"to",
			"lastDays",
			"nextDays",
			"lastWeeks",
			"nextWeeks"
		];
	};

	return DateRangeFilter;
});