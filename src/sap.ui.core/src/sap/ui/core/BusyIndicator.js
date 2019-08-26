/*!
 * ${copyright}
 */

// A static class to show a busy indicator
sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'../base/EventProvider',
	'./Popup',
	'./Core',
	'./BusyIndicatorUtils',
	'sap/ui/core/library',
	"sap/ui/performance/trace/FESR",
	"sap/ui/performance/trace/Interaction",
	"sap/base/Log",
	"sap/base/assert",
	"sap/base/util/now"
],
	function(
		jQuery,
		EventProvider,
		Popup,
		Core,
		BusyIndicatorUtils,
		library,
		FESR,
		Interaction,
		Log,
		assert,
		now
	) {
	"use strict";

	//shortcut for sap.ui.core.BusyIndicatorSize
	var BusyIndicatorSize = library.BusyIndicatorSize;

	/**
	 * Provides methods to show or hide a waiting animation covering the whole
	 * page and blocking user interaction.
	 * @namespace
	 * @version ${version}
	 * @public
	 * @alias sap.ui.core.BusyIndicator
	 */
	var BusyIndicator = jQuery.extend( new EventProvider(), {
		oPopup: null,
		oDomRef: null,
		bOpenRequested: false,
		iDEFAULT_DELAY_MS: 1000,
		sDOM_ID: "sapUiBusyIndicator"
	});

	BusyIndicator.M_EVENTS = {
		Open: "Open",

		Close: "Close"
	};

	// This internal property keeps track if a show() call should be performed in case the core was not initialized yet.
	// When show() is called and this variable is undefined: a core init event-handler is attached.
	// When set to true || false internally, the core-init event-handler is not attached anymore.
	// This is to make sure the handler is only attached once.
	BusyIndicator._bShowIsDelayed = undefined;

	/**
	 * The <code>Open</code> event is fired, after the <code>BusyIndicator</code>
	 * has opened.
	 *
	 * @name sap.ui.core.BusyIndicator#Open
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent is the event object
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource is the instance
	 *                                    that fired the event
	 * @param {object} oControlEvent.getParameters provides all additional parameters
	 *                                    that are delivered with the event
	 * @param {jQuery} oControlEvent.getParameters.$Busy is the jQuery object
	 *                                    of the BusyIndicator
	 * @public
	 */

	/**
	 * The <code>Close</code> event is fired, <strong>before</strong> the
	 * <code>BusyIndicator</code> has closed.
	 *
	 * @name sap.ui.core.BusyIndicator#Close
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent is the event object
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource is the instance
	 *                                    that fired the event
	 * @param {object} oControlEvent.getParameters provides all additional parameters
	 *                                    that are delivered with the event
	 * @param {jQuery} oControlEvent.getParameters.$Busy is the jQuery object
	 *                                    of the BusyIndicator
	 * @public
	 */


	/**
	 * Sets up the BusyIndicator HTML and the Popup instance.
	 *
	 * @private
	 */
	BusyIndicator._init = function() {
		// Create the graphics element
		// inserts 2 divs:
		// 1. an empty one which will contain the old indicator (used in goldreflection)
		// 2. a div containing the new standard busy indicator (used in bluecrystal)

		var oRootDomRef = document.createElement("div");
		oRootDomRef.id = this.sDOM_ID;

		var oBusyContainer = document.createElement("div");
		this._oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core");
		var sTitle = this._oResBundle.getText("BUSY_TEXT");
		delete this._oResBundle;

		oBusyContainer.className = "sapUiBusy";
		oBusyContainer.setAttribute("tabindex", "0");
		oBusyContainer.setAttribute("role", "progressbar");
		oBusyContainer.setAttribute("alt", "");
		oBusyContainer.setAttribute("title", sTitle);
		oRootDomRef.appendChild(oBusyContainer);

		var oBusyElement = BusyIndicatorUtils.getElement(BusyIndicatorSize.Large);
		oBusyElement.setAttribute("title", sTitle);
		oRootDomRef.appendChild(oBusyElement);

		// Render into invisible area, so the size settings from CSS are applied
		var oInvisible = sap.ui.getCore().getStaticAreaRef();
		oInvisible.appendChild(oRootDomRef);

		this.oDomRef = oRootDomRef;

		//TODO how could this be destroyed? Who can/will destroy this?
		this.oPopup = new Popup(oRootDomRef);
		this.oPopup.setModal(true, "sapUiBlyBusy");
		this.oPopup.setShadow(false);
		this.oPopup.attachOpened(function(oEvent) {
			this._onOpen(oEvent);
		}, this);
	};

	/**
	 * This is the event listener that is called when the Popup of the BusyIndicator
	 * has opened
	 *
	 * @param {jQuery.Event} oEvent is the event that is provided by the EventProvider
	 * @private
	 */
	BusyIndicator._onOpen = function(oEvent) {
		// Grab the focus once opened
		var oDomRef = (BusyIndicator.sDOM_ID ? window.document.getElementById(BusyIndicator.sDOM_ID) : null);
		oDomRef.style.height = "100%";
		oDomRef.style.width = "100%";

		// setting the BusyIndicator's DOM to visible is done by the Popup

		var oAnimation = oDomRef.querySelector(".sapUiLocalBusyIndicator");
		oAnimation.className += " sapUiLocalBusyIndicatorFade";
		if (oDomRef) {
			oDomRef.focus();
		}

		jQuery("body").attr("aria-busy", true);

		// allow an event handler to do something with the indicator
		// and fire it after everything necessary happened
		this.fireOpen({
			$Busy: this.oPopup._$()
		});
	};

	/**
	 * Displays the <code>BusyIndicator</code> and starts blocking all user input.
	 * This only happens after some delay, and if, after that delay, the <code>BusyIndicator.hide()</code>
	 * has not yet been called in the meantime.
	 *
	 * There is a certain default value for the delay, which can be overridden.
	 *
	 * @public
	 * @param {int} [iDelay=1000] The delay in milliseconds before opening the <code>BusyIndicator</code>;
	 *                       It is not opened if <code>hide()</code> is called before the delay ends.
	 *                       If no delay (or no valid delay) is given, a delay of 1000 milliseconds is used.
	 */
	BusyIndicator.show = function(iDelay) {
		Log.debug("sap.ui.core.BusyIndicator.show (delay: " + iDelay + ") at " + new Date().getTime());
		assert(iDelay === undefined || (typeof iDelay == "number" && (iDelay % 1 == 0)), "iDelay must be empty or an integer");

		// If body/Core are not available yet, give them some more time and open
		// later if still required
		if (!document.body || !sap.ui.getCore().isInitialized()) {
			// register core init only once, when bShowIsDelayed is not set yet
			if (BusyIndicator._bShowIsDelayed === undefined) {
				sap.ui.getCore().attachInit(function () {
					// ignore init event, in case hide() was called in between
					if (BusyIndicator._bShowIsDelayed) {
						BusyIndicator.show(iDelay);
					}
				});
			}
			// everytime show() is called the call has to be delayed
			BusyIndicator._bShowIsDelayed = true;
			return;
		}

		if ((iDelay === undefined)
				|| ((iDelay != 0) && (parseInt(iDelay) == 0))
				|| (parseInt(iDelay) < 0)) {
			iDelay = this.iDEFAULT_DELAY_MS;
		}
		if (FESR.getActive()) {
			this._fDelayedStartTime = now() + iDelay;
		}

		// Initialize/create the BusyIndicator if this has not been done yet.
		// This has to be done before calling '_showNowIfRequested' because within
		// '_init' the BusyIndicator attaches itself to the Popup's open event and
		// to keep the correct order of 'show -> _showNowIfRequested -> _onOpen'
		// the attaching has to happen earlier.
		// Otherwise if an application attaches itself to the open event, this listener
		// will be called before the BusyIndicator's open listener.
		if (!this.oDomRef) {
			this._init();
		}

		this.bOpenRequested = true;
		if (iDelay === 0) { // avoid async call when there is no delay
			this._showNowIfRequested();
		} else {
			setTimeout(this["_showNowIfRequested"].bind(this), iDelay);
		}
	};

	/**
	 * Immediately displays the BusyIndicator if the application has not called
	 * hide() yet.
	 *
	 * @private
	 */
	BusyIndicator._showNowIfRequested = function() {
		Log.debug("sap.ui.core.BusyIndicator._showNowIfRequested (bOpenRequested: " + this.bOpenRequested + ") at " + new Date().getTime());

		// Do not open if the request has been canceled in the meantime
		if (!this.bOpenRequested) {
			return;
		}

		// The current scroll position of window needs to be passed as offset to Popup
		// to keep the scroll position of the window.
		// Otherwise, the BusyIndicator may be placed partically off-screen initially
		// and the browser scrolls itself up to shift the whole BusyIndicator into the
		// viewport which result as that the window loses its scroll position
		var iOffsetX = (window.scrollX === undefined ? window.pageXOffset : window.scrollX);
		var iOffsetY = (window.scrollY === undefined ? window.pageYOffset : window.scrollY);
		var sOffset = iOffsetX + " " + iOffsetY;

		this.bOpenRequested = false; // opening request is handled

		// Actually open the popup
		this.oPopup.open(0, Popup.Dock.LeftTop, Popup.Dock.LeftTop, document, sOffset);
	};

	/**
	 * Removes the BusyIndicator from the screen.
	 *
	 * @public
	 */
	BusyIndicator.hide = function() {
		Log.debug("sap.ui.core.BusyIndicator.hide at " + new Date().getTime());
		if (this._fDelayedStartTime) {  // Implies fesr header active
			// The busy indicator shown duration d is calculated with:
			// d = "time busy indicator was hidden" - "time busy indicator was requested" - "busy indicator delay"
			var fBusyIndicatorShownDuration = now() - this._fDelayedStartTime;
			Interaction.addBusyDuration((fBusyIndicatorShownDuration > 0) ? fBusyIndicatorShownDuration : 0);
			delete this._fDelayedStartTime;
		}
		var bi = BusyIndicator; // Restore scope in case we are called with setTimeout or so...

		// When hide() is called, a potential delayed show-call has to be ignored.
		// Since there is no Core.detachInit(), this flag is used to reject an existing core-init handler
		if (BusyIndicator._bShowIsDelayed === true) {
			BusyIndicator._bShowIsDelayed = false;
		}

		bi.bOpenRequested = false;

		if (bi.oDomRef) { // only if the BusyIndicator was shown before!
			jQuery("body").removeAttr("aria-busy");

			// setting the BusyIndicator's DOM to invisible is not
			// necessary here - it will be done by the Popup in 'oPopup.close(0)'

			var oAnimation = bi.oDomRef.querySelector(".sapUiLocalBusyIndicator");
			jQuery(oAnimation).removeClass("sapUiLocalBusyIndicatorFade");

			// allow an event handler to do something with the indicator
			this.fireClose({
				$Busy: this.oPopup._$()
			});

			bi.oPopup.close(0);
		}

	};


	/*  EVENT HANDLING */

	/**
	 * Registers a handler for the {@link #event:Open Open} event.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to <code>sap.ui.core.BusyIndicator</code>.
	 *
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with; defaults to
	 *            <code>sap.ui.core.BusyIndicator</code>
	 * @returns {sap.ui.core.BusyIndicator} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	BusyIndicator.attachOpen = function(fnFunction, oListener) {
		this.attachEvent(BusyIndicator.M_EVENTS.Open, fnFunction, oListener);
		return this;
	};

	/**
	 * Unregisters a handler from the {@link #event:Open Open} event.
	 *
	 * @param {function}
	 *            fnFunction The callback function to unregister
	 * @param {object}
	 *            [oListener] Context object on which the given function had to be called
	 * @returns {sap.ui.core.BusyIndicator} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	BusyIndicator.detachOpen = function(fnFunction, oListener) {
		this.detachEvent(BusyIndicator.M_EVENTS.Open, fnFunction, oListener);
		return this;
	};

	/**
	 * Registers a handler for the {@link #event:Close Close} event.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to <code>sap.ui.core.BusyIndicator</code>.
	 *
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with; defaults to
	 *            <code>sap.ui.core.BusyIndicator</code>
	 * @returns {sap.ui.core.BusyIndicator} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	BusyIndicator.attachClose = function(fnFunction, oListener) {
		this.attachEvent(BusyIndicator.M_EVENTS.Close, fnFunction, oListener);
		return this;
	};

	/**
	 * Unregisters a handler from the {@link #event:Close Close} event.
	 *
	 * @param {function}
	 *            fnFunction The callback function to unregister
	 * @param {object}
	 *            [oListener] Context object on which the given function had to be called
	 * @returns {sap.ui.core.BusyIndicator} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	BusyIndicator.detachClose = function(fnFunction, oListener) {
		this.detachEvent(BusyIndicator.M_EVENTS.Close, fnFunction, oListener);
		return this;
	};

	BusyIndicator.fireOpen = function(mParameters) {
		this.fireEvent(BusyIndicator.M_EVENTS.Open, mParameters);
	};

	BusyIndicator.fireClose = function(mParameters) {
		this.fireEvent(BusyIndicator.M_EVENTS.Close, mParameters);
	};

	return BusyIndicator;

}, /* bExport= */ true);