/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/test/Opa",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/thirdparty/jquery",
	"sap/m/Button",
	"sap/ui/thirdparty/URI",
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/_OpaUriParameterParser",
	"sap/ui/test/autowaiter/_autoWaiter",
	"../utils/sinon",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (XMLView, Opa, Opa5, opaTest, $, Button, URI, _OpaLogger, _OpaUriParameterParser, _autoWaiter, sinonUtils, nextUIUpdate) {
	"use strict";

	QUnit.test("Should not execute the test in debug mode", function (assert) {
		assert.ok(!window["sap-ui-debug"], "Starting the OPA tests in debug mode is not supported since it changes timeouts");
	});

	QUnit.module("Context");

	QUnit.test("Should share a context in OPA and OPA5", function (assert) {
		// Arrange
		var oOpaContext = Opa.getContext();
		var oOpaInstanceContext = new Opa().getContext();
		var oOpa5Context = Opa5.getContext();
		var oOpa5InstanceContext = new Opa5().getContext();

		assert.strictEqual(oOpaContext, oOpaInstanceContext, "Opa and Opa instance share a context");
		assert.strictEqual(oOpaContext, oOpa5Context, "Opa and Opa5 share a context");
		assert.strictEqual(oOpaContext, oOpa5InstanceContext, "Opa and Opa5 instance share a context");
	});

	QUnit.module("OPA5 Config",{
		afterEach: function () {
			Opa5.resetConfig();
		}
	});

	function assertDefaults (assert) {
		assert.ok(!Opa.config.autoWait, "autoWait is false");
		assert.strictEqual(Opa.config.viewNamespace, "", "namespace is correct");
		assert.ok(Opa.config.visible, "visible is set");
		assert.strictEqual(Opa.config._stackDropCount, 1, "stack is cutting an additional level since OPA5 wraps waitFor");
		assert.strictEqual(Opa.config.timeout, 15, "timeout is 15 sec");
		assert.strictEqual(Opa.config.pollingInterval, 400, "polling is done every 400 ms");
	}

	QUnit.test("Should have the correct defaults", function (assert) {
		assertDefaults(assert);
	});

	QUnit.test("Should reset to the defaults", function (assert) {
		Opa5.extendConfig({
			autoWait: true,
			viewNamespace: "something",
			visible: false,
			_stackDropCount: 500,
			timeout: 500,
			pollingInterval: 500
		});

		Opa5.resetConfig();
		assertDefaults(assert);
	});

	QUnit.test("Should replace the timeout and polling interval", function (assert) {
		Opa5.extendConfig({
			timeout: 10,
			pollingInterval: 5
		});
		assert.strictEqual(Opa.config.pollingInterval, 5, "extended pollingInterval");
		assert.strictEqual(Opa.config.timeout, 10, "extended timeout");
	});

	QUnit.test("Should read application config from URL parameters", function (assert) {
		var fnOrig = URI.prototype.search;
		var oStub = sinonUtils.createStub(URI.prototype, "search", function (query) {
			if ( query === true ) {
				return {
					"newKey": "value",		// include unprefixed params
					"opaSpecific": "value",	// exclude opa params
					"notopaSpecific": "value", // include params that contain but don't start with 'opa'
					"notopaFrameKey": "value", // include params that contain but don't start with 'opaFrame'
					"opaFrameKey": "value", // include opaFrame params
					"opaKeyFrameKey": "value", // exclude opa params
					"existingKey": "value",	// uri params should override defaults
					"someTruthyValue": "True" // should not parse boolean values
				};
			}
			return fnOrig.apply(this, arguments); // should use callThrough with sinon > 3.0
		});
		Opa5._appUriParams = _OpaUriParameterParser._getAppParams();
		Opa5.extendConfig({});
		assert.strictEqual(Opa.config.appParams.newKey, "value");
		assert.strictEqual(Opa.config.appParams.specific, undefined);
		assert.strictEqual(Opa.config.appParams.notopaSpecific, "value");
		assert.strictEqual(Opa.config.appParams.notopaFrameKey, "value");
		assert.strictEqual(Opa.config.appParams.opaFrameKey, "value");
		assert.strictEqual(Opa.config.appParams.opaKeyFrameKey, undefined);
		assert.strictEqual(Opa.config.appParams.someTruthyValue, "True");
		Opa5.extendConfig({
			appParams: {
				existingKey: "oldValue"
			}
		});
		assert.strictEqual(Opa.config.appParams.existingKey, "value");

		// restore the stub and reload OPA5 so empty app params are loaded
		oStub.restore();
		Opa5._appUriParams = _OpaUriParameterParser._getAppParams();
		Opa5.resetConfig({});
		// don't check for empty appParams as the test itself could be started with some params
		assert.strictEqual(Opa.config.appParams.existingKey, undefined, "App params should be cleared now");
	});

	QUnit.test("Should have instances of OPA5 as arrangements, actions and assertions", function (assert) {
		assert.ok(Opa.config.assertions instanceof Opa5, "Assertions should be an instance of Opa5");
		assert.ok(Opa.config.actions instanceof Opa5, "Actions should be an instance of Opa5");
		assert.ok(Opa.config.arrangements instanceof Opa5, "assertions should be an instance of Opa5");
	});

	QUnit.test("Should merge OPA5 instances of arrangements, actions and assertions", function (assert) {
		["arrangements", "actions", "assertions"].forEach(function (sProperty) {
			var InitialConfig = Opa5.extend("sap.ui.test.InitialConfig", {
				overwriteProto: "foo-init",
				keepProto: "bar"
			});
			var NewConfig = Opa5.extend("sap.ui.test.NewConfig", {
				overwriteProto: "foo-new",
				newProto: "bazz"
			});

			var mInitConfig = {};
			mInitConfig[sProperty] = new InitialConfig();
			mInitConfig[sProperty].overwriteOwn = "foo-init";
			mInitConfig[sProperty].keepOwn = "bar";
			var mNewConfig = {};
			mNewConfig[sProperty] = new NewConfig();
			mNewConfig[sProperty].overwriteOwn = "foo-new";
			mNewConfig[sProperty].newOwn = "bazz";

			Opa5.extendConfig(mInitConfig);
			Opa5.extendConfig(mNewConfig);

			assert.strictEqual(Opa.config[sProperty].overwriteProto, "foo-new", "Should overwrite existing prototype value when keys duplicate");
			assert.strictEqual(Opa.config[sProperty].keepProto, "bar", "Should keep existing prototype key and value when not overriden");
			assert.strictEqual(Opa.config[sProperty].newProto, "bazz", "Should add new prototype key and value");

			assert.strictEqual(Opa.config[sProperty].overwriteOwn, "foo-new", "Should overwrite own existing value when keys duplicate");
			assert.strictEqual(Opa.config[sProperty].keepOwn, "bar", "Should keep existing own key and value when not overriden");
			assert.strictEqual(Opa.config[sProperty].newOwn, "bazz", "Should add new own key and value");
		});
	});

	QUnit.test("Should return testLib section from config", function (assert) {
		Opa5.extendConfig({
			testLibs: {
				myAwesomeTestLib: {
					key: "value"
				}
			}
		});

		assert.strictEqual(Opa5.getTestLibConfig('myAwesomeTestLib').key,"value");
		assert.propEqual(Opa5.getTestLibConfig('notExistingTestLib'),{});
	});

	QUnit.test("Should change the max log level with OPA extendConfig", function (assert) {
		var fnLogLevelSpy = sinon.spy(_OpaLogger, "setLevel");
		Opa5.extendConfig({logLevel: "trace"});
		assert.strictEqual(Opa.config.logLevel, "trace");
		sinon.assert.calledWith(fnLogLevelSpy, "trace");

		fnLogLevelSpy.reset();
		Opa.extendConfig({logLevel: "debug"});
		assert.strictEqual(Opa.config.logLevel, "debug");
		sinon.assert.calledWith(fnLogLevelSpy, "debug");
		fnLogLevelSpy.restore();
	});

	function createXmlView(sViewName) {
		var sView = [
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">',
			'<Button id="foo">',
			'</Button>',
			'<Button id="bar">',
			'</Button>',
			'<Button id="baz">',
			'</Button>',
			'<Image id="boo"></Image>',
			'</mvc:View>'
		].join('');

		return XMLView.create({
			definition: sView
		}).then(function(oView) {
			oView.setViewName(sViewName);
			return oView;
		});
	}

	QUnit.module("Config and waitFors", {
		beforeEach: function (assert) {
			// Note: This test is executed with QUnit 1 and QUnit 2.
			//       We therefore cannot rely on the built-in promise handling of QUnit 2.
			return Promise.all([
				createXmlView("my.namespace.View"),
				createXmlView("my.namespace2.View")
			]).then(function(aViews) {
				this.oView = aViews[0];
				this.oView2 = aViews[1];
				this.oButton = new Button("foo");

				this.oButton.placeAt("qunit-fixture");
				this.oView.placeAt("qunit-fixture");
				this.oView2.placeAt("qunit-fixture");

				return nextUIUpdate();
			}.bind(this));
		},
		afterEach: function () {
			this.oView.destroy();
			this.oView2.destroy();
			this.oButton.destroy();
			Opa5.resetConfig();
			return nextUIUpdate();
		}
	});

	opaTest("Should find a button with viewNamespace", function (oOpa5) {
		oOpa5.waitFor({
			id: "foo",
			success: function (oButton) {
				Opa5.assert.strictEqual(oButton, this.oButton, "got the global button");
			}.bind(this)
		});

		Opa5.extendConfig({
			viewNamespace: "my.namespace."
		});

		oOpa5.waitFor({
			id: "foo",
			viewName: "View",
			success: function (oButton) {
				Opa5.assert.strictEqual(oButton, this.oView.byId("foo"), "got the button of view 1");
			}.bind(this)
		});

		Opa5.extendConfig({
			viewNamespace: "my.namespace2."
		});

		oOpa5.waitFor({
			id: "foo",
			viewName: "View",
			success: function (oButton) {
				Opa5.assert.strictEqual(oButton, this.oView2.byId("foo"), "got the button of view 2");
			}.bind(this)
		});
	});

	QUnit.module("Parameter validation", {
		beforeEach: function () {
			this.oOpa = new Opa5();
		}
	});

	["error", "success", "check"].forEach(function (sParameter) {
		QUnit.test("Should throw an error if the " + sParameter + " parameter is not a function", function (assert) {
			assert.throws(function () {
				var oWaitFor = {};
				oWaitFor[sParameter] = "foo";
				this.oOpa.waitFor(oWaitFor);
			}.bind(this),
			new Error("sap.ui.test.Opa5#waitFor - the '" + sParameter + "' parameter needs to be a function but "
				+ "'foo' was passed")
			, "threw the error");
		});
	});

	QUnit.test("Should not throw an error if all valid parameters are given", function (assert) {
		this.oOpa.waitFor({
			id: "foo",
			viewName: "bar",
			viewNamespace: "baz",
			timeout: 10,
			pollingInterval: 20,
			visible: true,
			matchers: $.noop,
			check: $.noop,
			success: $.noop,
			error: $.noop,
			errorMessage: "foo",
			actions: $.noop,
			_stackDropCount: 1,
			_stack: "foo"
		});

		// cancel the wait for
		Opa5.stopQueue();
		assert.ok(true, "no exception was thrown");
	});

	QUnit.test("Should throw an error if you pass unknown properties to waitFor", function (assert) {
		assert.throws(function () {
			this.oOpa.waitFor({
				foo: "bar",
				bar: "foo"
			});
		}, new Error("Multiple errors where thrown sap.ui.test.Opa5#waitFor\n" +
			"the property 'foo' is not defined in the API\n" +
			"the property 'bar' is not defined in the API"), "an error containing both property names was thrown");
	});

	QUnit.module("waitFor", {
		beforeEach: function (assert) {
			// Note: This test is executed with QUnit 1 and QUnit 2.
			//       We therefore cannot rely on the built-in promise handling of QUnit 2.
			var sView = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">',
				'<Button id="foo"/>',
				'</mvc:View>'
			].join('');

			return XMLView.create({
				id: "globalId",
				definition: sView
			}).then(function(oView) {
				this.oView = oView;
				this.oView.setViewName("myViewName");
				this.oView.placeAt("qunit-fixture");
				return nextUIUpdate();
			}.bind(this));
		},
		afterEach: function () {
			this.oView.destroy();
			Opa5.resetConfig();
			return nextUIUpdate();
		}
	});

	opaTest("Should find a view if id as regex and controlType are set", function (oOpa) {
		oOpa.waitFor({
			id: /global/,
			controlType: "sap.ui.core.mvc.XMLView",
			success: function (aViews) {
				Opa5.assert.strictEqual(aViews.length, 1, "Only one view is found");
				Opa5.assert.strictEqual(aViews[0], this.oView, "correct view instance");
			}.bind(this)
		});
	});

	opaTest("Should find a view if id and controlType are set", function (oOpa) {
		oOpa.waitFor({
			id: "globalId",
			controlType: "sap.ui.core.mvc.XMLView",
			success: function (oView) {
				Opa5.assert.strictEqual(oView, this.oView, "correct view instance");
			}.bind(this)
		});
	});

	opaTest("Should find a button if id, controlType and viewName are set", function (oOpa) {
		oOpa.waitFor({
			id: "foo",
			controlType: "sap.m.Button",
			viewName: "myViewName",
			success: function (oButton) {
				Opa5.assert.strictEqual(oButton, this.oView.byId("foo"), "correct button instance");
			}.bind(this)
		});
	});

	opaTest("Should invoke check and success if nothing else is specified", function (oOpa) {
		oOpa.waitFor({
			check: function () {
				Opa5.assert.strictEqual(arguments.length, 0);
				return true;
			},
			success: function () {
				Opa5.assert.strictEqual(arguments.length, 0);
			}
		});
	});

	opaTest("Should wait for promise scheduled on flow", function (oOpa) {
		Opa5.assert.expect(2);
		var bPromiseDone;
		var fnOriginalSchedule = Opa.prototype._schedulePromiseOnFlow;
		Opa.prototype._schedulePromiseOnFlow = function (oPromise, oOptions) {
			var aFalsyOptions = Object.keys(oOptions).filter(function (sOption) {
				return !oOptions[sOption];
			});
			Opa5.assert.strictEqual(aFalsyOptions.length, 5, "Should assign empty values to all options");
			return fnOriginalSchedule.apply(this, arguments);
		};
		var oPromise = new Promise(function (resolve) {
			setTimeout(function () {
				bPromiseDone = true;
				resolve();
			}, 200);
		});
		oOpa.iWaitForPromise(oPromise);
		oOpa.waitFor({
			success: function () {
				Opa5.assert.ok(bPromiseDone, "Should wait for scheduled promise");
			}
		});
	});

	QUnit.module("Config and waitFor",{
		beforeEach: function (assert) {
			// Note: This test is executed with QUnit 1 and QUnit 2.
			//       We therefore cannot rely on the built-in promise handling of QUnit 2.
			var sView = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">',
					'<Button id="foo"/>',
				'</mvc:View>'
			].join('');

			return XMLView.create({
				id: "myView",
				definition: sView
			}).then(function(oView) {
				this.oView = oView;
				Opa5.extendConfig({
					// make the test fast
					pollingInterval: 50,
					viewNamespace: "namespace.",
					viewName: "viewName"
				});
				return nextUIUpdate();
			}.bind(this));
		},
		afterEach: function () {
			this.oView.destroy();
			Opa5.resetConfig();
			return nextUIUpdate();
		}
	});

	opaTest("Should take the viewNamespace and viewname from the config", function (opa) {
		this.oView.setViewName("namespace.viewName");
		this.oView.placeAt("qunit-fixture");
		opa.waitFor({
			id: "foo",
			success: function (oButton) {
				Opa5.assert.ok(oButton, "a button was found");
			}
		});
	});

	opaTest("Should take the viewNamespace and overwrite the viewname", function (opa) {
		this.oView.setViewName("namespace.otherViewName");
		this.oView.placeAt("qunit-fixture");
		opa.waitFor({
			id: "foo",
			viewName: "otherViewName",
			success: function (oButton) {
				Opa5.assert.ok(oButton, "a button was found");
			}
		});
	});

});
