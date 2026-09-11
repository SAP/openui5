/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/util/ai/FrontendActionError"
], function(FrontendActionError) {
	"use strict";

	/**
	 * Uniform, immutable envelope returned by every frontend action of
	 * {@link sap.ui.rta.api.FrontendActionsAPI}. A consumer inspects
	 * <code>isSuccess</code> and then reads either <code>payload</code>
	 * (on success) or <code>error</code> (an {@link sap.ui.rta.util.ai.FrontendActionError}).
	 *
	 * Instances are created through the static factories
	 * {@link sap.ui.rta.util.ai.FrontendActionResult.success} and
	 * {@link sap.ui.rta.util.ai.FrontendActionResult.failure} rather than the
	 * constructor directly.
	 *
	 * @param {boolean} isSuccess Whether the action succeeded.
	 * @param {any} [payload=null] Result data of the action.
	 * @param {sap.ui.rta.util.ai.FrontendActionError} [error=null] Error details when the action failed.
	 *
	 * @alias sap.ui.rta.util.ai.FrontendActionResult
	 * @class
	 * @since 1.153
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */
	class FrontendActionResult {
		constructor(isSuccess, payload, error) {
			this.isSuccess = isSuccess;
			this.payload = payload ?? null;
			this.error = error ?? null;
			Object.freeze(this);
		}

		/**
		 * Builds a successful result.
		 *
		 * @param {any} [payload=null] Result data of the action.
		 * @returns {sap.ui.rta.util.ai.FrontendActionResult} The success envelope.
		 */
		static success(payload) {
			return new FrontendActionResult(true, payload, null);
		}

		/**
		 * Builds a failed result. Accepts a ready-made
		 * {@link sap.ui.rta.util.ai.FrontendActionError} or an
		 * (errorCode, message) pair for convenience at the call site.
		 *
		 * @param {sap.ui.rta.util.ai.FrontendActionError|sap.ui.rta.util.ai.FrontendActionError.ErrorCodes} errorOrCode
		 *   Either a prepared error, or an error code to wrap.
		 * @param {string} [message] Human-readable message (used only when a code is passed).
		 * @returns {sap.ui.rta.util.ai.FrontendActionResult} The failure envelope.
		 */
		static failure(errorOrCode, message) {
			const oError = errorOrCode instanceof FrontendActionError
				? errorOrCode
				: new FrontendActionError(errorOrCode, message);
			return new FrontendActionResult(false, null, oError);
		}
	}

	return FrontendActionResult;
});
