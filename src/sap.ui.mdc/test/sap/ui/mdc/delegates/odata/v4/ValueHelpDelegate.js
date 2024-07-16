/*!
 * ${copyright}
 */

sap.ui.define([
	"../../ValueHelpDelegate",
	'sap/ui/model/FilterType',
	'sap/ui/mdc/odata/v4/TypeMap',
	'../../util/PayloadSearchKeys'

], function(
	ValueHelpDelegate,
	FilterType,
	ODataV4TypeMap,
	PayloadSearchKeys
) {
	"use strict";

	/**
	 * Delegate for {@link sap.ui.mdc.ValueHelp ValueHelp} used in oData v4 environment.<br>
	 *
	 * @namespace
	 * @author SAP SE
	 * @public
	 * @since 1.95.0
	 * @extends module:delegates/ValueHelpDelegate
	 * @alias module:delegates/odata/v4/ValueHelpDelegate
	 */
	var ODataV4ValueHelpDelegate = Object.assign({}, ValueHelpDelegate);

	ODataV4ValueHelpDelegate.getTypeMap = function (oValueHelp) {
		return ODataV4TypeMap;
	};

	ODataV4ValueHelpDelegate.isSearchSupported = function(oValueHelp, oContent, oListBinding) {
		if (PayloadSearchKeys.inUse(oValueHelp)) {
			return PayloadSearchKeys.isEnabled(oValueHelp, oContent);
		} else if (oListBinding) {
			return !!oListBinding.changeParameters;
		} else {
			return true; // We are optimistic as long as no binding is available, as mdc.Table only creates it's binding on rendering w. autoBindOnInit=false.
		}
	};

	ODataV4ValueHelpDelegate.updateBindingInfo = function(oValueHelp, oContent, oBindingInfo) {
		ValueHelpDelegate.updateBindingInfo(oValueHelp, oContent, oBindingInfo);

		if (!PayloadSearchKeys.inUse(oValueHelp) && oContent.isSearchSupported()){
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

	ODataV4ValueHelpDelegate.isFilteringCaseSensitive = function(oValueHelp, oContent) {

		if (oContent.isA("sap.ui.mdc.valuehelp.base.FilterableListContent")) {
			const sFilterFields = "";

			if (sFilterFields === "$search") {
				return false; // for $search irgnore setting of caseSensitive
			}
		}

		return ValueHelpDelegate.isFilteringCaseSensitive.apply(this, arguments);

	};

	return ODataV4ValueHelpDelegate;
});