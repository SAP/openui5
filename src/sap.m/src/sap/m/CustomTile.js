/*!
 * ${copyright}
 */

// Provides control sap.m.CustomTile.
sap.ui.define(['./Tile', './library', './CustomTileRenderer'],
	function(Tile, library, CustomTileRenderer) {
	"use strict";



	/**
	 * Constructor for a new CustomTile.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Use the CustomTile control to display application specific content in the Tile control.
	 * The tile width is 8.5em and height is 10em.
	 * @extends sap.m.Tile
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.12
	 * @deprecated As of version 1.50, use {@link sap.m.GenericTile} instead
	 * @alias sap.m.CustomTile
	 */
	var CustomTile = Tile.extend("sap.m.CustomTile", /** @lends sap.m.CustomTile.prototype */ {
		metadata : {

			library : "sap.m",
			deprecated: true,
			designtime: "sap/m/designtime/CustomTile.designtime",
			defaultAggregation : "content",
			aggregations : {

				/**
				 * Defines the content of the CustomTile.
				 */
				content : {type : "sap.ui.core.Control", multiple : false}
			}
		},

		renderer: CustomTileRenderer
	});




	return CustomTile;

});
