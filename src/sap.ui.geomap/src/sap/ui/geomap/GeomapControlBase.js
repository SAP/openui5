/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapControlBase.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapControlBase"
], function (_GeomapControlBase) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapControlBase</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapControlBase class wrapper for the GeomapControlBase web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapControlBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapControlBase
	 */
	const GeomapControlBase = _GeomapControlBase.extend("sap.ui.geomap.GeomapControlBase", {
		metadata: {
			tag: _GeomapControlBase.getMetadata().getTag()
		}
	});
	return GeomapControlBase;
});
