/*!
 * ${copyright}
 */

sap.ui.define([
	"../../ValueHelpDelegate",
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

	ODataV4ValueHelpDelegate.getTypeMap = function (oPayload) {
		return ODataV4TypeMap;
	};

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

	return ODataV4ValueHelpDelegate;
});