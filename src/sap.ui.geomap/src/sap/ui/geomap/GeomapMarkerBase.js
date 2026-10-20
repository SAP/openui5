/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapMarkerBase.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapMarkerBase"
], function (_GeomapMarkerBase) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapMarkerBase</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapMarkerBase class wrapper for the GeomapMarkerBase web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapMarkerBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapMarkerBase
	 */
	const GeomapMarkerBase = _GeomapMarkerBase.extend("sap.ui.geomap.GeomapMarkerBase", {
		metadata: {
			tag: _GeomapMarkerBase.getMetadata().getTag()
		}
	});
	return GeomapMarkerBase;
});
