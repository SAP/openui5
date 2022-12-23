/* global QUnit, sinon */
sap.ui.define([
	"sap/base/util/deepExtend",
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/util/XMLPreprocessor",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/library",
	"./testdata/TestPreprocessor",
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
});