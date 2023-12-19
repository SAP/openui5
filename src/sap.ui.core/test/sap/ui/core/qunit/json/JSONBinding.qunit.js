/*global QUnit */
sap.ui.define([
	"sap/ui/model/Context",
	"sap/ui/model/json/JSONModel"
], function(
	Context,
	JSONModel
) {
	"use strict";

	var testData = {
		teamMembers: [
			{firstName:"Andreas", lastName:"Klark", gender:"male"},
			{firstName:"Peter", lastName:"Miller", gender:"male"},
			{firstName:"Gina", lastName:"Rush", gender:"female"},
			{firstName:"Steave", lastName:"Ander", gender:"male"},
			{firstName:"Michael", lastName:"Spring", gender:"male"},
			{firstName:"Marc", lastName:"Green", gender:"male"},
			{firstName:"Frank", lastName:"Wallace", gender:"male"}
		]
	};

	QUnit.module("sap.ui.model.json.JSONModel: Bindings", {
		beforeEach: function() {
			this.oModel = new JSONModel();
			this.oModel.setData(testData);
		},
		afterEach: function() {
			this.oModel.destroy();
		},
		createPropertyBindings: function(sPath, sProperty, oContext) {
			// create bindings
			var bindings = [];
			for (var i = 0; i < 7; i++){
				if (typeof sPath === "object") {
					bindings[i] = this.oModel.bindList(sPath.path, sPath.context, sPath.sorters, sPath.filters, sPath.parameters, sPath.events);
				} else {
					bindings[i] = this.oModel.bindProperty(sPath + "/" + i + "/" + sProperty, oContext);
				}
			}
			return bindings;
		}
	});

	QUnit.test("getPath", function(assert) {
		var bindings = this.createPropertyBindings("/teamMembers", "firstName");

		assert.equal(bindings.length, testData.teamMembers.length, "amount of bindings");
		bindings.forEach(function(binding, i) {
			assert.equal(binding.getPath(), "/teamMembers/" + i + "/firstName", "Binding path");
		});

	});

	QUnit.test("getModel", function(assert) {
		var bindings = this.createPropertyBindings("/teamMembers", "lastName");

		bindings.forEach(function(binding, i) {
			// check model of each binding...should be the same
			assert.equal(binding.getModel(), this.oModel, "Binding model");
		}, this);

	});

	QUnit.test("set/getContext", function(assert) {
		var oContext = this.oModel.getContext("/teamMembers/0"),
			bindings = this.createPropertyBindings("", "lastName", oContext),
			oNewContext = new Context();

		bindings.forEach(function(binding, i) {
			// check model of each binding...should be the same
			assert.equal(binding.getContext(), oContext, "Binding context");
			binding.setContext(oNewContext);
			assert.equal(binding.getContext(), oNewContext, "Binding context");
		});
	});

	QUnit.test("isResolved", function(assert) {
		var oNewContext = this.oModel.getContext("/");

		var oBinding = this.oModel.bindProperty("lastName");
		assert.ok(!oBinding.isResolved(), "Binding should not be resolved yet!");
		oBinding.setContext(oNewContext);
		assert.ok(oBinding.isResolved(), "Binding should be resolved!");

		oBinding = this.oModel.bindProperty("/lastName");
		assert.ok(oBinding.isResolved(), "Binding should be resolved!");

		oBinding = this.oModel.bindProperty("lastName", oNewContext);
		assert.ok(oBinding.isResolved(), "Binding should be resolved!");
	});

	QUnit.test("changeEvent", function(assert) {
		var bindings = this.createPropertyBindings("/teamMembers", "firstName");

		var attach = false;
		var detach = true;

		function callBackOnChange() {
			attach = true;
			detach = false;
		}

		bindings.forEach(function(binding, i) {
			// check model of each binding...should be the same
			binding.attachChange(callBackOnChange);

			// model stores the binding first when attach change was called
			assert.equal(this.oModel.getBindings().length, 1, "number of model bindings: 1");

			// fire change event
			binding._fireChange();
			assert.ok(attach, "call back method was attached");
			assert.ok(!detach, "call back method was not detached");

			binding.detachChange(callBackOnChange);
			attach = false;
			detach = true;
			//refire change event
			binding._fireChange();
			assert.ok(!attach, "call back method was not attached");
			assert.ok(detach, "call back method was detached");
			attach = false;
			detach = true;

			assert.equal(this.oModel.getBindings().length, 0, "number of model bindings after detach: 0");

		}, this);
	});

});