/*global QUnit,sinon*/
sap.ui.define([
	"sap/ui/model/odata/_ODataMetaModelUtils",
	"sap/ui/model/odata/ODataMetadata",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/core/util/MockServer"
], function(
	_ODataMetaModelUtils,
	ODataMetadata,
	V1ODataModel,
	V2ODataModel,
	MockServer
) {
	"use strict";

	var sServiceUri = "/MockSrv/";
	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	var sServiceUri3 = "/DOESNOTEXIST/";

	var sDataRootPath =  "test-resources/sap/ui/core/qunit/model/";
	var oServer;
	var oModel;

	function initServer(sUrl, sMetaPath, sDataRoot) {
		var oMockServer = new MockServer({
			rootUri: sServiceUri
		});
		oMockServer.simulate("test-resources/sap/ui/core/qunit/" + sMetaPath, sDataRoot);
		oMockServer.start();
		return oMockServer;
	}

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	function initModel(sUri) {
		oModel = new V1ODataModel(sUri, true);
		return oModel;
	}

	function initModelV2(sUri, mOptions){
		oModel = new V2ODataModel(sUri, mOptions);
		return oModel;
	}

	QUnit.module("ODataMetadata: ODataModel Annotation path");

	QUnit.test("init MockServer Flight", function(assert) {
		oServer = initServer(sServiceUri, "model/metadata1.xml", sDataRootPath);
		assert.ok(oServer,"Server initialized");
	});

/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
(function() {
	QUnit.test("init Model", function(assert) {
		var oModel = initModel(sServiceUri);
		assert.ok(oModel,"Model initialized");
		assert.ok(oModel.getServiceMetadata(),"Metadata loaded");
	});

	QUnit.test("metadata failed handling", function(assert){
		var done = assert.async();
		var oModel = initModel(sServiceUri3);
		var oModel2 = {};
		var handleFailed1 = function(){
			assert.ok(!oModel2.getServiceMetadata(), "Metadata on second model failed correctly");
			oModel2.detachMetadataFailed(handleFailed1);
			done();
		};
		var handleFailed2 = function(){
			assert.ok(!oModel.getServiceMetadata(), "Metadata failed correctly");
			assert.ok(oModel.oMetadata.isFailed(), "Failed on metadata object has been set correctly");
			oModel2 = initModel(sServiceUri3);
			oModel2.attachMetadataFailed(handleFailed1);
			oModel.detachMetadataFailed(handleFailed2);
		};
		oModel.attachMetadataFailed(handleFailed2);
	});
	QUnit.test("get annotation 'sap:label'", function(assert) {
		var oModel = initModel(sServiceUri);
		assert.ok(oModel,"Model initialized");
		assert.equal(oModel.getProperty("/#Flight/FlightConnectionID/@sap:label"),"Flight Number");
	});
	QUnit.test("get annotation 'sap:label' with namespace", function(assert) {
		var oModel = initModel(sServiceUri);
		assert.ok(oModel,"Model initialized");
		assert.equal(oModel.getProperty("/#UNKNOWN.Flight/FlightConnectionID/@sap:label"), undefined, "Unknown namespace");
		assert.equal(oModel.getProperty("/#RMTSAMPLEFLIGHT_2.Flight/FlightConnectionID/@sap:label"), "Flight Number", "Valid namespace");
	});
	QUnit.test("get attribute 'type'", function(assert) {
		var oModel = initModel(sServiceUri);
		assert.ok(oModel,"Model initialized");
		assert.equal(oModel.getProperty("/#Flight/FlightConnectionID/@type"),"Edm.String");
		assert.equal(oModel.getProperty("/#Flight/FirstClassOccupiedSeats/@type"),"Edm.Int32");
	});
	QUnit.test("get complexType attribute 'type' (not supported yet)", function(assert) {
		assert.ok(!oModel.getProperty("/#Flight/FlightDetails/@type"),"only Property attributes could be resolved");
	});
	QUnit.test("get property/entity object (not supported)", function(assert) {
		var oModel = initModel(sServiceUri);
		assert.ok(oModel,"Model initialized");
		assert.ok(!oModel.getProperty("/#Flight/FlightConnectionID"));
		assert.ok(!oModel.getProperty("/#Flight"));
	});
	QUnit.test("get complexType property attributes", function(assert) {
		assert.equal(oModel.getProperty("/#Flight/FlightDetails/DepartureTime/@type"),"Edm.Time");
		assert.equal(oModel.getProperty("/#Flight/FlightDetails/DepartureTime/@sap:label"),"Departure");
		oServer.stop();
		oServer.destroy();
	});
}());

	// Usually we should not test internal methods, but these might be candidates to be made publicly available
	QUnit.module("ODataMetadata: Internal methods");

	var mInternalTests = {
		// Test data to check for
		flightEntity: {
			path: "/FlightCollection(1)",
			fullName: "RMTSAMPLEFLIGHT_2.Flight",
			namespace: "RMTSAMPLEFLIGHT_2",
			name: "Flight",
			setName: "FlightCollection"
		},
		carrierEntity: {
			fullName: "RMTSAMPLEFLIGHT_2.Carrier",
			name: "Carrier",
			namespace: "RMTSAMPLEFLIGHT_2",
			setName: "CarrierCollection"
		},


		functionImports: [{
			path: "/Validate",
			method: "GET",
			returnType: "RMTSAMPLEFLIGHT_2.Flight",
			parameter: [{
				mode: "In", name: "AirLineID", type: "Edm.String"
			}, {
				mode: "In", name: "FlightConnectionID", type: "Edm.String"
			}, {
				mode: "In", name: "FlightDate", type: "Edm.DateTime"
			}]
		}, {
			path: "/Validate2",
			method: "GET",
			entitySet: "RMTSAMPLEFLIGHT_2.Flight",
			parameter: [{
				mode: "In", name: "AirLineID", type: "Edm.String"
			}, {
				mode: "In", name: "FlightConnectionID", type: "Edm.String"
			}, {
				mode: "In", name: "FlightDate", type: "Edm.DateTime"
			}]
		}, {
			path: "/Validate3",
			method: "GET",
			actionFor: "FlightCollection",
			parameter: [{
				mode: "In", name: "AirLineID", type: "Edm.String"
			}, {
				mode: "In", name: "FlightConnectionID", type: "Edm.String"
			}, {
				mode: "In", name: "FlightDate", type: "Edm.DateTime"
			}]
		}],


		// Begin test methods

		"_getEntitySetByType method": function(oModel, assert, done) {
			assert.expect(4);
			var oMetadata = oModel.oMetadata;

			var mEntityType = oMetadata._getEntityTypeByName(this.flightEntity.fullName);
			assert.equal(mEntityType.namespace, this.flightEntity.namespace, "Entity namespace has correct value");
			assert.equal(mEntityType.name, this.flightEntity.name, "Entity name has correct value");

			var mEntitySet = oMetadata._getEntitySetByType(mEntityType);
			assert.equal(mEntitySet.entityType, this.flightEntity.fullName, "Full Entity name in EntitySet has correct value");
			assert.equal(mEntitySet.name, this.flightEntity.setName, "EntitySet name has correct value");
			done();
		},

		"_getEntityTypeByName method": function(oModel, assert, done) {
			assert.expect(3);
			var oMetadata = oModel.oMetadata;

			// The rest is tested in testcase "_getEntitySetByType method" already
			var oNull = oMetadata._getEntityTypeByName("");
			assert.equal(oNull, null, "Method returns null for empty path");

			var oInvalidMetadata = new ODataMetadata("INVALID", {});
			oNull = oInvalidMetadata._getEntityTypeByName(this.flightEntity.fullName);
			assert.equal(oNull, null, "Method returns null when metadata is not loaded path");
			oInvalidMetadata.destroy();
			assert.equal(oInvalidMetadata.oMetadata, undefined, "Internal metadata object deleted");

			done();
		},

		"_getEntitySetByPath method": function(oModel, assert, done) {
			assert.expect(4);
			var oMetadata = oModel.oMetadata;

			var mEntitySet = oMetadata._getEntitySetByPath(this.flightEntity.path);
			assert.equal(mEntitySet.entityType, this.flightEntity.fullName, "Full Entity name in EntitySet has correct value");
			assert.equal(mEntitySet.name, this.flightEntity.setName, "EntitySet name has correct value");

			var mEntityType = oMetadata._getEntityTypeByName(mEntitySet.entityType);
			assert.equal(mEntityType.namespace, this.flightEntity.namespace, "Entity namespace has correct value");
			assert.equal(mEntityType.name, this.flightEntity.name, "Entity name has correct value");

			done();
		},

		"_getEntityTypeByPath method": function(oModel, assert, done) {
			assert.expect(19);
			var oMetadata = oModel.oMetadata;

			var mEntityType = oMetadata._getEntityTypeByPath(this.flightEntity.path);
			assert.equal(mEntityType.namespace, this.flightEntity.namespace, "Entity namespace has correct value");
			assert.equal(mEntityType.name, this.flightEntity.name, "Entity name has correct value");

			var mEntitySet = oMetadata._getEntitySetByType(mEntityType);
			assert.equal(mEntitySet.entityType, this.flightEntity.fullName, "Full Entity name in EntitySet has correct value");
			assert.equal(mEntitySet.name, this.flightEntity.setName, "EntitySet name has correct value");

			var oNull = oMetadata._getEntityTypeByPath("");
			assert.equal(oNull, null, "Method returns null for empty path");

			var oInvalidMetadata = new ODataMetadata("INVALID", {});
			oNull = oInvalidMetadata._getEntityTypeByPath(this.flightEntity.path);
			assert.equal(oNull, null, "Method returns null when metadata is not loaded path");
			oInvalidMetadata.destroy();
			assert.equal(oInvalidMetadata.oMetadata, undefined, "Internal metadata object deleted");

			var mNavigEntityType = oMetadata._getEntityTypeByPath(this.flightEntity.path + "/FlightCarrier");
			assert.equal(mNavigEntityType.namespace, this.carrierEntity.namespace, "Entity namespace has correct value");
			assert.equal(mNavigEntityType.name, this.carrierEntity.name, "Entity name has correct value");

			var mNavigEntitySet = oMetadata._getEntitySetByType(mNavigEntityType);
			assert.equal(mNavigEntitySet.entityType, this.carrierEntity.fullName, "Full Entity name in EntitySet has correct value");
			assert.equal(mNavigEntitySet.name, this.carrierEntity.setName, "EntitySet name has correct value");

			// TODO: Only "Validate2" works here because it has an EntitySet
			var mFunctionEntityType = oMetadata._getEntityTypeByPath("/Validate2");
			assert.equal(mEntityType.namespace, this.flightEntity.namespace, "Entity namespace has correct value");
			assert.equal(mEntityType.name, this.flightEntity.name, "Entity name has correct value");

			var mFunctionEntitySet = oMetadata._getEntitySetByType(mFunctionEntityType);
			assert.equal(mFunctionEntitySet.entityType, this.flightEntity.fullName, "Full Entity name in EntitySet has correct value");
			assert.equal(mFunctionEntitySet.name, this.flightEntity.setName, "EntitySet name has correct value");

			var oEntityTypeFunction = oMetadata._getEntityTypeByPath("/Validate2");
			var oEntityType = oMetadata._getEntityTypeByPath("/FlightCollection");
			assert.ok(oEntityTypeFunction, "Entity type found");
			assert.ok(oEntityTypeFunction.isFunction, "flagged as function");
			assert.ok(oEntityType, "Entity type found");
			assert.ok(!oEntityType.isFunction, "not flagged as function");

			done();
		},

		"_getFunctionImportMetadata method": function(oModel, assert, done) {
			assert.expect(this.functionImports.length * (6 + /* numValidateParams: */ 3 * 3));

			var oMetadata = oModel.oMetadata;
			var fnGetEntityType = function(mFunctionInfo) {
				// Search for "action-for" annotation
				var sActionFor = null;
				if (mFunctionInfo.extensions) {
					for (var i = 0; i < mFunctionInfo.extensions.length; ++i) {
						if (mFunctionInfo.extensions[i].name === "action-for") {
							sActionFor = mFunctionInfo.extensions[i].value;
							break;
						}
					}
				}

				var mEntityType;
				if (sActionFor) {
					mEntityType = oMetadata._getEntityTypeByName(sActionFor);
				} else if (mFunctionInfo.entitySet) {
					mEntityType = oMetadata._getEntityTypeByPath(mFunctionInfo.entitySet);
				} else if (mFunctionInfo.returnType) {
					mEntityType = oMetadata._getEntityTypeByName(mFunctionInfo.returnType);
				}

				return mEntityType;
			};

			for (var i = 0; i < this.functionImports.length; ++i) {
				var mFunction = this.functionImports[i];
				var mFunctionInfo = oMetadata._getFunctionImportMetadata(mFunction.path, mFunction.method);

				assert.equal(mFunctionInfo.returnType, mFunction.returnType, "ReturnType is correctly set");
				assert.equal(mFunctionInfo.httpMethod, mFunction.method, "Method is correctly set");

				for (var n = 0; n < mFunction.parameter.length; ++n) {
					assert.equal(mFunctionInfo.parameter[n].mode, mFunction.parameter[n].mode, "Parameter " + (n + 1) + " mode is correctly set");
					assert.equal(mFunctionInfo.parameter[n].name, mFunction.parameter[n].name, "Parameter " + (n + 1) + " name is correctly set");
					assert.equal(mFunctionInfo.parameter[n].type, mFunction.parameter[n].type, "Parameter " + (n + 1) + " type is correctly set");
				}

				// All function imports always work on RMTSAMPLEFLIGHT_2.Flight
				var mEntityType = fnGetEntityType(mFunctionInfo);
				assert.equal(mEntityType.namespace, this.flightEntity.namespace, "Entity namespace has correct value");
				assert.equal(mEntityType.name, this.flightEntity.name, "Entity name has correct value");

				var mEntitySet = oMetadata._getEntitySetByType(mEntityType);
				assert.equal(mEntitySet.entityType, this.flightEntity.fullName, "Full Entity name in EntitySet has correct value");
				assert.equal(mEntitySet.name, this.flightEntity.setName, "EntitySet name has correct value");
			}

			done();
		}
	};


	oServer = initServer(sServiceUri, "model/metadata1.xml", sDataRootPath);

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	var oModelV1 = initModel(sServiceUri),
		pModelV1MetadataLoaded = new Promise(function(fnResolve, fnReject) {
			oModelV1.attachMetadataLoaded(fnResolve);
			oModelV1.attachMetadataFailed(fnReject);
		});
	var oModelV2 = initModelV2(sServiceUri);


	var fnWrapMetadataReady = function(fnRealTest, assert) {
		var done = assert.async();
		if (oModel instanceof V2ODataModel) {
			oModel.metadataLoaded().then(function () {
				fnRealTest.apply(this, [assert, done].concat([].slice.call(arguments)));
			});
		}
		/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
		if (!(oModel instanceof V2ODataModel)) {
			pModelV1MetadataLoaded.then(function () {
				fnRealTest.apply(this, [assert, done].concat([].slice.call(arguments)));
			});
		}
	};

	for (var sTest in mInternalTests) {
		if (typeof mInternalTests[sTest] !== "function") {
			// Ignore test data
			continue;
		}

		/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
		QUnit.test("V1: " + sTest, fnWrapMetadataReady.bind(this, mInternalTests[sTest].bind(mInternalTests, oModelV1)));
		QUnit.test("V2: " + sTest, fnWrapMetadataReady.bind(this, mInternalTests[sTest].bind(mInternalTests, oModelV2)));
	}




	var fnTestAnnotations = function(oModel, assert, done) {
		assert.expect(15);
		var oMetadata = oModel.oMetadata;
		var oServiceMetadata = oModel.getServiceMetadata();

		assert.equal(oServiceMetadata.dataServices.schema[0].annotations.length, 1,
			"exactly one annotation for the schema should exist"
		);
		assert.equal(
			oMetadata._getAnnotation("/FlightCollection(1)/AirLineID/#@sap:label"),
			"Airline",
			"Airline label annotation correctly read"
		);
		assert.equal(
			oMetadata._getAnnotation("/FlightCollection(1)/TotalBookingsSum/#@sap:unit"),
			"LocalCurrencyCode",
			"Total Bookings Sum unit annotation correctly read"
		);
		assert.equal(
			oMetadata._getAnnotation("/FlightCollection(1)/FlightConnectionID/#@maxLength"),
			"4",
			"Flight Connection ID MaxLength attribute correctly read"
		);
		assert.equal(
			oMetadata._getAnnotation("/FlightCollection(1)/FlightCarrier/CurrencyCode/#@sap:label"),
			"Airline Currency",
			"Label annotation correctly read via navigation property path"
		);
		assert.equal(
			oMetadata._getAnnotation("/FlightCollection(1)/FlightCarrier/Unknown/#@sap:label"),
			null,
			"No annotation for unknown property name"
		);

		assert.equal(
			oMetadata._getAnnotation("/#Flight/AirLineID/@sap:label"),
			"Airline",
			"Airline label annotation correctly read"
		);
		assert.equal(
			oMetadata._getAnnotation("/#Flight/TotalBookingsSum/@sap:unit"),
			"LocalCurrencyCode",
			"Total Bookings Sum unit annotation correctly read"
		);
		assert.equal(
			oMetadata._getAnnotation("/#Flight/FlightConnectionID/@maxLength"),
			"4",
			"Flight Connection ID MaxLength attribute correctly read"
		);


		var mEntityType = oMetadata._getEntityTypeByPath("/FlightCollection(1)");
		var mObject = oMetadata._getPropertyMetadata(mEntityType, "AirLineID");

		var mAnnotation = oMetadata._getV4AnnotationObject(mEntityType, mObject, ["com.sap.test.ui5"]);
		assert.ok(!!mAnnotation, "Annotation object found");
		assert.ok(!!mAnnotation.extensions, "Annotation extension object found");
		assert.ok(Array.isArray(mAnnotation.extensions) && mAnnotation.extensions.length > 0, "Filled annotation extension array found");
		assert.equal(mAnnotation.extensions[0].value, "AirLineID Annotation", "Correct value for AirLineID annotation");

		mAnnotation = oMetadata._getV4AnnotationObject(mEntityType, mObject, ["AirLineID", "com.sap.test.ui5"]);
		assert.equal(mAnnotation, undefined, "No annotation object for multiple parts");


		var mLabelAnnotation = oMetadata._getAnnotationObject(mEntityType, mObject, "sap:label");
		assert.deepEqual(
			mLabelAnnotation,
			{ name: "label", value: "Airline", namespace: "http://www.sap.com/Protocols/SAPData" },
			"Label Annotation correctly resolved"
		);

		done();
	};

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("V1: _getAnnotation method", fnWrapMetadataReady.bind(this, fnTestAnnotations.bind(this, oModelV1)));
	QUnit.test("V2: _getAnnotation method", fnWrapMetadataReady.bind(this, fnTestAnnotations.bind(this, oModelV2)));


	QUnit.module("ODataMetadata: sap-cancel-on-close header handling");

	var fnTestHeaderRequest = function(bCancelOnClose, bExpectedValue) {
		return function(assert){
			var oMetaData = new ODataMetadata("testUri",{"async": true, headers: {"sap-cancel-on-close": bCancelOnClose}});
			var oRequest = oMetaData._createRequest("testUrl");
			assert.strictEqual(oRequest.headers["sap-cancel-on-close"], bExpectedValue, "sap-cancel-on-close header was set correctly.");
		};
	};

	QUnit.test("Default value", fnTestHeaderRequest(undefined, true));
	QUnit.test("Set to true via parameter", fnTestHeaderRequest(true, true));
	QUnit.test("Set to false via parameter", fnTestHeaderRequest(false, false));

	QUnit.module("ODataMetadata: Nav property reference info and getKeyPropertyNamesByPath", {
		before : function () {
			this.oServer = initServer(sServiceUri, "model/GWSAMPLE_BASIC.metadata.xml",
				sDataRootPath);
		},
		beforeEach : function () {
			this.oMetadata = new ODataMetadata(sServiceUri + "$metadata", {});
		},
		afterEach : function () {
			this.oMetadata.destroy();
		},
		after : function () {
			this.oServer.destroy();
		}
	});

	QUnit.test("_getAssociationSetByAssociation", function(assert) {
		return this.oMetadata.loaded().then(function() {
			var oBusinessPartnerProductsSet = this.oMetadata._getAssociationSetByAssociation("GWSAMPLE_BASIC.Assoc_BusinessPartner_Products");
			assert.deepEqual(oBusinessPartnerProductsSet.name, "Assoc_BusinessPartner_Products_AssocSet", "Returns AssocationSet for association");
			assert.equal(this.oMetadata._getAssociationSetByAssociation("GWSAMPLE_BASIC.Unknown"), null, "Returns null for unknown association");
			assert.equal(this.oMetadata._getAssociationSetByAssociation("Unknown"), null, "Returns null for unknown association");
		}.bind(this));
	});

	QUnit.test("_getNavPropRefInfo", function(assert) {
		return this.oMetadata.loaded().then(function() {
			var oEntity = this.oMetadata._getEntityTypeByName("Product"),
				oNavPropRefInfo = {
					name: "ToSupplier",
					entitySet: "BusinessPartnerSet",
					keys: ["BusinessPartnerID"]
				};
			assert.deepEqual(this.oMetadata._getNavPropertyRefInfo(oEntity, "SupplierID"), oNavPropRefInfo, "Returns AssocationSet for association");
			assert.equal(this.oMetadata._getNavPropertyRefInfo(oEntity, "ProductID"), null, "Returns null for nav property in wrong role");
			assert.equal(this.oMetadata._getNavPropertyRefInfo(oEntity, "Price"), null, "Returns null for property not used in referential constraint");
			assert.equal(this.oMetadata._getNavPropertyRefInfo(oEntity, "Unknown"), null, "Returns null for unknown property");
		}.bind(this));
	});

	QUnit.test("_getEntityAssociationEnd - metadata not loaded", function (assert) {
		this.mock(this.oMetadata).expects("_checkMetadataLoaded").withExactArgs().returns(false);

		// code under test
		assert.strictEqual(this.oMetadata._getEntityAssociationEnd(), null);
	});

	QUnit.test("_getEntityAssociationEnd - metadata loaded", function (assert) {
		var oMetadata = this.oMetadata;

		return oMetadata.loaded().then(function () {
			var oSalesOrderEntityType = oMetadata._getEntityTypeByName("GWSAMPLE_BASIC.SalesOrder"),
				oToBusinessPartnerAssociationEnd,
				oToLineItemsAssociationEnd;

			// initially cache is not defined
			assert.strictEqual(oMetadata._mGetEntityAssociationEndCache, undefined, "Initial");

			// code under test
			oToLineItemsAssociationEnd = oMetadata
				._getEntityAssociationEnd(oSalesOrderEntityType, "ToLineItems");

			assert.strictEqual(oToLineItemsAssociationEnd.type,
				"GWSAMPLE_BASIC.SalesOrderLineItem", "ToLineItems");
			assert.strictEqual(oToLineItemsAssociationEnd.multiplicity, "*");
			assert.strictEqual(oToLineItemsAssociationEnd.role,
				"ToRole_Assoc_SalesOrder_SalesOrderLineItems");
			assert.deepEqual(oMetadata._mGetEntityAssociationEndCache, {
				"GWSAMPLE_BASIC.SalesOrder/ToLineItems" : oToLineItemsAssociationEnd
			});

			// code under test
			oToBusinessPartnerAssociationEnd = oMetadata
				._getEntityAssociationEnd(oSalesOrderEntityType, "ToBusinessPartner");

			assert.strictEqual(oToBusinessPartnerAssociationEnd.type,
				"GWSAMPLE_BASIC.BusinessPartner", "ToBusinessPartner");
			assert.strictEqual(oToBusinessPartnerAssociationEnd.multiplicity, "1");
			assert.strictEqual(oToBusinessPartnerAssociationEnd.role,
				"FromRole_Assoc_BusinessPartner_SalesOrders");
			assert.deepEqual(oMetadata._mGetEntityAssociationEndCache, {
				"GWSAMPLE_BASIC.SalesOrder/ToBusinessPartner" : oToBusinessPartnerAssociationEnd,
				"GWSAMPLE_BASIC.SalesOrder/ToLineItems" : oToLineItemsAssociationEnd
			});

			sinon.mock(_ODataMetaModelUtils).expects("findObject")
				.withExactArgs(oSalesOrderEntityType.navigationProperty, "Foo");

			// code under test - unknown navigation property name
			assert.strictEqual(oMetadata._getEntityAssociationEnd(oSalesOrderEntityType, "Foo"),
				null, "Foo");

			assert.deepEqual(oMetadata._mGetEntityAssociationEndCache, {
				"GWSAMPLE_BASIC.SalesOrder/Foo" : null,
				"GWSAMPLE_BASIC.SalesOrder/ToBusinessPartner" : oToBusinessPartnerAssociationEnd,
				"GWSAMPLE_BASIC.SalesOrder/ToLineItems" : oToLineItemsAssociationEnd
			});

			// code under test - use association end from cache
			assert.strictEqual(oMetadata._getEntityAssociationEnd(oSalesOrderEntityType, "Foo"),
				null, "Foo");

			_ODataMetaModelUtils.findObject.restore();
		});
	});

	QUnit.test("_fillElementCaches - metadata not loaded", function (assert) {
		this.mock(this.oMetadata).expects("_checkMetadataLoaded").withExactArgs().returns(false);

		// code under test
		this.oMetadata._fillElementCaches();

		assert.strictEqual(this.oMetadata._entitySetMap, undefined);
	});

	QUnit.test("_fillElementCaches - metadata loaded", function (assert) {
		var oMetadata = this.oMetadata;

		return oMetadata.loaded().then(function () {
			var oEntitySetMap,
				oSchema = oMetadata.oMetadata.dataServices.schema[0],
				aEntitySets = oSchema.entityContainer[0].entitySet,
				oSalesOrderType = oSchema.entityType[2],
				aSalesOrderNavigationProperties = oSalesOrderType.navigationProperty;

			// caches are not available
			assert.strictEqual(oMetadata._entitySetMap, undefined);
			assert.strictEqual(aEntitySets[2].__entityType, undefined);
			assert.strictEqual(oSalesOrderType.__navigationPropertiesMap, undefined);

			// code under test
			oMetadata._fillElementCaches();

			oEntitySetMap = oMetadata._entitySetMap;

			assert.deepEqual(oEntitySetMap, {
				"GWSAMPLE_BASIC.BusinessPartner" : aEntitySets[0],
				"GWSAMPLE_BASIC.Contact" : aEntitySets[4],
				"GWSAMPLE_BASIC.Product" : aEntitySets[1],
				"GWSAMPLE_BASIC.SalesOrder" : aEntitySets[2],
				"GWSAMPLE_BASIC.SalesOrderLineItem" : aEntitySets[3],
				"GWSAMPLE_BASIC.VH_AddressType" : aEntitySets[7],
				"GWSAMPLE_BASIC.VH_BPRole" : aEntitySets[14],
				"GWSAMPLE_BASIC.VH_Category" : aEntitySets[8],
				"GWSAMPLE_BASIC.VH_Country" : aEntitySets[6],
				"GWSAMPLE_BASIC.VH_Currency" : aEntitySets[9],
				"GWSAMPLE_BASIC.VH_Language" : aEntitySets[15],
				"GWSAMPLE_BASIC.VH_ProductTypeCode" : aEntitySets[13],
				"GWSAMPLE_BASIC.VH_Sex" : aEntitySets[5],
				"GWSAMPLE_BASIC.VH_UnitLength" : aEntitySets[12],
				"GWSAMPLE_BASIC.VH_UnitQuantity" : aEntitySets[10],
				"GWSAMPLE_BASIC.VH_UnitWeight" : aEntitySets[11]
			});
			assert.strictEqual(aEntitySets[2].__entityType, oSalesOrderType);
			assert.deepEqual(oSalesOrderType.__navigationPropertiesMap, {
				ToBusinessPartner : aSalesOrderNavigationProperties[0],
				ToLineItems : aSalesOrderNavigationProperties[1]
			});

			// code under test
			oMetadata._fillElementCaches();

			assert.strictEqual(oMetadata._entitySetMap, oEntitySetMap, "same cache");
		});
	});

[{
	iCacheItemReferencesCalls : 0,
	sPath : "/SalesOrderSet('42')",
	sReducedPath : "/SalesOrderSet('42')"
}, {
	iCacheItemReferencesCalls : 0,
	sPath : "/SalesOrderSet('42')/ToLineItems(SalesOrderID='42',ItemPosition='10')",
	sReducedPath : "/SalesOrderSet('42')/ToLineItems(SalesOrderID='42',ItemPosition='10')"
}, {
	iCacheItemReferencesCalls : 1,
	sPath : "/SalesOrderSet('42')/ToLineItems(SalesOrderID='42',ItemPosition='10')/ToHeader",
	sReducedPath : "/SalesOrderSet('42')"
}, {
	iCacheItemReferencesCalls : 1,
	sPath : "/SalesOrderSet('42')/ToLineItems(SalesOrderID='42',ItemPosition='10')/ToHeader/Note",
	sReducedPath : "/SalesOrderSet('42')/Note"
}, {
	iCacheItemReferencesCalls : 2,
	sPath : "/SalesOrderSet('42')/ToLineItems(SalesOrderID='42',ItemPosition='10')/ToHeader"
		+ "/ToLineItems(SalesOrderID='42',ItemPosition='10')/ToHeader/Note",
	sReducedPath : "/SalesOrderSet('42')/Note"
}, {
	iCacheItemReferencesCalls : 1,
	sPath : "/SalesOrderSet('42')/ToLineItems(SalesOrderID='42',ItemPosition='10')/ToProduct/Name",
	sReducedPath :
		"/SalesOrderSet('42')/ToLineItems(SalesOrderID='42',ItemPosition='10')/ToProduct/Name"
}, {
	iCacheItemReferencesCalls : 1,
	sPath : "/SalesOrderSet('42')/ToBusinessPartner/Address/City",
	sReducedPath : "/SalesOrderSet('42')/ToBusinessPartner/Address/City"
}, {
	iCacheItemReferencesCalls : 1,
	sPath : "/SalesOrderLineItemSet(SalesOrderID='42',ItemPosition='10')/ToHeader"
		+ "/ToLineItems(SalesOrderID='42',ItemPosition='10')/Note",
	sReducedPath : "/SalesOrderLineItemSet(SalesOrderID='42',ItemPosition='10')/Note"
}, {
	iCacheItemReferencesCalls : 1,
	sPath : "/SalesOrderLineItemSet(SalesOrderID='42',ItemPosition='10')/ToHeader"
		+ "/ToLineItems(SalesOrderID='42',ItemPosition='20')/Note",
	sReducedPath : "/SalesOrderLineItemSet(SalesOrderID='42',ItemPosition='10')/ToHeader"
		+ "/ToLineItems(SalesOrderID='42',ItemPosition='20')/Note"
}, {
	iCacheItemReferencesCalls : 1,
	sPath : "/SalesOrderLineItemSet(SalesOrderID='42',ItemPosition='10')/ToHeader/ToLineItems",
	sReducedPath : "/SalesOrderLineItemSet(SalesOrderID='42',ItemPosition='10')/ToHeader"
		+ "/ToLineItems"
}, { // function import
	iCacheItemReferencesCalls : 1,
	sPath : "/SalesOrder_Confirm(SalesOrderID='42')"
		+ "/ToLineItems(SalesOrderID='42',ItemPosition='10')/ToHeader/Note",
	sReducedPath : "/SalesOrder_Confirm(SalesOrderID='42')/Note"
}, { // multiple nested partners
	iCacheItemReferencesCalls : 2,
	sPath : "/SalesOrderSet('42')/ToBusinessPartner/ToContacts('aa-bb')/ToBusinessPartner"
		+ "/ToSalesOrders('42')/Note",
	sReducedPath : "/SalesOrderSet('42')/Note"
}, { // must not fail for invalid paths
	iCacheItemReferencesCalls : 1,
	sPath : "/A/ToB/ToC/ToD/Foo",
	sReducedPath : "/A/ToB/ToC/ToD/Foo"
}].forEach(function (oFixture) {
	var sPath = oFixture.sPath,
		sReducedPath = oFixture.sReducedPath,
		sTitle = "_getReducedPath: " + sPath + " -> " + sReducedPath;

	QUnit.test(sTitle, function (assert) {
		var oMetadata = this.oMetadata;

		return oMetadata.loaded().then(function () {
			sinon.spy(oMetadata, "_fillElementCaches");

			// code under test
			assert.strictEqual(oMetadata._getReducedPath(sPath), sReducedPath);

			assert.strictEqual(oMetadata._fillElementCaches.callCount,
				oFixture.iCacheItemReferencesCalls);
			oMetadata._fillElementCaches.restore();
		});
	});
});

[
	{sPath : "/SalesOrderSet('42')", aKeyNames : ["SalesOrderID"]},
	{sPath : "/SalesOrderSet('42')/ToBusinessPartner", aKeyNames : ["BusinessPartnerID"]},
	{sPath : "/SalesOrderSet('42')/ToLineItems", aKeyNames : ["SalesOrderID", "ItemPosition"]},
	{
		sPath : "/SalesOrderSet('42')/ToLineItems(SalesOrderID='42',ItemPosition='010')",
		aKeyNames : ["SalesOrderID", "ItemPosition"]
	},
	{sPath : "/BusinessPartnerSet('42')/CompanyName", aKeyNames : undefined},
	{sPath : "/BusinessPartnerSet('42')/Address", aKeyNames : undefined},
	{
		sPath : "/SalesOrderLineItemSet(SalesOrderID='42',ItemPosition='10')",
		aKeyNames : ["SalesOrderID", "ItemPosition"]
	}, {
		sPath :  "/SalesOrder_Confirm(SalesOrderID='42')"
			+ "/ToLineItems(SalesOrderID='42',ItemPosition='10')/ToHeader/Note",
		aKeyNames : undefined
	}, {
		sPath :  "/SalesOrder_Confirm(SalesOrderID='42')"
			+ "/ToLineItems(SalesOrderID='42',ItemPosition='10')/ToHeader",
		aKeyNames : ["SalesOrderID"]
	}, {
		sPath :  "/SalesOrder_Confirm(SalesOrderID='42')"
			+ "/ToLineItems(SalesOrderID='42',ItemPosition='10')",
		aKeyNames : ["SalesOrderID", "ItemPosition"]
	},
	{sPath :  "/SalesOrder_Confirm(SalesOrderID='42')", aKeyNames : ["SalesOrderID"]},
	{sPath : "/Foo", aKeyNames : undefined},
	{sPath : "/Foo/bar", aKeyNames : undefined},
	{sPath : "/Foo/bar/baz", aKeyNames : undefined}
].forEach(function (oFixture) {
	QUnit.test("getKeyPropertyNamesByPath: " + oFixture.sPath, function (assert) {
		var oMetadata = this.oMetadata;

		return oMetadata.loaded().then(function () {
			// code under test
			assert.deepEqual(oMetadata.getKeyPropertyNamesByPath(oFixture.sPath),
				oFixture.aKeyNames);
		});
	});
});
});