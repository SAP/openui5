/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapElement.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapElement"
], function (_GeomapElement) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapContainer</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapElement class wrapper for the GeomapElement web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapElement
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapElement
	 */
	const GeomapElement = _GeomapElement.extend("sap.ui.geomap.GeomapElement", {
		metadata: {
			tag: _GeomapElement.getMetadata().getTag()
		}
	});
	return GeomapElement;
});
