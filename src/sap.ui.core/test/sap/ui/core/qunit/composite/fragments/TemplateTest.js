/*!
 * ${copyright}
 */
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/FragmentControl'], function(jQuery, FragmentControl) {
	"use strict";
	var Field = FragmentControl.extend("fragments.TemplateTest", {
		metadata: {
			properties: {
				text: {
                    type: "string",
					invalidate: "template"
                }
			}
		}
	});
	return Field;
}, /* bExport= */ true);
