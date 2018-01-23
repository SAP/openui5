/* global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/dt/Util'
],
function(
	Util
) {
	'use strict';

	QUnit.start();

	QUnit.module('Testing of each function', {
		beforeEach: function(assert) {
		},

		afterEach: function() {
		}
	}, function(){
		QUnit.test("wrapError()", function(assert) {
			var sErrorAsString = "I am an error as string";
			var oErrorAsObject = new Error("I am an error inside an object");

			assert.equal(Util.wrapError(sErrorAsString).message, sErrorAsString, "error as string is correctly wrapped");
			assert.equal(Util.wrapError(oErrorAsObject).message, oErrorAsObject.message, "error in object is correctly wrapped");

		});

		QUnit.test("isForeignError()", function(assert){
			var oErrorFromDT = new Error("This error happened in DT");
			oErrorFromDT.name = "sap.ui.dt__Error happened in sap.ui.dt";
			var oErrorFromSomewhereElse = new Error("This error happened somewhere else");
			oErrorFromSomewhereElse.name = "sap.ui.layout__Error happened in sap.ui.layout";

			assert.equal(Util.isForeignError(oErrorFromDT), false, "error from DT is recognized as not foreign");
			assert.equal(Util.isForeignError(oErrorFromSomewhereElse), true, "error from somewhere else is recognized as foreign");
		});

		QUnit.test("printf()", function(assert){
			var sStringWithArguments = "Arg1: {0}, Arg2: {1}";
			assert.equal(Util.printf(sStringWithArguments, "Arg1", "Arg2"),
				"Arg1: Arg1, Arg2: Arg2",
				"The string has been correctly assembled");
		});

		QUnit.test("curry()", function(assert){
			var fnOriginalFunction = function(sPar1, sPar2){
				return sPar1 + sPar2;
			};
			var fnCurriedFunction = Util.curry(fnOriginalFunction);

			assert.equal(fnCurriedFunction("Curried")("Test"), "CurriedTest", "the function has been properly curried");
		});

		QUnit.test("objectValues()", function(assert){
			var sValue1 = "test1";
			var sValue2 = "test2";
			var mObject = {
				value1: sValue1,
				value2: sValue2
			};

			assert.deepEqual(Util.objectValues(mObject), [sValue1, sValue2], "the correct object values were returned");
		});

	});
});