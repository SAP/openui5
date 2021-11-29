/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"qunit/designtime/EditorQunitUtils",
	"sap/ui/core/format/DateFormat",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Core"
], function (
	BaseEditor,
	EditorQunitUtils,
	DateFormat,
	sinon,
	oCore
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var sampleDate = "2020-03-05T08:35:20.902Z";

	QUnit.module("Given an editor config", {
		beforeEach: function () {
			var mConfig = {
				context: "/",
				properties: {
					sampleDate: {
						label: "Test Date",
						type: "date",
						path: "foo"
					}
				},
				propertyEditors: {
					"date": "sap/ui/integration/designtime/baseEditor/propertyEditor/dateEditor/DateEditor"
				}
			};
			var mJson = {
				foo: sampleDate
			};

			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			return this.oBaseEditor.getPropertyEditorsByName("sampleDate").then(function (aPropertyEditor) {
				this.oDateEditor = aPropertyEditor[0];
				oCore.applyChanges();
				this.oDateEditorElement = this.oDateEditor.getContent();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("When a DateEditor is created", function (assert) {
			var oDateEditorDomRef = this.oDateEditor.getDomRef();
			assert.ok(oDateEditorDomRef instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(oDateEditorDomRef.offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(oDateEditorDomRef.offsetWidth > 0, "Then it is rendered correctly (3/3)");
		});

		QUnit.test("When config and json data were set", function (assert) {
			assert.deepEqual(
				this.oDateEditorElement.getValue(),
				DateFormat.getDateInstance({
					pattern: "yyyy-MM-dd"
				}).format(new Date(sampleDate)),
				"Then the editor has the correct value"
			);
		});

		QUnit.test("When a value is edited in the editor", function (assert) {
			var fnDone = assert.async();
			var oCurrentDate = DateFormat.getDateInstance({ pattern: "MM/dd/yyyy" }).parse("10/19/2021", true);
			var sCurrentDateString = DateFormat.getDateInstance().format(oCurrentDate);

			this.oDateEditor.attachValueChange(function (oEvent) {
				assert.deepEqual(
					oEvent.getParameter("value"),
					"2021-10-19T00:00:00.000Z",
					"Then the editor value is updated correctly"
				);
				fnDone();
			});

			EditorQunitUtils.setInputValueAndConfirm(this.oDateEditorElement, sCurrentDateString);
		});

		QUnit.test("When a binding path is added in the editor", function (assert) {
			var fnDone = assert.async();

			this.oDateEditor.attachValueChange(function (oEvent) {
				assert.deepEqual(
					oEvent.getParameter("value"),
					"{someBindingPath}",
					"Then the editor value is updated correctly"
				);
				fnDone();
			});

			EditorQunitUtils.setInputValueAndConfirm(this.oDateEditorElement, "{someBindingPath}");
		});

		QUnit.test("When a binding path is provided as the editor value", function (assert) {
			this.oDateEditor.setValue("{someBindingString}");
			assert.strictEqual(
				this.oDateEditor.getValue(),
				"{someBindingString}",
				"Then it is properly updated in the editor"
			);
			assert.strictEqual(
				this.oDateEditor.getContent().getValue(),
				"{someBindingString}",
				"then the output is properly displayed"
			);
		});

		QUnit.test("When an invalid input is provided", function (assert) {
			var oSpy = sandbox.spy();
			this.oDateEditor.attachValueChange(oSpy);

			EditorQunitUtils.setInputValueAndConfirm(this.oDateEditorElement, "This is not a date");

			assert.strictEqual(this.oDateEditorElement.getValueState(), "Error", "Then the error is displayed");

			assert.ok(oSpy.notCalled, "Then no value change is triggered");
			assert.deepEqual(
				this.oDateEditor.getValue(),
				sampleDate,
				"Then the editor value is not updated"
			);
		});
	});

	QUnit.module("Configuration options", {
		beforeEach: function () {
			this.oBaseEditor = new BaseEditor();
			this.oBaseEditor.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When the date pattern is customized", function (assert) {
			this.oBaseEditor.setConfig({
				properties: {
					sampleDate: {
						label: "Test Date",
						type: "date",
						path: "/foo",
						pattern: "MM-yyyy-dd",
						utc: false
					}
				},
				propertyEditors: {
					"date": "sap/ui/integration/designtime/baseEditor/propertyEditor/dateEditor/DateEditor"
				}
			});

			this.oBaseEditor.setJson({
				foo: "03-2020-05"
			});

			return this.oBaseEditor.getPropertyEditorsByName("sampleDate").then(function (aPropertyEditor) {
				oCore.applyChanges();
				var oDateEditor = aPropertyEditor[0];
				assert.strictEqual(
					oDateEditor.getValue(),
					"03-2020-05",
					"then the original date is not touched"
				);
				assert.strictEqual(
					oDateEditor.getContent().getValue(),
					DateFormat.getDateInstance({
						pattern: "yyyy-MM-dd"
					}).format(new Date(sampleDate), true),
					"then the date picker value is properly formatted"
				);

				EditorQunitUtils.setInputValueAndConfirm(
					oDateEditor.getContent(),
					DateFormat.getDateInstance({
						pattern: "yyyy-MM-dd"
					}).format(new Date("2021-10-19T08:35:20.902Z"), true)
				);

				assert.strictEqual(
					oDateEditor.getValue(),
					"10-2021-19",
					"then the output is properly formatted"
				);
				assert.strictEqual(
					oDateEditor.getContent().getValue(),
					DateFormat.getDateInstance({
						pattern: "yyyy-MM-dd"
					}).format(new Date("2021-10-19T08:35:20.902Z"), true),
					"then the date picker value is properly formatted"
				);
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});