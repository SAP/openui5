/*
	ODataTreeBindingFakeService based ODataTreeBindingFlat tests
	Details:
		MockServer is not compatible with ODataTreeBindingFakeService.
		Once the MockServer is loaded, it attaches to the sinon FakeXMLHttpRequest
		and no requests are being passed to the ODataTreeBindingFakeService.

*/
sap.ui.define([
	"./ODataV2TreeBindingFlat_ExpansionState.qunit",
	"./ODataV2TreeBindingFlat_ExpandCollapse_FakeSrv.qunit"
], function(/* no return for the tests modules */) {
	"use strict";
});