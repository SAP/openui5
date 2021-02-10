/*global QUnit*/

sap.ui.define([
	"sap/ui/dt/enablement/ElementEnablementTest",
	"sap/m/Button",
	"sap/ui/thirdparty/sinon-4"
],
function (
	ElementEnablementTest,
	Button,
	sinon
) {
	"use strict";

	var fnTestInterface = function(assert, oEntry) {
		assert.ok(true, "... then '" + oEntry.name + " Entry' : Test Interface");
		assert.ok(oEntry.hasOwnProperty("status"), "and an entry has a property 'status'");
		assert.ok(oEntry.hasOwnProperty("type"), "and an entry has a property 'type'");
		assert.ok(oEntry.hasOwnProperty("message"), "and an entry has a property 'message'");
		assert.ok(oEntry.hasOwnProperty("name"), "and an entry has a property 'name'");
		assert.ok(oEntry.hasOwnProperty("result"), "and an entry has a property 'result'");
		assert.ok(oEntry.hasOwnProperty("children"), "and an entry has a property 'children'");
		assert.ok(oEntry.hasOwnProperty("statistic"), "and an entry has a property 'statistic'");

		oEntry.children.forEach(function(oChild) {
			fnTestInterface(assert, oChild);
		});
	};

	QUnit.module("Given that a sap.m.Button is tested", {
		beforeEach: function () {
			this.oElementEnablementTest = new ElementEnablementTest({
				type: "sap.m.Button"
			});
		},
		afterEach: function () {
			this.oElementEnablementTest.destroy();
		}
	}, function () {
		QUnit.test("when the test is started", function(assert) {
			return this.oElementEnablementTest.run()
			.then(function(oResult) {
				assert.ok(oResult, "A result is returned");
				fnTestInterface(assert, oResult);
			});
		});
	});

	QUnit.module("Given that a sap.m.Button with an create function is tested", {
		beforeEach: function() {
			function fnCreate() {
				return new Button();
			}

			this.fnSpyCreate = sinon.spy(fnCreate);

			this.oElementEnablementTest = new ElementEnablementTest({
				type: "sap.m.Button",
				create: this.fnSpyCreate
			});
		},
		afterEach: function() {
			this.oElementEnablementTest.destroy();
		}
	}, function () {
		QUnit.test("when the test is started", function(assert) {
			return this.oElementEnablementTest.run()
			.then(function(oResult) {
				assert.ok(oResult, "A result is returned");
				assert.equal(this.fnSpyCreate.callCount, 1, "and the create function was called once");
				fnTestInterface(assert, oResult);
			}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});