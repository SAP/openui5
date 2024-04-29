/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/DataSelector",
	"sap/ui/fl/apply/_internal/flexState/FlexState"
], (
	DependencyHandler,
	DataSelector,
	FlexState
) => {
	"use strict";

	const sUIChangeNameSpace = "sap.ui.fl.apply._internal.flexObjects.UIChange";

	/**
	 * UI Changes State
	 * Stores the dependency maps between UI changes.
	 *
	 * @namespace
	 * @alias sap.ui.fl.apply._internal.flexState.changes.UIChangesState
	 * @since 1.121
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	const UIChangesState = {};

	const oAllUIChangesDataSelector = new DataSelector({
		id: "allUIChanges",
		parentDataSelector: FlexState.getFlexObjectsDataSelector(),
		executeFunction(aFlexObjects) {
			return aFlexObjects.filter((oFlexObject) => {
				return oFlexObject.isA(sUIChangeNameSpace);
			});
		},
		checkInvalidation(mParameters, oUpdateInfo) {
			const bRelevantType = ["addFlexObject", "removeFlexObject"].includes(oUpdateInfo.type);
			return bRelevantType && oUpdateInfo.updatedObject?.isA(sUIChangeNameSpace);
		}
	});

	const oVMIndependentUIChangesDataSelector = new DataSelector({
		id: "vmIndependentUIChanges",
		parentDataSelector: oAllUIChangesDataSelector,
		executeFunction(aFlexObjects) {
			return aFlexObjects.filter((oFlexObject) => {
				return !oFlexObject.getVariantReference()
				&& !oFlexObject.getSelector().persistencyKey
				&& oFlexObject.getFileType() !== "ctrl_variant_management_change"
				&& oFlexObject.getFileType() !== "ctrl_variant_change";
			});
		},
		checkInvalidation(mParameters, oUpdateInfo) {
			const bRelevantType = ["addFlexObject", "removeFlexObject"].includes(oUpdateInfo.type);
			return bRelevantType
				&& oUpdateInfo.updatedObject?.isA(sUIChangeNameSpace)
				&& !oUpdateInfo.updatedObject.getVariantReference()
				&& !oUpdateInfo.updatedObject.getSelector().persistencyKey
				&& oUpdateInfo.updatedObject.getFileType() !== "ctrl_variant_management_change"
				&& oUpdateInfo.updatedObject.getFileType() !== "ctrl_variant_change";
		}
	});

	const oVMIndependentCompleteDependencyMapDataSelector = new DataSelector({
		id: "vmIndependentCompleteDependencyMap",
		parentDataSelector: oVMIndependentUIChangesDataSelector,
		executeFunction(aUIChanges, mParameters) {
			const oDependencyMap = DependencyHandler.createEmptyDependencyMap();
			const sComponentId = FlexState.getComponentIdForReference(mParameters.reference);
			aUIChanges.forEach((oFlexObject) => {
				DependencyHandler.addChangeAndUpdateDependencies(oFlexObject, sComponentId, oDependencyMap);
			});
			return oDependencyMap;
		}
	});

	UIChangesState.getVMIndependentCompleteDependencyMap = function(sReference) {
		return oVMIndependentCompleteDependencyMapDataSelector.get({reference: sReference});
	};

	UIChangesState.getVariantIndependentUIChanges = function(sReference) {
		return oVMIndependentUIChangesDataSelector.get({reference: sReference});
	};

	/**
	 * Returns all UI Changes, including variant dependent UI Changes.
	 *
	 * @param {string} sReference - Flex reference
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} All UI Changes
	 */
	UIChangesState.getAllUIChanges = function(sReference) {
		return oAllUIChangesDataSelector.get({reference: sReference});
	};

	return UIChangesState;
});
