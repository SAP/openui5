/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapPoint.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapPoint"
], function (_GeomapPoint) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapPoint</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapPoint class wrapper for the GeomapPoint web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapPoint
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapPoint
	 */
	const GeomapPoint = _GeomapPoint.extend("sap.ui.geomap.GeomapPoint", {
		metadata: {
			tag: _GeomapPoint.getMetadata().getTag()
		}
	});
	return GeomapPoint;
});
