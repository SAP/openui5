/*!
 * ${copyright}
 */

/**
 * @namespace
 * @name sap.ui.core.delegate
 * @public
 */

// Provides class sap.ui.core.delegate.ScrollEnablement
sap.ui.define([
	'sap/ui/Device',
	'sap/ui/base/Object',
	'sap/ui/core/IntervalTrigger',
	'sap/ui/core/ResizeHandler',
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/KeyCodes"
],
	function(
		Device,
		BaseObject,
		IntervalTrigger,
		ResizeHandler,
		jQuery,
		KeyCodes
	) {
	"use strict";


		/**
		 * Creates a ScrollEnablement delegate that can be attached to Controls requiring
		 * capabilities for scrolling of a certain part of their DOM.
		 *
		 * @class Delegate for touch scrolling on mobile devices.
		 *
		 * This delegate uses native scrolling of mobile and desktop browsers. Third party scrolling libraries are not supported.
		 *
		 * Controls that implement ScrollEnablement should additionally provide the getScrollDelegate method that returns
		 * the current instance of this delegate object
		 *
		 * @extends sap.ui.base.Object
		 *
		 * @param {sap.ui.core.Control} oControl the Control of which this Scroller is the delegate
		 * @param {string} sScrollContentDom the Id of the element within the DOM of the Control which should be scrollable
		 * @param {object} oConfig the configuration of the scroll delegate
		 * @param {boolean} [oConfig.horizontal=false] Whether the element should be scrollable horizontally
		 * @param {boolean} [oConfig.vertical=false] Whether the element should be scrollable vertically
		 * @param {boolean} [oConfig.zynga=false] @deprecated since 1.42, the parameter has no effect
		 * @param {boolean} [oConfig.iscroll=false] @deprecated since 1.42, the parameter has no effect
		 * @param {boolean} [oConfig.preventDefault=false] @deprecated since 1.42, the parameter has no effect
		 * @param {boolean} [oConfig.nonTouchScrolling=false] If true, the delegate will also be active to allow touch like scrolling with the mouse on non-touch platforms.
		 * @param {string} [oConfig.scrollContainerId=""] Native scrolling does not need content wrapper. In this case, ID of the container element should be provided.
		 *
		 * @protected
		 * @alias sap.ui.core.delegate.ScrollEnablement
		 * @version ${version}
		 * @author SAP SE
		 */
		var ScrollEnablement = BaseObject.extend("sap.ui.core.delegate.ScrollEnablement", /** @lends sap.ui.core.delegate.ScrollEnablement.prototype */ {

			constructor : function(oControl, sScrollContentDom, oConfig) {

				BaseObject.apply(this);

				this._oControl = oControl;
				this._oControl.addDelegate(this);
				this._sContentId = sScrollContentDom;
				this._sContainerId = oConfig.scrollContainerId;
				this._bHorizontal = !!oConfig.horizontal;
				this._bVertical = !!oConfig.vertical;
				this._scrollX = 0;
				this._scrollY = 0;
				this._scrollCoef = 0.9; // Approximation coefficient used to mimic page down and page up behaviour when [CTRL] + [RIGHT] and [CTRL] + [LEFT] is used
				this._iLastMaxScrollTop = 0;

				initDelegateMembers(this);

				if (this._init) {
					this._init.apply(this, arguments);
				}
			},

			/**
			 * Enable or disable horizontal scrolling.
			 *
			 * @param {boolean} bHorizontal set true to enable horizontal scrolling, false - to disable
			 * @protected
			 */
			setHorizontal : function(bHorizontal) {
				this._bHorizontal = !!bHorizontal;
				this._setOverflow && this._setOverflow();
			},

			/**
			 * Enable or disable vertical scrolling.
			 *
			 * @param {boolean} bVertical set true to enable vertical scrolling, false - to disable
			 * @protected
			 */
			setVertical : function(bVertical) {
				this._bVertical = !!bVertical;
				this._setOverflow && this._setOverflow();
			},

			/**
			 * Get current setting for horizontal scrolling.
			 *
			 * @return {boolean} true if horizontal scrolling is enabled
			 * @protected
			 * @since 1.9.1
			 */
			getHorizontal : function() {
				return this._bHorizontal;
			},

			/**
			 * Get current setting for vertical scrolling.
			 *
			 * @return {boolean} true if vertical scrolling is enabled
			 * @protected
			 * @since 1.9.1
			 */
			getVertical : function() {
				return this._bVertical;
			},

			/**
			 * Setter for property <code>bounce</code>.
			 *
			 * @param {boolean} bBounce new value for property <code>bounce</code>.
			 * @protected
			 * @since 1.17
			 * @deprecated since 1.42
			 */
			setBounce: function(bBounce) {
			},

			/**
			 * Set overflow control on top of scroll container.
			 *
			 * @param {sap.ui.core.Control} oControl Top control that should be normally hidden over
			 * the top border of the scroll container (pull-down content).
			 * @protected
			 * @since 1.9.2
			 */
			setPullDown : function(oControl) {
				this._oPullDown = oControl;
				return this;
			},

			/**
			 * Sets GrowingList control to scroll container
			 *
			 * @param {function} fnScrollLoadCallback Scrolling callback
			 * @param {sap.m.ListGrowingDirection} sScrollLoadDirection Scrolling direction
			 * @param {function} fnOverflowChange listener for the <code>overflowChange</code> event
			 * @protected
			 * @since 1.11.0
			 */
			setGrowingList : function(fnScrollLoadCallback, sScrollLoadDirection, fnOverflowChange) {
				this._fnScrollLoadCallback = fnScrollLoadCallback;
				this._sScrollLoadDirection = sScrollLoadDirection;
				this.onOverflowChange(fnOverflowChange);
				return this;
			},

			/**
			 * Sets the listener for the custom <code>overflowChange</code> event
			 *
			 * Only a single listener can be registered
			 *
			 * @param {function} fnCallback
			 * @ui5-restricted sap.m.GrowingEnablement
			 * @private
			 * @since 1.74
			 */
			onOverflowChange : function(fnCallback){
				this._fnOverflowChangeCallback = fnCallback;
				if (!this._fnOverflowChangeCallback) {
					this._deregisterOverflowMonitor();
				}
			},

			/**
			 * Sets IconTabBar control to scroll container
			 *
			 * @param {sap.m.IconTabBar} oIconTabBar instance
			 * @param {function} fnScrollEndCallback callback function for the scroll end event
			 * @param {function} fnScrollStartCallback callback function for the scroll start event
			 * @protected
			 * @since 1.16.1
			 */
			setIconTabBar : function(oIconTabBar, fnScrollEndCallback, fnScrollStartCallback) {
				this._oIconTabBar = oIconTabBar;
				this._fnScrollEndCallback = jQuery.proxy(fnScrollEndCallback, oIconTabBar);
				this._fnScrollStartCallback = jQuery.proxy(fnScrollStartCallback, oIconTabBar);
				return this;
			},

			scrollTo : function(x, y, time) {
				this._scrollX = x; // remember for later rendering
				this._scrollY = y;
				this._scrollTo(x, y, time);
				return this;
			},

			/**
			 * Calculates scroll position of a child of a container.
			 * @param {HTMLElement | jQuery} vElement An element(DOM or jQuery) for which the scroll position will be calculated.
			 * @returns {object} Position object.
			 * @protected
			 */
			getChildPosition: function(vElement) {
				// check if vElement is a DOM element and if yes convert it to jQuery object
				var $Element = vElement instanceof jQuery ? vElement : jQuery(vElement),
					oElementPosition = $Element.position(),
					$OffsetParent = $Element.offsetParent(),
					oAddUpPosition;

				while (!$OffsetParent.is(this._$Container)) {
					oAddUpPosition = $OffsetParent.position();
					oElementPosition.top += oAddUpPosition.top;
					oElementPosition.left += oAddUpPosition.left;
					$OffsetParent = $OffsetParent.offsetParent();
				}

				return oElementPosition;
			},

			/**
			 * Scrolls to an element within a container.
			 * @param {HTMLElement} oElement A DOM element.
			 * @param {int} [iTime=0]
			 *           The duration of animated scrolling in milliseconds. To scroll immediately without animation,
			 *           give 0 as value.
			 * @param {int[]} [aOffset=[0,0]]
			 *           Specifies an additional left and top offset of the target scroll position, relative to
			 *           the upper left corner of the DOM element
			 * @returns {sap.ui.core.delegate.ScrollEnablement}
			 * @protected
			 */
			scrollToElement: function(oElement, iTime, aOffset) {
				aOffset = aOffset || [0, 0];

				// do nothing if _$Container is not a (grand)parent of oElement
				if (!this._$Container[0].contains(oElement) ||
					oElement.style.display === "none" ||
					oElement.offsetParent.nodeName.toUpperCase() === "HTML") {
						return this;
				}

				var $Element = jQuery(oElement),
					oScrollPosition = this.getChildPosition($Element),
					iLeftScroll = this.getScrollLeft() + oScrollPosition.left + aOffset[0],
					iTopScroll = this.getScrollTop() + oScrollPosition.top + aOffset[1];

				if (this._bFlipX) {
					// in IE RTL scrollLeft goes opposite direction
					iLeftScroll = this.getScrollLeft() - (oScrollPosition.left - this._$Container.width()) - $Element.width();
				}

				// scroll to destination
				this._scrollTo(iLeftScroll, iTopScroll , iTime);

				return this;
			},

			/**
			 * Destroys this Scrolling delegate.
			 *
			 * This function must be called by the control which uses this delegate in the <code>exit</code> function.
			 * @protected
			 */
			destroy : function() {
				if (this._exit) {
					this._exit();
				}

				if (this._oControl) {
					this._oControl.removeDelegate(this);
					this._oControl = undefined;
				}
			},

			/**
			 * Refreshes this Scrolling delegate.
			 *
			 * @protected
			 */
			refresh : function() {
				if (this._refresh) {
					this._refresh();
				}
			},

			_useDefaultScroll : function(target) {
				return target.isContentEditable;
			},

			onkeydown : function(oEvent) {
				if (this._useDefaultScroll(oEvent.target)) {
					return;
				}

				var container = this._$Container[0];

				if (oEvent.altKey && this.getHorizontal()) {
					switch (oEvent.keyCode) {
						case KeyCodes.PAGE_UP:
							// Navigate 1 page left
							this._customScrollTo(this._scrollX - container.clientWidth, this._scrollY, oEvent);
							break;
						case KeyCodes.PAGE_DOWN:
							// Navigate 1 page right
							this._customScrollTo(this._scrollX + container.clientWidth, this._scrollY, oEvent);
							break;
					}
				}

				if (oEvent.ctrlKey) {
					switch (oEvent.keyCode) {
						case KeyCodes.ARROW_UP:
							// [CTRL]+[UP] - 1 page up
							if (this.getVertical()) {
								this._customScrollTo(this._scrollX, this._scrollY - container.clientHeight * this._scrollCoef, oEvent);
							}
							break;
						case KeyCodes.ARROW_DOWN:
							// [CTRL]+[DOWN] - 1 page down
							if (this.getVertical()) {
								this._customScrollTo(this._scrollX, this._scrollY + container.clientHeight * this._scrollCoef, oEvent);
							}
							break;
						case KeyCodes.ARROW_LEFT:
							// [CTRL]+[LEFT] - 1 page left
							if (this.getHorizontal()) {
								this._customScrollTo(this._scrollX - container.clientWidth, this._scrollY, oEvent);
							}
							break;
						case KeyCodes.ARROW_RIGHT:
							// [CTRL]+[RIGHT] - 1 page right
							if (this.getHorizontal()) {
								this._customScrollTo(this._scrollX + container.clientWidth, this._scrollY, oEvent);
							}
							break;
						case KeyCodes.HOME:
							if (this.getHorizontal()) {
								this._customScrollTo(0, this._scrollY, oEvent);
							}

							if (this.getVertical()) {
								this._customScrollTo(this._scrollX, 0, oEvent);
							}
							break;
						case KeyCodes.END:

							var left = container.scrollWidth - container.clientWidth;
							var top = container.scrollHeight - container.clientHeight;

							if (!this.getHorizontal()) {
								top = this._scrollY;
							}

							if (!this.getVertical()) {
								left = this._scrollX;
							}

							this._customScrollTo(left, top, oEvent);
							break;
					}
				}
			},

			_customScrollTo : function(left, top, oEvent) {
				var sNodeName = oEvent.target.nodeName;
				// do not prevent events coming from input controls
				if (sNodeName != "INPUT" && sNodeName != "TEXTAREA") {
					oEvent.preventDefault();
					oEvent.setMarked();

					this._scrollTo(left, top);
				}
			}

		});

		/* =========================================================== */
		/* Native scroll delegate                                      */
		/* =========================================================== */

		var oNativeScrollDelegate = {

			getScrollTop : function() {
				return this._scrollY || 0;
			},

			getScrollLeft : function() {
				return this._scrollX || 0;
			},

			getScrollHeight : function() {
				var $Container = this._$Container;
				return ($Container && $Container[0]) ? $Container[0].scrollHeight : 0;
			},

			getMaxScrollTop : function() {
				var $Container = this._$Container;
				return ($Container && $Container[0]) ? $Container[0].scrollHeight - $Container[0].clientHeight : -1;
			},

			getContainerDomRef : function() {
				return this._$Container && this._$Container[0];
			},

			_cleanup : function() {
				if (this._sResizeListenerId) {
					ResizeHandler.deregister(this._sResizeListenerId);
					this._sResizeListenerId = null;
				}
				this._deregisterOverflowMonitor();
			},

			_setOverflow : function(){
				var $Container = this._$Container;
				if (!$Container || !$Container[0]) {
					return;
				}

				// Let container scroll into the configured directions
				if (Device.os.ios) {
					$Container
						.css("overflow-x", this._bHorizontal && !this._bDragScroll ? "scroll" : "hidden")
						.css("overflow-y", this._bVertical && !this._bDragScroll ? "scroll" : "hidden")
						.css("-webkit-overflow-scrolling", "touch");
				} else { //other browsers do not support -webkit-overflow-scrolling
					$Container
						.css("overflow-x", this._bHorizontal && !this._bDragScroll ? "auto" : "hidden")
						.css("overflow-y", this._bVertical && !this._bDragScroll ? "auto" : "hidden");
				}
			},

			_refresh : function(){
				var $Container = this._$Container;

				if (!($Container && $Container.length)) {
					return;
				}

				if (this._oPullDown && this._oPullDown._bTouchMode) {
					// hide pull to refresh (except for state 2 - loading)
					var domRef = this._oPullDown.getDomRef();
					if (domRef) {
							domRef.style.marginTop = this._oPullDown._iState == 2 ? "" : "-" + domRef.offsetHeight + "px";
					}
				}

				if ($Container.scrollTop() != this._scrollY) {
					$Container.scrollTop(this._scrollY);
				}

				if (!(this._oPullDown && this._oPullDown._bTouchMode)
					&& !this._fnScrollLoadCallback
					&& !Device.browser.msie) {
					// for IE the resize listener must remain in place for the case when navigating away and coming back.
					// For the other browsers it seems to work fine without.
					ResizeHandler.deregister(this._sResizeListenerId);
					this._sResizeListenerId = null;
				}
			},

			_onScroll: function() {
				var $Container = this._$Container,
					fScrollTop = $Container.scrollTop(),
					fVerticalMove = fScrollTop - this._scrollY;

				this._scrollX = $Container.scrollLeft(); // remember position
				this._scrollY = fScrollTop;

				// Growing List/Table
				if (this._fnScrollLoadCallback) {
					if (this._sScrollLoadDirection == "Upwards") {
						if (fVerticalMove < 0 && fScrollTop < 10) {
							this._fnScrollLoadCallback();
						}
					} else if (fVerticalMove >= 0 && $Container[0].scrollHeight - fScrollTop - $Container[0].clientHeight < 100) {
						this._fnScrollLoadCallback();
					}
				}

				// IconTabHeader
				if (this._oIconTabBar && this._fnScrollEndCallback) {
					this._fnScrollEndCallback();
				}
			},

			_onStart : function(oEvent){
				var container = this._$Container[0];
				if (!container) {
					return;
				}

				// Drag instead of native scroll
				this._bDoDrag = this._bDragScroll;

				// Store initial coordinates for drag scrolling
				var point = oEvent.touches ? oEvent.touches[0] : oEvent;
				this._iX = point.pageX;
				this._iY = point.pageY;

				this._bPullDown = false;
				this._iDirection = ""; // h - horizontal, v - vertical
			},

			_onTouchMove : function(oEvent){
				var container = this._$Container[0];
				var point = oEvent.touches ? oEvent.touches[0] : oEvent;
				var dx = point.pageX - this._iX;
				var dy = point.pageY - this._iY;

				if (this._iDirection == "") { // do once at start

					if (dx != 0 || dy != 0) {
						this._iDirection = Math.abs(dy) > Math.abs(dx) ? "v" : "h";
					}

					// PullToRefresh: replace native scrolling with drag, but only in this case
					if (this._oPullDown && this._oPullDown._bTouchMode && this._iDirection == "v" && container.scrollTop <= 1) {
						// pull only of near to top
						if (dy > Math.abs(dx)) {
							// user drags vertically down, disable native scrolling
							this._bPullDown = true;
						}
					}
				}

				if (this._bPullDown === true) {
					var pd = this._oPullDown.getDomRef();
					var top = oEvent.touches[0].pageY - this._iY - pd.offsetHeight;
					if ( top > 20) {
						top = 20;
					}
					pd.style.marginTop = top  + "px";
					// rotate pointer
					this._oPullDown.doPull(top);
					// prevent scrolling
					oEvent.preventDefault();
					this._bDoDrag = false; // avoid interference with drag scrolling
				}

				// Special case for dragging instead of scrolling:
				if (this._bDoDrag) {
					var scrollLeft = container.scrollLeft,
					scrollTop = container.scrollTop;
					if (this._bHorizontal) {
						if (this._bFlipX) {
							container.scrollLeft = scrollLeft - this._iX + point.pageX;
						} else {
							container.scrollLeft = scrollLeft + this._iX - point.pageX;
						}
					}
					if (this._bVertical) {
						container.scrollTop = scrollTop + this._iY - point.pageY;
					}
					if ((container.scrollLeft != scrollLeft) || (container.scrollTop != scrollTop)) { // if moved
						oEvent.setMarked && oEvent.setMarked();
						oEvent.preventDefault();
					}
					this._iX = point.pageX;
					this._iY = point.pageY;
					return;
				}
			},

			_onEnd : function(oEvent){
				if (this._oPullDown && this._oPullDown._bTouchMode) {
					this._oPullDown.doScrollEnd();
					this._refresh();
				}

				if (this._bDragScroll && this._iDirection) {
					oEvent.setMarked && oEvent.setMarked();
				}
			},

			// Mouse drag scrolling, optional.
			// Set options.nonTouchScrolling = true to enable
			_onMouseDown : function(oEvent){
				// start scrolling only when the left button is pressed
				if (this._bDragScroll && oEvent.button == 0) {
					this._bScrolling = true;
					this._onStart(oEvent);
				}
			},

			_onMouseMove : function(oEvent){
				// check if scrolling and the (left) button is pressed
				if (this._bScrolling) {
					var e = oEvent.originalEvent || oEvent;
					var button = e.buttons || e.which;
					if (button == 1 || oEvent.pressure) { // either the left mouse button or pen is pressed
						var container = this._$Container[0];
						if (this._bHorizontal) {
							if ( this._bFlipX ) {
								container.scrollLeft = container.scrollLeft - this._iX + oEvent.pageX;
							} else {
								container.scrollLeft = container.scrollLeft + this._iX - oEvent.pageX;
							}
						}
						if (this._bVertical) {
							container.scrollTop = container.scrollTop + this._iY - oEvent.pageY;
						}
						this._iX = oEvent.pageX;
						this._iY = oEvent.pageY;
					}
				}
			},

			_onMouseUp : function(){
				if (this._bScrolling) {
					this._bScrolling = false;
					this._onEnd();
				}
			},

			onBeforeRendering: function() {
				if (this._sResizeListenerId) {
					ResizeHandler.deregister(this._sResizeListenerId);
					this._sResizeListenerId = null;
				}
				this._deregisterOverflowMonitor();

				var $Container = this._$Container;
				if ($Container) {
					if ($Container.height() > 0) {
						this._scrollX = $Container.scrollLeft(); // remember position
						this._scrollY = $Container.scrollTop();
					}
					$Container.off(); // delete all event handlers
				}
			},

			_checkOverflowChange: function(oEvent) {
				var iMaxScrollTop = this.getMaxScrollTop(),
					bOverflow = iMaxScrollTop > 0 && this._iLastMaxScrollTop === 0,
					bUnderflow = iMaxScrollTop === 0 && this._iLastMaxScrollTop > 0,
					bOverflowChange = bOverflow || bUnderflow;

				if (bOverflowChange) {
					this._fnOverflowChangeCallback(bOverflow, iMaxScrollTop);
				}

				this._iLastMaxScrollTop = iMaxScrollTop;
			},

			_registerOverflowMonitor: function() {
				this._fnOverflowChangeCallback && IntervalTrigger.addListener(this._checkOverflowChange, this);
			},

			_deregisterOverflowMonitor: function() {
				IntervalTrigger.removeListener(this._checkOverflowChange, this);
			},

			onAfterRendering: function() {
				var $Container = this._$Container = this._sContainerId ? jQuery(document.getElementById(this._sContainerId)) : jQuery(document.getElementById(this._sContentId)).parent();
				var _fnRefresh = jQuery.proxy(this._refresh, this);
				var bElementVisible = $Container.is(":visible");

				this._setOverflow();

				// apply the previous scroll state
				if (this._scrollX !== 0 || this._scrollY !== 0) {
					this._scrollTo(this._scrollX, this._scrollY);
				}

				this._refresh();

				if (!bElementVisible
					|| Device.browser.msie
					|| this._oPullDown
					|| this._fnScrollLoadCallback) {

					// element may be hidden and have height 0
					this._sResizeListenerId = ResizeHandler.register($Container[0], _fnRefresh);
				}

				if (this._fnOverflowChangeCallback) {
					this._iOverflowTimer && window.cancelAnimationFrame(this._iOverflowTimer);
					this._iOverflowTimer = window.requestAnimationFrame(this._registerOverflowMonitor.bind(this));
				}

				//
				// Set event listeners
				//
				$Container.on("scroll", this._onScroll.bind(this));

				var oContainerRef = $Container[0];
				function addEventListeners (sEvents, fListener) {
					sEvents.split(" ").forEach(function(sEvent){
						oContainerRef && oContainerRef.addEventListener(sEvent, fListener);
					});
				}
				// React on mouse/pen and touch actions accordingly.
				// Pen behavior is the same as of the mouse.
				function onPointerDown(oEvent) {
					return oEvent.pointerType == "touch" ? this._onStart(oEvent) : this._onMouseDown(oEvent);
				}
				function onPointerMove(oEvent) {
					return oEvent.pointerType == "touch" ? this._onTouchMove(oEvent) : this._onMouseMove(oEvent);
				}
				function onPointerUp(oEvent) {
					return oEvent.pointerType == "touch" ? this._onEnd(oEvent) : this._onMouseUp(oEvent);
				}

				// Set pointer, touch or mouse event listeners, if needed:
				if (Device.support.pointer && Device.system.desktop) {
					// Desktop + pointer events: drag scroll (IconTabBar, Tokenizer)
					if (this._bDragScroll) {
						addEventListeners("pointerdown", onPointerDown.bind(this));
						addEventListeners("pointermove", onPointerMove.bind(this));
						addEventListeners("pointerup pointercancel pointerleave", onPointerUp.bind(this));
					}
				} else if (Device.support.touch) {
					// Drag scroll, PullToRefresh
					if (this._bDragScroll || this._oPullDown && this._oPullDown._bTouchMode) {
						$Container
							.on("touchcancel touchend", this._onEnd.bind(this))
							.on("touchstart", this._onStart.bind(this))
							.on("touchmove", this._onTouchMove.bind(this));
					}
				} else if (this._bDragScroll) {
					// Everything else: drag scroll
					$Container
						.on("mouseup mouseleave", this._onMouseUp.bind(this))
						.mousedown(this._onMouseDown.bind(this))
						.mousemove(this._onMouseMove.bind(this));
				}
			},

			_readActualScrollPosition: function() {
				// if container has a size, this method reads the current scroll position and stores it as desired position
				if (this._$Container.width() > 0) {
					this._scrollX = this._$Container.scrollLeft();
				}
				if (this._$Container.height() > 0) {
					this._scrollY = this._$Container.scrollTop();
				}
			},

			_scrollTo: function(x, y, time) {
				if (this._$Container.length > 0) {
					if (time > 0) {
						this._$Container.finish().animate({ scrollTop: y, scrollLeft: x }, time, jQuery.proxy(this._readActualScrollPosition, this));
					} else {
						this._$Container.scrollTop(y);
						this._$Container.scrollLeft(x);
						this._readActualScrollPosition(); // if container is too large no scrolling is possible
					}
				}
			}
		};

		/*
		 * Init delegator prototype according to various conditions.
		 */
		function initDelegateMembers(oScrollerInstance) {
			var oDelegateMembers = {
				_init : function(oControl, sScrollContentDom, oConfig) {
					// default scroll supression threshold of jQuery mobile is too small and prevent native scrolling
					if (jQuery.event && jQuery.event.special && jQuery.event.special.swipe && jQuery.event.special.swipe.scrollSupressionThreshold < 120) {
						jQuery.event.special.swipe.scrollSupressionThreshold = 120;
					}

					jQuery.extend(this, oNativeScrollDelegate);

					if (oConfig.nonTouchScrolling === true) {
						this._bDragScroll = true; // optional drag instead of native scrolling
					}
					if (sap.ui.getCore().getConfiguration().getRTL()) {
						this._scrollX = 9999; // in RTL case initially scroll to the very right
						if (Device.browser.msie || Device.browser.edge) {
							this._bFlipX = true; // in IE and Edge RTL, scrollLeft goes opposite direction
						}
					}
				},
				_exit : function() {
					if (this._cleanup) {
						this._cleanup();
					}
				}
			};
			// Copy over members to prototype
			jQuery.extend(oScrollerInstance, oDelegateMembers);
		}

	return ScrollEnablement;

});