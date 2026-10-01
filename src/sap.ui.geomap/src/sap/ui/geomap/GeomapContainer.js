/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapSpot.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapContainer"
], function (_GeomapContainer) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapContainer</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapContainer class wrapper for the GeomapContainer web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapContainer
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapContainer
	 */
	const GeomapContainer = _GeomapContainer.extend("sap.ui.geomap.GeomapContainer", {
		metadata: {
			tag: _GeomapContainer.getMetadata().getTag()
		}
	});
	return GeomapContainer;
});
