/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/test/RecordReplay"
], function (BaseObject, RecordReplay) {
	"use strict";

	// memoize recently requested selectors
	var aSelectorCache = [];
	var SELECTOR_CACHE_LIMIT = 100;

	/**
	 * @class generates a control selector
	 */
	var UIVeri5SelectorGenerator = BaseObject.extend("sap.ui.testrecorder.controlSelectors.UIVeri5SelectorGenerator", {});

	/**
	 * generates a UIVeri5 selector for a control
	 *
	 * @param {object} mData data of the control for which to find a selector. Must contain either domElementId or controlId.
	 * @param {string} mData.domElementId ID of a DOM element that is part of the control DOM tree
	 * @param {string} mData.controlId ID of the control
	 * @returns {Promise<string>} Promise for a control selector or error
	 */
	UIVeri5SelectorGenerator.prototype.getSelector = function (mData) {
		var oDomElement = _getDomElement(mData);
		var mCacheKey = {
			domElementId: oDomElement.id
		};
		var mCachedSelector = this._findCached(mCacheKey);
		if (mCachedSelector) {
			return Promise.resolve(mCachedSelector);
		}
		return RecordReplay.findControlSelectorByDOMElement({
			domElement: oDomElement
		}).then(function (mSelector) {
			this._cache(mCacheKey, mSelector);
			return mSelector;
		}.bind(this));
	};

	UIVeri5SelectorGenerator.prototype._findCached = function (mData) {
		var mSelector;
		aSelectorCache.forEach(function (mPair) {
			if (mPair.key === mData.domElementId) {
				mSelector = mPair.value;
			}
		});
		return mSelector;
	};

	UIVeri5SelectorGenerator.prototype._cache = function (mData, mSelector) {
		if (aSelectorCache.length === SELECTOR_CACHE_LIMIT) {
			// remove the oldest selector
			aSelectorCache.shift();
		}
		aSelectorCache.push({
			key: mData.domElementId,
			value: mSelector
		});
	};

	UIVeri5SelectorGenerator.prototype.emptyCache = function () {
		aSelectorCache = [];
	};

	function _getDomElement(mData) {
		if (mData.domElement && typeof mData.domElement === "string") {
			// mData would contain DOM element ID: when control is selected by clicking on the page
			return document.getElementById(mData.domElement);
		} else if (mData.controlId) {
			// mDat would contain control ID: when control is selected from the recorder control tree
			return sap.ui.getCore().byId(mData.controlId).getFocusDomRef();
		}
	}

	return new UIVeri5SelectorGenerator();
});
