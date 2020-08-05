/*global QUnit */
sap.ui.define([
	"sap/ui/test/pipelines/PipelineFactory"
], function(PipelineFactory){
	"use strict";

	QUnit.module("positive tests");

	QUnit.test("Should wrap a single function", function(assert) {
		// Arrange
		var fnMatcher = function () {
		};

		// System under Test
		var oFactory = new PipelineFactory({
			name: "Matcher",
			functionName: "isMatching"
		});

		// Act
		var aResult = oFactory.create(fnMatcher);

		// Assert
		assert.ok(Array.isArray(aResult), "Casted a single function to an array");
		assert.strictEqual(aResult[0].isMatching, fnMatcher , "The resulting object has the anonymous function on a functionName property");
	});

	QUnit.test("Should wrap a single object", function(assert) {
		// Arrange
		var oObjectContainingTheFunction = {
			myFunction: function () {}
		};

		// System under Test
		var oFactory = new PipelineFactory({
			name: "Matcher",
			functionName: "myFunction"
		});

		// Act
		var aResult = oFactory.create(oObjectContainingTheFunction);

		// Assert
		assert.ok(Array.isArray(aResult), "Casted a single object to an array");
		assert.strictEqual(aResult[0], oObjectContainingTheFunction , "The resulting object was untouched");
	});


	QUnit.test("Should wrap multiple functions", function(assert) {
		// Arrange
		var fnAnonymousFunction = function () {
			},
			oObjectWithFunction = {
				someName: function () {}
			};

		// System under Test
		var oFactory = new PipelineFactory({
			name: "Matcher",
			functionName: "someName"
		});

		// Act
		var aResult = oFactory.create([fnAnonymousFunction, oObjectWithFunction ]);

		// Assert
		assert.ok(Array.isArray(aResult), "Casted a single function to an array");
		assert.strictEqual(aResult[0].someName, fnAnonymousFunction , "The resulting object has the anonymous function on a functionName property");
		assert.strictEqual(aResult[1], oObjectWithFunction , "The matcher was untouched since it was already implementing the contract");
	});

});
