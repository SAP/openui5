/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/ValueHelpDelegate',
	"delegates/odata/v4/ValueHelpDelegate",
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/enums/ConditionValidated',
	'sap/ui/mdc/p13n/StateUtil',
	'sap/base/util/deepEqual',
	"sap/ui/core/Core",
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	"sap/ui/model/FilterType"
], function(
	BaseValueHelpDelegate,
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

	const ValueHelpDelegate = Object.assign({}, ODataV4ValueHelpDelegate);
	ValueHelpDelegate.apiVersion = 2;//CLEANUP_DELEGATE

	ValueHelpDelegate.adjustSearch = function(oValueHelp, bTypeahead, sSearch) {

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
	const _isMatchingPayloadEntry = function (oContext, aConditionPayloadSegments) {
		const bContainsPayload = aConditionPayloadSegments && aConditionPayloadSegments.length > 0;
		return bContainsPayload ? aConditionPayloadSegments.find(function (aPayloadSegment) {
			return aPayloadSegment.length ? aPayloadSegment.find(function (oPayloadEntry) {
				const aEntryKeys = Object.keys(oPayloadEntry);
				const bHasKeyValuePairs = !!aEntryKeys.length;
				return bHasKeyValuePairs ? aEntryKeys.every(function (sKey) {
					const oProperty = oContext.getProperty(sKey);
					return oProperty === oPayloadEntry[sKey];
				}) : true;
			}) : true;
		}) : true;
	};

	ValueHelpDelegate.findConditionsForContext = function (oValueHelp, oContent, oContext, aConditions) {
		const bSelectionConsidersList = oContent.getModel("settings").getProperty("/selectionConsidersList");
		const bSelectionConsidersPayload = oContent.getModel("settings").getProperty("/selectionConsidersPayload");
		return BaseValueHelpDelegate.findConditionsForContext.apply(this, arguments).filter(function (oCondition) {
			const oCurrentListPayload = oCondition.payload && oCondition.payload[oContent.getId()];
				if (bSelectionConsidersList) {
					const aPayloadKeys = oCondition.payload && Object.keys(oCondition.payload);
					if (aPayloadKeys.length && !oCurrentListPayload) {	// if other payload identifier exists we skip this entry
						return false;
					}
				}
				if (bSelectionConsidersPayload && !_isMatchingPayloadEntry(oContext, bSelectionConsidersList ? [oCurrentListPayload] : Object.values(oCondition.payload))) {	// only consider this lists payload, if selected "by payload key"
					return false;
				}
				return true;
		});
	};

	function _addContexts(oContext, aContextProperties, oStore) {
		const oObject = oContext.getObject();
		for (let index = 0; index < aContextProperties.length; index++) {
			const sProperty = aContextProperties[index];
			if (typeof oObject[sProperty] !== 'undefined') {
				oStore[sProperty] = oObject[sProperty];
			}
		}
	}

	ValueHelpDelegate.createConditionPayload = function (oValueHelp, oContent, aValues, vContext) {
		const sIdentifier = oContent.getId();
		const oConditionPayload = {};
		oConditionPayload[sIdentifier] = [];

		if (vContext) {
			const oEntry = {};
			_addContexts(vContext, ["salesOrganization", "distributionChannel"], oEntry);
			if (Object.keys(oEntry).length) {
				oConditionPayload[sIdentifier].push(oEntry);
			}
		}
		return oConditionPayload;
	};

	function _mergePayloadSegments(oExistingPayload, oNewPayload) {

		const oResultPayload = {};

		const aAllKeys = Object.keys(oExistingPayload).concat(Object.keys(oNewPayload)).filter(function (value, index, self){
			return self.indexOf(value) === index;
		});

		aAllKeys.forEach(function (sKey) {
			const oExistingEntry = oExistingPayload[sKey];
			const oNewEntry = oNewPayload[sKey];

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
	ValueHelpDelegate.modifySelectionBehaviour = function (oValueHelp, oContent, oChange) {

		const sCreationStrategy = oContent.getModel("settings").getProperty("/conditionCreationStrategy");
		const bIsModifyingStrategy = ["Merge", "Replace"].indexOf(sCreationStrategy) >= 0;
		const bIsReplaceStrategy = sCreationStrategy === "Replace";

		if (bIsModifyingStrategy) {
			const oChangeCondition = oChange.conditions[0];
			const oCurrentConditions = oContent.getConditions();
			const oExistingCondition = oCurrentConditions.find(function (oCondition) {
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

				const aConditions = oCurrentConditions.slice().map(function (oCondition) {
					if (oCondition === oExistingCondition) {
						let bDeletedPayloadContent = false;
						const aChangePayload = oChangeCondition.payload[oContent.getId()];
						const aExistingPayload = oExistingCondition.payload[oContent.getId()];
						Object.values(aChangePayload).forEach(function (oChangePayloadEntry) {
							const oExistingEntryIndex = aExistingPayload.findIndex(function (oExistingPayloadEntry) {
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

	ValueHelpDelegate.onConditionPropagation = function (oValueHelp, sReason, oConfig) {
		const oControl = oValueHelp.getControl();

			if (sReason !== "ControlChange") {
				return;
			}

			// find all conditions carrying country information
			const aAllConditionCountries = oControl && oControl.getConditions().reduce(function (aResult, oCondition) {
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
				const oFilterBar = Core.byId("FB0");
				StateUtil.retrieveExternalState(oFilterBar).then(function (oState) {
					let bModify = false;
					aAllConditionCountries.forEach(function(sCountry) {
						const bExists = oState.filter && oState.filter['salesOrganization'] && oState.filter['salesOrganization'].find(function (oCondition) {
							return oCondition.values[0] === sCountry;
						});
						if (!bExists) {
							const oNewCondition = Condition.createCondition("EQ", [sCountry], undefined, undefined, ConditionValidated.Validated);
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

	ValueHelpDelegate.getFilterConditions = function (oValueHelp, oContent, oConfig) {
		const oConditions = ODataV4ValueHelpDelegate.getFilterConditions(arguments);

		const bIsTypeahead = oContent.isTypeahead();

		const oFilterBar = !bIsTypeahead && oContent.getFilterBar();
		const bFilterBarHasCountryFilter = oFilterBar && [].find(function (oFilterItem) {
			return oFilterItem.getBinding("conditions").sPath.indexOf("salesOrganization") >= 0;
		});

		const aSupportedConditionPaths = bIsTypeahead && oContent.getTable().getColumns().map(function (oColumn) { return oColumn.mAggregations.header.mProperties.text; });
		const bTypaheadSupportsSalesOrganizationConditions = aSupportedConditionPaths && aSupportedConditionPaths.indexOf("salesOrganization") >= 0;

		if (bTypaheadSupportsSalesOrganizationConditions || bFilterBarHasCountryFilter) {

			// Example field extraction:
			/*
			var TypeUtil = ODataV4ValueHelpDelegate.getTypeMap();
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
			const oSourceFilterBar = Core.byId("FB0");
			return StateUtil.retrieveExternalState(oSourceFilterBar).then(function (oExternalFilterBarState) {

				const aSalesOrganizationConditions = oExternalFilterBarState.filter && oExternalFilterBarState.filter["salesOrganization"];
				if (aSalesOrganizationConditions && aSalesOrganizationConditions.length) {
					oConditions["salesOrganization"] = aSalesOrganizationConditions;
					return oConditions;
				}
			});
		}

		return oConditions;
	};

	// optional
	ValueHelpDelegate.getCount = function (oValueHelp, oContent, aConditions, sGroup) {
		const bSelectionConsidersList = oContent.getModel("settings").getProperty("/selectionConsidersList");

		let aRelevantContentPayloadKeys = [oContent.getId()];

		if (sGroup) {
			const oDialog = oContent.getParent();
			if (oDialog) {
				aRelevantContentPayloadKeys = oDialog.getContent().filter(function (oContent) {
					return oContent.getGroup && oContent.getGroup() === sGroup;
				}).map(function (oContent) {
					return oContent.getId();
				});
			}
		}

		let iCount = 0;

		for (let i = 0; i < aConditions.length; i++) {
			const oCondition = aConditions[i];
			const aConditionPayloadKeys = oCondition.payload && Object.keys(oCondition.payload);

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

	ValueHelpDelegate.checkListBindingPending = function (oDelegatePayload, oListBinding, iRequestedItems) {
		// Additional support for JSON Model
		if (oListBinding && oListBinding.getModel().getMetadata().getName() === 'sap.ui.model.json.JSONModel') {
			return BaseValueHelpDelegate.checkListBindingPending(oDelegatePayload, oListBinding, iRequestedItems);
		}
		return ODataV4ValueHelpDelegate.checkListBindingPending(oDelegatePayload, oListBinding, iRequestedItems);
	};

	ODataV4ValueHelpDelegate.executeFilter = function(oValueHelp, oListBinding, iRequestedItems) {
		oListBinding.getContexts(0, iRequestedItems); // trigger request. not all entries needed, we only need to know if there is one, none or more
		return this.checkListBindingPending(oValueHelp, oListBinding, iRequestedItems).then(function () {
			return oListBinding;
		});
	};

	ValueHelpDelegate.getFilterConditions = function (oValueHelp, oContent, oConfig) {
		const oConditions = ODataV4ValueHelpDelegate.getFilterConditions(oValueHelp, oContent, oConfig);

		const oConfigPayload = oConfig && oConfig.context && oConfig.context.payload;	// As oConfig is present we are called in a getItemForValue context and would also like to search by payload, if available
		if (oConfigPayload) {
			Object.values(oConfigPayload).forEach(function (aEntries) {
				aEntries.forEach(function (oEntry) {
					Object.keys(oEntry).forEach(function (sKey) {
						oConditions[sKey] = oConditions[sKey] || [];
						oConditions[sKey].push(Condition.createCondition("EQ", [oEntry[sKey]], undefined, undefined, ConditionValidated.NotValidated));
					});
				});
			});
		}

		return oConditions;
	};

	return ValueHelpDelegate;
});
