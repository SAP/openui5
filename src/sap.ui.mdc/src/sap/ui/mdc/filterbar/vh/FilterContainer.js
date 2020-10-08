/*
 * ! ${copyright}
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
		 * @private
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
			this.oToolbar = new Toolbar(this.getId() + "-tbr", { content: [new ToolbarSpacer()] });

			this.oAlgnLayout = new AlignedFlowLayout(this.getId() + "-aflayout",{
				visible: "{$sap.ui.filterbar.mdc.FilterBarBase>/showFilterFields}"
			}).addStyleClass("sapUiMdcFilterBarBaseAFLayout");

			this.oLayout = new VBox(this.getId() + "-vbox", {
				items: [this.oToolbar, this.oAlgnLayout]
			});

			this.setAggregation("_layout", this.oLayout, true);
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

		FilterContainer.prototype.insertFilterField = function (oControl, iIndex) {
			this.oAlgnLayout.insertContent(oControl, iIndex);
		};

		FilterContainer.prototype.addEndContent = function (oControl) {
			this.oAlgnLayout.addEndContent(oControl);
		};

		FilterContainer.prototype.removeFilterField = function (oControl) {
			this.oAlgnLayout.removeContent(oControl);
		};

		FilterContainer.prototype.getFilterFields = function () {
			return this.oAlgnLayout.getContent();
		};

		return FilterContainer;
	}
);
