
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
	 * @since 1.77
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var RegistrationBuild = {
		appdescr_app_changeDataSource: requireAsync.bind(this, "sap/ui/fl/apply/_internal/changes/descriptor/app/ChangeDataSource"),
		appdescr_ui5_addNewModelEnhanceWith: requireAsync.bind(this, "sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddNewModelEnhanceWith"),
		appdescr_ui5_addComponentUsages: requireAsync.bind(this, "sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddComponentUsages"),
		appdescr_ui5_setMinUI5Version: requireAsync.bind(this, "sap/ui/fl/apply/_internal/changes/descriptor/ui5/SetMinUI5Version"),
		appdescr_fiori_setRegistrationIds: requireAsync.bind(this, "sap/ui/fl/apply/_internal/changes/descriptor/fiori/SetRegistrationIds"),
		appdescr_ui5_setFlexExtensionPointEnabled: requireAsync.bind(this, "sap/ui/fl/apply/_internal/changes/descriptor/ui5/SetFlexExtensionPointEnabled"),
		appdescr_ui5_addNewModel: requireAsync.bind(this, "sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddNewModel"),
		appdescr_app_addAnnotationsToOData: requireAsync.bind(this, "sap/ui/fl/apply/_internal/changes/descriptor/app/AddAnnotationsToOData"),
		appdescr_app_removeAllInboundsExceptOne: requireAsync.bind(this, "sap/ui/fl/apply/_internal/changes/descriptor/app/RemoveAllInboundsExceptOne"),
		appdescr_app_changeInbound: requireAsync.bind(this, "sap/ui/fl/apply/_internal/changes/descriptor/app/ChangeInbound"),
		appdescr_app_addNewInbound: requireAsync.bind(this, "sap/ui/fl/apply/_internal/changes/descriptor/app/AddNewInbound"),
		appdescr_app_setAch: requireAsync.bind(this, "sap/ui/fl/apply/_internal/changes/descriptor/app/SetAch"),
		appdescr_app_addTechnicalAttributes: requireAsync.bind(this, "sap/ui/fl/apply/_internal/changes/descriptor/app/AddTechnicalAttributes"),
		appdescr_fiori_setAbstract: requireAsync.bind(this, "sap/ui/fl/apply/_internal/changes/descriptor/fiori/SetAbstract"),
		appdescr_fiori_setCloudDevAdaptationStatus: requireAsync.bind(this, "sap/ui/fl/apply/_internal/changes/descriptor/fiori/SetCloudDevAdaptationStatus")
	};

	var RegistrationCopy = Object.assign({}, Registration);
	return Object.assign(RegistrationCopy, RegistrationBuild);
});