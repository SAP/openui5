/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapHssProvider.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapHssProvider"
], function (_GeomapHssProvider) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapHssProvider</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapHssProvider class wrapper for the GeomapHssProvider web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapHssProvider
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapHssProvider
	 */
	const GeomapHssProvider = _GeomapHssProvider.extend("sap.ui.geomap.GeomapHssProvider", {
		metadata: {
			tag: _GeomapHssProvider.getMetadata().getTag()
		}
	});
	return GeomapHssProvider;
});
