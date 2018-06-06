/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Control'], function(oControl) {
	"use strict";

	var Column = oControl.extend("composites.Column", {
		metadata : {
			properties : {
				label : "string",
				path : "string"
			}
		}
	});

	return Column;

}, /* bExport= */true);
