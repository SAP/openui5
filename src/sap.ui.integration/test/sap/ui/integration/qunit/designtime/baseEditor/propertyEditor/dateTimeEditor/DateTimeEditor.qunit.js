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
	var sampleDateTime = "2020-03-05T08:35:20.902Z";

	QUnit.module("Given an editor config", {
		beforeEach: function () {
			var mConfig = {
				context: "/",
				properties: {
					sampleDateTime: {
						label: "Test Datetime",
						type: "dateTime",
						path: "foo"
					}
				},
				propertyEditors: {
					"dateTime": "sap/ui/integration/designtime/baseEditor/propertyEditor/dateTimeEditor/DateTimeEditor"
				}
			};
			var mJson = {
				foo: sampleDateTime
			};

			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			return this.oBaseEditor.getPropertyEditorsByName("sampleDateTime").then(function (aPropertyEditor) {
				this.oDateTimeEditor = aPropertyEditor[0];
				oCore.applyChanges();
				this.oDateTimeEditorElement = this.oDateTimeEditor.getContent();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("When a DateTimeEditor is created", function (assert) {
			var oDateTimeEditorDomRef = this.oDateTimeEditor.getDomRef();
			assert.ok(oDateTimeEditorDomRef instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(oDateTimeEditorDomRef.offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(oDateTimeEditorDomRef.offsetWidth > 0, "Then it is rendered correctly (3/3)");
		});

		QUnit.test("When config and json data were set", function (assert) {
			assert.deepEqual(
				this.oDateTimeEditorElement.getValue(),
				DateFormat.getDateTimeInstance({
					pattern: "YYYY-MM-dd'T'HH:mm:ss.SSSSZ"
				}).format(new Date(sampleDateTime), true),
				"Then the editor has the correct value"
			);
		});

		QUnit.test("When a value is edited in the editor", function (assert) {
			var fnDone = assert.async();
			var oCurrentDate = new Date();
			oCurrentDate.setMilliseconds(0);
			var sCurrentDateTimeString = DateFormat.getDateTimeInstance({
				pattern: "YYYY-MM-dd'T'HH:mm:ss.SSSSZ"
			}).format(oCurrentDate);

			this.oDateTimeEditor.attachValueChange(function (oEvent) {
				assert.deepEqual(
					oEvent.getParameter("value"),
					oCurrentDate.toISOString(),
					"Then the editor value is updated correctly"
				);
				fnDone();
			});

			EditorQunitUtils.setInputValueAndConfirm(this.oDateTimeEditorElement, sCurrentDateTimeString);
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});