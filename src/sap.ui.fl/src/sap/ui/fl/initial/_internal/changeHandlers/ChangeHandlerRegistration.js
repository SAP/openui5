/*!
* ${copyright}
*/

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerStorage",
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
	Core,
	ChangeHandlerStorage,
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

	var mRegistrationPromises = {};

	function addRegistrationPromise(sKey, oPromise) {
		mRegistrationPromises[sKey] = oPromise;
		oPromise
			.catch(function() {})
			.then(function() {
				delete mRegistrationPromises[sKey];
			});
	}

	function registerFlexChangeHandlers(oFlChangeHandlers) {
		return ChangeHandlerStorage.registerChangeHandlersForLibrary(oFlChangeHandlers);
	}

	function handleLibraryRegistrationAfterFlexLibraryIsLoaded(oLibraryChangedEvent) {
		if (oLibraryChangedEvent.getParameter("operation") === "add") {
			var oLibMetadata = oLibraryChangedEvent.getParameter("metadata");
			var sLibName = oLibMetadata.sName;
			var oFlChangeHandlers = oLibMetadata && oLibMetadata.extensions && oLibMetadata.extensions.flChangeHandlers;
			if (oFlChangeHandlers) {
				var oRegistrationPromise = registerFlexChangeHandlers(oFlChangeHandlers);
				addRegistrationPromise(sLibName, oRegistrationPromise);
			}
		}
	}

	var ChangeHandlerRegistration = {
		/**
		 * Detects already loaded libraries and registers defined changeHandlers.
		 *
		 *
		 * @alias sap.ui.fl.registry.ChangeHandlerRegistration
		 *
		 * @author SAP SE
		 * @version ${version}
		 * @private
		 * @ui5-restricted sap.ui.fl
		 *
		 * @returns {Promise} Returns an empty promise when all changeHandlers from all libraries are registered.
		 */
		getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs: function () {
			var oAlreadyLoadedLibraries = Core.getLoadedLibraries();
			var aPromises = [];

			Object.values(oAlreadyLoadedLibraries).forEach(function(oLibrary) {
				if (oLibrary.extensions && oLibrary.extensions.flChangeHandlers) {
					aPromises.push(registerFlexChangeHandlers(oLibrary.extensions.flChangeHandlers));
				}
			});

			Core.attachLibraryChanged(handleLibraryRegistrationAfterFlexLibraryIsLoaded);

			return Promise.all(aPromises);
		},

		waitForChangeHandlerRegistration: function(sKey) {
			if (mRegistrationPromises[sKey]) {
				return mRegistrationPromises[sKey].catch(function() {});
			}
			return Promise.resolve();
		},

		/**
		 * Registers the predefined change handlers to the <code>ChangeHandlerStorage</code>.
		 * This includes both default (e.g. <code>UnhideControl</code> or <code>MoveControls</code>) and <code>DeveloperMode</code> change handlers (e.g. <code>AddXML</code> or <code>propertyChange</code>)
		 */
		registerPredefinedChangeHandlers: function() {
			ChangeHandlerStorage.registerPredefinedChangeHandlers(mDefaultHandlers, mDeveloperModeHandlers);
		}
	};

	return ChangeHandlerRegistration;
});
