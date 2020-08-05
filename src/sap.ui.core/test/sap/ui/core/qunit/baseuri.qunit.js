/*global QUnit */
sap.ui.define(function(){
	"use strict";
	QUnit.test("After loading the minimal bootstrap code...", function(assert) {
		assert.ok('baseURI' in document, "...should the document have a property baseURI");
		assert.equal(typeof document.baseURI, 'string', "..should read access to document.baseURI return a string");
	});
});
