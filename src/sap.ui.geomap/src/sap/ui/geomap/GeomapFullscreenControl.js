/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapFullscreenControl.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapFullscreenControl"
], function (_GeomapFullscreenControl) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapFullscreenControl</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapFullscreenControl class wrapper for the GeomapFullscreenControl web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapFullscreenControl
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapFullscreenControl
	 */
	const GeomapFullscreenControl = _GeomapFullscreenControl.extend("sap.ui.geomap.GeomapFullscreenControl", {
		metadata: {
			tag: _GeomapFullscreenControl.getMetadata().getTag()
		}
	});
	return GeomapFullscreenControl;
});
