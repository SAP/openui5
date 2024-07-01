/*
 * JSDoc3 template for UI5 documentation generation.
 *
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

/* global env: true */
/* eslint-env es6,node */
/* eslint strict: [2, "global"] */

"use strict";

/* imports */
const helper = require('jsdoc/util/templateHelper');
const fs = require('jsdoc/fs');
const doclet = require('jsdoc/doclet');
const path = require('jsdoc/path');
const logger = require('jsdoc/util/logger');
// const catharsis = require('catharsis');

/* ---- logging ---- */

const debug = logger.debug.bind(logger);
const info = logger.info.bind(logger);
const warning = logger.warn.bind(logger);
const error = logger.error.bind(logger);

const {extractVersion, extractSince} = require("./utils/versionUtil");

/* errors that might fail the build in future */
function future(msg) {
	if ( logger.getLevel() >= logger.LEVELS.WARN ) {
		const args = Array.prototype.slice.apply(arguments);
		args[0] = "FUTURE: " + args[0] + " (future error, ignored for now)";
		/* eslint-disable no-console */
		console.warn.apply(console, args);
		/* eslint-disable no-console */
	}
}

/* globals, constants */
const MY_TEMPLATE_NAME = "ui5",
	MY_ALT_TEMPLATE_NAME = "sapui5-jsdoc3",
	ANONYMOUS_LONGNAME = doclet.ANONYMOUS_LONGNAME,
	A_SECURITY_TAGS = [
		{
			name : "SecSource",
			caption : "Taint Source",
			description : "APIs that might introduce tainted data into an application, e.g. due to user input or network access",
			params : ["out","flags"]
		},
		{
			name : "SecEntryPoint",
			caption : "Taint Entry Point",
			description: "APIs that are called implicitly by a framework or server and trigger execution of application logic",
			params : ["in","flags"]
		},
		{
			name : "SecSink",
			caption : "Taint Sink",
			description : "APIs that pose a security risk when they receive tainted data",
			params : ["in","flags"]
		},
		{
			name : "SecPassthrough",
			caption : "Taint Passthrough",
			description : "APIs that might propagate tainted data when they receive it as input",
			params : ["in","out","flags"]
		},
		{
			name : "SecValidate",
			caption : "Validation",
			description : "APIs that (partially) cleanse tainted data so that it no longer poses a security risk in the further data flow of an application",
			params : ["in","out","flags"]
		}
	];

const templatesConf = (env.conf.templates || {}),
	templateConf = templatesConf[MY_TEMPLATE_NAME] || templatesConf[MY_ALT_TEMPLATE_NAME] || {};

let conf = {};

let __symbols;
let __longnames;
let __missingLongnames = {};

function merge(target, source) {
	if ( source != null ) {
		// simple single source merge
		Object.keys(source).forEach((prop) => {
			// guarding against prototype pollution. (https://codeql.github.com/codeql-query-help/javascript/js-prototype-pollution-utility/#example)
			if (prop === "__proto__" || prop === "constructor") {
				return;
			}
			const value = source[prop];
			if ( value != null && value.constructor === Object ) {
				merge(target[prop] || {}, value);
			} else {
				target[prop] = value;
			}
		});
	}
	// if there are more sources, merge them, too
	for (let i = 2; i < arguments.length; i++) {
		merge(target, arguments[i]);
	}
	return target;
}

function lookup(key) {
	if ( !Object.hasOwn(__longnames, key) ) {
		__missingLongnames[key] = (__missingLongnames[key] || 0) + 1;
		__longnames[key] = __symbols.find((symbol) => symbol.longname === key);
	}
	return __longnames[key];
}

function createSymbol(longname, lines = []) {
	const comment = [
		"@name " + longname,
		... lines
	];

	const symbol = new doclet.Doclet("/**\n * " + comment.join("\n * ") + "\n */", {});
	symbol.__ui5 = {};

	__longnames[longname] = symbol;
	__symbols.push(symbol);

	return symbol;
}

const externalSymbols = {};

function loadExternalSymbols(apiJsonFolder) {

	let files;

	try {
		files = fs.readdirSync(templateConf.apiJsonFolder);
	} catch (e) {
		if ( e.code === "ENOENT" ) {
			warning("folder with external symbols does not exist (ignored)");
		} else {
			error(`failed to list symbol files in folder '${apiJsonFolder}': ${e.message || e}`);
		}
		return;
	}

	if ( files && files.length ) {
		files.forEach((localFileName) => {
			const file = path.join(templateConf.apiJsonFolder, localFileName);
			try {
				const sJSON = fs.readFileSync(file, 'UTF-8');
				const data = JSON.parse(sJSON);
				if ( !Array.isArray(data.symbols) ) {
					throw new TypeError("api.json does not contain a 'symbols' array");
				}
				data.symbols.forEach((symbol) => {
					debug(`  adding external symbol ${symbol.name}`);
					externalSymbols[symbol.name] = symbol;
				});
			} catch (e) {
				error(`failed to load symbols from ${file}: ${e.message || e}`);
			}
		});
	}
}

