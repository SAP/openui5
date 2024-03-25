
sap.ui.define([
	"delegates/ValueHelpDelegate",
	'sap/ui/mdc/odata/TypeMap'
], function(
	TestValueHelpDelegate,
	ODataTypeMap
) {
	"use strict";

	var ValueHelpDelegate = Object.assign({}, TestValueHelpDelegate);

	ValueHelpDelegate.getTypeMap = function (oValueHelp) {
		return ODataTypeMap;
	};

	ValueHelpDelegate.executeFilter = function(oValueHelp, oListBinding, iRequestedItems) {
		if (oListBinding.isA("sap.ui.model.odata.v2.ODataListBinding")) {
			oListBinding.getContexts(0, iRequestedItems); // trigger request. not all entries needed, we only need to know if there is one, none or more
			return new Promise(function (fResolve) {
				oListBinding.attachEventOnce("dataReceived", function () {
					fResolve(oListBinding);
				});
			});
		}
		return TestValueHelpDelegate.executeFilter.apply(this, arguments);
	};

	ValueHelpDelegate.checkListBindingPending = function(oValueHelp, oListBinding, iRequestedItems) {

		if (!oListBinding || oListBinding.isSuspended() || !oListBinding.bPendingRequest) {
			return false;
		}

		var fnResolve;
		var fnCallback = function() {
			fnResolve(oListBinding);
		};

		oListBinding.attachEventOnce("dataReceived", fnCallback);
		return new Promise(function(fResolve, fReject) {
			fnResolve = fResolve;
		});
	};

	ValueHelpDelegate.shouldOpenOnFocus = function (oValueHelp, oContainer) {
		var oPayload = oValueHelp.getPayload();

		if (oPayload?.hasOwnProperty("shouldOpenOnFocus") && oContainer.isA("sap.ui.mdc.valuehelp.Popover")) {
			return oPayload.shouldOpenOnFocus;
		} else {
			return TestValueHelpDelegate.shouldOpenOnFocus.apply(this, arguments);
		}
	};

	ValueHelpDelegate.showTypeahead = function(oValueHelp, oContent) {
		var oPayload = oValueHelp.getPayload();

		if (oPayload?.hasOwnProperty("showWithoutFilter") && oPayload?.showWithoutFilter && !oContent.getFilterValue()) {
			return true; // open if user don't enter any value
		}

		return TestValueHelpDelegate.showTypeahead.apply(this, arguments);
	};

	return ValueHelpDelegate;
});