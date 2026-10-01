/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapCircleLayerState.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapCircleLayerState"
], function (_GeomapCircleLayerState) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapCircleLayerState</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapCircleLayerState class wrapper for the GeomapCircleLayerState web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapCircleLayerState
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapCircleLayerState
	 */
	const GeomapCircleLayerState = _GeomapCircleLayerState.extend("sap.ui.geomap.GeomapCircleLayerState", {
		metadata: {
			tag: _GeomapCircleLayerState.getMetadata().getTag()
		}
	});
	return GeomapCircleLayerState;
});
