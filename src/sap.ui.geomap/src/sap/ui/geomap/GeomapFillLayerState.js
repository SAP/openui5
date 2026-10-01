/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapFillLayerState.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapFillLayerState"
], function (_GeomapFillLayerState) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapFillLayerState</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapFillLayerState class wrapper for the GeomapFillLayerState web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapFillLayerState
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapFillLayerState
	 */
	const GeomapFillLayerState = _GeomapFillLayerState.extend("sap.ui.geomap.GeomapFillLayerState", {
		metadata: {
			tag: _GeomapFillLayerState.getMetadata().getTag()
		}
	});
	return GeomapFillLayerState;
});
