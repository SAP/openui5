/*!
 * ${copyright}
 */

sap.ui.define(function () {
	"use strict";

	/**
	 * The ConfirmationDialog shows a message box depending on an environment: if sap.m library is available,
	 * a standard sap.m.MessageBox will be shown, otherwise a default confirmation dialog from the browser.
	 *
	 * @author SAP SE
	 * @since 1.56.0
	 * @version ${version}
	 *
	 * @function
	 * @param {string} sMessage - Dialog message
	 * @returns {Promise} - resolves when accepted, otherwise rejects
	 * @private
	 */
	return function (sMessage) {
		return new Promise(function (fnResolve, fnReject) {
			var bMessageBoxAvailable = sap.ui.getCore().getLoadedLibraries().hasOwnProperty('sap.m');

			if (bMessageBoxAvailable) {
				sap.ui.require(['sap/m/MessageBox'], function (MessageBox) {
					MessageBox.confirm(
						sMessage, {
							actions: [MessageBox.Action.YES, MessageBox.Action.NO],
							onClose: function (sAction) {
								if (sAction === MessageBox.Action.YES) {
									fnResolve();
								} else {
									fnReject();
								}
							}
						}
					);
				}, fnReject);
			} else {
				var bConfirmed = window.confirm(sMessage); // eslint-disable-line no-alert

				if (bConfirmed) {
					fnResolve();
				} else {
					fnReject();
				}
			}
		});
	};

});
