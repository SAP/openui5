/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/ElementUtil"
], function (Utils) {
	"use strict";

	return {
		domRef: function(oColumn) {
			return oColumn.getDomRef().shadowRoot.querySelector("th");
		},
		aggregations: {
			content: {
				domRef: function (oControl) {
					return oControl.getDomRef().shadowRoot.querySelector("th");
				},
				actions: {
					remove : {
						removeLastElement: true
					}
				}
			}
		}
	};
});