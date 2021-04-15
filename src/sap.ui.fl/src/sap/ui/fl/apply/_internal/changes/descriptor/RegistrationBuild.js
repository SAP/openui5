
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/requireAsync",
	"sap/ui/fl/apply/_internal/changes/descriptor/Registration"
], function(
	requireAsync,
	Registration
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
		appdescr_app_changeDataSource: requireAsync("sap/ui/fl/apply/_internal/changes/descriptor/app/ChangeDataSource"),
		appdescr_ui5_addNewModelEnhanceWith: requireAsync("sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddNewModelEnhanceWith"),
		appdescr_ui5_addComponentUsages: requireAsync("sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddComponentUsages"),
		appdescr_ui5_setMinUI5Version: requireAsync("sap/ui/fl/apply/_internal/changes/descriptor/ui5/SetMinUI5Version"),
		appdescr_fiori_setRegistrationIds: requireAsync("sap/ui/fl/apply/_internal/changes/descriptor/fiori/SetRegistrationIds"),
		appdescr_ui5_setFlexExtensionPointEnabled: requireAsync("sap/ui/fl/apply/_internal/changes/descriptor/ui5/SetFlexExtensionPointEnabled"),
		appdescr_ui5_addNewModel: requireAsync("sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddNewModel"),
		appdescr_app_addAnnotationsToOData: requireAsync("sap/ui/fl/apply/_internal/changes/descriptor/app/AddAnnotationsToOData"),
		appdescr_app_changeInbound: requireAsync("sap/ui/fl/apply/_internal/changes/descriptor/app/ChangeInbound")
	};

	var RegistrationCopy = Object.assign({}, Registration);
	return Object.assign(RegistrationCopy, RegistrationBuild);
});