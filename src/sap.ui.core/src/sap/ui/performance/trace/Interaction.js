/*!
 * ${copyright}
 */
sap.ui.define([
], function() {
	"use strict";

	let bInteractionActive = false;
	let oInteractionImpl;

	/**
	 * The SAP Statistics for OData
	 *
	 * @typedef {object} module:sap/ui/performance/trace/Interaction.SAPStatistics
	 * @public
	 *
	 * @property {string} url The url of the response
	 * @property {string} statistics The response header under the key "sap-statistics"
	 * @property {PerformanceResourceTiming} timing The last performance resource timing
	 */

	/**
	 * Interaction Entry
	 *
	 * @typedef {object} module:sap/ui/performance/trace/Interaction.Entry
	 * @public
	 *
	 * @property {string} event The event which triggered the interaction. The default value is "startup".
	 * @property {string} trigger The control which triggered the interaction.
	 * @property {string} component The identifier of the component or app that is associated with the
	 *  interaction.
	 * @property {string} appVersion The application version as from app descriptor
	 * @property {float} start The start timestamp of the interaction which is initially set to the
	 *  <code>fetchStart</code>
	 * @property {float} end The end timestamp of the interaction
	 * @property {float} navigation The sum over all navigation times
	 * @property {float} roundtrip The time from first request sent to last received response end - without
	 *  gaps and ignored overlap
	 * @property {float} processing The client processing time
	 * @property {float} duration The interaction duration
	 * @property {Array<PerformanceResourceTiming>} requests The Performance API requests during interaction
	 * @property {Array<module:sap/ui/performance/Measurement.Entry>} measurements The Performance
	 *  measurements
	 * @property {Array<module:sap/ui/performance/trace/Interaction.SAPStatistics>} sapStatistics The SAP
	 *  Statistics for OData
	 * @property {float} requestTime The sum over all requests in the interaction
	 * @property {float} networkTime The request time minus server time from the header
	 * @property {int} bytesSent The sum over all requests bytes
	 * @property {int} bytesReceived The sum over all responses bytes
	 * @property {"X"|""} requestCompression It's set with value "X" by default When compression does not
	 *  match SAP rules, we report an empty string.
	 * @property {float} busyDuration The sum of the global busy indicator duration during the interaction
	 * @property {string} id The ID of the interaction
	 * @property {string} passportAction The default PassportAction for startup
	 * @property {string} rootId The root context ID
	 */

	/**
	 * Provides base functionality for interaction detection heuristics & API.

	 * Interaction detection works through the detection of relevant events and tracking of rendering activities.<br>
	 * An example:<br>
	 * The user clicks on a button<br>
	 * <ul>
	 *  <li>"click" event gets detected via notification (<code>var notifyEventStart</code>)</li>
	 *  <li>a click handler is registered on the button, so this is an interaction start (<code>var notifyStepStart</code>)</li>
	 *  <li>some requests are made and rendering has finished (<code>var notifyStepEnd</code>)</li>
	 * </ul>
	 * All measurement takes place in {@link module:sap/ui/performance/Measurement}.
	 *
	 * @namespace
	 * @alias module:sap/ui/performance/trace/Interaction
	 *
	 * @public
	 * @since 1.76
	 */
	var Interaction = {

		/**
	 	 * Gets all interaction measurements.
		 *
		 * @param {boolean} bFinalize finalize the current pending interaction so that it is contained in the returned array
		 * @return {Array<module:sap/ui/performance/trace/Interaction.Entry>} all interaction measurements
		 *
		 * @static
		 * @public
		 * @since 1.76
		 */
		getAll : function(bFinalize) {
			return [];
		},

		/**
		 * Gets all interaction measurements for which a provided filter function returns a truthy value.
		 *
		 * To filter for certain categories of measurements a fnFilter can be implemented like this
		 * <code>
		 * function(InteractionMeasurement) {
		 *     return InteractionMeasurement.duration > 0
		 * }</code>
		 * @param {function} fnFilter a filter function that returns true if the passed measurement should be added to the result
		 * @return {Array<module:sap/ui/performance/trace/Interaction.Entry>} all interaction measurements passing the filter function successfully
		 *
		 * @static
		 * @public
		 * @since 1.76
		 */
		filter : function(fnFilter) {
			return [];
		},
		/**
		 * Gets the incomplete pending interaction.
		 *
		 * @return {object} interaction measurement
		 * @static
		 * @private
		 */
		getPending : function() {
			return undefined;
		},

		/**
		 * Clears all interaction measurements.
		 *
		 * @private
		 */
		clear : function() {},

		/**
		 * Start an interaction measurements.
		 *
		 * @param {string} sType type of the event which triggered the interaction
		 * @param {object} oSrcElement the control on which the interaction was triggered
		 * @static
		 * @private
		 */
		start : function(sType, oSrcElement) {},

		/**
		 * End an interaction measurements.
		 *
		 * @param {boolean} bForce forces end of interaction now and ignores further re-renderings
		 * @static
		 * @private
		 */
		end : function(bForce) {},

		/**
		 * Returns true if the interaction detection was enabled explicitly, or implicitly along with fesr.
		 *
		 * @return {boolean} bActive State of the interaction detection
		 * @static
		 * @public
		 * @since 1.76
		 */
		getActive : function() {
			return bInteractionActive;
		},

		/**
		 * Enables the interaction tracking.
		 *
		 * @param {boolean} bActive State of the interaction detection
		 * @returns {Promise} Resolves when FESR is active
		 * @static
		 * @public
		 * @since 1.76
		 */
		setActive : async function(bActive) {
			bInteractionActive = bActive;
			if (bActive) {
				await new Promise((resolve, reject) => {
					sap.ui.require([
						"sap/ui/performance/trace/_InteractionImpl"
					], (
						_InteractionImpl
					) => {
						Object.assign(Interaction, _InteractionImpl);
						oInteractionImpl = _InteractionImpl;
						oInteractionImpl._setActive(bActive);
						resolve();
					}, reject);
				});
			} else {
				oInteractionImpl?._setActive(bActive);
			}
		},

		/**
		 * Mark interaction as navigation related
		 * @private
		 */
		notifyNavigation: function() {},

		/**
		 * Start tracking busy time for a Control
		 * @param {sap.ui.core.Control} oControl Start tracking of busy duration for the given control
		 * @private
		 */
		notifyShowBusyIndicator : function(oControl) {},

		/**
		 * End tracking busy time for a Control
		 * @param {sap.ui.core.Control} oControl End tracking of busy duration for the given control
		 * @private
		 */
		notifyHideBusyIndicator : function(oControl) {},

		/**
		 * This method starts the actual interaction measurement when all criteria are met. As it is the starting point
		 * for the new interaction, the creation of the FESR headers for the last interaction is triggered here, so that
		 * the headers can be sent with the first request of the current interaction.<br>
		 *
		 * @param {string} sEventId The control event name
		 * @param {sap.ui.core.Element} oElement Element on which the interaction has been triggered
		 * @param {boolean} bForce Forces the interaction to start independently from a currently active browser event
		 * @static
		 * @private
		 */
		notifyStepStart : function(sEventId, oElement, bForce) {},

		/**
		 * Register async operation, that is relevant for a running interaction.
		 * Invoking the returned handle stops the async operation.
		 *
		 * @param {string} sStepName a step name
		 * @returns {function} The async handle
		 * @private
		 */
		notifyAsyncStep : function(sStepName) {
			return () => {};
		},

		/**
		 * This methods resets the idle time check. Counts a running interaction relevant step.
		 *
		 * @private
		*/
		notifyAsyncStepStart : function() {},

		/**
		 * Ends a running interaction relevant step by decreasing the internal count.
		 *
		 * @param {string} [sId] An internal step Id used for logging.
		 * @private
		*/
		notifyAsyncStepEnd : function(sId) {},

		/**
		 * This method ends the started interaction measurement.
		 *
		 * @static
		 * @param {boolean} bCheckIdle Whether cheking for idle time or not
		 * @private
		 */
		notifyStepEnd : function(bCheckIdle) {},

		/**
		 * This method notifies if a relevant event has been triggered.
		 *
		 * @param {Event} oEvent Event whose processing has started
		 * @static
		 * @private
		 */
		notifyEventStart : function(oEvent) {},

		/**
		 * This method notifies if a scroll event has been triggered. Some controls require this special treatment,
		 * as the generic detection process via notifyEventStart is not sufficient.
		 *
		 * @param {Event} oEvent Scroll event whose processing has started
		 * @static
		 * @private
		 */
		notifyScrollEvent : function(oEvent) {
			/* Scrolling is disabled as it does not work properly for non user triggered scrolling */
		},

		/**
		 * This method notifies if a relevant event has ended by detecting another interaction.
		 *
		 * @static
		 * @private
		 */
		notifyEventEnd : function() {},

		/**
		 * A hook which is called when an interaction is started.
		 *
		 * @param {object} oInteraction The pending interaction
		 * @private
		 */
		onInteractionStarted: null,

		/**
		 * A hook which is called when an interaction is finished.
		 *
		 * @param {object} oFinishedInteraction The finished interaction
		 * @private
		 */
		onInteractionFinished: null,

		/**
		 * This method sets the component name for an interaction once. This respects the case, where a new
		 * component is created in an interaction step while for example navigating to a new page. Differs
		 * from the actual owner component of the trigger control, which is still the previous component.
		 *
		 * @static
		 * @param {string} sComponentName The name of the component for the actual step.
		 * @private
		 */
		setStepComponent : function(sComponentName) {},

		/**
		 * @param {float} iDuration Increase busy duration of pending interaction by this value
		 * @static
		 * @private
		 */
		addBusyDuration : function (iDuration) {},

		setFESR : function(oFESR) {
			oInteractionImpl?._setFESR(oFESR);
		}
	};

	return Interaction;
});
