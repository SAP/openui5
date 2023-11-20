/*global document, HTMLScriptElement, HTMLLinkElement, QUnit, sinon, sap, window, XMLHttpRequest */

sap.ui.define([
	"sap/base/i18n/Localization",
	'sap/ui/thirdparty/jquery',
	'sap/ui/base/ManagedObject',
	'sap/ui/core/AppCacheBuster',
	'sap/ui/core/Control',
	'sap/ui/core/_IconRegistry',
	'sap/base/util/fetch',
	'sap/ui/dom/includeScript',
	'sap/ui/dom/includeStylesheet'
	], function(Localization, jQuery, ManagedObject, AppCacheBuster, Control, _IconRegistry, fetch, includeScript, includeStylesheet) {
		"use strict";

	// create a control with an URI property to validate URI replacement
	var UriControl = Control.extend("test.UriControl", {
		metadata : {
			library : "test",
			properties : {
				src : {type: "sap.ui.core.URI"}
			}
		}
	});

	var sOriginalLocation = window.location.href;

	// global variables
	var sTimestamp = "1234567890";
	var sTimestampComp1 = sTimestamp;
	var sTimestampComp2 = "0987654321";

	QUnit.module("intercept");

	QUnit.test("check method interception", function(assert) {
		assert.expect(10);

		var fnXhrOpenOrig = XMLHttpRequest.prototype.open,
			fnValidateProperty = ManagedObject.prototype.validateProperty,
			descScriptSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src'),
			descLinkHref = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, 'href'),
			fn_IconRegistryConvertUrl = _IconRegistry._convertUrl;

		AppCacheBuster.init();

		assert.notEqual(fnXhrOpenOrig, XMLHttpRequest.prototype.open, "XMLHttpRequest.prototype.open is intercepted");
		assert.notEqual(fnValidateProperty, ManagedObject.prototype.validateProperty, "ManagedObject.prototype.validateProperty is intercepted");
		assert.notDeepEqual(Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src'), descScriptSrc, "Property 'src' of HTMLScriptElement is intercepted");
		assert.notDeepEqual(Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, 'href'), descLinkHref, "Property 'href' of HTMLLinkElement is intercepted");
		assert.notEqual(fn_IconRegistryConvertUrl, _IconRegistry._convertUrl, "_IconRegistry._convertUrl is created");

		AppCacheBuster.exit();

		assert.equal(fnXhrOpenOrig, XMLHttpRequest.prototype.open, "XMLHttpRequest.prototype.open is restored");
		assert.equal(fnValidateProperty, ManagedObject.prototype.validateProperty, "ManagedObject.prototype.validateProperty is restored");
		assert.deepEqual(Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src'), descScriptSrc, "Property 'src' of HTMLScriptElement is restored");
		assert.deepEqual(Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, 'href'), descLinkHref, "Property 'href' of HTMLLinkElement is restored");
		assert.notOk(_IconRegistry.hasOwnProperty("_convertUrl"), "The Icon._convertUrl function is deleted");

	});


	/*
	 * Each iteration of the following loop tests the AppCacheBuster's URL rewriting
	 * in the context of a modified window.location (modified via the History API).
	 *
	 * The enclosing HTML page contains a base tag which fixes the documentURI to the (virtual)
	 * location of the test application.
	 * The AppCacheBuster must do all URL calculations relative to the document.baseURI and
	 * therefore the results must not differ for different page locations (history states).
	 */
	[null, "state", "other/state", "even/more/nested/state"].forEach(function(stateSuffix) {

		QUnit.module("local scenario" + (stateSuffix ? " (with URL suffix '" + stateSuffix + "')" : ""), {
			beforeEach : function(assert) {

				// ensure the desired location via the History API
				var sUrlWithState = stateSuffix ? document.baseURI + stateSuffix : sOriginalLocation;
				window.history.replaceState({}, stateSuffix, sUrlWithState);

				// fake the XHR server
				this.server = sinon.fakeServer.create();

				// fake the cachebuster request
				this.server.respondWith(/test-resources\/sap\/ui\/core\/qunit\/((?:[^/?#]+\/)*)sap-ui-cachebuster-info.json/, function (xhr, subComponent) {
					var index;
					if ( subComponent === "comp1/" ) {
						index = {
							"my/view/MyView.view.js": sTimestampComp1,
							"my/view/MyView.controller.js": sTimestampComp1
						};
					} else if ( subComponent === "comp2/" ) {
						index = {
							"my/view/MyView.view.js": sTimestampComp2,
							"my/view/MyView.controller.js": sTimestampComp2
						};
					} else {
						index = {
							"my/view/MyView.view.js": sTimestamp,
							"my/view/MyView.controller.js":  sTimestamp,
							"js/script.js": sTimestamp,
							"css/style.css": sTimestamp,
							"img/image.png": sTimestamp,
							"manifest.json": sTimestamp,
							"fonts/font.woff2": sTimestamp
						};
					}
					xhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify(index));
				});

				// initialize the cachebuster and register three components
				AppCacheBuster.init();
				AppCacheBuster.register("./"); //sap.ui.require.toUrl("") + "/../");
				AppCacheBuster.register("./comp1/");
				AppCacheBuster.register("./comp2/");

				this.server.respond();
			},
			afterEach : function() {

				// exits the cachebuster
				AppCacheBuster.exit();

				// unfake the server
				this.server.restore();

				window.history.replaceState({}, "", sOriginalLocation);

			}
		});

		QUnit.test("preconditions", function(assert) {

			if ( stateSuffix ) {
				assert.ok(window.location.href.indexOf(stateSuffix) >= 0, "window.location.href should contain the state suffix");
				assert.ok(document.baseURI.indexOf(stateSuffix) < 0, "document.baseURI must not contain the state suffix");
			} else {
				assert.ok(window.location.href, sOriginalLocation, "window.location.href should be the original location");
			}

		});

		QUnit.test("ACB requests", function(assert) {
			assert.strictEqual(this.server.requests.length, 3, "ACB init + registration has created 3 requests");
		});

		QUnit.test("check basic URL handling", function(assert) {
			assert.expect(21);

			// check normal URLs
			assert.ok(AppCacheBuster.convertURL("my/view/MyView.view.js").indexOf("/~" + sTimestamp + "~/") >= 0, "URL is correctly prefixed!");
			assert.ok(AppCacheBuster.convertURL("comp1/my/view/MyView.view.js").indexOf("/~" + sTimestampComp1 + "~/") >= 0, "URL is correctly prefixed!");
			assert.ok(AppCacheBuster.convertURL("comp2/my/view/MyView.view.js").indexOf("/~" + sTimestampComp2 + "~/") >= 0, "URL is correctly prefixed!");
			assert.ok(AppCacheBuster.convertURL("my/view/MyView1.view.js").indexOf("/~" + sTimestamp + "~/") == -1, "URL is correctly ignored!");
			assert.ok(AppCacheBuster.convertURL("my/view/MyView1.view.js").indexOf("/~" + sTimestampComp2 + "~/") == -1, "URL is correctly ignored!");
			assert.ok(AppCacheBuster.convertURL("comp1/my/view/MyView1.view.js").indexOf("/~" + sTimestampComp1 + "~/") == -1, "URL is correctly ignored!");
			assert.ok(AppCacheBuster.convertURL("comp1/my/view/MyView1.view.js").indexOf("/~" + sTimestampComp2 + "~/") == -1, "URL is correctly ignored!");
			assert.ok(AppCacheBuster.convertURL("comp2/my/view/MyView1.view.js").indexOf("/~" + sTimestampComp1 + "~/") == -1, "URL is correctly ignored!");
			assert.ok(AppCacheBuster.convertURL("comp2/my/view/MyView1.view.js").indexOf("/~" + sTimestampComp2 + "~/") == -1, "URL is correctly ignored!");

			// check ab-normal URLs
			assert.ok(AppCacheBuster.convertURL("my/../my/view/../view/MyView.view.js").indexOf("/~" + sTimestamp + "~/") >= 0, "URL is correctly prefixed!");
			assert.ok(AppCacheBuster.convertURL("my/../my/view/../view/MyView1.view.js").indexOf("/~" + sTimestamp + "~/") == -1, "URL is correctly ignored!");

			// check relative URLs
			assert.ok(AppCacheBuster.convertURL("./my/view/MyView.view.js").indexOf("/~" + sTimestamp + "~/") >= 0, "URL is correctly prefixed!");
			assert.ok(AppCacheBuster.convertURL("./my/view/MyView1.view.js").indexOf("/~" + sTimestamp + "~/") == -1, "URL is correctly ignored!");

			// check relative ab-normal URLs
			assert.ok(AppCacheBuster.convertURL("./my/../my/view/../view/MyView.view.js").indexOf("/~" + sTimestamp + "~/") >= 0, "URL is correctly prefixed!");
			assert.ok(AppCacheBuster.convertURL("./my/../my/view/../view/MyView1.view.js").indexOf("/~" + sTimestamp + "~/") == -1, "URL is correctly ignored!");

			// ignore query parameters for lookup
			assert.ok(AppCacheBuster.convertURL("./manifest.json").indexOf("/~" + sTimestamp + "~/") >= 0, "URL is correctly prefixed!");
			assert.ok(AppCacheBuster.convertURL("./manifest.json?sap-language=EN").indexOf("/~" + sTimestamp + "~/") >= 0, "URL is correctly prefixed!");
			assert.ok(AppCacheBuster.convertURL("./manifest.json#anyhash").indexOf("/~" + sTimestamp + "~/") >= 0, "URL is correctly prefixed!");

			// keep query parameters
			assert.equal(AppCacheBuster.convertURL("./manifest.json?sap-language=EN"), AppCacheBuster.convertURL("./manifest.json") + "?sap-language=EN", "Query parameters kept!");
			assert.equal(AppCacheBuster.convertURL("./manifest.json#anyhash"), AppCacheBuster.convertURL("./manifest.json") + "#anyhash", "Hash kept!");

			// ignore URLs starting with a hash
			assert.equal(AppCacheBuster.convertURL("#Shell-Home"), "#Shell-Home", "Hash is ignored!");

		});

		QUnit.test("Request to an application resource...", function(assert) {
			assert.expect(1);

			// fake response for a cachebusted application resource
			this.server.respondWith(/.*\/~1234567890~\/js\/script.js/, function (xhr, id) {
				xhr.respond(200, { "Content-Type": "text/javascript" }, '');
			});

			// check request for that resource
			var pFetch = fetch("js/script.js", {
				headers: {
					Accept: fetch.ContentTypes.TEXT
				}
			}).then(function(response) {
				if (response.ok) {
					assert.strictEqual(response.status, 200,
							"...should be cache busted");
				} else {
					assert.strictEqual(response.status, 200,
							"...failed, maybe because cache busting failed?");
				}
			});

			this.server.respond();
			return pFetch;
		});

		QUnit.test("Request to a non-application resource...", function(assert) {
			assert.expect(1);

			// fake response for a non-application resource (no cache buster token expected)
			// (the 'js/script1.js' will not be covered by the AppCacheBuster and therefore not prefixed!)
			this.server.respondWith(/js\/script1.js/, function (xhr, id) {
				xhr.respond(200, { "Content-Type": "text/javascript" }, '');
			});

			// check normal URLs
			var pFetch = fetch("js/script.js").then(function(response) {
				if (response.ok) {
					assert.strictEqual(response.status, 200,
							"...should not be cache busted");
				} else {
					assert.strictEqual(response.status, 404,
							"...failed, maybe because the URL was cache busted?");
				}
			});

			this.server.respond();
			return pFetch;
		});

		QUnit.test("check includeScript handling", function(assert) {
			assert.expect(1);

			var fnCreateElement = document.createElement;
			document.createElement = function(tagName) {
				var elem = fnCreateElement.call(this, tagName);
				if (tagName.toLowerCase() == "script") {
					Object.defineProperty(Object.getPrototypeOf(elem), "src", Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src"));
				}
				return elem;
			};

			// check script prefixing
			includeScript("js/script.js", "myjs");
			var sSource = jQuery("#myjs").attr("src");
			assert.ok(sSource.indexOf("/~" + sTimestamp + "~/") >= 0, "URL \"" + sSource + "\" is correctly prefixed!");
		});

		QUnit.test("check includeStylesheet handling", function(assert) {
			assert.expect(1);

			// check script prefixing
			includeStylesheet("css/style.css", "mycss");
			var sSource = jQuery("#mycss").attr("href");
			assert.ok(sSource.indexOf("/~" + sTimestamp + "~/") >= 0, "URL \"" + sSource + "\" is correctly prefixed!");
		});

		QUnit.test("check sap.ui.core.URI.type handling", function(assert) {
			assert.expect(1);

			// check script prefixing
			var oControl = new UriControl({
				src: "img/image.png"
			});
			var sSource = oControl.getSrc();
			assert.ok(sSource.indexOf("/~" + sTimestamp + "~/") >= 0, "URL \"" + sSource + "\" is correctly prefixed!");
			oControl.destroy();
		});

		QUnit.test("check _loadJSResourceAsync handling", function(assert) {
			assert.expect(2);

			// register the module path to resolve the module name properly
			sap.ui.loader.config({paths:{"anyapp":"./"}});

			// check normal URLs
			var done = assert.async();
			Promise.all([
				sap.ui.loader._.loadJSResourceAsync("anyapp/js/script.js"),
				sap.ui.loader._.loadJSResourceAsync("anyapp/js/script1.js")
			]).then(function(aResults) {
				// success is a fail as the scripts don't exist (covered by expect(2))
				done();
			}, function(aResults) {
				// check for script.js
				var oScript = document.querySelectorAll("[data-sap-ui-module='anyapp/js/script.js']"),
					sSource = oScript && oScript[0] && oScript[0].src || "";
				assert.ok(sSource.indexOf("/~" + sTimestamp + "~/") >= 0, "URL \"" + sSource + "\" is correctly prefixed!");
				// check for script1.js
				oScript = document.querySelectorAll("[data-sap-ui-module='anyapp/js/script1.js']");
				sSource = oScript && oScript[0] && oScript[0].src || "";
				assert.ok(sSource.indexOf("/~" + sTimestamp + "~/") == -1, "URL \"" + sSource + "\" should not be prefixed!");
				done();
			});

		});

		QUnit.test("check native XMLHttpRequest handling", function(assert) {
			assert.expect(2);

			var oReq = new XMLHttpRequest();
			oReq.open("GET", "js/script.js");
			assert.ok(oReq.url.indexOf("/~" + sTimestamp + "~/") != -1, "URL \"" + oReq.url + "\" is correctly prefixed!");

			oReq = new XMLHttpRequest();
			oReq.open("GET", "js/script1.js");
			assert.ok(oReq.url.indexOf("/~" + sTimestamp + "~/") == -1, "URL \"" + oReq.url + "\" should not be prefixed!");
		});

		QUnit.test("check _IconRegistry._convertUrl handling", function(assert) {
			var sUrl = _IconRegistry._convertUrl("fonts/font.woff2");

			assert.ok(sUrl.indexOf("/~" + sTimestamp + "~/") != -1, "URL \"" + sUrl + "\" is correctly prefixed!");
		});

	});




	QUnit.module("remote scenario", {
		beforeEach : function() {

			// fake the XHR server
			this.server = sinon.fakeServer.create();

			// fake the cachebuster request
			this.server.respondWith(new RegExp("anyapp/sap-ui-cachebuster-info.json"), function(xhr, id) {
				//this.server.respondWith(/https?:\/\/anyserver.company.corp:4711\/anyapp\/sap-ui-cachebuster-info.json/, function (xhr, id) {
				xhr.respond(200, {
						"Content-Type": "application/json"
					},
					'{"my/view/MyView.view.js": "' + sTimestamp + '", ' +
					'"my/view/MyView.controller.js": "' + sTimestamp + '", ' +
					'"js/script.js": "' + sTimestamp + '", ' +
					'"css/style.css": "' + sTimestamp + '", ' +
					'"img/image.png": "' + sTimestamp + '", ' +
					'"fonts/font.woff2": "' + sTimestamp + '"}');
			});


			// initialize the cachebuster
			AppCacheBuster.init();
			AppCacheBuster.register(document.baseURI + "anyapp/");

			this.server.respond();
		},
		afterEach : function() {

			// exits the cachebuster
			AppCacheBuster.exit();

			// unfake the server
			this.server.restore();

		}
	});

	QUnit.test("check basic URL handling", function(assert) {
		assert.expect(8);

		// check normal URLs
		assert.ok(AppCacheBuster.convertURL(document.baseURI + "anyapp/my/view/MyView.view.js").indexOf("/~" + sTimestamp + "~/") >= 0, "URL is correctly prefixed!");
		assert.ok(AppCacheBuster.convertURL(document.baseURI + "anyapp/my/view/MyView1.view.js").indexOf("/~" + sTimestamp + "~/") == -1, "URL is correctly ignored!");

		// check ab-normal URLs
		assert.ok(AppCacheBuster.convertURL(document.baseURI + "anyapp/my/../my/view/../view/MyView.view.js").indexOf("/~" + sTimestamp + "~/") >= 0, "URL is correctly prefixed!");
		assert.ok(AppCacheBuster.convertURL(document.baseURI + "anyapp/my/../my/view/../view/MyView1.view.js").indexOf("/~" + sTimestamp + "~/") == -1, "URL is correctly ignored!");

		// check relative URLs
		assert.ok(AppCacheBuster.convertURL(document.baseURI + "anyapp/./my/view/MyView.view.js").indexOf("/~" + sTimestamp + "~/") >= 0, "URL is correctly prefixed!");
		assert.ok(AppCacheBuster.convertURL(document.baseURI + "anyapp/./my/view/MyView1.view.js").indexOf("/~" + sTimestamp + "~/") == -1, "URL is correctly ignored!");

		// check relative ab-normal URLs
		assert.ok(AppCacheBuster.convertURL(document.baseURI + "anyapp/./my/../my/view/../view/MyView.view.js").indexOf("/~" + sTimestamp + "~/") >= 0, "URL is correctly prefixed!");
		assert.ok(AppCacheBuster.convertURL(document.baseURI + "anyapp/./my/../my/view/../view/MyView1.view.js").indexOf("/~" + sTimestamp + "~/") == -1, "URL is correctly ignored!");

	});

	QUnit.test("jQuery.ajax to an application resource...", function(assert) {
		assert.expect(1);

		// fake response for a cachebusted application resource
		this.server.respondWith(/anyapp\/~1234567890~\/js\/script.js/, function (xhr, id) {
			xhr.respond(200, { "Content-Type": "text/javascript" }, '');
		});

		// check AJAX request for that resource
		var done = assert.async();
		jQuery.ajax({
			url: document.baseURI + "anyapp/js/script.js",
			dataType: "text",
			success: function(data, textStatus, xhr) {
				assert.strictEqual(xhr.status, 200,
					"...should be cache busted");
				done();
			},
			error: function(xhr) {
				assert.strictEqual(xhr.status, 200,
					"...failed, maybe because cache busting failed?");
				done();
			}
		});

		this.server.respond();
	});

	QUnit.test("jQuery.ajax to a non-application resource...", function(assert) {
		assert.expect(1);

		// fake response for a non-application resource (no cache buster token expected)
		// (the 'js/script1.js' will not be covered by the AppCacheBuster and therefore not prefixed!)
		this.server.respondWith(/anyapp\/js\/script1.js/, function (xhr, id) {
			xhr.respond(200, { "Content-Type": "text/javascript" }, '');
		});

		// check normal URLs
		var done = assert.async();
		jQuery.ajax({
			url: document.baseURI + "anyapp/js/script1.js",
			success: function(data, textStatus, xhr) {
				assert.strictEqual(xhr.status, 200,
					"...should not be cache busted");
				done();
			},
			error: function(xhr) {
				assert.strictEqual(xhr.status, 200,
					"...failed, maybe because the URL was cache busted?");
				done();
			}
		});

		this.server.respond();
	});

	QUnit.test("check includeScript handling", function(assert) {
		assert.expect(1);

		// check script prefixing
		includeScript(document.baseURI + "anyapp/js/script.js", "myjs");
		var sSource = jQuery("#myjs").attr("src");
		assert.ok(sSource.indexOf("/~" + sTimestamp + "~/") >= 0, "URL \"" + sSource + "\" is correctly prefixed!");

	});

	QUnit.test("check includeStylesheet handling", function(assert) {
		assert.expect(1);

		// check script prefixing
		includeStylesheet(document.baseURI + "anyapp/css/style.css", "mycss");
		var sSource = jQuery("#mycss").attr("href");
		assert.ok(sSource.indexOf("/~" + sTimestamp + "~/") >= 0, "URL \"" + sSource + "\" is correctly prefixed!");

	});

	QUnit.test("check sap.ui.core.URI.type handling", function(assert) {
		assert.expect(1);

		// check script prefixing
		var oControl = new UriControl({
			src: document.baseURI + "anyapp/img/image.png"
		});
		var sSource = oControl.getSrc();
		assert.ok(sSource.indexOf("/~" + sTimestamp + "~/") >= 0, "URL \"" + sSource + "\" is correctly prefixed!");
		oControl.destroy();

	});

	QUnit.test("check _loadJSResourceAsync handling", function(assert) {
		assert.expect(2);

		// register the module path to resolve the module name properly
		sap.ui.loader.config({paths:{"remoteanyapp": document.baseURI + "anyapp/"}});

		// check normal URLs
		var done = assert.async();
		Promise.all([
		  sap.ui.loader._.loadJSResourceAsync("remoteanyapp/js/script.js"),
		  sap.ui.loader._.loadJSResourceAsync("remoteanyapp/js/script1.js")
		]).then(function(aResults) {
			done();
		}, function(aResults) {
			// check for script.js
			var oScript = document.querySelectorAll("[data-sap-ui-module='remoteanyapp/js/script.js']"),
				sSource = oScript && oScript[0] && oScript[0].src || "";
			assert.ok(sSource.indexOf("/~" + sTimestamp + "~/") >= 0, "URL \"" + sSource + "\" is correctly prefixed!");
			// check for script1.js
			oScript = document.querySelectorAll("[data-sap-ui-module='remoteanyapp/js/script1.js']");
			sSource = oScript && oScript[0] && oScript[0].src || "";
			assert.ok(sSource.indexOf("/~" + sTimestamp + "~/") == -1, "URL \"" + sSource + "\" should not be prefixed!");
			done();
		});

	});

	QUnit.test("check native XMLHttpRequest handling", function(assert) {
		assert.expect(2);

		var oReq = new XMLHttpRequest();
		oReq.open("GET", document.baseURI + "anyapp/js/script.js");
		assert.ok(oReq.url.indexOf("/~" + sTimestamp + "~/") != -1, "URL \"" + oReq.url + "\" is correctly prefixed!");

		oReq = new XMLHttpRequest();
		oReq.open("GET", document.baseURI + "anyapp/js/script1.js");
		assert.ok(oReq.url.indexOf("/~" + sTimestamp + "~/") == -1, "URL \"" + oReq.url + "\" should not be prefixed!");
	});

	QUnit.test("check _IconRegistry._convertUrl handling", function(assert) {
		var sUrl = _IconRegistry._convertUrl("anyapp/fonts/font.woff2");

		assert.ok(sUrl.indexOf("/~" + sTimestamp + "~/") != -1, "URL \"" + sUrl + "\" is correctly prefixed!");
	});


	QUnit.module("hook scenario", {
		beforeEach : function() {

			// count the amount of requests
			var that = this;
			this.iRequestCount = 0;

			// fake the XHR server
			this.server = sinon.fakeServer.create();

			// content of the cachebuster request for later comparision check
			this.mIndexInfo = {
				"my/view/MyView.view.js": sTimestamp,
				"my/view/MyView.controller.js": sTimestamp,
				"js/script.js": sTimestamp,
				"css/style.css": sTimestamp,
				"img/image.png": sTimestamp
			};

			// fake the cachebuster request
			this.server.respondWith(/http:\/\/anyserver.company.corp:4711\/anyapp\/sap-ui-cachebuster-info.json/, function (xhr, id) {
				xhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify(that.mIndexInfo));
				that.iRequestCount++;
			});

			// initialize the cachebuster
			AppCacheBuster.init();

		},
		afterEach : function() {

			// exits the cachebuster
			AppCacheBuster.exit();

			// unfake the server
			this.server.restore();

		}
	});

	QUnit.test("check AppCacheBuster.onIndexLoad(ed) hook", function(assert) {
		assert.expect(4);

		var that = this;
		var sLanguage = Localization.getLanguage();
		var sBaseUrl = "http://anyserver.company.corp:4711/anyapp/";
		var sCacheBusterUrl = sBaseUrl + "sap-ui-cachebuster-info.json?sap-ui-language=" + sLanguage;

		// check that the hooks are executed properly
		AppCacheBuster.onIndexLoad = function(sUrl) {
			assert.ok(sUrl === sCacheBusterUrl, "URL is correctly passed!");
		};
		AppCacheBuster.onIndexLoaded = function(sUrl, mIndexInfo) {
			assert.ok(sUrl === sCacheBusterUrl, "URL is correctly passed!");
			assert.ok(JSON.stringify(that.mIndexInfo) === JSON.stringify(mIndexInfo), "IndexInfo is correctly passed!");
		};
		AppCacheBuster.register(sBaseUrl);

		// check that the request was triggered
		assert.ok(this.iRequestCount === 1, "Request triggered!");

	});

	QUnit.test("check AppCacheBuster.onIndexLoad(ed) hook (override)", function(assert) {
		assert.expect(4);

		var sLanguage = Localization.getLanguage();
		var sBaseUrl = "http://anyserver.company.corp:4711/anyapp/";
		var sCacheBusterUrl = sBaseUrl + "sap-ui-cachebuster-info.json?sap-ui-language=" + sLanguage;

		// check that override the index load request works
		AppCacheBuster.onIndexLoad = function(sUrl) {
			assert.ok(sUrl === sCacheBusterUrl, "URL is correctly passed!");
			return {"a": "b"};
		};
		AppCacheBuster.onIndexLoaded = function(sUrl, mIndexInfo) {
			assert.ok(sUrl === sCacheBusterUrl, "URL is correctly passed!");
			assert.ok(JSON.stringify({"a": "b"}) === JSON.stringify(mIndexInfo), "IndexInfo is correctly passed!");
		};
		AppCacheBuster.register(sBaseUrl);

		// check that the request was not triggered
		assert.ok(this.iRequestCount === 0, "Request not triggered!");

	});


	QUnit.module("intercept with property descriptor overrides");

	QUnit.test("interception should not be removed when overridden", function(assert) {
		assert.expect(6);

		var descScriptSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src'),
			descLinkHref = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, 'href');

		AppCacheBuster.init();

		assert.notDeepEqual(descScriptSrc, Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src'), "Property 'src' of HTMLScriptElement is intercepted");
		assert.notDeepEqual(descLinkHref,  Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, 'href'), "Property 'href' of HTMLLinkElement is intercepted");

		// create an interceptor description which validates the value
		// of the setter whether to rewrite the URL or not
		var fnCreateInterceptorDescriptor = function(descriptor) {
			var newDescriptor = {
				get: descriptor.get,
				set: function(val) {
					descriptor.set.call(this, val);
				},
				enumerable: descriptor.enumerable,
				configurable: descriptor.configurable
			};
			newDescriptor.set.dummy = true;
			return newDescriptor;
		};

		// override property descriptors
		Object.defineProperty(HTMLScriptElement.prototype, "src", fnCreateInterceptorDescriptor(Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src')));
		Object.defineProperty(HTMLLinkElement.prototype, "href", fnCreateInterceptorDescriptor(Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src')));

		AppCacheBuster.exit();

		assert.ok(Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src').set.dummy, "Property 'src' of HTMLScriptElement is not restored when overridden");
		assert.ok(Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, 'href').set.dummy, "Property 'href' of HTMLLinkElement is not restored when overridden");

		// cleanup of property descriptors
		Object.defineProperty(HTMLScriptElement.prototype, "src", descScriptSrc);
		Object.defineProperty(HTMLLinkElement.prototype, "href", descLinkHref);

		assert.deepEqual(descScriptSrc, Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src'), "Property 'src' of HTMLScriptElement is restored");
		assert.deepEqual(descLinkHref,  Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, 'href'), "Property 'href' of HTMLLinkElement is restored");

	});


});