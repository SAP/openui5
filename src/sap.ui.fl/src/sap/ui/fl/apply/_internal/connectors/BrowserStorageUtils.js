/*
 * ! ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	/**
	 * Util class for Connector implementations (apply and write)
	 *
	 * @namespace sap.ui.fl.apply._internal.connectors.Utils
	 * @experimental Since 1.70
	 * @since 1.70
	 * @version ${version}
	 * @ui5-restricted sap.ui.fl.apply._internal, sap.ui.fl.write._internal
	 */

	var FL_CHANGE_KEY = "sap.ui.fl.change";
	var FL_VARIANT_KEY = "sap.ui.fl.variant";

	return {
		/**
		* The iterator for the fl changes in the given Storage.
		* @public
		* @param {Storage} oStorage browser storage, can be either session or local storage
		* @param {function} fnPredicate The function to apply for each  change
		*/
		forEachChangeInStorage: function(oStorage, fnPredicate) {
			var aKeys = Object.keys(oStorage);
			aKeys.forEach(function(sKey) {
				if (sKey.includes(FL_CHANGE_KEY) || sKey.includes(FL_VARIANT_KEY)) {
					fnPredicate(sKey);
				}
			});
		},

		/**
		 * Creates the fl change key
		 * @param  {string} sId The change id
		 * @returns {string} the prefixed id
		 */
		createChangeKey: function(sId) {
			if (sId) {
				return FL_CHANGE_KEY + "." + sId;
			}
		},

		/**
		 * Creates the fl variant key
		 * @param  {string} sId The variant id
		 * @returns {string} the prefixed id
		 */
		createVariantKey: function(sId) {
			if (sId) {
				return FL_VARIANT_KEY + "." + sId;
			}
		},

		sortGroupedFlexObjects: function(mResult) {
			function byCreation(oChangeA, oChangeB) {
				return new Date(oChangeA.creation) - new Date(oChangeB.creation);
			}

			[
				"changes",
				"variantChanges",
				"variants",
				"variantDependentControlChanges",
				"variantManagementChanges"
			].forEach(function (sSectionName) {
				mResult[sSectionName] = mResult[sSectionName].sort(byCreation);
			});


			return mResult;
		}
	};
});
