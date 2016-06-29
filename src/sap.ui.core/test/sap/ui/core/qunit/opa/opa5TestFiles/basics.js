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
});