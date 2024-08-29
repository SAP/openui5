/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState"
], function(
	_omit,
	Component,
	Applier,
	FlexObjectFactory,
	DependencyHandler,
	FlexObjectState,
	FlexState
) {
	"use strict";

	/**
	 * Central class for the management of UIChanges within the flex states.
	 *
	 * @namespace
	 * @alias sap.ui.fl.write._internal.flexState.changes.UIChangeManager
	 * @since 1.129
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	const UIChangeManager = {};

	function finalizeChangeCreation(sReference, oChange, oAppComponent) {
		DependencyHandler.addRuntimeChangeToMap(
			oChange,
			oAppComponent,
			FlexObjectState.getLiveDependencyMap(sReference)
		);

		// If the first changes were created, the propagationListener of sap.ui.fl
		// might not yet be attached to the application component and must be added then
		if (oAppComponent instanceof Component) {
			const bNoFlPropagationListenerAttached = oAppComponent.getPropagationListeners()
			.every((fnPropagationListener) => (!fnPropagationListener._bIsSapUiFlFlexControllerApplyChangesOnControl));

			if (bNoFlPropagationListenerAttached) {
				const fnPropagationListener = Applier.applyAllChangesForControl.bind(Applier, oAppComponent, sReference);
				fnPropagationListener._bIsSapUiFlFlexControllerApplyChangesOnControl = true;
				oAppComponent.addPropagationListener(fnPropagationListener);
			}
		}
	}

	function getOrCreateFlexObject(vFlexObject) {
		return (
			typeof vFlexObject.isA === "function"
			&& vFlexObject.isA("sap.ui.fl.apply._internal.flexObjects.FlexObject")
		)
			? vFlexObject
			: FlexObjectFactory.createFromFileContent(vFlexObject);
	}

	/**
	 * Adds new UIChanges and returns the IDs of the new UIChanges.
	 *
	 * @param {string} sReference - Flex reference of the application
	 * @param {object[]} aChanges - Array with complete and finalized JSON object representation of the file content of the UIChanges or UIChange instances
	 * @param {sap.ui.core.Component} oAppComponent - Application component instance
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} The newly added UIChanges
	 * @public
	 */
	UIChangeManager.addDirtyChanges = function(sReference, aChanges, oAppComponent) {
		const aAddedChanges = FlexState.addDirtyFlexObjects(sReference, aChanges.map(getOrCreateFlexObject));
		aAddedChanges.forEach((oChange) => {
			finalizeChangeCreation(sReference, oChange, oAppComponent);
		});
		return aAddedChanges;
	};

	return UIChangeManager;
});