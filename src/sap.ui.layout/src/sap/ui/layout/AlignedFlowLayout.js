/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Control', './library', 'sap/ui/core/ResizeHandler'],
	function(Control, library, ResizeHandler) {
		"use strict";

		/**
		 * Constructor for a new AlignedFlowLayout.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The <code>AlignedFlowLayout</code> arranges its child controls evenly across the available horizontal space,
		 * each item gets the same width and grows and shrinks in response to the layout width.
		 * Items not fitting into a row when considering the configured <code>minItemWidth</code> property, wrap into
		 * the next row (like in a regular flow layout). However, those wrapped items have the same flexible widths as
		 * the items in the rows above, so they are aligned.
		 * In addition, there is a special <code>endContent</code> area which is positioned at the bottom right of the
		 * entire layout control.
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
					 */
					minItemWidth: {
						type: "sap.ui.core.AbsoluteCSSSize",
						defaultValue: "240px" // =15rem, but easier to get pixel size TODO: Reasonable default?
					}
				},
				defaultAggregation: "content",
				aggregations: {

					/**
					 * Defines the content contained within this control.
					 * TODO: mention constraints, e.g. size/complexity of items, and whether content can be added that tries to adapt to the parent height.
					 */
					content: {
						type: "sap.ui.core.Control",
						multiple: true
					},

					/**
					 * Defines the end content contained within this control.
					 */
					endContent: {
						type: "sap.ui.core.Control",
						multiple: true
					}
				}
			}
		});

		AlignedFlowLayout.prototype.init = function() {
			this._iEndItemWidth = -1;

			// registration ID used for deregistering the resize handler
			this._sResizeListenerId = ResizeHandler.register(this, this._onResize.bind(this));
		};

		AlignedFlowLayout.prototype.exit = function() {
			if (this._sResizeListenerId) {
				ResizeHandler.deregister(this._sResizeListenerId);
				this._sResizeListenerId = "";
			}
		};

		AlignedFlowLayout.prototype._onRenderingOrThemeChanged = function() {
			var oDomRef = this.getDomRef(),
				oEndItemDomRef = this.getDomRef("endItem"),
				bEndItemAndContent = this.getContent().length && oDomRef && oEndItemDomRef;

			if (bEndItemAndContent) {
				var oLayoutComputedStyle = window.getComputedStyle(oDomRef, null),
					mEndItemStyle = oEndItemDomRef.style;

				// adapt the position of the absolute-positioned end item in case a standard CSS class is added
				if (sap.ui.getCore().getConfiguration().getRTL()) {
					mEndItemStyle.left = oLayoutComputedStyle.getPropertyValue("padding-left");
				} else {
					mEndItemStyle.right = oLayoutComputedStyle.getPropertyValue("padding-right");
				}

				mEndItemStyle.bottom = oLayoutComputedStyle.getPropertyValue("padding-top");
			}

			this._onResize(null, oDomRef, oEndItemDomRef);

			// update last spacer width
			if (bEndItemAndContent) {
				oDomRef.lastElementChild.style.width = this._iEndItemWidth + "px";
			}
		};

		AlignedFlowLayout.prototype.onAfterRendering = AlignedFlowLayout.prototype._onRenderingOrThemeChanged;
		AlignedFlowLayout.prototype.onThemeChanged = AlignedFlowLayout.prototype._onRenderingOrThemeChanged;

		// this resize handler needs to be called on after rendering, theme change, and whenever the width of this
		// control changes
		AlignedFlowLayout.prototype._onResize = function(oEvent, oDomRef, oEndItemDomRef) {

			// called by resize handler, but only the height changed, so there is nothing to do;
			// this is required to avoid a resizing loop
			if ((oEvent && (oEvent.size.width === oEvent.oldSize.width)) || (this.getContent().length === 0)) {
				return;
			}

			oDomRef = oDomRef || this.getDomRef();

			if (!oDomRef) {
				return;
			}

			var CSS_CLASS_ONE_LINE = this.getRenderer().CSS_CLASS + "OneLine",
				bEnoughSpaceForEndItem = true;

			oEndItemDomRef = oEndItemDomRef || this.getDomRef("endItem");

			if (oEndItemDomRef) {
				var mLastSpacerStyle = oDomRef.lastElementChild.style;
				mLastSpacerStyle.height = "";
				mLastSpacerStyle.display = "";
				oDomRef.classList.remove(CSS_CLASS_ONE_LINE);

				var oLastItemDomRef = this.getLastItemDomRef(),
					iEndItemHeight = oEndItemDomRef.offsetHeight,
					iEndItemWidth = oEndItemDomRef.offsetWidth,
					iLastItemOffsetLeft = oLastItemDomRef.offsetLeft,
					iAvailableWidthForEndItem;

				if (sap.ui.getCore().getConfiguration().getRTL()) {
					iAvailableWidthForEndItem = iLastItemOffsetLeft;
				} else {
					var iRightBorderOfLastItem = iLastItemOffsetLeft + oLastItemDomRef.offsetWidth;
					iAvailableWidthForEndItem = oDomRef.offsetWidth - iRightBorderOfLastItem;
				}

				this._iEndItemWidth = iEndItemWidth; // cache the width of the end item
				bEnoughSpaceForEndItem = iAvailableWidthForEndItem >= iEndItemWidth;

				// if the end item fits into the line
				if (bEnoughSpaceForEndItem) {

					if (this.checkItemsWrapping(oDomRef)) {

						// if the end item overlap the items on the first line
						if (oEndItemDomRef.offsetTop < oLastItemDomRef.offsetTop) {
							mLastSpacerStyle.height = iEndItemHeight + "px";
							mLastSpacerStyle.display = "block";
						} else {
							mLastSpacerStyle.height = "0";
							mLastSpacerStyle.display = "";
						}

					} else {

						// if the height of the end item is higher than the other items on the first line,
						// the end item goes up and overflow its container
						if (oEndItemDomRef.offsetTop < oLastItemDomRef.offsetTop) {

							// increase the height of the last spacer item to make the end item go down
							mLastSpacerStyle.height = iEndItemHeight + "px";
						}

						mLastSpacerStyle.display = "block";
					}

				} else { // not enough space, increase the height of the last spacer item to make the endContent go down
					mLastSpacerStyle.height = iEndItemHeight + "px";
					mLastSpacerStyle.display = "block";
				}
			}

			// if the items fits into a single line, sets a CSS class to turns off the display of the spacer elements
			oDomRef.classList.toggle(CSS_CLASS_ONE_LINE, (!this.checkItemsWrapping(oDomRef) && bEnoughSpaceForEndItem));
		};

		/*
		 * Checks whether the visible content fits into a single line or it wraps onto multiple lines.
		 */
		AlignedFlowLayout.prototype.checkItemsWrapping = function(oDomRef) {
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

			oLastItemDomRef = this.getDomRef("endItem");

			// detect wrapping (including the end item)
			return !!oLastItemDomRef && (iLastItemOffsetTop >= (iFirstItemOffsetTop + iFirstItemOffsetHeight));
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

		return AlignedFlowLayout;
}, /* bExport= */ true);