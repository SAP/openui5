/* global QUnit, sinon */

sap.ui.define([
	"sap/base/config",
	"jquery.sap.global", // provides jQuery.sap.Version
	"sap/base/config/GlobalConfigurationProvider",
	"sap/ui/core/Core",
	"sap/ui/core/getCompatibilityVersion"
], function(
	BaseConfig,
	jQuery,
	GlobalConfigurationProvider,
	Core,
	getCompatibilityVersion
) {
	"use strict";

	var types = [
		{
			name : "Param",
			makeArgs : function(aValues) {
				return aValues;
			}
		},
		{
			name : "Instance",
			makeArgs : function(aValues) {
				return [new jQuery.sap.Version(aValues.slice(0,3).join(".") + (aValues[3] || ""))];
			}
		},
		{
			name : "String",
			makeArgs : function(aValues) {
				return [aValues.slice(0,3).join(".") + (aValues[3] || "")];
			}
		},
		{
			name : "Array",
			makeArgs : function(aValues) {
				return [aValues];
			}
		}
	];

	var v1 = new jQuery.sap.Version(3, 5, 7, "b");
	var part = ["Major", "Minor", "Patch", "Suffix"];
	var config = Core.getConfiguration();

	function genericNew(FNConstructor, aArgs) {
		var obj = Object.create(FNConstructor.prototype);
		var ret = FNConstructor.apply(obj, aArgs);
		return ret === undefined ? obj : ret;
	}

	QUnit.module("Core Versions");

	/**
	 * @deprecated
	 */
	QUnit.test("Core Version", function(assert) {
		assert.equal(config.getVersion().toString(), sap.ui.version, "Used UI5 Core version");
	});

	/**
	 * @deprecated
	 */
	QUnit.test("Compatibility Version", function(assert) {
		var oGlobalConfigStub = sinon.stub(GlobalConfigurationProvider, "get");
		var mConfigStubValues;
		oGlobalConfigStub.callsFake(function(sKey) {
				return mConfigStubValues.hasOwnProperty(sKey) ? mConfigStubValues[sKey] : oGlobalConfigStub.wrappedMethod.call(this, sKey);
		});

		function checkCompat(oConf, sText, sExp1, sExp2){
			BaseConfig._.invalidate();
			mConfigStubValues = oConf;
			var dflt = jQuery.sap.Version(sExp1).toString();
			assert.equal(getCompatibilityVersion("").toString(), dflt, sText + ": Default (feature='')");
			assert.equal(getCompatibilityVersion("xx-test2").toString(), dflt, sText + ": Default (undef. feature)");
			assert.equal(getCompatibilityVersion("xx-test").toString(), jQuery.sap.Version(sExp2).toString(), sText + ": Result (avail. feature)");
		}

		var currentVersion = jQuery.sap.Version(config.getVersion().getMajor(), config.getVersion().getMinor()).toString();

		checkCompat({"sapUiCompatVersionXxTest2" : "1.16.0"}, "Feature Default Only (+ Undef. Feature)", "1.14", "1.15");

		checkCompat({"sapUiCompatVersion" : "1.16.0"}, "Global Only", "1.16", "1.16");
		checkCompat({"sapUiCompatVersion" : "edge"}, "Global Only (Edge)", currentVersion, currentVersion);
		checkCompat({"sapUiCompatVersion" : "1.12.1"}, "Global Only (<1.14)", "1.12", "1.12");

		checkCompat({"sapUiCompatVersionXxTest" : "1.16"}, "Feature Only", "1.14", "1.16");
		checkCompat({"sapUiCompatVersionXxTest" : "edge"}, "Feature Only (Edge)", "1.14", currentVersion);
		checkCompat({"sapUiCompatVersionXxTest" : "1.10"}, "Feature Only (<1.14)", "1.14", "1.10");

		checkCompat({"sapUiCompatVersionXxTest" : "1.17", "sapUiCompatVersion" : "1.16"}, "Global + Feature", "1.16", "1.17");
		checkCompat({"sapUiCompatVersionXxTest" : "edge", "sapUiCompatVersion" : "1.16"}, "Global + Feature (Edge)", "1.16", currentVersion);
		checkCompat({"sapUiCompatVersionXxTest" : "1.17", "sapUiCompatVersion" : "edge"}, "Global (Edge) + Feature", currentVersion, "1.17");

		oGlobalConfigStub.reset();
	});


	QUnit.module("jQuery.sap.Version - Create");

	QUnit.test("Create", function(assert) {
		var args, text;
		var values = [[2, 2, 2], [30, 40, 0], [22, 0, 15, "-SNAPSHOT"]];
		var result = [[2, 2, 2, ""], [30, 40, 0, ""], [22, 0, 15, "-SNAPSHOT"]];

		for (var i = 0; i < values.length; i++){
			for (var j = 0; j < types.length; j++){ // param, instance, string, array
				args = types[j].makeArgs(values[i]);
				text = " - " + values[i].join("/") + " - " + types[j].name;

				var obj = genericNew(jQuery.sap.Version, args);
				assert.equal(obj.getMajor(), result[i][0], "Check create" + text + " (Major)");
				assert.equal(obj.getMinor(), result[i][1], "Check create" + text + " (Minor)");
				assert.equal(obj.getPatch(), result[i][2], "Check create" + text + " (Micro)");
				assert.equal(obj.getSuffix(), result[i][3], "Check create" + text + " (Suffix)");
			}
		}
	});

	QUnit.test("Cast", function(assert) {
		assert.ok(jQuery.sap.Version(v1) === v1, "jQuery.sap.Version(v1) === v1");
		var v = jQuery.sap.Version(v1.toString());
		assert.ok(jQuery.sap.Version(v1) != v, "jQuery.sap.Version(v1) != jQuery.sap.Version(v1.toString())");
		assert.equal(v1.toString(), v.toString(), "jQuery.sap.Version(v1).toString() != jQuery.sap.Version(v1.toString()).toString()");
	});


	QUnit.module("jQuery.sap.Version - Getter");

	var fixtures = [
		{
			version: "2.5",
			results: [2, 5, 0, "", "2.5.0"]
		},
		{
			version: "34.0.5.Hello",
			results: [34, 0, 5, ".Hello", "34.0.5.Hello"]
		},
		{
			version: "4",
			results: [4, 0, 0, "", "4.0.0"]
		},
		{
			version: "Hello",
			results: [0, 0, 0, "", "0.0.0"]
		}
	];

	["getMajor", "getMinor", "getPatch", "getSuffix", "toString"].forEach(function(getter, idx) {
		QUnit.test(getter, function(assert) {
			fixtures.forEach(function(testData) {
				var version = new jQuery.sap.Version(testData.version);
				assert.strictEqual(version[getter](), testData.results[idx], getter + "() should return " + testData.results[idx] + " for '" + testData.version + "'");
			});
		});
	});


	QUnit.module("jQuery.sap.Version - Compare");

	QUnit.test("Equals", function(assert) {
		var vOk, vWrong, argsOk, argsWrong, text;

		for (var i = 0; i < part.length; i++){ // major, minor, patch, suffix
			vOk = [v1.getMajor(), v1.getMinor(), v1.getPatch(), v1.getSuffix()];
			vWrong = vOk.slice();
			vWrong[i] = vWrong[i] + (i == 3 ? "a" : 1);

			for (var j = 0; j < types.length; j++){ // param, instance, string
				argsOk = types[j].makeArgs(vOk);
				argsWrong = types[j].makeArgs(vWrong);
				text = " - " + types[j].name + " - " + part[i];
				assert.ok(v1.compareTo.apply(v1, argsOk) === 0, "Check = (ok)" + text + JSON.stringify(argsOk));
				assert.ok(v1.compareTo.apply(v1, argsWrong) != 0, "Check = (not ok)" + text);
			}
		}
	});


	QUnit.test("Smaller", function(assert) {
		var vOk, vWrong, argsOk, argsWrong, text;

		for (var i = 0; i < part.length; i++){ // major, minor, patch, suffix
			vOk = [v1.getMajor(), v1.getMinor(), v1.getPatch(), v1.getSuffix()];
			vWrong = vOk.slice();
			vOk[i] = i == 3 ? "c" : (vOk[i] + 1);
			vWrong[i] = i == 3 ? "a" : (vWrong[i] - 1);

			for (var j = 0; j < types.length; j++){ // param, instance, string
				argsOk = types[j].makeArgs(vOk);
				argsWrong = types[j].makeArgs(vWrong);
				text = " - " + types[j].name + " - " + part[i];
				assert.ok(v1.compareTo.apply(v1, argsOk) < 0, "Check < (ok)" + text);
				assert.ok(v1.compareTo.apply(v1, argsWrong) > 0, "Check < (not ok)" + text);
			}
		}
	});


	QUnit.test("Greater", function(assert) {
		var vOk, vWrong, argsOk, argsWrong, text;

		for (var i = 0; i < part.length; i++){ // major, minor, patch, suffix
			vOk = [v1.getMajor(), v1.getMinor(), v1.getPatch(), v1.getSuffix()];
			vWrong = vOk.slice();
			vOk[i] = i == 3 ? "a" : (vOk[i] - 1);
			vWrong[i] = i == 3 ? "c" : (vWrong[i] + 1);

			for (var j = 0; j < types.length; j++){ // param, instance, string
				argsOk = types[j].makeArgs(vOk);
				argsWrong = types[j].makeArgs(vWrong);
				text = " - " + types[j].name + " - " + part[i];
				assert.ok(v1.compareTo.apply(v1, argsOk) > 0, "Check > (ok)" + text);
				assert.ok(v1.compareTo.apply(v1, argsWrong) < 0, "Check > (not ok)" + text);
			}
		}
	});


	QUnit.test("Range", function(assert) {
		var start = [3, 5],
			end = [4, 2],
			rangeCheck = ["v<min", "v=min", "min<v<max", "v=max", "v>max"],
			checkVersion = [new jQuery.sap.Version(2), new jQuery.sap.Version(3,5), new jQuery.sap.Version(3,9), new jQuery.sap.Version(4,2), new jQuery.sap.Version(5)],
			args, isOk, res;

		for (var i = 0; i < rangeCheck.length; i++){ // position in range
			isOk = i > 0 && i < 3;

			for (var j = 1; j < types.length; j++){ // array, instance, string
				args = [types[j].makeArgs(start)[0], types[j].makeArgs(end)[0]];
				res = checkVersion[i].inRange.apply(checkVersion[i], args);
				assert.ok(res && isOk || !res && !isOk, "Test (" + (isOk ? "" : "Not ") + "Ok): " + types[j].name + " - " + rangeCheck[i]);
			}
		}
	});
});