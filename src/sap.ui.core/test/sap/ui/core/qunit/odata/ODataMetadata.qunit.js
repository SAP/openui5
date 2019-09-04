/*global QUnit*/
sap.ui.define([
	"sap/ui/model/odata/ODataMetadata",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/core/util/MockServer"
], function(
	ODataMetadata,
	V1ODataModel,
	V2ODataModel,
	MockServer
) {
	"use strict";

	var sServiceUri = "/MockSrv/";
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

	function initModel(sUri) {
		oModel = new V1ODataModel(sUri, true);
		return oModel;
	}

	function initModelV2(sUri, mOptions){
		oModel = new V2ODataModel(sUri, mOptions);
		return oModel;
	}

	QUnit.module("ODataModel Annotation path");

	QUnit.test("init MockServer Flight", function(assert) {
		oServer = initServer(sServiceUri, "model/metadata1.xml", sDataRootPath);
		assert.ok(oServer,"Server initialized");
	});

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

	// Usually we should not test internal methods, but these might be candidates to be made publicly available
	QUnit.module("Internal methods");

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
			assert.expect(15);
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

	var oModelV1 = initModel(sServiceUri);
	var pModelV1MetadataLoaded = new Promise(function(fnResolve, fnReject) {
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
		} else {
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
		assert.ok(Array.isArray(mAnnotation.extensions) && !!mAnnotation.extensions.length > 0, "Filled annotation extension array found");
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

	QUnit.test("V1: _getAnnotation method", fnWrapMetadataReady.bind(this, fnTestAnnotations.bind(this, oModelV1)));
	QUnit.test("V2: _getAnnotation method", fnWrapMetadataReady.bind(this, fnTestAnnotations.bind(this, oModelV1)));


	QUnit.module("sap-cancel-on-close header handling");

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

	QUnit.module("Nav property reference info", {
		beforeEach: function() {
			this.oServer = initServer(sServiceUri, "model/GWSAMPLE_BASIC.metadata.xml", sDataRootPath);
			this.oMetadata = new ODataMetadata(sServiceUri + "$metadata", {});
		},
		afterEach: function() {
			this.oServer.destroy();
			this.oMetadata.destroy();
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
});