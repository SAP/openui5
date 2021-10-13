/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/BaseDelegate'
], function(
	BaseDelegate
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
		return Promise.resolve(oListBinding);
	};

	ValueHelpDelegate.checkBindingsPending = function(oPayload, aBindings) {
		return null;
	};

	ValueHelpDelegate.checkListBindingPending = function(oPayload, oListBinding, oListBindingInfo) {
		return false;
	};

	return ValueHelpDelegate;
});
