
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/Registration",
	"sap/ui/fl/apply/_internal/changes/descriptor/app/ChangeDataSource",
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddNewModelEnhanceWith",
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/SetMinUI5Version",
	"sap/ui/fl/apply/_internal/changes/descriptor/fiori/SetRegistrationIds",
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/SetFlexExtensionPointEnabled"
], function(
	Registration,
	ChangeDataSource,
	AddNewModelEnhanceWith,
	SetMinUI5Version,
	SetRegistrationIds,
	SetFlexExtensionPointEnabled
) {
	"use strict";

	/**
	 * Loads and registers all change handlers used during the build.
	 * Includes all change handlers used during runtime.
	 *
	 * @namespace sap.ui.fl.apply._internal.changes.descriptor.RegistrationBuild
	 * @experimental
	 * @since 1.77
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var RegistrationBuild = {
		appdescr_app_changeDataSource: ChangeDataSource,
		appdescr_ui5_addNewModelEnhanceWith: AddNewModelEnhanceWith,
		appdescr_ui5_setMinUI5Version: SetMinUI5Version,
		appdescr_fiori_setRegistrationIds: SetRegistrationIds,
		appdescr_ui5_setFlexExtensionPointEnabled: SetFlexExtensionPointEnabled

	};

	var RegistrationCopy = Object.assign({}, Registration);
	return Object.assign(RegistrationCopy, RegistrationBuild);
}, true);