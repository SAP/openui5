/*!
 * ${copyright}
 */

// Provides functionality related to eventing.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/events/ControlEvents',
	'sap/ui/events/PseudoEvents',
	'sap/ui/events/checkMouseEnterOrLeave',
	'sap/ui/events/isSpecialKey',
	'sap/ui/events/isMouseEventDelayed',
	'sap/ui/events/F6Navigation',
	'sap/ui/events/jquery/EventSimulation',
	'sap/ui/events/KeyCodes',
	'sap/base/util/defineCoupledProperty',
	'sap/ui/events/jquery/EventExtension' // implicit dependency
], function(jQuery, ControlEvents, PseudoEvents, fnCheckMouseEnterOrLeave, fnIsSpecialKey, fnIsMouseEventDelayed, F6Navigation, EventSimulation, KeyCodes, defineCoupledProperty) {
	"use strict";


	/**
	 * Enumeration of all so called "pseudo events", a useful classification
	 * of standard browser events as implied by SAP product standards.
	 *
	 * Whenever a browser event is recognized as one or more pseudo events, then this
	 * classification is attached to the original {@link jQuery.Event} object and thereby
	 * delivered to any jQuery-style listeners registered for that browser event.
	 *
	 * Pure JavaScript listeners can evaluate the classification information using
	 * the {@link jQuery.Event#isPseudoType} method.
	 *
	 * Instead of using the procedure as described above, the SAPUI5 controls and elements
	 * should simply implement an <code>on<i>pseudo-event</i>(oEvent)</code> method. It will
	 * be invoked only when that specific pseudo event has been recognized. This simplifies event
	 * dispatching even further.
	 *
	 * @namespace
	 * @public
	 * @deprecated since 1.58 use {@link module:sap/ui/events/PseudoEvents.events} instead
	 */
	jQuery.sap.PseudoEvents = PseudoEvents.events;



	/**
	 * Pseudo event for keyboard arrow down without modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapdown
	 */

	/**
	 * Pseudo event for keyboard arrow down with modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapdownmodifiers
	 */

	/**
	 * Pseudo event for pseudo 'show' event (F4, Alt + down-Arrow)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapshow
	 */

	/**
	 * Pseudo event for keyboard arrow up without modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapup
	 */

	/**
	 * Pseudo event for keyboard arrow up with modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapupmodifiers
	 */

	/**
	 * Pseudo event for pseudo 'hide' event (Alt + up-Arrow)
	 * @public
	 * @name jQuery.sap.PseudoEvents.saphide
	 */

	/**
	 * Pseudo event for keyboard arrow left without modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapleft
	 */

	/**
	 * Pseudo event for keyboard arrow left with modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapleftmodifiers
	 */

	/**
	 * Pseudo event for keyboard arrow right without modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapright
	 */

	/**
	 * Pseudo event for keyboard arrow right with modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.saprightmodifiers
	 */

	/**
	 * Pseudo event for keyboard Home/Pos1 with modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.saphome
	 */

	/**
	 * Pseudo event for keyboard Home/Pos1 without modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.saphomemodifiers
	 */

	/**
	 * Pseudo event for  pseudo top event
	 * @public
	 * @name jQuery.sap.PseudoEvents.saptop
	 */

	/**
	 * Pseudo event for keyboard End without modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapend
	 */

	/**
	 * Pseudo event for keyboard End with modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapendmodifiers
	 */

	/**
	 * Pseudo event for pseudo bottom event
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapbottom
	 */

	/**
	 * Pseudo event for keyboard page up without modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sappageup
	 */

	/**
	 * Pseudo event for keyboard page up with modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sappageupmodifiers
	 */

	/**
	 * Pseudo event for keyboard page down without modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sappagedown
	 */

	/**
	 * Pseudo event for keyboard page down with modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sappagedownmodifiers
	 */

	/**
	 * Pseudo event for pseudo 'select' event... space, enter, ... without modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapselect
	 */

	/**
	 * Pseudo event for pseudo 'select' event... space, enter, ... with modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapselectmodifiers
	 */

	/**
	 * Pseudo event for keyboard space without modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapspace
	 */

	/**
	 * Pseudo event for keyboard space with modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapspacemodifiers
	 */

	/**
	 * Pseudo event for keyboard enter without modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapenter
	 */

	/**
	 * Pseudo event for keyboard enter with modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapentermodifiers
	 */

	/**
	 * Pseudo event for keyboard backspace without modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapbackspace
	 */

	/**
	 * Pseudo event for keyboard backspace with modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapbackspacemodifiers
	 */

	/**
	 * Pseudo event for keyboard delete without modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapdelete
	 */

	/**
	 * Pseudo event for keyboard delete with modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapdeletemodifiers
	 */

	/**
	 * Pseudo event for pseudo expand event (keyboard numpad +) without modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapexpand
	 */

	/**
	 * Pseudo event for pseudo expand event (keyboard numpad +) with modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapexpandmodifiers
	 */

	/**
	 * Pseudo event for pseudo collapse event (keyboard numpad -) without modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapcollapse
	 */

	/**
	 * Pseudo event for pseudo collapse event (keyboard numpad -) with modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapcollapsemodifiers
	 */

	/**
	 * Pseudo event for pseudo collapse event (keyboard numpad *)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapcollapseall
	 */

	/**
	 * Pseudo event for keyboard escape
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapescape
	 */

	/**
	 * Pseudo event for keyboard tab (TAB + no modifier)
	 * @public
	 * @name jQuery.sap.PseudoEvents.saptabnext
	 */

	/**
	 * Pseudo event for keyboard tab (TAB + shift modifier)
	 * @public
	 * @name jQuery.sap.PseudoEvents.saptabprevious
	 */

	/**
	 * Pseudo event for pseudo skip forward (F6 + no modifier)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapskipforward
	 */

	/**
	 * Pseudo event for pseudo skip back (F6 + shift modifier)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapskipback
	 */

	/**
	 * Pseudo event for pseudo 'decrease' event without modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapdecrease
	 */

	/**
	 * Pseudo event for pressing the '-' (minus) sign.
	 * @since 1.25.0
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapminus
	 */

	/**
	 * Pseudo event for pseudo 'decrease' event with modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapdecreasemodifiers
	 */

	/**
	 * Pseudo event for pseudo 'increase' event without modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapincrease
	 */

	/**
	 * Pseudo event for pressing the '+' (plus) sign.
	 * @since 1.25.0
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapplus
	 */

	/**
	 * Pseudo event for pseudo 'increase' event with modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapincreasemodifiers
	 */

	/**
	 * Pseudo event for pseudo 'previous' event without modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapprevious
	 */

	/**
	 * Pseudo event for pseudo 'previous' event with modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sappreviousmodifiers
	 */

	/**
	 * Pseudo event for pseudo 'next' event without modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapnext
	 */

	/**
	 * Pseudo event for pseudo 'next' event with modifiers (Ctrl, Alt or Shift)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapnextmodifiers
	 */

	/**
	 * Pseudo event indicating delayed double click (e.g. for inline edit)
	 * @public
	 * @name jQuery.sap.PseudoEvents.sapdelayeddoubleclick
	 */

	/**
	 * List of DOM events that a UIArea automatically takes care of.
	 *
	 * A control/element doesn't have to bind listeners for these events.
	 * It instead can implement an <code>on<i>event</i>(oEvent)</code> method
	 * for any of the following events that it wants to be notified about:
	 *
	 * click, dblclick, contextmenu, focusin, focusout, keydown, keypress, keyup, mousedown, mouseout, mouseover,
	 * mouseup, select, selectstart, dragstart, dragenter, dragover, dragleave, dragend, drop, paste, cut, input,
	 * touchstart, touchend, touchmove, touchcancel, tap, swipe, swipeleft, swiperight, scrollstart, scrollstop
	 *
	 * The mouse events and touch events are supported simultaneously on both desktop and mobile browsers. Do NOT
	 * create both onmouse* and ontouch* functions to avoid one event being handled twice on the same control.
	 * @namespace
	 * @public
	 * @deprecated since 1.58 use {@link module:sap/ui/events/ControlEvents.events} instead
	 */
	jQuery.sap.ControlEvents = ControlEvents.events;

	/**
	 * Disable touch to mouse handling
	 *
	 * @public
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/ui/events/jquery/EventSimulation.disableTouchToMouseHandling} instead
	 */
	jQuery.sap.disableTouchToMouseHandling = EventSimulation.disableTouchToMouseHandling;

	/**
	 * Defines touch event mode. Values used 'ON' and 'SIM'.
	 * @private
	 * @deprecated since 1.58 use {@link module:sap/ui/events/jquery/EventSimulation.touchEventMode} instead
	 */
	defineCoupledProperty(jQuery.sap, "touchEventMode", EventSimulation, "touchEventMode");

	/**
	 * Binds all events for listening with the given callback function.
	 *
	 * @param {function} fnCallback Callback function
	 * @public
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/ui/events/ControlEvents.bindAnyEvent} instead
	 */
	jQuery.sap.bindAnyEvent = ControlEvents.bindAnyEvent;

	/**
	 * Unbinds all events for listening with the given callback function.
	 *
	 * @param {function} fnCallback Callback function
	 * @public
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/ui/events/ControlEvents.unbindAnyEvent} instead
	 */
	jQuery.sap.unbindAnyEvent = ControlEvents.unbindAnyEvent;

	/**
	 * Checks a given mouseover or mouseout event whether it is
	 * equivalent to a mouseenter or mousleave event regarding the given DOM reference.
	 *
	 * @param {jQuery.Event} oEvent
	 * @param {Element} oDomRef
	 * @public
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/ui/events/checkMouseEnterOrLeave} instead
	 */
	jQuery.sap.checkMouseEnterOrLeave = fnCheckMouseEnterOrLeave;

	/**
	* Detect whether the pressed key is:
	* SHIFT, CONTROL, ALT, BREAK, CAPS_LOCK,
	* PAGE_UP, PAGE_DOWN, END, HOME, ARROW_LEFT, ARROW_UP, ARROW_RIGHT, ARROW_DOWN,
	* PRINT, INSERT, DELETE, F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12,
	* BACKSPACE, TAB, ENTER, ESCAPE
	*
	* @param {jQuery.Event} oEvent The event object of the <code>keydown</code>, <code>keyup</code> or <code>keypress</code> events.
	* @static
	* @returns {boolean}
	* @protected
	* @since 1.24.0
	* @experimental Since 1.24.0 Implementation might change.
	* @function
	* @deprecated since 1.58 use {@link module:sap/ui/events/isSpecialKey} instead
	*/
	jQuery.sap.isSpecialKey = function(oEvent) {
		if (oEvent.key) {
			return fnIsSpecialKey(oEvent);
		}

		// legacy case where Event.key is not use, e.g. when jQuery.Events are created manually instead of using the Browser's KeyBoardEvent

		/**
		 * Detect whether the pressed key is a modifier.
		 *
		 * Modifier keys are considered:
		 * SHIFT, CONTROL, ALT, CAPS_LOCK, NUM_LOCK
		 * These keys don't send characters, but modify the characters sent by other keys.
		 *
		 * @param {jQuery.Event} oEvent The event object of the <code>keydown</code>, <code>keyup</code> or <code>keypress</code> events.
		 * @static
		 * @returns {boolean} True if a modifier key was pressed
		 */
		function isModifierKey(oEvent) {
			var iKeyCode = oEvent.which; // jQuery oEvent.which normalizes oEvent.keyCode and oEvent.charCode

			return (iKeyCode === KeyCodes.SHIFT) ||
				(iKeyCode === KeyCodes.CONTROL) ||
				(iKeyCode === KeyCodes.ALT) ||
				(iKeyCode === KeyCodes.CAPS_LOCK) ||
				(iKeyCode === KeyCodes.NUM_LOCK);
		}

		/**
		 * Detect whether the pressed key is a navigation key.
		 *
		 * Navigation keys are considered:
		 * ARROW_LEFT, ARROW_UP, ARROW_RIGHT, ARROW_DOWN
		 *
		 * @param {jQuery.Event} oEvent The event object of the <code>keydown</code>, <code>keyup</code> or <code>keypress</code> events.
		 * @static
		 * @returns {boolean} True if a arrow key was pressed
		 */
		function isArrowKey(oEvent) {
			var iKeyCode = oEvent.which, // jQuery oEvent.which normalizes oEvent.keyCode and oEvent.charCode
				bArrowKey = (iKeyCode >= 37 && iKeyCode <= 40); // ARROW_LEFT, ARROW_UP, ARROW_RIGHT, ARROW_DOWN

			switch (oEvent.type) {
				case "keydown":
				case "keyup":
					return bArrowKey;

				// note: the keypress event should be fired only when a character key is pressed,
				// unfortunately some browsers fire the keypress event for other keys. e.g.:
				//
				// Firefox fire it for:
				// ARROW_LEFT, ARROW_RIGHT
				case "keypress":

					// in Firefox, almost all noncharacter keys that fire the keypress event have a key code of 0
					return iKeyCode === 0;

				default:
					return false;
			}
		}

		var iKeyCode = oEvent.which, // jQuery oEvent.which normalizes oEvent.keyCode and oEvent.charCode
			bSpecialKey = isModifierKey(oEvent) ||
				isArrowKey(oEvent) ||
				(iKeyCode >= 33 && iKeyCode <= 36) || // PAGE_UP, PAGE_DOWN, END, HOME
				(iKeyCode >= 44 && iKeyCode <= 46) || // PRINT, INSERT, DELETE
				(iKeyCode >= 112 && iKeyCode <= 123) || // F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12
				(iKeyCode === KeyCodes.BREAK) ||
				(iKeyCode === KeyCodes.BACKSPACE) ||
				(iKeyCode === KeyCodes.TAB) ||
				(iKeyCode === KeyCodes.ENTER) ||
				(iKeyCode === KeyCodes.ESCAPE) ||
				(iKeyCode === KeyCodes.SCROLL_LOCK);

		switch (oEvent.type) {
			case "keydown":
			case "keyup":
				return bSpecialKey;

			// note: the keypress event should be fired only when a character key is pressed,
			// unfortunately some browsers fire the keypress event for other keys. e.g.:
			//
			// Firefox < 65 fire it for:
			// BREAK, ARROW_LEFT, ARROW_RIGHT, INSERT, DELETE,
			// F1, F2, F3, F5, F6, F7, F8, F9, F10, F11, F12
			// BACKSPACE, ESCAPE
			//
			// Safari fire it for:
			// BACKSPACE, ESCAPE
			case "keypress":
				return (iKeyCode === 0 || // in Firefox < 65, almost all noncharacter keys that fire the keypress event have a key code of 0, with the exception of BACKSPACE (key code of 8)
					iKeyCode === KeyCodes.BACKSPACE ||
					iKeyCode === KeyCodes.ESCAPE ||
					iKeyCode === KeyCodes.ENTER /* all browsers */) || false;

			default:
				return false;
		}
	};

	/**
	 * Central handler for F6 key event. Based on the current target and the given event the next element in the F6 chain is focused.
	 *
	 * This handler might be also called manually. In this case the central handler is deactivated for the given event.
	 *
	 * If the event is not a keydown event, it does not represent the F6 key, the default behavior is prevented,
	 * the handling is explicitly skipped (<code>oSettings.skip</code>) or the target (<code>oSettings.target</code>) is not contained
	 * in the used scopes (<code>oSettings.scope</code>), the event is skipped.
	 *
	 * @param {jQuery.Event} oEvent a <code>keydown</code> event object.
	 * @param {object} [oSettings] further options in case the handler is called manually.
	 * @param {boolean} [oSettings.skip=false] whether the event should be ignored by the central handler (see above)
	 * @param {Element} [oSettings.target=document.activeElement] the DOMNode which should be used as starting point to find the next DOMNode in the F6 chain.
	 * @param {Element[]} [oSettings.scope=[document]] the DOMNodes(s) which are used for the F6 chain search
	 * @static
	 * @private
	 * @since 1.25.0
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/ui/events/F6Navigation.handleF6GroupNavigation} instead
	 */
	jQuery.sap.handleF6GroupNavigation = function (oEvent, oSettings) {
		// map keyCode to key property of the event, e.g. if jQuery.Event was created manually
		if (!oEvent.key && oEvent.keyCode === KeyCodes.F6) {
			oEvent.key = "F6";
		}
		return F6Navigation.handleF6GroupNavigation(oEvent, oSettings);

	};

	/**
	 * CustomData attribute name for fast navigation groups (in DOM additional prefix "data-" is needed)
	 * @private
	 * @deprecated since 1.58 use {@link module:sap/ui/events/F6Navigation.fastNavigationKey} instead
	 */
	jQuery.sap._FASTNAVIGATIONKEY = F6Navigation.fastNavigationKey;

	/**
	 * Whether the current browser fires mouse events after touch events with long delay (~300ms)
	 *
	 * Mobile browsers fire mouse events after touch events with a delay (~300ms)
	 * Some modern mobile browsers already removed the delay under some condition. Those browsers are:
	 *  1. iOS Safari in iOS 8 (except UIWebView / WKWebView).
	 *  2. Chrome on Android from version 32 (exclude the Samsung stock browser which also uses Chrome kernel)
	 *
	 * @param {Navigator} oNavigator the window navigator object.
	 * @private
	 * @name jQuery.sap.isMouseEventDelayed
	 * @since 1.30.0
	 * @deprecated since 1.58 use {@link module:sap/ui/events/isMouseEventDelayed} instead
	 */

	jQuery.sap._refreshMouseEventDelayedFlag = function(oNavigator) {
		jQuery.sap.isMouseEventDelayed = fnIsMouseEventDelayed.apply(this, arguments);
	};

	jQuery.sap._refreshMouseEventDelayedFlag(navigator);

	return jQuery;
});
