/*!
 * ${copyright}
 */

// Provides control sap.ui.mdc.valuehelp.FilterItemLayout.
sap.ui.define(
	[
		"sap/ui/mdc/filterbar/IFilterContainer",
		"sap/ui/layout/AlignedFlowLayout",
		"sap/m/OverflowToolbar",
		"sap/m/ToolbarSpacer",
		"sap/m/VBox"
	],
	(
		IFilterContainer,
		AlignedFlowLayout,
		Toolbar,
		ToolbarSpacer,
		VBox
	) => {
		"use strict";
		/**
		 * Constructor for a new filterBar/vh/FilterContainer.
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @class The FilterContainer is a IFilterContainer implementation for <code>AlignedFlowLayout</code>
		 * @extends sap.ui.mdc.filterbar.IFilterContainer
		 * @constructor
		 * @private
		 * @since 1.124.0
		 * @alias sap.ui.mdc.valuehelp.FilterContainer
		 */
		const FilterContainer = IFilterContainer.extend(
			"sap.ui.mdc.valuehelp.FilterContainer", {
				metadata: {
					aggregations: {

						/**
						 * Internal hidden aggregation to hold the inner layout.
						 */
						_layout: {
							type: "sap.ui.core.Control",
							multiple: false,
							visibility: "hidden"
						}
					}
				}
			}
		);

		FilterContainer.prototype.init = function() {
			this.aLayoutItems = [];

			this.oToolbar = new Toolbar(this.getId() + "-tbr", { content: [new ToolbarSpacer()] });

			this.oAlgnLayout = new AlignedFlowLayout(this.getId() + "-aflayout", {
				visible: "{$sap.ui.filterbar.mdc.FilterBarBase>/expandFilterFields}"
			}).addStyleClass("sapUiMdcFilterBarBaseAFLayout");

			this.oLayout = new VBox(this.getId() + "-vbox", {
				items: [this.oToolbar, this.oAlgnLayout]
			});

			this.setAggregation("_layout", this.oLayout, true);
		};

		FilterContainer.prototype.exit = function() {
			this.aLayoutItems.forEach((oItem) => {
				oItem.destroy();
			});
			this.aLayoutItems = null;
		};

		FilterContainer.prototype.addControl = function(oControl) {
			this.oToolbar.addContent(oControl);
		};

		FilterContainer.prototype.insertControl = function(oControl, iIndex) {
			this.oToolbar.insertContent(oControl, iIndex);
		};

		FilterContainer.prototype.removeControl = function(oControl) {
			this.oToolbar.removeContent(oControl);
		};

		FilterContainer.prototype.addEndContent = function(oControl) {
			this.oAlgnLayout.addEndContent(oControl);
		};

		FilterContainer.prototype.insertFilterField = function(oControl, iIndex) {
			this.aLayoutItems.splice(iIndex, 0, oControl);
			this._updateFilterBarLayout();
		};

		FilterContainer.prototype.removeFilterField = function(oControl) {
			let nIdx = -1;
			this.aLayoutItems.some((oLayoutItem, i) => {
				if (oControl === oLayoutItem) {
					nIdx = i;
					return true;
				}
				return false;
			});

			if (nIdx >= 0) {
				this.aLayoutItems.splice(nIdx, 1);
				this._updateFilterBarLayout();
			}

		};

		FilterContainer.prototype.getFilterFields = function() {
			return this.oAlgnLayout.getContent();
		};

		FilterContainer.prototype._updateFilterBarLayout = function(bShowAll) {
			const n = this.aLayoutItems.length;
			const iThreshold = this.getParent().getFilterFieldThreshold();

			let bUpdate = bShowAll || n <= iThreshold + 1;

			if (!bUpdate) {
				const aItems = this.oAlgnLayout.getContent();
				aItems.some((oItem, i) => {
					if (oItem != this.aLayoutItems[i]) {
						bUpdate = true;
						return true;
					}
					return false;
				});
			}

			if (bUpdate) {
				this.oAlgnLayout.removeAllContent();

				this.aLayoutItems.some((oLayoutItem, nIdx) => {
					if (bShowAll || n <= iThreshold || nIdx + 1 < iThreshold) {
						this.oAlgnLayout.insertContent(oLayoutItem, nIdx);
						return false;
					}
					return true;
				});
			}

			const oShowAllFiltersBtn = this.oAlgnLayout.getEndContent()[0];
			oShowAllFiltersBtn.setVisible(!bShowAll && n > iThreshold);
		};

		return FilterContainer;
	}
);