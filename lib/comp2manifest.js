"use strict";

var fs = require("fs");
var path = require("path");
var recast = require("recast");
var Syntax = require("esprima").Syntax;
var APIInfo = require("./APIInfo");

var builders = recast.types.builders;

function exists(file) {
	try {
		return fs.statSync(file).isFile();
	} catch (err) {
		return false;
	}
}

function mkdirs(dir) {
	try {
		fs.mkdirSync(dir);
	} catch(err) {
		if ( err.code == "ENOENT" ) {
			var slashIdx = dir.lastIndexOf(path.sep);
			if ( slashIdx > 0 ) {
				var parentPath = dir.substring(0, slashIdx);
				mkdirs(parentPath);
				mkdirs(dir);
			} else {
				throw err;
			}
		} else if ( err.code == "EEXIST" ) {
			return;
		} else {
			throw err;
		}
	}
}

class SapUiDefineCall {
	
	constructor(node, moduleName) {
		this.node = node;
		this.name = moduleName;
		this.dependencyArray = null;
		this.factory = null;
		
		var that = this;
		var args = node.arguments;
		var i=0;
		var params;

		if ( args[i].type === Syntax.Literal ) {
			// assert(String)
			this.name = args[i++].value;
		}

		if ( args[i].type === Syntax.ArrayExpression ) {
			this.dependencyArray = args[i++];
			this.dependencies = this.dependencyArray.elements.map( function ( elem ) {
				if ( elem.type !== Syntax.Literal || typeof elem.value !== 'string' ) {
					throw new Error();
				}
				return resolveName(that.name, elem.value);
			});
			this.dependencyInsertionIdx = this.dependencyArray.elements.length;
		}

		if ( args[i].type === Syntax.FunctionExpression ) {
			this.factory = args[i++];
			params = this.factory.params;
			this.paramNames = params.map( function ( param ) {
				if ( param.type !== Syntax.Identifier ) {
					throw new Error();
				}
				return param.name;
			});
			if ( this.factory.params.length < this.dependencyInsertionIdx ) {
				this.dependencyInsertionIdx = this.factory.params.length;
			}
		}

		// console.log("declared dependencies: " + this.dependencies);
	}

	findDependency(module) {
		var i = this.dependencies.indexOf(module);
		if ( i >= 0 && this.paramNames[i] != null ) {
			return this.paramNames[i];
		}
		return undefined;
	}

	addDependency(module, shortcut) {
		if ( !this.dependencyArray ) {
			// TODO throw new Error("no dependency array"); // TODO create
			console.error("no dependency error");
			return;
		}
		var i = this.dependencyInsertionIdx++;
		this.dependencyArray.elements.splice(i, 0, builders.literal(module));
		this.dependencies.splice(i, 0, module);
		this.factory.params.splice(i, 0, builders.identifier(shortcut));
		this.paramNames.splice(i, 0, shortcut);
	}
	
	removeDependency(module) {
		var i = this.dependencies.indexOf(module);
		if ( i >= 0 ) {
			this.dependencyArray.elements.splice(i, 1);
			this.dependencies.splice(i, 1);
			this.factory.params.splice(i, 1);
			this.paramNames.splice(i, 1);
			this.dependencyInsertionIdx--;
		}
	}
	
	prependStatementToFactory(stmt) {
		if ( this.factory ) {
			var statements = this.factory.body.body;
			var insertionPoint = 0;
			while ( insertionPoint < statements.length && isDirective(statements[insertionPoint]) ) {
				insertionPoint++;
			}
			statements.splice(insertionPoint, 0, stmt);
		}
	}
}

