/*!
 * ${copyright}
 */

// Provides control sap.m.Bar.
sap.ui.define([
	'./BarInPageEnabler',
	'./library',
	"sap/base/i18n/Localization",
	'sap/ui/core/Control',
	'sap/ui/core/ResizeHandler',
	'sap/ui/Device',
	'./BarRenderer',
	"sap/ui/thirdparty/jquery"
],
	function(BarInPageEnabler, library, Localization, Control, ResizeHandler, Device, BarRenderer, jQuery) {
	"use strict";



	// shortcut for sap.m.BarDesign
	var BarDesign = library.BarDesign;

	// shortcut for sap.m.TitleAlignment
	var TitleAlignment = library.TitleAlignment;

	var MIN_INTERACTIVE_CONTROLS = 2;

	/**
	 * Constructor for a new <code>Bar</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Used as a header, sub-header and a footer of a page.
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>Bar</code> control consists of three areas to hold its content. It has the capability
	 * to center content, such as a title, while having other controls on the left and right side.
	 *
	 * <h3>Usage</h3>
	 *
	 * With the use of the <code>design</code> property, you can set the style of the <code>Bar</code> to appear
	 * as a header, sub-header and footer.
	 *
	 * <b>Note:</b> Do not place a <code>sap.m.Bar</code> inside another <code>sap.m.Bar</code>
	 * or inside any bar-like control. Doing so causes unpredictable behavior.
	 *
	 * <h3>Responsive Behavior</h3>
	 *
	 * The content in the middle area is centrally positioned if there is enough space. If the right
	 * or left content overlaps the middle content, the middle content will be centered in the space between.
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.m.IBar
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.Bar
	 */
	var Bar = Control.extend("sap.m.Bar", /** @lends sap.m.Bar.prototype */ {
		metadata : {

			interfaces : [
				"sap.m.IBar"
			],
			library : "sap.m",
			properties : {
				/**
				 * Determines the design of the bar. If set to auto, it becomes dependent on the place where the bar is placed.
				 * @since 1.22
				 */
				design : {type : "sap.m.BarDesign", group : "Appearance", defaultValue : BarDesign.Auto},

				/**
				 * Specifies the Title alignment (theme specific).
				 * If set to <code>TitleAlignment.None</code>, the automatic title alignment depending on the theme settings will be disabled.
				 * If set to <code>TitleAlignment.Auto</code>, the Title will be aligned as it is set in the theme (if not set, the default value is <code>center</code>);
				 * Other possible values are <code>TitleAlignment.Start</code> (left or right depending on LTR/RTL), and <code>TitleAlignment.Center</code> (centered)
				 * @since 1.85
				 * @public
				 */
				titleAlignment : {type : "sap.m.TitleAlignment", group : "Misc", defaultValue : TitleAlignment.None}
			},
			aggregations : {

				/**
				 * Represents the left content area, usually containing a button or an app icon. If it is overlapped by the right content, its content will disappear and the text will show an ellipsis.
				 */
				contentLeft : {type : "sap.ui.core.Control", multiple : true, singularName : "contentLeft"},

				/**
				 * Represents the middle content area. Controls such as label, segmented buttons or select can be placed here. The content is centrally positioned if there is enough space. If the right or left content overlaps the middle content, the middle content will be centered in the space between the left and the right content.
				 */
				contentMiddle : {type : "sap.ui.core.Control", multiple : true, singularName : "contentMiddle"},

				/**
				 *  Represents the right content area. Controls such as action buttons or search field can be placed here.
				 */
				contentRight : {type : "sap.ui.core.Control", multiple : true, singularName : "contentRight"}
			},
			associations : {

				/**
				 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
				 */
				ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
			},
			designtime: "sap/m/designtime/Bar.designtime",
			dnd: { draggable: false, droppable: true }
		},

		renderer: BarRenderer
	});

	Bar.prototype.onBeforeRendering = function() {
		var sCurrentAlignment = this.getTitleAlignment(),
			sAlignment;

		this._removeAllListeners();

		// title alignment
		for (sAlignment in TitleAlignment) {
			if (sAlignment !== sCurrentAlignment) {
				this.removeStyleClass("sapMBarTitleAlign" + sAlignment);
			} else {
				this.addStyleClass("sapMBarTitleAlign" + sAlignment);
			}
		}
	};

	Bar.prototype.onAfterRendering = function() {
		this._handleResize();
	};

	/**
	 * Called when the control is initialized.
	 */
	Bar.prototype.init = function() {
		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling
		this._sPrevTitleAlignmentClass = "";
	};

	/**
	 * Called when the control is destroyed.
	 */
	Bar.prototype.exit = function() {
		this._removeAllListeners();

		this._$MidBarPlaceHolder = null;
		this._$RightBar = null;
		this._$LeftBar = null;
	};

	/**
	 * @private
	 */
	Bar._aResizeHandlers = ["_sResizeListenerId", "_sResizeListenerIdMid", "_sResizeListenerIdRight", "_sResizeListenerIdLeft"];

	/**
	 * Removes all resize listeners the Bar has registered.
	 * @private
	 */
	Bar.prototype._removeAllListeners = function() {
		var that = this;

		Bar._aResizeHandlers.forEach(function(sItem) {

			that._removeListenerFailsave(sItem);

		});
	};

	/**
	 * Removes the listener with the specified name and sets it to null if the listener is defined.
	 * @param {string} sListenerName The name of the listener to be removed
	 *
	 * @private
	 */
	Bar.prototype._removeListenerFailsave = function(sListenerName) {
		if (this[sListenerName]) {

			ResizeHandler.deregister(this[sListenerName]);
			this[sListenerName] = null;

		}
	};

	/**
	 * Handles resize changes.
	 * Invoked when the bar is re-rendered, its size has changed or the size of one of the bars content has changed.
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


		this._sResizeListenerId = ResizeHandler.register(this.getDomRef(), jQuery.proxy(this._handleResize, this));

		if (bContentLeft) {
			this._sResizeListenerIdLeft = ResizeHandler.register(this._$LeftBar[0], jQuery.proxy(this._handleResize, this));
		} else {
			this._$LeftBar.addClass("sapMBarEmpty");
		}

		if (bContentMiddle) {
			this._sResizeListenerIdMid = ResizeHandler.register(this._$MidBarPlaceHolder[0], jQuery.proxy(this._handleResize, this));
		} else {
			this._$MidBarPlaceHolder.addClass("sapMBarEmpty");
		}
		if (bContentRight) {
			this._sResizeListenerIdRight = ResizeHandler.register(this._$RightBar[0], jQuery.proxy(this._handleResize, this));
		} else {
			this._$RightBar.addClass("sapMBarEmpty");
		}

		this._updatePosition(bContentLeft, bContentMiddle, bContentRight);
	};

	/**
	 * Repositions the bar.
	 * If there is only one aggregation filled, this aggregation will take 100% of the Bar space.
	 * @param {boolean} bContentLeft Indicates whether there is content on the left side of the Bar
	 * @param {boolean} bContentMiddle Indicates whether there is content in the middle section of the Bar
	 * @param {boolean} bContentRight Indicates whether there is content on the right side of the Bar
	 * @private
	 */
	Bar.prototype._updatePosition = function(bContentLeft, bContentMiddle, bContentRight) {
		if (!bContentLeft && bContentMiddle && !bContentRight) {
			return;
		}

		if (bContentLeft && !bContentMiddle && !bContentRight) {
			return;
		}

		if (!bContentLeft && !bContentMiddle && bContentRight) {
			return;
		}

		var iBarWidth = this.$().outerWidth(true);
		// reset to default
		this._$RightBar.css({ width : "" });
		this._$LeftBar.css({ width : "" });
		this._$MidBarPlaceHolder.css({ position : "", width : "", visibility: "hidden"});

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

			// using .css("width",...) sets the width of the element including the borders
			// and using only .width sets the width without the borders
			// in our case we have style box-sizing: border-box, so we need the borders
			this._$LeftBar.css({ width : iLeftBarWidth + "px" });

			this._$MidBarPlaceHolder.css({ width : "0px" });
			return;

		}

		//middle bar will be shown
		this._$MidBarPlaceHolder.css(this._getMidBarCss(iRightBarWidth, iBarWidth, iLeftBarWidth));
	};

	/**
	 * Returns the CSS for the contentMiddle aggregation.
	 * It is centered if there is enough space for it to fit between the left and the right content, otherwise it is centered between them.
	 * If not it will be centered between those two.
	 * @param {int} iRightBarWidth The width in px
	 * @param {int} iBarWidth The width in px
	 * @param {int} iLeftBarWidth The width in px
	 * @returns {object} The new _$MidBarPlaceHolder CSS value
	 * @private
	 */
	Bar.prototype._getMidBarCss = function(iRightBarWidth, iBarWidth, iLeftBarWidth) {
		var iMidBarPlaceholderWidth = this._$MidBarPlaceHolder.outerWidth(true),
			bRtl = Localization.getRTL(),
			oMidBarCss = { visibility : "" };

		var iSpaceBetweenLeftAndRight = iBarWidth - iLeftBarWidth - iRightBarWidth,
			iMidBarStartingPoint = (iBarWidth / 2) - (iMidBarPlaceholderWidth / 2),
			bLeftContentIsOverlapping = iLeftBarWidth > iMidBarStartingPoint,
			iMidBarEndPoint = (iBarWidth / 2) + (iMidBarPlaceholderWidth / 2),
			bRightContentIsOverlapping = (iBarWidth - iRightBarWidth) < iMidBarEndPoint,
			sTitleAlignment = this.getTitleAlignment();

		if ((sTitleAlignment !== TitleAlignment.None && sTitleAlignment !== TitleAlignment.Center) ||
			(iSpaceBetweenLeftAndRight > 0 && (bLeftContentIsOverlapping || bRightContentIsOverlapping))) {
			//Left or Right content is overlapping the Middle content or there is Title alignment "Center" or "None" set

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
	 * @param {object} $Container A container with children
	 * @returns {number} The width of one of the Bar containers
	 * @private
	 */
	Bar.prototype._getBarContainerWidth = function($Container) {
		var i,
			iContainerWidth = 0,
			aContainerChildren = $Container.children(),
			iContainerChildrenTotalWidth = 0;

		// Chrome browser has a problem in providing the correct div size when image inside does not have width explicitly set
		//since ff version 24 the calculation is correct, since we don't support older versions we won't check it
		// Edge also works correctly with this calculation unlike IE
		if (Device.browser.webkit || Device.browser.firefox) {

			for (i = 0; i < aContainerChildren.length; i++) {

				iContainerChildrenTotalWidth += jQuery(aContainerChildren[i]).outerWidth(true);

			}

			iContainerWidth = $Container.outerWidth(true);

		} else {

			// IE has a rounding issue with jQuery.outerWidth
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

	// Provides helper sap.m.BarInAnyContentEnabler
	/**
	 * @class Helper Class for implementing additional contexts of the Bar.
	 * e.g. in sap.m.Dialog
	 *
	 * @version 1.40
	 * @protected
	 */
	var BarInAnyContentEnabler = BarInPageEnabler.extend("sap.m.BarInAnyContentEnabler", /** @lends sap.m.BarInAnyContentEnabler.prototype */ {});

	BarInAnyContentEnabler.mContexts = {
		dialogFooter : {
			contextClass : "sapMFooter-CTX",
			tag : "Footer"
		}
	};

	/**
	 * Gets the available Bar contexts from the BarInPageEnabler and adds the additional contexts from BarInAnyContentEnabler.
	 *
	 * @returns {sap.m.BarContexts} with all available contexts
	 */
	BarInAnyContentEnabler.prototype.getContext = function() {
		var oParentContexts = BarInPageEnabler.prototype.getContext.call();

		for (var key in BarInAnyContentEnabler.mContexts) {
			oParentContexts[key] = BarInAnyContentEnabler.mContexts[key];
		}

		return oParentContexts;
	};

	/**
	 * Gets the available Bar contexts.
	 *
	 * @returns {sap.m.BarContexts} with all available contexts
	 * @protected
	 * @function
	 */
	Bar.prototype.getContext = BarInAnyContentEnabler.prototype.getContext;

	/**
	 * Determines whether the Bar is sensitive to the container context.
	 *
	 * Implementation of the IBar interface.
	 * @returns {boolean} isContextSensitive
	 * @protected
	 * @function
	 */
	Bar.prototype.isContextSensitive = BarInAnyContentEnabler.prototype.isContextSensitive;

	/**
	 * Sets the HTML tag of the root element.
	 * @param {sap.m.IBarHTMLTag} sTag The HTML tag of the root element
	 * @returns {sap.m.IBar} this for chaining
	 * @protected
	 * @function
	 */
	Bar.prototype.setHTMLTag = BarInAnyContentEnabler.prototype.setHTMLTag;

	/**
	 * Gets the HTML tag of the root element.
	 * @returns {sap.m.IBarHTMLTag} The HTML-tag
	 * @protected
	 * @function
	 */
	Bar.prototype.getHTMLTag  = BarInAnyContentEnabler.prototype.getHTMLTag;

	/**
	 * Sets classes and HTML tag according to the context of the page. Possible contexts are header, footer and subheader.
	 * @returns {sap.m.IBar} <code>this</code> for chaining
	 * @protected
	 * @function
	 */
	Bar.prototype.applyTagAndContextClassFor  = BarInAnyContentEnabler.prototype.applyTagAndContextClassFor;

	/**
	 * Sets classes according to the context of the page. Possible contexts are header, footer and subheader.
	 * @returns {sap.m.IBar} <code>this</code> for chaining
	 * @protected
	 * @function
	 */
	Bar.prototype._applyContextClassFor  = BarInAnyContentEnabler.prototype._applyContextClassFor;

	/**
	 * Sets HTML tag according to the context of the page. Possible contexts are header, footer and subheader.
	 * @returns {sap.m.IBar} <code>this</code> for chaining
	 * @protected
	 * @function
	 */
	Bar.prototype._applyTag  = BarInAnyContentEnabler.prototype._applyTag;

	/**
	 * Get context options of the Page.
	 *
	 * Possible contexts are header, footer, subheader.
	 * @param {string} sContext allowed values are header, footer, subheader.
	 * @returns {object|null}
	 * @private
	 * @function
	 */
	Bar.prototype._getContextOptions  = BarInAnyContentEnabler.prototype._getContextOptions;

	/**
	 * Sets accessibility role of the Root HTML element.
	 *
	 * @param {string} sRole AccessibilityRole of the root Element
	 * @returns {sap.m.IBar} <code>this</code> to allow method chaining
	 * @private
	 * @function
	 */
	Bar.prototype._setRootAccessibilityRole = BarInAnyContentEnabler.prototype._setRootAccessibilityRole;

	/**
	 * Gets accessibility role of the Root HTML element.
	 *
	 * @returns {string} Accessibility role
	 * @private
	 * @function
	 */
	Bar.prototype._getRootAccessibilityRole = BarInAnyContentEnabler.prototype._getRootAccessibilityRole;

	Bar.prototype._getAccessibilityRole = function () {
		var sRootAccessibilityRole = this._getRootAccessibilityRole(),
			sRole = sRootAccessibilityRole;
		if (this._getBarInteractiveControlsCount() < MIN_INTERACTIVE_CONTROLS && sRootAccessibilityRole === "toolbar") {
			sRole = "";
		}
		return sRole;
	};

	/**
	 * Sets accessibility aria-level attribute of the Root HTML element.
	 *
	 * This is only needed if <code>sap.m.Bar</code> has role="heading"
	 * @param {string} sLevel aria-level attribute of the root Element
	 * @returns {sap.m.IBar} <code>this</code> to allow method chaining
	 * @private
	 * @function
	 */
	Bar.prototype._setRootAriaLevel = BarInAnyContentEnabler.prototype._setRootAriaLevel;

	/**
	 * Gets accessibility aria-level attribute of the Root HTML element.
	 *
	 * This is only needed if <code>sap.m.Bar</code> has role="heading"
	 * @returns {string} aria-level
	 * @private
	 * @function
	 */
	Bar.prototype._getRootAriaLevel = BarInAnyContentEnabler.prototype._getRootAriaLevel;

	/**
	 *
	 * @returns {number} Bar interactive Controls count
	 * @private
	 */
	Bar.prototype._getBarInteractiveControlsCount = function () {
		var count = 0;
		count += this.getContentLeft().filter(this._isInteractiveControl).length;
		count += this.getContentRight().filter(this._isInteractiveControl).length;
		count += this.getContentMiddle().filter(this._isInteractiveControl).length;

		return count;
	};

	/**
	 *
	 * @param {object} oControl control to be checked
	 * @returns {boolean} returns weather the given control is interactive
	 * @private
	 */
	Bar.prototype._isInteractiveControl = function (oControl) {
		return oControl.getVisible()
			&& oControl.isA("sap.m.IToolbarInteractiveControl")
			&& typeof (oControl._getToolbarInteractive) === "function" && oControl._getToolbarInteractive();
	};

	return Bar;

});
