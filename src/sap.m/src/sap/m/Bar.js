/*!
 * ${copyright}
 */

// Provides control sap.m.Bar.
sap.ui.define(['jquery.sap.global', './BarInPageEnabler', './library', 'sap/ui/core/Control'],
	function(jQuery, BarInPageEnabler, library, Control) {
	"use strict";



	/**
	 * Constructor for a new Bar.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A bar that may be used as a header of a page. It has the capability to center a content like a title, while having few controls on the left and right side.
	 * @extends sap.ui.core.Control
	 * @implements sap.m.IBar
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.Bar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Bar = Control.extend("sap.m.Bar", /** @lends sap.m.Bar.prototype */ { metadata : {

		interfaces : [
			"sap.m.IBar"
		],
		library : "sap.m",
		properties : {

			/**
			 * If this flag is set to true, contentMiddle will be rendered as a HBox and layoutData can be used to allocate available space
			 * @deprecated Since version 1.16.
			 * This property is no longer supported, instead, contentMiddle will always occupy 100% width when no contentLeft and contentRight are being set.
			 */
			enableFlexBox : {type : "boolean", group : "Misc", defaultValue : false, deprecated: true},

			/**
			 * A boolean value indicating whether the bar is partially translucent.
			 * It is only applied for touch devices.
			 * @since 1.12
			 * @deprecated Since version 1.18.6.
			 * This property has no effect since release 1.18.6 and should not be used. Translucent bar may overlay an input and make it difficult to edit.
			 */
			translucent : {type : "boolean", group : "Appearance", defaultValue : false, deprecated: true},

			/**
			 * The design of the bar. If set to auto it is dependent on the place, where the bar is placed.
			 * @since 1.22
			 */
			design : {type : "sap.m.BarDesign", group : "Appearance", defaultValue : sap.m.BarDesign.Auto}
		},
		aggregations : {

			/**
			 * this is the left content area, usually containing a button or an app icon. If this is overlapped by the right content, its content will disappear and text will show an elipsis.
			 */
			contentLeft : {type : "sap.ui.core.Control", multiple : true, singularName : "contentLeft"},

			/**
			 * This is the middle content area. Controls such as label, segmented buttons or select should be placed here. Content that is placed here will be centrally positioned, if there is enough space. If the right or left content overlaps the middle content, the middle content will be centered in the space between the left and the right content.
			 */
			contentMiddle : {type : "sap.ui.core.Control", multiple : true, singularName : "contentMiddle"},

			/**
			 * this is the right content area. Controls such as action buttons or search field could be placed here.
			 */
			contentRight : {type : "sap.ui.core.Control", multiple : true, singularName : "contentRight"}
		}
	}});


	/**
	 * @private
	 */
	Bar.prototype.onBeforeRendering = function() {
		this._removeAllListeners();
	};

	Bar.prototype.onAfterRendering = function() {
		this._handleResize();
	};

	/**
	 * Called when the control is initialized.
	 * @private
	 */
	Bar.prototype.init = function() {
		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling
	};

	/**
	 * Called when the control is destroyed.
	 * Clean up resize listeners and destroy flexbox,
	 * emties cache
	 * @private
	 */
	Bar.prototype.exit = function() {
		this._removeAllListeners();

		if (this._oflexBox) {

			this._oflexBox.destroy();
			this._oflexBox = null;

		}

		this._$MidBarPlaceHolder = null;
		this._$RightBar = null;
		this._$LeftBar = null;
	};

	/**
	 * @private
	 */
	Bar._aResizeHandlers = ["_sResizeListenerId", "_sResizeListenerIdMid", "_sResizeListenerIdRight", "_sResizeListenerIdLeft"];

	/**
	 * removes all resize listeners, that the bar could have registered.
	 * @private
	 */
	Bar.prototype._removeAllListeners = function() {
		var that = this;

		Bar._aResizeHandlers.forEach(function(sItem) {

			that._removeListenerFailsave(sItem);

		});
	};

	/**
	 * Removes a listener with the specified name and sets it to null, if the listener is defined.
	 * @param sListenerName the name of the listener that has to be removed
	 *
	 * @private
	 */
	Bar.prototype._removeListenerFailsave = function(sListenerName) {
		if (this[sListenerName]) {

			sap.ui.core.ResizeHandler.deregister(this[sListenerName]);
			this[sListenerName] = null;

		}
	};

	/**
	 * Invoked, when bar is rerendered, its size changed, or the size of one for the content bars changed.
	 * @private
	 */
	Bar.prototype._handleResize = function() {
		this._removeAllListeners();

		var bContentLeft = !!this.getContentLeft().length,
			bContentMiddle = !!this.getContentMiddle().length,
			bContentRight = !!this.getContentRight().length;

		//Invisible bars also do not need resize listeners
		if (!this.getVisible()) {
			return;
		}

		//No content was set yet - no need to listen to resizes
		if (!bContentLeft && !bContentMiddle && !bContentRight) {
			return;
		}

		this._$LeftBar = this.$("BarLeft");
		this._$RightBar = this.$("BarRight");
		this._$MidBarPlaceHolder = this.$("BarPH");

		this._updatePosition(bContentLeft, bContentMiddle, bContentRight);

		this._sResizeListenerId = sap.ui.core.ResizeHandler.register(this.getDomRef(), jQuery.proxy(this._handleResize, this));

		if (this.getEnableFlexBox()) {
			return;
		}

		if (bContentLeft) {
			this._sResizeListenerIdLeft = sap.ui.core.ResizeHandler.register(this._$LeftBar[0], jQuery.proxy(this._handleResize, this));
		}

		if (bContentMiddle) {
			this._sResizeListenerIdMid = sap.ui.core.ResizeHandler.register(this._$MidBarPlaceHolder[0], jQuery.proxy(this._handleResize, this));
		}

		if (bContentRight) {
			this._sResizeListenerIdRight = sap.ui.core.ResizeHandler.register(this._$RightBar[0], jQuery.proxy(this._handleResize, this));
		}
	};

	/**
	 * Repositions the bar.
	 * If there is only one aggregation filled, this aggregation will take 100% of the bars space.
	 * @param bContentLeft indicates if there is left content in the bar
	 * @param bContentMiddle indicates if there is middle content in the bar
	 * @param bContentRight indicates if there is right content in the bar
	 * @private
	 */
	Bar.prototype._updatePosition = function(bContentLeft, bContentMiddle, bContentRight) {

		if (!bContentLeft && !bContentRight) {

			this._$MidBarPlaceHolder.css({ width : '100%'});
			return;

		}

		if (bContentLeft && !bContentMiddle && !bContentRight) {

			this._$LeftBar.css({ width : '100%'});
			return;

		}

		if (!bContentLeft && !bContentMiddle && bContentRight) {

			this._$RightBar.css({ width : '100%'});
			return;

		}

		var iBarWidth = this.$().outerWidth(true);

		// reset to default
		this._$RightBar.css({ width : "" });
		this._$LeftBar.css({ width : "" });
		this._$MidBarPlaceHolder.css({ position : "", width : "", visibility : 'hidden' });

		var iRightBarWidth = this._$RightBar.outerWidth(true);

		//right bar is bigger than the bar - only show the right bar
		if (iRightBarWidth > iBarWidth) {

			if (bContentLeft) {
				this._$LeftBar.css({ width : "0px" });
			}

			if (bContentMiddle) {
				this._$MidBarPlaceHolder.css({ width : "0px" });
			}

			this._$RightBar.css({ width : iBarWidth + "px"});
			return;

		}

		var iLeftBarWidth = this._getBarContainerWidth(this._$LeftBar);

		// handle the case when left and right content are wider than the bar itself
		if (iBarWidth < (iLeftBarWidth + iRightBarWidth)) {

			// this scenario happens mostly when a very long title text is set in the left content area
			// hence we make sure the rightContent always has enough space and reduce the left content area width accordingly
			iLeftBarWidth = iBarWidth - iRightBarWidth;

			this._$LeftBar.width(iLeftBarWidth);
			this._$MidBarPlaceHolder.width(0);
			return;

		}

		//middle bar will be shown
		this._$MidBarPlaceHolder.css(this._getMidBarCss(iRightBarWidth, iBarWidth, iLeftBarWidth));

	};

	/**
	 * Returns the css for the contentMiddle aggregation. It is centered if there is enough space for it to fit between the left and right content.
	 * If not it will be centered between those two.
	 * @param iRightBarWidth the width in pixel
	 * @param iBarWidth the width in pixel
	 * @param iLeftBarWidth the width in pixel
	 * @returns {object} the new _$MidBarPlaceHolder css value
	 * @private
	 */
	Bar.prototype._getMidBarCss = function(iRightBarWidth, iBarWidth, iLeftBarWidth) {
		var iMidBarPlaceholderWidth = this._$MidBarPlaceHolder.outerWidth(true),
			bRtl = sap.ui.getCore().getConfiguration().getRTL(),
			sLeftOrRight = bRtl ? "right" : "left",
			oMidBarCss = { visibility : "" };

		if (this.getEnableFlexBox()) {

			iMidBarPlaceholderWidth = iBarWidth - iLeftBarWidth - iRightBarWidth - parseInt(this._$MidBarPlaceHolder.css('margin-left'), 10) - parseInt(this._$MidBarPlaceHolder.css('margin-right'), 10);

			oMidBarCss.position = "absolute";
			oMidBarCss.width = iMidBarPlaceholderWidth + "px";
			oMidBarCss[sLeftOrRight] = iLeftBarWidth;

			//calculation for flex is done
			return oMidBarCss;

		}

		var iSpaceBetweenLeftAndRight = iBarWidth - iLeftBarWidth - iRightBarWidth,

			iMidBarStartingPoint = (iBarWidth / 2) - (iMidBarPlaceholderWidth / 2),
			bLeftContentIsOverlapping = iLeftBarWidth > iMidBarStartingPoint,

			iMidBarEndPoint = (iBarWidth / 2) + (iMidBarPlaceholderWidth / 2),
			bRightContentIsOverlapping = (iBarWidth - iRightBarWidth) < iMidBarEndPoint;

		if (iSpaceBetweenLeftAndRight > 0 && (bLeftContentIsOverlapping || bRightContentIsOverlapping)) {

			//Left or Right content is overlapping the Middle content

			// place the middle positioned element directly next to the end of left content area
			oMidBarCss.position = "absolute";

			//Use the remaining space
			oMidBarCss.width = iSpaceBetweenLeftAndRight + "px";

			oMidBarCss.left = bRtl ? iRightBarWidth : iLeftBarWidth;
		}

		return oMidBarCss;

	};

	/**
	 * Gets the width of a container.
	 * @static
	 * @param $Container a container with children
	 * @returns {number} the width of one of the bar containers
	 * @private
	 */
	Bar.prototype._getBarContainerWidth = function($Container) {
		var i,
			iContainerWidth = 0,
			aContainerChildren = $Container.children(),
			iContainerChildrenTotalWidth = 0;

		// Chrome browser has a problem in providing the correct div size when image inside does not have width explicitly set
		//since ff version 24 the calculation is correct, since we don't support older versions we won't check it
		if (sap.ui.Device.browser.webkit || sap.ui.Device.browser.firefox) {

			for (i = 0; i < aContainerChildren.length; i++) {

				iContainerChildrenTotalWidth += jQuery(aContainerChildren[i]).outerWidth(true);

			}

			iContainerWidth = $Container.outerWidth(true);

		} else {

			// IE has a rounding issue with JQuery.outerWidth
			var oContainerChildrenStyle;

			for (i = 0; i < aContainerChildren.length; i++) {

				oContainerChildrenStyle = window.getComputedStyle(aContainerChildren[i]);

				if (oContainerChildrenStyle.width == "auto") {

					iContainerChildrenTotalWidth += jQuery(aContainerChildren[i]).width() + 1; //add an additional 1 pixel because of rounding issue.

				} else {

					iContainerChildrenTotalWidth += parseFloat(oContainerChildrenStyle.width);

				}

				iContainerChildrenTotalWidth += parseFloat(oContainerChildrenStyle.marginLeft);
				iContainerChildrenTotalWidth += parseFloat(oContainerChildrenStyle.marginRight);
				iContainerChildrenTotalWidth += parseFloat(oContainerChildrenStyle.paddingLeft);
				iContainerChildrenTotalWidth += parseFloat(oContainerChildrenStyle.paddingRight);
			}

			var oContainerComputedStyle = window.getComputedStyle($Container[0]);

			iContainerWidth += parseFloat(oContainerComputedStyle.width);
			iContainerWidth += parseFloat(oContainerComputedStyle.marginLeft);
			iContainerWidth += parseFloat(oContainerComputedStyle.marginRight);
			iContainerWidth += parseFloat(oContainerComputedStyle.paddingLeft);
			iContainerWidth += parseFloat(oContainerComputedStyle.paddingRight);

		}

		if (iContainerWidth < iContainerChildrenTotalWidth) {

			iContainerWidth = iContainerChildrenTotalWidth;

		}

		return iContainerWidth;
	};

	/////////////////
	//Bar in page delegation
	/////////////////
	/**
	 * Determines whether the bar is sensitive to the container context.
	 *
	 * Implementation of the IBar interface.
	 * @returns {boolean} isContextSensitive
	 * @protected
	 */
	Bar.prototype.isContextSensitive = BarInPageEnabler.prototype.isContextSensitive;

	/**
	 * Sets the HTML tag of the root element.
	 * @param {sap.m.IBarHTMLTag} sTag
	 * @returns {sap.m.IBar} this for chaining
	 * @protected
	 */
	Bar.prototype.setHTMLTag = BarInPageEnabler.prototype.setHTMLTag;
	/**
	 * Gets the HTML tag of the root element.
	 * @returns {sap.m.IBarHTMLTag} the HTML-tag
	 * @protected
	 */
	Bar.prototype.getHTMLTag  = BarInPageEnabler.prototype.getHTMLTag;

	/**
	 * Sets classes and tag according to the context in the page. Possible contexts are header, footer, subheader.
	 * @returns {sap.m.IBar} this for chaining
	 * @protected
	 */
	Bar.prototype.applyTagAndContextClassFor  = BarInPageEnabler.prototype.applyTagAndContextClassFor;

	return Bar;

}, /* bExport= */ true);
