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
		/** @deprecated As of version 1.120.0 */
		this.mock(sap.ui).expects("requireSync").never();

		// code under test
		_Calendars.set("~foo.bar", "~baz");

		// code under test
		assert.strictEqual(_Calendars.get("~foo.bar"), "~baz");
	});
	/** @deprecated As of version 1.120.0 */
	QUnit.test("get: load calendar on demand", function (assert) {
		this.mock(sap.ui).expects("requireSync").withExactArgs("sap/ui/core/date/~foo").callsFake(() => {
			// calendar implementations are calling _Calendars.set(...) when they are loaded
			_Calendars.set("~foo", "~bar");
		});

		// code under test
		assert.strictEqual(_Calendars.get("~foo"), "~bar");
	});

	//*********************************************************************************************
	QUnit.test("get: calendar not registered", function (assert) {
		/** @deprecated As of version 1.120.0 */
		this.mock(sap.ui).expects("requireSync").withExactArgs("sap/ui/core/date/~bar");

		// code under test
		assert.throws(() => {
			_Calendars.get("~bar");
		}, new TypeError("Load required calendar 'sap/ui/core/date/~bar' in advance"));
	});
});
