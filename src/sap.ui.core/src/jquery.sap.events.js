/*!
 * ${copyright}
 */

// Provides functionality related to eventing.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/events/ControlEvents',
	'sap/base/events/PseudoEvents',
	'sap/base/events/checkMouseEnterOrLeave',
	'sap/base/events/isSpecialKey',
	'sap/base/events/isMouseEventDelayed',
	'sap/ui/events/_triggerEventHook',
	'sap/ui/events/F6Navigation',
	'sap/ui/events/jqueryEvent',
	'sap/ui/events/EventSimulation'
], function(jQuery, ControlEvents, PseudoEvents, fnCheckMouseEnterOrLeave, fnIsSpecialKey, fnIsMouseEventDelayed, _triggerEventHook, F6Navigation, jQueryEvent, EventSimulation) {
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
	 */
	jQuery.sap.ControlEvents = ControlEvents.events;

	/**
	 * Constructor for a jQuery.Event object.<br/>
	 * See "http://www.jquery.com" and "http://api.jquery.com/category/events/event-object/".
	 *
	 * @class Check the jQuery.Event class documentation available under "http://www.jquery.com"<br/>
	 * and "http://api.jquery.com/category/events/event-object/" for details.
	 *
	 * @name jQuery.Event
	 * @public
	 */

	/**
	 * Returns an array of names (as strings) identifying {@link jQuery.sap.PseudoEvents} that are fulfilled by this very Event instance.
	 *
	 * @name jQuery.Event.prototype.getPseudoTypes
	 * @function
	 * @returns {String[]} Array of names identifying {@link jQuery.sap.PseudoEvents} that are fulfilled by this very Event instance.
	 * @public
	 */

	/**
	 * Checks whether this instance of {@link jQuery.Event} is of the given <code>sType</code> pseudo type.
	 *
	 * @name jQuery.Event.prototype.isPseudoType
	 * @function
	 * @param {string} sType The name of the pseudo type this event should be checked for.
	 * @returns {boolean} <code>true</code> if this instance of jQuery.Event is of the given sType, <code>false</code> otherwise.
	 * @public
	 */

	/**
	 * Returns OffsetX of Event. In jQuery there is a bug. In IE the value is in offsetX, in FF in layerX
	 *
	 * @name jQuery.Event.prototype.getOffsetX
	 * @function
	 * @returns {int} offsetX
	 * @public
	 */

	/**
	 * Returns OffsetY of Event. In jQuery there is a bug. in IE the value is in offsetY, in FF in layerY.
	 *
	 * @name jQuery.Event.prototype.getOffsetY
	 * @function
	 * @returns {int} offsetY
	 * @public
	 */

	/**
	 * PRIVATE EXTENSION: allows to immediately stop the propagation of events in
	 * the event handler execution - means that "before" delegates can stop the
	 * propagation of the event to other delegates or the element and so on.
	 *
	 * @name jQuery.Event.prototype.stopImmediatePropagation
	 * @function
	 * @see sap.ui.core.Element.prototype._callEventHandles
	 * @param {boolean} bStopHandlers
	 */

	/**
	 * PRIVATE EXTENSION: check if the handler propagation has been stopped.
	 *
	 * @name jQuery.Event.prototype.isImmediateHandlerPropagationStopped
	 * @function
	 * @private
	 * @see sap.ui.core.Element.prototype._callEventHandles
	 */

	/**
	 * Mark the event object for components that needs to know if the event was handled by a child component.
	 * PRIVATE EXTENSION
	 *
	 * @name jQuery.Event.prototype.setMark
	 * @function
	 * @private
	 * @param {string} [sKey="handledByControl"]
	 * @param {string} [vValue=true]
	 */

	/**
	 * Mark the event object for components that needs to know if the event was handled by a child component.
	 * PRIVATE EXTENSION
	 *
	 * @name jQuery.Event.prototype.setMarked
	 * @function
	 * @private
	 * @see jQuery.Event.prototype.setMark
	 * @param {string} [sKey="handledByControl"]
	 */

	/**
	 * Check whether the event object is marked by the child component or not.
	 * PRIVATE EXTENSION
	 *
	 * @name jQuery.Event.prototype.isMarked
	 * @function
	 * @private
	 * @param {string} [sKey="handledByControl"]
	 * @returns {boolean}
	 */

	/**
	 * Return the marked value of a given key
	 * PRIVATE EXTENSION
	 *
	 * @name jQuery.Event.prototype.getMark
	 * @function
	 * @private
	 * @param {string} [sKey="handledByControl"]
	 * @returns {any} the marked value or undefined
	 */

	/**
	 * Disable touch to mouse handling
	 *
	 * @public
	 * @function
	 */
	jQuery.sap.disableTouchToMouseHandling = EventSimulation.disableTouchToMouseHandling;

	/**
	 * Defines touch event mode. Values used 'ON' and 'SIM'.
	 * @private
	 */
	jQuery.sap.touchEventMode = EventSimulation.touchEventMode;

	/**
	 * Binds all events for listening with the given callback function.
	 *
	 * @param {function} fnCallback Callback function
	 * @public
	 * @function
	 */
	jQuery.sap.bindAnyEvent = ControlEvents.bindAnyEvent;

	/**
	 * Unbinds all events for listening with the given callback function.
	 *
	 * @param {function} fnCallback Callback function
	 * @public
	 * @function
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
	*/
	jQuery.sap.isSpecialKey = fnIsSpecialKey;

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
	 */
	jQuery.sap.handleF6GroupNavigation = F6Navigation.handleF6GroupNavigation;

	/**
	 * CustomData attribute name for fast navigation groups (in DOM additional prefix "data-" is needed)
	 * @private
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
	 */

	jQuery.sap._refreshMouseEventDelayedFlag = function(oNavigator) {
		jQuery.sap.isMouseEventDelayed = fnIsMouseEventDelayed.apply(this, arguments);
	};

	jQuery.sap._refreshMouseEventDelayedFlag(navigator);

	jQuery.sap._suppressTriggerEvent = _triggerEventHook.suppress;
	jQuery.sap._releaseTriggerEvent = _triggerEventHook.release;

	return jQuery;
});