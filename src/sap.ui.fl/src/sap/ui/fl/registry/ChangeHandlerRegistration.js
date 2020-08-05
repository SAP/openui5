/*!
* ${copyright}
*/

sap.ui.define([
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/thirdparty/jquery"
], function(
	ChangeRegistry,
	jQuery
) {
	"use strict";

	var ChangeHandlerRegistration = {
		_mRegistrationPromises: {},

		_addRegistrationPromise: function(sKey, oPromise) {
			this._mRegistrationPromises[sKey] = oPromise;
			oPromise.then(function() {
				delete this._mRegistrationPromises[sKey];
			}.bind(this));
			oPromise.catch(function(oError) {
				delete this._mRegistrationPromises[sKey];
				return Promise.reject(oError);
			}.bind(this));
		},

		waitForChangeHandlerRegistration: function(sKey) {
			return this._mRegistrationPromises[sKey] || Promise.resolve();
		},

		isChangeHandlerRegistrationInProgress: function(sKey) {
			return !!this._mRegistrationPromises[sKey];
		},

		/**
		 * Detects already loaded libraries and registers defined changeHandlers.
		 *
		 * @returns {Promise} Returns an empty promise when all changeHandlers from all libraries are registered.
		 */
		getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs: function () {
			var oCore = sap.ui.getCore();
			var oAlreadyLoadedLibraries = oCore.getLoadedLibraries();
			var aPromises = [];

			jQuery.each(oAlreadyLoadedLibraries, function (sLibraryName, oLibrary) {
				if (oLibrary.extensions && oLibrary.extensions.flChangeHandlers) {
					aPromises.push(this._registerFlexChangeHandlers(oLibrary.extensions.flChangeHandlers));
				}
			}.bind(this));

			oCore.attachLibraryChanged(this._handleLibraryRegistrationAfterFlexLibraryIsLoaded.bind(this));

			return Promise.all(aPromises);
		},

		_registerFlexChangeHandlers: function (oFlChangeHandlers) {
			if (oFlChangeHandlers) {
				var oChangeRegistryInstance = ChangeRegistry.getInstance();
				return oChangeRegistryInstance.registerControlsForChanges(oFlChangeHandlers);
			}
			return Promise.resolve();
		},

		_handleLibraryRegistrationAfterFlexLibraryIsLoaded: function (oLibraryChangedEvent) {
			if (oLibraryChangedEvent.getParameter("operation") === "add") {
				var oLibMetadata = oLibraryChangedEvent.getParameter("metadata");
				var oLibName = oLibMetadata.sName;
				if (oLibMetadata && oLibMetadata.extensions && oLibMetadata.extensions.flChangeHandlers) {
					var oFlChangeHandlers = oLibMetadata.extensions.flChangeHandlers;
					var oRegistrationPromise = this._registerFlexChangeHandlers(oFlChangeHandlers);
					this._addRegistrationPromise(oLibName, oRegistrationPromise);
					return oRegistrationPromise;
				}
			}
			return Promise.resolve();
		}
	};

	return ChangeHandlerRegistration;
}, true);
