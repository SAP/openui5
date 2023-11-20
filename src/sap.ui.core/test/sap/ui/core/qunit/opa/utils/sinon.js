/*global sinon */
sap.ui.define([
	"sap/ui/Device"
], function (Device) {
	"use strict";

	return {
		createStub: function (oObject, sMethod, fnFake) {
			return sinon.stub.callsFake ? sinon.stub(oObject, sMethod).callsFake(fnFake) : sinon.stub(oObject, sMethod, fnFake);
		}
	};
}, true);
