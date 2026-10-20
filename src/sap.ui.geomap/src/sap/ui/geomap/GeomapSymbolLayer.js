/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapSymbolLayer.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapSymbolLayer"
], function (_GeomapSymbolLayer) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapSymbolLayer</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapSymbolLayer class wrapper for the GeomapSymbolLayer web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapSymbolLayer
	 *
	 * @author Sakar
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapSymbolLayer
	 */
	const GeomapSymbolLayer = _GeomapSymbolLayer.extend("sap.ui.geomap.GeomapSymbolLayer", {
		metadata: {
			tag: _GeomapSymbolLayer.getMetadata().getTag()
		}
	});
	return GeomapSymbolLayer;
});
