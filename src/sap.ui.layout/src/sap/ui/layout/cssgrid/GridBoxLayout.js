/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/layout/cssgrid/GridLayoutBase",
	"sap/ui/layout/cssgrid/GridSettings",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery"
], function (GridLayoutBase, GridSettings, Device, jQuery) {
	"use strict";

	var SPAN_PATTERN = /^([X][L](?:[1-9]|1[0-2]))? ?([L](?:[1-9]|1[0-2]))? ?([M](?:[1-9]|1[0-2]))? ?([S](?:[1-9]|1[0-2]))?$/i;

	var DEFAULT_SPAN_PATTERN = SPAN_PATTERN.exec("XL7 L6 M4 S2");

	// Maps StdExt sizes to BoxContainer size classes
	var mSizeClasses = {
		"Phone": "sapUiLayoutCSSGridBoxLayoutSizeS",
		"Tablet": "sapUiLayoutCSSGridBoxLayoutSizeM",
		"Desktop": "sapUiLayoutCSSGridBoxLayoutSizeL",
		"LargeDesktop": "sapUiLayoutCSSGridBoxLayoutSizeXL"
	};

	var DEFAULT_SPAN_CLASSES = {
		"XL": "sapUiLayoutCSSGridBoxLayoutSpanXL7",
		"L": "sapUiLayoutCSSGridBoxLayoutSpanL6",
		"M": "sapUiLayoutCSSGridBoxLayoutSpanM4",
		"S": "sapUiLayoutCSSGridBoxLayoutSpanS2"
	};

	/**
	 * Constructor for a new GridBoxLayout.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Applies a sap.ui.layout.cssgrid.GridSettings to a provided DOM element or Control.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.ui.layout.cssgrid.GridLayoutBase
	 *
	 * @since 1.60
	 * @constructor
	 * @public
	 * @alias sap.ui.layout.cssgrid.GridBoxLayout
	 * @ui5-metamodel This simple type will also be described in the UI5 (legacy) designtime metamodel
	 */
	var GridBoxLayout = GridLayoutBase.extend("sap.ui.layout.cssgrid.GridBoxLayout", {
		metadata: {
			library: "sap.ui.layout",
			properties: {

				/**
				 * Defines the minimum width of the Boxes
				 */
				boxMinWidth: {type: "sap.ui.core.CSSSize", defaultValue: ""},

				/**
				 * Defines the width of the Boxes
				 */
				boxWidth: {type: "sap.ui.core.CSSSize", defaultValue: ""},

				/**
				 * A string type that defines number of Boxes per row for extra large, large, medium and small screens
				 */
				boxesPerRowConfig: {type: "sap.ui.layout.BoxesPerRowConfig", group: "Behavior", defaultValue: "XL7 L6 M4 S2"}
			}
		}
	});

	/**
	 * @override
	 * @protected
	 * @returns {sap.ui.layout.cssgrid.GridSettings} The active GridSettings
	 */
	GridBoxLayout.prototype.getActiveGridSettings = function () {
		return new GridSettings({
			gridTemplateColumns: this._getTemplateColumns(),
			gridGap: "0.5rem 0.5rem"
		});
	};

	/**
	 * Apply display:grid styles to the provided HTML element or control based on the currently active GridSettings
	 *
	 * @protected
	 * @param {sap.ui.core.Control|HTMLElement} oElement The element or control on which to apply the display:grid styles
	 */
	GridBoxLayout.prototype._applySingleGridLayout = function (oElement) {
		if (this.isGridSupportedByBrowser()) {
			GridLayoutBase.prototype._applySingleGridLayout.call(this, oElement);
		}
	};

	/**
	 * Render display:grid styles. Used for non-responsive grid layouts.
	 *
	 * @param {sap.ui.core.RenderManager} rm The render manager of the Control which wants to render display:grid styles
	 */
	GridBoxLayout.prototype.renderSingleGridLayout = function (rm) {
		this._addSpanClasses(rm);

		if (this.isGridSupportedByBrowser()) {
			rm.addClass("sapUiLayoutCSSGridBoxLayoutContainer");
		} else {
			rm.addClass("sapUiLayoutCSSGridBoxLayoutPolyfill");
		}
	};

	/**
	 * Hook function for the Grid's onAfterRendering
	 * @param {sap.ui.layout.cssgrid.IGridConfigurable} oGrid The grid
	 */
	GridBoxLayout.prototype.onGridAfterRendering = function (oGrid) {
		// Add a specific class to each grid item
		GridLayoutBase.prototype.onGridAfterRendering.call(this, oGrid);

		if (!this._hasBoxWidth()) {
			this._applySizeClass(oGrid);
		}

		if (!this.isGridSupportedByBrowser()) {
			this._calcWidth(oGrid);
			this._flattenHeight(oGrid);

			if (!this._hasBoxWidth()) {
				this._applyClassForLastItem(oGrid);
			}
		}

		if (oGrid.isA("sap.f.GridList") && oGrid.getGrowing()) { // if there is growing of the list new GridListItems are loaded and there could be changes in all GridListItems dimensions
			var fnCopyOfOnAfterPageLoaded = oGrid._oGrowingDelegate._onAfterPageLoaded;

			oGrid._oGrowingDelegate._onAfterPageLoaded = function () {
				fnCopyOfOnAfterPageLoaded.call(oGrid._oGrowingDelegate);

				if (!this.isGridSupportedByBrowser()) {
					this._flattenHeight(oGrid);
					this._calcWidth(oGrid);
					this._loopOverGridItems(oGrid, function (oGridItem) {
						if (!oGridItem.classList.contains("sapMGHLI") && !oGridItem.classList.contains("sapUiBlockLayerTabbable")) { // the item is not group header or a block layer tabbable
							oGridItem.classList.add("sapUiLayoutCSSGridItem"); // newly loaded items don't have this class
						}
					});

					if (!this._hasBoxWidth()) {
						this._applyClassForLastItem(oGrid);
					}

				} else if (oGrid.isA("sap.f.GridList") && oGrid.isGrouped()) {
					this._flattenHeight(oGrid);
				}
			}.bind(this);
		}
	};

	/**
	 * Sets all display:grid styles to the provided HTML element
	 *
	 * @protected
	 * @param {HTMLElement} oElement The element to which to apply the grid styles
	 * @param {sap.ui.layout.cssgrid.GridSettings} oGridSettings The grid settings to apply
	 */
	GridBoxLayout.prototype._setGridLayout = function (oElement, oGridSettings) {
		var oGridList = sap.ui.getCore().byId(oElement.parentElement.id);

		// we need to overwrite this function since after it the GridListItems are with final dimensions and further calculation cold be done.
		GridLayoutBase.prototype._setGridLayout.call(this, oElement, oGridSettings);

		if (this.isGridSupportedByBrowser() && (oGridList && oGridList.isA("sap.f.GridList") && oGridList.isGrouped())) {
			this._flattenHeight(oGridList);
		}
	};

	/**
	 * @public
	 * @returns {boolean} If the Grid Layout is responsive.
	 */
	GridBoxLayout.prototype.isResponsive = function () {
		return true;
	};

	/**
	 * Resize handler for the GridBoxLayout.
	 * - Changes the size class if needed.
	 * - Manually flatten the height of the boxes.
	 *
	 * @param {object} oEvent - The event from a resize
	 * @private
	 */
	GridBoxLayout.prototype.onGridResize = function (oEvent) {
		if (!this.isGridSupportedByBrowser() || (oEvent.control && oEvent.control.isA("sap.f.GridList") && oEvent.control.isGrouped())) {
			this._flattenHeight(oEvent.control);
		}

		if (!this.isGridSupportedByBrowser() && !this._hasBoxWidth()){
			this._applyClassForLastItem(oEvent.control);
		}

		if (oEvent) {
			// Size class is used when no boxWidth or boxMinWidth is being set.
			if (!this._hasBoxWidth()) {
				this._applySizeClass(oEvent.control);
			}
		}
	};

	/**
	 * Make all Elements inside the GridBoxLayout with equal widths specified by one of
	 * boxMinWidth or boxWidth properties.
	 * Note: Only needed for IE11.
	 *
	 * @param {sap.ui.layout.cssgrid.IGridConfigurable} oControl The grid
	 * @private
	 */
	GridBoxLayout.prototype._calcWidth = function (oControl) {
		var sWidth;
		if (this._hasBoxWidth()) {
			sWidth = this.getBoxWidth() || this.getBoxMinWidth();
		}
		this._loopOverGridItems(oControl, function (oGridItem) {
			if (!oGridItem.classList.contains("sapMGHLI")) { // the item is not group header
				oGridItem.style.width = sWidth;
			}
		});
	};

	/**
	 * Make all Elements inside the GridBoxLayout with equal heights
	 *
	 * @param {sap.ui.layout.cssgrid.IGridConfigurable} oControl The grid
	 * @private
	 */
	GridBoxLayout.prototype._flattenHeight = function (oControl) {
		var iMaxHeight = 0;

		// We should set every item's height to auto and measure its value. If this is done on the real item this will result in flickering of the grid list.
		// In order to avoid this we create one "hidden" container, which we will use for those measurements.
		var $measuringContainer =  jQuery('<div style="position:absolute;top=-10000px;left=-10000px"></div>').appendTo(document.body);

		this._loopOverGridItems(oControl, function (oGridItem) {
			// Collect max height of all items (except group headers)
			if (!oGridItem.classList.contains("sapMGHLI")) {
				var $oClonedItem = jQuery(jQuery.clone(oGridItem)).appendTo($measuringContainer);
				$oClonedItem.css({
					height: 'auto',
					width: oGridItem.getBoundingClientRect().width
				});

				iMaxHeight = Math.max($oClonedItem.outerHeight(), iMaxHeight);
				$oClonedItem.remove();
			}
		});

		$measuringContainer.remove();

		this._loopOverGridItems(oControl, function (oGridItem) {
			// Apply height to all items
			if (!oGridItem.classList.contains("sapMGHLI")) { // the item is not group header
				oGridItem.style.height = iMaxHeight + "px";
			}
		});
	};


	GridBoxLayout.prototype._applyClassForLastItem = function (oControl) {
		var iCurrentNumberPerRow = 0;
		var aBoxesPerRowConfig = this.getBoxesPerRowConfig().split(" ");
		var oRange = Device.media.getCurrentRange("StdExt", oControl.$().width());
		var sSizeClassCode = mSizeClasses[oRange.name].substring("sapUiLayoutCSSGridBoxLayoutSize".length);
		var iMaxNumberPerRow;

		aBoxesPerRowConfig.forEach(function (element) {
			// Check if SizeClassCode (for example "XL") is contained inside the element
			if (element.indexOf(sSizeClassCode) != -1){
				// This splits the layout size and the maximum number of columns from the string: Example: "XL7" -> 7
				iMaxNumberPerRow = parseInt(element.substring(sSizeClassCode.length));
			}
		});

		this._loopOverGridItems(oControl, function (oGridItem) {
			if (oGridItem.classList.contains("sapUiLayoutCSSGridItem")) { // the item is not group header or a block layer tabbable, it is an item
				iCurrentNumberPerRow++;
				if (iCurrentNumberPerRow == iMaxNumberPerRow) {
					oGridItem.classList.add("sapUiLayoutCSSGridItemLastOnRow");
					iCurrentNumberPerRow = 0;
				} else {
					oGridItem.classList.remove("sapUiLayoutCSSGridItemLastOnRow");
				}
			} else if (oGridItem.classList.contains("sapMGHLI")) { // the item is group header, new row is following
				iCurrentNumberPerRow = 0;
			}
		});
	};

	/**
	 * Applies a size class on the list. The class is used for breakpoints.
	 * Note: The class is needed only when no fixed width is set on the boxes.
	 *
	 * @param {object} oControl - The grid that contains items.
	 * @private
	 */
	GridBoxLayout.prototype._applySizeClass = function (oControl) {

		var oRange = Device.media.getCurrentRange("StdExt", oControl.$().width()),
			sSizeClass = mSizeClasses[oRange.name];

		oControl.getGridDomRefs().forEach(function (oDomRef) {
			//Check if the class is already applied
			if (!oDomRef.classList.contains(sSizeClass)) {

				//Clear all size classes on the current DOMRef
				Object.keys(mSizeClasses).map(function (sSize) {
					oDomRef.classList.remove(mSizeClasses[sSize]);
				});
				oDomRef.classList.add(sSizeClass);
			}
		});
	};

	/**
	 * Returns a gridTemplateColumns value based on boxWidth and boxMinWidth properties
	 *
	 * @protected
	 * @returns {string} A value for gridTemplateColumns property
	 */
	GridBoxLayout.prototype._getTemplateColumns = function () {
		var sTemplateColumns = "";

		if (this.getBoxWidth()) {
			sTemplateColumns = "repeat(auto-fit, " + this.getBoxWidth() + ")";
		} else if (this.getBoxMinWidth()) {
			sTemplateColumns = "repeat(auto-fit, minmax(" + this.getBoxMinWidth() + ", 1fr))";
		}

		return sTemplateColumns;
	};

	/**
	 * Checks if boxWidth or boxMinWidth is set
	 * @returns {boolean} True if there is boxWidth or boxMinWidth set
	 * @private
	 */
	GridBoxLayout.prototype._hasBoxWidth = function () {
		if (this.getBoxWidth() || this.getBoxMinWidth()) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Adds the breakpoint classes depending on boxesPerRowConfig property
	 *
	 * @param {sap.ui.core.RenderManager} rm - RenderManager of the layout which will be rendered
	 * @private
	 */
	GridBoxLayout.prototype._addSpanClasses = function (rm) {
		var aSpan,
			sSpan,
			sSpanPattern = this.getBoxesPerRowConfig(),
			sSpanXLargeClass,
			sSpanLargeClass,
			sSpanMediumClass,
			sSpanSmallClass;

		// Span classes are used only when no boxWidth or boxMinWidth is being set.
		if (this._hasBoxWidth()) {
			return;
		}

		if (!sSpanPattern || !sSpanPattern.length === 0) {
			aSpan = DEFAULT_SPAN_PATTERN;
		} else {
			aSpan = SPAN_PATTERN.exec(sSpanPattern);
		}

		if (aSpan) {
			for (var i = 1; i < aSpan.length; i++) {
				sSpan = aSpan[i];

				if (sSpan) {
					sSpan = sSpan.toUpperCase();

					switch (sSpan.substr(0, 1)) {
						case "X":
							if (sSpan.substr(1, 1) === "L") {
								sSpanXLargeClass = this._getBoxesPerRowClass(sSpan, 2);
							}
							break;
						case "L":
							sSpanLargeClass = this._getBoxesPerRowClass(sSpan, 1);
							break;
						case "M":
							sSpanMediumClass = this._getBoxesPerRowClass(sSpan, 1);
							break;
						case "S":
							sSpanSmallClass = this._getBoxesPerRowClass(sSpan, 1);
							break;
						default:
							break;
					}
				}
			}
		}

		sSpanXLargeClass = sSpanXLargeClass || DEFAULT_SPAN_CLASSES.XL;
		sSpanLargeClass = sSpanLargeClass || DEFAULT_SPAN_CLASSES.L;
		sSpanMediumClass = sSpanMediumClass || DEFAULT_SPAN_CLASSES.M;
		sSpanSmallClass = sSpanSmallClass || DEFAULT_SPAN_CLASSES.S;

		rm.addClass([
			sSpanXLargeClass,
			sSpanLargeClass,
			sSpanMediumClass,
			sSpanSmallClass
		].join(" "));
	};

	/**
	 * Constructs the class name which should be used for that span and that index.
	 *
	 * @param {string} sSpan A string that represents the span - like XL12 or S4
	 * @param {number} iIndex How long is the text part of sSpan - 2 for XL, 1 for S and etc...
	 * @returns {string|undefined} The class which should be used
	 */
	GridBoxLayout.prototype._getBoxesPerRowClass = function (sSpan, iIndex) {
		var iSpan = parseInt(sSpan.substr(iIndex, sSpan.length));
		if (iSpan && iSpan > 0 && iSpan < 13) {
			return "sapUiLayoutCSSGridBoxLayoutSpan" + sSpan;
		}
	};

	/**
	 * Loops over each grid item and call passed function on each iteration.
	 *
	 * @param {sap.ui.layout.cssgrid.IGridConfigurable} oControl The grid
	 * @param {function} fn - Function that will be called on every child element. As parameter the DOM node of the child is passed.
	 */
	GridBoxLayout.prototype._loopOverGridItems = function (oControl, fn) {
		oControl.getGridDomRefs().forEach(function (oDomRef) {
			if (oDomRef && oDomRef.children) {
				for (var i = 0; i < oDomRef.children.length; i++) {
					fn(oDomRef.children[i]);
				}
			}
		});
	};


	return GridBoxLayout;
});