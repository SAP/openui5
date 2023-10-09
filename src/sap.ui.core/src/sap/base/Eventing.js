/*!
 * ${copyright}
 */

// Provides mixin sap/base/Eventing
sap.ui.define([
	"sap/base/assert",
	"sap/base/Event"
], function(
	assert,
	Event
) {
	"use strict";

	/**
	 * Eventing
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @since 1.120.0
	 * @private
	 * @ui5-restricted sap.ui.core sap/base/i18n
	 */
	class Eventing {
		#mEventRegistry = {};
		/**
		 * Attaches an event handler to the event with the given identifier.
		 *
		 * @param {string}
		 * 		sType The type of the event to listen for
		 * @param {function}
		 * 		fnFunction The handler function to call when the event occurs. The event
		 * 		object ({@link module:sap/base/Event}) is provided as first argument of the handler. Handlers must not change
		 * 		the content of the event.
		 * @param {object}
		 * 		[oData] An object that will be passed to the handler along with the event object when the event is fired
		 * @since 1.120.0
		 * @private
		 * @ui5-restricted sap.ui.core sap/base/i18n
		 */
		attachEvent(sType, fnFunction, oData) {
			assert(typeof (sType) === "string" && sType, "Eventing.attachEvent: sType must be a non-empty string");
			assert(typeof (fnFunction) === "function", "Eventing.attachEvent: fnFunction must be a function");

			let aEventListeners = this.#mEventRegistry[sType];
			if ( !Array.isArray(aEventListeners) ) {
				aEventListeners = this.#mEventRegistry[sType] = [];
			}

			aEventListeners.push({fnFunction: fnFunction, oData: oData});
		}

		/**
		 * Attaches an event handler, called one time only, to the event with the given identifier.
		 *
		 * When the event occurs, the handler function is called and the handler registration is automatically removed afterwards.
		 *
		 * @param {string}
		 *            sType The type of the event to listen for
		 * @param {function}
		 *            fnFunction The handler function to call when the event occurs. The event
		 *                       object ({@link module:sap/base/Event}) is provided as first argument of the handler. Handlers must not change
		 *                       the content of the event.
		 * @param {object}
		 *            [oData] An object that will be passed to the handler along with the event object when the event is fired
		 * @since 1.120.0
		 * @private
		 * @ui5-restricted sap.ui.core sap/base/i18n
		 */
		attachEventOnce(sType, fnFunction, oData) {
			const fnOnce = (oEvent) => {
				this.detachEvent(sType, fnOnce);
				fnFunction.call(null, oEvent);  // needs to do the same resolution as in fireEvent
			};
			fnOnce.oOriginal = {
				fnFunction: fnFunction
			};
			this.attachEvent(sType, fnOnce, oData);
		}

		/**
		 * Removes a previously attached event handler from the event with the given identifier.
		 *
		 * The passed parameters must match those used for registration with {@link #attachEvent} beforehand.
		 *
		 * @param {string}
		 *            sType The type of the event to detach from
		 * @param {function}
		 *            fnFunction The handler function to detach from the event
		 * @since 1.120.0
		 * @private
		 * @ui5-restricted sap.ui.core sap/base/i18n
		 */
		detachEvent(sType, fnFunction) {
			assert(typeof (sType) === "string" && sType, "Eventing.detachEvent: sType must be a non-empty string" );
			assert(typeof (fnFunction) === "function", "Eventing.detachEvent: fnFunction must be a function");

			const aEventListeners = this.#mEventRegistry[sType];
			if ( !Array.isArray(aEventListeners) ) {
				return;
			}

			let oFound;

			for (let i = 0, iL = aEventListeners.length; i < iL; i++) {
				if (aEventListeners[i].fnFunction === fnFunction) {
					oFound = aEventListeners[i];
					aEventListeners.splice(i,1);
					break;
				}
			}
			// If no listener was found, look for original listeners of attachEventOnce
			if (!oFound) {
				for (let i = 0, iL = aEventListeners.length; i < iL; i++) {
					const oOriginal = aEventListeners[i].fnFunction.oOriginal;
					if (oOriginal && oOriginal.fnFunction === fnFunction) {
						aEventListeners.splice(i,1);
						break;
					}
				}
			}
			// If we just deleted the last registered EventHandler, remove the whole entry from our map.
			if (aEventListeners.length == 0) {
				delete this.#mEventRegistry[sType];
			}
		}

		/**
		 * Fires an {@link module:sap/base/Event event} with the given settings and notifies all attached event handlers.
		 *
		 * @param {string}
		 *            sType The type of the event to fire
		 * @param {object}
		 *            [oParameters] Parameters which should be carried by the event
		 * @since 1.120.0
		 * @private
		 * @ui5-restricted sap.ui.core sap/base/i18n
		 */
		fireEvent(sType, oParameters) {
			let aEventListeners, oEvent, i, iL, oInfo;

			aEventListeners = this.#mEventRegistry[sType];

			if (Array.isArray(aEventListeners)) {

				// avoid issues with 'concurrent modification' (e.g. if an event listener unregisters itself).
				aEventListeners = aEventListeners.slice();
				oEvent = new Event(sType, oParameters);

				for (i = 0, iL = aEventListeners.length; i < iL; i++) {
					oInfo = aEventListeners[i];
					oInfo.fnFunction.call(null, oEvent);
				}
			}
		}
	}

	return Eventing;
});