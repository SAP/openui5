/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapSource.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapSource"
], function (_GeomapSource) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapSource</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapSource class wrapper for the GeomapSource web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapSource
	 *
	 * @author Sakar
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapSource
	 */
	const GeomapSource = _GeomapSource.extend("sap.ui.geomap.GeomapSource", {
		metadata: {
			tag: _GeomapSource.getMetadata().getTag()
		}
	});
	return GeomapSource;
});
