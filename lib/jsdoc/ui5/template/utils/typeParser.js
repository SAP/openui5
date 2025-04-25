/**
 * Node script to parse type strings.
 *
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

"use strict";
class ASTBuilder {
	literal(str) {
		return {
			type: "literal",
			value: str
		};
	}
	simpleType(type) {
		return {
			type: "simpleType",
			name: type
		};
	}
	array(componentType) {
		return {
			type: "array",
			component: componentType
		};
	}
	object(keyType, valueType) {
		return {
			type: "object",
			key: keyType,
			value: valueType
		};
	}
	set(elementType) {
		return {
			type: "set",
			element: elementType
		};
	}
	promise(fulfillmentType) {
		return {
			type: "promise",
			fulfill: fulfillmentType
		};
	}
	"function"(paramTypes, returnType, thisType, constructorType) {
		return {
			"type": "function",
			"params": paramTypes,
			"return": returnType,
			"this": thisType,
			"constructor": constructorType
		};
	}
	structure(structure) {
		return {
			type: "structure",
			fields: structure
		};
	}
	union(types) {
		return {
			type: "union",
			types: types
		};
	}
	synthetic(type) {
		type.synthetic = true;
		return type;
	}
	nullable(type) {
		type.nullable = true;
		return type;
	}
	mandatory(type) {
		type.mandatory = true;
		return type;
	}
	optional(type) {
		type.optional = true;
		return type;
	}
	repeatable(type) {
		type.repeatable = true;
		return type;
	}
	typeApplication(type, templateTypes) {
		return {
			type: "typeApplication",
			baseType: type,
			templateTypes: templateTypes
		};
	}
}

function TypeParser(defaultBuilder = new ASTBuilder()) {
	const rLexer = /\s*(Array\.?<|Object\.?<|Set\.?<|Promise\.?<|function\(|\{|:|\(|\||\}|\.?<|>|\)|,|\[\]|\*|\?|!|=|\.\.\.)|\s*(false|true|(?:\+|-)?(?:\d+(?:\.\d+)?|NaN|Infinity)|'[^']*'|"[^"]*"|null|undefined)|\s*((?:module:)?\w+(?:[/.#~][$\w_]+)*)|./g;

	let input;
	let builder;
	let token;
	let tokenStr;

	function next(expected) {
		if ( expected !== undefined && token !== expected ) {
			throw new SyntaxError(
				`TypeParser: expected '${expected}', but found '${tokenStr}' ` +
				`(pos: ${rLexer.lastIndex}, input='${input}')`
			);
		}
		const match = rLexer.exec(input);
		if ( match ) {
			tokenStr = match[1] || match[2] || match[3];
			token = match[1] || (match[2] && "literal") || (match[3] && "symbol");
			if ( !token ) {
				throw new SyntaxError(`TypeParser: unexpected '${match[0]}' (pos: ${match.index}, input='${input}')`);
			}
		} else {
			tokenStr = token = null;
		}
	}

	function parseType() {
		let nullable = false;
		let mandatory = false;
		if ( token === "?" ) {
			next();
			nullable = true;
		} else if ( token === "!" ) {
			next();
			mandatory = true;
		}

		let type;

		if ( token === "literal" ) {
			type = builder.literal(tokenStr);
			next();
		} else if ( token === "Array.<" || token === "Array<" ) {
			next();
			const componentType = parseTypes();
			next(">");
			type = builder.array(componentType);
		} else if ( token === "Object.<" || token === "Object<" ) {
			next();
			let keyType;
			let valueType = parseTypes();
			if ( token === "," ) {
				next();
				keyType = valueType;
				valueType = parseTypes();
			} else {
				keyType = builder.synthetic(builder.simpleType("string"));
			}
			next(">");
			type = builder.object(keyType, valueType);
		} else if ( token === "Set.<" || token === "Set<" ) {
			next();
			const elementType = parseTypes();
			next(">");
			type = builder.set(elementType);
		} else if ( token === "Promise.<" || token === "Promise<" ) {
			next();
			const resultType = parseTypes();
			next(">");
			type = builder.promise(resultType);
		} else if ( token === "function(" ) {
			next();
			let thisType;
			let constructorType;
			const paramTypes = [];
			let returnType;
			if ( tokenStr === "this" ) {
				next();
				next(":");
				thisType = parseType();
				if ( token !== ")" ) {
					next(",");
				}
			} else if ( tokenStr === "new" ) {
				next();
				next(":");
				constructorType = parseType();
				if ( token !== ")" ) {
					next(",");
				}
			}
			while ( token !== ")" ) {
				const repeatable = token === "...";
				if ( repeatable ) {
					next();
				}
				let paramType = parseTypes();
				if ( repeatable ) {
					paramType = builder.repeatable(paramType);
				}
				const optional = token === "=";
				if ( optional ) {
					paramType = builder.optional(paramType);
					next();
				}
				paramTypes.push(paramType);

				// exit if there are no more parameters
				if ( token !== "," ) {
					break;
				}

				if ( repeatable ) {
					throw new SyntaxError(
						`TypeParser: only the last parameter of a function can be repeatable ` +
						`(pos: ${rLexer.lastIndex}, input='${input}')`
					);
				}

				// consume the comma
				next();
			}
			next(")");
			if ( token === ":" ) {
				next(":");
				returnType = parseType();
			}
			type = builder.function(paramTypes, returnType, thisType, constructorType);
		} else if ( token === "{" ) {
			const structure = Object.create(null);
			next();
			do {
				const propName = tokenStr;
				if ( !/^\w+$/.test(propName) ) {
					throw new SyntaxError(
						`TypeParser: structure field must have a simple name ` +
						`(pos: ${rLexer.lastIndex}, input='${input}', field:'${propName}')`
					);
				}
				next("symbol");
				let propType;
				const optional = token === "=";
				if ( optional ) {
					next();
				}
				if ( token === ":" ) {
					next();
					propType = parseTypes();
				} else {
					propType = builder.synthetic(builder.simpleType("any"));
				}
				if ( optional ) {
					propType = builder.optional(propType);
				}
				structure[propName] = propType;
				if ( token === "}" ) {
					break;
				}
				next(",");
			} while (token);
			next("}");
			type = builder.structure(structure);
		} else if ( token === "(" ) {
			next();
			type = parseTypes();
			next(")");
		} else if ( token === "*" ) {
			next();
			type = builder.simpleType("*");
		} else {
			type = builder.simpleType(tokenStr);
			next("symbol");
			// check for suffix operators: either 'type application' (generics) or 'array', but not both of them
			if ( token === "<" || token === ".<" ) {
				next();
				const templateTypes = [];
				do {
					const templateType = parseTypes();
					templateTypes.push(templateType);
					if ( token === ">" ) {
						break;
					}
					next(",");
				} while (token);
				next(">");
				type = builder.typeApplication(type, templateTypes);
			} else {
				while ( token === "[]" ) {
					next();
					type = builder.array(type);
				}
			}
		}
		if ( builder.normalizeType ) {
			type = builder.normalizeType(type);
		}
		if ( nullable ) {
			type = builder.nullable(type);
		}
		if ( mandatory ) {
			type = builder.mandatory(type);
		}
		return type;
	}

	function parseTypes() {
		const types = [];
		do {
			types.push(parseType());
			if ( token !== "|" ) {
				break;
			}
			next();
		} while (token);
		return types.length === 1 ? types[0] : builder.union(types);
	}

	this.parse = function(typeStr, tempBuilder = defaultBuilder) {
		/*
		try {
			const r = catharsis.parse(typeStr, { jsdoc: true});
			console.log(JSON.stringify(typeStr, null, "\t"), r);
		} catch (err) {
			console.log(typeStr, err);
		}
		*/
		builder = tempBuilder;
		input = String(typeStr);
		rLexer.lastIndex = 0;
		next();
		const type = parseTypes();
		next(null);
		return type;
	};

	/**
	 * Parses a string representing a complex type and returns an object with 2 fields:
	 * (1) simpleTypes: an array of the identified simple types inside the complex type;
	 * (2) template: a string indicating the position of the simple types in the original string.
	 *
	 * Examples:
	 *
	 * parseSimpleTypes("sap.ui.core.Control | null") returns
	 *  {
	 *     template: "${0} | ${1}",
	 *     simpleTypes: ["sap.ui.core.Control", "null"]
	 *  }
	 *
	 * parseSimpleTypes("Array<string>|Array<number>") returns
	 *  {
	 *     template: "Array<${0}>|Array<${1}>"
	 *     simpleTypes: ["string", "number"],
	 *  }
	 *
	 * parseSimpleTypes("Object<string, number>") returns
	 *  {
	 * 	   template: "Object<${0},${1}>"
	 * 	   simpleTypes: ["string", "number"],
	 *  }
	 *
	 * parseSimpleTypes("function(sap.ui.base.Event, number): boolean") returns
	 *  {
	 * 	   template: "function(${0},${1}): ${2}"
	 * 	   simpleTypes: ["sap.ui.base.Event", "number", "boolean"],
	 * 	}
	 *
	 * parseSimpleTypes("Promise<string>") returns
	 *  {
	 * 	   template: "Promise<${0}>"
	 * 	   simpleTypes: ["string"],
	 *  }
	 *
	 * @param {string} sComplexType
	 * @param {function} [fnFilter] optional filter function to be called for each simple type found. If a type is filtered out, it will not be added to the list of simple types, but will be present in its original form in the template.
	 * @returns {{simpleTypes: string[], template: string}} an object with the properties template and simpleTypes
	 */
	this.parseSimpleTypes = function(sComplexType, fnFilter) {
		const parsed = this.parse(sComplexType , new ASTBuilder() );
		let iIndexOfNextSimpleType = 0;

		function processSimpleType(sType) {
			var bSkip = fnFilter && !fnFilter(sType);
			if (bSkip) {
				return {
					template: sType,
					simpleTypes: [] // do not add this type to the list of parsed types
				};
			}

			return {
				template: "${" + iIndexOfNextSimpleType++ + "}",
				simpleTypes: [sType] // add this type to the list of parsed types
			};
		}

		function findSimpleTypes(parsed) {

			/* eslint-disable no-case-declarations */
			switch (parsed.type) {
				case "simpleType":
					return processSimpleType(parsed.name);
				case "literal":
					return processSimpleType(parsed.value);
				case "array":
					const component = findSimpleTypes(parsed.component);
					return {
						template: "Array<" + component.template + ">",
						simpleTypes: component.simpleTypes
					};
				case "object":
					const key = findSimpleTypes(parsed.key);
					const value = findSimpleTypes(parsed.value);
					return {
						template: "Object<" + key.template + "," + value.template + ">",
						simpleTypes: key.simpleTypes.concat(value.simpleTypes)
					};
				case "function":
					const aParamTemplates = [];
					let aParamsimpleTypes = [];
					if (Object.hasOwn(parsed, "constructor") && parsed.constructor) {
						const types = findSimpleTypes(parsed.constructor);
						aParamTemplates.push("new:" + types.template);
						aParamsimpleTypes = aParamsimpleTypes.concat(types.simpleTypes);
					}
					if (parsed.this) {
						const types = findSimpleTypes(parsed.this);
						aParamTemplates.push("this:" + types.template);
						aParamsimpleTypes = aParamsimpleTypes.concat(types.simpleTypes);
					}
					parsed.params.forEach(function(paramType) {
						const types = findSimpleTypes(paramType);
						aParamTemplates.push(types.template + (paramType.optional ? "?" : ""));
						aParamsimpleTypes = aParamsimpleTypes.concat(types.simpleTypes);
					});
					const returnType = parsed.return ? findSimpleTypes(parsed.return) : {simpleTypes: []};
					const returnTemplate = returnType.template ? " : " + returnType.template : "";
					const finalTemplate = "function(" + aParamTemplates.join(",") + ")" + returnTemplate;
					return {
						template: finalTemplate,
						simpleTypes: aParamsimpleTypes.concat(returnType.simpleTypes)
					};
				case "union":
					const unionParts = parsed.types, aPartsTemplates = [];
					let aPartsSimpleTypes = [];
					unionParts.forEach(function (part) {
						const types = findSimpleTypes(part);
						aPartsTemplates.push(types.template);
						aPartsSimpleTypes = aPartsSimpleTypes.concat(types.simpleTypes);
					});
					return {
						template: aPartsTemplates.join(" | "),
						simpleTypes: aPartsSimpleTypes
					};
				case "promise":
					const fulfill = findSimpleTypes(parsed.fulfill);
					return {
						template: "Promise<" + fulfill.template + ">",
						simpleTypes: fulfill.simpleTypes
					};
				case "set":
					const element = findSimpleTypes(parsed.element);
					return {
						template: "Set<" + element.template + ">",
						simpleTypes: element.simpleTypes
					};
				case "typeApplication":
					const baseType = findSimpleTypes(parsed.baseType);
					const templateTypes = parsed.templateTypes.map(findSimpleTypes);
					return {
						template: baseType.template + "<" + templateTypes.map(function (type) {
							return type.template;
						}).join(",") + ">",
						simpleTypes: baseType.simpleTypes.concat(templateTypes.reduce(function (a, b) {
							return a.concat(b.simpleTypes);
						}, []))
					};
				case "structure":
					const aFields = [];
					let aSimpleTypes = [];
					Object.keys(parsed.fields).forEach(function (sKey) {
						const oField = parsed.fields[sKey];
						const types = findSimpleTypes(oField);
						aFields.push(sKey + ":" + types.template);
						aSimpleTypes = aSimpleTypes.concat(types.simpleTypes);
					});
					return {
						template: "{" + aFields.join(",") + "}",
						simpleTypes: aSimpleTypes
					};
			}
			/* eslint-enable no-case-declarations */
		}

		return findSimpleTypes(parsed);
	};
}


module.exports = {
	ASTBuilder,
	TypeParser
};
