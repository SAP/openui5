/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/fl/apply/api/FlexRuntimeInfoAPI", "sap/ui/core/library"], function(FlexRuntimeInfoAPI, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var {ValueState} = coreLibrary;

	return {
		formatStatusState(aChanges, aControlIds) {
			var bParameterMissing = !aChanges || aControlIds.some(
				function(sControlId) {
					return !sControlId;
				});

			if (bParameterMissing) {
				return ValueState.None;
			}

			return FlexRuntimeInfoAPI.isPersonalized({selectors: aControlIds}).then(function(bIsPersonalized) {
				return bIsPersonalized ? ValueState.Success : ValueState.Error;
			});
		},

		formatStatusText(aChanges, aControlIds, sPersonalizationMessage, sNoPersonalizationMessage) {
			var bParameterMissing = !aChanges || aControlIds.some(
				function(sControlId) {
					return !sControlId;
				});

			if (bParameterMissing) {
				return "Not all parameters set to the model yet!";
			}

			return FlexRuntimeInfoAPI.isPersonalized({selectors: aControlIds}).then(function(bIsPersonalized) {
				return bIsPersonalized ? sPersonalizationMessage : sNoPersonalizationMessage;
			});
		}
	};
});