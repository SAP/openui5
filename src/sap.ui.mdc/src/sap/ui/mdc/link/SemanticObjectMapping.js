/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element'
], function(Element) {
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
	 * @since 1.58.0
	 * @alias sap.ui.mdc.link.SemanticObjectMapping
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SemanticObjectMapping = Element.extend("sap.ui.mdc.link.SemanticObjectMapping", /** @lends sap.ui.mdc.link.SemanticObjectMapping.prototype */
	{
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
					type: "sap.ui.mdc.link.SemanticObjectMappingItem",
					multiple: true,
					singularName: "item"
				}
			}
		}
	});

	return SemanticObjectMapping;

});
