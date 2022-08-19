/*!
 * ${copyright}
 */

sap.ui.define([
	"delegates/odata/v4/ValueHelpDelegate",
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/enum/ConditionValidated',
	'sap/ui/mdc/p13n/StateUtil',
	'sap/base/util/deepEqual',
	"sap/ui/core/Core",
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	"sap/ui/model/FilterType"
], function(
	ODataV4ValueHelpDelegate,
	Condition,
	ConditionValidated,
	StateUtil,
	deepEqual,
	Core,
	Filter,
	FilterOperator,
	FilterType
) {
	"use strict";

	var ValueHelpDelegate = Object.assign({}, ODataV4ValueHelpDelegate);

	ValueHelpDelegate.adjustSearch = function(oPayload, bTypeahead, sSearch) {

		if (bTypeahead && sSearch) {
			return '"' + sSearch + '"'; // TODO: escape " in string
		} else if (sSearch && sSearch.indexOf(" ") === -1) {
			return '"' + sSearch + '"'; // TODO: escape " in string
		} else {
			// allow OR AND ....
			return sSearch; // TODO: check for unsoprted characters
		}

	};

	// If there are no entries to compare, we return true for this condition
	var _isMatchingPayloadEntry = function (oContext, aConditionPayloadSegments) {
		var bContainsPayload = aConditionPayloadSegments && aConditionPayloadSegments.length > 0;
		return bContainsPayload ? aConditionPayloadSegments.find(function (aPayloadSegment) {
			return aPayloadSegment.length ? aPayloadSegment.find(function (oPayloadEntry) {
				var aEntryKeys = Object.keys(oPayloadEntry);
				var bHasKeyValuePairs = !!aEntryKeys.length;
				return bHasKeyValuePairs ? aEntryKeys.every(function (sKey) {
					var oProperty = oContext.getProperty(sKey);
					return oProperty === oPayloadEntry[sKey];
				}) : true;
			}) : true;
		}) : true;
	};

	ValueHelpDelegate.isFilterableListItemSelected = function (oPayload, oContent, oItem, aConditions) {
		var sModelName = oContent._getListBindingInfo().model;
		var bSelectionConsidersList = oContent.getModel("settings").getProperty("/selectionConsidersList");
		var bSelectionConsidersPayload = oContent.getModel("settings").getProperty("/selectionConsidersPayload");


		var oContext = oItem && oItem.getBindingContext(sModelName);
		for (var i = 0; i < aConditions.length; i++) {
			var oCondition = aConditions[i];
			if (ODataV4ValueHelpDelegate.isFilterableListItemSelected(oPayload, oContent, oItem, [oCondition])) { // TODO: check for specific EQ operator
				var oCurrentListPayload = oCondition.payload && oCondition.payload[oContent.getId()];
				if (bSelectionConsidersList) {
					var aPayloadKeys = oCondition.payload && Object.keys(oCondition.payload);
					if (aPayloadKeys.length && !oCurrentListPayload) {	// if other payload identifier exists we skip this entry
						continue;
					}
				}

				if (bSelectionConsidersPayload && !_isMatchingPayloadEntry(oContext, bSelectionConsidersList ? [oCurrentListPayload] : Object.values(oCondition.payload))) {	// only consider this lists payload, if selected "by payload key"
					continue;
				}

				return true;
			}
		}

		return false;
	};

	function _addContext(oContext, sProperty, oStore) {
		var vProp = oContext.getProperty(sProperty);
			if (vProp) {
				oStore[sProperty] = vProp;
			}
	}

	ValueHelpDelegate.createConditionPayload = function (oPayload, oContent, aValues, vContext) {
		var sIdentifier = oContent.getId();
		var oConditionPayload = {};
		oConditionPayload[sIdentifier] = [];

		if (vContext) {
			var oEntry = {};
			_addContext(vContext, "salesOrganization", oEntry);
			_addContext(vContext, "distributionChannel", oEntry);
			if (Object.keys(oEntry).length) {
				oConditionPayload[sIdentifier].push(oEntry);
			}
		}
		return oConditionPayload;
	};

	function _mergePayloadSegments(oExistingPayload, oNewPayload) {

		var oResultPayload = {};

		var aAllKeys = Object.keys(oExistingPayload).concat(Object.keys(oNewPayload)).filter(function (value, index, self){
			return self.indexOf(value) === index;
		});

		aAllKeys.forEach(function (sKey) {
			var oExistingEntry = oExistingPayload[sKey];
			var oNewEntry = oNewPayload[sKey];

			if (oExistingEntry) {
				if (!oNewEntry) {
					oResultPayload[sKey] = oExistingEntry;
					return;
				}
				if (typeof oExistingEntry === 'string' || Array.isArray(oExistingEntry)) {
					oResultPayload[sKey] = [].concat(oExistingEntry, oNewEntry);
					return;
				} else {
					oResultPayload[sKey] = _mergePayloadSegments(oExistingEntry, oNewEntry);
					return;
				}
			}

			oResultPayload[sKey] = oNewEntry;

		});

		return oResultPayload;
	}

	// TODO: Handle Select All / Ranges!
	// TODO: Share selections between Typeahead and Dialog when similar?
	ValueHelpDelegate.modifySelectionBehaviour = function (oPayload, oContent, oChange) {

		var sCreationStrategy = oContent.getModel("settings").getProperty("/conditionCreationStrategy");
		var bIsModifyingStrategy = ["Merge", "Replace"].indexOf(sCreationStrategy) >= 0;
		var bIsReplaceStrategy = sCreationStrategy === "Replace";

		if (bIsModifyingStrategy) {
			var oChangeCondition = oChange.conditions[0];
			var oCurrentConditions = oContent.getConditions();
			var oExistingCondition = oCurrentConditions.find(function (oCondition) {
				return oCondition.values[0] === oChangeCondition.values[0];
			});

			// reuse and apply payload to existing condition for this value
			if (oChange.type === "Add" && oExistingCondition) {
				return {
					type: "Set",
					conditions: oCurrentConditions.slice().map(function (oCondition) {
						if (oCondition === oExistingCondition) {
							oChangeCondition.payload = bIsReplaceStrategy ? Object.assign({}, oChangeCondition.payload) : _mergePayloadSegments(oExistingCondition.payload, oChangeCondition.payload);
							return oChangeCondition;
						}
						return oCondition;
					})
				};
			}
			// remove payload from existing condition for this value, or delete the condition if it doesn't contain another payload
			if (oChange.type === "Remove" && oExistingCondition) {

				var aConditions = oCurrentConditions.slice().map(function (oCondition) {
					if (oCondition === oExistingCondition) {
						var bDeletedPayloadContent = false;
						var aChangePayload = oChangeCondition.payload[oContent.getId()];
						var aExistingPayload = oExistingCondition.payload[oContent.getId()];
						Object.values(aChangePayload).forEach(function (oChangePayloadEntry) {
							var oExistingEntryIndex = aExistingPayload.findIndex(function (oExistingPayloadEntry) {
								return deepEqual(oExistingPayloadEntry, oChangePayloadEntry);
							});
							if (oExistingEntryIndex >= 0) {
								aExistingPayload.splice(oExistingEntryIndex, 1);
								bDeletedPayloadContent = true;
							}
						});

						if (bDeletedPayloadContent && !Object.values(aExistingPayload).length) {	// after deleting payload info and none remaining values, we assume this condition to be deletable in merge strategies
							delete oExistingCondition.payload[oContent.getId()];	// delete existing payload for this content
						}

						if (bDeletedPayloadContent && !Object.keys(oExistingCondition.payload).length) {	// remove condition if no other payload is available
							return undefined;
						}
						return oExistingCondition;
					}
					return oCondition;
				}).filter(function (oCondition) {
					return !!oCondition;
				});


				return {
					type: "Set",
					conditions: aConditions
				};
			}
		}

		return oChange;

	};

	ValueHelpDelegate.onConditionPropagation = function (oPayload, oValueHelp, sReason, oConfig) {
		var oControl = oValueHelp.getControl();

		// find all conditions carrying country information
		var aAllConditionCountries = oControl && oControl.getConditions().reduce(function (aResult, oCondition) {
			if (oCondition.payload) {
				Object.values(oCondition.payload).forEach(function (aSegments) {
					aSegments.forEach(function (oSegment) {
						if (oSegment["salesOrganization"] && aResult.indexOf(oSegment["salesOrganization"]) === -1) {
							aResult.push(oSegment["salesOrganization"]);
						}
					});
				});
			}
			return aResult;
		}, []);

		if (aAllConditionCountries && aAllConditionCountries.length) {
			var oFilterBar = Core.byId("FB0");
			StateUtil.retrieveExternalState(oFilterBar).then(function (oState) {
				var bModify = false;
				aAllConditionCountries.forEach(function(sCountry) {
					var bExists = oState.filter && oState.filter['salesOrganization'] && oState.filter['salesOrganization'].find(function (oCondition) {
						return oCondition.values[0] === sCountry;
					});
					if (!bExists) {
						var oNewCondition = Condition.createCondition("EQ", [sCountry], undefined, undefined, ConditionValidated.Validated);
						oState.filter['salesOrganization'] = oState.filter && oState.filter['salesOrganization'] || [];
						oState.filter['salesOrganization'].push(oNewCondition);
						bModify = true;
					}
				});

				if (bModify) {
					StateUtil.applyExternalState(oFilterBar, oState);
				}
			});
		}
	};

	ValueHelpDelegate.getInitialFilterConditions = function (oPayload, oContent, oControl) {
		var oConditions = ODataV4ValueHelpDelegate.getInitialFilterConditions(oPayload, oContent, oControl);

		var bIsTypeahead = oContent.isTypeahead();

		var oFilterBar = !bIsTypeahead && oContent.getFilterBar();
		var bFilterBarHasCountryFilter = oFilterBar && oFilterBar.getFilterItems().find(function (oFilterItem) {
			return oFilterItem.getBinding("conditions").sPath.indexOf("salesOrganization") >= 0;
		});

		var aSupportedConditionPaths = bIsTypeahead && oContent.getTable().getColumns().map(function (oColumn) { return oColumn.mAggregations.header.mProperties.text; });
		var bTypaheadSupportsSalesOrganizationConditions = aSupportedConditionPaths && aSupportedConditionPaths.indexOf("salesOrganization") >= 0;

		if (bTypaheadSupportsSalesOrganizationConditions || bFilterBarHasCountryFilter) {

			// Example field extraction:
			/*
			var TypeUtil = ODataV4ValueHelpDelegate.getTypeUtil();
			var oField = Core.byId("FB0-SO");
			var aSalesOrganizationConditions = oField.getConditions();
			if (aSalesOrganizationConditions && aSalesOrganizationConditions.length) {
				oConditions["salesOrganization"] = aSalesOrganizationConditions.map(function (oCondition) {
					var vInternalValue = oCondition.values[0];
					if (vInternalValue) {
						oCondition.values = [TypeUtil.externalizeValue(vInternalValue, oField.getDataType(), oField.getDataTypeFormatOptions(), oField.getDataTypeConstraints())];
					}
					return oCondition;
				});
				return oConditions;
			} */

			// Example filterbar extraction:
			var oSourceFilterBar = Core.byId("FB0");
			return StateUtil.retrieveExternalState(oSourceFilterBar).then(function (oExternalFilterBarState) {

				var aSalesOrganizationConditions = oExternalFilterBarState.filter && oExternalFilterBarState.filter["salesOrganization"];
				if (aSalesOrganizationConditions && aSalesOrganizationConditions.length) {
					oConditions["salesOrganization"] = aSalesOrganizationConditions;
					return oConditions;
				}
			});
		}

		return oConditions;
	};

	// optional
	ValueHelpDelegate.getCount = function (oPayload, oContent, aConditions, sGroup) {
		var bSelectionConsidersList = oContent.getModel("settings").getProperty("/selectionConsidersList");

		var aRelevantContentPayloadKeys = [oContent.getId()];

		if (sGroup) {
			var oDialog = oContent.getParent();
			if (oDialog) {
				aRelevantContentPayloadKeys = oDialog.getContent().filter(function (oContent) {
					return oContent.getGroup && oContent.getGroup() === sGroup;
				}).map(function (oContent) {
					return oContent.getId();
				});
			}
		}

		var iCount = 0;

		for (var i = 0; i < aConditions.length; i++) {
			var oCondition = aConditions[i];
			var aConditionPayloadKeys = oCondition.payload && Object.keys(oCondition.payload);

			if (oCondition.isEmpty !== true && oCondition.validated === ConditionValidated.Validated) {
				// eslint-disable-next-line no-loop-func
				if (bSelectionConsidersList && aConditionPayloadKeys && !aRelevantContentPayloadKeys.find(function (sKey) {
					return aConditionPayloadKeys.indexOf(sKey) >= 0;
				})) {
					continue;
				}
				iCount++;
			}
		}
		return iCount;
	};

	ValueHelpDelegate.checkListBindingPending = function (oDelegatePayload, oListBinding, oListBindingInfo) {
		// Additional support for JSON Model
		if (oListBinding && oListBinding.getModel().getMetadata().getName() === 'sap.ui.model.json.JSONModel') {
			return false;
		}
		return ODataV4ValueHelpDelegate.checkListBindingPending(oDelegatePayload, oListBinding, oListBindingInfo);
	};

	ValueHelpDelegate.executeFilter = function(oPayload, oListBinding, oFilter, iRequestedItems) {
		// Additional support for JSON Model
		if (oListBinding && oListBinding.getModel().getMetadata().getName() === 'sap.ui.model.json.JSONModel') {
			oListBinding.initialize();
			oListBinding.filter(oFilter, FilterType.Application);
			return Promise.resolve(oListBinding);
		}
		return ODataV4ValueHelpDelegate.executeFilter(oPayload, oListBinding, oFilter, iRequestedItems);
	};

	ValueHelpDelegate.retrieveContent = function (oPayload, oContainer, sContentId) {
		// TODO: Remove testcode for visibility changes on contents
		/* if (oContainer.getId() === '__dialog0' && !oContainer.isOpen()) {
			var secondTableWrapper = Core.byId("__mdctable1");
			if (secondTableWrapper) {
				secondTableWrapper.setVisible(!secondTableWrapper.getVisible());
			}
		} */
	};

	return ValueHelpDelegate;
});
