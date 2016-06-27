sap.ui.define([
		"sap/ui/test/Opa",
		"sap/ui/test/Opa5",
		"sap/ui/test/opaQunit",
		'jquery.sap.global'
	], function (Opa, Opa5, opaTest, $) {
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
			"The property 'foo' is not defined in the API\n" +
			"The property 'bar' is not defined in the API"), "an error containing both property names was thrown");
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