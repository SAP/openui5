/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.mdc.enums.OperatorOverwrite
sap.ui.define(function() {
	"use strict";

	/**
	 * Enumeration of the <code>OperatorOverwrite</code> in <code>Operator</code>.
	 * @enum {string}
  	 * @alias sap.ui.mdc.enums.OperatorOverwrite
	 * @public
	 * @since 1.115
	 */
	const OperatorOverwrite = {
		/**
		 * Overwrite the <code>getModelFilter</code> function of the operator.
		 * @public
		 */
		getModelFilter: "getModelFilter",

		/**
		 * Overwrite the <code>getTypeText</code> function of the operator.
		 * @public
		 */
		getLongText: "getLongText"
	};

	return OperatorOverwrite;

}, /* bExport= */ true);
