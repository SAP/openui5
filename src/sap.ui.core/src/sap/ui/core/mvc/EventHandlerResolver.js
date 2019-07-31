/*!
 * ${copyright}
 */

// Provides module sap.ui.core.mvc.EventHandlerResolver.
sap.ui.define([
	"sap/ui/base/BindingParser",
	"sap/ui/core/CommandExecution",
	"sap/ui/model/BindingMode",
	"sap/ui/model/CompositeBinding",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/base/ManagedObjectModel",
	"sap/base/util/JSTokenizer",
	"sap/base/util/ObjectPath",
	"sap/base/util/resolveReference",
	"sap/base/Log"
],
	function(
		BindingParser,
		CommandExecution,
		BindingMode,
		CompositeBinding,
		JSONModel,
		MOM,
		JSTokenizer,
		ObjectPath,
		resolveReference,
		Log
	) {
		"use strict";

		var EventHandlerResolver = {

			/**
			 * Helper method to resolve an event handler either locally (from a controller) or globally.
			 *
			 * Which contexts are checked for the event handler depends on the syntax of the name:
			 * <ul>
			 * <li><i>relative</i>: names starting with a dot ('.') must specify a handler in
			 *     the controller (example: <code>".myLocalHandler"</code>)</li>
			 * <li><i>absolute</i>: names that contain, but do not start with a dot ('.') are first checked
			 *     against the given local variables <code>mLocals</code>. When it can't be resolved, it's
			 *     then assumed to mean a global handler function. {@link jQuery.sap.getObject}
			 *     will be used to retrieve the function (example: <code>"some.global.handler"</code> )</li>
			 * <li><i>legacy</i>: Names that contain no dot at all are first checked against the
			 *     <code>oController</code>. If nothing is found, it's interpreted as a relative name and
			 *     then - if nothing is found - as an absolute name. This variant is only supported for
			 *     backward compatibility (example: <code>"myHandler"</code>)</li>
			 * </ul>
			 *
			 * The event handler name can either be a pure function name (defined in the controller, or globally,
			 * as explained above), or the function name can be followed by braces containing parameters that
			 * shall be passed to the handler instead of the event object. In case of braces the entire string is
			 * parsed like a binding expression, so in addition to static values also bindings and certain operators
			 * can be used.
			 *
			 * As long as no event handler parameters are specified and regardless of where the function
			 * was looked up, the event handler will be executed with the given <code>oController</code>
			 * as the context object ('this'). This should allow the implementation of generic global
			 * handlers that might need an easy back link to the controller/view in which they are currently
			 * used (e.g. to call createId/byId). It also makes the development of global event handlers
			 * more consistent with controller local event handlers. However, once event parameters are specified,
			 * the 'this' context is always the object on which the handler function is defined.
			 *
			 * <strong>Note</strong>: It is not mandatory but improves readability of declarative views when
			 * legacy names are converted to relative names where appropriate.
			 *
			 * @param {string} sName the event handler name to resolve
			 * @param {sap.ui.core.mvc.Controller} oController the controller to use as context
			 * @param {object} [mLocals] local variables allowed in the sName as map of variable name to value
			 * @return {any[]} an array with function and context object, suitable for applySettings.
			 * @private
			 */
			resolveEventHandler: function(sName, oController, mLocals) {

				var fnHandler, iStartBracket, sFunctionName;
				sName = sName.trim();

				if (sap.ui.getCore().getConfiguration().getControllerCodeDeactivated()) {
					// When design mode is enabled, controller code is not loaded. That is why we stub the handler functions.
					fnHandler = function() {};
				} else {
					//check for command usage - create handler that triggers the CommandExecution
					if (sName.startsWith("cmd:")) {
						var sCommand = sName.substr(4);
						fnHandler = function(oEvent) {
							var oCommandExecution = CommandExecution.find(oEvent.getSource(), sCommand);
							if (oCommandExecution) {
								oCommandExecution.trigger();
							} else {
								Log.error("Handler '" + sName + "' could not be resolved. No CommandExecution defined for command: " + sCommand);
							}
						};
					} else {
						// check for extended event handler syntax
						iStartBracket = sName.indexOf("(");
						sFunctionName = sName;

						if (iStartBracket > 0) {
							sFunctionName = sName.substring(0, iStartBracket).trim();
						} else if (iStartBracket === 0) {
							throw new Error("Event handler name starts with a bracket, must start with a function name " +
									"(or with a dot followed by controller-local function name): " + sName);
						}

						fnHandler = resolveReference(sFunctionName,
							Object.assign({".": oController}, mLocals), {
								// resolve a name without leading dot under oController only when it doesn't contains dot
								preferDotContext: sFunctionName.indexOf(".") === -1,
								// the resolved function shouldn't be bound to any context because it may need to be bound
								// to controller regardless where the handler is resolved if the sFunctionName doesn't have
								// parentheses
								bindContext: false
							}
						);
					}
					// handle extended event handler syntax
					if (fnHandler && iStartBracket > 0) {
						var iEndBracket = sName.lastIndexOf(")");
						if (iEndBracket > iStartBracket) {

							if (sName.substring(iStartBracket).indexOf("{=") > -1) {
								Log.warning("It looks like an event handler parameter contains a binding expression ({=...}). This is not allowed and will cause an error later on " +
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

									var mEventHandlerVariables = {"$controller": oController, $event: oEvent};

									if (sFunctionName.indexOf(".") > 0) {
										// if function has no leading dot (which would mean it is a Controller method), but has a dot later on, accept the first component as global object
										var sGlobal = sFunctionName.split(".")[0];
										mEventHandlerVariables[sGlobal] = window[sGlobal];
									} else if (sFunctionName.indexOf(".") === -1) {
										if (oController && oController[sFunctionName]) {
											// if function has no dot at all, and oController has a member with the same name, this member should be used as function
											// (this tells the expression parser to use the same logic as applied above)
											sExpression = "$controller." + sExpression;
										} else if (window[sFunctionName]) {
											mEventHandlerVariables[sFunctionName] = window[sFunctionName];
										}
									}

									// if a scope object exist, assign the scope object to the global object
									Object.assign(mEventHandlerVariables, mLocals);

									// the following line evaluates the expression
									// in case all parameters are constants, it already calls the event handler along with all its arguments, otherwise it returns a binding info
									var oExpressionParserResult = BindingParser.parseExpression(sExpression.replace(/^\./, "$controller."), 0, {oContext: oController}, mEventHandlerVariables);

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
							Log.error("Syntax error in event handler '" + sName + "': arguments must be enclosed in a pair of brackets");
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

				Log.warning("Event handler name '" + sName + "' could not be resolved to an event handler function");
				// return undefined
			},

			/**
			 * Parses and splits the incoming string into meaningful event handler definitions
			 *
			 * Examples:
			 *
			 * parse(".fnControllerMethod")
			 * => [".fnControllerMethod"]
			 *
			 * parse(".doSomething('Hello World'); .doSomething2('string'); globalFunction")
			 * => [".doSomething('Hello World')", ".doSomething2('string')", "globalFunction"]

			 * parse(".fnControllerMethod; .fnControllerMethod(${  path:'/someModelProperty', formatter: '.myFormatter', type: 'sap.ui.model.type.String'}    ); globalFunction")
			 * => [".fnControllerMethod", ".fnControllerMethod(${  path:'/someModelProperty', formatter: '.myFormatter', type: 'sap.ui.model.type.String'}    )", "globalFunction"]
			 *
			 * @param [string] sValue - Incoming string
			 * @return {string[]} - Array of event handler definitions
			 */
			parse: function parse(sValue) {
				sValue = sValue.trim();
				var oTokenizer = new JSTokenizer();
				var aResult = [];
				var sBuffer = "";
				var iParenthesesCounter = 0;

				oTokenizer.init(sValue, 0);
				for (;;) {
					var sSymbol = oTokenizer.next();
					if ( sSymbol === '"' || sSymbol === "'" ) {
						var pos = oTokenizer.getIndex();
						oTokenizer.string();
						sBuffer += sValue.slice(pos, oTokenizer.getIndex());
						sSymbol = oTokenizer.getCh();
					}
					if ( !sSymbol ) {
						break;
					}
					switch (sSymbol) {
						case "(":
							iParenthesesCounter++;
							break;
						case ")":
							iParenthesesCounter--;
							break;
					}

					if (sSymbol === ";" && iParenthesesCounter === 0) {
						aResult.push(sBuffer.trim());
						sBuffer = "";
					} else {
						sBuffer += sSymbol;
					}
				}

				if (sBuffer) {
					aResult.push(sBuffer.trim());
				}

				return aResult;
			}
		};

		function getBindingValue(oBindingInfo, oElement, oController, oParametersModel, oSourceModel) { // TODO: refactor ManagedObject and re-use parts that have been copied here
			var oType, oPart;
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

				oPart = oBindingInfo.parts[i];
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

			var clType, oContext, oBinding, aBindings = [];
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
					clType = ObjectPath.get(oType);
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
					clType = ObjectPath.get(oType);
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
