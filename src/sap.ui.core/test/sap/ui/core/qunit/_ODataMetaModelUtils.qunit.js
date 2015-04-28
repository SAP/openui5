/*!
 * ${copyright}
 */
sap.ui.require(['sap/ui/model/odata/_ODataMetaModelUtils'], function (Utils) {
	/*global deepEqual, equal, expect, module, notDeepEqual, notEqual, notPropEqual,
	notStrictEqual, ok, propEqual, sinon, strictEqual, test, throws,
	*/
	"use strict";

	var oContactAnnotationFromV2 = {
			"adr" : {
				"code" : { "Path" :  "Zip" },
				"country" : { "Path" :  "Country" },
				"locality" : { "Path" :  "City" },
				"pobox" : { "Path" :  "PoBox" },
				"region" : { "Path" :  "Region" },
				"street" : { "Path" :  "Street" }
			},
			"bday" : { "Path" :  "Birthday" },
			"fn" : { "Path" :  "Name" },
			"n" : {
				"additional" : { "Path" :  "MiddleName" },
				"given" : { "Path" :  "FirstName" },
				"prefix" : { "Path" :  "Honorific" },
				"suffix" : { "Path" :  "Suffix" },
				"surname" : { "Path" :  "LastName" }
			},
			"nickname" : { "Path" :  "NickName" },
			"note" : { "Path" :  "Note" },
			"org" : { "Path" :  "Org" },
			"orgunit" : { "Path" :  "OrgUnit" },
			"photo" : { "Path" :  "Photo" },
			"role" : { "Path" :  "OrgRole" },
			"title" : { "Path" :  "Title" }
		},
		sNamespace = "http://www.sap.com/Protocols/SAPData",
		aTypeProperties = [{
			"name" : "Birthday", "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "bday", "namespace" : sNamespace
			}]
		}, {
			"name" : "City", "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "city", "namespace" : sNamespace
			}]
		}, {
			"name" : "Country", "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "country", "namespace" : sNamespace
			}]
		}, {
			"name" : "FirstName", "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "givenname", "namespace" : sNamespace
			}]
		}, {
			"name" : "Honorific" , "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "honorific", "namespace" : sNamespace
			}]
		}, {
			"name" : "LastName" , "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "familyname", "namespace" : sNamespace
			}]
		}, {
			"name" : "MiddleName" , "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "middlename", "namespace" : sNamespace
			}]
		}, {
			"name" : "Name", "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "name", "namespace" : sNamespace
			}]
		}, {
			"name" : "NickName" , "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "nickname", "namespace" : sNamespace
			}]
		}, {
			"name" : "Note" , "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "note", "namespace" : sNamespace
			}]
		}, {
			"name" : "Org" , "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "org", "namespace" : sNamespace
			}]
		}, {
			"name" : "OrgRole" , "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "org-role", "namespace" : sNamespace
			}]
		}, {
			"name" : "OrgUnit" , "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "org-unit", "namespace" : sNamespace
			}]
		}, {
			"name" : "Photo" , "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "photo", "namespace" : sNamespace
			}]
		}, {
			"name" : "PoBox", "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "pobox", "namespace" : sNamespace
			}]
		}, {
			"name" : "Region" , "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "region", "namespace" : sNamespace
			}]
		}, {
			"name" : "Street" , "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "street", "namespace" : sNamespace
			}]
		}, {
			"name" : "Suffix" , "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "suffix", "namespace" : sNamespace
			}]
		}, {
			"name" : "Title" , "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "title", "namespace" : sNamespace
			}]
		}, {
			"name" : "Zip" , "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "zip", "namespace" : sNamespace
			}]
		}],
		oContactType = {
			"name" : "Contact",
			"property" : aTypeProperties
		},
		oDataContact = {
			"version" : "1.0" ,
			"dataServices" : {
				"dataServiceVersion" : "2.0" ,
				"schema" : [{
					"namespace" : "GWSAMPLE_BASIC",
					"complexType" : [{
						"name" : "ContactComplex",
						"property" : aTypeProperties
					}],
					"entityType" : [oContactType],
					"entityContainer" : [{
						"name" : "GWSAMPLE_BASIC_Entities",
						"isDefaultEntityContainer" : "true",
						"entitySet" : [],
						"associationSet" : [],
						"functionImport" : [],
						"extensions" : []
					}],
					"association" : [],
					"extensions" : []
				}]
			}
		},
		// contains only a subset of possible annotations to be able to see that V4 annotations win
		oAnnotations = {
			"GWSAMPLE_BASIC.Contact" : {
				"com.sap.vocabularies.Communication.v1.Contact" : {
					"fn" : { "Path" : "NameFromAnnotation" },
					"n" : {
						"suffix" : { "Path" : "SuffixFromAnnotation" }
					},
					"nickname" : { "Path" : "NickNameFromAnnotation" }
				}
			},
			"GWSAMPLE_BASIC.ContactComplex" : {
				"com.sap.vocabularies.Communication.v1.Contact" : {
					"fn" : { "Path" : "NameFromAnnotation" },
					"adr" : {
						"code" : { "Path" :  "ZipFromAnnotation" },
					},
					"nickname" : { "Path" : "NickNameFromAnnotation" }
				}
			},
			"propertyAnnotations" : {},
			"EntityContainer" : {
				"GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities" : {}
			}
		};

	// helper for cloning the given object
	function clone(o) {
		return JSON.parse(JSON.stringify(o));
	}

	//*********************************************************************************************
	module("sap.ui.model.odata._ODataMetaModelUtils");
	//*********************************************************************************************

	//*********************************************************************************************
	test("addSapSemantics contact information", function () {
		var oType = clone(oContactType);

		// ensure that sap:semantics properties are available
		oType.property.forEach(function (oProperty) {
			Utils.liftSAPData(oProperty, "Property");
		});
		Utils.addSapSemantics(oType);
		deepEqual(oType["com.sap.vocabularies.Communication.v1.Contact"], oContactAnnotationFromV2,
			"result as expected");
	});

	[{
		test: "V4 wins", annotations: oAnnotations,
		expectedTypeAnnotations: oAnnotations["GWSAMPLE_BASIC.Contact"]
			["com.sap.vocabularies.Communication.v1.Contact"],
		expectedComplexTypeAnnotations: oAnnotations["GWSAMPLE_BASIC.ContactComplex"]
			["com.sap.vocabularies.Communication.v1.Contact"]
	}, {
		test: "no V4 annotations", annotations: {},
		expectedTypeAnnotations: oContactAnnotationFromV2,
		expectedComplexTypeAnnotations: oContactAnnotationFromV2
	}].forEach(function (oFixture) {
		test("merge: addSapSemantics called and " + oFixture.test, function () {
			var oData = clone(oDataContact),
				oType = oData.dataServices.schema[0].entityType[0],
				oComplexType = oData.dataServices.schema[0].complexType[0];

			this.spy(Utils, "addSapSemantics");

			Utils.merge(oFixture.annotations, oData);

			deepEqual(oType["com.sap.vocabularies.Communication.v1.Contact"],
				oFixture.expectedTypeAnnotations, "Contact annotations for EntityType");
			deepEqual(oComplexType["com.sap.vocabularies.Communication.v1.Contact"],
				oFixture.expectedComplexTypeAnnotations, "Contact annotations for ComplexType");

			ok(Utils.addSapSemantics.calledTwice, "called addSapSemantics twice");
			ok(Utils.addSapSemantics.calledWithExactly(oComplexType),
				"called addSapSemantics with ComplexType");
			ok(Utils.addSapSemantics.calledWithExactly(oType),
				"called addSapSemantics with EntityType");
		});
	});

});
