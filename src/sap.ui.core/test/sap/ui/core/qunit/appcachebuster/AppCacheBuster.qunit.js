/*global document, HTMLScriptElement, HTMLLinkElement, QUnit, sinon, sap, window */

QUnit.config.autostart = false;

sap.ui.require([
	'jquery.sap.global',
	'sap/ui/Device',
	'sap/ui/base/ManagedObject',
	'sap/ui/core/AppCacheBuster',
	'sap/ui/core/Control',
	'jquery.sap.dom',
	'jquery.sap.sjax'
	], function(jQuery, Device, ManagedObject, AppCacheBuster, Control) {

	// In case of <=IE9 UI5 enables the CORS support in jQuery to allow the usage
	// of jQuery.ajax function / sinon also needs to be synchronized with this
	// adoption by applying the CORS support flag from jQuery to sinon!
	sinon.xhr.supportsCORS = jQuery.support.cors;

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

	// >>> PhantomJS fix to override getter/setters for Node objects:
	// usage of Object.getOwnPropertyDescriptor doesn't work (returns undefined)
	// unfortunately this doesn't fix overwriting the getter/setters but
	// at least the functions can be used without any issue.
	// ==> https://github.com/DevExpress/testcafe-hammerhead/issues/823
	// ==> https://github.com/ariya/phantomjs/issues/13895

	// dummy function to correct the property value of a DomRef if needed
	var fnCorrectProperty = function(oDomRef, sPropName) {
		return oDomRef && oDomRef[sPropName];
	};

	// install the property correction fix
	if (Device.browser.phantomJS) {

		// Object.getOwnPropertyDescriptor fix for PhantomJS:
		var fnGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
		Object.getOwnPropertyDescriptor = function(obj, prop) {
			var descriptor = fnGetOwnPropertyDescriptor.apply(this, arguments);
			if (!descriptor && obj instanceof Node) {
				descriptor = {
					get: function() {
						return this.val;
					},
					set: function(val) {
						this.val = val;
					},
					enumerable: true,
					configurable: true
				};
				Object.defineProperty(obj, prop, descriptor);
			}
			return descriptor;
		};

		// check the neccessity of the property fix
		var desc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src");
		Object.defineProperty(HTMLScriptElement.prototype, "src", {
			get: function() { return "Works"; },
			set: function(val) {},
			enumerable: true,
			configurable: true
		});
		if (document.createElement("script").src !== "Works!") {
			// helper to correct the property for DomRefs with the overridden property descriptor functions
			// which deactivates itself ones the PhantomJS browser supports the Object.defineProperty correct
			fnCorrectProperty = function(oDomRef, sPropName) {
				console.log("Correcting property " + sPropName + " of DOM element " + oDomRef);
				var tagName = oDomRef.tagName;
				var HTMLXXXElement = window["HTML" + (tagName.charAt(0).toUpperCase() + tagName.substr(1).toLowerCase()) + "Element"];
				var descriptor = Object.getOwnPropertyDescriptor(HTMLXXXElement.prototype, sPropName);
				descriptor.set.call(oDomRef, oDomRef[sPropName]);
				return descriptor.get.call(oDomRef);
			}
		} else {
			console.warn("\n\n\n\n\nPhantomJS supports Object.defineProperty now correctly. Workaround not required anymore!\n\n\n\n\n");
		}
		Object.defineProperty(HTMLScriptElement.prototype, "src", desc);

	}


	QUnit.module("intercept");

	QUnit.test("check method interception", function(assert) {
		assert.expect(8);

		var fnXhrOpenOrig = window.XMLHttpRequest.prototype.open,
			fnValidateProperty = ManagedObject.prototype.validateProperty,
			descScriptSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src'),
			descLinkHref = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, 'href');

		AppCacheBuster.init();

		assert.notEqual(fnXhrOpenOrig, window.XMLHttpRequest.prototype.open, "window.XMLHttpRequest.prototype.open is intercepted");
		assert.notEqual(fnValidateProperty, ManagedObject.prototype.validateProperty, "ManagedObject.prototype.validateProperty is intercepted");
		assert.notDeepEqual(Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src'), descScriptSrc, "Property 'src' of HTMLScriptElement is intercepted");
		assert.notDeepEqual(Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, 'href'), descLinkHref, "Property 'href' of HTMLLinkElement is intercepted");

		AppCacheBuster.exit();

		assert.equal(fnXhrOpenOrig, window.XMLHttpRequest.prototype.open, "window.XMLHttpRequest.prototype.open is restored");
		assert.equal(fnValidateProperty, ManagedObject.prototype.validateProperty, "ManagedObject.prototype.validateProperty is restored");
		assert.deepEqual(Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src'), descScriptSrc, "Property 'src' of HTMLScriptElement is restored");
		assert.deepEqual(Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, 'href'), descLinkHref, "Property 'href' of HTMLLinkElement is restored");

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
				this.server.respondWith(/test-resources\/sap\/ui\/core\/qunit\/appcachebuster\/((?:[^/?#]+\/)*)sap-ui-cachebuster-info.json/, function (xhr, subComponent) {
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
							"img/image.png": sTimestamp
						};
	 				}
					xhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify(index));
				});

				// initialize the cachebuster and register three components
				AppCacheBuster.init();
				AppCacheBuster.register("./"); //jQuery.sap.getModulePath("") + "/../");
				AppCacheBuster.register("./comp1/");
				AppCacheBuster.register("./comp2/");

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

		QUnit.test("check basic URL handling", function(assert) {
			assert.expect(15);

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

		});

		QUnit.test("check AJAX handling", function(assert) {
			assert.expect(2);

			// fake the script
			this.server.respondWith(/.*\/~1234567890~\/js\/script.js/, function (xhr, id) {
			    xhr.respond(200, { "Content-Type": "text/javascript" }, '');
			});
			// the script1 will not be covered by the AppCacheBuster and therefore not prefixed!
			this.server.respondWith(/js\/script1.js/, function (xhr, id) {
			    xhr.respond(200, { "Content-Type": "text/javascript" }, '');
			});

			// check normal URLs
			var oResult = jQuery.sap.sjax({
				url: "js/script.js"
			});
			assert.ok(oResult.success, "URL is correctly prefixed!");

			// check normal URLs
			var oResult = jQuery.sap.sjax({
				url: "js/script1.js"
			});
			assert.ok(oResult.success, "URL is correctly ignored!");

		});

		QUnit.test("check includeScript handling", function(assert) {
			assert.expect(1);

			var fnCreateElement = document.createElement;
			document.createElement = function(tagName) {
				var elem = fnCreateElement.call(this, tagName);
				if (tagName.toLowerCase() == "script") {
					Object.defineProperty(elem.__proto__, "src", Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src"))
				}
				return elem;
			}

			// check script prefixing
			jQuery.sap.includeScript("js/script.js", "myjs");
			var sSource = jQuery.sap.byId("myjs").attr("src");
			if (Device.browser.phantomJS) {
				sSource = fnCorrectProperty(jQuery.sap.byId("myjs")[0], "src");
			}
			assert.ok(sSource.indexOf("/~" + sTimestamp + "~/") >= 0, "URL \"" + sSource + "\" is correctly prefixed!");

		});

		QUnit.test("check includeStyleSheet handling", function(assert) {
			assert.expect(1);

			// check script prefixing
			jQuery.sap.includeStyleSheet("css/style.css", "mycss");
			var sSource = jQuery.sap.byId("mycss").attr("href");
			if (Device.browser.phantomJS) {
				sSource = fnCorrectProperty(jQuery.sap.byId("mycss")[0], "href");
			}
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
			jQuery.sap.registerModulePath("anyapp", "./");

			// check normal URLs
			var done = assert.async();
			Promise.all([
			  jQuery.sap._loadJSResourceAsync("anyapp/js/script.js"),
			  jQuery.sap._loadJSResourceAsync("anyapp/js/script1.js")
			]).then(function(aResults) {
				done();
			}, function(aResults) {
				// check for script.js
				var oScript = document.querySelectorAll("[data-sap-ui-module='anyapp/js/script.js']"),
					sSource = oScript && oScript[0] && oScript[0].src || "";
				if (Device.browser.phantomJS) {
					sSource = fnCorrectProperty(oScript[0], "src");
				}
				assert.ok(sSource.indexOf("/~" + sTimestamp + "~/") >= 0, "URL \"" + sSource + "\" is correctly prefixed!");
				// check for script1.js
				oScript = document.querySelectorAll("[data-sap-ui-module='anyapp/js/script1.js']");
				sSource = oScript && oScript[0] && oScript[0].src || "";
				if (Device.browser.phantomJS) {
					sSource = fnCorrectProperty(oScript[0], "src");
				}
				assert.ok(sSource.indexOf("/~" + sTimestamp + "~/") == -1, "URL \"" + sSource + "\" should not be prefixed!");
				done();
			});

		});

		QUnit.test("check XMLHttpRequest handling", function(assert) {
			assert.expect(2);

			var oReq = new XMLHttpRequest();
			oReq.open("GET", "js/script.js");
			assert.ok(oReq.url.indexOf("/~" + sTimestamp + "~/") != -1, "URL \"" + oReq.url + "\" is correctly prefixed!");

			oReq = new XMLHttpRequest();
			oReq.open("GET", "js/script1.js");
			assert.ok(oReq.url.indexOf("/~" + sTimestamp + "~/") == -1, "URL \"" + oReq.url + "\" should not be prefixed!");
		});

	});




	QUnit.module("remote scenario", {
		beforeEach : function() {

			// fake the XHR server
			this.server = sinon.fakeServer.create();

			// fake the cachebuster request
			this.server.respondWith(/https?:\/\/anyserver.company.corp:4711\/anyapp\/sap-ui-cachebuster-info.json/, function (xhr, id) {
			    xhr.respond(200, { "Content-Type": "application/json" },
			    	'{"my/view/MyView.view.js": "' + sTimestamp + '", ' +
			    	'"my/view/MyView.controller.js": "' + sTimestamp + '", ' +
			    	'"js/script.js": "' + sTimestamp + '", ' +
			    	'"css/style.css": "' + sTimestamp + '", ' +
			    	'"img/image.png": "' + sTimestamp + '"}');
			});

			// initialize the cachebuster
			AppCacheBuster.init();
			AppCacheBuster.register(location.protocol + "//anyserver.company.corp:4711/anyapp/");

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
		assert.ok(AppCacheBuster.convertURL(location.protocol + "//anyserver.company.corp:4711/anyapp/my/view/MyView.view.js").indexOf("/~" + sTimestamp + "~/") >= 0, "URL is correctly prefixed!");
		assert.ok(AppCacheBuster.convertURL(location.protocol + "//anyserver.company.corp:4711/anyapp/my/view/MyView1.view.js").indexOf("/~" + sTimestamp + "~/") == -1, "URL is correctly ignored!");

		// check ab-normal URLs
		assert.ok(AppCacheBuster.convertURL(location.protocol + "//anyserver.company.corp:4711/anyapp/my/../my/view/../view/MyView.view.js").indexOf("/~" + sTimestamp + "~/") >= 0, "URL is correctly prefixed!");
		assert.ok(AppCacheBuster.convertURL(location.protocol + "//anyserver.company.corp:4711/anyapp/my/../my/view/../view/MyView1.view.js").indexOf("/~" + sTimestamp + "~/") == -1, "URL is correctly ignored!");

		// check relative URLs
		assert.ok(AppCacheBuster.convertURL(location.protocol + "//anyserver.company.corp:4711/anyapp/./my/view/MyView.view.js").indexOf("/~" + sTimestamp + "~/") >= 0, "URL is correctly prefixed!");
		assert.ok(AppCacheBuster.convertURL(location.protocol + "//anyserver.company.corp:4711/anyapp/./my/view/MyView1.view.js").indexOf("/~" + sTimestamp + "~/") == -1, "URL is correctly ignored!");

		// check relative ab-normal URLs
		assert.ok(AppCacheBuster.convertURL(location.protocol + "//anyserver.company.corp:4711/anyapp/./my/../my/view/../view/MyView.view.js").indexOf("/~" + sTimestamp + "~/") >= 0, "URL is correctly prefixed!");
		assert.ok(AppCacheBuster.convertURL(location.protocol + "//anyserver.company.corp:4711/anyapp/./my/../my/view/../view/MyView1.view.js").indexOf("/~" + sTimestamp + "~/") == -1, "URL is correctly ignored!");

	});

	QUnit.test("check AJAX handling", function(assert) {
		assert.expect(2);

		// fake the script
		this.server.respondWith(/https?:\/\/anyserver.company.corp:4711\/anyapp\/~1234567890~\/js\/script.js/, function (xhr, id) {
		    xhr.respond(200, { "Content-Type": "text/javascript" }, '');
		});
		this.server.respondWith(/https?:\/\/anyserver.company.corp:4711\/anyapp\/js\/script1.js/, function (xhr, id) {
		    xhr.respond(200, { "Content-Type": "text/javascript" }, '');
		});

		// check normal URLs
		var oResult = jQuery.sap.sjax({
			url: location.protocol + "//anyserver.company.corp:4711/anyapp/js/script.js"
		});
		assert.ok(oResult.success, "URL is correctly prefixed!");

		// check normal URLs
		var oResult = jQuery.sap.sjax({
			url: location.protocol + "//anyserver.company.corp:4711/anyapp/js/script1.js"
		});
		assert.ok(oResult.success, "URL is correctly ignored!");

	});

	QUnit.test("check includeScript handling", function(assert) {
		assert.expect(1);

		// check script prefixing
		jQuery.sap.includeScript(location.protocol + "//anyserver.company.corp:4711/anyapp/js/script.js", "myjs");
		var sSource = jQuery.sap.byId("myjs").attr("src");
		if (Device.browser.phantomJS) {
			sSource = fnCorrectProperty(jQuery.sap.byId("myjs")[0], "src");
		}
		assert.ok(sSource.indexOf("/~" + sTimestamp + "~/") >= 0, "URL \"" + sSource + "\" is correctly prefixed!");

	});

	QUnit.test("check includeStyleSheet handling", function(assert) {
		assert.expect(1);

		// check script prefixing
		jQuery.sap.includeStyleSheet(location.protocol + "//anyserver.company.corp:4711/anyapp/css/style.css", "mycss");
		var sSource = jQuery.sap.byId("mycss").attr("href");
		if (Device.browser.phantomJS) {
			sSource = fnCorrectProperty(jQuery.sap.byId("mycss")[0], "href");
		}
		assert.ok(sSource.indexOf("/~" + sTimestamp + "~/") >= 0, "URL \"" + sSource + "\" is correctly prefixed!");

	});

	QUnit.test("check sap.ui.core.URI.type handling", function(assert) {
		assert.expect(1);

		// check script prefixing
		var oControl = new UriControl({
			src: location.protocol + "//anyserver.company.corp:4711/anyapp/img/image.png"
		});
		var sSource = oControl.getSrc();
		assert.ok(sSource.indexOf("/~" + sTimestamp + "~/") >= 0, "URL \"" + sSource + "\" is correctly prefixed!");
		oControl.destroy();

	});

	QUnit.test("check _loadJSResourceAsync handling", function(assert) {
		assert.expect(2);

		// register the module path to resolve the module name properly
		jQuery.sap.registerModulePath("remoteanyapp", location.protocol + "//anyserver.company.corp:4711/anyapp/");

		// check normal URLs
		var done = assert.async();
		Promise.all([
		  jQuery.sap._loadJSResourceAsync("remoteanyapp/js/script.js"),
		  jQuery.sap._loadJSResourceAsync("remoteanyapp/js/script1.js")
		]).then(function(aResults) {
			done();
		}, function(aResults) {
			// check for script.js
			var oScript = document.querySelectorAll("[data-sap-ui-module='remoteanyapp/js/script.js']"),
				sSource = oScript && oScript[0] && oScript[0].src || "";
			if (Device.browser.phantomJS) {
				sSource = fnCorrectProperty(oScript[0], "src");
			}
			assert.ok(sSource.indexOf("/~" + sTimestamp + "~/") >= 0, "URL \"" + sSource + "\" is correctly prefixed!");
			// check for script1.js
			oScript = document.querySelectorAll("[data-sap-ui-module='remoteanyapp/js/script1.js']");
			sSource = oScript && oScript[0] && oScript[0].src || "";
			if (Device.browser.phantomJS) {
				sSource = fnCorrectProperty(oScript[0], "src");
			}
			assert.ok(sSource.indexOf("/~" + sTimestamp + "~/") == -1, "URL \"" + sSource + "\" should not be prefixed!");
			done();
		});

	});

	QUnit.test("check XMLHttpRequest handling", function(assert) {
		assert.expect(2);

		var oReq = new XMLHttpRequest();
		oReq.open("GET", location.protocol + "//anyserver.company.corp:4711/anyapp/js/script.js");
		assert.ok(oReq.url.indexOf("/~" + sTimestamp + "~/") != -1, "URL \"" + oReq.url + "\" is correctly prefixed!");

		oReq = new XMLHttpRequest();
		oReq.open("GET", location.protocol + "//anyserver.company.corp:4711/anyapp/js/script1.js");
		assert.ok(oReq.url.indexOf("/~" + sTimestamp + "~/") == -1, "URL \"" + oReq.url + "\" should not be prefixed!");
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
		var sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
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
		assert.ok(this.iRequestCount === 1, "Request triggered!")

	});

	QUnit.test("check AppCacheBuster.onIndexLoad(ed) hook (override)", function(assert) {
		assert.expect(4);

		var sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
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
		assert.ok(this.iRequestCount === 0, "Request not triggered!")

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

	QUnit.start();

});
