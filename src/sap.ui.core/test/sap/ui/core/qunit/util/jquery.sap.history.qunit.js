/* global QUnit, assert */

sap.ui.define([
	"jquery.sap.history",
	"sap/ui/Device"
], function(jQuery, Device) {
	"use strict";

	function newHandler(oObject){
		assert.equal(JSON.stringify(oObject), JSON.stringify(currentData), "Handler added by calling addRoute is called. The object is parsed correctly from the hash");
	}

	function newDefaultHanlder(oObject){
		assert.ok(true, "there are two ok assertion just to test if the new default handler is set correctly");
		assert.ok(true, "there are two ok assertion just to test if the new default handler is set correctly");
	}

	function prepareHistoryState(){
		var sReturn;

		jQuery.sap.history.addVirtualHistory();
		jQuery.sap.history.addVirtualHistory();
		sReturn = jQuery.sap.history.addHistory(sHistoryPath, data1);
		jQuery.sap.history.addVirtualHistory();
		jQuery.sap.history.addHistory(sHistoryPath, data2);
		jQuery.sap.history.addVirtualHistory();
		jQuery.sap.history.addVirtualHistory();
		jQuery.sap.history.addHistory(sDifferentPath, data1);
		jQuery.sap.history.addHistory(sDifferentPath, data3);
		jQuery.sap.history.addVirtualHistory();

		return sReturn;
	}

	var sSuffix = "_skip",
		rSkipRegex = new RegExp(sSuffix + "[0-9]*$"),
		sHistoryPath = "pages%| _skip -id-0909-fsa-{jdsa}",
		sDifferentPath = "ajkf@djafs",
		sNewHistoryPath = "tabs",
		data1 = {id: 1},
		data2 = {id: 2},
		data3 = {
			id: 3,
			array: ["123", 1, {a: 1}],
			object: {
				c: "afdsa"
			}
		};

	jQuery.sap.history("bad here");

	jQuery.sap.history({
		routes: [{
			path: sHistoryPath,
			handler: function(oObject){
				assert.equal(JSON.stringify(oObject), JSON.stringify(currentData), "The object is parsed correctly from the hash");
			}
		},
		{
			path: sDifferentPath,
			handler: function(oObject){
				assert.equal(JSON.stringify(oObject), JSON.stringify(currentData), "The object is parsed correctly from the hash");
			}
		}],
		defaultHandler: function () {
			assert.ok(true, "Counter for seeing if the default handler is called or not");
		}
	});

	//try to call it twice
	jQuery.sap.history({
		routes: [{
			path: sHistoryPath,
			handler: function(oObject){
				assert.equal(JSON.stringify(oObject), JSON.stringify(currentData), "The object is parsed correctly from the hash");
			}
		}],
		defaultHandler: function () {
			assert.ok(true, "Counter for seeing if the default handler is called or not");
		}
	});

	jQuery.sap.history.addRoute(sNewHistoryPath, newHandler);

	var currentData;

	//first
	QUnit.test("Initial Check", function(assert) {
		assert.ok((jQuery.sap.history !== undefined) && (jQuery.sap.history != null), "History object should not be null");
	});


	//first and a half
	QUnit.test("call the back() function to simulate the storing from bookmark, default handler should be called", function(assert){
		var done = assert.async();
		assert.expect(1);

		jQuery.sap.history.back();

		setTimeout(function(){
			done();
		}, 50);
	});

	//second
	QUnit.test("Add a skippable history and try to go back to skippable history", function(assert){
		var done = assert.async();
		assert.expect(4);
		jQuery.sap.history.addVirtualHistory();
		assert.ok(rSkipRegex.test(window.location.hash), "Current hash is a skippable hash");
		setTimeout(function(){
			jQuery.sap.history.back();
			setTimeout(function(){
				window.history.go(1);
				setTimeout(function(){
					assert.ok(!rSkipRegex.test(window.location.hash), "Stay in the current history because there's no non skippable history ahead");
					done();
				}, 50);
			}, 50);
		}, 50);
	});


	//third
	QUnit.test("Add two skippable histories and try to go back to the skippable histories", function(assert){
		var done = assert.async();
		assert.expect(4);
		jQuery.sap.history.addVirtualHistory();
		jQuery.sap.history.addVirtualHistory();

		setTimeout(function(){
			jQuery.sap.history.back();
			setTimeout(function(){
				assert.ok(!rSkipRegex.test(window.location.hash), "Navigate back directly to the first non skippable history");
				window.history.go(1);
				setTimeout(function(){
					assert.ok(!rSkipRegex.test(window.location.hash), "Cannot navigate to the skippable hash when there's no normal history ahead");
					done();
				}, 100);
			}, 100);
		}, 100);
	});


	//fourth
	QUnit.test("Add two skippable histories, one normal history and try to go back and forth", function(assert){
		var done = assert.async();
		assert.expect(4);
		jQuery.sap.history.addVirtualHistory();
		jQuery.sap.history.addVirtualHistory();
		jQuery.sap.history.addHistory(sHistoryPath, data1);

		setTimeout(function(){
			jQuery.sap.history.back();
			setTimeout(function(){
				assert.ok(!rSkipRegex.test(window.location.hash), "Navigate back directly to the first non skippable history");
				window.history.go(1);
				currentData = data1;

				setTimeout(function(){
					assert.ok(!rSkipRegex.test(window.location.hash), "Navigate directly to the first non skippable history");
					done();
				}, 100);
			}, 100);
		}, 100);
	});

	//fifth
	QUnit.test("Add one more skippable history and try to go back and forth", function(assert){
		var done = assert.async();
		assert.expect(4);
		jQuery.sap.history.addVirtualHistory();

		setTimeout(function(){
			jQuery.sap.history.back();
			currentData = data1;
			setTimeout(function(){
				assert.ok(!rSkipRegex.test(window.location.hash), "Navigate back to the first non skippable history");
				window.history.go(1);
				setTimeout(function(){
					assert.ok(!rSkipRegex.test(window.location.hash), "Stay in the current history because there's no non skippable history ahead");
					done();
				}, 100);
			}, 100);
		}, 100);
	});

	//sixth
	QUnit.test("Add two more skippable history, one more normal history and try to go back and forth", function(assert){
		var done = assert.async();
		assert.expect(4);
		jQuery.sap.history.addVirtualHistory();
		jQuery.sap.history.addVirtualHistory();
		jQuery.sap.history.addHistory(sHistoryPath, data2);

		setTimeout(function(){
			jQuery.sap.history.back();
			currentData = data1;
			setTimeout(function(){
				assert.ok(!rSkipRegex.test(window.location.hash), "Navigate back to the first non skippable history");
				window.history.go(1);
				currentData = data2;
				setTimeout(function(){
					assert.ok(!rSkipRegex.test(window.location.hash), "Navigate to the next non skippable history");
					done();
				}, 100);
			}, 100);
		}, 100);
	});

	//seventh
	QUnit.test("Add one history that duplicates with the previous history, there should be id added to the hash", function(assert){
		var done = assert.async();
		jQuery.sap.history.addHistory(sHistoryPath, data1);

		setTimeout(function(){
			assert.ok(/\|id-[0-9]+-[0-9]+/.test(window.location.hash), "There's a id added to the hash");
			done();
		}, 100);
	});

	//eighth
	QUnit.test("Add one history that matches the route added by calling the addRoute method", function(assert){
		var done = assert.async();
		assert.expect(2);
		jQuery.sap.history.addHistory(sNewHistoryPath, data3);
		jQuery.sap.history.addVirtualHistory();

		setTimeout(function(){
			jQuery.sap.history.back();
			currentData = data3;
			setTimeout(function(){
				assert.ok(!rSkipRegex.test(window.location.hash), "Navigate back to the first non skippable history");
				done();
			}, 100);
		}, 100);
	});

	//ninth
	QUnit.test("Set another default handler for history handling", function(assert){
		var done = assert.async();
		assert.expect(2);
		jQuery.sap.history.setDefaultHandler(newDefaultHanlder);

		window.history.go(-8);
		setTimeout(function(){
			done();
		}, 100);
	});


	//tenth
	QUnit.test("back directly to some saved state", function(assert){
		var done = assert.async();
		assert.expect(2);

		var sHash = prepareHistoryState();
		currentData = data1;

		setTimeout(function(){
			jQuery.sap.history.backToHash(sHash);
			setTimeout(function(){
				assert.equal((window.location.href.split("#")[1] || ""), sHash, "back to the specific hash state");
				done();
			}, 300);
		}, 300);
	});

	//eleventh
	QUnit.test("back through the specific path", function(assert){
		var done = assert.async();
		assert.expect(2);

		prepareHistoryState();
		currentData = data2;

		setTimeout(function(){
			jQuery.sap.history.backThroughPath(sHistoryPath);
			setTimeout(function(){
				assert.ok(window.location.href.split("#")[1].indexOf(window.encodeURIComponent(sHistoryPath)) === 0, "back to the first hash with the prefix");
				done();
			}, 300);
		}, 300);
	});

});
