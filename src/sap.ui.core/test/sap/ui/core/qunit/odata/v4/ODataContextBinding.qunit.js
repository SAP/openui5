/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/odata/v4/ODataModel"
], function(ODataModel) {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";

	//*********************************************************************************************
	module("sap.ui.model.odata.v4.ODataContextBinding");

	//*********************************************************************************************
	test("checkUpdate w/o parameter", function () {
		//TODO replace by test with returning promise (see ODataMetamodel.qunit.js)
		var oModel,
			oBinding,
			bEventSent = false,
			oPromise = Promise.resolve("unused");

		//preparation
		oModel = new ODataModel("/service");
		this.stub(oModel, "read", function () {
			return oPromise;
		});
		oBinding = oModel.bindContext("/path")
		oBinding.attachChange(function (oEvent) {
			bEventSent = true;
			strictEqual(oEvent.getParameter("reason"), "change", "change event parameter");
		});

		//code under test
		oBinding.checkUpdate();

		//test
		ok(oModel.read.calledOnce, "checkUpdate triggers read");
		strictEqual(oModel.read.args[0][0], "/path", "read called with correct path");
		oPromise.then(function () {
			ok(bEventSent, "change event fired");
		});
		return oPromise;
	});

});
