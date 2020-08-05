/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/fl/apply/api/FlexRuntimeInfoAPI"], function(FlexRuntimeInfoAPI) {
	"use strict";
	return {
		formatStatusState: function (aChanges, aControlIds) {
			var bParameterMissing = !aChanges || aControlIds.some(
				function (sControlId) {
					return !sControlId;
				});

			if (bParameterMissing) {
				return sap.ui.core.ValueState.None;
			}

			return FlexRuntimeInfoAPI.isPersonalized({selectors: aControlIds}).then(function (bIsPersonalized) {
				return bIsPersonalized ? sap.ui.core.ValueState.Success : sap.ui.core.ValueState.Error;
			});
		},

		formatStatusText: function (aChanges, aControlIds, sPersonalizationMessage, sNoPersonalizationMessage) {
			var bParameterMissing = !aChanges || aControlIds.some(
				function (sControlId) {
					return !sControlId;
				});

			if (bParameterMissing) {
				return "Not all parameters set to the model yet!";
			}

			return FlexRuntimeInfoAPI.isPersonalized({selectors: aControlIds}).then(function (bIsPersonalized) {
				return bIsPersonalized ? sPersonalizationMessage : sNoPersonalizationMessage;
			});
		}
	};
});