/*global QUnit */
sap.ui.define([
	'sap/ui/core/library',
	'sap/ui/core/message/Message',
	'sap/ui/core/message/MessageProcessor',
	'sap/ui/core/message/MessageType'
], function(coreLibrary, Message, MessageProcessor, MessageType) {
	/*eslint max-nested-callbacks: 0 */
	"use strict";

	QUnit.module("sap/ui/core/message/Message");


	QUnit.test("Create message without any parameter - Check default values", function(assert) {

		// Arrange
		var date = Date.now();

		// Act
		var oMessage = new Message();

		// Assert
		assert.ok(oMessage, "Object successfully created");
		assert.ok(oMessage instanceof Message, "Object has expected Data Type");
		assert.deepEqual(oMessage.persistent, false, "Property 'persistent' has expected value");
		assert.deepEqual(oMessage.technical, false, "Property 'technical' has expected value");
		assert.ok(typeof oMessage.date === "number", "Property 'date' has expected Data Type");
		assert.ok(oMessage.date >= date, "Property 'date' has expected value");
		assert.ok(oMessage.type === MessageType.None, "Property 'type' has expected value");
	});

[
	{vTarget : "foo", aTargets : ["foo"]},
	{vTarget : ["foo", "bar"], aTargets : ["foo", "bar"]},
	{vTarget : undefined, aTargets : []},
	{vTarget : "", aTargets : [""]}
].forEach(function (oFixture, i) {
	QUnit.test("Create message with all properties and target access, " + i, function(assert) {

		// Arrange
		var mParameters = {
				id: "~id",
				message: "~message",
				description: "~description",
				type: MessageType.Error,
				date: "~date",
				additionalText: "~additionalText",
				code: "~code",
				target: oFixture.vTarget,
				persistent: "~persistent",
				technical: "~technical",
				technicalDetails: "~technicalDetails",
				descriptionUrl: "~descriptionUrl",
				references: "~references",
				processor: "~processor",
				validation: "~validation",
				fullTarget: "~fullTarget"
			};

		// Act
		var oMessage = new Message(mParameters);

		// Assert
		assert.strictEqual(oMessage.id, "~id");
		assert.strictEqual(oMessage.message, "~message");
		assert.strictEqual(oMessage.description, "~description");
		assert.strictEqual(oMessage.descriptionUrl, "~descriptionUrl");
		assert.strictEqual(oMessage.additionalText, "~additionalText");
		assert.strictEqual(oMessage.type, MessageType.Error);
		assert.strictEqual(oMessage.code, "~code");
		assert.deepEqual(oMessage.aTargets, oFixture.aTargets);
		assert.strictEqual(oMessage.processor, "~processor");
		assert.strictEqual(oMessage.persistent, "~persistent");
		assert.strictEqual(oMessage.technical, "~technical");
		assert.strictEqual(oMessage.technicalDetails, "~technicalDetails");
		assert.strictEqual(oMessage.references, "~references");
		assert.strictEqual(oMessage.validation, true);
		assert.strictEqual(oMessage.date, "~date");
		assert.deepEqual(oMessage.controlIds, []);
		assert.deepEqual(oMessage.aFullTargets, ["~fullTarget"]);

		if (Array.isArray(oFixture.vTarget)) {
			assert.notStrictEqual(oMessage.aTargets, oFixture.vTarget, "store copy of targets");
		}
		/**
		 * @deprecated As of version 1.79.0
		 */
		(function () {
			assert.strictEqual(oMessage.target, oFixture.aTargets[0]);
			assert.strictEqual(oMessage.fullTarget, "~fullTarget");
		}());
	});
});

[
	{vFullTarget : undefined, aExpectedFullTargets : [""]},
	{vFullTarget : [], aExpectedFullTargets : [""]},
	{vFullTarget : "foo",aExpectedFullTargets : ["foo"]},
	{vFullTarget : ["foo", "bar"], aExpectedFullTargets : ["foo", "bar"]}
].forEach(function (oFixture, i) {
	QUnit.test("Create message with full target, " + i, function(assert) {
		var oMessage = new Message({fullTarget: oFixture.vFullTarget});

		assert.deepEqual(oMessage.aFullTargets, oFixture.aExpectedFullTargets);
		if (Array.isArray(oFixture.vFullTarget)) {
			assert.notStrictEqual(oMessage.aFullTargets, oFixture.vFullTarget,
				"store copy of full targets");
		}
		/**
		 * @deprecated As of version 1.79.0
		 */
		(function () {
			assert.strictEqual(oMessage.fullTarget, oFixture.aExpectedFullTargets[0]);

			// code under test
			oMessage.fullTarget = "baz";

			oFixture.aExpectedFullTargets[0] = "baz";
			assert.deepEqual(oMessage.aFullTargets, oFixture.aExpectedFullTargets);

			// code under test
			oMessage.aFullTargets[0] = "baz2";

			assert.strictEqual(oMessage.fullTarget, "baz2");
		}());
	});
});
	/**
	 * @deprecated As of version 1.79.0
	 */
["foo", ["foo", "bar"], undefined, ""].forEach(function (vTarget, i) {
	QUnit.test("set target, " + i, function (assert) {
		var oMessage = new Message({target : vTarget});

		// check that only first target is modified
		function checkOtherTargets() {
			var aTargets = oMessage.getTargets();

			assert.strictEqual(aTargets.length, Array.isArray(vTarget) ? vTarget.length : 1);
			if (Array.isArray(vTarget)) {
				assert.deepEqual(aTargets.slice(1), vTarget.slice(1));
			}
		}

		// code under test
		oMessage.setTarget("new");

		assert.strictEqual(oMessage.getTarget(), "new");
		assert.strictEqual(oMessage.target, "new");
		checkOtherTargets();

		// code under test
		oMessage.target = "newer";

		assert.strictEqual(oMessage.getTarget(), "newer");
		assert.strictEqual(oMessage.target, "newer");
		checkOtherTargets();
	});
});
	/**
	 * @deprecated As of version 1.79.0
	 */
	QUnit.test("target property is not configurable", function (assert) {
		var oMessage = new Message({target : ["foo", "bar"]});

		// code under test
		assert.throws(function () {
			delete oMessage.target;
		});

		// code under test
		assert.throws(function () {
			Object.defineProperty(oMessage, "target", {get : function () {return null;}});
		});
	});
	/**
	 * @deprecated As of version 1.79.0
	 */
	QUnit.test("fullTarget property is not configurable", function (assert) {
		var oMessage = new Message({fullTarget : ["foo", "bar"]});

		// code under test
		assert.throws(function () {
			delete oMessage.fullTarget;
		});

		// code under test
		assert.throws(function () {
			Object.defineProperty(oMessage, "fullTarget", {get : function () {return null;}});
		});
	});

	QUnit.test("Create message:  getTechnicalDetails", function(assert) {
		var oMessage,
			oTechnicalDetails = {foo: 'bar'};

		oMessage = new Message({technicalDetails: oTechnicalDetails});

		assert.strictEqual(oMessage.getTechnicalDetails(), oTechnicalDetails);
	});

	QUnit.test("Create message: setTechnicalDetails", function(assert) {
		var oTechnicalDetails = {foo: 'bar'},
			oTechnicalDetails2 = {bar: 'foo'},
			oMessage = new Message({technicalDetails: oTechnicalDetails});

		oMessage.setTechnicalDetails(oTechnicalDetails2);

		assert.strictEqual(oMessage.getTechnicalDetails(), oTechnicalDetails2);
	});

[
	MessageType.Error,
	MessageType.Warning,
	MessageType.Success,
	MessageType.Information,
	MessageType.None
].forEach(function (sType0, i0, aTypes) {
	var oMessage0 = new Message({type : sType0});

	/**
	 * Creating Messages with an unknown type will not be possible in UI5 2.x
	 * @deprecated
	 */
	QUnit.test("compare " + sType0 + " with unknown", function (assert) {
		var oMessageUnknown = new Message({type : "unknown"});

		// code under test
		assert.ok(isNaN(Message.compare(oMessage0, oMessageUnknown)));
		assert.ok(isNaN(Message.compare(oMessageUnknown, oMessage0)));
	});
	aTypes.forEach(function (sType1, i1) {
		QUnit.test("compare " + sType0 + " with " + sType1, function (assert) {
			var oMessage1 = new Message({type : sType1}),
				iResult;

			// code under test
			iResult = Message.compare(oMessage0, oMessage1);

			if (sType0 === sType1) {
				assert.strictEqual(iResult, 0);
			} else if (i0 < i1) {
				assert.ok(iResult < 0);
			} else {
				assert.ok(iResult > 0);
			}
		});
	});
});

[
	{input : undefined, output : []},
	{input : "target", output : ["target"]},
	{input : ["target0", "target1"], output : ["target0", "target1"]}
].forEach(function (oFixture, i) {
	QUnit.test("getTargets, " + i, function (assert) {
		var oMessage = new Message({target : oFixture.input}),
			aTargets;

		// code under test
		aTargets = oMessage.getTargets();

		assert.deepEqual(aTargets, oFixture.output);
		assert.notStrictEqual(aTargets, oMessage.aTargets, "return value is a copy");
	});
});

	QUnit.test("setTargets", function (assert) {
		var oMessage = new Message(),
			aTargets = ["target"];

		// code under test
		oMessage.setTargets(aTargets);

		assert.deepEqual(oMessage.getTargets(), aTargets);
		assert.notStrictEqual(aTargets, oMessage.aTargets, "message stores a copy");
	});
});
