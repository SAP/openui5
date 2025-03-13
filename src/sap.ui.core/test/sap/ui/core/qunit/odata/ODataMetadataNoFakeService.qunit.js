/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/ODataMetadata",
	"sap/ui/test/TestUtils"
], function (Log, ODataMetadata, TestUtils) {
	/*global QUnit, sinon*/
	/*eslint no-warning-comments: 0, max-nested-callbacks: 0*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.ODataMetadata (ODataMetadataNoFakeService)", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		},

		afterEach : function (assert) {
			return TestUtils.awaitRendering();
		}
	});

	//*********************************************************************************************
	QUnit.test("_getPropertyMetadata: no entity type given", function (assert) {
		// code under test
		assert.strictEqual(ODataMetadata.prototype._getPropertyMetadata.call(/*not relevant*/null), undefined);
	});

	//*********************************************************************************************
	QUnit.test("_getPropertyMetadata: unknown type property", function (assert) {
		// code under test
		assert.strictEqual(
			ODataMetadata.prototype._getPropertyMetadata.call(/*not relevant*/null, /*oEntityType*/{}, "~property"),
			undefined);
	});

	//*********************************************************************************************
["/~property" , "~property", "~property/", "/~property/"].forEach(function (sPath) {
	QUnit.test("_getPropertyMetadata: known type property, sPath=" + sPath, function (assert) {
		var oPropertyMetadata = {name: "~property", type: "Edm.String"},
			oEntityType = {
				property: [{name: "foo", type: "bar"}, oPropertyMetadata]
			},
			oResult;

		// code under test
		oResult = ODataMetadata.prototype._getPropertyMetadata.call(/*not relevant*/null, oEntityType, sPath);

		assert.strictEqual(oResult, oPropertyMetadata);
		assert.deepEqual(oResult, {name: "~property", type: "Edm.String"});
	});
});

	//*********************************************************************************************
	QUnit.test("_getPropertyMetadata: entity type property addressed via navigation properties", function (assert) {
		var oMetadata = {
				_getEntityTypeByNavProperty: function () {},
				_getPropertyMetadata: function () {}
			},
			oMetadataMock = this.mock(oMetadata),
			oEntityType = {property: []};

		oMetadataMock.expects("_getEntityTypeByNavProperty").withExactArgs(sinon.match.same(oEntityType), "~nav0")
			.returns("~entityType0");
		oMetadataMock.expects("_getEntityTypeByNavProperty").withExactArgs("~entityType0", "~nav1")
			.returns("~entityType1");
		oMetadataMock.expects("_getPropertyMetadata").withExactArgs("~entityType1", "~property")
			.returns("~oPropertyMetadata");

		// code under test
		assert.strictEqual(
			ODataMetadata.prototype._getPropertyMetadata.call(oMetadata, oEntityType, "~nav0/~nav1/~property"),
			"~oPropertyMetadata");
	});

	//*********************************************************************************************
	QUnit.test("_getPropertyMetadata: first part is not a complex type, nav. property or property", function (assert) {
		var oMetadata = {
				_getEntityTypeByNavProperty: function () {}
			},
			oMetadataMock = this.mock(oMetadata),
			oEntityType = {property: []};

		oMetadataMock.expects("_getEntityTypeByNavProperty").withExactArgs(sinon.match.same(oEntityType), "~nav0")
			.returns(undefined);

		// code under test
		assert.strictEqual(
			ODataMetadata.prototype._getPropertyMetadata.call(oMetadata, oEntityType, "~nav0/~property"),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("_getPropertyMetadata: path segment may be a complex type", function (assert) {
		var oMetadata = {
				_getEntityTypeByNavProperty: function () {},
				_getPropertyMetadata: function () {}
			},
			oMetadataMock = this.mock(oMetadata),
			oEntityType = {property: []};

		oMetadataMock.expects("_getEntityTypeByNavProperty").withExactArgs(sinon.match.same(oEntityType), "~nav0")
			.returns("~entityType0");
		oMetadataMock.expects("_getEntityTypeByNavProperty").withExactArgs("~entityType0", "~maybeComplex")
			.returns(undefined);
		oMetadataMock.expects("_getPropertyMetadata").withExactArgs("~entityType0", "~maybeComplex/~property")
			.returns("~recursiveCallResult");

		// code under test
		assert.strictEqual(
			ODataMetadata.prototype._getPropertyMetadata.call(oMetadata, oEntityType, "~nav0/~maybeComplex/~property"),
			"~recursiveCallResult");
	});

	//*********************************************************************************************
	QUnit.test("_getPropertyMetadata: complex type property", function (assert) {
		var oMetadata = {
				_getObjectMetadata: function () {},
				_getPropertyMetadata: function () {},
				_splitName: function () {}
			},
			oEntityType = {property: [{name: "~complex", type: "~complexType"}]};

		this.mock(oMetadata).expects("_splitName").withExactArgs("~complexType")
			.returns({name: "~complexTypeName", namespace: "~namespace"});
		this.mock(oMetadata).expects("_getObjectMetadata")
			.withExactArgs("complexType", "~complexTypeName", "~namespace")
			.returns("~oComplexEntityType");
		this.mock(oMetadata).expects("_getPropertyMetadata").withExactArgs("~oComplexEntityType", "~property")
			.returns("~oComplexTypePropertyMetadata");

		// code under test
		assert.strictEqual(
			ODataMetadata.prototype._getPropertyMetadata.call(oMetadata, oEntityType, "~complex/~property"),
			"~oComplexTypePropertyMetadata");
	});

	//*********************************************************************************************
	QUnit.test("_getPropertyMetadata: nested complex type property", function (assert) {
		var oMetadata = {
				_getObjectMetadata: function () {},
				_getPropertyMetadata: function () {},
				_splitName: function () {}
			},
			oEntityType = {property: [{name: "~complex0", type: "~complexType0"}]};

		this.mock(oMetadata).expects("_splitName")
			.withExactArgs("~complexType0")
			.returns({name: "~complexType0Name", namespace: "~namespace"});
		this.mock(oMetadata).expects("_getObjectMetadata")
			.withExactArgs("complexType", "~complexType0Name", "~namespace")
			.returns("~oComplexType0");
		this.mock(oMetadata).expects("_getPropertyMetadata")
			.withExactArgs("~oComplexType0", "~complex1/~property")
			.returns("~oComplexTypePropertyMetadata");

		// code under test
		assert.strictEqual(
			ODataMetadata.prototype._getPropertyMetadata.call(oMetadata, oEntityType, "~complex0/~complex1/~property"),
			"~oComplexTypePropertyMetadata");
	});

	//*********************************************************************************************
	QUnit.test("_getPropertyMetadata: complex type property addressed via navigation properties", function (assert) {
		var oMetadata = {
				_getEntityTypeByNavProperty: function () {},
				_getPropertyMetadata: function () {}
			},
			oMetadataMock = this.mock(oMetadata),
			oEntityType = {property: []};

		oMetadataMock.expects("_getEntityTypeByNavProperty").withExactArgs(sinon.match.same(oEntityType), "~nav0")
			.returns("~entityType0");
		oMetadataMock.expects("_getEntityTypeByNavProperty").withExactArgs("~entityType0", "~nav1")
			.returns("~entityType1");
		oMetadataMock.expects("_getEntityTypeByNavProperty").withExactArgs("~entityType1", "~complex")
			.returns(undefined);
		oMetadataMock.expects("_getPropertyMetadata").withExactArgs("~entityType1", "~complex/~property")
			.returns("~oComplexTypePropertyMetadata");

		// code under test
		assert.strictEqual(
			ODataMetadata.prototype._getPropertyMetadata.call(oMetadata, oEntityType, "~nav0/~nav1/~complex/~property"),
			"~oComplexTypePropertyMetadata");
	});

	//*********************************************************************************************
	QUnit.test("_getPropertyMetadata: with metadata path", function (assert) {
		var oPropertyMetadata = {name: "~property", type: "Edm.String"},
			oEntityType = {
				property: [oPropertyMetadata]
			},
			oResult;

		// code under test
		oResult = ODataMetadata.prototype._getPropertyMetadata.call({}, oEntityType, "~property/@sap:label");

		assert.strictEqual(oResult, oPropertyMetadata);
		assert.deepEqual(oResult, {name: "~property", type: "Edm.String"});
	});
});
