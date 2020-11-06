/*!
 * ${copyright}
 */

/*global QUnit */
/*eslint no-warning-comments: 0 */

sap.ui.define([
		"sap/ui/mdc/condition/ConditionModel",
		"sap/ui/mdc/condition/Condition",
		"sap/ui/model/json/JSONModel",
		"sap/ui/mdc/enum/ConditionValidated"
		], function(ConditionModel, Condition, JSONModel, ConditionValidated) {
	"use strict";

	var oConditionModel;
	var sPath;
	var sReason;
	var iCount = 0;
	function handlePropertyChange(oEvent) {
		sPath = oEvent.getParameter("path");
		sReason = oEvent.getParameter("reason");
		iCount++;
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.mdc.condition.ConditionModel", {
		beforeEach: function() {
			oConditionModel = new ConditionModel();
		},

		afterEach: function() {
			sPath = undefined;
			sReason = undefined;
			iCount = 0;
			if (oConditionModel) {
				oConditionModel.destroy();
				oConditionModel = undefined;
			}
		}
	});


	//*********************************************************************************************
	QUnit.test("create condition", function(assert) {
		var sData = JSON.stringify(oConditionModel.getData());
		assert.ok(sData === '{"conditions":{},"fieldPath":{}}', "Default Data exist");
	});

		QUnit.test("ConditionModel.createCondition", function(assert) {
		var oCondition = oConditionModel.createCondition("fieldPath1", "EQ", ["foo"]); // test deprecated function for compatibility reasons
		assert.equal(oCondition.operator, "EQ", "condition.operator must be 'EQ'");
		assert.equal(oCondition.values.length, 1, "condition.values.length must be 1");
		assert.equal(oCondition.values[0], "foo", "condition.value[0] must be 'foo'");
		assert.notOk(oCondition.validated, "Condition validated unknown");

		oCondition = Condition.createCondition("GT", [100]);
		assert.equal(oCondition.operator, "GT", "condition.operator must be 'GT'");
		assert.equal(oCondition.values.length, 1, "condition.values.length must be 1");
		assert.equal(oCondition.values[0], 100, "condition.value[0] must be 100");
		assert.notOk(oCondition.validated, "Condition validated unknown");

		oCondition = oConditionModel.createItemCondition("fieldPath3", "key", "description"); // test deprecated function for compatibility reasons
		assert.equal(oCondition.operator, "EQ", "condition.operator must be 'EQ'");
		assert.equal(oCondition.values.length, 2, "condition.values.length must be 2");
		assert.equal(oCondition.values[0], "key", "condition.value[0] must be 'key'");
		assert.equal(oCondition.values[1], "description", "condition.value[1] must be 'description'");
		assert.equal(oCondition.validated, ConditionValidated.Validated, "Condition is validated");

		oCondition = Condition.createItemCondition("key", "description");
		assert.equal(oCondition.operator, "EQ", "condition.operator must be 'EQ'");
		assert.equal(oCondition.values.length, 2, "condition.values.length must be 2");
		assert.equal(oCondition.values[0], "key", "condition.value[0] must be 'key'");
		assert.equal(oCondition.values[1], "description", "condition.value[1] must be 'description'");
		assert.equal(oCondition.validated, ConditionValidated.Validated, "Condition is validated");
	});

	QUnit.test("ConditionModel.add/removeConditions", function(assert) {
		oConditionModel.attachPropertyChange(handlePropertyChange);

		oConditionModel.addCondition("fieldPath1", Condition.createCondition("EQ", ["foo"]));
		assert.equal(sPath, "/conditions/fieldPath1", "PropertyChange event fired");
		assert.equal(sReason, "add", "PropertyChange event reason");
		assert.equal(iCount, 1, "PropertyChange event fired once");
		sPath = undefined; sReason = undefined; iCount = 0;
		oConditionModel.addCondition("field/Path2", Condition.createCondition("BT", [1, 100]));
		assert.equal(sPath, "/conditions/field/Path2", "PropertyChange event fired");
		assert.equal(sReason, "add", "PropertyChange event reason");
		assert.equal(iCount, 1, "PropertyChange event fired once");
		sPath = undefined; sReason = undefined; iCount = 0;
		oConditionModel.addCondition("fieldPath3", Condition.createCondition("GT", [new Date()]));
		assert.equal(sPath, "/conditions/fieldPath3", "PropertyChange event fired");
		assert.equal(sReason, "add", "PropertyChange event reason");
		assert.equal(iCount, 1, "PropertyChange event fired once");
		sPath = undefined; sReason = undefined; iCount = 0;

		assert.equal(oConditionModel.getConditions("fieldPath1").length, 1, "one condition expected");
		assert.equal(oConditionModel.getConditions("field/Path2").length, 1, "one condition expected");
		assert.equal(oConditionModel.getConditions("fieldPath3").length, 1, "one condition expected");

		oConditionModel.addCondition("fieldPath3", Condition.createCondition("LT", ["xxx"]));
		assert.equal(oConditionModel.getConditions("fieldPath3").length, 2, "two conditions expected");

		oConditionModel.addCondition("fieldPath3", Condition.createCondition("LT", ["xxx"]));
		assert.equal(oConditionModel.getConditions("fieldPath3").length, 2, "still 2 conditions expected, last addCondition ignored because the condition already exist");

		oConditionModel.addCondition("fieldPath3", Condition.createCondition("LT", ["xxx"]), true);
		assert.equal(oConditionModel.getConditions("fieldPath3").length, 3, "now 3 conditions expected");

		sPath = undefined; sReason = undefined; iCount = 0;
		oConditionModel.removeCondition("fieldPath1", 0);
		assert.equal(oConditionModel.getConditions("fieldPath1").length, 0, "no conditions expected");
		assert.equal(sPath, "/conditions/fieldPath1", "PropertyChange event fired");
		assert.equal(sReason, "remove", "PropertyChange event reason");
		assert.equal(iCount, 1, "PropertyChange event fired once");
		sPath = undefined; sReason = undefined; iCount = 0;

		oConditionModel.removeCondition("field/Path2", 0);
		assert.equal(oConditionModel.getConditions("field/Path2").length, 0, "no conditions expected");
		assert.equal(sPath, "/conditions/field/Path2", "PropertyChange event fired");
		assert.equal(sReason, "remove", "PropertyChange event reason");
		assert.equal(iCount, 1, "PropertyChange event fired once");
		sPath = undefined; sReason = undefined; iCount = 0;

		oConditionModel.removeCondition("fieldPath3", 0);
		assert.equal(oConditionModel.getConditions("fieldPath3").length, 2, "two condition expected");
		var oCondition = oConditionModel.getConditions("fieldPath3")[0];
		oConditionModel.removeCondition("fieldPath3", oCondition);
		assert.equal(oConditionModel.getConditions("fieldPath3").length, 1, "one condition expected");
		oCondition = Condition.createCondition("GT", ["XYZ"]);
		oConditionModel.removeCondition("fieldPath3", oCondition);
		assert.equal(oConditionModel.getConditions("fieldPath3").length, 1, "one condition expected, as removing condition is not in model");
		oConditionModel.removeCondition("fieldPath3", 0);
		assert.equal(oConditionModel.getConditions("fieldPath3").length, 0, "no condition expected");
	});

	QUnit.test("ConditionModel.insertConditions", function(assert) {
		oConditionModel.attachPropertyChange(handlePropertyChange);

		oConditionModel.insertCondition("fieldPath1", 0, Condition.createCondition("EQ", [1]));
		assert.equal(sPath, "/conditions/fieldPath1", "PropertyChange event fired");
		assert.equal(sReason, "add", "PropertyChange event reason");
		assert.equal(iCount, 1, "PropertyChange event fired once");
		sPath = undefined; sReason = undefined; iCount = 0;
		oConditionModel.insertCondition("fieldPath1", 0, Condition.createCondition("EQ", [2, "text"]));
		assert.equal(sPath, "/conditions/fieldPath1", "PropertyChange event fired");
		assert.equal(sReason, "add", "PropertyChange event reason");
		assert.equal(iCount, 1, "PropertyChange event fired once");
		sPath = undefined; sReason = undefined; iCount = 0;
		oConditionModel.insertCondition("fieldPath1", 0, Condition.createCondition("EQ", []));
		assert.equal(sPath, "/conditions/fieldPath1", "PropertyChange event fired");
		assert.equal(sReason, "add", "PropertyChange event reason");
		assert.equal(iCount, 1, "PropertyChange event fired once");
		sPath = undefined; sReason = undefined; iCount = 0;

		var aConditions = oConditionModel.getConditions("fieldPath1");
		assert.equal(aConditions.length, 3, "number of conditions");
		assert.equal(aConditions[0].values.length, 1, "Condition.values.length");
		assert.equal(aConditions[0].values[0], undefined, "Condition.values[0]");
		assert.ok(aConditions[0].isEmpty, "Conditions.isEmpty");

		assert.equal(aConditions[1].values.length, 2, "Condition.values.length");
		assert.equal(aConditions[1].values[0], 2, "Condition.values[0]");
		assert.equal(aConditions[1].values[1], "text", "Condition.values[1]");
		assert.notOk(aConditions[1].isEmpty, "Conditions.isEmpty");

		assert.equal(aConditions[2].values.length, 1, "Condition.values.length");
		assert.equal(aConditions[2].values[0], 1, "Condition.values[0]");
		assert.notOk(aConditions[2].isEmpty, "Conditions.isEmpty");
	});

	QUnit.test("ConditionModel.indexOf/exist", function(assert) {
		var c1 = Condition.createCondition("EQ", ["foo"]);
		oConditionModel.addCondition("fieldPath1", c1);
		var c2 = Condition.createCondition("EQ", ["foo2"]);
		oConditionModel.addCondition("fieldPath1", c2);
		var c3 = Condition.createCondition("BT", [1, 100]);
		oConditionModel.addCondition("fieldPath2", c3);
		var c4 = Condition.createCondition("BT", [2, 99]);
		oConditionModel.addCondition("fieldPath2", c4);
		var c5 = Condition.createCondition("GT", [new Date()]);
		oConditionModel.addCondition("fieldPath3", c5);
		var c6 = Condition.createCondition("GT", [new Date(2018, 7, 24)]);
		oConditionModel.addCondition("fieldPath3", c6);

		assert.equal(oConditionModel.indexOf("fieldPath1", c1), 0, "condition found");
		assert.equal(oConditionModel.indexOf("fieldPath1", c2), 1, "condition found");
		assert.equal(oConditionModel.indexOf("fieldPath2", c3), 0, "condition found");
		assert.equal(oConditionModel.indexOf("fieldPath2", c4), 1, "condition found");
		assert.equal(oConditionModel.indexOf("fieldPath3", c5), 0, "condition found");
		assert.equal(oConditionModel.indexOf("fieldPath3", c6), 1, "condition found");
		assert.ok(oConditionModel.exist(c2, "fieldPath1"), "condition should exist");

		oConditionModel.removeCondition("fieldPath2", 0);
		assert.equal(oConditionModel.indexOf("fieldPath2", c3), -1, "condition should not exist");
		assert.notOk(oConditionModel.exist(c3, "fieldPath2"), "condition should not exist");

		// normalization
		var iNormalized = 0;
		var fnNormalize = function (oCondition) {
			iNormalized++;
			return Object.assign({}, oCondition, {values: oCondition.values.map(function (sValue) {
				return sValue.replace(/^0*(?=\d)/, "");
			})});
		};
		var oLeadingZerosCondition = Condition.createCondition("EQ", ["0000000763"]);
		var oCondition = Condition.createCondition("EQ", ["763"]);
		oConditionModel.addCondition("fieldPath4", oCondition);
		assert.ok(oConditionModel.indexOf("fieldPath4", oLeadingZerosCondition) === -1, "Existing condition not considered without normalization.");
		assert.ok(oConditionModel.indexOf("fieldPath4", oLeadingZerosCondition, fnNormalize) >= 0, "Existing condition considered.");
		assert.ok(iNormalized, "normalization method was called.");
	});

	QUnit.test("getAllConditions", function(assert) {
		var c1 = Condition.createCondition("EQ", ["foo"]);
		oConditionModel.addCondition("fieldPath1", c1);
		var c2 = Condition.createCondition("EQ", ["foo2"]);
		oConditionModel.addCondition("fieldPath1", c2);
		var c3 = Condition.createCondition("BT", [1, 100]);
		oConditionModel.addCondition("field/Path2", c3);
		var c4 = Condition.createCondition("BT", [2, 99]);
		oConditionModel.addCondition("field/Path2", c4);
		var c5 = Condition.createCondition("GT", [new Date()]);
		oConditionModel.addCondition("fieldPath3", c5);

		var oConditions = oConditionModel.getAllConditions();
		var iNumber = 0;
		var sFieldPath; // eslint-disable-line no-unused-vars
		for (sFieldPath in oConditions) {
			iNumber++;
		}
		assert.equal(iNumber, 3, "FieldPaths returned");
		assert.equal(oConditions.fieldPath1.length, 2, "fieldPath1 conditions");
		assert.equal(oConditions["field/Path2"].length, 2, "field/Path2 conditions");
		assert.equal(oConditions.fieldPath3.length, 1, "fieldPath3 conditions");

		oConditions = oConditionModel.getAllConditions("field/Path2");
		iNumber = 0;
		for (sFieldPath in oConditions) {
			iNumber++;
		}
		assert.equal(iNumber, 1, "FieldPaths returned");
		assert.equal(oConditions["field/Path2"].length, 2, "field/Path2 conditions");

		oConditions = oConditionModel.getAllConditions(["fieldPath1", "field/Path2"]);
		iNumber = 0;
		for (sFieldPath in oConditions) {
			iNumber++;
		}
		assert.equal(iNumber, 2, "FieldPaths returned");
		assert.equal(oConditions.fieldPath1.length, 2, "fieldPath1 conditions");
		assert.equal(oConditions["field/Path2"].length, 2, "field/Path2 conditions");

		oConditions = oConditionModel.getAllConditions("X");
		iNumber = 0;
		for (var sFieldPath in oConditions) {
			iNumber++;
		}
		assert.equal(iNumber, 0, "FieldPaths returned");

	});

	QUnit.test("ConditionModel.clone", function(assert) {

		oConditionModel.addCondition("fieldPath1", Condition.createCondition("EQ", ["foo"]));
		oConditionModel.addCondition("fieldPath2", Condition.createCondition("BT", [1, 100]));
		oConditionModel.addCondition("fieldPath3", Condition.createCondition("GT", [new Date()]));

		var oClone = oConditionModel.clone("fieldPath1");
		assert.equal(oClone.getConditions("fieldPath1").length, 1, "only one condition expected for FieldPath1");
		assert.equal(oClone.getConditions("fieldPath2").length, 0, "no condition expected for FieldPath2");
		assert.equal(oClone.getConditions("fieldPath3").length, 0, "no condition expected for FieldPath3");

		oClone = oConditionModel.clone();
		assert.equal(oClone.getConditions("fieldPath1").length, 1, "only one condition expected for FieldPath1");
		assert.equal(oClone.getConditions("fieldPath2").length, 1, "only one condition expected for FieldPath2");
		assert.equal(oClone.getConditions("fieldPath3").length, 1, "only one condition expected for FieldPath3");

		oClone.destroy();

	});

	QUnit.test("ConditionModel.merge", function(assert) {

		oConditionModel.addCondition("fieldPath1", Condition.createCondition("EQ", ["foo"]));
		oConditionModel.addCondition("fieldPath2", Condition.createCondition("BT", [1, 100]));
		oConditionModel.addCondition("fieldPath3", Condition.createCondition("GT", [new Date()]));

		var oConditionModel2 = new ConditionModel();
		oConditionModel2.addCondition("fieldPath1", Condition.createCondition("EQ", ["new"]));
		oConditionModel2.addCondition("fieldPath1", Condition.createCondition("BT", ["new2", "news2"]));
		oConditionModel2.addCondition("fieldPath2", Condition.createCondition("EQ", ["new3"]));

		// Remove existing newFieldPath conditions and merge the condition with name fieldPath1
		oConditionModel.merge("fieldPath1", oConditionModel2, "fieldPath1");
		assert.equal(oConditionModel.getConditions("fieldPath1").length, 2, "2 conditions expected for fieldPath1");
		assert.equal(oConditionModel.getConditions("fieldPath2").length, 1, "1 condition expected for fieldPath2");
		assert.equal(oConditionModel.getConditions("fieldPath2")[0].operator, "BT", "operator for condition for fieldPath2");
		assert.equal(oConditionModel.getConditions("fieldPath3").length, 1, "1 condition expected for fieldPath3");

		// Remove existing FieldPath1 conditions and merge the new from oConditionModel2
		oConditionModel.merge("fieldPath1", oConditionModel2);
		assert.equal(oConditionModel.getConditions("fieldPath1").length, 2, "2 conditions expected for fieldPath1");
		assert.equal(oConditionModel.getConditions("fieldPath2").length, 2, "2 condition2 expected for fieldPath2");
		assert.equal(oConditionModel.getConditions("fieldPath3").length, 1, "1 condition expected for fieldPath3");

		oConditionModel2.destroy();

	});

	QUnit.test("Condition.removeEmptyConditions", function(assert) {

		oConditionModel.addCondition("fieldPath1", Condition.createCondition("EQ", ["foo"]));
		oConditionModel.addCondition("fieldPath1", Condition.createCondition("BT", []));
		oConditionModel.addCondition("fieldPath1", Condition.createCondition("GT", []));

		var aConditions = Condition._removeEmptyConditions(oConditionModel.getConditions("fieldPath1"));
		assert.equal(aConditions.length, 1, "1 condition expected");

	});

	QUnit.test("ConditionModel.serialize/parse", function(assert) {

		var oCM = new ConditionModel();

		oCM.addCondition("fieldPath1", Condition.createCondition("EQ", ["foo"]));
		oCM.addCondition("fieldPath2", Condition.createCondition("BT", [1, 100]));
		oCM.addCondition("fieldPath3", Condition.createCondition("GT", [new Date(Date.UTC(2017, 3, 25, 10, 30, 0, 0))]));

		var s = oCM.serialize();
		assert.strictEqual(s, '{\"conditions\":{\"fieldPath1\":[{\"operator\":\"EQ\",\"values\":[\"foo\"]}],\"fieldPath2\":[{\"operator\":\"BT\",\"values\":[1,100]}],\"fieldPath3\":[{\"operator\":\"GT\",\"values\":[\"2017-04-25T10:30:00.000Z\"]}]}}', "serialize returns the expected value");

		oCM.parse('{"conditions":{"fieldPath1":[{"operator":"EQ","values":["foo"]}],"fieldPath2":[{"operator":"BT","values":[1,100]}],"fieldPath3":[{"operator":"GT","values":["2017-04-25T10:30:00.000Z"]}]}}');
		assert.strictEqual(oCM.getConditions("fieldPath1").length, 1, "after parse 1 condition should exist for fieldPath1");
		assert.strictEqual(oCM.getConditions("fieldPath2").length, 1, "after parse 1 condition should exist for fieldPath2");
		assert.strictEqual(oCM.getConditions("fieldPath3").length, 1, "after parse 1 condition should exist for fieldPath3");
		assert.strictEqual(oCM.getConditions("fieldPath1")[0].values[0], "foo", "value of condition for fieldPath1 is foo");
		assert.strictEqual(oCM.getConditions("fieldPath2")[0].values[0], 1, "first value of condition for fieldPath1 is 1");

		oCM.destroy();
	});

	var oConditionChangeBinding;
	var oConditionChangeBinding1;
	var oConditionChangeBinding2;
	var oConditionChangeBinding3;
	var oConditionChangeBinding4;
	var oConditionChange = {};
	function handleChange(oEvent) {
		if (!oConditionChange[oEvent.oSource._sOriginapPath]) {
			oConditionChange[oEvent.oSource._sOriginapPath] = {reason: "", count: 0};
		}
		oConditionChange[oEvent.oSource._sOriginapPath].reason = oEvent.getParameter("reason");
		oConditionChange[oEvent.oSource._sOriginapPath].count++;
	}

	QUnit.module("ConditionPropertyBinding", {
		beforeEach: function() {
			oConditionModel = new ConditionModel();
			oConditionModel.addCondition("fieldPath1", Condition.createItemCondition("key", "description"));
			oConditionModel.addCondition("field/Path2", Condition.createItemCondition("key1", "description1"));
			oConditionChangeBinding = oConditionModel.bindProperty("/conditions", oConditionModel.getContext("/conditions"));
			oConditionChangeBinding.attachChange(handleChange);
			oConditionChangeBinding1 = oConditionModel.bindProperty("/conditions/fieldPath1", oConditionModel.getContext("/conditions/fieldPath1"));
			oConditionChangeBinding1.attachChange(handleChange);
			oConditionChangeBinding1._sID = "B1"; // for debugging
			oConditionChangeBinding2 = oConditionModel.bindProperty("/conditions/fieldPath1", oConditionModel.getContext("/conditions/fieldPath1"));
			oConditionChangeBinding2.attachChange(handleChange);
			oConditionChangeBinding2._sID = "B2"; // for debugging
			oConditionChangeBinding3 = oConditionModel.bindProperty("/conditions/field/Path2", oConditionModel.getContext("/conditions/field/Path2"));
			oConditionChangeBinding3.attachChange(handleChange);
			oConditionChangeBinding3._sID = "B3"; // for debugging
			oConditionChangeBinding4 = oConditionModel.bindProperty("/conditions/field/Path2", oConditionModel.getContext("/conditions/field/Path2"));
			oConditionChangeBinding4.attachChange(handleChange);
			oConditionChangeBinding4._sID = "B4"; // for debugging
			oConditionModel.attachPropertyChange(handlePropertyChange);
		},

		afterEach: function() {
			sPath = undefined;
			sReason = undefined;
			iCount = 0;
			oConditionChange = {};
			if (oConditionModel) {
				oConditionModel.destroy();
				oConditionModel = undefined;
			}
		}
	});

	QUnit.test("ConditionModel Change event for new condition", function(assert) {
		var fnDone = assert.async();
		setTimeout(function () {
			oConditionChange = {};
			var aConditions = oConditionChangeBinding1.getExternalValue();
			aConditions.push(Condition.createItemCondition("X", "Y"));
			oConditionChangeBinding1.setExternalValue(aConditions);
			setTimeout(function () {
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].count, 1, "Change event for all conditions fired");
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].reason, "change", "Change event for all conditions reason");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].count, 1, "Change event for fieldPath1 fired once");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].reason, "change", "Change event for fieldPath1 reason");
				assert.notOk(oConditionChange["/conditions/field_Path2"], "Change event for fieldPath2 not fired");
				assert.equal(iCount, 1, "PropertyChange event fired once");
				assert.equal(sPath, "/conditions/fieldPath1", "PropertyChange event path");
				assert.equal(sReason, "binding", "PropertyChange event reason");

				sPath = undefined; sReason = undefined; iCount = 0;
				oConditionChange = {};
				aConditions = oConditionChangeBinding3.getExternalValue();
				aConditions.push(Condition.createItemCondition("X", "Y"));
				oConditionChangeBinding3.setExternalValue(aConditions);
				setTimeout(function () {
					assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].count, 1, "Change event for all conditions fired");
					assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].reason, "change", "Change event for all conditions reason");
					assert.notOk(oConditionChange["/conditions/fieldPath1"], "Change event for fieldPath1 not fired");
					assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].count, 1, "Change event for fieldPath2 fired once");
					assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].reason, "change", "Change event for field/Path2 reason");
					assert.equal(iCount, 1, "PropertyChange event fired once");
					assert.equal(sPath, "/conditions/field/Path2", "PropertyChange event path");
					assert.equal(sReason, "binding", "PropertyChange event reason");
					fnDone();
				}, 0);
			}, 0);
		}, 0);
	});

	QUnit.test("ConditionModel Change event for changed condition", function(assert) {
		var fnDone = assert.async();
		setTimeout(function () {
			oConditionChange = {};
			var aConditions = oConditionChangeBinding1.getExternalValue();
			aConditions[0].values[0] = "A";
			oConditionChangeBinding1.setExternalValue(aConditions);

			setTimeout(function () {
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].count, 1, "Change event for all conditions fired");
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].reason, "change", "Change event for all conditions reason");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].count, 1, "Change event for fieldPath1 fired once");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].reason, "change", "Change event for fieldPath1 reason");
				assert.notOk(oConditionChange["/conditions/field/Path2"], "Change event for field/Path2 not fired");
				assert.equal(iCount, 1, "PropertyChange event fired once");
				assert.equal(sPath, "/conditions/fieldPath1", "PropertyChange event path");
				assert.equal(sReason, "binding", "PropertyChange event reason");

				sPath = undefined; sReason = undefined; iCount = 0;
				oConditionChange = {};
				aConditions = oConditionChangeBinding3.getExternalValue();
				aConditions[0].values[0] = "B";
				oConditionChangeBinding3.setExternalValue(aConditions);

				setTimeout(function () {
					assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].count, 1, "Change event for all conditions fired");
					assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].reason, "change", "Change event for all conditions reason");
					assert.notOk(oConditionChange["/conditions/fieldPath1"], "Change event for fieldPath1 not fired");
					assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].count, 1, "Change event for field/Path2 fired once");
					assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].reason, "change", "Change event for field/Path2 reason");
					assert.equal(iCount, 1, "PropertyChange event fired once");
					assert.equal(sPath, "/conditions/field/Path2", "PropertyChange event path");
					assert.equal(sReason, "binding", "PropertyChange event reason");

					fnDone();
				}, 0);
			}, 0);
		}, 0);
	});

	QUnit.test("ConditionModel Change event Condition.setConditions", function(assert) {
		var fnDone = assert.async();
		setTimeout(function () {
			oConditionChange = {};

			oConditionModel.setConditions({
				"fieldPath1": [Condition.createCondition("BT", ["A", "C"])],
				"field/Path2": [Condition.createCondition("GT", ["X"])]
			});
			setTimeout(function () {
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].count, 1, "Change event for all conditions fired");
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].reason, "change", "Change event for all conditions reason");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].count, 2, "Change event for fieldPath1 fired twice");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].reason, "change", "Change event for fieldPath1 reason");
				assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].count, 2, "Change event for field/Path2 fired twice");
				assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].reason, "change", "Change event for field/Path2 reason");
				assert.equal(iCount, 2, "PropertyChange event fired twice");
				assert.equal(sReason, "add", "PropertyChange event reason");

				var aConditions = oConditionChangeBinding1.getExternalValue();
				assert.equal(aConditions.length, 1, "Condititions length for fieldPath1");
				assert.equal(aConditions[0].operator, "BT", "Conditition operator fieldPath1");

				aConditions = oConditionChangeBinding3.getExternalValue();
				assert.equal(aConditions.length, 1, "Condititions length for field/Path2");
				assert.equal(aConditions[0].operator, "GT", "Conditition operator field/Path2");
				fnDone();
			}, 0);
		}, 0);
	});

	QUnit.test("ConditionModel Change event Condition.insertCondition", function(assert) {
		var fnDone = assert.async();
		setTimeout(function () {
			oConditionChange = {};

			oConditionModel.insertCondition("fieldPath1", 0, Condition.createCondition("BT", ["A", "C"]));
			oConditionModel.insertCondition("field/Path2", 0, Condition.createCondition("GT", ["X"]));

			setTimeout(function () {
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].count, 1, "Change event for all conditions fired");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].count, 2, "Change event for fieldPath1 fired twice");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].reason, "change", "Change event for fieldPath1 reason");
				assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].count, 2, "Change event for field/Path2 fired twice");
				assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].reason, "change", "Change event for field/Path2 reason");
				assert.equal(iCount, 2, "PropertyChange event fired twice");
				assert.equal(sReason, "add", "PropertyChange event reason");

				var aConditions = oConditionChangeBinding1.getExternalValue();
				assert.equal(aConditions.length, 2, "Condititions length for fieldPath1");
				assert.equal(aConditions[0].operator, "BT", "Conditition operator fieldPath1");

				aConditions = oConditionChangeBinding3.getExternalValue();
				assert.equal(aConditions.length, 2, "Condititions length for field/Path2");
				assert.equal(aConditions[0].operator, "GT", "Conditition operator field/Path2");
				fnDone();
			}, 0);
		}, 0);
	});

	QUnit.test("ConditionModel Change event Condition.removeCondition", function(assert) {
		var fnDone = assert.async();
		setTimeout(function () {
			oConditionChange = {};

			oConditionModel.removeCondition("fieldPath1", Condition.createItemCondition("key", "description"));
			oConditionModel.removeCondition("field/Path2", Condition.createItemCondition("key1", "description1"));

			setTimeout(function () {
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].count, 1, "Change event for all conditions fired");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].count, 2, "Change event for fieldPath1 fired twice");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].reason, "change", "Change event for fieldPath1 reason");
				assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].count, 2, "Change event for field/Path2 fired twice");
				assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].reason, "change", "Change event for field/Path2 reason");
				assert.equal(iCount, 2, "PropertyChange event fired twice");
				assert.equal(sReason, "remove", "PropertyChange event reason");

				var aConditions = oConditionChangeBinding1.getExternalValue();
				assert.equal(aConditions.length, 0, "Condititions length for fieldPath1");

				aConditions = oConditionChangeBinding3.getExternalValue();
				assert.equal(aConditions.length, 0, "Condititions length for field/Path2");
				fnDone();
			}, 0);
		}, 0);
	});

	QUnit.test("ConditionModel Change event Condition.removeAllConditions", function(assert) {
		var fnDone = assert.async();
		setTimeout(function () {
			oConditionChange = {};

			oConditionModel.removeAllConditions("fieldPath1");
			oConditionModel.removeAllConditions();

			setTimeout(function () {
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].count, 1, "Change event for all conditions fired");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].count, 2, "Change event for fieldPath1 fired twice");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].reason, "change", "Change event for fieldPath1 reason");
				assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].count, 2, "Change event for field/Path2 fired twice");
				assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].reason, "change", "Change event for field/Path2 reason");
				assert.equal(iCount, 2, "PropertyChange event fired twice");
				assert.equal(sReason, "remove", "PropertyChange event reason");

				var aConditions = oConditionChangeBinding1.getExternalValue();
				assert.equal(aConditions.length, 0, "Condititions length for fieldPath1");

				aConditions = oConditionChangeBinding3.getExternalValue();
				assert.equal(aConditions.length, 0, "Condititions length for field/Path2");
				fnDone();
			}, 0);
		}, 0);
	});

});
