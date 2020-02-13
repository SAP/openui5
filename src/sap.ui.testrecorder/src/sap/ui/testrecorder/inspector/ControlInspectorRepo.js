/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object"
], function (BaseObject) {
	"use strict";

	var oControlInspectorRepo = null;

	// memoize recent requests and selectors.
	// one repo entry contains a selector/snippet request data (domElementId and action), a generated selector and a code snippet.
	// a repo entry is identified by its domElementId.
	// * the request data is needed to re-generate snippets for a selected control when the snippet settings are changed
	// (e.g. immediately show new selector when dialog is changed)
	// * the selector is saved to save time because its generation is heavy. 1 selector should locate 1 control
	// (e.g. regenerating when settings are changed or control is selected again)
	// * the snippet is saved to simplify the multipleSnippets case. 1 snippet should locate 1 control
	// (e.g. combining all snippets to format the final result and avoiding recursion)
	var aRepo = [];
	// save only the latest 100 entries, clear any older ones
	var REPO_ENTRY_LIMIT = 100;

	/**
	 * @class contain and give access to data related to snippet generation
	 */
	var ControlInspectorRepo = BaseObject.extend("sap.ui.testrecorder.inspector.ControlInspectorRepo", {
		constructor: function () {
			if (!oControlInspectorRepo) {
				Object.apply(this, arguments);
			} else {
				return oControlInspectorRepo;
			}
		}
	});

	/**
	 * given a dom ID, return the selector for its corresponding control, if it has already been generated
	 * @param {string} sDomElementId ID of a dom element
	 * @returns {object} a control selector
	 */
	ControlInspectorRepo.prototype.findSelector = function (sDomElementId) {
		var aMatching = aRepo.filter(function (mRepoData) {
			return mRepoData.domElementId === sDomElementId && mRepoData.selector;
		});
		return aMatching[0] && aMatching[0].selector || null;
	};

	/**
	 * save all data for a given control
	 * @param {object} mRequestData data used to generate selectors or snippets for a single control
	 * @param {string} mRequestData.domElementId dom element ID
	 * @param {string} mRequestData.action name of the action - used to generate a snippet
	 * @param {object} mSelector generated control selector
	 * @param {string} sSnippet code snippet for a single control
	 */
	ControlInspectorRepo.prototype.save = function (mRequestData, mSelector, sSnippet) {
		var mNewEntry = Object.assign({
			selector: mSelector,
			snippet: sSnippet
		}, mRequestData);

		var iUpdateIndex = -1;
		// if there is already a repo entry with the same domElementId, update it with the new values
		aRepo.forEach(function (mRepoData, index) {
			if (mRepoData.domElementId === mRequestData.domElementId) {
				iUpdateIndex = index;
			}
		});
		if (iUpdateIndex > -1) {
			aRepo[iUpdateIndex] = mNewEntry;
		} else {
			if (aRepo.length === REPO_ENTRY_LIMIT) {
				// remove the oldest selector
				aRepo.shift();
			}
			aRepo.push(mNewEntry);
		}
	};

	/**
	 * delete all entries from the repo
	 */
	ControlInspectorRepo.prototype.clear = function () {
		aRepo = [];
	};

	/**
	 * get the "snippet request" objects from all repo entries
	 * @returns {array} an array of object containing a domElementId and action
	 */
	ControlInspectorRepo.prototype.getRequests = function () {
		return aRepo.map(function (mData) {
			return {
				domElementId: mData.domElementId,
				action: mData.action
			};
		});
	};

	/**
	 * get the generated selectors from all repo entries
	 * @returns {array} an array of control selectors
	 */
	ControlInspectorRepo.prototype.getSelectors = function () {
		return aRepo.map(function (mData) {
			return mData.selector;
		});
	};

	/**
	 * get the snippets from all repo entries
	 * @returns {array} an array of code snippets
	 */
	ControlInspectorRepo.prototype.getSnippets = function () {
		return aRepo.map(function (mData) {
			return mData.snippet;
		});
	};

	ControlInspectorRepo.prototype.getAll = function () {
		return aRepo;
	};

	oControlInspectorRepo = new ControlInspectorRepo();

	return oControlInspectorRepo;
});
