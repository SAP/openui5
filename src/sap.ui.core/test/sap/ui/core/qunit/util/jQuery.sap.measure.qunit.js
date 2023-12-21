/* global QUnit, sinon */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/Device",
	"sap/ui/core/UIComponent",
	"sap/m/Button",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/performance/trace/Interaction"
], function(jQuery, Device, UIComponent, Button, createAndAppendDiv, Interaction) {
	"use strict";

	// performance is hijacked by sinon's fakeTimers (https://github.com/sinonjs/fake-timers/issues/374)
	// and might be out of sync with the latest specs and APIs. Therefore, mock them further,
	// so they won't affect tests.
	//
	// *Note:* Call this method after sinon.useFakeTimers(); as for example performance.timeOrigin is read only
	// in its nature and cannot be modified otherwise.
	function mockPerformanceObject () {
		const timeOrigin = performance.timeOrigin;
		const clock = sinon.useFakeTimers();
		performance.getEntriesByType = function() {
			return [];
		};
		performance.timeOrigin = timeOrigin;
		return clock;
	}

	function cleanPerformanceObject() {
		delete performance.getEntriesByType;
		delete performance.timeOrigin;
	}

	createAndAppendDiv("target1");

	// In order to offer protection against timing attacks and fingerprinting, the precision of performance.now() might get rounded depending on browser settings.
	// In Firefox, the privacy.reduceTimerPrecision preference is enabled by default and defaults to 1ms. (see https://developer.mozilla.org/en-US/docs/Web/API/Performance/now#reduced_time_precision)
	// Therefore it's necessary to add some fake processing time to avoid filtering of zero duration records
	var addFakeProcessingTime = function () {
		// trigger notifyAsyncStep manually in order to avoid removal of interactions without processing time
		var notifyAsyncStepCallback;

		notifyAsyncStepCallback = Interaction.notifyAsyncStep();
		this.clock.tick(2);
		notifyAsyncStepCallback();
	};

	// This function has the same intention as the function addFakeProcessingTime but it's used in case fakeTimers are not suitable for the test
	var waitASecond = function () {
		var iFirstTime, iSecondTime;
		iFirstTime = iSecondTime = performance.now();
		while (iFirstTime >= iSecondTime) {
			iSecondTime = performance.now();
		}
	};

	jQuery.sap.measure.setActive(true);

	QUnit.module("Performance");

	QUnit.test("Simple Measurement", function(assert) {
		assert.expect(10);
		var done = assert.async();
		jQuery.sap.measure.clear();
		var oMeasurement = jQuery.sap.measure.start("qUnit_Test_1", "This is the first test measure");
		assert.equal(oMeasurement.id, "qUnit_Test_1", "ID in start set");
		assert.equal(oMeasurement.info, "This is the first test measure", "Text in start set");
		assert.ok(oMeasurement.start > 0, "Start time set");
		assert.ok(!isNaN(oMeasurement.start), "Start time is a number");

		jQuery.sap.measure.start("qUnit_Test_2", "This is the second test measure");
		jQuery.sap.measure.start("qUnit_Test_3", "This is the third test measure");
		jQuery.sap.measure.start("qUnit_Test_4", "This is the forth test measure");

		var iStart = oMeasurement.start;
		oMeasurement = undefined;

		var delayedCall = function(){
			oMeasurement = jQuery.sap.measure.end("qUnit_Test_1");
			assert.equal(oMeasurement.id, "qUnit_Test_1", "Measurement found for end");
			assert.equal(oMeasurement.start, iStart, "Start time still th same");
			assert.ok(oMeasurement.end > 0, "end time set");

			oMeasurement = undefined;
			oMeasurement = jQuery.sap.measure.getMeasurement("qUnit_Test_1");
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
		var oMeasurement = jQuery.sap.measure.pause("qUnit_Test_2");
		assert.equal(oMeasurement.id, "qUnit_Test_2", "Measurement found for pause");
		assert.ok(oMeasurement.start > 0, "Start time set");
		assert.ok(oMeasurement.pause > 0, "Pause time set");

		jQuery.sap.measure.pause("qUnit_Test_3");
		var delayedCall = function(){
			oMeasurement = jQuery.sap.measure.resume("qUnit_Test_2");
			assert.equal(oMeasurement.id, "qUnit_Test_2", "Measurement found for resume");
			assert.ok(oMeasurement.resume > 0, "Resume time set");

			jQuery.sap.measure.resume("qUnit_Test_3");
			oMeasurement = undefined;
			var delayedCall2 = function(){
				oMeasurement = jQuery.sap.measure.end("qUnit_Test_2");
				assert.equal(oMeasurement.id, "qUnit_Test_2", "Measurement found for end");
				assert.ok(oMeasurement.end > 0, "end time set");

				oMeasurement = undefined;
				oMeasurement = jQuery.sap.measure.getMeasurement("qUnit_Test_2");
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
		var oMeasurement = jQuery.sap.measure.pause("qUnit_Test_3");
		assert.equal(oMeasurement.id, "qUnit_Test_3", "Measurement found for pause");
		assert.ok(oMeasurement.start > 0, "Start time set");
		assert.ok(oMeasurement.pause > 0, "Pause time set");

		var delayedCall = function(){
			oMeasurement = jQuery.sap.measure.resume("qUnit_Test_3");
			assert.equal(oMeasurement.id, "qUnit_Test_3", "Measurement found for resume");
			assert.ok(oMeasurement.resume > 0, "Resume time set");

			oMeasurement = undefined;
			var delayedCall2 = function(){
				oMeasurement = jQuery.sap.measure.end("qUnit_Test_3");
				assert.equal(oMeasurement.id, "qUnit_Test_3", "Measurement found for end");
				assert.ok(oMeasurement.end > 0, "end time set");

				oMeasurement = undefined;
				oMeasurement = jQuery.sap.measure.getMeasurement("qUnit_Test_3");
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
		var oMeasurement = jQuery.sap.measure.add("qUnit_Test_5", "This is the fifth test measure", 1335420000000, 1335420060000, 60000, 500);
		assert.equal(oMeasurement.id, "qUnit_Test_5", "ID in add set");
		assert.equal(oMeasurement.info, "This is the fifth test measure", "Text in add set");
		assert.equal(oMeasurement.start, 1335420000000, "Start time set");
		assert.equal(oMeasurement.end, 1335420060000, "End time set");
		assert.equal(oMeasurement.time, 60000, "Time set");
		assert.equal(oMeasurement.duration, 500, "Duration time set");
		oMeasurement = undefined;
		oMeasurement = jQuery.sap.measure.getMeasurement("qUnit_Test_5");
		assert.equal(oMeasurement.id, "qUnit_Test_5", "Measurement found for getMeasurement");
		assert.equal(oMeasurement.info, "This is the fifth test measure", "Text is sored");
		assert.equal(oMeasurement.start, 1335420000000, "Start time stored");
		assert.equal(oMeasurement.end, 1335420060000, "End time stored");
		assert.equal(oMeasurement.time, 60000, "Time stored");
		assert.equal(oMeasurement.duration, 500, "Duration time stored");
	});

	QUnit.test("Get results", function(assert) {
		assert.expect(15);
		jQuery.sap.measure.remove("qUnit_Test_4");
		var aMeasurements = jQuery.sap.measure.getAllMeasurements();
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

		jQuery.sap.measure.clear();
		aMeasurements = jQuery.sap.measure.getAllMeasurements();
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
			var aMeasurements = jQuery.sap.measure.getAllMeasurements();
			assert.ok(aMeasurements.length > 0, "Number of measurements > 0");

			var oMeasurement = jQuery.sap.measure.getMeasurement("B1---AfterRendering");
			assert.ok(oMeasurement, "Measurement for Button AfterRendering found");
			oMeasurement = jQuery.sap.measure.getMeasurement("renderPendingUIUpdates");
			assert.ok(oMeasurement, "Measurement for rendering all UIAreas found");
			oMeasurement = jQuery.sap.measure.getMeasurement("target1---rerender");
			assert.ok(oMeasurement, "Measurement for rendering UIArea found");

			oButton.destroy();
			done();
		};

		/*
		 * @evo-todo temp. disable test as JS resources are no longer loaded with jQuery.ajax
		 * In general, loading JS Resources no longer might be done with an XHR (e.g. <script> tag), how to write a generic test?

		oMeasurement = jQuery.sap.measure.getMeasurement(URI("../../../../../resources/sap/m/Button.js").absoluteTo(document.location.origin + document.location.pathname).href());
		if (!oMeasurement){
			// check if debug sources are used
			oMeasurement = jQuery.sap.measure.getMeasurement(URI("../../../../../resources/sap/m/Button-dbg.js").absoluteTo(document.location.origin + document.location.pathname).href());
		}
		assert.ok(oMeasurement, "Measurement for request for Button.js found");
		oMeasurement = jQuery.sap.measure.getMeasurement(URI("../../../../../resources/sap/m/ButtonRenderer.js").absoluteTo(document.location.origin + document.location.pathname).href());
		if (!oMeasurement){
			// check if debug sources are used
			oMeasurement = jQuery.sap.measure.getMeasurement(URI("../../../../../resources/sap/m/ButtonRenderer-dbg.js").absoluteTo(document.location.origin + document.location.pathname).href());
		}
		assert.ok(oMeasurement, "Measurement for request for ButtonRenderer.js found");
		*/

	});

	QUnit.test("Average", function(assert) {
		jQuery.sap.measure.setActive(true);
		jQuery.sap.measure.clear();
		for (var i = 0; i < 1000; i++) {
			jQuery.sap.measure.average("myId","Average of myId");
			jQuery.sap.measure.average("myId2","Average of myId");
			jQuery.sap.log.info("Foo " + i);
			jQuery.sap.measure.end("myId");
		}
		jQuery.sap.measure.end("myId2");
		assert.ok(jQuery.sap.measure.getMeasurement("myId").count === 1000, "1000 count processed for myId");
		assert.ok(jQuery.sap.measure.getMeasurement("myId2").count === 1000, "1000 count processed for myId2");
	});

	QUnit.test("registerMethod", function(assert) {
		jQuery.sap.measure.setActive(true);
		jQuery.sap.measure.clear();
		var f = function() {
			for (var i = 0; i < 100; i++) {
				var j = i;
			}
			return j;
		};
		var oObject = {func: f, func2: f};

		//register functions
		jQuery.sap.measure.registerMethod("oObject.func", oObject, "func");
		for (var i = 0; i < 1000; i++) {
			oObject.func(); //execute
		}
		//check
		assert.ok(jQuery.sap.measure.getMeasurement("oObject.func").count === 1000, "1000 count processed for oObject.func");
		assert.ok(oObject.func !== f , "function is overwritten");

		//unregister func
		jQuery.sap.measure.unregisterMethod("oObject.func", oObject, "func");
		assert.ok(oObject.func === f , "function is reset");

		//register 2 functions
		jQuery.sap.measure.registerMethod("oObject.func", oObject, "func");
		jQuery.sap.measure.registerMethod("oObject.func2", oObject, "func2");

		//check
		assert.ok(oObject.func !== f , "function is overwritten");
		assert.ok(oObject.func2 !== f , "function2 is overwritten");

		//unregister 2 functions
		jQuery.sap.measure.unregisterAllMethods();
		assert.ok(oObject.func === f , "function is reset");
		assert.ok(oObject.func2 === f , "function2 is reset");
	});

	QUnit.test("registerMethod - correct function context", function(assert) {
		jQuery.sap.measure.setActive(true);
		jQuery.sap.measure.clear();
		var f = function() {
			// Check for equality by reference ("==")
			assert.equal(this, oObject, "Registered function is called with correct 'this' value");
		};
		var oObject = {func: f};

		//register functions
		jQuery.sap.measure.registerMethod("oObject.func", oObject, "func");
		oObject.func(); //execute

		// unregister function
		jQuery.sap.measure.unregisterAllMethods();
	});

	QUnit.test("Categories/Filtering/Completed measuremtents", function(assert) {
		jQuery.sap.measure.setActive(true,"test1");
		jQuery.sap.measure.clear();
		jQuery.sap.measure.start("test1string_1", "", "test1");
		jQuery.sap.measure.start("test1string_2", "", "test1,test2");
		jQuery.sap.measure.start("test1string_3", "", ["test1"]);
		jQuery.sap.measure.start("test1string_4", "", ["test1","test2"]);
		jQuery.sap.measure.start("test1string_5", "", "test2");
		jQuery.sap.measure.start("test1string_6", "", "test2,test3");
		jQuery.sap.measure.start("test1string_7", "", ["test2"]);
		jQuery.sap.measure.start("test1string_8", "", ["test2","test3"]);

		assert.equal(jQuery.sap.measure.getAllMeasurements().length, 4, "4 measurement");
		assert.equal(jQuery.sap.measure.getAllMeasurements(true).length, 0, "0 completed measurements");
		assert.equal(jQuery.sap.measure.getAllMeasurements(false).length, 4, "4 incompleted measurements");
		assert.equal(jQuery.sap.measure.filterMeasurements(function(o){return o.categories.indexOf("test1") > -1 ? o : null; }).length, 4, "4 test1 measurement filtered");
		assert.equal(jQuery.sap.measure.filterMeasurements(["test1"]).length,4, "4 test1 measurement retrieved");
		assert.equal(jQuery.sap.measure.filterMeasurements(function(o){return o.categories.indexOf("test2") > -1 ? o : null; }).length, 2, "2 test2 measurement filtered");
		assert.equal(jQuery.sap.measure.filterMeasurements(["test2"]).length,2, "2 test2 measurement retrieved");
		assert.equal(jQuery.sap.measure.filterMeasurements(function(o){return o.categories.indexOf("test3") > -1 ? o : null; }).length, 0, "0 test3 measurement filtered");
		assert.equal(jQuery.sap.measure.filterMeasurements(["test3"]).length,0, "0 test3 measurement retrieved");
		assert.equal(jQuery.sap.measure.filterMeasurements(function(o){return o.categories.indexOf("test4") > -1 ? o : null; }).length, 0, "0 test4 measurement filtered");
		assert.equal(jQuery.sap.measure.filterMeasurements(["test4"]).length,0, "0 test4 measurement retrieved");
		assert.equal(jQuery.sap.measure.filterMeasurements(function(o){return o.categories.indexOf("test1") > -1 ? o : null; }, true).length,0, "0 complete test1 measurement filtered");
		assert.equal(jQuery.sap.measure.filterMeasurements(true, ["test1"]).length,0, "0 complete test1 measurement retrieved");
		assert.equal(jQuery.sap.measure.filterMeasurements(function(o){return o.categories.indexOf("test2") > -1 ? o : null; }, true).length,0, "0 complete test1, test2 measurement filtered");
		assert.equal(jQuery.sap.measure.filterMeasurements(true, ["test2"]).length,0, "0 complete test2 measurement retrieved");
		assert.equal(jQuery.sap.measure.filterMeasurements(function(o){return o.categories.indexOf("test3") > -1 ? o : null; }, true).length,0, "0 complete test3 measurement filtered");
		assert.equal(jQuery.sap.measure.filterMeasurements(true, ["test3"]).length,0, "0 complete test3 measurement retrieved");
		assert.equal(jQuery.sap.measure.filterMeasurements(function(o){return o.categories.indexOf("test4") > -1 ? o : null; }, true).length,0, "0 complete test4 measurement filtered");
		assert.equal(jQuery.sap.measure.filterMeasurements(true, ["test4"]).length,0, "0 complete test4 measurement retrieved");

		jQuery.sap.measure.end("test1string_1");
		jQuery.sap.measure.end("test1string_2");
		jQuery.sap.measure.end("test1string_3");
		jQuery.sap.measure.end("test1string_4");
		jQuery.sap.measure.end("test1string_5");
		jQuery.sap.measure.end("test1string_6");
		jQuery.sap.measure.end("test1string_7");
		jQuery.sap.measure.end("test1string_8");

		assert.equal(jQuery.sap.measure.getAllMeasurements().length, 4, "4 measurement");
		assert.equal(jQuery.sap.measure.getAllMeasurements(true).length, 4, "4 completed measurements");
		assert.equal(jQuery.sap.measure.filterMeasurements(function(o){return o.categories.indexOf("test1") > -1 ? o : null; }).length, 4, "4 test1 measurement filtered");
		assert.equal(jQuery.sap.measure.filterMeasurements(["test1"]).length,4, "4 test1 measurement retrieved");
		assert.equal(jQuery.sap.measure.filterMeasurements(function(o){return o.categories.indexOf("test2") > -1 ? o : null; }).length, 2, "2 test2 measurement filtered");
		assert.equal(jQuery.sap.measure.filterMeasurements(["test2"]).length,2, "2 test2 measurement retrieved");
		assert.equal(jQuery.sap.measure.filterMeasurements(function(o){return o.categories.indexOf("test3") > -1 ? o : null; }).length, 0, "0 test3 measurement filtered");
		assert.equal(jQuery.sap.measure.filterMeasurements(["test3"]).length,0, "0 test3 measurement retrieved");
		assert.equal(jQuery.sap.measure.filterMeasurements(function(o){return o.categories.indexOf("test4") > -1 ? o : null; }).length, 0, "0 test4 measurement filtered");
		assert.equal(jQuery.sap.measure.filterMeasurements(["test4"]).length,0, "0 test4 measurement retrieved");
		assert.equal(jQuery.sap.measure.filterMeasurements(function(o){return o.categories.indexOf("test1") > -1 ? o : null; }, true).length,4, "4 test1 completed measurement filtered");
		assert.equal(jQuery.sap.measure.filterMeasurements(true, ["test1"]).length,4, "4 complete test1 measurement retrieved");
		assert.equal(jQuery.sap.measure.filterMeasurements(function(o){return o.categories.indexOf("test2") > -1 ? o : null; }, true).length, 2, "2 test1, test2 completed measurement filtered");
		assert.equal(jQuery.sap.measure.filterMeasurements(true, ["test2"]).length,2, "2 complete test2 measurement retrieved");
		assert.equal(jQuery.sap.measure.filterMeasurements(function(o){return o.categories.indexOf("test3") > -1 ? o : null; }, true).length, 0, "0 test3 completed measurement filtered");
		assert.equal(jQuery.sap.measure.filterMeasurements(true, ["test3"]).length,0, "0 complete test3 measurement retrieved");
		assert.equal(jQuery.sap.measure.filterMeasurements(function(o){return o.categories.indexOf("test4") > -1 ? o : null; }, true).length, 0, "0 test4 completed measurement filtered");
		assert.equal(jQuery.sap.measure.filterMeasurements(true, ["test4"]).length,0, "0 complete test4 measurement retrieved");

		jQuery.sap.measure.setActive(true,"test1,test2");
		jQuery.sap.measure.clear();
		jQuery.sap.measure.start("test1string_1", "", "test1");
		jQuery.sap.measure.start("test1string_2", "", "test1,test2");
		jQuery.sap.measure.start("test1string_3", "", ["test1"]);
		jQuery.sap.measure.start("test1string_4", "", ["test1","test2"]);
		jQuery.sap.measure.start("test1string_5", "", "test2");
		jQuery.sap.measure.start("test1string_6", "", "test2,test3");
		jQuery.sap.measure.start("test1string_7", "", ["test2"]);
		jQuery.sap.measure.start("test1string_8", "", ["test2","test3"]);
		jQuery.sap.measure.start("test1string_9", "", ["test1"]);
		jQuery.sap.measure.end("test1string_1");
		jQuery.sap.measure.end("test1string_2");
		jQuery.sap.measure.end("test1string_3");
		jQuery.sap.measure.end("test1string_4");
		jQuery.sap.measure.end("test1string_5");
		jQuery.sap.measure.end("test1string_6");
		jQuery.sap.measure.end("test1string_7");
		jQuery.sap.measure.end("test1string_8");

		assert.equal(jQuery.sap.measure.getAllMeasurements().length,9, "9 started measurement");
		assert.equal(jQuery.sap.measure.getAllMeasurements(true).length,8, "8 completed measurement");
		assert.equal(jQuery.sap.measure.getAllMeasurements(false).length,1, "1 incompleted measurement");

		assert.equal(jQuery.sap.measure.filterMeasurements(function(o){return o.categories.indexOf("test1") > -1 ? o : null; }, true).length, 4, "4 completed test1 measurement filtered");
		assert.equal(jQuery.sap.measure.filterMeasurements(true, ["test1"]).length,4, "4 completed test1 measurement retrieved");
		assert.equal(jQuery.sap.measure.filterMeasurements(function(o){return o.categories.indexOf("test2") > -1 ? o : null; }, true).length, 6, "6 completed test2 measurement filtered");
		assert.equal(jQuery.sap.measure.filterMeasurements(true, ["test2"]).length,6, "6 completed test2 measurement retrieved");
		assert.equal(jQuery.sap.measure.filterMeasurements(function(o){return o.categories.indexOf("test3") > -1 ? o : null; }, true).length, 2, "2 completed test3 measurement filtered");
		assert.equal(jQuery.sap.measure.filterMeasurements(true, ["test3"]).length,2, "2 completed test3 measurement retrieved");
		assert.equal(jQuery.sap.measure.filterMeasurements(function(o){return o.categories.indexOf("test4") > -1 ? o : null; }, true).length, 0, "0 completed test4 measurement filtered");
		assert.equal(jQuery.sap.measure.filterMeasurements(true, ["test4"]).length,0, "0 completed test4 measurement retrieved");

		assert.equal(jQuery.sap.measure.filterMeasurements(function(o){return o.categories.indexOf("test1") > -1 ? o : null; }).length,5, "5 test1 measurement filtered");
		assert.equal(jQuery.sap.measure.filterMeasurements(["test1"]).length,5, "5 test1 measurement retrieved");

		jQuery.sap.measure.setActive(true); // Delete existing categories by activating measurements without specifing category
	});

	QUnit.module("Interaction", {
		beforeEach: function() {
			this.oButton = new Button();
			Interaction.setActive(true);
			jQuery.sap.measure.endInteraction(true);
			jQuery.sap.measure.clearInteractionMeasurements();
			jQuery.sap.measure.clear();
		},
		afterEach: function() {
			this.oButton.destroy();
			jQuery.sap.measure.endInteraction(true);
			jQuery.sap.measure.clearInteractionMeasurements();
			jQuery.sap.measure.clear();
			Interaction.setActive(false);
		}
	});

	QUnit.test("startInteraction", function(assert) {
		jQuery.sap.measure.startInteraction("click", this.oButton);
		assert.ok(!jQuery.sap.measure.getAllInteractionMeasurements().length, "No completed interaction");
	});

	QUnit.test("endInteraction", function(assert) {
		this.clock = mockPerformanceObject();
		jQuery.sap.measure.startInteraction("click", this.oButton);
		addFakeProcessingTime.apply(this);
		jQuery.sap.measure.endInteraction(true);
		var oMeasurement = jQuery.sap.measure.getAllInteractionMeasurements().pop();
		assert.ok(oMeasurement, "Measurement has been created");

		this.clock.runAll();
		cleanPerformanceObject();
		this.clock.restore();
	});

	QUnit.test("getAllInteractionMeasurements", function(assert) {
		this.clock = mockPerformanceObject();
		jQuery.sap.measure.startInteraction("click", this.oButton);
		var aMeasurements = jQuery.sap.measure.getAllInteractionMeasurements();
		assert.ok(Array.isArray(aMeasurements), "An array was returned");
		assert.strictEqual(aMeasurements.length, 0, "Measurements count is correct");
		addFakeProcessingTime.apply(this);
		jQuery.sap.measure.endInteraction(true);
		aMeasurements = jQuery.sap.measure.getAllInteractionMeasurements();
		assert.strictEqual(aMeasurements.length, 1, "Measurements count is correct");
		jQuery.sap.measure.startInteraction("click", this.oButton);
		addFakeProcessingTime.apply(this);
		jQuery.sap.measure.endInteraction(true);
		aMeasurements = jQuery.sap.measure.getAllInteractionMeasurements();
		assert.strictEqual(aMeasurements.length, 2, "Measurements count is correct");
		jQuery.sap.measure.startInteraction("click", this.oButton);
		addFakeProcessingTime.apply(this);
		aMeasurements = jQuery.sap.measure.getAllInteractionMeasurements(/*bFinalize =*/true);
		assert.strictEqual(aMeasurements.length, 3, "Measurements count is correct - pending interaction has been added");

		this.clock.runAll();
		cleanPerformanceObject();
		this.clock.restore();
	});

	QUnit.test("filterInteractionMeasurements", function(assert) {
		this.clock = mockPerformanceObject();
		performance.getEntriesByType = function() { return []; };

		jQuery.sap.measure.startInteraction("click", this.oButton);
		addFakeProcessingTime.apply(this);
		jQuery.sap.measure.endInteraction(true);
		jQuery.sap.measure.startInteraction("flick", this.oButton);
		addFakeProcessingTime.apply(this);
		jQuery.sap.measure.endInteraction(true);
		jQuery.sap.measure.startInteraction("click", this.oButton);
		addFakeProcessingTime.apply(this);
		jQuery.sap.measure.endInteraction(true);
		var aFilteredMeasurements = jQuery.sap.measure.filterInteractionMeasurements(jQuery.noop);
		assert.ok(Array.isArray(aFilteredMeasurements), "Array has been returned");
		assert.equal(aFilteredMeasurements.length, 0, "Array is empty");
		aFilteredMeasurements = jQuery.sap.measure.filterInteractionMeasurements(function() {
			return true;
		});
		assert.equal(aFilteredMeasurements.length, jQuery.sap.measure.getAllInteractionMeasurements().length, "No filtering applied");
		aFilteredMeasurements = jQuery.sap.measure.filterInteractionMeasurements(function(oMeasurement) {
			return oMeasurement.event === "flick";
		});
		assert.equal(aFilteredMeasurements.length, 1, "Filter applied correctly");

		this.clock.runAll();
		cleanPerformanceObject();
		this.clock.restore();
	});

	QUnit.test("getPendingInteractionMeasurement", function(assert) {
		jQuery.sap.measure.startInteraction("click", this.oButton);
		var oMeasurement = jQuery.sap.measure.getPendingInteractionMeasurement();
		assert.ok(oMeasurement, "Measuerement was returned");
		assert.strictEqual(oMeasurement.end, 0, "Measurements has not been finalized yet");
	});

	QUnit.test("Interaction properties", function(assert) {
		this.clock = mockPerformanceObject();
		jQuery.sap.measure.startInteraction("click", this.oButton);
		addFakeProcessingTime.apply(this);
		jQuery.sap.measure.endInteraction(true);
		var oMeasurement = jQuery.sap.measure.getAllInteractionMeasurements().pop();
		assert.equal(oMeasurement.event, "click", "Event type is set");
		assert.equal(oMeasurement.trigger, this.oButton.getId(), " Id of control which triggered interaction is set");
		assert.equal(oMeasurement.component, "undetermined", "No component could be found");
		assert.equal(oMeasurement.appVersion, "", "No app version could be found");
		assert.equal(oMeasurement.requests.length, 0, "No requests");
		assert.equal(oMeasurement.measurements.length, 0, "No measurements");
		assert.ok(oMeasurement.start !== 0, "Start is set");
		assert.ok(oMeasurement.end !== 0, "End is set");
		assert.ok(oMeasurement.start <= oMeasurement.end, "Start is before end");
		assert.ok(oMeasurement.duration <= oMeasurement.end - oMeasurement.start, "Duration is set");
		assert.ok(oMeasurement.navigation === 0, "No navigation");
		assert.ok(oMeasurement.roundtrip === 0, "No round trip");
		assert.ok(oMeasurement.processing > 0, "Processing time > 0");
		assert.ok(oMeasurement.requestTime === 0, "No round trip");
		assert.ok(oMeasurement.networkTime === 0, "No processing");
		assert.ok(oMeasurement.bytesSent === 0, "No round trip");
		assert.ok(oMeasurement.bytesReceived === 0, "No processing");

		this.clock.runAll();
		cleanPerformanceObject();
		this.clock.restore();
	});

	// do not test safari as it does not seem to work in testing environments
	var bStablePerformanceAPI = performance && performance.getEntries && !Device.browser.safari;

	QUnit.test("Performance API depending measures", function(assert) {
		jQuery.sap.measure.startInteraction("click", this.oButton);
		var notifyAsyncStepCallback;

		notifyAsyncStepCallback = Interaction.notifyAsyncStep();
		waitASecond();
		var oReq = new XMLHttpRequest();
		oReq.open("GET", "resources/ui5loader.js?noCache=" + Date.now(), false);
		oReq.send();
		waitASecond();
		notifyAsyncStepCallback();
		jQuery.sap.measure.endInteraction(true);
		var oMeasurement = jQuery.sap.measure.getAllInteractionMeasurements().pop();
		// ignore browsers where no Performance API is present or insufficient
		if (bStablePerformanceAPI) {
			assert.equal(oMeasurement.requests.length, 1, "One requests");
			assert.equal(oMeasurement.measurements.length, 1, "One measurements");
			assert.ok(oMeasurement.navigation === oMeasurement.requests[0].requestStart - oMeasurement.requests[0].startTime, "Navigation correct");
			assert.ok(oMeasurement.roundtrip === oMeasurement.requests[0].responseEnd - oMeasurement.requests[0].startTime, "Roundtrip correct");
			assert.ok(oMeasurement.processing <= oMeasurement.end - oMeasurement.start, "Processing plausible");
		} else {
			assert.ok(!bStablePerformanceAPI, "Performance API not fully/stable available");
		}
	});

	QUnit.test("Request depending measures", function(assert) {
		jQuery.sap.measure.startInteraction("click", this.oButton);
		var notifyAsyncStepCallback;

		notifyAsyncStepCallback = Interaction.notifyAsyncStep();
		waitASecond();
		var oReq = new XMLHttpRequest();
		oReq.open("GET", "resources/ui5loader.js?noCache=" + Date.now(), false);
		oReq.send();
		waitASecond();
		notifyAsyncStepCallback();
		jQuery.sap.measure.endInteraction(true);
		var oMeasurement = jQuery.sap.measure.getAllInteractionMeasurements().pop();
		// ignore browsers where no Performance API is present or insufficient
		if (bStablePerformanceAPI) {
			assert.equal(oMeasurement.requests.length, 1, "One requests");
			assert.equal(oMeasurement.measurements.length, 1, "One measurements");
			assert.ok(oMeasurement.networkTime === 0, "No sap-perf-fesrec response header");
			assert.ok(oMeasurement.bytesSent === 0, "Nothing posted/putted");
			assert.ok(oMeasurement.bytesReceived === 0, "No bytes received when fesr is not active"); //parseInt(oReq.getResponseHeader("content-length"), 10)
		} else {
			assert.ok(!bStablePerformanceAPI, "Performance API not fully/stable available");
		}
	});

	QUnit.test("jQuery.sap.measure Measurements", function(assert) {
		jQuery.sap.measure.setActive(true);
		jQuery.sap.measure.startInteraction("click", this.oButton);
		// Tests synchronous time intensive API which makes use of measurement API
		jQuery.sap.require("sap.m.Input");
		jQuery.sap.measure.endInteraction();
		jQuery.sap.measure.startInteraction("click", this.oButton);
		var oMeasurement = jQuery.sap.measure.getAllInteractionMeasurements().pop();
		assert.ok(oMeasurement.measurements.length, "Measurements added");
		oMeasurement.measurements.forEach(function(oM) {
			assert.ok(oM.start > oMeasurement.start && oM.end < oMeasurement.end, "Measurements in interaction time range");
		});
	});

	QUnit.test("Component determination", function(assert) {
		// setup
		var done = assert.async();
		var oButton = this.oButton;
		var sComponentName = "MyComponent";
		var Comp = UIComponent.extend("my.Component", {
			metadata : {
				manifest: {
					"sap.app" : {
						id: sComponentName,
						applicationVersion: {
							version: "0.0.0"
						}
					}
				}
			},
			createContent: function() {
				// hack the _sOwnerId for test purpose
				oButton._sOwnerId = this.getId();
				return oButton;
			}
		});
		var oComp = new Comp();

		jQuery.sap.measure.setActive(true);
		jQuery.sap.measure.startInteraction("click", this.oButton);
		// Tests synchronous time intensive API which makes use of measurement API
		jQuery.sap.require("sap.m.List");
		setTimeout(function () {
			jQuery.sap.measure.endInteraction();
			jQuery.sap.measure.startInteraction("click", this.oButton);
			var oMeasurement = jQuery.sap.measure.getAllInteractionMeasurements().pop();

			// assert
			assert.ok(oMeasurement.component === sComponentName, "Component name could be determined");

			// cleanup
			oComp.destroy();
			done();
		}, 2); // Wait at least 2 ms to make interaction "relevant"
	});
});
