/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/context/Context",
	"sap/base/Log"
], function(
	LrepConnector,
	Utils,
	LayerUtils,
	Context,
	Log
) {
	"use strict";

	/**
	 * Helper object to process and filter changes by contexts
	 *
	 * @namespace
	 * @alias sap.ui.fl.context.ContextManager
	 * @since 1.38.0
	 * @author SAP SE
	 * @version ${version}
	 */
	var ContextManager;

	ContextManager = {
		_oContext: new Context({
			configuration : {
				device : "sap/ui/fl/context/DeviceContextProvider",
				switches : "sap/ui/fl/context/SwitchContextProvider"
			}
		}),
		_oLrepConnector: LrepConnector.createConnector(),

		/**
		 * Helper to check if a passed change is free of contexts or in a matching context.
		 *
		 * @param {sap.ui.fl.Change} oChange - change object which has to be filtered
		 * @param {sap.ui.fl.Context[]} aActiveContexts - active runtime or designtime context
		 * @returns {boolean} is change context free or has a valid context
		 */
		doesContextMatch: function (oChange, aActiveContexts) {
			var sChangeContext = oChange.context || "";

			if (!sChangeContext) {
				// change is free of context (always applied)
				return true;
			}

			return aActiveContexts && aActiveContexts.indexOf(sChangeContext) !== -1;
		},

		/**
		 * Helper to filter passed context objects.
		 * This method loops over each context object and check for its current validity
		 *
		 * @param {sap.ui.fl.Context[]} aContextObjects - context objects within the application
		 * @returns {Promise|string[]} aActiveContexts - Promise returning or direct build array containing ids of context objects
		 */
		getActiveContexts: function (aContextObjects) {
			var aDesignTimeContextIdsByUrl = this._getContextIdsFromUrl();

			if (aDesignTimeContextIdsByUrl.length === 0) {
				// [default: runtime] use runtime contexts
				return this._getContextParametersFromAPI(aContextObjects)
					.then(this._getActiveContextsByAPIParameters.bind(this, aContextObjects));
			}

			// [designtime] use url parameters to determine the current active context(s)
			return Promise.resolve(this._getActiveContextsByUrlParameters(aContextObjects, aDesignTimeContextIdsByUrl));
		},

		/**
		 * Helper to retreive the context parameters from the instanciated context api
		 *
		 * @param {sap.ui.fl.Context[]} aContextObjects - context objects within the application
		 * @returns {Promise} aRuntimeContextParameters - Promise resolving with a map of context keys and their current values
		 */
		_getContextParametersFromAPI: function (aContextObjects) {
			var aRequiredContextParameters = [];

			aContextObjects.forEach(function (oContext) {
				oContext.parameters.forEach(function (oContextParameter) {
					var sSelector = oContextParameter.selector;
					if (aRequiredContextParameters.indexOf(sSelector) === -1) {
						aRequiredContextParameters.push(sSelector);
					}
				});
			});

			return this._oContext.getValue(aRequiredContextParameters);
		},

		/**
		 * Function to filter all contexts by the passed runtime context parameters.
		 *
		 * @param {object[]} aContextObjects - context objects within the application
		 * @param {object} aRuntimeContextParameters - map of context keys and their current values
		 * @returns {string[]} aActiveContexts - id list of all active contexts
		 */
		_getActiveContextsByAPIParameters: function (aContextObjects, aRuntimeContextParameters) {
			var that = this;
			var aActiveContexts = [];

			aContextObjects.forEach(function (oContext) {
				if (that._isContextObjectActive(oContext, aRuntimeContextParameters)) {
					aActiveContexts.push(oContext.id);
				}
			});

			return aActiveContexts;
		},

		/**
		 * Function to filter all contexts by the context URL parameters.
		 *
		 * @param {string[]} aDesignTimeContextIdsByUrl - list of ids passed via URL
		 * @param {object[]} aContextObjects - context objects within the application
		 * @returns {string[]} aActiveContexts - id list of all active contexts
		 */
		_getActiveContextsByUrlParameters: function(aContextObjects, aDesignTimeContextIdsByUrl) {
			var aActiveContexts = [];

			aContextObjects.forEach(function (oContext) {
				var bContextActive = ((aDesignTimeContextIdsByUrl ? Array.prototype.indexOf.call(aDesignTimeContextIdsByUrl, oContext.id) : -1)) !== -1;

				if (bContextActive) {
					aActiveContexts.push(oContext.id);
				}
			});

			return aActiveContexts;
		},

		/**
		 * Helper to filter passed context object.
		 * If a passed context is not within the context objects of the given application the context is filtered.
		 *
		 * The filtering is done
		 * [At runtime] by comparing the parameters of the context objects with the actual runtime context.
		 * [At designtime] by comparing the id of the context objects with the set url parameter "sap-ui-designTimeContexts"
		 *
		 * @param {object} oContext - context object to be validated
		 * @param {object[]} aRuntimeContextParameters - context parameter returned form the context providers
		 * @returns {boolean} bContextActive - determines if the passed context matches the context of the current environment
		 * @private
		 */
		_isContextObjectActive: function(oContext, aRuntimeContextParameters) {
			var that = this;
			var bContextActive = true;

			var aParameterOfContext = oContext.parameters;
			aParameterOfContext.every(function (oParameter) {
				bContextActive = bContextActive && that._checkContextParameter(oParameter, aRuntimeContextParameters);
				return bContextActive; // breaks loop on false
			});

			return bContextActive;
		},

		/**
		 * Helper to get the url parameter or an empty array if the url parameter is not present
		 *
		 * @returns {string[]} context object ids
		 * @private
		 */
		_getContextIdsFromUrl: function () {
			var sContextIdsUrlParameter = Utils.getUrlParameter("sap-ui-flexDesignTimeContext");

			if (!sContextIdsUrlParameter) {
				return [];
			}

			return sContextIdsUrlParameter.split(",");
		},

		/**
		 * Checks a single condition of a context object. Returns true if the condition matches the current runtime context.
		 *
		 * @param {Object} oParameter - context within an sap.ui.fl.Change
		 * @param {string} oParameter.selector - key of a runtime context
		 * @param {string} oParameter.operator - determine which comparison has to be executed
		 * @param {string} oParameter.value - value which has to be matched within the key
		 * @param {Object} aRuntimeContext - key value pairs of the current runtime context
		 * @returns {boolean} bContextValid - context of the changes matches
		 * @private
		 */
		_checkContextParameter: function (oParameter, aRuntimeContext) {
			var sSelector = oParameter.selector;
			var sOperator = oParameter.operator;
			var oValue = oParameter.value;

			switch (sOperator) {
				case "EQ":
					return this._checkEquals(sSelector, oValue, aRuntimeContext);
				case "NE":
					return !this._checkEquals(sSelector, oValue, aRuntimeContext);
				default:
					Log.info("A context within a flexibility change with the operator '" + sOperator + "' could not be verified");
					return false;
			}
		},

		/**
		 * Equals-comparison for the _checkContent functionality.
		 *
		 * @param {string} sSelector - key of a runtime context
		 * @param {object} oValue - value which has to be matched within the key
		 * @param {Object} aRuntimeContext - key value pairs of the current runtime context
		 * @returns {boolean} isEquals - passed value is equals to the value within the runtime context found under the passed key
		 * @private
		 */
		_checkEquals: function (sSelector, oValue, aRuntimeContext) {
			return aRuntimeContext[sSelector] === oValue;
		},

		/**
		 *
		 * @param {string} oPropertyBag.id - contextID if not present it will be generated
		 * @param {string} oPropertyBag.reference - reference (app variant id or componentName.Component" in which the context is present
		 * @param {string} oPropertyBag.title - human readable title of the context
		 * @param {string} oPropertyBag.description - human readable description of the context
		 * @param {Object[]} oPropertyBag.parameters - Runtime context parameters required to match the active context
		 * @param {string} oPropertyBag.parameters.selector - runtime context name
		 * @param {string} oPropertyBag.parameters.operator - Comparison method
		 * @param {Object} oPropertyBag.parameters.value - Value passed to the comparison
		 * @param {Object} oPropertyBag.validAppVersions - Application versions (format: major.minor.patch) where the context is active
		 * @param {String} oPropertyBag.validAppVersions.creation - Original application version
		 * @param {String} oPropertyBag.validAppVersions.from - Minimum application version
		 * @param {String} oPropertyBag.validAppVersions.to - Maximum application version
		 * @param {String} [oPropertyBag.generator] - Tool which is used to generate the context file
		 */
		createOrUpdateContextObject: function (oPropertyBag) {
			if (!oPropertyBag.reference) {
				throw new Error("no reference passed for the context object");
			}

			if (!oPropertyBag.namespace) {
				throw new Error("no namespace passed for the context object");
			}

			var sId = oPropertyBag.id || Utils.createDefaultFileName();

			oPropertyBag = {
				id: sId,
				fileName: sId,
				title: oPropertyBag.title || "",
				description: oPropertyBag.description || "",
				parameters: oPropertyBag.parameters || [],
				fileType: "context",
				reference: oPropertyBag.reference || "",
				packageName: oPropertyBag.packageName || "",
				layer: oPropertyBag.layer || LayerUtils.getCurrentLayer(false),
				namespace: oPropertyBag.namespace,
				creation: oPropertyBag.creation || "",
				originalLanguage: oPropertyBag.originalLanguage || Utils.getCurrentLanguage(),
				support: oPropertyBag.support || {
					generator: oPropertyBag.generator || "",
					service: "",
					user: ""
				},
				validAppVersions: oPropertyBag.validAppVersions || {}
			};

			var sUri = "/sap/bc/lrep/content/" + oPropertyBag.namespace + oPropertyBag.fileName + ".context";
			sUri += "?layer=" + oPropertyBag.layer;
			var sMethod = "PUT";
			return this._oLrepConnector.send(sUri, sMethod, oPropertyBag, {});
		}
	};

	return ContextManager;
}, true);