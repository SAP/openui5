/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapFillLayer.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapFillLayer"
], function (_GeomapFillLayer) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapFillLayer</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapFillLayer class wrapper for the GeomapFillLayer web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapFillLayer
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapFillLayer
	 */
	const GeomapFillLayer = _GeomapFillLayer.extend("sap.ui.geomap.GeomapFillLayer", {
		metadata: {
			tag: _GeomapFillLayer.getMetadata().getTag()
		}
	});
	return GeomapFillLayer;
});
