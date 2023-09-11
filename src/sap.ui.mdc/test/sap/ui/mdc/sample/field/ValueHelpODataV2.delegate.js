
sap.ui.define([
    "sap/ui/mdc/ValueHelpDelegate",
    'sap/ui/mdc/odata/TypeMap'
], function(
    MDCValueHelpDelegate,
    ODataTypeMap
) {
    "use strict";

    var ValueHelpDelegate = Object.assign({}, MDCValueHelpDelegate);

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
		return MDCValueHelpDelegate.executeFilter.apply(this, arguments);
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

	return ValueHelpDelegate;
});