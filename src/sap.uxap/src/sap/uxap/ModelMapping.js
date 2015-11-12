/*!
 * ${copyright}
 */

// Provides control sap.uxap.ModelMapping.
sap.ui.define(["sap/ui/core/Element", "./library"],
	function (Element, library) {
		"use strict";

	/**
	 * Constructor for a new ModelMapping.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * Define the entity that will be passed to the ObjectPageLayout.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 *
	 * @constructor
	 * @public
	 * @alias sap.uxap.ModelMapping
	 * @since 1.26
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ModelMapping = Element.extend("sap.uxap.ModelMapping", /** @lends sap.uxap.ModelMapping.prototype */ {
		metadata: {

			library: "sap.uxap",
			properties: {

				/**
				 * Determines the the external model name.
				 */
				externalModelName: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * Determines the the internal model name.
				 */
				internalModelName: {type: "string", group: "Misc", defaultValue: "Model"},

				/**
				 * Determines the the external path.
				 */
				externalPath: {type: "string", group: "Misc", defaultValue: null}
			}
		}
	});

	return ModelMapping;
});
