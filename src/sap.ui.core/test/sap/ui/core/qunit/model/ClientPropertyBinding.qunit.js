/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/ClientPropertyBinding"
], function (Log, ClientPropertyBinding) {
	/*global QUnit*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.ClientPropertyBinding", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach() {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//**********************************************************************************************
[
	{mParameters: undefined, expectedIgnoreMessages: undefined},
	{mParameters: {}, expectedIgnoreMessages: undefined},
	{mParameters: {ignoreMessages: "~ignoreMessages"}, expectedIgnoreMessages: "~ignoreMessages"}
].forEach((oFixture, i) => {
	QUnit.test(`constructor: calls setIgnoreMessages, ${i}`, function (assert) {
		const oGetValueExpectation = this.mock(ClientPropertyBinding.prototype).expects("_getValue")
			.withExactArgs()
			.returns("~value");
		const oSetIgnoreMessagesExpectation = this.mock(ClientPropertyBinding.prototype).expects("setIgnoreMessages")
			.withExactArgs(oFixture.expectedIgnoreMessages);

		// code under test
		const oBinding = new ClientPropertyBinding({/*oModel*/}, "/path", /*oContext*/undefined, oFixture.mParameters);

		assert.strictEqual(oBinding.oValue, "~value");
		assert.ok(oGetValueExpectation.calledOn(oBinding));
		assert.ok(oSetIgnoreMessagesExpectation.calledOn(oBinding));
	});
});

	//**********************************************************************************************
	QUnit.test("supportsIgnoreMessages", function (assert) {
		// code under test
		assert.strictEqual(ClientPropertyBinding.prototype.supportsIgnoreMessages(), true);
	});
});