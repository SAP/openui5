/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseFilter",
	"sap/m/SearchField"
], function (
	BaseFilter,
	SearchField
) {
	"use strict";

	/**
	 * Constructor for a new <code>SearchFilter</code>.
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
	 * @since 1.98
	 * @alias sap.ui.integration.cards.filters.SearchFilter
	 */
	var SearchFilter = BaseFilter.extend("sap.ui.integration.cards.filters.SearchFilter", {
		metadata: {
			library: "sap.ui.integration",
			aggregations: {
				/**
				 * The internally used sap.m.SearchField control instance.
				 */
				_searchField: { type: "sap.m.SearchField", multiple: false, visibility: "hidden" }
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	/**
	 * @override
	 */
	SearchFilter.prototype.getField = function () {
		return this._getSearchField();
	};

	/**
	 * @override
	 */
	SearchFilter.prototype.getValueForModel = function () {
		return {
			value: this._escapeDoubleQuotes(this._getSearchField().getValue())
		};
	};

	SearchFilter.prototype._getSearchField = function () {
		var oControl = this.getAggregation("_searchField");
		if (!oControl) {
			oControl = this._createSearchField();
			this.setAggregation("_searchField", oControl);
		}

		return oControl;
	};

	/**
	 * Constructs a SearchField control configured with the Filter's properties.
	 *
	 * @private
	 * @returns {sap.m.SearchField} configured instance
	 */
	SearchFilter.prototype._createSearchField = function () {
		var oConfig = this.getConfig();
		var oSearchField = new SearchField({
			value: oConfig.value,
			placeholder: oConfig.placeholder
		});
		var oLabel = this.createLabel(oConfig);

		if (oLabel) {
			oSearchField.addAriaLabelledBy(oLabel);
		}

		oSearchField.attachChange(function () {
			this._setValue();
		}.bind(this));

		return oSearchField;
	};

	SearchFilter.prototype._escapeDoubleQuotes = function (sValue) {
		return sValue.replaceAll("\"", "\\\"");
	};

	return SearchFilter;
});