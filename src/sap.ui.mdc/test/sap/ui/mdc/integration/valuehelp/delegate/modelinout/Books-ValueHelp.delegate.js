/*!
 * ${copyright}
 */

sap.ui.define([
	"../ValueHelp.delegate",
	"sap/ui/core/Core",
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/p13n/StateUtil',
	'./ODataV4ModelHelper'
], function(
	ODataV4ValueHelpDelegate,
	Core,
	Condition,
	StateUtil,
	ODataV4ModelHelper
) {
	"use strict";

	var ValueHelpDelegate = Object.assign({}, ODataV4ValueHelpDelegate);

	// Required for internal communication (e.g. creating a condition for getInitialFilterConditions)
	function _createConditionFromModelPath(oOptions) {
		return ODataV4ModelHelper.retrieveValueForPath(oOptions.model, oOptions.path).then(function (vValue) {
			return Condition.createCondition(oOptions.operator || "EQ", [vValue], undefined, undefined, oOptions.validated || "NotValidated", oOptions.payload);
		});
	}

	/* // Required for externalized (StateUtil-based) communication (e.g. creating a condition from model to apply to a filterbar via StateUtil.applyExternalState)
	function _createExternalConditionFromModelPath(oPayload, oOptions) {
		return ODataV4ModelHelper.retrievePath(oOptions.model, oOptions.path).then(function (oEntry) {
			return ConditionConverter.createExternalCondition(oOptions.operator || "EQ", [oEntry.value], oOptions.validated || "NotValidated", oOptions.payload, oOptions.type, ODataV4ValueHelpDelegate.getTypeUtil());
		});
	} */

	ValueHelpDelegate.createConditionPayload = function (oPayload, oContent, aValues, vContext) {
		var oConditionPayload = {};
		var oListBinding = oContent.getListBinding();
			var oContext = oListBinding && oListBinding.aContexts && oListBinding.aContexts.find(function (oContext) {
				return oContext.getObject(oContent.getKeyPath()) === aValues[0];
			});
			if (oContext) {
				var aDataProperties = oContent.getTable().getColumns().map(function (oColumn) {
					return oColumn.getDataProperty && oColumn.getDataProperty();
				});

				if (aDataProperties.indexOf("createdAt") !== -1) {
					oConditionPayload["createdAt"] = oContext.getProperty("createdAt");	// TODO: Do we actually need to convert anything, when storing only raw context data?
				}

				if (aDataProperties.indexOf("metricsSyllables") !== -1) {
					oConditionPayload["metricsSyllables"] = oContext.getProperty("metricsSyllables");	// TODO: Do we actually need to convert anything, when storing only raw context data?
				}
			}
		return oConditionPayload;
	};

	ValueHelpDelegate.getInitialFilterConditions = function (oPayload, oContent, oControl) {
		var oModel = oControl.getModel();

		var aKeys = ['createdAt', 'metricsSyllables'];

		return Promise.all([
			_createConditionFromModelPath({ model: oModel, path: "/Books(1)/createdAt", operator: "GT"}),
			_createConditionFromModelPath({ model: oModel, path: "/Books(1)/metricsSyllables", operator: "GT"})
		]).then(function (aResults) {
			return aResults.reduce(function (oResult, oCondition, i) {
				if (oCondition) {
					oResult[aKeys[i]] = [oCondition];
				}
				return oResult;
			}, {});
		});
	};

	ValueHelpDelegate.onConditionPropagation = function (oPayload, oValueHelp, sReason, oConfig) {
		var aConditions = oValueHelp.getConditions();
		var oCondition = aConditions[0];

		if (oCondition) {

			// Set selected books metricsSyllables as new value on first book everytime the selection is confirmed.
			var oModel = oValueHelp.getModel();
			ODataV4ModelHelper.setProperty({
				model: oModel,
				keyPath: "/Books(1)/metricsSyllables",
				value: oCondition.payload.metricsSyllables
			});
			ODataV4ModelHelper.submit(oModel);

			var oSecondFilterBar = Core.byId("FB1");
			// Update the second filterbar with an externalized condition of the selected book (do we have more suitable data to demonstrate the necessity for externalization?)
			if (oSecondFilterBar) {
				var oExternalizedCondition = ODataV4ValueHelpDelegate.externalizeCondition(undefined, {
					condition: oCondition,
					type: ODataV4ModelHelper.retrieveUI5TypeForPath(oModel, "/Books(1)/ID")
				});
				StateUtil.applyExternalState(oSecondFilterBar, {filter: {"ID": [oExternalizedCondition]}});
			}
		}
	};


	return ValueHelpDelegate;
});
