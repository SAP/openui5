/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/BaseDelegate",
	"sap/ui/model/FilterType"
], function(
	BaseDelegate,
	FilterType
) {
	"use strict";

	var ValueHelpDelegate = Object.assign({}, BaseDelegate);

	ValueHelpDelegate.retrieveContent = function (oPayload, oContainer) {
		return Promise.resolve();
	};

	ValueHelpDelegate.isSearchSupported = function(oPayload, oListBinding) {
		return false;
	};

	ValueHelpDelegate.executeSearch = function(oPayload, oListBinding, sSearch) {
		return Promise.resolve();
	};

	ValueHelpDelegate.executeFilter = function(oPayload, oListBinding, oFilter, iRequestedItems) {

		if (oListBinding.isA("sap.ui.model.json.JSONListBinding")) { // TODO: find way unique for all ListBindings
			oListBinding.filter(oFilter, FilterType.Application);
			return Promise.resolve(oListBinding);
		} else { // oData V2
			var fnResolve;
			var fnCallback = function() {
				fnResolve(oListBinding);
			};
			oListBinding.attachEventOnce("dataReceived", fnCallback);
			oListBinding.initialize();
			oListBinding.filter(oFilter, FilterType.Application);
			oListBinding.getContexts(0, iRequestedItems); // trigger request. not all entries needed, we only need to know if there is one, none or more
			return new Promise(function(fResolve, fReject) {
				fnResolve = fResolve;
			});
		}

	};

	ValueHelpDelegate.checkBindingsPending = function(oPayload, aBindings) {
		return null;
	};

	/**
	 * Checks if the <code>ListBinding</code> is waiting for an update.
	 * As long as the context has not been set for <code>ListBinding</code>,
	 * <code>FieldValueHelp</code> needs to wait.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.model.ListBinding} oListBinding <code>ListBinding</code> to check
	 * @param {object} oListBindingInfo <code>ListBindingInfo</code> to check
	 * @returns {boolean|Promise<boolean>} <code>Promise</code> that is resolved once <code>ListBinding</code> has been updated
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	 ValueHelpDelegate.checkListBindingPending = function(oPayload, oListBinding, oListBindingInfo) {
		return false;
	};

	return ValueHelpDelegate;
});
