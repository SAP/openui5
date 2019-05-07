/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/String",
	"sap/ui/model/type/Integer",
	"sap/ui/commons/RatingIndicator",
	"sap/ui/model/FormatException",
	"sap/ui/commons/TextField",
	"sap/ui/model/ValidateException",
	"sap/ui/model/ParseException"],
	function (createAndAppendDiv, JSONModel, SAPString, Integer, RatingIndicator, FormatException, TextField, ValidateException, ParseException) {
	"use strict";

		// prepare DOM
		createAndAppendDiv(["target1", "target2"]);

		var oModel;
		var oTxt;

		function setup(sPath, oType) {
			oModel = new JSONModel();
			oModel.setData({
				visibleItems: 3,
				test: "hello",
				rating: "4"
			});
			sap.ui.getCore().setModel(oModel);
			oTxt = new TextField();
			oTxt.bindValue(sPath, oType);

			oTxt.placeAt("target1");
		}

		function teardown() {
			oTxt.destroy();
		}

		QUnit.test("validation error", function (assert) {
			var done = assert.async();
			var oType = new SAPString(null, {
				minLength: 1,
				maxLength: 5
			});
			setup("/test", oType);
			var bSuccess = false;
			sap.ui.getCore().attachValidationError(handler);
			function handler(oEvent) {
				assert.equal(oEvent.getParameter("element").getId(), oTxt.getId(), "element");
				assert.equal(oEvent.getParameter('property'), "value", "property");
				assert.equal(oEvent.getParameter("newValue"), "blubbbbb", "new value");
				assert.equal(oEvent.getParameter("oldValue"), "hello", "old value");
				assert.equal(oEvent.getParameter("type"), oType, "type");
				assert.ok(oEvent.getParameter("exception") instanceof ValidateException, "exception instance");
				assert.equal(oEvent.getParameter("exception").violatedConstraints.length, 1, " violated constraints size");
				assert.equal(oEvent.getParameter("exception").violatedConstraints[0], "maxLength", "violated constraints check");
				bSuccess = true;
			}
			oTxt.setValue("blubbbbb");
			setTimeout(function () { // delay the following test
				assert.ok(bSuccess, "error occurred sucessfully");
				sap.ui.getCore().detachValidationError(handler);
				teardown(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("parse error", function (assert) {
			var done = assert.async();
			var oType = new Integer();
			setup("/visibleItems", oType);
			var bSuccess = false;
			sap.ui.getCore().attachParseError(handler);
			function handler(oEvent) {
				assert.equal(oEvent.getParameter("element").getId(), oTxt.getId(), "element");
				assert.equal(oEvent.getParameter('property'), "value", "property");
				assert.equal(oEvent.getParameter("newValue"), "blubbbbb", "new value");
				assert.equal(oEvent.getParameter("oldValue"), 3, "old value");
				assert.equal(oEvent.getParameter("type"), oType, "type");
				assert.ok(oEvent.getParameter("exception") instanceof ParseException, "exception instance");

				bSuccess = true;
			}
			oTxt.setValue("blubbbbb");
			setTimeout(function () { // delay the following test
				assert.ok(bSuccess, "error occurred sucessfully");
				sap.ui.getCore().detachParseError(handler);
				teardown(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("format error", function (assert) {
			var done = assert.async();
			var oType = new SAPString();
			var oRating = new RatingIndicator();
			oRating.bindValue("/rating", oType);
			oRating.placeAt("target2");
			setup("/rating", oType);
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
			oTxt.setValue("blubbbbb");
			setTimeout(function () { // delay the following test
				assert.ok(bSuccess, "error occurred sucessfully");
				sap.ui.getCore().detachFormatError(handler);
				oRating.destroy();
				teardown(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("validation success", function (assert) {
			var done = assert.async();
			var oType = new SAPString();
			setup("/test", oType);
			var bSuccess = false;
			sap.ui.getCore().attachValidationSuccess(handler);
			function handler(oEvent) {
				assert.equal(oEvent.getParameter("element").getId(), oTxt.getId(), "element");
				assert.equal(oEvent.getParameter('property'), "value", "property");
				assert.equal(oEvent.getParameter("newValue"), "blubbbbb", "new value");
				assert.equal(oEvent.getParameter("oldValue"), "hello", "old value");
				assert.equal(oEvent.getParameter("type"), oType, "type");

				bSuccess = true;
			}
			oTxt.setValue("blubbbbb");
			setTimeout(function () { // delay the following test
				assert.ok(bSuccess, "validation was sucessful");
				sap.ui.getCore().detachValidationSuccess(handler);
				teardown(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("event checks 1", function (assert) {
			var done = assert.async();
			var oType = new Integer();
			setup("/visibleItems", oType);
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
			oTxt.setValue("blubbbbb");
			setTimeout(function () { // delay the following test
				assert.ok(bSuccess, "parse error occurred sucessfully and no other events occurred");
				assert.ok(iEventCount == 1, "event count should be 1");
				sap.ui.getCore().detachParseError(handler);
				sap.ui.getCore().detachFormatError(handler);
				sap.ui.getCore().detachValidationError(handler);
				sap.ui.getCore().detachValidationSuccess(handler);
				teardown(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("event checks 2", function (assert) {
			var done = assert.async();
			var oType = new SAPString(null, {
				minLength: 1,
				maxLength: 5
			});
			setup("/test", oType);
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
			oTxt.setValue("blubbbbb");
			setTimeout(function () { // delay the following test
				assert.ok(bSuccess, "validation error occurred sucessfully and no other events occurred");
				assert.ok(iEventCount == 1, "event count should be 1");
				sap.ui.getCore().detachParseError(handler);
				sap.ui.getCore().detachFormatError(handler);
				sap.ui.getCore().detachValidationError(handler);
				sap.ui.getCore().detachValidationSuccess(handler);
				teardown(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("validation success on core and control --> bubbling", function (assert) {
			var done = assert.async();
			var oType = new SAPString();
			setup("/test", oType);
			var bSuccess = false;
			sap.ui.getCore().attachValidationSuccess(handler);
			oTxt.attachValidationSuccess(handler);
			var iCount = 0;
			function handler(oEvent) {
				assert.equal(oEvent.getParameter("element").getId(), oTxt.getId(), "element");
				assert.equal(oEvent.getParameter('property'), "value", "property");
				assert.equal(oEvent.getParameter("newValue"), "blubbbbb", "new value");
				assert.equal(oEvent.getParameter("oldValue"), "hello", "old value");
				assert.equal(oEvent.getParameter("type"), oType, "type");
				iCount++;
				bSuccess = true;
			}
			oTxt.setValue("blubbbbb");
			setTimeout(function () { // delay the following test
				assert.ok(bSuccess, "validation was sucessful");
				assert.equal(iCount, 2, "validation event count");
				sap.ui.getCore().detachValidationSuccess(handler);
				oTxt.detachValidationSuccess(handler);
				teardown(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("validation error on core and control --> bubbling", function (assert) {
			var done = assert.async();
			var oType = new SAPString(null, {
				minLength: 1,
				maxLength: 5
			});
			setup("/test", oType);
			var bSuccess = false;
			sap.ui.getCore().attachValidationError(handler);
			oTxt.attachValidationError(handler);
			var iCount = 0;
			function handler(oEvent) {
				assert.equal(oEvent.getParameter("element").getId(), oTxt.getId(), "element");
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
			oTxt.setValue("blubbbbb");
			setTimeout(function () { // delay the following test
				assert.ok(bSuccess, "error occurred sucessfully");
				assert.equal(iCount, 2, "validation event count");
				sap.ui.getCore().detachValidationError(handler);
				oTxt.detachValidationError(handler);
				teardown(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("validation error on core and control --> cancel bubbling", function (assert) {
			var done = assert.async();
			var oType = new SAPString(null, {
				minLength: 1,
				maxLength: 5
			});
			setup("/test", oType);
			var bSuccess = false;
			sap.ui.getCore().attachValidationError(handler);
			oTxt.attachValidationError(handler);
			var iCount = 0;
			function handler(oEvent) {
				assert.equal(oEvent.getParameter("element").getId(), oTxt.getId(), "element");
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
			oTxt.setValue("blubbbbb");
			setTimeout(function () { // delay the following test
				assert.ok(bSuccess, "error occurred sucessfully");
				assert.equal(iCount, 1, "validation event count");
				sap.ui.getCore().detachValidationError(handler);
				oTxt.detachValidationError(handler);
				teardown(handler);
				done();          // resume normal testing
			}, 100);
		});

		QUnit.test("parse error on core and control --> bubbling", function (assert) {
			var done = assert.async();
			var oType = new Integer();
			setup("/visibleItems", oType);
			var bSuccess = false;
			oTxt.attachParseError(handler);
			sap.ui.getCore().attachParseError(handler);
			var iCount = 0;
			function handler(oEvent) {
				assert.equal(oEvent.getParameter("element").getId(), oTxt.getId(), "element");
				assert.equal(oEvent.getParameter('property'), "value", "property");
				assert.equal(oEvent.getParameter("newValue"), "blubbbbb", "new value");
				assert.equal(oEvent.getParameter("oldValue"), 3, "old value");
				assert.equal(oEvent.getParameter("type"), oType, "type");
				assert.ok(oEvent.getParameter("exception") instanceof ParseException, "exception instance");
				bSuccess = true;
				iCount++;
			}
			oTxt.setValue("blubbbbb");
			setTimeout(function () { // delay the following test
				assert.ok(bSuccess, "error occurred sucessfully");
				oTxt.detachParseError(handler);
				assert.equal(iCount, 2, "validation event count");
				sap.ui.getCore().detachParseError(handler);
				teardown(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("format error on core and control --> cancel bubbling", function (assert) {
			var done = assert.async();
			var oType = new SAPString();
			var oRating = new RatingIndicator();
			oRating.bindValue("/rating", oType);
			oRating.placeAt("target2");
			setup("/rating", oType);
			var bSuccess = false;
			sap.ui.getCore().attachFormatError(handler);
			oTxt.attachFormatError(handler);
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
			oTxt.setValue("blubbbbb");
			setTimeout(function () { // delay the following test
				assert.ok(bSuccess, "error occurred sucessfully");
				sap.ui.getCore().detachFormatError(handler);
				oTxt.detachFormatError(handler);
				assert.equal(iCount, 1, "validation event count");
				oRating.destroy();
				teardown(handler);
				done();          // resume normal testing
			}, 100);

		});

	});