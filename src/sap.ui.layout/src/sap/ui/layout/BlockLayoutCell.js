/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/Device',
	'./library',
	"./BlockLayoutCellRenderer",
	"sap/base/Log",
	"./BlockLayoutCellData",
	"sap/ui/thirdparty/jquery"
],
	function(Control, Device, library, BlockLayoutCellRenderer, Log, BlockLayoutCellData, jQuery) {
		"use strict";

		/**
		 * Constructor for a new BlockLayoutCell.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The BlockLayoutCell is used as an aggregation of the BlockLayoutRow. It contains Controls.
		 * The BlockLayoutCell should be used only as aggregation of the BlockLayoutRow.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.34
		 * @alias sap.ui.layout.BlockLayoutCell
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var BlockLayoutCell = Control.extend("sap.ui.layout.BlockLayoutCell", {
			metadata: {

				library: "sap.ui.layout",
				properties: {
					/**
					 * Defines the title of the cell.
					 * <b>Note:</b> When the <code>titleLink</code> aggregation is provided, the title of the cell will be replaced with the text from the <code>titleLink</code>.
					 */
					title: {type: "string", group: "Appearance", defaultValue: null},

					/**
					 * Defines the alignment of the cell title
					 */
					titleAlignment: {type: "sap.ui.core.HorizontalAlign", group: "Appearance", defaultValue: "Begin"},

					/**
					 * Defines the aria level of the title
					 * This information is e.g. used by assistive technologies like screenreaders to create a hierarchical site map for faster navigation.
					 */
					titleLevel: {type: "sap.ui.core.TitleLevel", group: "Appearance", defaultValue: "Auto"},

					/**
					 * Defines the width of the cell. Depending on the context of the cell - whether it's in scrollable,
					 * or non scrollable row, this property is interpreted in two different ways.
					 * If the cell is placed inside a scrollable row - this property defines the width of the cell in
					 * percentages. If no value is provided - the default is 40%.
					 * If the cell is placed inside a non scrollable row - this property defines the grow factor of the cell
					 * compared to the whole row.
					 * <b>For example:</b> If you have 2 cells, each with width of 1, this means that they should be of equal size,
					 * and they need to fill the whole row. This results in 50% width for each cell. If you have 2 cells,
					 * one with width of 1, the other with width of 3, this means that the whole row width is 4, so the first
					 * cell will have a width of 25%, the second - 75%.
					 * According to the visual guidelines, it is suggested that you only use 25%, 50%, 75% or 100% cells in
					 * you applications. For example, 12,5% width is not desirable (1 cell with width 1, and another with width 7)
					 */
					width: {type: "int", group: "Appearance", defaultValue: 0},
					/**
					 * The Background color set from which the background color will be selected.
					 * By using background colors from the predefined sets your colors could later be customized from the Theme Designer.
					 * <b>Note:</b> backgroundColorSet should be used only in combination with backgroundColorShade.
					 * @since 1.48
					 */
					backgroundColorSet: {type: "sap.ui.layout.BlockLayoutCellColorSet", group: "Appearance"},
					/**
					 * The index of the background color in the color set from which the color will be selected.
					 * By using background colors from the predefined sets your colors could later be customized from the Theme Designer.
					 * <b>Note:</b> backgroundColorShade should be used only in combination with backgroundColorSet.
					 * @since 1.48
					 */
					backgroundColorShade: {type: "sap.ui.layout.BlockLayoutCellColorShade", group: "Appearance"}
				},
				defaultAggregation: "content",
				aggregations: {
					/**
					 * The content to be included inside the cell
					 */
					content: {type: "sap.ui.core.Control", multiple: true, singularName: "content"},
					/**
					 * The link that will replace the title of the cell.
					 * <b>Note:</b> The only possible value is the <code>sap.m.Link</code> control.
					 * @since 1.56
					 */
					titleLink: {type: "sap.ui.core.Control", multiple : false}
				},
				designtime: "sap/ui/layout/designtime/BlockLayoutCell.designtime"
			}
		});

		BlockLayoutCell.prototype.setLayoutData = function (oLayoutData) {
			this.setAggregation("layoutData", oLayoutData, true); // No invalidate because layout data changes does not affect the control / element itself
			var oRow = this.getParent();
			if (oRow) {
				var oEvent = jQuery.Event("LayoutDataChange");
				oEvent.srcControl = this;
				oRow._handleEvent(oEvent);
			}
			//Check if current cell has defined width
			if (oLayoutData && this.getWidth() != 0) {
				this.getLayoutData().setSize(this.getWidth());
			}

			return this;
		};

		/**
		 * Sets the Width.
		 *
		 * @public
		 * @param {number} iWidth value.
		 * @returns {sap.ui.layout.BlockLayoutCell} this BlockLayoutCell reference for chaining.
		 */
		BlockLayoutCell.prototype.setWidth = function (iWidth) {
			this.setProperty("width", iWidth);

			if (this.getLayoutData() && (this.getLayoutData().isA("sap.ui.layout.BlockLayoutCellData"))) {
				this.getLayoutData().setSize(iWidth);
			}

			return this;
		};

		BlockLayoutCell.prototype.setTitleLink = function(oObject) {
			if (oObject && oObject.getMetadata().getName() !== "sap.m.Link") {
				Log.warning("sap.ui.layout.BlockLayoutCell " + this.getId() + ": Can't add value for titleLink aggregation different than sap.m.Link.");
				return this;
			}

			this.setAggregation("titleLink", oObject);

			return this;
		};

		BlockLayoutCell.prototype._setParentRowScrollable = function (scrollable) {
			this._parentRowScrollable = scrollable;
		};

		BlockLayoutCell.prototype.onAfterRendering = function (oEvent) {

			// fixes the issue in IE when the block layout size is auto
			// like BlockLayout in a Dialog
			if (Device.browser.internet_explorer) {

				 var bHasParentDialog = this.$().parents().toArray().some(function (element) {
					if (element.className.indexOf("sapMDialogScroll") !== -1) {
						return true;
					}
				});

				if (bHasParentDialog) {
					this.$()[0].style.flex = this._flexWidth + " 1 auto";
				}
			}
		};

		BlockLayoutCell.prototype._getParentRowScrollable = function () {
			return this._parentRowScrollable;
		};

		BlockLayoutCell.prototype._setFlexWidth = function (flexWidth) {
			this._flexWidth = flexWidth;
		};

		BlockLayoutCell.prototype._getFlexWidth = function () {
			return this._flexWidth;
		};

		return BlockLayoutCell;

	});