/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/String",
	"sap/m/Input",
	"sap/m/RatingIndicator",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException"
], function (createAndAppendDiv, JSONModel, TypeInteger, TypeString, Input, RatingIndicator, FormatException, ParseException, ValidateException) {
	"use strict";

		// prepare DOM
		createAndAppendDiv(["target1", "target2"]);

		var oModel = new JSONModel();
		sap.ui.getCore().setModel(oModel);

		QUnit.module("", {
			beforeEach: function() {
				oModel.setData({
					visibleItems: 3,
					test: "hello",
					rating: "4"
				});
				this.oInput = new Input().placeAt("target1");
			},
			afterEach: function() {
				this.oInput.destroy();
			}
		});

		QUnit.test("validation error", function (assert) {
			var done = assert.async();
			var oType = new TypeString(null, {
				minLength: 1,
				maxLength: 5
			});
			var oInput = this.oInput;
			oInput.bindValue("/test", oType);
			var bSuccess = false;
			sap.ui.getCore().attachValidationError(handler);
			function handler(oEvent) {
				assert.equal(oEvent.getParameter("element").getId(), oInput.getId(), "element");
				assert.equal(oEvent.getParameter('property'), "value", "property");
				assert.equal(oEvent.getParameter("newValue"), "blubbbbb", "new value");
				assert.equal(oEvent.getParameter("oldValue"), "hello", "old value");
				assert.equal(oEvent.getParameter("type"), oType, "type");
				assert.ok(oEvent.getParameter("exception") instanceof ValidateException, "exception instance");
				assert.equal(oEvent.getParameter("exception").violatedConstraints.length, 1, " violated constraints size");
				assert.equal(oEvent.getParameter("exception").violatedConstraints[0], "maxLength", "violated constraints check");
				bSuccess = true;
			}
			oInput.setValue("blubbbbb");
			setTimeout(function () { // delay the following test
				assert.ok(bSuccess, "error occurred successfully");
				sap.ui.getCore().detachValidationError(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("parse error", function (assert) {
			var done = assert.async();
			var oType = new TypeInteger();
			var oInput = this.oInput;
			oInput.bindValue("/visibleItems", oType);
			var bSuccess = false;
			sap.ui.getCore().attachParseError(handler);
			function handler(oEvent) {
				assert.equal(oEvent.getParameter("element").getId(), oInput.getId(), "element");
				assert.equal(oEvent.getParameter('property'), "value", "property");
				assert.equal(oEvent.getParameter("newValue"), "blubbbbb", "new value");
				assert.equal(oEvent.getParameter("oldValue"), 3, "old value");
				assert.equal(oEvent.getParameter("type"), oType, "type");
				assert.ok(oEvent.getParameter("exception") instanceof ParseException, "exception instance");

				bSuccess = true;
			}
			oInput.setValue("blubbbbb");
			setTimeout(function () { // delay the following test
				assert.ok(bSuccess, "error occurred sucessfully");
				sap.ui.getCore().detachParseError(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("format error", function (assert) {
			var done = assert.async();
			var oType = new TypeString();
			var oRating = new RatingIndicator();
			oRating.bindValue("/rating", oType);
			oRating.placeAt("target2");
			var oInput = this.oInput;
			oInput.bindValue("/rating", oType);
			var bSuccess = false;
			sap.ui.getCore().attachFormatError(handler);
			function handler(oEvent) {
				assert.equal(oEvent.getParameter("element").getId(), oRating.getId(), "element");
				assert.equal(oEvent.getParameter('property'), "value", "property");
				assert.equal(oEvent.getParameter("newValue"), "blubbbbb", "new value");
				assert.equal(oEvent.getParameter("oldValue"), 4, "old value");
				assert.equal(oEvent.getParameter("type"), oType, "type");
				assert.ok(oEvent.getParameter("exception") instanceof FormatException, "exception instance");

				bSuccess = true;
			}
			oInput.setValue("blubbbbb");
			setTimeout(function () { // delay the following test
				assert.ok(bSuccess, "error occurred sucessfully");
				sap.ui.getCore().detachFormatError(handler);
				oRating.destroy();
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("validation success", function (assert) {
			var done = assert.async();
			var oType = new TypeString();
			var oInput = this.oInput;
			oInput.bindValue("/test", oType);
			var bSuccess = false;
			sap.ui.getCore().attachValidationSuccess(handler);
			function handler(oEvent) {
				assert.equal(oEvent.getParameter("element").getId(), oInput.getId(), "element");
				assert.equal(oEvent.getParameter('property'), "value", "property");
				assert.equal(oEvent.getParameter("newValue"), "blubbbbb", "new value");
				assert.equal(oEvent.getParameter("oldValue"), "hello", "old value");
				assert.equal(oEvent.getParameter("type"), oType, "type");

				bSuccess = true;
			}
			oInput.setValue("blubbbbb");
			setTimeout(function () { // delay the following test
				assert.ok(bSuccess, "validation was sucessful");
				sap.ui.getCore().detachValidationSuccess(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("event checks 1", function (assert) {
			var done = assert.async();
			var oType = new TypeInteger();
			var oInput = this.oInput;
			oInput.bindValue("/visibleItems", oType);
			var bSuccess = false;
			var iEventCount = 0;
			sap.ui.getCore().attachParseError(handler);
			sap.ui.getCore().attachValidationError(handler2);
			sap.ui.getCore().attachFormatError(handler3);
			sap.ui.getCore().attachValidationSuccess(handler4);
			function handler(oEvent) {
				bSuccess = true;
				iEventCount++;
			}
			function handler2(oEvent) {
				bSuccess = false;
				iEventCount++;
			}
			function handler3(oEvent) {
				bSuccess = false;
				iEventCount++;
			}
			function handler4(oEvent) {
				bSuccess = false;
				iEventCount++;
			}
			oInput.setValue("blubbbbb");
			setTimeout(function () { // delay the following test
				assert.ok(bSuccess, "parse error occurred sucessfully and no other events occurred");
				assert.ok(iEventCount == 1, "event count should be 1");
				sap.ui.getCore().detachParseError(handler);
				sap.ui.getCore().detachFormatError(handler);
				sap.ui.getCore().detachValidationError(handler);
				sap.ui.getCore().detachValidationSuccess(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("event checks 2", function (assert) {
			var done = assert.async();
			var oType = new TypeString(null, {
				minLength: 1,
				maxLength: 5
			});
			var oInput = this.oInput;
			oInput.bindValue("/test", oType);
			var iEventCount = 0;
			var bSuccess = false;
			sap.ui.getCore().attachParseError(handler);
			sap.ui.getCore().attachValidationError(handler2);
			sap.ui.getCore().attachFormatError(handler3);
			sap.ui.getCore().attachValidationSuccess(handler4);
			function handler(oEvent) {
				bSuccess = false;
				iEventCount++;
			}
			function handler2(oEvent) {
				bSuccess = true;
				iEventCount++;
			}
			function handler3(oEvent) {
				bSuccess = false;
				iEventCount++;
			}
			function handler4(oEvent) {
				bSuccess = false;
				iEventCount++;
			}
			oInput.setValue("blubbbbb");
			setTimeout(function () { // delay the following test
				assert.ok(bSuccess, "validation error occurred sucessfully and no other events occurred");
				assert.ok(iEventCount == 1, "event count should be 1");
				sap.ui.getCore().detachParseError(handler);
				sap.ui.getCore().detachFormatError(handler);
				sap.ui.getCore().detachValidationError(handler);
				sap.ui.getCore().detachValidationSuccess(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("validation success on core and control --> bubbling", function (assert) {
			var done = assert.async();
			var oType = new TypeString();
			var oInput = this.oInput;
			oInput.bindValue("/test", oType);
			var bSuccess = false;
			sap.ui.getCore().attachValidationSuccess(handler);
			oInput.attachValidationSuccess(handler);
			var iCount = 0;
			function handler(oEvent) {
				assert.equal(oEvent.getParameter("element").getId(), oInput.getId(), "element");
				assert.equal(oEvent.getParameter('property'), "value", "property");
				assert.equal(oEvent.getParameter("newValue"), "blubbbbb", "new value");
				assert.equal(oEvent.getParameter("oldValue"), "hello", "old value");
				assert.equal(oEvent.getParameter("type"), oType, "type");
				iCount++;
				bSuccess = true;
			}
			oInput.setValue("blubbbbb");
			setTimeout(function () { // delay the following test
				assert.ok(bSuccess, "validation was sucessful");
				assert.equal(iCount, 2, "validation event count");
				sap.ui.getCore().detachValidationSuccess(handler);
				oInput.detachValidationSuccess(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("validation error on core and control --> bubbling", function (assert) {
			var done = assert.async();
			var oType = new TypeString(null, {
				minLength: 1,
				maxLength: 5
			});
			var oInput = this.oInput;
			oInput.bindValue("/test", oType);
			var bSuccess = false;
			sap.ui.getCore().attachValidationError(handler);
			oInput.attachValidationError(handler);
			var iCount = 0;
			function handler(oEvent) {
				assert.equal(oEvent.getParameter("element").getId(), oInput.getId(), "element");
				assert.equal(oEvent.getParameter('property'), "value", "property");
				assert.equal(oEvent.getParameter("newValue"), "blubbbbb", "new value");
				assert.equal(oEvent.getParameter("oldValue"), "hello", "old value");
				assert.equal(oEvent.getParameter("type"), oType, "type");
				assert.ok(oEvent.getParameter("exception") instanceof ValidateException, "exception instance");
				assert.equal(oEvent.getParameter("exception").violatedConstraints.length, 1, " violated constraints size");
				assert.equal(oEvent.getParameter("exception").violatedConstraints[0], "maxLength", "violated constraints check");
				bSuccess = true;
				iCount++;
			}
			oInput.setValue("blubbbbb");
			setTimeout(function () { // delay the following test
				assert.ok(bSuccess, "error occurred sucessfully");
				assert.equal(iCount, 2, "validation event count");
				sap.ui.getCore().detachValidationError(handler);
				oInput.detachValidationError(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("validation error on core and control --> cancel bubbling", function (assert) {
			var done = assert.async();
			var oType = new TypeString(null, {
				minLength: 1,
				maxLength: 5
			});
			var oInput = this.oInput;
			oInput.bindValue("/test", oType);
			var bSuccess = false;
			sap.ui.getCore().attachValidationError(handler);
			oInput.attachValidationError(handler);
			var iCount = 0;
			function handler(oEvent) {
				assert.equal(oEvent.getParameter("element").getId(), oInput.getId(), "element");
				assert.equal(oEvent.getParameter('property'), "value", "property");
				assert.equal(oEvent.getParameter("newValue"), "blubbbbb", "new value");
				assert.equal(oEvent.getParameter("oldValue"), "hello", "old value");
				assert.equal(oEvent.getParameter("type"), oType, "type");
				assert.ok(oEvent.getParameter("exception") instanceof ValidateException, "exception instance");
				assert.equal(oEvent.getParameter("exception").violatedConstraints.length, 1, " violated constraints size");
				assert.equal(oEvent.getParameter("exception").violatedConstraints[0], "maxLength", "violated constraints check");
				bSuccess = true;
				iCount++;
				oEvent.cancelBubble();
			}
			oInput.setValue("blubbbbb");
			setTimeout(function () { // delay the following test
				assert.ok(bSuccess, "error occurred sucessfully");
				assert.equal(iCount, 1, "validation event count");
				sap.ui.getCore().detachValidationError(handler);
				oInput.detachValidationError(handler);
				done();          // resume normal testing
			}, 100);
		});

		QUnit.test("parse error on core and control --> bubbling", function (assert) {
			var done = assert.async();
			var oType = new TypeInteger();
			var oInput = this.oInput;
			oInput.bindValue("/visibleItems", oType);
			var bSuccess = false;
			oInput.attachParseError(handler);
			sap.ui.getCore().attachParseError(handler);
			var iCount = 0;
			function handler(oEvent) {
				assert.equal(oEvent.getParameter("element").getId(), oInput.getId(), "element");
				assert.equal(oEvent.getParameter('property'), "value", "property");
				assert.equal(oEvent.getParameter("newValue"), "blubbbbb", "new value");
				assert.equal(oEvent.getParameter("oldValue"), 3, "old value");
				assert.equal(oEvent.getParameter("type"), oType, "type");
				assert.ok(oEvent.getParameter("exception") instanceof ParseException, "exception instance");
				bSuccess = true;
				iCount++;
			}
			oInput.setValue("blubbbbb");
			setTimeout(function () { // delay the following test
				assert.ok(bSuccess, "error occurred sucessfully");
				oInput.detachParseError(handler);
				assert.equal(iCount, 2, "validation event count");
				sap.ui.getCore().detachParseError(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("format error on core and control --> cancel bubbling", function (assert) {
			var done = assert.async();
			var oType = new TypeString();
			var oRating = new RatingIndicator();
			oRating.bindValue("/rating", oType);
			oRating.placeAt("target2");
			var oInput = this.oInput;
			oInput.bindValue("/rating", oType);
			var bSuccess = false;
			sap.ui.getCore().attachFormatError(handler);
			oInput.attachFormatError(handler);
			var iCount = 0;
			function handler(oEvent) {
				assert.equal(oEvent.getParameter("element").getId(), oRating.getId(), "element");
				assert.equal(oEvent.getParameter('property'), "value", "property");
				assert.equal(oEvent.getParameter("newValue"), "blubbbbb", "new value");
				assert.equal(oEvent.getParameter("oldValue"), 4, "old value");
				assert.equal(oEvent.getParameter("type"), oType, "type");
				assert.ok(oEvent.getParameter("exception") instanceof FormatException, "exception instance");

				bSuccess = true;
				iCount++;
				oEvent.cancelBubble();
			}
			oInput.setValue("blubbbbb");
			setTimeout(function () { // delay the following test
				assert.ok(bSuccess, "error occurred sucessfully");
				sap.ui.getCore().detachFormatError(handler);
				oInput.detachFormatError(handler);
				assert.equal(iCount, 1, "validation event count");
				oRating.destroy();
				done();          // resume normal testing
			}, 100);

		});

	});