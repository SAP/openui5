/*!
 * ${copyright}
 */

sap.ui.define(['./Matcher'], function(Matcher) {
	"use strict";

	/**
	 * BindingPath - checks if a control has a binding context with the exact same binding path.
	 *
	 * @class BindingPath - checks if a control has a binding context with the exact same binding path
	 * @extends sap.ui.test.matchers.Matcher
	 * @param {object} [mSettings] Map/JSON-object with initial settings for the new BindingPath.
	 * @public
	 * @name sap.ui.test.matchers.BindingPath
	 * @author SAP SE
	 * @since 1.32
	 */
	return Matcher.extend("sap.ui.test.matchers.BindingPath", /** @lends sap.ui.test.matchers.BindingPath.prototype */ {

		metadata: {
			publicMethods: ["isMatching"],
			properties: {
				/**
				 * The value of the binding path that is used for matching.
				 */
				path: {
					type: "string"
				},
				/**
				 * The name of the binding model that is used for matching.
				 */
				modelName: {
					type: "string"
				}
			}
		},

		/**
		 * Checks if the control has a binding context that matches the path
		 *
		 * @param {sap.ui.core.Control} oControl the control that is checked by the matcher
		 * @return {boolean} true if the binding path has a strictly matching value.
		 * @public
		 */

		isMatching: function (oControl) {

			if (!this.getPath()) {
				this._oLogger.error("The binding path property is required but not defined");
				return false;
			}

			var sModelName = this.getModelName() || undefined; // ensure nameless models will be retrieved
			var oBindingContext = oControl.getBindingContext(sModelName);

			if (!oBindingContext) {
				this._oLogger.debug("The control '" + oControl + "' has no binding context" + (sModelName ? " for the model " + sModelName : ""));
				return false;
			}

			var bResult = this.getPath() === oBindingContext.getPath();

			if (!bResult) {
				this._oLogger.debug("The control '" + oControl + "' has a binding context" + (sModelName ? " for the model " + sModelName : "") +
					" but its binding path is " + oBindingContext.getPath() + " when it should be " + this.getPath());
			}

			return bResult;
		}

	});

});
