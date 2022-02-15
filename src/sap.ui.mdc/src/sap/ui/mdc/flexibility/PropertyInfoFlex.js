/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/changeHandler/Base"
], function (
	merge,
	Base
) {
	"use strict";

	/*
	* NOTE: As the PropertyInfoFlex is the central change handler for property info
	* processing, it might happen that the in/out handling of the ConditionModel
	* might cause multiple condition changes to be applied in parallel. Due to the
	* asynchronous modifier handling, we need to make sure to queue these changes in their
	* incoming order as parallel processing might falsely overwrite the 'filterConditions' or the 'propertyInfo'
	* properties causing the change handler to break the controls housekeeping and the last
	* parallel filter change would always win.
	*
	* Same processing is done in the ConditionFlex - handler.
	*/
	var fnQueueChange = function(oControl, fTask) {
		var fCleanupPromiseQueue = function(pOriginalPromise) {
			if (oControl._pQueue === pOriginalPromise){
				delete oControl._pQueue;
			}
		};

		oControl._pQueue = oControl._pQueue instanceof Promise ? oControl._pQueue.then(fTask) : fTask();
		oControl._pQueue.then(fCleanupPromiseQueue.bind(null, oControl._pQueue));

		return oControl._pQueue;
	};

	var fAddFilterInfo = function(oChange, oChangeContent, oControl, mPropertyBag) {

		return fnQueueChange(oControl, function(){
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
				} else {
					return Base.markAsNotApplicable(
						"Property " + oChangeContent.name + " already exists on control " + oModifier.getId(oControl),
						/*bAsync*/true
					);
				}
			});
		});
	};

	var fRemoveFilterInfo = function(oChange, oChangeContent, oControl, mPropertyBag) {

		return fnQueueChange(oControl, function(){
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