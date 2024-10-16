/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/CustomData",
	"sap/ui/core/fieldhelp/FieldHelpCustomData",
	"sap/ui/core/fieldhelp/FieldHelpUtil"
], function (Log, CustomData, FieldHelpCustomData, FieldHelpUtil) {
	/*global QUnit*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap/ui/core/fieldhelp/FieldHelpUtil", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//*********************************************************************************************
["~DocumentationRef", ["~DocumentationRef"]].forEach((vDoumenationRef, i) => {
	QUnit.test("setDocumentationRef: new custom data, #" + i, function (assert) {
		const oCustomData0 = {getKey() {}};
		this.mock(oCustomData0).expects("getKey").withExactArgs().returns("~foo");
		const oElement = {addAggregation() {}, getCustomData() {}};
		this.mock(oElement).expects("getCustomData").withExactArgs().returns([oCustomData0]);
		this.mock(oElement).expects("addAggregation")
			.callsFake((sAggregationName, oCustomData, bSuppressInvalidate) => {
				assert.strictEqual(sAggregationName, "customData");
				assert.ok(oCustomData instanceof FieldHelpCustomData);
				assert.strictEqual(oCustomData.getKey(), FieldHelpCustomData.DOCUMENTATION_REF_KEY);
				assert.deepEqual(oCustomData.getValue(), ["~DocumentationRef"]);
				assert.strictEqual(bSuppressInvalidate, true);
			});

		// code under test
		FieldHelpUtil.setDocumentationRef(oElement, vDoumenationRef);
	});
});

	//*********************************************************************************************
["~DocumentationRef", ["~DocumentationRef"]].forEach((vDoumenationRef, i) => {
	QUnit.test("setDocumentationRef: replace existing custom data value, #" + i, function () {
		const oCustomData = new FieldHelpCustomData({key: FieldHelpCustomData.DOCUMENTATION_REF_KEY});
		this.mock(oCustomData).expects("getKey").withExactArgs().callThrough();
		const oElement = {getCustomData() {}};
		this.mock(oElement).expects("getCustomData").withExactArgs().returns([oCustomData]);
		this.mock(oCustomData).expects("setValue").withExactArgs(["~DocumentationRef"]);

		// code under test
		FieldHelpUtil.setDocumentationRef(oElement, vDoumenationRef);

		oCustomData.destroy();
	});
});

	//*********************************************************************************************
	QUnit.test("setDocumentationRef: throw error if custom data has wrong type", function (assert) {
		const oCustomData = new CustomData({key: FieldHelpCustomData.DOCUMENTATION_REF_KEY});
		this.mock(oCustomData).expects("getKey").withExactArgs().callThrough();
		const oElement = {getCustomData() {}};
		this.mock(oElement).expects("getCustomData").withExactArgs().returns([oCustomData]);

		assert.throws(() => {
			// code under test
			FieldHelpUtil.setDocumentationRef(oElement, ["~DocumentationRef"]);
		}, new Error('Unsupported custom data type for key "sap-ui-DocumentationRef"'));

		oCustomData.destroy();
	});
});