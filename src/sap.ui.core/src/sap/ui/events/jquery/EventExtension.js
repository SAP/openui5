/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/ui/thirdparty/jquery", "sap/ui/events/PseudoEvents"
], function(jQuery, PseudoEvents) {
	"use strict";

	/**
	 * Provides the jQuery.Event extensions.
	 *
	 * @namespace
	 * @alias module:sap/ui/events/jquery/EventExtension
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	var EventExtension = Object.create(null);

	var _bIsApplied = false;

	EventExtension.apply = function() {

		if (_bIsApplied) {
			return;
		}
		_bIsApplied = true;


		/**
		 * Constructor for a jQuery.Event object.
		 *
		 * See "http://www.jquery.com" and "http://api.jquery.com/category/events/event-object/".
		 *
		 * @class Check the jQuery.Event class documentation available under "http://www.jquery.com"
		 * and "http://api.jquery.com/category/events/event-object/" for details.
		 *
		 * @name jQuery.Event
		 * @public
		 */

		/**
		 * Returns an array of names (as strings) identifying {@link module:sap/ui/events/PseudoEvents} that are fulfilled by this very Event instance.
		 *
		 * @returns {string[]} Array of names identifying {@link module:sap/ui/events/PseudoEvents} that are fulfilled by this very Event instance.
		 * @public
		 */
		jQuery.Event.prototype.getPseudoTypes = function() {
			var aPseudoTypes = [];

			if (PseudoEvents.getBasicTypes().indexOf(this.type) != -1) {
				var ilength = PseudoEvents.order.length;
				var oPseudo = null;

				for (var i = 0; i < ilength; i++) {
					oPseudo = PseudoEvents.events[PseudoEvents.order[i]];
					if (oPseudo.aTypes
						&& oPseudo.aTypes.indexOf(this.type) > -1
						&& oPseudo.fnCheck
						&& oPseudo.fnCheck(this)) {
						aPseudoTypes.push(oPseudo.sName);
					}
				}
			}

			this.getPseudoTypes = function() {
				return aPseudoTypes.slice();
			};

			return aPseudoTypes.slice();
		};

		/**
		 * Checks whether this instance of {@link jQuery.Event} is of the given <code>sType</code> pseudo type.
		 *
		 * @param {string} sType The name of the pseudo type this event should be checked for.
		 * @returns {boolean} <code>true</code> if this instance of jQuery.Event is of the given sType, <code>false</code> otherwise.
		 * @public
		 */
		jQuery.Event.prototype.isPseudoType = function(sType) {
			var aPseudoTypes = this.getPseudoTypes();

			if (sType) {
				return aPseudoTypes.indexOf(sType) > -1;
			} else {
				return aPseudoTypes.length > 0;
			}
		};

		/**
		 * Returns OffsetX of Event.
		 *
		 * @returns {int} offsetX
		 * @public
		 */
		jQuery.Event.prototype.getOffsetX = function() {
			if (this.type == 'click' && this.offsetX) {
				return this.offsetX;
			}
			// nothing defined -> offset = 0
			return 0;
		};

		/**
		 * Returns OffsetY of Event.
		 *
		 * @returns {int} offsetY
		 * @public
		 */
		jQuery.Event.prototype.getOffsetY = function() {
			if (this.type == 'click' && this.offsetY) {
				return this.offsetY;
			}
			// nothing defined -> offset = 0
			return 0;
		};

		/**
		 * @returns {function} wrapped stopImmediatePropagation function
		 * @param {function} fnStopImmediatePropagation original stopImmediatePropagation function
		 */
		var createStopImmediatePropagationFunction = function(fnStopImmediatePropagation) {
			return function(bStopHandlers) {
				// execute the original function
				fnStopImmediatePropagation.apply(this, arguments);

				// only set the stop handlers flag if it is wished...
				if (bStopHandlers) {
					this._bIsStopHandlers = true;
				}
			};
		};

		// we still call the original stopImmediatePropagation
		var fnStopImmediatePropagation = jQuery.Event.prototype.stopImmediatePropagation;

		/**
		 * PRIVATE EXTENSION: allows to immediately stop the propagation of events in
		 * the event handler execution - means that "before" delegates can stop the
		 * propagation of the event to other delegates or the element and so on.
		 *
		 * @see sap.ui.core.Element.prototype._callEventHandles
		 * @param {boolean} bStopHandlers
		 */
		jQuery.Event.prototype.stopImmediatePropagation = createStopImmediatePropagationFunction(fnStopImmediatePropagation);

		/**
		 * PRIVATE EXTENSION: check if the handler propagation has been stopped.
		 * @see sap.ui.core.Element.prototype._callEventHandles
		 */
		jQuery.Event.prototype.isImmediateHandlerPropagationStopped = function() {
			return !!this._bIsStopHandlers;
		};

		/**
		 * Get the real native browser event from a jQuery event object
		 */
		var fnGetNativeEvent = function(oEvent) {
			while (oEvent && oEvent.originalEvent && oEvent !== oEvent.originalEvent) {
				oEvent = oEvent.originalEvent;
			}
			return oEvent;
		};

		/**
		 * Mark the event object for components that needs to know if the event was handled by a child component.
		 * PRIVATE EXTENSION
		 *
		 * @param {string} [sKey="handledByControl"]
		 * @param {string} [vValue=true]
		 */
		jQuery.Event.prototype.setMark = function(sKey, vValue) {
			sKey = sKey || "handledByControl";
			vValue = arguments.length < 2 ? true : vValue;

			var oNativeEvent = fnGetNativeEvent(this);
			oNativeEvent["_sapui_" + sKey] = vValue;
		};

		/**
		 * Check whether the event object is marked by the child component or not.
		 * PRIVATE EXTENSION
		 *
		 * @param {string} [sKey="handledByControl"]
		 * @returns {boolean} whether or not the event object is marked
		 */
		jQuery.Event.prototype.isMarked = function(sKey) {
			return !!this.getMark(sKey);
		};

		/**
		 * Return the marked value of a given key
		 * PRIVATE EXTENSION
		 *
		 * @param {string} [sKey="handledByControl"]
		 * @returns {any|undefined} the marked value or undefined
		 */
		jQuery.Event.prototype.getMark = function(sKey) {
			sKey = sKey || "handledByControl";

			var oNativeEvent = fnGetNativeEvent(this);
			return oNativeEvent["_sapui_" + sKey];
		};

		/**
		 * Mark the event object for components that needs to know if the event was handled by a child component.
		 * PRIVATE EXTENSION
		 *
		 * @see jQuery.Event.prototype.setMark
		 * @param {string} [sKey="handledByControl"]
		 */
		jQuery.Event.prototype.setMarked = jQuery.Event.prototype.setMark;

	};

	return EventExtension;
});
