/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapLayer.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapLayer"
], function (_GeomapLayer) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapLayer</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapLayer class wrapper for the GeomapLayer web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapLayer
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapLayer
	 */
	const GeomapLayer = _GeomapLayer.extend("sap.ui.geomap.GeomapLayer", {
		metadata: {
			tag: _GeomapLayer.getMetadata().getTag()
		}
	});
	return GeomapLayer;
});
