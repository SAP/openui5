/*
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * A registry of <code>sap.ui.core.Element</code> hooks that can be used to register, deregister callback functions.
	 *
	 * @alias module:sap/ui/core/ElementHooks
	 * @namespace
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	const ElementHooks = {
		/**
		 * Intercepts an event. This method is meant for private usages. Apps are not supposed to used it.
		 * It is created for an experimental purpose.
		 * Implementation should be injected by outside.
		 *
		 * @param {string} sEventId the name of the event
		 * @param {sap.ui.core.Element} oElement the element itself
		 * @param {object} mParameters The parameters which complement the event. Hooks must not modify the parameters.
		 * @function
		 * @private
		 * @ui5-restricted sap.ui.core.support.usage.EventBroadcaster
		 * @experimental Since 1.58
		 */
		interceptEvent: null
	};

	return ElementHooks;
});
