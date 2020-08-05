/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/XMLComposite'
], function(XMLComposite) {
	"use strict";
	return XMLComposite.extend("composites.Field", {
		metadata: {
			properties: {
				text: {
					type: "string",
					defaultValue: "Default Text"
				},
				value: {
					type: "string",
					defaultValue: "Default Value"
				},
				enabled: {
					type: "boolean",
					defaultValue: true
				}
			},
			associations : {
				/**
				 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
				 */
				ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
			}
		}
	});
});
