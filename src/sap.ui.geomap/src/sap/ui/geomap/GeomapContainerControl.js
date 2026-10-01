/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.GeomapContainerControl.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapContainerControl"
], function (_GeomapContainerControl) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.GeomapContainerControl</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * GeomapContainerControl class wrapper for the GeomapContainerControl web component.
	 * Provides a container that hosts and manages a geographical map view, serving as the top-level element within the sap.ui.geomap control hierarchy
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapContainerControl
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.GeomapContainerControl
	 */
	const GeomapContainerControl = _GeomapContainerControl.extend("sap.ui.geomap.GeomapContainerControl", {
		metadata: {
			tag: _GeomapContainerControl.getMetadata().getTag()
		}
	});
	return GeomapContainerControl;
});
