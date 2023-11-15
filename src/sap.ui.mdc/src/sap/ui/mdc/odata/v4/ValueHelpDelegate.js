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

	ODataV4ValueHelpDelegate.isSearchSupported = function(oValueHelp, oContent, oListBinding) {

		/**
		 *  @deprecated since 1.121.0
		 */
		if (!oContent.isPropertyInitial("filterFields")) {
			const sFilterFields = oContent.getFilterFields();
			return sFilterFields === "$search" ? !!oListBinding?.changeParameters : !!sFilterFields;
		}

		return oListBinding ? !!oListBinding.changeParameters : true; // We are optimistic in case no binding is available
	};

	ODataV4ValueHelpDelegate.updateBindingInfo = function(oValueHelp, oContent, oBindingInfo) {
		ValueHelpDelegate.updateBindingInfo(oValueHelp, oContent, oBindingInfo);

		/**
		 *  @deprecated since 1.121.0
		 */
		if (!oContent.isPropertyInitial("filterFields")) {
			const sFilterFields = oContent.getFilterFields();
			if (sFilterFields && sFilterFields !== "$search") {
				return;
			}
		}

		if (oContent.isSearchSupported()){
			const sSearch = this.adjustSearch ? this.adjustSearch(oValueHelp, oContent.isTypeahead(), oContent.getSearch()) : oContent.getSearch();
			oBindingInfo.parameters.$search = sSearch || undefined;
		}
	};

	ODataV4ValueHelpDelegate.updateBinding = function(oValueHelp, oListBinding, oBindingInfo) {
		const oRootBinding = oListBinding.getRootBinding() || oListBinding;
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
		oListBinding.getContexts(0, iRequestedItems);
		return Promise.resolve(this.checkListBindingPending(oValueHelp, oListBinding, iRequestedItems)).then(function () {
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