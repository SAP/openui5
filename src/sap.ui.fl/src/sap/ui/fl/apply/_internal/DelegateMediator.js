/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/util/restricted/_pick",
	"sap/ui/fl/requireAsync"
], function(
	Log,
	_pick,
	requireAsync
) {
	"use strict";

	/**
	 * Delegator mediator to manage default delegators.
	 *
	 * @alias sap.ui.fl.apply._internal.DelegateMediator
	 *
	 * @private
	 * @author SAP SE
	 * @version ${version}
	 *
	 */
	const DelegateMediator = {};

	let mModelSpecificDelegateItems = {};
	let mControlSpecificDelegateItems = {};

	function getModelTypeForControl(oControl) {
		const oModel = oControl.getModel?.();
		if (!oModel) {
			return undefined;
		}
		return oModel.getMetadata().getName();
	}

	function getModelSpecificDelegateInfo(oControl, sModelType) {
		sModelType ||= getModelTypeForControl(oControl);
		const mDelegateInfo = mModelSpecificDelegateItems[sModelType];
		return mDelegateInfo;
	}

	async function getControlSpecificDelegateInfo(oControl, oModifier) {
		const oControlMetadata = await oModifier.getControlMetadata(oControl);
		const mDelegateInfo = mControlSpecificDelegateItems[oControlMetadata.getName()];
		return mDelegateInfo;
	}

	function requireDelegatesAsync(oControl, oModifier, mDelegateInfo) {
		return requireAsync(mDelegateInfo.name)
		.catch((oError) => {
			Log.error(`Failed to load the delegate for the control ${oModifier.getId(oControl)}
			${oError.message}`);
			return undefined;
		});
	}

	function loadDelegates(oControl, oModifier, aDelegates) {
		const aPromises = [];
		aDelegates.forEach(function(mDelegateInfo) {
			if (mDelegateInfo) {
				aPromises.push(
					async function() {
						const oDelegate = await requireDelegatesAsync(oControl, oModifier, mDelegateInfo);
						if (oDelegate) {
							mDelegateInfo.instance = oDelegate || {};
							return mDelegateInfo;
						}
						return undefined;
					}()
				);
			} else {
				aPromises.push(Promise.resolve());
			}
		});
		return Promise.all(aPromises);
	}

	/**
	 * Register model specific read delegate by the model type.
	 *
	 * @param {object} mPropertyBag - Property bag for read delegate
	 * @param {object} mPropertyBag.modelType - Read delegate model type
	 * @param {object} mPropertyBag.delegate - Path to read delegate
	 */
	DelegateMediator.registerReadDelegate = function(mPropertyBag) {
		if (!(mPropertyBag.modelType && mPropertyBag.delegate)) {
			throw new Error("'modelType' and 'delegate' properties are required for registration!");
		}
		// No overriding of read delegates possible
		// TODO: enable check for overriding of read delegates in the following change, when the sapui5.runtime change-4 is merged
		// if (mModelSpecificDelegateItems[mPropertyBag.modelType]) {
		// 	throw new Error(`modelType ${mPropertyBag.modelType} is already defined!`);
		// }
		mModelSpecificDelegateItems[mPropertyBag.modelType] = {
			name: mPropertyBag.delegate,
			modelType: mPropertyBag.modelType
		};
	};

	/**
	 * Registers a control specific write delegate by control type.
	 *
	 * @param {object} mPropertyBag - Property bag for control specific delegate
	 * @param {object} mPropertyBag.controlType - Control type
	 * @param {object} mPropertyBag.delegate - path to control specific delegate
	 * @param {object} [mPropertyBag.requiredLibraries] - Map of required libraries
	 * @param {object} [mPropertyBag.payload] - Payload for the delegate
	 */
	DelegateMediator.registerWriteDelegate = function(mPropertyBag) {
		if (!(mPropertyBag.controlType && mPropertyBag.delegate)) {
			throw new Error("'controlType' and 'delegate' properties are required for registration!");
		}
		mControlSpecificDelegateItems[mPropertyBag.controlType] = {
			name: mPropertyBag.delegate,
			requiredLibraries: mPropertyBag.requiredLibraries,
			delegateType: mPropertyBag.delegateType,
			controlType: mPropertyBag.controlType,
			payload: mPropertyBag.payload
		};
	};

	function finalizeReadDelegateInfo(mDelegateInfo) {
		return mDelegateInfo
			? {
				...mDelegateInfo,
				modelType: mDelegateInfo.modelType || mDelegateInfo.payload?.modelType,
				instance: _pick(mDelegateInfo.instance, ["getPropertyInfo", "getRepresentedProperties"])
			}
			: undefined;
	}

	/**
	 * Returns the model specific read delegate for the requested control.
	 * The instancespcific read delegate is returned if available.
	 *
	 * @param {sap.ui.core.Element} oControl - Control for which the corresponding delegate should be returned
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} oModifier - Control tree modifier
	 * @param {string} [sModelType] - Model type; required in case you passed the <code>XmlTreeModifier</code>
	 * @returns {Promise.<sap.ui.core.util.reflection.FlexDelegateInfo>} Delegate information including the lazy loaded instance of the delegate
	 */
	DelegateMediator.getReadDelegateForControl = async function(oControl, oModifier, sModelType) {
		let mModelSpecificDelegateInfo = getModelSpecificDelegateInfo(oControl, sModelType);
		let mInstanceSpecificDelegateInfo = oModifier.getFlexDelegate(oControl);
		[mInstanceSpecificDelegateInfo, mModelSpecificDelegateInfo] = await loadDelegates(oControl, oModifier, [
			mInstanceSpecificDelegateInfo,
			mModelSpecificDelegateInfo
		]);
		return mInstanceSpecificDelegateInfo?.instance.getPropertyInfo
			? finalizeReadDelegateInfo(mInstanceSpecificDelegateInfo)
			: finalizeReadDelegateInfo(mModelSpecificDelegateInfo);
	};

	function finalizeWriteDelegateInfo(mDelegateInfo, oControl) {
		return mDelegateInfo
			? {
				...mDelegateInfo,
				controlType: mDelegateInfo.controlType || oControl.getMetadata?.().getName(),
				instance: _pick(mDelegateInfo.instance, ["createLabel", "createControlForProperty", "createLayout"])
			}
			: undefined;
	}

	/**
	 * Returns the write delegate for the requested control.
	 * The instancespecific write delegate is returned if available.
	 *
	 * @param {sap.ui.core.Element} oControl - Control for which the corresponding delegate should be returned
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} oModifier - Control tree modifier
	 * @returns {Promise.<sap.ui.core.util.reflection.FlexDelegateInfo>} Delegate information including the lazy loaded instance of the delegate. Undefined if delegate could'n be loaded.
	 */
	DelegateMediator.getWriteDelegateForControl = async function(oControl, oModifier) {
		let mControlSpecificDelegateInfo = await getControlSpecificDelegateInfo(oControl, oModifier);
		let mInstanceSpecificDelegateInfo = oModifier.getFlexDelegate(oControl);
		[mInstanceSpecificDelegateInfo, mControlSpecificDelegateInfo] = await loadDelegates(oControl, oModifier, [
			mInstanceSpecificDelegateInfo,
			mControlSpecificDelegateInfo
		]);
		return (mInstanceSpecificDelegateInfo?.instance.createLabel
			|| mInstanceSpecificDelegateInfo?.instance.createLayout)
			? finalizeWriteDelegateInfo(mInstanceSpecificDelegateInfo, oControl)
			: finalizeWriteDelegateInfo(mControlSpecificDelegateInfo, oControl);
	};

	/**
	 * Clears the model and control specific delegate items.
	 * This method is used for testing purposes.
	 */
	DelegateMediator.clear = function() {
		mModelSpecificDelegateItems = {};
		mControlSpecificDelegateItems = {};
	};

	return DelegateMediator;
});
