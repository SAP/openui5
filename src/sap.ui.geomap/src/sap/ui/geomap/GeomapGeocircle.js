/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapGeocircle.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapGeocircle"
], function (_GeomapGeocircle) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapGeocircle</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapGeocircle class wrapper for the GeomapGeocircle web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapGeocircle
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapGeocircle
	 */
	const GeomapGeocircle = _GeomapGeocircle.extend("sap.ui.geomap.GeomapGeocircle", {
		metadata: {
			tag: _GeomapGeocircle.getMetadata().getTag()
		}
	});
	return GeomapGeocircle;
});