function resolveName(base, name) {
	var stack = base.split('/');
	stack.pop();
	name.split('/').forEach(function(segment, i) {
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

function isDirective(node) {
	return (
		node.type === Syntax.ExpressionStatement
		&& node.expression.type === Syntax.Literal
		&& node.expression.value === 'use strict'
	);
}

function getObjectName(node) {
	if ( node.type == Syntax.MemberExpression ) {
		return getObjectName(node.object) + "." + node.property.name;
	} else if ( node.type == Syntax.Identifier ) {
		return node.name;
	}
}

function getPropertyKey(propertyNode) {
	if ( propertyNode.key.type === Syntax.Identifier ) {
		return propertyNode.key.name;
	} else if ( propertyNode.key.type === Syntax.Literal ) {
		return String(propertyNode.key.value);
	} else {
		throw new TypeError("unhandled type of property key: " + propertyNode.key.type);
	}
}

function findProperty(objectExpressionNode, key) {
	if ( objectExpressionNode != null && objectExpressionNode.type == Syntax.ObjectExpression) {
		return objectExpressionNode.properties.find( (prop) => getPropertyKey(prop) === key );
	}
	return undefined;
}

function findDefineCalls(ast) {
	var results = [];

	recast.visit(ast, {
		visitCallExpression: function(path) {
			//console.log(JSON.stringify(path.value,null,'\t'));
			if ( isSapUiDefineCall(path.value) ) {
				results.push(path);
				return false; // no nested define calls
			}
			this.traverse(path);
		}
	});
	
	return results;
}

var defineCall;
var modified;

function findModule(name) {
	return roots.some(root => {
		// console.log("  checking %s", path.join(root.folder, name + '.js'));
		return exists( path.join(root.folder, name + '.js') );
	});
}

function _toJSON(node) {
	if ( node.type === Syntax.Literal ) {
		return node.value;
	} 
	if ( node.type === Syntax.ArrayExpression ) {
		return node.elements.map(_toJSON);
	}
	if ( node.type === Syntax.ObjectExpression ) {
		let result = {};
		node.properties.forEach( (prop) => {
			let key = getPropertyKey(prop);
			result[key] = _toJSON(prop.value);
		});
		return result;
	}
	throw new TypeError("unhandled type of value:", node.type);
}

function toJSONObject(node) {
	if ( node != null && node.type == Syntax.ObjectExpression ) {
		try {
			return _toJSON(node);
		} catch (e) {
			console.error("couldn't convert to JSON:", e.message);
		}
	}
	return undefined;
}

function toJSONObjectOrString(node) {
	if ( node != null && (node.type == Syntax.ObjectExpression || node.type === Syntax.Literal) ) {
		try {
			return _toJSON(node);
		} catch (e) {
			console.error("couldn't convert to JSON or string:", e.message);
		}
	}
	return undefined;
}

/*
 * Convert static component metadata to a manifest.json, based on the mapping documented
 * https://openui5nightly.hana.ondemand.com/#/topic/e282db2865e94f69972c407469b801e9
 */
function createManifest(componentName, metadataObjectExpressionNode) {
	let manifest = {
		"sap.app": {
			id: componentName.replace(/\.Component$/, ""),
			applicationVersion: {
				version: "1.0.0"
			}
		}
	};

	let manifestMarkerExists = false;
	metadataObjectExpressionNode.properties = metadataObjectExpressionNode.properties.filter( (metadataProp, metadataPropIdx) => {

		let metadataKey = getPropertyKey(metadataProp)
		let metadataValue = metadataProp.value;
		
		if ( metadataKey === "manifest" ) {
			
			if ( metadataValue.type === Syntax.Literal && metadataValue.value === "json" ) {
				manifestMarkerExists = true;
			}

		} else if ( metadataKey === "version" ) {

			if ( metadataValue.type === Syntax.Literal ) {
				manifest["sap.app"].applicationVersion.version = String(metadataValue.value);
				return false; // remove property
			} else {
				console.error("unexpected type of manifest.version property:", metadataValue.type);
			}

		} else if ( metadataKey === "dependencies" ) {

			if ( metadataValue.type === Syntax.ObjectExpression ) {
				let hasError = false;
				metadataValue.properties.forEach( (prop) => {
					let key = getPropertyKey(prop);
					if ( key === "ui5version" ) {
						if ( prop.value.type === Syntax.Literal ) {
							manifest["sap.ui5"] = manifest["sap.ui5"] || {};
							manifest["sap.ui5"].minUI5Version = String(prop.value.value);
						} else {
							console.error("unexpected type of dependencies.ui5version:", prop.value.type);
							hasError = true;
						}
					} else if ( key === "libs" ) {
						if ( prop.value.type === Syntax.ArrayExpression ) {
							prop.value.elements.forEach( (elem,idx) => {
								if ( elem.type === Syntax.Literal ) {
									manifest["sap.ui5"] = manifest["sap.ui5"] || {};
									manifest["sap.ui5"].libs = {};
									manifest["sap.ui5"].libs[elem.value] = {};
								} else {
									console.error("unexpected type of dependencies.libs entry", idx, ":", elem.type);
									hasError = true;
								}
							});
						} else {
							console.error("unexpected type of dependencies.libs:", prop.value.type);
							hasError = true;
						}
					} else if ( key === "components" ) {
						if ( prop.value.type === Syntax.ArrayExpression ) {
							prop.value.elements.forEach( (elem,idx) => {
								if ( elem.type === Syntax.Literal ) {
									manifest["sap.ui5"] = manifest["sap.ui5"] || {};
									manifest["sap.ui5"].components = {};
									manifest["sap.ui5"].components[elem.value] = {};
								} else {
									console.error("unexpected type of dependencies.components entry", idx, ":", elem.type);
									hasError = true;
								}
							});
						} else {
							console.error("unexpected type of dependencies.components:", prop.value.type);
							hasError = true;
						}
					} else {
						console.error("unhandled dependencies property:", key);
						hasError = true;
					}
				});
				if ( !hasError ) {
					return false;
				}

			} else {
				console.error("unexpected type of dependencies in static metadata:", metadataValue.type);
			}
		} else if ( metadataKey === "config" ) {

			let json = toJSONObject(metadataValue);
			if ( json != null ) {
				// the newly created manifest.json must be added to the list of sample files (for the download)
				if ( typeof json.sample === "object" && Array.isArray(json.sample.files) && json.sample.files.indexOf("manifest.json") < 0 ) {
					json.sample.files.push("manifest.json");
				}
				manifest["sap.ui5"] = manifest["sap.ui5"] || {};
				manifest["sap.ui5"].config = json;
				return false;
			} else {
				console.error("unhandled kind of config metadata:", metadataValue.type);
			}

		} else if ( metadataKey === "customizing" ) {

			let json = toJSONObject(metadataValue);
			if ( json != null ) {
				manifest["sap.ui5"] = manifest["sap.ui5"] || {};
				manifest["sap.ui5"].extends = manifest["sap.ui5"].extends || {};
				manifest["sap.ui5"].extends.extensions = json;
				return false;
			} else {
				console.error("unhandled kind of customizing metadata:", metadataValue.type);
			}

		} else if ( metadataKey === "handleValidation" ) {

			if ( metadataValue.type === Syntax.Literal && typeof metadataValue.value === "boolean" ) {
				manifest["sap.ui5"] = manifest["sap.ui5"] || {};
				manifest["sap.ui5"].handleValidation = metadataValue.value;
				return false;
			} else {
				console.error("unhandled type of metadata.handleValidation:", metadataValue.type);
			}

		} else if ( metadataKey === "includes" ) {

			if ( metadataValue.type === Syntax.ArrayExpression ) {
				let hasError = false;
				metadataValue.elements.forEach( (elem,idx) => {
					if ( elem.type === Syntax.Literal ) {
						let url = String(elem.value);
						if ( url.endsWith(".js") ) {
							manifest["sap.ui5"] = manifest["sap.ui5"] || {};
							manifest["sap.ui5"].resources = manifest["sap.ui5"].resources || {};
							manifest["sap.ui5"].resources.js = manifest["sap.ui5"].resources.js || [];
							manifest["sap.ui5"].resources.js.push({url});
						} else if ( url.endsWith(".css") ) {
							manifest["sap.ui5"] = manifest["sap.ui5"] || {};
							manifest["sap.ui5"].resources = manifest["sap.ui5"].resources || {};
							manifest["sap.ui5"].resources.css = manifest["sap.ui5"].resources.css || [];
							manifest["sap.ui5"].resources.css.push({url});
						} else {
							console.error("unexpected type of URL for metdata.includes", idx, ":", url);
							hasError = true;
						}
					} else {
						console.error("unexpected type of metadata.includes entry", idx, ":", elem.type);
						hasError = true;
					}
				});
				if ( !hasError ) {
					return false;
				}
			} else {
				console.error("unhandled type of metadata.includes:", metadataValue.type);
			}

		} else if ( metadataKey === "rootView" ) {
			
			let json = toJSONObjectOrString(metadataValue);
			if ( json != null ) {
				manifest["sap.ui5"] = manifest["sap.ui5"] || {};
				manifest["sap.ui5"].rootView = json;
				return false;
			} else {
				console.error("unhandled type of rootView configuration:", metadataValue.type);
			}

		} else if ( metadataKey === "routing" ) {
			
			let json = toJSONObject(metadataValue);
			if ( json != null ) {
				manifest["sap.ui5"] = manifest["sap.ui5"] || {};
				manifest["sap.ui5"].routing = json;
				return false;
			} else {
				console.error("unhandled kind of routing metadata:", metadataValue.type);
			}

		} else {

			console.error("unhandled metadata property:", metadataKey);

		}

		return true; // keep

	});

	if ( !manifestMarkerExists ) {
		metadataObjectExpressionNode.properties.push(
			builders.property(
				"init",
				builders.identifier("manifest"),
				builders.literal("json")
			)
		);
	}

	return manifest;
}

function migrateComponentMetadata(ast, moduleName, fileName) {
	
	defineCall = null;
	modified = false;
	
	//console.log(JSON.stringify(ast,null,'\t'));
	var defineCalls = findDefineCalls(ast);
	if ( defineCalls.length !== 1 ) {
		console.log("can't handle files with no or multiple UI5 modules");
		return ast;
	}

	defineCall = new SapUiDefineCall( defineCalls[0].value, moduleName );
	
	const uiComponentImportName = defineCall.findDependency("sap/ui/core/UIComponent");
	const componentImportName = defineCall.findDependency("sap/ui/core/Component");

	if ( defineCall.factory ) {
		recast.visit(defineCall.factory.body, {
			visitCallExpression: function(nodePath) {
				let call = nodePath.value;
				if ( isExtendCall(call) 
					 && call.callee.object.type === Syntax.Identifier 
					 && (call.callee.object.name === uiComponentImportName || call.callee.object.name === componentImportName) ) {
					let componentName = call.arguments[0].value; // string literal
					let metadata = findProperty(call.arguments[1], "metadata");
					if ( metadata ) {
						if ( metadata.value.type === Syntax.ObjectExpression ) {
							console.log("  found static component metadata", componentName, metadata.value.properties.map(getPropertyKey));
							let metadataPath = nodePath.get("arguments", 1).get("properties", call.arguments[1].properties.indexOf(metadata));
							let manifest = createManifest(componentName, metadata.value);
							let manifestFile = path.join(path.dirname(fileName), "manifest.json");
							console.log("  writing new manifest to ", manifestFile);
							if ( !previewOnly ) {
								if ( !fs.existsSync(manifestFile) ) {
									fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, "\t"), "UTF-8");
									modified = true;
								} else {
									console.error("  manifest exists already, do not overwrite, don't modify Component.js");
								}
							}
							//nodePath.replace(builders.literal("json"));
							//return false;
						} else {
							console.error("  unexpected type of component metdata:", metadata.value.type);
						}
					}
				}
				this.traverse(nodePath);
			}
		});
	}
	
	return ast;
}

function processFile(filename, moduleName) {
	console.log(filename + ":");
	try {
		var code = fs.readFileSync(filename);
		var ast = recast.parse(code);
		var modifiedProgram = migrateComponentMetadata(ast, moduleName, filename);
		if ( !modified ) {
			// console.log("  no changes");
			return;
		}
		var targetFile = filename;
		if ( targetFolder ) {
			if ( targetFolderPrefix && moduleName.slice(0, targetFolderPrefix.length) === targetFolderPrefix ) {
				targetFile = path.join(targetFolder, moduleName.slice(targetFolderPrefix.lengt) + '.js');
			} else {
				targetFile = path.join(targetFolder, moduleName + '.js');
			}
		}
		if ( previewOnly ) {
		} else {
			//console.log(ast.program.body[0].expression.loc.lines);
			console.log("  -> %s", targetFile);
			var modifiedCode = recast.print(modifiedProgram, {lineTerminator: "\n", useTabs: true}).code;
			if ( targetFile.lastIndexOf('/') > 0 ) {
				mkdirs( targetFile.slice(0, targetFile.lastIndexOf('/')) );
			}
			fs.writeFileSync(targetFile, modifiedCode);
		}
	} catch (err) {
		console.error("error while processing %s:", moduleName, err);
	}
	console.log();
}

/*
 - collect dependencies and replace declare / require (top level) / iife with sap.ui.define
 - convert global access to dependencies
   - how to decide between global dep, sap.ui.require and others?
   - requires knowledge about module exports and global names (what global is exposed by what module under what name?)
 */

function processFileOrDir(fileOrDir, name) {
	// console.log("visiting " + fileOrDir + " (" + name + ")");
	if ( fs.statSync(fileOrDir).isDirectory() ) {
		if ( name && name.slice(-1) !== '/' ) {
			name = name + '/';
		}
		var files = fs.readdirSync(fileOrDir);
		files.forEach(function(file) {
			processFileOrDir(path.join(fileOrDir, file), name + file);
		});
	} else if ( /(?:^|\/)Component\.js$/.test(fileOrDir) ) {
		processFile(fileOrDir, name.slice(0, -3));
	}
}

function help() {
	console.log("Convert static component metadata from a Component.js to a manifest.json")
	console.log("Usage:");
	console.log("  node comp2manifest.js [-prefix <prefix>] [-preview] <src>");
}

var args = process.argv.slice(2);
var currentPrefix = '';
var targetFolder;
var targetFolderPrefix;
var previewOnly;
var roots = [];

for ( var arg = 0; arg < args.length; arg++) {
	switch ( args[arg] ) {
	case '-api':
		APIInfo.setRoot( args[++arg] );
		break;
	case '-root':
		roots.push({ folder: args[++arg], prefix: currentPrefix, process: false });
		break;
	case '-prefix':
		currentPrefix = args[++arg];
		if ( currentPrefix && currentPrefix.slice(-1) !== '/' ) {
			currentPrefix = currentPrefix + '/';
		} else if ( currentPrefix === '/' ) {
			currentPrefix = '';
		}
		break;
	case '-d':
		targetFolder = args[++arg];
		break;
	case '-outPrefix':
		targetFolderPrefix = args[++arg];
		break;
	case '-preview':
		previewOnly = true;
		break;
	default:
		if ( /^-/.test(args[arg]) ) {
			console.error("unknown option " + args[arg]);
			help();
			throw new Error();
		}
		roots.push({ folder: args[arg], prefix: currentPrefix, process: true });
		break;
	}
}

roots.forEach( root => {
	if ( root.process ) {
		processFileOrDir(root.folder, root.prefix);
	}
});


/*
 
  simple task 1: convert declare +require to sap.ui.define
  - replace declare with sap.ui.define
  - if no sap.ui.define and no juqery.sap.declare, add a sap.ui.define
  - for each unconditional, immediately executed jquery.sap.require add a dependency to sap.ui.define, remove the call
  
  simple task 2: convert globals to dependencies
 
 */
