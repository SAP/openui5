
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/requireAsync"
], function(
	requireAsync
) {
	"use strict";

	/**
	 * Loads and registers all descriptor change mergers for client-side merging.
	 *
	 * @namespace sap.ui.fl.apply._internal.changes.descriptor.Registration
	 * @experimental
	 * @since 1.74
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var Registration = {
		appdescr_ui5_addLibraries: requireAsync("sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddLibrary"),
		appdescr_app_setTitle: requireAsync("sap/ui/fl/apply/_internal/changes/descriptor/app/SetTitle"),
		appdescr_ovp_changeCard: requireAsync("sap/ui/fl/apply/_internal/changes/descriptor/ovp/ChangeCard"),
		appdescr_ovp_addNewCard: requireAsync("sap/ui/fl/apply/_internal/changes/descriptor/ovp/AddNewCard"),
		appdescr_ovp_removeCard: requireAsync("sap/ui/fl/apply/_internal/changes/descriptor/ovp/DeleteCard")
	};
	return Registration;
});