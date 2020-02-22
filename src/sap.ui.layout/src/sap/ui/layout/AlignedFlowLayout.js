/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	"./library",
	"sap/ui/core/ResizeHandler",
	"./AlignedFlowLayoutRenderer",
	"sap/ui/dom/units/Rem"
],
	function(
		Core,
		Control,
		library,
		ResizeHandler,
		AlignedFlowLayoutRenderer,
		Rem
	) {
		"use strict";

		/* global ResizeObserver */

		/**
		 * Constructor for a new AlignedFlowLayout.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The <code>AlignedFlowLayout</code> control arranges its child controls evenly across the horizontal space available.
		 * Each item takes up the same width and grows and shrinks in response to the layout width.
		 * Items not fitting into a row with the configured <code>minItemWidth</code> property wrap into
		 * the next row (like in a regular flow layout). However, those wrapped items have the same flexible width as
		 * the items in the rows above, so they are aligned.
		 *
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @experimental This control is only for internal/experimental use and the API will change!
		 *
		 * @since 1.48
		 * @alias sap.ui.layout.AlignedFlowLayout
		 * @ui5-metamodel This control will also be described in the UI5 (legacy) design time meta model.
		 */
		var AlignedFlowLayout = Control.extend("sap.ui.layout.AlignedFlowLayout", {
			metadata: {
				library: "sap.ui.layout",
				properties: {

					/**
					 * Sets the minimum width of items.
					 * It prevents items from becoming smaller than the value specified.
					 * <b>Note:</b> If <code>minItemWidth</code> is greater than <code>maxItemWidth</code>,
					 * <code>maxItemWidth</code> wins.
					 */
					minItemWidth: {
						type: "sap.ui.core.AbsoluteCSSSize",
						defaultValue: "12rem"
					},

					/**
					 * Sets the maximum width of items.
					 * It prevents items from becoming larger than the value specified.
					 */
					maxItemWidth: {
						type: "sap.ui.core.AbsoluteCSSSize",
						defaultValue: "24rem"
					}
				},
				defaultAggregation: "content",
				aggregations: {

					/**
					 * Defines the content contained within this control.
					 * Flow layouts are typically used to arrange input controls, such as text input fields, but also
					 * buttons, images, etc.
					 */
					content: {
						type: "sap.ui.core.Control",
						multiple: true
					},

					/**
					 * Defines the area which is positioned at the bottom on the right of the entire layout control.
					 */
					endContent: {
						type: "sap.ui.core.Control",
						multiple: true
					}
				}
			}
		});

		AlignedFlowLayout.prototype.init = function() {

			// resize observer feature detection
			if (typeof ResizeObserver === "function") {

				this.oResizeObserver = new ResizeObserver(this.onResize.bind(this));

			// resize handler fallback for old browsers (e.g. IE 11)
			} else {

				// registration ID used for de-registering the resize handler
				this._sResizeHandlerContainerListenerID = ResizeHandler.register(this, this.onResizeHandler.bind(this));
			}
		};

		AlignedFlowLayout.prototype.exit = function() {

			// resize observer cleanup
			this.disconnectResizeObserver();
			this.oResizeObserver = null;

			// resize handler cleanup
			this.disconnectResizeHandler();
			this._sResizeHandlerContainerListenerID = "";
			this._sResizeHandlerEndItemListenerID = "";
		};

		AlignedFlowLayout.prototype.onAfterRenderingOrThemeChanged = function() {
			var oDomRef = this.getDomRef(),
				oEndItemDomRef = this.getDomRef("endItem"),
				bEndItemAndContent = !!(this.hasContent() && oDomRef && oEndItemDomRef);

			if (bEndItemAndContent) {
				var oLayoutComputedStyle = window.getComputedStyle(oDomRef, null),
					iLayoutPaddingTop = oLayoutComputedStyle.getPropertyValue("padding-top"),
					mEndItemStyle = oEndItemDomRef.style;

				// adapt the position of the absolute-positioned end item in case a standard CSS class is added
				if (Core.getConfiguration().getRTL()) {
					mEndItemStyle.left = oLayoutComputedStyle.getPropertyValue("padding-left");
				} else {
					mEndItemStyle.right = oLayoutComputedStyle.getPropertyValue("padding-right");
				}

				mEndItemStyle.bottom = iLayoutPaddingTop;
			}

			this.reflow({ domRef: oDomRef, endItemDomRef: oEndItemDomRef });
		};

		AlignedFlowLayout.prototype.onBeforeRendering = function() {
			this.disconnectResizeObserver();
			this.disconnectResizeHandlerForEndItem();
		};

		AlignedFlowLayout.prototype.onAfterRendering = function() {
			this.observeSizeChangesIfRequired();
			this.onAfterRenderingOrThemeChanged();
		};

		AlignedFlowLayout.prototype.onThemeChanged = AlignedFlowLayout.prototype.onAfterRenderingOrThemeChanged;

		// this resize handler needs to be called on after rendering, theme change, and whenever the width of this
		// control changes
		AlignedFlowLayout.prototype.onResizeHandler = function(oEvent) {

			// avoid cyclic dependencies and infinite resizing callback loops
			if (oEvent.size.width !== oEvent.oldSize.width) {
				this.reflow();
			}
		};

		AlignedFlowLayout.prototype.onResize = function(aEntries) {
			window.requestAnimationFrame(function() {
				this.reflow();
			}.bind(this));
		};

		/**
		 * Re-calculates the positions and geometries of items in the <code>AlignFlowLayout</code> control to re-arrange
		 * items evenly across the horizontal space available (if necessary).
		 *
		 * @param {object} [oSettings] Settings to reflow the <code>AlignedFlowLayout</code> control
		 * @param {HTMLDivElement} [oSettings.domRef] The root control's DOM reference
		 * @param {HTMLDivElement} [oSettings.endItemDomRef] The end item's DOM reference
		 * @protected
		 * @since 1.60
		 */
		AlignedFlowLayout.prototype.reflow = function(oSettings) {
			var aContent = this.getContent();

			// skip unnecessary style recalculations if the items are not rendered or are rendered async
			if ((aContent.length === 0) || !aContent[0].isActive()) {
				return;
			}

			oSettings = oSettings || {};
			var oDomRef = oSettings.domRef || this.getDomRef();

			// skip unnecessary style recalculations if the control root DOM element has been removed
			// from the DOM
			if (!oDomRef) {
				return;
			}

			var oEndItemDomRef = oSettings.endItemDomRef || this.getDomRef("endItem"),
				oLastItemDomRef = this.getLastItemDomRef();

			if (!oEndItemDomRef || !oLastItemDomRef) {

				// skip unnecessary style recalculations if the any ancestor
				// is hidden (the "display" style property is set to "none")
				if (!oDomRef.offsetParent) {
					return;
				}

				this.toggleDisplayOfSpacers(oDomRef);
				return;
			}

			var oLastSpacerDomRef = oDomRef.lastElementChild,
				mLastSpacerStyle = oLastSpacerDomRef.style;

			mLastSpacerStyle.width = "";
			mLastSpacerStyle.height = "";
			mLastSpacerStyle.display = "";
			oDomRef.classList.remove(this.getRenderer().CSS_CLASS + "OneLine");

			// skip unnecessary style recalculations if the any ancestor is hidden
			// (the "display" style property is set to "none")
			if (!oDomRef.offsetParent) {
				return;
			}

			var iEndItemHeight = oEndItemDomRef.offsetHeight,
				iEndItemWidth = oEndItemDomRef.offsetWidth,
				iLastItemOffsetTop = oLastItemDomRef.offsetTop,
				iLastItemOffsetLeft = oLastItemDomRef.offsetLeft,
				iEndItemOffsetLeft,
				iAvailableWidthForEndItem;

			if (Core.getConfiguration().getRTL()) {
				iAvailableWidthForEndItem = iLastItemOffsetLeft;
			} else {
				var iLastItemMarginRight = Number.parseFloat(window.getComputedStyle(oLastItemDomRef).marginRight);
				var iRightBorderOfLastItem = iLastItemOffsetLeft + oLastItemDomRef.offsetWidth + iLastItemMarginRight;
				iAvailableWidthForEndItem = oDomRef.offsetWidth - iRightBorderOfLastItem;
			}

			var bEnoughSpaceForEndItem = iAvailableWidthForEndItem >= iEndItemWidth;

			// if the end item fits into the line
			if (bEnoughSpaceForEndItem) {

				if (this.checkItemsWrapping(oDomRef)) { // if multiple lines mode

					// if the end item overlaps the items on the first line,
					// this usually occurs when the end item is higher than the other items
					if (oEndItemDomRef.offsetTop < iLastItemOffsetTop) {
						mLastSpacerStyle.height = Math.max(0, iEndItemHeight - iLastItemOffsetTop) + "px";

						// Detect collision of the last two items after increasing the height
						// of the last spacer.
						// Increasing the height of the last spacer may cause the vertical
						// scrollbar to be visible, which would decrease the available width
						// and possibly causing a collision of the last two items.
						if (oLastItemDomRef.offsetTop >= oEndItemDomRef.offsetTop) {
							iEndItemOffsetLeft = oEndItemDomRef.offsetLeft;
							iLastItemOffsetLeft = oLastItemDomRef.offsetLeft;

							if (
								(iEndItemOffsetLeft >= iLastItemOffsetLeft) &&
								(iEndItemOffsetLeft <= (iLastItemOffsetLeft + oLastItemDomRef.offsetWidth))
							) {
								mLastSpacerStyle.height = iEndItemHeight + "px";
							}
						}

						mLastSpacerStyle.display = "block";

					} else {
						mLastSpacerStyle.height = "0";
						mLastSpacerStyle.display = "";
					}

				} else { // first line mode and the end item fits into the line

					// if the height of the end item is higher than the other items on the first line,
					// the end item goes up and overflow its container
					if (oEndItemDomRef.offsetTop < iLastItemOffsetTop) {

						// increase the height of the last spacer item to make the end item go down
						mLastSpacerStyle.height = iEndItemHeight + "px";
					}

					mLastSpacerStyle.display = "block";
				}

			} else { // not enough space, increase the height of the last spacer item to make the endContent go down
				mLastSpacerStyle.height = iEndItemHeight + "px";
				mLastSpacerStyle.display = "block";
			}

			var sEndItemWidth = iEndItemWidth + "px";
			mLastSpacerStyle.width = sEndItemWidth;
			mLastSpacerStyle.minWidth = sEndItemWidth;
			this.toggleDisplayOfSpacers(oDomRef);
		};

		AlignedFlowLayout.prototype.toggleDisplayOfSpacers = function(oDomRef) {
			var CSS_CLASS_ONE_LINE = this.getRenderer().CSS_CLASS + "OneLine",
				bExcludeEndItem = true;

			if (this.checkItemsWrapping(oDomRef, bExcludeEndItem)) {
				oDomRef.classList.remove(CSS_CLASS_ONE_LINE);
			} else {

				// if the items fit into a single line, add a CSS class to turn off
				// the display of the spacer elements
				oDomRef.classList.add(CSS_CLASS_ONE_LINE);
			}
		};

		/*
		 * Checks whether the visible content fits into a single line or it wraps onto multiple lines.
		 */
		AlignedFlowLayout.prototype.checkItemsWrapping = function(oDomRef, bExcludeEndItem) {
			oDomRef = oDomRef || this.getDomRef();

			if (!oDomRef) {
				return false;
			}

			var oFirstItemDomRef = oDomRef.firstElementChild,
				oLastItemDomRef = this.getLastItemDomRef();

			if (!oFirstItemDomRef || !oLastItemDomRef) {
				return false;
			}

			var iFirstItemOffsetTop = oFirstItemDomRef.offsetTop,
				iLastItemOffsetTop = oLastItemDomRef.offsetTop,
				iFirstItemOffsetHeight = oFirstItemDomRef.offsetHeight;

			// detect wrapping (excluding the end item)
			if (iLastItemOffsetTop >= (iFirstItemOffsetTop + iFirstItemOffsetHeight)) {
				return true;
			}

			if (bExcludeEndItem) {
				return false;
			}

			var oEndItemDomRef = this.getDomRef("endItem");

			// detect wrapping (including the end item)
			return !!oEndItemDomRef && (oEndItemDomRef.offsetTop >= (iFirstItemOffsetTop + iFirstItemOffsetHeight));
		};

		/*
		 * Gets the parent element's DOM reference of the last content control - if this control and its DOM exist.
		 */
		AlignedFlowLayout.prototype.getLastItemDomRef = function() {
			var aContent = this.getContent(),
				iContentLength = aContent.length;

			if (iContentLength) {

				var oContent = aContent[iContentLength - 1],
					oContentDomRef = oContent.getDomRef();

				if (oContentDomRef) {
					return oContentDomRef.parentElement;
				}
			}

			return null;
		};

		AlignedFlowLayout.prototype.getLastVisibleDomRef = function() {
			return this.getDomRef("endItem") || this.getLastItemDomRef();
		};

		AlignedFlowLayout.prototype.computeNumberOfSpacers = function() {
			var iContentLength = this.getContent().length;

			// spacers are only needed when some content is rendered
			if (iContentLength === 0) {
				return 0;
			}

			var iSpacers = iContentLength,
				sMinItemWidth = this.getMinItemWidth(),
				fMinItemWidth;

			// the CSS unit of the minItemWidth control property is in rem
			if (sMinItemWidth.lastIndexOf("rem") !== -1) {
				fMinItemWidth = Rem.toPx(sMinItemWidth);

			// the CSS unit of the minItemWidth control property is in px
			} else if (sMinItemWidth.lastIndexOf("px") !== -1) {
				fMinItemWidth = parseFloat(sMinItemWidth);
			}
			// else, the CSS unit is not in rem or px, in this case a conversion to px is not made and
			// more spacers are rendered (worst case, but unusual in UI5)

			if (fMinItemWidth) {

				// we do not need more spacers than (iAvailableWidth / minItemWidth)
				var iAvailableWidth = Math.max(document.documentElement.clientWidth, window.screen.width);
				iSpacers = Math.abs(iAvailableWidth / fMinItemWidth);
			}

			// we do not need more spacers than items
			iSpacers = Math.min(iSpacers, iContentLength - 1);

			// we need at least 1 spacer, to prevent collision of the content with the endContent aggregation
			iSpacers = Math.max(1, iSpacers);
			iSpacers = Math.floor(iSpacers);
			return iSpacers;
		};

		AlignedFlowLayout.prototype.observeSizeChangesIfRequired = function() {
			if (this.hasContent()) {
				this.observeSizeChanges();
			}
		};

		AlignedFlowLayout.prototype.observeSizeChanges = function() {

			var oDomRef = this.getDomRef();

			if (!oDomRef) {
				return;
			}

			var oEndItemDomRef = this.getDomRef("endItem");

			// resize observer
			if (this.oResizeObserver) {

				// detect size changes on the layout container
				this.oResizeObserver.observe(oDomRef);

				// Detect size changes of the item absolute positioned at the bottom on
				// the right of the entire layout control (in the secondary content area
				// `endContent` aggregation) to prevent the item to overlap with other
				// items in the primary content area when its size changes after the
				// initial rendering.
				if (oEndItemDomRef) {
					this.oResizeObserver.observe(oEndItemDomRef);
				}

				return;
			}

			// resize handler fallback for old browsers
			if (oEndItemDomRef) {

				// registration ID used for de-registering the resize handler
				this._sResizeHandlerEndItemListenerID = ResizeHandler.register(oEndItemDomRef, this.onResizeHandler.bind(this));
			}
		};

		AlignedFlowLayout.prototype.disconnectResizeObserver = function() {
			if (this.oResizeObserver) {
				this.oResizeObserver.disconnect();
			}
		};

		AlignedFlowLayout.prototype.disconnectResizeHandler = function() {

			if (this._sResizeHandlerContainerListenerID) {
				ResizeHandler.deregister(this._sResizeHandlerContainerListenerID);
			}

			this.disconnectResizeHandlerForEndItem();
		};

		AlignedFlowLayout.prototype.disconnectResizeHandlerForEndItem = function() {

			if (this._sResizeHandlerEndItemListenerID) {
				ResizeHandler.deregister(this._sResizeHandlerEndItemListenerID);
			}
		};

		AlignedFlowLayout.prototype.hasContent = function() {
			return this.getContent().length > 0;
		};

		return AlignedFlowLayout;
});
