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
		oEventAnnotationFromV2 = {
			"class" : { "Path" :  "Class" },
			"dtend" : { "Path" :  "Dtend" },
			"dtstart" : { "Path" :  "Dtstart" },
			"duration" : { "Path" :  "Duration" },
			"fbtype" : { "Path" :  "Fbtype" },
			"location" : { "Path" :  "Location" },
			"status" : { "Path" :  "Status" },
			"transp" : { "Path" :  "Transp" },
			"wholeday" : { "Path" :  "Wholeday" }
		},
		oMessageAnnotationFromV2 = {
			"body" : { "Path" :  "Body" },
			"from" : { "Path" :  "From" },
			"received" : { "Path" :  "Received" },
			"sender" : { "Path" :  "Sender" },
			"subject" : { "Path" :  "Subject" }
		},
		oTaskAnnotationFromV2 = {
			"completed" : { "Path" : "Completed" },
			"due" : { "Path" : "Due" },
			"percentcomplete" : { "Path" : "PercentComplete" },
			"priority" : { "Path" : "Priority"}
		},
		sNamespace = "http://www.sap.com/Protocols/SAPData",
		aContactProperties = [{
			"name" : "Birthday", "type" : "Edm.Date",
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
		aEventProperties = [{
			"name" : "Class", "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "class", "namespace" : sNamespace
			}]
		}, {
			"name" : "Dtend", "type" : "Edm.DateTimeOffset",
			"extensions" : [{
				"name" : "semantics" , "value" : "dtend", "namespace" : sNamespace
			}]
		}, {
			"name" : "Dtstart", "type" : "Edm.DateTimeOffset",
			"extensions" : [{
				"name" : "semantics" , "value" : "dtstart", "namespace" : sNamespace
			}]
		}, {
			"name" : "Duration", "type" : "Edm.Duration",
			"extensions" : [{
				"name" : "semantics" , "value" : "duration", "namespace" : sNamespace
			}]
		}, {
			"name" : "Fbtype", "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "fbtype", "namespace" : sNamespace
			}]
		}, {
			"name" : "Location", "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "location", "namespace" : sNamespace
			}]
		}, {
			"name" : "Status", "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "status", "namespace" : sNamespace
			}]
		}, {
			"name" : "Transp", "type" : "Edm.Boolean",
			"extensions" : [{
				"name" : "semantics" , "value" : "transp", "namespace" : sNamespace
			}]
		}, {
			"name" : "Wholeday", "type" : "Edm.Boolean",
			"extensions" : [{
				"name" : "semantics" , "value" : "wholeday", "namespace" : sNamespace
			}]
		}],
		aMessageProperties = [{
			"name" : "Body", "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "body", "namespace" : sNamespace
			}]
		}, {
			"name" : "From", "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "from", "namespace" : sNamespace
			}]
		}, {
			"name" : "Received", "type" : "Edm.DateTimeOffset",
			"extensions" : [{
				"name" : "semantics" , "value" : "received", "namespace" : sNamespace
			}]
		}, {
			"name" : "Sender", "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "sender", "namespace" : sNamespace
			}]
		}, {
			"name" : "Subject", "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "subject", "namespace" : sNamespace
			}]
		}],
		aTaskProperties = [{
			"name" : "Completed", "type" : "Edm.DateTimeOffset",
			"extensions" : [{
				"name" : "semantics" , "value" : "completed", "namespace" : sNamespace
			}]
		}, {
			"name" : "Due", "type" : "Edm.DateTimeOffset",
			"extensions" : [{
				"name" : "semantics" , "value" : "due", "namespace" : sNamespace
			}]
		}, {
			"name" : "PercentComplete", "type" : "Edm.Byte",
			"extensions" : [{
				"name" : "semantics" , "value" : "percent-complete", "namespace" : sNamespace
			}]
		}, {
			"name" : "Priority", "type" : "Edm.Byte",
			"extensions" : [{
				"name" : "semantics" , "value" : "priority", "namespace" : sNamespace
			}]
		}],
		oContactType = {
			"name" : "Contact",
			"property" : aContactProperties
		},
		oEventType = {
			"name" : "Event",
			"property" : aEventProperties
		},
		oMessageType = {
			"name" : "Message",
			"property" : aMessageProperties
		},
		oTaskType = {
			"name" : "Task",
			"property" : aTaskProperties
		},
		oDataContact = {
			"version" : "1.0" ,
			"dataServices" : {
				"dataServiceVersion" : "2.0" ,
				"schema" : [{
					"namespace" : "GWSAMPLE_BASIC",
					"complexType" : [{
						"name" : "CT_Contact",
						"property" : aContactProperties
					}, {
						"name" : "CT_Event",
						"property" : aEventProperties
					}, {
						"name" : "CT_Message",
						"property" : aMessageProperties
					}, {
						"name" : "CT_Task",
						"property" : aTaskProperties
					}],
					"entityType" : [oContactType, oEventType, oMessageType, oTaskType],
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
		// contains only a subset of possible annotations to be able to see that v4 annotations win
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
			"GWSAMPLE_BASIC.CT_Contact" : {
				"com.sap.vocabularies.Communication.v1.Contact" : {
					"fn" : { "Path" : "NameFromAnnotation" },
					"adr" : {
						"code" : { "Path" :  "ZipFromAnnotation" },
					},
					"nickname" : { "Path" : "NickNameFromAnnotation" }
				}
			},
			"GWSAMPLE_BASIC.Message" : {
				"com.sap.vocabularies.Communication.v1.Message" : {
					"from" : { "Path" : "FromFromAnnotation" }
				}
			},
			"GWSAMPLE_BASIC.CT_Message" : {
				"com.sap.vocabularies.Communication.v1.Message" : {
					"from" : { "Path" : "FromFromAnnotation" }
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
	[{
		expectedAnnotations: {"Contact": oContactAnnotationFromV2}, type: oContactType
	}, {
		expectedAnnotations: {"Event": oEventAnnotationFromV2}, type: oEventType
	}, {
		expectedAnnotations: {"Message": oMessageAnnotationFromV2}, type: oMessageType
	}, {
		expectedAnnotations: {"Task": oTaskAnnotationFromV2}, type: oTaskType
	}].forEach(function (oFixture) {
		var sTypeName = oFixture.type.name;

		test("addSapSemantics: " + sTypeName, function () {
			var oType = clone(oFixture.type);

			// ensure that sap:semantics properties are available
			oType.property.forEach(function (oProperty) {
				Utils.liftSAPData(oProperty, "Property");
			});

			// code under test
			Utils.addSapSemantics(oType);

			// verify results
			["Contact", "Event", "Message", "Task"].forEach(function (sAnnotationTerm) {
				deepEqual(oType["com.sap.vocabularies.Communication.v1." + sAnnotationTerm],
					oFixture.expectedAnnotations[sAnnotationTerm],
					"result as expected");
			});
		});
	});

	//*********************************************************************************************
	[{
		test: "and v4 wins", annotations: oAnnotations,
		expectedTypeAnnotations: oAnnotations["GWSAMPLE_BASIC.Contact"]
			["com.sap.vocabularies.Communication.v1.Contact"],
		expectedComplexTypeAnnotations: oAnnotations["GWSAMPLE_BASIC.CT_Contact"]
			["com.sap.vocabularies.Communication.v1.Contact"]
	}, {
		test: "without v4 annotations", annotations: {},
		expectedTypeAnnotations: oContactAnnotationFromV2,
		expectedComplexTypeAnnotations: oContactAnnotationFromV2
	}].forEach(function (oFixture) {
		test("merge: addSapSemantics called " + oFixture.test, function () {
			var oData = clone(oDataContact),
				oContact = oData.dataServices.schema[0].entityType[0],
				oCTContact = oData.dataServices.schema[0].complexType[0];

			this.spy(Utils, "addSapSemantics");

			// code under test
			Utils.merge(oFixture.annotations, oData);

			// verify results
			deepEqual(oContact["com.sap.vocabularies.Communication.v1.Contact"],
				oFixture.expectedTypeAnnotations, "Contact annotations for EntityType");
			deepEqual(oCTContact["com.sap.vocabularies.Communication.v1.Contact"],
				oFixture.expectedComplexTypeAnnotations, "Contact annotations for ComplexType");

			equals(Utils.addSapSemantics.callCount, 8);
			ok(Utils.addSapSemantics.calledWithExactly(oCTContact),
				"called addSapSemantics with ComplexType");
			ok(Utils.addSapSemantics.calledWithExactly(oContact),
				"called addSapSemantics with EntityType");
		});
	});

});