function isModuleExport($) {
	return $.longname.startsWith("module:") && $.longname.search(/[.#~]/) < 0;
}

function isaClass($) {
	return /^(namespace|interface|class|typedef)$/.test($.kind) || (($.kind === 'member' || $.kind === 'constant') && $.isEnum )/* isNonEmptyNamespace($) */;
}

function supportsInheritance($) {
	return /^(interface|class|typedef)$/.test($.kind);
}

/*
 * Returns true for any symbol that should appear in the API reference index of the SDK.
 *
 * In a perfect world, such symbols would be
 * - default exports of AMD modules (named 'module:some/module)
 * - classes, interfaces, enums, typedefs and namespaces, all with global names whose parents are all namespaces
 * In the less perfect documentation build, the criterion 'whose parents are all namespaces' is ignored
 */
function isFirstClassSymbol($) {
	return (
		/^(namespace|interface|class|typedef)$/.test($.kind)
		|| ($.kind === 'member' || $.kind === 'constant') && $.isEnum
		|| ['function', 'member'].includes($.kind) && isModuleExport($)
	)/* isNonEmptyNamespace($) */;
}

function writeSymbols(symbols, filename, caption) {
	function filter(key,value) {
		if ( key === 'meta' ) {
			//return;
		}
		if ( key === '__ui5' && value ) {
			const v = {
				resource: value.resource,
				module: value.module,
				stakeholders: value.stakeholders,
				globalOnly: value.globalOnly
			};
			if ( value.derived ) {
				v.derived = value.derived.map(($) => $.longname);
			}
			if ( value.base ) {
				v.base = value.base.longname;
			}
			if ( value.implementations ) {
				v.base = value.implementations.map(($)=> $.longname);
			}
			if ( value.parent ) {
				v.parent = value.parent.longname;
			}
			if ( value.children ) {
				v.children = value.children.map(($) => $.longname);
			}
			return v;
		}
		return value;
	}
	if ( symbols.length < 20000 ) {
		const symbolsFile = path.join(env.opts.destination, filename);
		info(`writing ${caption} to ${symbolsFile}`);
		fs.writeFileSync(symbolsFile, JSON.stringify(symbols, filter, "\t"), 'utf8');
	}
}
// ---- publish() - main entry point for JSDoc templates -------------------------------------------------------------------------------------------------------

/* Called automatically by JsDoc Toolkit. */
function publish(symbolSet) {

	info("entering sapui5 template");

	// create output dir
	fs.mkPath(env.opts.destination);

	const originalSymbols = symbolSet().get();
	// writeSymbols(originalSymbols, "symbols-unpruned-ui5.json", "raw symbols before prune");

	info(`before prune: ${originalSymbols.length} symbols.`);
	symbolSet = helper.prune(symbolSet);
	// get an array version of the symbol set, useful for filtering
	const allSymbols = __symbols = symbolSet().get();
	info(`after prune: ${allSymbols.length} symbols.`);

	__longnames = {};
	allSymbols.forEach(function($) {
		__longnames[$.longname] = $;
	});

	if ( templateConf.apiJsonFolder ) {
		info(`loading external apis from folder '${templateConf.apiJsonFolder}'`);
		loadExternalSymbols(templateConf.apiJsonFolder);
	}

	// now resolve relationships
	const aRootNamespaces = createNamespaceTree(allSymbols);
	createInheritanceTree(allSymbols);
	collectMembers(allSymbols);
	mergeEventDocumentation(allSymbols);

	writeSymbols(allSymbols, "symbols-pruned-ui5.json", "raw symbols after prune");

	// -----

	const PUBLISHING_VARIANTS = {

		"apixml" : {
			defaults : {
				apiXmlFile: path.join(env.opts.destination, "jsapi.xml")
			},
			processor : function(conf) {
				createAPIXML(allSymbols, conf.apiXmlFile, {
					legacyContent: true
				});
			}
		},

		"apijson" : {
			defaults : {
				apiJsonFile: path.join(env.opts.destination, "api.json")
			},
			processor : function(conf) {
				createAPIJSON(allSymbols, conf.apiJsonFile);
			}
		},

		"fullapixml" : {
			defaults : {
				fullXmlFile: path.join(env.opts.destination, "fulljsapi.xml")
			},
			processor : function(conf) {
				createAPIXML(allSymbols, conf.fullXmlFile, {
					roots: aRootNamespaces,
					omitDefaults : conf.omitDefaultsInFullXml,
					resolveInheritance: true
				});
			}
		}

	};

	info("start publishing");
	if ( Array.isArray(templateConf.variants) ) {
		templateConf.variants.forEach((vVariant) => {

			if ( typeof vVariant === "string" ) {
				vVariant = { variant : vVariant };
			}

			info("");

			if ( PUBLISHING_VARIANTS[vVariant.variant] ) {

				// Merge different sources of configuration (listed in increasing priority order - last one wins)
				// and expose the result in the global 'conf' variable
				//  - global defaults
				//  - defaults for current variant
				//  - user configuration for sapui5 template
				//  - user configuration for current variant
				//
				// Note: trailing slash expected for dirs
				conf = merge({
					ext: ".html",
					filter: function($) { return true; }
				}, PUBLISHING_VARIANTS[vVariant.variant].defaults, templateConf, vVariant);

				info(`publishing as variant '${vVariant.variant}'`);
				debug("final configuration:");
				debug(conf);

				PUBLISHING_VARIANTS[vVariant.variant].processor(conf);

				info(`done with variant '${vVariant.variant}'`);

			} else {

				info(`cannot publish unknown variant '${vVariant.variant}' (ignored)`);

			}
		});
	}

	info("publishing done.");
}

//---- namespace tree --------------------------------------------------------------------------------

/**
 * Completes the tree of namespaces.
 *
 * Namespaces for which content is available but which have not been documented
 * are created as dummy, public namespace with empty documentation.
 *
 * @param {Array<doclet.Doclet>} allSymbols Array of all symbols to be published
 * @returns {Array<doclet.Doclet>} Array of all root namespaces
 */
function createNamespaceTree(allSymbols) {

	info(`create namespace tree (${allSymbols.length} symbols)`);

	const aRootNamespaces = [];
	const aTypes = allSymbols.filter((symbol) => isFirstClassSymbol(symbol));

	for (let i = 0; i < aTypes.length; i++) { // loop with a for-loop as it can handle concurrent modifications

		const symbol = aTypes[i];
		if ( symbol.memberof ) {

			let parent = lookup(symbol.memberof);
			if ( !parent ) {
				warning(`create missing namespace '${symbol.memberof}' (referenced by ${symbol.longname})`);
				parent = makeNamespace(symbol.memberof);
				aTypes.push(parent); // concurrent modification: parent will be processed later in this loop
			}
			symbol.__ui5.parent = parent;
			parent.__ui5.children = parent.__ui5.children || [];
			parent.__ui5.children.push(symbol);

		} else if ( symbol.longname !== ANONYMOUS_LONGNAME ) {

			aRootNamespaces.push(symbol);

		}
	}

	return aRootNamespaces;
}

function makeNamespace(memberof) {

	info(`adding synthetic namespace symbol ${memberof}`);

	return createSymbol(memberof, [
		"@namespace",
		"@synthetic",
		"@public"
	]);
}

//---- inheritance hierarchy ----------------------------------------------------------------------------

/*
 * Calculates the inheritance hierarchy for all class/interface/namespace symbols.
 * Each node in the tree has the content
 *
 * Node : {
 *      longname  : {string}     // name of the node (usually equals symbol.longname)
 *      symbol    : {Symbol}     // backlink to the original symbol
 *      base      : {Node}       // parent node or undefined for root nodes
 *      derived   : {Node[]}     // subclasses/-types
 * }
 *
 * @param {Array<doclet.Doclet>} allSymbols Array of all symbols to be published
 * @returns {Array<doclet.Doclet>} Array of all root types
 */
function createInheritanceTree(allSymbols) {

	info(`create inheritance tree (${allSymbols.length} symbols)`);

	const aTypes = allSymbols.filter((symbol) => supportsInheritance(symbol));
	const aRootTypes = [];

	let oObject = lookup("Object");
	if ( !oObject ) {
		oObject = createSymbol("Object", [
			"@class",
			"@synthetic",
			"@public"
		]);
		aRootTypes.push(oObject);
	}

	function getOrCreateClass(sClass, sExtendingClass) {
		let oClass = lookup(sClass);
		if ( !oClass ) {
			let sKind = "class",
				sBaseClass = 'Object',
				sVisibility = "public";
			if ( externalSymbols[sClass] ) {
				sKind = externalSymbols[sClass].kind || sKind;
				sBaseClass = externalSymbols[sClass].extends || sBaseClass;
				sVisibility = externalSymbols[sClass].visibility || sVisibility;
				debug(`create doclet for external class ${sClass} (extended by ${sExtendingClass})`);
			} else {
				warning(`create missing class ${sClass} (extended by ${sExtendingClass})`);
			}
			let oBaseClass = getOrCreateClass(sBaseClass, sClass);
			oClass = createSymbol(sClass, [
				"@extends " + sBaseClass,
				"@" + sKind,
				"@synthetic",
				sVisibility === "restricted" ? "@ui5-restricted" : "@" + sVisibility
			]);
			oClass.__ui5.base = oBaseClass;
			oBaseClass.__ui5.derived = oBaseClass.__ui5.derived || [];
			oBaseClass.__ui5.derived.push(oClass);
		}
		return oClass;
	}

	// link them according to the inheritance infos
	aTypes.forEach((oClass) => {

		if ( oClass.longname === 'Object') {
			return;
		}

		let sBaseClass = "Object";
		if ( oClass.augments && oClass.augments.length > 0 ) {
			if ( oClass.augments.length > 1 ) {
				warning(`multiple inheritance detected in ${oClass.longname}`);
			}
			sBaseClass = oClass.augments[0];
		} else {
			aRootTypes.push(oClass);
		}

		let oBaseClass = getOrCreateClass(sBaseClass, oClass.longname);
		oClass.__ui5.base = oBaseClass;
		oBaseClass.__ui5.derived = oBaseClass.__ui5.derived || [];
		oBaseClass.__ui5.derived.push(oClass);

		if ( oClass.implements ) {
			for (let j = 0; j < oClass.implements.length; j++) {
				let oInterface = lookup(oClass.implements[j]);
				if ( !oInterface ) {
					let sVisibility = "public";
					if ( externalSymbols[oClass.implements[j]] ) {
						sVisibility = externalSymbols[oClass.implements[j]] || sVisibility;
						debug(`create doclet for external interface ${oClass.implements[j]}`);
					}  else {
						warning(`create missing interface ${oClass.implements[j]}`);
					}
					oInterface = createSymbol(oClass.implements[j], [
						"@interface",
						"@synthetic",
						sVisibility === "restricted" ? "@ui5-restricted" : "@" + sVisibility
					]);
					oInterface.__ui5.base = oObject;
					oObject.__ui5.derived = oObject.__ui5.derived || [];
					oObject.__ui5.derived.push(oInterface);
				}
				oInterface.__ui5.implementations = oInterface.__ui5.implementations || [];
				oInterface.__ui5.implementations.push(oClass);
			}
		}
	});

	function setStereotype(oSymbol, sStereotype) {
		if ( !oSymbol ) {
			return;
		}
		oSymbol.__ui5.stereotype = sStereotype;
		const derived = oSymbol.__ui5.derived;
		if ( derived ) {
			for (let i = 0; i < derived.length; i++ ) {
				if ( !derived[i].__ui5.stereotype ) {
					setStereotype(derived[i], sStereotype);
				}
			}
		}
	}

	setStereotype(lookup("sap.ui.core.Component"), "component");
	setStereotype(lookup("sap.ui.core.Control"), "control");
	setStereotype(lookup("sap.ui.core.Element"), "element");
	setStereotype(lookup("sap.ui.base.Object"), "object");

	// check for cyclic inheritance (not supported)
	// Note: the check needs to run bottom up, not top down as a typical cyclic dependency never will end at the root node
	aTypes.forEach((oStartClass) => {
		const visited = {};
		function visit(oClass) {
			if ( visited[oClass.longname] ) {
				throw new Error(`cyclic inheritance detected: ${JSON.stringify(Object.keys(visited))}`);
			}
			if ( oClass.__ui5.base ) {
				visited[oClass.longname] = true;
				visit(oClass.__ui5.base);
				delete visited[oClass.longname];
			}
		}
		visit(oStartClass);
	});

	// collect root nodes (and ignore pure packages)
	return aRootTypes;
}

/**
 * Attaches each symbol to its parent ('memberof').
 *
 * @param {Array<doclet.Doclet>} allSymbols Array of all symbols to be published
 */
function collectMembers(allSymbols) {
	allSymbols.forEach(function($) {
		if ( $.memberof ) {
			const parent = lookup($.memberof);
			if ( parent /* && supportsInheritance(parent) */ ) {
				parent.__ui5.members = parent.__ui5.members || [];
				parent.__ui5.members.push($);
			}
		}
	});
}

/**
 * Searches for JSDoc events that are also described in UI5 metadata
 * and merges the parameter description from the JSDoc event into the UI5 event.
 *
 * @param {Array<doclet.Doclet>} allSymbols Array of all symbols to be published
 */
function mergeEventDocumentation(allSymbols) {

	debug("merging JSDoc event documentation into UI5 metadata");

	const aTypes = allSymbols.filter((symbol) => isaClass(symbol));

	aTypes.forEach((symbol) => {

		const metadata = symbol.__ui5.metadata;
		const members = symbol.__ui5.members;

		if ( !metadata || !metadata.events || Object.keys(metadata.events).length <= 0 || !members ) {
			return;
		}

		// debug(`merging events for '${symbol.longname}'`);
		members.forEach(($) => {
			if ( $.kind === 'event' && !$.inherited
				 && ($.access === 'public' || $.access === 'protected' || $.access == null)
				 && metadata.events[$.name]
				 && Array.isArray($.params)
				 && !$.synthetic ) {

				const event = metadata.events[$.name];
				let modified = false;

				$.params.forEach((param) => {
					const m = /^\w+\.getParameters\.(.*)$/.exec(param.name);
					if ( m ) {
						const pname = m[1];
						const ui5param = event.parameters[pname] || ( event.parameters[pname] = {});
						if ( ui5param.type == null ) {
							ui5param.type = listTypes(param.type);
							modified = true;
						}
						if ( ui5param.doc == null ) {
							ui5param.doc = param.description;
							modified = true;
						}
					}
				});

				if ( modified ) {
					info(`  merged documentation for managed event ${symbol.longname}#${$.name}`);
				}

			}
		});

	});

}

// ---- publishing -----------------------------------------------------------------------

// ---- helper functions for the templates ----

function sortByAlias(a, b) {
	const partsA = a.longname.split(/[.#]/);
	const partsB = b.longname.split(/[.#]/);
	let i = 0;
	while ( i < partsA.length && i < partsB.length ) {
		if ( partsA[i].toLowerCase() < partsB[i].toLowerCase() ) {
			return -1;
		}
		if ( partsA[i].toLowerCase() > partsB[i].toLowerCase() ) {
			return 1;
		}
		i++;
	}
	if ( partsA.length < partsB.length ) {
		return -1;
	}
	if ( partsA.length > partsB.length ) {
		return 1;
	}
	// as a last resort, try to compare the aliases case sensitive in case we have aliases that only
	// differ in case like with "sap.ui.model.type" and "sap.ui.model.Type"
	if ( a.longname < b.longname ) {
		return -1;
	}
	if ( a.longname > b.longname ) {
		return 1;
	}
	return 0;
}

/* Make a symbol sorter by some attribute. */
function makeSortby(/* fields ...*/) {
	const aFields = Array.prototype.slice.apply(arguments),
		aNorms = [],
		aFuncs = [];
	for (let i = 0; i < arguments.length; i++) {
		aNorms[i] = 1;
		if ( typeof aFields[i] === 'function' ) {
			aFuncs[i] = aFields[i];
			continue;
		}
		aFuncs[i] = function($,n) { return $[n]; };
		if ( aFields[i].indexOf("!") === 0 ) {
			aNorms[i] = -1;
			aFields[i] = aFields[i].slice(1);
		}
		if ( aFields[i] === 'deprecated' ) {
			aFuncs[i] = function($,n) { return !!$[n]; };
		} else if ( aFields[i] === 'static' ) {
			aFields[i] = 'scope';
			aFuncs[i] = function($,n) { return $[n] === 'static'; };
		} else if ( aFields[i].indexOf("#") === 0 ) {
			aFields[i] = aFields[i].slice(1);
			aFuncs[i] = function($,n) { return $.comment.getTag(n).length > 0; };
		}
	}
	return function(a, b) {
		// debug(`compare ${a.longname} : ${b.longname}`);
		let r = 0;
		for (let i = 0; r === 0 && i < aFields.length; i++) {
			let va = aFuncs[i](a,aFields[i]);
			let vb = aFuncs[i](b,aFields[i]);
			if ( va && !vb ) {
				r = -aNorms[i];
			} else if ( !va && vb ) {
				r = aNorms[i];
			} else if ( va && vb ) {
				va = String(va).toLowerCase();
				vb = String(vb).toLowerCase();
				if (va < vb) {
					r = -aNorms[i];
				}
				if (va > vb) {
					r = aNorms[i];
				}
			}
			// debug(`  ${aFields[i]}: ${va} ? ${vb} = ${r}`);
		}
		return r;
	};
}

function getMembersOfKind(data, kind) {
	let oResult = [];
	//debug(`calculating kind ${kind} from ${data.longname}`);
	//console.log(data);
	let fnFilter;
	switch (kind) {
	case 'property':
		fnFilter = function($) {
			return ($.kind === 'constant' || $.kind === 'member') && !$.isEnum;
		};
		break;
	case 'event':
		fnFilter = function($) {
			return $.kind === 'event';
		};
		break;
	case 'method':
		fnFilter = function($) {
			return $.kind === 'function';
		};
		break;
	default:
		// default: none
		fnFilter = function($) { return false; };
		break;
	}

	if ( data.__ui5.members ) {
		data.__ui5.members.forEach(function($) {
			if ( !$.inherited && fnFilter($) && conf.filter($) ) {
				oResult.push($);
			}
		});
	}

	return oResult;
}

// ---- type parsing ---------------------------------------------------------------------------------------------

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

class TypeStringBuilder {
	constructor() {
		this.lt = "<";
		this.gt = ">";
	}

	safe(type) {
		return type.needsParenthesis ? "(" + type.str + ")" : type.str;
	}
	literal(str) {
		return {
			simpleComponent: false,
			str: str
		};
	}
	simpleType(type) {
		return {
			simpleComponent: type !== "*",
			str: type
		};
	}
	array(componentType) {
		if ( componentType.needsParenthesis || componentType.simpleComponent === false ) {
			return {
				simpleComponent: false,
				str: "Array" + this.lt + this.safe(componentType) + this.gt
			};
		}
		return {
			str: componentType.str + "[]"
		};
	}
	object(keyType, valueType) {
		if ( keyType.synthetic ) {
			return {
				simpleComponent: false,
				str: "Object" + this.lt + this.safe(valueType) + this.gt
			};
		}
		return {
			simpleComponent: false,
			str: "Object" + this.lt + this.safe(keyType) + "," + this.safe(valueType) + this.gt
		};
	}
	set(elementType) {
		return {
			simpleComponent: false,
			str: 'Set' + this.lt + this.safe(elementType) + this.gt
		};
	}
	promise(fulfillmentType) {
		return {
			simpleComponent: false,
			str: 'Promise' + this.lt + this.safe(fulfillmentType) + this.gt
		};
	}
	"function"(paramTypes, returnType) {
		return {
			simpleComponent: false,
			str: "function(" + paramTypes.map(type => type.str).join(',') + ")" + ( returnType ? " : " + this.safe(returnType) : "")
		};
	}
	structure(structure) {
		const r = [];
		for ( let fieldName in structure ) {
			const typeOfField = structure[fieldName];
			// This builder is called bottom up. Therefore, an optional field
			// has been encoded as a trailing "=" in typeOfField.str already.
			// But for structures, the "=" must be added to the field name instead.
			if ( typeOfField.str.endsWith("=") ) {
				fieldName += "=";
				typeOfField.str = typeOfField.str.slice(0, -1);
			}
			if ( typeOfField.synthetic ) {
				r.push(fieldName);
			} else {
				r.push(fieldName + ":" + this.safe(typeOfField));
			}
		}
		return {
			simpleComponent: false,
			str: "{" + r.join(",") + "}"
		};
	}
	union(types) {
		return {
			needsParenthesis: true,
			str: types.map(type => this.safe(type)).join('|')
		};
	}
	synthetic(type) {
		type.synthetic = true;
		return type;
	}
	nullable(type) {
		type.str = "?" + type.str;
		return type;
	}
	mandatory(type) {
		type.str = "!" + type.str;
		return type;
	}
	optional(type) {
		type.str = type.str + "=";
		return type;
	}
	repeatable(type) {
		type.str = "..." + type.str;
		return type;
	}
	typeApplication(type, templateTypes) {
		return {
			simpleComponent: false,
			str: this.safe(type) + this.lt + templateTypes.map(type => this.safe(type)).join(',') + this.gt
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
}

const typeParser = new TypeParser();
const _TEXT_BUILDER = new TypeStringBuilder();

/*
function testTypeParser(type) {
	debug(`Type: '${type}' gives AST`);
	try {
		console.log(typeParser.parse(type));
	} catch (e) {
		error("**** throws: " + e);
	}
}

testTypeParser("Array.<string>");
testTypeParser("Array<string>");
testTypeParser("Object.<string>");
testTypeParser("Object<string>");
testTypeParser("function(...string):Set<string>");
testTypeParser("{a:int,b,c:float,d,e}");
*/

function _processTypeString(type, builder) {
	if ( type && Array.isArray(type.names) ) {
		type = type.names.join('|');
	}
	if ( type ) {
		try {
			return typeParser.parse( type, builder ).str;
		} catch (e) {
			future(`failed to parse type string '${type}': ${e}`);
			return type;
		}
	}
}

function listTypes(type) {
	return _processTypeString(type, _TEXT_BUILDER);
}

function isArrayType(type) {
	if ( type && Array.isArray(type.names) ) {
		type = type.names.join('|');
	}
	if ( type ) {
		try {
			const ast = typeParser.parse(type, new ASTBuilder());
			return ( ast.type === 'array' || (ast.type === 'union' && ast.types.some((subtype) => subtype.type === 'array')) );
		} catch (e) {
			future(`failed to parse type string '${type}': ${e}`);
		}
	}
	return false;
}

function normalizeLF(text) {
	if ( text == null ) {
		return text;
	}
	return String(text).replace(/\r\n|\r|\n/g, "\n");
}

/*
 * regexp to recognize important places in the text
 *
 * Capturing groups of the RegExp:
 *   group 1: begin of a pre block
 *   group 2: end of a pre block
 *   group 3: an empty line + surrounding whitespace (implicitly starts a new paragraph)
 *   group 4: an isolated line feed + surrounding whitespace
 *
 *                      [------- <pre> block -------] [---- an empty line and surrounding whitespace ----] [---- new line or whitespaces ----] */
const rNormalizeText = /(<pre(?:\s[^>]*)?>)|(<\/pre>)|([ \t]*(?:\r\n|\r|\n)[ \t]*(?:\r\n|\r|\n)[ \t\r\n]*)|([ \t]*(?:\r\n|\r|\n)[ \t]*|[ \t]+)/gi;

function normalizeWS(text) {
	if ( text == null ) {
		return text;
	}

	let inpre = false;
	return normalizeLF(text).replace(rNormalizeText, (match, pre, endpre, emptyline, ws) => {
		if ( pre ) {
			inpre = true;
			return pre;
		} else if ( endpre ) {
			inpre = false;
			return endpre;
		} else if ( emptyline ) {
			return inpre ? emptyline : '\n\n';
		} else if ( ws ) {
			return inpre ? ws : ' ';
		}
		return match;
	});

}

//---- add on: API JSON -----------------------------------------------------------------

function createAPIJSON(symbols, filename) {

	const api = {
		"$schema-ref": "http://schemas.sap.com/sapui5/designtime/api.json/1.0"
	};

	if ( templateConf.version ) {
		api.version = templateConf.version.replace(/-SNAPSHOT$/,"");
	}
	if ( templateConf.uilib ) {
		api.library = templateConf.uilib;
	}

	api.symbols = [];
	// sort only a copy(!) of the symbols, otherwise the SymbolSet lookup is broken
	symbols.slice().sort(sortByAlias).forEach((symbol) => {
		if ( isFirstClassSymbol(symbol) && !symbol.synthetic ) { // dump a symbol if it as a class symbol and if it is not a synthetic symbol
			try {
				const json = createAPIJSON4Symbol(symbol, false);
				api.symbols.push(json);
			} catch (e) {
				error(`failed to create api summary for ${symbol.name}`, e);
			}
		}
	});

	postProcessAPIJSON(api);
	validateAPIJSON(api);

	fs.mkPath(path.dirname(filename));
	fs.writeFileSync(filename, JSON.stringify(api), 'utf8');
	info(`  apiJson saved as ${filename}`);
}

const GLOBAL_ONLY = {};

function createAPIJSON4Symbol(symbol, omitDefaults) {

	const obj = [];
	let curr = obj;
	let attribForKind = 'kind';
	let stack = [];

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

	// In some cases, JSDoc does not provide a basename in property symbol.name, but a partially qualified name
	// this function reduces this to the base name
	function basename(name) {
		if (name.startsWith("module:")) {
			const p = name.lastIndexOf("/");
			name = name.slice(p + 1);
		}
		const p = name.lastIndexOf(".");
		return p < 0 ? name : name.slice(p + 1);
	}

	function tag(name, value, omitEmpty) {

		if ( omitEmpty && !value ) {
			return;
		}
		if ( arguments.length === 1 ) { // opening tag
			stack.push(curr);
			stack.push(attribForKind);
			const obj = {};
			if ( Array.isArray(curr) ) {
				if ( attribForKind != null ) {
					obj[attribForKind] = name;
				}
				curr.push(obj);
			} else {
				curr[name] = obj;
			}
			curr = obj;
			attribForKind = null;
			return;
		}
		if ( value == null ) {
			curr[name] = true;
		} else {
			curr[name] = String(value);
		}
	}

	function attrib(name, value, defaultValue, raw) {
		if ( omitDefaults && arguments.length >= 3 && value === defaultValue ) {
			return;
		}
		if ( arguments.length === 1 /* empty tag */ ) {
			curr[name] = true;
		} else {
			curr[name] = raw ? value : String(value);
		}
	}

	function attribSince(since) {
		if ( since ) {
			const version = extractVersion(since);
			if ( version ) {
				attrib("since", version);
			} else {
				future(`**** since information not parsable: '${since}'`);
			}
		}
	}

	function closeTag(name, noIndent) {
		attribForKind = stack.pop();
		curr  = stack.pop();
	}

	function collection(name, attribForKind) {
		stack.push(curr);
		stack.push(attribForKind);
		// TODO only supported if this.curr was an object check or fully implement
		curr = curr[name] = [];
		attribForKind = attribForKind || null;
	}

	function endCollection(name) {
		attribForKind = stack.pop();
		curr  = stack.pop();
	}

	function tagWithSince(name, value) {

		if ( !value ) {
			return;
		}

		const info = extractSince(value);

		tag(name);
		if ( info.since ) {
			attrib("since", info.since);
		}
		if (info.since === null) {
			future(`**** Failed to parse version in string '${value}'. ` +
				`Version might be missing or has an unexpected format.`)
		}
		if ( info.value ) {
			curr["text"] = normalizeWS(info.value);
		}
		closeTag(name, true);

	}

	function writeModuleInfo(member, symbol) {
		// write out resource, module and export only when the module is different from the module of the parent entity
		// and when the member was not cloned (e.g. because it is borrowed)
		var isBorrowed = member.__ui5.initialLongname !== member.longname;

		if ( member.__ui5.resource
			&& member.__ui5.resource !== symbol.__ui5.resource
			&& !isBorrowed ) {
			attrib("resource", member.__ui5.resource);
		}
		if ( member.__ui5.module
			 && member.__ui5.module !== symbol.__ui5.module
			 && !isBorrowed ) {
			attrib("module", member.__ui5.module);
			attrib("export", member.__ui5.globalOnly ? GLOBAL_ONLY : member.__ui5.export, '', true);
		}
	}

	function examples(symbol) {
		if ( symbol.examples && symbol.examples.length ) {
			collection("examples");
			for ( let j = 0; j < symbol.examples.length; j++) {
				const example = makeExample(symbol.examples[j]);
				tag("example");
				if ( example.caption ) {
					attrib("caption", example.caption);
				}
				attrib("text", normalizeLF(example.example));
				closeTag("example");
			}
			endCollection("examples");
		}
	}

	function referencesList(symbol) {
		if ( symbol.see && symbol.see.length ) {
			curr["references"] = symbol.see.slice();
		}
	}

	function visibility($) {
		if ( $.access === 'protected' ) {
			return "protected";
		} else if ( $.access === 'restricted' ) {
			return "restricted";
		} else if ( $.access === 'private' ) {
			return "private";
		} else {
			return "public";
		}
	}

	function stakeholders($) {
		if ( $.access === 'restricted' ) {
			return $.__ui5.stakeholders;
		}
		// return undefined
	}

	function exceptions(symbol) {
		let array = symbol.exceptions;

		if ( Array.isArray(array) ) {
			array = array.filter((ex) =>
				(ex.type && listTypes(ex.type)) || (ex.description && ex.description.trim())
			);
		}
		if ( array == null || array.length === 0 ) {
			return;
		}

		collection("throws");
		for (let j = 0; j < array.length; j++) {
			const exception = array[j];
			tag("exception");
			if ( exception.type !== undefined ) {
				attrib("type", listTypes(exception.type));
			}
			tag("description", normalizeWS(exception.description), true);
			closeTag("exception");
		}
		endCollection("throws");
	}

	function stakeholderList(tagname, stakeholders) {
		if ( Array.isArray(stakeholders) && stakeholders.length > 0 ) {
			curr[tagname] = stakeholders.slice();
		}
	}

	function methodList(tagname, methods) {
		methods = methods && Object.keys(methods).map((key) => methods[key]);
		if ( methods != null && methods.length > 0 ) {
			curr[tagname] = methods;
		}
	}

	function interfaceList(tagname, interfaces) {
		if ( interfaces != null && interfaces.length > 0 ) {
			curr[tagname] = interfaces.slice();
		}
	}

	function hasSettings($, visited) {

		visited = visited || {};

		if ( $.augments && $.augments.length > 0 ) {
			let baseSymbol = $.augments[0];
			if ( visited.hasOwnProperty(baseSymbol) ) {
				future(`detected cyclic inheritance when looking at ${$.longname}: ${JSON.stringify(visited)}`);
				return false;
			}
			visited[baseSymbol] = true;
			baseSymbol = lookup(baseSymbol);
			if ( hasSettings(baseSymbol, visited) ) {
				return true;
			}
		}

		const metadata = $.__ui5.metadata;
		return metadata &&
			(
				!isEmpty(metadata.specialSettings)
				|| !isEmpty(metadata.properties)
				|| !isEmpty(metadata.aggregations)
				|| !isEmpty(metadata.associations)
				|| !isEmpty(metadata.annotations)
				|| !isEmpty(metadata.events)
			);
	}

	function writeMetadata($) {

		const metadata = $.__ui5.metadata;
		if ( !metadata ) {
			return;
		}

		if ( metadata.library ) {
			// NOTE: Only adding "library" property for a validation within postProcessAPIJSON.
			// The property will be removed after the check as it contains redundant information.
			curr.library = metadata.library;
		}

		if ( metadata.specialSettings && Object.keys(metadata.specialSettings).length > 0 ) {
			collection("specialSettings");
			for ( let n in metadata.specialSettings ) {
				const special = metadata.specialSettings[n];
				tag("specialSetting");
				attrib("name", special.name);
				attrib("type", special.type);
				attrib("visibility", special.visibility, 'public');
				if (special.stakeholders) {
					stakeholderList("allowedFor", special.stakeholders);
				}
				attribSince(special.since);
				tag("description", normalizeWS(special.doc), true);
				tagWithSince("experimental", special.experimental);
				tagWithSince("deprecated", special.deprecation);
				methodList("method", special.methods);
				closeTag("specialSetting");
			}
			endCollection("specialSettings");
		}

		if ( metadata.properties && Object.keys(metadata.properties).length > 0 ) {
			collection("properties");
			for ( let n in metadata.properties ) {
				const prop = metadata.properties[n];
				let defaultValue = prop.defaultValue != null ? prop.defaultValue.value : null;
				// JSON can't transport a value of undefined, so represent it as string
				if ( defaultValue === undefined ) {
					defaultValue = String(defaultValue);
				}
				tag("property");
				attrib("name", prop.name);
				attrib("type", prop.type, 'string');

				if (prop.dataType) {
					attrib("dataType", prop.dataType, 'string');
				}

				attrib("defaultValue", defaultValue, null, /* raw = */true);
				attrib("group", prop.group, 'Misc');
				attrib("visibility", prop.visibility, 'public');
				if (prop.stakeholders) {
					stakeholderList("allowedFor", prop.stakeholders);
				}

				attribSince(prop.since);
				if ( prop.bindable ) {
					attrib("bindable", prop.bindable, false, /* raw = */true);
				}
				tag("description", normalizeWS(prop.doc), true);
				tagWithSince("experimental", prop.experimental);
				tagWithSince("deprecated", prop.deprecation);
				methodList("methods", prop.methods);
				closeTag("property");
			}
			endCollection("properties");
		}

		if ( metadata.defaultProperty ) {
			tag("defaultProperty", metadata.defaultProperty);
		}

		if ( metadata.dnd ) {
			curr.dnd = metadata.dnd;
		}

		if ( metadata.aggregations && Object.keys(metadata.aggregations).length > 0 ) {
			collection("aggregations");
			for ( let n in metadata.aggregations ) {
				const aggr = metadata.aggregations[n];
				tag("aggregation");
				attrib("name", aggr.name);
				attrib("singularName", aggr.singularName); // TODO omit default?
				attrib("type", aggr.type, 'sap.ui.core.Control');
				if ( aggr.altTypes ) {
					curr.altTypes = aggr.altTypes.slice();
				}
				attrib("cardinality", aggr.cardinality, '0..n');
				attrib("visibility", aggr.visibility, 'public');
				if (aggr.stakeholders) {
					stakeholderList("allowedFor", aggr.stakeholders);
				}

				attribSince(aggr.since);
				if ( aggr.bindable ) {
					attrib("bindable", aggr.bindable, false, /* raw = */true);
				}
				if ( aggr.dnd ) {
					curr.dnd = aggr.dnd;
				}
				tag("description", normalizeWS(aggr.doc), true);
				tagWithSince("experimental", aggr.experimental);
				tagWithSince("deprecated", aggr.deprecation);
				methodList("methods", aggr.methods);
				closeTag("aggregation");
			}
			endCollection("aggregations");
		}

		if ( metadata.defaultAggregation ) {
			tag("defaultAggregation", metadata.defaultAggregation);
		}

		if ( metadata.associations && Object.keys(metadata.associations).length > 0 ) {
			collection("associations");
			for ( let n in metadata.associations ) {
				const assoc = metadata.associations[n];
				tag("association");
				attrib("name", assoc.name);
				attrib("singularName", assoc.singularName); // TODO omit default?
				attrib("type", assoc.type, 'sap.ui.core.Control');
				attrib("cardinality", assoc.cardinality, '0..1');
				attrib("visibility", assoc.visibility, 'public');
				if (assoc.stakeholders) {
					stakeholderList("allowedFor", assoc.stakeholders);
				}

				attribSince(assoc.since);
				tag("description", normalizeWS(assoc.doc), true);
				tagWithSince("experimental", assoc.experimental);
				tagWithSince("deprecated", assoc.deprecation);
				methodList("methods", assoc.methods);
				closeTag("association");
			}
			endCollection("associations");
		}

		if ( metadata.events && Object.keys(metadata.events).length > 0 ) {
			collection("events");
			for ( let n in metadata.events ) {
				const event = metadata.events[n];
				tag("event");
				attrib("name", event.name);
				attrib("visibility", event.visibility, 'public');
				if (event.stakeholders) {
					stakeholderList("allowedFor", event.stakeholders);
				}
				if ( event.allowPreventDefault ) {
					attrib("allowPreventDefault", event.allowPreventDefault, false, /* raw = */true);
				}
				if ( event.enableEventBubbling ) {
					attrib("enableEventBubbling", event.enableEventBubbling, false, /* raw = */true);
				}
				attribSince(event.since);
				tag("description", normalizeWS(event.doc), true);
				tagWithSince("experimental", event.experimental);
				tagWithSince("deprecated", event.deprecation);
				if ( event.parameters && Object.keys(event.parameters).length > 0 ) {
					tag("parameters");
					for ( let pn in event.parameters ) {
						if ( event.parameters.hasOwnProperty(pn) ) {
							const param = event.parameters[pn];
							tag(pn);
							attrib("name", pn);
							attrib("type", param.type);
							attribSince(param.since);
							tag("description", normalizeWS(param.doc), true);
							tagWithSince("experimental", param.experimental);
							tagWithSince("deprecated", param.deprecation);
							closeTag(pn);
						}
					}
					closeTag("parameters");
				}
				methodList("methods", event.methods, true);
				closeTag("event");
			}
			endCollection("events");
		}

		if ( metadata.annotations && Object.keys(metadata.annotations).length > 0 ) {
			collection("annotations");
			for ( let n in metadata.annotations ) {
				const anno = metadata.annotations[n];
				tag("annotation");
				attrib("name", anno.name);
				attrib("namespace", anno.namespace);
				if ( anno.target && anno.target.length > 0 ) {
					curr.target = anno.target.slice();
				}
				attrib("annotation", anno.annotation);
				attrib("defaultValue", anno.defaultValue);
				if ( anno.appliesTo && anno.appliesTo.length > 0 ) {
					curr.appliesTo = anno.appliesTo.slice();
				}
				attribSince(anno.since);
				tag("description", normalizeWS(anno.doc), true);
				tagWithSince("deprecated", anno.deprecation);
				closeTag("annotation");
			}
			endCollection("annotations");
		}

		if ( metadata.designtime ) { // don't write falsy values
			tag("designtime", metadata.designtime);
		}

	}

	function writeParameterProperties(param, params) {
		const prefix = param.name + '.';
		const altPrefix = isArrayType(param.type) ? param.name + '[].' : null;

		let count = 0;
		for ( let i = 0; i < params.length; i++ ) {

			let name = params[i].name;
			if ( altPrefix && name.lastIndexOf(altPrefix, 0) === 0 ) { // startsWith
				name = name.slice(altPrefix.length);
			} else if ( name.lastIndexOf(prefix, 0) === 0 ) { // startsWith
				if ( altPrefix ) {
					warning("Nested @param tag in the context of an array type is used without []-suffix", name);
				}
				name = name.slice(prefix.length);
			} else {
				continue;
			}

			if ( name.indexOf('.') >= 0 ) {
				continue;
			}

			if ( count === 0 ) {
				tag("parameterProperties");
			}

			count++;

			tag(name);
			attrib("name", name);
			attrib("type", listTypes(params[i].type));
			attrib("optional", !!params[i].optional, false, /* raw = */true);
			if ( params[i].defaultvalue !== undefined ) {
				attrib("defaultValue", params[i].defaultvalue, undefined, /* raw = */true);
			}
			attribSince(params[i].since);

			writeParameterProperties(params[i], params);

			tag("description", normalizeWS(params[i].description), true);
			tagWithSince("experimental", params[i].experimental);
			tagWithSince("deprecated", params[i].deprecated);

			closeTag(name);
		}

		if ( count > 0 ) {
			closeTag("parameterProperties");
		}
	}

	function writePropertyProperties(prop, symbol) {
		const properties = symbol.properties;
		const prefix = prop.name + '.';
		const altPrefix = isArrayType(prop.type) ? prop.name + '[].' : null;

		let count = 0;
		for ( let i = 0; i < properties.length; i++ ) {

			let name = properties[i].name;
			if ( altPrefix && name.lastIndexOf(altPrefix, 0) === 0 ) { // startsWith
				name = name.slice(altPrefix.length);
			} else if ( name.lastIndexOf(prefix, 0) === 0 ) { // startsWith
				if ( altPrefix ) {
					warning("Nested @property tag in the context of an array type is used without []-suffix", name);
				}
				name = name.slice(prefix.length);
			} else {
				continue;
			}

			if ( name.indexOf('.') >= 0 ) {
				continue;
			}

			if ( count === 0 ) {
				tag("properties");
			}

			count++;

			tag(name);
			attrib("name", name);
			attrib("type", listTypes(properties[i].type));
			attrib("optional", !!properties[i].optional, false, /* raw = */true);
			writePropertyProperties(properties[i], symbol);
			tag("description", normalizeWS(properties[i].description), true);
			attrib("visibility", visibility(symbol), 'public'); // properties inherit visibility of typedef
			if ( stakeholders(symbol) ) {
				stakeholderList("allowedFor", stakeholders(symbol));
			}

			// as JSDoc does not allow tags for other tags, no @deprecated etc. can be supported
			// tagWithSince("experimental", properties[i].experimental);
			// tagWithSince("deprecated", properties[i].deprecated);

			closeTag(name);
		}

		if ( count > 0 ) {
			closeTag("properties");
		}
	}

	function methodSignature(member, suppressReturnValue) {

		if ( member.typeParameters && member.typeParameters.length ) {
			collection("typeParameters");
			for (let j = 0; j < member.typeParameters.length; j++) {
				const typeParam = member.typeParameters[j];
				tag("typeParameter");
				attrib("name", typeParam.name);
				if ( typeParam.type ) {
					// 'type' is optional for type parameters
					attrib("type", listTypes(typeParam.type));
				}
				if ( typeParam.defaultvalue !== undefined ) {
					attrib("default", typeParam.defaultvalue, undefined, /* raw = */true);
				}
				closeTag("typeParameter");
			}
			endCollection("typeParameters");
		}

		if ( !suppressReturnValue ) {
			const returns = member.returns && member.returns.length && member.returns[0];
			const type = listTypes((returns && returns.type) || member.type);
			//if ( type && type !== 'void' ) {
			//	attrib("type", type, 'void');
			//}
			if ( type && type !== 'void' || returns && returns.description ) {
				tag("returnValue");
				if ( type && type !== 'void' ) {
					attrib("type", type);
				}
				if ( returns && returns.description ) {
					attrib("description", normalizeWS(returns.description));
				}
				closeTag("returnValue");
			}
		}

		const omissibleParams = new Set(member.__ui5 && member.__ui5.omissibleParams);
		if ( member.params && member.params.length > 0 ) {
			collection("parameters");
			for ( let j = 0; j < member.params.length; j++) {
				const param = member.params[j];
				if ( param.name.indexOf('.') >= 0 ) {
					continue;
				}
				tag("parameter");
				attrib("name", param.name);
				attrib("type", listTypes(param.type));
				attrib("optional", !!param.optional, false, /* raw = */true);
				if ( omissibleParams.has(param.name) ) {
					if ( !param.optional ) {
						throw new Error(`@param ${param.name} is specified in '@ui5-omissible-params' for '${member.name}', but not marked as optional. Only optional params can be omissible.`);
					}
					attrib("omissible", true, false, /* raw = */true);
					omissibleParams.delete(param.name);
				}
				if ( param.variable ) {
					attrib("repeatable", !!param.variable, false, /* raw = */true);
				}
				if ( param.defaultvalue !== undefined ) {
					attrib("defaultValue", param.defaultvalue, undefined, /* raw = */true);
				}
				attribSince(param.since);
				writeParameterProperties(param, member.params);
				tag("description", normalizeWS(param.description), true);
				tagWithSince("experimental", param.experimental);
				tagWithSince("deprecated", param.deprecated);
				closeTag("parameter");
			}
			endCollection("parameters");
		}
		if ( omissibleParams.size > 0 ) {
			throw new Error(`parameter(s) '${[...omissibleParams].join("' and '")}' specified as '@ui5-omissible-params' for '${member.name}' missing among the actual @params`);
		}

		exceptions(member);

	}

	function writeMethod(member, name, canBeOptional) {
		name = name || member.name;
		const optional = /\?$/.test(name);
		if ( optional ) {
			name = name.slice(0,-1);
		}
		tag("method");
		attrib("name", name || member.name);
		writeModuleInfo(member, symbol);
		attrib("visibility", visibility(member), 'public');
		if ( stakeholders(member) ) {
			stakeholderList("allowedFor", stakeholders(member));
		}
		if ( member.scope === 'static' ) {
			attrib("static", true, false, /* raw = */true);
		}
		attribSince(member.since);
		if ( member.tags && member.tags.some((tag) => tag.title === 'ui5-metamodel') ) {
			attrib('ui5-metamodel', true, false, /* raw = */true);
		}
		if ( canBeOptional && optional ) {
			attrib("optional", true, false, /* raw = */true);
		}

		methodSignature(member);

		tag("description", normalizeWS(member.description), true);
		tagWithSince("experimental", member.experimental);
		tagWithSince("deprecated", member.deprecated);
		examples(member);
		referencesList(member);
		if ( member.__ui5.tsSkip ) {
			attrib("tsSkip", true, false, /* raw = */true);
		}
		//secTags(member);
		closeTag("method");

	}

	/*
	let rSplitSecTag = /^\s*\{([^\}]*)\}/;

	function secTags($) {
		if ( true ) {
			return;
		}
		let aTags = $.tags;
		if ( !aTags ) {
			return;
		}
		for (let iTag = 0; iTag < A_SECURITY_TAGS.length; iTag++  ) {
			let oTagDef = A_SECURITY_TAGS[iTag];
			for (let j = 0; j < aTags.length; j++ ) {
				if ( aTags[j].title.toLowerCase() === oTagDef.name.toLowerCase() ) {
					tag(oTagDef.name);
					let m = rSplitSecTag.exec(aTags[j].text);
					if ( m && m[1].trim() ) {
						let aParams = m[1].trim().split(/\s*\|\s* /); <-- remember to remove the space!
						for (let iParam = 0; iParam < aParams.length; iParam++ ) {
							tag(oTagDef.params[iParam], aParams[iParam]);
						}
					}
					let sDesc = aTags[j].description;
					tag("description", sDesc, true);
					closeTag(oTagDef.name);
				}
			}
		}
	}
	*/

	const kind = ((symbol.kind === 'member' || symbol.kind === 'constant') && symbol.isEnum) ? "enum" : symbol.kind; // handle pseudo-kind 'enum'

	tag(kind);

	attrib("name", symbol.longname);
	attrib("basename", basename(symbol.name));
	if ( symbol.__ui5.resource ) {
		attrib("resource", symbol.__ui5.resource);
	}
	if ( symbol.__ui5.module ) {
		attrib("module", symbol.__ui5.module);
		attrib("export", symbol.__ui5.globalOnly ? GLOBAL_ONLY : symbol.__ui5.export, '', true);
	}
	if ( /* TODO (kind === 'class') && */ symbol.virtual ) {
		// Note reg. the TODO: only one unexpected occurrence found in DragSession (DragAndDrop.js)
		attrib("abstract", true, false, /* raw = */true);
	}
	if ( /* TODO (kind === 'class' || kind === 'interface') && */ symbol.final_ ) {
		// Note reg. the TODO: enums are marked as final & namespace, they would loose the final with the addtl. check.
		attrib("final", true, false, /* raw = */true);
	}
	if ( symbol.scope === 'static' ) {
		attrib("static", true, false, /* raw = */true);
	}
	attrib("visibility", visibility(symbol), 'public');
	if ( stakeholders(symbol) ) {
		stakeholderList("allowedFor", stakeholders(symbol));
	}
	attribSince(symbol.since);
	/* TODO if ( kind === 'class' || kind === 'interface' ) { */
		// Note reg. the TODO: some objects document that they extend other objects. JSDoc seems to support this use case
		// (properties show up as 'borrowed') and the borrowed entities also show up in the SDK (but not the 'extends' relationship itself)
		if ( symbol.augments && symbol.augments.length ) {
			tag("extends", symbol.augments.sort().join(",")); // TODO what about multiple inheritance?
		}
		interfaceList("implements", symbol.implements);
	/* } */
	tag("description", normalizeWS(symbol.classdesc || (symbol.kind === 'class' ? '' : symbol.description)), true);
	if ( kind !== 'class' ) {
		examples(symbol); // for a class, examples are added to the constructor
		referencesList(symbol); // for a class, references are added to the constructor
	}
	tagWithSince("experimental", symbol.experimental);
	tagWithSince("deprecated", symbol.deprecated);
	if ( symbol.tags && symbol.tags.some(function(tag) { return tag.title === 'ui5-metamodel'; }) ) {
		attrib('ui5-metamodel', true, false, /* raw = */true);
	}

	let skipMembers = false;
	let standardEnum = false;

	if ( kind === 'class' ) {

		if ( symbol.__ui5.stereotype || (symbol.__ui5.metadata && symbol.__ui5.metadata.metadataClass) || hasSettings(symbol) ) {

			tag("ui5-metadata");

			if ( symbol.__ui5.stereotype ) {
				attrib("stereotype", symbol.__ui5.stereotype);
			}
			if ( symbol.__ui5.metadata && symbol.__ui5.metadata.metadataClass ) {
				attrib("metadataClass", symbol.__ui5.metadata.metadataClass);
			}

			writeMetadata(symbol);

			closeTag("ui5-metadata");
		}


		// if @hideconstructor tag is present we omit the whole constructor
		if ( !symbol.hideconstructor ) {

			tag("constructor");
			attrib("visibility", visibility(symbol));
			if ( stakeholders(symbol) ) {
				stakeholderList("allowedFor", stakeholders(symbol));
			}
			methodSignature(symbol, /* suppressReturnValue = */ true);

			tag("description", normalizeWS(symbol.description), true);
			// tagWithSince("experimental", symbol.experimental); // TODO repeat from class?
			// tagWithSince("deprecated", symbol.deprecated); // TODO repeat from class?
			examples(symbol); // TODO here or for class?
			referencesList(symbol); // TODO here or for class?
			// secTags(symbol); // TODO repeat from class?
			closeTag("constructor");

		} else {

			// even though the constructor is omitted here, the "hide" information is needed because in TypeScript it even exists when omitted
			attrib("hideconstructor", true, /* default */ false, /* raw */ true); // as boolean

		}

	} else if ( kind === 'namespace' ) {
		if ( symbol.__ui5.stereotype || symbol.__ui5.metadata ) {
			tag("ui5-metadata");

			if ( symbol.__ui5.stereotype ) {
				attrib("stereotype", symbol.__ui5.stereotype);
			}

			if ( symbol.__ui5.metadata && symbol.__ui5.metadata.basetype ) {
				attrib("basetype", symbol.__ui5.metadata.basetype);
			}

			if ( symbol.__ui5.metadata && symbol.__ui5.metadata.pattern ) {
				attrib("pattern", symbol.__ui5.metadata.pattern);
			}

			if ( symbol.__ui5.metadata && symbol.__ui5.metadata.range ) {
				attrib("range", symbol.__ui5.metadata.range, null, /* raw = */ true);
			}

			closeTag("ui5-metadata");
		}
	} else if ( kind === 'typedef' ) {
		// typedefs have their own property structure
		skipMembers = true;
		if ( symbol.params || symbol.returns || symbol.exceptions ) {
			methodSignature(symbol);
		} else if ( symbol.properties && symbol.properties.length > 0 ) {
			if ( symbol.type ) { // "type" of a typedef defines its inheritance base
				const type = listTypes(symbol.type);
				if ( type.toLowerCase() !== "object" ) {
					attrib("extends", type);
				}
			}
			collection("properties");
			symbol.properties.forEach((prop) => {
				if ( prop.name.indexOf('.') >= 0 ) {
					return;
				}
				tag("property");
				attrib("name", prop.name);
				attrib("type", listTypes(prop.type));
				attrib("optional", !!prop.optional, false, /* raw = */true);
				writePropertyProperties(prop, symbol);
				attrib("visibility", visibility(symbol), 'public'); // properties inherit visibility of typedef
				if ( stakeholders(symbol) ) {
					stakeholderList("allowedFor", stakeholders(symbol));
				}
				tag("description", normalizeWS(prop.description), true);
				closeTag("property");
			});
			endCollection("properties");
		} else if ( symbol.type ) {
			// a type alias
			attrib("type", listTypes(symbol.type));
		}
	} else if ( kind === 'enum' ) {
		if ( symbol.__ui5.stereotype ) {
			tag("ui5-metadata");
			attrib("stereotype", symbol.__ui5.stereotype);
			standardEnum = symbol.__ui5.stereotype === 'enum';
			closeTag("ui5-metadata");
		}
	} else if ( kind === 'function' ) {
		methodSignature(symbol);
	}

	if ( !skipMembers ) {
		const ownProperties = getMembersOfKind(symbol, "property").sort(sortByAlias);
		if ( ownProperties.length > 0 ) {
			collection("properties");
			for ( let i = 0; i < ownProperties.length; i++ ) {
				const member = ownProperties[i];
				tag("property");
				attrib("name", member.name);
				writeModuleInfo(member, symbol);
				if ( kind === 'enum' && !standardEnum && member.__ui5.value !== undefined ) {
					attrib("value", member.__ui5.value, undefined, /* raw = */true);
				}
				attrib("visibility", visibility(member), 'public');
				if ( stakeholders(member) ) {
					stakeholderList("allowedFor", stakeholders(member));
				}
				if ( member.scope === 'static' ) {
					attrib("static", true, false, /* raw = */true);
				}
				attribSince(member.since);
				attrib("type", listTypes(member.type));
				tag("description", normalizeWS(member.description), true);
				tagWithSince("experimental", member.experimental);
				tagWithSince("deprecated", member.deprecated);
				examples(member);
				referencesList(member);
				if ( member.__ui5.tsSkip ) {
					attrib("tsSkip", true, false, /* raw = */true);
				}
				closeTag("property");
			}
			endCollection("properties");
		}

		const ownEvents = getMembersOfKind(symbol, 'event').sort(sortByAlias);
		if ( ownEvents.length > 0 ) {
			collection("events");
			for (let i = 0; i < ownEvents.length; i++ ) {
				const member = ownEvents[i];
				tag("event");
				attrib("name", member.name);
				writeModuleInfo(member, symbol);
				attrib("visibility", visibility(member), 'public');
				if ( stakeholders(member) ) {
					stakeholderList("allowedFor", stakeholders(member));
				}
				if ( member.scope === 'static' ) {
					attrib("static", true, false, /* raw = */true);
				}
				attribSince(member.since);

				if ( member.params && member.params.length > 0 ) {
					collection("parameters");
					for (let j = 0; j < member.params.length; j++) {
						const param = member.params[j];
						if ( param.name.indexOf('.') >= 0 ) {
							continue;
						}

						tag("parameter");
						attrib("name", param.name);
						attrib("type", listTypes(param.type));
						if ( param.since ) {
							attrib("since", extractVersion(param.since));
						}
						writeParameterProperties(param, member.params);
						tag("description", normalizeWS(param.description), true);
						tagWithSince("experimental", param.experimental);
						tagWithSince("deprecated", param.deprecated);
						closeTag("parameter");
					}
					endCollection("parameters");
				}
				tag("description", normalizeWS(member.description), true);
				tagWithSince("deprecated", member.deprecated);
				tagWithSince("experimental", member.experimental);
				examples(member);
				referencesList(member);
				//secTags(member);
				closeTag("event");
			}
			endCollection("events");
		}

		const ownMethods = getMembersOfKind(symbol, 'method').sort(sortByAlias);
		// xmlmacro stereotype does not allow methods
		if ( symbol.__ui5.stereotype !== 'xmlmacro' && ownMethods.length > 0 ) {
			collection("methods");
			ownMethods.forEach(function(member) {
				writeMethod(member, undefined, symbol.kind === 'interface' || symbol.kind === 'class');
				if ( member.__ui5.members ) {
					// HACK: export nested static functions as siblings of the current function
					// A correct representation has to be discussed with the SDK / WebIDE
					member.__ui5.members.forEach(function($) {
						if ( $.kind === 'function' && $.scope === 'static'
							 && conf.filter($) && !$.inherited ) {
							future(`exporting nested function '${member.name}.${$.name}'`);
							writeMethod($, member.name + "." + $.name);
						}
					});
				}
			});
			endCollection("methods");
		}

	//	if ( roots && symbol.__ui5.children && symbol.__ui5.children.length ) {
	//		collection("children", "kind");
	//		symbol.__ui5.children.forEach(writeSymbol);
	//		endCollection("children");
	//	}
	}

	closeTag(kind);

	return obj[0];
}

function postProcessAPIJSON(api) {
	const modules = {};
	const symbols = api.symbols;

	// collect modules and the symbols that refer to them
	for ( let i = 0; i < symbols.length; i++) {
		const symbol = symbols[i];
		if ( symbol.module ) {
			modules[symbol.module] = modules[symbol.module] || [];
			modules[symbol.module].push({
				name: symbol.name,
				symbol: symbol
			});
		}
		if ( symbol.properties ) {
			for ( let j = 0; j < symbol.properties.length; j++ ) {
				if ( symbol.properties[j].static && symbol.properties[j].module ) {
					modules[symbol.properties[j].module] = modules[symbol.properties[j].module] || [];
					modules[symbol.properties[j].module].push({
						name: symbol.name + "." + symbol.properties[j].name,
						symbol: symbol.properties[j]
					});
				}
			}
		}
		if ( symbol.methods ) {
			for ( let j = 0; j < symbol.methods.length; j++ ) {
				if ( symbol.methods[j].static && symbol.methods[j].module ) {
					modules[symbol.methods[j].module] = modules[symbol.methods[j].module] || [];
					modules[symbol.methods[j].module].push({
						name: symbol.name + "." + symbol.methods[j].name,
						symbol: symbol.methods[j]
					});
				}
			}
		}
	}

	function guessExports(moduleName, symbols) {

		// a non-stringifiable special value for unresolved exports
		let UNRESOLVED = function() {};

		symbols = symbols.sort((a,b) => {
			if ( a.name === b.name ) {
				return 0;
			}
			return a.name < b.name ? -1 : 1;
		});

		// info(`resolving exports of '${n}': ${symbols.map((symbol) => symbol.name)`);
		const moduleNamePath = "module:" + moduleName;
		let defaultExport;
		if ( /^jquery\.sap\./.test(moduleName) ) {
			// the jquery.sap.* modules all export 'jQuery'.
			// any API from those modules is reachable via 'jQuery.*'
			defaultExport = 'jQuery';
		} else {
			// library.js modules export the library namespace; for all other modules, the assumed default export
			// is identical to the name of the module (converted to a 'dot' name)
			defaultExport = moduleName.replace(/\/library$/, "").replace(/\//g, ".");
		}

		// Pass 1: determine exports where possible, mark others with UNRESOLVED
		symbols.forEach(function(symbol) {
			if ( symbol.symbol.export !== undefined && symbol.symbol.export !== GLOBAL_ONLY ) {
				// export name was already determined during parsing
				debug(`    ${symbol.symbol.export || "(default)"}: ${symbol.name} (derived from source)`);
				return;
			}
			// debug(`check ${symbol.name} against ${defaultExport} and ${moduleNamePath}`);
			if ( symbol.symbol.kind === "typedef" || symbol.symbol.kind === "interface" || symbol.symbol.export === GLOBAL_ONLY ) {
				// type definitions, interfaces and symbols marked with @ui5-global-only have no representation on module level
				symbol.symbol.export = undefined;
			} else if ( symbol.name === moduleNamePath ) {
				// symbol name is the same as the module namepath -> symbol is the default export
				symbol.symbol.export = "";
			} else if ( symbol.name.lastIndexOf(moduleNamePath + ".", 0) === 0 ) {
				// symbol name starts with the module namepath and a dot -> symbol is a named export (static)
				symbol.symbol.export = symbol.name.slice(moduleNamePath.length + 1);
			} else if ( symbol.name === defaultExport ) {
				// default export equals the symbol name
				symbol.symbol.export = "";
				//debug(`    (default):${defaultExport}`);
			} else if ( symbol.name.lastIndexOf(defaultExport + ".", 0) === 0 ) {
				// default export is a prefix of the symbol name
				symbol.symbol.export = symbol.name.slice(defaultExport.length + 1);
				//debug(`    ${symbol.name.slice(defaultExport.length + 1)}: ${symbol.name}`);
			} else {
				// default export is not a prefix of the symbol name -> no way to access it in AMD
				symbol.symbol.export = UNRESOLVED;
			}
		});

		// Pass 2: check whether unresolved exports are critical or not
		symbols.forEach(function(symbol) {
			if ( symbol.symbol.export === UNRESOLVED ) {
				symbol.symbol.export = undefined;
				// an export is expected when a symbol is not a namespace or
				// when a namespace has children from the same module that are also lacking an export
				if ( symbol.symbol.kind !== "namespace"
					 || (symbol.symbol.properties && symbol.symbol.properties.some(function(prop) {
						 return prop.module === symbol.symbol.module && prop.export == null;
					 }) )
					 || (symbol.symbol.methods && symbol.symbol.methods.some(function(method) {
						 return method.module === symbol.symbol.module && method.export == null;
					 }) ) ) {
					future(`could not identify export name of '${symbol.name}', contained in module '${moduleName}'`);
				} else {
					debug(`could not identify export name of ${symbol.symbol.kind} '${symbol.name}', contained in module '${moduleName}'`);
				}
			}
			if ( symbol.symbol.kind === "namespace" && symbol.symbol.export === undefined ) {
				// if no export could be identified for a namespace, don't annotate the namespace with a module
				symbol.symbol.resource =
				symbol.symbol.module = undefined;
			}
		});

	}

	for ( let n in modules ) {
		guessExports(n, modules[n]);
	}

	function findSymbol(name) {
		if ( name == null || name === '' ) {
			return null;
		}
		return symbols.find((candidate) => candidate.name === name) || externalSymbols[name];
	}

	function findMetadataClass(symbol) {
		while ( symbol ) {
			if ( symbol["ui5-metadata"] && symbol["ui5-metadata"].metadataClass ) {
				const metadataSymbol = findSymbol(symbol["ui5-metadata"].metadataClass);
				if ( metadataSymbol != null && metadataSymbol.visibility === "public" ) {
					return symbol["ui5-metadata"].metadataClass;
				}
			}
			symbol = findSymbol(symbol.extends);
		}
		// return undefined
	}

	// See sap/ui/base/ManagedObjectMetadata
	const rLibName = /([a-z][^.]*(?:\.[a-z][^.]*)*)\./;
	function defaultLibName(sName) {
		var m = rLibName.exec(sName);
		return (m && m[1]) || "";
	}

	symbols.forEach((symbol) => {
		// add note for enums which are not exposed by their name
		if (symbol.kind === "enum" && symbol.export) {
			symbol.description += `\n\nThis enum is part of the '${symbol.module}' module export and must be accessed by the property '${symbol.export}'.`;
		}
		if ( !symbol["ui5-metadata"] ) {
			return;
		}
		if ( Array.isArray(symbol.methods) ) {
			symbol.methods.forEach((method) => {
				if ( method.name === "getMetadata" && method.returnValue ) {
					const metadataClass = findMetadataClass(symbol);
					if ( metadataClass && metadataClass !== method.returnValue.type ) {
						method.returnValue.type = metadataClass;
						debug(`  return type of '${symbol.name}${method.static ? "." : "#"}getMetadata' changed to '${metadataClass}'`);
					}
				}
			});
		}
		const libraryName = symbol["ui5-metadata"].library;
		if ( libraryName ) {
			// Removing "library" property from api.json as it contains redundant information and is not required by consumers
			// It is only required for the consistency checks below
			delete symbol["ui5-metadata"].library;

			if ( libraryName !== api.library ) {
				error(`specified library '${libraryName}' for class '${symbol.name}' doesn't match containing library '${api.library}'`);
			}
		} else if ( symbol["ui5-metadata"].stereotype === "element" || symbol["ui5-metadata"].stereotype === "control" ) {
			// The library property is only relevant for elements and controls.
			// The derived library name must not be checked for other classes such as types.
			const derivedLibraryName = defaultLibName(symbol.name);
			if (derivedLibraryName !== api.library) {
				future(`derived library '${derivedLibraryName}' for ${symbol["ui5-metadata"].stereotype} '${symbol.name}' ` +
					`doesn't match containing library '${api.library}'. Library must be explicitly defined in class metadata!`);
			}
		}
	});

}

const builtinTypes = {
	"void":true,
	any:true,
	"boolean":true,
	"int": true,
	"float":true,
	array:true,
	"function":true,
	string:true,
	object:true,
	"*": true,
	number:true,
	"null":true,
	undefined:true,
	"this":true,

	// builtin objects
	Array:true,
	ArrayBuffer:true,
	Boolean:true,
	Date:true,
	Error:true,
	Map:true,
	Number:true,
	String:true,
	Object:true,
	Promise:true,
	RegExp:true,
	Set:true,
	SyntaxError:true,
	TypeError:true,
	Uint8Array:true,
	WeakMap: true,

	// Web APIs
	AbortSignal:true,
	Attr:true,
	Blob:true,
	DataTransfer:true,
	Document:true,
	DOMException:true,
	Element:true,
	Event:true,
	File:true,
	FileList:true,
	Headers:true,
	HTMLDocument:true,
	HTMLElement:true,
	Node:true,
	Storage:true,
	Touch:true,
	TouchList:true,
	Window:true,
	XMLDocument:true

};

const typeNormalizer = (function() {
	class TypeNormalizer extends TypeStringBuilder {
		simpleType(type) {
			if ( type === 'map' ) {
				return this.object(
					this.simpleType('string'),
					this.simpleType('any')
				);
			}
			if ( type === '*' ) {
				type = 'any';
			}
			return super.simpleType(type);
		}
	}

	return new TypeNormalizer();
}());

/**
 * Wrong, but commonly used type names and their correct replacement.
 */
const erroneousTypes = {
	"integer": "int",
	"bool": "boolean",
	"double": "float",
	"long": "int",
	"int8": "int",
	"int16": "int",
	"int32": "int",
	"int64": "int",
	"uint8": "int",
	"uint16": "int",
	"uint32": "int",
	"uint64": "int"
};

function validateAPIJSON(api) {

	// create map of defined symbols (built-in types, dependency libraries, current library)
	const defined = Object.assign(Object.create(null), builtinTypes, externalSymbols);
	if ( api.symbols ) {
		api.symbols.forEach((symbol) => defined[symbol.name] = symbol);
	}

	const naming = Object.create(null);
	const missing = Object.create(null);

	const rValidNames = /^[$A-Z_a-z][$0-9A-Z_a-z]*$/i;
	const rValidModuleNames = /^[$A-Z_a-z][$\-\.0-9A-Z_a-z]*$/i;

	function checkName(name, hint) {
		if ( !rValidNames.test(name) ) {
			naming[name] = naming[name] || [];
			naming[name].push(hint);
		}
	}

	function checkModuleName(name, hint) {
		if ( !rValidModuleNames.test(name) ) {
			naming[name] = naming[name] || [];
			naming[name].push(hint);
		}
	}

	function checkCompoundName(name, hint) {

		if ( name.startsWith("module:") ) {
			const segments = name.slice("module:".length).split("/");

			// split last segment into a module name part and a symbol name part
			const p = segments[segments.length - 1].search(/[.~#]/);
			if ( p >= 0 ) {
				name = segments[segments.length - 1].slice(p + 1);
				segments[segments.length - 1] = segments[segments.length - 1].slice(0, p);
			}

			// check all module name parts
			segments.forEach((segment) => checkModuleName(segment, `path segment of ${hint}`));

			if ( p < 0 ) {
				// module name only, no export name to check
				return;
			}
		}

		name.split(/[.~#]/).forEach((segment) => checkName(segment, `name segment of ${hint}`));
	}

	function reportError(type, usage) {
		missing[type] = missing[type] || [];
		missing[type].push(usage);
	}

	function checkSimpleType(typeName, hint) {
		if ( !defined[typeName] ) {
			reportError(typeName, hint);
		}
	}

	function checkType(type, hint) {

		function _check(type) {
			if ( type == null ) {
				return;
			}
			switch (type.type) {
			case 'simpleType':
				checkSimpleType(type.name, hint);
				break;
			case 'array':
				_check(type.component);
				break;
			case 'object':
				_check(type.key);
				_check(type.value);
				break;
			case 'set':
				_check(type.element);
				break;
			case 'promise':
				_check(type.fulfill);
				break;
			case 'function':
				type.params.forEach(_check);
				_check(type.return);
				_check(type.this);
				_check(type.constructor);
				break;
			case 'structure':
				Object.keys(type.fields).forEach((key) => _check(type.fields[key]));
				break;
			case 'union':
				type.types.forEach(_check);
				break;
			case 'typeApplication':
				_check(type.baseType);
				type.templateTypes.forEach(_check);
				// TODO check number of templateTypes against declaration of baseType
				// requires JSDoc support of @template tag, which is currently missing
				break;
			default:
				break;
			}
		}
		try {
			// debug("normalize", type);
			type.type = typeParser.parse(type.type, typeNormalizer).str;
			// debug("check", type);
			const ast = typeParser.parse(type.type);
			_check(ast);
		} catch (e) {
			future(e);
			reportError(type.type, `failed to parse type of ${hint}`);
		}
	}

	function checkParam(param, prefix, hint) {
		checkName(param.name, `name of param ${prefix}${param.name} of ${hint}`);
		checkType(param, `param ${prefix}${param.name} of ${hint}`);
		if ( param.parameterProperties ) {
			Object.keys(param.parameterProperties).forEach((sub) =>
				checkParam(param.parameterProperties[sub], prefix + param.name + ".", hint));
		}
	}

	function checkMethodSignature(method, hint) {
		if ( method.returnValue ) {
			checkType(method.returnValue, `return value of ${hint}`);
		}
		if ( method.parameters ) {
			method.parameters.forEach((param) => checkParam(param, '', hint));
		}
		if ( method.throws ) {
			method.throws.forEach((ex) => checkType(ex, `exception of ${hint}`));
		}
	}

	function checkClassAgainstInterface(symbol, oIntfAPI) {
		if ( oIntfAPI.methods ) {
			oIntfAPI.methods.forEach((intfMethod) => {
				// search for method implementation
				const implMethod = symbol.methods && symbol.methods.find(
					(candidateMethod) => candidateMethod.name === intfMethod.name && !candidateMethod.static);

				if ( !implMethod ) {
					if ( !intfMethod.optional ) {
						reportError(oIntfAPI.name, `implementation of ${intfMethod.name} missing in ${symbol.name}`);
					}
				} else {
					if ( intfMethod.parameters ) {
						intfMethod.parameters.forEach((intfParam, idx) => {
							const implParam = implMethod.parameters && implMethod.parameters[idx];
							if ( !implParam ) {
								if ( !intfParam.optional ) {
									reportError(oIntfAPI.name, `parameter ${intfParam.name} missing in implementation of ${symbol.name}#${intfMethod.name}`);
								}
							} else {
								if ( implParam.type !== intfParam.type ) {
									reportError(oIntfAPI.name, `type of parameter ${intfParam.name} of interface method differs from type in implementation ${symbol.name}#${intfMethod.name}`);
								}
								// TODO check nested properties
							}
						});
					}
					if ( intfMethod.returnValue != null && implMethod.returnValue == null ) {
						reportError(oIntfAPI.name, `return value of interface method missing in implementation ${symbol.name}#${intfMethod}`);
					} else if ( intfMethod.returnValue == null && implMethod.returnValue != null ) {
						reportError(oIntfAPI.name, `while interface method is void, implementation ${symbol.name}#${intfMethod.name} returns a value`);
					} else if ( intfMethod.returnValue != null && implMethod.returnValue != null ) {
						if ( intfMethod.returnValue.type !== implMethod.returnValue.type ) {
							reportError(oIntfAPI.name, `return type of interface method differs from return type of implementation ${symbol.name}#${intfMethod.name}`);
						}
					}
				}
			});
		}
	}

	function checkEnum(symbol) {
		if ( symbol["ui5-metamodel"]
			 && !(symbol["ui5-metadata"] && symbol["ui5-metadata"].stereotype === "enum")
			 && Array.isArray(symbol.properties) && symbol.properties.length > 0 ) {
			reportError(symbol.name, "enum is metamodel relevant but keys and values differ");
		}
		checkCompoundName(symbol.name, `name of ${symbol.name}`);
		if ( symbol.properties ) {
			symbol.properties.forEach((prop) => {
				checkName(prop.name, `name of ${symbol.name}.${prop.name}`);
				if ( prop.type ) {
					checkType(prop, `type of ${symbol.name}.${prop.name}`);
				}
			});
		}
	}

	function checkClass(symbol) {
		checkCompoundName(symbol.name, `name of ${symbol.name}`);
		if ( symbol.extends ) {
			checkSimpleType(symbol.extends, `base class of ${symbol.name}`);
		}
		if ( symbol.implements ) {
			symbol.implements.forEach((intf) => {
				checkSimpleType(intf, `interface of ${symbol.name}`);
				let oIntfAPI = defined[intf];
				if ( oIntfAPI ) {
					checkClassAgainstInterface(symbol, oIntfAPI);
				}
			});
		}
		if ( Object.hasOwn(symbol, "constructor") ) {
			checkMethodSignature(symbol.constructor, symbol.name + ".constructor");
		}
		if ( symbol.properties ) {
			symbol.properties.forEach((prop) => {
				const qualifiedName = `${symbol.name}.${prop.name}`;
				checkName(prop.name, `name of ${qualifiedName}`);
				if ( prop.type ) {
					checkType(prop, `type of ${qualifiedName}`);
				}
			});
		}
		if ( symbol.methods ) {
			symbol.methods.forEach((method) => {
				const qualifiedName = `${symbol.name}.${method.name}`;
				checkName(method.name, `name of ${qualifiedName}`);
				checkMethodSignature(method, qualifiedName);
			});
		}
		if ( symbol.events ) {
			symbol.events.forEach((event) => {
				const qualifiedName = `${symbol.name}.${event.name}`;
				checkName(event.name, `name of ${qualifiedName}`);
				if ( event.parameters ) {
					event.parameters.forEach((param) => {
						checkParam(param, '', qualifiedName);
					});
				}
			});
		}
	}

	api.symbols.forEach((symbol) => {
		if ( symbol.kind === 'function' ) {
			checkCompoundName(symbol.name, `name of ${symbol.nam}`);
			checkMethodSignature(symbol, symbol.name);
		} else if ( symbol.kind === 'enum' ) {
			checkEnum(symbol);
		} else {
			checkClass(symbol);
		}
	});

	if ( Object.keys(missing).length > 0 || Object.keys(naming).length > 0 ) {
		future("API validation errors:"); // TODO decide on level

		Object.keys(missing).forEach((type) => {
			if ( Array.isArray(missing[type]) ) {
				if ( Object.hasOwn(erroneousTypes, type.toLowerCase()) ) {
					error(`type '${type}' (use '${erroneousTypes[type.toLowerCase()]}' instead)`);
					missing[type].forEach((usage) => error(`  ${usage}`));
				} else {
					future(`type '${type}'`);
					missing[type].forEach((usage) => future(`  ${usage}`));
				}
			}
		});
		Object.keys(naming).forEach((name) => {
			if ( Array.isArray(naming[name]) ) {
				future(`invalid name '${name}'`);
				naming[name].forEach((usage) => future(`  ${usage}`));
			}
		});
	} else {
		info("API validation succeeded.");
	}

}

//---- add on: API XML -----------------------------------------------------------------

function createAPIXML(symbols, filename, options = {}) {

	const roots = options.roots || null;
	const legacyContent = !!options.legacyContent;
	const omitDefaults = !!options.omitDefaults;
	const addRedundancy = !!options.resolveInheritance;

	const sIndent = "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t";
	const ENUM = legacyContent ? "namespace" : "enum";
	const BASETYPE = legacyContent ? "baseType" : "extends";
	const PROPERTY = legacyContent ? "parameter" : "property";

	const output = [];
	let indent = 0;
	let tags = [];
	let unclosedStartTag = false;

	function getAPIJSON(name) {

		const symbol = lookup(name);
		if ( symbol && !symbol.synthetic ) {
			return createAPIJSON4Symbol(symbol, false);
		}
		if ( addRedundancy && externalSymbols[name] ) {
			debug(`  using ${name} from external dependency`);
			return externalSymbols[name];
		}
		return symbol;
	}

	function encode(s) {
		return s ? s.replace(/&/g, "&amp;").replace(/</g, "&lt;") : s;
	}

	function write(args) {
		if ( arguments.length ) {
			for (let i = 0; i < arguments.length; i++) {
				output.push(arguments[i]);
			}
		}
	}

	function writeln(args) {
		if ( indent > 0 ) {
			output.push(sIndent.slice(0,indent));
		}
		if ( arguments.length ) {
			for (let i = 0; i < arguments.length; i++) {
				output.push(arguments[i]);
			}
		}
		output.push("\n");
	}

	function rootTag(name) {
		tags = [];
		unclosedStartTag = false;
		tag(name);
	}

	function closeRootTag(name) {
		closeTag(name);
	}

	function namespace(alias, namespace) {
		attrib(alias, namespace);
	}

	function tag(name, value, omitEmpty) {

		if ( omitEmpty && !value ) {
			return;
		}
		if ( unclosedStartTag ) {
			unclosedStartTag = false;
			write('>\n');
		}
		if ( arguments.length === 1 ) { // opening tag
			if ( indent > 0 ) {
				output.push(sIndent.slice(0,indent));
			}
			write("<", name);
			unclosedStartTag = true;
			if ( legacyContent ) {
				unclosedStartTag = false;
				write(">\n");
			}
			tags.push(name);
			indent++;
			return;
		}
		if ( value == null ) {
			writeln("<", name, "/>");
		} else {
			writeln("<", name, ">", encode(String(value)), "</", name, ">");
		}
	}

	function attrib(name, value, defaultValue) {
		const emptyTag = arguments.length === 1;
		if ( omitDefaults && arguments.length === 3 && value === defaultValue ) {
			return;
		}

		if ( !legacyContent ) {
			write(" " + name + "=\"");
			write(emptyTag ? "true" : encode(String(value)).replace(/"/g, "&quot;"));
			write("\"");
		} else if ( emptyTag ) {
			writeln("<", name, "/>");
		} else {
			writeln("<", name, ">", encode(String(value)), "</", name, ">");
		}
	}

	function closeTag(name, noIndent) {

		indent--;
		const top = tags.pop();
		if ( top != name ) {
			// ERROR?
		}

		if ( unclosedStartTag ) {
			unclosedStartTag = false;
			write("/>\n");
		} else if ( noIndent ) {
			write("</", name, ">\n");
		} else {
			writeln("</", name, ">");
		}
	}

	function textContent(text) {
		if ( unclosedStartTag ) {
			unclosedStartTag = false;
			write('>');
		}
		write(encode(text));
	}

	function tagWithSince(tagName, prop) {
		if ( prop ) {
			tag(tagName);
			if ( prop.since ) {
				attrib("since", prop.since);
			}
			if ( prop.text && prop.text.trim() ) {
				textContent(prop.text);
			}
			closeTag(tagName, true);
		}
	}

	function isEnum(name) {
		const symbol = getAPIJSON(name);
		return !!symbol && symbol.kind === "enum";
	}

	const replacement = {
		"\t": "\\t",
		"\n": "\\n",
		"\r": "\\r",
		"\"": "\\\"",
		"\\": "\\\\"
	};

	/**
	 * Converts the given value into its JavaScript source code format.
	 *
	 * Strings will be enclosed in double quotes with special chars being escaped,
	 * all other values will be used 'literally'.
	 * @param {any} value Value to convert
	 * @param {string} type Data type of the value (used to detect enum values)
	 * @returns {string} The source code reprsentation of the value
	 */
	function toRaw(value, type) {
		if ( typeof value === "string" && !isEnum(type) ) {
			return "\"" + value.replace(/[\u0000-\u001f"\\]/g,
				(c) => replacement[c] || "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")) + "\"";
		}
		return value;
	}

	function getAsString() {
		return output.join("");
	}

	function writeMetadata(symbolAPI, inherited) {

		const ui5Metadata = symbolAPI["ui5-metadata"];
		if ( !ui5Metadata ) {
			return;
		}

		if ( addRedundancy && symbolAPI["extends"] ) {
			const baseSymbolAPI = getAPIJSON(symbolAPI["extends"]);
			if ( baseSymbolAPI ) {
				writeMetadata(baseSymbolAPI, true);
			}
		}

		if ( ui5Metadata.specialSettings ) {
			ui5Metadata.specialSettings.forEach((special) => {
				tag("specialSetting");
				attrib("name", special.name);
				attrib("type", special.type);
				attrib("visibility", special.visibility, 'public');
				if ( special.since ) {
					attrib("since", special.since);
				}
				if ( inherited ) {
					attrib("origin", symbolAPI.name);
				}
				tag("description", special.description, true);
				tagWithSince("experimental", special.experimental);
				tagWithSince("deprecated", special.deprecated);
				tag("methods", special.methods);
				closeTag("specialSetting");
			});
		}

		if ( ui5Metadata.properties ) {
			ui5Metadata.properties.forEach((prop) => {
				tag("property");
				attrib("name", prop.name);
				attrib("type", prop.type, 'string');
				if ( prop.defaultValue !== null ) {
					attrib("defaultValue", toRaw(prop.defaultValue, prop.type));
				}
				attrib("visibility", prop.visibility, 'public');
				if ( prop.since ) {
					attrib("since", prop.since);
				}
				if ( prop.bindable ) {
					attrib("bindable", prop.bindable);
				}
				if ( inherited ) {
					attrib("origin", symbolAPI.name);
				}
				tag("description", prop.description, true);
				tagWithSince("experimental", prop.experimental);
				tagWithSince("deprecated", prop.deprecated);
				tag("methods", prop.methods);
				closeTag("property");
			});
		}

		if ( ui5Metadata.defaultProperty ) {
			tag("defaultProperty", ui5Metadata.defaultProperty);
		}

		if ( ui5Metadata.aggregations ) {
			ui5Metadata.aggregations.forEach((aggr) => {
				tag("aggregation");
				attrib("name", aggr.name);
				attrib("singularName", aggr.singularName); // TODO omit default?
				attrib("type", aggr.type, 'sap.ui.core.Control');
				if ( aggr.altTypes ) {
					attrib("altTypes", aggr.altTypes.join(","));
				}
				attrib("cardinality", aggr.cardinality, '0..n');
				attrib("visibility", aggr.visibility, 'public');
				if ( aggr.since ) {
					attrib("since", aggr.since);
				}
				if ( aggr.bindable ) {
					attrib("bindable", aggr.bindable);
				}
				if ( inherited ) {
					attrib("origin", symbolAPI.name);
				}
				tag("description", aggr.description, true);
				tagWithSince("experimental", aggr.experimental);
				tagWithSince("deprecated", aggr.deprecated);
				tag("methods", aggr.methods);
				closeTag("aggregation");
			});
		}

		if ( ui5Metadata.defaultAggregation ) {
			tag("defaultAggregation", ui5Metadata.defaultAggregation);
		}

		if ( ui5Metadata.associations ) {
			ui5Metadata.associations.forEach((assoc) => {
				tag("association");
				attrib("name", assoc.name);
				attrib("singularName", assoc.singularName); // TODO omit default?
				attrib("type", assoc.type, 'sap.ui.core.Control');
				attrib("cardinality", assoc.cardinality, '0..1');
				attrib("visibility", assoc.visibility, 'public');
				if ( assoc.since ) {
					attrib("since", assoc.since);
				}
				if ( inherited ) {
					attrib("origin", symbolAPI.name);
				}
				tag("description", assoc.description, true);
				tagWithSince("experimental", assoc.experimental);
				tagWithSince("deprecated", assoc.deprecated);
				tag("methods", assoc.methods);
				closeTag("association");
			});
		}

		if ( ui5Metadata.events ) {
			ui5Metadata.events.forEach((event) => {
				tag("event");
				attrib("name", event.name);
				attrib("visibility", event.visibility, 'public');
				if ( event.since ) {
					attrib("since", event.since);
				}
				if ( inherited ) {
					attrib("origin", symbolAPI.name);
				}
				tag("description", event.description, true);
				tagWithSince("experimental", event.experimental);
				tagWithSince("deprecated", event.deprecated);
				if ( event.parameters ) {
					tag("parameters");
					for ( let pn in event.parameters ) {
						if ( event.parameters.hasOwnProperty(pn) ) {
							const param = event.parameters[pn];

							tag("parameter");
							attrib("name", param.name);
							attrib("type", param.type);
							if ( param.since ) {
								attrib("since", param.since);
							}
							tag("description", param.description, true);
							tagWithSince("experimental", param.experimental);
							tagWithSince("deprecated", param.deprecated);
							closeTag("parameter");
						}
					}
					closeTag("parameters");
				}
				tag("methods", event.methods, true);
				closeTag("event");
			});
		}

		if ( ui5Metadata.annotations ) {
			ui5Metadata.annotations.forEach((anno) => {
				tag("annotation");
				attrib("name", anno.name);
				attrib("namespace", anno.namespace); // TODO omit default?
				attrib("target", anno.target);
				attrib("annotation", anno.annotation);
				attrib("appliesTo", anno.appliesTo);
				if ( anno.since ) {
					attrib("since", anno.since);
				}
				tag("description", anno.description, true);
				tagWithSince("deprecated", anno.deprecated);
				closeTag("annotation");
			});
		}

	}

	function writeParameterPropertiesForMSettings(symbolAPI, inherited) {

		const ui5Metadata = symbolAPI["ui5-metadata"];
		if ( !ui5Metadata ) {
			return;
		}

		if ( symbolAPI["extends"] ) {
			const baseSymbolAPI = getAPIJSON(symbolAPI["extends"]);
			writeParameterPropertiesForMSettings(baseSymbolAPI, true);
		}

		if ( ui5Metadata.specialSettings ) {
			ui5Metadata.specialSettings.forEach((special) => {
				if ( special.visibility !== 'hidden' ) {
					tag("property");
					attrib("name", special.name);
					attrib("type", special.type);
					attrib("optional");
					if ( inherited ) {
						attrib("origin", symbolAPI.name);
					}
					tag("description", special.description, true);
					closeTag("property");
				}
			});
		}

		if ( ui5Metadata.properties ) {
			ui5Metadata.properties.forEach((prop) => {
				tag("property");
				attrib("name", prop.name);
				attrib("type", prop.type);
				attrib("group", prop.group, 'Misc');
				if ( prop.defaultValue !== null ) {
					attrib("defaultValue", toRaw(prop.defaultValue, prop.type));
				}
				attrib("optional");
				if ( inherited ) {
					attrib("origin", symbolAPI.name);
				}
				tag("description", prop.description, true);
				closeTag("property");
			});
		}

		if ( ui5Metadata.aggregations ) {
			ui5Metadata.aggregations.forEach((aggr) => {
				if ( aggr.visibility !== "hidden" ) {
					tag("property");
					attrib("name", aggr.name);
					attrib("type", aggr.type + (aggr.cardinality === '0..1' ? "" : "[]"));
					if ( aggr.altTypes ) {
						attrib("altTypes", aggr.altTypes.join(","));
					}
					attrib("optional");
					if ( inherited ) {
						attrib("origin", symbolAPI.name);
					}
					tag("description", aggr.description, true);
					closeTag("property");
				}
			});
		}

		if ( ui5Metadata.associations ) {
			ui5Metadata.associations.forEach((assoc) => {
				if ( assoc.visibility !== "hidden" ) {
					tag("property");
					attrib("name", assoc.name);
					attrib("type", "(" + assoc.type + "|" + "string)" + (assoc.cardinality === '0..1' ? "" : "[]"));
					attrib("optional");
					if ( inherited ) {
						attrib("origin", symbolAPI.name);
					}
					tag("description", assoc.description, true);
					closeTag("property");
				}
			});
		}

		if ( ui5Metadata.events ) {
			ui5Metadata.events.forEach((event) => {
				tag("property");
				attrib("name", event.name);
				attrib("type", "function|array");
				attrib("optional");
				if ( inherited ) {
					attrib("origin", symbolAPI.name);
				}
				tag("description", event.description, true);
				closeTag("property");
			});
		}

	}

	function writeParameterProperties(param, paramName) {
		const props = param.parameterProperties,
			prefix = paramName + '.';
		let count = 0;

		if ( props ) {
			for (let n in props ) {
				if ( props.hasOwnProperty(n) ) {

					param = props[n];

					if ( !legacyContent && count === 0 ) {
						tag("parameterProperties");
					}

					count++;

					tag(PROPERTY);
					attrib("name", legacyContent ? prefix + n : n);
					attrib("type", param.type);
					if ( param.since ) {
						attrib("since", param.since);
					}
					if ( param.optional ) {
						attrib("optional", param.optional);
					}

					if ( !legacyContent ) {
						writeParameterProperties(param, prefix + n);
					}

					tag("description", param.description, true);
					tagWithSince("experimental", param.experimental);
					tagWithSince("deprecated", param.deprecated);

					closeTag(PROPERTY);

					if ( legacyContent ) {
						writeParameterProperties(param, prefix + n);
					}
				}
			}
		}

		if ( !legacyContent && count > 0 ) {
			closeTag("parameterProperties");
		}
	}

	/*
	let rSplitSecTag = /^\s*\{([^\}]*)\}/;

	function secTags($) {
		if ( !legacyContent ) {
			return;
		}
		const aTags = $.tags;
		if ( !aTags ) {
			return;
		}
		for (let iTag = 0; iTag < A_SECURITY_TAGS.length; iTag++  ) {
			const oTagDef = A_SECURITY_TAGS[iTag];
			for (let j = 0; j < aTags.length; j++ ) {
				if ( aTags[j].title.toLowerCase() === oTagDef.name.toLowerCase() ) {
					tag(oTagDef.name);
					const m = rSplitSecTag.exec(aTags[j].text);
					if ( m && m[1].trim() ) {
						const aParams = m[1].trim().split(/\s*\|\s* /); <-- remove the blank!
						for (let iParam = 0; iParam < aParams.length; iParam++ ) {
							tag(oTagDef.params[iParam], aParams[iParam]);
						}
					}
					const sDesc = aTags[j].description;
					tag("description", sDesc, true);
					closeTag(oTagDef.name);
				}
			}
		}
	}
	*/

	function writeSymbol(symbol) {

		if ( isFirstClassSymbol(symbol) && (roots || !symbol.synthetic) ) { // dump a symbol if it as a class symbol and if either hierarchies are dumped or if it is not a synthetic symbol

			// for the hierarchy we use only the local information
			const symbolAPI = createAPIJSON4Symbol(symbol);

			const kind = symbolAPI.kind === 'enum' ? ENUM : symbolAPI.kind;

			tag(kind);

			attrib("name", symbolAPI.name);
			attrib("basename", symbolAPI.basename);
//			if ( symbolAPI["resource"] ) {
//				attrib("resource");
//			}
			if ( symbolAPI["module"] ) {
				attrib("module", symbolAPI["module"]);
			}
			if ( symbolAPI["abstract"] ) {
				attrib("abstract");
			}
			if ( symbolAPI["final"] ) {
				attrib("final");
			}
			if ( symbolAPI["static"] ) {
				attrib("static");
			}
			attrib("visibility", symbolAPI.visibility, 'public');
			if ( symbolAPI.since ) {
				attrib("since", symbolAPI.since);
			}
			if ( symbolAPI["extends"] ) {
				tag(BASETYPE, symbolAPI["extends"]); // TODO what about multiple inheritance?
			}
			tag("description", symbolAPI.description, true);
			tagWithSince("experimental", symbolAPI.experimental);
			tagWithSince("deprecated", symbolAPI.deprecated);

			if ( kind === 'class' ) {

				const hasSettings = symbolAPI["ui5-metadata"];

				if ( !legacyContent && symbolAPI["ui5-metadata"] ) {

					tag("ui5-metadata");

					if ( symbolAPI["ui5-metadata"].stereotype ) {
						attrib("stereotype", symbolAPI["ui5-metadata"].stereotype);
					}

					writeMetadata(symbolAPI);

					closeTag("ui5-metadata");

				}

				tag("constructor");
				if ( legacyContent ) {
					attrib("name", symbolAPI.basename);
				}
				attrib("visibility", symbolAPI.visibility, 'public');
				if ( symbolAPI.constructor.parameters ) {
					symbolAPI.constructor.parameters.forEach((param, j) => {

						tag("parameter");
						attrib("name", param.name);
						attrib("type", param.type);
						attrib("optional", param.optional, false);
						if ( param.defaultValue !== undefined ) {
							attrib("defaultValue", param.defaultValue);
						}
						if ( param.since ) {
							attrib("since", param.since);
						}

						if ( !legacyContent ) {
							if ( hasSettings && j == 1 && /setting/i.test(param.name) && /object/i.test(param.type) ) {
								if ( addRedundancy ) {
									tag("parameterProperties");
									writeParameterPropertiesForMSettings(symbolAPI);
									closeTag("parameterProperties");
								}
							} else {
								writeParameterProperties(param, param.name);
							}
						}
						tag("description", param.description, true);
						tagWithSince("experimental", param.experimental);
						tagWithSince("deprecated", param.deprecated);
						closeTag("parameter");
						if ( legacyContent ) {
							writeParameterProperties(param, param.name);
						}
					});
				}

				tag("description", getConstructorDescription(symbol), true);
				// tagWithSince("experimental", symbol.experimental); // TODO repeat from class?
				// tagWithSince("deprecated", symbol.deprecated); // TODO repeat from class?
				// secTags(symbol); // TODO repeat from class?
				closeTag("constructor");
			}

			/* TODO MIGRATE or remove, if not needed
			const ownSubspaces = ( symbol.__ui5.children || [] ).filter(($) => $.kind === 'namespace').sort(sortByAlias);
			for (let i = 0; i < ownSubspaces.length; i++) {
				const member = ownSubspaces[i];
				tag("namespace");
				tag("name", member.name);
				closeTag("namespace");
			}
			*/

			if ( symbolAPI.properties ) {
				symbolAPI.properties.forEach((member) => {
					tag("property");
					attrib("name", member.name);
					if ( member.module ) {
						attrib("module", member.module);
					}
					attrib("visibility", member.visibility, 'public');
					if ( member["static"] ) {
						attrib("static");
					}
					if ( member.since ) {
						attrib("since", member.since);
					}
					attrib("type", member.type);
					tag("description", member.description, true);
					tagWithSince("experimental", member.experimental);
					tagWithSince("deprecated", member.deprecated);
					closeTag("property");
				});
			}

			if ( symbolAPI.events ) {
				symbolAPI.events.forEach((member) => {
					tag("event");
					attrib("name", member.name);
					if ( member.module ) {
						attrib("module", member.module);
					}
					attrib("visibility", member.visibility, 'public');
					if ( member["static"] ) {
						attrib("static");
					}
					if ( member.since ) {
						attrib("since", member.since);
					}

					if ( member.parameters ) {
						member.parameters.forEach((param) => {

							tag("parameter");
							attrib("name", param.name);
							attrib("type", param.type);
							if ( param.since ) {
								attrib("since", param.since);
							}
							if ( !legacyContent ) {
								writeParameterProperties(param, param.name);
							}
							tag("description", param.description, true);
							tagWithSince("experimental", param.experimental);
							tagWithSince("deprecated", param.deprecated);
							closeTag("parameter");
							if ( legacyContent ) {
								writeParameterProperties(param, param.name);
							}
						});
					}
					tag("description", member.description, true);
					tagWithSince("experimental", member.experimental);
					tagWithSince("deprecated", member.deprecated);
					// TODO secTags(member);
					closeTag("event");
				});
			}

			if ( symbolAPI.methods ) {
				symbolAPI.methods.forEach((member) => {

					tag("method");
					attrib("name", member.name);
					if ( member.module ) {
						attrib("module", member.module);
					}
					attrib("visibility", member.visibility, 'public');
					if ( member["static"] ) {
						attrib("static");
					}
					if ( member.returnValue && member.returnValue.type  ) {
						let returnType = member.returnValue.type;
						if ( returnType === 'this' ) {
							returnType = symbolAPI.name;
						}
						attrib("type", returnType, 'void');
					}
					if ( member.since ) {
						attrib("since", member.since);
					}

					if ( member.parameters ) {
						member.parameters.forEach((param) => {

							tag("parameter");
							attrib("name", param.name);
							attrib("type", param.type);
							if ( param.optional ) {
								attrib("optional", param.optional);
							}
							if ( param.defaultValue !== undefined ) {
								attrib("defaultValue", param.defaultValue);
							}
							if ( param.since ) {
								attrib("since", param.since);
							}
							if ( !legacyContent ) {
								writeParameterProperties(param, param.name);
							}
							tag("description", param.description, true);
							tagWithSince("experimental", param.experimental);
							tagWithSince("deprecated", param.deprecated);
							closeTag("parameter");
							if ( legacyContent ) {
								writeParameterProperties(param, param.name);
							}
						});
					}
					tag("description", member.description, true);
					tagWithSince("experimental", member.experimental);
					tagWithSince("deprecated", member.deprecated);
					// TODO secTags(member);
					closeTag("method");

				});
			}

			if ( roots && symbol.__ui5.children && symbol.__ui5.children.length ) {
				tag("children");
				symbol.__ui5.children.forEach(writeSymbol);
				closeTag("children");
			}

			closeTag(kind);

		}

	}

	writeln("<?xml version=\"1.0\" ?>");
	rootTag("api");
	if ( !legacyContent ) {
		namespace("xmlns", "http://www.sap.com/sap.ui.library.api.xsd");
		attrib("_version", "1.0.0");
		if ( templateConf.version ) {
			attrib("version", templateConf.version.replace(/-SNAPSHOT$/,""));
		}
		if ( templateConf.uilib ) {
			attrib("library", templateConf.uilib);
		}
	}

	if ( roots ) {
		roots.forEach(writeSymbol);
	} else {
		// sort only a copy(!) of the symbols, otherwise the SymbolSet lookup is broken
		symbols.slice(0).sort(sortByAlias).forEach(writeSymbol);
	}

	closeRootTag("api");

	fs.mkPath(path.dirname(filename));
	fs.writeFileSync(filename, getAsString(), 'utf8');
}

// Description + Settings

function getConstructorDescription(symbol) {
	let description = symbol.description;
	const tags = symbol.tags;
	if ( tags ) {
		for (let i = 0; i < tags.length; i++) {
			if ( tags[i].title === "ui5-settings" && tags[i].text) {
				description += "\n</p><p>\n" + tags[i].text;
				break;
			}
		}
	}
	return description;
}


// Example

function makeExample(example) {
	const result = {
		caption: null,
		example: example
	};
	const match = /^\s*<caption>([\s\S]+?)<\/caption>(?:[ \t]*[\n\r]*)([\s\S]+)$/i.exec(example);

	if ( match ) {
		result.caption = match[1];
		result.example = match[2];
	}

	return result;
}

/* ---- exports ---- */

exports.publish = publish;
