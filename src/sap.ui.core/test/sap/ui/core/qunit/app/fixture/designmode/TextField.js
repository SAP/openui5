/*!
 * ${copyright}
 */

// Provides control test.designmode.TextField.
sap.ui.define(['sap/ui/core/Control'],
	function(Control) {
	"use strict";

	var TextField = Control.extend("test.designmode.TextField", {

		metadata: {

			designtime: {
				css: "TextField.designtime.css",
				icon: "TextField.png",
				name: "{name}",
				description: "{description}"
			}

		}

	});

	return TextField;

});
