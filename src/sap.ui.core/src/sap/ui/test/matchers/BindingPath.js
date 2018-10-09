/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/test/matchers/Matcher'], function(Matcher) {
	"use strict";

	/**
	 * BindingPath - checks if a control has a specific binding
	 * @since 1.60 Comparison is strict and can include one or more binding criteria:
	 * - context path (matches children of bound controls, eg: items in a table)
	 * - property path (matches controls with no context and a single bound property, eg: Text with binding for property text)
	 * - context path + property path (matches children of bound controls, where the child has a binding for a certain property within the context)
	 *
	 * Before v1.60 he only available criteria is binding context path!
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
				 * The value of the binding context path that is used for matching.
				 */
				path: {
					type: "string"
				},
				/**
				 * The name of the binding model that is used for matching.
				 */
				modelName: {
					type: "string"
				},
				/**
				 * The value of the binding property path that is used for matching.
				 * If (context) path is also set, propertyPath will be assumed to be relative to the binding context path
				 */
				propertyPath: {
					type: "string"
				}
			}
		},

		/**
		 * Checks if the control has a binding with matching path
		 *
		 * @param {sap.ui.core.Control} oControl the control that is checked by the matcher
		 * @return {boolean} true if the binding values match strictly
		 * @public
		 */

		isMatching: function (oControl) {
			var sModelName = this.getModelName() || undefined; // ensure nameless models will be retrieved
			var sPropertyPath = this.getPropertyPath();
			var sContextPath = this.getPath();

			if (!sContextPath && !sPropertyPath) {
				this._oLogger.debug("Matcher requires context path or property path but none is defined! No controls will be matched");
				return false;
			}

			var bContextMatches = true;
			var bPropertyPathMatches = true;
			var oObjectBindingInfo = oControl.mObjectBindingInfos && oControl.mObjectBindingInfos[sModelName];
			var oBindingContext = oControl.getBindingContext(sModelName);

			if (sContextPath) {
				if (oObjectBindingInfo) {
					var sContextPathToMatch = _getFormattedPath(sContextPath, sModelName);
					bContextMatches = oObjectBindingInfo.path === sContextPathToMatch;

					this._oLogger.debug("Control '" + oControl + "'" + (bContextMatches ? " has" : " does not have ") +
						" object binding with context path '" + sContextPathToMatch + "' for model '" + sModelName + "'");
				} else {
					bContextMatches = !!oBindingContext && oBindingContext.getPath() === sContextPath;

					this._oLogger.debug("Control '" + oControl + "' " + (bContextMatches ? "has" : "does not have") +
						" binding context with path '" + sContextPath + "' for model '" + sModelName + "'");
				}
			}

			if (sPropertyPath) {
				var sPropertyPathToMatch = _getFormattedPath(sPropertyPath, sModelName, oBindingContext);

				var аMatchingBindingInfos = Object.keys(oControl.mBindingInfos).filter(function (sBinding) {
					var mBindingInfo = oControl.mBindingInfos[sBinding];
					var аBindingParts = mBindingInfo.parts ? mBindingInfo.parts : [mBindingInfo];

					var аMatchingParts = аBindingParts.filter(function (mPart) {
						var bPathMatches = mPart.path === sPropertyPathToMatch;
						var bModelMatches = oObjectBindingInfo || mPart.model === sModelName;
						return bPathMatches && bModelMatches;
					});

					return !!аMatchingParts.length;
				});

				bPropertyPathMatches = !!аMatchingBindingInfos.length;
				this._oLogger.debug("Control '" + oControl + "' " + (bPropertyPathMatches ? "has" : "does not have") +
					" binding property path '" + sPropertyPath + "' for model '" + sModelName + "'");
			}

			return bContextMatches && bPropertyPathMatches;
		}
	});

	function _getFormattedPath(sPath, bWithNamedModel, bWithContext) {
		var sPropertyPathDelimiter = "/";
		var sFormattedPath = sPath;

		if (bWithNamedModel || bWithContext) {
			if (sPath.charAt(0) === sPropertyPathDelimiter) {
				sFormattedPath = sPath.substring(1);
			}
		} else if (sPath.charAt(0) !== sPropertyPathDelimiter) {
				sFormattedPath = sPropertyPathDelimiter + sPath;
		}

		return sFormattedPath;
	}

});
