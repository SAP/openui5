/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapLegendControl.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapLegendControl"
], function (_GeomapLegendControl) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapLegendControl</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapLegendControl class wrapper for the GeomapLegendControl web component.
	 * Displays a map legend that describes the visual representations used on a geographical map, such as color codings, symbols, or layer classifications.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapLegendControl
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapLegendControl
	 */
	const GeomapLegendControl = _GeomapLegendControl.extend("sap.ui.geomap.GeomapLegendControl", {
		metadata: {
			tag: _GeomapLegendControl.getMetadata().getTag()
		}
	});
	return GeomapLegendControl;
});
