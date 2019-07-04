/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/Element'],
	function(Element) {
	"use strict";

		/**
		 * @class
		 * Provides a row element for the <code>LightTable</code>.
		 * @extends sap.ui.core.Element
		 * @private
		 * @ui5-restricted sdk
		 */
		return Element.extend("sap.ui.documentation.sdk.controls.Row", {
			metadata : {
				library: "sap.ui.documentation",
				properties: {
					/**
					 * Determines whether the row is visible.
					 */
					visible: {type: "boolean"}
				},
				defaultAggregation : "content",
				aggregations: {
					/**
					 * Controls to be displayed by the <code>LightTable</code>.
					 */
					content: {type: "sap.ui.core.Control", multiple: true}
				}
			}
		});

	});