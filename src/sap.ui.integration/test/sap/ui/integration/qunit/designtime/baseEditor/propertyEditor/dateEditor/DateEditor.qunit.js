/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/format/DateFormat",
	"sap/ui/thirdparty/sinon-4"
], function (
	BaseEditor,
	QUnitUtils,
	KeyCodes,
	DateFormat,
	sinon
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
				sap.ui.getCore().applyChanges();
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
				DateFormat.getDateInstance().format(new Date(sampleDate)),
				"Then the editor has the correct value"
			);
		});

		QUnit.test("When a value is edited in the editor", function (assert) {
			var fnDone = assert.async();
			var oCurrentDate = new Date();
			var sCurrentDateString = DateFormat.getDateInstance().format(oCurrentDate);

			oCurrentDate.setHours(0, 0, 0, 0);

			this.oDateEditor.attachValueChange(function (oEvent) {
				assert.deepEqual(
					oEvent.getParameter("value"),
					oCurrentDate.toISOString(),
					"Then the editor value is updated correctly"
				);
				fnDone();
			});

			this.oDateEditorElement.$("inner").val(sCurrentDateString);
			QUnitUtils.triggerEvent("input", this.oDateEditorElement.getDomRef());
			QUnitUtils.triggerKeydown(this.oDateEditorElement.getDomRef(), KeyCodes.ENTER);
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

			this.oDateEditorElement.$("inner").val("{someBindingPath}");
			QUnitUtils.triggerEvent("input", this.oDateEditorElement.getDomRef());
			QUnitUtils.triggerKeydown(this.oDateEditorElement.getDomRef(), KeyCodes.ENTER);
		});

		QUnit.test("When a binding path is provided as the editor value", function (assert) {
			this.oDateEditor.setValue("{someBindingString}");
			assert.strictEqual(
				this.oDateEditor.getValue(),
				"{someBindingString}",
				"Then it is properly updated in the editor"
			);
		});

		QUnit.test("When an invalid input is provided", function (assert) {
			var oSpy = sandbox.spy();
			this.oDateEditor.attachValueChange(oSpy);

			this.oDateEditorElement.$("inner").val("This is not a date");
			QUnitUtils.triggerEvent("input", this.oDateEditorElement.getDomRef());
			QUnitUtils.triggerKeydown(this.oDateEditorElement.getDomRef(), KeyCodes.ENTER);

			assert.strictEqual(this.oDateEditorElement.getValueState(), "Error", "Then the error is displayed");

			assert.ok(oSpy.notCalled, "Then no value change is triggered");
			assert.deepEqual(
				this.oDateEditor.getValue(),
				sampleDate,
				"Then the editor value is not updated"
			);
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});