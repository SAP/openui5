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

	var ViewType = coreLibrary.mvc.ViewType;

	QUnit.module("sap.ui.core.mvc.View");

	QUnit.test("ID handling", function(assert) {
		assert.expect(5);

		var oView = new View("dummy", {});
		var sPrefixedId = oView.createId("anyid");
		var sLocalId = oView.getLocalId(sPrefixedId);
		var sOtherId = oView.getLocalId("anyview--anyid");
		assert.equal(sPrefixedId, "dummy--anyid");
		assert.equal(sLocalId, "anyid");
		assert.equal(sOtherId, null);
		assert.ok(oView.isPrefixedId(sPrefixedId));
		assert.notOk(oView.isPrefixedId(sLocalId));
		oView.destroy();
	});

/**
	 * @deprecated As of 1.120
	 */
	QUnit.module("sap.ui.core.mvc.View#runPreprocessor(sync)", {
		beforeEach: function() {
			this.mock = sinon.mock(XMLPreprocessor);
			this.expectProcess = this.mock.expects("process");
			this._mPreprocessors = deepExtend({}, View._mPreprocessors);
			View.PreprocessorType = { "Foo": "foo" };
		},
		afterEach: function() {
			// restore the sinon spy to original state
			this.mock.restore();
			// remove existing global preprocessors
			View._mPreprocessors = this._mPreprocessors;
			delete View.PreprocessorType;
		}
	});

	QUnit.test("runPreprocessor w/o config", function(assert) {
		assert.expect(3);
		var oSource = {},
			oView = new View({});

		assert.deepEqual(oView.mPreprocessors, { "foo": [] }, "no preprocessors stored at view");
		sinon.assert.notCalled(this.expectProcess);
		assert.equal(oView.runPreprocessor("xml", oSource, true), oSource);
	});

	QUnit.test("runPreprocessor w/ config", function(assert) {
		assert.expect(2);
		var oPreprocessors = {
				// Note: the type does matter, as it is describing the phase of view initialization in which the preprocessor is executed.
				// These types can be different for several view types.
				foo: {
					preprocessor: function() {}, // replace below once we have a mock in place!
					bindingContexts: {},
					models: {}
				}
			},
			oView = new View({
				preprocessors: oPreprocessors,
				viewName: "foo"
			});

		this.expectProcess.never();

		oPreprocessors.foo.preprocessor = {
			process: XMLPreprocessor.process
		};

		assert.strictEqual(oView.mPreprocessors.foo[0], oPreprocessors.foo, "preprocessors stored at view");
		this.expectProcess.verify();
	});

	QUnit.test("runPreprocessor w/ config and settings", function(assert) {
		assert.expect(5);
		var oPreprocessors = {
			// Note: the type does matter, as it is describing the phase of view initialization in which the preprocessor is executed.
			// These types can be different for several view types.
			foo: {
				preprocessor: function(vSource, oViewInfo, oConfig) {
					return vSource;
				},
				foofoo: "barbar",
				// internal settings for test purposes
				_settings: { foo: undefined },
				_syncSupport: true
			}
		},
			oView = new View({
				preprocessors: oPreprocessors,
				viewName: "foo"
			}),
			oSpy = this.spy(oPreprocessors.foo.preprocessor, "process");

		oView.runPreprocessor("foo", {}, true);

		oPreprocessors.foo._settings.foo = "bar";
		sinon.assert.calledOnce(oSpy);
		assert.strictEqual(oSpy.args[0][2].foo, oPreprocessors.foo._settings.foo, "Configured object instance gets passed to the preprocessor");
		assert.ok(oSpy.args[0][2].foo === "bar", "Property got set correctly");
		assert.strictEqual(oSpy.args[0][2].foofoo, oPreprocessors.foo.foofoo, "Relevant settings have been passed to the pp");
		assert.ok(Object.keys(oSpy.args[0][2]).length == 3, "Only relevant settings have been passed to the pp");
	});


	QUnit.test("runPreprocessor w/ default preprocessor for xml view", function(assert) {
		assert.expect(2);
		var oConfig = {},
			sViewContent = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc"/>'
			].join('');

		// returns the processed vSource
		this.expectProcess.returnsArg(0);

		var oView = new XMLView({
			preprocessors: {
				xml: oConfig // the type is of course important here!
			},
			viewContent: sViewContent
		});
		sinon.assert.calledOnce(this.expectProcess);
		assert.strictEqual(oView._xContent, this.expectProcess.returnValues[0]);
	});

	QUnit.test("runPreprocessor w/ invalid preprocessor", function(assert) {
		assert.expect(2);
		var oSource = {},
			oView = new View({
				preprocessors: {
					xml: [{
						preprocessor: "sap.ui.core.util.XMLPreprocessor.process",
						_syncSupport: true
					}]
				}
			});

		try {
			oView.runPreprocessor("xml", oSource, true);
			assert.ok(false);
		} catch (ex) {
			assert.ok(true, ex); // TypeError: string is not a function
		}
		sinon.assert.notCalled(this.expectProcess);
	});

	QUnit.test("runPreprocessor w/ valid preprocessor", function(assert) {
		assert.expect(1);
		var oSource = {},
			bCalled = false,
			oView = new View({
				preprocessors: {
					xml: [{
						preprocessor: {
							process: function(val) {
								bCalled = true;
								return val;
							}
						},
						_syncSupport: true
					}]
				}
			});

		try {
			oView.runPreprocessor("xml", oSource, true);
			assert.ok(bCalled, "Preprocessor executed correctly");
		} catch (ex) {
			assert.ok(false, ex); // TypeError: string is not a function
		}
	});

	QUnit.test("runPreprocessor w/o known preprocessor", function(assert) {
		assert.expect(2);
		var oSource = {},
			oView = new View({
				preprocessors: {
					foo: {}
				}
			});

		oView.runPreprocessor("foo", oSource);
		assert.ok(true); // do nothing

		sinon.assert.notCalled(this.expectProcess);
	});

	QUnit.test("runPreprocessor w/o syncSupport preprocessor", function(assert) {
		assert.expect(3);
		var oSource = {},
			bCalled = false,
			oView = new View({
				preprocessors: {
					xml: [{
						preprocessor: function(val) {
							bCalled = true;
							return val;
						}
					}]
				}
			}),
			logSpy = this.spy(Log, "debug");

		try {
			oView.runPreprocessor("xml", oSource, true);
			assert.ok(!bCalled, "Preprocessor was ignored in sync view");
			sinon.assert.calledWith(logSpy, "Async \"xml\"-preprocessor was skipped in sync view execution for undefinedView", oView.getId());
		} catch (ex) {
			assert.ok(false, ex); // TypeError: string is not a function
		}
		sinon.assert.notCalled(this.expectProcess);
	});

	QUnit.module("sap.ui.core.mvc.View#runPreprocessor (async)", {
		beforeEach: function() {
			this.mock = sinon.mock(XMLPreprocessor);
			this.expectProcess = this.mock.expects("process");
			this._mPreprocessors = deepExtend({}, View._mPreprocessors);
			View.PreprocessorType = { "Foo": "foo" };
		},
		afterEach: function() {
			// restore the sinon spy to original state
			this.mock.restore();
			delete this.expectProcess;
			// remove existing global preprocessors
			View._mPreprocessors = this._mPreprocessors;
			delete View.PreprocessorType;
		}
	});

	QUnit.test("runPreprocessor w/o config", function(assert) {
		assert.expect(3);
		var done = assert.async();
		var oSource = {},
			oView = new View({});

		assert.deepEqual(oView.mPreprocessors, { "foo": [] }, "empty preprocessors stored at view");
		sinon.assert.notCalled(this.expectProcess);

		oView.runPreprocessor("xml", oSource).then(function(vSource) {
			assert.equal(vSource, oSource);
			done();
		});
	});

	QUnit.test("runPreprocessor w/ config", function(assert) {
		assert.expect(3);
		var oPreprocessors = {
				// Note: the type does matter, as it is describing the phase of view initialization in which the preprocessor is executed.
				// These types can be different for several view types.
				foo: {
					preprocessor: function() {}, // replace below once we have a mock in place!
					bindingContexts: {},
					models: {}
				}
			},
			oResult = {foo:true},
			oSource = {bar:true},
			oViewInfo;

		return new View({
			preprocessors: oPreprocessors,
			viewName: "foo",
			async: true
		}).loaded().then(function(oView) {
			oViewInfo = {
				caller: oView + " (foo)",
				id: oView.getId(),
				name: oView.sViewName,
				componentId: undefined,
				sync: false
			};

			// instruct the mock before view creation to not miss the important call
			oPreprocessors.foo.preprocessor = Promise.resolve({
				process: XMLPreprocessor.process
			});
			this.expectProcess.returns(Promise.resolve(oResult));
			this.expectProcess.once().withExactArgs(oSource, oViewInfo, oPreprocessors.foo._settings);


			assert.strictEqual(oView.mPreprocessors.foo[0], oPreprocessors.foo, "preprocessors stored at view");

			return oView.runPreprocessor("foo", oSource).then(function(oProcessedSource) {
				assert.strictEqual(oProcessedSource, oResult, "Results equal");
				this.expectProcess.verify();
			}.bind(this));
		}.bind(this));


	});

	QUnit.test("runPreprocessor w/ config and settings", function(assert) {
		assert.expect(4);
		var done = assert.async();
		var oPreprocessors = {
			// Note: the type does matter, as it is describing the phase of view initialization in which the preprocessor is executed.
			// These types can be different for several view types.
			foo: {
				preprocessor: function(vSource, oViewInfo, oConfig) {
					return Promise.resolve(vSource);
				},
				settings: { foo: undefined }
			}
		},
		oView = new View({
			preprocessors: oPreprocessors,
			viewName: "foo",
			async: true
		});

		oView.loaded()
			.then(function(oView) {
			var oSpy;
				oPreprocessors.foo.preprocessor
					.then(function(oPreprocessorImpl) {
						oSpy = sinon.spy(oPreprocessorImpl, "process");
					});

			oView.runPreprocessor("foo", {}).then(function() {
				oPreprocessors.foo.settings.foo = "bar";
				sinon.assert.calledOnce(oSpy);
				assert.strictEqual(oSpy.args[0][2].settings.foo, oPreprocessors.foo.settings.foo, "Configured object instance gets passed to the preprocessor");
				assert.ok(oSpy.args[0][2].settings.foo === "bar", "Property got set correctly");
				assert.ok(Object.keys(oSpy.args[0][2]).length == 2, "Nothing has been added to the pp config");
				done();
			});
		});
	});

	QUnit.test("runPreprocessor w/ default preprocessor for xml view", function(assert) {
		assert.expect(3);
		var done = assert.async();
		var sViewContent = '<mvc:View xmlns:mvc="sap.ui.core.mvc"/>';

		// returns the processed vSource
		this.expectProcess.returnsArg(0);

		var oView = new XMLView({
			preprocessors: {
				xml: {} // the type is of course important here!
			},
			async: true,
			viewContent: sViewContent
		});
		oView.attachAfterInit(function() {
			sinon.assert.calledOnce(this.expectProcess);
			assert.strictEqual(oView._xContent, this.expectProcess.returnValues[0]);
			this.expectProcess.verify();
			done();
		}.bind(this));

	});

	QUnit.test("runPreprocessor w/ invalid preprocessor", function(assert) {
		assert.expect(2);
		var done = assert.async();
		var oSource = {},
			oView = new View({
				preprocessors: {
					xml: [{
						preprocessor: "sap.ui.core.util.XMLPreprocessor.process"
					}]
				},
				async: true
			});

		oView.runPreprocessor("xml", oSource).then(function() {
			assert.ok(false);
			done();
		}, function(ex) {
			assert.ok(true, ex); // TypeError: string is not a function
			sinon.assert.notCalled(this.expectProcess);
			done();
		}.bind(this));
	});

	QUnit.test("runPreprocessor w/ valid preprocessor", function(assert) {
		assert.expect(1);
		var done = assert.async();
		var oSource = {},
			bCalled = false,
			oView = new View({
				preprocessors: {
					xml: [{
						preprocessor: Promise.resolve({
							process: function(val) {
								bCalled = true;
								return Promise.resolve(val);
							}
						})
					}]
				},
				async: true
			});
		oView.loaded().then(function() {
			oView.runPreprocessor("xml", oSource).then(function() {
				assert.ok(bCalled, "preprocessor was called");
				done();
			}, function(ex) {
				assert.ok(false, ex); // TypeError: string is not a function
				done();
			});
		});
	});

	QUnit.test("runPreprocessor w/o known preprocessor", function(assert) {
		assert.expect(2);
		var done = assert.async();
		var oSource = {},
			oView = new View({
				preprocessors: {
					foo: {}
				}
			});

		oView.runPreprocessor("foo", oSource).then(function() {
			assert.ok(true); // do nothing
			sinon.assert.notCalled(this.expectProcess);
			done();
		}.bind(this));
	});

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

	QUnit.test("register global preprocessor", function(assert) {
		assert.expect(2);

		// templating preprocessor set by default
		assert.deepEqual(
			View._mPreprocessors,
			{
				"XML": {
					"xml": [
						{
							"_onDemand": true,
							"_syncSupport": true,
							"preprocessor": "sap.ui.core.util.XMLPreprocessor"
						}
					]
				}
			},
			"default templating preprocessor stored at view");

		View.registerPreprocessor("controls", this.oPreprocessor, "test", true, this.mSettings);
		// now a preprocessor is set
		assert.deepEqual(
			View._mPreprocessors["test"]["controls"],
			[{ _onDemand: false, preprocessor: this.oPreprocessor, _syncSupport: true, _settings: this.mSettings }],
			"preprocessor stored at view"
		);
	});

	QUnit.test("call method via init", function (assert) {
		assert.expect(2);
		XMLView.registerPreprocessor("controls", this.oPreprocessor, false, this.mSettings);

		return XMLView.create({
			definition: this.sViewContent
		}).then(function(oView) {
			sinon.assert.calledTwice(this.spy);
		}.bind(this));
	});

	QUnit.test("call method independent", function (assert) {
		assert.expect(4);
		var oSpy = this.spy;

		XMLView.registerPreprocessor("controls", this.oPreprocessor, false, this.mSettings);

		// init view
		return XMLView.create({
			definition: this.sViewContent
		}).then(function(oView) {
			// call independent
			oView.runPreprocessor("controls").then(function (vSource) {
				assert.ok(true, "Method called");
				sinon.assert.calledThrice(oSpy);
			});
		});
	});

	QUnit.test("run together with local preprocessor", function (assert) {
		assert.expect(5);
		var oLocalPreprocessor = function (vSource, sCaller, mSettings) {
			// async test part
			assert.ok(true, "Local Preprocessor executed with message: '" + mSettings.message + "' from '" + sCaller + "'");
			return new Promise(function (resolve) {
				resolve(vSource);
			});
		},
			mLocalSettings = {
				message: "Local preprocessor executed"
			};

		XMLView.registerPreprocessor("controls", this.oPreprocessor, false, this.mSettings);

		var oSpy = this.spy;

		// call via init
		return XMLView.create({
			definition: this.sViewContent,
			preprocessors: {
				xml: {
					preprocessor: oLocalPreprocessor,
					settings: mLocalSettings
				}
			}
		}).then(function(oView) {
			sinon.assert.calledTwice(oSpy);
			assert.ok(oView.hasPreprocessor("xml"), "active xml preprocessor");
			assert.ok(oView.hasPreprocessor("controls"), "active controls preprocessor");
		});
	});

	QUnit.test("global preprocessor and local preprocessor on one hook", function(assert) {
		assert.expect(5);
		var oLocalPreprocessor = function(vSource, sCaller, mSettings) {
			assert.ok(true, "Local preprocessor executed");
			return new Promise(function(resolve) {
				resolve(vSource);
			});
		},
			mLocalSettings = {
				message: "Local preprocessor executed"
			};

		XMLView.registerPreprocessor("controls", this.oPreprocessor, false, this.mSettings);

		var oSpy = this.spy;

		// call via init
		return XMLView.create({
			definition: this.sViewContent,
			preprocessors: {
				controls: {
					preprocessor: oLocalPreprocessor,
					settings: mLocalSettings
				}
			}
		}).then(function(oView) {
			sinon.assert.calledTwice(oSpy);
			assert.ok(!oView.hasPreprocessor("xml"), "no active xml preprocessor");
			assert.ok(oView.hasPreprocessor("controls"), "active controls preprocessor");
		});
	});

	QUnit.test("on demand preprocessor provided", function (assert) {
		assert.expect(4);
		XMLView.registerPreprocessor("xml", this.oPreprocessor, true, this.mSettings);

		var mDefaultSettings = {
			message: "OnDemand preprocessor executed"
		};

		var oSpy = this.spy;

		// call via init
		return XMLView.create({
			definition: this.sViewContent,
			preprocessors: {
				xml: {
					settings: mDefaultSettings
				}
			}
		}).then(function(oView) {
			sinon.assert.calledTwice(oSpy);
			assert.ok(oView.hasPreprocessor("xml"), "active xml preprocessor");
			assert.ok(!oView.hasPreprocessor("controls"), "no active controls preprocessor");
		});
	});

	QUnit.test("on demand preprocessor not provided", function (assert) {
		assert.expect(4);

		var logSpy = sinon.spy(Log, "debug");

		var oSpy = this.spy;

		// call via init
		return XMLView.create({
			definition: this.sViewContent
		}).then(function(oView) {
			assert.ok(!logSpy.calledWithExactly("Running preprocessor for \"xml\" via given function", oView), "No log statement");
			sinon.assert.calledTwice(oSpy);
			assert.ok(!oView.hasPreprocessor("controls"), "no active controls preprocessor");
			assert.ok(!oView.hasPreprocessor("xml"), "no active xml preprocessor");
			logSpy.restore();
		});
	});

	QUnit.test("sap.ui.core.mvc.View#getPreprocessorInfo", function(assert) {
		var oView = new View("dummy", {}),
			oPreprocessorInfo = {
				caller: "Element sap.ui.core.mvc.View#dummy (undefined)",
				componentId: undefined,
				id: "dummy",
				name: undefined,
				sync: true
			};
		assert.deepEqual(oView.getPreprocessorInfo(true), oPreprocessorInfo);
		oView.destroy();
	});

	QUnit.test("sap.ui.core.mvc.Preprocessor methods", function(assert) {
		assert.ok(TestPreprocessor.process, "process method");
		assert.ok(TestPreprocessor.getCacheKey, "getCacheKey method");
	});

	QUnit.test("sap.ui.core.mvc.Preprocessor extending module", function (assert) {
		assert.expect(2);

		var mSettings = {
			message: "TestPreprocessor executed",
			assert: assert.ok.bind(assert)
		};

		XMLView.registerPreprocessor("controls", "test-resources.sap.ui.core.qunit.mvc.testdata.TestPreprocessor", true, mSettings);

		var oSpy = this.spy;

		// call via init
		return XMLView.create({
			definition: this.sViewContent
		}).then(function(oView) {
			sinon.assert.calledTwice(oSpy);
		});
	});

	function testMultiplePreprocessors(assert) {
		assert.expect(4);

		var aPreprocessors = [{}, {}, {}];
		var iCounter = 0;
		function getPreprocessor() {
			var fnProcess = function(vSource, oViewInfo, mSettings) {
				assert.ok(true, "preprocessor " + iCounter + " executed");
				iCounter++;
				return vSource;
			};
			return function() {
				var oArgs = arguments;
				return new Promise(function(resolve) {
					setTimeout(function() {
						resolve(fnProcess.apply(null, oArgs));
					}, 100);
				});
			};
		}

		aPreprocessors.forEach(function(pp, i) {
			pp.preprocessor = getPreprocessor();
			pp._syncSupport = true;
			pp.foo = {};
		});

		return XMLView.create({
			definition: this.sViewContent,
			preprocessors: {
				xml: aPreprocessors
			}
		}).then(function(oView) {
			assert.ok(oView, "view loaded");
		});
	}

	QUnit.test("preprocessor settings - async", function(assert) {
		return testMultiplePreprocessors.call(this, assert, true);
	});

	QUnit.module("sap.ui.core.mvc.View#loaded");

	QUnit.test("Retrieve promise for view generally", function(assert) {
		assert.expect(2);
		var done = assert.async();
		var oView = new View({}),
			oPromise = oView.loaded();

		assert.ok(oPromise instanceof Promise, "Promise returned");

		oPromise.then(function(oViewLoaded) {
			assert.deepEqual(oView, oViewLoaded, "Views equal deeply");
			done();
		});
	});

	QUnit.module("View.create API");

	QUnit.test("Simple XMLView + Databinding", function (assert) {
		var done = assert.async();
		var oModel1 = new JSONModel({
			booleanValue : true,
			integerValue: "8015px",
			stringValue : 'Text1',
			data: {
				booleanValue : true,
				integerValue: 8015,
				stringValue : 'Text1'
			}
		});
		var oModel2 = new JSONModel({
			booleanValue : false,
			integerValue: "4711px",
			stringValue : '1txeT'
		});

		var xmlWithBindings = [
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">',
			'  <m:Button id="btn" enabled="{/booleanValue}" text="{/stringValue}" width="{/integerValue}" />',
			'</mvc:View>'
		].join('');

		View.create({
			type: ViewType.XML,
			definition:xmlWithBindings}
		).then(function (oViewWithBindings1) {
			oViewWithBindings1.setModel(oModel1);
			assert.equal(oViewWithBindings1.byId("btn").getEnabled(), oModel1.getData().booleanValue, "Check 'enabled' property of button 'btn'");
			assert.equal(oViewWithBindings1.byId("btn").getText(), oModel1.getData().stringValue, "Check 'text' property of button 'btn'");
			assert.equal(oViewWithBindings1.byId("btn").getWidth(), oModel1.getData().integerValue, "Check 'width' property of button 'btn'");
			// same view with ID
			View.create({
				id: "create",
				type: ViewType.XML,
				definition:xmlWithBindings
			}).then(function (oViewWithBindings2) {
				oViewWithBindings2.setModel(oModel2);
				assert.equal(oViewWithBindings2.byId("btn").getEnabled(), oModel2.getData().booleanValue, "Check 'enabled' property of button 'btn'");
				assert.equal(oViewWithBindings2.byId("btn").getText(), oModel2.getData().stringValue, "Check 'text' property of button 'btn'");
				assert.equal(oViewWithBindings2.byId("btn").getWidth(), oModel2.getData().integerValue, "Check 'width' property of button 'btn'");

				// check for correct ID handover
				assert.strictEqual(oViewWithBindings2.byId("create--btn"), oViewWithBindings2.byId("btn"), "Button is adressable by fully qualified ID");

				done();
			});
		});
	});

	QUnit.test("Owner component propagation", function (assert) {
		var done = assert.async();
		sap.ui.require([
			"sap/ui/core/Component"
		], function(Component) {
			var sDefinition = [
				"<mvc:View xmlns=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\">",
				"  <HTML />",
				"</mvc:View>"
			].join("");

			sap.ui.define("test/viewFactory/Component", [
				"sap/ui/core/Component"
			], function(Component) {
				return Component.extend("test.viewFactory.component", {
					metadata: {
						manifest: {
							"sap.app" : {
								"id" : "test.viewFactory"
							},
							"sap.ui5" : {}
						}
					}
				});
			});

			sap.ui.require(["test/viewFactory/Component"], function(TestViewFactoryComponent) {
				var oComponent = new TestViewFactoryComponent();

				oComponent.runAsOwner(function() {
					View.create({
						type: ViewType.XML,
						definition: sDefinition
					}).then(function(oView) {
						assert.strictEqual(Component.getOwnerComponentFor(oView), oComponent, "View should be created with component as owner");
						done();
					});
				});
			});
		});
	});

	QUnit.module("Typed Views", {
		beforeEach: function() {
			this.oAfterInitSpy = sinon.spy(View.prototype, "fireAfterInit");
			this.oErrorLogSpy = sinon.spy(Log, "error");
		},
		afterEach: function() {
			this.oAfterInitSpy.restore();
			this.oErrorLogSpy.restore();
		}
	});

