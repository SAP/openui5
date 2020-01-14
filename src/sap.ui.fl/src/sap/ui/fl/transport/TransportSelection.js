/*
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/_internal/transport/TransportSelection"
], function(
	TransportSelection
) {
	"use strict";
	/**
	 * @public
	 * @deprecated Since version 1.74
	 * The TransportSelection should be used only internally inside the <code>sap.ui.fl</code> library.
	 * @alias sap.ui.fl.transport.TransportSelection
	 * @constructor
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.38.0
	 * Helper object to select an ABAP transport for an LREP object. This is not a generic utility to select a transport request, but part
	 *        of the SmartVariant control.
	 * @param jQuery.sap.global} jQuery a reference to the jQuery implementation.
	 * @param {sap.ui.fl.Utils} Utils a reference to the flexibility utilities implementation.
	 * @param {sap.ui.fl.transport.Transports} Transports a reference to the transport service implementation.
	 * @param {sap.ui.fl.transport.TransportDialog} TransportDialog a reference to the transport dialog implementation.
	 * @param {sap.ui.fl.registry.Settings} FlexSettings a reference to the settings implementation
	 * @returns {sap.ui.fl.transport.TransportSelection} a new instance of <code>sap.ui.fl.transport.TransportSelection</code>.
	 */
	return TransportSelection;
}, true);
