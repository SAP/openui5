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
				"code" : { "Path" : "Zip" },
				"country" : { "Path" : "Country" },
				"locality" : { "Path" : "City" },
				"pobox" : { "Path" : "PoBox" },
				"region" : { "Path" : "Region" },
				"street" : { "Path" : "Street" }
			},
			"bday" : { "Path" : "Birthday" },
			"email" : [{
				"address" : { "Path" : "EMail" },
				"type" : {
					"EnumMember" : "com.sap.vocabularies.Communication.v1.ContactInformationType/"
						+ "preferred"
				}
			}, {
				"address" : { "Path" : "EMail2" }
			}],
			"fn" : { "Path" : "Name" },
			"n" : {
				"additional" : { "Path" : "MiddleName" },
				"given" : { "Path" : "FirstName" },
				"prefix" : { "Path" : "Honorific" },
				"suffix" : { "Path" : "Suffix" },
				"surname" : { "Path" : "LastName" }
			},
			"nickname" : { "Path" : "NickName" },
			"note" : { "Path" : "Note" },
			"org" : { "Path" : "Org" },
			"orgunit" : { "Path" : "OrgUnit" },
			"photo" : { "Path" : "Photo" },
			"role" : { "Path" : "OrgRole" },
			"tel" : [{
				"type" : {
					"EnumMember" : "com.sap.vocabularies.Communication.v1.PhoneType/work "
						+ "com.sap.vocabularies.Communication.v1.PhoneType/cell"
				},
				"uri" : { "Path" : "Tel" }
			}, {
				"type" : {
					"EnumMember" : "com.sap.vocabularies.Communication.v1.PhoneType/fax"
				},
				"uri" : { "Path" : "Tel2" }
			}, {
				"uri" : { "Path" : "Tel3" }
			}],
			"title" : { "Path" : "Title" }
		},
		oEventAnnotationFromV2 = {
			"class" : { "Path" : "Class" },
			"dtend" : { "Path" : "Dtend" },
			"dtstart" : { "Path" : "Dtstart" },
			"duration" : { "Path" : "Duration" },
			"fbtype" : { "Path" : "Fbtype" },
			"location" : { "Path" : "Location" },
			"status" : { "Path" : "Status" },
			"transp" : { "Path" : "Transp" },
			"wholeday" : { "Path" : "Wholeday" }
		},
		oMessageAnnotationFromV2 = {
			"body" : { "Path" : "Body" },
			"from" : { "Path" : "From" },
			"received" : { "Path" : "Received" },
			"sender" : { "Path" : "Sender" },
			"subject" : { "Path" : "Subject" }
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
			"name" : "EMail", "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "email;type=pref", "namespace" : sNamespace
			}]
		}, {
			"name" : "EMail2", "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "email", "namespace" : sNamespace
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
			"name" : "Tel" , "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "tel;type=work,cell", "namespace" : sNamespace
			}]
		}, {
			"name" : "Tel2" , "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "tel;type=fax", "namespace" : sNamespace
			}]
		}, {
			"name" : "Tel3" , "type" : "Edm.String",
			"extensions" : [{
				"name" : "semantics" , "value" : "tel", "namespace" : sNamespace
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
		oDataSchema = {
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
					"entityType" : [oContactType, oEventType, oMessageType, oTaskType, {
						"name" : "Product",
						"property" : [{
							"name" : "Foo", "type" : "Edm.DateTime",
							"extensions" : [{
								"name" : "filter-restriction" , "value" : "interval",
								"namespace" : sNamespace
							}]
						}, {
							"name" : "Bar", "type" : "Edm.Byte"
						}]
					}],
					"entityContainer" : [{
						"name" : "GWSAMPLE_BASIC_Entities",
						"isDefaultEntityContainer" : "true",
						"entitySet" : [{
							"name" : "ContactSet",
							"entityType" : "GWSAMPLE_BASIC.Contact",
							"extensions" : [{
								"name" : "deletable-path",
								"value" : "Deletable",
								"namespace" : "http://www.sap.com/Protocols/SAPData"
							}, {
								"name" : "updatable-path",
								"value" : "Updatable",
								"namespace" : "http://www.sap.com/Protocols/SAPData"
							}]
						}, {
							"name" : "ProductSet",
							"entityType" : "GWSAMPLE_BASIC.Product"
						}],
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
						"code" : { "Path" : "ZipFromAnnotation" },
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
			"propertyAnnotations" : {
				"GWSAMPLE_BASIC.Contact" : {
					"EMail" : {
						"com.sap.vocabularies.Communication.v1.IsEmailAddress" : {
							"Bool" : "false"
						}
					},
					"Tel" : {
						"com.sap.vocabularies.Communication.v1.IsPhoneNumber" : {
							"Bool" : "false"
						}
					}
				}
			},
			"EntityContainer" : {
				"GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities" : {}
			}
		};

	// helper for cloning the given object
	function clone(o) {
		return JSON.parse(JSON.stringify(o));
	}

	//*********************************************************************************************
	module("sap.ui.model.odata._ODataMetaModelUtils", {
		beforeEach : function () {
			this.iOldLogLevel = jQuery.sap.log.getLevel();
			// do not rely on ERROR vs. DEBUG due to minified sources
			jQuery.sap.log.setLevel(jQuery.sap.log.Level.ERROR);
		},
		afterEach : function () {
			jQuery.sap.log.setLevel(this.iOldLogLevel);
		}
	});
	//*********************************************************************************************

	//*********************************************************************************************
	[
		// supported "tel" types
		{
			sOutput : "com.sap.vocabularies.Communication.v1.PhoneType/cell",
			sSemantics : "tel",
			sTypes : "cell"
		}, {
			sOutput : "com.sap.vocabularies.Communication.v1.PhoneType/fax",
			sSemantics : "tel",
			sTypes : "fax"
		}, {
			sOutput : "com.sap.vocabularies.Communication.v1.PhoneType/home",
			sSemantics : "tel",
			sTypes : "home"
		}, {
			sOutput : "com.sap.vocabularies.Communication.v1.PhoneType/preferred",
			sSemantics : "tel",
			sTypes : "pref"
		}, {
			sOutput : "com.sap.vocabularies.Communication.v1.PhoneType/video",
			sSemantics : "tel",
			sTypes : "video"
		}, {
			sOutput : "com.sap.vocabularies.Communication.v1.PhoneType/voice",
			sSemantics : "tel",
			sTypes : "voice"
		}, {
			sOutput : "com.sap.vocabularies.Communication.v1.PhoneType/work",
			sSemantics : "tel",
			sTypes : "work"
		},
		// v2 types which are not supported in v4
		{
			oExpectedMessage : "pager",
			sOutput : "",
			sSemantics : "tel",
			sTypes : "pager"
		}, {
			oExpectedMessage : "text",
			sOutput : "",
			sSemantics : "tel",
			sTypes : "text"
		}, {
			oExpectedMessage : "textphone",
			sOutput : "",
			sSemantics : "tel",
			sTypes : "textphone"
		},
		// combination of multiple types
		{
			sOutput : "com.sap.vocabularies.Communication.v1.PhoneType/cell"
				+ " com.sap.vocabularies.Communication.v1.PhoneType/home"
				+ " com.sap.vocabularies.Communication.v1.PhoneType/work",
			sSemantics : "tel",
			sTypes : "cell,home,work"
		},
		// combination of multiple types with invalid types
		{
			oExpectedMessage : "xyz",
			sOutput : "com.sap.vocabularies.Communication.v1.PhoneType/cell"
				+ " com.sap.vocabularies.Communication.v1.PhoneType/work",
			sSemantics : "tel",
			sTypes : "cell,xyz,work"
		}, {
			oExpectedMessage : "xyz",
			sOutput : "com.sap.vocabularies.Communication.v1.PhoneType/home",
			sSemantics : "tel",
			sTypes : "xyz,home"
		},
		// supported "email" types
		{
			sOutput : "com.sap.vocabularies.Communication.v1.ContactInformationType/home",
			sSemantics : "email",
			sTypes : "home"
		}, {
			sOutput : "com.sap.vocabularies.Communication.v1.ContactInformationType/preferred",
			sSemantics : "email",
			sTypes : "pref"
		}, {
			sOutput : "com.sap.vocabularies.Communication.v1.ContactInformationType/work",
			sSemantics : "email",
			sTypes : "work"
		},
		// combination of multiple types
		{
			sOutput : "com.sap.vocabularies.Communication.v1.ContactInformationType/preferred"
				+ " com.sap.vocabularies.Communication.v1.ContactInformationType/work",
			sSemantics : "email",
			sTypes : "pref,work"
		},
		// combination of multiple types with invalid types
		{
			oExpectedMessage : "xyz",
			sOutput : "com.sap.vocabularies.Communication.v1.ContactInformationType/preferred"
				+ " com.sap.vocabularies.Communication.v1.ContactInformationType/work",
			sSemantics : "email",
			sTypes : "pref,xyz,work"
		}, {
			oExpectedMessage : "xyz",
			sOutput : "com.sap.vocabularies.Communication.v1.ContactInformationType/home",
			sSemantics : "email",
			sTypes : "xyz,home"
		},
	].forEach(function (oFixture) {
		var sSemanticsValue = oFixture.sSemantics + ";type=" + oFixture.sTypes;
		test("getV4TypesForV2Semantics: " + sSemanticsValue, function () {
			var oLogMock = this.mock(jQuery.sap.log),
				bLogExpected = oFixture.sOutput === "" || oFixture.oExpectedMessage,
				oType = { "name" : "Foo" },
				oProperty = { "name" : "bar", "sap:semantics" : sSemanticsValue };

			oLogMock.expects("isLoggable").exactly(bLogExpected ? 1 : 0)
				.withExactArgs(jQuery.sap.log.Level.WARNING)
				.returns(true);
			oLogMock.expects("warning").exactly(bLogExpected ? 1 : 0)
				.withExactArgs("Unsupported type for sap:semantics: "
						+ oFixture.oExpectedMessage,
					"Foo.bar",
					"sap.ui.model.odata._ODataMetaModelUtils");

			strictEqual(Utils.getV4TypesForV2Semantics(oFixture.sSemantics, oFixture.sTypes,
				oProperty, oType), oFixture.sOutput, sSemanticsValue);
		});
	});

	//*********************************************************************************************
	[{
		expectedAnnotations: {"Contact" : oContactAnnotationFromV2}, type: oContactType
	}, {
		expectedAnnotations: {"Event" : oEventAnnotationFromV2}, type: oEventType
	}, {
		expectedAnnotations: {"Message" : oMessageAnnotationFromV2}, type: oMessageType
	}, {
		expectedAnnotations: {"Task" : oTaskAnnotationFromV2}, type: oTaskType
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
					sAnnotationTerm + " is as expected");
			});
			if (sTypeName === "Contact") {
				deepEqual(oType.property[3/*EMail*/]
						["com.sap.vocabularies.Communication.v1.IsEmailAddress"],
					{ "Bool" : "true" });
				deepEqual(oType.property[4/*EMail2*/]
						["com.sap.vocabularies.Communication.v1.IsEmailAddress"],
					{ "Bool" : "true" });
				deepEqual(oType.property[20/*Tel*/]
						["com.sap.vocabularies.Communication.v1.IsPhoneNumber"],
					{ "Bool" : "true" });
				deepEqual(oType.property[22/*Tel3*/]
						["com.sap.vocabularies.Communication.v1.IsPhoneNumber"],
					{ "Bool" : "true" });
			}
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bIsLoggable) {
		test("addSapSemantics: unsupported sap:semantics, log = " + bIsLoggable, function () {
			var oLogMock = this.mock(jQuery.sap.log),
				oType = {
					"name" : "Foo",
					"property" : [
						{
							"name" : "Bar",
							"extensions" : [{
								"name" : "semantics",
								"value" : "*",
								"namespace" : sNamespace
							}]
						}
					]
				};

			// ensure that sap:semantics properties are available
			oType.property.forEach(function (oProperty) {
				Utils.liftSAPData(oProperty, "Property");
			});

			oLogMock.expects("isLoggable")
				.withExactArgs(jQuery.sap.log.Level.WARNING)
				.returns(bIsLoggable);
			oLogMock.expects("warning")
				// do not construct arguments in vain!
				.exactly(bIsLoggable ? 1 : 0)
				.withExactArgs("Unsupported sap:semantics: *", "Foo.Bar",
					"sap.ui.model.odata._ODataMetaModelUtils");

			// code under test
			Utils.addSapSemantics(oType);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bIsLoggable) {
		test("addSapSemantics: unsupported sap:semantics type, log = " + bIsLoggable, function () {
			var oLogMock = this.mock(jQuery.sap.log),
				oType = {
					"name" : "Foo",
					"property" : [
						{
							"name" : "Bar",
							"extensions" : [{
								"name" : "semantics",
								"value" : "tel;type=foo",
								"namespace" : sNamespace
							}]
						}
					]
				};

			// ensure that sap:semantics properties are available
			oType.property.forEach(function (oProperty) {
				Utils.liftSAPData(oProperty, "Property");
			});
			oLogMock.expects("isLoggable")
				.withExactArgs(jQuery.sap.log.Level.WARNING)
				.returns(bIsLoggable);
			oLogMock.expects("warning")
				// do not construct arguments in vain!
				.exactly(bIsLoggable ? 1 : 0)
				.withExactArgs("Unsupported type for sap:semantics: foo", "Foo.Bar",
					"sap.ui.model.odata._ODataMetaModelUtils");

			// code under test
			Utils.addSapSemantics(oType);
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
		test: "without v4 annotations",
		expectedTypeAnnotations: oContactAnnotationFromV2,
		expectedComplexTypeAnnotations: oContactAnnotationFromV2
	}].forEach(function (oFixture) {
		test("merge: addSapSemantics called " + oFixture.test, function () {
			var oData = clone(oDataSchema),
				oContact = oData.dataServices.schema[0].entityType[0],
				oCTContact = oData.dataServices.schema[0].complexType[0];

			this.spy(Utils, "addSapSemantics");

			// code under test
			Utils.merge(oFixture.annotations || {}, oData);

			// verify results
			deepEqual(oContact["com.sap.vocabularies.Communication.v1.Contact"],
				oFixture.expectedTypeAnnotations, "Contact annotations for EntityType");
			deepEqual(oCTContact["com.sap.vocabularies.Communication.v1.Contact"],
				oFixture.expectedComplexTypeAnnotations, "Contact annotations for ComplexType");

			equals(Utils.addSapSemantics.callCount, 9); // 4 complex + 5 entity types
			ok(Utils.addSapSemantics.calledWithExactly(oCTContact),
				"called addSapSemantics with ComplexType");
			ok(Utils.addSapSemantics.calledWithExactly(oContact),
				"called addSapSemantics with EntityType");

			// verify email and tel
			deepEqual(oContact.property[3/*EMail*/]
					["com.sap.vocabularies.Communication.v1.IsEmailAddress"],
				{ "Bool" : (oFixture.annotations ? "false" : "true") });
			deepEqual(oContact
					.property[20/*Tel*/]["com.sap.vocabularies.Communication.v1.IsPhoneNumber"],
				{ "Bool" : (oFixture.annotations ? "false" : "true") });
		});
	});

	//*********************************************************************************************
	test("addFilterRestriction: adding valid filter-restrictions", function () {
		var aFilterRestrictions,
			oLogMock = this.mock(jQuery.sap.log),
			oEntitySet = {},
			oProperty;

		oLogMock.expects("warning").never();

		[
			{i: "single-value", o: "SingleValue"},
			{i: "multi-value", o: "MultiValue"},
			{i: "interval", o: "SingleInterval"}
		].forEach(function (oFixture, i) {
			// prepare Property
			oProperty = {
				"name" : "Foo" + i,
				"sap:filter-restriction" : oFixture.i
			};

			//code under test
			Utils.addFilterRestriction(oProperty, oEntitySet);

			// check result
			aFilterRestrictions =
				oEntitySet["com.sap.vocabularies.Common.v1.FilterExpressionRestrictions"]

			ok(aFilterRestrictions, "FilterExpressionRestrictions are available");
			ok(Array.isArray(aFilterRestrictions), "FilterExpressionRestrictions is an array");
			deepEqual(aFilterRestrictions[i], {
				"Property" : { "PropertyPath" : "Foo" + i},
				"AllowedExpressions" : {
					"EnumMember" : "com.sap.vocabularies.Common.v1.FilterExpressionType/"
						+ oFixture.o
				}
			}, oFixture.i + " properly converted");
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bIsLoggable) {
		test("addFilterRestriction: unsupported sap:filter-restriction, log = " + bIsLoggable,
			function () {
				var oLogMock = this.mock(jQuery.sap.log),
					oEntitySet = { entityType : "Baz" },
					oProperty = {
						"name" : "Foo",
						"sap:filter-restriction" : "Bar"
					};

				oLogMock.expects("isLoggable")
					.withExactArgs(jQuery.sap.log.Level.WARNING)
					.returns(bIsLoggable);
				oLogMock.expects("warning")
					// do not construct arguments in vain!
					.exactly(bIsLoggable ? 1 : 0)
					.withExactArgs("Unsupported sap:filter-restriction: " + "Bar", "Baz.Foo",
						"sap.ui.model.odata._ODataMetaModelUtils");

				// code under test
				Utils.addFilterRestriction(oProperty, oEntitySet);

				deepEqual(oEntitySet, { entityType : "Baz" },
					"No v4 annotation created in case of unsupported value")
			}
		);
	});

	//*********************************************************************************************
	test("calculateEntitySetAnnotations: call addFilterRestriction", function () {
		var aSchemas = clone(oDataSchema).dataServices.schema,
			oEntitySet = aSchemas[0].entityContainer[0].entitySet[1], // ProductSet
			oEntityType = aSchemas[0].entityType[4], // Product
			oProperty = oEntityType.property[0]; // Product.Foo

		// prepare test data
		aSchemas[0].entityType.forEach(function (oEntityType) {
			Utils.liftSAPData(oEntityType);
			oEntityType.property.forEach(function (oProperty) {
				Utils.liftSAPData(oProperty);
			});
		});

		// Define expectations
		this.mock(Utils).expects("addFilterRestriction")
			.withExactArgs(oProperty, oEntitySet).returns("");

		// run code under test
		Utils.calculateEntitySetAnnotations(oEntitySet, oEntityType);
	});

	//*********************************************************************************************
	test("merge: addFilterRestriction called", function () {
		var oAnnotations = {
				"EntityContainer" : { "GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities" : {
					"ProductSet" : {
						"com.sap.vocabularies.Common.v1.FilterExpressionRestrictions" : [{
							"Property" : { "PropertyPath" : "Foo"},
							"AllowedExpressions" : {
								"EnumMember" : "com.sap.vocabularies.Common.v1." +
									"FilterExpressionType/MultiValue"
							}
						}, {
							"Property" : { "PropertyPath" : "Bar"},
							"AllowedExpressions" : {
								"EnumMember" : "com.sap.vocabularies.Common.v1." +
									"FilterExpressionType/SingleValue"
							}
						}]
					}
				}}
			},
			oData = clone(oDataSchema),
			oProductSet = oData.dataServices.schema[0].entityContainer[0].entitySet[1];

		// code under test
		Utils.merge({}, oData);

		// verify results
		deepEqual(oProductSet["com.sap.vocabularies.Common.v1.FilterExpressionRestrictions"],
			[{
				"Property" : { "PropertyPath" : "Foo"},
				"AllowedExpressions" : {
					"EnumMember" : "com.sap.vocabularies.Common.v1.FilterExpressionType/"
						+ "SingleInterval"
				}
			}],
			"no additional v4 annotations"
		);

		// with annotations
		oData = clone(oDataSchema),
		oProductSet = oData.dataServices.schema[0].entityContainer[0].entitySet[1];

		// code under test
		Utils.merge(oAnnotations, oData);

		// verify results
		deepEqual(oProductSet["com.sap.vocabularies.Common.v1.FilterExpressionRestrictions"],
			oAnnotations["EntityContainer"]["GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities"]["ProductSet"]
				["com.sap.vocabularies.Common.v1.FilterExpressionRestrictions"],
			"with additional v4 annotations"
		);

	});

});
