/*
 * JSDoc3 plugin for UI5 documentation generation.
 *
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

/* global global, env */
/* eslint-env es6,node */
/* eslint strict: [2, "global"] */

'use strict';

/**
 * UI5 plugin for JSDoc3 (3.3.0-alpha5)
 *
 * The plugin adds the following SAPUI5 specific tag definitions to JSDoc3
 *
 *   disclaimer
 *
 *   experimental
 *
 *   final
 *
 *   interface
 *
 *   implements
 *
 *
 *
 * It furthermore listens to the following JSDoc3 events to implement additional functionality
 *
 *   parseBegin
 *     to create short names for all file that are to be parsed
 *
 *   fileBegin
 *     to write some line to the log (kind of a progress indicator)
 *
 *   jsdocCommentFound
 *     to pre-process comments, empty lines are used as paragraph markers
 *     a default visibility is added, legacy tag combinations used in JSdoc2 are converted to JSDoc3 conventions
 *
 *   newDoclet
 *
 *   parseComplete
 *     remove undocumented/ignored/private doclets or duplicate doclets
 *
 *
 * Last but not least, it implements an astNodeVisitor to detect UI5 specific "extend" calls and to create
 * documentation for the properties, aggregations etc. that are created with the "extend" call.
 *
 * @module plugins/sapui5-jsdoc
 */

/* imports */
const Syntax = require('jsdoc/src/syntax').Syntax;
const Doclet = require('jsdoc/doclet').Doclet;
const fs = require('jsdoc/fs');
const path = require('jsdoc/path');
const logger = require('jsdoc/util/logger');
const pluginConfig = (env.conf && env.conf.templates && env.conf.templates.ui5) || env.opts.sapui5 || {};

/* ---- logging ---- */

// let pendingMessageHeader;

function msgHeader(str) {
	// pendingMessageHeader = str;
}

const debug = logger.debug.bind(logger);
const info = logger.info.bind(logger);
const warning = logger.warn.bind(logger);
const error = logger.error.bind(logger);

/* errors that might fail the build in future */
function future(msg) {
	if ( logger.getLevel() >= logger.LEVELS.WARN ) {
		const args = [...arguments];
		args[0] = "FUTURE: " + args[0] + " (future error, ignored for now)";
		/* eslint-disable no-console */
		console.warn(...args);
		/* eslint-disable no-console */
	}
}

/* ---- global vars---- */

/**
 * Potential path prefixes.
 *
 * Will be determined in the handler for the parseBegin event
 */
let pathPrefixes = [];

/**
 * Prefixes of the UI5 unified resource name for the source files is NOT part of the file name.
 * (e.g. when a common root namespaces has been omitted from the folder structure).
 *
 * The prefix will be prepended to all resource names.
 */
let resourceNamePrefixes = [];

/**
 * A UI5 specific unique Id for all doclets.
 */
let docletUid = 0;

let currentProgram;

/**
 * Information about the current module.
 *
 * The info object is created in the 'fileBegin' event handler and the 'resource' and 'module' properties
 * are derived from the filename provided by the event. The derived information is only correct, when the
 * resource name prefix is known for the directory from which a source is loaded (prefixes can be configured
 * via sapui5.resourceNamePrefixes, for UI5 libraries it is empty by default).
 *
 * During AST visiting, the 'name' property and the 'localeNames' map will be filled.
 * 'name' will be the name of the class defined by the module (assuming that there is only one).
 * 'localNames' will contain information objects for each parameter of an AMD Factory function and for
 * all shortcut variables that are defined top-level in the module factory function (e.g. something like
 *    var ButtonDesign = coreLibrary.ButtonDesign; ).
 * An info object for a local name either can have a 'value' property (simple, constant value) or it can
 * have a 'module' and optionally a 'path' value. In that case, the local name represents an AMD
 * module import or a shortcut derived from such an import.
 *
 * See {@link getResolvedObjectName} how the knowledge about locale names is used.
 *
 * @type {{name:string,resource:string,module:string,localName:Object<string,object>}}
 */
let currentModule;

let currentSource;

/**
 * Cached UI5 metadata for encountered UI5 classes.
 *
 * The metadata is collected from the 'metadata' property of 'extend' calls. It is stored
 * in this map keyed by the name of the class (as defined in the first parameter of the extend call).
 * Only after all files have been parsed, the collected information can be associated with the
 * corresponding JSDoc doclet (e.g. with the class documentation).
 */
const classInfos = Object.create(null);

/**
 * Map of enum value objects keyed by a unqiue enum ID.
 *
 * When the AST visitor detects an object literal that might be an enum, it cannot easily determine
 * the name of the enum. Therefore, the collected enum values are stored in this map keyed by a
 * unique ID derived from the key set of the (potential) enum (ID = sorted key set, joined with '|').
 *
 * In the parseComplete phase, the found values are merged into enum symbols (as detected by JSDoc).
 */
const enumValues = Object.create(null);

/**
 *
 */
const typeInfos = Object.create(null);

/**
 * Cached designtime info for encountered sources.
 *
 * The designtime information is collected only for files named '*.designtime.js'.
 * It is stored in this map keyed by the corresponding module name (e.g. 'sap/m/designtime/Button.designtime').
 * Only after all files have been parsed, the collected information can be associated with runtime metadata
 * that refers to that designtime module name.
 */
const designtimeInfos = Object.create(null);

/* ---- private functions ---- */

function ui5data(doclet) {
	return doclet.__ui5 || (doclet.__ui5 = { id: ++docletUid });
}

//---- path handling ---------------------------------------------------------

function ensureEndingSlash(path) {
	path = path || '';
	return path && path.slice(-1) !== '/' ? path + '/' : path;
}

function getRelativePath(filename) {
	let relative = path.resolve(filename);
	for ( let i = 0; i < pathPrefixes.length; i++ ) {
		if ( relative.indexOf(pathPrefixes[i]) === 0 ) {
			relative = relative.slice(pathPrefixes[i].length);
			break;
		}
	}
	return relative.replace(/\\/g, '/');
}

function getResourceName(filename) {
	let resource = path.resolve(filename);
	for ( let i = 0; i < pathPrefixes.length; i++ ) {
		if ( resource.indexOf(pathPrefixes[i]) === 0 ) {
			resource = resourceNamePrefixes[i] + resource.slice(pathPrefixes[i].length);
			break;
		}
	}
	return resource.replace(/\\/g, '/');
}

function getModuleName(resource) {
	return resource.replace(/\.js$/, '');
}

/*
 * resolves relative AMD module identifiers relative to a given base name
 */
function resolveModuleName(base, name) {
	let stack = base.split('/');
	stack.pop();
	name.split('/').forEach((segment, i) => {
		if ( segment == '..' ) {
			stack.pop();
		} else if ( segment === '.' ) {
			// ignore
		} else {
			if ( i === 0 ) {
				stack = [];
			}
			stack.push(segment);
		}
	});
	return stack.join('/');
}

// ---- AMD handling

function analyzeModuleDefinition(node) {
	const args = node.arguments;
	let arg = 0;
	if ( arg < args.length
		 && args[arg].type === Syntax.Literal && typeof args[arg].value === 'string' ) {
		currentModule.name = args[arg].value;
		warning(`module explicitly defined a module name '${currentModule.name}'`);
		const resourceModuleName = getModuleName(currentModule.resource);
		if (currentModule.name !== resourceModuleName) {
			warning(`explicitly defined module name '${currentModule.name}' ` +
				`differs from resource name '${resourceModuleName}'`);
		}
		arg++;
	}
	if ( arg < args.length && args[arg].type === Syntax.ArrayExpression ) {
		currentModule.dependencies = convertValue(args[arg], "string[]");
		arg++;
	}
	if ( arg < args.length && args[arg].type === Syntax.FunctionExpression ) {
		currentModule.factory = args[arg];
		arg++;
	}
	if ( currentModule.dependencies && currentModule.factory ) {
		for ( let i = 0; i < currentModule.dependencies.length && i < currentModule.factory.params.length; i++ ) {
			const name = currentModule.factory.params[i].name;
			const module = resolveModuleName(currentModule.module, currentModule.dependencies[i]);
			debug(`  import ${name} from '${module}'`);
			currentModule.localNames[name] = {
				module: module
				// no (or empty) path
			};
		}
	}
	if ( currentModule.factory ) {
		collectShortcuts(currentModule.factory.body);
	}
}

/**
 * Searches the given body for variable declarations that can be evaluated statically,
 * either because they refer to known AMD module imports (e.g. shortcut variables)
 * or because they have a (design time) constant value.
 *
 * @param {ASTNode} body AST node of a function body that shall be searched for shortcuts
 */
function collectShortcuts(body) {

	function checkAssignment(name, valueNode) {
		if ( valueNode.type === Syntax.Literal ) {
			currentModule.localNames[name] = {
				value: valueNode.value,
				raw: valueNode.raw
			};
			debug("compile time constant found ", name, valueNode.value);
		} else if ( valueNode.type === Syntax.MemberExpression ) {
			const _import = getLeftmostName(valueNode);
			const local = _import && currentModule.localNames[_import];
			const objectName = getObjectName(valueNode);
			if ( objectName && typeof local === 'object' && local.module ) {
				currentModule.localNames[name] = {
					module: local.module,
					path: objectName.split('.').slice(1).join('.') // TODO chaining if local has path
				};
				debug(`  found local shortcut: ${name} ${currentModule.localNames[name]}`);
			}
		} else if ( isRequireSyncCall(valueNode) || isProbingRequireCall(valueNode) ) {
			if ( valueNode.arguments[0]
				 && valueNode.arguments[0].type === Syntax.Literal
				 && typeof valueNode.arguments[0].value === 'string' ) {
				currentModule.localNames[name] = {
					module: valueNode.arguments[0].value
					// no (or empty) path
				};
				debug(`  found local import: ${name} = ${valueNode.callee.property.name}('${valueNode.arguments[0].value}')`);
			}
		} else if ( isExtendCall(valueNode) ) {
			currentModule.localNames[name] = {
				"class": valueNode.arguments[0].value
				// no (or empty) path
			};
			debug(`  found local class definition: ${name} = .extend('${valueNode.arguments[0].value}', ...)`);
		}
	}

	if ( body.type === Syntax.BlockStatement ) {
		body.body.forEach(function ( stmt ) {
			// console.log(stmt);
			if ( stmt.type === Syntax.FunctionDeclaration ) {
				if ( stmt.id && stmt.id.type === Syntax.Identifier && stmt.loc && stmt.loc.start ) {
					const loc = stmt.loc.start.line + ":" + stmt.loc.start.column;
					currentModule.localNamesByLoc[loc] =
					currentModule.localNames[stmt.id.name] = {
						"function": stmt
					};
				}
			} else if ( stmt.type === Syntax.VariableDeclaration ) {
				stmt.declarations.forEach((decl) => {
					if ( decl.init ) {
						checkAssignment(decl.id.name, decl.init);
					}
				});
			} else if ( stmt.type === Syntax.ExpressionStatement
						&& stmt.expression.type === Syntax.AssignmentExpression
						&& stmt.expression.left.type === Syntax.Identifier ) {
				checkAssignment(stmt.expression.left.name, stmt.expression.right);
			} else if ( stmt.type === Syntax.ReturnStatement ) {
				if ( stmt.argument && stmt.argument.type === Syntax.Identifier ) {
					currentModule.defaultExport = stmt.argument.name;
				} else if ( stmt.argument && isExtendCall(stmt.argument) ) {
					debug(`  found default export class definition: return .extend('${stmt.argument.arguments[0].value}', ...)`);
					currentModule.defaultExportClass = stmt.argument.arguments[0].value;
				}
			}
		});
	}

	if ( currentModule.defaultExport && currentModule.localNames[currentModule.defaultExport] ) {
		currentModule.localNames[currentModule.defaultExport].export = "";
	}
}

function findLocalDeclaration(lineno, columnno) {
	return currentModule.localNamesByLoc[lineno + ":" + columnno];
}

// ---- text handling ---------------------------------------------------------

const rPlural = /(children|ies|ves|oes|ses|ches|shes|xes|s)$/i;
const mSingular = {'children' : -3, 'ies' : 'y', 'ves' : 'f', 'oes' : -2, 'ses' : -2, 'ches' : -2, 'shes' : -2, 'xes' : -2, 's' : -1 };

function guessSingularName(sPluralName) {
	return sPluralName.replace(rPlural, ($, sPlural) => {
		const vRepl = mSingular[sPlural.toLowerCase()];
		return typeof vRepl === "string" ? vRepl : sPlural.slice(0, vRepl);
	});
}

