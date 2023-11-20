/*!
 * ${copyright}
 */

// Provides control test.designmode.Button.
sap.ui.define(['sap/ui/core/Control'],
	function(Control) {
	"use strict";

	var Button = Control.extend("test.designmode.Button", {

		metadata: {

			designtime: true

		}

	});

	return Button;

});
