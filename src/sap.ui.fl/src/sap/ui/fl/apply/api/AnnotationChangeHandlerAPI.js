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
		 * Registers a model-specific annotation change handler for a change type.
		 * The change type is not control-specific, hence it must be unique to avoid conflicts.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {string} mPropertyBag.modelType - Model type
		 * @param {string} mPropertyBag.changeType - Change type for which the change handler should be registered
		 * @param {string|object} mPropertyBag.changeHandler - Path to change handler or change handler object
		 *
		 * @private
		 */
		registerAnnotationChangeHandler(mPropertyBag) {
			if (!mPropertyBag.modelType || !mPropertyBag.changeType || !mPropertyBag.changeHandler) {
				throw new Error("'modelType', 'changeType' and 'changeHandler' properties are required for registration!");
			}

			ChangeHandlerRegistration.registerAnnotationChangeHandler(mPropertyBag);
		},

		/**
		 * Returns the model-specific annotation change handler for the requested change type.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {string} mPropertyBag.modelType - Model type
		 * @param {string} mPropertyBag.changeType - Change type for which the change handler should be returned
		 * @returns {Promise<object>} Resolves with the change handler
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl, sap.ui.rta
		 */
		getAnnotationChangeHandler(mPropertyBag) {
			if (!mPropertyBag.modelType || !mPropertyBag.changeType) {
				throw new Error("'modelType' and 'changeType' properties are required!");
			}

			return ChangeHandlerRegistration.getAnnotationChangeHandler(mPropertyBag);
		}
	};

	return AnnotationChangeHandlerAPI;
});
