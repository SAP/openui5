/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/layout/cssgrid/GridLayoutBase",
	"sap/ui/layout/cssgrid/GridSettings",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery"
], function (
	GridLayoutBase,
	GridSettings,
	Device,
	jQuery
) {
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

	var GRID_GAP = "0.5rem";

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
				 *
				 * <b>Note:</b> When the property <code>boxMinWidth</code> or <code>boxWidth</code> is set this property has no effect.
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
			gridGap: GRID_GAP + " " + GRID_GAP
		});
	};

	/**
	 * @override
	 */
	GridBoxLayout.prototype._applySingleGridLayout = function (oElement) {

		GridLayoutBase.prototype._applySingleGridLayout.call(this, oElement);

		var oGridList = sap.ui.getCore().byId(oElement.parentElement.id);

		if (oGridList && oGridList.isA("sap.f.GridList") && oGridList.isGrouped()) {
			this._flattenHeight(oGridList);
		}

	};

	/**
	 * @override
	 */
	GridBoxLayout.prototype.addGridStyles = function (oRM) {
		GridLayoutBase.prototype.addGridStyles.apply(this, arguments);
		this._addSpanClasses(oRM);

		oRM.class("sapUiLayoutCSSGridBoxLayoutContainer");

	};

	/**
	 * Hook function for the Grid's onAfterRendering
	 * @param {sap.ui.layout.cssgrid.IGridConfigurable} oGrid The grid
	 * @override
	 * @protected
	 */
	GridBoxLayout.prototype.onGridAfterRendering = function (oGrid) {
		// Add a specific class to each grid item
		// Loops over each element's dom and adds the grid item class
		oGrid.getGridDomRefs().forEach(function (oDomRef) {
			if (oDomRef.children){
				for (var i = 0; i < oDomRef.children.length; i++) {
					if (!oDomRef.children[i].classList.contains("sapMGHLI") && !oDomRef.children[i].classList.contains("sapUiBlockLayerTabbable")) { // the item is not group header or a block layer tabbable
						oDomRef.children[i].classList.add("sapUiLayoutCSSGridItem");
					}
				}
			}
		});

		if (!this._hasBoxWidth()) {
			this._applySizeClass(oGrid);
		}

		if (oGrid.isA("sap.f.GridList") && oGrid.getGrowing()) { // if there is growing of the list new GridListItems are loaded and there could be changes in all GridListItems dimensions
			var fnCopyOfOnAfterPageLoaded = oGrid._oGrowingDelegate._onAfterPageLoaded;

			oGrid._oGrowingDelegate._onAfterPageLoaded = function () {
				fnCopyOfOnAfterPageLoaded.call(oGrid._oGrowingDelegate);

				if (oGrid.isA("sap.f.GridList") && oGrid.isGrouped()) {
						this._flattenHeight(oGrid);
				}
			}.bind(this);
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
	 * @override
	 * @protected
	 */
	GridBoxLayout.prototype.onGridResize = function (oEvent) {
		if (oEvent.control && oEvent.control.isA("sap.f.GridList") && oEvent.control.isGrouped()) {
			this._flattenHeight(oEvent.control);
		}

		if (oEvent) {
			// Size class is used when no boxWidth or boxMinWidth is being set.
			if (!this._hasBoxWidth()) {
				this._applySizeClass(oEvent.control);
			}
		}
	};

	/**
	 * Make all Elements inside the GridBoxLayout with equal heights
	 *
	 * @param {sap.ui.layout.cssgrid.IGridConfigurable} oControl The grid
	 * @private
	 */
	GridBoxLayout.prototype._flattenHeight = function (oControl) {
		var iMaxHeight = 0,
			sMaxHeight;

		this._loopOverGridItems(oControl, function (oGridItem) {
			if (!oGridItem.classList.contains("sapMGHLI")) {
				oGridItem.style.height = "";
			}
		});

		this._loopOverGridItems(oControl, function (oGridItem) {
			if (!oGridItem.classList.contains("sapMGHLI")) {
				iMaxHeight = Math.max(jQuery(oGridItem).outerHeight(), iMaxHeight);
			}
		});

		sMaxHeight = iMaxHeight + "px";

		this._loopOverGridItems(oControl, function (oGridItem) {
			if (!oGridItem.classList.contains("sapMGHLI")) {
				oGridItem.style.height = sMaxHeight;
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

		var oRange = Device.media.getCurrentRange("StdExt", oControl.$().width());
		if (!oRange) {
			return;
		}
		var sSizeClass = mSizeClasses[oRange.name];

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
	 * @param {sap.ui.core.RenderManager} oRM - RenderManager of the layout which will be rendered
	 * @private
	 */
	GridBoxLayout.prototype._addSpanClasses = function (oRM) {
		var aSpan,
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
				var sSpan = aSpan[i];
				if (!sSpan) {
					continue;
				}

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

		sSpanXLargeClass = sSpanXLargeClass || DEFAULT_SPAN_CLASSES.XL;
		sSpanLargeClass = sSpanLargeClass || DEFAULT_SPAN_CLASSES.L;
		sSpanMediumClass = sSpanMediumClass || DEFAULT_SPAN_CLASSES.M;
		sSpanSmallClass = sSpanSmallClass || DEFAULT_SPAN_CLASSES.S;

		oRM.class(sSpanXLargeClass)
			.class(sSpanLargeClass)
			.class(sSpanMediumClass)
			.class(sSpanSmallClass);
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

					// process only visible items
					// avoid using jQuery for performance reasons
					if (oDomRef.children[i].style.display !== "none" && oDomRef.children[i].style.visibility !== "hidden") {
						fn(oDomRef.children[i]);
					}
				}
			}
		});
	};

	return GridBoxLayout;
});