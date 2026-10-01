/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapLineLayer.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapLineLayer"
], function (_GeomapLineLayer) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapLineLayer</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapLineLayer class wrapper for the GeomapLineLayer web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapLineLayer
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapLineLayer
	 */
	const GeomapLineLayer = _GeomapLineLayer.extend("sap.ui.geomap.GeomapLineLayer", {
		metadata: {
			tag: _GeomapLineLayer.getMetadata().getTag()
		}
	});
	return GeomapLineLayer;
});
