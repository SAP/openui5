/*!
 * ${copyright}
 */

// Provides control example.designmode.Button.
sap.ui.define(['sap/ui/core/Control'],
	function(Control) {
	"use strict";

	var Button = Control.extend("example.designmode.Button", {

		metadata: {

			designtime: true

		}

	});

	return Button;

});
