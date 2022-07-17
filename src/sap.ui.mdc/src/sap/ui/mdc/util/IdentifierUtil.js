/*!
 * ${copyright}
 */

// ------------------------------------------------------------------------------------------
// Utility class used by smart controls for creating stable ids.
// ------------------------------------------------------------------------------------------
sap.ui.define(['sap/ui/base/DataType'], function(DataType) {
	"use strict";

	/**
	 * Utility class used by smart controls for creating stable ids
	 *
	 * @namespace
	 * @private
	 * @experimental This module is only for internal/experimental use!
	 * @since 1.61.0
	 * @alias sap.ui.mdc.util.IdentifierUtil
	 */
	var IdentifierUtil = {

		/**
		 * Static function that replaces special characters with a underscore.<br>
		 *
		 * @param {string} sName - String whose special characters shall be replaced.
		 * @returns {string} Cleaned up String
		 * @protected
		 */
		replace: function(sName) {

			var t = DataType.getType("sap.ui.core.ID");
			if (!t.isValid(sName)) {
				sName = sName.replace(/[^A-Za-z0-9_.:]+/g, "__mdc__");
				if (!t.isValid(sName)) {
					sName = "__mdc__" + sName;
				}
			}
			return sName;
		},

		/**
		 * Static function that creates the id for a FilterField, dependant on the FilterBar control<br>
		 *
		 * @param {sap.ui.mdc.FilterBar} oFilterBar - based on it, the id will be determined
		 * @param {string} sKey - the property path/name
		 * @returns {string} the calculated id
		 * @protected
		 */
		getFilterFieldId : function(oFilterBar, sKey) {
			return oFilterBar.getId() + "--filter--" + IdentifierUtil.replace(sKey);
		},

		/**
		 * Static function that determines the key of the property<br>
		 *
		 * @param {Object} oProperty - contains the metadata
		 * @returns {string} the key of the property name
		 * @protected
		 */
		getPropertyKey:  function(oProperty) {
			return oProperty.name;
		},

		getPropertyPath:  function(oProperty) {
			return oProperty.path;
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
});
