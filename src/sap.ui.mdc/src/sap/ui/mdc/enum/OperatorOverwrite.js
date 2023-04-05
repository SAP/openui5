/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.mdc.enum.OperatorOverwrite
sap.ui.define(function() {
	"use strict";

	/**
	 * Enumeration of the <code>OperatorOverwrite</code> in <code>Operator</code>.
	 * @enum {string}
	 * @public
	 * @since 1.113
	 * @ui5-restricted sap.ui.mdc, sap.fe
	 */
	var OperatorOverwrite = {
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
