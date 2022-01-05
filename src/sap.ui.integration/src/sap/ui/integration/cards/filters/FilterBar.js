/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control"
], function (
	Control
) {
	"use strict";

	/**
	 * Constructor for a new <code>FilterBar</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.98
	 * @alias sap.ui.integration.cards.filters.FilterBar
	 */
	var FilterBar = Control.extend("sap.ui.integration.cards.filters.FilterBar", {
		metadata: {
			library: "sap.ui.integration",
			properties: { },
			aggregations: {
				content: { type: "sap.ui.core.Control", multiple: false }
			}

		},
		renderer: {
			apiVersion: 2,
			render: function (oRM, oFilterBar) {
				oRM.openStart("div", oFilterBar)
					.class("sapFCardFilterBar")
					.openEnd();

				oRM.renderControl(oFilterBar.getContent());

				oRM.close("div");
			}
		}
	});

	/**
	 * @private
	 * @ui5-restricted
	 */
	FilterBar.prototype.showLoadingPlaceholders = function () {
		this._getFilters().forEach(function (oFilter) {
			oFilter.showLoadingPlaceholders();
		});
	};

	/**
	 * @private
	 * @ui5-restricted
	 */
	FilterBar.prototype.hideLoadingPlaceholders = function () {
		this._getFilters().forEach(function (oFilter) {
			oFilter.hideLoadingPlaceholders();
		});
	};

	/**
	 * @private
	 * @ui5-restricted
	 */
	FilterBar.prototype.refreshData = function () {
		this._getFilters().forEach(function (oFilter) {
			oFilter.refreshData();
		});
	};

	FilterBar.prototype._getFilters = function () {
		var oContent = this.getContent();

		return oContent.getItems ? oContent.getItems() : oContent.getContent();
	};

	return FilterBar;
});