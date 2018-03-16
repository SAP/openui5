sap.ui.define([
		"sap/ui/test/Opa",
		"sap/ui/test/Opa5",
		"sap/ui/test/opaQunit",
		"jquery.sap.global",
		"sap/m/Button",
		"sap/ui/thirdparty/URI",
		"unitTests/utils/loggerInterceptor"
	], function (Opa, Opa5, opaTest, $, Button, URI, loggerInterceptor) {

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

	QUnit.test("Should have instances of OPA5 in the config", function (assert) {
		assert.ok(Opa.config.assertions instanceof Opa5, "assertions is an Opa5");
		assert.ok(Opa.config.actions instanceof Opa5, "assertions is an Opa5");
		assert.ok(Opa.config.arrangements instanceof Opa5, "assertions is an Opa5");
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

	QUnit.test("Should replace the OPA5 instances but keep their own functions and properties", function (assert) {
		Opa.config.assertions.foo = "bar";
		Opa.config.actions.func = $.noop;
		var oNewAssertions = new Opa5(),
			oNewActions = new Opa5();

		oNewAssertions.foo = "baz";
		Opa5.extendConfig({
			assertions: oNewAssertions,
			actions: oNewActions
		});

		assert.strictEqual(Opa.config.assertions, oNewAssertions, "Assertions have been replaced");
		assert.strictEqual(Opa.config.actions, oNewActions, "Actions have been replaced");
		assert.strictEqual(oNewAssertions.foo, "baz", "the new property wins vs the old one");
		assert.strictEqual(oNewActions.func, $.noop, "kept the func property");
	});

	QUnit.test("Should replace the timeout and polling interval", function (assert) {
		Opa5.extendConfig({
			timeout: 10,
			pollingInterval: 5
		});
		assert.strictEqual(Opa.config.pollingInterval, 5, "extended pollingInterval");
		assert.strictEqual(Opa.config.timeout, 10, "extended timeout");
	});

	QUnit.test("Should read a config value from URL parameter", function (assert) {
		var fnDone = assert.async();
		var fnOrig = URI.prototype.search;
		var oStub = sinon.stub(URI.prototype, "search", function (query) {
			if ( query === true ) {
				return {
					"newKey": "value",		// should parse unprefixed params
					"opaSpecific": "value",	// should exclude opa params
					"opaFrameKey": "value", // should not exclude opaFrame params
					"opaKeyFrameKey": "value", // should exclude opa params
					"existingKey": "value"	// uri params should override defaults
				};
			}
			return fnOrig.apply(this, arguments); // should use callThrough with sinon > 3.0
		});
		$.sap.unloadResources("sap/ui/test/Opa5.js", false, true, true);

		sap.ui.require(["sap/ui/test/Opa5","sap/ui/test/Opa"], function (Opa5,Opa) {
			assert.strictEqual(Opa.config.appParams.newKey, "value");
			assert.strictEqual(Opa.config.appParams.specific, undefined);
			assert.strictEqual(Opa.config.appParams.opaFrameKey, "value");
			assert.strictEqual(Opa.config.appParams.opaKeyFrameKey, undefined);
			Opa5.extendConfig({
				appParams: {
					existingKey: "oldValue"
				}
			});
			assert.strictEqual(Opa.config.appParams.existingKey, "value");

			// restore the stub and reload OPA5 so empty app params are loaded
			oStub.restore();
			$.sap.unloadResources("sap/ui/test/Opa5.js", false, true, true);
			sap.ui.require(["sap/ui/test/Opa5","sap/ui/test/Opa"], function (Opa5,Opa) {
				// should not check for empty appParams
				// as the test itself could be started with some params
				assert.strictEqual(Opa.config.appParams.existingKey, undefined,
					"App params should be cleared now");
				fnDone();
			});
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
		var fnLogLevelSpy = sinon.spy(sap.ui.test._OpaLogger, "setLevel");
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
			'<core:View xmlns:core="sap.ui.core" xmlns="sap.m">',
			'<Button id="foo">',
			'</Button>',
			'<Button id="bar">',
			'</Button>',
			'<Button id="baz">',
			'</Button>',
			'<Image id="boo"></Image>',
			'</core:View>'
		].join('');
		var oView;

		oView = sap.ui.xmlview({ viewContent: sView});
		oView.setViewName(sViewName);
		return oView;
	}

	QUnit.module("Config and waitFors", {
		beforeEach: function () {
			this.oView = createXmlView("my.namespace.View");
			this.oView2 = createXmlView("my.namespace2.View");
			this.oButton = new Button("foo");

			this.oButton.placeAt("qunit-fixture");
			this.oView.placeAt("qunit-fixture");
			this.oView2.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oView.destroy();
			this.oView2.destroy();
			this.oButton.destroy();
			Opa5.resetConfig();
			sap.ui.getCore().applyChanges();
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
		assert.ok(true, "no exception was thrown")
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
		beforeEach: function () {
			var sView = [
				'<core:View xmlns:core="sap.ui.core" xmlns="sap.ui.commons">',
				'<Button id="foo"/>',
				'</core:View>'
			].join('');

			this.oView = sap.ui.xmlview({id: "globalId", viewContent: sView});
			this.oView.setViewName("myViewName");
			this.oView.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oView.destroy();
			sap.ui.getCore().applyChanges();
			Opa5.resetConfig();
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
			controlType: "sap.ui.commons.Button",
			viewName: "myViewName",
			success: function (oButton) {
				Opa5.assert.strictEqual(oButton, this.oView.byId("foo"), "correct button instance");
			}.bind(this)
		});
	});

	QUnit.module("Config and waitFor",{
		beforeEach: function () {
			var sView = [
				'<core:View xmlns:core="sap.ui.core" xmlns="sap.ui.commons">',
					'<Button id="foo"/>',
				'</core:View>'
			].join('');

			this.oView = sap.ui.xmlview({id: "myView", viewContent: sView});
			sap.ui.getCore().applyChanges();
			Opa5.extendConfig({
				// make the test fast
				pollingInterval: 50,
				viewNamespace: "namespace.",
				viewName: "viewName"
			});
		},
		afterEach: function () {
			this.oView.destroy();
			sap.ui.getCore().applyChanges();
			Opa5.resetConfig();
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

	QUnit.module("AutoWait Config", {
		afterEach: function () {
			Opa5.resetConfig();
		}
	});

	opaTest("Should change autoWait timeout delay through extendConfig", function (oOpa) {
		var fnHasToWait = sinon.spy(sap.ui.test.autowaiter._autoWaiter, "hasToWait");
		Opa5.extendConfig({
			autoWait: {
				timeoutWaiter: {
					maxDelay: 400
				}
			}
		});
		oOpa.waitFor({
			check: function () {
				return setTimeout(function () {},  401);
			},
			success: function () {
				sinon.assert.called(fnHasToWait, "Should call autoWait");
				fnHasToWait.reset();
			}.bind(this)
		});

		Opa5.extendConfig({
			autoWait: true
		});
		oOpa.waitFor({
			check: function () {
				return setTimeout(function () {},  1001);
			},
			success: function () {
				// default maxDelay 1000 is used again
				sinon.assert.called(fnHasToWait, "Should call autoWait");
				fnHasToWait.restore();
			}.bind(this)
		});
	});

	opaTest("Should change autoWait timeout delay through waitFor params", function (oOpa) {
		var fnHasToWait = sinon.spy(sap.ui.test.autowaiter._autoWaiter, "hasToWait");

		oOpa.waitFor({
			autoWait: {
				timeoutWaiter: {
					maxDelay: 1001
				}
			},
			success: function () {
				setTimeout(function () {}, 1002);
				return oOpa.waitFor({
					success: function () {
						sinon.assert.called(fnHasToWait, "Should call autoWait");
						// maxDelay is 1001 for this waitFor only
						fnHasToWait.reset();
					}.bind(this)
				});
			}.bind(this)
		});

		oOpa.waitFor({
			success: function () {
				setTimeout(function () {}, 1002);
				return oOpa.waitFor({
					success: function () {
						sinon.assert.notCalled(fnHasToWait, "Should not call autoWait");
						// default maxDelay 1000 is used again
						fnHasToWait.restore();
					}.bind(this)
				});
			}.bind(this)
		});
	});
});
