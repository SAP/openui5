/*!
 * ${copyright}
 */
sap.ui.define(["sap/base/util/ObjectPath"], function(ObjectPath) {
	"use strict";

	// indicator if the reference can't be resolved
	var oNotFound = Object.create(null);

	/**
	 * Resolve the path segments under the given root context
	 *
	 * @param {array} aParts The path segments
	 * @param {object} oRoot The root context
	 * @param {object} [mOptions] Options
	 * @param {boolean} [mOptions.bindContext] When the resolved value is a
	 *  function, whether the resolved function is bound to a context
	 * @param {boolean} [mOptions.rootContext] When the resolved value is a
	 *  function and a rootContext is given, the resolved function is bound
	 *  to this context instead of the object to which it belongs. If
	 *  <code>mOptions.bindContext=false</code>, this option has no effect
	 * @return {any} The resolved value. If the value can't be resolved under the
	 *  given root context, it returns <code>oNotFound</code>.
	 */
	function _resolve(aParts, oRoot, mOptions) {
		var vRef, oContext;

		if (oRoot && (aParts[0] in oRoot)) {
			// the path consists of at least two segments
			// e.g. key "Module.namespace.function" -> function() {...}
			oContext = aParts.length > 1 ? ObjectPath.get(aParts.slice(0, -1), oRoot) : oRoot;
			vRef = oContext && oContext[aParts[aParts.length - 1]];

			if (typeof vRef === "function" && mOptions.bindContext) {
				vRef = vRef.bind(mOptions.rootContext || oContext);
			}

			return vRef;
		}

		return oNotFound;
	}

	/**
	 * Returns a value located in the provided path using the given
	 * <code>mVariables</code> object.
	 *
	 * If the provided path cannot be resolved completely, <code>undefined</code> is returned.
	 *
	 * How <code>mVariables</code> are checked for resolving the path depends on
	 * the syntax of the path:
	 * <ul>
	 * <li><i>absolute</i>: paths not starting with a dot ('.') are checked through
	 *     <code>mVariables</code>.</li>
	 * <li><i>relative</i>: paths starting with a dot ('.') are only checked through the
	 *     dot variable <code>mVariables["."]</code> and don't fallback to global scope
	 *     <code>window</code>.</li>
	 * <li><i>legacy</i>: when <code>mOptions.preferDotContext=true</code>, paths not starting
	 *     with a dot ('.') are first checked through the dot Variable
	 *     <code>mVariables["."]</code> and then - if nothing is found - through the other
	 *     Variables in <code>mVariables</code> and eventually fallback to global scope
	 *     <code>window</code>.</li>
	 * </ul>
	 *
	 * When the resolved value is a function, a context may be bound to it with the following
	 * conditions:
	 * <ul>
	 * <li><i>No bound</i>: if the function is resolved from the global scope (not from any
	 *     given variables in <code>mVariables</code>, it's not bound to any context. If the
	 *     function exists directly under <code>mVariables</code>, nothing is bound.</li>
	 * <li><i>Bound</i>: otherwise, the resolved function is bound to the object to which it
	 *     belongs</li>
	 * <li><i>mOptions.bindContext</i>: when this option is set to <code>false</code>, no
	 *     context is bound to the resolved function regardless where the function is resolved
	 *     </li>
	 * <li><i>mOptions.bindDotContext</i>: for paths starting with a dot ('.'),
	 *     <code>mOptions.bindDotContext=false</code> turns off the automatic binding to the
	 *     dot variable <code>mVariables["."]</code>. <code>mOptions.bindDotContext</code> has
	 *     no effect when <code>mOptions.bindContext=false</code>.</li>
	 * </ul>
	 *
	 * @function
	 * @private
	 * @ui5-restricted sap.ui.core
	 * @since 1.69
	 *
	 * @param {string} sPath Path
	 * @param {object} [mVariables] An object containing the mapping of variable name to object or function
	 * @param {object} [mOptions] Options
	 * @param {boolean} [mOptions.preferDotContext=false] Whether the path not starting with a dot ('.') is
	 *  resolved under the dot variable when it can not be resolved through the given variables object.
	 * @param {boolean} [mOptions.bindContext=true] When the resolved value is a function, whether the
	 *  resolved function is bound to a context. When this property is set to false, the
	 *  mOptions.bindDotContext has no effect anymore.
	 * @param {boolean} [mOptions.bindDotContext=true] When the resolved value is a function, whether the
	 *  resolved function from a path which starts with a dot ('.') should be bound to the dot context
	 * @returns {any} Returns the value located in the provided path, or <code>undefined</code> if the path
	 *  does not exist completely.
	 * @alias module:sap/base/util/resolveReference
	 */
	var resolveReference = function(sPath, mVariables, mOptions) {
		// fill the default values
		mVariables = mVariables || {};
		mOptions = mOptions || {};
		mOptions.bindContext = mOptions.bindContext !== false;
		mOptions.bindDotContext = mOptions.bindDotContext !== false;

		var aParts = sPath.split("."),
			// if sPath starts with ".", split returns an empty string
			// at the first position and the dot is used as variable
			sVariable = aParts.shift() || ".",
			bDotCase = sVariable === ".",
			vRef = oNotFound;

		// push the first part back to the array
		aParts.unshift(sVariable);

		// if preferDotContext, resolve the sPath under the dot context first for sPath which doesn't begin with "."
		if (mOptions.preferDotContext && !bDotCase) {
			vRef =  _resolve(aParts, mVariables["."], {
				bindContext: mOptions.bindContext && mOptions.bindDotContext,
				// resolve function in dot variable should always bind the dot variable
				rootContext: mVariables["."]
			});
		}

		// If no value is returned, resolve the path under mVariables
		if (!vRef || vRef === oNotFound) {
			vRef = _resolve(aParts, mVariables, {
				bindContext: mOptions.bindContext
					// dot case: mOptions.bindDotContext determins whether context should be bound
					// non dot case: bind context if sPath contains more than one segment
					&& (bDotCase ? mOptions.bindDotContext : (aParts.length > 1)),
				rootContext: bDotCase ? mVariables["."] : undefined
			});
		}

		// resolve the path under global scope, only when it can't be resolved under mVariables
		if (vRef === oNotFound) {
			// fallback if no value could be found under the given sPath's first segment
			// otherwise resolve under global namespace
			vRef = ObjectPath.get(sPath);
		}

		return vRef;
	};

	return resolveReference;
});
