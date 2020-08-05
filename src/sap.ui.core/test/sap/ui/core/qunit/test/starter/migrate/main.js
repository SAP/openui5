/*global esprima, JSZip, URI */
/*eslint-env es6*/
/*eslint no-cond-assign: 1, max-nested-callbacks: [2,4] */
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/merge",
	"sap/base/strings/capitalize",
	"sap/ui/core/Item",
	"sap/ui/test/starter/_utils",
	"../find/discovery"
], function(Log, merge, capitalize, Item, testStarterUtils, discovery) {
	"use strict";

	function toBoolean(str) {
		if ( str === "true" ) {
			return true;
		}
		if ( str === "false" ) {
			return true;
		}
	}

	function toString(str) {
		return typeof str === "string" ? str : undefined;
	}

	function toJSON(str) {
		try {
			return JSON.parse(str);
		} catch (e) {
			// ignore
		}
	}

	function nonEmpty(obj) {
		if ( obj == null ) {
			return undefined;
		}
		obj = JSON.parse(JSON.stringify(obj));
		return Object.keys(obj).length > 0 ? obj : undefined;
	}

	function normalizeIndent(str, tabWidth) {
		tabWidth = tabWidth || 4;
		let useTabs = true;
		let indent = 0;
		let p = 0;
		while (p < str.length) {
			let c = str.charAt(p++);
			if (c === "\t") {
				indent += tabWidth - (indent % tabWidth);
			} else if (c === " ") {
				indent++;
			} else {
				p--;
				break;
			}
		}

		let result = "";
		if (useTabs) {
			while (indent >= tabWidth) {
				result += "\t";
				indent -= tabWidth;
			}
		}
		while (indent > 0) {
			result += " ";
			indent--;
		}

		if (result !== str.slice(0, p)) {
			return result + str.slice(p);
		}
		return str;
	}

	function unindent(text) {
		var lines = text.split(/\r\n|\r|\n/);
		if ( lines.length > 0 ) {
			let first = 0;
			while ( !lines[first].trim() && first < lines.length ) {
				first++;
			}
			if ( first < lines.length ) {
				let indent = /^[ \t]*/.exec( normalizeIndent(lines[first]) )[0];
				indent = lines.reduce((indent, line) => {
					if ( line.trim() ) {
						line = normalizeIndent(line);
						while ( indent.length && !line.startsWith(indent) ) {
							indent = indent.slice(0, -1);
						}
					}
					return indent;
				}, indent);
				if ( indent ) {
					return lines.map((line) => line.trim() ? normalizeIndent(line).slice(indent.length) : "").join("\n");
				}
			}
		}
		return text;
	}

	// private function taken from jquery.sap.global
	function ui5ToRJS(sName) {
		if ( /^jquery\.sap\./.test(sName) ) {
			return sName;
		}
		return sName.replace(/\./g, "/");
	}

	function getTestResourceName(jsURL) {
		if ( !jsURL.startsWith("/test-resources/") ) {
			 // cut of leading empty segment and app name
			jsURL = jsURL.slice( jsURL.indexOf("/", 1));
		}
		if ( jsURL.startsWith("/") ) {
			jsURL = jsURL.slice(1);
		}
		return jsURL;
	}

	function extractSuiteInfo(sPageURL, skipTitle) {
		let sRootPath = "/";
		let sResourceName = sPageURL.replace(/\.html$/, "");
		if ( !sResourceName.startsWith("/test-resources/") ) {
			 // cut of leading empty segment and app name
			sRootPath = sResourceName.slice(0, sResourceName.indexOf("/", 1)) + sRootPath;
			sResourceName = sResourceName.slice( sResourceName.indexOf("/", 1));
		}
		if ( sResourceName.startsWith("/") ) {
			sResourceName = sResourceName.slice(1);
		}
		let segments = sResourceName.split("/");
		let count = segments.length;
		let baseRef = "";
		while ( --count > 0 ) {
			baseRef += "../";
		}

		let suitePageInfo = {
			url: sPageURL,
			rootPath: sRootPath,
			baseRef,
			resourceName: sResourceName,
			shortName: sResourceName.slice(sResourceName.lastIndexOf('/') + 1)
		};

		if ( skipTitle ) {
			return Promise.resolve(suitePageInfo);
		}

		return Promise.resolve(
			jQuery.ajax({
				url: sPageURL,
				dataType: "text"
			})
		).then( function(data) {
			const oParser = new DOMParser();
			const dom = oParser.parseFromString(data, "text/html");
			suitePageInfo.title = jQuery("head>title", dom).text() || undefined;
			return suitePageInfo;
		});
	}

	const rRequire = /sap\.ui\.require\s*\(\s*\[([^]*)\]\s*,\s*function\(\)/;
	const rQUnitConfig = /QUnit\.config\.([a-zA-Z]+)\s*=\s*([^;]+);/g;
	const rSinonConfig = /sinon\.config\.([a-zA-Z]+)\s*=\s*([^;]+);/g;

	function escapeLiteral(str) {
		if ( str == null ) {
			return "";
		}
		return str.replace(/\\/g, "\\\\").replace(/\t/, "\\t").replace(/\n/, "\\n").replace(/"/g, "\\\"");
	}

	function getSimpleDOM(elem) {
		if ( elem.children.length > 0 ) {
			return undefined;
		}
		let info = {
			tag: elem.nodeName,
			id: undefined,
			attr: [],
			text: elem.textContent
		};
		for ( let i = 0; i < elem.attributes.length; i++ ) {
			let attr = elem.attributes[i];
			if ( attr.name === 'id' ) {
				info.id = attr.value;
			} else {
				info.attr.push({
					name: attr.name,
					value: attr.value
				});
			}
		}

		return info;
	}

	function addScriptForSimpleDOM(code, info, prepend) {
		let necessaryModifications = 0;
		let creator;
		let modifier = "";

		// determine number of necessary modifications of the created DOM element
		if ( info.id !== null && info.tag !== "DIV" ) {
			necessaryModifications++;
			modifier = ".setAttribute(\"id\", \"" + escapeLiteral(info.id) + "\")";
		}
		if ( info.textContent ) {
			necessaryModifications++;
			modifier = ".textContent = \"" + escapeLiteral(info.textContent) + "\"";
		}
		if ( info.attr.length > 0 ) {
			necessaryModifications += info.attr.length;
			modifier = ".setAttribute(\"" + escapeLiteral(info.attr[0].name) + "\", \"" + escapeLiteral(info.attr[0].value) + "\")";
		}

		if (necessaryModifications <= 1 ) {
			if ( info.tag === 'DIV' && info.id ) {
				creator = "createAndAppendDiv(\"" + escapeLiteral(info.id) + "\")";
			} else {
				creator = "document.createElement(\"" + info.tag + "\")";
			}
		} else {
			code.push("(function(){");
			code.push("\tvar elem = document.createElement(\"" + info.tag + "\");");
			if ( info.id ) {
				code.push("\telem.setAttribute(\"id\", \"" + escapeLiteral(info.id) + "\");");
			}
			info.attr.forEach(({name,value}) => {
				code.push("\telem.setAttribute(\"" + name + "\", \"" + escapeLiteral(value) + "\");");
			});
			creator = "elem";
			modifier = "";
		}
		if ( prepend ) {
			code.push("document.body.insertBefore(" + creator + ", document.body.firstChild)" + modifier + ";");
		} else if ( /createAndAppendDiv/.test(creator) ) {
			code.push(creator + modifier + ";");
		} else {
			code.push("document.body.appendChild(" + creator + ")" + modifier + ";");
		}
		if ( necessaryModifications > 1 ) {
			code.push("}());");
		}
	}

	function isTestLauncherScript(test, script, bAutostartDisabled) {

		let lines = script.split(/\r\n|\r|\n/).length;
		if ( lines > 20 || !rRequire.test(script) || !bAutostartDisabled ) {
			return false;
		}

		let Syntax = esprima.Syntax;
		let ast;
		try {
			ast = esprima.parse(script);
		} catch (err) {
			return false;
		}

		if ( ast.type !== Syntax.Program ) {
			return false;
		}

		let bDisableAutoStart = false;
		let bRequire = false;
		let bStartQUnit = false;
		let unknown = [];

		function isNamedObject(node, objectPath) {
			let length = objectPath.length;
			while ( length > 1
					&& node.type == Syntax.MemberExpression
					&& node.property.type === Syntax.Identifier
					&& node.property.name === objectPath[length - 1] ) {
				node = node.object;
				length--;
			}
			return length == 1 && node.type === Syntax.Identifier && node.name === objectPath[0];
		}

		function checkForRequireAndStart(call) {
			if ( isNamedObject(call.callee, ["sap","ui","require"]) ) {
				bRequire = true;
				let args = call.arguments,
					arg = 0;
				if ( arg < args.length && args[arg].type === Syntax.ArrayExpression ) {
					test.module = test.module || [];
					args[arg++].elements.forEach( (el) => test.module.push(el.value) );
				}
				if ( arg < args.length && args[arg].type === Syntax.FunctionExpression ) {
					let callback = args[arg++];
					callback.body.body.forEach( (stmt) => {
						if ( stmt.type === Syntax.ExpressionStatement
							 && stmt.expression.type === Syntax.CallExpression
							 && isNamedObject(stmt.expression.callee, ["QUnit","start"]) ) {
							bStartQUnit = true;
						} else {
							unknown.push(stmt);
						}
					});
				}
				return true;
			}
		}

		ast.body.forEach( (stmt) => {
			if ( stmt.type === Syntax.ExpressionStatement
				 && stmt.expression.type === Syntax.AssignmentExpression
				 && isNamedObject(stmt.expression.left, ["QUnit","config","autostart"])
				 && stmt.expression.right.type === Syntax.Literal
				 && typeof stmt.expression.right.value === "boolean" ) {

				// QUnit.config.autostart = false
				bDisableAutoStart = !stmt.expression.right.value;

			} else if ( stmt.type === Syntax.ExpressionStatement
				 && stmt.expression.type === Syntax.AssignmentExpression
				 && isNamedObject(stmt.expression.left, ["sinon","config","useFakeTimers"])
				 && stmt.expression.right.type === Syntax.Literal
				 && typeof stmt.expression.right.value === "boolean" ) {

				// sinon.config.autostart = false
				//bUseFakeTimers = !stmt.expression.right.value;
				test.sinon = test.sinon || {};
				test.sinon.bUseFakeTimers = !stmt.expression.right.value;

			} else if ( stmt.type === Syntax.ExpressionStatement
				 && stmt.expression.type === Syntax.CallExpression
				 && stmt.expression.callee.type === Syntax.MemberExpression
				 && stmt.expression.callee.object.type === Syntax.CallExpression
				 && isNamedObject(stmt.expression.callee.object.callee, ["sap","ui","getCore"])
				 && stmt.expression.callee.property.type === Syntax.Identifier
				 && stmt.expression.callee.property.name === "attachInit" // attachInitEvent?
				 && stmt.expression.arguments.length === 1
				 && stmt.expression.arguments[0].type === Syntax.FunctionExpression ) {

				// bWaitForCore
				stmt.expression.arguments[0].body.body.forEach( (stmt2) => {
					if ( stmt2.type === Syntax.ExpressionStatement
						 && stmt2.expression.type === Syntax.CallExpression
						 && checkForRequireAndStart(stmt2.expression) ) {
						// ignore
					} else {
						unknown.push(stmt);
					}
				});

			} else if ( stmt.type === Syntax.ExpressionStatement
					&& stmt.expression.type === Syntax.CallExpression
					&& checkForRequireAndStart(stmt.expression) ) {
				// nothing to do in addition
			} else {
				unknown.push(stmt);
			}
		});

		if ( bDisableAutoStart && bRequire && bStartQUnit ) {
			if ( unknown.length === 0 ) {
				return true;
			}
			Log.info("Inline script seems to require and launch tests, but contains unrecogized additional code: ", unknown);
		}
		return false;
	}

	function isQUnitLauncherScript(test, script, bAutostartDisabled) {

		let Syntax = esprima.Syntax;
		let ast;
		try {
			ast = esprima.parse(script);
		} catch (err) {
			return false;
		}

		if ( ast.type !== Syntax.Program ) {
			return false;
		}

		function isNamedObject(node, objectPath) {
			let length = objectPath.length;
			while ( length > 1
					&& node.type == Syntax.MemberExpression
					&& node.property.type === Syntax.Identifier
					&& node.property.name === objectPath[length - 1] ) {
				node = node.object;
				length--;
			}
			return length == 1 && node.type === Syntax.Identifier && node.name === objectPath[0];
		}

		let unknown = [];

		ast.body.forEach( (stmt) => {
			if ( stmt.type === Syntax.ExpressionStatement
				 && stmt.expression.type === Syntax.CallExpression
				 && isNamedObject(stmt.expression.callee, ["jQuery","sap","require"])
				 && stmt.expression.arguments.length === 1
				 && stmt.expression.arguments[0].type === Syntax.Literal
				 && typeof stmt.expression.arguments[0].value === "string" ) {

				let module = ui5ToRJS(stmt.expression.arguments[0].value);
				if ( module === "sap/ui/thirdparty/qunit"
					 || module === "sap/ui/thirdparty/qunit-2"
					 || module === "sap/ui/thirdparty/qunit-sinon"
					 || module === "sap/ui/qunit/qunit-css"
					 || module === "sap/ui/qunit/qunit-2-css"
					 || module === "sap/ui/qunit/qunit-junit"
					 || module === "sap/ui/qunit/qunit-coverage" ) {
					// do nothing
				} else {
					unknown.push(module);
				}
			} else {
				unknown.push(stmt);
			}
		});

		if ( unknown.length === 0 ) {
			return true;
		}
		//Log.info("Inline script contains unrecogized additional code: ", unknown);
		return false;
	}

	var regexps = {};
	function cleanupTestScript(test,script) {
		function removeRequire(name) {
			let r = regexps["1" + name] || (regexps["1" + name] = new RegExp("[ \\t]*jQuery\\.sap\\.require\\(\\s*['\"]" + name.replace(/\//g, "\\.") + "['\"]\\);?[ \\t]*", "g"));
			if ( r.test(script) ) {
				script = script.replace(r, "");
			}
			r = regexps["2" + name] || (regexps["2" + name] = new RegExp("[ \\t]*sap\\.ui\\.requireSync\\(\\s*['\"]" + name + "['\"]\\);?[ \\t]*", "g"));
			if ( r.test(script) ) {
				script = script.replace(r, "");
			}
		}
		if ( removeRequire("sap/ui/thirdparty/qunit") ) {
			// ignore
		}
		if ( removeRequire("sap/ui/thirdparty/qunit-2") ) {
			// ignore
		}
		if ( removeRequire("sap/ui/thirdparty/sinon") ) {
			// ignore
		}
		if ( removeRequire("sap/ui/thirdparty/sinon-4") ) {
			// ignore
		}
		removeRequire("sap/ui/thirdparty/sinon-qunit");
		removeRequire("sap/ui/qunit/qunit-css");
		removeRequire("sap/ui/qunit/qunit-2-css");
		removeRequire("sap/ui/qunit/qunit-junit");
		removeRequire("sap/ui/qunit/qunit-coverage");
		removeRequire("sap/ui/qunit/sinon-qunit-bridge");

		script = script.replace(rQUnitConfig, function($0, option, value) {
			try {
				eval("value = " + value); // eslint-disable-line no-eval
			} catch (e) {
				// ignore
			}
			if ( option !== "autostart" || value !== false ) {
				test.qunit = test.qunit || {};
				test.qunit[option] = value;
			}
			return "";
		});

		script = script.replace(rSinonConfig, function($0, option, value) {
			try {
				eval("value = " + value); // eslint-disable-line no-eval
			} catch (e) {
				// ignore
			}
			if ( option !== "autostart" || value !== false ) {
				test.sinon = test.sinon || {};
				test.sinon[option] = value;
			}
			return "";
		});

		let r = /[ \t]*sap\.ui\.test\.qunit\.delayTestStart\(\);?[ \t]*/g;
		if ( r.test(script) ) {
			script = script.replace(r, "");
		}
		r = /[ \t]*QUnit.start\(\);?[ \t]*/g;
		if ( r.test(script) ) {
			script = script.replace(r, "");
		}

		return script;
	}

	function injectCode({script, bImportsQUtils, uiAreas, uiAreasBeforeQUnit, embeddedData, styles}) {
		let codeToInject = [];
		if ( bImportsQUtils ) {
			Log.info("Adding import for QUnitUtils");
			codeToInject.push("jQuery.sap.require(\"sap.ui.qunit.QUnitUtils\");");
			bImportsQUtils = false;
		}
		if ( uiAreas.length > 0 ) {
			codeToInject.push("jQuery.sap.require(\"sap.ui.qunit.utils.createAndAppendDiv\");");
			codeToInject.push("var createAndAppendDiv = sap.ui.require(\"sap/ui/qunit/utils/createAndAppendDiv\");");
			if ( uiAreasBeforeQUnit > 0 ) {
				uiAreas.splice(0, uiAreasBeforeQUnit).reverse().forEach( (uiArea) => {
					addScriptForSimpleDOM(codeToInject, uiArea, /* prepend */ true);
				});
			}
			uiAreas.forEach( (uiArea) => {
				addScriptForSimpleDOM(codeToInject, uiArea, /* prepend */ false);
			});
			uiAreas = [];
		}
		if ( styles.length > 0 ) {
			styles = [].concat(...styles.map((style) => style.split(/\r\n|\r|\n/)));
			codeToInject.push("var styleElement = document.createElement(\"style\");");
			codeToInject.push("styleElement.textContent =");
			styles.forEach( (line, idx) => {
				codeToInject.push("\t\"" + line.replace(/"/g, "\\\"") + "\"" + (idx + 1 < styles.length ? " +" : ";"));
			});
			codeToInject.push("document.head.appendChild(styleElement);");
			styles = [];
		}
		if ( embeddedData.length > 0 ) {
			embeddedData.forEach(({id,content}) => {
				codeToInject.push("var s" + capitalize(id) + " =");
				content.split(/\r\n|\r|\n/).forEach( (line, idx, lines) => {
					codeToInject.push("\t\"" + line.replace(/"/g, "\\\"") + "\"" + (idx + 1 < lines.length ? " +" : ";"));
				});
				script = script.replace(new RegExp("jQuery\\('#" + id + "'\\)\\.html\\(\\)", "g"), "s" + capitalize(id));
				script = script.replace(new RegExp("document\\.scripts\\." + id + "\\.innerHTML", "g"), "s" + capitalize(id));
			});
			embeddedData = [];
		}

		if ( codeToInject.length > 0 ) {
			codeToInject.push("", "");
			let snippet = codeToInject.join("\n");
			let m = /['"]use strict['"];?[ \t]*(?:\r\n|\r|\n)/.exec(script);
			if ( m ) {
				let p = m.index + m[0].length;
				script = script.slice(0, p) + snippet + script.slice(p);
			} else {
				script = snippet + script;
			}
		}

		return {script, bImportsQUtils, uiAreas, uiAreasBeforeQUnit, embeddedData, styles};
	}

	function postprocessScript(script, newlyExternalized) {
		let globalsToAdd = [];
		if ( /QUnit/.test(script) && !/\/\*\s*global\s+[^*]*QUnit/.test(script) ) {
			globalsToAdd.push("QUnit");
		}
		if ( /sinon/.test(script) && !/\/\*\s*global\s+[^*]*sinon/.test(script) ) {
			globalsToAdd.push("sinon");
		}
		if ( newlyExternalized ) {
			script = "/*eslint no-undef:1, no-unused-vars:1, strict: 1 */\n" + script;
		}
		if ( globalsToAdd.length > 0 ) {
			script = "/*global " + globalsToAdd.join(", ") + " */\n" + script;
		}
		return script;
	}

	var oArchive = new JSZip();

	function collectTestInfos(suitePageInfo, aTests, sSuiteURL) {
		var testNames = Object.create(null);
		function uniqueName(testName) {
			if ( testName.search(/[?#]/) >= 0 ) {
				testName = testName.slice(0, testName.search(/[?#]/)); // cut off
			}
			if ( /\.html$/.test(testName) ) {
				testName = testName.slice(0, -5);
			}
			if ( /\.qunit$/.test(testName) ) {
				testName = testName.slice(0, -6);
			}
			if ( testName in testNames ) {
				var i = 2;
				while ( testName + i in testNames ) {
					i++;
				}
				testName = testName + i;
			}
			testNames[testName] = true;
			return testName;
		}

		aTests = aTests.filter((url) => !url.includes("resources/sap/ui/test/starter/Test.qunit.html"));

		aTests = aTests.sort().map( (url) => ({
			page: new URI(url, sSuiteURL).toString()
		}) );

		// find and cut off common prefix
		var prefix = aTests.reduce((prefix, test) => {
			// calculate name relative to the testsuite page
			let relativeName = new URI(test.page).relativeTo(new URI(sSuiteURL)).toString();
			if ( !relativeName.startsWith("../") ) {
				if ( prefix == null ) {
					return test.page;
				}
				while ( prefix.length && !test.page.startsWith(prefix) ) {
					prefix = prefix.slice(0, -1);
				}
			} else {
				test.name = relativeName;
			}
			return prefix;
		}, null);
		aTests.forEach( (test) => {
			test.name = uniqueName(test.name || test.page.slice(prefix.length));
		});

		return Promise.all(
			aTests.map((test) => {
				return Promise.resolve(
					jQuery.ajax({
						url: test.page,
						dataType: "text"
					})
				).then( function(data) {
					var oParser = new DOMParser();
					var dom = oParser.parseFromString(data, "text/html");

					// Title
					var pageTitle = jQuery("head>title", dom).text().trim();
					var qunitHeaderTitle = jQuery("#qunit-header", dom).text().trim();
					if ( pageTitle || qunitHeaderTitle ) {
						test.title = pageTitle || qunitHeaderTitle;
					}
					if ( pageTitle && qunitHeaderTitle && pageTitle.toLowerCase() !== qunitHeaderTitle.toLowerCase() ) {
						test._alternativeTitle = qunitHeaderTitle;
					}

					var $bootstrap = jQuery("#sap-ui-bootstrap", dom);
					test.ui5 = {};
					test.ui5.libs = toString($bootstrap.attr("data-sap-ui-libs"));
					test.ui5.noConflict = toBoolean($bootstrap.attr("data-sap-ui-noConflict"));
					test.ui5.theme = toString($bootstrap.attr("data-sap-ui-theme"));
					test.ui5.preload = toString($bootstrap.attr("data-sap-ui-preload") || $bootstrap.attr("data-sap-ui-xx-preload"));
					test.ui5.language = toString($bootstrap.attr("data-sap-ui-language"));
					test.loader = {};
					var mResourceRoots = toJSON($bootstrap.attr("data-sap-ui-resourceroots"));
					if ( mResourceRoots ) {
						test.loader.paths = {};
						for ( let sNamePrefix in mResourceRoots ) {
							var sURL = new URI(mResourceRoots[sNamePrefix], new URI(test.page).search("").fragment("")).relativeTo(suitePageInfo.rootPath).toString();
							test.loader.paths[ui5ToRJS(sNamePrefix)] = sURL;
						}
					 }
					if ( /sap-ui-core\.js$/.test($bootstrap.attr("src")) || /sap\.ui\.getCore\(\)\.attachInit(?:Event)?/.test(data) ) {
						test.bootCore = true;
					}
					if ( /sap[\/.]ui[\/.]thirdparty[\/.]qunit-2/.test(data) ) {
						test.qunit = {
							version: 2
						};
					} else {
						test.qunit = {
							version: 1
						};
					}
					if ( /sap[\/.]ui[\/.]thirdparty[\/.]sinon['".]/.test(data) ) {
						test.sinon = {
							version: 1
						};
						if ( /sap[\/.]ui[\/.]thirdparty[\/.]sinon-qunit['".]/.test(data) ) {
							test.sinon.qunitBridge = true;
						}
					} else if ( /sap[\/.]ui[\/.]thirdparty[\/.]sinon-4['".]/.test(data) ) {
						test.sinon = {
							version: 4
						};
						if ( /sap[\/.]ui[\/.]qunit[\/.]sinon-qunit-bridge['".]/.test(data) ) {
							test.sinon.qunitBridge = true;
						}
					}
					var m;
					if ( m = rRequire.exec(data) ) {
						let deps = m[1].trim().split(/\s*,\s*/).map( (dep) => {
							if ( /^(?:'.*'|".*")$/.test(dep) ) {
								return dep.slice(1,-1);
							}
							return dep;
						});
						if ( deps.every( (dep) => /\.qunit$/.test(dep)) ) {
							test.module = test.module || [];
							deps.forEach( (dep) => {
								if ( test.module.indexOf(dep) < 0 ) {
									test.module.push(dep);
								}
							});
						}
					}

					let bAutostartDisabled = false;
					rQUnitConfig.lastIndex = 0;
					while ( m = rQUnitConfig.exec(data) ) {
						let option = m[1];
						let value;
						try {
							eval("value = " + m[2]); // eslint-disable-line no-eval
						} catch (e) {
							value = m[2];
						}
						if ( option === "autostart" && value === false ) {
							bAutostartDisabled = true;
							continue;
						}
						test.qunit = test.qunit || {};
						test.qunit[option] = value;
					}

					rSinonConfig.lastIndex = 0;
					while ( m = rSinonConfig.exec(data) ) {
						let option = m[1];
						let value;
						try {
							eval("value = " + m[2]); // eslint-disable-line no-eval
						} catch (e) {
							value = m[2];
						}
						test.sinon = test.sinon || {};
						test.sinon[option] = value;
					}

					let $coverOnly = jQuery("[data-sap-ui-cover-only]");
					if ( $coverOnly.length > 0 ) {
						test.coverage = test.coverage || {};
						test.coverage.only = toString($coverOnly.attr("data-sap-ui-cover-only"));
					}
					let $coverNever = jQuery("[data-sap-ui-cover-never]");
					if ( $coverNever.length > 0 ) {
						test.coverage = test.coverage || {};
						test.coverage.never = toString($coverNever.attr("data-sap-ui-cover-only"));
					}

					let reasonsToKeepPage = [];
					let filesToCreate = [];

					if ( /\/demokit\/sample\//.test(test.page) ) {
						test.group = "Demokit Sample";
						reasonsToKeepPage.push({msg: "Demokit Content"});
					} else if ( /\/demokit\/tutorial\//.test(test.page) ) {
						test.group = "Demokit Tutorial";
						reasonsToKeepPage.push({msg: "Demokit Content"});
					} else if ( /\/demokit\//.test(test.page) ) {
						test.group = "Demokit Other Content";
						reasonsToKeepPage.push({msg: "Demokit Content"});
					} else if ( /\/designtime\//.test(test.page) ) {
						test.group = "Designtime";
					}

					let $body = jQuery("body", dom).children();
					let unknownElements = [];
					let uiAreas = [];
					let uiAreasBeforeQUnit = null;
					let embeddedData = [];
					let styles = jQuery("style", dom).get().map((styleTag) => jQuery(styleTag).text());

					$body.each((idx, elem) => {
						let id = elem.id;
						let domInfo;
						if ( /^qunit(?:-header|-banner|-userAgent|-testrunner-toolbar|-tests|-fixture)?$/.test(id) ) {
							// ignore
							if ( uiAreasBeforeQUnit == null ) {
								 uiAreasBeforeQUnit = uiAreas.length;
							}
						} else if ( (elem.nodeName === "BR" || elem.nodeName === "HR") && elem.children.length === 0 && !elem.textContent.trim() ) {
							// ignore
						} else if ( domInfo = getSimpleDOM(elem) ) {
							Log.info("page contains simple DOM '" + domInfo.tagName + (domInfo.id ? "#" + id : ""));
							uiAreas.push(domInfo);
						} else {
							unknownElements.push(elem.outerHTML);
						}
					});
					if ( unknownElements.length > 0 ) {
						Log.info("keep page because of unhandled DOM content (" + unknownElements.join("").length + " chars)");
						reasonsToKeepPage.push({msg: "Non-trivial DOM content", details: unknownElements});
					}

					let bImportsQUtils = false;
					let $externalScripts = jQuery("script[src]", dom);
					$externalScripts.each( (idx,script) => {
						let src = jQuery(script).attr("src");
						if ( /(?:^|\/)sap-ui-core\.js(?:\?|#|$)/.test(src) ) {
							test.bootCore = true;
						} else if ( /(?:^|\/)sap\/ui\/thirdparty\/qunit\.js(?:\?|#|$)/.test(src) ) {
							test.qunit = test.qunit || {};
							test.qunit.version = 1;
						} else if ( /(?:^|\/)sap\/ui\/thirdparty\/qunit-2\.js(?:\?|#|$)/.test(src) ) {
							test.qunit = test.qunit || {};
							test.qunit.version = 2;
						} else if ( /(?:^|\/)sap\/ui\/thirdparty\/sinon\.js(?:\?|#|$)/.test(src) ) {
							test.sinon = test.sinon || {};
							test.sinon.version = 1;
						} else if ( /(?:^|\/)sap\/ui\/thirdparty\/sinon-ie\.js(?:\?|#|$)/.test(src) ) {
							// ignore
						} else if ( /(?:^|\/)sap\/ui\/thirdparty\/sinon-4\.js(?:\?|#|$)/.test(src) ) {
							test.sinon = test.sinon || {};
							test.sinon.version = 4;
						} else if ( /(?:^|\/)sap\/ui\/thirdparty\/sinon-qunit\.js(?:\?|#|$)/.test(src) ) {
							test.sinon = test.sinon || {};
							test.sinon.qunitBridge = true;
						} else if ( /(?:^|\/)sap\/ui\/qunit\/sinon-qunit-bridge\.js(?:\?|#|$)/.test(src) ) {
							test.sinon = test.sinon || {};
							test.sinon.qunitBridge = true;
						} else if ( /(?:^|\/)sap\/ui\/qunit\/qunit-coverage\.js(?:\?|#|$)/.test(src) ) {
							test.coverage = test.coverage || {};
						} else if ( /(?:^|\/)sap\/ui\/qunit\/QUnitUtils\.js(?:\?|#|$)/.test(src) ) {
							bImportsQUtils = true;
						} else if ( /(?:^|\/)sap\/ui\/qunit\/qunit-junit\.js(?:\?|#|$)/.test(src) ) {
							// ignore
						} else if ( /(?:^|\/)sap\/ui\/qunit\/qunit-css\.js(?:\?|#|$)/.test(src) ) {
							// ignore
						} else if ( /(?:^|\/)sap\/ui\/qunit\/qunit-2-css\.js(?:\?|#|$)/.test(src) ) {
							// ignore
						} else if ( /(?:^|\/)shared-config\.js(?:\?|#|$)/.test(src) ) {
							// ignore
						} else if ( /^((?:\.\/)?[^\/]*)\.js(?:\?|#|$)/.test(src) ) {
							let url = new URI(src, test.page).toString();
							jQuery.ajax({
								url: url,
								dataType: 'text',
								async: false,
								success: function(script) {
									script = cleanupTestScript(test, script);
									({script, bImportsQUtils, uiAreas, uiAreasBeforeQUnit, embeddedData, styles} =
										injectCode({script, bImportsQUtils, uiAreas, uiAreasBeforeQUnit, embeddedData, styles}));
									script = postprocessScript(script);
									let relativeName = new URI(url).relativeTo(suitePageInfo.url).toString();
									Log.info("update external script ", src, "'" + relativeName + "'");
									filesToCreate.push({
										name: relativeName,
										content: script
									});
								}
							});
							let mod = getTestResourceName(url).replace(/\.js$/, "");
							test.module = test.module || [];
							test.module.push(mod);
						} else {
							if ( reasonsToKeepPage.length === 0 ) { // only log the first one
								Log.info("keep page because of unhandled script " + src);
							}
							reasonsToKeepPage.push({msg:"unhandled script", details: src});
						}
					});

					let inlineScripts = jQuery("script:not([src])", dom).get();
					if ( inlineScripts.length === 0 ) {
						Log.info("Test " + test.name + " has no more inline scripts \u2705");
					} else {

						let i = 0;
						while ( i < inlineScripts.length ) {
							let type = inlineScripts[i].getAttribute("type");
							if ( type != null && type !== "javascript" && type !== "text/javascript" ) {
								if ( inlineScripts[i].getAttribute("id") && /\/xml(data|view)/.test(type) ) {
									embeddedData.push({
										id: inlineScripts[i].getAttribute("id"),
										content: jQuery(inlineScripts[i]).text()
									});
								} else {
									Log.info("keep page because of unhandled type of inline script: ''" + type + "'");
									reasonsToKeepPage.push({msg:"unhandled type of inline script: ''" + type + "'", details: type});
								}
								inlineScripts.splice(i, 1);
							} else {
								i++;
							}
						}

						// first try to merge scripts
						i = 0;
						while ( i < inlineScripts.length ) {
							let prev = inlineScripts[i];
							let script = jQuery(inlineScripts[i]).text();
							let j = i + 1;
							while ( j < inlineScripts.length && prev.nextElementSibling === inlineScripts[j] ) {
								script = script + "\n" + jQuery(inlineScripts[j]).text();
								jQuery(inlineScripts[i]).text(script);
								prev = inlineScripts[j];
								inlineScripts.splice(j, 1);
								Log.info("append inline script " + j + " to predecessor script");
							}
							i++;
						}

						if ( inlineScripts.length === 1 ) {
							let script = jQuery(inlineScripts[0]).text();
							if ( isTestLauncherScript(test, script, bAutostartDisabled) ) {
								Log.info("Test " + test.name + " seems to require test file \u2705");
							} else if ( isQUnitLauncherScript(test, script, bAutostartDisabled) ) {
								Log.info("Test " + test.name + " seems to launch QUnit via script \u2705");
							} else if ( /(?:^|[ \t]|QUnit\.)test\(/.test(script) || /ElementEnablementTest/.test(script) ) {

								script = unindent(cleanupTestScript(test, script));

								({script, bImportsQUtils, uiAreas, uiAreasBeforeQUnit, embeddedData, styles} =
									injectCode({script, bImportsQUtils, uiAreas, uiAreasBeforeQUnit, embeddedData, styles}));

								script = postprocessScript(script, true);

								filesToCreate.push({
									name: test.name + ".qunit.js",
									content: script
								});
								Log.info("extract script as " + test.name + ".qunit.js"); // 2b60
								Log.info("Test " + test.name + " has one inline script with tests \u26cf"); // 2b60
							} else {
								Log.info("Test " + test.name + " has non-trivial inline script \u274c");
								reasonsToKeepPage.push({msg: "non-trivial inline script"});
							}
						} else {
							Log.info("Test " + test.name + " uses " + inlineScripts.length + " inline non-contiguous script blocks \u274c");
							reasonsToKeepPage.push({msg: "multiple non-contiguous inline scripts", details: inlineScripts.length});
						}
					}
					if ( bImportsQUtils ) {
						reasonsToKeepPage.push({msg: "Script Include of QUnitUtils"});
					}
					if ( uiAreas.length > 0 ) {
						reasonsToKeepPage.push({msg: "UIAreas not created per script", details: uiAreas});
					}

					if ( !test.page.startsWith("/test-resources/") && !test.page.startsWith("/resources/") ) {
						test.page = test.page.slice(test.page.indexOf("/", 1));
					}
					if ( test.page.startsWith("/") ) {
						test.page = test.page.slice(1);
					}

					if ( reasonsToKeepPage.length === 0 ) {
						let pageInfo = extractSuiteInfo(test.page);

						let tmp = test.page;
						delete test.page;
						test._page = tmp;

						filesToCreate.forEach(({name,content}) => oArchive.file(name, content));
						Log.info("Test " + test.name + " migrated \u2705");

						createTestPage({
							baseRef: pageInfo.baseRef,
							suiteResourceName: suitePageInfo.resourceName,
							testName: test.name
						});
					} else {
						test._keepPage = reasonsToKeepPage;
						Log.info("Test page " + test.name + " kept because of \u274c");
						reasonsToKeepPage.forEach( (reason) => {
							Log.info(" - " + reason.msg, reason.details);
						});
					}
					return test;
				});
			})
		).then( (aTests) => {
			return condense(suitePageInfo, aTests);
		});
	}

	function condense(suitePageInfo, aTests) {

		var sModulePrefix = suitePageInfo.resourceName.slice(0, suitePageInfo.resourceName.lastIndexOf('/') + 1);

		function resolvePackage(sModule) {
			return sModule == null ? sModule : sModule.replace(/^\.\//, sModulePrefix);
		}

		var condensed = new Map();
		condensed.set("bootCore", new Map());
		condensed.set("ui5/libs", new Map());
		condensed.set("ui5/theme", new Map());
		condensed.set("ui5/noConflict", new Map());
		condensed.set("ui5/preload", new Map());
		condensed.set("ui5/language", new Map());
		condensed.set("qunit/version", new Map());
		condensed.set("qunit/reorder", new Map());
		condensed.set("qunit/testTimeout", new Map());
		condensed.set("sinon/version", new Map());
		condensed.set("sinon/qunitBridge", new Map());
		condensed.set("sinon/useFakeTimers", new Map());

		var wildcard = {
			"loader/paths/" : true
		};
		var normalize = {
			"ui5/libs": function(value) {
				if ( value == null ) {
					return undefined;
				}
				if ( typeof value === "string" ) {
					value = value.trim().split(/\s*,\s*/);
				}
				return value.sort().join(",");
			}
		};

		// count values
		aTests.forEach( (test) => {

			function visit(obj, prefix) {
				Object.keys(obj).forEach( (key) => {
					let fullkey = prefix + key;
					let values = condensed.get(fullkey);
					let value = obj[key];
					if ( values == null && wildcard[prefix] === true ) {
						condensed.set(fullkey, values = new Map());
					}
					if ( values instanceof Map ) {
						// normalize value if needed
						if ( normalize[fullkey] ) {
							value = normalize[fullkey](value);
						}
						if ( values.has(value) ) {
							values.set( value, values.get(value) + 1 );
						} else {
							values.set( value, 1 );
						}
					} else if ( value && typeof value === "object" ) {
						visit(value, fullkey + "/");
					}
				});
			}

			// remove undefined values in the test config
			test = JSON.parse(JSON.stringify(test));
			// merge with defaults
			let testWithDefaults = merge({}, testStarterUtils.defaultConfig, { ui5: { preload: "auto" } }, test);
			// update counts
			visit(testWithDefaults, "");
		});

		for ( let [key,values] of condensed ) {
			let s = [];
			for ( let [value] of values ) {
				s.push(value);
			}
			s = s.sort(function(v1,v2) {
				return values.get(v2) - values.get(v1);
			}).map( (v) => [v, values.get(v)]);
			condensed.set(key, s);
			Log.info(key + "=" + s.join(", "));
		}

		function mostCommon(key, defaultValue) {
			return condensed.get(key) && condensed.get(key).length > 0 ? condensed.get(key)[0][0] : defaultValue;
		}

		let defaults = {
			bootCore: mostCommon("bootCore", testStarterUtils.defaultConfig.bootCore),
			ui5: {
				libs: mostCommon("ui5/libs", ""),
				theme: mostCommon("ui5/theme", testStarterUtils.defaultConfig.ui5.theme),
				noConflict: mostCommon("ui5/noConflict", testStarterUtils.defaultConfig.ui5.noConflict),
				preload: mostCommon("ui5/preload", testStarterUtils.defaultConfig.ui5.preload)
			},
			qunit: {
				version: mostCommon("qunit/version", testStarterUtils.defaultConfig.qunit.version),
				reorder: mostCommon("qunit/reorder", false),
				testTimeout: mostCommon("qunit/testtimeout", undefined)
			},
			sinon: {
				version: mostCommon("sinon/version", testStarterUtils.defaultConfig.sinon.version ),
				qunitBridge: mostCommon("sinon/qunitBridge", testStarterUtils.defaultConfig.sinon.qunitBridge),
				useFakeTimers: mostCommon("qunit/useFakeTimers", testStarterUtils.defaultConfig.sinon.useFakeTimers)
			},
			module: testStarterUtils.defaultConfig.module
		};

		aTests = aTests.map( (test) => {
			function resolvePlaceholders(str, name) {
				return str == null ? str : str.replace(/\{suite\}/g, suitePageInfo.resourceName).replace(/\{name\}/g, test.name);
			}

			if ( test.bootCore === defaults.bootCore ) {
				delete test.bootCore;
			}
			if ( test.ui5 ) {
				if ( test.ui5.libs === defaults.ui5.libs ) {
					delete test.ui5.libs;
				}
				if ( test.ui5.theme === defaults.ui5.theme ) {
					delete test.ui5.theme;
				}
				if ( test.ui5.noConflict === defaults.ui5.noConflict ) {
					delete test.ui5.noConflict;
				}
				if ( test.ui5.preload === defaults.ui5.preload ) {
					delete test.ui5.preload;
				}
			}
			if ( test.qunit ) {
				if ( test.qunit.version === defaults.qunit.version ) {
					delete test.qunit.version;
				}
				if ( test.qunit.reorder === defaults.qunit.reorder ) {
					delete test.qunit.reorder;
				}
				if ( test.qunit.testTimeout === defaults.qunit.testTimeout ) {
					delete test.qunit.testTimeout;
				}
			}
			if ( test.sinon ) {
				if ( test.sinon.version === defaults.sinon.version ) {
					delete test.sinon.version;
				}
				if ( test.sinon.qunitBridge === defaults.sinon.qunitBridge ) {
					delete test.sinon.qunitBridge;
				}
				if ( test.sinon.useFakeTimers === defaults.sinon.useFakeTimers ) {
					delete test.sinon.useFakeTimers;
				}
			}
			if ( Array.isArray(test.module) ) {
				let defaultModule = resolvePackage(resolvePlaceholders(defaults.module));
				test.module = test.module.filter( (module) => {
					return resolvePackage(module) !== defaultModule;
				});
				if ( test.module.length === 0 ) {
					delete test.module;
				}
			}

			// remove empty objects
			for ( let key in test ) {
				test[key] = nonEmpty(test[key]);
			}

			// remove undefined properties
			return JSON.parse(JSON.stringify(test));
		});

		const oConfig = {
			name: suitePageInfo.title,
			defaults: defaults,
			tests: aTests.reduce( (map, test) => {
				map[test.name] = test;
				delete test.name;
				return map;
			}, {})
		};

		return {
			suitePageInfo,
			suiteConfig: oConfig
		};
	}

	function stringify(obj, indent) {
		let s = [];

		function pushName(key, indent, first) {
			if ( !first ) {
				s.push(",");
			}
			s.push("\n");
			s.push(indent);
			if ( key !== undefined ) {
				if ( /^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(key) ) {
					s.push(key);
				} else {
					s.push("\"", key, "\"");
				}
				s.push(": ");
			}
		}

		function pushValue(value, key, indent, first) {
			if ( value === null ) {
				pushName(key, indent, first);
				s.push("null");
			} else if ( typeof value === "string" ) {
				pushName(key, indent, first);
				s.push("\"", escapeLiteral(value), "\"");
			} else if ( typeof value === "boolean" || typeof value === "number" ) {
				pushName(key, indent, first);
				s.push(String(value));
			} else if ( Array.isArray(value) ) {
				pushName(key, indent, first);
				s.push("[");
				first = true;
				value.forEach( (val) => {
					first = pushValue(val, undefined, indent + "\t", first);
				});
				s.push("\n");
				s.push(indent, "]");
			} else if ( value != null && typeof value === "object" ) {
				pushName(key, indent, first);
				s.push("{");
				if ( Array.isArray(value._keepPage) ) {
					s.push("\n");
					s.push(indent + "\t", "/*\n");
					s.push(indent + "\t", " * Page kept because of\n");
					value._keepPage.forEach( (reason) => {
						s.push(indent + "\t", " *  - " + reason.msg + "\n");
					});
					s.push(indent + "\t", " */");
				}
				first = true;
				for ( key in value ) {
					if ( key === "_keepPage" ) {
						continue;
					}
					first = pushValue(value[key], key, indent + "\t", first);
				}
				s.push("\n");
				s.push(indent, "}");
			} else {
				// ignore
				return first;
			}
		}

		if ( pushValue(obj, undefined, indent, true) ) {
			throw new TypeError();
		}

		s.shift();
		s.shift();
		return s.join("");
	}

	function createTestPage(testPageInfo, oConfig) {
		const script = "script";
		let content = `<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta charset="utf-8">
		<base href="${testPageInfo.baseRef}">
		<script src="resources/sap/ui/test/starter/runTest.js"
				data-sap-ui-testsuite="${testPageInfo.suiteResourceName}"
				data-sap-ui-test="${testPageInfo.testName}"></${script}>
	</head>
	<body>
	</body>
</html>
`;

		// add file to archive
		oArchive.file(testPageInfo.testName + ".qunit.html", content);

		return content;
	}

	function createTestsuitePage(suitePageInfo, oConfig) {
		const script = "script";
		let content = `<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta charset="utf-8">
		<base href="${suitePageInfo.baseRef}">
		<title>${suitePageInfo.title}</title>
		<script src="resources/sap/ui/test/starter/createSuite.js"
				data-sap-ui-testsuite="${suitePageInfo.resourceName}"></${script}>
	</head>
	<body>
	</body>
</html>
`;

		// add file to archive
		oArchive.file(suitePageInfo.shortName + ".html", content);

		return content;
	}

	function createConfigFile(suitePageInfo, oConfig) {

		let content = `sap.ui.define(function() {

	"use strict";
	return ${stringify(oConfig, "\t")};
});
`;

		// add file to archive
		oArchive.file(suitePageInfo.shortName + ".js", content);

		return content;
	}

	function collectSuiteInfo(sPageURL) {
		return extractSuiteInfo(sPageURL).
			then( (suitePageInfo) => {
				return sap.ui.qunit.TestRunner.checkTestPage(sPageURL, false).then(
					(aTestPages) => collectTestInfos(suitePageInfo, aTestPages, sPageURL) );
			});
	}

	function extractTestsuiteConfig(sPageURL) {
		return collectSuiteInfo(sPageURL).then( ({suitePageInfo, suiteConfig}) => ({
			//indexPage: createIndexPage(suitePageInfo, suiteConfig),
			testsuitePage: createTestsuitePage(suitePageInfo, suiteConfig),
			configJS: createConfigFile(suitePageInfo, suiteConfig)
		}));
	}

	// ---- UI ------------------------------------------------------------------------------------------

	let codeEditor;
	let testsuiteFiles;
	const contentTypePerTab = {
		//indexPage: "html",
		testsuitePage: "html",
		configJS: "javascript"
	};

	function updateCodeEditor(key) {
		key = key || sap.ui.getCore().byId("tabBar").getSelectedKey();
		codeEditor.setValue((testsuiteFiles && testsuiteFiles[key]) || "");
		codeEditor.setType(contentTypePerTab[key] || "text");
	}

	function createUI() {

		return new Promise(function(resolve, reject) {
			sap.ui.require([
				"sap/m/App",
				"sap/m/IconTabHeader",
				"sap/m/IconTabFilter",
				"sap/m/Input",
				"sap/m/Label",
				"sap/m/Page",
				"sap/ui/layout/FixFlex",
				"sap/ui/codeeditor/CodeEditor"
			], function(App, IconTabHeader, IconTabFilter, Input, Label, Page, FixFlex, CodeEditor) {
				new App({
					initialPage: "page",
					pages: [
						new Page("page", {
							enableScrolling: false,
							title: "Extract Testsuite Configuration",
							content: [
								new FixFlex({
									fixContent: [
										new Label({
											text: window.location.origin
										}),
										new Input({
											id: "testPage",
											type:"Text",
											placeholder:"Enter Testsuite URL ...",
											width: "100%",
											change: function() {
												extract();
											}
										}),
										new IconTabHeader({
											id: 'tabBar',
											mode: "Inline",
											select: function onTabSelected(e) {
												updateCodeEditor(e.getParameter("selectedKey"));
											},
											items: [
												/*
												new IconTabFilter({
													key: "indexPage",
													text:"index.html"
												}), */
												new IconTabFilter({
													key: "testsuitePage",
													text:"testsuite.qunit.html"
												}),
												new IconTabFilter({
													key: "configJS",
													text:"testsuite.qunit.js"
												})
											]
										})
									],
									flexContent: [
										codeEditor = new CodeEditor({
											editable:false,
											type: "text"
										})
									]
								})
							]
						})
					]
				}).placeAt("content");
				resolve();
			}, reject);
		});

	}

	function extract() {
		sap.ui.getCore().byId("page").setBusy(true);
		testsuiteFiles = {
			// indexPage: "extracting...",
			testsuitePage: "extracting...",
			configJS: "extracting..."
		};
		updateCodeEditor();
		extractTestsuiteConfig( sap.ui.getCore().byId("testPage").getValue() )
		.then( (files) => {
			testsuiteFiles = files;
			updateCodeEditor();
			let zipblob = oArchive.generate({type:"blob"});
			var File = sap.ui.requireSync("sap/ui/core/util/File");
			File.save(zipblob, "sources", "zip", "application/zip");
		})
		.finally( () => {
			sap.ui.getCore().byId("page").setBusy(false);
		});
	}

	sap.ui.getCore().attachInit( () => {

		createUI().then( () => {

			let input = sap.ui.getCore().byId("testPage");
			let sTestPage = sap.ui.qunit.TestRunner.getTestPageUrl(/* fallback URL = */ "");
			input.setValue(sTestPage);

			if (sTestPage && sap.ui.qunit.TestRunner.getAutoStart()) {
				input.setEnabled(false);
				extract();
			} else {
				discovery.findTestsuites( "test-resources/qunit/testsuite.qunit.html" ).then( aSuites => {
					input.destroySuggestionItems();
					input.applySettings({
						showSuggestion:true,
						suggestionItems: aSuites.map( (suite) => new Item({ text: suite }) )
					});
					input.setFilterFunction( function(sTerm, oItem) {
						return oItem.getText().match(new RegExp(sTerm, "i"));
					});
				});
			}

		});

	});

});

/*
 * TODOs
 * - make migration more configurable
 * - add comment in front of createAndAppendDiv
 * - migrate also equals/asyncTest/expect calls to QUnit 2
 * - honor calls to blanket.options
 */
