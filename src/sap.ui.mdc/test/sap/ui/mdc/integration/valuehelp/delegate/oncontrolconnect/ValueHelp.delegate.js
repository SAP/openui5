/*!
 * ${copyright}
 */

sap.ui.define([
	"../ValueHelp.delegate",
	'sap/ui/mdc/enums/RequestShowContainerReason',
	"sap/ui/events/KeyCodes",
	"sap/base/Log"
], function(
	BaseValueHelpDelegate,
	RequestShowContainerReason,
	KeyCodes,
	Log
) {
	"use strict";

	const ValueHelpDelegate = Object.assign({}, BaseValueHelpDelegate);

	ValueHelpDelegate.getFirstMatch = function (oValueHelp, oContent, oConfig) {
		try {
			return BaseValueHelpDelegate.getFirstMatch.apply(this, arguments);
		} catch (error) {
			return undefined;
		}
	};

	ValueHelpDelegate.onControlConnect = function (oValueHelp, oControl, oConfig) {
		const sOnControlConnect = oValueHelp.getModel("runtimeState").getData().oncontrolconnect.onControlConnect;

		/*eslint-disable-next-line no-new-func*/
		const fnOnControlConnect = new Function('oValueHelp', 'oControl', 'oConfig', 'BaseValueHelpDelegate', 'Log', `return (${sOnControlConnect})(oValueHelp, oControl, oConfig, BaseValueHelpDelegate, Log);`);
		return fnOnControlConnect ? fnOnControlConnect.apply(this, [oValueHelp, oControl, oConfig, BaseValueHelpDelegate, Log]) : BaseValueHelpDelegate.onControlConnect.apply(this, arguments);
	};


	ValueHelpDelegate.requestShowContainer = function (oValueHelp, oContainer, sRequestShowContainerReason) {
		const sShouldShowContainer = oValueHelp.getModel("runtimeState").getData().oncontrolconnect.requestShowContainer;

		/*eslint-disable-next-line no-new-func*/
		const fnShouldShowContainer = new Function('oValueHelp', 'oContainer', 'sRequestShowContainerReason', 'BaseValueHelpDelegate', 'RequestShowContainerReason', 'KeyCodes', 'Log', `return (${sShouldShowContainer})(oValueHelp, oContainer, sRequestShowContainerReason, BaseValueHelpDelegate, RequestShowContainerReason, KeyCodes, Log);`);
		return fnShouldShowContainer ? fnShouldShowContainer.apply(this, [oValueHelp, oContainer, sRequestShowContainerReason, BaseValueHelpDelegate, RequestShowContainerReason, KeyCodes, Log]) : BaseValueHelpDelegate.requestShowContainer.apply(this, arguments);
	};

	ValueHelpDelegate._onControlConnectDefault = function (oValueHelp, oControl, oConfig) {
		Log.info("ValueHelpDelegate.onControlConnect", `${oValueHelp.getId()} --> ${oControl.getId()}`);

		// Simulate a time critical service request necessary for typeahead opening logic.
		this._myPromiseMap  = this._myPromiseMap || new WeakMap();
		this._myPromiseMap.set(oControl, new Promise((resolve) => {setTimeout(() => resolve(true), 1000);}));
	};

	ValueHelpDelegate._requestShowContainerDefault = async function (oValueHelp, oContainer, sRequestShowContainerReason) {
		Log.info("ValueHelpDelegate.requestShowContainer", `${oValueHelp.getId()} - ${oContainer.getId()} --> ${sRequestShowContainerReason}`);

		// Simulate time critical service request response processing
		const oControl = await oValueHelp.getControl();
		const oConnectPromise = this._myPromiseMap.get(oControl);
		if (oConnectPromise) {
			return await this._myPromiseMap.get(oControl);
		}

		return BaseValueHelpDelegate.requestShowContainer.apply(this, arguments);
	};

	return ValueHelpDelegate;
});
