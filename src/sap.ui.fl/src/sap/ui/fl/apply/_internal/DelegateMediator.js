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
	var DelegateMediator = {};

	DelegateMediator._mDefaultDelegateItems = {};
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
			var oModel = oControl.getModel();
			if (!oModel) {
				return undefined;
			}
			return oModel.getMetadata().getName();
		}
	}

	function getDefaultDelegateInfo(oControl, sModelType) {
		sModelType = getModelTypeForControl(oControl, sModelType);
		var aDelegateInfo = DelegateMediator._mDefaultDelegateItems[sModelType];
		return (aDelegateInfo || []).map(function(mDelegateInfo) {
			mDelegateInfo.payload = {};
			return mDelegateInfo;
		});
	}

	function loadDelegates(oModifier, oControl, aDelegates) {
		if (!aDelegates.length) {
			// it is a valid case to ask for a delegate and there is none
			// a broken delegate is logged below
			return Promise.resolve([]);
		}
		var aPromises = [];
		aDelegates.forEach(function(mDelegateInfo) {
			aPromises.push(function(aLoadedDelegates) {
				return requireAsync(mDelegateInfo.name)
				.then(function(oDelegate) {
					mDelegateInfo.instance = oDelegate || {};
					aLoadedDelegates.push(mDelegateInfo);
					return aLoadedDelegates;
				})
				.catch(function(oError) {
					Log.error("Failed to load the delegate for the control " + oModifier.getId(oControl) +
							"\n" + oError.message);
					return aLoadedDelegates;
				});
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
			mTargetDelegateInfo.requiredLibraries = Object.assign(mTargetDelegateInfo.requiredLibraries || {}, mDelegateInfo.requiredLibraries);
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
		return merge(mTargetDelegateInfo, { instance: _pick(mDelegateInfo.instance, ["getPropertyInfo", "getRepresentedProperties"]) });
	}

	function assignWritePart(mTargetDelegateInfo, mDelegateInfo) {
		mTargetDelegateInfo = assignCommonPart(mTargetDelegateInfo, mDelegateInfo);
		return merge(mTargetDelegateInfo, { instance: _pick(mDelegateInfo.instance, ["createLabel", "createControlForProperty", "createLayout"]) });
	}

	function assignCompleteDelegate(mTargetDelegateInfo, mDelegateInfo) {
		mTargetDelegateInfo = assignCommonPart(mTargetDelegateInfo, mDelegateInfo);
		return merge(mTargetDelegateInfo, _pick(mDelegateInfo, "instance"));
	}

	function mergeDelegates(aDelegates) {
		// check from in reverted order whether the read and or the write part is available
		// build a new object that consists of the read and the write part probably of more than one delegate
		var mResultDelegateInfo = {
			names: [],
			instance: {},
			modelType: aDelegates.length && aDelegates[0].modelType
		};
		var bReadPartMissing = true;
		var bWritePartMissing = true;
		for (var i = (aDelegates.length - 1); i >= 0; i--) {
			var mDelegateInfo = aDelegates[i];
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
		var aDefaultDelegates = DelegateMediator._mDefaultDelegateItems[mPropertyBag.modelType] || [];
		var aDefaultDelegateTypes = aDefaultDelegates.map(function(mDefaultDelegateInfo) {
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
		var aDelegateInfo = DelegateMediator._mDefaultDelegateItems[sModelType] || [];
		return aDelegateInfo.reduce(function(aRequiredLibNames, mDelegateInfo) {
			var bIsDefaultDelegate = aDelegateNames.indexOf(mDelegateInfo.name) > -1;
			return aRequiredLibNames.concat(Object.keys((bIsDefaultDelegate && mDelegateInfo.requiredLibraries) || {}));
		}, []);
	};

	/**
	 * Checks if there is already a registered delegate available for the given model type.
	 *
	 * @param {string} sModelType - Delegate model type
	 * @returns {boolean} <code>true</code> if a delegate is already registered for the model type
	 */
	DelegateMediator.isDelegateRegistered = function(sModelType) {
		return !!DelegateMediator._mDefaultDelegateItems[sModelType];
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
		mPropertyBag.delegateType = mPropertyBag.delegateType || DelegateMediator.types.COMPLETE;
		if (mPropertyBag.delegateType && !isValidType(mPropertyBag)) {
			throw new Error("default 'delegateType': " + mPropertyBag.delegateType + " is invalid!");
		}
		// No overriding of compete delegates possible
		if (isCompetingDelegateAlreadyRegistered(mPropertyBag)) {
			throw new Error("modelType " + mPropertyBag.modelType + "is already defined!");
		}
		if (!DelegateMediator._mDefaultDelegateItems[mPropertyBag.modelType]) {
			DelegateMediator._mDefaultDelegateItems[mPropertyBag.modelType] = [];
		}
		DelegateMediator._mDefaultDelegateItems[mPropertyBag.modelType].push({
			name: mPropertyBag.delegate,
			requiredLibraries: mPropertyBag.requiredLibraries,
			delegateType: mPropertyBag.delegateType,
			modelType: mPropertyBag.modelType
		});
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
	DelegateMediator.getDelegateForControl = function(oControl, oModifier, sModelType, bSupportsDefault) {
		return validateInputParameters(oControl, oModifier)
		.then(function() {
			return oModifier.getFlexDelegate(oControl);
		})
		.then(function(mInstanceSpecificDelegate) {
			var aDelegateInfo = (bSupportsDefault && getDefaultDelegateInfo(oControl, sModelType)) || [];
			if (mInstanceSpecificDelegate) {
				// instance specific delegate always takes over
				aDelegateInfo.push(mInstanceSpecificDelegate);
			}
			return loadDelegates(oModifier, oControl, aDelegateInfo);
		})
		.then(mergeDelegates.bind(this));
	};

	DelegateMediator.clear = function() {
		DelegateMediator._mDefaultDelegateItems = {};
	};

	return DelegateMediator;
});
