/*!
 * ${copyright}
 */

// Provides control example.designmode.Button.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control'],
	function(jQuery, Control) {
	"use strict";

	var Button = Control.extend("example.designmode.Button", {

		metadata: {

			designtime: true

		}

	});

	return Button;

}, /* bExport= */ true);
