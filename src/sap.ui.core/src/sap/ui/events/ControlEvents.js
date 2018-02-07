/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	'sap/ui/thirdparty/jquery'
], function(jQuery) {
	"use strict";

	/**
	 * @exports sap/ui/events/ControlEvents
	 * @private
	 */
	var oControlEvents = {};

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
	 *
	 * @private
	 */
	oControlEvents.events = [ // IMPORTANT: update the public documentation when extending this list
		"click",
		"dblclick",
		"contextmenu",
		"focusin",
		"focusout",
		"keydown",
		"keypress",
		"keyup",
		"mousedown",
		"mouseout",
		"mouseover",
		"mouseup",
		"select",
		"selectstart",
		"dragstart",
		"dragenter",
		"dragover",
		"dragleave",
		"dragend",
		"drop",
		"paste",
		"cut",
		/* input event is fired synchronously on IE9+ when the value of an <input> or <textarea> element is changed */
		/* for more details please see : https://developer.mozilla.org/en-US/docs/Web/Reference/Events/input */
		"input"
	];

	/**
	 * Binds all events for listening with the given callback function.
	 *
	 * @param {function} fnCallback Callback function
	 * @private
	 */
	oControlEvents.bindAnyEvent = function(fnCallback) {
		if (fnCallback) {
			jQuery(document).bind(oControlEvents.events.join(" "), fnCallback);
		}
	};

	/**
	 * Unbinds all events for listening with the given callback function.
	 *
	 * @param {function} fnCallback Callback function
	 * @private
	 */
	oControlEvents.unbindAnyEvent = function unbindAnyEvent(fnCallback) {
		if (fnCallback) {
			jQuery(document).unbind(oControlEvents.events.join(" "), fnCallback);
		}
	};

	return oControlEvents;
});