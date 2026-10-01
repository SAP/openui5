/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapCircleLayer.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapCircleLayer"
], function (_GeomapCircleLayer) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapCircleLayer</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapCircleLayer class wrapper for the GeomapCircleLayer web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapCircleLayer
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapCircleLayer
	 */
	const GeomapCircleLayer = _GeomapCircleLayer.extend("sap.ui.geomap.GeomapCircleLayer", {
		metadata: {
			tag: _GeomapCircleLayer.getMetadata().getTag()
		}
	});
	return GeomapCircleLayer;
});
