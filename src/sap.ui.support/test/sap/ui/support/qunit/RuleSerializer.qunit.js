/*global QUnit*/

sap.ui.define([
		"sap/ui/support/supportRules/RuleSerializer"],
	function (RuleSerializer) {
	"use strict";

	QUnit.module("RuleSerializer API test");

	QUnit.test("Serialize plain object test", function (assert) {
		//The \\n here is because FireFoxESR adds the "use strict" with 2 new lines
		var expectedString = '{\"a\":1,\"b\":\"str\",\"c\":false,\"d\":\"function () { \\"use strict\\"; tempFunc(); }\",\"e\":[1,2,\"str\"]}',
			serializedObject = {
				a: 1,
				b: "str",
				c: false,
				/* eslint-disable strict, no-undef*/
				d: function () { "use strict"; tempFunc(); },
				/* eslint-enable strict, no-undef*/
				e: [1, 2, "str"]
			},
			serializedString = RuleSerializer.serialize(serializedObject);

		assert.equal(serializedString, expectedString, "The serializer should save functions as strings");
	});

	QUnit.test("Deserialize object", function (assert) {
		var serializedString = '{"a":1,"b":"str","c":false,"d":"function () { tempFunc(); }","e":[1,2,"str"],"check":"function () { tempFunc(); }"}',
			deserializedObj = RuleSerializer.deserialize(serializedString);

		var partiallyDeserialized = JSON.parse(serializedString);
		var partiallyDeserializedObj = RuleSerializer.deserialize(partiallyDeserialized);

		assert.equal(deserializedObj.a, 1, "property a should be equal to 1");
		assert.equal(deserializedObj.b, "str", "property b should be equal to 'str'");
		assert.equal(deserializedObj.c, false, "property b should be equal to false");
		assert.equal(deserializedObj.d, "function () { tempFunc(); }", "property d should be equal to a string");
		assert.equal(typeof deserializedObj.a, "number", "property 'a' should be of type number");
		assert.equal(typeof deserializedObj.b, "string", "property 'b' should be of type string");
		assert.equal(typeof deserializedObj.c, "boolean", "property 'c' should be of type boolean");
		assert.equal(typeof deserializedObj.d, "string", "property 'd' should be of type string");
		assert.equal(typeof deserializedObj.e, "object", "property 'e' should be of type object");
		assert.equal(typeof deserializedObj.check, "function", "property 'check' should be of type function");
		assert.equal(typeof partiallyDeserializedObj.check, "function", "property 'check' should be of type function in partiallyDeserializedObj");
	});
});
