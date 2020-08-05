/*
 * ! ${copyright}
 */

// ------------------------------------------------------------------------------------------
// Utility class used by smart controls for creating stable ids.
// ------------------------------------------------------------------------------------------
sap.ui.define(['sap/ui/base/DataType'], function(DataType) {
	"use strict";

	/**
	 * Utility class used by smart controls for creating stable ids
	 *
	 * @private
	 * @experimental This module is only for internal/experimental use!
	 */
	var IdentifierUtil = {

		/**
		 * Static function that replaces special characters with a underscore.<br>
		 *
		 * @param {String} sName - String whose special characters shall be replaced.
		 * @returns {String} Cleaned up String
		 * @protected
		 */
		replace: function(sName) {

			var t = DataType.getType("sap.ui.core.ID");
			if (!t.isValid(sName)) {
				sName = sName.replace(/[^A-Za-z0-9_.:]+/g, "_");
				if (!t.isValid(sName)) {
					sName = "_" + sName;
				}
			}
			return sName;
		},

		/**
		 * Static function that creates the id for a FilterField, dependant on the FilterBar control<br>
		 *
		 * @param {sap.ui.mdc.FilterBar} oFilterBar - based on it, the id will be determined
		 * @param {String} sKey - the property path/name
		 * @returns {String} the calculated id
		 * @protected
		 */
		getFilterFieldId : function(oFilterBar, sKey) {
			return oFilterBar.getId() + "--filter--" + IdentifierUtil.replace(sKey);
		},

		/**
		 * Static function that determines the key of the property<br>
		 *
		 * @param {Object} oProperty - contains the meta dada
		 * @returns {String} the key of the property path/name
		 * @protected
		 */
		getPropertyKey:  function(oProperty) {
			return oProperty.name;
		},

		/**
		 * Static function that determines the key of the property<br>
		 *
		 * @param {sap.ui.core.Control} oControl - for which the view will be determined
		 * @returns {sap.ui.core.mvc.View} the enclosing view
		 * @protected
		 */
		getView :  function(oControl) {
			var oView = null;
			if (oControl) {
				var oObj = oControl.getParent();
				while (oObj) {
					if (oObj.isA("sap.ui.core.mvc.View")) {
						oView = oObj;
						break;
					}
					oObj = oObj.getParent();
				}
			}
			return oView;
		}
	};
	return IdentifierUtil;
}, /* bExport= */true);
