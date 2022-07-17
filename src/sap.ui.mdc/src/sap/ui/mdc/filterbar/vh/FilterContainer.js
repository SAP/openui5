/*!
 * ${copyright}
 */

// Provides control sap.ui.mdc.filterbar.vh.FilterItemLayout.
sap.ui.define(
	[
		"sap/ui/mdc/filterbar/IFilterContainer",
		"sap/ui/layout/AlignedFlowLayout",
		"sap/m/Toolbar",
		"sap/m/ToolbarSpacer",
		"sap/m/VBox"
	],
	function (
		IFilterContainer,
		AlignedFlowLayout,
		Toolbar,
		ToolbarSpacer,
		VBox
	) {
		"use strict";
		/**
		 * Constructor for a new filterBar/vh/FilterContainer.
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @class The FilterContainer is a IFilterContainer implementation for <code>AlignedFlowLayout</code>
		 * @extends sap.ui.mdc.filterbar.IFilterContainer
		 * @constructor
		 * @protected
		 * @since 1.84.0
		 * @alias sap.ui.mdc.filterbar.vh.FilterContainer
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var FilterContainer = IFilterContainer.extend(
			"sap.ui.mdc.filterbar.vh.FilterContainer",
			{
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

		FilterContainer.prototype.init = function () {
			this.aLayoutItems = [];

			this.oToolbar = new Toolbar(this.getId() + "-tbr", { content: [new ToolbarSpacer()] });

			this.oAlgnLayout = new AlignedFlowLayout(this.getId() + "-aflayout",{
				visible: "{$sap.ui.filterbar.mdc.FilterBarBase>/expandFilterFields}"
			}).addStyleClass("sapUiMdcFilterBarBaseAFLayout");

			this.oLayout = new VBox(this.getId() + "-vbox", {
				items: [this.oToolbar, this.oAlgnLayout]
			});

			this.setAggregation("_layout", this.oLayout, true);
		};

		FilterContainer.prototype.exit = function() {
			this.aLayoutItems.forEach(function(oItem){
				oItem.destroy();
			});
			this.aLayoutItems = null;
		};

		FilterContainer.prototype.addControl = function (oControl) {
			this.oToolbar.addContent(oControl);
		};

		FilterContainer.prototype.insertControl = function (oControl, iIndex) {
			this.oToolbar.insertContent(oControl, iIndex);
		};

		FilterContainer.prototype.removeControl = function (oControl) {
			this.oToolbar.removeContent(oControl);
		};

		FilterContainer.prototype.addEndContent = function (oControl) {
			this.oAlgnLayout.addEndContent(oControl);
		};

		FilterContainer.prototype.insertFilterField = function (oControl, iIndex) {
			this.aLayoutItems.splice(iIndex, 0, oControl);
			this._updateFilterBarLayout();
		};

		FilterContainer.prototype.removeFilterField = function (oControl) {
			var nIdx = -1;
			this.aLayoutItems.some(function(oLayoutItem, i){
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

		FilterContainer.prototype.getFilterFields = function () {
			return this.oAlgnLayout.getContent();
		};

		FilterContainer.prototype._updateFilterBarLayout = function(bShowAll) {
			var n = this.aLayoutItems.length;
			var iThreshold = this.getParent().getFilterFieldThreshold();

			var bUpdate = bShowAll || n <= iThreshold + 1;

			if (!bUpdate) {
				var aItems = this.oAlgnLayout.getContent();
				aItems.some(function(oItem, i){
					if (oItem != this.aLayoutItems[i]) {
						bUpdate = true;
						return true;
					}
					return false;
				}.bind(this));
			}

			if (bUpdate) {
				this.oAlgnLayout.removeAllContent();

				this.aLayoutItems.some(function(oLayoutItem, nIdx) {
					if (bShowAll || n <= iThreshold ||  nIdx + 1 < iThreshold) {
						this.oAlgnLayout.insertContent(oLayoutItem, nIdx);
						return false;
					}
					return true;
				}.bind(this));
			}

			var oShowAllFiltersBtn = this.oAlgnLayout.getEndContent()[0];
			oShowAllFiltersBtn.setVisible(!bShowAll && n > iThreshold);
		};

		return FilterContainer;
	}
);
