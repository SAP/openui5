/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/base/Object'], function (Object) {
	"use strict";

	return Object.extend("sap.ui.demo.masterdetail.controller.BusyHandler", {

		/**
		 * Provides a convenience API for managing the busy indications.
		 *
		 * @class
		 * @public
		 * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
		 * @alias sap.ui.demo.masterdetail.controller.BusyHandler
		 */
		constructor : function ( oComponent) {
			this._oComponent = oComponent;
			// set the busy indication on application level, because unless the metadata is loaded
			// the user cannot interact with the application
			this._oComponent.oWhenMetadataIsLoaded.then(function () {
				this._setRootViewInitiallyBusy(false);
			}.bind(this),
			function () {
				this._setRootViewInitiallyBusy(false);
			}.bind(this));
			this._setRootViewInitiallyBusy(true);
		},

		/**
		 * This method removes or sets the busy indicator delay and sets or removes the root view busy.
		 * The busy indicator delay is reset to the UI5 default after the initial busy state of the application.
		 *
		 * @param {boolean} bBusy indicates if busy indication should be shown (true) or removed (false)
		 * @private
		 */
		_setRootViewInitiallyBusy : function (bBusy) {
			this._oComponent._oRootView.setBusyIndicatorDelay(bBusy ? 0 : null);
			this._oComponent._oRootView.setBusy(bBusy);
		}

	});

});
