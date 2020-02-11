/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/util/binding/resolveBinding",
	"sap/ui/model/json/JSONModel"
],
function (
	resolveBinding,
	JSONModel
) {
	"use strict";

	QUnit.module("Base functionality", {
		before: function () {
			this.oJsonModel = new JSONModel({
				firstname: "Peter",
				lastname: "Pan",
				misc: {
					age: 18
				}
			});
		},
		after: function () {
			this.oJsonModel.destroy();
		}
	}, function () {
		QUnit.test("simple binding", function (assert) {
			var oJson = {
				title: "{person>/firstname}"
			};

			var oExpectedJson = {
				title: "Peter"
			};

			assert.deepEqual(
				resolveBinding(
					oJson,
					{
						person: this.oJsonModel
					}
				),
				oExpectedJson
			);
		});

		QUnit.test("simple binding — incorrect binding string", function (assert) {
			var oJson = {
				title: "{person>firstname}" // the leading slash is missing
			};

			var oExpectedJson = {
				title: undefined
			};

			assert.deepEqual(
				resolveBinding(
					oJson,
					{
						person: this.oJsonModel
					}
				),
				oExpectedJson
			);
		});

		QUnit.test("simple binding — unknown binding model", function (assert) {
			var oJson = {
				title: "{person>/firstname}"
			};

			var oExpectedJson = {
				title: "{person>/firstname}"
			};

			assert.deepEqual(
				resolveBinding(
					oJson,
					{}
				),
				oExpectedJson
			);
		});

		QUnit.test("complex binding", function (assert) {
			var oJson = {
				title: "{= ${person>/firstname} + ' ' + ${person>/lastname}}"
			};

			var oExpectedJson = {
				title: "Peter Pan"
			};

			assert.deepEqual(
				resolveBinding(
					oJson,
					{
						person: this.oJsonModel
					}
				),
				oExpectedJson
			);
		});

		QUnit.test("complex binding — unknown binding model", function (assert) {
			var oJson = {
				title: "{= ${person>/firstname} + ' ' + ${person>/lastname}}"
			};

			var oExpectedJson = {
				title: "{= ${person>/firstname} + ' ' + ${person>/lastname}}"
			};

			assert.deepEqual(
				resolveBinding(
					oJson,
					{}
				),
				oExpectedJson
			);
		});

		QUnit.test("array of bindings", function (assert) {
			var oJson = [
				"{= ${person>/firstname} + ' ' + ${person>/lastname}}",
				"{person>age}"
			];

			var oExpectedJson = [
				"Peter Pan",
				18
			];

			assert.deepEqual(
				resolveBinding(
					oJson,
					{
						person: this.oJsonModel
					},
					{
						person: this.oJsonModel.getContext("/misc")
					}
				),
				oExpectedJson
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
