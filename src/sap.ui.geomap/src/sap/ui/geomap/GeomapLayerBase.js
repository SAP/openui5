/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapLayerBase.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapLayerBase"
], function (_GeomapLayerBase) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapLayerBase</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapLayerBase class wrapper for the GeomapLayerBase web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapLayerBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapLayerBase
	 */
	const GeomapLayerBase = _GeomapLayerBase.extend("sap.ui.geomap.GeomapLayerBase", {
		metadata: {
			tag: _GeomapLayerBase.getMetadata().getTag()
		}
	});
	return GeomapLayerBase;
});
