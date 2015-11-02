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
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
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
				 */
				externalModelName: {type: "string", group: "Misc", defaultValue: null},

				/**
				 */
				internalModelName: {type: "string", group: "Misc", defaultValue: 'Model'},

				/**
				 */
				externalPath: {type: "string", group: "Misc", defaultValue: null}
			}
		}
	});

	return ModelMapping;
});
