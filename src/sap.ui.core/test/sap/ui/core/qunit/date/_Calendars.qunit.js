/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/date/_Calendars"
], function (Log, _Calendars) {
	/*global QUnit*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.core.date._Calendars", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("set and get", function (assert) {
		// code under test
		_Calendars.set("~foo.bar", "~baz");

		// code under test
		assert.strictEqual(_Calendars.get("~foo.bar"), "~baz");
	});

	//*********************************************************************************************
	QUnit.test("get: calendar not registered", function (assert) {
		// code under test
		assert.throws(() => {
			_Calendars.get("~bar");
		}, new TypeError("Load required calendar 'sap/ui/core/date/~bar' in advance"));
	});
});
