/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/changes/UIChangesState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/Utils"
], function(
	UIChangesState,
	FlexObjectState,
	FlexState,
	ManifestUtils,
	Utils
) {
	"use strict";

	/**
	 * Returns an array with all UI Changes for the application.
	 *
	 * @namespace sap.ui.fl.support._internal.getAllUIChanges
	 * @since 1.128
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.support.api.SupportAPI
	 */

	function getFlexObjectInfos(oCurrentAppContainerObject) {
		const oAppComponent = oCurrentAppContainerObject.oContainer.getComponentInstance();
		const sReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);
		return {
			allUIChanges: UIChangesState.getAllUIChanges(sReference),
			allFlexObjects: FlexState.getFlexObjectsDataSelector().get({ reference: sReference }),
			dirtyFlexObjects: FlexObjectState.getDirtyFlexObjects(sReference),
			completeDependencyMap: FlexObjectState.getCompleteDependencyMap(sReference),
			liveDependencyMap: FlexObjectState.getLiveDependencyMap(sReference)
		};
	}

	return async function(oAppComponent) {
		// in most scenarios the appComponent will already be passed, but in iFrame cases (like cFLP) the appComponent is not available
		// outside of the iFrame. In this case the function is called from inside the iFrame and has to fetch the appComponent
		if (!oAppComponent) {
			const oAppLifeCycleService = await Utils.getUShellService("AppLifeCycle");
			return getFlexObjectInfos(oAppLifeCycleService.getCurrentApplication().componentInstance);
		}
		return getFlexObjectInfos(oAppComponent);
	};
});
