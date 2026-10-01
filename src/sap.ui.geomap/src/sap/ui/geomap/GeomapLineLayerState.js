/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapLineLayerState.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapLineLayerState"
], function (_GeomapLineLayerState) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapLineLayerState</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapLineLayerState class wrapper for the GeomapLineLayerState web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapLineLayerState
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapLineLayerState
	 */
	const GeomapLineLayerState = _GeomapLineLayerState.extend("sap.ui.geomap.GeomapLineLayerState", {
		metadata: {
			tag: _GeomapLineLayerState.getMetadata().getTag()
		}
	});
	return GeomapLineLayerState;
});
