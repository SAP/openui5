/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapLine.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapLine"
], function (_GeomapLine) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapLine</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapLine class wrapper for the GeomapLine web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapLine
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapLine
	 */
	const GeomapLine = _GeomapLine.extend("sap.ui.geomap.GeomapLine", {
		metadata: {
			tag: _GeomapLine.getMetadata().getTag()
		}
	});
	return GeomapLine;
});
