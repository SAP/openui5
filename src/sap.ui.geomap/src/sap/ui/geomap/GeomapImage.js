/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapImage.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapImage"
], function (_GeomapImage) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapImage</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapImage class wrapper for the GeomapImage web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapImage
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapImage
	 */
	const GeomapImage = _GeomapImage.extend("sap.ui.geomap.GeomapImage", {
		metadata: {
			tag: _GeomapImage.getMetadata().getTag()
		}
	});
	return GeomapImage;
});
