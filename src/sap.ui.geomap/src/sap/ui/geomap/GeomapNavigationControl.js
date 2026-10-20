/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapSpot.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapNavigationControl"
], function (_GeomapNavigationControl) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapContainer</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapNavigationControl class wrapper for the GeomapNavigationControl web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapNavigationControl
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapNavigationControl
	 */
	const GeomapNavigationControl = _GeomapNavigationControl.extend("sap.ui.geomap.GeomapNavigationControl", {
		metadata: {
			tag: _GeomapNavigationControl.getMetadata().getTag()
		}
	});
	return GeomapNavigationControl;
});
