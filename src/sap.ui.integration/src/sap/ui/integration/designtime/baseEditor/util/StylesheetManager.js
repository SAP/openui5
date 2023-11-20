/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/dom/includeStylesheet",
	"sap/base/util/uid"
], function (
	includeStylesheet,
	uid
) {
	"use strict";

	var STATUS_SUCCESS = "SUCCESS";
	var STATUS_FAIL = "FAIL";
	var STATUS_PENDING = "PENDING";

	/**
	 * Store Item structure
	 *
	 * @typedef {object} StoreItem
	 * @private
	 * @property {string} id - DOM Node ID
	 * @property {int} counter - Indicates how many users the loaded file has
	 * @property {'SUCCESS'|'FAIL'|'PENDING'} status - Loading status
	 */

	/**
	 * Store keeps information about loaded files and amount of users they have.
	 * @type {Object<string, StoreItem>}
	 */
	var mStore = {};

	function load(sFilePath) {
		var mConfig = {
			id: uid(),
			status: STATUS_PENDING,
			counter: 1
		};
		var oPromise = new Promise(function (fnResolve, fnReject) {
			includeStylesheet(sFilePath, mConfig.id, fnResolve, fnReject);
		})
			.then(function () {
				var mConfig = mStore[sFilePath];
				if (mConfig.counter === 0) {
					destroy(sFilePath);
				} else {
					setStatus(sFilePath, STATUS_SUCCESS);
				}

			})
			.catch(function () {
				setStatus(sFilePath, STATUS_FAIL);
				return Promise.reject("File not found or some other network issue happened.");
			});

		mConfig.promise = oPromise;

		mStore = Object.assign({}, mStore);
		mStore[sFilePath] = mConfig;

		return mConfig.promise;
	}

	function destroy(sFilePath) {
		var mStoreNext = Object.assign({}, mStore);
		var mConfig = mStoreNext[sFilePath];

		var oElementToRemove = document.getElementById(mConfig.id);
		if (oElementToRemove && oElementToRemove.parentNode) {
			oElementToRemove.parentNode.removeChild(oElementToRemove);
		}
		delete mStoreNext[sFilePath];

		mStore = mStoreNext;
	}

	function increaseCounter(sFilePath) {
		var mDelta = {};
		mDelta[sFilePath] = Object.assign({}, mStore[sFilePath]);
		mDelta[sFilePath].counter++;

		mStore = Object.assign({}, mStore, mDelta);

		return mStore[sFilePath];
	}

	function decreaseCounter(sFilePath) {
		var mDelta = {};
		mDelta[sFilePath] = Object.assign({}, mStore[sFilePath]);
		mDelta[sFilePath].counter--;

		mStore = Object.assign({}, mStore, mDelta);

		return mStore[sFilePath];
	}

	function setStatus(sFilePath, sStatus) {
		var mDelta = {};
		mDelta[sFilePath] = Object.assign({}, mStore[sFilePath]);
		mDelta[sFilePath].status = sStatus;

		mStore = Object.assign({}, mStore, mDelta);

		return mStore[sFilePath];
	}

	function getFilePath(sModulePath) {
		return sap.ui.require.toUrl(sModulePath) + ".css";
	}

	return {
		/**
		 * Loads CSS file or returns already loaded file. If the specified file previously failed to load,
		 * the promise will be rejected.
		 *
		 * @param {string} sModulePath - Module path
		 * @returns {Promise} Resolves when loading is finished and CSS is added to the page
		 */
		add: function (sModulePath) {
			var sFilePath = getFilePath(sModulePath);
			var mStylesheet = mStore[sFilePath];

			if (mStylesheet) {
				increaseCounter(sFilePath);
				return mStylesheet.promise;
			}

			return load(sFilePath);
		},

		/**
		 * Removes CSS file from the page.
		 * **Note:** the file may not be removed immediately in case there are other consumers of the same CSS file.
		 *
		 * @param {string} sModulePath - Module path
		 */
		remove: function (sModulePath) {
			var sFilePath = getFilePath(sModulePath);
			var mConfig = mStore[sFilePath];

			if (mConfig) {
				var mUpdatedConfig = decreaseCounter(sFilePath);

				if (mUpdatedConfig.counter === 0 && mUpdatedConfig.status === STATUS_SUCCESS) {
					destroy(sFilePath);
				}
			}

		}
	};
});
