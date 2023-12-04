sap.ui.define([
	"./testfwk",
	"jquery.sap.sjax",
	"sap/base/strings/escapeRegExp",
	"sap/ui/core/Core",
	"sap/ui/util/Storage",
	"test-resources/sap/ui/core/qunit/test/starter/find/discovery",
	"sap/base/util/isEmptyObject"
], function(testfwk, jQuery, escapeRegExp, oCore, Storage, discovery, isEmptyObject) {
	"use strict";

	oCore.ready(function onLoadPage() {
		document.getElementById("filter").focus();
		setTimeout(loadSamples, 10);
	});

	function showBusyIndicators() {
		document.getElementById("library-tests").innerHTML = "<img class\"loading\" src=\"images/loading.gif\">";
		document.getElementById("application-pages").innerHTML = "<img class\"loading\" src=\"images/loading.gif\">";
	}

	function loadSamples(forceRefresh) {
		document.getElementById("samples").style.opacity = "0.2";
		document.getElementById("samples").style.cursor = "wait";
		showBusyIndicators();
		return Promise.all([
			discoverAppPages(),
			fetchTestsFromDiscoveryService(),
			fetchTestsFromTestStarterDiscovery(forceRefresh)
		]).finally(function() {
			document.getElementById("samples").style.opacity = "";
			document.getElementById("samples").style.cursor = "";
		});
	}

	function refreshSamples(oEvent) {
		loadSamples(true);
	}

	function getLibForElement(oElem) {
		while (oElem && !oElem.dataset.libname) {
			oElem = oElem.parentNode;
		}
		if (oElem) {
			return oElem.dataset.libname;
		} else {
			return null;
		}
	}

	function getThemesForElement(oElem) {
		var libName = getLibForElement(oElem);
		if (libName) {
			var themes = testfwk.LIBRARY_THEMES[libName]; // try to get theme information for the current library
			return themes || testfwk.LIBRARY_THEMES["all"]; // return the found config - or "all themes" if nothing was found
		} else {
			return null;
		}
	}

	function triggerLink(oEvent) {
		var oLink = oEvent.target;
		var sRef = oLink.dataset.href;

		//allow all themes for application or custom pages
		var oThemeConstraints;
		if (oLink.parentNode.parentNode.id === "application-pages"
			|| oLink.parentNode.parentNode.id === "custom-tests") {
			oThemeConstraints = testfwk.LIBRARY_THEMES["all"];
		} else {
			oThemeConstraints = getThemesForElement(oLink);
		}

		// trigger testfwk (which is responsible for displaying the page)
		testfwk.setContentURL(sRef, oThemeConstraints, getLibForElement(oLink));

		oEvent.preventDefault();
		return false;
	}

	function mouseDownLink(oEvent) {
		if ( oEvent.target.nodeName === "A" ) {
			// update local link for "copy shortcut"
			var oLink = oEvent.target;
			var oThemeConstraints = getThemesForElement(oLink);
			var sOriginalHref = oLink.dataset.href;
			oLink.href = testfwk.addSettingsToURL(sOriginalHref, oThemeConstraints);
		}
	}

	function keydownUrl(evt) {
		if ( evt.keyCode == 13 ) {
			addSampleUrl();
		}
	}

	function addSampleUrl(oEvent) {
		var oInput = document.getElementById("sampleurl");
		var sUrl = oInput.value;
		var oResult = jQuery.sap.sjax({type : 'HEAD', url : sUrl});
		if ( !oResult.success ) {
			/* eslint-disable no-alert */
			alert(sUrl + " does not exist (" + oResult.error + ")");
			/* eslint-enable no-alert */
			return;
		}

		var oEmptynessHint = document.getElementById("#custom-tests-empty");
		if ( oEmptynessHint ) {
			oEmptynessHint.parentNode.removeChild(oEmptynessHint);
		}

		var oCustomSample = document.createElement("div");
		oCustomSample.className = "leaf";
		var oNewSampleDomRef = document.createElement("a");
		oNewSampleDomRef.href = sUrl;
		oNewSampleDomRef.dataset.href = sUrl;
		oNewSampleDomRef.target = "sap-ui-ContentWindow";
		oNewSampleDomRef.title = sUrl;
		var sText = sUrl;
		if ( sText.length > 40 && sText.lastIndexOf('/') >= 0 ) {
			sText = "..." + sText.slice(sText.lastIndexOf('/'));
		}
		oNewSampleDomRef.textContent = sText;
		oCustomSample.appendChild(oNewSampleDomRef);
		var oCustomTests = document.getElementById("custom-tests");
		oCustomTests.insertBefore(oCustomSample, oCustomTests.firstChild);
		triggerLink(oNewSampleDomRef);
		document.getElementById("samples").scrollTop = document.getElementById("samples").scrollHeight;
	}

	function toggleNode(oEvent) {
		var oNode;
		if ( oEvent.target.nodeName === "A" ) {
			triggerLink(oEvent);
			return;
		}
		if ( oEvent.target.classList.contains("caption") ) {
			oNode = oEvent.target.parentNode;
		} else if ( oEvent.target.parentNode.classList.contains("caption") ) {
			oNode = oEvent.target.parentNode.parentNode;
		}
		if ( oNode ) {
			if (oNode.classList.contains("expanded")) {
				oNode.classList.add("collapsed");
				oNode.classList.remove("expanded");
			} else {
				oNode.classList.add("expanded");
				oNode.classList.remove("collapsed");
			}
		}
		oEvent.stopPropagation();
	}

	function renderLeaf(content, url, name, level) {
		content.push("<div class=\"leaf\">");
		content.push("<a href=\"", url, "\"");
		content.push(" data-href=\"", url, "\"");
		content.push(" title=\"", url, "\"");
		content.push(" target=\"sap-ui-ContentWindow\">");
		content.push(name);
		content.push("</a></div>");
	}

	function renderNodeBegin(content, parentPath, name, level) {
		content.push("<div class=\"node ",
			level === 0 ? "library" : "folder",
			" ",
			level === 0 ? "expanded" : "collapsed", "\""); // expand just one level of the tree initially
		content.push(">");

		// caption
		content.push("<div class=\"caption\">");
		if ( level == 0 ) {
			content.push("<span class=\"icon\">&#xe080</span>");
		}
		content.push("<span>", name, "</span>");
		content.push("<span class='matches'></span>");
		content.push("</div>");

		// children
		content.push("<div");
		if ( level == 0 ) {
			content.push(" data-libname=\"" + name + "\"");
		}
		content.push(" class=\"children\"");
		content.push(">");
	}

	function renderNodeEnd(content) {
		content.push("</div>");
		content.push("</div>");
	}

	function renderTreeRecursion(content, parentPath, nodeName, node, level) {
		if (typeof node.lib === "string") {
			// node is a test
			renderLeaf(content, node.url, nodeName, level);
		} else if (node.entry) {
			// node is an app page;
			// the passed url is relative to <context-path>/test-resources/testsuite/testframe.html
			renderLeaf(content, "../../" + node.entry, nodeName, level);
		} else {
			// node is an inner tree node (no leaf)

			renderNodeBegin(content, parentPath, nodeName, level);

			var newParentPath = (parentPath === "") ? nodeName : parentPath + '/' + nodeName;
			var newLevel = level + 1;
			for (var newNodeName in node) {
				renderTreeRecursion(content, newParentPath, newNodeName, node[newNodeName], newLevel);
			}

			renderNodeEnd(content);
		}
	}

	function renderTree(targetId, tree) {
		var content = [];
		for (var folder in tree) {
			renderTreeRecursion(content, "", folder, tree[folder], 0);
		}
		var target = document.getElementById(targetId);
		target.innerHTML = content.join("");
	}

	function createTreeRecursion(tree, leaf, name) {
		var index = name.indexOf('/');
		if (index == -1) {
			tree[name] = leaf;
		} else {
			var folder = name.substring(0, index);
			var rest = name.substring(index + 1);
			var node = tree[folder];
			if (node == null) {
				tree[folder] = node = {};
			}
			createTreeRecursion(node, leaf, rest);
		}
	}

	function createTestTree(testArray) {
		var tree = {};
		testArray.forEach(function(test) {
			var lib = test.lib;
			var node = tree[lib];
			if (node == null) {
				tree[lib] = node = {};
			}
			createTreeRecursion(node, test, test.name);
		});
		return tree;
	}

	function createAppPagesTree(pagesArray) {
		var tree = {};
		pagesArray.forEach(function(page) {
			var folder = page.entry;
			var index = folder.indexOf('/');
			if (index >= 0) {
				folder = folder.slice(0, index);
			}

			var node = tree[folder];
			if (node) { /* TODO: why this check? (node && folder!=e) */
				tree[folder] = node = {};
			}
			createTreeRecursion(node ? node : tree, page, page.entry);
		});
		return tree;
	}

	function isEmpty(oTree) {
		return !oTree || isEmptyObject(oTree);
	}

	function compare(v1, v2) {
		if ( v1 !== v2 ) {
			return v1 < v2 ? -1 : 1;
		}
		return 0;
	}

	function fetchJSON(sUrl) {
		return Promise.resolve(
			jQuery.ajax({
				url: sUrl,
				dataType : "json"
			})
		);
	}

	var testsFromDiscoveryService;
	var testsFromTestStarterDiscovery;
	var filteredTestsFromTestStarterDiscovery;

	// A) request list of test pages (*.html) from discovery service
	function fetchTestsFromDiscoveryService() {
		fetchJSON("../../discovery/all_tests")
			.then(function(oResult) {
				testsFromDiscoveryService = oResult.all_tests;
				renderAllTests();
			})
			.catch(renderAllTestsError);
	}

	// B) analyze testsuites on client side to identify test starter tests (*.qunit.js)
	// As this is very time consuming, the result is cached in the local storage
	// and only refreshed every 3 days
	// The structure in the local storage is the same as the one written by the 'find.html' app

	var SCHEMA_VERSION = "0.0.3";
	var ENTRY_PAGE = "test-resources/qunit/testsuite.qunit.html";
	var MAX_AGE = 3 * 24 * 60 * 60 * 1000; // 3 days (in milliseconds)
	var store = new Storage(Storage.Type.local, "sap-ui-find-tests");

	function restoreData(maxAge) {
		maxAge = maxAge === undefined ? MAX_AGE : maxAge * 1000;
		var data = store.get("data");
		if ( data && data.entryPage === ENTRY_PAGE && data._$schemaVersion === SCHEMA_VERSION
			 && Date.now() < data.timeOfLastUpdate + maxAge ) {
			testsFromTestStarterDiscovery = data.tests;
			return true;
		}
		return false;
	}

	function saveData() {
		store.put("data", {
			_$schemaVersion: SCHEMA_VERSION,
			entryPage: ENTRY_PAGE,
			timeOfLastUpdate: Date.now(),
			tests: testsFromTestStarterDiscovery,
			testCount: testsFromTestStarterDiscovery.length,
			filteredTestCount: testsFromTestStarterDiscovery.length
		});
	}

	function fetchTestsFromTestStarterDiscovery(forceRefresh) {

		var whenLoaded = Promise.resolve();

		if ( forceRefresh || !restoreData() ) {

			whenLoaded = discovery.findTests(sap.ui.require.toUrl(ENTRY_PAGE)).then(function(aTests) {
				/*
				 * Remove duplicates and sort by fullpage
				 * Note: the semantic of this step must be kept in sync with the test starter's 'find.html' application
				 */
				var uniquePages = new Set();
				testsFromTestStarterDiscovery = aTests.filter(function(oEntry) {
					if ( !uniquePages.has(oEntry.fullpage) ) {
						uniquePages.add(oEntry.fullpage);
						return true;
					}
					return false;
				}).sort(function(oEntry1, oEntry2) {
					return compare(oEntry1.fullpage, oEntry2.fullpage);
				});

				// save the result in the local storage
				saveData();
			});
		}

		return whenLoaded.then(function() {

			/*
			 * TODO should validate agains ta list of known libs (e.g. from sap-ui-version.json)
			 */
			function findLibPrefix(sPath) {
				return sPath;
			}

			/*
			 * Find those tests that execute a single module.
			 *
			 * Execution in the testsuite app is not limited to such single module tests,
			 * but only for them we can produce a name that matches the user's expectations.
			 */
			filteredTestsFromTestStarterDiscovery = testsFromTestStarterDiscovery.map(function(oTestConfig) {
				if ( typeof oTestConfig.module !== "string" ) {
					return null;
				}
				var match = /^test-resources\/(.*)\/qunit\/(.*)$/.exec(oTestConfig.module);
				if ( match ) {
					var libPrefix = findLibPrefix(match[1]);
					var name = oTestConfig.module.slice("test-resources\/".length + libPrefix.length + 1) + ".js";
					var oUrl = new URL(oTestConfig.fullpage, document.baseURI);
					return {
						lib: libPrefix.replace(/\//g, "."),
						name: name,
						url: oUrl.pathname + oUrl.search + oUrl.hash
					};
				}
				return null;
			}).filter(Boolean);

			renderAllTests();
		}).catch(renderAllTestsError);

	}

	function renderAllTestsError(oError) {
		document.getElementById("library-tests").innerHTML = "<span class=\"error-msg\">failed to load tests: " + (oError.message ? oError.message : oError) + "</span>";
	}

	function renderAllTests() {

		var tests = [];
		if ( Array.isArray(testsFromDiscoveryService) ) {
			tests = tests.concat(testsFromDiscoveryService);
		}
		if ( Array.isArray(filteredTestsFromTestStarterDiscovery) ) {
			tests = tests.concat(filteredTestsFromTestStarterDiscovery);
		}

		// Sort TestCases by Library and Name, sap.ui.core is always the first library
		tests.sort(function sortByLibAndName(test1, test2) {
			if ( test1.lib == "sap.ui.core" && test2.lib != "sap.ui.core" ) {
				return -1;
			}
			if ( test1.lib != "sap.ui.core" && test2.lib == "sap.ui.core" ) {
				return 1;
			}
			return compare(test1.lib, test2.lib) || compare(test1.name, test2.name);
		});

		// build a tree from the test cases
		var tree = createTestTree(tests);

		// render it
		if ( isEmpty(tree) ) {
			document.getElementById("library-tests").innerHTML = "<span class=\"info-msg\">none</span>";
		} else {
			renderTree("library-tests", tree);
		}

	}

	function discoverAppPages() {
		return fetchJSON("../../discovery/app_pages")
			.then(function(oResult) {
				renderAppPages(oResult.app_pages);
			}).catch(renderAppPagesError);
	}

	function renderAppPages(aPages) {
		// Sort App Pages by name/URL
		aPages.sort(function sortByEntry(page1, page2) {
			return compare(page1.entry, page2.entry);
		});

		// create a tree from it
		var tree = createAppPagesTree(aPages);

		// render the tree
		if ( isEmpty(tree) ) {
			document.getElementById("application-pages").innerHTML = "<span class\"info-msg\">none</span>";
		} else {
			renderTree("application-pages", tree);
		}
	}

	function renderAppPagesError(oError) {
		document.getElementById("application-pages").innerHTML = "<span class=\"error-msg\">failed to load application pages: " + (oError.message ? oError.message : oError) + "</span>";
	}

	/**
	 * Converts a simple string (search term) into a RegExp that behaves like Eclipse class search:
	 * - camel case words are matched by any search term consisting of prefixes of each word in the same order as in the word
	 *   e.g.
	 *      CB   matches: CheckBox, ComboBox
	 *      CoB  only matches ComboBox
	 * - additionally, each term is added "as is" (case insensitive) so
	 *      cb   also matches   MacBook
	 *
	 * @param {string} term Term to convert
	 * @returns {RegExp} Regular Expression created from term
	 * @private
	 */
	function makeRegExp(term) {

		var l = term.length,
			s1 = '',
			s2 = '',
			i,c;

		for ( i = 0; i < l; i++ ) {
			c = term[i];
			if ( c >= 'A' && c <= 'Z' && i > 0 ) {
				s1 += "[a-z]*";
			}
			s1 += escapeRegExp(c);
			if ( c.toUpperCase() !== c.toLowerCase() ) {
				s2 += '[' + escapeRegExp(c.toUpperCase() + c.toLowerCase()) + ']';
			} else {
				s2 += escapeRegExp(c);
			}
		}

		// Log.debug("converted '" + term + "' to /" + s1 + '|' + s2 + "/");

		return new RegExp(s1 + '|' + s2);
	}

	var oTimerId;

	function setSampleFilter(oEvent) {
		if ( oTimerId ) {
			clearTimeout(oTimerId);
			oTimerId = undefined;
		}
		var oInputField = oEvent.target;
		var fnFilter;
		if ( oInputField.value ) {
			var rRegExp = makeRegExp(oInputField.value);
			fnFilter = function(sText) {
				return sText && rRegExp.test(sText);
			};
		}
		oTimerId = setTimeout(function() {
			applyFilter(fnFilter);
		}, 200);
	}

	function makeNodeVisible(oDomNode, bVisible) {
		oDomNode.style.display = bVisible ? '' : 'none';
		var oChildren = oDomNode.nextElementSibling;
		if ( oChildren ) {
			oChildren.style.display = bVisible ? '' : 'none';
		}
	}

	function clearFilter() {
		document.getElementById("filter").value = '';
		applyFilter(undefined);
	}

	function applyFilter(fnFilter) {
		var oDomNode = document.getElementById("library-tests-node");
		if ( !oDomNode ) {
			return false;
		}
		_applyFilter(fnFilter, oDomNode);
	}

	function _applyFilter(fnFilter, oDomNode) {

		var oChildren = oDomNode.querySelector(".children");
		if ( !oChildren ) {
			return false;
		}

		var iMatches = 0;
		var oChild = oChildren.firstElementChild;
		while ( oChild ) {
			if ( oChild.classList.contains("node") ) {
				iMatches = iMatches + _applyFilter(fnFilter, oChild);
			} else if ( oChild.classList.contains("leaf") ) {
				var bMatches = !fnFilter || fnFilter(oChild.innerText || oChild.innerHTML);
				oChild.style.display = bMatches ? '' : 'none';
				if ( bMatches ) {
					iMatches++;
				}
			}
			oChild = oChild.nextElementSibling;
		}

		var oMatchesText = oDomNode.querySelector(".matches");
		if ( oMatchesText ) {
			oMatchesText.textContent = (fnFilter && iMatches > 0) ? "(" + iMatches + ")" : "";
		}

		makeNodeVisible(oDomNode, oDomNode.classList.contains("section") || iMatches > 0);

		return iMatches;
	}

	showBusyIndicators();
	document.getElementById("clearFilter").addEventListener("click", function(oEvent) {
		oEvent.preventDefault();
		clearFilter();
	});
	document.getElementById("refreshTests").addEventListener("click", refreshSamples);
	document.getElementById("filter").addEventListener("keyup", setSampleFilter);
	document.getElementById("samples").addEventListener("click", toggleNode);
	document.getElementById("samples").addEventListener("mousedown", mouseDownLink);
	document.getElementById("sampleurl").addEventListener("keydown", keydownUrl);
	document.getElementById("add-sampleurl").addEventListener("click", addSampleUrl);
});
