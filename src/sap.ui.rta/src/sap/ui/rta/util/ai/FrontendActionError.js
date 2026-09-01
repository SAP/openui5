/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * Error codes carried by an {@link sap.ui.rta.util.ai.FrontendActionError}.
	 *
	 * @enum {string}
	 * @alias sap.ui.rta.util.ai.FrontendActionError.ErrorCodes
	 * @since 1.153
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */
	const ErrorCodes = {
		/**
		 * Unspecified failure. Default code when no more specific code applies.
		 */
		GENERIC_ERROR: "GENERIC_ERROR",
		/**
		 * The addressed control could not be resolved on the running application.
		 */
		CONTROL_NOT_FOUND: "CONTROL_NOT_FOUND",
		/**
		 * The action was invoked with missing or invalid parameters.
		 */
		INVALID_PARAMETERS: "INVALID_PARAMETERS",
		/**
		 * The current user is not a key user and may not perform the action.
		 */
		USER_NOT_KEYUSER: "USER_NOT_KEYUSER"
	};

	/**
	 * Immutable error details attached to a failed
	 * {@link sap.ui.rta.util.ai.FrontendActionResult}. This is a value object,
	 * not a throwable <code>Error</code>: it is carried inside the result
	 * envelope, never thrown.
	 *
	 * @param {sap.ui.rta.util.ai.FrontendActionError.ErrorCodes} [code=GENERIC_ERROR] Machine-readable error code.
	 * @param {string} [message=null] Human-readable error message.
	 *
	 * @alias sap.ui.rta.util.ai.FrontendActionError
	 * @class
	 * @since 1.153
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */
	class FrontendActionError {
		constructor(code, message) {
			this.code = code ?? ErrorCodes.GENERIC_ERROR;
			this.message = message ?? null;
			Object.freeze(this);
		}

		getCode() {
			return this.code;
		}

		getMessage() {
			return this.message;
		}
	}

	FrontendActionError.ErrorCodes = ErrorCodes;

	return FrontendActionError;
});