function getPropertyKey(prop) {
	if ( prop.key.type === Syntax.Identifier ) {
		return prop.key.name;
	} else if ( prop.key.type === Syntax.Literal ) {
		return String(prop.key.value);
	} else {
		return prop.key.toSource();
	}
}

/**
 * Creates a map of property values from an AST 'object literal' node.
 *
 * The values in the map are again AST 'property' nodes (representing key/value pairs).
 * It would be more convenient to just return the values, but the property node is needed
 * to find the corresponding (preceding) documentation comment.
 *
 * If a <code>defaultKey</code> is given and if the <code>node</code> is not an object literal
 * but another simple type literal, the value is treated as a shortcut for
 * <pre>
 *   {
 *     [defaultKey]: node.value
 *   }
 * </pre>
 * This is used in ManagedObjectMetadata to allow a simpler declaration of properties by
 * specifying a type name only.
 *
 * @param {ASTNode} node AST node for an object literal or simple literal
 * @param {string} [defaultKey=undefined] A default key to use for simple values
 * @returns {Map<string,Property>} Map of AST nodes of type 'Property', keyed by their property name
 */
function createPropertyMap(node, defaultKey) {

	let result;

	if ( node != null ) {

		// if, instead of an object literal only a literal is given and there is a defaultKey, then wrap the literal in a map
		if ( node.type === Syntax.Literal && defaultKey != null ) {
			result = {};
			result[defaultKey] = { type: Syntax.Property, value: node };
			return result;
		}

		if ( node.type != Syntax.ObjectExpression ) {
			// something went wrong, it's not an object literal
			warning(`not an object literal: ${node.type}: ${node.value}`);
			// console.log(node.toSource());
			return undefined;
		}

		// invariant: node.type == Syntax.ObjectExpression
		result = {};
		for (let i = 0; i < node.properties.length; i++) {
			const prop = node.properties[i];
			//console.log("objectproperty " + prop.type);
			const name = getPropertyKey(prop);
			//console.log("objectproperty " + prop.type + ":" + name);
			result[name] = prop;
		}
	}
	return result;
}

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
		&& node.arguments[1].type === Syntax.ObjectExpression
	);

}

function isSapUiDefineCall(node) {

	return (
		node
		&& node.type === Syntax.CallExpression
		&& node.callee.type === Syntax.MemberExpression
		&& node.callee.object.type === Syntax.MemberExpression
		&& node.callee.object.object.type === Syntax.Identifier
		&& node.callee.object.object.name === 'sap'
		&& node.callee.object.property.type === Syntax.Identifier
		&& node.callee.object.property.name === 'ui'
		&& node.callee.property.type === Syntax.Identifier
		&& node.callee.property.name === 'define'
	);

}

function isCreateDataTypeCall(node) {
	return (
		node
		&& node.type === Syntax.CallExpression
		&& node.callee.type === Syntax.MemberExpression
		&& getResolvedObjectName(node.callee.object) === "sap.ui.base.DataType"
		&& node.callee.property.type === Syntax.Identifier
		&& node.callee.property.name === 'createType'
	);
}

function isRequireSyncCall(node) {
	return (
		node
		&& node.type === Syntax.CallExpression
		&& node.callee.type === Syntax.MemberExpression
		&& node.callee.object.type === Syntax.MemberExpression
		&& node.callee.object.object.type === Syntax.Identifier
		&& node.callee.object.object.name === 'sap'
		&& node.callee.object.property.type === Syntax.Identifier
		&& node.callee.object.property.name === 'ui'
		&& node.callee.property.type === Syntax.Identifier
		&& node.callee.property.name === 'requireSync'
	);
}

function isProbingRequireCall(node) {
	return (
		node
		&& node.type === Syntax.CallExpression
		&& node.callee.type === Syntax.MemberExpression
		&& node.callee.object.type === Syntax.MemberExpression
		&& node.callee.object.object.type === Syntax.Identifier
		&& node.callee.object.object.name === 'sap'
		&& node.callee.object.property.type === Syntax.Identifier
		&& node.callee.object.property.name === 'ui'
		&& node.callee.property.type === Syntax.Identifier
		&& node.callee.property.name === 'require'
		&& node.arguments.length === 1
		&& node.arguments[0].type === Syntax.Literal
		&& typeof node.arguments[0].value === 'string' // TODO generalize to statically analyzable constants
	);
}

function isPotentialEnum(node) {
	if ( node == null || node.type !== Syntax.ObjectExpression ) {
		return false;
	}
	return node.properties.every((prop) => isCompileTimeConstant(prop.value));
}

function isCompileTimeConstant(node) {
	return node && node.type === Syntax.Literal;
}

function getObjectName(node) {
	if ( node.type === Syntax.MemberExpression && !node.computed && node.property.type === Syntax.Identifier ) {
		const prefix = getObjectName(node.object);
		return prefix ? prefix + "." + node.property.name : null;
	} else if ( node.type === Syntax.Identifier ) {
		return /* scope[node.name] ? scope[node.name] : */ node.name;
	} else {
		return null;
	}
}

/*
 * Checks whether the node is a qualified name (a.b.c) and if so,
 * returns the leftmost identifier a
 */
function getLeftmostName(node) {
	while ( node.type === Syntax.MemberExpression ) {
		node = node.object;
	}
	if ( node.type === Syntax.Identifier ) {
		return node.name;
	}
	// return undefined;
}

