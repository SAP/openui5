/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapHeatmapLayer.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapHeatmapLayer"
], function (_GeomapHeatmapLayer) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapHeatmapLayer</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapHeatmapLayer class wrapper for the GeomapHeatmapLayer web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapHeatmapLayer
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapHeatmapLayer
	 */
	const GeomapHeatmapLayer = _GeomapHeatmapLayer.extend("sap.ui.geomap.GeomapHeatmapLayer", {
		metadata: {
			tag: _GeomapHeatmapLayer.getMetadata().getTag()
		}
	});
	return GeomapHeatmapLayer;
});
