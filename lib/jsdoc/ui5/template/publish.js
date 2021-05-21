/*
 * JSDoc3 template for UI5 documentation generation.
 *
 * (c) Copyright 2009-2021 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

/* global env: true */
/* eslint-env es6,node */
/* eslint strict: [2, "global"] */

"use strict";

/* imports */
const template = require('jsdoc/template');
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

const	rSecurityTags = new RegExp(A_SECURITY_TAGS.map(function($) {return $.name.toLowerCase(); }).join('|'), "i");
	//debug(A_SECURITY_TAGS.map(function($) {return $.name; }).join('|'));

const templatesConf = (env.conf.templates || {}),
	templateConf = templatesConf[MY_TEMPLATE_NAME] || templatesConf[MY_ALT_TEMPLATE_NAME] || {},
	pluginConf = templateConf;

let conf = {};

let view;

let __db;
let __longnames;
let __missingLongnames = {};

/**
 * Maps the symbol 'longname's to the unique filename that contains the documentation of that symbol.
 * This map is maintained to deal with names that only differ in case (e.g. the namespace sap.ui.model.type and the class sap.ui.model.Type).
 */
let __uniqueFilenames = {};

/* shortcut for Object.prototype.hasOwnProperty.call(obj, prop) */
const hasOwn = Function.prototype.call.bind(Object.prototype.hasOwnProperty);