function getResolvedObjectName(node) {
	const name = getObjectName(node);
	const _import = getLeftmostName(node);
	const local = _import && currentModule.localNames[_import];
	if ( name && local && (local.class || local.module) ) {
		let resolvedName;
		if ( local.class ) {
			resolvedName = local.class;
		} else {
			resolvedName = local.module.replace(/\//g, ".").replace(/\.library$/, "");
			if ( local.path ) {
				resolvedName = resolvedName + "." + local.path;
			}
		}
		if ( name.indexOf('.') > 0 ) {
			resolvedName = resolvedName + name.slice(name.indexOf('.'));
		}
		debug(`resolved ${name} to ${resolvedName}`);
		return resolvedName;
	}
	return name;
}

/*
 * Analyzes the given AST node that represents a value and returns an object
 * with two properties:
 * - 'value' contains the runtime representation of the value (e.g. a number or a string)
 * - 'raw' contains a source code representation of the value (always string)
 *
 * @param {ASTNode} node Node to analyze
 * @param {string} [type] A type name that might help to analyze the value
 * @param {string} [propertyName] Name of the property for which the anylsis i done, only used for logging
 * @returns {{value:any,raw:string}} An object with a runtime and a source code representation of the value
 */
function convertValueWithRaw(node, type, propertyName) {

	let value;

	if ( node.type === Syntax.Literal ) {

		// 'string' or number or true or false
		return {
			value: node.value,
			raw: node.raw
		};

	} else if ( node.type === Syntax.UnaryExpression
		&& node.prefix
		&& node.argument.type === Syntax.Literal
		&& typeof node.argument.value === 'number'
		&& ( node.operator === '-' || node.operator === '+' )) {

		// -n or +n
		value = node.argument.value;
		return {
			value: node.operator === '-' ? -value : value,
			raw: node.operator + node.argument.raw
		};

	} else if ( node.type === Syntax.MemberExpression && type ) {

		// enum value (a.b.c)
		value = getResolvedObjectName(node);
		if ( value.indexOf(type + ".") === 0 ) {
			// starts with fully qualified enum name -> cut off name
			value = value.slice(type.length + 1);
			return {
				value: value,
				raw: value
			};
//		} else if ( value.indexOf(type.split(".").slice(-1)[0] + ".") === 0 ) {
//			// unqualified name might be a local name (just a guess - would need static code analysis for proper solution)
//			return value.slice(type.split(".").slice(-1)[0].length + 1);
		} else {
			warning(`did not understand default value '${value}'${propertyName ? " of property '" + propertyName + "'" : ""}, falling back to source`);
			let raw = value;
			if ( currentSource && node.range ) {
				raw = currentSource.slice( node.range[0], node.range[1] );
			}
			return {
				value: value,
				raw: raw
			};
		}

	} else if ( node.type === Syntax.Identifier ) {
		if ( node.name === 'undefined') {
			return {
				value: undefined,
				raw: node.name
			};
		}
		const local = currentModule.localNames[node.name];
		if ( typeof local === 'object' && 'value' in local ) {
			// a locally defined constant
			// TODO check type
			return {
				value: local.value,
				raw: local.raw
			};
		}
	} else if ( node.type === Syntax.ArrayExpression ) {

		if ( node.elements.length === 0 ) {
			// empty array literal
			return {
				value: [],
				raw: "[]"
			};
		}

		if ( type && type.slice(-2) === "[]" ) {
			const componentType = type.slice(0,  -2);
			const array = node.elements.map((elem) => convertValueWithRaw(elem, componentType, propertyName));
			return {
				value: array.map((value) => value.value),
				raw: "[" + array.map((value) => value.raw).join(", ") + "]"
			};
		}

	} else if ( node.type === Syntax.ObjectExpression ) {

		if ( node.properties.length === 0 && (type === 'object' || type === 'any') ) {
			return {
				value: {},
				raw: "{}"
			};
		}

	}

	value = "...see text or source";
	warning(`cannot understand default value${
		propertyName ? " of property '" + propertyName + "'" : ""
		} (type='${node.type}', source='${node.toString()}'), falling back to '${value}'`);

	return {
		value: value,
		raw: value
	};
}

function convertValue(node, type, propertyName, includeRaw) {
	return convertValueWithRaw(node, type, propertyName).value;
}

function convertStringArray(node) {
	if ( node.type !== Syntax.ArrayExpression ) {
		throw new Error("not an array");
	}
	const result = [];
	for ( let i = 0; i < node.elements.length; i++ ) {
		if ( node.elements[i].type !== Syntax.Literal || typeof node.elements[i].value !== 'string' ) {
			throw new Error("not a string literal");
		}
		result.push(node.elements[i].value);
	}
	// console.log(result);
	return result;
}

function convertDragDropValue(node, cardinality) {
	const mDefaults = { draggable : false, droppable: false };
	let mDragDropValue;

	if ( node.type === Syntax.ObjectExpression ) {
		mDragDropValue = (node.properties || []).reduce(function(oObject, oProperty) {
			const sKey = getPropertyKey(oProperty);
			if (mDefaults.hasOwnProperty(sKey)) {
				oObject[sKey] = convertValue(oProperty.value);
			}
			return oObject;
		}, {});
	} else if ( node.type === Syntax.Literal ) {
		mDragDropValue = {
			draggable : node.value,
			droppable : node.value
		};
	} else {
		throw new Error("not a valid dnd node");
	}

	return Object.assign(mDefaults, mDragDropValue);
}

function collectClassInfo(extendCall, classDoclet) {

	let baseType;
	if ( classDoclet && classDoclet.augments && classDoclet.augments.length === 1 ) {
		baseType = classDoclet.augments[0];
	}
	if ( extendCall.callee.type === Syntax.MemberExpression ) {
		const baseCandidate = getResolvedObjectName(extendCall.callee.object);
		if ( baseCandidate && baseType == null ) {
			baseType = baseCandidate;
		} else if ( baseCandidate !== baseType ) {
			future(`documented base type '${baseType}' doesn't match technical base type '${baseCandidate}'`);
		}
	}

	const oClassInfo = {
		name : extendCall.arguments[0].value,
		baseType : baseType,
		interfaces : [],
		doc : classDoclet && classDoclet.description,
		deprecation : classDoclet && classDoclet.deprecated,
		since : classDoclet && classDoclet.since,
		experimental : classDoclet && classDoclet.experimental,
		specialSettings : {},
		properties : {},
		aggregations : {},
		associations : {},
		events : {},
		methods : {},
		annotations : {},
		designtime: false,
		stereotype: null,
		metadataClass: undefined
	};

	function upper(n) {
		return n.slice(0, 1).toUpperCase() + n.slice(1);
	}

	function each(node, defaultKey, callback) {
		const map = node && createPropertyMap(node.value);
		if ( map ) {
			for (let n in map ) {
				if ( map.hasOwnProperty(n) ) {
					const doclet = getLeadingDoclet(map[n]);
					const settings = createPropertyMap(map[n].value, defaultKey);
					if ( settings == null ) {
						warning(`no valid metadata for ${n} (AST type '${map[n].value.type}')`);
						continue;
					}

					callback(n, settings, doclet, map[n]);
				}
			}
		}
	}

	if ( extendCall.arguments.length > 2 ) {
		// new class defines its own metadata class type
		const metadataClass =  getResolvedObjectName(extendCall.arguments[2]);
		if ( metadataClass ) {
			oClassInfo.metadataClass = getResolvedObjectName(extendCall.arguments[2]);
			debug(`found metadata class name '${oClassInfo.metadataClass}'`);
		} else {
			future(`cannot understand metadata class parameter (AST node type '${extendCall.arguments[2].type}')`);
		}
	}

	const classInfoNode = extendCall.arguments[1];
	const classInfoMap = createPropertyMap(classInfoNode);
	if ( classInfoMap && classInfoMap.metadata && classInfoMap.metadata.value.type !== Syntax.ObjectExpression ) {
		warning(`class metadata exists but can't be analyzed. It is not of type 'ObjectExpression', but a '${classInfoMap.metadata.value.type}'.`);
		return null;
	}

	const metadata = classInfoMap && classInfoMap.metadata && createPropertyMap(classInfoMap.metadata.value);
	if ( metadata ) {

		debug(`  analyzing metadata for '${oClassInfo.name}'`);

		// Read the stereotype information from the metadata
		oClassInfo.stereotype = (metadata.stereotype && metadata.stereotype.value.value) || undefined;

		oClassInfo.library = (metadata.library && metadata.library.value.value) || undefined;

		oClassInfo["abstract"] = !!(metadata["abstract"] && metadata["abstract"].value.value);
		oClassInfo["final"] = !!(metadata["final"] && metadata["final"].value.value);
		oClassInfo.dnd = metadata.dnd && convertDragDropValue(metadata.dnd.value);

		if ( metadata.interfaces ) {
			oClassInfo.interfaces = convertStringArray(metadata.interfaces.value);
		}

		each(metadata.specialSettings, "type", (n, settings, doclet) => {
			oClassInfo.specialSettings[n] = {
				name : n,
				doc : doclet && doclet.description,
				since : doclet && doclet.since,
				deprecation : doclet && doclet.deprecated,
				experimental : doclet && doclet.experimental,
				visibility : (settings.visibility && settings.visibility.value.value) || "public",
				type : settings.type ? settings.type.value.value : "any"
			};
		});

		oClassInfo.defaultProperty = (metadata.defaultProperty && metadata.defaultProperty.value.value) || undefined;

		each(metadata.properties, "type", (n, settings, doclet) => {
			let type;
			const N = upper(n);
			let methods;
			oClassInfo.properties[n] = {
				name : n,
				doc : doclet && doclet.description,
				since : doclet && doclet.since,
				deprecation : doclet && doclet.deprecated,
				experimental : doclet && doclet.experimental,
				visibility : (settings.visibility && settings.visibility.value.value) || "public",
				type : (type = settings.type ? settings.type.value.value : "string"),
				defaultValue : settings.defaultValue ? convertValueWithRaw(settings.defaultValue.value, type, n) : null,
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
			// if ( !settings.defaultValue ) {
			//	console.log("property without defaultValue: " + oClassInfo.name + "." + n);
			//}
		});

		oClassInfo.defaultAggregation = (metadata.defaultAggregation && metadata.defaultAggregation.value.value) || undefined;

		each(metadata.aggregations, "type", (n, settings, doclet) => {
			const N = upper(n);
			let methods;
			const aggr = oClassInfo.aggregations[n] = {
				name: n,
				doc : doclet && doclet.description,
				deprecation : doclet && doclet.deprecated,
				since : doclet && doclet.since,
				experimental : doclet && doclet.experimental,
				visibility : (settings.visibility && settings.visibility.value.value) || "public",
				type : settings.type ? settings.type.value.value : "sap.ui.core.Control",
				altTypes: settings.altTypes ? convertStringArray(settings.altTypes.value) : undefined,
				singularName : settings.singularName ? settings.singularName.value.value : guessSingularName(n),
				cardinality : (settings.multiple && !settings.multiple.value.value) ? "0..1" : "0..n",
				bindable : settings.bindable ? !!convertValue(settings.bindable.value) : false,
				methods: (methods = {
					"get": "get" + N,
					"destroy": "destroy" + N
				})
			};

			aggr.dnd = settings.dnd && convertDragDropValue(settings.dnd.value, aggr.cardinality);

			if ( aggr.cardinality === "0..1" ) {
				methods["set"] = "set" + N;
			} else {
				const N1 = upper(aggr.singularName);
				methods["insert"] = "insert" + N1;
				methods["add"] = "add" + N1;
				methods["remove"] = "remove" + N1;
				methods["indexOf"] = "indexOf" + N1;
				methods["removeAll"] = "removeAll" + N;
			}
			if ( aggr.bindable ) {
				methods["bind"] = "bind" + N;
				methods["unbind"] = "unbind" + N;
			}
		});

		each(metadata.associations, "type", (n, settings, doclet) => {
			const N = upper(n);
			let methods;
			oClassInfo.associations[n] = {
				name: n,
				doc : doclet && doclet.description,
				deprecation : doclet && doclet.deprecated,
				since : doclet && doclet.since,
				experimental : doclet && doclet.experimental,
				visibility : (settings.visibility && settings.visibility.value.value) || "public",
				type : settings.type ? settings.type.value.value : "sap.ui.core.Control",
				singularName : settings.singularName ? settings.singularName.value.value : guessSingularName(n),
				cardinality : (settings.multiple && settings.multiple.value.value) ? "0..n" : "0..1",
				methods: (methods = {
					"get": "get" + N
				})
			};
			if ( oClassInfo.associations[n].cardinality === "0..1" ) {
				methods["set"] = "set" + N;
			} else {
				const N1 = upper(oClassInfo.associations[n].singularName);
				methods["add"] = "add" + N1;
				methods["remove"] = "remove" + N1;
				methods["removeAll"] = "removeAll" + N;
			}
		});

		each(metadata.events, null, (n, settings, doclet) => {
			const N = upper(n);
			const info = oClassInfo.events[n] = {
				name: n,
				doc : doclet && doclet.description,
				deprecation : doclet && doclet.deprecated,
				since : doclet && doclet.since,
				experimental : doclet && doclet.experimental,
				visibility : /* (settings.visibility && settings.visibility.value.value) || */ "public",
				allowPreventDefault : !!(settings.allowPreventDefault && settings.allowPreventDefault.value.value),
				enableEventBubbling : !!(settings.enableEventBubbling && settings.enableEventBubbling.value.value),
				parameters : {},
				methods: {
					"attach": "attach" + N,
					"detach": "detach" + N,
					"fire": "fire" + N
				}
			};
			each(settings.parameters, "type", (pName, pSettings, pDoclet) => {
				info.parameters[pName] = {
					name : pName,
					doc : pDoclet && pDoclet.description,
					deprecation : pDoclet && pDoclet.deprecated,
					since : pDoclet && pDoclet.since,
					experimental : pDoclet && pDoclet.experimental,
					type : pSettings && pSettings.type ? pSettings.type.value.value : ""
				};
			});
		});

		const designtime = (metadata.designtime && convertValue(metadata.designtime.value)) || (metadata.designTime && convertValue(metadata.designTime.value));
		if ( typeof designtime === 'string' || typeof designtime === 'boolean' ) {
			oClassInfo.designtime = designtime;
		}
		// console.log(oClassInfo.name + ":" + JSON.stringify(oClassInfo, null, "  "));
	}

	if (currentModule.defaultExport
		&& currentModule.localNames[currentModule.defaultExport]
		&& currentModule.localNames[currentModule.defaultExport].class === oClassInfo.name) {
		// debug("class " + oClassInfo.name + " identified as default export of module " + currentModule.module);
		oClassInfo.export = "";
	} else if (currentModule.defaultExportClass
			   && currentModule.defaultExportClass === oClassInfo.name) {
		// debug("class " + oClassInfo.name + " identified as default export of module " + currentModule.module + " (immediate return)");
		oClassInfo.export = "";
	}

	// remember class info by name
	classInfos[oClassInfo.name] = oClassInfo;

	return oClassInfo;
}

function collectDesigntimeInfo(dtNode) {

	function each(node, defaultKey, callback) {
		const map = node && createPropertyMap(node.value);
		if ( map ) {
			for (let n in map ) {
				if ( map.hasOwnProperty(n) ) {
					const doclet = getLeadingDoclet(map[n], true);
					const settings = createPropertyMap(map[n].value, defaultKey);
					if ( settings == null ) {
						warning(`no valid metadata for ${n} (AST type '${map[n].value.type}')`);
						continue;
					}

					callback(n, settings, doclet, map[n]);
				}
			}
		}
	}

	let oDesigntimeInfo;

	const map = createPropertyMap(dtNode.argument);

	if (map.annotations) {

		oDesigntimeInfo = {
			annotations: {}
		};

		each(map.annotations, null, (n, settings, doclet) => {
			const appliesTo = [],
				targets = [];

			if (settings.appliesTo) {
				for (let i = 0; i < settings.appliesTo.value.elements.length; i++) {
					appliesTo.push(settings.appliesTo.value.elements[i].value);
				}
			}

			if (settings.target) {
				for (let i = 0; i < settings.target.value.elements.length; i++) {
					targets.push(settings.target.value.elements[i].value);
				}
			}

			oDesigntimeInfo.annotations[n] = {
				name: n,
				doc : doclet && doclet.description,
				deprecation : doclet && doclet.deprecated,
				since : doclet && doclet.since || settings.since && settings.since.value.value,
				namespace: settings.namespace && settings.namespace.value.value,
				annotation: settings.annotation && settings.annotation.value.value,
				appliesTo: appliesTo,
				target: targets,
				interpretation: settings.interpretation && settings.interpretation.value.value,
				defaultValue: settings.defaultValue && settings.defaultValue.value.value
			};

			const oAnno = oDesigntimeInfo.annotations[n].annotation;
			const iPos = oAnno && oAnno.lastIndexOf(".");

			if ( !oDesigntimeInfo.annotations[n].namespace && iPos > 0 ) {
				oDesigntimeInfo.annotations[n].namespace = oAnno.slice(0, iPos);
				oDesigntimeInfo.annotations[n].annotation = oAnno.slice(iPos + 1);
			}
		});
	}

	return oDesigntimeInfo;
}

function determineValueRangeBorder(range, expression, varname, inverse) {
	if ( expression.type === Syntax.BinaryExpression ) {
		let value;
		if ( expression.left.type === Syntax.Identifier && expression.left.name === varname && expression.right.type === Syntax.Literal ) {
			value = expression.right.value;
		} else if ( expression.left.type === Syntax.Literal && expression.right.type === Syntax.Identifier && expression.right.name === varname ) {
			inverse = !inverse;
			value = expression.left.value;
		} else {
			return false;
		}
		switch (expression.operator) {
		case '<':
			range[inverse ? 'minExclusive' : 'maxExclusive'] = value;
			break;
		case '<=':
			range[inverse ? 'minInclusive' : 'maxInclusive'] = value;
			break;
		case '>=':
			range[inverse ? 'maxInclusive' : 'minInclusive'] = value;
			break;
		case '>':
			range[inverse ? 'maxExclusive' : 'minExclusive'] = value;
			break;
		default:
			return false;
		}
		return true;
	}
	return false;
}

function determineValueRange(expression, varname, inverse) {
	const range = {};
	if ( expression.type === Syntax.LogicalExpression
		 && expression.operator === '&&'
		 && expression.left.type === Syntax.BinaryExpression
		 && expression.right.type === Syntax.BinaryExpression
		 && determineValueRangeBorder(range, expression.left, varname, inverse)
		 && determineValueRangeBorder(range, expression.right, varname, inverse) ) {
		return range;
	} else if ( expression.type === Syntax.BinaryExpression
				&& determineValueRangeBorder(range, expression, varname, inverse) ) {
		return range;
	}
	return undefined;
}

function collectDataTypeInfo(extendCall, classDoclet) {
	const args = extendCall.arguments;
	let i = 0,
		name, def, base, pattern, range;

	if ( i < args.length && args[i].type === Syntax.Literal && typeof args[i].value === 'string' ) {
		name = args[i++].value;
	}
	if ( i < args.length && args[i].type === Syntax.ObjectExpression ) {
		def = createPropertyMap(args[i++]);
	}
	if ( i < args.length ) {
		if ( args[i].type === Syntax.Literal && typeof args[i].value === 'string' ) {
			base = args[i++].value;
		} else if ( args[i].type === Syntax.CallExpression
					&& args[i].callee.type === Syntax.MemberExpression
					&& getResolvedObjectName(args[i].callee.object) === "sap.ui.base.DataType"
					&& args[i].callee.property.type === Syntax.Identifier
					&& args[i].callee.property.name === 'getType'
					&& args[i].arguments.length === 1
					&& args[i].arguments[0].type === Syntax.Literal
					&& typeof args[i].arguments[0].value === 'string' ) {
			base = args[i++].arguments[0].value;
		} else {
			future(`could not identify base type of data type '${name}'`);
		}
	} else {
		base = "any";
	}

	if ( def
		 && def.isValid
		 && def.isValid.value.type === Syntax.FunctionExpression
		 && def.isValid.value.params.length === 1
		 && def.isValid.value.params[0].type === Syntax.Identifier
		 && def.isValid.value.body.body.length === 1 ) {
		const varname = def.isValid.value.params[0].name;
		const stmt = def.isValid.value.body.body[0];
		if ( stmt.type === Syntax.ReturnStatement && stmt.argument ) {
			if ( stmt.argument.type === Syntax.CallExpression
				 && stmt.argument.callee.type === Syntax.MemberExpression
				 && stmt.argument.callee.object.type === Syntax.Literal
				 && stmt.argument.callee.object.regex
				 && stmt.argument.callee.property.type === Syntax.Identifier
				 && stmt.argument.callee.property.name === 'test' ) {
				pattern = stmt.argument.callee.object.regex.pattern;
				// console.log(pattern);
			} else {
				range = determineValueRange(stmt.argument, varname, false);
			}
		} else if ( stmt.type === Syntax.IfStatement
					&& stmt.consequent.type === Syntax.BlockStatement
					&& stmt.consequent.body.length === 1
					&& stmt.consequent.body[0].type === Syntax.ReturnStatement
					&& stmt.consequent.body[0].argument
					&& stmt.consequent.body[0].argument.type === Syntax.Literal
					&& typeof stmt.consequent.body[0].argument.value === 'boolean'
					&& stmt.alternate.type === Syntax.BlockStatement
					&& stmt.alternate.body.length === 1
					&& stmt.alternate.body[0].type === Syntax.ReturnStatement
					&& stmt.alternate.body[0].argument
					&& stmt.alternate.body[0].argument.type === Syntax.Literal
					&& typeof stmt.alternate.body[0].argument.value === 'boolean'
					&& stmt.consequent.body[0].argument.value !== typeof stmt.alternate.body[0].argument.value ) {
			const inverse = stmt.alternate.body[0].argument.value;
			range = determineValueRange(stmt.test, varname, inverse);
		} else {
			debug("unexpected implementation of a DataType's isValid() implementation: ", stmt);
		}
	}

	// remember type info by name
	if ( name && def && base ) {
		typeInfos[name] = {
			name: name,
			def: def,
			pattern: pattern,
			range: range,
			base: base
		};
		// console.log("found data type:", typeInfos[name]);
	}
}

const rEmptyLine = /^\s*$/;

function createAutoDoc(oClassInfo, classComment, doclet, node, parser, filename, commentAlreadyProcessed) {

	const newStyle = !!pluginConfig.newStyle,
		includeSettings = !!pluginConfig.includeSettingsInConstructor,
		rawClassComment = getRawComment(classComment);
	let lines, link;

	function isEmpty(obj) {
		if ( !obj ) {
			return true;
		}
		for (let n in obj) {
			if ( obj.hasOwnProperty(n) ) {
				return false;
			}
		}
		return true;
	}

	function jsdocCommentFound(comment) {
		parser.emit('jsdocCommentFound', {
			event:'jsdocCommentFound',
			comment : comment,
			lineno : node.loc.start.line,
			filename : filename,
			range : [ node.range[0], node.range[0] ]
		}, parser);
	}

	function removeDuplicateEmptyLines(lines) {
		const l = lines.length;
		let lastWasEmpty = false, j, i;

		for (i = 0, j = 0; i < l; i++) {
			const line = lines[i];
			if ( line == null || rEmptyLine.test(line) ) {
				if ( !lastWasEmpty ) {
					lines[j++] = line;
				}
				lastWasEmpty = true;
			} else {
				lines[j++] = line;
				lastWasEmpty = false;
			}
		}
		return j < i ? lines.slice(0, j) : lines;
	}

	function newJSDoc(lines) {
		//console.log("add completely new jsdoc comment to prog " + node.type + ":" + node.nodeId + ":" + Object.keys(node));

		lines = Array.prototype.concat.apply([], lines); // flatten
		lines = removeDuplicateEmptyLines(lines);
		lines.push("@synthetic");

		const comment = " * " + lines.join("\r\n * ");
		jsdocCommentFound("/**\r\n" + comment + "\r\n */");

		const m = /@name\s+([^\r\n\t ]+)/.exec(comment);
		debug(`  creating synthetic comment '${m && m[1]}'`);
	}

	function rname(prefix, n, _static) {
		return (_static ? "." : "#") + prefix + n.slice(0, 1).toUpperCase() + n.slice(1);
	}

	function name(prefix, n, _static) {
		return oClassInfo.name + rname(prefix, n, _static);
	}

	/*
	 * creates a JSDoc type string from the given metadata info object.
	 * It takes into account the type, the altTypes and the cardinality
	 * (the latter only if componentTypeOnly is not set).
	 */
	function makeTypeString(aggr, componentTypeOnly) {
		let s = aggr.type;
		if ( aggr.altTypes ) {
			s = s + "|" + aggr.altTypes.join("|");
		}
		if ( !componentTypeOnly && aggr.cardinality === "0..n" ) {
			// if multiple types are allowed, use Array<...> for proper grouping
			if ( aggr.altTypes ) {
				s = "Array<" + s + ">";
			} else {
				s = s + "[]";
			}
		}
		return s;
	}

//	function shortname(s) {
//		return s.slice(s.lastIndexOf('.') + 1);
//	}

	function createVisibilityTags(doclet) {
		const access = (doclet && doclet.access) || "public";
		if ( access === "restricted" ) {
			return [
				"@private",
				"@ui5-restricted" + (doclet.__ui5 && Array.isArray(doclet.__ui5.stakeholders) ? " " + doclet.__ui5.stakeholders.join(", ") : "")
			];
		}
		return "@" + access;
	}

	const HUNGARIAN_PREFIXES = {
		'int' : 'i',
		'boolean' : 'b',
		'float' : 'f',
		'string' : 's',
		'function' : 'fn',
		'object' : 'o',
		'regexp' : 'r',
		'jQuery' : '$',
		'any' : 'o',
		'variant' : 'v',
		'map' : 'm'
	};

	function varname(n, type, property) {
		const prefix = HUNGARIAN_PREFIXES[type] || (property ? "s" : "o");
		return prefix + n.slice(0, 1).toUpperCase() + n.slice(1);
	}

	function generateParamTag(n, type, description, defaultValue){
		let s = "@param {" + type + "} ";

		if (defaultValue !== null){
			s += "[" +  varname(n, type, true) + "=" + defaultValue.raw + "]";
		} else {
			s += varname(n, type, true);
		}

		s += " " + description;

		return s;
	}

	// add a list of the possible settings if and only if
	// - documentation for the constructor exists
	// - no (generated) documentation for settings exists already
	// - a suitable place for inserting the settings can be found
	const m = /(?:^|\r\n|\n|\r)[ \t]*\**[ \t]*@[a-zA-Z]/.exec(rawClassComment);
	const p = m ? m.index : -1;
	const hasSettingsDocs = rawClassComment.indexOf("The supported settings are:") >= 0;
	const visibility = createVisibilityTags(doclet);
	const thisClass = 'this'; // oClassInfo.name

	// heuristic to recognize a ManagedObject
	const isManagedObject = (
		/@extends\s+sap\.ui\.(?:base\.ManagedObject|core\.(?:Element|Control|Component))(?:\s|$)/.test(rawClassComment)
		|| oClassInfo.library
		|| !isEmpty(oClassInfo.specialSettings)
		|| !isEmpty(oClassInfo.properties)
		|| !isEmpty(oClassInfo.aggregations)
		|| !isEmpty(oClassInfo.associations)
		|| !isEmpty(oClassInfo.events)
		);

	if ( p >= 0 && !hasSettingsDocs ) {
		lines = [
			""
		];

		if ( isManagedObject ) { // only a ManagedObject has settings

			if ( oClassInfo.name !== "sap.ui.base.ManagedObject" ) {
				// add the hint for the general description only when the current class is not ManagedObject itself
				lines.push(
					"",
					"Accepts an object literal <code>mSettings</code> that defines initial",
					"property values, aggregated and associated objects as well as event handlers.",
					"See {@link sap.ui.base.ManagedObject#constructor} for a general description of the syntax of the settings object."
				);
			}

			// add the settings section only if there are any settings
			if ( !isEmpty(oClassInfo.properties)
				 || !isEmpty(oClassInfo.aggregations)
				 || !isEmpty(oClassInfo.associations)
				 || !isEmpty(oClassInfo.events) ) {

				lines.push(
					"",
					includeSettings ? "" : "@ui5-settings",
					"The supported settings are:",
					"<ul>"
				);
				if ( !isEmpty(oClassInfo.properties) ) {
					lines.push("<li>Properties");
					lines.push("<ul>");
					for (let n in oClassInfo.properties) {
						lines.push("<li>{@link " + rname("get", n) + " " + n + "} : " + oClassInfo.properties[n].type + (oClassInfo.properties[n].defaultValue !== null && oClassInfo.properties[n].defaultValue.value !== null ? " (default: " + oClassInfo.properties[n].defaultValue.raw + ")" : "") + (oClassInfo.defaultProperty == n ? " (default)" : "") + "</li>");
					}
					lines.push("</ul>");
					lines.push("</li>");
				}
				if ( !isEmpty(oClassInfo.aggregations) ) {
					lines.push("<li>Aggregations");
					lines.push("<ul>");
					for (let n in oClassInfo.aggregations) {
						if ( oClassInfo.aggregations[n].visibility !== "hidden" ) {
							lines.push("<li>{@link " + rname("get", n) + " " + n + "} : " + makeTypeString(oClassInfo.aggregations[n]) + (oClassInfo.defaultAggregation == n ? " (default)" : "") + "</li>");
						}
					}
					lines.push("</ul>");
					lines.push("</li>");
				}
				if ( !isEmpty(oClassInfo.associations) ) {
					lines.push("<li>Associations");
					lines.push("<ul>");
					for (let n in oClassInfo.associations) {
						lines.push("<li>{@link " + rname("get", n) + " " + n + "} : (sap.ui.core.ID | " + oClassInfo.associations[n].type + ")" + (oClassInfo.associations[n].cardinality === "0..n" ? "[]" : "") + "</li>");
					}
					lines.push("</ul>");
					lines.push("</li>");
				}
				if ( !isEmpty(oClassInfo.events) ) {
					lines.push("<li>Events");
					lines.push("<ul>");
					for (let n in oClassInfo.events) {
						lines.push("<li>{@link " + "#event:" + n + " " + n + "} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>");
					}
					lines.push("</ul>");
					lines.push("</li>");
				}
				lines.push("</ul>");

				// add the reference to the base class only if this is not ManagedObject and if the base class is known
				if ( oClassInfo.name !== "sap.ui.base.ManagedObject" && oClassInfo.baseType ) {
					lines.push(
						"",
						"In addition, all settings applicable to the base type {@link " + oClassInfo.baseType + "#constructor " + oClassInfo.baseType + "}",
						"can be used as well."
					);
				}
				lines.push("");

			} else if ( oClassInfo.name !== "sap.ui.base.ManagedObject" && oClassInfo.baseType && oClassInfo.hasOwnProperty("abstract") ) {

				// if a class has no settings, but metadata, point at least to the base class - if it makes sense
				lines.push(
					"",
					newStyle && !includeSettings ? "@ui5-settings" : "",
					"This class does not have its own settings, but all settings applicable to the base type",
					"{@link " + oClassInfo.baseType + "#constructor " + oClassInfo.baseType + "} can be used."
				);

			}
		}

		debug("  enhancing constructor documentation with settings");
		let enhancedComment =
			rawClassComment.slice(0, p) +
			"\n * " + removeDuplicateEmptyLines(lines).join("\n * ") +
			(commentAlreadyProcessed ? "@ui5-updated-doclet\n * " : "") +
			rawClassComment.slice(p);
		enhancedComment = preprocessComment({ comment : enhancedComment, lineno : classComment.lineno });

		if ( commentAlreadyProcessed ) {
			jsdocCommentFound(enhancedComment);
		} else {
			setRawComment(classComment, enhancedComment);
		}

	}

	newJSDoc([
		"Returns a metadata object for class " + oClassInfo.name + ".",
		"",
		"@returns {sap.ui.base.Metadata} Metadata object describing this class",
		visibility,
		"@static",
		"@name " + name("getMetadata", "", true),
		"@function"
	]);

	if ( !oClassInfo["final"] ) {
		newJSDoc([
			"Creates a new subclass of class " + oClassInfo.name + " with name <code>sClassName</code>",
			"and enriches it with the information contained in <code>oClassInfo</code>.",
			"",
			"<code>oClassInfo</code> might contain the same kind of information as described in {@link " + (oClassInfo.baseType ? oClassInfo.baseType + ".extend" : "sap.ui.base.Object.extend Object.extend") + "}.",
			"",
			"@param {string} sClassName Name of the class being created",
			"@param {object} [oClassInfo] Object literal with information about the class",
			"@param {function} [FNMetaImpl] Constructor function for the metadata object; if not given, it defaults to the metadata implementation used by this class",
			"@returns {function} Created class / constructor function",
			visibility,
			"@static",
			"@name " + name("extend", "", true),
			"@function"
		]);
	}

	for (let n in oClassInfo.properties ) {
		const info = oClassInfo.properties[n];
		if ( info.visibility === 'hidden' ) {
			continue;
		}
		// link = newStyle ? "{@link #setting:" + n + " " + n + "}" : "<code>" + n + "</code>";
		link = "{@link " + (newStyle ? "#setting:" + n : rname("get", n))  + " " + n + "}";
		newJSDoc([
			"Gets current value of property " + link + ".",
			"",
			!newStyle && info.doc ? info.doc : "",
			"",
			info.defaultValue !== null && info.defaultValue.value !== null
				? "Default value is <code>" + (info.defaultValue.value === "" ? "empty string" : info.defaultValue.raw) + "</code>."
				: "",
			"@returns {" + info.type + "} Value of property <code>" + n + "</code>",
			info.since ? "@since " + info.since : "",
			info.deprecation ? "@deprecated " + info.deprecation : "",
			info.experimental ? "@experimental " + info.experimental : "",
			visibility,
			"@name " + name("get", n),
			"@function"
		]);
		newJSDoc([
			"Sets a new value for property " + link + ".",
			"",
			!newStyle && info.doc ? info.doc : "",
			"",
			"When called with a value of <code>null</code> or <code>undefined</code>, the default value of the property will be restored.",
			"",
			info.defaultValue !== null && info.defaultValue.value !== null
				? "Default value is <code>" + (info.defaultValue.value === "" ? "empty string" : info.defaultValue.raw) + "</code>."
				: "",
			generateParamTag(n, info.type, "New value for property <code>" + n + "</code>", info.defaultValue),
			"@returns {" + thisClass + "} Reference to <code>this</code> in order to allow method chaining",
			info.since ? "@since " + info.since : "",
			info.deprecation ? "@deprecated " + info.deprecation : "",
			info.experimental ? "@experimental " + info.experimental : "",
			visibility,
			"@name " + name("set", n),
			"@function"
		]);
		if ( info.bindable ) {
			newJSDoc([
				"Binds property " + link + " to model data.",
				"",
				"See {@link sap.ui.base.ManagedObject#bindProperty ManagedObject.bindProperty} for a ",
				"detailed description of the possible properties of <code>oBindingInfo</code>",
				"@param {sap.ui.base.ManagedObject.PropertyBindingInfo} oBindingInfo The binding information",
				"@returns {" + thisClass + "} Reference to <code>this</code> in order to allow method chaining",
				info.since ? "@since " + info.since : "",
				info.deprecation ? "@deprecated " + info.deprecation : "",
				info.experimental ? "@experimental " + info.experimental : "",
				visibility,
				"@name " + name("bind", n),
				"@function"
			]);
			newJSDoc([
				"Unbinds property " + link + " from model data.",
				"@returns {" + thisClass + "} Reference to <code>this</code> in order to allow method chaining",
				info.since ? "@since " + info.since : "",
				info.deprecation ? "@deprecated " + info.deprecation : "",
				info.experimental ? "@experimental " + info.experimental : "",
				visibility,
				"@name " + name("unbind", n),
				"@function"
			]);
		}
	}

	for (let n in oClassInfo.aggregations ) {
		const info = oClassInfo.aggregations[n];
		if ( info.visibility === 'hidden' ) {
			continue;
		}
		// link = newStyle ? "{@link #setting:" + n + " " + n + "}" : "<code>" + n + "</code>";
		link = "{@link " + (newStyle ? "#setting:" + n : rname("get", n))  + " " + n + "}";
		newJSDoc([
			"Gets content of aggregation " + link + ".",
			"",
			!newStyle && info.doc ? info.doc : "",
			"",
			n === info.defaultAggregation ? "<strong>Note</strong>: this is the default aggregation for " + n + "." : "",
			"@returns {" + makeTypeString(info) + "}",
			info.since ? "@since " + info.since : "",
			info.deprecation ? "@deprecated " + info.deprecation : "",
			info.experimental ? "@experimental " + info.experimental : "",
			visibility,
			"@name " + name("get", n),
			"@function"
		]);
		if ( info.cardinality == "0..n" ) {
			const n1 = info.singularName;
			newJSDoc([
				"Inserts a " + n1 + " into the aggregation " + link + ".",
				"",
				"@param {" + makeTypeString(info, true) + "}",
				"           " + varname(n1, info.altTypes ? "variant" : info.type) + " The " + n1 + " to insert; if empty, nothing is inserted",
				"@param {int}",
				"             iIndex The <code>0</code>-based index the " + n1 + " should be inserted at; for",
				"             a negative value of <code>iIndex</code>, the " + n1 + " is inserted at position 0; for a value",
				"             greater than the current size of the aggregation, the " + n1 + " is inserted at",
				"             the last position",
				"@returns {" + thisClass + "} Reference to <code>this</code> in order to allow method chaining",
				info.since ? "@since " + info.since : "",
				info.deprecation ? "@deprecated " + info.deprecation : "",
				info.experimental ? "@experimental " + info.experimental : "",
				visibility,
				"@name " + name("insert", n1),
				"@function"
			]);
			newJSDoc([
				"Adds some " + n1 + " to the aggregation " + link + ".",

				"@param {" + makeTypeString(info, true) + "}",
				"           " + varname(n1, info.altTypes ? "variant" : info.type) + " The " + n1 + " to add; if empty, nothing is inserted",
				"@returns {" + thisClass + "} Reference to <code>this</code> in order to allow method chaining",
				info.since ? "@since " + info.since : "",
				info.deprecation ? "@deprecated " + info.deprecation : "",
				info.experimental ? "@experimental " + info.experimental : "",
				visibility,
				"@name " + name("add", n1),
				"@function"
			]);
			newJSDoc([
				"Removes a " + n1 + " from the aggregation " + link + ".",
				"",
				"@param {int | string | " + makeTypeString(info, true) + "} " + varname(n1, "variant") + " The " + n1 + " to remove or its index or id",
				"@returns {" + makeTypeString(info, true) + "|null} The removed " + n1 + " or <code>null</code>",
				info.since ? "@since " + info.since : "",
				info.deprecation ? "@deprecated " + info.deprecation : "",
				info.experimental ? "@experimental " + info.experimental : "",
				visibility,
				"@name " + name("remove", n1),
				"@function"
			]);
			newJSDoc([
				"Removes all the controls from the aggregation " + link + ".",
				"",
				"Additionally, it unregisters them from the hosting UIArea.",
				"@returns {" + makeTypeString(info) + "} An array of the removed elements (might be empty)",
				info.since ? "@since " + info.since : "",
				info.deprecation ? "@deprecated " + info.deprecation : "",
				info.experimental ? "@experimental " + info.experimental : "",
				visibility,
				"@name " + name("removeAll", n),
				"@function"
			]);
			newJSDoc([
				"Checks for the provided <code>" + info.type + "</code> in the aggregation " + link + ".",
				"and returns its index if found or -1 otherwise.",
				"@param {" + makeTypeString(info, true) + "}",
				"          " + varname(n1, info.altTypes ? "variant" : info.type) + " The " + n1 + " whose index is looked for",
				"@returns {int} The index of the provided control in the aggregation if found, or -1 otherwise",
				info.since ? "@since " + info.since : "",
				info.deprecation ? "@deprecated " + info.deprecation : "",
				info.experimental ? "@experimental " + info.experimental : "",
				visibility,
				"@name " + name("indexOf", n1),
				"@function"
			]);
		} else {
			newJSDoc([
				"Sets the aggregated " + link + ".",
				"@param {" + makeTypeString(info) + "} " + varname(n, info.altTypes ? "variant" : info.type) + " The " + n + " to set",
				"@returns {" + thisClass + "} Reference to <code>this</code> in order to allow method chaining",
				info.since ? "@since " + info.since : "",
				info.deprecation ? "@deprecated " + info.deprecation : "",
				info.experimental ? "@experimental " + info.experimental : "",
				visibility,
				"@name " + name("set", n),
				"@function"
			]);
		}
		newJSDoc([
			"Destroys " + (info.cardinality === "0..n" ? "all " : "") + "the " + n + " in the aggregation " + link + ".",
			"@returns {" + thisClass + "} Reference to <code>this</code> in order to allow method chaining",
			info.since ? "@since " + info.since : "",
			info.deprecation ? "@deprecated " + info.deprecation : "",
			info.experimental ? "@experimental " + info.experimental : "",
			visibility,
			"@name " + name("destroy", n),
			"@function"
		]);
		if ( info.bindable ) {
			newJSDoc([
				"Binds aggregation " + link + " to model data.",
				"",
				"See {@link sap.ui.base.ManagedObject#bindAggregation ManagedObject.bindAggregation} for a ",
				"detailed description of the possible properties of <code>oBindingInfo</code>.",
				"@param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding information",
				"@returns {" + thisClass + "} Reference to <code>this</code> in order to allow method chaining",
				info.since ? "@since " + info.since : "",
				info.deprecation ? "@deprecated " + info.deprecation : "",
				info.experimental ? "@experimental " + info.experimental : "",
				visibility,
				"@name " + name("bind", n),
				"@function"
			]);
			newJSDoc([
				"Unbinds aggregation " + link + " from model data.",
				"@returns {" + thisClass + "} Reference to <code>this</code> in order to allow method chaining",
				info.since ? "@since " + info.since : "",
				info.deprecation ? "@deprecated " + info.deprecation : "",
				info.experimental ? "@experimental " + info.experimental : "",
				visibility,
				"@name " + name("unbind", n),
				"@function"
			]);
		}
	}

	for (let n in oClassInfo.associations ) {
		const info = oClassInfo.associations[n];
		if ( info.visibility === 'hidden' ) {
			continue;
		}
		// link = newStyle ? "{@link #setting:" + n + " " + n + "}" : "<code>" + n + "</code>";
		link = "{@link " + (newStyle ? "#setting:" + n : rname("get", n))  + " " + n + "}";
		newJSDoc([
			info.cardinality === "0..n" ?
				"Returns array of IDs of the elements which are the current targets of the association " + link + "." :
				"ID of the element which is the current target of the association " + link + ", or <code>null</code>.",
			"",
			newStyle && info.doc ? info.doc : "",
			"",
			"@returns {sap.ui.core.ID" + (info.cardinality === "0..n" ? "[]" : "") + "}",
			info.since ? "@since " + info.since : "",
			info.deprecation ? "@deprecated " + info.deprecation : "",
			info.experimental ? "@experimental " + info.experimental : "",
			visibility,
			"@name " + name("get", n),
			"@function"
		]);
		if ( info.cardinality === "0..n" ) {
			const n1 = info.singularName;
			newJSDoc([
				"Adds some " + n1 + " into the association " + link + ".",
				"",
				"@param {sap.ui.core.ID | " + info.type + "} " + varname(n1, "variant") + " The " + n + " to add; if empty, nothing is inserted",
				"@returns {" + thisClass + "} Reference to <code>this</code> in order to allow method chaining",
				info.since ? "@since " + info.since : "",
				info.deprecation ? "@deprecated " + info.deprecation : "",
				info.experimental ? "@experimental " + info.experimental : "",
				visibility,
				"@name " + name("add", n1),
				"@function"
			]);
			newJSDoc([
				"Removes an " + n1 + " from the association named " + link + ".",
				"@param {int | sap.ui.core.ID | " + info.type + "} " + varname(n1, "variant") + " The " + n1 + " to be removed or its index or ID",
				"@returns {sap.ui.core.ID|null} The removed " + n1 + " or <code>null</code>",
				info.since ? "@since " + info.since : "",
				info.deprecation ? "@deprecated " + info.deprecation : "",
				info.experimental ? "@experimental " + info.experimental : "",
				visibility,
				"@name " + name("remove", n1),
				"@function"
			]);
			newJSDoc([
				"Removes all the controls in the association named " + link + ".",
				"@returns {sap.ui.core.ID[]} An array of the removed elements (might be empty)",
				info.since ? "@since " + info.since : "",
				info.deprecation ? "@deprecated " + info.deprecation : "",
				info.experimental ? "@experimental " + info.experimental : "",
				visibility,
				"@name " + name("removeAll", n),
				"@function"
			]);
		} else {
			newJSDoc([
				"Sets the associated " + link + ".",
				"@param {sap.ui.core.ID | " + info.type + "} " + varname(n, info.type) + " ID of an element which becomes the new target of this " + n + " association; alternatively, an element instance may be given",
				"@returns {" + thisClass + "} Reference to <code>this</code> in order to allow method chaining",
				info.since ? "@since " + info.since : "",
				info.deprecation ? "@deprecated " + info.deprecation : "",
				info.experimental ? "@experimental " + info.experimental : "",
				visibility,
				"@name " + name("set", n),
				"@function"
			]);
		}
	}

	for (let n in oClassInfo.events ) {
		const info = oClassInfo.events[n];
		//link = newStyle ? "{@link #event:" + n + " " + n + "}" : "<code>" + n + "</code>";
		link = "{@link #event:" + n + " " + n + "}";

		lines = [
			info.doc ? info.doc : "",
			"",
			info.allowPreventDefault ? "Listeners may prevent the default action of this event by calling the <code>preventDefault</code> method on the event object." : "",
			"",
			info.enableEventBubbling ? "This event bubbles up the control hierarchy." : "",
			"",
			"@name " + oClassInfo.name + "#" + n,
			"@event",
			info.since ? "@since " + info.since : "",
			info.deprecation ? "@deprecated " + info.deprecation : "",
			info.experimental ? "@experimental " + info.experimental : "",
			"@param {sap.ui.base.Event} oControlEvent",
			"@param {sap.ui.base.EventProvider} oControlEvent.getSource",
			"@param {object} oControlEvent.getParameters"
		];
		for (let pName in info.parameters ) {
			lines.push(
				"@param {" + (info.parameters[pName].type || "") + "} oControlEvent.getParameters." + pName + " " + (info.parameters[pName].doc || "")
			);
		}
		lines.push(visibility);
		newJSDoc(lines);

		newJSDoc([
			"Attaches event handler <code>fnFunction</code> to the " + link + " event of this <code>" + oClassInfo.name + "</code>.",
			"",
			"When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code> if specified, ",
			"otherwise it will be bound to this <code>" + oClassInfo.name + "</code> itself.",
			"",
			!newStyle && info.doc ? info.doc : "",
			"",
			"@param {object}",
			"           [oData] An application-specific payload object that will be passed to the event handler along with the event object when firing the event",
			"@param {function(sap.ui.base.Event):void}",
			"           fnFunction The function to be called when the event occurs",
			"@param {object}",
			"           [oListener] Context object to call the event handler with. Defaults to this <code>" + oClassInfo.name + "</code> itself",
			"",
			"@returns {" + thisClass + "} Reference to <code>this</code> in order to allow method chaining",
			visibility,
			info.since ? "@since " + info.since : "",
			info.deprecation ? "@deprecated " + info.deprecation : "",
			info.experimental ? "@experimental " + info.experimental : "",
			"@name " + name("attach", n),
			"@function"
		]);
		newJSDoc([
			"Detaches event handler <code>fnFunction</code> from the " + link + " event of this <code>" + oClassInfo.name + "</code>.",
			"",
			"The passed function and listener object must match the ones used for event registration.",
			"",
			"@param {function(sap.ui.base.Event):void}",
			"           fnFunction The function to be called, when the event occurs",
			"@param {object}",
			"           [oListener] Context object on which the given function had to be called",
			"@returns {" + thisClass + "} Reference to <code>this</code> in order to allow method chaining",
			info.since ? "@since " + info.since : "",
			info.deprecation ? "@deprecated " + info.deprecation : "",
			info.experimental ? "@experimental " + info.experimental : "",
			visibility,
			"@name " + name("detach", n),
			"@function"
		]);

		// build documentation for fireEvent. It contains conditional parts which makes it a bit more complicated
		lines = [
			"Fires event " + link + " to attached listeners."
		];
		if ( info.allowPreventDefault ) {
			lines.push(
			"",
			"Listeners may prevent the default action of this event by calling the <code>preventDefault</code> method on the event object.",
			"The return value of this method indicates whether the default action should be executed.",
			"");
		}
		lines.push(
			"",
			"@param {object} [mParameters] Parameters to pass along with the event"
		);
		if ( !isEmpty(info.parameters) ) {
			for (let pName in info.parameters) {
				lines.push(
					"@param {" + (info.parameters[pName].type || "any") + "} [mParameters." + pName + "] " + (info.parameters[pName].doc || "")
				);
			}
			lines.push("");
		}
		if ( info.allowPreventDefault ) {
			lines.push("@returns {boolean} Whether or not to prevent the default action");
		} else {
			lines.push("@returns {" + thisClass + "} Reference to <code>this</code> in order to allow method chaining");
		}
		lines.push(
			visibility === "@public" ? "@protected" : visibility,
			info.since ? "@since " + info.since : "",
			info.deprecation ? "@deprecated " + info.deprecation : "",
			info.experimental ? "@experimental " + info.experimental : "",
			"@name " + name("fire", n),
			"@function"
		);
		newJSDoc(lines);
	}

}

function createDataTypeAutoDoc(oTypeInfo, classComment, node, parser, filename) {
}

/**
 * Creates a human readable location info for a given doclet.
 * @param {Doclet} doclet Doclet to get a location info for
 * @returns {string} A human readable location info
 */
function location(doclet) {
	const filename = (doclet.meta && doclet.meta.filename) || "unknown";
	return " #" + ui5data(doclet).id + "@" + filename + (doclet.meta.lineno != null ? ":" + doclet.meta.lineno : "") + (doclet.synthetic ? "(synthetic)" : "");
}

// ---- Comment handling ---------------------------------------------------------------------------

// --- comment related functions that depend on the JSdoc version (e.g. on the used parser)

let isDocComment;
let getLeadingCommentNode;

// JSDoc added the node type <code>Syntax.File</code> with the same change that activated Babylon
// See https://github.com/jsdoc3/jsdoc/commit/ffec4a42291de6d68e6240f304b68d6abb82a869
if ( Syntax.File === 'File' ) {

	// JSDoc starting with version 3.5.0

	isDocComment = function isDocCommentBabylon(comment) {
		return comment && comment.type === 'CommentBlock' && comment.value && comment.value.charAt(0) === '*';
	};

	getLeadingCommentNode = function getLeadingCommentNodeBabylon(node, longname) {
		let leadingComments = node.leadingComments;
		if ( Array.isArray(leadingComments) ) {
			// in babylon, all comments are already attached to the node
			// and the last one is the closest one and should win
			// non-block comments have to be filtered out
			leadingComments = leadingComments.filter(isDocComment);
			if ( leadingComments.length > 0 ) {
				return leadingComments[leadingComments.length - 1];
			}
		}
	};

} else {

	// JSDoc versions before 3.5.0

	isDocComment = function isDoccommentEsprima(comment) {
		return comment && comment.type === 'Block';
	};

	getLeadingCommentNode = function getLeadingCommentNodeEsprima(node, longname) {
		let comment,
			leadingComments = node.leadingComments;

		// when espree is used, JSDOc attached the leading comment and the first one was picked
		if (Array.isArray(leadingComments) && leadingComments.length && leadingComments[0].raw) {
			comment = leadingComments[0];
		}

		// also check all comments attached to the Program node (if found) whether they refer to the same longname
		// TODO check why any matches here override the direct leading comment from above
		if ( longname && currentProgram && currentProgram.leadingComments && currentProgram.leadingComments.length ) {
			leadingComments = currentProgram.leadingComments;
			const rLongname = new RegExp("@(name|alias|class|namespace)\\s+" + longname.replace(/\./g, '\\.'));
			for ( let i = 0; i < leadingComments.length; i++ ) {
				const raw = getRawComment(leadingComments[i]);
				if ( /^\/\*\*[\s\S]*\*\/$/.test(raw) && rLongname.test(raw) ) {
					comment = leadingComments[i];
					// console.log("\n\n**** alternative comment found for " + longname + " on program level\n\n", comment);
					break;
				}
			}
		}

		return comment;
	};
}

//--- comment related functions that are independent from the JSdoc version

function getLeadingComment(node) {
	const comment = getLeadingCommentNode(node);
	return comment ? getRawComment(comment) : null;
}

function getLeadingDoclet(node, preprocess) {
	let comment = getLeadingComment(node);
	if ( comment && preprocess ) {
		comment = preprocessComment({comment:comment, lineno: node.loc.start.line });
	}
	return comment ? new Doclet(comment, {}) : null;
}

/**
 * Determines the raw comment string (source code form, including leading and trailing comment markers / *...* /) from a comment node.
 * Works for Esprima and Babylon based JSDoc versions.
 * @param {ASTNode} commentNode Node that contains the comment.
 * @returns {string} Comment string as written in the source
 */
function getRawComment(commentNode) {
	// in esprima, there's a 'raw' property, in babylon, the 'raw' string has to be reconstructed from the 'value' by adding the markers
	return commentNode ? commentNode.raw || '/*' + commentNode.value + '*/' : '';
}

function setRawComment(commentNode, newRawComment) {
	if ( commentNode.raw ) {
		commentNode.raw = newRawComment;
	}
	commentNode.value = newRawComment.slice(2, -2);
}

/**
 * Removes the mandatory comment markers and the optional but common asterisks at the beginning of each JSDoc comment line.
 *
 * The result is easier to parse/analyze.
 *
 * Implementation is a 1:1 copy from JSDoc's lib/jsdoc/doclet.js (closure function, not directly reusable)
 *
 * @param {string} docletSrc the source comment with or without block comment markers
 * @returns {string} the unwrapped content of the JSDoc comment
 *
 */
function unwrap(docletSrc) {
	if (!docletSrc) { return ''; }

	// note: keep trailing whitespace for @examples
	// extra opening/closing stars are ignored
	// left margin is considered a star and a space
	// use the /m flag on regex to avoid having to guess what this platform's newline is
	docletSrc =
		docletSrc.replace(/^\/\*\*+/, '') // remove opening slash+stars
		.replace(/\**\*\/$/, "\\Z")       // replace closing star slash with end-marker
		.replace(/^\s*(\* ?|\\Z)/gm, '')  // remove left margin like: spaces+star or spaces+end-marker
		.replace(/\s*\\Z$/g, '');         // remove end-marker

	return docletSrc;
}

/**
 * Inverse operation of unwrap.
 *
 * The prefix for lines is fixed to be " * ", lines are separated with '\n', independent from the platform.
 * @param {string|string[]} lines Multiline string or an array of lines
 * @returns {string} Full comment string created from the line(s)
 */
function wrap(lines) {
	if ( typeof lines === "string" ) {
		lines = lines.split(/\r\n?|\n/);
	}
	return "/**\n * " + lines.join('\n * ') + "\n */";
}

/**
 * Pre-processes a JSDoc comment string to ensure some UI5 standards.
 *
 * @param {event} e Event for the new comment
 * @returns {event} Returns the modified event
 */
function preprocessComment(e) {

	let src = e.comment;

	// add a default visibility
	if ( !/@private|@public|@protected|@sap-restricted|@ui5-restricted/.test(src) ) {
		src = unwrap(src);
		src = src + "\n@private";
		src = wrap(src);
		// console.log("added default visibility to '" + src + "'");
	}

	if ( /@class/.test(src) && /@static/.test(src) ) {
		warning("combination of @class and @static is no longer supported with jsdoc3, converting it to @namespace and @classdesc: (line " + e.lineno + ")");
		src = unwrap(src);
		src = src.replace(/@class/, "@classdesc").replace(/@static/, "@namespace");
		src = wrap(src);
		//console.log(src);
	}

	return src;

}

// ---- other functionality ---------------------------------------------------------------------------

// HACK: override cli.exit() to avoid that JSDoc3 exits the VM
if ( pluginConfig.noExit ) {
	info("disabling exit() call");
	require( path.join(global.env.dirname, 'cli') ).exit = function(retval) {
		info(`cli.exit(): do nothing (ret val=${retval})`);
	};
}


// ---- exports ----------------------------------------------------------------------------------------

exports.defineTags = function(dictionary) {

	/**
	 * a special value that is not 'falsy' but results in an empty string when output
	 * Used for the disclaimer and experimental tag
	 */
	const EMPTY = {
		toString: function() { return ""; }
	};

	/**
	 * A sapui5 specific tag to add a disclaimer to a symbol
	 */
	dictionary.defineTag('disclaimer', {
		// value is optional
		onTagged: function(doclet, tag) {
			doclet.disclaimer = tag.value || EMPTY;
		}
	});

	/**
	 * A sapui5 specific tag to mark a symbol as experimental.
	 */
	dictionary.defineTag('experimental', {
		// value is optional
		onTagged: function(doclet, tag) {
			doclet.experimental = tag.value || EMPTY;
		}
	});

	/**
	 * Re-introduce the deprecated 'final tag. JSDoc used it as a synonym for readonly, but we use it to mark classes as final
	 */
	dictionary.defineTag('final', {
		mustNotHaveValue: true,
		onTagged: function(doclet, tag) {
			doclet.final_ = true;
		}
	});

	/**
	 * Introduce a new kind of symbol: 'interface'
	 * 'interface' is  like 'class', but without a constructor.
	 * Support for 'interface' might not be complete (only standard UI5 use cases tested)
	 */
	dictionary.defineTag('interface', {
		//mustNotHaveValue: true,
		onTagged: function(doclet, tag) {
			// debug("setting kind of " + doclet.name + " to 'interface'");
			doclet.kind = 'interface';
			if ( tag.value ) {
				doclet.classdesc = tag.value;
			}
		}
	});

	/**
	 * Classes can declare that they implement a set of interfaces.
	 */
	dictionary.defineTag('implements', {
		mustHaveValue: true,
		onTagged: function(doclet, tag) {
			// console.log("setting implements of " + doclet.name + " to 'interface'");
			if ( tag.value ) {
				doclet.implements = doclet.implements || [];
				tag.value.split(/\s*,\s*/g).forEach(($) => {
					// JSDoc's own @implements expects the curly braces notation, cut them off
					if ( $.startsWith("{") && $.endsWith("}") ) {
						$ = $.slice(1, -1).trim();
					}
					if ( $ && doclet.implements.indexOf($) < 0 ) {
						doclet.implements.push($);
					}
				});
			}
		}
	});

	/**
	 * Set the visibility of a doclet to 'restricted'.
	 */
	dictionary.defineTag('ui5-restricted', {
		onTagged: function(doclet, tag) {
			doclet.access = 'restricted';
			if ( tag.value ) {
				ui5data(doclet).stakeholders = tag.value.trim().split(/\s*,\s*/);
			}
		}
	});
	dictionary.defineTag('sap-restricted', {
		onTagged: function(doclet, tag) {
			error("Tag @sap-restricted has been deprecated, use @ui5-restricted instead");
			doclet.access = 'restricted';
			if ( tag.value ) {
				ui5data(doclet).stakeholders = tag.value.trim().split(/\s*,\s*/);
			}
		}
	});

	/**
	 * Mark a doclet as synthetic.
	 *
	 * Used for doclets that the autodoc generation creates. This helps the template
	 * later to recognize such doclets and maybe filter them out.
	 */
	dictionary.defineTag('synthetic', {
		mustNotHaveValue: true,
		onTagged: function(doclet, tag) {
			doclet.synthetic = true;
		}
	});

	/**
	 * Mark a doclet that intentionally updates a previous doclet
	 */
	dictionary.defineTag('ui5-updated-doclet', {
		mustNotHaveValue: true,
		onTagged: function(doclet, tag) {
			ui5data(doclet).updatedDoclet = true;
		}
	});

	/**
	 * The @hideconstructor tag tells JSDoc that the generated documentation should not display the constructor for a class.
	 * Note: this tag will be natively available in JSDoc >= 3.5.0
	 */
	dictionary.defineTag('hideconstructor', {
		mustNotHaveValue: true,
		onTagged: function(doclet, tag) {
			doclet.hideconstructor = true;
		}
	});

	/**
	 * A first-class member with this tag has no module export.
	 */
	dictionary.defineTag("ui5-global-only", {
		mustNotHaveValue: true,
		onTagged: function(doclet, tag) {
			ui5data(doclet).globalOnly = true;
		}
	});

	/**
	 * An entity with this tag should be marked with ts-ignore in TypeScript definitions.
	 * To keep the ignored sections small, only methods and properties will honor this tag.
	 * For all other entities, it will be ignored.
	 */
	dictionary.defineTag("ts-skip", {
		mustNotHaveValue: true,
		onTagged: function(doclet, tag) {
			ui5data(doclet).tsSkip = true;
		}
	});

	/**
	 * The 'template' can be used to describe type parameters of generic functions.
	 *
	 * - the 'name' part of the tag is mandatory
	 * - the 'type' part defines any type constraints
	 * - a type parameter can have a default value (default type)
	 *
	 * Examples:
	 * <pre>
	 *   @template E - Element type, just a name (<E>)
	 *   @template {UI5Element} E - Element type with type constraint (<E extends UI5Element>)
	 *   @template {UI5Element} [E=UI5Control] - Type param with a default type (<E extends UI5Element = UI5Control>)
	 * </pre>
	 *
	 * Note: Defining a type constraint implicitly makes the constraint the default value of the param.
	 * Additionally documenting a default type is only necessary when it differs from the constraint.
	 *
	 * @see {@link https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#template}
	 */
	dictionary.defineTag("template", {
		canHaveType: true,
		canHaveName: true,
		onTagged(doclet, tag) {
			if ( !tag.value ) {
				error("@template tag must have a value ('" + tag.text + "')");
				return;
			}
			if ( !tag.value.name ) {
				error("@template tag must have a name ('" + tag.text + "')");
				return;
			}
			doclet.typeParameters = doclet.typeParameters || [];
			doclet.typeParameters.push(tag.value);
		}
	});
};

exports.handlers = {

	/**
	 * Before all files are parsed, determine the common path prefix of all filenames
	 * @param {object} e Event info object
	 */
	parseBegin : function(e) {

		pathPrefixes = env.opts._.reduce((result, fileOrDir) => {
			fileOrDir = path.resolve( path.normalize(fileOrDir) );
			if ( fs.statSync(fileOrDir).isDirectory() ) {
				// ensure a trailing path separator
				if ( fileOrDir.indexOf(path.sep, fileOrDir.length - path.sep.length) < 0 ) {
					fileOrDir += path.sep;
				}
				result.push(fileOrDir);
			}
			return result;
		}, []);
		resourceNamePrefixes = pluginConfig.resourceNamePrefixes || [];
		if ( !Array.isArray(resourceNamePrefixes) ) {
			resourceNamePrefixes = [resourceNamePrefixes];
		}
		resourceNamePrefixes.forEach(ensureEndingSlash);
		while ( resourceNamePrefixes.length < pathPrefixes.length ) {
			resourceNamePrefixes.push('');
		}

		debug("path prefixes " + JSON.stringify(pathPrefixes));
		debug("resource name prefixes " + JSON.stringify(resourceNamePrefixes));
	},

	/**
	 * Log each file before it is parsed
	 * @param {object} e Event info object
	 */
	fileBegin: function (e) {
		currentProgram = undefined;
		currentModule = {
			name: null,
			resource: getResourceName(e.filename),
			module: getModuleName(getResourceName(e.filename)),
			localNames: Object.create(null),
			localNamesByLoc: Object.create(null)
		};
	},

	fileComplete: function (e) {
		// debug("module info after parsing: ", currentModule);
		currentSource = undefined;
		currentProgram = undefined;
		currentModule = undefined;
	},

	jsdocCommentFound: function(e) {
		// console.log("jsdocCommentFound: " + e.comment);
		e.comment = preprocessComment(e);
	},

	/*
	symbolFound: function(e) {
		// console.log("symbolFound: " + e.comment);
	},
	*/

	newDoclet: function(e) {

		const _ui5data = ui5data(e.doclet);

		// remove code: this is a try to reduce the required heap size
		if ( e.doclet.meta ) {
			if ( e.doclet.meta.code ) {
				e.doclet.meta.code = {};
			}
			const filepath = (e.doclet.meta.path && e.doclet.meta.path !== 'null' ) ? path.join(e.doclet.meta.path, e.doclet.meta.filename) : e.doclet.meta.filename;
			e.doclet.meta.__shortpath = getRelativePath(filepath);
			_ui5data.resource = currentModule.resource;
			_ui5data.module = currentModule.name || currentModule.module;

			const localDecl = findLocalDeclaration(e.doclet.meta.lineno, e.doclet.meta.columnno);
			if ( localDecl ) {
				debug("found matching local declaration", e.doclet.longname, "'" + localDecl.export + "'", currentModule.defaultExport);
				_ui5data.export = localDecl.export;
			}
		}


		// JSDoc 3 has a bug when it encounters a property in an object literal with an empty string as name
		// (e.g. { "" : something } will result in a doclet without longname
		if ( !e.doclet.longname && !e.doclet.undocumented ) {
			if ( e.doclet.memberof ) {
				e.doclet.longname = e.doclet.memberof + "." + e.doclet.name; // TODO '.' depends on scope?
				warning(`found doclet without longname, derived longname: ${e.doclet.longname} ${location(e.doclet)}`);
			} else {
				future(`found doclet without longname, could not derive longname ${location(e.doclet)}`);
			}
			return;
		}

		// try to detect misused memberof
		if ( e.doclet.memberof && e.doclet.longname.indexOf(e.doclet.memberof) !== 0 ) {
			warning(`potentially unsupported use of @name and @memberof ${location(e.doclet)}`);
			//console.log(e.doclet);
		}

		/*if ( e.doclet.returns
			 && e.doclet.returns.length > 0
			 && e.doclet.returns[0]
			 && e.doclet.returns[0].type
			 && e.doclet.returns[0].type.names
			 && e.doclet.returns[0].type.names[0] === 'this'
			 && e.doclet.memberof ) {
			warning(`fixing return type 'this' with ${e.doclet.memberof}`);
			e.doclet.returns[0].type.names[0] = e.doclet.memberof;
		}*/
	},

	beforeParse : function(e) {
		msgHeader("parsing " + getRelativePath(e.filename));
		currentSource = e.source;
	},

	parseComplete : function(e) {

		const doclets = e.doclets;
		const rAnonymous = /^<anonymous>(~|$)/;

		// remove undocumented symbols, ignored symbols, anonymous functions and their members, scope members
		let l = doclets.length, i, j;
		for (i = 0, j = 0; i < l; i++) {

			const doclet = doclets[i];
			if ( !doclet.undocumented &&
				!doclet.ignore &&
				!(doclet.memberof && rAnonymous.test(doclet.memberof)) &&
				doclet.longname.indexOf("~") < 0 ) {
				doclets[j++] = doclet;
			}
		}
		if ( j < l ) {
			doclets.splice(j, l - j);
			info(`removed ${l - j} undocumented, ignored or anonymous symbols`);
			l = j;
		}

		// sort doclets by name, synthetic, lineno, uid
		// 'ignore' is a combination of criteria, see function above
		debug("sorting doclets by name");
		doclets.sort((a, b) => {
			if ( a.longname === b.longname ) {
				if ( a.synthetic === b.synthetic ) {
					if ( a.meta && b.meta && a.meta.filename == b.meta.filename ) {
						if ( a.meta.lineno !== b.meta.lineno ) {
							return a.meta.lineno < b.meta.lineno ? -1 : 1;
						}
					}
					return a.__ui5.id - b.__ui5.id;
				}
				return a.synthetic && !b.synthetic ? -1 : 1;
			}
			return a.longname < b.longname ? -1 : 1;
		});
		debug("sorting doclets by name done.");

		for (i = 0, j = 0; i < l; i++) {

			const doclet = doclets[i];

			// add metadata to symbol
			if ( classInfos[doclet.longname] ) {
				// debug("class data", doclet.longname, "'" + classInfos[doclet.longname].export + "'");
				if ( doclet.__ui5.export === undefined ) {
					doclet.__ui5.export = classInfos[doclet.longname].export;
				}

				doclet.__ui5.metadata = classInfos[doclet.longname];
				// Push the stereotype to the main doclet.__ui5 object since that's where it's read.
				doclet.__ui5.stereotype = classInfos[doclet.longname].stereotype;

				// add designtime infos, if configured
				let designtimeModule = doclet.__ui5.metadata.designtime;
				if ( designtimeModule && typeof designtimeModule !== 'string' ) {
					designtimeModule = doclet.__ui5.module + ".designtime";
				}
				if ( designtimeModule && designtimeInfos[designtimeModule] ) {
					info(`associating designtime data with class metadata: ${designtimeModule}`);
					// TODO do a more generic merge or maybe add whole information as "designtime" information
					doclet.__ui5.metadata.annotations = designtimeInfos[designtimeModule].annotations;
				}

				// derive extends from UI5 APIs
				if ( doclet.__ui5.metadata.baseType
					 && !(doclet.augments && doclet.augments.length > 0) ) {
					doclet.augments = doclet.augments || [];
					info(`  @extends ${doclet.__ui5.metadata.baseType} derived from UI5 APIs (${doclet.longname})`);
					doclet.augments.push(doclet.__ui5.metadata.baseType);
				}

				// derive interface implementations from UI5 metadata
				if ( doclet.__ui5.metadata.interfaces && doclet.__ui5.metadata.interfaces.length ) {
					/* eslint-disable no-loop-func */
					doclet.__ui5.metadata.interfaces.forEach((intf) => {
						doclet.implements = doclet.implements || [];
						if ( doclet.implements.indexOf(intf) < 0 ) {
							info(`  @implements ${intf} derived from UI5 metadata (${doclet.longname})`);
							doclet.implements.push(intf);
						}
					});
					/* eslint-enable no-loop-func */
				}
			}

			if ( typeInfos[doclet.longname] ) {
				doclet.__ui5.stereotype = 'datatype';
				doclet.__ui5.metadata = {
					basetype: typeInfos[doclet.longname].base,
					pattern: typeInfos[doclet.longname].pattern,
					range: typeInfos[doclet.longname].range
				};
			}

			if ( doclet.kind === 'member' && doclet.isEnum && Array.isArray(doclet.properties) ) {
				// determine unique enum identifier from key set
				let enumID = doclet.properties.map(function(prop) {
					return prop.name;
				}).sort().join("|");
				enumID += "||" + ui5data(doclet).resource; // build almost-unique key
				if ( enumValues[enumID] ) {
					// debug("found enum values for ", enumID, enumValues[enumID]);
					let standardEnum = true;
					/* eslint-disable no-loop-func */
					doclet.properties.forEach((prop) => {
						prop.__ui5.value = enumValues[enumID][prop.name];
						if ( prop.__ui5.value !== prop.name ) {
							standardEnum = false;
						}
					});
					/* eslint-enable no-loop-func */
					if ( standardEnum ) {
						doclet.__ui5.stereotype = 'enum';
					}
				}
			}

			// check for duplicates: last one wins
			if ( j > 0 && doclets[j - 1].longname === doclet.longname ) {
				if ( !doclets[j - 1].synthetic && !doclet.__ui5.updatedDoclet ) {
					// replacing synthetic comments or updating comments are trivial case. Just log non-trivial duplicates
					debug(`ignoring duplicate doclet for ${doclet.longname}: ${location(doclet)} overrides ${location(doclets[j - 1])}`);
				}
				doclets[j - 1] = doclet;
			} else {
				doclets[j++] = doclet;
			}
		}

		if ( j < l ) {
			doclets.splice(j, l - j);
			info(`removed ${l - j} duplicate symbols - ${doclets.length} remaining`);
		}

		if ( pluginConfig.saveSymbols ) {

			fs.mkPath(env.opts.destination);
			fs.writeFileSync(path.join(env.opts.destination, "symbols-parseComplete.json"), JSON.stringify(e.doclets, null, "\t"), 'utf8');

		}

	}
};

exports.astNodeVisitor = {

	visitNode: function(node, e, parser, currentSourceName) {

		if ( node.type === Syntax.Program ) {
			currentProgram = node;
		}

		function processExtendCall(extendCall, comment, commentAlreadyProcessed) {
			const doclet = comment && new Doclet(getRawComment(comment), {});
			const classInfo = collectClassInfo(extendCall, doclet);
			if ( classInfo ) {
				createAutoDoc(classInfo, comment, doclet, extendCall, parser, currentSourceName, commentAlreadyProcessed);
			}
		}

		function processDataType(createCall, comment) {
			const doclet = comment && new Doclet(getRawComment(comment), {});
			const typeInfo = collectDataTypeInfo(createCall, doclet);
			if ( typeInfo ) {
				createDataTypeAutoDoc(typeInfo, comment, createCall, parser, currentSourceName);
			}
		}

		function processPotentialEnum(literal, comment) {
			const values = literal.properties.reduce((map, prop) => {
				map[getPropertyKey(prop)] = convertValue(prop.value);
				return map;
			}, Object.create(null));
			// determine unique enum ID from key set
			let enumID = Object.keys(values).sort().join("|");
			if (enumID.length) { // many false positives have no values at all, ignore them
				enumID += "||" + currentModule.resource; // make the key "really almost" unique
				// and remember the values with that ID
				enumValues[enumID] = values;
				// debug("found enum values for key-set", enumID);
			}
		}

		if ( node.type === Syntax.ExpressionStatement ) {
			if ( isSapUiDefineCall(node.expression) ) {
				analyzeModuleDefinition(node.expression);
			/*
			} else if ( isJQuerySapDeclareCall(node.expression)
				 && node.expression.arguments.length > 0
				 && node.expression.arguments[0].type === Syntax.Literal
				 && typeof node.expression.arguments[0].value === "string" ) {
				warning(`module has explicit module name ${node.expression.arguments[0].value}`);
			*/
			}

		}

		if (node.type === Syntax.ReturnStatement && node.argument && node.argument.type === Syntax.ObjectExpression && /\.designtime\.js$/.test(currentSourceName) ) {

			// assume this node to return designtime metadata. Collect it and remember it by its module name
			const oDesigntimeInfo = collectDesigntimeInfo(node);
			if ( oDesigntimeInfo ) {
				designtimeInfos[currentModule.module] = oDesigntimeInfo;
				info(`collected designtime info ${currentModule.module}`);
			}

		} else if ( node.type === Syntax.ExpressionStatement && isExtendCall(node.expression) ) {

			// Something.extend(...) -- return value (new class) is not used in an assignment

			// className = node.expression.arguments[0].value;
			const comment = getLeadingCommentNode(node) || getLeadingCommentNode(node.expression);
			// console.log("ast node with comment " + comment);
			processExtendCall(node.expression, comment);

		} else if ( node.type === Syntax.VariableDeclaration ) {
			node.declarations.forEach((decl, idx) => {
				if ( isExtendCall(decl.init) ) {
					// var NewClass = Something.extend(...)

					// className = node.declarations[0].init.arguments[0].value;
					const comment = (idx === 0 ? getLeadingCommentNode(node) : undefined) || getLeadingCommentNode(decl);
					// console.log(`ast node with comment ${comment}`);
					processExtendCall(decl.init, comment);
				} else if ( isPotentialEnum(decl.init) ) {
					const comment = (idx === 0 ? getLeadingCommentNode(node) : undefined) || getLeadingCommentNode(decl);
					processPotentialEnum(decl.init, comment);
				}
			});

		} else if ( node.type === Syntax.ReturnStatement && isExtendCall(node.argument) ) {

			// return Something.extend(...)

			const className = node.argument.arguments[0].value;
			const comment = getLeadingCommentNode(node, className) || getLeadingCommentNode(node.argument, className);
			// console.log(`ast node with comment ${comment}`);
			processExtendCall(node.argument, comment, true);
		} else if ( node.type === Syntax.ExpressionStatement && node.expression.type === Syntax.AssignmentExpression ) {

			if ( isCreateDataTypeCall(node.expression.right) ) {

				// thisLib.TypeName = DataType.createType( ... )
				const comment = getLeadingCommentNode(node) || getLeadingCommentNode(node.expression);
				processDataType(node.expression.right, comment);
				// TODO remember knowledge about type and its name (left hand side of assignment)

			} else if ( isPotentialEnum(node.expression.right) ) {
				const comment = getLeadingCommentNode(node) || getLeadingCommentNode(node.expression);
				// console.log(getResolvedObjectName(node.expression.left));
				processPotentialEnum(node.expression.right, comment);
			}

		} else if ( node.type === Syntax.File ) {
			// Check for copyright notice

			let programBodyStart;
			if ( node.program.body.length >= 1 ) {
				programBodyStart = node.program.body[0].start
			} else {
				// File has no code at all
				programBodyStart = Infinity;
			}

			const hasCopyrightComment = ( node.comments || [] ).some(function(commentBlock) {
				return (
					// Copyright comments must be at the top of the file, not between some code or at the end
					commentBlock.end <= programBodyStart &&
					/copyright|\(c\)|released under|license|\u00a9/.test(commentBlock.value)
				);
			});
			if ( !hasCopyrightComment ) {
				error(`document doesn't contain a copyright notice: ${getResourceName(currentSourceName)}`);
			}
		}
	}

};

(function() {
	const jsdocType = require("jsdoc/lib/jsdoc/tag/type");
	const catharsis = require('catharsis');
	const TYPES = catharsis.Types;

	const toTypeString = (type) => getTypeStrings(type).join("|");

	/*
	 * This function has been copied from jsdoc/lib/jsdoc/tag/type (version 3.6.7)
	 * The copy has been enhanced with the changes from https://github.com/jsdoc/jsdoc/pull/1735
	 * to retain the full function signature for function types and with a further change
	 * to retain the full record type structure.
	 *
	 * JSDoc is copyright (c) 2011-present Michael Mathews micmath@gmail.com and the contributors to JSDoc.
	 */ 
	function getTypeStrings(parsedType, isOutermostType) {
		let applications;
		let typeString;
		let types = [];
		switch (parsedType.type) {
			case TYPES.AllLiteral:
				types.push('*');
				break;
			case TYPES.FunctionType:
				typeString = 'function';
				// #### BEGIN: MODIFIED BY SAP
				const paramTypes = [];
				if (parsedType.new) {
					paramTypes.push(toTypeString(parsedType.new));
				}
				if (Array.isArray(parsedType.params)) {
					paramTypes.push(...parsedType.params.map(toTypeString));
				}
				if (paramTypes.length || parsedType.result) {
					typeString += `(${paramTypes.join(", ")})`;
				}
				if (parsedType.result) {
					typeString += `:${toTypeString(parsedType.result)}`;
				}
				types.push(typeString);
				// #### END: MODIFIED BY SAP
				break;
			 case TYPES.NameExpression:
				 types.push(parsedType.name);
				break;
			case TYPES.NullLiteral:
				types.push('null');
				break;
			case TYPES.RecordType:
				// #### BEGIN: MODIFIED BY SAP
				// types.push('Object');
				if (Array.isArray(parsedType.fields)) {
					typeString = `{${parsedType.fields.map(
						({key,value}) => {
							const keyString = catharsis.stringify(key);
							if (value) {
								var propertyPlusType = `${keyString}: ${toTypeString(value)}`;
								return propertyPlusType;
							} else {
								let pos;
								if (keyString && (pos = keyString.indexOf(":")) > -1) {
									// When no space is present between colon and type (e.g. the structure looks like "{x:number}" with no space after
									// the colon), then Catharsis parses this as property name "x:number" with no type given.
									// In this case give a clear hint that this space is needed and throw an error to prevent such issues from being merged
									const realName = keyString.substring(0, pos);
									const realValue = keyString.substring(pos + 1, keyString.length);
									let message = `Cannot parse the "${keyString}" part of "${parsedType.typeExpression}" in RecordType (log output above may give a hint in which file).\n`;
									message += `Did you mean to specify a property "${realName}" of type "${realValue}"? Then insert a space after the colon and write "${realName}: ${realValue}".`
									error(message);
									return "x: any"; // unparseable property set to "any" - but the JSDoc run will fail now, anyway
								} else {
									// only property given without type; this will be turned into type "any" further downstream
									return keyString;
								}
							}
						}
					).join(', ')}}`;
					types.push(typeString);
				} else {
					types.push('Object');
				}
				// #### END: MODIFIED BY SAP
				break;
			case TYPES.TypeApplication:
				// if this is the outermost type, we strip the modifiers; otherwise, we keep them
				if (isOutermostType) {
					applications = parsedType.applications.map(application =>
						catharsis.stringify(application)).join(', ');
					typeString = `${getTypeStrings(parsedType.expression)[0]}.<${applications}>`;
					types.push(typeString);
				}
				else {
					types.push( catharsis.stringify(parsedType) );
				}
				break;
			case TYPES.TypeUnion:
				parsedType.elements.forEach(element => {
					types = types.concat( getTypeStrings(element) );
				});
				break;
			case TYPES.UndefinedLiteral:
				types.push('undefined');
				break;
			case TYPES.UnknownLiteral:
				types.push('?');
				break;
			default:
				// this shouldn't happen
				throw new Error(`unrecognized type ${parsedType.type} in parsed type: ${parsedType}`);
		}
		return types;
	}

	const origParse = jsdocType.parse;
	jsdocType.parse = function() {
		const tagInfo = origParse.apply(this, arguments);
		// #### BEGIN: MODIFIED BY SAP
		if ( tagInfo && (/function/.test(tagInfo.typeExpression) || /\{.*\}/.test(tagInfo.typeExpression)) && tagInfo.parsedType ) {
			// #### END: MODIFIED BY SAP
			// console.info("old typeExpression", tagInfo.typeExpression); 
			// console.info("old parse tree", tagInfo.parsedType); 
			// console.info("old parse result", tagInfo.type); 
			tagInfo.type = getTypeStrings(tagInfo.parsedType);
			// console.info("new parse result", tagInfo.type); 
		}
		return tagInfo;
	}
}());
