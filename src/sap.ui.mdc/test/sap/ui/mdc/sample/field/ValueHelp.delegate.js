/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enum/ConditionValidated",
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

	ValueHelpDelegate.retrieveContent = function(oPayload, oContainer, sContentId) {

		var oContent = sContentId ? sap.ui.getCore().byId(sContentId) : oContainer.getContent()[0];
		sContentId = oContent && oContent.getId();

		if (!oContent.getTable()) {
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

	ValueHelpDelegate.getInitialFilterConditions = function (oPayload, oContent, oControl) {

		var oConditions = {};

		if (oPayload.in) {
			var oContext;
			var oCM;
			if (oControl.isA("sap.ui.mdc.FilterField")) {
				var oConfig = oControl._getFormatOptions(); // TODO: better API?
				oCM = oConfig.conditionModel;
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

	ValueHelpDelegate.onConditionPropagation = function (oPayload, oValueHelp, sReason, oConfig) {

		var oControl = oValueHelp.getControl();

		if (oControl && sReason === "ControlChange" && oPayload.out) {
			var aConditions = oValueHelp.getConditions();
			var oContext;
			var oCM;
			var oModel;
			if (oControl.isA("sap.ui.mdc.FilterField")) {
				oCM = oConfig.conditionModel;
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

	ValueHelpDelegate.createConditionPayload = function (oPayload, oContent, aValues, oContext) {

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

	ValueHelpDelegate.isFilterableListItemSelected = function (oPayload, oContent, oItem, aConditions) {

		if (oPayload.in) {
			var sModelName = oContent._getListBindingInfo().model;
			var oContext = oItem && oItem.getBindingContext(sModelName);
			var oItemData = oContent._getItemFromContext(oContext);
			var oInConditions = this.getInitialFilterConditions(oPayload, oContent, oContent._getControl()); // to use if no payload is provided
			aConditions = merge([], aConditions);
			_mapInOutToPayload(aConditions, oPayload);

			for (var i = 0; i < aConditions.length; i++) {
				var oCondition = aConditions[i];
				if (oCondition.validated === ConditionValidated.Validated && oItemData.key === oCondition.values[0]) { // TODO: check for specific EQ operator
					if (oCondition.payload && oCondition.payload.in && oItemData.payload && oItemData.payload.in) {
						if (deepEqual(oCondition.payload.in, oItemData.payload.in)) {
							return true;
						}
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
			}
		} else {
			return MDCValueHelpDelegate.isFilterableListItemSelected.apply(this, arguments);
		}

		return false;

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

	return ValueHelpDelegate;
});
