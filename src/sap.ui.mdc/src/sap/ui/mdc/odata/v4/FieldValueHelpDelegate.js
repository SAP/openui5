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

		var fnHandleChange = function(oParameters) {
			if (oParameters.mParameters.detailedReason) {
				return; // only use the final change event
			}
			oListBinding.detachEvent("change", fnHandleChange);
			fnCallback();
		};

		oListBinding.attachEvent("change", fnHandleChange);
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
