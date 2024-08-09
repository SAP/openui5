/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Element",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils"
], function(
	JsControlTreeModifier,
	Element,
	FlexObjectState,
	ManifestUtils
) {
	"use strict";

	// The dependencies are retrieved for VM-independent changes + the changes from the currently selected variant(s) in the app
	function enhanceExportWithChangeData(oExport, oAppComponent) {
		const mInitialDependencies = FlexObjectState.getCompleteDependencyMap(oExport.sComponentName).mDependencies;
		for (const sChangeId in mInitialDependencies) {
			const oChange = mInitialDependencies[sChangeId].changeObject;
			oExport.mChangesEntries[sChangeId] = {
				mDefinition: oChange.convertToFileContent(),
				aControlsDependencies: [],
				aDependencies: []
			};

			if (oChange._aDependentSelectorList && oAppComponent) {
				oChange._aDependentSelectorList.forEach(function(oSelector) {
					const mControlData = {
						bPresent: !!JsControlTreeModifier.bySelector(oSelector, oAppComponent),
						aAppliedChanges: [],
						aFailedChangesJs: [],
						aFailedChangesXml: [],
						aNotApplicableChanges: []
					};

					oExport.mControlData[oSelector.id] = mControlData;
				});
			}
		}

		enhanceExportWithDependencyData(oExport.sComponentName, oExport);
	}

	function enhanceExportWithDependencyData(sReference, oExport) {
		const mInitialDependencies = FlexObjectState.getCompleteDependencyMap(sReference).mDependencies;
		for (const sChangeId in mInitialDependencies) {
			const mChangeSpecificDependencies = mInitialDependencies[sChangeId];
			oExport.mChangesEntries[sChangeId].aControlsDependencies = mChangeSpecificDependencies.controlsDependencies;
			oExport.mChangesEntries[sChangeId].aDependencies = mChangeSpecificDependencies.dependencies;
		}
	}

	function enhanceWithChangetypeSpecificData(oExport, sExportParameterName, mControlData, sControlDataParameterName, aCustomDataChanges) {
		if (aCustomDataChanges) {
			mControlData[sControlDataParameterName] = aCustomDataChanges;
			mControlData[sControlDataParameterName].map(function(sChangeId) {
				if (!(sChangeId in oExport[sExportParameterName])) {
					oExport[sExportParameterName].push(sChangeId);
				}
			});
		}
	}

	function getChangesForControlFromCustomData(oControl, sIdentifier) {
		const aCustomData = oControl.getCustomData();
		const aChangeIds = [];
		aCustomData.forEach(function(oCustomData) {
			const sKey = oCustomData.getKey();
			if (sKey.startsWith(sIdentifier)) {
				aChangeIds.push(sKey.replace(sIdentifier, ""));
			}
		});
		return aChangeIds;
	}

	function enhanceExportWithControlData(oExport) {
		// collect applied changes

		for (const sControlId in FlexObjectState.getLiveDependencyMap(oExport.sComponentName).mChanges) {
			const mControlData = {
				bPresent: false,
				aAppliedChanges: [],
				aFailedChangesJs: [],
				aFailedChangesXml: [],
				aNotApplicableChanges: []
			};

			const oControl = Element.getElementById(sControlId);

			if (oControl) {
				mControlData.bPresent = true;
				enhanceWithChangetypeSpecificData(
					oExport,
					"aAppliedChanges",
					mControlData,
					"aAppliedChanges",
					getChangesForControlFromCustomData(oControl, "sap.ui.fl.appliedChanges.")
				);
				enhanceWithChangetypeSpecificData(
					oExport,
					"aFailedChanges",
					mControlData,
					"aFailedChangesJs",
					getChangesForControlFromCustomData(oControl, "sap.ui.fl.failedChanges.js.")
				);
				enhanceWithChangetypeSpecificData(
					oExport,
					"aFailedChanges",
					mControlData,
					"aFailedChangesXml",
					getChangesForControlFromCustomData(oControl, "sap.ui.fl.failedChanges.xml.")
				);
				enhanceWithChangetypeSpecificData(
					oExport,
					"aNotApplicableChanges",
					mControlData,
					"aNotApplicableChanges",
					getChangesForControlFromCustomData(oControl, "sap.ui.fl.notApplicableChanges.")
				);
			}
			oExport.mControlData[sControlId] = mControlData;
		}
	}

	return function(oAppComponent) {
		if (!oAppComponent) {
			return undefined;
		}

		const sComponentName = ManifestUtils.getFlexReferenceForControl(oAppComponent);

		const oExport = {
			sVersion: "1",
			bIsInvestigationExport: true,
			mControlData: {},
			aAppliedChanges: [],
			aFailedChanges: [],
			aNotApplicableChanges: [],
			mChangesEntries: {},
			mVariantsChanges: {},
			sComponentName
		};

		enhanceExportWithChangeData(oExport, oAppComponent);
		enhanceExportWithControlData(oExport);

		return oExport;
	};
});