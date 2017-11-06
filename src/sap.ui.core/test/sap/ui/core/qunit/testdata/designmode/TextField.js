/*!
 * ${copyright}
 */

// Provides control example.designmode.Button.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control'],
	function(jQuery, Control) {
	"use strict";

	var TextField = Control.extend("example.designmode.TextField", {

		metadata: {

			designtime: {
				css: "TextField.designtime.css",
				icon: "TextField.png",
				name: "{name}",
				description: "{description}",
			}

		}

	});

	return TextField;

}, /* bExport= */ true);
