/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.core.ws.ReadyState
sap.ui.define(function() {
	"use strict";


	/**
	 * @class Defines the different ready states for a WebSocket connection.
	 *
	 * @version ${version}
	 * @static
	 * @public
	 * @alias sap.ui.core.ws.ReadyState
	 */
	var ReadyState = {
	
		/**
		 * The connection has not yet been established.
		 * @public
		 */
		CONNECTING: 0,
	
		/**
		 * The WebSocket connection is established and communication is possible.
		 * @public
		 */
		OPEN: 1,
	
		/**
		 * The connection is going through the closing handshake.
		 * @public
		 */
		CLOSING: 2,
	
		/**
		 * The connection has been closed or could not be opened.
		 * @public
		 */
		CLOSED: 3
	
	};
	

	return ReadyState;

}, /* bExport= */ true);
