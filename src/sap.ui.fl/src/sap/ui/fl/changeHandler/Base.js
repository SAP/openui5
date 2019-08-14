/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/LoaderExtensions"
], function(
	LoaderExtensions
) {
	"use strict";

	/**
	 * Base functionality for all change handlers, which provides some reuse methods
	 * @namespace sap.ui.fl.changeHandler.Base
	 * @version ${version}
	 * @ui5-restricted change handlers
	 */
	var Base = /** @lends sap.ui.fl.changeHandler.Base */{
		/**
		 * Sets a text in a change.
		 *
		 * @param {object} oChange - Change object
		 * @param {string} sKey - Text key
		 * @param {string} sText - Text value
		 * @param {string} sType - Translation text type, e.g. XBUT, XTIT, XTOL, XFLD
		 *
		 * @ui5-restricted
		 */
		setTextInChange: function(oChange, sKey, sText, sType) {
			if (!oChange.texts) {
				oChange.texts = {};
			}
			if (!oChange.texts[sKey]) {
				oChange.texts[sKey] = {};
			}
			oChange.texts[sKey].value = sText;
			oChange.texts[sKey].type = sType;
		},

		/**
		 * Instantiates an XML fragment inside a change.
		 * @param {sap.ui.fl.Change} oChange - Change object with instructions to be applied on the control
		 * @param {object} mPropertyBag - Property bag
		 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier for the controls
		 * @param {object} mPropertyBag.appComponent - App component
		 * @param {object} mPropertyBag.view - Root view
		 * @returns {Element[]|sap.ui.core.Element[]} Array with the nodes/instances of the controls of the fragment
		 * @public
		 */
		instantiateFragment: function(oChange, mPropertyBag) {
			var sModuleName = oChange.getModuleName();
			if (!sModuleName) {
				throw new Error("The module name of the fragment is not set. This should happen in the backend");
			}
			var oModifier = mPropertyBag.modifier;
			var oView = mPropertyBag.view;
			var sFragment = LoaderExtensions.loadResource(sModuleName, {dataType: "text"});
			var sNamespace = oChange.getProjectId();
			try {
				return oModifier.instantiateFragment(sFragment, sNamespace, oView);
			} catch (oError) {
				throw new Error("The following XML Fragment could not be instantiated: " + sFragment + " Reason: " + oError.message);
			}
		},

		/**
		 * Creates a return object. Should be called in case the change is not applicable.
		 * @param {string} sNotApplicableCauseMessage - Indicates why the change is not applicable
		 * @param {boolean} bAsync - Determines whether a non-applicable object should be thrown (synchronous), or whether an asynchronous promise reject with the same object should be returned
		 * @returns {Promise} Returns rejected promise with non-applicable message inside
		 */
		markAsNotApplicable: function(sNotApplicableCauseMessage, bAsync) {
			var oReturn = { message: sNotApplicableCauseMessage };
			if (!bAsync) {
				throw oReturn;
			}
			return Promise.reject(oReturn);
		}
	};

	return Base;
}, /* bExport= */true);
