/*!
 * ${copyright}
 */

sap.ui.define(['sap/base/Log'], function(Log) {
	"use strict";

	Log.error(
		"Since UI5 version 1.95, the private module 'sap/ui/core/CustomizingConfiguration' is functionally inactive. " +
		"Please be aware that this module has always been a private API and any monkey patching on this module will have no further effect. " +
		"You must remove the dependency to this file as this module will be removed in one of the following versions of UI5."
		);

	/**
	 * For now this module only exists for compatibility reasons.
	 *
	 * Since UI5 version 1.92 the majority of the CustomizingConfiguration
	 * has been replaced with direct look-ups into the respective Components' manifests.
	 * The last usages for "sap.ui.viewExtensions" have been removed with 1.95.
	 *
	 * Any existing monkey patches of the internal functions have no further effect.
	 *
	 * While this module has always been private, some applications have modeled a dependency nonetheless.
	 * For now, we have decided not to forcefully break these dependencies, but to keep this
	 * as an empty module with the above error logging.
	 *
	 * This empty module will be removed in future versions.
	 */
	var CustomizingConfiguration = {
		log: function() {},
		activateForComponent: function() {},
		deactivateForComponent: function() {},
		activateForComponentInstance: function() {},
		deactivateForComponentInstance: function() {},
		getViewReplacement: function() {},
		getViewExtension: function() {},
		getControllerExtension: function() {},
		getControllerReplacement: function() {},
		getCustomProperties: function() {},
		hasCustomProperties: function() {}
	};

	return CustomizingConfiguration;

}, /* bExport= */ true);