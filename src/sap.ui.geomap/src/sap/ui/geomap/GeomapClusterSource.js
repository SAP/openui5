/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapClusterSource.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapClusterSource"
], function (_GeomapClusterSource) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapClusterSource</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapClusterSource class wrapper for the GeomapClusterSource web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapClusterSource
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapClusterSource
	 */
	const GeomapClusterSource = _GeomapClusterSource.extend("sap.ui.geomap.GeomapClusterSource", {
		metadata: {
			tag: _GeomapClusterSource.getMetadata().getTag()
		}
	});
	return GeomapClusterSource;
});
