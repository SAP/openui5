/* global QUnit, sinon */
sap.ui.define([
	"sap/base/util/deepExtend",
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/util/XMLPreprocessor",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/library",
	"../mvc/testdata/TestPreprocessor",
	"sap/base/Log"
], function(deepExtend, View, XMLView, XMLPreprocessor, JSONModel, coreLibrary, TestPreprocessor, Log) {
	"use strict";

	QUnit.module("sap.ui.core.mvc.View#registerPreprocessor", {
		beforeEach: function(assert) {
			this._mPreprocessors = deepExtend({}, View._mPreprocessors);
			this.sViewContent = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc"/>'
			].join('');
			this.oPreprocessor = function(vSource, sCaller, mSettings) {
				assert.ok(true, "Preprocessor executed with message: '" + mSettings.message + "' from '" + sCaller + "'");
				return new Promise(function(resolve) {
					resolve(vSource);
				});
			};
			this.mSettings = {
				message: "Preprocessor executed"
			};
			this.spy = sinon.spy(View.prototype, "runPreprocessor");
		},
		afterEach: function() {
			// restore the sinon spy to original state
			View.prototype.runPreprocessor.restore();
			// remove existing global preprocessors
			View._mPreprocessors = this._mPreprocessors;
			this.spy.restore();
		}
	});

	QUnit.test("call method via init", function(assert) {
		assert.expect(2);
		var done = assert.async();

		XMLView.registerPreprocessor("controls", this.oPreprocessor, false, this.mSettings);

		// call by init
		var oView = sap.ui.xmlview({
			viewContent: this.sViewContent,
			async: true
		});

		oView.attachAfterInit(function() {
			sinon.assert.calledTwice(this.spy);
			done();
		}.bind(this));
	});

	QUnit.test("call method independent", function(assert) {
		assert.expect(4);
		var done = assert.async();

		XMLView.registerPreprocessor("controls", this.oPreprocessor, false, this.mSettings);

		// init view
		var oView = sap.ui.xmlview({
			viewContent: this.sViewContent,
			async: true
		});

		var oSpy = this.spy;
		oView.attachAfterInit(function() {
			// call independent
			oView.runPreprocessor("controls").then(function(vSource) {
				assert.ok(true, "Method called");
				sinon.assert.calledThrice(oSpy);
				done();
			});
		});

	});

	QUnit.test("run async preprocessors", function(assert) {
		assert.expect(2);
		var done = assert.async();

		XMLView.registerPreprocessor("controls", this.oPreprocessor, false, this.mSettings);

		// call via init
		var oView = sap.ui.xmlview({
			viewContent: this.sViewContent,
			async: true
		});

		var oSpy = this.spy;
		oView.attachAfterInit(function() {
			sinon.assert.calledTwice(oSpy);
			done();
		});

	});

	QUnit.test("run together with local preprocessor", function(assert) {
		assert.expect(5);
		var done = assert.async();
		var oLocalPreprocessor = function(vSource, sCaller, mSettings) {
			// async test part
			assert.ok(true, "Local Preprocessor executed with message: '" + mSettings.message + "' from '" + sCaller + "'");
			return new Promise(function(resolve) {
				resolve(vSource);
			});
		},
			mLocalSettings = {
				message: "Local preprocessor executed"
			};

		XMLView.registerPreprocessor("controls", this.oPreprocessor, false, this.mSettings);

		// call via init
		var oView = sap.ui.xmlview({
			viewContent: this.sViewContent,
			preprocessors: {
				xml: {
					preprocessor: oLocalPreprocessor,
					settings: mLocalSettings
				}
			},
			async: true
		});

		var oSpy = this.spy;
		oView.attachAfterInit(function() {
			sinon.assert.calledTwice(oSpy);
			assert.ok(oView.hasPreprocessor("xml"), "active xml preprocessor");
			assert.ok(oView.hasPreprocessor("controls"), "active controls preprocessor");
			done();
		});
	});

	QUnit.test("on demand preprocessor provided", function(assert) {
		assert.expect(4);
		var done = assert.async();
		XMLView.registerPreprocessor("xml", this.oPreprocessor, true, this.mSettings);

		var mDefaultSettings = {
			message: "OnDemand preprocessor executed"
		};

		// call via init
		var oView = sap.ui.xmlview({
			viewContent: this.sViewContent,
			// provide anonymous xml preprocessor
			preprocessors: {
				xml: {
					settings: mDefaultSettings
				}
			},
			async: true
		});

		var oSpy = this.spy;
		oView.attachAfterInit(function() {
			sinon.assert.calledTwice(oSpy);
			assert.ok(oView.hasPreprocessor("xml"), "active xml preprocessor");
			assert.ok(!oView.hasPreprocessor("controls"), "no active controls preprocessor");
			done();
		});
	});

	QUnit.test("on demand preprocessor not provided", function(assert) {
		assert.expect(4);
		var done = assert.async();

		var logSpy = sinon.spy(Log, "debug");

		// call via init
		var oView = sap.ui.xmlview({
			// do not provide preprocessor here
			viewContent: this.sViewContent,
			async: true
		});

		var oSpy = this.spy;
		oView.attachAfterInit(function() {
			assert.ok(!logSpy.calledWithExactly("Running preprocessor for \"xml\" via given function", oView), "No log statement");
			sinon.assert.calledTwice(oSpy);
			assert.ok(!oView.hasPreprocessor("controls"), "no active controls preprocessor");
			assert.ok(!oView.hasPreprocessor("xml"), "no active xml preprocessor");
			logSpy.restore();
			done();
		});
	});

	QUnit.test("sap.ui.core.mvc.Preprocessor extending module", function(assert) {
		assert.expect(2);
		var done = assert.async();

		var mSettings = {
			message: "TestPreprocessor executed",
			assert: assert.ok.bind(assert)
		};

		XMLView.registerPreprocessor("controls", "test-resources.sap.ui.core.qunit.mvc.testdata.TestPreprocessor", true, mSettings);

		// call via init
		var oView = sap.ui.xmlview({
			viewContent: this.sViewContent,
			async: true
		});

		var oSpy = this.spy;
		// twice, default + the registered one
		oView.attachAfterInit(function() {
			sinon.assert.calledTwice(oSpy);
			done();
		});
	});

	function testMultiplePreprocessorsSync(assert) {
		assert.expect(7);

		var aPreprocessors = [{}, {}, {}];
		var iCounter = 0;
		function getPreprocessor() {
			var fnProcess = function (vSource, oViewInfo, mSettings) {
				assert.ok(true, "preprocessor " + iCounter + " executed");
				assert.strictEqual(mSettings.foo, aPreprocessors[iCounter]._settings.foo, "correct settings passed");
				iCounter++;
				return vSource;
			};
			return fnProcess;
		}

		aPreprocessors.forEach(function (pp, i) {
			pp.preprocessor = getPreprocessor();
			pp._syncSupport = true;
			pp.foo = {};
		});

		return sap.ui.xmlview({
			viewContent: this.sViewContent,
			preprocessors: {
				xml: aPreprocessors
			}
		}).loaded().then(function (oView) {
			assert.ok(oView, "view loaded");
		});
	}

	QUnit.test("preprocessor settings - sync", function(assert) {
		return testMultiplePreprocessorsSync.call(this, assert);
	});

	QUnit.module("Typed Views", {
		beforeEach: function () {
			this.oAfterInitSpy = sinon.spy(View.prototype, "fireAfterInit");
			this.oErrorLogSpy = sinon.spy(Log, "error");
		},
		afterEach: function () {
			this.oAfterInitSpy.restore();
			this.oErrorLogSpy.restore();
		}
	});

	QUnit.test("Sync view created via sap.ui.view - async=false", function (assert) {
		assert.expect(4);

		var oTypedView = sap.ui.view({
			type: "JS",
			viewName: "module:testdata/mvc/TypedViewSyncCreateContent"
		});
		assert.ok(oTypedView.isA("testdata.mvc.TypedView"), "Views is a typed view");
		assert.ok(oTypedView.byId("myPanel").isA("sap.m.Panel"), "Content created successfully");
		assert.ok(this.oErrorLogSpy.calledOnce, "Error logged for wrong type usage");
		assert.ok(this.oErrorLogSpy.calledWithExactly("When using the view factory, the 'type' setting must be omitted for typed views. When embedding typed views in XML, don't use the <JSView> tag, use the <View> tag instead."), "error is logged with correct message");
		oTypedView.destroy();
	});

	QUnit.test("Sync view created via sap.ui.view - async=true", function (assert) {
		assert.expect(4);

		var oTypedView = sap.ui.view({
			type: "JS",
			viewName: "module:testdata/mvc/TypedViewSyncCreateContent",
			async: true
		});
		return oTypedView.loaded().then(function (oView) {
			assert.ok(oView.isA("testdata.mvc.TypedView"), "Views is a typed view");
			assert.ok(oView.byId("myPanel").isA("sap.m.Panel"), "Content created successfully");
			assert.ok(this.oErrorLogSpy.calledOnce, "Error logged for wrong type usage");
			assert.ok(this.oErrorLogSpy.calledWithExactly("When using the view factory, the 'type' setting must be omitted for typed views. When embedding typed views in XML, don't use the <JSView> tag, use the <View> tag instead."), "error is logged with correct message");
			oView.destroy();
		}.bind(this));
	});

	QUnit.test("Async view created via constructor", function (assert) {
		assert.expect(3);

		var pRequire = new Promise(function (res, rej) {
			sap.ui.require(["testdata/mvc/TypedView"], function (TypedView) {
				res(TypedView);
			});
		});

		return pRequire.then(function (TypedView) {
			assert.throws(function () {
				sap.ui.view({
					type: "JS",
					viewName: "module:testdata/mvc/TypedView"
				});
			}, new Error("An asynchronous view (createContent) cannot be instantiated synchronously. Affected view: 'testdata.mvc.TypedView'."));
			assert.ok(this.oErrorLogSpy.calledOnce, "Error logged for wrong type usage");
			assert.ok(this.oErrorLogSpy.calledWithExactly("When using the view factory, the 'type' setting must be omitted for typed views. When embedding typed views in XML, don't use the <JSView> tag, use the <View> tag instead."), "error is logged with correct message");
		}.bind(this));
	});

	QUnit.test("Async and sync typed Views embedded in XMLView", function (assert) {
		return XMLView.create({
			viewName: "testdata.mvc_legacyAPIs.XMLViewEmbeddingTypedViews"
		}).then(function (oXMLView) {
			assert.expect(22);
			assert.equal(this.oAfterInitSpy.callCount, 7, "AfterInit event fired before resolving");

			var oPanel = oXMLView.getContent()[0];
			var oTypedView1 = oPanel.getContent()[0];
			assert.ok(oTypedView1, "embedded view without async=true flag has been created");
			assert.ok(oTypedView1.isA("testdata.mvc.TypedView"), "embedded view is a typed view");
			assert.ok(oTypedView1.byId("myPanel").isA("sap.m.Panel"), "Content created successfully");

			var oTypedView2 = oPanel.getContent()[1];
			assert.ok(oTypedView2, "embedded view with async=false flag has been created");
			assert.ok(oTypedView2.isA("testdata.mvc.TypedView"), "embedded view is a typed view");
			// Note: the async factory should wait for async child views
			assert.ok(oTypedView2.byId("myPanel").isA("sap.m.Panel"), "Content created successfully");

			var oTypedView3 = oPanel.getContent()[2];
			assert.ok(oTypedView3, "embedded view with async=false flag has been created");
			assert.ok(oTypedView3.isA("testdata.mvc.TypedView"), "embedded view is a typed view");
			assert.ok(oTypedView3.byId("myPanel").isA("sap.m.Panel"), "Content created successfully");

			var oTypedView4 = oPanel.getContent()[3];
			assert.ok(oTypedView4, "embedded view with async=true flag has been created");
			assert.ok(oTypedView4.isA("testdata.mvc.TypedView"), "embedded view is a typed view");
			assert.ok(oTypedView4.byId("myPanel").isA("sap.m.Panel"), "Content created successfully");

			var oTypedView5 = oPanel.getContent()[4];
			assert.ok(oTypedView5, "embedded view with async=true flag has been created");
			assert.ok(oTypedView5.isA("testdata.mvc.TypedViewWithRenderer"), "embedded view is a typed view");
			assert.ok(oTypedView5.byId("myPanel").isA("sap.m.Panel"), "Content created successfully");
			assert.equal(oTypedView5.getMetadata().getRendererName(), "testdata.mvc.TypedViewWithRendererRenderer", "Own Renderer set correctly");

			var oView6 = oPanel.getContent()[5];
			assert.ok(oView6, "embedded view with async=true flag has been created");
			assert.ok(oView6.isA("sap.ui.core.mvc.JSView"), "embedded view is js view");
			assert.ok(oView6.byId("Label1").isA("sap.m.Label"), "Content created successfully");
			assert.equal(oView6.getMetadata().getRendererName(), "sap.ui.core.mvc.JSViewRenderer", "Renderer set correctly");
			oXMLView.destroy();
		}.bind(this));
	});

	QUnit.test("loadControllerClass >> prevent max call stack issue", (assert) => {
		// Controller definition
		sap.ui.predefine("my/own/Main.controller", [
		  "sap/ui/core/mvc/Controller"
		], function (Controller) {
		  // define a new controller
		  return Controller.extend("my.own.Main", {
			  doSomething: function () {
			  }
		  });
		});

		// View definition
		sap.ui.predefine("my/own/Main.view", [
				"sap/ui/core/mvc/View",
				"sap/m/Button"
		  ], function (View, Button) {
			// define a new typed view
			return View.extend("my.own.Main", {
				getControllerName: function () {
					return "my.own.Main";
				},

				getAutoPrefixId: function () {
					return true;
				},

				createContent: function (oController) {
					return new Button({ text: 'Button pressed!', press: oController.doSomething });
				}
			});
		});

		const expectedErrorMsg = `The controller 'my.own.Main' define for the View with ID 'myOwnView' is not a valid Controller, but rather a View. ` +
			`This happens when the View and Controller classes have the same fully qualified class name. Please make sure that the class names in` +
			`Controller.extend("...") and the View.extend("...") call differ. If you migrated a 'JSView' to a 'Typed View' please refer to the documentation section under 'Typed View'`;

		return View.create({
			id: "myOwnView",
			viewName: "module:my/own/Main.view"
		}).catch((err) => {
			assert.equal(err.message, expectedErrorMsg, "Correct Error thrown");
		});
	});
});
