/*!
 * ${copyright}
 */

// Provides module sap.ui.core.mvc.EventHandlerResolver.
sap.ui.define([
		"jquery.sap.global",
		"sap/ui/base/ManagedObject",
		"sap/ui/base/BindingParser",
		"sap/ui/core/Element",
		"sap/ui/model/BindingMode",
		"sap/ui/model/CompositeBinding",
		"sap/ui/model/json/JSONModel", // TODO: think about lazy-loading in async case
		"sap/ui/model/base/ManagedObjectModel"
	],
	function(jQuery, ManagedObject, BindingParser, Element, BindingMode, CompositeBinding, JSONModel, MOM) {
		"use strict";

		var EventHandlerResolver = {

			/**
			 * Helper method to resolve an event handler either locally (from a controller) or globally.
			 *
			 * Which contexts are checked for the event handler depends on the syntax of the name:
			 * <ul>
			 * <li><i>relative</i>: names starting with a dot ('.') must specify a handler in
			 *     the controller (example: <code>".myLocalHandler"</code>)</li>
			 * <li><i>absolute</i>: names that contain, but do not start with a dot ('.') are
			 *     always assumed to mean a global handler function. {@link jQuery.sap.getObject}
			 *     will be used to retrieve the function (example: <code>"some.global.handler"</code> )</li>
			 * <li><i>legacy</i>: Names that contain no dot at all are first interpreted as a relative name
			 *     and then - if nothing is found - as an absolute name. This variant is only supported
			 *     for backward compatibility (example: <code>"myHandler"</code>)</li>
			 * </ul>
			 *
			 * The returned settings will always use the given <code>oController</code> as context object ('this')
			 * This should allow the implementation of generic global handlers that might need an easy back link
			 * to the controller/view in which they are currently used (e.g. to call createId/byId). It also makes
			 * the development of global event handlers more consistent with controller local event handlers.
			 *
			 * The event handler name can either be a pure function name (defined in the controller, or globally,
			 * as explained above), or the function name can be followed by braces containing parameters that
			 * shall be passed to the handler instead of the event object. In case of braces the entire string is
			 * parsed like a binding expression, so in addition to static values also bindings and certain operators
			 * can be used.
			 *
			 * <strong>Note</strong>: It is not mandatory but improves readability of declarative views when
			 * legacy names are converted to relative names where appropriate.
			 *
			 * @param {string} sName the event handler name to resolve
			 * @param {sap.ui.core.mvc.Controller} oController the controller to use as context
			 * @return {any[]} an array with function and context object, suitable for applySettings.
			 * @private
			 */
			resolveEventHandler: function(sName, oController) {

				var fnHandler;
				sName = sName.trim();

				if (sap.ui.getCore().getConfiguration().getControllerCodeDeactivated()) {
					// When design mode is enabled, controller code is not loaded. That is why we stub the handler functions.
					fnHandler = function() {};
				} else {
					// check for extended event handler syntax
					var iStartBracket = sName.indexOf("("),
						sFunctionName = sName;
					if (iStartBracket > 0) {
						sFunctionName = sName.substring(0, iStartBracket).trim();
					} else if (iStartBracket === 0) {
						throw new Error("Event handler name starts with a bracket, must start with a function name " +
								"(or with a dot followed by controller-local function name): " + sName);
					}

					switch (sFunctionName.indexOf('.')) {
						case 0:
							// starts with a dot, must be a controller local handler
							// usage of jQuery.sap.getObject to allow addressing functions in properties
							fnHandler = oController && jQuery.sap.getObject(sFunctionName.slice(1), undefined, oController);
							break;
						case -1:
							// no dot at all: first check for a controller local, then for a global handler
							fnHandler = oController && oController[sFunctionName];
							if ( fnHandler != null ) {
								// If the name can be resolved, don't try to find a global handler (even if it is not a function).
								break;
							}
							// falls through
						default:
							fnHandler = jQuery.sap.getObject(sFunctionName);
					}

					// handle extended event handler syntax
					if (fnHandler && iStartBracket > 0) {
						var iEndBracket = sName.lastIndexOf(")");
						if (iEndBracket > iStartBracket) {

							if (sName.substring(iStartBracket).indexOf("{=") > -1) {
								jQuery.sap.log.warning("It looks like an event handler parameter contains a binding expression ({=...}). This is not allowed and will cause an error later on " +
									"because the entire event handler is already considered an expression: " + sName);
							}

							// create a new handler function as wrapper that internally provides the configured values as arguments to the actual handler function
							fnHandler = (function(sFunctionName, oController) { // the previous fnHandler is not used because the expression parser resolves and calls the original handler function
								return function(oEvent) { // the actual event handler function; soon enriched with more context, then calling the configured fnHandler

									var oParametersModel, oSourceModel,
										sExpression = sName; // the expression to actually pass to the parser;

									// configure the resolver element with additional models
									if (sName.indexOf("$parameters") > -1) {
										oParametersModel = new JSONModel(oEvent.mParameters);
									}
									if (sName.indexOf("$source") > -1) {
										oSourceModel = new MOM(oEvent.getSource());
									}

									var mGlobals = {"$controller": oController, $event: oEvent};
									if (sFunctionName.indexOf(".") > 0) {
										// if function has no leading dot (which would mean it is a Controller method), but has a dot later on, accept the first component as global object
										var sGlobal = sFunctionName.split(".")[0];
										mGlobals[sGlobal] = window[sGlobal];

									} else if (sFunctionName.indexOf(".") === -1) {
										if (oController && oController[sFunctionName]) {
											// if function has no dot at all, and oController has a member with the same name, this member should be used as function
											// (this tells the expression parser to use the same logic as applied above)
											sExpression = "$controller." + sExpression;

										} else if (window[sFunctionName]) {
											mGlobals[sFunctionName] = window[sFunctionName];
										}
									}

									// the following line evaluates the expression
									// in case all parameters are constants, it already calls the event handler along with all its arguments, otherwise it returns a binding info
									var oExpressionParserResult = BindingParser.parseExpression(sExpression.replace(/^\./, "$controller."), 0, {oContext: oController}, mGlobals);

									if (oExpressionParserResult.result) { // a binding info
										// we need to trigger evaluation (but we don't need the result, evaluation already calls the event handler)
										try {
											getBindingValue(oExpressionParserResult.result, oEvent.getSource(), oController, oParametersModel, oSourceModel);
										} catch (e) {
											e.message = "Error when evaluating event handler '" + sName + "': " + e.message;
											throw e;
										}
									}

									if (oParametersModel) {
										oParametersModel.destroy();
									}
									if (oSourceModel) {
										oSourceModel.destroy();
									}
								};
							})(sFunctionName, oController);
						} else {
							jQuery.sap.log.error("Syntax error in event handler '" + sName + "': arguments must be enclosed in a pair of brackets");
						}
					}
				}

				if ( typeof fnHandler === "function" ) {
					// the original handler definition is set as property of the resulting function to keep this information
					// e.g. for serializers which convert a control tree back to a serialized format
					fnHandler._sapui_handlerName = sName;
					// always attach the handler with the controller as context ('this')
					return [ fnHandler, oController ];
				}

				jQuery.sap.log.warning("Event handler name '" + sName + "' could not be resolved to an event handler function");
				// return undefined
			}
		};

		function getBindingValue(oBindingInfo, oElement, oController, oParametersModel, oSourceModel) { // TODO: refactor ManagedObject and re-use parts that have been copied here
			var oType;
			oBindingInfo.mode = BindingMode.OneWay;

			if (!oBindingInfo.parts) {
				oBindingInfo.parts = [];
				oBindingInfo.parts[0] = {
					path: oBindingInfo.path,
					targetType: oBindingInfo.targetType,
					type: oBindingInfo.type,
					suspended: oBindingInfo.suspended,
					formatOptions: oBindingInfo.formatOptions,
					constraints: oBindingInfo.constraints,
					model: oBindingInfo.model,
					mode: oBindingInfo.mode
				};
				delete oBindingInfo.path;
				delete oBindingInfo.targetType;
				delete oBindingInfo.mode;
				delete oBindingInfo.model;
			}

			for (var i = 0; i < oBindingInfo.parts.length; i++) {

				var oPart = oBindingInfo.parts[i];
				if (typeof oPart == "string") {
					oPart = { path: oPart };
					oBindingInfo.parts[i] = oPart;
				}

				if (!oPart.path && oPart.parts) {
					throw new Error("Bindings in event handler parameters cannot use parts. Just use one single path.");
				}

				// if a model separator is found in the path, extract model name and path
				var iSeparatorPos = oPart.path.indexOf(">");
				if (iSeparatorPos > 0) {
					oPart.model = oPart.path.substr(0, iSeparatorPos);
					oPart.path = oPart.path.substr(iSeparatorPos + 1);
				}
			}

			var oContext, oBinding, aBindings = [];
			oBindingInfo.parts.forEach(function(oPart) {
				var oModel;
				if (oPart.model === "$parameters") {
					oModel = oParametersModel;
					oContext = oParametersModel.createBindingContext("/");
				} else if (oPart.model === "$source") {
					oModel = oSourceModel;
					oContext = oSourceModel.createBindingContext("/");
				} else {
					oModel = oElement.getModel(oPart.model);
					oContext = oElement.getBindingContext(oPart.model);
				}

				oType = oPart.type;
				if (typeof oType == "string") {
					clType = jQuery.sap.getObject(oType);
					if (typeof clType !== "function") {
						throw new Error("Cannot find type \"" + oType + "\" used for binding \"" + oPart.path + "\"!");
					}
					oType = new clType(oPart.formatOptions, oPart.constraints);
				}

				oBinding = oModel.bindProperty(oPart.path, oContext, oBindingInfo.parameters);
				oBinding.setType(oType /* type that is able to parse etc. */, oPart.targetType /* string, boolean, etc. */ || "any");
				oBinding.setFormatter(oPart.formatter);
				oBinding.setBindingMode(BindingMode.OneTime);
				aBindings.push(oBinding);
			});

			// check if we have a composite binding or a formatter function created by the BindingParser which has property textFragments
			if (aBindings.length > 1 || ( oBindingInfo.formatter && oBindingInfo.formatter.textFragments )) {
				// Create type instance if needed
				oType = oBindingInfo.type;
				if (typeof oType == "string") {
					var clType = jQuery.sap.getObject(oType);
					oType = new clType(oBindingInfo.formatOptions, oBindingInfo.constraints);
				}
				oBinding = new CompositeBinding(aBindings, oBindingInfo.useRawValues, oBindingInfo.useInternalValues);
				oBinding.setType(oType /* type that is able to parse etc. */, oPart.targetType /* string, boolean, etc. */ || "any");
				oBinding.setBindingMode(BindingMode.OneTime);
			} else {
				oBinding = aBindings[0];
			}

			oBinding.setFormatter(oBindingInfo.formatter); // this context is overridden by view parser (it assigns the controller)
			oBinding.initialize();

			return oBinding.getExternalValue();
		}

		return EventHandlerResolver;
	}
);