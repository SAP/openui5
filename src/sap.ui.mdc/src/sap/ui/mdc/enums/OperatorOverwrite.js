/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.mdc.enums.OperatorOverwrite
sap.ui.define(() => {
	"use strict";

	/**
	 * Enumeration of the {@link sap.ui.mdc.condition.Operator#OperatorOverwrite OperatorOverwrite} in {@link sap.ui.mdc.condition.Operator Operator}.
	 * @enum {string}
	 * @alias sap.ui.mdc.enums.OperatorOverwrite
	 * @public
	 * @since 1.115
	 */
	const OperatorOverwrite = {
		/**
		 * Overwrites the <code>getModelFilter</code> function of the operator.
		 * @public
		 */
		getModelFilter: "getModelFilter",

		/**
		 * Overwrites the <code>getLongText</code> function of the operator.
		 * @public
		 */
		getLongText: "getLongText"
	};

	return OperatorOverwrite;

});