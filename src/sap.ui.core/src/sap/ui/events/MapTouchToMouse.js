/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";
	/**
	 * @exports sap/ui/events/MapTouchToMouse
	 * @private
	 */
	var oMapTouchToMouse = {};
	oMapTouchToMouse.init = function(oContext) {

		var oDocument = oContext,
			bHandleEvent = false,
			oTarget = null,
			bIsMoved = false,
			iStartX,
			iStartY,
			i = 0;

		var aMouseEvents = ["mousedown", "mouseover", "mouseup", "mouseout", "click"];

		/**
		 * Fires a synthetic mouse event for a given type and native touch event.
		 * @param {string} sType the type of the synthetic event to fire, e.g. "mousedown"
		 * @param {jQuery.Event} oEvent the event object
		 * @private
		 */
		var fireMouseEvent = function(sType, oEvent) {

			if (!bHandleEvent) {
				return;
			}

			// we need mapping of the different event types to get the correct target
			var oMappedEvent = oEvent.type == "touchend" ? oEvent.changedTouches[0] : oEvent.touches[0];

			// create the synthetic event
			var newEvent = oDocument.createEvent('MouseEvent'); // trying to create an actual TouchEvent will create an error
			newEvent.initMouseEvent(sType, true, true, window, oEvent.detail,
				oMappedEvent.screenX, oMappedEvent.screenY, oMappedEvent.clientX, oMappedEvent.clientY,
				oEvent.ctrlKey, oEvent.shiftKey, oEvent.altKey, oEvent.metaKey,
				oEvent.button, oEvent.relatedTarget);

			newEvent.isSynthetic = true;

			// Timeout needed. Do not interrupt the native event handling.
			window.setTimeout(function() {
				oTarget.dispatchEvent(newEvent);
			}, 0);
		};

		/**
		 * Checks if the target of the event is an input field.
		 * @param {jQuery.Event} oEvent the event object
		 * @return {boolean} whether the target of the event is an input field.
		 */
		var isInputField = function(oEvent) {
			return oEvent.target.tagName.match(/input|textarea|select/i);
		};

		/**
		 * Mouse event handler. Prevents propagation for native events.
		 * @param {jQuery.Event} oEvent the event object
		 * @private
		 */
		var onMouseEvent = function(oEvent) {
			if (!oEvent.isSynthetic && !isInputField(oEvent)) {
				oEvent.stopPropagation();
				oEvent.preventDefault();
			}
		};

		/**
		 * Touch start event handler. Called whenever a finger is added to the surface. Fires mouse start event.
		 * @param {jQuery.Event} oEvent the event object
		 * @private
		 */
		var onTouchStart = function(oEvent) {
			var oTouches = oEvent.touches,
				oTouch;

			bHandleEvent = (oTouches.length == 1 && !isInputField(oEvent));

			bIsMoved = false;
			if (bHandleEvent) {
				oTouch = oTouches[0];

				// As we are only interested in the first touch target, we remember it
				oTarget = oTouch.target;
				if (oTarget.nodeType === 3) {

					// no text node
					oTarget = oTarget.parentNode;
				}

				// Remember the start position of the first touch to determine if a click was performed or not.
				iStartX = oTouch.clientX;
				iStartY = oTouch.clientY;
				fireMouseEvent("mousedown", oEvent);
			}
		};

		/**
		 * Touch move event handler. Fires mouse move event.
		 * @param {jQuery.Event} oEvent the event object
		 * @private
		 */
		var onTouchMove = function(oEvent) {
			var oTouch;

			if (bHandleEvent) {
				oTouch = oEvent.touches[0];

				// Check if the finger is moved. When the finger was moved, no "click" event is fired.
				if (Math.abs(oTouch.clientX - iStartX) > 10 || Math.abs(oTouch.clientY - iStartY) > 10) {
					bIsMoved = true;
				}

				if (bIsMoved) {

					// Fire "mousemove" event only when the finger was moved. This is to prevent unwanted movements.
					fireMouseEvent("mousemove", oEvent);
				}
			}
		};

		/**
		 * Touch end event handler. Fires mouse up and click event.
		 * @param {jQuery.Event} oEvent the event object
		 * @private
		 */
		var onTouchEnd = function(oEvent) {
			fireMouseEvent("mouseup", oEvent);
			if (!bIsMoved) {
				fireMouseEvent("click", oEvent);
			}
		};

		/**
		 * Touch cancel event handler. Fires mouse up event.
		 * @param {jQuery.Event} oEvent the event object
		 * @private
		 */
		var onTouchCancel = function(oEvent) {
			fireMouseEvent("mouseup", oEvent);
		};

		// Bind mouse events
		for (; i < aMouseEvents.length; i++) {

			// Add click on capturing phase to prevent propagation if necessary
			oDocument.addEventListener(aMouseEvents[i], onMouseEvent, true);
		}

		// Bind touch events
		oDocument.addEventListener('touchstart', onTouchStart, true);
		oDocument.addEventListener('touchmove', onTouchMove, true);
		oDocument.addEventListener('touchend', onTouchEnd, true);
		oDocument.addEventListener('touchcancel', onTouchCancel, true);

		/**
		 * Disable touch to mouse handling
		 *
		 * @private
		 */
		oMapTouchToMouse.disableTouchToMouseHandling = function() {
			var i = 0;

			// unbind touch events
			oDocument.removeEventListener('touchstart', onTouchStart, true);
			oDocument.removeEventListener('touchmove', onTouchMove, true);
			oDocument.removeEventListener('touchend', onTouchEnd, true);
			oDocument.removeEventListener('touchcancel', onTouchCancel, true);

			// unbind mouse events
			for (; i < aMouseEvents.length; i++) {
				oDocument.removeEventListener(aMouseEvents[i], onMouseEvent, true);
			}
		};
	};

	return oMapTouchToMouse;
});