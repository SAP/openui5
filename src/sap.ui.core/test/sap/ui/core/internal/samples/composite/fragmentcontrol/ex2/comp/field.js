/*!
 * ${copyright}
 */
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/FragmentControl', 'sap/ui/model/type/Float'
], function (jQuery, FragmentControl, Float) {
	"use strict";
	var Field = FragmentControl.extend("sap.ui.core.internal.samples.composite.fragmentcontrol.ex2.comp.field", {
		metadata: {
			properties: {
				valueFloat: {
					type: "float"
				},
				valueString: {
					type: "string"
				}
			}
		},
		fragment: "sap.ui.core.internal.samples.composite.fragmentcontrol.ex2.comp.field"
	});
	return Field;
}, /* bExport= */ true);
