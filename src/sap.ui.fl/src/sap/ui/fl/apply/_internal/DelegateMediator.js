/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/util/merge",
	"sap/base/util/restricted/_pick",
	"sap/ui/fl/requireAsync",
	"sap/ui/core/util/reflection/JsControlTreeModifier"
], function(
	Log,
	merge,
	_pick,
	requireAsync,
	JsControlTreeModifier
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

	DelegateMediator._mDefaultDelegateItems = {};
	DelegateMediator._mControlSpecificDelegateItems = {};
	DelegateMediator.types = {
		READONLY: "readonly",
		WRITEONLY: "writeonly",
		COMPLETE: "complete"
	};

	function getModelTypeForControl(oControl, sModelType) {
		if (sModelType) {
			return sModelType;
		}
		if (oControl.getModel) {
			// get the default model
			const oModel = oControl.getModel();
			if (!oModel) {
				return undefined;
			}
			return oModel.getMetadata().getName();
		}
		return undefined;
	}

	function getDefaultDelegateInfo(oControl, sModelType) {
		sModelType = getModelTypeForControl(oControl, sModelType);
		const aDelegateInfo = DelegateMediator._mDefaultDelegateItems[sModelType];
		return (aDelegateInfo || []).map(function(mDelegateInfo) {
			mDelegateInfo.payload = {};
			return mDelegateInfo;
		});
	}

	async function getControlSpecificDelegateInfo(oModifier, oControl) {
		const oControlMetadata = await oModifier.getControlMetadata(oControl);
		const mDelegateInfo = DelegateMediator._mControlSpecificDelegateItems[oControlMetadata.getName()];
		if (mDelegateInfo) {
			mDelegateInfo.payload ||= {};
		}
		return mDelegateInfo;
	}

	async function requireDelegatesAsync(oModifier, oControl, mDelegateInfo, aLoadedDelegates) {
		try {
			const oDelegate = await requireAsync(mDelegateInfo.name);
			mDelegateInfo.instance = oDelegate || {};
			aLoadedDelegates.push(mDelegateInfo);
			return aLoadedDelegates;
		} catch (oError) {
			Log.error(`Failed to load the delegate for the control ${oModifier.getId(oControl)}
			${oError.message}`);
			return aLoadedDelegates;
		}
	}

	function loadDelegates(oModifier, oControl, aDelegates) {
		if (!aDelegates.length) {
			return Promise.resolve([]);
		}
		const aPromises = [];
		aDelegates.forEach(function(mDelegateInfo) {
			aPromises.push(function(aLoadedDelegates) {
				return requireDelegatesAsync(oModifier, oControl, mDelegateInfo, aLoadedDelegates);
			});
		});
		return aPromises.reduce(function(oPreviousPromise, oCurrentPromise) {
			return oPreviousPromise.then(oCurrentPromise);
		}, Promise.resolve([]));
	}

	function isFunction(fn) {
		return fn && typeof fn === "function";
	}

	function isCompleteDelegate(mDelegateInfo) {
		return mDelegateInfo.delegateType === DelegateMediator.types.COMPLETE
			|| (
				isFunction(mDelegateInfo.instance.getPropertyInfo)
				&& (isFunction(mDelegateInfo.instance.createLabel) || isFunction(mDelegateInfo.instance.createLayout))
			);
	}

	function isReadOnlyDelegate(mDelegateInfo) {
		return mDelegateInfo.delegateType === DelegateMediator.types.READONLY
			|| isFunction(mDelegateInfo.instance.getPropertyInfo);
	}

	function isWriteOnlyDelegate(mDelegateInfo) {
		return mDelegateInfo.delegateType === DelegateMediator.types.WRITEONLY
			|| isFunction(mDelegateInfo.instance.createLabel)
			|| isFunction(mDelegateInfo.instance.createLayout);
	}

	function assignCommonPart(mTargetDelegateInfo, mDelegateInfo) {
		mTargetDelegateInfo.names.push(mDelegateInfo.name);
		if (mDelegateInfo.requiredLibraries) {
			mTargetDelegateInfo.requiredLibraries =	Object.assign(
				mTargetDelegateInfo.requiredLibraries || {}, mDelegateInfo.requiredLibraries
			);
		}
		if (mDelegateInfo.payload && !mTargetDelegateInfo.payload) {
			// is available maximum once for instancespecific delegate
			mTargetDelegateInfo.payload = mDelegateInfo.payload;
		}
		if (mDelegateInfo.delegateType) {
			mTargetDelegateInfo.delegateType = mDelegateInfo.delegateType;
		}
		return mTargetDelegateInfo;
	}

	function assignReadPart(mTargetDelegateInfo, mDelegateInfo) {
		mTargetDelegateInfo = assignCommonPart(mTargetDelegateInfo, mDelegateInfo);
		return merge(mTargetDelegateInfo, { instance: _pick(
			mDelegateInfo.instance, ["getPropertyInfo", "getRepresentedProperties"]
		) });
	}

	function assignWritePart(mTargetDelegateInfo, mDelegateInfo) {
		mTargetDelegateInfo = assignCommonPart(mTargetDelegateInfo, mDelegateInfo);
		return merge(mTargetDelegateInfo, { instance: _pick(
			mDelegateInfo.instance,	["createLabel", "createControlForProperty", "createLayout"]
		) });
	}

	function assignCompleteDelegate(mTargetDelegateInfo, mDelegateInfo) {
		mTargetDelegateInfo = assignCommonPart(mTargetDelegateInfo, mDelegateInfo);
		return merge(mTargetDelegateInfo, _pick(mDelegateInfo, "instance"));
	}

	function mergeDelegates(aDelegates) {
		// check from in reverted order whether the read and or the write part is available
		// build a new object that consists of the read and the write part probably of more than one delegate
		 let mResultDelegateInfo = {
			names: [],
			instance: {},
			modelType: aDelegates.length && aDelegates[0].modelType
		};
		let bReadPartMissing = true;
		let bWritePartMissing = true;
		for (let i = (aDelegates.length - 1); i >= 0; i--) {
			const mDelegateInfo = aDelegates[i];
			if (isCompleteDelegate(mDelegateInfo)) {
				if (bReadPartMissing && bWritePartMissing) {
					mResultDelegateInfo = assignCompleteDelegate(mResultDelegateInfo, mDelegateInfo);
				} else if (bReadPartMissing) {
					mResultDelegateInfo = assignReadPart(mResultDelegateInfo, mDelegateInfo);
				} else if (bWritePartMissing) {
					mResultDelegateInfo = assignWritePart(mResultDelegateInfo, mDelegateInfo);
				}
				break;
			} else if (isReadOnlyDelegate(mDelegateInfo) && bReadPartMissing) {
				mResultDelegateInfo = assignReadPart(mResultDelegateInfo, mDelegateInfo);
				bReadPartMissing = false;
			} else if (isWriteOnlyDelegate(mDelegateInfo) && bWritePartMissing) {
				mResultDelegateInfo = assignWritePart(mResultDelegateInfo, mDelegateInfo);
				bWritePartMissing = false;
			}
		}
		return aDelegates.length ? mResultDelegateInfo : undefined;
	}

	function validateInputParameters(oControl, oModifier) {
		return new Promise(function(resolve, reject) {
			if (!oControl) {
				reject(new Error("The control parameter is missing"));
			}
			if (!oModifier) {
				reject(new Error("The modifier parameter is missing"));
			}
			if (!oControl) {
				reject(new Error("The input control should be available"));
			}
			if (
				oModifier === JsControlTreeModifier
				&& (!oControl.isA || !oControl.isA("sap.ui.base.ManagedObject"))
			) {
				reject(new Error("The input control should be a managed object"));
			}
			resolve();
		});
	}

	function isValidType(mPropertyBag) {
		return Object.values(DelegateMediator.types).some(function(sDelegateMediatorType) {
			return sDelegateMediatorType === mPropertyBag.delegateType;
		});
	}

	function isCompetingDelegateAlreadyRegistered(mPropertyBag) {
		const aDefaultDelegates = DelegateMediator._mDefaultDelegateItems[mPropertyBag.modelType] || [];
		const aDefaultDelegateTypes = aDefaultDelegates.map(function(mDefaultDelegateInfo) {
			return mDefaultDelegateInfo.delegateType;
		});
		return aDefaultDelegateTypes.indexOf(DelegateMediator.types.COMPLETE) > -1
			|| aDefaultDelegateTypes.indexOf(mPropertyBag.delegateType) > -1
			|| (mPropertyBag.delegateType === DelegateMediator.types.COMPLETE && aDefaultDelegateTypes.length);
	}

	DelegateMediator.getKnownDefaultDelegateLibraries = function() {
		return ["sap.ui.comp"]; // OdataV2Delegate is defined in sap.ui.comp
	};

	/**
	 * Returns a list of required libraries for the given default delegate.
	 * If it is not a default delegate, an empty list is returned.
	 *
	 * @param {string} aDelegateNames - List of delegate names
	 * @param {sap.ui.core.Element} oControl - Control for which the corresponding delegate was returned
	 * @param {string} [sModelType] - Model type, if none is provided the default model of oControl is taken instead
	 * @returns {string[]} Required libraries
	 */
	DelegateMediator.getRequiredLibrariesForDefaultDelegate = function(aDelegateNames, oControl, sModelType) {
		sModelType = getModelTypeForControl(oControl, sModelType);
		const aDelegateInfo = DelegateMediator._mDefaultDelegateItems[sModelType] || [];
		return aDelegateInfo.reduce(function(aRequiredLibNames, mDelegateInfo) {
			const bIsDefaultDelegate = aDelegateNames.indexOf(mDelegateInfo.name) > -1;
			return aRequiredLibNames.concat(Object.keys((bIsDefaultDelegate && mDelegateInfo.requiredLibraries) || {}));
		}, []);
	};

	/**
	 * Checks if there is already a registered delegate available for the given model type
	 * or control type in case of control specific delegates.
	 *
	 * @param {string} sKeyType - Delegate model or control type
	 * @returns {boolean} <code>true</code> if a delegate is already registered for the model or control type
	 */
	DelegateMediator.isDelegateRegistered = function(sKeyType) {
		return !!DelegateMediator._mDefaultDelegateItems[sKeyType]
			|| !!DelegateMediator._mControlSpecificDelegateItems[sKeyType];
	};

	/**
	 * Register default delegate by the model type.
	 *
	 * @param {object} mPropertyBag - Property bag for default delegate
	 * @param {object} mPropertyBag.modelType - Default delegate model type
	 * @param {object} mPropertyBag.delegate - Path to default delegate
	 * @param {object} mPropertyBag.delegateType - Defines the type of the default delegate. Please look at <code>DelegageMediator.types</code> for possible entries
	 * @param {object} [mPropertyBag.requiredLibraries] - map of required libraries
	 */
	DelegateMediator.registerDefaultDelegate = function(mPropertyBag) {
		if (!(mPropertyBag.modelType && mPropertyBag.delegate)) {
			throw new Error("'modelType' and 'delegate' properties are required for registration!");
		}
		mPropertyBag.delegateType ||= DelegateMediator.types.COMPLETE;
		if (mPropertyBag.delegateType && !isValidType(mPropertyBag)) {
			throw new Error(`default 'delegateType': ${mPropertyBag.delegateType} is invalid!`);
		}
		// No overriding of compete delegates possible
		if (isCompetingDelegateAlreadyRegistered(mPropertyBag)) {
			throw new Error(`modelType ${mPropertyBag.modelType}is already defined!`);
		}
		DelegateMediator._mDefaultDelegateItems[mPropertyBag.modelType] ||= [];
		DelegateMediator._mDefaultDelegateItems[mPropertyBag.modelType].push({
			name: mPropertyBag.delegate,
			requiredLibraries: mPropertyBag.requiredLibraries,
			delegateType: mPropertyBag.delegateType,
			modelType: mPropertyBag.modelType
		});
	};

	/**
	 * Registers a control specific delegate by control type.
	 *
	 * @param {object} mPropertyBag - Property bag for control specific delegate
	 * @param {object} mPropertyBag.controlType - control type
	 * @param {object} mPropertyBag.delegate - path to control specific delegate
	 * @param {object} mPropertyBag.delegateType - Defines the type of the control specific delegate.
	 * Please look at <code>DelegageMediator.types</code> for possible entries
	 * @param {object} [mPropertyBag.requiredLibraries] - map of required libraries
	 * @param {object} [mPropertyBag.payload] - payload for the delegate
	 */
	DelegateMediator.registerControlSpecificDelegate = function(mPropertyBag) {
		if (!(mPropertyBag.controlType && mPropertyBag.delegate)) {
			throw new Error("'controlType' and 'delegate' properties are required for registration!");
		}
		mPropertyBag.delegateType ||= DelegateMediator.types.WRITEONLY;
		if (mPropertyBag.delegateType && !isValidType(mPropertyBag)) {
			throw new Error(`Control '${mPropertyBag.controlType}' specific delegateType: ${mPropertyBag.delegateType} is invalid!`);
		}
		DelegateMediator._mControlSpecificDelegateItems[mPropertyBag.controlType] = {
			name: mPropertyBag.delegate,
			requiredLibraries: mPropertyBag.requiredLibraries,
			delegateType: mPropertyBag.delegateType,
			controlType: mPropertyBag.controlType,
			payload: mPropertyBag.payload
		};
	};

	/**
	 * Returns the delegate object for the requested control.
	 *
	 * @param {sap.ui.core.Element} oControl - Control for which the corresponding delegate should be returned
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} oModifier - Control tree modifier
	 * @param {string} sModelType - Model type; required in case you passed the <code>XmlTreeModifier</code>
	 * @param {boolean} [bSupportsDefault] - Include default delegate if no instance specific delegate is available
	 * @returns {Promise.<sap.ui.core.util.reflection.FlexDelegateInfo>} Delegate information including the lazy loaded instance of the delegate
	 */
	DelegateMediator.getDelegateForControl = async function(oControl, oModifier, sModelType, bSupportsDefault) {
		await validateInputParameters(oControl, oModifier);

		const aDelegateInfo = (bSupportsDefault && getDefaultDelegateInfo(oControl, sModelType)) || [];
		const mControlSpecificDelegate = await getControlSpecificDelegateInfo(oModifier, oControl);
		if (mControlSpecificDelegate) {
			aDelegateInfo.push(mControlSpecificDelegate);
		}
		const mInstanceSpecificDelegate = await oModifier.getFlexDelegate(oControl);
		if (mInstanceSpecificDelegate) {
			// instance specific delegate always takes over
			aDelegateInfo.push(mInstanceSpecificDelegate);
		}
		const aDelegates = await loadDelegates(oModifier, oControl, aDelegateInfo);
		return mergeDelegates(aDelegates);
	};

	DelegateMediator.clear = function() {
		DelegateMediator._mDefaultDelegateItems = {};
		DelegateMediator._mControlSpecificDelegateItems = {};
	};

	return DelegateMediator;
});
