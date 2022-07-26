/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to execute model specific logic in FieldValueHelp
// ---------------------------------------------------------------------------------------

sap.ui.define([
	'sap/ui/mdc/field/FieldValueHelpDelegate',
	'sap/ui/model/FilterType',
	'sap/ui/mdc/odata/v4/TypeUtil'
], function(
		FieldValueHelpDelegate,
		FilterType,
		TypeUtil
) {
	"use strict";

	var _waitForBindingData = function (oBinding) {
		return new Promise(function (resolve) {
			var _bIsExecutionComplete = false;
			var fnHandleBindingEvent = function (oParameters) {
				if (oParameters.mParameters.detailedReason) { // do not consider virtualcontext events triggered during automatic determination of $expand and $select
					return;
				}

				if (!_bIsExecutionComplete) {
					_bIsExecutionComplete = true;
					oBinding.detachEvent("change", fnHandleBindingEvent);
					resolve(oParameters);
				}
			};
			oBinding.attachEvent("change", fnHandleBindingEvent); // Note: According to an earlier change the change event may not always be fired in some scenarios
			oBinding.attachEventOnce("dataReceived", fnHandleBindingEvent); // Note: According to an earlier change the dataReceived event may not always be fired in some caching scenarios
		});
	};

	/**
	 * @class Delegate class for sap.ui.mdc.field.FieldValueHelp.<br>
	 * <h3><b>Note:</b></h3>
	 * The class is experimental and the API/behaviour is not finalized and hence this should not be used for productive usage.
	 *
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @experimental As of version 1.77
	 * @since 1.77.0
	 * @alias sap.ui.mdc.odata.v4.FieldValueHelpDelegate
	 * @deprecated This module should not be used and will be removed in future versions!
	 */
	var ODataFieldValueHelpDelegate = Object.assign({}, FieldValueHelpDelegate);

	ODataFieldValueHelpDelegate.isSearchSupported = function(oPayload, oListBinding) {

		return !!oListBinding.changeParameters;

	};

	ODataFieldValueHelpDelegate.executeSearch = function(oPayload, oListBinding, sSearch) {

		if (sSearch) {
			oListBinding.changeParameters({ $search: sSearch });
		} else {
			oListBinding.changeParameters({ $search: undefined });
		}

		return _waitForBindingData(oListBinding);

	};

	ODataFieldValueHelpDelegate.executeFilter = function(oPayload, oListBinding, oFilter, fnCallback, iRequestedItems) {

		var oBindingChangePromise = _waitForBindingData(oListBinding).then(function name(params) {
			fnCallback();
		});

		oListBinding.initialize();
		oListBinding.filter(oFilter, FilterType.Application);
		oListBinding.getContexts(0, iRequestedItems); // trigger request. not all entries needed, we only need to know if there is one, none or more

		return oBindingChangePromise;
	};

	ODataFieldValueHelpDelegate.checkBindingsPending = function(oPayload, aBindings) {

		var aPromises = [];

		for (var i = 0; i < aBindings.length; i++) {
			var oBinding = aBindings[i];
			if (oBinding && oBinding.requestValue) {
				aPromises.push(oBinding.requestValue());
			}
		}

		if (aPromises.length > 0) {
			return Promise.all(aPromises);
		}

		return null;

	};

	ODataFieldValueHelpDelegate.checkListBindingPending = function(oPayload, oListBinding, oListBindingInfo) {

		if (!oListBinding || oListBinding.isSuspended()) {
			return false;
		}

		return oListBinding.requestContexts(0, oListBindingInfo && oListBindingInfo.length).then(function(aContexts){
			return aContexts.length > 0;
		});

	};

	ODataFieldValueHelpDelegate.getTypeUtil = function (oPayload) {
		return TypeUtil;
	};

	return ODataFieldValueHelpDelegate;

});
