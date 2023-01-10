/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"delegates/odata/v4/TypeUtil",
	'sap/base/Log',
	'sap/ui/model/FilterType',
	'sap/base/util/deepEqual'
], function(
	ValueHelpDelegate,
	TypeUtil,
	Log,
	FilterType,
	deepEqual
) {
	"use strict";

	/**
	 * Delegate for {@link sap.ui.mdc.ValueHelp ValueHelp} used in oData v4 environment.<br>
	 * <b>Note:</b> The class is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 *
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @experimental As of version 1.95
	 * @since 1.95.0
	 * @extends module:sap/ui/mdc/ValueHelpDelegate
	 * @alias module:delegates/odata/v4/ValueHelpDelegate
	 */
	var ODataV4ValueHelpDelegate = Object.assign({}, ValueHelpDelegate);

	ODataV4ValueHelpDelegate.isSearchSupported = function(oPayload, oContent, oListBinding) {
		return !!oListBinding.changeParameters;
	};

	ODataV4ValueHelpDelegate.updateBindingInfo = function(oPayload, oContent, oBindingInfo) {
		ValueHelpDelegate.updateBindingInfo(oPayload, oContent, oBindingInfo);

		if (oContent.getFilterFields() === "$search"){
			var oFilterBar = oContent._getPriorityFilterBar();
			var sSearch = oContent.isTypeahead() ? oContent._getPriorityFilterValue() : oFilterBar && oFilterBar.getSearch();
			if (this.adjustSearch) {
				sSearch = this.adjustSearch(oPayload, oContent.isTypeahead(), sSearch);
			}
			oBindingInfo.parameters.$search = sSearch || undefined;
		}
	};

	ODataV4ValueHelpDelegate.updateBinding = function(oPayload, oListBinding, oBindingInfo) {
		var oRootBinding = oListBinding.getRootBinding() || oListBinding;
		if (!oRootBinding.isSuspended()) {
			oRootBinding.suspend();
		}
		oListBinding.changeParameters(oBindingInfo.parameters);
		oListBinding.filter(oBindingInfo.filters, FilterType.Application);

		if (oRootBinding.isSuspended()) {
			oRootBinding.resume();
		}
	};

	ODataV4ValueHelpDelegate.executeFilter = function(oPayload, oListBinding, iRequestedItems) {
		oListBinding.getContexts(0, iRequestedItems);
		return Promise.resolve(this.checkListBindingPending(oPayload, oListBinding, iRequestedItems)).then(function () {
			return oListBinding;
		});
	};

	ODataV4ValueHelpDelegate.checkListBindingPending = function(oPayload, oListBinding, iRequestedItems) {
		if (!oListBinding || oListBinding.isSuspended()) {
			return false;
		}
		return oListBinding.requestContexts(0, iRequestedItems).then(function(aContexts) {
			return aContexts.length === 0;
		});
	};

	ODataV4ValueHelpDelegate.getTypeUtil = function (oPayload) {
		return TypeUtil;
	};

	return ODataV4ValueHelpDelegate;
});