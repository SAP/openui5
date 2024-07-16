/*!
 * ${copyright}
 */
sap.ui.define([
], function() {
	"use strict";
	return undefined/*XMLComposite*/.extend("composites.HiddenMetadata", {
		metadata: {
			properties: {
				_text: {
					type: "string",
					visibility: "hidden",
					defaultValue: "The hidden text"
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
