/*global QUnit */
sap.ui.define([
	"sap/ui/model/xml/XMLModel"
], function(XMLModel) {
	"use strict";

	var testData =
		"<root>" +
		"<teamMembers>" +
		"<member firstName=\"Andreas\" lastName=\"Klark\" gender=\"male\">1</member>" +
		"<member firstName=\"Peter\" lastName=\"Miller\" gender=\"male\">2</member>" +
		"<member firstName=\"Gina\" lastName=\"Rush\" gender=\"female\">3</member>" +
		"<member firstName=\"Steave\" lastName=\"Ander\" gender=\"male\">4</member>" +
		"<member firstName=\"Michael\" lastName=\"Spring\" gender=\"male\">5</member>" +
		"<member firstName=\"Marc\" lastName=\"Green\" gender=\"male\">6</member>" +
		"<member firstName=\"Frank\" lastName=\"Wallace\" gender=\"male\">7</member>" +
		"</teamMembers>" +
		"</root>";

	QUnit.module("sap.ui.model.xml.*: Bindings", {
		beforeEach: function() {
			// reset bindings
			this.bindings = [];
			this.oModel = new XMLModel();
			this.oModel.setXML(testData);
		},
		afterEach: function() {
			this.oModel.destroy();
		},
		createPropertyBindings: function(sPath, sProperty, oContext){
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
		var bindings = this.createPropertyBindings("/teamMembers/member", "@firstName");

		assert.equal(bindings.length, 7, "amount of bindings");
		bindings.forEach(function (binding, i) {
			assert.equal(binding.getPath(), "/teamMembers/member/" + i + "/@firstName", "Binding path");
		});

	});

	QUnit.test("getModel", function(assert) {
		var bindings = this.createPropertyBindings("/teamMembers/member", "@lastName");

		bindings.forEach(function (binding) {
			// check model of each binding...should be the same
			assert.equal(binding.getModel(), this.oModel, "Binding model");
		}, this);

	});

	QUnit.test("set/getContext", function(assert) {
		var bindings = this.createPropertyBindings("/teamMembers/member", "@lastName", "context");

		bindings.forEach(function (binding) {
			// check model of each binding...should be the same
			assert.equal(binding.getContext(), "context", "Binding context");
			binding.setContext("newContext");
			assert.equal(binding.getContext(), "newContext", "Binding context");
		});
	});

	QUnit.test("isResolved", function(assert) {
		var oNewContext = this.oModel.getContext("/teamMembers/member/0");

		var oBinding = this.oModel.bindProperty("@lastName");
		assert.ok(!oBinding.isResolved(), "Binding should not be resolved yet!");
		oBinding.setContext(oNewContext);
		assert.ok(oBinding.isResolved(), "Binding should be resolved!");

		oBinding = this.oModel.bindProperty("/@lastName");
		assert.ok(oBinding.isResolved(), "Binding should be resolved!");

		oBinding = this.oModel.bindProperty("@lastName", oNewContext);
		assert.ok(oBinding.isResolved(), "Binding should be resolved!");
	});

	QUnit.test("changeEvent", function(assert) {
		var bindings = this.createPropertyBindings("/teamMembers/member", "@firstName");

		var attach = false;
		var detach = true;

		function callBackOnChange(){
			attach = true;
			detach = false;
		}

		bindings.forEach(function (binding) {
			// check model of each binding...should be the same
			binding.attachChange(callBackOnChange);

			// model stores the binding first when attach change was called
			assert.equal(this.oModel.getBindings().length, 1, "model bindings");

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

			assert.equal(this.oModel.getBindings().length, 0, "model bindings");
		}, this);
	});

});
