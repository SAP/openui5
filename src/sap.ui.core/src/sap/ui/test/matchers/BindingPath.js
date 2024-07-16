/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/isPlainObject",
	'sap/ui/test/matchers/Matcher',
	'sap/ui/model/StaticBinding'
], function (isPlainObject, Matcher, StaticBinding) {
	"use strict";

	/**
	 * @class
	 * Checks if a control has a binding context with the exact same binding path.
	 *
	 * As of version 1.60, comparison is strict and can include one or more binding criteria:
	 * <ul>
	 * <li>context path (matches children of bound controls, eg: items in a table)</li>
	 * <li>property path (matches controls with no context and a single bound property, eg: Text with binding for property text)</li>
	 * <li>context path + property path (matches children of bound controls, where the child has a binding for a certain property within the context)</li>
	 * <li>as of version 1.86, static value is also accepted. Use this only for {@link sap.ui.model.StaticBinding} </li>
	 * </ul>
	 *
	 * <b>Note:</b> Before version 1.60, the only available criteria is binding context path.
	 *
	 * As of version 1.72, it is available as a declarative matcher with the following syntax:
	 * <code><pre>{
	 *     bindingPath: {
	 *         path: "string",
	 *         modelName: "string",
	 *         propertyPath: "string"
	 *     }
	 * }
	 * </code></pre>
	* As of version 1.81, you can use regular expressions in declarative syntax:
	 * <code><pre>{
	 *     bindingPath: {
	 *         path: {
	 *             regex: {
	 *                 source: "binding.*PathValue$",
	 *                 flags: "ig"
	 *             }
	 *         }
	 *     }
	 * }
	 * </code></pre>
	 *
	 * @extends sap.ui.test.matchers.Matcher
	 * @param {object} [mSettings] Map/JSON-object with initial settings for the new BindingPath.
	 * @public
	 * @name sap.ui.test.matchers.BindingPath
	 * @author SAP SE
	 * @since 1.32
	 */
	return Matcher.extend("sap.ui.test.matchers.BindingPath", /** @lends sap.ui.test.matchers.BindingPath.prototype */ {

		metadata: {
			properties: {
				/**
				 * The value of the binding context path that is used for matching.
				 * As of version 1.81, it can also be a regular expression.
				 */
				path: {
					type: "any"
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
				 * As of version 1.81, it can also be a regular expression.
				 * @since 1.60
				 */
				propertyPath: {
					type: "any"
				},
				/**
				 * value of a static binding property. Use this only for {@link sap.ui.model.StaticBinding}
				 * @since 1.86
				 */
				value: {
					type: "any"
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
			var sMatcherPropertyPath = this.getPropertyPath();
			var sMatcherContextPath = this.getPath();
			var vMatcherStaticValue = this.getValue();

			if (!sMatcherContextPath && !sMatcherPropertyPath && !vMatcherStaticValue) {
				this._oLogger.debug("Matcher requires context path, property path or value but none is defined! No controls will be matched");
				return false;
			}

			var bContextMatches = true;
			var bPropertyPathMatches = true;
			var bStaticValueMatches = true;
			var oObjectBindingInfo = oControl.mObjectBindingInfos && oControl.mObjectBindingInfos[sModelName];
			var oBindingContext = oControl.getBindingContext(sModelName);

			if (sMatcherContextPath) {
				if (oObjectBindingInfo) {
					bContextMatches = _pathMatches(oObjectBindingInfo.path, sMatcherContextPath);

					if (bContextMatches) {
						this._oLogger.debug("Control '" + oControl + "' has object binding with the expected context path '" +
						sMatcherContextPath + "' for model '" + sModelName + "'");
					} else {
						this._oLogger.debug("Control '" + oControl + "' has object binding with context path '" +
							oObjectBindingInfo.path + "' for model '" + sModelName + "' but should have context path '" + sMatcherContextPath + "'");
					}
				} else {
					bContextMatches = !!oBindingContext && _pathMatches(oBindingContext.getPath(), sMatcherContextPath);

					if (bContextMatches) {
						this._oLogger.debug("Control '" + oControl + "' has binding context with the expected path '" +
						sMatcherContextPath + "' for model '" + sModelName + "'");
					} else if (oBindingContext){
						this._oLogger.debug("Control '" + oControl + "' has binding context with path '" +
							oBindingContext.getPath() + "' for model '" + sModelName + "' but should have context path '" + sMatcherContextPath + "'");
					} else {
						this._oLogger.debug("Control '" + oControl + "' does not have a binding context for model '" + sModelName +
							"' but should have a binding context with path '" + sMatcherContextPath + "'");
					}
				}
			}

			if (sMatcherPropertyPath) {
				var aActualPathsForModel = [];

				var aMatchingBindingInfos = Object.keys(oControl.mBindingInfos).filter(function (sBinding) {
					var mBindingInfo = oControl.mBindingInfos[sBinding];
					var aBindingParts = mBindingInfo.parts ? mBindingInfo.parts : [mBindingInfo];

					var aMatchingParts = aBindingParts.filter(function (mPart) {
						var bPathMatches = _pathMatches(mPart.path, sMatcherPropertyPath, !!oBindingContext);
						var bModelMatches = oObjectBindingInfo || mPart.model === sModelName;

						if (!bPathMatches && bModelMatches) {
							// for bindings to the matching model, save the actual paths for debug logging
							aActualPathsForModel.push(mPart.path);
						}

						return bPathMatches && bModelMatches;
					});

					return !!aMatchingParts.length;
				});

				bPropertyPathMatches = !!aMatchingBindingInfos.length;

				if (bPropertyPathMatches) {
					this._oLogger.debug("Control '" + oControl + "' has the expected binding property path '" +
					sMatcherPropertyPath + "' for model '" + sModelName + "'");
				} else if (aActualPathsForModel.length){
					this._oLogger.debug("Control '" + oControl + "' has binding property paths ['" +
						aActualPathsForModel.join("', '") + "'] for model '" + sModelName + "' but should have binding property path '" + sMatcherPropertyPath + "'");
				} else {
					this._oLogger.debug("Control '" + oControl + "' has no binding property paths for model '" + sModelName +
						"' but should have binding property path '" + sMatcherPropertyPath + "'");
				}
			}

			if (vMatcherStaticValue) {
				var aMatchingBindingInfos = Object.keys(oControl.mBindingInfos).filter(function (sBinding) {
					var oBinding = oControl.getBinding(sBinding);
					var mBindingInfo = oControl.mBindingInfos[sBinding];
					var aBindingParts = mBindingInfo.parts ? mBindingInfo.parts : [mBindingInfo];

					var aMatchingParts = aBindingParts.filter(function (mPart, index) {
						var oPartBinding = oBinding.getBindings ? oBinding.getBindings()[index] : oBinding;
						return oPartBinding instanceof StaticBinding && oPartBinding.getValue() === vMatcherStaticValue;
					});

					return !!aMatchingParts.length;
				});

				bStaticValueMatches = !!aMatchingBindingInfos.length;

				if (bStaticValueMatches) {
					this._oLogger.debug("Control '" + oControl + "' has the expected static binding value '" + vMatcherStaticValue + "'");
				}
			}

			return bContextMatches && bPropertyPathMatches;
		}
	});

	function _pathMatches(sPath, vMatcherPath, bWithContext) {
		if (isPlainObject(vMatcherPath) && vMatcherPath.regex && vMatcherPath.regex.source) {
			// declarative syntax
			vMatcherPath = new RegExp(vMatcherPath.regex.source, vMatcherPath.regex.flags);
		}
		// paths are set in test window (on matcher instantiation) -> match them against the test context's RegExp constructor
		if (vMatcherPath instanceof RegExp) {
			var oMatcherRegex;
			var aDelimiterMatch = vMatcherPath.source.match(/\^?\//);
			if (bWithContext && aDelimiterMatch) {
				oMatcherRegex = new RegExp(vMatcherPath.source.substr(aDelimiterMatch.index + 1), vMatcherPath.flags);
			} else if (!bWithContext && !aDelimiterMatch) {
				oMatcherRegex = new RegExp("\/" + vMatcherPath.source, vMatcherPath.flags);
			} else {
				oMatcherRegex = vMatcherPath;
			}
			return oMatcherRegex.test(sPath);
		} else if (sPath) {
			var bHasDelimiter = sPath.charAt(0) === "/";
			if (bWithContext && bHasDelimiter) {
				vMatcherPath = vMatcherPath.substr(1);
			} else if (!bWithContext && !bHasDelimiter) {
				vMatcherPath = "/" + vMatcherPath;
			}
			return sPath === vMatcherPath;
		} else {
			return false;
		}
	}

});
