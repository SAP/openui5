/*!
 * ${copyright}
 */

// Provides control sap.ui.fl.transport.TransportDialog.
sap.ui.define([
	"sap/ui/fl/write/_internal/transport/TransportDialog"
],
function(
	InternalTransportDialog
) {
	"use strict";

	/**
	 * Constructor for a new transport/TransportDialog.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The Transport Dialog Control can be used to implement a value help for selecting an ABAP package and transport request. It is not a generic utility, but part of the Variantmanament and therefore cannot be used in any other application.
	 * @extends sap.m.Dialog
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.74
	 * The TransportDialog should be used only internally inside the <code>sap.ui.fl</code> library.
	 * @alias sap.ui.fl.transport.TransportDialog
	 */
	var TransportDialog = InternalTransportDialog.extend("sap.ui.fl.transport.TransportDialog", {
		metadata: {
			library: "sap.ui.fl",
			deprecated: true
		},
		renderer: { // inherit Dialog renderer
			apiVersion: 2
		}
	});

	return TransportDialog;
});