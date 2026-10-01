/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapRasterTiles.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapRasterTiles"
], function (_GeomapRasterTiles) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapRasterTiles</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapRasterTiles class wrapper for the GeomapRasterTiles web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapRasterTiles
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapRasterTiles
	 */
	const GeomapRasterTiles = _GeomapRasterTiles.extend("sap.ui.geomap.GeomapRasterTiles", {
		metadata: {
			tag: _GeomapRasterTiles.getMetadata().getTag()
		}
	});
	return GeomapRasterTiles;
});
