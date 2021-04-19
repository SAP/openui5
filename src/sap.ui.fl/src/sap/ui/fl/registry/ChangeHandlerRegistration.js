/*!
* ${copyright}
*/

sap.ui.define([
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/changeHandler/AddXML",
	"sap/ui/fl/changeHandler/AddXMLAtExtensionPoint",
	"sap/ui/fl/changeHandler/HideControl",
	"sap/ui/fl/changeHandler/MoveControls",
	"sap/ui/fl/changeHandler/MoveElements",
	"sap/ui/fl/changeHandler/PropertyBindingChange",
	"sap/ui/fl/changeHandler/PropertyChange",
	"sap/ui/fl/changeHandler/StashControl",
	"sap/ui/fl/changeHandler/UnhideControl",
	"sap/ui/fl/changeHandler/UnstashControl"
], function(
	ChangeRegistry,
	AddXML,
	AddXMLAtExtensionPoint,
	HideControl,
	MoveControls,
	MoveElements,
	PropertyBindingChange,
	PropertyChange,
	StashControl,
	UnhideControl,
	UnstashControl
) {
	"use strict";

	var mDefaultHandlers = {
		hideControl: HideControl,
		moveElements: MoveElements,
		moveControls: MoveControls,
		stashControl: StashControl,
		unhideControl: UnhideControl,
		unstashControl: UnstashControl
	};

	var mDeveloperModeHandlers = {
		addXML: AddXML,
		addXMLAtExtensionPoint: AddXMLAtExtensionPoint,
		propertyBindingChange: PropertyBindingChange,
		propertyChange: PropertyChange
	};

	var ChangeHandlerRegistration = {
		/**
		 * Detects already loaded libraries and registers defined changeHandlers.
		 *
		 * @returns {Promise} Returns an empty promise when all changeHandlers from all libraries are registered.
		 */
		getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs: function () {
			var oCore = sap.ui.getCore();
			var oAlreadyLoadedLibraries = oCore.getLoadedLibraries();
			var aPromises = [];

			Object.values(oAlreadyLoadedLibraries).forEach(function(oLibrary) {
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
					ChangeRegistry.addRegistrationPromise(oLibName, oRegistrationPromise);
					return oRegistrationPromise;
				}
			}
			return Promise.resolve();
		},

		registerPredefinedChangeHandlers: function() {
			ChangeRegistry.getInstance().registerPredefinedChangeHandlers(mDefaultHandlers, mDeveloperModeHandlers);
		}
	};

	return ChangeHandlerRegistration;
});
