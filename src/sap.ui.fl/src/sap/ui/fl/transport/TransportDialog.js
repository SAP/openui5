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
	 * @extends sap.ui.fl.write._internal.transport.TransportDialog
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.74
	 * The TransportDialog should be used only internally inside the <code>sap.ui.fl</code> library.
	 * @alias sap.ui.fl.transport.TransportDialog
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TransportDialog = InternalTransportDialog.extend("sap.ui.fl.transport.TransportDialog");

	return TransportDialog;
});