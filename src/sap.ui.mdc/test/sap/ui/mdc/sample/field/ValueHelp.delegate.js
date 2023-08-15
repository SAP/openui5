/*!
 * ${copyright}
 */

sap.ui.define([
	"./ValueHelpODataV2.delegate",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/base/util/merge",
	"sap/base/util/deepEqual"
], function(
	MDCValueHelpDelegate,
	Condition,
	ConditionValidated,
	merge,
	deepEqual
) {
	"use strict";

	var ValueHelpDelegate = Object.assign({}, MDCValueHelpDelegate);
	ValueHelpDelegate.apiVersion = 2;//CLEANUP_DELEGATE

	ValueHelpDelegate.retrieveContent = function(oValueHelp, oContainer, sContentId) {
		var oPayload = oValueHelp.getPayload();
		var oContent = sContentId ? sap.ui.getCore().byId(sContentId) : oContainer.getContent()[0];
		sContentId = oContent && oContent.getId();

		if (oContent.getTable && !oContent.getTable()) {
			// assign table async
			var fResolve;
			var fReject;
			var oPromise = new Promise(function (fnResolve, fnReject) {
				fResolve = fnResolve;
				fReject = fnReject;
			});
			setTimeout(function() {
				for (var sId in oPayload) {
					var iIndex = sContentId.indexOf(sId);
					if (iIndex >= 0) {
						var sView = sContentId.substr(0, iIndex);
						var sTableId = sView + (oPayload && oPayload[sContentId.substr(iIndex)]);
						var oTable = sap.ui.getCore().byId(sTableId);
						if (oTable) {
							oContent.setTable(oTable);
							fResolve();
						}
						break;
					}
				}
				if (!oContent.getTable()) {
					fReject();
				}
			}, 100);
			return oPromise;
		}

		return Promise.resolve();

	};

	ValueHelpDelegate.getFilterConditions = function (oValueHelp, oContent, oConfig) {
		var oPayload = oValueHelp.getPayload();
		var oConditions = {};
		var oControl = (oConfig && oConfig.control) || (oContent && oContent.getControl());

		if (oPayload.in && oControl) {
			var oContext;
			var oCM;
			if (oControl.isA("sap.ui.mdc.FilterField")) {
				oCM = _getConditionModel(oControl);
			} else {
				oContext = oControl && oControl.getBindingContext(); // TODO: how to handle other Models or Contexts?
			}

			for (var i = 0; i < oPayload.in.length; i++) {
				var oIn = oPayload.in[i];
				var oCondition;
				var aConditions = [];
				if (oIn.hasOwnProperty("value")) {
					oCondition = Condition.createCondition("EQ", [oIn.value], undefined, undefined, ConditionValidated.Validated, undefined);
					aConditions.push(oCondition);
				} else if (oIn.hasOwnProperty("source")) {
					if (oIn.source.startsWith("conditions/")) {
						aConditions = merge([], oCM.getConditions(oIn.source.slice(11)));
						_mapInOutToPayload(aConditions, oPayload);
					} else {
						var vValue;
						if (oIn.source.indexOf(">") >= 0) { // different model?
							var sModelName = oIn.source.slice(0, oIn.source.indexOf(">"));
							var oModel = oControl.getModel(sModelName); // hopefully the Control knows the model
							if (oModel) {
								vValue = oModel.getProperty(oIn.source.slice(oIn.source.indexOf(">") + 1));
							}
						} else {
							vValue = oContext.getProperty(oIn.source);
						}
						if (oIn.initialValueFilterEmpty && !vValue) {
							oCondition = Condition.createCondition("Empty", []);
							aConditions.push(oCondition);
						} else if (vValue) { // TODO: also select for empty string?
							oCondition = Condition.createCondition("EQ", [vValue], undefined, undefined, ConditionValidated.Validated, undefined);
							aConditions.push(oCondition);
						}
					}
				}

				if (aConditions.length > 0 && oIn.path) {
					oConditions[oIn.path] = aConditions;
				}
			}
		}

		return oConditions;

	};

	ValueHelpDelegate.onConditionPropagation = function (oValueHelp, sReason, oConfig) {
		var oPayload = oValueHelp.getPayload();
		var oControl = oValueHelp.getControl();

		if (oControl && sReason === "ControlChange" && oPayload.out) {
			var aConditions = oValueHelp.getConditions();
			var oContext;
			var oCM;
			var oModel;
			if (oControl.isA("sap.ui.mdc.FilterField")) {
				oCM = _getConditionModel(oControl);
			} else {
				oContext = oControl && oControl.getBindingContext(); // TODO: how to handle other Models or Contexts?
				oModel = oContext.getModel();
			}

			for (var j = 0; j < oPayload.out.length; j++) {
				var oOut = oPayload.out[j];
				var vNewValue;
				var bUpdate = false;
				if (oOut.hasOwnProperty("fixedValue") && oOut.target) {
					vNewValue = oOut.fixedValue;
					bUpdate = true;
				} else if (oOut.path) {
					for (var i = 0; i < aConditions.length; i++) {
						var oCondition = aConditions[i];
						if (oCondition.payload && oCondition.payload.out) {
							for (var sPath in oCondition.payload.out) {
								if (oOut.path === sPath) {
									if (oOut.target) {
										var vCurrentValue;
										if (oOut.mode && oOut.mode === "WhenEmpty") {
											if (oContext) {
												vCurrentValue = oContext.getProperty(oOut.target);
											} else if (oCM) {
												vCurrentValue = oCM.getConditions(oOut.target.slice(11)).length; // just use count to check
											}
										}
										if (!vCurrentValue) {
											vNewValue = oCondition.payload.out[sPath];
											bUpdate = true;
										}
									}
									break;
								}
							}
						}
						if (oOut.target.startsWith("conditions/") && bUpdate) {
							var oNewCondition = Condition.createCondition("EQ", [vNewValue], undefined, undefined, ConditionValidated.Validated, undefined);
							oCM.addCondition(oOut.target.slice(11), oNewCondition); // will be checked if allready exist inside
						}
					}
				}
				if (bUpdate) {
					if (!oOut.target.startsWith("conditions/")) {
						var oBinding = oModel.bindProperty(oOut.target, oContext); // TODO: better way to update Model?
						oBinding.setValue(vNewValue);
						oBinding.destroy();
					}
				}
			}
		}

	};

	ValueHelpDelegate.createConditionPayload = function (oValueHelp, oContent, aValues, oContext) {
		var oPayload = oValueHelp.getPayload();
		if (oPayload.in || oPayload.out) {
			var oConditionPayload = {};
			var i = 0;

			if (oPayload.in) {
				oConditionPayload.in = {};
				for (i = 0; i < oPayload.in.length; i++) {
					var oIn = oPayload.in[i];
					if (oIn.path) {
						oConditionPayload.in[oIn.path] = oContext.getProperty(oIn.path);
					}
				}
			}
			if (oPayload.out) {
				oConditionPayload.out = {};
				for (i = 0; i < oPayload.out.length; i++) {
					var oOut = oPayload.out[i];
					if (oOut.path) {
						oConditionPayload.out[oOut.path] = oContext.getProperty(oOut.path);
					}
				}
			}

			return oConditionPayload;
		}

		return undefined;
	};

	ValueHelpDelegate.findConditionsForContext = function (oValueHelp, oContent, oContext, aConditions) {
		var oPayload = oValueHelp.getPayload();
		return MDCValueHelpDelegate.findConditionsForContext.apply(this, arguments).filter(function (oCondition) {
			if (oPayload && oPayload.in) {
				var oItemData = oContent.getItemFromContext(oContext);
				var oInConditions = ValueHelpDelegate.getFilterConditions(oValueHelp, oContent, {control: oContent && oContent.getControl()}); // to use if no payload is provided
				if (oCondition.payload && oCondition.payload.in && oItemData.payload && oItemData.payload.in) {
					return deepEqual(oCondition.payload.in, oItemData.payload.in);
				} else if (oItemData.payload && oItemData.payload.in) { // check with global inParameters
					var bSelected = true;
					for (var sIn in oItemData.payload.in) {
						if (oInConditions.hasOwnProperty(sIn)) {
							var bFound = false;
							for (var j = 0; j < oInConditions[sIn].length; j++) {
								var oInCondition = oInConditions[sIn][j];
								if (oInCondition.operator === "EQ" && oInCondition.values[0] === oItemData.payload.in[sIn]) { // TODO: check for other operators than EQ
									// at least one in-condition fit to the item
									// TODO: check payload of there coditions too?
									bFound = true;
									break;
								}
							}
							if (!bFound) {
								// not fit at least one in-parameter
								bSelected = false;
								break;
							}
						}
					}
					return bSelected;
				} else {
					return true;
				}
			}
			return true;
		});
	};

	function _mapInOutToPayload(aConditions, oPayload) {

		for (var j = 0; j < aConditions.length; j++) {
			var oCondition = aConditions[j];
			var k = 0;
			if (oCondition.inParameters || oCondition.outParameters) {
				oCondition.payload = {};
			}
			if (oCondition.inParameters) {
				oCondition.payload.in = {};
				for (var sInParameter in oCondition.inParameters) {
					for (k = 0; k < oPayload.in.length; k++) {
						if (sInParameter === oPayload.in[k].source) {
							oCondition.payload.in[oPayload.in[k].path] = oCondition.inParameters[sInParameter];
							break;
						}
					}
				}
				delete oCondition.inParameters;
			}
			if (oCondition.outParameters) {
				oCondition.payload.out = {};
				for (var sOutParameter in oCondition.outParameters) {
					for (k = 0; k < oPayload.in.length; k++) {
						if (sOutParameter === oPayload.out[k].target) {
							oCondition.payload.out[oPayload.out[k].path] = oCondition.outParameters[sOutParameter];
							break;
						}
					}
				}
				delete oCondition.outParameters;
			}
		}

	}

	function _getConditionModel(oFilterField) {

		var oConditionModel;
		var oBinding = oFilterField.getBinding("conditions");

		if (oBinding) {
			var oModel = oBinding.getModel();
			if (oModel && oModel.isA("sap.ui.mdc.condition.ConditionModel")) {
				oConditionModel = oModel;
			}
		}

		return oConditionModel;

	}

	return ValueHelpDelegate;
});
