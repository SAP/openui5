/*!
 * ${copyright}
 */

// Provides control sap.m.ScrollBar.
sap.ui.define([
	'sap/ui/core/Control',
	"./ScrollBarRenderer"
],
function(Control, ScrollBarRenderer) {
	"use strict";

	/**
	 * Constructor for a new <code>ScrollBar</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>ScrollBar</code> control can be used for virtual scrolling of a certain area.
	 * This means: to simulate a very large scrollable area when technically the area is small and the control
	 * takes care of displaying the respective part only. For example, a <code>Table</code> control can take
	 * care of only rendering the currently visible rows and use this <code>ScrollBar</code> control to make
	 * the users think they are actually scrolling through a long list.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @private
	 * @alias sap.m.ScrollBar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ScrollBar = Control.extend("sap.m.ScrollBar", /** @lends sap.m.ScrollBar.prototype */ { metadata : {

			library : "sap.m",
			properties : {

				/**
				 * Defines scroll position in pixels. It is kept in sync with the current scroll value of the container.
				 *
				 * <b>Note:</b> If you set <code>scrollPosition</code> to negative value or bigger than the
				 * <code>contentSize</code>, the actual <code>scrollPosition</code> would be respectively
				 * 0 if it's negative or the maximum allowed.
				 */
				scrollPosition : {type : "int", group : "Behavior", defaultValue : 0},

				/**
				 * Size of the scrollable content (in pixels).
				 */
				contentSize : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null}
			},
			events : {

				/**
				 * Scroll event.
				 */
				scroll : {}
			}
		}});

	ScrollBar.prototype.init = function(){
		this._onScrollHandler = this._onscroll.bind(this);
	};

	ScrollBar.prototype.onBeforeRendering = function() {
		if (this._$ScrollRef && this._$ScrollRef.length) {
			this._$ScrollRef.off("scroll", this._onScrollHandler);
			this._$ScrollRef = null;
		}
	};

	ScrollBar.prototype.onAfterRendering = function () {
		this._$ScrollRef = this.$("sb");
		this._$ScrollRef.on("scroll", this._onScrollHandler);
		this._setScrollPosition(this.getScrollPosition());
	};

	ScrollBar.prototype.onThemeChanged = function() {
		this.invalidate();
	};

	/**
	 * @override
	 */
	ScrollBar.prototype.setScrollPosition = function (iScrollPosition) {
		var iPos = Math.round(Math.max(iScrollPosition, 0));

		this._setScrollPosition(iPos);
		return this.setProperty("scrollPosition", iPos, true);
	};

	/**
	 * @override
	 * Custom setter, helping DOM changes to appear to the element, before DOM event handlers hit on it.
	 */
	ScrollBar.prototype.setContentSize = function (sContentSize) {
		var $SbCnt = this.$("sbcnt");
		if ($SbCnt.length) {
			$SbCnt.height(sContentSize);
		}

		return this.setProperty("contentSize", sContentSize);
	};


	//=============================================================================
	// Private Members
	//=============================================================================

	/**
	 * Handles the <code>scroll</code> event.
	 *
	 * @param {jQuery.Event} oEvent the Event object
	 * @private
	 */
	ScrollBar.prototype._onscroll = function(oEvent) {

		var iScrollPos = Math.abs(Math.round(this._$ScrollRef.scrollTop()));
		this.setProperty("scrollPosition", iScrollPos, true);
		this.fireScroll({pos: iScrollPos});

		oEvent.preventDefault();
		oEvent.stopPropagation();

		return false;
	};

	/**
	 * Sets <code>scrollTop</code> on <code>_$ScrollRef</code>
	 *
	 * @param {Number} iScrollPosition the scroll position
	 * @private
	 */
	ScrollBar.prototype._setScrollPosition = function (iScrollPosition) {
		if (this._$ScrollRef && this._$ScrollRef.length) {
			this._$ScrollRef.scrollTop(iScrollPosition);
		}
	};

	return ScrollBar;
});
