/* global QUnit, sinon*/

sap.ui.define([
	"sap/ui/mdc/BaseDelegate", "sap/ui/mdc/DefaultTypeMap"
], function (
		BaseDelegate,
		DefaultTypeMap
	) {
	"use strict";

	QUnit.test("getTypeUtil", function(assert) {

		if (!BaseDelegate.getTypeUtil) {
			assert.ok(true, "Test not executed in legacy-free build");
			return undefined;
		}

		sinon.spy(BaseDelegate, "getTypeMap");
		var oTypeUtil = null;
		assert.ok(BaseDelegate.getTypeMap.calledOnce, "calls getTypeMap");
		assert.equal(oTypeUtil, BaseDelegate.getTypeMap(), "returns getTypeMap result");
	});

	QUnit.test("getTypeMap", function(assert) {
		assert.equal(BaseDelegate.getTypeMap(), DefaultTypeMap, "returns correct default");

		var oFakeTypeUtil = {};
		var oFakeDelegateWithTypeUtil = Object.assign({}, BaseDelegate, {
			getTypeUtil: function () { return oFakeTypeUtil; }
		});

		assert.equal(oFakeDelegateWithTypeUtil.getTypeMap(), oFakeTypeUtil, "returns custom typeutil");
	});


});
