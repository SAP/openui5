/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/DataSelector",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils"
], (
	merge,
	JsControlTreeModifier,
	Utils,
	DependencyHandler,
	VariantManagementState,
	DataSelector,
	FlexState,
	ManifestUtils
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

	function getCompleteDependency(oChange, sReference) {
		const mInitialDependencies = UIChangesState.getCompleteDependencyMap(sReference).mDependencies;
		return mInitialDependencies[oChange.getId()] && Object.assign({}, mInitialDependencies[oChange.getId()]);
	}

	function copyDependencies(oInitialDependency, aNewValidDependencies, oAppComponent, oChange, sReference) {
		const aNewValidControlDependencies = [];
		const oDependencyMap = UIChangesState.getLiveDependencyMap(sReference);
		const oModifiedDependency = Object.assign({}, oInitialDependency);
		oInitialDependency.controlsDependencies.forEach(function(oDependentControlSelector) {
			// if the control is already available we don't need to add a dependency to it
			if (!JsControlTreeModifier.bySelector(oDependentControlSelector, oAppComponent)) {
				const sControlId = JsControlTreeModifier.getControlIdBySelector(oDependentControlSelector, oAppComponent);
				aNewValidControlDependencies.push(oDependentControlSelector);
				oDependencyMap.mControlsWithDependencies[sControlId] ||= [];
				if (!oDependencyMap.mControlsWithDependencies[sControlId].includes(oChange.getId())) {
					oDependencyMap.mControlsWithDependencies[sControlId].push(oChange.getId());
				}
			}
		});

		oModifiedDependency.dependencies = aNewValidDependencies;
		oModifiedDependency.controlsDependencies = aNewValidControlDependencies;
		if (aNewValidDependencies.length || aNewValidControlDependencies.length) {
			oDependencyMap.mDependencies[oChange.getId()] = oModifiedDependency;
		}
		return oModifiedDependency;
	}

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

	/**
	 * Fetches the complete dependency map based on all current UIChanges.
	 *
	 * @param {string} sReference - Flex reference
	 * @returns {object} Dependency Map
	 */
	UIChangesState.getCompleteDependencyMap = function(sReference) {
		const oVMIndependentUIChangesDepMap = oVMIndependentCompleteDependencyMapDataSelector.get({reference: sReference});
		const oVMDependentUIChangesDepMap = VariantManagementState.getDependencyMap(sReference);
		const oCombinedDepMap = merge({}, oVMIndependentUIChangesDepMap);

		merge(oCombinedDepMap.mDependencies, oVMDependentUIChangesDepMap.mDependencies);
		merge(oCombinedDepMap.mDependentChangesOnMe, oVMDependentUIChangesDepMap.mDependentChangesOnMe);
		oCombinedDepMap.aChanges = oCombinedDepMap.aChanges.concat(oVMDependentUIChangesDepMap.aChanges);

		["mChanges", "mControlsWithDependencies"].forEach((sKey) => {
			Object.entries(oVMDependentUIChangesDepMap[sKey]).forEach(([sControlId, aChanges]) => {
				if (Object.keys(oCombinedDepMap[sKey]).includes(sControlId)) {
					oCombinedDepMap[sKey][sControlId] = oCombinedDepMap[sKey][sControlId].concat(aChanges);
				} else {
					oCombinedDepMap[sKey][sControlId] = aChanges;
				}
			});
		});

		return oCombinedDepMap;
	};

	/**
	 * Fetches all UIChanges that can be applied. This includes the UIChanges of any current FlVariant.
	 * This excludes update changes for CompVariants
	 *
	 * @param {string} sReference - Flex Reference
	 * @returns {sap.ui.fl.apply._internal.flexObjects.UIChange[]} Returns all applicable UIChanges
	 */
	UIChangesState.getAllApplicableUIChanges = function(sReference) {
		const aVMIndependentUIChanges = oVMIndependentUIChangesDataSelector.get({reference: sReference});
		return aVMIndependentUIChanges.concat(VariantManagementState.getInitialUIChanges({
			reference: sReference
		}));
	};

	UIChangesState.getVariantIndependentUIChanges = function(sReference) {
		return oVMIndependentUIChangesDataSelector.get({reference: sReference});
	};

	/**
	 * Fetches the current dependency map from the Flex State.
	 * This map is continuously being modified as changes are getting applied.
	 * If the Flex State is not initialized, return an empty map.
	 * For now, this map can be mutated by the consumer
	 *
	 * @param {string} sReference - Flex reference
	 * @returns {object} Dependency Map
	 */
	UIChangesState.getLiveDependencyMap = function(sReference) {
		return FlexState.getRuntimeOnlyData(sReference).liveDependencyMap || DependencyHandler.createEmptyDependencyMap();
	};

	/**
	 * Copies the complete dependencies for the given change to the live dependency map.
	 * Also checks if the dependency is still valid in a callback
	 * This function is used in the case that controls got destroyed and recreated
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - The change whose dependencies should be copied
	 * @param {sap.ui.core.Component} oAppComponent - Application component instance
	 */
	UIChangesState.copyDependenciesFromCompleteDependencyMap = function(oChange, oAppComponent) {
		const sReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);
		let oCompleteDependency = getCompleteDependency(oChange, sReference);
		if (oCompleteDependency) {
			const oLiveDependencyMap = UIChangesState.getLiveDependencyMap(sReference);
			const aNewValidDependencies = [];
			oCompleteDependency.dependencies.forEach(function(sChangeId) {
				if (Utils.checkIfDependencyIsStillValid(oAppComponent, JsControlTreeModifier, oLiveDependencyMap, sChangeId)) {
					oLiveDependencyMap.mDependentChangesOnMe[sChangeId] ||= [];
					oLiveDependencyMap.mDependentChangesOnMe[sChangeId].push(oChange.getId());
					aNewValidDependencies.push(sChangeId);
				}
			});
			oCompleteDependency = copyDependencies(oCompleteDependency, aNewValidDependencies, oAppComponent, oChange, sReference);
		}
	};

	/**
	 * Checks the current dependencies map for any open (unresolved) dependencies belonging to the given control
	 * and returns the open dependent changes.
	 *
	 * @param {object} oSelector - Selector of the control
	 * @param {sap.ui.core.UIComponent} oAppComponent - Application component instance that is currently loading
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Array of all open dependent changes for the control
	 */
	UIChangesState.getOpenDependentChangesForControl = function(oSelector, oAppComponent) {
		const sReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);
		return DependencyHandler.getOpenDependentChangesForControl(
			UIChangesState.getLiveDependencyMap(sReference),
			JsControlTreeModifier.getControlIdBySelector(oSelector, oAppComponent),
			oAppComponent
		);
	};

	/**
	 * Returns all UI Changes.
	 *
	 * @param {string} sReference - Flex reference
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} All UI Changes
	 */
	UIChangesState.getAllUIChanges = function(sReference) {
		return oAllUIChangesDataSelector.get({reference: sReference});
	};

	return UIChangesState;
});
