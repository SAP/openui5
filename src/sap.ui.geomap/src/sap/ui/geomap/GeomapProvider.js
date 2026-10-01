/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapProvider.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapProvider"
], function (_GeomapProvider) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapProvider</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapProvider class wrapper for the GeomapProvider web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapProvider
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapProvider
	 */
	const GeomapProvider = _GeomapProvider.extend("sap.ui.geomap.GeomapProvider", {
		metadata: {
			tag: _GeomapProvider.getMetadata().getTag()
		}
	});
	return GeomapProvider;
});
