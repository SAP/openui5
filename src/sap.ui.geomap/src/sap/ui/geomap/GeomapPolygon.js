/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapPolygon.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapPolygon"
], function (_GeomapPolygon) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapPolygon</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapPolygon class wrapper for the GeomapPolygon web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapPolygon
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapPolygon
	 */
	const GeomapPolygon = _GeomapPolygon.extend("sap.ui.geomap.GeomapPolygon", {
		metadata: {
			tag: _GeomapPolygon.getMetadata().getTag()
		}
	});
	return GeomapPolygon;
});
