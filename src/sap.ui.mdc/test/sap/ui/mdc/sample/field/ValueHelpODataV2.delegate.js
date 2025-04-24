
sap.ui.define([
	"delegates/ValueHelpDelegate",
	"sap/ui/mdc/odata/TypeMap",
	"sap/ui/mdc/util/IdentifierUtil"
], function(
	TestValueHelpDelegate,
	ODataTypeMap,
	IdentifierUtil
) {
	"use strict";

	var ValueHelpDelegate = Object.assign({}, TestValueHelpDelegate);

	ValueHelpDelegate.getTypeMap = function (oValueHelp) {
		return ODataTypeMap;
	};

	ValueHelpDelegate.executeFilter = function(oValueHelp, oListBinding, iRequestedItems) {
		if (oListBinding.isA("sap.ui.model.odata.v2.ODataListBinding")) {
			oListBinding.getContexts(0, iRequestedItems); // trigger request. not all entries needed, we only need to know if there is one, none or more
			return new Promise(function (fResolve) {
				oListBinding.attachEventOnce("dataReceived", function () {
					fResolve(oListBinding);
				});
			});
		}
		return TestValueHelpDelegate.executeFilter.apply(this, arguments);
	};

	ValueHelpDelegate.checkListBindingPending = function(oValueHelp, oListBinding, iRequestedItems) {

		if (!oListBinding || oListBinding.isSuspended() || !oListBinding.bPendingRequest) {
			return false;
		}

		var fnResolve;
		var fnCallback = function() {
			fnResolve(oListBinding);
		};

		oListBinding.attachEventOnce("dataReceived", fnCallback);
		return new Promise(function(fResolve, fReject) {
			fnResolve = fResolve;
		});
	};

	ValueHelpDelegate.requestShowContainer = async function (oValueHelp, oShouldShowTypeaheadSettings) {
		var oPayload = oValueHelp.getPayload();
		if (oPayload) {
			const {event} = oShouldShowTypeaheadSettings || {};
			const oTypeahead = oValueHelp.getTypeahead();
			const bContainerValid = oTypeahead.isA("sap.ui.mdc.valuehelp.Popover");
			const sEventType = event?.getId?.() || event?.originalEvent?.type || event?.type;
			const {shouldOpenOnFocus, shouldOpenOnClick} = oPayload;
			if (sEventType === "focusin" && bContainerValid && shouldOpenOnFocus) {
				return shouldOpenOnFocus;
			}

			if (sEventType === "click" && bContainerValid && shouldOpenOnClick) {
				return shouldOpenOnClick;
			}
		}

		return await TestValueHelpDelegate.requestShowContainer.apply(this, arguments);
	};

	ValueHelpDelegate.showTypeahead = function(oValueHelp, oContent) {
		var oPayload = oValueHelp.getPayload();

		if (oPayload?.hasOwnProperty("showWithoutFilter") && oPayload?.showWithoutFilter && !oContent.getFilterValue()) {
			return true; // open if user don't enter any value
		}

		return TestValueHelpDelegate.showTypeahead.apply(this, arguments);
	};

	ValueHelpDelegate.isSearchSupported = function(oValueHelp, oContent, oListBinding) {
		var oPayload = oValueHelp.getPayload();

		if (oPayload.searchEnabledCheck) {
			const oView = IdentifierUtil.getView(oValueHelp);
			const oCheckBox = oView.byId(oPayload.searchEnabledCheck);
			if (!oCheckBox.getSelected()) {
				return false;
			}
		}

		return TestValueHelpDelegate.isSearchSupported.apply(this, arguments);
	};


	return ValueHelpDelegate;
});