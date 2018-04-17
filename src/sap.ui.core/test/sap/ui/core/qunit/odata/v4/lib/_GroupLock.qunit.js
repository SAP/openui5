/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/odata/v4/lib/_GroupLock"
], function (_GroupLock) {
	/*global QUnit */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._GroupLock", {
		beforeEach : function () {
			this.oLogMock = this.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("non-locking, initialized", function (assert) {
		var oGroupLock = new _GroupLock("foo");

		assert.strictEqual(oGroupLock.getGroupId(), "foo");

		oGroupLock.setGroupId("bar");
		assert.strictEqual(oGroupLock.getGroupId(), "foo");
	});

	//*********************************************************************************************
	QUnit.test("setGroupId", function (assert) {
		var oGroupLock = new _GroupLock();

		assert.strictEqual(oGroupLock.getGroupId(), undefined);

		oGroupLock.setGroupId("foo");
		assert.strictEqual(oGroupLock.getGroupId(), "foo");

		oGroupLock.setGroupId("bar");
		assert.strictEqual(oGroupLock.getGroupId(), "foo");
	});

	//*********************************************************************************************
	QUnit.test("constants", function (assert) {
		assert.strictEqual(_GroupLock.$cached.getGroupId(), "$cached");
	});
});
