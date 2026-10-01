/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapSpot.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapSpot"
], function (_GeomapSpot) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapSpot</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapSpot class wrapper for the GeomapSpot web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapSpot
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapSpot
	 */
	const GeomapSpot = _GeomapSpot.extend("sap.ui.geomap.GeomapSpot", {
		metadata: {
			tag: _GeomapSpot.getMetadata().getTag()
		}
	});
	return GeomapSpot;
});
