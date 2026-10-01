/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapArc.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapArc"
], function (_GeomapArc) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapArc</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapArc class wrapper for the GeomapArc web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapArc
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapArc
	 */
	const GeomapArc = _GeomapArc.extend("sap.ui.geomap.GeomapArc", {
		metadata: {
			tag: _GeomapArc.getMetadata().getTag()
		}
	});
	return GeomapArc;
});
