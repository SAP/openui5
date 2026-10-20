/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapCopyrightControl.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapCopyrightControl"
], function (_GeomapCopyrightControl) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapCopyrightControl</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapCopyrightControl class wrapper for the GeomapCopyrightControl web component.
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapCopyrightControl
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapCopyrightControl
	 */
	const GeomapCopyrightControl = _GeomapCopyrightControl.extend("sap.ui.geomap.GeomapCopyrightControl", {
		metadata: {
			tag: _GeomapCopyrightControl.getMetadata().getTag()
		}
	});
	return GeomapCopyrightControl;
});
