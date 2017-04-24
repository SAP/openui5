/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/FragmentControl'
], function(FragmentControl) {
	"use strict";
	return FragmentControl.extend("fragments.Field", {
		metadata: {
			properties: {
				text: {
					type: "string",
					defaultValue: "Default Text"
				},
				value: {
					type: "string",
					defaultValue: "Default Value"
				}
			}
		}
	});
}, /* bExport= */true);
