/*!
 * ${copyright}
 */

sap.ui.define([
	'./InstanceManager',
	'sap/ui/core/Popup',
	'sap/ui/core/library',
	'sap/ui/core/Control',
	'sap/ui/Device',
	"sap/base/Log",
	"sap/ui/thirdparty/jquery"
],
	function(InstanceManager, Popup, coreLibrary, Control, Device, Log, jQuery) {
		"use strict";

		// shortcut for sap.ui.core.Dock
		var Dock = coreLibrary.Dock;

		// shortcut for sap.ui.core.CSSSize
		var CSSSize = coreLibrary.CSSSize;

		/**
		 * @class
		 * A small, non-disruptive popup for messages.
		 * <h3>Overview</h3>
		 * A message toast is a small, non-disruptive popup for success or information messages that disappears automatically after a few seconds.
		 * Toasts automatically disappear after a timeout unless the user moves the mouse over the toast or taps on it.
		 * <h4>Notes:</h4>
		 * <ul>
		 * <li>If the configured message contains HTML code or script tags, those will be escaped.</li>
		 * <li>Line breaks (\r\n, \n\r, \r, \n) will be visualized.</li>
		 * <li>Only one message toast can be shown at a time in the same place.</li>
		 * </ul>
		 * <h4>Example:</h4>
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
		 * <h3>Usage</h3>
		 * <h4>When to use:</h4>
		 * <ul>
		 * <li>You want to display a short success of information message.</li>
		 * <li>You do not want to interrupt users while they are performing an action.</li>
		 * <li>You want to confirm a successful action.</li>
		 * </ul>
		 * <h4>When not to use:</h4>
		 * <ul>
		 * <li>You want to display an error or warning message.</li>
		 * <li>You want to interrupt users while they are performing an action.</li>
		 * <li>You want to make sure that users read the message before they leave the page.</li>
		 * <li>You want users to be able to copy some part of the message text. (In this case, show a success {@link sap.m.Dialog Message Dialog}.)</li>
		 * </ul>
		 * <h3>Responsive Behavior</h3>
		 * The message toast has the same behavior on all devices. However, you can adjust the width of the control, for example, for use on a desktop device.
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @namespace
		 * @public
		 * @since 1.9.2
		 * @alias sap.m.MessageToast
		 * @see {@link fiori:https://experience.sap.com/fiori-design-web/message-toast/ Message Toast}
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
			MessageToast._isFiniteInteger(mSettings.duration);

			// width
			MessageToast._validateWidth(mSettings.width);

			// my
			MessageToast._validateDockPosition(mSettings.my);

			// at
			MessageToast._validateDockPosition(mSettings.at);

			// of
			MessageToast._validateOf(mSettings.of);

			// offset
			MessageToast._validateOffset(mSettings.offset);

			// collision
			MessageToast._validateCollision(mSettings.collision);

			// onClose
			MessageToast._validateOnClose(mSettings.onClose);

			// autoClose
			MessageToast._validateAutoClose(mSettings.autoClose);

			// animationTimingFunction
			MessageToast._validateAnimationTimingFunction(mSettings.animationTimingFunction);

			// animationDuration
			MessageToast._isFiniteInteger(mSettings.animationDuration);
		};

		MessageToast._isFiniteInteger = function(iNumber) {
			if (typeof iNumber !== "number" || !isFinite(iNumber) || !(Math.floor(iNumber) === iNumber) || iNumber <= 0) {
				Log.error('"iNumber" needs to be a finite positive nonzero integer on ' + MessageToast + "._isFiniteInteger");
			}
		};

		MessageToast._validateWidth = function(sWidth) {
			if (!CSSSize.isValid(sWidth)) {
				Log.error(sWidth + ' is not of type ' + '"sap.ui.core.CSSSize" for property "width" on ' + MessageToast + "._validateWidth");
			}
		};

		MessageToast._validateDockPosition = function(sDock) {
			if (!Dock.isValid(sDock)) {
				Log.error('"' + sDock + '"' + ' is not of type ' + '"sap.ui.core.Popup.Dock" on ' + MessageToast + "._validateDockPosition");
			}
		};

		MessageToast._validateOf = function(vElement) {
			if (!(vElement instanceof jQuery) &&
				!(vElement && vElement.nodeType === 1) &&
				!(vElement instanceof Control) &&
				vElement !== window) {

				Log.error('"of" needs to be an instance of sap.ui.core.Control or an Element or a jQuery object or the window on ' + MessageToast + "._validateOf");
			}
		};

		MessageToast._validateOffset = function(sOffset) {
			if (typeof sOffset !== "string") {
				Log.error(sOffset + ' is of type ' + typeof sOffset + ', expected "string" for property "offset" on ' + MessageToast + "._validateOffset");
			}
		};

		MessageToast._validateCollision = function(sCollision) {
			var rValidCollisions = /^(fit|flip|none|flipfit|flipflip|flip flip|flip fit|fitflip|fitfit|fit fit|fit flip)$/i;

			if (!rValidCollisions.test(sCollision)) {
				Log.error('"collision" needs to be a single value “fit”, “flip”, or “none”, or a pair for horizontal and vertical e.g. "fit flip”, "fit none", "flipfit" on ' + MessageToast + "._validateOffset");
			}
		};

		MessageToast._validateOnClose = function(fn) {
			if (typeof fn !== "function" && fn !== null) {
				Log.error('"onClose" should be a function or null on ' + MessageToast + "._validateOnClose");
			}
		};

		MessageToast._validateAutoClose = function(b) {
			if (typeof b !== "boolean") {
				Log.error('"autoClose" should be a boolean on ' + MessageToast + "._validateAutoClose");
			}
		};

		MessageToast._validateAnimationTimingFunction = function(sTimingFunction) {
			var rValidTimingFn = /^(ease|linear|ease-in|ease-out|ease-in-out)$/i;

			if (!rValidTimingFn.test(sTimingFunction)) {
				Log.error('"animationTimingFunction" should be a string, expected values: ' + "ease, linear, ease-in, ease-out, ease-in-out on " + MessageToast + "._validateAnimationTimingFunction");
			}
		};

		function hasDefaultPosition(mOptions) {
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
				if (hasDefaultPosition(mOptions)) {

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

			if (Device.system.phone || Device.system.tablet) {
				MessageToast._resetPosition(MessageToast._aPopups);
			}

			setTimeout(MessageToast["_applyPositions"].bind(MessageToast, MessageToast._aPopups), 0);
		};

		MessageToast._handleMouseDownEvent = function(oEvent) {
			var bIsMessageToast = oEvent.target.hasAttribute("class") &&
				oEvent.target.getAttribute("class").indexOf(CSSCLASS) !== -1;

			if (bIsMessageToast || oEvent.isMarked("delayedMouseEvent")) {
				return;
			}

			MessageToast._aPopups.forEach(function(oPopup) {
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

					if (Device.system.phone || Device.system.tablet) {
						setTimeout(MessageToast["_applyPosition"].bind(MessageToast, oPopup, mPosition), 0);
					} else {
						oPopup.setPosition(mPosition.my, mPosition.at, mPosition.of, mPosition.offset);
					}
				}
			}
		};

		MessageToast._applyPosition = function(oPopup, mPosition) {
			mPosition = mPosition || oPopup._oPosition;
			var oMessageToastDomRef = oPopup.getContent();
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
		 * Creates and displays a simple message toast notification message with the given text, and optionally other options.
		 *
		 * The only mandatory parameter is <code>sMessage</code>.
		 *
		 * @param {string} sMessage The message to be displayed.
		 * @param {object} [mOptions] Object which can contain all other options. Not all entries in this object are required. This property is optional.
		 * @param {int} [mOptions.duration=3000] Time in milliseconds before the close animation starts. Needs to be a finite positive nonzero integer.
		 * @param {sap.ui.core.CSSSize} [mOptions.width='15em'] The width of the message toast, this value can be provided in %, em, px and all possible CSS measures.
		 * @param {sap.ui.core.Popup.Dock} [mOptions.my='center bottom'] Specifies which point of the message toast should be aligned (e.g. <code>Dock.LeftTop</code> To use as align point the left top corner of the message toast).
		 * @param {sap.ui.core.Popup.Dock} [mOptions.at='center bottom'] Specifies the point of the reference element to which the message toast should be aligned (e.g. <code>Dock.RightBottom</code> To position the message toast according to the bottom right corner of the reference element).
		 * @param {sap.ui.core.Control|Element|jQuery|Window|undefined} [mOptions.of=window] Specifies the reference element to which the message toast should be aligned, by default it is aligned to the browser visual viewport.
		 * @param {string} [mOptions.offset='0 0'] The offset relative to the docking point, specified as a string with space-separated pixel values (e.g. "10 5" to move the message toast 10 pixels to the right and 5 pixels to the bottom).
		 * @param {string} [mOptions.collision='fit fit'] Specifies how the position of the message toast should be adjusted in case it overflows the screen in some direction. Possible values “fit”, “flip”, “none”, or a pair for horizontal and vertical e.g. "fit flip”, "fit none".
		 * @param {function} [mOptions.onClose=null] Function to be called when the message toast closes.
		 * @param {boolean} [mOptions.autoClose=true] Specify whether the message toast should close as soon as the end user touches the screen.
		 * @param {string} [mOptions.animationTimingFunction='ease'] Describes how the close animation will progress. Possible values "ease", "linear", "ease-in", "ease-out", "ease-in-out".
		 * @param {int} [mOptions.animationDuration=1000] Time in milliseconds that the close animation takes to complete. Needs to be a finite positive integer. For not animation set to 0.
		 * @param {boolean} [mOptions.closeOnBrowserNavigation=true] Specifies if the message toast closes on browser navigation.
		 *
		 * @public
		 */
		MessageToast.show = function(sMessage, mOptions) {
			var that = MessageToast,
				mSettings = jQuery.extend({}, MessageToast._mSettings, { message: sMessage }),
				oPopup = new Popup(),
				iPos,
				oMessageToastDomRef,
				sPointerEvents = "mousedown." + CSSCLASS + " touchstart." + CSSCLASS,
				iCloseTimeoutId,
				iMouseLeaveTimeoutId;

			mOptions = normalizeOptions(mOptions);

			// merge mOptions into mSettings
			jQuery.extend(mSettings, mOptions);

			// validate all settings
			MessageToast._validateSettings(mSettings);

			// create the message toast HTML markup
			oMessageToastDomRef = createHTMLMarkup(mSettings);

			// save MessageToast pop-up instance and the position,
			// to be used inside fnMTAttachClosed closure
			iPos = MessageToast._aPopups.push(oPopup) - 1;

			// sets the content of the pop-up
			oPopup.setContent(oMessageToastDomRef);

			// sets the position of the pop-up
			oPopup.setPosition(mSettings.my, mSettings.at, mSettings.of, mSettings.offset, mSettings.collision);

			// sets the animation functions to use for opening and closing the message toast
			oPopup.setAnimations(function fnMessageToastOpen($MessageToast, iDuration, fnOpened) {
				fnOpened();
			}, function fnMessageToastClose($MessageToastDomRef, iDuration, fnClose) {
				that._setCloseAnimation($MessageToastDomRef, iDuration, fnClose, mSettings);
			});

			oPopup.setShadow(false);
			oPopup.__bAutoClose = mSettings.autoClose;

			if (mSettings.closeOnBrowserNavigation) {

				// add the pop-up instance to the InstanceManager to handle browser back navigation
				InstanceManager.addPopoverInstance(oPopup);
			}

			// do not bind if already bound
			if (!MessageToast._bBoundedEvents) {

				// bind to the resize event to handle orientation change and resize events
				jQuery(window).on("resize." + CSSCLASS, MessageToast._handleResizeEvent.bind(MessageToast));
				jQuery(document).on(sPointerEvents, MessageToast._handleMouseDownEvent.bind(MessageToast));
				MessageToast._bBoundedEvents = true;
			}

			// opens the popup's content at the position specified via #setPosition
			oPopup.open();
			MessageToast._iOpenedPopups++;

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
			iCloseTimeoutId = setTimeout(oPopup["close"].bind(oPopup), mSettings.duration);
			function fnClearTimeout() {
				clearTimeout(iCloseTimeoutId);
				iCloseTimeoutId = null;

				function fnMouseLeave() {
					iMouseLeaveTimeoutId = setTimeout(oPopup["close"].bind(oPopup), mSettings.duration);
					oPopup.getContent().removeEventListener("mouseleave", fnMouseLeave);
				}

				oPopup.getContent().addEventListener("mouseleave", fnMouseLeave);
				clearTimeout(iMouseLeaveTimeoutId);
				iMouseLeaveTimeoutId = null;
			}

			oPopup.getContent().addEventListener("touchstart", fnClearTimeout);
			oPopup.getContent().addEventListener("mouseover", fnClearTimeout);

			// WP 8.1 fires mouseleave event on tap
			if (Device.system.desktop) {
				oPopup.getContent().addEventListener("mouseleave", function () {
					iCloseTimeoutId = setTimeout(oPopup["close"].bind(oPopup), mSettings.duration);
				});
			}
		};

		MessageToast.toString = function() {
			return "sap.m.MessageToast";
		};

		return MessageToast;
	}, /* bExport= */ true);