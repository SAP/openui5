/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/m/Button",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/performance/Measurement"
], function(Log, Button, createAndAppendDiv, Measurement) {
	"use strict";

	createAndAppendDiv("target1");

	Measurement.setActive(true);

	QUnit.module("Performance");

	QUnit.test("Simple Measurement", function(assert) {
		assert.expect(10);
		var done = assert.async();
		Measurement.clear();
		var oMeasurement = Measurement.start("qUnit_Test_1", "This is the first test measure");
		assert.equal(oMeasurement.id, "qUnit_Test_1", "ID in start set");
		assert.equal(oMeasurement.info, "This is the first test measure", "Text in start set");
		assert.ok(oMeasurement.start > 0, "Start time set");
		assert.ok(!isNaN(oMeasurement.start), "Start time is a number");

		Measurement.start("qUnit_Test_2", "This is the second test measure");
		Measurement.start("qUnit_Test_3", "This is the third test measure");
		Measurement.start("qUnit_Test_4", "This is the forth test measure");

		var iStart = oMeasurement.start;
		oMeasurement = undefined;

		var delayedCall = function(){
			oMeasurement = Measurement.end("qUnit_Test_1");
			assert.equal(oMeasurement.id, "qUnit_Test_1", "Measurement found for end");
			assert.equal(oMeasurement.start, iStart, "Start time still th same");
			assert.ok(oMeasurement.end > 0, "end time set");

			oMeasurement = undefined;
			oMeasurement = Measurement.getMeasurement("qUnit_Test_1");
			assert.equal(oMeasurement.id, "qUnit_Test_1", "Measurement found for getMeasurement");
			assert.ok(oMeasurement.time > 0, "time > 0");
			assert.equal(oMeasurement.time, oMeasurement.duration, "time = duration");
			done();
		};
		setTimeout(delayedCall, 100);

	});

	QUnit.test("Measurement with break", function(assert) {
		assert.expect(11);
		var done = assert.async();
		var oMeasurement = Measurement.pause("qUnit_Test_2");
		assert.equal(oMeasurement.id, "qUnit_Test_2", "Measurement found for pause");
		assert.ok(oMeasurement.start > 0, "Start time set");
		assert.ok(oMeasurement.pause > 0, "Pause time set");

		Measurement.pause("qUnit_Test_3");
		var delayedCall = function(){
			oMeasurement = Measurement.resume("qUnit_Test_2");
			assert.equal(oMeasurement.id, "qUnit_Test_2", "Measurement found for resume");
			assert.ok(oMeasurement.resume > 0, "Resume time set");

			Measurement.resume("qUnit_Test_3");
			oMeasurement = undefined;
			var delayedCall2 = function(){
				oMeasurement = Measurement.end("qUnit_Test_2");
				assert.equal(oMeasurement.id, "qUnit_Test_2", "Measurement found for end");
				assert.ok(oMeasurement.end > 0, "end time set");

				oMeasurement = undefined;
				oMeasurement = Measurement.getMeasurement("qUnit_Test_2");
				assert.equal(oMeasurement.id, "qUnit_Test_2", "Measurement found for getMeasurement");
				assert.ok(oMeasurement.time > 0, "time > 0");
				assert.ok(oMeasurement.duration > 0, "duration > 0");
				assert.ok(oMeasurement.time > oMeasurement.duration, "duration < time");
				done();
			};
			setTimeout(delayedCall2, 100);
		};
		setTimeout(delayedCall, 100);
	});

	QUnit.test("Measurement with 2 breaks", function(assert) {
		assert.expect(11);
		var done = assert.async();
		var oMeasurement = Measurement.pause("qUnit_Test_3");
		assert.equal(oMeasurement.id, "qUnit_Test_3", "Measurement found for pause");
		assert.ok(oMeasurement.start > 0, "Start time set");
		assert.ok(oMeasurement.pause > 0, "Pause time set");

		var delayedCall = function(){
			oMeasurement = Measurement.resume("qUnit_Test_3");
			assert.equal(oMeasurement.id, "qUnit_Test_3", "Measurement found for resume");
			assert.ok(oMeasurement.resume > 0, "Resume time set");

			oMeasurement = undefined;
			var delayedCall2 = function(){
				oMeasurement = Measurement.end("qUnit_Test_3");
				assert.equal(oMeasurement.id, "qUnit_Test_3", "Measurement found for end");
				assert.ok(oMeasurement.end > 0, "end time set");

				oMeasurement = undefined;
				oMeasurement = Measurement.getMeasurement("qUnit_Test_3");
				assert.equal(oMeasurement.id, "qUnit_Test_3", "Measurement found for getMeasurement");
				assert.ok(oMeasurement.time > 0, "time > 0");
				assert.ok(oMeasurement.duration > 0, "duration > 0");
				assert.ok(oMeasurement.time > oMeasurement.duration, "duration < time");
				done();
			};
			setTimeout(delayedCall2, 100);
		};
		setTimeout(delayedCall, 100);
	});

	QUnit.test("add measurement", function(assert) {
		assert.expect(12);
		var oMeasurement = Measurement.add("qUnit_Test_5", "This is the fifth test measure", 1335420000000, 1335420060000, 60000, 500);
		assert.equal(oMeasurement.id, "qUnit_Test_5", "ID in add set");
		assert.equal(oMeasurement.info, "This is the fifth test measure", "Text in add set");
		assert.equal(oMeasurement.start, 1335420000000, "Start time set");
		assert.equal(oMeasurement.end, 1335420060000, "End time set");
		assert.equal(oMeasurement.time, 60000, "Time set");
		assert.equal(oMeasurement.duration, 500, "Duration time set");
		oMeasurement = undefined;
		oMeasurement = Measurement.getMeasurement("qUnit_Test_5");
		assert.equal(oMeasurement.id, "qUnit_Test_5", "Measurement found for getMeasurement");
		assert.equal(oMeasurement.info, "This is the fifth test measure", "Text is sored");
		assert.equal(oMeasurement.start, 1335420000000, "Start time stored");
		assert.equal(oMeasurement.end, 1335420060000, "End time stored");
		assert.equal(oMeasurement.time, 60000, "Time stored");
		assert.equal(oMeasurement.duration, 500, "Duration time stored");
	});

	QUnit.test("Get results", function(assert) {
		assert.expect(15);
		Measurement.remove("qUnit_Test_4");
		var aMeasurements = Measurement.getAllMeasurements();
		assert.equal(aMeasurements.length, 4, "Number of measurements");
		assert.equal(aMeasurements[0].id, "qUnit_Test_1", "Measurement 1 found");
		assert.equal(aMeasurements[1].id, "qUnit_Test_2", "Measurement 1 found");
		assert.equal(aMeasurements[2].id, "qUnit_Test_3", "Measurement 1 found");
		assert.equal(aMeasurements[0].info, "This is the first test measure", "Measurement 1 info");
		assert.equal(aMeasurements[1].info, "This is the second test measure", "Measurement 1 info");
		assert.equal(aMeasurements[2].info, "This is the third test measure", "Measurement 1 info");
		assert.ok(aMeasurements[0].end > aMeasurements[0].start, "Measurement 1 End > Start");
		assert.ok(aMeasurements[1].end > aMeasurements[0].start, "Measurement 2 End > Start");
		assert.ok(aMeasurements[2].end > aMeasurements[0].start, "Measurement 3 End > Start");
		assert.equal(aMeasurements[0].time, aMeasurements[0].duration, "Measurement 1 time = duration");
		assert.ok(aMeasurements[0].time < aMeasurements[1].time, "time Measurement 1 < Measurement 2");
		assert.ok(aMeasurements[1].time < aMeasurements[2].time, "time Measurement 2 < Measurement 2");
		assert.ok(aMeasurements[1].duration < aMeasurements[2].duration, "duration Measurement 2 < Measurement 2");

		Measurement.clear();
		aMeasurements = Measurement.getAllMeasurements();
		assert.equal(aMeasurements.length, 0, "Number of measurements after clear");
	});

	QUnit.module("test measure rendering");

	QUnit.test("render Button", function(assert) {
		var done = assert.async();
		assert.expect(4);
		var oButton = new Button("B1",{text:"Test"});
		oButton.placeAt("target1");
		oButton.onAfterRendering = function() {
			Button.prototype.onAfterRendering.apply(this, arguments);
			var aMeasurements = Measurement.getAllMeasurements();
			assert.ok(aMeasurements.length > 0, "Number of measurements > 0");

			var oMeasurement = Measurement.getMeasurement("B1---AfterRendering");
			assert.ok(oMeasurement, "Measurement for Button AfterRendering found");
			oMeasurement = Measurement.getMeasurement("renderPendingUIUpdates");
			assert.ok(oMeasurement, "Measurement for rendering all UIAreas found");
			oMeasurement = Measurement.getMeasurement("target1---rerender");
			assert.ok(oMeasurement, "Measurement for rendering UIArea found");

			oButton.destroy();
			done();
		};

		/*
		 * @evo-todo temp. disable test as JS resources are no longer loaded with jQuery.ajax
		 * In general, loading JS Resources no longer might be done with an XHR (e.g. <script> tag), how to write a generic test?

		oMeasurement = Measurement.getMeasurement(URI("../../../../../resources/sap/m/Button.js").absoluteTo(document.location.origin + document.location.pathname).href());
		if (!oMeasurement){
			// check if debug sources are used
			oMeasurement = Measurement.getMeasurement(URI("../../../../../resources/sap/m/Button-dbg.js").absoluteTo(document.location.origin + document.location.pathname).href());
		}
		assert.ok(oMeasurement, "Measurement for request for Button.js found");
		oMeasurement = Measurement.getMeasurement(URI("../../../../../resources/sap/m/ButtonRenderer.js").absoluteTo(document.location.origin + document.location.pathname).href());
		if (!oMeasurement){
			// check if debug sources are used
			oMeasurement = Measurement.getMeasurement(URI("../../../../../resources/sap/m/ButtonRenderer-dbg.js").absoluteTo(document.location.origin + document.location.pathname).href());
		}
		assert.ok(oMeasurement, "Measurement for request for ButtonRenderer.js found");
		*/

	});

	QUnit.test("Average", function(assert) {
		Measurement.setActive(true);
		Measurement.clear();
		for (var i = 0; i < 1000; i++) {
			Measurement.average("myId","Average of myId");
			Measurement.average("myId2","Average of myId");
			Log.info("Foo " + i);
			Measurement.end("myId");
		}
		Measurement.end("myId2");
		assert.ok(Measurement.getMeasurement("myId").count === 1000, "1000 count processed for myId");
		assert.ok(Measurement.getMeasurement("myId2").count === 1000, "1000 count processed for myId2");
	});

	QUnit.test("registerMethod", function(assert) {
		Measurement.setActive(true);
		Measurement.clear();
		var f = function() {
			for (var i = 0; i < 100; i++) {
				var j = i;
			}
			return j;
		};
		var oObject = {func: f, func2: f};

		//register functions
		Measurement.registerMethod("oObject.func", oObject, "func");
		for (var i = 0; i < 1000; i++) {
			oObject.func(); //execute
		}
		//check
		assert.ok(Measurement.getMeasurement("oObject.func").count === 1000, "1000 count processed for oObject.func");
		assert.ok(oObject.func !== f , "function is overwritten");

		//unregister func
		Measurement.unregisterMethod("oObject.func", oObject, "func");
		assert.ok(oObject.func === f , "function is reset");

		//register 2 functions
		Measurement.registerMethod("oObject.func", oObject, "func");
		Measurement.registerMethod("oObject.func2", oObject, "func2");

		//check
		assert.ok(oObject.func !== f , "function is overwritten");
		assert.ok(oObject.func2 !== f , "function2 is overwritten");

		//unregister 2 functions
		Measurement.unregisterAllMethods();
		assert.ok(oObject.func === f , "function is reset");
		assert.ok(oObject.func2 === f , "function2 is reset");
	});

	QUnit.test("registerMethod - correct function context", function(assert) {
		Measurement.setActive(true);
		Measurement.clear();
		var f = function() {
			// Check for equality by reference ("==")
			assert.equal(this, oObject, "Registered function is called with correct 'this' value");
		};
		var oObject = {func: f};

		//register functions
		Measurement.registerMethod("oObject.func", oObject, "func");
		oObject.func(); //execute

		// unregister function
		Measurement.unregisterAllMethods();
	});

	QUnit.test("Categories/Filtering/Completed measuremtents", function(assert) {
		Measurement.setActive(true,"test1");
		Measurement.clear();
		Measurement.start("test1string_1", "", "test1");
		Measurement.start("test1string_2", "", "test1,test2");
		Measurement.start("test1string_3", "", ["test1"]);
		Measurement.start("test1string_4", "", ["test1","test2"]);
		Measurement.start("test1string_5", "", "test2");
		Measurement.start("test1string_6", "", "test2,test3");
		Measurement.start("test1string_7", "", ["test2"]);
		Measurement.start("test1string_8", "", ["test2","test3"]);

		assert.equal(Measurement.getAllMeasurements().length, 4, "4 measurement");
		assert.equal(Measurement.getAllMeasurements(true).length, 0, "0 completed measurements");
		assert.equal(Measurement.getAllMeasurements(false).length, 4, "4 incompleted measurements");
		assert.equal(Measurement.filterMeasurements(function(o){return o.categories.indexOf("test1") > -1 ? o : null; }).length, 4, "4 test1 measurement filtered");
		assert.equal(Measurement.filterMeasurements(["test1"]).length,4, "4 test1 measurement retrieved");
		assert.equal(Measurement.filterMeasurements(function(o){return o.categories.indexOf("test2") > -1 ? o : null; }).length, 2, "2 test2 measurement filtered");
		assert.equal(Measurement.filterMeasurements(["test2"]).length,2, "2 test2 measurement retrieved");
		assert.equal(Measurement.filterMeasurements(function(o){return o.categories.indexOf("test3") > -1 ? o : null; }).length, 0, "0 test3 measurement filtered");
		assert.equal(Measurement.filterMeasurements(["test3"]).length,0, "0 test3 measurement retrieved");
		assert.equal(Measurement.filterMeasurements(function(o){return o.categories.indexOf("test4") > -1 ? o : null; }).length, 0, "0 test4 measurement filtered");
		assert.equal(Measurement.filterMeasurements(["test4"]).length,0, "0 test4 measurement retrieved");
		assert.equal(Measurement.filterMeasurements(function(o){return o.categories.indexOf("test1") > -1 ? o : null; }, true).length,0, "0 complete test1 measurement filtered");
		assert.equal(Measurement.filterMeasurements(true, ["test1"]).length,0, "0 complete test1 measurement retrieved");
		assert.equal(Measurement.filterMeasurements(function(o){return o.categories.indexOf("test2") > -1 ? o : null; }, true).length,0, "0 complete test1, test2 measurement filtered");
		assert.equal(Measurement.filterMeasurements(true, ["test2"]).length,0, "0 complete test2 measurement retrieved");
		assert.equal(Measurement.filterMeasurements(function(o){return o.categories.indexOf("test3") > -1 ? o : null; }, true).length,0, "0 complete test3 measurement filtered");
		assert.equal(Measurement.filterMeasurements(true, ["test3"]).length,0, "0 complete test3 measurement retrieved");
		assert.equal(Measurement.filterMeasurements(function(o){return o.categories.indexOf("test4") > -1 ? o : null; }, true).length,0, "0 complete test4 measurement filtered");
		assert.equal(Measurement.filterMeasurements(true, ["test4"]).length,0, "0 complete test4 measurement retrieved");

		Measurement.end("test1string_1");
		Measurement.end("test1string_2");
		Measurement.end("test1string_3");
		Measurement.end("test1string_4");
		Measurement.end("test1string_5");
		Measurement.end("test1string_6");
		Measurement.end("test1string_7");
		Measurement.end("test1string_8");

		assert.equal(Measurement.getAllMeasurements().length, 4, "4 measurement");
		assert.equal(Measurement.getAllMeasurements(true).length, 4, "4 completed measurements");
		assert.equal(Measurement.filterMeasurements(function(o){return o.categories.indexOf("test1") > -1 ? o : null; }).length, 4, "4 test1 measurement filtered");
		assert.equal(Measurement.filterMeasurements(["test1"]).length,4, "4 test1 measurement retrieved");
		assert.equal(Measurement.filterMeasurements(function(o){return o.categories.indexOf("test2") > -1 ? o : null; }).length, 2, "2 test2 measurement filtered");
		assert.equal(Measurement.filterMeasurements(["test2"]).length,2, "2 test2 measurement retrieved");
		assert.equal(Measurement.filterMeasurements(function(o){return o.categories.indexOf("test3") > -1 ? o : null; }).length, 0, "0 test3 measurement filtered");
		assert.equal(Measurement.filterMeasurements(["test3"]).length,0, "0 test3 measurement retrieved");
		assert.equal(Measurement.filterMeasurements(function(o){return o.categories.indexOf("test4") > -1 ? o : null; }).length, 0, "0 test4 measurement filtered");
		assert.equal(Measurement.filterMeasurements(["test4"]).length,0, "0 test4 measurement retrieved");
		assert.equal(Measurement.filterMeasurements(function(o){return o.categories.indexOf("test1") > -1 ? o : null; }, true).length,4, "4 test1 completed measurement filtered");
		assert.equal(Measurement.filterMeasurements(true, ["test1"]).length,4, "4 complete test1 measurement retrieved");
		assert.equal(Measurement.filterMeasurements(function(o){return o.categories.indexOf("test2") > -1 ? o : null; }, true).length, 2, "2 test1, test2 completed measurement filtered");
		assert.equal(Measurement.filterMeasurements(true, ["test2"]).length,2, "2 complete test2 measurement retrieved");
		assert.equal(Measurement.filterMeasurements(function(o){return o.categories.indexOf("test3") > -1 ? o : null; }, true).length, 0, "0 test3 completed measurement filtered");
		assert.equal(Measurement.filterMeasurements(true, ["test3"]).length,0, "0 complete test3 measurement retrieved");
		assert.equal(Measurement.filterMeasurements(function(o){return o.categories.indexOf("test4") > -1 ? o : null; }, true).length, 0, "0 test4 completed measurement filtered");
		assert.equal(Measurement.filterMeasurements(true, ["test4"]).length,0, "0 complete test4 measurement retrieved");

		Measurement.setActive(true,"test1,test2");
		Measurement.clear();
		Measurement.start("test1string_1", "", "test1");
		Measurement.start("test1string_2", "", "test1,test2");
		Measurement.start("test1string_3", "", ["test1"]);
		Measurement.start("test1string_4", "", ["test1","test2"]);
		Measurement.start("test1string_5", "", "test2");
		Measurement.start("test1string_6", "", "test2,test3");
		Measurement.start("test1string_7", "", ["test2"]);
		Measurement.start("test1string_8", "", ["test2","test3"]);
		Measurement.start("test1string_9", "", ["test1"]);
		Measurement.end("test1string_1");
		Measurement.end("test1string_2");
		Measurement.end("test1string_3");
		Measurement.end("test1string_4");
		Measurement.end("test1string_5");
		Measurement.end("test1string_6");
		Measurement.end("test1string_7");
		Measurement.end("test1string_8");

		assert.equal(Measurement.getAllMeasurements().length,9, "9 started measurement");
		assert.equal(Measurement.getAllMeasurements(true).length,8, "8 completed measurement");
		assert.equal(Measurement.getAllMeasurements(false).length,1, "1 incompleted measurement");

		assert.equal(Measurement.filterMeasurements(function(o){return o.categories.indexOf("test1") > -1 ? o : null; }, true).length, 4, "4 completed test1 measurement filtered");
		assert.equal(Measurement.filterMeasurements(true, ["test1"]).length,4, "4 completed test1 measurement retrieved");
		assert.equal(Measurement.filterMeasurements(function(o){return o.categories.indexOf("test2") > -1 ? o : null; }, true).length, 6, "6 completed test2 measurement filtered");
		assert.equal(Measurement.filterMeasurements(true, ["test2"]).length,6, "6 completed test2 measurement retrieved");
		assert.equal(Measurement.filterMeasurements(function(o){return o.categories.indexOf("test3") > -1 ? o : null; }, true).length, 2, "2 completed test3 measurement filtered");
		assert.equal(Measurement.filterMeasurements(true, ["test3"]).length,2, "2 completed test3 measurement retrieved");
		assert.equal(Measurement.filterMeasurements(function(o){return o.categories.indexOf("test4") > -1 ? o : null; }, true).length, 0, "0 completed test4 measurement filtered");
		assert.equal(Measurement.filterMeasurements(true, ["test4"]).length,0, "0 completed test4 measurement retrieved");

		assert.equal(Measurement.filterMeasurements(function(o){return o.categories.indexOf("test1") > -1 ? o : null; }).length,5, "5 test1 measurement filtered");
		assert.equal(Measurement.filterMeasurements(["test1"]).length,5, "5 test1 measurement retrieved");

		Measurement.setActive(true); // Delete existing categories by activating measurements without specifing category
	});
});
