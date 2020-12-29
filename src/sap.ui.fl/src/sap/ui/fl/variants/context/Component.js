/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.fl.variants.context.Component", {

		metadata: {
			manifest: "json",
			properties: {
				/**
				 * Variant management contexts that have been selected.
				 */
				selectedRoles : {
					type: "array",
					defaultValue: []
				}
			}
		}
	});
});
