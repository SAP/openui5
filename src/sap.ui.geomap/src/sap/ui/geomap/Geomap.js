/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.Geomap.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/Geomap"
], function (_Geomap) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.Geomap</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Geomap class wrapper for the Geomap web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/Geomap
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.Geomap
	 */
	const Geomap = _Geomap.extend("sap.ui.geomap.Geomap", {
		metadata: {
			tag: _Geomap.getMetadata().getTag()
		}
	});

	return Geomap;
});


