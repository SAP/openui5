/*global QUnit */
sap.ui.define([], function() {
	"use strict";

	/* Tests mostly taken over from the now removed, jQuery based extendShallow module */

	QUnit.test("indirect extend object", function(assert) {
		var nested = {g: "gg"};
		var oOrig1 = {my: nested};
		var oBaseObject = {};

		//weak clone
		var oMerged = Object.assign(oBaseObject, oOrig1);
		nested.g = "mod";
		oMerged.a = 5;
		assert.ok(oMerged, "should be there");
		assert.equal(oMerged.my.g, "mod", "property was modified and since " +
			"it is a indirect reference, the merged object contains it");
		assert.equal(oMerged.a, 5, "newly created property a should exist");

		assert.notOk(oOrig1.a, "should not exist");

	});

	QUnit.test("non-object target", function(assert) {
		var oMerged = Object.assign(5);
		assert.equal(typeof oMerged, "object", "object should exist");
	});

	QUnit.test("undefined/null properties", function(assert) {
		var oClone = Object.assign({}, {
			prop1: "test",
			prop2: [0,1,2],
			prop3: 2,
			prop4: null,
			prop5: undefined,
			prop6: {
				prop61:"test",
				prop62:[0,2,3],
				prop63: undefined,
				prop64: null,
				prop65: 2
			}
		});
		assert.equal(oClone.prop4, null, "null property cloned successfully");
		assert.equal(oClone.prop5, undefined, "undefined property cloned successfully");
		assert.equal(oClone.prop6.prop64, null, "null property cloned successfully");
		assert.equal(oClone.prop6.prop63, undefined, "undefined property cloned successfully");
	});


	QUnit.test("endless loop with recursion(-1)", function(assert) {

		var oOrig1 = {m: "c"};
		oOrig1.loop = oOrig1;
		var oBaseObject = {};

		var oMerged = Object.assign(oBaseObject, oOrig1);
		assert.equal(typeof oMerged, "object", "5 property should exist");
		assert.ok(oMerged.loop, "property should exist");
		assert.equal(typeof oMerged.loop, "object", "property should be an object");

	});

	QUnit.test("endless loop with merged contains base object", function(assert) {

		var oOrig1 = {m: "c"};
		var oBaseObject = {};
		oOrig1.loop = oBaseObject;

		var oMerged = Object.assign(oBaseObject, oOrig1);
		assert.equal(typeof oMerged, "object", "same base object");
		assert.equal(typeof oMerged.loop,  "object", "property loop should be an object");
	});


	QUnit.test("endless loop cross references", function(assert) {

		var oOrig1 = {mx: "c"};
		var oOrig2 = {mc: "c"};
		oOrig1.o2 = oOrig2;
		oOrig2.o1 = oOrig1;
		var oBaseObject = {};


		var oMerged = Object.assign(oBaseObject, oOrig1, oOrig2);
		assert.equal(typeof oMerged, "object", "object should exist");
		assert.ok(oMerged.o1, "property should exist");
		assert.equal(typeof oMerged.o1, "object", "cross reference property should exist");

		assert.ok(oMerged.o2, "property should exist");
		assert.equal(typeof oMerged.o2, "object", "cross reference property should exist");

	});
});
