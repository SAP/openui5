/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapCircle.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapCircle"
], function (_GeomapCircle) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapCircle</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapCircle class wrapper for the GeomapCircle web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapCircle
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapCircle
	 */
	const GeomapCircle = _GeomapCircle.extend("sap.ui.geomap.GeomapCircle", {
		metadata: {
			tag: _GeomapCircle.getMetadata().getTag()
		}
	});
	return GeomapCircle;
});
