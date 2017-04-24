/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/FragmentControl'
], function(FragmentControl) {
	"use strict";
	return FragmentControl.extend("fragments.TemplateTest", {
		metadata: {
			properties: {
				text: {
					type: "string",
					invalidate: "template"
				}
			}
		}
	});
}, /* bExport= */true);
