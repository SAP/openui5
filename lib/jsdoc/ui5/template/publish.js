/*
 * JSDoc3 template for UI5 documentation generation.
 * 
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

/*global env: true */
/*eslint strict: [2, "global"]*/

"use strict";

/* imports */
var template = require('jsdoc/template'),
	helper = require('jsdoc/util/templateHelper'),
	fs = require('jsdoc/fs'),
	doclet = require('jsdoc/doclet'),
	path = require('jsdoc/path');

/* globals, constants */
var MY_TEMPLATE_NAME = "ui5",
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

var	rSecurityTags = new RegExp(A_SECURITY_TAGS.map(function($) {return $.name.toLowerCase(); }).join('|'), "i");
	//debug(A_SECURITY_TAGS.map(function($) {return $.name; }).join('|'));

var templateConf = (env.conf.templates || {})[MY_TEMPLATE_NAME] || {},
  pluginConf = templateConf,
	conf = {},
	view;

var __db;
var __longnames;
var __missingLongnames = {};

/**
 * Maps the symbol 'longname's to the unique filename that contains the documentation of that symbol.
 * This map is maintained to deal with names that only differ in case (e.g. the namespace sap.ui.model.type and the class sap.ui.model.Type).
 */
var __uniqueFilenames = {};

function info() {
	if ( env.opts.verbose || env.opts.debug ) {
		console.log.apply(console, arguments);
	}
}

function warning(msg) {
	var args = Array.prototype.slice.apply(arguments);
	args[0] = "**** warning: " + args[0];
	console.log.apply(console, args);
}

function error(msg) {
	var args = Array.prototype.slice.apply(arguments);
	args[0] = "**** error: " + args[0];
	console.log.apply(console, args);
}

function debug() {
	if ( env.opts.debug ) {
		console.log.apply(console, arguments);
	}
}

function merge(target) {
	for (var i = 1; i < arguments.length; i++) {
		var source = arguments[i];
		Object.keys(source).forEach(function(p) {
			var v = source[p];
			target[p] = ( v.constructor === Object ) ? merge(target[p] || {}, v) : v;
		});
	}
	return target;
}

function lookup(longname /*, variant*/) {
	var key = longname; // variant ? longname + "|" + variant : longname;
	if ( !Object.prototype.hasOwnProperty.call(__longnames, key) ) {
		__missingLongnames[key] = (__missingLongnames[key] || 0) + 1;
		var oResult = __db({longname: longname /*, variant: variant ? variant : {isUndefined: true}*/});
		__longnames[key] = oResult.first();
	}
	return __longnames[key];
}

var externalSymbols = {};

function loadExternalSymbols(apiJsonFolder) {

	var files;

	try {
		files = fs.readdirSync(templateConf.apiJsonFolder);
	} catch (e) {
		error("failed to list symbol files in folder '" + apiJsonFolder + "': " + (e.message || e));
		return;
	}

	if ( files && files.length ) {
		files.forEach(function(localFileName) {
			try {
				var file = path.join(templateConf.apiJsonFolder, localFileName);
				var sJSON = fs.readFileSync(file, 'UTF-8');
				var data = JSON.parse(sJSON);
				if ( !Array.isArray(data.symbols) ) {
					throw new TypeError("api.json does not contain a 'symbols' array");
				}
				data.symbols.forEach(function(symbol) {
					debug("  adding external symbol " + symbol.name);
					externalSymbols[symbol.name] = symbol;
				});
			} catch (e) {
				error("failed to load symbols from  " + file + ": " + (e.message || e));
			}
		});
	}
}

