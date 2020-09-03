/*
 * ! ${copyright}
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

	/**
	 * Delegate class for sap.ui.mdc.base.FieldValueHelp.<br>
	 * <h3><b>Note:</b></h3>
	 * The class is experimental and the API/behaviour is not finalized and hence this should not be used for productive usage.
	 *
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.77.0
	 * @alias sap.ui.mdc.odata.v4.FieldValueHelpDelegate
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

	};

	ODataFieldValueHelpDelegate.executeFilter = function(oPayload, oListBinding, oFilter, fnCallback, iRequestedItems) {

		var _bIsFilterExecutionComplete = false;

		var fnHandleListBindingEvent = function (oParameters) {
			if (oParameters.mParameters.detailedReason) { // do not consider virtualcontext events triggered during automatic determination of $expand and $select
				return;
			}

			if (!_bIsFilterExecutionComplete) {
				_bIsFilterExecutionComplete = true;
				oListBinding.detachEvent("change", fnHandleListBindingEvent);
				fnCallback();
			}
		};

		oListBinding.attachEvent("change", fnHandleListBindingEvent); // Note: The change event might not be fired in error scenarios
		oListBinding.attachEventOnce("dataReceived", fnHandleListBindingEvent); // Note: According to an earlier change the dataReceived event may not always be fired in some caching scenarios

		oListBinding.initialize();
		oListBinding.filter(oFilter, FilterType.Application);
		oListBinding.getContexts(0, iRequestedItems); // trigger request. not all entries needed, we only need to know if there is one, none or more

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

	ODataFieldValueHelpDelegate.getTypeUtil = function (oPayload) {
		return TypeUtil;
	};

	return ODataFieldValueHelpDelegate;

});
