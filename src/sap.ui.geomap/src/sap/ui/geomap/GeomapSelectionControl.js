/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapSpot.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapSelectionControl"
], function (_GeomapSelectionControl) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapContainer</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapSelectionControl class wrapper for the GeomapSelectionControl web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapSelectionControl
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapSelectionControl
	 */
	const GeomapSelectionControl = _GeomapSelectionControl.extend("sap.ui.geomap.GeomapSelectionControl", {
		metadata: {
			tag: _GeomapSelectionControl.getMetadata().getTag()
		}
	});
	return GeomapSelectionControl;
});