function isModuleExport($) {
	return $.longname.startsWith("module:") && $.longname.search(/[.#~]/) < 0;
}

function isaClass($) {
	return /^(namespace|interface|class|typedef)$/.test($.kind) || ($.kind === 'member' && $.isEnum ) /* isNonEmptyNamespace($) */;
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
	return /^(namespace|interface|class|typedef)$/.test($.kind) || ($.kind === 'member' && $.isEnum || isModuleExport($) ) /* isNonEmptyNamespace($) */;
}


var REGEXP_ARRAY_TYPE = /^Array\.<(.*)>$/;

// ---- Version class -----------------------------------------------------------------------------------------------------------------------------------------------------------

var Version = (function() {

	var rVersion = /^[0-9]+(?:\.([0-9]+)(?:\.([0-9]+))?)?(.*)$/;

	/**
	 * Returns a Version instance created from the given parameters.
	 *
	 * This function can either be called as a constructor (using <code>new</code>) or as a normal function.
	 * It always returns an immutable Version instance.
	 *
	 * The parts of the version number (major, minor, patch, suffix) can be provided in several ways:
	 * <ul>
	 * <li>Version("1.2.3-SNAPSHOT") - as a dot-separated string. Any non-numerical char or a dot followed by a non-numerical char starts the suffix portion.
	 * Any missing major, minor or patch versions will be set to 0.</li>
	 * <li>Version(1,2,3,"-SNAPSHOT") - as individual parameters. Major, minor and patch must be integer numbers or empty, suffix must be a string not starting with digits.</li>
	 * <li>Version([1,2,3,"-SNAPSHOT"]) - as an array with the individual parts. The same type restrictions apply as before.</li>
	 * <li>Version(otherVersion) - as a Version instance (cast operation). Returns the given instance instead of creating a new one.</li>
	 * </ul>
	 *
	 * To keep the code size small, this implementation mainly validates the single string variant.
	 * All other variants are only validated to some degree. It is the responsibility of the caller to
	 * provide proper parts.
	 *
	 * @param {int|string|any[]|jQuery.sap.Version} vMajor the major part of the version (int) or any of the single parameter variants explained above.
	 * @param {int} iMinor the minor part of the version number
	 * @param {int} iPatch the patch part of the version number
	 * @param {string} sSuffix the suffix part of the version number
	 * @return {jQuery.sap.Version} the version object as determined from the parameters
	 *
	 * @class Represents a version consisting of major, minor, patch version and suffix, e.g. '1.2.7-SNAPSHOT'.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.15.0
	 * @name jQuery.sap.Version
	 */
	function Version(versionStr) {

		var match = rVersion.exec(versionStr) || [];

		function norm(v) {
			v = parseInt(v,10);
			return isNaN(v) ? 0 : v;
		}

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

	Version.prototype.toMajorMinor = function() {
		return new Version(this.major + "." + this.minor);
	};

	Version.prototype.toString = function() {
		return this.major + "." + this.minor + "." + this.patch + this.suffix;
	};

	Version.prototype.compareTo = function(other) {
		return  this.major - other.major ||
				this.minor - other.minor ||
				this.patch - other.patch ||
				((this.suffix < other.suffix) ? -1 : (this.suffix === other.suffix) ? 0 : 1);
	};

	return Version;

}());

// ---- Link class --------------------------------------------------------------------------------------------------------------------------------------------------------------

//TODO move to separate module

var Link = (function() {

	var Link = function() {
	};

	Link.prototype.toSymbol = function(longname) {
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
	};

	Link.prototype.withText = function(text) {
		this.text = text;
		return this;
	};

	Link.prototype.withTooltip = function(text) {
		this.tooltip = text;
		return this;
	};

	Link.prototype.toFile = function(file) {
		if ( file != null ) this.file = file;
		return this;
	};

	function _makeLink(href, target, tooltip, text) {
		return '<a' +
			(tooltip ? ' title="' + tooltip + '"' : '') +
			' href="' + href + '"' +
			(target ? ' target="' + target + '"' : '') +
			'>' + text + '</a>';
	}

	Link.prototype.toString = function() {
		var longname = this.longname,
			linkString;

		if (longname) {

			if ( /^(?:(?:ftp|https?):\/\/|\.\.?\/)/.test(longname) ) {
				// handle real hyperlinks (TODO should be handled with a different "to" method
				linkString = _makeLink(longname, this.targetName, this.tooltip, this.text || longname);
			} else if ( /^topic:/.test(longname) ) {
				// handle documentation links
				longname = conf.topicUrlPattern.replace("{{topic}}", longname.slice("topic:".length));
				linkString = _makeLink(longname, this.targetName, this.tooltip, this.text || longname);
			} else {
				linkString = this._makeSymbolLink(longname);
			}

		} else if (this.file) {
			linkString = _makeLink(Link.base + this.file, this.targetName, null, this.text || this.file);
		}

		return linkString;
	};

	var missingTypes = {};
	Link.getMissingTypes = function() {
		return Object.keys(missingTypes);
	};
	
	Link.prototype._makeSymbolLink = function(longname) {
		
		// normalize .prototype. and #
		longname = longname.replace(/\.prototype\./g, '#');

		// if it is an internal reference, then don't validate against symbols, just create a link
		if ( longname.charAt(0) == "#" ) { 

			return _makeLink(longname + (this.innerName ? "#" + this.innerName : ""), this.targetName, this.tooltip, this.text || longname.slice(1));

		}

		var linkTo = lookup(longname);
		// if there is no symbol by that name just return the name unaltered	
		if ( !linkTo ) { 

			missingTypes[longname] = true;
			
			return this.text || longname;

		}
		
		// it's a full symbol reference (potentially to another file)
		var mainSymbol, anchor;
		if ( (linkTo.kind === 'member' && !linkTo.isEnum) || linkTo.kind === 'constant' || linkTo.kind === 'function' || linkTo.kind === 'event' ) { // it's a method or property

			mainSymbol = linkTo.memberof;
			anchor = ( linkTo.kind === 'event' ? "event:" : "") + Link.symbolNameToLinkName(linkTo);

		} else {

			mainSymbol = linkTo.longname;
			anchor = this.innerName;

		}

		return _makeLink(Link.baseSymbols + __uniqueFilenames[mainSymbol] + conf.ext + (anchor ? "#" + anchor : ""), this.targetName, this.tooltip, this.text || longname);
	}

	Link.symbolNameToLinkName = function(symbol) {
		var linker = "";
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

/** Called automatically by JsDoc Toolkit. */
function publish(symbolSet) {

	info("entering sapui5 template");

	// create output dir
	fs.mkPath(env.opts.destination);

//	if ( symbolSet().count() < 20000 ) {
//		info("writing raw symbols to " + path.join(env.opts.destination, "symbols-unpruned-ui5.json"));
//		fs.writeFileSync(path.join(env.opts.destination, "symbols-unpruned-ui5.json"), JSON.stringify(symbolSet().get(), filter, "\t"), 'utf8');
//	}
	
	info("before prune: " + symbolSet().count() + " symbols.");
	symbolSet = helper.prune(symbolSet);
	info("after prune: " + symbolSet().count() + " symbols.");

	__db = symbolSet;
	__longnames = {};
	__db().each(function($) {
		__longnames[$.longname] = $;
	});

	if ( templateConf.apiJsonFolder ) {
		info("loading external apis from folder '" + templateConf.apiJsonFolder + "'");
		loadExternalSymbols(templateConf.apiJsonFolder);
	}
	
	var templatePath = path.join(env.opts.template, 'tmpl/');
	info("using templates from '" + templatePath + "'");
	view = new template.Template(templatePath);

	function filter(key,value) {
		if ( key === 'meta' ) {
			//return;
		}
		if ( key === '__ui5' && value ) {
			var v = {
				resource: value.resource,
				module: value.module,
				stakeholders: value.stakeholders
			};
			if ( value.derived ) {
				v.derived = value.derived.map(function($) { return $.longname });
			}
			if ( value.base ) {
				v.base = value.base.longname;
			}
			if ( value.implementations ) {
				v.base = value.implementations.map(function($) { return $.longname });
			}
			if ( value.parent ) {
				v.parent = value.parent.longname;
			}
			if ( value.children ) {
				v.children = value.children.map(function($) { return $.longname });
			}
			return v;
		}
		return value;
	}

	// now resolve relationships
	var aRootNamespaces = createNamespaceTree();
	var hierarchyRoots = createInheritanceTree();
	collectMembers();
	mergeEventDocumentation();

	if ( symbolSet().count() < 20000 ) {
		info("writing raw symbols to " + path.join(env.opts.destination, "symbols-pruned-ui5.json"));
		fs.writeFileSync(path.join(env.opts.destination, "symbols-pruned-ui5.json"), JSON.stringify(symbolSet().get(), filter, "\t"), 'utf8');
	}

	// used to allow Link to check the details of things being linked to
	Link.symbolSet = symbolSet;

	// get an array version of the symbol set, useful for filtering
	var symbols = symbolSet().get();

	// -----

	var PUBLISHING_VARIANTS = {

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

	var now = new Date();

	info("start publishing");
	for (var i = 0; i < templateConf.variants.length; i++) {

		var vVariant = templateConf.variants[i];
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

			info("publishing as variant '" + vVariant.variant + "'");
			debug("final configuration:");
			debug(conf);

			PUBLISHING_VARIANTS[vVariant.variant].processor(conf);

			info("done with variant " + vVariant.variant);

		} else {

			info("cannot publish unknown variant '" + vVariant.variant + "' (ignored)");

		}
	}

	var builtinSymbols = templateConf.builtinSymbols;
	if ( builtinSymbols ) {
		Link.getMissingTypes().filter(function($) {
			return builtinSymbols.indexOf($) < 0;
		}).sort().forEach(function($) {
			error(" unresolved reference: " + $);
		});
	}
	info("publishing done.");

}

//---- namespace tree --------------------------------------------------------------------------------

/**
 * Completes the tree of namespaces. Namespaces for which content is available
 * but which have not been documented are created as dummy without documentation.
 */
function createNamespaceTree() {

	info("create namespace tree (" + __db().count() + " symbols)");

	var aRootNamespaces = [];
	var aTypes = __db(function() { return isFirstClassSymbol(this); }).get();

	for (var i = 0; i < aTypes.length; i++) { // loop with a for-loop as it can handle concurrent modifications

		var symbol = aTypes[i];
		if ( symbol.memberof ) {

			var parent = lookup(symbol.memberof);
			if ( !parent ) {
				warning("create missing namespace '" + symbol.memberof + "' (referenced by " + symbol.longname + ")");
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

	info("adding synthetic namespace symbol " + memberof);

	var comment = [
		"@name " + memberof,
		"@namespace",
		"@synthetic",
		"@public"
	];

	var symbol = new doclet.Doclet("/**\n * " + comment.join("\n * ") + "\n */", {});
	symbol.__ui5 = {};

	return symbol;
}

//---- inheritance hierarchy ----------------------------------------------------------------------------

/**
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
		var newDoclet = new doclet.Doclet("/**\n * " + lines.join("\n * ") + "\n */", {});
		newDoclet.__ui5 = {};
		__longnames[longname] = newDoclet;
		__db.insert(newDoclet);
		return newDoclet;
	}

	info("create inheritance tree (" + __db().count() + " symbols)");

	var oTypes = __db(function() { return supportsInheritance(this); });
	var aRootTypes = [];

	var oObject = lookup("Object");
	if ( !oObject ) {
		oObject = makeDoclet("Object", [
			"@class",
			"@synthetic",
			"@public"
		]);
		aRootTypes.push(oObject);
	}
	
	function getOrCreateClass(sClass, sExtendingClass) {
		var oClass = lookup(sClass);
		if ( !oClass ) {
			warning("create missing class " + sClass + " (extended by " + sExtendingClass + ")");
			var sBaseClass = 'Object';
			if ( externalSymbols[sClass] ) {
				sBaseClass = externalSymbols[sClass].extends || sBaseClass;
			}
			var oBaseClass = getOrCreateClass(sBaseClass, sClass);
			oClass = makeDoclet(sClass, [
				"@extends " + sBaseClass,
				"@class",
				"@synthetic",
				"@public"
			]);
			oClass.__ui5.base = oBaseClass;
			oBaseClass.__ui5.derived = oBaseClass.__ui5.derived || [];
			oBaseClass.__ui5.derived.push(oClass);
		}
		return oClass;
	}

	// link them according to the inheritance infos
	oTypes.each(function(oClass) {

		if ( oClass.longname === 'Object') {
			return;
		}

		var sBaseClass = "Object";
		if ( oClass.augments && oClass.augments.length > 0 ) {
			if ( oClass.augments.length > 1 ) {
				warning("multiple inheritance detected in " + oClass.longname);
			}
			sBaseClass = oClass.augments[0];
		} else {
			aRootTypes.push(oClass);
		}

		var oBaseClass = getOrCreateClass(sBaseClass, oClass.longname);
		oClass.__ui5.base = oBaseClass;
		oBaseClass.__ui5.derived = oBaseClass.__ui5.derived || [];
		oBaseClass.__ui5.derived.push(oClass);

		if ( oClass.implements ) {
			for (var j = 0; j < oClass.implements.length; j++) {
				var oInterface = lookup(oClass.implements[j]);
				if ( !oInterface ) {
					warning("create missing interface " + oClass.implements[j]);
					oInterface = makeDoclet(oClass.implements[j], [
						"@extends Object",
						"@interface",
						"@synthetic",
						"@public"
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
		var derived = oSymbol.__ui5.derived;
		if ( derived ) {
			for (var i = 0; i < derived.length; i++ ) {
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
	oTypes.each(function(oStartClass) {
		var visited = {};
		function visit(oClass) {
			if ( visited[oClass.longname] ) {
				throw new Error("cyclic inheritance detected: " + JSON.stringify(Object.keys(visited)));
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
	/*
	return __db(function() {
		return R_KINDS.test(this.kind) && this.__ui5 && this.__ui5.base == null;
	}).get();
	*/
}

function collectMembers() {
	__db().each(function($) {
		if ( $.memberof ) {
			var parent = lookup($.memberof);
			if ( parent /* && supportsInheritance(parent) */ ) {
				parent.__ui5.members = parent.__ui5.members || [];
				parent.__ui5.members.push($);
			}
		}
	});
}

function mergeEventDocumentation() {

	console.log("merging JSDoc event documentation into UI5 metadata");

	var oTypes = __db(function() { return isaClass(this); });

	oTypes.each(function(symbol) {

		var metadata = symbol.__ui5.metadata;
		var members = symbol.__ui5.members;

		if ( !metadata || !metadata.events || Object.keys(metadata.events).length <= 0 || !members ) {
			return;
		}

		// console.log('mergeing events for ' + symbol.longname);
		members.forEach(function($) {
			if ( $.kind === 'event' && !$.inherited 
				 && ($.access === 'public' || $.access === 'protected' || $.access == null) 
				 && metadata.events[$.name] 
				 && Array.isArray($.params)
				 && !$.synthetic ) {

				var event = metadata.events[$.name];
				var modified = false;
				//console.log("<<<<<<<");
				//console.log(event);
				//console.log("=======");
				//console.log($);

				$.params.forEach(function(param) {
					var m = /^\w+\.getParameters\.(.*)$/.exec(param.name);
					if ( m ) {
						var pname = m[1];
						var ui5param = event.parameters[pname] || ( event.parameters[pname] = {});
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
					console.log("  merged documentation for managed event " + symbol.longname + "#" + $.name);
				}

				//console.log("=======");
				//console.log(JSON.stringify(event, null, '\t'));
				//console.log(">>>>>>>");
			}
		});

	});

}

// ---- publishing -----------------------------------------------------------------------

function publishClasses(symbols, aRootNamespaces, hierarchyRoots) {

	// create output dir
	fs.mkPath(path.join(conf.outdir, conf.symbolsDir));

	// get a list of all the first class symbols in the symbolset
	var firstClassSymbols = symbols(function() {
		return supportsInheritance(this) && conf.filter(this);
	}).order("longname");

	// create unique file names
	__uniqueFilenames = {};
	var filenames = {};
	firstClassSymbols.get().sort(sortByAlias).forEach(function(symbol) {
		var filename = escape(symbol.longname);
		if ( filenames.hasOwnProperty(filename.toUpperCase()) && (filenames[filename.toUpperCase()].longname !== symbol.longname) ) {
			// find an unused filename by appending "-n" where n is an integer > 0
			for (var j = 1; filenames.hasOwnProperty(filename.toUpperCase() + "-" + j); j++);
			warning("duplicate symbol names " + filenames[filename.toUpperCase()].longname + " and " + symbol.longname  + ", renaming the latter to " + filename + "-" + j);
			filename = filename + "-" + j;
		}
		filenames[filename.toUpperCase()] = symbol;
		__uniqueFilenames[symbol.longname] = filename;
	});
	filenames = null;

	// create a class index, displayed in the left-hand column of every class page
	var classTemplate;
	if ( !conf.contentOnly ) {
		info("create embedded class index");
		Link.base = "../";
		Link.baseSymbols = "";
		classTemplate = 'classWithIndex.html.tmpl';
		publish.header = processTemplate("_header.tmpl", firstClassSymbols);
		publish.footer = processTemplate("_footer.tmpl", firstClassSymbols);
		publish.classesIndex = processTemplate("_navIndex.tmpl", firstClassSymbols); // kept in memory
	} else {
		var newStyle = !!pluginConf.newStyle;
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
		var sOutName = path.join(conf.symbolsDir, __uniqueFilenames[symbol.longname]) + conf.ext;
		processTemplateAndSave(classTemplate, symbol, sOutName);
	});

	if ( conf.modulePages ) {
		info("create module pages");
		Link.base = "../";
		Link.baseSymbols = "../" + conf.symbolsDir;
		fs.mkPath(path.join(conf.outdir, conf.modulesDir));
		groupByModule(firstClassSymbols.get()).forEach(function(module) {
			var sOutName = path.join(conf.modulesDir, module.name.replace(/\//g, '_')) + conf.ext;
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
		var sinceSymbols = symbols(function() {
			var r = !!this.since && !this.inherited && conf.filter(this);
			if ( r && this.memberof ) {
				var parent = lookup(this.memberof);
				// filter out symbol when parent is filtered out
				if ( !parent || !conf.filter(parent) ) {
					debug("since index: filtering out " + this.longname + ", member of " + this.memberof);
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
		var deprecatedSymbols = symbols(function() {
			return !!this.deprecated && !this.inherited && conf.filter(this);
		}).order("longname");
		processTemplateAndSave("deprecation.html.tmpl", deprecatedSymbols, "deprecation" + conf.ext);
	}

	if ( conf.experimentalIndex ) {
		info("create experimental API index");
		Link.base = "";
		Link.baseSymbols = conf.symbolsDir;
		var experimentalSymbols = symbols(function() {
			return !!this.experimental && !this.inherited && conf.filter(this);
		}).order("longname");
		processTemplateAndSave("experimental.html.tmpl", experimentalSymbols, "experimental" + conf.ext);
	}

	if ( conf.securityIndex ) {
		info("create Security Relevant API index");

		var securityRelevantSymbols = {};
		A_SECURITY_TAGS.forEach(function(oTagDef) {
			securityRelevantSymbols[oTagDef.name.toLowerCase()] = { tag : oTagDef, symbols: [] };
		});
		symbols().each(function($) {
			var tags = $.tags;
			if ( !$.inherited  && conf.filter($) && tags ) {
				for (var i = 0; i < tags.length; i++) {
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
	var templatePath = env.opts.template;
	var fromDir = path.join(templatePath, 'static');
	var staticFiles = fs.ls(fromDir, 3);
	staticFiles.forEach(function(fileName) {
		var toDir = fs.toDir( fileName.replace(fromDir, conf.outdir) );
		fs.mkPath(toDir);
		fs.copyFileSync(fileName, toDir);
	});

	__uniqueFilenames = null;

	info("publishing done.");
}

// ---- helper functions for the templates ----

var rSinceVersion = /^([0-9]+(?:\.[0-9]+(?:\.[0-9]+)?)?([-.][0-9A-Z]+)?)(?:\s|$)/i;

function extractVersion(value) {

	if ( !value ) {
		return;
	}

	if ( value === true ) {
		value = '';
	} else {
		value = String(value);
	}

	var m = rSinceVersion.exec(value);
	return m ? m[1] : undefined;

}

var rSince = /^(?:as\s+of|since)(?:\s+version)?\s*([0-9]+(?:\.[0-9]+(?:\.[0-9]+)?)?([-.][0-9A-Z]+)?)(?:\.$|\.\s+|[,:]\s*|\s-\s*|\s|$)/i;

function extractSince(value) {

	if ( !value ) {
		return;
	}

	if ( value === true ) {
		value = '';
	} else {
		value = String(value);
	}

	var m = rSince.exec(value);
	if ( m ) {
		return {
			since : m[1],
			pos : m[0].length,
			value : value.slice(m[0].length).trim()
		}
	}

	return {
		pos : 0,
		value: value.trim()
	};

}

function sortByAlias(a, b) {
	var partsA = a.longname.split(/[.#]/);
	var partsB = b.longname.split(/[.#]/);
	var i = 0;
	while ( i < partsA.length && i < partsB.length ) {
		if ( partsA[i].toLowerCase() < partsB[i].toLowerCase() )
			return -1;
		if ( partsA[i].toLowerCase() > partsB[i].toLowerCase() )
			return 1;
		i++;
	}
	if ( partsA.length < partsB.length )
		return -1;
	if ( partsA.length > partsB.length )
		return 1;
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

/** Just the first sentence (up to a full stop). Should not break on dotted variable names. */
function summarize(desc) {
	if ( desc != null ) {
		desc = String(desc).replace(/\s+/g, ' ').
					replace(/"'/g, '&quot;').
					replace(/^(<\/?p>|<br\/?>|\s)+/, '');

		var match = /([\w\W]+?\.)[^a-z0-9_$]/i.exec(desc);
		return match ? match[1] : desc;
	}
}

/** Make a symbol sorter by some attribute. */
function makeSortby(/* fields ...*/) {
	var aFields = Array.prototype.slice.apply(arguments),
		aNorms = [],
		aFuncs = [];
	for (var i = 0; i < arguments.length; i++) {
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
		// info("compare " + a.longname + " : " + b.longname);
		var r = 0,i,va,vb;
		for (i = 0; r === 0 && i < aFields.length; i++) {
			va = aFuncs[i](a,aFields[i]);
			vb = aFuncs[i](b,aFields[i]);
			if ( va && !vb ) {
				r = -aNorms[i];
			} else if ( !va && vb ) {
				r = aNorms[i];
			} else if ( va && vb ) {
				va = String(va).toLowerCase();
				vb = String(vb).toLowerCase();
				if (va < vb) r = -aNorms[i];
				if (va > vb) r = aNorms[i];
			}
			// debug("  " + aFields[i] + ": " + va + " ? " + vb + " = " + r);
		}
		return r;
	}
}

/** Pull in the contents of an external file at the given path. */

function processTemplateAndSave(sTemplateName, oData, sOutputName) {
	var sResult = processTemplate(sTemplateName, oData);
	if ( conf.normalizeWhitespace && /\.html$/.test(sOutputName) ) {
		sResult = normalizeWhitespace(sResult);
	}
	var sOutpath = path.join(conf.outdir, sOutputName);
	try {
		fs.writeFileSync(sOutpath, sResult, 'utf8');
	} catch (e) {
		error("failed to write generated file '" + sOutpath + "':" + (e.message || String(e)));
	}
}

function processTemplate(sTemplateName, data) {
	debug("processing template '" + sTemplateName + "' for " + data.longname);

	try {
	var result = view.render(sTemplateName, {
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
			var filename = path.join(env.opts.destination, sTemplateName + ".js");
			console.log("**** failed to process template, source written to " + filename);
			fs.mkPath(path.dirname(filename));
			fs.writeFileSync(filename, e.source, 'utf8');
		}
		console.log("error while processing " + sTemplateName);
		throw e;
	}
	debug("processing template done.");
	return result;
}

function groupByVersion(symbols, extractVersion) {

	var map = {};

	symbols.forEach(function(symbol) {

		var version = extractVersion(symbol),
			key = String(version);

		if ( !map[key] ) {
			map[key] = { version: version, symbols : [] };
		}
		map[key].symbols.push(symbol);

	});

	var groups = Object.keys(map).map(function(key) { return map[key]; });

	return groups.sort(function(a,b) {
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

	var map = {};

	function add(key, symbol) {
		if ( !map[key] ) {
			map[key] = { name: key, symbols : [] };
		}
		if ( map[key].symbols.indexOf(symbol) < 0 ) {
			map[key].symbols.push(symbol);
		}
	}

	symbols.forEach(function(symbol) {

		var key = symbol.__ui5.module;

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

	var groups = Object.keys(map).map(function(key) { return map[key]; });

	return groups;
}


var REGEXP_TAG = /<(\/?(?:[A-Z][A-Z0-9_-]*:)?[A-Z][A-Z0-9_-]*)(?:\s[^>]*)?>/gi;

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
	var compressed = '',
		preformatted = 0,
		p = 0, m, text;

	REGEXP_TAG.lastIndex = 0;
	while ( m = REGEXP_TAG.exec(content) ) {
		if ( m.index > p ) {
			text = content.slice(p, m.index);
			if ( preformatted ) {
				compressed += text;
				// console.log('  "' + text + '" (preformatted)');
			} else {
				text = text.replace(/\s+/g,' ');
				if ( text.trim() ) {
					compressed += text;
				}
				// console.log('  "' + text + '" (trimmed)');
			}
		}

		compressed += m[0];
		// console.log('  "' + m[0] + '" (tag)');
		p = m.index + m[0].length;

		if ( /^pre$/i.test(m[1]) ) {
			preformatted++;
		} else if ( /^\/pre$/i.test(m[1]) && preformatted ) {
			preformatted--;
		}

	}

	if ( content.length > p ) {
		text = content.slice(p, content.length);
		if ( preformatted ) {
			compressed += text;
			// console.log('  "' + text + '" (preformatted)');
		} else {
			text = text.replace(/\s+/g,' ');
			if ( text.trim() ) {
				compressed += text;
			}
			// console.log('  "' + text + '" (trimmed)');
		}
	}

	return compressed;
}

function makeLinkToSymbolFile(longname) {
	return Link.baseSymbols + __uniqueFilenames[longname] + conf.ext;
}

function simpleNameOf(longname) {
	longname = String(longname);
	var p = longname.lastIndexOf('.');
	return p < 0 ? longname : longname.slice(p + 1);
}

function bySimpleName(a,b) {
	if ( a === b ) {
		return 0;
	}
	var simpleA = simpleNameOf(a);
	var simpleB = simpleNameOf(b);
	if ( simpleA === simpleB ) {
		return a < b ? -1 : 1;
	} else {
		return simpleA < simpleB ? -1 : 1;
	}
}

/** Build output for displaying function parameters. */
function makeSignature(params) {
	var r = ['('], desc;
	if ( params ) {
		for (var i = 0, p; p = params[i]; i++) {
			// ignore @param tags for 'virtual' params that are used to document members of config-like params
			// (e.g. like "@param param1.key ...")
			if (p.name && p.name.indexOf('.') == -1) {
				if (i > 0)
					r.push(', ');

				r.push('<span');

				var types = listTypes(p.type, true);
				if ( desc = asPlainSummary(p.description) || types ) {
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
				if ( p.optional )
					r.push('<i class="help" title="Optional parameter">?</i>');
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
 *                 [------- <pre> block -------] [----------------------- some flow content -----------------------] [---- an inline {@link ...} tag ----] [---------- an empty line ---------]  */
var rFormatText = /(<pre(?:\s[^>]*)?>)|(<\/pre>)|(<(?:h[\d+]|ul|ol|table)(?:\s[^>]*)?>)|(<\/(?:h[\d+]|ul|ol|table)>)|\{@link\s+([^}\s]+)(?:\s+([^\}]*))?\}|((?:\r\n|\r|\n)[ \t]*(?:\r\n|\r|\n))/gi;

function formatText(text) {

	if ( !text ) {
		return '';
	}

	var inpre = false,
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
				var link = new Link().toSymbol(linkTarget);
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


//console.log("#### samples");
//console.log(formatText(summarize("This is a first\n\nparagraph with empty \n   \n   \nlines in it. This is the remainder.")));

function childrenOfKind(data, kind) {
	/* old version based on TaffyDB (slow)
	var oChildren = symbolSet({kind: kind, memberof: data.longname === GLOBAL_LONGNAME ? {isUndefined: true} : data.longname}).filter(function() { return conf.filter(this); });
	return {
		own : oChildren.filter({inherited: {isUndefined:true}}).get().sort(makeSortby("!deprecated","static","name")),
		borrowed : groupByContributors(data, oChildren.filter({inherited: true}).get().sort(makeSortby("name")))
	} */
	var oResult = {
		own: [],
		borrowed: []
	};
	//console.log("calculating kind " + kind + " from " + data.longname);
	//console.log(data);
	var fnFilter;
	switch (kind) {
	case 'property':
		fnFilter = function($) {
			return $.kind === 'constant' || ($.kind === 'member' && !$.isEnum);
		}
		break;
	case 'event':
		fnFilter = function($) {
			return $.kind === 'event';
		}
		break;
	case 'method':
		fnFilter = function($) {
			return $.kind === 'function';
		}
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
 * @param symbol of which these are the members
 * @param borrowedMembers set of borrowed members to determine the contributors for
 * @return sorted array of contributors
 */
function groupByContributors(symbol, aBorrowedMembers) {

	var MAX_ORDER = 1000, // a sufficiently large number
		mContributors = {},
		aSortedContributors = [],
		i,order;

	aBorrowedMembers.forEach(function($) {
		$ = lookup($.inherits);
		if ($ && mContributors[$.memberof] == null) {
			mContributors[$.memberof] = { order : MAX_ORDER, items : [$] };
		} else {
			mContributors[$.memberof].items.push($);
		}
	});

	// order contributors according to their distance in the inheritance hierarchy
	order = 0;
	(function handleAugments(oSymbol) {
		var i,oTarget,aParentsToVisit;
		if ( oSymbol.augments ) {
			aParentsToVisit = [];
			// first assign an order
			for (i = 0; i < oSymbol.augments.length; i++) {
				if ( mContributors[oSymbol.augments[i]] != null && mContributors[oSymbol.augments[i]].order === MAX_ORDER ) {
					mContributors[oSymbol.augments[i]].order = ++order;
					aParentsToVisit.push(oSymbol.augments[i]);
				}
			}
			// only then dive into parents (breadth first search)
			for (i = 0; i < aParentsToVisit.length; i++) {
				oTarget = lookup(aParentsToVisit);
				if ( oTarget ) {
					handleAugments(oTarget);
				}
			}
		}
	}(symbol));

	// convert to an array and sort by order
	for (i in mContributors) {
		aSortedContributors.push(mContributors[i]);
	}
	aSortedContributors.sort(function (a,b) { return a.order - b.order; });

	return aSortedContributors;

}

function makeLinkList(aSymbols) {
	return aSymbols
		.sort(makeSortby("name"))
		.map(function($) { return new Link().toSymbol($.longname).withText($.name); })
		.join(", ");
}

// ---- type parsing ---------------------------------------------------------------------------------------------

function TypeParser(defaultBuilder) {

	/* TODO 
	 * - function(this:) // type of this
	 * - function(new:) // constructor
	 */
	var rLexer = /\s*(Array\.?<|Object\.?<|Set\.?<|Promise\.?<|function\(|\{|:|\(|\||\}|>|\)|,|\[\]|\*|\?|!|\.\.\.)|\s*(\w+(?:[.#~]\w+)*)|./g;

	var input,
		builder,
		token,
		tokenStr;

	function next(expected) {
		if ( expected !== undefined && token !== expected ) {
			throw new SyntaxError("TypeParser: expected '" + expected + "', but found '" + tokenStr + "' (pos: " + rLexer.lastIndex + ", input='" + input + "')");
		}
		var match = rLexer.exec(input);
		if ( match ) {
			tokenStr = match[1] || match[2];
			token = match[1] || (match[2] && 'symbol');
			if ( !token ) {
				throw new SyntaxError("TypeParser: unexpected '" + tokenStr + "' (pos: " + match.index + ", input='" + input + "')");
			}
		} else {
			tokenStr = token = null;
		}
	}
	
	function parseType() {
		var nullable = false;
		var mandatory = false;
		if ( token === '?' ) {
			next();
			nullable = true;
		} else if ( token === '!' ) {
			next();
			mandatory = true;
		}

		var type;
		
		if ( token === 'Array.<' || token === 'Array<' ) {
			next();
			var componentType = parseType();
			next('>');
			type = builder.array(componentType);
		} else if ( token === 'Object.<' || token === 'Object<' ) {
			next();
			var keyType;
			var valueType = parseType();
			if ( token === ',' ) {
				next();
				keyType = valueType;
				valueType = parseType();
			} else {
				keyType = builder.synthetic(builder.simpleType('string'));
			}
			next('>');
			type = builder.object(keyType, valueType);
		} else if ( token === 'Set.<' || token === 'Set<' ) {
			next();
			var elementType = parseType();
			next('>');
			type = builder.set(elementType);
		} else if ( token === 'Promise.<' || token === 'Promise<' ) {
			next();
			var elementType = parseType();
			next('>');
			type = builder.promise(elementType);
		} else if ( token === 'function(' ) {
			next();
			var thisType, constructorType, paramTypes = [], returnType;
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
				var repeatable = token === '...';
				if ( repeatable) {
					next(); 
				}
				var paramType = parseType();
				if ( repeatable ) {
					paramType = builder.repeatable(paramType);
				}
				paramTypes.push(paramType);
				if ( token === ',' ) {
					if ( repeatable ) {
						throw new SyntaxError("TypeParser: only the last parameter of a function can be repeatable (pos: " + rLexer.lastIndex + ", input='" + input + "')");
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
			var structure = Object.create(null);
			var propName,propType;
			next();
			do {
				propName = tokenStr;
				if ( !/^\w+$/.test(propName) ) {
					throw new SyntaxError("TypeParser: structure field must have a simple name (pos: " + rLexer.lastIndex + ", input='" + input + "', field:'" + propName + "')");
				}
				next('symbol'); 
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
			while ( token === '[]' ) {
				next();
				type = builder.array(type);
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
		var types = [];
		do {
			types.push(parseType());
			if ( token !== '|' ) {
				break;
			}
			next();
		} while (token);
		return types.length === 1 ? types[0] : builder.union(types);
	}

	this.parse = function(typeStr, tempBuilder) {
		builder = tempBuilder || defaultBuilder || TypeParser.ASTBuilder;
		input = String(typeStr);
		rLexer.lastIndex = 0;
		next();
		var type = parseTypes();
		next(null);
		return type;
	}

} 

TypeParser.ASTBuilder = {
	simpleType: function(type) {
		return {
			type: 'simpleType',
			name: type
		};
	},
	array: function(componentType) {
		return {
			type: 'array',
			component: componentType
		};
	},
	object: function(keyType, valueType) {
		return {
			type: 'object',
			key: keyType,
			value: valueType
		};
	},
	set: function(elementType) {
		return {
			type: 'set',
			element: elementType
		};
	},
	promise: function(fulfillmentType) {
		return {
			type: 'promise',
			fulfill: fulfillmentType
		};
	},
	function: function(paramTypes, returnType, thisType, constructorType) {
		return {
			type: 'function',
			params: paramTypes,
			return: returnType,
			this: thisType,
			constructor: constructorType
		};
	},
	structure: function(structure) {
		return {
			type: 'structure',
			fields: structure
		};
	},
	union: function(types) {
		return {
			type: 'union',
			types: types
		};
	},
	synthetic: function(type) {
		type.synthetic = true;
		return type;
	},
	nullable: function(type) {
		type.nullable = true;
		return type;
	},
	mandatory: function(type) {
		type.mandatory = true;
		return type;
	},
	repeatable: function(type) {
		type.repeatable = true;
		return type;
	}
};

TypeParser.LinkBuilder = function(style, encoded) {
	this.linkStyle = style;
	this.lt = encoded ? "&lt;" : "<";
	this.gt = encoded ? "&gt;" : ">";
};
TypeParser.LinkBuilder.prototype = {
	safe: function(type) {
		return type.needsParenthesis ? "(" + type.str + ")" : type.str;
	},
	simpleType: function(type) {
		if ( this.linkStyle === 'text' ) {
			return {
				str: type
			};
		}
		var link = new Link().toSymbol(type);
		if ( this.linkStyle === 'short' ) {
			link.withText(simpleNameOf(type)).withTooltip(type);
		}
		return {
			str: link.toString()
		};
	},
	array: function(componentType) {
		if ( componentType.needsParenthesis ) {
			return {
				str: "Array.<" + componentType.str + ">"
			};
		}
		return {
			str: componentType.str + "[]"
		};
	},
	object: function(keyType, valueType) {
		if ( keyType.synthetic ) {
			return {
				str: "Object." + this.lt + valueType.str + this.gt
			};
		}
		return {
			str: "Object." + this.lt + keyType.str + "," + valueType.str + this.gt
		};
	},
	set: function(elementType) {
		return {
			str: 'Set.' + this.lt + elementType.str + this.gt
		};
	},
	promise: function(fulfillmentType) {
		return {
			str: 'Promise.' + this.lt + fulfillmentType.str + this.gt
		};
	},
	function: function(paramTypes, returnType) {
		return {
			str: "function(" + paramTypes.map(function(type) { return type.str; }).join(',') + ")" + ( returnType ? " : " + this.safe(returnType) : "")
		};
	},
	structure: function(structure) {
		var r = [];
		for ( var fieldName in structure ) {
			if ( structure[fieldName].synthetic ) {
				r.push(fieldName);
			} else {
				r.push(fieldName + ":" + structure[fieldName].str);
			}
		}
		return {
			str: "{" + r.join(",") + "}"
		};
	},
	union: function(types) {
		return {
			needsParenthesis: true,
			str: types.map( this.safe.bind(this) ).join('|')
		};
	},
	synthetic: function(type) {
		type.synthetic = true;
		return type;
	},
	nullable: function(type) {
		type.str = "?" + type.str;
		return type;
	},
	mandatory: function(type) {
		type.str = "!" + type.str;
		return type;
	},
	repeatable: function(type) {
		type.str = "..." + type.str;
		return type;
	}
};

var typeParser = new TypeParser();
var _SHORT_BUILDER = new TypeParser.LinkBuilder('short', true);
var _LONG_BUILDER = new TypeParser.LinkBuilder('long', true);
var _TEXT_BUILDER = new TypeParser.LinkBuilder('text', false);
var _TEXT_BUILDER_ENCODED = new TypeParser.LinkBuilder('text', true);

/*
function testTypeParser(type) {
	console.log("Type: '" + type + "' gives AST");
	try {
		console.log(typeParser.parse(type));
	} catch (e) {
		console.log("**** throws: " + e);
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
		} catch (e) {
			error("failed to parse type string '" + type + "': " + e);
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

/**
 * Reduces the given text to a summary and removes all tags links etc. and escapes double quotes.
 * The result therefore should be suitable as content for an HTML tag attribute (e.g. title).
 * @param sText
 * @return summarized, plain attribute
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

/*
 * regexp to recognize important places in the text
 *
 * Capturing groups of the RegExp:
 *   group 1: begin of a pre block
 *   group 2: end of a pre block
 *   group 3: an empty line + surrounding whitespace (implicitly starts a new paragraph)
 *   group 4: an isolated line feed + surrounding whitespace
 *
 *                    [------- <pre> block -------] [---- an empty line and surrounding whitespace ----] [---- new line or whitespaces ----] */
var rNormalizeText = /(<pre(?:\s[^>]*)?>)|(<\/pre>)|([ \t]*(?:\r\n|\r|\n)[ \t]*(?:\r\n|\r|\n)[ \t\r\n]*)|([ \t]*(?:\r\n|\r|\n)[ \t]*|[ \t]+)/gi;

function normalizeWS(text) {
	if ( text == null ) {
		return text;
	}

	var inpre = false;
	return String(text).replace(rNormalizeText, function(match, pre, endpre, emptyline, ws) {
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

	var api = {
		"$schema-ref": "http://schemas.sap.com/sapui5/designtime/api.json/1.0"
	}

	if ( templateConf.version ) {
		api.version = templateConf.version.replace(/-SNAPSHOT$/,"");
	}
	if ( templateConf.uilib ) {
		api.library = templateConf.uilib;
	}

	api.symbols = [];
	// sort only a copy(!) of the symbols, otherwise the SymbolSet lookup is broken
	symbols.slice(0).sort(sortByAlias).forEach(function(symbol) {
		if ( isFirstClassSymbol(symbol) && !symbol.synthetic ) { // dump a symbol if it as a class symbol and if it is not a synthetic symbol
			api.symbols.push(createAPIJSON4Symbol(symbol, false));
		}
	});

	postProcessAPIJSON(api);

	fs.mkPath(path.dirname(filename));
	fs.writeFileSync(filename, JSON.stringify(api), 'utf8');
	info("  apiJson saved as " + filename);
}

function createAPIJSON4Symbol(symbol, omitDefaults) {

	var obj = [];
	var curr = obj;
	var attribForKind = 'kind';
	var stack = [];

	function isEmpty(obj) {
		if ( !obj ) {
			return true;
		}
		for (var n in obj) {
			if ( obj.hasOwnProperty(n) ) {
				return false;
			}
		}
		return true;
	}

	function tag(name, value, omitEmpty) {

		if ( omitEmpty && !value ) {
			return;
		}
		if ( arguments.length === 1 ) { // opening tag
			stack.push(curr);
			stack.push(attribForKind);
			var obj = {};
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
		var emptyTag = arguments.length === 1;
		if ( omitDefaults && arguments.length >= 3 && value === defaultValue ) {
			return;
		}
		curr[name] = emptyTag ? true : (raw ? value : String(value));
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

		var info = extractSince(value);

		tag(name);
		if ( info.since ) {
			attrib("since", info.since);
		}
		if ( info.value ) {
			curr["text"] = normalizeWS(info.value);
		}
		closeTag(name, true);

	}

	function examples(symbol) {
		var j, example;

		if ( symbol.examples && symbol.examples.length ) {
			collection("examples");
			for ( j = 0; j < symbol.examples.length; j++) {
				example = makeExample(symbol.examples[j]);
				tag("example");
				if ( example.caption ) {
					attrib("caption", example.caption);
				}
				attrib("text", example.example);
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

	function exceptions(symbol) {
		var array = symbol.exceptions,
			j, exception;
		
		if ( Array.isArray(array) ) {
			array = array.filter( function (ex) {
				return (ex.type && listTypes(ex.type)) || (ex.description && ex.description.trim());
			});
		} 
		if ( array == null || array.length === 0 ) {
			return;
		}
		
		collection("throws");
		for (j = 0; j < array.length; j++) {
			exception = array[j];
			tag("exception");
			if ( exception.type !== undefined ) {
				attrib("type", listTypes(exception.type));
			}
			tag("description", normalizeWS(exception.description), true);
			closeTag("exception");
		}
		endCollection("throws");
	}

	function methodList(tagname, methods) {
		methods = methods && Object.keys(methods).map(function(key) { return methods[key]; });
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
			var baseSymbol = $.augments[0];
			if ( visited.hasOwnProperty(baseSymbol) ) {
				error("detected cyclic inheritance when looking at " + $.longname + ": " + JSON.stringify(visited));
				return false;
			}
			visited[baseSymbol] = true;
			baseSymbol = lookup(baseSymbol) ;
			if ( hasSettings(baseSymbol, visited) ) {
				return true;
			}
		}

		var metadata = $.__ui5.metadata;
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

		var metadata = $.__ui5.metadata;
		if ( !metadata ) {
			return;
		}

		var n;

		if ( metadata.specialSettings && Object.keys(metadata.specialSettings).length > 0 ) {
			collection("specialSettings");
			for ( n in metadata.specialSettings ) {
				var special = metadata.specialSettings[n];
				tag("specialSetting");
				attrib("name", special.name);
				attrib("type", special.type);
				attrib("visibility", special.visibility, 'public');
				if ( special.since ) {
					attrib("since", extractVersion(special.since));
				}
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
			for ( n in metadata.properties ) {
				var prop = metadata.properties[n];
				tag("property");
				attrib("name", prop.name);
				attrib("type", prop.type, 'string');
				attrib("defaultValue", prop.defaultValue, null, /* raw = */true);
				attrib("group", prop.group, 'Misc');
				attrib("visibility", prop.visibility, 'public');
				if ( prop.since ) {
					attrib("since", extractVersion(prop.since));
				}
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
			for ( n in metadata.aggregations ) {
				var aggr = metadata.aggregations[n];
				tag("aggregation");
				attrib("name", aggr.name);
				attrib("singularName", aggr.singularName); // TODO omit default?
				attrib("type", aggr.type, 'sap.ui.core.Control');
				if ( aggr.altTypes ) {
					curr.altTypes = aggr.altTypes.slice();
				}
				attrib("cardinality", aggr.cardinality, '0..n');
				attrib("visibility", aggr.visibility, 'public');
				if ( aggr.since ) {
					attrib("since", extractVersion(aggr.since));
				}
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
			for ( n in metadata.associations ) {
				var assoc = metadata.associations[n];
				tag("association");
				attrib("name", assoc.name);
				attrib("singularName", assoc.singularName); // TODO omit default?
				attrib("type", assoc.type, 'sap.ui.core.Control');
				attrib("cardinality", assoc.cardinality, '0..1');
				attrib("visibility", assoc.visibility, 'public');
				if ( assoc.since ) {
					attrib("since", extractVersion(assoc.since));
				}
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
			for ( n in metadata.events ) {
				var event = metadata.events[n];
				tag("event");
				attrib("name", event.name);
				attrib("visibility", event.visibility, 'public');
				if ( event.since ) {
					attrib("since", extractVersion(event.since));
				}
				tag("description", normalizeWS(event.doc), true);
				tagWithSince("experimental", event.experimental);
				tagWithSince("deprecated", event.deprecation);
				if ( event.parameters && Object.keys(event.parameters).length > 0 ) {
					tag("parameters");
					for ( var pn in event.parameters ) {
						if ( event.parameters.hasOwnProperty(pn) ) {
							var param = event.parameters[pn];
							tag(pn);
							attrib("name", pn);
							attrib("type", param.type);
							if ( param.since ) {
								attrib("since", extractVersion(param.since));
							}
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
			for ( n in metadata.annotations ) {
				var anno = metadata.annotations[n];
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
				if ( anno.since ) {
					attrib("since", extractVersion(anno.since));
				}
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

	function writeParameterProperties(paramName, params) {
		var prefix = paramName + '.',
			count = 0,
			i;

		for ( i = 0; i < params.length; i++ ) {

			var name = params[i].name;
			if ( name.lastIndexOf(prefix, 0) !== 0 ) { // startsWith
				continue;
			}
			name = name.slice(prefix.length);
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
			if ( params[i].since ) {
				attrib("since", extractVersion(params[i].since));
			}

			writeParameterProperties(params[i].name, params);

			tag("description", normalizeWS(params[i].description), true);
			tagWithSince("experimental", params[i].experimental);
			tagWithSince("deprecated", params[i].deprecated);

			closeTag(name);
		}

		if ( count > 0 ) {
			closeTag("parameterProperties");
		}
	}

	function methodSignature(member) {
		var returns = member.returns && member.returns.length && member.returns[0];
		var type = member.type || (returns && returns.type);
		type = listTypes(type);
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
	
		if ( member.params && member.params.length > 0 ) {
			collection("parameters");
			for ( j = 0; j < member.params.length; j++) {
				param = member.params[j];
				if ( param.name.indexOf('.') >= 0 ) {
					continue;
				}
				tag("parameter");
				attrib("name", param.name);
				attrib("type", listTypes(param.type));
				attrib("optional", !!param.optional, false, /* raw = */true);
				if ( param.defaultvalue !== undefined ) {
					attrib("defaultValue", param.defaultvalue, undefined, /* raw = */true);
				}
				if ( param.since ) {
					attrib("since", extractVersion(param.since));
				}
				writeParameterProperties(param.name, member.params);
				tag("description", normalizeWS(param.description), true);
				tagWithSince("experimental", param.experimental);
				tagWithSince("deprecated", param.deprecated);
				closeTag("parameter");
			}
			endCollection("parameters");
		}

		exceptions(member);

	}

	/*
	var rSplitSecTag = /^\s*\{([^\}]*)\}/;

	function secTags($) {
		if ( true ) {
			return;
		}
		var aTags = $.tags;
		if ( !aTags ) {
			return;
		}
		for (var iTag = 0; iTag < A_SECURITY_TAGS.length; iTag++  ) {
			var oTagDef = A_SECURITY_TAGS[iTag];
			for (var j = 0; j < aTags.length; j++ ) {
				if ( aTags[j].title.toLowerCase() === oTagDef.name.toLowerCase() ) {
					tag(oTagDef.name);
					var m = rSplitSecTag.exec(aTags[j].text);
					if ( m && m[1].trim() ) {
						var aParams = m[1].trim().split(/\s*\|\s* /); <-- remember to remove the space!
						for (var iParam = 0; iParam < aParams.length; iParam++ ) {
							tag(oTagDef.params[iParam], aParams[iParam]);
						}
					}
					var sDesc = aTags[j].description;
					tag("description", sDesc, true);
					closeTag(oTagDef.name);
				}
			}
		}
	}
	*/

	var kind = (symbol.kind === 'member' && symbol.isEnum) ? "enum" : symbol.kind; // handle pseudo-kind 'enum'

	tag(kind);

	attrib("name", symbol.longname);
	attrib("basename", symbol.name);
	if ( symbol.__ui5.resource ) {
		attrib("resource", symbol.__ui5.resource);
	}
	if ( symbol.__ui5.module ) {
		attrib("module", symbol.__ui5.module);
		attrib("export", undefined, '', true);
	}
	if ( symbol.virtual ) {
		attrib("abstract", true, false, /* raw = */true);
	}
	if ( symbol.final_ ) {
		attrib("final", true, false, /* raw = */true);
	}
	if ( symbol.scope === 'static' ) {
		attrib("static", true, false, /* raw = */true);
	}
	attrib("visibility", visibility(symbol), 'public');
	if ( symbol.since ) {
		attrib("since", extractVersion(symbol.since));
	}
	if ( symbol.augments && symbol.augments.length ) {
		tag("extends", symbol.augments.sort().join(",")); // TODO what about multiple inheritance?
	}
	interfaceList("implements", symbol.implements);
	tag("description", normalizeWS(symbol.classdesc || (symbol.kind === 'class' ? '' : symbol.description)), true);
	tagWithSince("experimental", symbol.experimental);
	tagWithSince("deprecated", symbol.deprecated);
	if ( symbol.tags && symbol.tags.some(function(tag) { return tag.title === 'ui5-metamodel'; }) ) {
		attrib('ui5-metamodel', true, false, /* raw = */true);
	}

	var skipMembers = false;
	var i, j, member, param;

	if ( kind === 'class' ) {

		if ( symbol.__ui5.stereotype || hasSettings(symbol) ) {

			tag("ui5-metadata");

			if ( symbol.__ui5.stereotype ) {
				attrib("stereotype", symbol.__ui5.stereotype);
			}

			writeMetadata(symbol);

			closeTag("ui5-metadata");
		}


		// IF @hideconstructor tag is present we omit the whole constructor
		if ( !symbol.hideconstructor ) {

			tag("constructor");
			attrib("visibility", visibility(symbol));
			if (symbol.params && symbol.params.length > 0) {
				collection("parameters");
				for (j = 0; j < symbol.params.length; j++) {
					param = symbol.params[j];
					if (param.name.indexOf('.') >= 0) {
						continue;
					}
					tag("parameter");
					attrib("name", param.name);
					attrib("type", listTypes(param.type));
					attrib("optional", !!param.optional, false, /* raw = */true);
					if (param.defaultvalue !== undefined) {
						attrib("defaultValue", param.defaultvalue, undefined, /* raw = */true);
					}
					if (param.since) {
						attrib("since", extractVersion(param.since));
					}

					writeParameterProperties(param.name, symbol.params);
					tag("description", normalizeWS(param.description), true);
					tagWithSince("experimental", param.experimental);
					tagWithSince("deprecated", param.deprecated);
					closeTag("parameter");
				}
				endCollection("parameters");
			}
			exceptions(symbol);
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
		if( symbol.properties && symbol.properties.length > 0 ) {
			collection("properties");
			symbol.properties.forEach(function(prop) {
				tag("property");
				attrib("name", prop.name);
				attrib("type", listTypes(prop.type));
				attrib("visibility", visibility(symbol), 'public'); // properties inherit visibility of typedef
				tag("description", normalizeWS(prop.description), true);
				closeTag("property")
			});
			endCollection("properties");
		}	
	} else if ( kind === 'function' ) {
		methodSignature(symbol, /* no since */ true);		
	}

	if ( !skipMembers ) { 
		var ownProperties = childrenOfKind(symbol, "property").own.sort(sortByAlias);
		if ( ownProperties.length > 0 ) {
			collection("properties");
			for ( i = 0; i < ownProperties.length; i++ ) {
				member = ownProperties[i];
				tag("property");
				attrib("name", member.name);
				if ( member.__ui5.module && member.__ui5.module !== symbol.__ui5.module ) {
					attrib("module", member.__ui5.module);
					attrib("export", undefined, '', true);
				}
				attrib("visibility", visibility(member), 'public');
				if ( member.scope === 'static' ) {
					attrib("static", true, false, /* raw = */true);
				}
				if ( member.since ) {
					attrib("since", extractVersion(member.since));
				}
				attrib("type", listTypes(member.type));
				tag("description", normalizeWS(member.description), true);
				tagWithSince("experimental", member.experimental);
				tagWithSince("deprecated", member.deprecated);
				examples(member);
				referencesList(member);
				if ( member.__ui5.resource && member.__ui5.resource !== symbol.__ui5.resource ) {
					attrib("resource", member.__ui5.resource);
				}
				closeTag("property");
			}
			endCollection("properties");
		}
	
		var ownEvents = childrenOfKind(symbol, 'event').own.sort(sortByAlias);
		if ( ownEvents.length > 0 ) {
			collection("events");
			for (i = 0; i < ownEvents.length; i++ ) {
				member = ownEvents[i];
				tag("event");
				attrib("name", member.name);
				if ( member.__ui5.module && member.__ui5.module !== symbol.__ui5.module ) {
					attrib("module", member.__ui5.module);
					attrib("export", undefined, '', true);
				}
				attrib("visibility", visibility(member), 'public');
				if ( member.scope === 'static' ) {
					attrib("static", true, false, /* raw = */true);
				}
				if ( member.since ) {
					attrib("since", extractVersion(member.since));
				}
	
				if ( member.params && member.params.length > 0 ) {
					collection("parameters");
					for (j = 0; j < member.params.length; j++) {
						param = member.params[j];
						if ( param.name.indexOf('.') >= 0 ) {
							continue;
						}
	
						tag("parameter");
						attrib("name", param.name);
						attrib("type", listTypes(param.type));
						if ( param.since ) {
							attrib("since", extractVersion(param.since));
						}
						writeParameterProperties(param.name, member.params);
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
	
		var ownMethods = childrenOfKind(symbol, 'method').own.sort(sortByAlias);
		if ( ownMethods.length > 0 ) {
			collection("methods");
			for ( i = 0; i < ownMethods.length; i++ ) {
				member = ownMethods[i];
				tag("method");
				attrib("name", member.name);
				if ( member.__ui5.module && member.__ui5.module !== symbol.__ui5.module ) {
					attrib("module", member.__ui5.module);
					attrib("export", undefined, '', true);
				}
				attrib("visibility", visibility(member), 'public');
				if ( member.scope === 'static' ) {
					attrib("static", true, false, /* raw = */true);
				}
				if ( member.since ) {
					attrib("since", extractVersion(member.since));
				}
				if ( member.tags && member.tags.some(function(tag) { return tag.title === 'ui5-metamodel'; }) ) {
					attrib('ui5-metamodel', true, false, /* raw = */true);
				}
	
				methodSignature(member);
	
				tag("description", normalizeWS(member.description), true);
				tagWithSince("experimental", member.experimental);
				tagWithSince("deprecated", member.deprecated);
				examples(member);
				referencesList(member);
				//secTags(member);
				if ( member.__ui5.resource && member.__ui5.resource !== symbol.__ui5.resource ) {
					attrib("resource", member.__ui5.resource);
				}
				closeTag("method");
			}
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
	var modules = {};
	var symbols = api.symbols;
	var i,j,n,symbol,defaultExport;
	
	// collect modules and the symbols that refer to them 
	for ( i = 0; i < symbols.length; i++) {
		symbol = symbols[i];
		if ( symbol.module ) {
			modules[symbol.module] = modules[symbol.module] || [];
			modules[symbol.module].push({
				name: symbol.name,
				symbol: symbol
			});
		}
		if ( symbol.properties ) {
			for ( j = 0; j < symbol.properties.length; j++ ) {
				if ( symbol.properties[j].static && symbol.properties[j].module ) {
					modules[symbol.properties[j].module] = modules[symbol.properties[j].module] || [];
					modules[symbol.properties[j].module].push({
						name: symbol.name + "." + symbol.properties[j].name,
						symbol: symbol.properties[j]
					});
				}
			}
		}
		if ( symbol.methods ) {
			for ( j = 0; j < symbol.methods.length; j++ ) {
				if ( symbol.methods[j].static && symbol.methods[j].module ) {
					modules[symbol.methods[j].module] = modules[symbol.methods[j].module] || [];
					modules[symbol.methods[j].module].push({
						name: symbol.name + "." + symbol.methods[j].name,
						symbol: symbol.methods[j]
					});
				}
			}
		}
	}
	
	function guessExport(defaultExport, symbol) {
		if ( symbol.name === defaultExport ) {
			// default export equals the symbol name
			symbol.symbol.export = ""; 
			//console.log("    (default):" + defaultExport);
		} else if ( symbol.name.lastIndexOf(defaultExport + ".", 0) === 0 ) {
			// default export is a prefix of the symbol name
			symbol.symbol.export = symbol.name.slice(defaultExport.length + 1); 
			//console.log("    " + symbol.name.slice(defaultExport.length + 1) + ":" + symbol.name);
		} else {
			// default export is not a prefix of the symbol name -> no way to access it in AMD 
			symbol.symbol.export = undefined;
			console.log("    **** could not identify module export for API " + symbol.name);
		}
	}
	
	for ( n in modules ) {
		
		symbols = modules[n].sort(function(a,b) {
			if ( a.name === b.name ) {
				return 0;
			}
			return a.name < b.name ? -1 : 1;
		});
		
		// console.log('  resolved exports of ' + n + ": " + symbols.map(function(symbol) { return symbol.name; } ));
		if ( /^jquery\.sap\./.test(n) ) {
			// the jquery.sap.* modules all export 'jQuery'.
			// any API from those modules is reachable via 'jQuery.*'
			defaultExport = 'jQuery';
			symbols.forEach(
				guessExport.bind(this, defaultExport)
			);
		} else if ( /\/library$/.test(n) ) {
			// library.js modules export the library namespace
			defaultExport = n.replace(/\/library$/, "").replace(/\//g, ".");
			if ( symbols.some(function(symbol) { return symbol.name === defaultExport; }) ) {
				// if there is a symbol for the namespace, then all other symbols from the module should be sub-exports of that symbol
				symbols.forEach(
					guessExport.bind(this, defaultExport)
				);
			} else {
				// otherwise, we don't know how to map it to an export
				symbols.forEach(function(symbol) {
					symbol.symbol.export = symbol.name;
					console.log("    **** unresolved " + symbol.name + " in library.js (no export that matches module name)");
				});
			}
		} else {
			// for all other modules, the assumed default export is identical to the name of the module (converted to a 'dot' name)
			defaultExport = n.replace(/\//g, ".");
			if ( symbols.some(function(symbol) { return symbol.name === defaultExport; }) ) {
				symbols.forEach(
					guessExport.bind(this, defaultExport)
				);
			//} else if ( symbols.length === 1 && (symbols[0].symbol.kind === 'class' || symbols[0].symbol.kind === 'namespace') ) {
				// if there is only one symbol and if that symbol is of type class or namespace, assume it is the default export
				// TODO is that assumption safe? Was only done because of IBarPageEnabler (which maybe better should be fixed in the JSDoc)
				//symbols[0].symbol.export = '';
			} else {
				symbols.forEach(function(symbol) {
					symbol.symbol.export = undefined;
					console.log("    **** unresolved " + symbol.name + " (no export that matches module name)");
				});
			}
		}
	}
}

//---- add on: API XML -----------------------------------------------------------------

function createAPIXML(symbols, filename, options) {

	options = options || {};
	var roots = options.roots || null;
	var legacyContent = !!options.legacyContent;
	var omitDefaults = !!options.omitDefaults;
	var addRedundancy = !!options.resolveInheritance;

	var indent = 0;
	var output = [];
	var sIndent = "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t";
	var tags = [];
	var ENUM = legacyContent ? "namespace" : "enum" ;
	var BASETYPE = legacyContent ? "baseType" : "extends";
	var PROPERTY = legacyContent ? "parameter" : "property";
	var unclosedStartTag = false;

	function getAPIJSON(name) {

		var symbol = lookup(name);
		if ( symbol && !symbol.synthetic ) {
			return createAPIJSON4Symbol(symbol, false);
		}
		if ( addRedundancy && externalSymbols[name] ) {
			debug("  using " + name + " from external dependency");
			return externalSymbols[name];
		}
		return symbol;
	}

	function encode(s) {
		return s ? s.replace(/&/g, "&amp;").replace(/</g, "&lt;") : s;
	}

	function write(args) {
		if ( arguments.length ) {
			for (var i = 0; i < arguments.length; i++)
				output.push(arguments[i]);
		}
	}

	function writeln(args) {
		if ( indent > 0 )
			output.push(sIndent.slice(0,indent));
		if ( arguments.length ) {
			for (var i = 0; i < arguments.length; i++)
				output.push(arguments[i]);
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
		var emptyTag = arguments.length === 1;
		if ( omitDefaults && arguments.length === 3 && value === defaultValue ) {
			return;
		}

		if ( !legacyContent ) {
			write(" " + name + "=\"");
			write(emptyTag ? "true" : encode(String(value)).replace(/"/g, "&quot;"));
			write("\"");
		} else {
			if ( emptyTag ) {
				writeln("<", name, "/>");
			} else {
				writeln("<", name, ">", encode(String(value)), "</", name, ">");
			}
		}
	}

	function closeTag(name, noIndent) {

		indent--;
		var top = tags.pop();
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

	function getAsString() {
		return output.join("");
	}

	function writeMetadata(symbolAPI, inherited) {

		var ui5Metadata = symbolAPI["ui5-metadata"];
		if ( !ui5Metadata ) {
			return;
		}

		if ( addRedundancy && symbolAPI["extends"] ) {
			var baseSymbolAPI = getAPIJSON(symbolAPI["extends"]);
			if ( baseSymbolAPI ) {
				writeMetadata(baseSymbolAPI, true);
			}
		}

		if ( ui5Metadata.specialSettings ) {
			ui5Metadata.specialSettings.forEach(function(special) {
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
			ui5Metadata.properties.forEach(function(prop) {
				tag("property");
				attrib("name", prop.name);
				attrib("type", prop.type, 'string');
				if ( prop.defaultValue !== null ) {
					attrib("defaultValue", prop.defaultValue, null);
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
			ui5Metadata.aggregations.forEach(function(aggr) {
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
			ui5Metadata.associations.forEach(function(assoc) {
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
			ui5Metadata.events.forEach(function(event) {
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
					for ( var pn in event.parameters ) {
						if ( event.parameters.hasOwnProperty(pn) ) {
							var param = event.parameters[pn];

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
			ui5Metadata.annotations.forEach(function(anno) {
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

		var ui5Metadata = symbolAPI["ui5-metadata"];
		if ( !ui5Metadata ) {
			return;
		}

		if ( symbolAPI["extends"] ) {
			var baseSymbolAPI = getAPIJSON(symbolAPI["extends"]);
			writeParameterPropertiesForMSettings(baseSymbolAPI, true);
		}

		if ( ui5Metadata.specialSettings ) {
			ui5Metadata.specialSettings.forEach(function(special) {
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
			ui5Metadata.properties.forEach(function(prop) {
				tag("property");
				attrib("name", prop.name);
				attrib("type", prop.type);
				attrib("group", prop.group, 'Misc');
				if ( prop.defaultValue !== null ) {
					attrib("defaultValue", typeof prop.defaultValue === 'string' ? "\"" + prop.defaultValue + "\"" : prop.defaultValue);
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
			ui5Metadata.aggregations.forEach(function(aggr) {
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
			ui5Metadata.associations.forEach(function(assoc) {
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
			ui5Metadata.events.forEach(function(event) {
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
		var props = param.parameterProperties,
			prefix = paramName + '.',
			count = 0;

		if ( props ) {
			for (var n in props ) {
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
	var rSplitSecTag = /^\s*\{([^\}]*)\}/;

	function secTags($) {
		if ( !legacyContent ) {
			return;
		}
		var aTags = $.tags;
		if ( !aTags ) {
			return;
		}
		for (var iTag = 0; iTag < A_SECURITY_TAGS.length; iTag++  ) {
			var oTagDef = A_SECURITY_TAGS[iTag];
			for (var j = 0; j < aTags.length; j++ ) {
				if ( aTags[j].title.toLowerCase() === oTagDef.name.toLowerCase() ) {
					tag(oTagDef.name);
					var m = rSplitSecTag.exec(aTags[j].text);
					if ( m && m[1].trim() ) {
						var aParams = m[1].trim().split(/\s*\|\s* /); <-- remove the blank!
						for (var iParam = 0; iParam < aParams.length; iParam++ ) {
							tag(oTagDef.params[iParam], aParams[iParam]);
						}
					}
					var sDesc = aTags[j].description;
					tag("description", sDesc, true);
					closeTag(oTagDef.name);
				}
			}
		}
	}
	*/

	function writeSymbol(symbol) {

		var kind;

		if ( isFirstClassSymbol(symbol) && (roots || !symbol.synthetic) ) { // dump a symbol if it as a class symbol and if either hierarchies are dumped or if it is not a synthetic symbol

			// for the hierarchy we use only the local information
			var symbolAPI = createAPIJSON4Symbol(symbol);

			kind = symbolAPI.kind === 'enum' ? ENUM : symbolAPI.kind;

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

				var hasSettings = symbolAPI["ui5-metadata"];

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
					symbolAPI.constructor.parameters.forEach(function(param, j) {

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
			var ownSubspaces = ( symbol.__ui5.children || [] ).filter(function($) { return $.kind === 'namespace' }).sort(sortByAlias);
			for (var i=0; i<ownSubspaces.length; i++) {
				var member = ownSubspaces[i];
				tag("namespace");
				tag("name", member.name);
				closeTag("namespace");
			}
			*/

			if ( symbolAPI.properties ) {
				symbolAPI.properties.forEach(function(member) {
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
				symbolAPI.events.forEach(function(member) {
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
						member.parameters.forEach(function(param) {

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
				symbolAPI.methods.forEach(function(member) {

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
						attrib("type", member.returnValue.type, 'void');
					}
					if ( member.since ) {
						attrib("since", member.since);
					}

					if ( member.parameters ) {
						member.parameters.forEach(function(param) {

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

	var output = [];

	var rkeywords = /^(?:abstract|as|boolean|break|byte|case|catch|char|class|continue|const|debugger|default|delete|do|double|else|enum|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|is|long|namespace|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|use|var|void|volatile|while|with)$/;

	function isNoKeyword($) { return !rkeywords.test($.name); }

	function isAPI($) { return $.access === 'public' || $.access === 'protected' || !$.access }

	function writeln(args) {
		if ( arguments.length ) {
			for (var i = 0; i < arguments.length; i++)
				output.push(arguments[i]);
		}
		output.push("\n");
	}

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

	function comment($, sMetaType) {

		var s = unwrap($.comment.toString());

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
		if ( !s ) return;

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
		var p = $.params,
			r = [],
			i;
		if ( p ) {
			for (i = 0; i < p.length; i++) {
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
		var r = member.memberof;
		if ( member.scope !== 'static' ) {
			r += ".prototype";
		}
		return (r ? r + "." : "") + member.name;
	}

	var mValues = {
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
		//console.log(member);
		var r = valueForType(member.type || (member.returns && member.returns.length && member.returns[0] && member.returns[0].type && member.returns[0].type));
		if ( r ) {
			return "return " + r + ";";
		}
		return "";
	}

	var sortedSymbols = symbols.slice(0).filter(function($) { return isaClass($) && isAPI($) && !$.synthetic; }).sort(sortByAlias); // sort only a copy(!) of the symbols, otherwise the SymbolSet lookup is broken
	sortedSymbols.forEach(function(symbol) {

		var sMetaType = (symbol.kind === 'member' && symbol.isEnum) ? 'enum' : symbol.kind;
		if ( sMetaType ) {

			writeln("");
			writeln("// ---- " + symbol.longname + " --------------------------------------------------------------------------");
			writeln("");

			var memberId, member;

			var ownProperties = childrenOfKind(symbol, 'property').own.filter(isNoKeyword).sort(sortByAlias);
				if ( sMetaType === "class" ) {
					comment(symbol, sMetaType);
					writeln(symbol.longname + " = function(" + signature(symbol) + ") {};");
				for ( memberId in ownProperties ) {
					member = ownProperties[memberId];
					comment(member, sMetaType);
					writeln(qname(member, symbol) + " = " + value(member));
					writeln("");
				}
				} else if ( sMetaType === 'namespace' || sMetaType === 'enum' ) {
				//console.log("found namespace " + symbol.longname);
				//console.log(ownProperties);
					if ( ownProperties.length ) {
						writeln("// dummy function to make Eclipse aware of namespace");
						writeln(symbol.longname + ".toString = function() { return \"\"; };");
					}
				}

			var ownEvents = childrenOfKind(symbol, 'event').own.filter(isNoKeyword).sort(sortByAlias);
			if ( ownEvents.length ) {
				for ( memberId in ownEvents ) {
					member = ownEvents[memberId];
					comment(member, sMetaType);
					writeln(qname(member, symbol) + " = function(" + signature(member) + ") { " + retvalue(member) + " };");
					writeln("");
				}
			}

			var ownMethods = childrenOfKind(symbol, 'method').own.filter(isNoKeyword).sort(sortByAlias);
			if ( ownMethods.length ) {
				for ( memberId in ownMethods ) {
					member = ownMethods[memberId];
					comment(member, sMetaType);
					writeln(qname(member, symbol) + " = function(" + signature(member) + ") { " + retvalue(member) + " };");
					writeln("");
				}
			}

		}
	});

	writeln("// ---- static fields of namespaces ---------------------------------------------------------------------");

	sortedSymbols.forEach(function(symbol) {

		var sMetaType = (symbol.kind === 'member' && symbol.isEnum) ? 'enum' : symbol.kind;

		if ( sMetaType === 'namespace' || sMetaType === 'enum' ) {

			var ownProperties = childrenOfKind(symbol, 'property').own.filter(isNoKeyword).sort(sortByAlias);
			if ( ownProperties.length ) {
				writeln("");
				writeln("// ---- " + symbol.longname + " --------------------------------------------------------------------------");
				writeln("");

				for (var memberId in ownProperties ) {
					var member = ownProperties[memberId];
					comment(member, sMetaType);
					writeln(qname(member, symbol) + " = " + value(member) + ";");
					writeln("");
				}
			}
		}

	});

	fs.mkPath(path.dirname(filename));
	fs.writeFileSync(filename, output.join(""), 'utf8');
	info("  saved as " + filename);
}

// Description + Settings

function getConstructorDescription(symbol) {
	var description = symbol.description;
	var tags = symbol.tags;
	if ( tags ) {
		for (var i = 0; i < tags.length; i++) {
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
	var result = {
			caption: null,
			example: example
		},
		match = /^\s*<caption>([\s\S]+?)<\/caption>(?:[ \t]*[\n\r]*)([\s\S]+)$/i.exec(example);

	if ( match ) {
		result.caption = match[1];
		result.example = match[2];
	}

	return result;
}

/* ---- exports ---- */

exports.publish = publish;

