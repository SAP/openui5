/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/base/util/merge',
	'sap/ui/core/mvc/View'
], function (merge, View
) {
	"use strict";

	const mCache = new WeakMap();

	const getViewForControl = (oControl) => {
		if (oControl instanceof View) {
			return oControl;
		}
		if (oControl && typeof oControl.getParent === "function") {
			oControl = oControl.getParent();
			return getViewForControl(oControl);
		}
		return undefined;
	};

	const withViewPrefix = (oContainerCtrl, sBaseId) => {
		var oView = getViewForControl(oContainerCtrl);
		return oView ? oView.createId(sBaseId) : sBaseId;
	};

	const _extractValues = (oParent, oSettings) => {
		return oSettings && Object.keys(oSettings).reduce((oAcc, sKey) => ({...oAcc, [sKey]: sKey === 'valueHelp' ? withViewPrefix(oParent, oSettings[sKey]) : oSettings[sKey]}), {});
	};

	class DelegateCache{

		// you can hide certain entries during a merge with a string key
		static add (oParent, oData, sKey, iIndex) {
			const aCurrent = mCache.get(oParent);
			const aAddValue = [sKey, oData];

			if (aCurrent) {
				if (iIndex) {
					aCurrent.splice(iIndex, 0, aAddValue);
				} else {
					aCurrent.push(aAddValue);
				}
			} else {
				mCache.set(oParent, [aAddValue]);
			}
		}

		// returns a merged representation of all cached settings having no key / a matching key
		static get (oParent, sPath, sKey) {
			const aCachedData = mCache.get(oParent);
			const oMergedSettings = aCachedData && merge({}, ...aCachedData.reduce((aAcc, aEntry) => {
				return !aEntry[0] || (aEntry[0] === sKey) ? [...aAcc, aEntry[1]] : aAcc;
			}, []));

			if (sPath) {
				return _extractValues(oParent, oMergedSettings?.[sPath]);
			}
			return oMergedSettings && Object.keys(oMergedSettings).reduce((oAcc, sKey) => ({...oAcc, [sKey]: _extractValues(oParent, oMergedSettings[sKey])}), {});
		}

		static merge = merge;
	}

	return DelegateCache;
});