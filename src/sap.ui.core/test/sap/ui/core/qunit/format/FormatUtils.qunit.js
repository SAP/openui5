sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/format/FormatUtils"
], function(Log, FormatUtils) {
	"use strict";
	/*global QUnit*/

	//*********************************************************************************************
	QUnit.module("FormatUtils", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//*********************************************************************************************
[{ // special white spaces are replaced by \u0020 (" ")
	input : "a\u00a0b\u2009c\u202fd e",
	output : "a b c d e"
}, {// complete list of WS codes taken from:
	// https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5Cp%7BGeneral_Category%3DSpace_Separator%7D
	input : "\u3000\u0020\u1680\u2000\u2002\u2003\u2004\u2005\u2006\u2008\u2009\u200A\u205F\u00A0\u2007\u202F",
	output : " ".repeat(16)
}, { // RTL characters are removed
	input : "a\u061c\u200eb\u200fc\u202ad\u202be\u202cf",
	output : "abcdef"
}].forEach((oFixture) => {
	QUnit.test(`normalize: ${oFixture.output}`, function (assert) {
		// code under test
		assert.strictEqual(FormatUtils.normalize(oFixture.input), oFixture.output);
		// code under test (remove whitespaces)
		assert.strictEqual(FormatUtils.normalize(oFixture.input, true), oFixture.output.replaceAll(" ", ""));
	});
});
});