/**
	 * @deprecated As of version 1.110
	 */
	QUnit.test("Sync view created via constructor", function(assert) {
		assert.expect(2);
		var done = assert.async();

		sap.ui.require([
			"testdata/mvc/TypedViewSyncCreateContent"
		], function(TypedView) {
			var oTypedView = new TypedView();
			assert.ok(oTypedView.isA("testdata.mvc.TypedView"), "Views is a typed view");
			assert.ok(oTypedView.byId("myPanel").isA("sap.m.Panel"), "Content created successfully");
			oTypedView.destroy();
			done();
		}, function() {
			assert.ok(false, "loading the view class failed");
			done();
		});
	});

	QUnit.test("Created via View.create", function(assert) {
		assert.expect(3);

		return View.create({
			viewName : "module:testdata/mvc/TypedView"
		}).then(function(oTypedView) {
			assert.equal(this.oAfterInitSpy.callCount, 1, "AfterInit event fired before resolving");
			assert.ok(oTypedView.isA("testdata.mvc.TypedView"), "Views is a typed view");
			assert.ok(oTypedView.byId("myPanel").isA("sap.m.Panel"), "Content created successfully");
			oTypedView.destroy();
		}.bind(this));
	});

	QUnit.test("Async typed Views embedded in XMLView", async function(assert) {
		const oXMLView = await XMLView.create({
			viewName : "testdata.mvc.XMLViewEmbeddingTypedViews"
		});

		const oPanel = oXMLView.getContent()[0];
		const aViews = oPanel.getContent();

		// wait all nested views to be processed first
		await Promise.all(aViews.map((oView) => oView.loaded()));

		assert.equal(this.oAfterInitSpy.callCount, 5, "AfterInit event fired before resolving");

		var oTypedView1 = oPanel.getContent()[0];
		assert.ok(oTypedView1, "embedded view has been created");
		assert.ok(oTypedView1.isA("testdata.mvc.TypedView"), "embedded view is a typed view");
		assert.ok(oTypedView1.byId("myPanel").isA("sap.m.Panel"), "Content created successfully");

		var oTypedView2 = oPanel.getContent()[1];
		assert.ok(oTypedView2, "another embedded view has been created");
		assert.ok(oTypedView2.isA("example.mvc.TypedView2"), "embedded view is a typed view");
		assert.ok(oTypedView2.byId("Button1").isA("sap.m.Button"), "Content created successfully");

		var oTypedView3 = oPanel.getContent()[2];
		assert.ok(oTypedView3, "embedded view with its class name defined as tag name has been created");
		assert.ok(oTypedView3.isA("testdata.mvc.TypedView"), "embedded view is a typed view");
		assert.ok(oTypedView3.byId("myPanel").isA("sap.m.Panel"), "Content created successfully");

		var oTypedView4 = oPanel.getContent()[3];
		assert.ok(oTypedView4, "embedded view with its class name defined as tag name has been created");
		assert.ok(oTypedView4.isA("testdata.mvc.TypedViewWithRenderer"), "embedded view is a typed view");
		assert.ok(oTypedView4.byId("myPanel").isA("sap.m.Panel"), "Content created successfully");
		assert.equal(oTypedView4.getMetadata().getRendererName(), "testdata.mvc.TypedViewWithRendererRenderer", "Own Renderer set correctly");
		assert.strictEqual(
			oTypedView4.getMetadata().getRenderer(),
			sap.ui.require("testdata/mvc/TypedViewWithRendererRenderer"),
			"Own Renderer set correctly");

		oXMLView.destroy();
	});
});