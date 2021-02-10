
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddLibrary",
	"sap/ui/fl/apply/_internal/changes/descriptor/app/SetTitle",
	"sap/ui/fl/apply/_internal/changes/descriptor/ovp/ChangeCard",
	"sap/ui/fl/apply/_internal/changes/descriptor/ovp/AddNewCard",
	"sap/ui/fl/apply/_internal/changes/descriptor/ovp/DeleteCard"
], function(
	AddLibrary,
	SetTitle,
	ChangeCard,
	AddNewCard,
	DeleteCard
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
		appdescr_ui5_addLibraries: AddLibrary,
		appdescr_app_setTitle: SetTitle,
		appdescr_ovp_changeCard: ChangeCard,
		appdescr_ovp_addNewCard: AddNewCard,
		appdescr_ovp_removeCard: DeleteCard
	};
	return Registration;
}, true);