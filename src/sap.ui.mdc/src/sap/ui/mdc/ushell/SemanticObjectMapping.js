/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element'
], (Element) => {
	"use strict";

	/**
	 * Constructor for a new SemanticObjectMapping.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type for...
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.120
	 * @alias sap.ui.mdc.ushell.SemanticObjectMapping
	 */
	const SemanticObjectMapping = Element.extend("sap.ui.mdc.ushell.SemanticObjectMapping", /** @lends sap.ui.mdc.ushell.SemanticObjectMapping.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				semanticObject: {
					type: "string"
				}
			},
			defaultAggregation: "items",
			aggregations: {
				items: {
					type: "sap.ui.mdc.ushell.SemanticObjectMappingItem",
					multiple: true,
					singularName: "item"
				}
			}
		}
	});

	return SemanticObjectMapping;

});