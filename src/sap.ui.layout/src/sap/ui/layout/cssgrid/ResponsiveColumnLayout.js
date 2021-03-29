/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/layout/cssgrid/GridLayoutBase",
	"sap/ui/layout/cssgrid/VirtualGrid",
	"sap/ui/dom/units/Rem",
	"sap/ui/Device",
	"sap/ui/layout/library"
], function (
	Core,
	GridLayoutBase,
	VirtualGrid,
	Rem,
	Device
) {
	"use strict";

	var iGridGap = Rem.toPx(1);
	var bRtl = Core.getConfiguration().getRTL();
	var mSizeColumns = {
		S: 4,
		M: 8,
		ML: 12,
		L: 12,
		XL: 16,
		XXL: 20,
		XXXL: 20
	};
	var RCL_RANGE_SET = "RCLRangeSet";

	Device.media.initRangeSet(RCL_RANGE_SET, [600, 1024, 1280, 1440, 1620, 1920], "px", ["S", "M", "ML", "L", "XL", "XXL", "XXXL"], true);

	/**
	 * Gets the columns property from the item's layout data.
	 * @private
	 * @param {sap.ui.core.Control} oItem The item
	 * @returns {number} The number of columns
	 */
	function getItemColumnCount(oItem) {
		var oLayoutData = oItem.getLayoutData();
		return (oLayoutData && oLayoutData.isA("sap.ui.layout.cssgrid.ResponsiveColumnItemLayoutData")) ? oLayoutData.getColumns() : 1;
	}

	/**
	 * Gets the rows property from the item's layout data.
	 * @private
	 * @param {sap.ui.core.Control} oItem The item
	 * @returns {number} The number of rows
	 */
	function getItemRowCount(oItem) {
		var oLayoutData = oItem.getLayoutData();
		return (oLayoutData && oLayoutData.isA("sap.ui.layout.cssgrid.ResponsiveColumnItemLayoutData")) ? oLayoutData.getRows() : 1;
	}

	/**
	 * Constructor for a new <code>ResponsiveColumnLayout</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * Represents a layout which displays variable number of columns, depending on available screen size.
	 * With that it achieves flexible layouts and line breaks for large, medium,
	 * and small-sized screens, such as desktop, tablet, and mobile.
	 *
	 * Grid row's height is dynamically determined by the height of the highest grid element on this row.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.ui.layout.cssgrid.GridLayoutBase
	 *
	 * @since 1.72
	 * @constructor
	 * @public
	 * @alias sap.ui.layout.cssgrid.ResponsiveColumnLayout
	 * @ui5-metamodel This simple type will also be described in the UI5 (legacy) designtime metamodel
	 */
	var ResponsiveColumnLayout = GridLayoutBase.extend("sap.ui.layout.cssgrid.ResponsiveColumnLayout", {
		metadata: {
			library: "sap.ui.layout",
			properties: {
			},
			events: {

				/**
				 * Fired when the currently active layout changes
				 */
				layoutChange: {
					parameters: {

						/**
						 * The name of the newly active layout - "S", "M", "ML", "L", "XL", "XXL" or "XXXL".
						 */
						layout: { type: "string" }
					}
				}
			}
		}
	});

	/**
	 * CSS class for the current layout.
	 * @string
	 * @private
	 */
	ResponsiveColumnLayout.prototype._sCurrentLayoutClassName = "";

	/**
	 * Returns if the Grid Layout is responsive.
	 * @public
	 * @returns {boolean} If the Grid Layout is responsive.
	 */
	ResponsiveColumnLayout.prototype.isResponsive = function () {
		return true;
	};

	/**
	 * Handler for IGridConfigurable onAfterRendering
	 *
	 * @private
	 * @param {sap.ui.layout.cssgrid.IGridConfigurable} oGrid The grid
	 */
	ResponsiveColumnLayout.prototype.onGridAfterRendering = function (oGrid) {
		this._applyLayout(oGrid);
	};


	/**
	 * Provides active settings for the <code>CSSGrid</code>.
	 *
	 * @returns {sap.ui.layout.cssgrid.GridSettings} ResponsiveColumnLayout The active GridSettings
	 * @override
	 */
	ResponsiveColumnLayout.prototype.getActiveGridSettings = function () {
		return null;
	};

	/**
	 * Resize handler for the ResponsiveColumnLayout.
	 *
	 * @param {object} oEvent - The event from a resize
	 * @private
	 */
	ResponsiveColumnLayout.prototype.onGridResize = function (oEvent) {
		if (!oEvent || oEvent.size.width === 0) {
			return;
		}

		this._applyLayout(oEvent.control);
	};

	/**
	 * @override
	 */
	ResponsiveColumnLayout.prototype.addGridStyles = function (oRM) {
		GridLayoutBase.prototype.addGridStyles.apply(this, arguments);

		if (this.isGridSupportedByBrowser()) {
			oRM.class("sapUiLayoutCSSGridRCL");
		} else {
			oRM.class("sapUiLayoutCSSGridRCLPolyfill");
		}
	};

	/**
	 * @override
	 */
	ResponsiveColumnLayout.prototype.hasGridPolyfill = function () {
		return true;
	};

	/**
	 * @private
	 * @ui5-restricted
	 */
	ResponsiveColumnLayout.prototype.getPolyfillSizes = function (oGrid) {
		var $grid = oGrid.$(),
			iWidth = $grid.parent().outerWidth(),
			oRange = Device.media.getCurrentRange(RCL_RANGE_SET, iWidth),
			iColumnsCount = mSizeColumns[oRange.name],
			iInnerWidth = $grid.innerWidth(),
			iColumnSize = Math.floor((iInnerWidth - iGridGap * (iColumnsCount - 1) ) / iColumnsCount);

		return {
			gap: iGridGap,
			rows: this._oVirtualGrid.rowsHeights.map(function (iHeight) { return iHeight + "px"; }),
			columns: new Array(iColumnsCount).fill(iColumnSize + "px")
		};
	};

	/**
	 * Changes the active layout if it's different than the currently active one.
	 *
	 * @param {sap.ui.layout.cssgrid.IGridConfigurable} oGrid The grid which layout is going to be updated
	 * @private
	 */
	ResponsiveColumnLayout.prototype._applyLayout = function (oGrid) {
		var iWidth = oGrid.$().parent().outerWidth(),
			oRange = Device.media.getCurrentRange(RCL_RANGE_SET, iWidth),
			sClassName = "sapUiLayoutCSSGridRCL-Layout" + oRange.name,
			bGridSupportedByBrowser = this.isGridSupportedByBrowser();

		if (!bGridSupportedByBrowser) {
			this._scheduleIEPolyfill(oGrid, oRange);
		}

		if (this._sCurrentLayoutClassName === sClassName) {
			return;
		}

		if (bGridSupportedByBrowser) {
			oGrid.removeStyleClass(this._sCurrentLayoutClassName);
			oGrid.addStyleClass(sClassName);
		}

		this._sCurrentLayoutClassName = sClassName;
		this.fireLayoutChange({
			layout: oRange.name
		});
	};

	/**
	 * Schedules the application of the IE polyfill for the next tick.
	 *
	 * @param {sap.ui.layout.cssgrid.IGridConfigurable} oGrid The grid
	 * @param {object} oRange The information about the current active range set
	 * @private
	 */
	ResponsiveColumnLayout.prototype._scheduleIEPolyfill = function (oGrid, oRange) {
		if (this._iPolyfillCallId) {
			clearTimeout(this._iPolyfillCallId);
		}

		this._iPolyfillCallId = setTimeout(function () {
			var sGridSuffix = oGrid.isA("sap.f.GridList") ? "listUl" : "",
				$grid = oGrid.$(sGridSuffix);

			this._applyIEPolyfillLayout(oGrid, $grid, oRange);
		}.bind(this), 0);
	};

	/**
	 * Calculates absolute positions for items, so it mimics a css grid.
	 *
	 * @param {sap.ui.layout.cssgrid.IGridConfigurable} oGrid The grid
	 * @param {jQuery} $grid The grid on which to add the polyfill
	 * @param {object} oRange The information about the current active range set
	 * @private
	 */
	ResponsiveColumnLayout.prototype._applyIEPolyfillLayout = function (oGrid, $grid, oRange) {

		if (oGrid.bIsDestroyed) {
			return;
		}

		var iColumnsCount = mSizeColumns[oRange.name],
			iInnerWidth = $grid.innerWidth(),
			aItems = oGrid.getItems(),
			iColumnSize = Math.floor((iInnerWidth - iGridGap * (iColumnsCount - 1) ) / iColumnsCount),
			iColumns,
			iRows,
			oItem,
			$item,
			mVirtualGridItems,
			mVirtualGridItem,
			i;

		// set the width and reset the height
		for (i = 0; i < aItems.length; i++) {
			oItem = aItems[i];
			$item = oItem.$();

			iColumns = getItemColumnCount(oItem);

			$item.css({
				position: 'absolute',
				height: 'auto',
				width: iColumnSize * iColumns + iGridGap * (iColumns - 1)
			});
		}

		var oVirtualGrid = new VirtualGrid();
		this._oVirtualGrid = oVirtualGrid;
		oVirtualGrid.init({
			numberOfCols: iColumnsCount,
			cellWidth: iColumnSize,
			unitOfMeasure: "px",
			gapSize: iGridGap,
			topOffset: 0,
			leftOffset: 0,
			allowDenseFill: false,
			rtl: bRtl,
			width: iInnerWidth,
			rowsAutoHeight: true
		});

		for (i = 0; i < aItems.length; i++) {

			oItem = aItems[i];

			if (!oItem.getVisible()) {
				continue;
			}

			$item = oItem.$();

			iColumns = getItemColumnCount(oItem);
			iRows = getItemRowCount(oItem);

			oVirtualGrid.fitElement(i + '', iColumns, iRows, $item.outerHeight(true));
		}

		oVirtualGrid.calculatePositions();

		mVirtualGridItems = oVirtualGrid.getItems();

		for (i = 0; i < aItems.length; i++) {
			oItem = aItems[i];
			$item = oItem.$();
			mVirtualGridItem = mVirtualGridItems[i];

			$item.css({
				position: 'absolute',
				top: mVirtualGridItem.top,
				left: mVirtualGridItem.left,
				height: mVirtualGridItem.height
			});
		}

		$grid.height(oVirtualGrid.getHeight());
	};

	return ResponsiveColumnLayout;
});