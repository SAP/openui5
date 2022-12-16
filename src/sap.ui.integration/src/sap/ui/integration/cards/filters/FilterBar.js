/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/Control"
], function (
	ManagedObjectObserver,
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
				var bHasVisibleFilter = oFilterBar._getFilters().some(function (oFilter) { return oFilter.getVisible(); });
				if (!bHasVisibleFilter) {
					return;
				}

				oRM.openStart("div", oFilterBar)
					.class("sapFCardFilterBar")
					.openEnd();

				oRM.renderControl(oFilterBar.getContent());

				oRM.close("div");
			}
		}
	});

	FilterBar.prototype.init = function () {
		this._mObservers = new Map();
		this._oAggregationObserver = new ManagedObjectObserver(this._onContentAggregationChange.bind(this));
		this._fnFilterVisibilityChangeHandler = this._onFilterVisibilityChange.bind(this);
		this._fnObserveFilter = this._observeFilter.bind(this);

		this._oAggregationObserver.observe(this, {
			aggregations: [ "content" ]
		});
	};

	FilterBar.prototype.exit = function () {
		this._oAggregationObserver.disconnect();
		delete this._oAggregationObserver;

		this._mObservers.forEach(function (oObserver) { oObserver.disconnect(); });
		this._mObservers.clear();
		delete this._mObservers;

		delete this._fnFilterVisibilityChangeHandler;
		delete this._fnObserveFilter;
	};

	FilterBar.prototype._onContentAggregationChange = function (oChange) {
		if (oChange.mutation === "remove") {
			this._mObservers.forEach(function (oObserver) { oObserver.disconnect(); });
			this._mObservers.clear();
			return;
		}

		var oContent = oChange.child,
			sAggregationName = "items"; // sap.m.FlexBox

		if (oContent.isA("sap.ui.layout.AlignedFlowLayout")) {
			sAggregationName = "content";
		}

		if (oChange.mutation === "insert") {
			oContent.getAggregation(sAggregationName).forEach(this._fnObserveFilter);
		}
	};

	FilterBar.prototype._observeFilter = function (oFilter) {
		var sContentId = oFilter.getParent().getId(),
			oObserver = new ManagedObjectObserver(this._fnFilterVisibilityChangeHandler);

		oObserver.observe(oFilter, {
			properties: [ "visible" ]
		});
		this._mObservers.set(sContentId, oObserver);
	};

	FilterBar.prototype._onFilterVisibilityChange = function () {
		this.invalidate();
	};

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
		if (!oContent || !oContent.isA(["sap.m.FlexBox", "sap.ui.layout.AlignedFlowLayout"])) {
			return [];
		}

		return oContent.getItems ? oContent.getItems() : oContent.getContent();
	};

	return FilterBar;
});