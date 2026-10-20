/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapSpot.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapScaleControl"
], function (_GeomapScaleControl) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapContainer</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapScaleControl class wrapper for the GeomapScaleControl web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapScaleControl
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapScaleControl
	 */
	const GeomapScaleControl = _GeomapScaleControl.extend("sap.ui.geomap.GeomapScaleControl", {
		metadata: {
			tag: _GeomapScaleControl.getMetadata().getTag()
		}
	});
	return GeomapScaleControl;
});
