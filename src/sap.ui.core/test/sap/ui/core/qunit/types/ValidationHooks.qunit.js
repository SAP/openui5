/*global QUnit */
sap.ui.define([
	"sap/m/Input",
	"sap/m/Panel",
	"sap/m/RatingIndicator",
	"sap/ui/core/Core",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/String",
	"sap/ui/qunit/utils/createAndAppendDiv"
], function (
	Input,
	Panel,
	RatingIndicator,
	Core,
	FormatException,
	ParseException,
	ValidateException,
	JSONModel,
	TypeInteger,
	TypeString,
	createAndAppendDiv
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["target1", "target2"]);

	const oModel = new JSONModel();

	function createTests() {

		QUnit.test("validation error", function (assert) {
			var done = assert.async();
			var oType = new TypeString(null, {
				minLength: 1,
				maxLength: 5
			});
			var oInput = this.oInput;
			oInput.bindValue("/test", oType);
			var bSuccess = false;
			this.oParent.attachValidationError(handler);
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
			setTimeout(() => { // delay the following test
				assert.ok(bSuccess, "error occurred successfully");
				this.oParent.detachValidationError(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("parse error", function (assert) {
			var done = assert.async();
			var oType = new TypeInteger();
			var oInput = this.oInput;
			oInput.bindValue("/visibleItems", oType);
			var bSuccess = false;
			this.oParent.attachParseError(handler);
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
			setTimeout(() => { // delay the following test
				assert.ok(bSuccess, "error occurred sucessfully");
				this.oParent.detachParseError(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("format error", function (assert) {
			var done = assert.async();
			var oType = new TypeString();
			var oRating = new RatingIndicator();
			oRating.bindValue("/rating", oType);
			this.placeAt(oRating);
			var oInput = this.oInput;
			oInput.bindValue("/rating", oType);
			var bSuccess = false;
			this.oParent.attachFormatError(handler);
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
			setTimeout(() => { // delay the following test
				assert.ok(bSuccess, "error occurred sucessfully");
				this.oParent.detachFormatError(handler);
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
			this.oParent.attachValidationSuccess(handler);
			function handler(oEvent) {
				assert.equal(oEvent.getParameter("element").getId(), oInput.getId(), "element");
				assert.equal(oEvent.getParameter('property'), "value", "property");
				assert.equal(oEvent.getParameter("newValue"), "blubbbbb", "new value");
				assert.equal(oEvent.getParameter("oldValue"), "hello", "old value");
				assert.equal(oEvent.getParameter("type"), oType, "type");

				bSuccess = true;
			}
			oInput.setValue("blubbbbb");
			setTimeout(() => { // delay the following test
				assert.ok(bSuccess, "validation was sucessful");
				this.oParent.detachValidationSuccess(handler);
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
			this.oParent.attachParseError(handler);
			this.oParent.attachValidationError(handler2);
			this.oParent.attachFormatError(handler3);
			this.oParent.attachValidationSuccess(handler4);
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
			setTimeout(() => { // delay the following test
				assert.ok(bSuccess, "parse error occurred sucessfully and no other events occurred");
				assert.ok(iEventCount == 1, "event count should be 1");
				this.oParent.detachParseError(handler);
				this.oParent.detachFormatError(handler);
				this.oParent.detachValidationError(handler);
				this.oParent.detachValidationSuccess(handler);
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
			this.oParent.attachParseError(handler);
			this.oParent.attachValidationError(handler2);
			this.oParent.attachFormatError(handler3);
			this.oParent.attachValidationSuccess(handler4);
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
			setTimeout(() => { // delay the following test
				assert.ok(bSuccess, "validation error occurred sucessfully and no other events occurred");
				assert.ok(iEventCount == 1, "event count should be 1");
				this.oParent.detachParseError(handler);
				this.oParent.detachFormatError(handler);
				this.oParent.detachValidationError(handler);
				this.oParent.detachValidationSuccess(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("validation success on core and parent --> bubbling", function (assert) {
			var done = assert.async();
			var oType = new TypeString();
			var oInput = this.oInput;
			oInput.bindValue("/test", oType);
			var bSuccess = false;
			this.oParent.attachValidationSuccess(handler);
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
			setTimeout(() => { // delay the following test
				assert.ok(bSuccess, "validation was sucessful");
				assert.equal(iCount, 2, "validation event count");
				this.oParent.detachValidationSuccess(handler);
				oInput.detachValidationSuccess(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("validation error on core and parent --> bubbling", function (assert) {
			var done = assert.async();
			var oType = new TypeString(null, {
				minLength: 1,
				maxLength: 5
			});
			var oInput = this.oInput;
			oInput.bindValue("/test", oType);
			var bSuccess = false;
			this.oParent.attachValidationError(handler);
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
			setTimeout(() => { // delay the following test
				assert.ok(bSuccess, "error occurred sucessfully");
				assert.equal(iCount, 2, "validation event count");
				this.oParent.detachValidationError(handler);
				oInput.detachValidationError(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("validation error on core and parent --> cancel bubbling", function (assert) {
			var done = assert.async();
			var oType = new TypeString(null, {
				minLength: 1,
				maxLength: 5
			});
			var oInput = this.oInput;
			oInput.bindValue("/test", oType);
			var bSuccess = false;
			this.oParent.attachValidationError(handler);
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
			setTimeout(() => { // delay the following test
				assert.ok(bSuccess, "error occurred sucessfully");
				assert.equal(iCount, 1, "validation event count");
				this.oParent.detachValidationError(handler);
				oInput.detachValidationError(handler);
				done();          // resume normal testing
			}, 100);
		});

		QUnit.test("parse error on core and parent --> bubbling", function (assert) {
			var done = assert.async();
			var oType = new TypeInteger();
			var oInput = this.oInput;
			oInput.bindValue("/visibleItems", oType);
			var bSuccess = false;
			oInput.attachParseError(handler);
			this.oParent.attachParseError(handler);
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
			setTimeout(() => { // delay the following test
				assert.ok(bSuccess, "error occurred sucessfully");
				oInput.detachParseError(handler);
				assert.equal(iCount, 2, "validation event count");
				this.oParent.detachParseError(handler);
				done();          // resume normal testing
			}, 100);

		});

		QUnit.test("format error on core and parent --> cancel bubbling", function (assert) {
			var done = assert.async();
			var oType = new TypeString();
			var oRating = new RatingIndicator();
			oRating.bindValue("/rating", oType);
			this.placeAt(oRating);
			var oInput = this.oInput;
			oInput.bindValue("/rating", oType);
			var bSuccess = false;
			this.oParent.attachFormatError(handler);
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
			setTimeout(() => { // delay the following test
				assert.ok(bSuccess, "error occurred sucessfully");
				this.oParent.detachFormatError(handler);
				oInput.detachFormatError(handler);
				assert.equal(iCount, 1, "validation event count");
				oRating.destroy();
				done();          // resume normal testing
			}, 100);

		});
	}

	/**
	 * @deprecated As of 1.118, get/setModel, parseError, validationError etc. are deprecated on the Core
	 */
	QUnit.module("Core and Control", {
		beforeEach: function() {
			oModel.setData({
				visibleItems: 3,
				test: "hello",
				rating: "4"
			});
			this.oInput = new Input().placeAt("target1");
			this.oParent = Core;
			this.oParent.setModel(oModel);
			this.placeAt = (oCtrl) => oCtrl.placeAt("target2");
		},
		afterEach: function() {
			this.oInput.destroy();
			this.oParent.setModel();
		}
	});

	/**
	 * @deprecated As of 1.118, get/setModel, parseError, validationError etc. are deprecated on the Core
	 */
	createTests();



	QUnit.module("UIArea and Control", {
		beforeEach: function() {
			oModel.setData({
				visibleItems: 3,
				test: "hello",
				rating: "4"
			});
			this.oInput = new Input().placeAt("target1");
			this.oParent = this.oInput.getUIArea();
			this.oParent.setModel(oModel);
			this.placeAt = (oCtrl) => this.oParent.addContent(oCtrl);
		},
		afterEach: function() {
			this.oInput.destroy();
			this.oParent.setModel();
		}
	});

	createTests();



	QUnit.module("Container Control and Control", {
		beforeEach: function() {
			oModel.setData({
				visibleItems: 3,
				test: "hello",
				rating: "4"
			});
			this.oInput = new Input();
			this.oParent = new Panel().placeAt("target1");
			this.oParent.setModel(oModel);
			this.oParent.addContent(this.oInput);
			this.placeAt = (oCtrl) => this.oParent.addContent(oCtrl);
		},
		afterEach: function() {
			this.oInput.destroy();
			this.oParent.setModel();
		}
	});

	createTests();

});
