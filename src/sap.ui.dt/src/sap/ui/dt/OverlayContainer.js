/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.OverlayContainer.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Control'
],
function(jQuery, Control) {
	"use strict";

	/**
	 * Constructor for a new OverlayContainer.
	 *
	 * @class
	 * The OverlayContainer creates an invisible div in body which renders Overlays
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30
	 * @alias sap.ui.dt.OverlayContainer
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var OverlayContainer = Control.extend("sap.ui.dt.OverlayContainer", /** @lends sap.ui.dt.OverlayContainer.prototype */ {
		metadata : {

			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {

			},
			associations : {

			},
			aggregations : {
				content : {
					// restrict to Overlay?
					type : "sap.ui.core.Element",
					multiple : true
				}
			},
			events : {
			}
		}
	});

	return OverlayContainer;
}, /* bExport= */ true);