function merge(target, source) {
	if ( source != null ) {
		// simple single source merge
		Object.keys(source).forEach((prop) => {
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

function lookup(longname /*, variant*/) {
	let key = longname; // variant ? longname + "|" + variant : longname;
	if ( !Object.prototype.hasOwnProperty.call(__longnames, key) ) {
		__missingLongnames[key] = (__missingLongnames[key] || 0) + 1;
		let oResult = __db({longname: longname /*, variant: variant ? variant : {isUndefined: true}*/});
		__longnames[key] = oResult.first();
	}
	return __longnames[key];
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
	return /^(namespace|interface|class|typedef)$/.test($.kind) || ($.kind === 'member' && $.isEnum )/* isNonEmptyNamespace($) */;
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
	return /^(namespace|interface|class|typedef)$/.test($.kind) || ($.kind === 'member' && $.isEnum || isModuleExport($) )/* isNonEmptyNamespace($) */;
}


// ---- Version class -----------------------------------------------------------------------------------------------------------------------------------------------------------

const Version = (function() {

	const rVersion = /^[0-9]+(?:\.([0-9]+)(?:\.([0-9]+))?)?(.*)$/;

	function norm(v) {
		v = parseInt(v);
		return isNaN(v) ? 0 : v;
	}

	function compare(v1, v2) {
		if ( v1 !== v2 ) {
			return v1 < v2 ? -1 : 1;
		}
		return 0;
	}

	/**
	 * Creates a Version object from the given version string.
	 *
	 * @param {string} versionStr A dot-separated version string
	 *
	 * @classdesc Represents a version consisting of major, minor, patch version and suffix,
	 * e.g. '1.2.7-SNAPSHOT'. All parts after the major version are optional.
	 * @class
	 */
	class Version {

		constructor(versionStr) {
			const match = rVersion.exec(versionStr) || [];

			Object.defineProperty(this, "major", {
				enumerable: true,
				value: norm(match[0])
			});
			Object.defineProperty(this, "minor", {
				enumerable: true,
				value: norm(match[1])
			});
			Object.defineProperty(this, "patch", {
				enumerable: true,
				value: norm(match[2])
			});
			Object.defineProperty(this, "suffix", {
				enumerable: true,
				value: String(match[3] || "")
			});
		}

		toMajorMinor() {
			return new Version(this.major + "." + this.minor);
		}

		toString() {
			return this.major + "." + this.minor + "." + this.patch + this.suffix;
		}

		compareTo(other) {
			return (
				this.major - other.major
				|| this.minor - other.minor
				|| this.patch - other.patch
				|| compare(this.suffix, other.suffix)
			);
		}

	}

	return Version;

}());

// ---- Link class --------------------------------------------------------------------------------------------------------------------------------------------------------------

//TODO move to separate module

const Link = (function() {

	const missingTypes = {};

	function _makeLink(href, target, tooltip, text) {
		return '<a' +
			(tooltip ? ' title="' + tooltip + '"' : '') +
			' href="' + href + '"' +
			(target ? ' target="' + target + '"' : '') +
			'>' + text + '</a>';
	}

	class Link {

		toSymbol(longname) {
			if ( longname != null ) {
				longname = String(longname);
				if ( /#constructor$/.test(longname) ) {
					if ( !this.innerName ) {
						this.innerName = 'constructor';
					}
					longname = longname.slice(0, -"#constructor".length);
				}
				this.longname = longname;
			}
			return this;
		}

		withText(text) {
			this.text = text;
			return this;
		}

		withTooltip(text) {
			this.tooltip = text;
			return this;
		}

		toFile(file) {
			if ( file != null ) {
				this.file = file;
			}
			return this;
		}

		toString() {
			let longname = this.longname;

			if (longname) {

				if ( /^(?:(?:ftp|https?):\/\/|\.\.?\/)/.test(longname) ) {
					// handle real hyperlinks (TODO should be handled with a different "to" method
					return _makeLink(longname, this.targetName, this.tooltip, this.text || longname);
				} else if ( /^topic:/.test(longname) ) {
					// handle documentation links
					longname = conf.topicUrlPattern.replace("{{topic}}", longname.slice("topic:".length));
					return _makeLink(longname, this.targetName, this.tooltip, this.text || longname);
				} else {
					return this._makeSymbolLink(longname);
				}

			} else if (this.file) {
				return _makeLink(Link.base + this.file, this.targetName, null, this.text || this.file);
			}

			return undefined;
		}

		_makeSymbolLink(longname) {

			// normalize .prototype. and #
			longname = longname.replace(/\.prototype\./g, '#');

			// if it is an internal reference, then don't validate against symbols, just create a link
			if ( longname.charAt(0) == "#" ) {

				return _makeLink(longname + (this.innerName ? "#" + this.innerName : ""), this.targetName, this.tooltip, this.text || longname.slice(1));

			}

			let linkTo = lookup(longname);
			// if there is no symbol by that name just return the name unaltered
			if ( !linkTo ) {

				missingTypes[longname] = true;

				return this.text || longname;

			}

			// it's a full symbol reference (potentially to another file)
			let mainSymbol, anchor;
			if ( (linkTo.kind === 'member' && !linkTo.isEnum) || linkTo.kind === 'constant' || linkTo.kind === 'function' || linkTo.kind === 'event' ) { // it's a method or property

				mainSymbol = linkTo.memberof;
				anchor = ( linkTo.kind === 'event' ? "event:" : "") + Link.symbolNameToLinkName(linkTo);

			} else {

				mainSymbol = linkTo.longname;
				anchor = this.innerName;

			}

			return _makeLink(Link.baseSymbols + __uniqueFilenames[mainSymbol] + conf.ext + (anchor ? "#" + anchor : ""), this.targetName, this.tooltip, this.text || longname);
		}

	}

	Link.getMissingTypes = function() {
		return Object.keys(missingTypes);
	};

	Link.symbolNameToLinkName = function(symbol) {
		let linker = "";
		if ( symbol.scope === 'static' ) {
			linker = ".";
		} else if (symbol.isInner) {
			linker = "-"; // TODO-migrate?
		}
		return linker + symbol.name;
	};

	return Link;

}());



// ---- publish() - main entry point for JSDoc templates -------------------------------------------------------------------------------------------------------

/* Called automatically by JsDoc Toolkit. */
function publish(symbolSet) {

	info("entering sapui5 template");

	// create output dir
	fs.mkPath(env.opts.destination);

//	if ( symbolSet().count() < 20000 ) {
//		const rawSymbolsFile = path.join(env.opts.destination, "symbols-unpruned-ui5.json");
//		info(`writing raw symbols to ${rawSymbolsFile}`);
//		fs.writeFileSync(rawSymbolsFile, JSON.stringify(symbolSet().get(), filter, "\t"), 'utf8');
//	}

	info(`before prune: ${symbolSet().count()} symbols.`);
	symbolSet = helper.prune(symbolSet);
	info(`after prune: ${symbolSet().count()} symbols.`);

	__db = symbolSet;
	__longnames = {};
	__db().each(function($) {
		__longnames[$.longname] = $;
	});

	if ( templateConf.apiJsonFolder ) {
		info(`loading external apis from folder '${templateConf.apiJsonFolder}'`);
		loadExternalSymbols(templateConf.apiJsonFolder);
	}

	const templatePath = path.join(env.opts.template, 'tmpl/');
	info(`using templates from '${templatePath}'`);
	view = new template.Template(templatePath);

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

	// now resolve relationships
	const aRootNamespaces = createNamespaceTree();
	const hierarchyRoots = createInheritanceTree();
	collectMembers();
	mergeEventDocumentation();

	if ( symbolSet().count() < 20000 ) {
		const rawSymbolsFile = path.join(env.opts.destination, "symbols-pruned-ui5.json");
		info(`writing raw symbols to ${rawSymbolsFile}`);
		fs.writeFileSync(rawSymbolsFile, JSON.stringify(symbolSet().get(), filter, "\t"), 'utf8');
	}

	// used to allow Link to check the details of things being linked to
	Link.symbolSet = symbolSet;

	// get an array version of the symbol set, useful for filtering
	const symbols = symbolSet().get();

	// -----

	const PUBLISHING_VARIANTS = {

		"apixml" : {
			defaults : {
				apiXmlFile: path.join(env.opts.destination, "jsapi.xml")
			},
			processor : function(conf) {
				createAPIXML(symbols, conf.apiXmlFile, {
					legacyContent: true
				});
			}
		},

		"apijson" : {
			defaults : {
				apiJsonFile: path.join(env.opts.destination, "api.json")
			},
			processor : function(conf) {
				createAPIJSON(symbols, conf.apiJsonFile);
			}
		},

		"fullapixml" : {
			defaults : {
				fullXmlFile: path.join(env.opts.destination, "fulljsapi.xml")
			},
			processor : function(conf) {
				createAPIXML(symbols, conf.fullXmlFile, {
					roots: aRootNamespaces,
					omitDefaults : conf.omitDefaultsInFullXml,
					resolveInheritance: true
				});
			}
		},

		"apijs" : {
			defaults: {
				jsapiFile: path.join(env.opts.destination, "api.js")
			},
			processor: function(conf) {
				createAPIJS(symbols, conf.jsapiFile);
			}
		},

		"full" : {
			defaults : {
				outdir: path.join(env.opts.destination, "full/"),
				contentOnly: false,
				hierarchyIndex: true
			},
			processor: function() {
				publishClasses(symbolSet, aRootNamespaces, hierarchyRoots);
			}
		},

		"public" : {
			defaults: {
				outdir: path.join(env.opts.destination, "public/"),
				filter: function($) { return $.access === 'public' || $.access === 'protected' || $.access == null; },
				contentOnly: false,
				hierarchyIndex: true
			},
			processor: function(conf) {
				publishClasses(symbolSet, aRootNamespaces, hierarchyRoots);
			}
		},

		"demokit" : {
			defaults: {
				outdir: path.join(env.opts.destination, "demokit/"),
				filter: function($) { return $.access === 'public' || $.access === 'protected' || $.access == null; },
				contentOnly: true,
				modulePages: true,
				hierarchyIndex: false,
				securityIndex: true,
				sinceIndex: true,
				deprecationIndex: true,
				experimentalIndex: true,
				suppressAuthor: true,
				suppressVersion: true
			},
			processor: function(conf) {
				publishClasses(symbolSet, aRootNamespaces, hierarchyRoots);
			}
		},

		"demokit-internal" : {
			defaults: {
				outdir: path.join(env.opts.destination, "demokit-internal/"),
				// filter: function($) { return $.access === 'public' || $.access === 'protected' || $.access === 'restricted' || $.access == null; },
				contentOnly: true,
				modulePages: true,
				hierarchyIndex: false,
				securityIndex: true,
				sinceIndex: true,
				deprecationIndex: true,
				experimentalIndex: true,
				suppressAuthor: true,
				suppressVersion: true
			},
			processor: function(conf) {
				publishClasses(symbolSet, aRootNamespaces, hierarchyRoots);
			}
		}

	};

	const now = new Date();

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
					filter: function($) { return true; },
					templatesDir: "/templates/sapui5/",
					symbolsDir: "symbols/",
					modulesDir: "modules/",
					topicUrlPattern: "../../guide/{{topic}}.html",
					srcDir: "symbols/src/",
					creationDate : now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDay() + " " + now.getHours() + ":" + now.getMinutes(),
					outdir: env.opts.destination
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

	let builtinSymbols = templateConf.builtinSymbols;
	if ( builtinSymbols ) {
		Link.getMissingTypes().filter(($) => builtinSymbols.indexOf($) < 0).sort().forEach(($) => {
			// TODO instead of filtering topic: and fiori: links out here, they should be correctly linked in the template
			if ( !/\{@link (?:topic:|fiori:)/.test($) ) {
				warning(`unresolved reference: ${$}`);
			}
		});
	}
	info("publishing done.");

}

//---- namespace tree --------------------------------------------------------------------------------

/*
 * Completes the tree of namespaces. Namespaces for which content is available
 * but which have not been documented are created as dummy without documentation.
 */
function createNamespaceTree() {

	info(`create namespace tree (${__db().count()} symbols)`);

	const aRootNamespaces = [];
	const aTypes = __db(function() { return isFirstClassSymbol(this); }).get();

	for (let i = 0; i < aTypes.length; i++) { // loop with a for-loop as it can handle concurrent modifications

		const symbol = aTypes[i];
		if ( symbol.memberof ) {

			let parent = lookup(symbol.memberof);
			if ( !parent ) {
				warning(`create missing namespace '${symbol.memberof}' (referenced by ${symbol.longname})`);
				parent = makeNamespace(symbol.memberof);
				__longnames[symbol.memberof] = parent;
				__db.insert(parent);
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

	const comment = [
		"@name " + memberof,
		"@namespace",
		"@synthetic",
		"@public"
	];

	const symbol = new doclet.Doclet("/**\n * " + comment.join("\n * ") + "\n */", {});
	symbol.__ui5 = {};

	return symbol;
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
 */
function createInheritanceTree() {

	function makeDoclet(longname, lines) {
		lines.push("@name " + longname);
		const newDoclet = new doclet.Doclet("/**\n * " + lines.join("\n * ") + "\n */", {});
		newDoclet.__ui5 = {};
		__longnames[longname] = newDoclet;
		__db.insert(newDoclet);
		return newDoclet;
	}

	info(`create inheritance tree (${__db().count()} symbols)`);

	const oTypes = __db(function() { return supportsInheritance(this); });
	const aRootTypes = [];

	let oObject = lookup("Object");
	if ( !oObject ) {
		oObject = makeDoclet("Object", [
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
			oClass = makeDoclet(sClass, [
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
	oTypes.each((oClass) => {

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
					oInterface = makeDoclet(oClass.implements[j], [
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
	oTypes.each((oStartClass) => {
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

function collectMembers() {
	__db().each(function($) {
		if ( $.memberof ) {
			const parent = lookup($.memberof);
			if ( parent /* && supportsInheritance(parent) */ ) {
				parent.__ui5.members = parent.__ui5.members || [];
				parent.__ui5.members.push($);
			}
		}
	});
}

function mergeEventDocumentation() {

	debug("merging JSDoc event documentation into UI5 metadata");

	const oTypes = __db(function() { return isaClass(this); });

	oTypes.each((symbol) => {

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

function publishClasses(symbols, aRootNamespaces, hierarchyRoots) {

	// create output dir
	fs.mkPath(path.join(conf.outdir, conf.symbolsDir));

	// get a list of all the first class symbols in the symbolset
	const firstClassSymbols = symbols(function() {
		return supportsInheritance(this) && conf.filter(this);
	}).order("longname");

	// create unique file names
	__uniqueFilenames = {};
	let filenames = {};
	firstClassSymbols.get().sort(sortByAlias).forEach(function(symbol) {
		const filename = escape(symbol.longname.replace(/^module:/, "")).replace(/\//g, "%25");
		if ( filenames.hasOwnProperty(filename.toUpperCase()) && (filenames[filename.toUpperCase()].longname !== symbol.longname) ) {
			// find an unused filename by appending "-n" where n is an integer > 0
			let j = 1;
			while (filenames.hasOwnProperty(filename.toUpperCase() + "-" + j)) {
				j++;
			}
			warning(`duplicate symbol names ${filenames[filename.toUpperCase()].longname} and ${symbol.longname}, renaming the latter to ${filename + "-" + j}`);
			filename = filename + "-" + j;
		}
		filenames[filename.toUpperCase()] = symbol;
		__uniqueFilenames[symbol.longname] = filename;
	});
	filenames = null;

	// create a class index, displayed in the left-hand column of every class page
	let classTemplate;
	if ( !conf.contentOnly ) {
		info("create embedded class index");
		Link.base = "../";
		Link.baseSymbols = "";
		classTemplate = 'classWithIndex.html.tmpl';
		publish.header = processTemplate("_header.tmpl", firstClassSymbols);
		publish.footer = processTemplate("_footer.tmpl", firstClassSymbols);
		publish.classesIndex = processTemplate("_navIndex.tmpl", firstClassSymbols); // kept in memory
	} else {
		let newStyle = !!pluginConf.newStyle;
		classTemplate = newStyle ? "class-new.html.tmpl" : "class.html.tmpl";
		publish.header = '';
		publish.footer = '';
		publish.classesIndex = '';

		// instead create an index as XML
		Link.base = "";
		Link.baseSymbols = conf.symbolsDir;
		processTemplateAndSave("index.xml.tmpl", aRootNamespaces, "index.xml");
	}

	// create each of the class pages
	info("create class/namespace pages");
	Link.base = "../";
	Link.baseSymbols = "";
	firstClassSymbols.each(function(symbol) {
		let sOutName = path.join(conf.symbolsDir, __uniqueFilenames[symbol.longname]) + conf.ext;
		processTemplateAndSave(classTemplate, symbol, sOutName);
	});

	if ( conf.modulePages ) {
		info("create module pages");
		Link.base = "../";
		Link.baseSymbols = "../" + conf.symbolsDir;
		fs.mkPath(path.join(conf.outdir, conf.modulesDir));
		groupByModule(firstClassSymbols.get()).forEach(function(module) {
			let sOutName = path.join(conf.modulesDir, module.name.replace(/\//g, '_')) + conf.ext;
			processTemplateAndSave("module.html.tmpl", module, sOutName);
		});
	}

	// regenerate the index with a different link base, used in the overview pages
	info("create global class/namespace index");
	Link.base = "";
	Link.baseSymbols = conf.symbolsDir;
	publish.header = processTemplate("_header.tmpl", firstClassSymbols);
	publish.footer = processTemplate("_footer.tmpl", firstClassSymbols);
	publish.classesIndex = processTemplate("_navIndex.tmpl", firstClassSymbols);

	// create the all classes index
	processTemplateAndSave("index.html.tmpl", firstClassSymbols, "index" + conf.ext);

	// create the class hierarchy page
	if ( conf.hierarchyIndex ) {
		info("create class hierarchy index");
		Link.base = "";
		Link.baseSymbols = conf.symbolsDir;
		processTemplateAndSave("hierarchy.html.tmpl", hierarchyRoots.filter(conf.filter), "hierarchy" + conf.ext);
	}

	if ( conf.sinceIndex ) {
		info("create API by version index");
		Link.base = "";
		Link.baseSymbols = conf.symbolsDir;
		let sinceSymbols = symbols(function() {
			let r = !!this.since && !this.inherited && conf.filter(this);
			if ( r && this.memberof ) {
				let parent = lookup(this.memberof);
				// filter out symbol when parent is filtered out
				if ( !parent || !conf.filter(parent) ) {
					debug(`since index: filtering out ${this.longname}, member of ${this.memberof}`);
					r = false;
				}
				if ( parent && parent.since === this.since ) {
					// r = false;
				}
			}
			return r;
		}).order("longname");
		processTemplateAndSave("since.html.tmpl", sinceSymbols, "since" + conf.ext);
	}

	if ( conf.deprecationIndex ) {
		info("create deprecated API index");
		Link.base = "";
		Link.baseSymbols = conf.symbolsDir;
		let deprecatedSymbols = symbols(function() {
			return !!this.deprecated && !this.inherited && conf.filter(this);
		}).order("longname");
		processTemplateAndSave("deprecation.html.tmpl", deprecatedSymbols, "deprecation" + conf.ext);
	}

	if ( conf.experimentalIndex ) {
		info("create experimental API index");
		Link.base = "";
		Link.baseSymbols = conf.symbolsDir;
		let experimentalSymbols = symbols(function() {
			return !!this.experimental && !this.inherited && conf.filter(this);
		}).order("longname");
		processTemplateAndSave("experimental.html.tmpl", experimentalSymbols, "experimental" + conf.ext);
	}

	if ( conf.securityIndex ) {
		info("create Security Relevant API index");

		let securityRelevantSymbols = {};
		A_SECURITY_TAGS.forEach(function(oTagDef) {
			securityRelevantSymbols[oTagDef.name.toLowerCase()] = { tag : oTagDef, symbols: [] };
		});
		symbols().each(function($) {
			let tags = $.tags;
			if ( !$.inherited  && conf.filter($) && tags ) {
				for (let i = 0; i < tags.length; i++) {
					if ( rSecurityTags.test(tags[i].title) ) {
						securityRelevantSymbols[tags[i].title.toLowerCase()].symbols.push({ symbol: $, tag : tags[i]});
					}
				}
			}
		});

		Link.base = "";
		Link.baseSymbols = conf.symbolsDir;
		processTemplateAndSave("security.html.tmpl", securityRelevantSymbols, "security" + conf.ext);
	}

	firstClassSymbols = null;

	// copy needed mimes
	info("copy mimes");
	// copy the template's static files to outdir
	let templatePath = env.opts.template;
	let fromDir = path.join(templatePath, 'static');
	let staticFiles = fs.ls(fromDir, 3);
	staticFiles.forEach(function(fileName) {
		let toDir = fs.toDir( fileName.replace(fromDir, conf.outdir) );
		fs.mkPath(toDir);
		fs.copyFileSync(fileName, toDir);
	});

	__uniqueFilenames = null;

	info("publishing done.");
}

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

/*
function isNonEmptyNamespace($) {
	return $.isNamespace && (
			($.properties && $.properties.length > 0) ||
			($.methods && $.methods.length > 0) ||
			($.augments && $.augments.length > 0) ||
			($.children && $.children.length > 0));
};*/

/* Just the first sentence (up to a full stop). Should not break on dotted variable names. */
function summarize(desc) {
	if ( desc != null ) {
		desc = String(desc).replace(/\s+/g, ' ').
					replace(/"'/g, '&quot;').
					replace(/^(<\/?p>|<br\/?>|\s)+/, '');

		const match = /([\w\W]+?\.)[^a-z0-9_$]/i.exec(desc);
		return match ? match[1] : desc;
	}
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

/** Pull in the contents of an external file at the given path. */

function processTemplateAndSave(sTemplateName, oData, sOutputName) {
	let sResult = processTemplate(sTemplateName, oData);
	if ( conf.normalizeWhitespace && /\.html$/.test(sOutputName) ) {
		sResult = normalizeWhitespace(sResult);
	}
	const sOutpath = path.join(conf.outdir, sOutputName);
	try {
		fs.mkPath( path.dirname(sOutpath) );
		fs.writeFileSync(sOutpath, sResult, 'utf8');
	} catch (e) {
		error(`failed to write generated file '${sOutpath}': ${e.message || e}`);
	}
}

function processTemplate(sTemplateName, data) {
	debug(`processing template '${sTemplateName}' for ${data.longname}`);

	let result;

	try {
		result = view.render(sTemplateName, {
			asPlainSummary: asPlainSummary,
			bySimpleName: bySimpleName,
			childrenOfKind: childrenOfKind,
			conf: conf,
			data: data,
			getConstructorDescription : getConstructorDescription,
			getNSClass: getNSClass,
			groupByVersion: groupByVersion,
			extractSince: extractSince,
			include: processTemplate,
			Link: Link,
			listTypes: listTypes,
			linkTypes: linkTypes,
			makeExample: makeExample,
			makeLinkList: makeLinkList,
			makeLinkToSymbolFile: makeLinkToSymbolFile,
			makeSignature: makeSignature,
			makeSortby: makeSortby,
			publish : publish,
			formatText: formatText,
			simpleNameOf: simpleNameOf,
			sortByAlias: sortByAlias,
			summarize: summarize,
			Version : Version
		});
	} catch (e) {
		if ( e.source ) {
			const filename = path.join(env.opts.destination, sTemplateName + ".js");
			error(`failed to process template, source written to ${filename}`);
			fs.mkPath(path.dirname(filename));
			fs.writeFileSync(filename, e.source, 'utf8');
		}
		error(`error while processing ${sTemplateName}`);
		throw e;
	}
	debug("processing template done.");
	return result;
}

function groupByVersion(symbols, extractVersion) {

	const map = {};

	symbols.forEach((symbol) => {

		const version = extractVersion(symbol),
			key = String(version);

		if ( !map[key] ) {
			map[key] = {
				version,
				symbols : []
			};
		}
		map[key].symbols.push(symbol);

	});

	const groups = Object.values(map);

	return groups.sort((a,b) => {
		if ( !a.version && b.version ) {
			return -1;
		} else if ( a.version && !b.version ) {
			return 1;
		} else if ( a.version && b.version ) {
			return -a.version.compareTo(b.version);
		}
		return 0;
	});
}

function groupByModule(symbols) {

	const map = {};

	function add(key, symbol) {
		if ( !map[key] ) {
			map[key] = {
				name: key,
				symbols : []
			};
		}
		if ( map[key].symbols.indexOf(symbol) < 0 ) {
			map[key].symbols.push(symbol);
		}
	}

	symbols.forEach((symbol) => {

		const key = symbol.__ui5.module;

		if ( key ) {
			add(key, symbol);
			if ( symbol.__ui5.members ) {
				symbol.__ui5.members.forEach(function($) {
					if ( !$.inherited && $.__ui5.module && $.__ui5.module !== key && conf.filter($) ) {
						add($.__ui5.module, $);
					}
				});
			}
		}

	});

	return Object.values(map);
}


const REGEXP_TAG = /<(\/?(?:[A-Z][A-Z0-9_-]*:)?[A-Z][A-Z0-9_-]*)(?:\s[^>]*)?>/gi;

/**
 * Removes unnecessary whitespace from an HTML document:
 *  - if the text between two adjacent HTML tags consists of whitespace only, the whole text is removed
 *  - otherwise, any sequence of whitespace in the text is reduced to a single blank
 *  - inside a <pre> tag, whitespace is preserved
 *
 * Whitespace inside an element tag is not touched (although it could be normalized as well)
 * @param {string} content raw HTML file
 * @returns {string} HTML file with normalized whitespace
 */
function normalizeWhitespace(content) {
	let compressed = '',
		preformatted = 0,
		p = 0, m;

	REGEXP_TAG.lastIndex = 0;
	while ( (m = REGEXP_TAG.exec(content)) ) {
		if ( m.index > p ) {
			let text = content.slice(p, m.index);
			if ( preformatted ) {
				compressed += text;
				// debug(`  '${text}' (preformatted)`);
			} else {
				text = text.replace(/\s+/g,' ');
				if ( text.trim() ) {
					compressed += text;
				}
				// debug(`  '${text}' (trimmed)`);
			}
		}

		compressed += m[0];
		// debug(`  '${m[0]}' (tag)`);
		p = m.index + m[0].length;

		if ( /^pre$/i.test(m[1]) ) {
			preformatted++;
		} else if ( /^\/pre$/i.test(m[1]) && preformatted ) {
			preformatted--;
		}

	}

	if ( content.length > p ) {
		let text = content.slice(p, content.length);
		if ( preformatted ) {
			compressed += text;
			// debug(`  '${text}' (preformatted)`);
		} else {
			text = text.replace(/\s+/g,' ');
			if ( text.trim() ) {
				compressed += text;
			}
			// debug(`  '${text}' (trimmed)`);
		}
	}

	return compressed;
}

function makeLinkToSymbolFile(longname) {
	return Link.baseSymbols + __uniqueFilenames[longname] + conf.ext;
}

function simpleNameOf(longname) {
	longname = String(longname);
	const p = longname.lastIndexOf('.');
	return p < 0 ? longname : longname.slice(p + 1);
}

function bySimpleName(a,b) {
	if ( a === b ) {
		return 0;
	}
	const simpleA = simpleNameOf(a);
	const simpleB = simpleNameOf(b);
	if ( simpleA === simpleB ) {
		return a < b ? -1 : 1;
	} else {
		return simpleA < simpleB ? -1 : 1;
	}
}

/* Build output for displaying function parameters. */
function makeSignature(params) {
	const r = ['('];
	if ( params ) {
		for (let i = 0, p; (p = params[i]); i++) {
			// ignore @param tags for 'virtual' params that are used to document members of config-like params
			// (e.g. like "@param param1.key ...")
			if (p.name && p.name.indexOf('.') == -1) {
				if (i > 0) {
					r.push(', ');
				}

				r.push('<span');

				const types = listTypes(p.type, true);
				const desc = asPlainSummary(p.description);
				if ( desc || types ) {
					r.push(' title="');
					if (types) {
						r.push('(');
						r.push(types);
						r.push(') ');
					}
					r.push(desc);
					r.push('"');
				}

				r.push('>');
				r.push(p.name);
				r.push('</span>');
				if ( p.optional ) {
					r.push('<i class="help" title="Optional parameter">?</i>');
				}
			}
		}
	}
	r.push(')');
	return r.join('');
}


/*
 * regexp to recognize important places in the text
 *
 * Capturing groups of the RegExp:
 *   group 1: begin of a pre block
 *   group 2: end of a pre block
 *   group 3: begin of a header/ul/ol/table, implicitly ends a paragraph
 *   group 4: end of a header/ul/ol/table, implicitly starts a new paragraph
 *   group 5: target portion of an inline @link tag
 *   group 6: (optional) text portion of an inline link tag
 *   group 7: an empty line which implicitly starts a new paragraph
 *
 *                   [------- <pre> block -------] [----------------------- some flow content -----------------------] [---- an inline {@link ...} tag ----] [---------- an empty line ---------]  */
const rFormatText = /(<pre(?:\s[^>]*)?>)|(<\/pre>)|(<(?:h[\d+]|ul|ol|table)(?:\s[^>]*)?>)|(<\/(?:h[\d+]|ul|ol|table)>)|\{@link\s+([^}\s]+)(?:\s+([^\}]*))?\}|((?:\r\n|\r|\n)[ \t]*(?:\r\n|\r|\n))/gi;

function formatText(text) {

	if ( !text ) {
		return '';
	}

	let inpre = false,
		paragraphs = 0;

	text = String(text).replace(rFormatText, function(match, pre, endpre, flow, endflow, linkTarget, linkText, emptyline) {
		if ( pre ) {
			inpre = true;
			return pre.replace(/<pre>/gi, "<pre class=\"prettyprint\">").replace(/<pre\s+lang="([^"]+)"\s*>/gi, "<pre class=\"prettyprint lang-$1\">");
		} else if ( endpre ) {
			inpre = false;
		} else if ( flow ) {
			if ( !inpre ) {
				paragraphs++;
				return '</p>' + match;
			}
		} else if ( endflow ) {
			if ( !inpre ) {
				paragraphs++;
				return match + '<p>';
			}
		} else if ( emptyline ) {
			if ( !inpre ) {
				paragraphs++;
				return '</p><p>';
			}
		} else if ( linkTarget ) {
			if ( !inpre ) {
				// convert to a hyperlink
				let link = new Link().toSymbol(linkTarget);
				// if link tag contained a replacement text, use it
				if ( linkText && linkText.trim()) {
					link = link.withText(linkText.trim());
				}
				return link.toString();
			}
		}
		return match;
	});

	if ( paragraphs > 0 ) {
		text = '<p>' + text + '</p>';
	}

	// remove empty paragraphs
	text = text.replace(/<p>\s*<\/p>/g, '');

	return text;
}


function childrenOfKind(data, kind) {
	let oResult = {
		own: [],
		borrowed: []
	};
	//debug(`calculating kind ${kind} from ${data.longname}`);
	//console.log(data);
	let fnFilter;
	switch (kind) {
	case 'property':
		fnFilter = function($) {
			return $.kind === 'constant' || ($.kind === 'member' && !$.isEnum);
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
			if ( fnFilter($) && conf.filter($) ) {
				oResult[$.inherited ? 'borrowed' : 'own'].push($);
			}
		});
	}
	oResult.own.sort(makeSortby("!deprecated","static","name"));
	oResult.borrowed = groupByContributors(data, oResult.borrowed);

	return oResult;
}

/**
 * Determines the set of contributors of the given borrowed members.
 * The contributors are sorted according to the inheritance hierarchy:
 * first the base class of symbol, then the base class of the base class etc.
 * Any contributors that can not be found in the hierarchy are appended
 * to the set.
 *
 * @param {Symbol} symbol of which these are the members
 * @param {array} aBorrowedMembers set of borrowed members to determine the contributors for
 * @return {array} sorted array of contributors
 */
function groupByContributors(symbol, aBorrowedMembers) {

	let MAX_ORDER = 1000, // a sufficiently large number
		mContributors = {},
		aSortedContributors = [];

	aBorrowedMembers.forEach(function(borrowed) {
		let $ = lookup(borrowed.inherits);
		if ($) {
			if (mContributors[$.memberof] == null) {
				mContributors[$.memberof] = { order : MAX_ORDER, items : [$] };
			} else {
				mContributors[$.memberof].items.push($);
			}
		} else {
			future(`symbol '${borrowed.longname}' has 'inherited' flag set, but inherits missing symbol '${borrowed.inherits}' (skipped)`);
		}
	});

	// order contributors according to their distance in the inheritance hierarchy
	let order = 0;
	(function handleAugments(oSymbol) {
		if ( oSymbol.augments ) {
			const aParentsToVisit = [];
			// first assign an order
			for (let i = 0; i < oSymbol.augments.length; i++) {
				if ( mContributors[oSymbol.augments[i]] != null && mContributors[oSymbol.augments[i]].order === MAX_ORDER ) {
					mContributors[oSymbol.augments[i]].order = ++order;
					aParentsToVisit.push(oSymbol.augments[i]);
				}
			}
			// only then dive into parents (breadth first search)
			for (let i = 0; i < aParentsToVisit.length; i++) {
				const oTarget = lookup(aParentsToVisit);
				if ( oTarget ) {
					handleAugments(oTarget);
				}
			}
		}
	}(symbol));

	// convert to an array and sort by order
	for (let i in mContributors) {
		aSortedContributors.push(mContributors[i]);
	}
	aSortedContributors.sort((a,b) => a.order - b.order);

	return aSortedContributors;

}

function makeLinkList(aSymbols) {
	return aSymbols
		.sort(makeSortby("name"))
		.map(($) => new Link().toSymbol($.longname).withText($.name))
		.join(", ");
}

// ---- type parsing ---------------------------------------------------------------------------------------------

class ASTBuilder {
	literal(str) {
		return {
			type: 'literal',
			value: str
		};
	}
	simpleType(type) {
		return {
			type: 'simpleType',
			name: type
		};
	}
	array(componentType) {
		return {
			type: 'array',
			component: componentType
		};
	}
	object(keyType, valueType) {
		return {
			type: 'object',
			key: keyType,
			value: valueType
		};
	}
	set(elementType) {
		return {
			type: 'set',
			element: elementType
		};
	}
	promise(fulfillmentType) {
		return {
			type: 'promise',
			fulfill: fulfillmentType
		};
	}
	"function"(paramTypes, returnType, thisType, constructorType) {
		return {
			type: 'function',
			params: paramTypes,
			"return": returnType,
			"this": thisType,
			constructor: constructorType
		};
	}
	structure(structure) {
		return {
			type: 'structure',
			fields: structure
		};
	}
	union(types) {
		return {
			type: 'union',
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
	}
	repeatable(type) {
		type.repeatable = true;
		return type;
	}
	typeApplication(type, templateTypes) {
		return {
			type: 'typeApplication',
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
			if ( structure[fieldName].synthetic ) {
				r.push(fieldName);
			} else {
				r.push(fieldName + ":" + this.safe(structure[fieldName]));
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

	/* TODO
	 * - function(this:) // type of this
	 * - function(new:) // constructor
	 */
	const rLexer = /\s*(Array\.?<|Object\.?<|Set\.?<|Promise\.?<|function\(|\{|:|\(|\||\}|\.?<|>|\)|,|\[\]|\*|\?|!|=|\.\.\.)|\s*(false|true|(?:\+|-)?(?:\d+(?:\.\d+)?|NaN|Infinity)|'[^']*'|"[^"]*"|null|undefined)|\s*((?:module:)?\w+(?:[\/.#~]\w+)*)|./g;

	let input,
		builder,
		token,
		tokenStr;

	function next(expected) {
		if ( expected !== undefined && token !== expected ) {
			throw new SyntaxError(`TypeParser: expected '${expected}', but found '${tokenStr}' (pos: ${rLexer.lastIndex}, input='${input}')`);
		}
		const match = rLexer.exec(input);
		if ( match ) {
			tokenStr = match[1] || match[2] || match[3];
			token = match[1] || (match[2] && 'literal') || (match[3] && 'symbol');
			if ( !token ) {
				throw new SyntaxError(`TypeParser: unexpected '${tokenStr}' (pos: ${match.index}, input='${input}')`);
			}
		} else {
			tokenStr = token = null;
		}
	}

	function parseType() {
		let nullable = false;
		let mandatory = false;
		if ( token === '?' ) {
			next();
			nullable = true;
		} else if ( token === '!' ) {
			next();
			mandatory = true;
		}

		let type;

		if ( token === 'literal' ) {
			type = builder.literal(tokenStr);
			next();
		} else if ( token === 'Array.<' || token === 'Array<' ) {
			next();
			const componentType = parseType();
			next('>');
			type = builder.array(componentType);
		} else if ( token === 'Object.<' || token === 'Object<' ) {
			next();
			let keyType;
			let valueType = parseType();
			if ( token === ',' ) {
				next();
				keyType = valueType;
				valueType = parseType();
			} else {
				keyType = builder.synthetic(builder.simpleType('string'));
			}
			next('>');
			type = builder.object(keyType, valueType);
		} else if ( token === 'Set.<' || token === 'Set<' ) {
			next();
			const elementType = parseType();
			next('>');
			type = builder.set(elementType);
		} else if ( token === 'Promise.<' || token === 'Promise<' ) {
			next();
			const resultType = parseType();
			next('>');
			type = builder.promise(resultType);
		} else if ( token === 'function(' ) {
			next();
			let thisType, constructorType, paramTypes = [], returnType;
			if ( tokenStr === 'this' ) {
				next();
				next(':');
				thisType = parseType();
				if ( token === ',' ) {
					next();
				}
			} else if ( tokenStr === 'new' ) {
				next();
				next(':');
				constructorType = parseType();
				if ( token === ',' ) {
					next();
				}
			}
			while ( token === 'symbol' || token === '...' ) {
				const repeatable = token === '...';
				if ( repeatable) {
					next();
				}
				let paramType = parseType();
				if ( repeatable ) {
					paramType = builder.repeatable(paramType);
				}
				const optional = token === '=';
				if ( optional ) {
					builder.optional(paramType);
					next();
				}
				paramTypes.push(paramType);
				if ( token === ',' ) {
					if ( repeatable ) {
						throw new SyntaxError(`TypeParser: only the last parameter of a function can be repeatable (pos: ${rLexer.lastIndex}, input='${input}')`);
					}
					next();
				}
			}
			next(')');
			if ( token === ':' ) {
				next(':');
				returnType = parseType();
			}
			type = builder.function(paramTypes, returnType, thisType, constructorType);
		} else if ( token === '{' ) {
			const structure = Object.create(null);
			next();
			do {
				const propName = tokenStr;
				if ( !/^\w+$/.test(propName) ) {
					throw new SyntaxError(`TypeParser: structure field must have a simple name (pos: ${rLexer.lastIndex}, input='${input}', field:'${propName}')`);
				}
				next('symbol');
				let propType;
				if ( token === ':' ) {
					next();
					propType = parseType();
				} else {
					propType = builder.synthetic(builder.simpleType('any'));
				}
				structure[propName] = propType;
				if ( token === '}' ) {
					break;
				}
				next(',');
			} while (token);
			next('}');
			type = builder.structure(structure);
		} else if ( token === '(' ) {
			next();
			type = parseTypes();
			next(')');
		} else if ( token === '*' ) {
			next();
			type = builder.simpleType('*');
		} else {
			type = builder.simpleType(tokenStr);
			next('symbol');
			// check for suffix operators: either 'type application' (generics) or 'array', but not both of them
			if ( token === "<" || token === ".<" ) {
				next();
				const templateTypes = [];
				while ( token !== ">" ) {
					const templateType = parseType();
					templateTypes.push(templateType);
					if ( token === ',' ) {
						next();
					}
				}
				next(">");
				type = builder.typeApplication(type, templateTypes);
			} else {
				while ( token === '[]' ) {
					next();
					type = builder.array(type);
				}
			}
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
			if ( token !== '|' ) {
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

class TypeLinkBuilder extends TypeStringBuilder {
	constructor(style, encoded) {
		super();
		this.linkStyle = style;
		this.lt = encoded ? "&lt;" : "<";
		this.gt = encoded ? "&gt;" : ">";
	}
	simpleType(type) {
		if ( this.linkStyle === 'text' ) {
			return super.simpleType(type);
		}
		const link = new Link().toSymbol(type);
		if ( this.linkStyle === 'short' ) {
			link.withText(simpleNameOf(type)).withTooltip(type);
		}
		return {
			str: link.toString()
		};
	}
}

const typeParser = new TypeParser();
const _TEXT_BUILDER = new TypeStringBuilder();
const _TEXT_BUILDER_ENCODED = new TypeLinkBuilder('text', true);
const _SHORT_BUILDER = new TypeLinkBuilder('short', true);
const _LONG_BUILDER = new TypeLinkBuilder('long', true);

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

function listTypes(type, encoded) {
	return _processTypeString(type, encoded ? _TEXT_BUILDER_ENCODED : _TEXT_BUILDER);
}

function linkTypes(type, short) {
	return _processTypeString(type, short ? _SHORT_BUILDER : _LONG_BUILDER );
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

/**
 * Reduces the given text to a summary and removes all tags links etc. and escapes double quotes.
 * The result therefore should be suitable as content for an HTML tag attribute (e.g. title).
 *
 * @param {string} sText Text to extract a summary from
 * @returns {string} summarized, plain attribute
 */
function asPlainSummary(sText) {
	return sText ? summarize(sText).replace(/<.*?>/g, '').replace(/\{\@link\s*(.*?)\}/g, '$1').replace(/"/g,"&quot;") : '';
}

function getNSClass(item) {
	if (item.kind === 'interface') {
		return " interface";
	} else if (item.kind === 'namespace') {
		return " namespace";
	} else if (item.kind === 'typedef' ) {
		return " typedef";
	} else if (item.kind === 'member' && item.isEnum ) {
		return " enum";
	} else {
		return "";
	}
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
				attrib("defaultValue", defaultValue, null, /* raw = */true);
				attrib("group", prop.group, 'Misc');
				attrib("visibility", prop.visibility, 'public');
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
		if ( member.__ui5.module && member.__ui5.module !== symbol.__ui5.module ) {
			attrib("module", member.__ui5.module);
			attrib("export", member.__ui5.globalOnly ? GLOBAL_ONLY : member.__ui5.export, '', true);
		}
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
		if ( member.__ui5.resource && member.__ui5.resource !== symbol.__ui5.resource ) {
			attrib("resource", member.__ui5.resource);
		}
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

	const kind = (symbol.kind === 'member' && symbol.isEnum) ? "enum" : symbol.kind; // handle pseudo-kind 'enum'

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
		const ownProperties = childrenOfKind(symbol, "property").own.sort(sortByAlias);
		if ( ownProperties.length > 0 ) {
			collection("properties");
			for ( let i = 0; i < ownProperties.length; i++ ) {
				const member = ownProperties[i];
				tag("property");
				attrib("name", member.name);
				if ( member.__ui5.module && member.__ui5.module !== symbol.__ui5.module ) {
					attrib("module", member.__ui5.module);
					attrib("export", member.__ui5.globalOnly ? GLOBAL_ONLY : member.__ui5.export, '', true);
				}
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
				if ( member.__ui5.resource && member.__ui5.resource !== symbol.__ui5.resource ) {
					attrib("resource", member.__ui5.resource);
				}
				closeTag("property");
			}
			endCollection("properties");
		}

		const ownEvents = childrenOfKind(symbol, 'event').own.sort(sortByAlias);
		if ( ownEvents.length > 0 ) {
			collection("events");
			for (let i = 0; i < ownEvents.length; i++ ) {
				const member = ownEvents[i];
				tag("event");
				attrib("name", member.name);
				if ( member.__ui5.module && member.__ui5.module !== symbol.__ui5.module ) {
					attrib("module", member.__ui5.module);
					attrib("export", member.__ui5.globalOnly ? GLOBAL_ONLY : member.__ui5.export, '', true);
				}
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
				if ( member.__ui5.resource && member.__ui5.resource !== symbol.__ui5.resource ) {
					attrib("resource", member.__ui5.resource);
				}
				closeTag("event");
			}
			endCollection("events");
		}

		const ownMethods = childrenOfKind(symbol, 'method').own.sort(sortByAlias);
		// xmlmacro stereotype does not allow methods
		if ( symbol.__ui5.stereotype !== 'xmlmacro' && ownMethods.length > 0 ) {
			collection("methods");
			ownMethods.forEach(function(member) {
				writeMethod(member, undefined, symbol.kind === 'interface');
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
	Blob:true,
	Document:true,
	Element:true,
	Event:true,
	File:true,
	HTMLElement: true,
	Node:true,
	Storage:true,
	Touch:true,
	TouchList:true,
	Window: true

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
		if ( Object.prototype.hasOwnProperty.call(symbol, "constructor") ) {
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
				if ( hasOwn(erroneousTypes, type.toLowerCase()) ) {
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

//---- add on: API JS -----------------------------------------------------------------

function createAPIJS(symbols, filename) {

	const REGEXP_ARRAY_TYPE = /^Array\.<(.*)>$/;

	const rkeywords = /^(?:abstract|as|boolean|break|byte|case|catch|char|class|continue|const|debugger|default|delete|do|double|else|enum|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|is|long|namespace|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|use|var|void|volatile|while|with)$/;

	const output = [];

	function isNoKeyword($) { return !rkeywords.test($.name); }

	function isAPI($) { return $.access === 'public' || $.access === 'protected' || !$.access; }

	function writeln(args) {
		if ( arguments.length ) {
			for (let i = 0; i < arguments.length; i++) {
				output.push(arguments[i]);
			}
		}
		output.push("\n");
	}

	function unwrap(docletSrc) {
		if (!docletSrc) {
			return '';
		}

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

	function comment($, sMetaType) {

		let s = unwrap($.comment.toString());

		// remove the @desc tag
		s = s.replace(/(\r\n|\r|\n)/gm, "\n");
		s = s.replace(/^\s*@desc\s*/gm, "");
		s = s.replace(/^\s*@alias[^\r\n]*(\r\n|\r|\n)?/gm, "");
		s = s.replace(/^\s*@name[^\r\n]*(\r\n|\r|\n)?/gm, "");
		s = s.replace(/^\s*@function[^\r\n]*(\r\n|\r|\n)?/gm, "");
		s = s.replace(/^\s*@author[^\r\n]*(\r\n|\r|\n)?/gm, "");
		s = s.replace(/^\s*@synthetic[^\r\n]*(\r\n|\r|\n)?/gm, "");
		s = s.replace(/^\s*<\/p><p>\s*(\r\n|\r|\n)?/gm, "\n");
		// skip empty documentation
		if ( !s ) {
			return;
		}

		// for namespaces, enforce the @.memberof tag
		if ( sMetaType === "namespace" && $.memberof && s.indexOf("@memberof") < 0 ) {
			s = s + "\n@memberof " + $.memberof;
		}

		writeln("/**\n * " + s.replace(/\n/g, "\n * ") + "\n */");

		/*
		writeln("/**");
		writeln(s.split(/\r\n|\r|\n/g).map(function($) { return " * " + $;}).join("\r\n"));
		writeln(" * /");
		*/

	}

	function signature($) {
		const p = $.params, r = [];
		if ( p ) {
			for (let i = 0; i < p.length; i++) {
				// ignore @param tags for 'virtual' params that are used to document members of config-like params
				// (e.g. like "@param param1.key ...")
				if (p[i].name && p[i].name.indexOf('.') < 0) {
					r.push(p[i].name);
				}
			}
		}
		return r.join(',');
	}

	function qname(member,parent) {
		let r = member.memberof;
		if ( member.scope !== 'static' ) {
			r += ".prototype";
		}
		return (r ? r + "." : "") + member.name;
	}

	const mValues = {
		"boolean"  : "false",
		"int"      : "0",
		"float"    : "0.0",
		"number"   : "0.0",
		"string"   : "\"\"",
		"object"   : "new Object()",
		"function" : "function() {}"
	};

	function valueForType(type) {
		if ( type && type.names && type.names[0] ) {
			type = type.names[0];
			if ( REGEXP_ARRAY_TYPE.test(type) || type.indexOf("[]") > 0 ) {
				return "new Array()";
			} else if ( mValues[type] ) {
				return mValues[type];
			} else if ( type.indexOf(".") > 0 ) {
				return "new " + type + "()";
			} else {
				// return "/* unsupported type: " +  member.type + " */ null";
				return "null";
			}
		}
	}

	function value(member) {
		return valueForType(member.type);
	}

	function retvalue(member) {
		//debug(member);
		const r = valueForType(member.type || (member.returns && member.returns.length && member.returns[0] && member.returns[0].type && member.returns[0].type));
		if ( r ) {
			return "return " + r + ";";
		}
		return "";
	}

	const sortedSymbols = symbols.slice().filter(($) => isaClass($) && isAPI($) && !$.synthetic).sort(sortByAlias); // sort only a copy(!) of the symbols, otherwise the SymbolSet lookup is broken
	sortedSymbols.forEach((symbol) => {

		const sMetaType = (symbol.kind === 'member' && symbol.isEnum) ? 'enum' : symbol.kind;
		if ( sMetaType ) {

			writeln("");
			writeln("// ---- " + symbol.longname + " --------------------------------------------------------------------------");
			writeln("");

			const ownProperties = childrenOfKind(symbol, 'property').own.filter(isNoKeyword).sort(sortByAlias);
			if ( sMetaType === "class" ) {
				comment(symbol, sMetaType);
				writeln(symbol.longname + " = function(" + signature(symbol) + ") {};");
				for ( let memberId in ownProperties ) {
					const member = ownProperties[memberId];
					comment(member, sMetaType);
					writeln(qname(member, symbol) + " = " + value(member));
					writeln("");
				}
			} else if ( sMetaType === 'namespace' || sMetaType === 'enum' ) {
			//debug(`found namespace ${symbol.longname}`);
			//debug(ownProperties);
				if ( ownProperties.length ) {
					writeln("// dummy function to make Eclipse aware of namespace");
					writeln(symbol.longname + ".toString = function() { return \"\"; };");
				}
			}

			const ownEvents = childrenOfKind(symbol, 'event').own.filter(isNoKeyword).sort(sortByAlias);
			if ( ownEvents.length ) {
				for ( let memberId in ownEvents ) {
					const member = ownEvents[memberId];
					comment(member, sMetaType);
					writeln(qname(member, symbol) + " = function(" + signature(member) + ") { " + retvalue(member) + " };");
					writeln("");
				}
			}

			const ownMethods = childrenOfKind(symbol, 'method').own.filter(isNoKeyword).sort(sortByAlias);
			if ( ownMethods.length ) {
				for (let memberId in ownMethods ) {
					const member = ownMethods[memberId];
					comment(member, sMetaType);
					writeln(qname(member, symbol) + " = function(" + signature(member) + ") { " + retvalue(member) + " };");
					writeln("");
				}
			}

		}
	});

	writeln("// ---- static fields of namespaces ---------------------------------------------------------------------");

	sortedSymbols.forEach((symbol) => {

		const sMetaType = (symbol.kind === 'member' && symbol.isEnum) ? 'enum' : symbol.kind;

		if ( sMetaType === 'namespace' || sMetaType === 'enum' ) {

			const ownProperties = childrenOfKind(symbol, 'property').own.filter(isNoKeyword).sort(sortByAlias);
			if ( ownProperties.length ) {
				writeln("");
				writeln("// ---- " + symbol.longname + " --------------------------------------------------------------------------");
				writeln("");

				for (let memberId in ownProperties ) {
					const member = ownProperties[memberId];
					comment(member, sMetaType);
					writeln(qname(member, symbol) + " = " + value(member) + ";");
					writeln("");
				}
			}
		}

	});

	fs.mkPath(path.dirname(filename));
	fs.writeFileSync(filename, output.join(""), 'utf8');
	info(`  saved as ${filename}`);
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

