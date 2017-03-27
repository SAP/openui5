/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './InstanceManager', 'sap/ui/core/Popup'],
	function(jQuery, InstanceManager, Popup) {
		"use strict";

		/**
		 * @class
		 * A small, non-disruptive popup for messages.
		 * <h3>Overview</h3>
		 * A message toast is a small, non-disruptive popup for success or information messages that disappears automatically after a few seconds.
		 * Toasts automatically disappear after a timeout unless the user moves the mouse over the toast or taps on it.
		 * Toasts can display a simple string message or an array of controls.
		 * Although a MessageToast can contain any array of controls, consider user experience:
		 * MessageToast popups should be used for non-disruptive notifications, with quick to understand content.
		 * If adding custom content, keep the user inputs intuitive and minimalist (one or two buttons is often sufficient).
		 * <h4>Notes:</h4>
		 * <ul>
		 * <li>If the configured message contains HTML code or script tags, those will be escaped.</li>
		 * <li>Line breaks (\r\n, \n\r, \r, \n) will be visualized.</li>
		 * <li>Only one message toast can be shown at a time in the same place.</li>
		 * <li> To allow the user to interact with controls in the Toast, set <code>autoClose: false</code>. </li>
		 * <li> To close the Toast following a user interaction, call [MessageToast.close]{@link sap.m.MessageToast.close}. In order to identify the pop-up
		 * with which the user has just interacted, a control within the toast must be provided, typically
		 * the source of the user-triggered event. </li>
		 * </ul>
		 * <h3>Examples</h3>
		 * <h4>Example with default options</h4>
		 * Here is an example of a MessageToast with all default options:
		 * <pre>
		 * sap.m.MessageToast.show("This message should appear in the message toast", {
		 *     duration: 3000,                  // default
		 *     width: "15em",                   // default
		 *     my: "center bottom",             // default
		 *     at: "center bottom",             // default
		 *     of: window,                      // default
		 *     offset: "0 0",                   // default
		 *     collision: "fit fit",            // default
		 *     onClose: null,                   // default
		 *     autoClose: true,                 // default
		 *     animationTimingFunction: "ease", // default
		 *     animationDuration: 1000,         // default
		 *     closeOnBrowserNavigation: true   // default
		 * });
		 * </pre>
		 *
		 * <h4>Example with custom content</h4>
		 * Here is an example of a MessageToast with custom content:
		 * <pre>
		 * // text control for display in toast
		 * var oContentText1 = new sap.m.Text({
		 * 	text: "Something's just happened",
		 * 	textAlign: "Center"
		 * }),
		 *
		 * // button control for display in toast
		 * oContentButton1 = new sap.m.Button({
		 * 	text: "Undo",
		 * 	type: "Emphasized",
		 * 	press: function (oEvent) {
		 * 		// close the toast - the user has interacted with it, it is no longer needed
		 * 		sap.m.MessageToast.close(oEvent.getSource());
		 * 		// call the function the button is to trigger
		 * 		sap.m.MessageToast.show("Action button pressed");
		 * 	}
		 * // add space between the buttons
		 * }).addStyleClass("sapUiSmallMarginBegin");
		 *
		 * // show the MessageToast
		 * sap.m.MessageToast.show([oContentText1, oContentButton1], {
		 * 	autoClose: false
		 * });
		 * </pre>
		 *
		 * <h3>Usage</h3>
		 * <h4>When to use:</h4>
		 * <ul>
		 * <li>You want to display a short success or information message.</li>
		 * <li>You do not want to interrupt users while they are performing an action.</li>
		 * <li>You want to confirm a successful action.</li>
		 * </ul>
		 * <h4>When not to use:</h4>
		 * <ul>
		 * <li>You want to display an error or warning message.</li>
		 * <li>You want to interrupt users while they are performing an action.</li>
		 * <li>You want to make sure that users read the message before they leave the page.</li>
		 * <li>You want users to be able to copy some part of the message text. (In this case, show a success {@link sap.m.Dialog Message Dialog}.)</li>
		 * <li> You want to display a complex interface or larger volumes of information. Consider instead using a {@link sap.m.Dialog Dialog}
		 * or navigating to an alternative view (navigation to which could be triggered by a MessageToast containing a button, for example). </li>
		 * </ul>
		 * <h3>Responsive Behavior</h3>
		 * The message toast has the same behavior on all devices. However, you can adjust the width of the control, for example, for use on a desktop device.
		 *
		 *
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @namespace
		 * @public
		 * @since 1.9.2
		 * @alias sap.m.MessageToast
		 */
		var MessageToast = {};

		/* =========================================================== */
		/* Internal methods and properties                             */
		/* =========================================================== */

		var OFFSET = "0 -64",
			CSSCLASS = "sapMMessageToast",
			ENABLESELECTIONCLASS = "sapUiSelectable",
			BELIZECONTRAST = "sapContrast",
			BELIZECONTRASTPLUS = "sapContrastPlus";

		// key of custom data for storing reference to the popup instance
		MessageToast.sPopupKey = "MessageToastPopup";

		MessageToast._mSettings = {
			duration: 3000,
			width: "15em",
			my: "center bottom",
			at: "center bottom",
			of: document.defaultView,
			offset: "0 0",
			collision: "fit fit",
			onClose: null,
			animationTimingFunction: "ease",
			animationDuration: 1000,
			autoClose: true,
			closeOnBrowserNavigation: true
		};

		MessageToast._aPopups = [];

		MessageToast._iOpenedPopups = 0;

		MessageToast._bBoundedEvents = false;

		MessageToast._validateSettings = function(mSettings) {

			// duration
			this._isFiniteInteger(mSettings.duration);

			// width
			this._validateWidth(mSettings.width);

			// my
			this._validateDockPosition(mSettings.my);

			// at
			this._validateDockPosition(mSettings.at);

			// of
			this._validateOf(mSettings.of);

			// offset
			this._validateOffset(mSettings.offset);

			// collision
			this._validateCollision(mSettings.collision);

			// onClose
			this._validateOnClose(mSettings.onClose);

			// autoClose
			this._validateAutoClose(mSettings.autoClose);

			// animationTimingFunction
			this._validateAnimationTimingFunction(mSettings.animationTimingFunction);

			// animationDuration
			this._isFiniteInteger(mSettings.animationDuration);
		};

		MessageToast._isFiniteInteger = function(iNumber) {
			if (typeof iNumber !== "number" || !isFinite(iNumber) || !(Math.floor(iNumber) === iNumber) || iNumber <= 0) {
				jQuery.sap.log.error('"iNumber" needs to be a finite positive nonzero integer on ' + this + "._isFiniteInteger");
			}
		};

		MessageToast._validateWidth = function(sWidth) {
			if (!sap.ui.core.CSSSize.isValid(sWidth)) {
				jQuery.sap.log.error(sWidth + ' is not of type ' + '"sap.ui.core.CSSSize" for property "width" on ' + this + "._validateWidth");
			}
		};

		MessageToast._validateDockPosition = function(sDock) {
			if (!sap.ui.core.Dock.isValid(sDock)) {
				jQuery.sap.log.error('"' + sDock + '"' + ' is not of type ' + '"sap.ui.core.Popup.Dock" on ' + this + "._validateDockPosition");
			}
		};

		MessageToast._validateOf = function(vElement) {
			if (!(vElement instanceof jQuery) &&
				!(vElement && vElement.nodeType === 1) &&
				!(vElement instanceof sap.ui.core.Control) &&
				vElement !== window) {

				jQuery.sap.log.error('"of" needs to be an instance of sap.ui.core.Control or an Element or a jQuery object or the window on ' + this + "._validateOf");
			}
		};

		MessageToast._validateOffset = function(sOffset) {
			if (typeof sOffset !== "string") {
				jQuery.sap.log.error(sOffset + ' is of type ' + typeof sOffset + ', expected "string" for property "offset" on ' + this + "._validateOffset");
			}
		};

		MessageToast._validateCollision = function(sCollision) {
			var rValidCollisions = /^(fit|flip|none|flipfit|flipflip|flip flip|flip fit|fitflip|fitfit|fit fit|fit flip)$/i;

			if (!rValidCollisions.test(sCollision)) {
				jQuery.sap.log.error('"collision" needs to be a single value “fit”, “flip”, or “none”, or a pair for horizontal and vertical e.g. "fit flip”, "fit none", "flipfit" on ' + this + "._validateOffset");
			}
		};

		MessageToast._validateOnClose = function(fn) {
			if (typeof fn !== "function" && fn !== null) {
				jQuery.sap.log.error('"onClose" should be a function or null on ' + this + "._validateOnClose");
			}
		};

		MessageToast._validateAutoClose = function(b) {
			if (typeof b !== "boolean") {
				jQuery.sap.log.error('"autoClose" should be a boolean on ' + this + "._validateAutoClose");
			}
		};

		MessageToast._validateAnimationTimingFunction = function(sTimingFunction) {
			var rValidTimingFn = /^(ease|linear|ease-in|ease-out|ease-in-out)$/i;

			if (!rValidTimingFn.test(sTimingFunction)) {
				jQuery.sap.log.error('"animationTimingFunction" should be a string, expected values: ' + "ease, linear, ease-in, ease-out, ease-in-out on " + this + "._validateAnimationTimingFunction");
			}
		};

		function hasDefaulPosition(mOptions) {
			for (var aPositionOptions = ["my", "at", "of", "offset"], i = 0; i < aPositionOptions.length; i++) {
				if (mOptions[aPositionOptions[i]] !== undefined) {
					return false;
				}
			}

			return true;
		}

		function createHTMLMarkup(mSettings) {
			var oMessageToastDomRef = document.createElement("div");

			oMessageToastDomRef.className = CSSCLASS + " " + ENABLESELECTIONCLASS + " " + BELIZECONTRAST + " " + BELIZECONTRASTPLUS;

			if (sap.ui.getCore().getConfiguration().getAccessibility()) {
				oMessageToastDomRef.setAttribute("role", "alert");

				// prevents JAWS from reading the text of the MessageToast twice
				oMessageToastDomRef.setAttribute("aria-label", " ");
			}

			oMessageToastDomRef.style.width = mSettings.width;
			oMessageToastDomRef.appendChild(document.createTextNode(mSettings.message));

			return oMessageToastDomRef;
		}

		function normalizeOptions(mOptions) {
			if (mOptions) {

				// if no position options are provided
				if (hasDefaulPosition(mOptions)) {

					// change the default offset
					mOptions.offset = OFFSET;
				}

				// if the document object is provided as an option, replace it with the window object,
				// the message toast should be showed relative to the visual viewport instead to the layout viewport
				if (mOptions.of && mOptions.of.nodeType === 9) {
					mOptions.of = document.defaultView;
				}
			} else {

				mOptions = {

					// if no options are provided, change the default offset
					offset: OFFSET
				};
			}

			return mOptions;
		}

		/* =========================================================== */
		/* Event handlers                                              */
		/* =========================================================== */

		MessageToast._handleResizeEvent = function() {

			if (sap.ui.Device.system.phone || sap.ui.Device.system.tablet) {
				this._resetPosition(this._aPopups);
			}

			jQuery.sap.delayedCall(0, this, "_applyPositions", [this._aPopups]);
		};

		MessageToast._handleMouseDownEvent = function(oEvent) {
			var bIsMessageToast = oEvent.target.hasAttribute("class") &&
				oEvent.target.getAttribute("class").indexOf(CSSCLASS) !== -1;

			if (bIsMessageToast || oEvent.isMarked("delayedMouseEvent")) {
				return;
			}

			this._aPopups.forEach(function(oPopup) {
				oPopup && oPopup.__bAutoClose && oPopup.close();
			});
		};

		MessageToast._resetPosition = function(aPopups) {
			for (var i = 0, oMessageToastDomRef; i < aPopups.length; i++) {
				oMessageToastDomRef = aPopups[i] && aPopups[i].getContent();

				if (oMessageToastDomRef) {
					oMessageToastDomRef.style.visibility = "hidden";
					oMessageToastDomRef.style.left = 0;
				}
			}
		};

		MessageToast._applyPositions = function(aPopups) {
			for (var i = 0, oPopup, mPosition; i < aPopups.length; i++) {
				oPopup = aPopups[i];
				if (oPopup) {
					mPosition = oPopup._oPosition;	// TODO _oPosition is a private property

					if (sap.ui.Device.system.phone || sap.ui.Device.system.tablet) {
						jQuery.sap.delayedCall(0, this, "_applyPosition", [oPopup, mPosition]);
					} else {
						oPopup.setPosition(mPosition.my, mPosition.at, mPosition.of, mPosition.offset);
					}
				}
			}
		};

		MessageToast._applyPosition = function(oPopup, mPosition) {
			var mPosition = mPosition || oPopup._oPosition,
				oMessageToastDomRef = oPopup.getContent();

			oPopup.setPosition(mPosition.my, mPosition.at, mPosition.of, mPosition.offset);
			oMessageToastDomRef.style.visibility = "visible";
		};

		MessageToast._setCloseAnimation = function($MessageToastDomRef, iDuration, fnClose, mSettings) {
			var sCssTransition = "opacity " + mSettings.animationTimingFunction + " " + mSettings.animationDuration + "ms",
				sTransitionEnd = "webkitTransitionEnd." + CSSCLASS + " transitionend." + CSSCLASS;

			if (sap.ui.getCore().getConfiguration().getAnimation() && mSettings.animationDuration > 0) {
				$MessageToastDomRef[0].style.webkitTransition = sCssTransition;
				$MessageToastDomRef[0].style.transition = sCssTransition;
				$MessageToastDomRef[0].style.opacity = 0;

				$MessageToastDomRef.on(sTransitionEnd, function handleMTTransitionEnd() {

					// unbound the event handler after its first invocation
					$MessageToastDomRef.off(sTransitionEnd);

					// handleMTClosed() function is called
					fnClose();
				});
			} else {
				fnClose();
			}
		};

		/* =========================================================== */
		/* API methods                                                 */
		/* =========================================================== */

		/**
		* Closes an instance of a MessageToast popup.
		*
		* @param {sap.ui.core.Control} oChild Reference to a control within the toast popup. Typically an individual toast would be closed in response to a user-triggered event from within the toast. The most straightforward way to close the toast is to pass the source of the event to MessageToast.close. The correct toast to close is identified by recursively getting parents of oChild until a toast popup instance is found.
		* @type void
		* @public
		*/
		MessageToast.close = function(oChild) {

			// Popups are stored as references on the MessageToast container control in MessageToast.show
			// Recursively look up the control tree until a control is found containing the Popup reference
			var fnLookupPopup = function (oChild) {
				// check whether the current control has the data attached
				if (oChild.data().hasOwnProperty(MessageToast.sPopupKey)) {
					// data is there, return it
					return oChild.data(MessageToast.sPopupKey);
				} else {
					// didn't find the data, look up the control tree to find an ancestor with it
					return fnLookupPopup(oChild.getParent());
				}
			};

			// get the reference to the sap.ui.core.Popup, stored on the MessageToast container then close it
			fnLookupPopup(oChild).close();
		};

		/**
		 * Creates and displays a typically small, short-lived notification popup.
		 * In order to allow users to interact with controls in the toast, set <code>autoClose: false</code>.
		 * The only mandatory parameter is <code>oContent</code>.
		 *
		 * @param {sap.ui.core.Control|string} oContent A control or array of controls to be placed in the toast. If a string is provided, the string is displayed as a text in the popup.
		 * @param {object} [mOptions] Object which can contain all other options. Not all entries in this object are required. This property is optional.
		 * @param {int} [mOptions.duration=3000] Time in milliseconds before the close animation starts. Needs to be a finite positive nonzero integer.
		 * @param {sap.ui.core.CSSSize} [mOptions.width='15em'] The width of the message toast, this value can be provided in %, em, px and all possible CSS measures.
		 * @param {sap.ui.core.Popup.Dock} [mOptions.my='center bottom'] Specifies which point of the message toast should be aligned.
		 * @param {sap.ui.core.Popup.Dock} [mOptions.at='center bottom'] Specifies the point of the reference element to which the message toast should be aligned.
		 * @param {sap.ui.core.Control|Element|jQuery|Window|undefined} [mOptions.of=window] Specifies the reference element to which the message toast should be aligned, by default it is aligned to the browser visual viewport.
		 * @param {string} [mOptions.offset='0 0'] The offset relative to the docking point, specified as a string with space-separated pixel values (e.g. "0 10" to move the message toast 10 pixels to the right).
		 * @param {string} [mOptions.collision='fit fit'] Specifies how the position of the message toast should be adjusted in case it overflows the screen in some direction. Possible values “fit”, “flip”, “none”, or a pair for horizontal and vertical e.g. "fit flip”, "fit none".
		 * @param {function} [mOptions.onClose=null] Function to be called when the message toast closes.
		 * @param {boolean} [mOptions.autoClose=true] Specify whether the message toast should close as soon as the end user touches the screen.
		 * @param {string} [mOptions.animationTimingFunction='ease'] Describes how the close animation will progress. Possible values "ease", "linear", "ease-in", "ease-out", "ease-in-out". This feature is not supported in android and ie9 browsers.
		 * @param {int} [mOptions.animationDuration=1000] Time in milliseconds that the close animation takes to complete. Needs to be a finite positive integer. For not animation set to 0. This feature is not supported in android and ie9 browsers.
		 * @param {boolean} [mOptions.closeOnBrowserNavigation=true] Specifies if the message toast closes on browser navigation.
		 *
		 * @type void
		 * @public
		 */
		MessageToast.show = function(oContent, mOptions) {
			var that = this,
				mSettings = jQuery.extend({}, this._mSettings, { message: "" }), // if omitted, mSettings.message returns "undefined"
				oPopup = new Popup(),
				oContentContainer,
				iPos,
				oMessageToastDomRef,
				sPointerEvents = "mousedown." + CSSCLASS + " touchstart." + CSSCLASS,
				iCloseTimeoutId,
				iMouseLeaveTimeoutId;

			mOptions = normalizeOptions(mOptions);

			// merge mOptions into mSettings
			jQuery.extend(mSettings, mOptions);

			// validate all settings
			this._validateSettings(mSettings);

			// if content is a string, set as a text control for backward compatibility
			if (typeof oContent === "string") {
				oContent = new sap.m.Text({
					text: oContent,
					textAlign: "Center"
				});
			}

			// group content into a single container control so the popup instance key can be added later
			oContentContainer = new sap.m.FlexBox({
				// add the content to the items of the container
				items: oContent,
				alignItems: "Center",
				alignContent: "Center",
				justifyContent: "Center"
			});

			// add the popup reference to the container so the popup can be closed in response to events - used by MessageToast.close
			oContentContainer.data(MessageToast.sPopupKey, oPopup);

			// create the message toast HTML markup
			oMessageToastDomRef = createHTMLMarkup(mSettings);

			// place the content container at the DomRef so it gets added to the popup
			oContentContainer.placeAt(oMessageToastDomRef);

			// save this pop-up instance and the position,
			// to be used inside fnMTAttachClosed closure
			iPos = this._aPopups.push(oPopup) - 1;

			// sets the content of the pop-up
			oPopup.setContent(oMessageToastDomRef);

			// sets the position of the pop-up
			oPopup.setPosition(mSettings.my, mSettings.at, mSettings.of, mSettings.offset, mSettings.collision);

			if (jQuery.support.cssTransitions) {

				// sets the animation functions to use for opening and closing the message toast
				oPopup.setAnimations(function fnMessageToastOpen($MessageToast, iDuration, fnOpened) {
					fnOpened();
				}, function fnMessageToastClose($MessageToastDomRef, iDuration, fnClose) {
					that._setCloseAnimation($MessageToastDomRef, iDuration, fnClose, mSettings);
				});
			}

			oPopup.setShadow(false);
			oPopup.__bAutoClose = mSettings.autoClose;

			if (mSettings.closeOnBrowserNavigation) {

				// add the pop-up instance to the InstanceManager to handle browser back navigation
				InstanceManager.addPopoverInstance(oPopup);
			}

			// do not bind if already bound
			if (!this._bBoundedEvents) {

				// bind to the resize event to handle orientation change and resize events
				jQuery(window).on("resize." + CSSCLASS, this._handleResizeEvent.bind(this));
				jQuery(document).on(sPointerEvents, this._handleMouseDownEvent.bind(this));
				this._bBoundedEvents = true;
			}

			// opens the popup's content at the position specified via #setPosition
			oPopup.open();
			this._iOpenedPopups++;

			function handleMTClosed() {
				InstanceManager.removePopoverInstance(that._aPopups[iPos]);
				jQuery(that._aPopups[iPos].getContent()).remove();
				that._aPopups[iPos].detachClosed(handleMTClosed);
				that._aPopups[iPos].destroy();
				that._aPopups[iPos] = null;
				that._iOpenedPopups--;

				if (that._iOpenedPopups === 0) {
					that._aPopups = [];
					jQuery(window).off("resize." + CSSCLASS);
					jQuery(document).off(sPointerEvents);

					that._bBoundedEvents = false;
				}

				if (typeof mSettings.onClose === "function") {
					mSettings.onClose.call(that);
				}
			}

			// attach event handler fnFunction to the "closed" event
			oPopup.attachClosed(handleMTClosed);

			// close the message toast
			iCloseTimeoutId = jQuery.sap.delayedCall(mSettings.duration, oPopup, "close");
			function fnClearTimeout() {
				jQuery.sap.clearDelayedCall(iCloseTimeoutId);
				iCloseTimeoutId = null;

				function fnMouseLeave() {
					iMouseLeaveTimeoutId = jQuery.sap.delayedCall(mSettings.duration, oPopup, "close");
					oPopup.getContent().removeEventListener("mouseleave", fnMouseLeave);
				}

				oPopup.getContent().addEventListener("mouseleave", fnMouseLeave);
				jQuery.sap.clearDelayedCall(iMouseLeaveTimeoutId);
				iMouseLeaveTimeoutId = null;
			}

			oPopup.getContent().addEventListener("touchstart", fnClearTimeout);
			oPopup.getContent().addEventListener("mouseover", fnClearTimeout);

			// WP 8.1 fires mouseleave event on tap
			if (sap.ui.Device.system.desktop) {
				oPopup.getContent().addEventListener("mouseleave", function () {
					iCloseTimeoutId = jQuery.sap.delayedCall(mSettings.duration,  oPopup, "close");
				});
			}
		};

		MessageToast.toString = function() {
			return "sap.m.MessageToast";
		};

		return MessageToast;

}, /* bExport= */ true);
