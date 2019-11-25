/*!
 * ${copyright}
 */

// Provides implementation of sap.ui.documentation.sdk.thirdparty.jsanalyzer.EntityParser
sap.ui.define(['sap/ui/base/ManagedObjectMetadata', './ASTUtils', './Doclet', 'sap/ui/documentation/sdk/thirdparty/esprima',
	"sap/base/Log"],
	function (MOMetadata, ASTUtils, Doclet, esprima_, Log) {

		"use strict";

		/*global esprima */

		var Syntax = esprima.Syntax;

		/* ---- private functions ---- */

		/**
		 * Name of the package in which the currently analyzed entity resides.
		 *
		 * Used to resolve relative dependencies in sap.ui.define calls.
		 *
		 * @type {string}
		 * @private
		 */
		var currentPackage;

		/**
		 * List of collected info objects. A JS file might contain multiple class and/or type definitions.
		 *
		 * @type {object[]}
		 * @private
		 */
		var aInfos;

		/**
		 * Object with all the parsed public functions
		 * type {Object}
		 */
		var oPublicFunctions;

		/**
		 * Name of the current control
		 * type {string}
		 */
		var sControlName;

		/**
		 * Cumulated scope information for the currently analyzed module.
		 *
		 * This is not the same as the Javascript scope of any of the functions in the module but it is a projection
		 * of all scopes. It is only maintained to properly recognize sa.ui.base.DataType and some other core classes
		 * with a specific meaning for the class / type analysis (e.g. jQuery).
		 *
		 * Keys in the map are names of local variables, values are their corresponding global name (if known).
		 *
		 * For a full fledged scope analysis, either the StaticAnalyzer needs to be migrated or an opensource
		 * component like 'escope' could be integrated.
		 *
		 * @type {Object<string,string>}
		 * @private
		 */
		var scope; // TODO implement scope properly using escope

		// some shortcuts
		var createPropertyMap = ASTUtils.createPropertyMap;
		var unlend = ASTUtils.unlend;
		var guessSingularName = MOMetadata._guessSingularName;
		var getLeadingDoclet = Doclet.get;
		var error = Log.error;
		var warning = Log.warning;
		var verbose = Log.debug;

		function isExtendCall(node) {

			return (
				node
				&& node.type === Syntax.CallExpression
				&& node.callee.type === Syntax.MemberExpression
				&& node.callee.property.type === Syntax.Identifier
				&& node.callee.property.name === 'extend'
				&& node.arguments.length >= 2
				&& node.arguments[0].type === Syntax.Literal
				&& typeof node.arguments[0].value === "string"
				&& unlend(node.arguments[1]).type === Syntax.ObjectExpression
			);

		}

		function isSapUiDefineCall(node) {

			return (
				node
				&& node.type === Syntax.CallExpression
				&& node.callee.type === Syntax.MemberExpression
				&& /* TODO currentScope.getContext(). */ getObjectName(node.callee) === 'sap.ui.define'
			);

		}

		function getObjectName(node) {
			if ( node.type === Syntax.MemberExpression ) {
				var prefix = getObjectName(node.object);
				return prefix ? prefix + "." + node.property.name : null;
			} else if ( node.type === Syntax.Identifier ) {
				return scope[node.name] ? scope[node.name] : node.name;
			} else {
				return null;
			}
		}

		function convertValue(node, type) {

			var value;

			if ( node.type === Syntax.Literal ) {

				// 'string' or number or true or false
				return node.value;

			} else if ( node.type === Syntax.UnaryExpression
				&& node.prefix
				&& node.argument.type === Syntax.Literal
				&& typeof node.argument.value === 'number'
				&& ( node.operator === '-' || node.operator === '+' )) {

				// -n or +n
				value = node.argument.value;
				return node.operator === '-' ? -value : value;

			} else if ( node.type === Syntax.MemberExpression && type ) {

				// enum value (a.b.c)
				value = getObjectName(node);
				if ( value.indexOf(type + ".") === 0 ) {
					// fully qualified enum name
					return value.slice(type.length + 1);
				} else if ( value.indexOf(type.split(".").slice(-1)[0] + ".") === 0 ) {
					// local name (just a guess - needs static code analysis)
					return value.slice(type.split(".").slice(-1)[0].length + 1);
				} else {
					warning("did not understand default value '%s', falling back to source", value);
					return value;
				}

			} else if ( node.type === Syntax.Identifier
				&& node.name === 'undefined') {

				// undefined
				return undefined;

			} else if ( node.type === Syntax.ArrayExpression
				&& node.elements.length === 0 ) {

				// empty array literal
				return "[]"; // TODO return this string or an empty array
			}

			error("unexpected type of default value (type='%s', source='%s'), falling back to '???'", node.type, JSON.stringify(node, null, "\t"));
			return '???';
		}

		function collectClassInfo(extendCall, classDoclet) {

			var baseType = getObjectName(extendCall.callee.object);

			var oClassInfo = {
				metatype: 'control',
				name: extendCall.arguments[0].value,
				baseType: baseType,
				doc: classDoclet && (classDoclet.classdesc || classDoclet.description),
				deprecation: classDoclet && classDoclet.deprecated,
				since: classDoclet && classDoclet.since,
				experimental: classDoclet && classDoclet.experimental,
				specialSettings : {},
				properties: {},
				aggregations: {},
				associations: {},
				events: {},
				methods: {}
			};

			function upper(n) {
				return n.slice(0,1).toUpperCase() + n.slice(1);
			}

			function each(node, defaultKey, callback) {
				var map, n, settings, doclet;

				map = node && createPropertyMap(node.value);
				if ( map ) {
					for (n in map) {
						if ( map.hasOwnProperty(n) ) {
							doclet = getLeadingDoclet(map[n]);
							settings = createPropertyMap(map[n].value, defaultKey);
							if ( settings == null ) {
								error("no valid metadata for " + n + " (AST type '" + map[n].value.type + "')");
								continue;
							}

							callback(n, settings, doclet, map[n]);
						}
					}
				}
			}

			var classInfoNode = unlend(extendCall.arguments[1]);
			var classInfoMap = createPropertyMap(classInfoNode);
			if ( classInfoMap && classInfoMap.metadata && classInfoMap.metadata.value.type !== Syntax.ObjectExpression ) {
				warning("class metadata exists but can't be analyzed. It is not of type 'ObjectExpression', but a '" + classInfoMap.metadata.value.type + "'.");
				return null;
			}

			var metadata = classInfoMap && classInfoMap.metadata && createPropertyMap(classInfoMap.metadata.value);
			if ( metadata ) {

				verbose("  analyzing metadata for '" + oClassInfo.name + "'");

				oClassInfo["abstract"] = !!(metadata["abstract"] && metadata["abstract"].value.value);
				oClassInfo["final"] = !!(metadata["final"] && metadata["final"].value.value);

				each(metadata.specialSettings, "readonly", function(n, settings, doclet) {
					oClassInfo.specialSettings[n] = {
						name : n,
						doc : doclet && doclet.description,
						since : doclet && doclet.since,
						deprecation : doclet && doclet.deprecated,
						experimental : doclet && doclet.experimental,
						visibility : (settings.visibility && settings.visibility.value.value) || "public",
						type : settings.type ? settings.type.value.value : "any",
						readonly : (settings.readyonly && settings.readonly.value.value) || true
					};
				});

				each(metadata.properties, "type", function (n, settings, doclet) {
				var type;
					var N = upper(n);
					var methods;
					oClassInfo.properties[n] = {
						name: n,
						doc: doclet && doclet.description,
						since: doclet && doclet.since,
						deprecation: doclet && doclet.deprecated,
						experimental: doclet && doclet.experimental,
						visibility: (settings.visibility && settings.visibility.value.value) || "public",
						type: (type = settings.type ? settings.type.value.value : "string"),
						defaultValue: settings.defaultValue ? convertValue(settings.defaultValue.value, type) : null,
						group : settings.group ? settings.group.value.value : 'Misc',
						bindable : settings.bindable ? !!convertValue(settings.bindable.value) : false,
						methods: (methods = {
							"get": "get" + N,
							"set": "set" + N
						})
					};
					if ( oClassInfo.properties[n].bindable ) {
						methods["bind"] = "bind" + N;
						methods["unbind"] = "unbind" + N;
					}
				});

				oClassInfo.defaultAggregation = (metadata.defaultAggregation && metadata.defaultAggregation.value.value) || undefined;

				each(metadata.aggregations, "type", function (n, settings, doclet) {
					var N = upper(n);
					var methods;
					oClassInfo.aggregations[n] = {
						name: n,
						doc: doclet && doclet.description,
						deprecation: doclet && doclet.deprecated,
						since: doclet && doclet.since,
						experimental: doclet && doclet.experimental,
						visibility: (settings.visibility && settings.visibility.value.value) || "public",
						type: settings.type ? settings.type.value.value : "sap.ui.core.Control",
						singularName: settings.singularName ? settings.singularName.value.value : guessSingularName(n),
						cardinality: (settings.multiple && !settings.multiple.value.value) ? "0..1" : "0..n",
						bindable : settings.bindable ? !!convertValue(settings.bindable.value) : false,
						methods: (methods = {
							"get": "get" + N,
							"destroy": "destroy" + N
						})
					};
					if ( oClassInfo.aggregations[n].cardinality === "0..1" ) {
						methods["set"] = "set" + N;
					} else {
						var N1 = upper(oClassInfo.aggregations[n].singularName);
						methods["insert"] = "insert" + N1;
						methods["add"] = "add" + N1;
						methods["remove"] = "remove" + N1;
						methods["indexOf"] = "indexOf" + N1;
						methods["removeAll"] = "removeAll" + N;
					}
					if ( oClassInfo.aggregations[n].bindable ) {
						methods["bind"] = "bind" + N;
						methods["unbind"] = "unbind" + N;
					}
				});

				each(metadata.associations, "type", function (n, settings, doclet) {
					var N = upper(n);
					var methods;
					oClassInfo.associations[n] = {
						name: n,
						doc: doclet && doclet.description,
						deprecation: doclet && doclet.deprecated,
						since: doclet && doclet.since,
						experimental: doclet && doclet.experimental,
						visibility: (settings.visibility && settings.visibility.value.value) || "public",
						type: settings.type ? settings.type.value.value : "sap.ui.core.Control",
						singularName: settings.singularName ? settings.singularName.value.value : guessSingularName(n),
						cardinality : (settings.multiple && settings.multiple.value.value) ? "0..n" : "0..1",
						methods: (methods = {
							"get": "get" + N
						})
					};
					if ( oClassInfo.associations[n].cardinality === "0..1" ) {
						methods["set"] = "set" + N;
					} else {
						var N1 = upper(oClassInfo.associations[n].singularName);
						methods["add"] = "add" + N1;
						methods["remove"] = "remove" + N1;
						methods["removeAll"] = "removeAll" + N;
					}
				});

				each(metadata.events, null, function (n, settings, doclet) {
					var N = upper(n);
					var info = oClassInfo.events[n] = {
						name: n,
						doc: doclet && doclet.description,
						deprecation: doclet && doclet.deprecated,
						since: doclet && doclet.since,
						experimental: doclet && doclet.experimental,
						allowPreventDefault: !!(settings.allowPreventDefault && settings.allowPreventDefault.value.value),
						parameters : {},
						methods: {
							"attach": "attach" + N,
							"detach": "detach" + N,
							"fire": "fire" + N
						}
					};
					each(settings.parameters, null, function (pName, pSettings, pDoclet) {
						info.parameters[pName] = {
							name: pName,
							doc: pDoclet && pDoclet.description,
							deprecation: pDoclet && pDoclet.deprecated,
							since: pDoclet && pDoclet.since,
							experimental: pDoclet && pDoclet.experimental,
							type: pSettings && pSettings.type ? pSettings.type.value.value : ""
						};
					});
				});
			}

			return oClassInfo;
		}

		function collectEnumInfo(node) {

			var doclet = Doclet.get(node);
			var name = /* TODO currentScope.getContext(). */ getObjectName(node.expression.left);

			if ( name && doclet && doclet.isPublic() ) {

				var oTypeDoc = {
					metatype: "type",
					doc: undefined,
					deprecation: false,
					visibility: 'public'
				};

				oTypeDoc.name = name;
				if ( doclet ) {
					oTypeDoc.doc = doclet.description;
					oTypeDoc.deprecation = doclet.deprecation;
					oTypeDoc.since = doclet.since;
					oTypeDoc.experimental = doclet.experimental;
					// TODO oTypeDoc["final"] = doclet.hasTatypeDocumentation.hasTag("final") ? new SimpleType.Final() : null);
					// TODO simpleType.setDefaultValue(typeDocumentation.getTagContent("defaultvalue"));
				}

				var properties = node.expression.right.properties || [];
				oTypeDoc.values = {};
				for (var i = 0; i < properties.length; i++) {

					// documentation must precede the name/value pair
					var propDoclet = Doclet.get(properties[i]);
					var key = properties[i].key;
					var value = properties[i].value;

					var valueInfo = {};
					// the name of the enum value equals the name in the name/value pair
					if ( key.type == Syntax.Identifier ) {
						valueInfo.name = key.name;
					} else if ( key.type == Syntax.Literal ) {
						valueInfo.name = key.value;
					} else {
						throw new Error();
					}

					// the value equals the value in the name/value pair
					if ( value.type == Syntax.Literal ) {
						valueInfo.value = value.value;
					} else {
						throw new Error();
					}

					if ( propDoclet != null ) {
						valueInfo.doc = propDoclet.description;
						valueInfo.deprecation = propDoclet.deprecation;
						valueInfo.since = propDoclet.since;
						valueInfo.experimental = propDoclet.experimental;
					}

					oTypeDoc.values[valueInfo.name] = valueInfo;

				}

				aInfos.push(oTypeDoc);

			}

		}

		function collectRegExTypeInfo(node) {

			var doclet = Doclet.get(node);
			var name = node.expression.right.arguments[0].value;
			var settings = ASTUtils.createPropertyMap(node.expression.right.arguments[1]);
			var baseType = null;
			if ( node.expression.right.arguments.length > 2
				&& node.expression.right.arguments[2].type == Syntax.CallExpression
				&& node.expression.right.arguments[2].callee.type == Syntax.MemberExpression
				&& /* TODO currentScope.getContext().*/ getObjectName(node.expression.right.arguments[2].callee) == "sap.ui.base.DataType.getType"
				&& node.expression.right.arguments[2].arguments.length > 0
				&& node.expression.right.arguments[2].arguments[0].type == Syntax.Literal ) {
				baseType = node.expression.right.arguments[2].arguments[0].value;
			}

			if ( name && doclet && doclet.isPublic() ) {

				var oTypeDoc = {
					metatype: "type",
					doc: undefined,
					deprecation: false,
					visibility: 'public'
				};

				oTypeDoc.name = name;

				if ( doclet ) {
					oTypeDoc.doc = doclet.description;
					oTypeDoc.deprecation = doclet.deprecation;
					oTypeDoc.since = doclet.since;
					oTypeDoc.experimental = doclet.experimental;
					// TODO oTypeDoc["final"] = doclet.hasTatypeDocumentation.hasTag("final") ? new SimpleType.Final() : null);
				}

				var defaultValue = settings.defaultValue;
				if ( defaultValue ) {
					oTypeDoc.defaultValue = convertValue(defaultValue.value, name);
				}

				var isValid = settings.isValid;
				if ( isValid
					&& isValid.value.type == Syntax.FunctionExpression
					&& isValid.value.body
					&& isValid.value.body.body.length > 0
					&& isValid.value.body.body[0].type == Syntax.ReturnStatement
					&& isValid.value.body.body[0].argument.type == Syntax.CallExpression
					&& isValid.value.body.body[0].argument.callee.type == Syntax.MemberExpression
					&& isValid.value.body.body[0].argument.callee.object.type == Syntax.Literal
					&& isValid.value.body.body[0].argument.callee.object.value instanceof RegExp ) {

					var pattern = isValid.value.body.body[0].argument.callee.object.value.source;
					if ( /^\^\(.*\)\$$/.test(pattern) ) {
						pattern = pattern.slice(2, -2);
					}
					oTypeDoc.pattern = pattern;
				}

				oTypeDoc.baseType = baseType;

				aInfos.push(oTypeDoc);
			}

		}

		function resolveRelativeDependency(dep) {
			return /^\.\//.test(dep) ? currentPackage + dep.slice(1) : dep;
		}

		/**
		 * Get the documentation information needed for a given parameter
		 * @param {string} sParamName
		 * @param {array} aDocTags with documentation tags
		 * @return {Object} with parameter information
		 */
		function getParamInfo(sParamName, aDocTags) {

			//set default parameter type if there are no @ definitions for the type
			var sParamType = '',
				sParamDescription = '',
				iParamNameIndex,
				iDocStartIndex,
				rEgexMatchType = /{(.*)}/,
				aMatch;

			for (var i = 0; i < aDocTags.length; i++) {

				if ( aDocTags[i].tag !== 'param' ) {
					continue;
				}

				aMatch = rEgexMatchType.exec(aDocTags[i].content);
				iParamNameIndex = aDocTags[i].content.indexOf(sParamName);

				if ( aMatch && iParamNameIndex > -1 ) {
					//get the match without the curly brackets
					sParamType = aMatch[1];

					iDocStartIndex = iParamNameIndex + sParamName.length;
					sParamDescription = aDocTags[i].content.substr(iDocStartIndex);

					//clean the doc from - symbol if they come after the param name and trim the extra whitespace
					sParamDescription = sParamDescription.replace(/[-]/, '').trim();

					// prevent unnecessary looping!
					break;
				}
			}

			return {
				name: sParamName,
				type: sParamType,
				doc: sParamDescription
			};
		}

		var delegate = {

			"ExpressionStatement": function (node) {

				if ( isSapUiDefineCall(node.expression) ) {

					var i = 0;
					var dependencies, factory;
					if ( i < node.expression.arguments.length && node.expression.arguments[i].type === Syntax.Literal ) {
						/* name = */
						node.expression.arguments[i++].value;
					}
					if ( i < node.expression.arguments.length && node.expression.arguments[i].type === Syntax.ArrayExpression ) {
						dependencies = node.expression.arguments[i++].elements;
					}
					if ( i < node.expression.arguments.length && node.expression.arguments[i].type === Syntax.FunctionExpression ) {
						factory = node.expression.arguments[i++];
					}
					//			// unused
					//			if ( i < node.expression.arguments.length && node.expression.arguments[i].type === Syntax.FunctionExpression ) {
					//				export_ = node.expression.arguments[i++];
					//			}

					if ( dependencies && factory && factory.params ) {
						for (var j = 0; j < dependencies.length; j++) {
							var dep = dependencies[j].type === Syntax.Literal ? resolveRelativeDependency(dependencies[j].value) : null;
							var paramName = j < factory.params.length ? factory.params[j].name : null;
							if ( dep && paramName ) {
								// TODO this is only a hack. For a proper scope and constant value handling
								// much more needs to be done (e.g. migration of StaticAnalyzer.java)
								scope[paramName] = dep.replace(/\//g, '.');
							}
						}
					}
				}

				// ---- Something = { ... } ----
				if ( node.expression.type == Syntax.AssignmentExpression
					&& node.expression.right.type == Syntax.ObjectExpression
					&& node.expression.left.type == Syntax.MemberExpression ) {

					collectEnumInfo(node);

				}

				// ---- sap.ui.base.DataType.createType ----

				if ( node.expression.type === Syntax.AssignmentExpression
					&& node.expression.right.type === Syntax.CallExpression
					&& node.expression.right.callee.type === Syntax.MemberExpression
					&& node.expression.right.callee.property.type === Syntax.Identifier
					&& node.expression.right.callee.property.name === 'createType'
					&& /* TODO currentScope.getContext().*/ getObjectName(node.expression.right.callee.object) == 'sap.ui.base.DataType'
					&& node.expression.right.arguments.length >= 2
					&& node.expression.right.arguments[0].type === Syntax.Literal
					&& node.expression.right.arguments[1].type === Syntax.ObjectExpression ) {

					collectRegExTypeInfo(node);
				}

				// ---- Something.extend() ----

				if ( isExtendCall(node.expression) ) {

					var doclet = Doclet.get(node) || Doclet.get(node.expression);
					var oClassInfo = collectClassInfo(node.expression, doclet);
					if ( oClassInfo ) {
						aInfos.push(oClassInfo);
					}

				}

			},

			"VariableDeclaration": function (node) {

				if ( node.declarations.length == 1
					&& node.declarations[0].init
					&& isExtendCall(node.declarations[0].init) ) {

					var doclet = Doclet.get(node) || Doclet.get(node.declarations[0]);
					var oClassInfo = collectClassInfo(node.declarations[0].init, doclet);
					if ( oClassInfo ) {
						aInfos.push(oClassInfo);
					}

				}

			},

			"FunctionExpression": function (node) {
				var aFunctions = node.body.body;

				aFunctions.forEach(function (functionNode) {
					if ( functionNode.expression
						&& functionNode.expression.type !== Syntax.AssignmentExpression ) {
						return;
					}
					var oParsed = functionNode;
					var oFuncDoc = Doclet.get(functionNode);

					if ( oFuncDoc && oFuncDoc.isPublic()
						&& oParsed.expression
						&& oParsed.expression.left
						&& oParsed.expression.left.property
						&& oParsed.expression.left.object
						&& oParsed.expression.left.object.object
						&& oParsed.expression.left.object.object.name === sControlName ) {

						var oPublicMethod = {},
							parsedParams = oParsed.expression.right.params ? oParsed.expression.right.params : [];

						oPublicMethod.name = oParsed.expression.left.property.name;
						oPublicMethod.doc = oFuncDoc.description;
						oPublicMethod.since = oFuncDoc.since;
						oPublicMethod.experimental = oFuncDoc.experimental;
						oPublicMethod.deprecation = oFuncDoc.deprecated;
						oPublicMethod.type = oFuncDoc.type ? oFuncDoc.type : '';
						oPublicMethod.parameters = [];

						parsedParams.forEach(function (oParam) {
							var oParamData = getParamInfo(oParam.name, oFuncDoc.tags);
							oPublicMethod.parameters.push(oParamData);
						});

						oPublicFunctions[oPublicMethod.name] = oPublicMethod;
					}
				});
			}

		};

		/**
		 * Adds the methods section to the metadata
		 * @param {Object} metadata
		 */

		// it should be done at the latest because sometimes it is empty on collectClassInfo
		// and it does not call collectClassInfo or createPropertyMap by itself
		function addMethodsToMetadata(metadata) {
			metadata.methods = oPublicFunctions;
		}

		function analyze(oData, sEntityName, sModuleName) {

			currentPackage = sModuleName.split('/').slice(0, -1).join('/');
			aInfos = [];
			oPublicFunctions = {};
			scope = {};
			sControlName = sEntityName.split('.').pop();

			var ast = esprima.parse(oData, {comment: true, attachComment: true});
			ASTUtils.visit(ast, delegate);

			for (var i = 0; i < aInfos.length; i++) {
				if ( aInfos[i].name === sEntityName ) {
					addMethodsToMetadata(aInfos[i]);
					return aInfos[i];
				}
			}
		}

		return {
			analyze: analyze
		};

	}, false);