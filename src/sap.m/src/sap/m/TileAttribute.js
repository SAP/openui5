/*!
* ${copyright}
*/

sap.ui.define([
	'sap/ui/core/Control',
	'sap/m/TileAttributeRenderer'
], function (
    Control,
	TileAttributeRenderer
    ) {
	"use strict";

	/**
	 * Constructor for a new TileAttribute.
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Holds detail of an attribute used in the ActionTile.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @experimental since 1.122
	 * @since 1.122
	 * @alias sap.m.TileAttribute
	 */

	var TileAttribute = Control.extend("sap.m.TileAttribute", /** @lends sap.m.TileAttribute.prototype */{
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * key of the attribute that identifies its position, if the attribute is rendered as a group.
				 */
				key: {
					type:"int",group:"Misc",defaultValue:0
				},
				/**
				 * Label of the attribute. If set to null, the label is not displayed.
				 */
				label: {
					type: "string", group: "Misc", defaultValue: null
				}
			},
			defaultAggregation: "contentConfig",
			aggregations: {
				/**
				 * LinkTileContent is being added to the GenericTile, it is advised to use in TwoByOne frameType
				 */
				contentConfig: {type: "sap.m.ContentConfig", multiple: false,bindable: "bindable"}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				TileAttributeRenderer.render(oRm,oControl);
			}
		}
	});

    return TileAttribute;
});
