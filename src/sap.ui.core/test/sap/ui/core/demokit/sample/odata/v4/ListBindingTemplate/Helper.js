/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/BindingParser"
], function (BindingParser) {
	"use strict";

	return {
		format : function (vRawValue) {
			return "*" + vRawValue + "*";
		},
		stringify : function (vRawValue) {
			return BindingParser.complexParser.escape(JSON.stringify(vRawValue));
		}
	};
}, /* bExport= */ true);
