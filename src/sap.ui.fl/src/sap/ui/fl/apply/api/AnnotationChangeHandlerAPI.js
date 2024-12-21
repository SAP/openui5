/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerRegistration"
], function(
	ChangeHandlerRegistration
) {
	"use strict";

	/**
	 * Provides an API to register and retrieve annotation change handlers.
	 *
	 * @namespace sap.ui.fl.apply.api.AnnotationChangeHandlerAPI
	 * @since 1.129
	 * @private
	 * @ui5-restricted
	 */
	const AnnotationChangeHandlerAPI = /** @lends sap.ui.fl.apply.api.AnnotationChangeHandlerAPI */{
		/**
		 * Registers an annotation change handler for a change type.
		 * The change type is not control-specific, hence it must be unique to avoid conflicts.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {string} mPropertyBag.changeType - Change type for which the change handler should be registered
		 * @param {string|object} mPropertyBag.changeHandler - Path to change handler or change handler object
		 *
		 * @private
		 */
		registerAnnotationChangeHandler(mPropertyBag) {
			if (!mPropertyBag.changeType || !mPropertyBag.changeHandler) {
				throw new Error("'changeType' and 'changeHandler' properties are required for registration!");
			}

			if (mPropertyBag.isDefaultChangeHandler) {
				throw new Error("The API is not allowed to register default change handlers!");
			}

			ChangeHandlerRegistration.registerAnnotationChangeHandler(mPropertyBag);
		},

		/**
		 * Returns the annotation change handler for the requested change type.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {string} mPropertyBag.changeType - Change type for which the change handler should be returned
		 * @returns {Promise<object>} Resolves with the change handler
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl, sap.ui.rta
		 */
		getAnnotationChangeHandler(mPropertyBag) {
			if (!mPropertyBag.changeType) {
				throw new Error("'changeType' property is required!");
			}

			return ChangeHandlerRegistration.getAnnotationChangeHandler(mPropertyBag);
		}
	};

	return AnnotationChangeHandlerAPI;
});
