/*
 * ! ${copyright}
 */
sap.ui.define([
	'sap/base/util/merge'
], function(merge) {
	"use strict";

	var fAddFilterInfo = function(oChange, oChangeContent, oControl, mPropertyBag) {

		var oModifier = mPropertyBag.modifier;

		return oModifier.getProperty(oControl, "propertyInfo")
		.then(function(aPropertyInfo) {

			var aPropertiesInfo = merge([], aPropertyInfo);
			var nIdx = aPropertiesInfo.findIndex(function(oEntry) {
				return oEntry.name === oChangeContent.name;
			});
			if (nIdx < 0) {
				aPropertiesInfo.push({
					name: oChangeContent.name,
					dataType: oChangeContent.dataType,
					maxConditions: oChangeContent.maxConditions,
					constraints: oChangeContent.constraints,
					formatOptions: oChangeContent.formatOptions,
					required: oChangeContent.required,
					caseSensitive: oChangeContent.caseSensitive,
					display: oChangeContent.display
				});

				oModifier.setProperty(oControl, "propertyInfo", aPropertiesInfo);

				// Set revert data on the change
				oChange.setRevertData({ name: oChangeContent.name});
			}
		});
	};

	var fRemoveFilterInfo = function(oChange, oChangeContent, oControl, mPropertyBag) {

		var oModifier = mPropertyBag.modifier;

		return oModifier.getProperty(oControl, "propertyInfo")
		.then(function(aPropertyInfos) {
			var aPropertiesInfo = merge([], aPropertyInfos);
			var nIdx = aPropertiesInfo.findIndex(function(oEntry) {
				return oEntry.name === oChangeContent.name;
			});
			if (nIdx >= 0) {
				aPropertiesInfo.splice(nIdx, 1);
				oModifier.setProperty(oControl, "propertyInfo", aPropertiesInfo);
			}
		});
	};


	var oPropertyInfoFlex = {};

	oPropertyInfoFlex.addPropertyInfo = {
		"changeHandler": {
			applyChange: function(oChange, oControl, mPropertyBag) {
				return fAddFilterInfo(oChange, oChange.getContent(), oControl, mPropertyBag);
			},
			completeChangeContent: function(oChange, mChangeSpecificInfo, mPropertyBag) {
				// TODO
			},
			revertChange: function(oChange, oControl, mPropertyBag) {
				return fRemoveFilterInfo(oChange, oChange.getRevertData(), oControl, mPropertyBag).then(function() {
					oChange.resetRevertData();
				});
			}
		},
		"layers": {
			"USER": true
		}
	};

	return oPropertyInfoFlex;
});