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