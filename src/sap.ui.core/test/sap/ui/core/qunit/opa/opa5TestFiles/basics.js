sap.ui.define([
		"sap/ui/test/Opa",
		"sap/ui/test/Opa5",
		"sap/ui/test/opaQunit",
		"jquery.sap.global",
		"sap/m/Button"
	], function (Opa, Opa5, opaTest, $, Button) {
	QUnit.module("wait for basics", {
		beforeEach: function () {
			this.oOpa5 = new Opa5();
		}
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

	QUnit.module("extend config",{
		afterEach: function () {
			Opa5.resetConfig();
		}
	});

	QUnit.test("Should have instances of OPA5 in the config", function (assert) {
		assert.ok(Opa.config.assertions instanceof Opa5, "assertions is an Opa5");
		assert.ok(Opa.config.actions instanceof Opa5, "assertions is an Opa5");
		assert.ok(Opa.config.arrangements instanceof Opa5, "assertions is an Opa5");
	});

	QUnit.test("Should have the correct defaults", function (assert) {
		assert.strictEqual(Opa.config.viewNamespace, "", "namespace is correct");
		assert.strictEqual(Opa.config.visible, true, "visible is set");
		assert.strictEqual(Opa.config._stackDropCount, 1, "stack is cutting an additional level since OPA5 wraps waitFor");
		assert.strictEqual(Opa.config.timeout, 15, "timeout is 15 sec");
		assert.strictEqual(Opa.config.pollingInterval, 400, "polling is done every 400 ms");
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

	QUnit.test("Should throw an error if the error parameter is not a function", function (assert) {
		assert.throws(function () {
			this.oOpa.waitFor({
				error: "foo"
			});
		}.bind(this),
			new Error("sap.ui.test.Opa#waitFor - the 'error' parameter needs to be a function but "
				+ "'foo' was passed")
			, "threw the error");
	});

	QUnit.test("Should not throw an error if all valid parameters are given", function (assert) {
		this.oOpa.waitFor({
			id: "foo",
			viewName: "bar",
			viewNamespace: "baz",
			timeout: 10,
			pollingInterval: 20,
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
});