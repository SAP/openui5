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

	/**
	 * Delegate for {@link sap.ui.mdc.ValueHelp ValueHelp} used in oData v4 environment.<br>
	 * <b>Note:</b> The class is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 *
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.fe
	 * @experimental As of version 1.95
	 * @since 1.95.0
	 * @extends module:sap/ui/mdc/ValueHelpDelegate
	 * @alias module:sap/ui/mdc/odata/v4/ValueHelpDelegate
	 * @deprecated This module should not be used and will be removed in future versions!
	 */
	const ODataV4ValueHelpDelegate = Object.assign({}, ValueHelpDelegate);

	ODataV4ValueHelpDelegate.getTypeMap = function (oPayload) {
		return ODataV4TypeMap;
	};

	ODataV4ValueHelpDelegate.isSearchSupported = function(oValueHelp, oContent, oListBinding) {

		/**
		 *  @deprecated since 1.120.2
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
		 *  @deprecated since 1.120.2
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