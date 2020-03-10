/*global QUnit*/
sap.ui.define([
	"sap/ui/support/supportRules/util/Utils"
], function (Utils) {
	"use strict";

	QUnit.module("Utils.js methods", {
		beforeEach: function () {
			this.oVersionInfo = {
				name: "testsuite",
				gav: "com.sap.openui5:testsuite:1.53.0-SNAPSHOT"
			};
		},
		afterEach: function () {
			this.oVersionInfo = null;
		}
	});

	QUnit.test('When the framework distribution is checked', function (assert) {
		// act
		var result = Utils.isDistributionOpenUI5(this.oVersionInfo);

		// assert
		assert.strictEqual(result, true, "The return result should be true, since the oVersionInfo shows this is openUI5 dist of framework");
	});

	QUnit.module("Utils.js generateUuidV4 method", {});

	QUnit.test('Two generated uuids are different', function (assert) {
		// act
		var uuid1 = Utils.generateUuidV4(),
			uuid2 = Utils.generateUuidV4();

		// assert
		assert.notEqual(uuid1, uuid2, "The generated uuids are different.");
	});

	QUnit.test('A generated uuid has correct format', function (assert) {
		var uuidV4Regex = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);

		// act
		var uuid = Utils.generateUuidV4();

		// assert
		assert.strictEqual(uuidV4Regex.test(uuid), true, "The generated uuid has correct format.");
	});
});
