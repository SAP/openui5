/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	'sap/base/Log',
	'sap/ui/model/FilterType',
	'sap/base/util/deepEqual',
	'sap/ui/mdc/odata/v4/TypeMap'

], function(
	ValueHelpDelegate,
	Log,
	FilterType,
	deepEqual,
	ODataV4TypeMap
) {
	"use strict";

	/**
	 * Delegate for {@link sap.ui.mdc.ValueHelp ValueHelp} used in oData v4 environment.<br>
	 * <b>Note:</b> The class is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 *
	 * @namespace
	 * @author SAP SE
	 * @public
	 * @since 1.95.0
	 * @extends module:sap/ui/mdc/ValueHelpDelegate
	 * @alias module:delegates/odata/v4/ValueHelpDelegate
	 */
	var ODataV4ValueHelpDelegate = Object.assign({}, ValueHelpDelegate);

	ODataV4ValueHelpDelegate.getTypeMap = function (oValueHelp) {
		return ODataV4TypeMap;
	};

	ODataV4ValueHelpDelegate.isSearchSupported = function(oValueHelp, oContent, oListBinding) {
		return !!oListBinding.changeParameters;
	};

	ODataV4ValueHelpDelegate.updateBindingInfo = function(oValueHelp, oContent, oBindingInfo) {
		var oPayload;
		if (oValueHelp) {
			oPayload = oValueHelp.getPayload();
		}
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

	ODataV4ValueHelpDelegate.updateBinding = function(oValueHelp, oListBinding, oBindingInfo) {
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

	ODataV4ValueHelpDelegate.executeFilter = function(oValueHelp, oListBinding, iRequestedItems) {
		var oPayload;
		if (oValueHelp) {
			oPayload = oValueHelp.getPayload();
		}
		oListBinding.getContexts(0, iRequestedItems);
		return Promise.resolve(this.checkListBindingPending(oPayload, oListBinding, iRequestedItems)).then(function () {
			return oListBinding;
		});
	};

	ODataV4ValueHelpDelegate.checkListBindingPending = function(oValueHelp, oListBinding, iRequestedItems) {
		if (!oListBinding || oListBinding.isSuspended()) {
			return false;
		}
		return oListBinding.requestContexts(0, iRequestedItems).then(function(aContexts) {
			return aContexts.length === 0;
		});
	};

	return ODataV4ValueHelpDelegate;
});