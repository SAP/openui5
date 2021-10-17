import Log from "sap/base/Log";
import _AnnotationHelperBasics from "sap/ui/model/odata/_AnnotationHelperBasics";
import Utils from "sap/ui/model/odata/_ODataMetaModelUtils";
var oContactAnnotationFromV2 = {
    "adr": {
        "code": { "Path": "Zip" },
        "country": { "Path": "Country" },
        "locality": { "Path": "City" },
        "pobox": { "Path": "PoBox" },
        "region": { "Path": "Region" },
        "street": { "Path": "Street" }
    },
    "bday": { "Path": "Birthday" },
    "email": [{
            "address": { "Path": "EMail" },
            "type": {
                "EnumMember": "com.sap.vocabularies.Communication.v1.ContactInformationType/" + "preferred"
            }
        }, {
            "address": { "Path": "EMail2" }
        }],
    "fn": { "Path": "Name" },
    "n": {
        "additional": { "Path": "MiddleName" },
        "given": { "Path": "FirstName" },
        "prefix": { "Path": "Honorific" },
        "suffix": { "Path": "Suffix" },
        "surname": { "Path": "LastName" }
    },
    "nickname": { "Path": "NickName" },
    "note": { "Path": "Note" },
    "org": { "Path": "Org" },
    "orgunit": { "Path": "OrgUnit" },
    "photo": { "Path": "Photo" },
    "role": { "Path": "OrgRole" },
    "tel": [{
            "type": {
                "EnumMember": "com.sap.vocabularies.Communication.v1.PhoneType/work " + "com.sap.vocabularies.Communication.v1.PhoneType/cell"
            },
            "uri": { "Path": "Tel" }
        }, {
            "type": {
                "EnumMember": "com.sap.vocabularies.Communication.v1.PhoneType/fax"
            },
            "uri": { "Path": "Tel2" }
        }, {
            "uri": { "Path": "Tel3" }
        }],
    "title": { "Path": "Title" }
}, oEventAnnotationFromV2 = {
    "class": { "Path": "Class" },
    "dtend": { "Path": "Dtend" },
    "dtstart": { "Path": "Dtstart" },
    "duration": { "Path": "Duration" },
    "fbtype": { "Path": "Fbtype" },
    "location": { "Path": "Location" },
    "status": { "Path": "Status" },
    "transp": { "Path": "Transp" },
    "wholeday": { "Path": "Wholeday" }
}, sInsertRestrictions = "Org.OData.Capabilities.V1.InsertRestrictions", oMessageAnnotationFromV2 = {
    "body": { "Path": "Body" },
    "from": { "Path": "From" },
    "received": { "Path": "Received" },
    "sender": { "Path": "Sender" },
    "subject": { "Path": "Subject" }
}, oTaskAnnotationFromV2 = {
    "completed": { "Path": "Completed" },
    "due": { "Path": "Due" },
    "percentcomplete": { "Path": "PercentComplete" },
    "priority": { "Path": "Priority" }
}, sNamespace = "http://www.sap.com/Protocols/SAPData", aContactProperties = [{
        "name": "Birthday",
        "type": "Edm.Date",
        "extensions": [{
                "name": "semantics",
                "value": "bday",
                "namespace": sNamespace
            }]
    }, {
        "name": "City",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "city",
                "namespace": sNamespace
            }]
    }, {
        "name": "Country",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "country",
                "namespace": sNamespace
            }]
    }, {
        "name": "EMail",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "email;type=pref",
                "namespace": sNamespace
            }]
    }, {
        "name": "EMail2",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "email",
                "namespace": sNamespace
            }]
    }, {
        "name": "FirstName",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "givenname",
                "namespace": sNamespace
            }]
    }, {
        "name": "Honorific",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "honorific",
                "namespace": sNamespace
            }]
    }, {
        "name": "LastName",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "familyname",
                "namespace": sNamespace
            }]
    }, {
        "name": "MiddleName",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "middlename",
                "namespace": sNamespace
            }]
    }, {
        "name": "Name",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "name",
                "namespace": sNamespace
            }]
    }, {
        "name": "NickName",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "nickname",
                "namespace": sNamespace
            }]
    }, {
        "name": "Note",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "note",
                "namespace": sNamespace
            }]
    }, {
        "name": "Org",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "org",
                "namespace": sNamespace
            }]
    }, {
        "name": "OrgRole",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "org-role",
                "namespace": sNamespace
            }]
    }, {
        "name": "OrgUnit",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "org-unit",
                "namespace": sNamespace
            }]
    }, {
        "name": "Photo",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "photo",
                "namespace": sNamespace
            }]
    }, {
        "name": "PoBox",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "pobox",
                "namespace": sNamespace
            }]
    }, {
        "name": "Region",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "region",
                "namespace": sNamespace
            }]
    }, {
        "name": "Street",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "street",
                "namespace": sNamespace
            }]
    }, {
        "name": "Suffix",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "suffix",
                "namespace": sNamespace
            }]
    }, {
        "name": "Tel",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "tel;type=work,cell",
                "namespace": sNamespace
            }]
    }, {
        "name": "Tel2",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "tel;type=fax",
                "namespace": sNamespace
            }]
    }, {
        "name": "Tel3",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "tel",
                "namespace": sNamespace
            }]
    }, {
        "name": "Title",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "title",
                "namespace": sNamespace
            }]
    }, {
        "name": "Zip",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "zip",
                "namespace": sNamespace
            }]
    }], aEventProperties = [{
        "name": "Class",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "class",
                "namespace": sNamespace
            }]
    }, {
        "name": "Dtend",
        "type": "Edm.DateTimeOffset",
        "extensions": [{
                "name": "semantics",
                "value": "dtend",
                "namespace": sNamespace
            }]
    }, {
        "name": "Dtstart",
        "type": "Edm.DateTimeOffset",
        "extensions": [{
                "name": "semantics",
                "value": "dtstart",
                "namespace": sNamespace
            }]
    }, {
        "name": "Duration",
        "type": "Edm.Duration",
        "extensions": [{
                "name": "semantics",
                "value": "duration",
                "namespace": sNamespace
            }]
    }, {
        "name": "Fbtype",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "fbtype",
                "namespace": sNamespace
            }]
    }, {
        "name": "Location",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "location",
                "namespace": sNamespace
            }]
    }, {
        "name": "Status",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "status",
                "namespace": sNamespace
            }]
    }, {
        "name": "Transp",
        "type": "Edm.Boolean",
        "extensions": [{
                "name": "semantics",
                "value": "transp",
                "namespace": sNamespace
            }]
    }, {
        "name": "Wholeday",
        "type": "Edm.Boolean",
        "extensions": [{
                "name": "semantics",
                "value": "wholeday",
                "namespace": sNamespace
            }]
    }], aMessageProperties = [{
        "name": "Body",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "body",
                "namespace": sNamespace
            }]
    }, {
        "name": "From",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "from",
                "namespace": sNamespace
            }]
    }, {
        "name": "Received",
        "type": "Edm.DateTimeOffset",
        "extensions": [{
                "name": "semantics",
                "value": "received",
                "namespace": sNamespace
            }]
    }, {
        "name": "Sender",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "sender",
                "namespace": sNamespace
            }]
    }, {
        "name": "Subject",
        "type": "Edm.String",
        "extensions": [{
                "name": "semantics",
                "value": "subject",
                "namespace": sNamespace
            }]
    }], aTaskProperties = [{
        "name": "Completed",
        "type": "Edm.DateTimeOffset",
        "extensions": [{
                "name": "semantics",
                "value": "completed",
                "namespace": sNamespace
            }]
    }, {
        "name": "Due",
        "type": "Edm.DateTimeOffset",
        "extensions": [{
                "name": "semantics",
                "value": "due",
                "namespace": sNamespace
            }]
    }, {
        "name": "PercentComplete",
        "type": "Edm.Byte",
        "extensions": [{
                "name": "semantics",
                "value": "percent-complete",
                "namespace": sNamespace
            }]
    }, {
        "name": "Priority",
        "type": "Edm.Byte",
        "extensions": [{
                "name": "semantics",
                "value": "priority",
                "namespace": sNamespace
            }]
    }], oContactType = {
    "name": "Contact",
    "property": aContactProperties
}, oEventType = {
    "name": "Event",
    "property": aEventProperties
}, oMessageType = {
    "name": "Message",
    "property": aMessageProperties
}, oTaskType = {
    "name": "Task",
    "property": aTaskProperties
}, oDataSchema = {
    "version": "1.0",
    "dataServices": {
        "dataServiceVersion": "2.0",
        "schema": [{
                "namespace": "GWSAMPLE_BASIC",
                "complexType": [{
                        "name": "CT_Contact",
                        "property": aContactProperties
                    }, {
                        "name": "CT_Event",
                        "property": aEventProperties
                    }, {
                        "name": "CT_Message",
                        "property": aMessageProperties
                    }, {
                        "name": "CT_Task",
                        "property": aTaskProperties
                    }],
                "entityType": [oContactType, oEventType, oMessageType, oTaskType, {
                        "name": "Product",
                        "property": [{
                                "name": "Foo",
                                "type": "Edm.DateTime",
                                "extensions": [{
                                        "name": "filter-restriction",
                                        "value": "interval",
                                        "namespace": sNamespace
                                    }]
                            }, {
                                "name": "Bar",
                                "type": "Edm.Byte"
                            }]
                    }],
                "entityContainer": [{
                        "name": "GWSAMPLE_BASIC_Entities",
                        "isDefaultEntityContainer": "true",
                        "entitySet": [{
                                "name": "ContactSet",
                                "entityType": "GWSAMPLE_BASIC.Contact",
                                "extensions": [{
                                        "name": "deletable-path",
                                        "value": "Deletable",
                                        "namespace": "http://www.sap.com/Protocols/SAPData"
                                    }, {
                                        "name": "updatable-path",
                                        "value": "Updatable",
                                        "namespace": "http://www.sap.com/Protocols/SAPData"
                                    }]
                            }, {
                                "name": "ProductSet",
                                "entityType": "GWSAMPLE_BASIC.Product"
                            }],
                        "associationSet": [],
                        "functionImport": [],
                        "extensions": []
                    }],
                "association": [],
                "extensions": []
            }]
    }
}, oAnnotations = {
    "GWSAMPLE_BASIC.Contact": {
        "com.sap.vocabularies.Communication.v1.Contact": {
            "fn": { "Path": "NameFromAnnotation" },
            "n": {
                "suffix": { "Path": "SuffixFromAnnotation" }
            },
            "nickname": { "Path": "NickNameFromAnnotation" }
        }
    },
    "GWSAMPLE_BASIC.CT_Contact": {
        "com.sap.vocabularies.Communication.v1.Contact": {
            "fn": { "Path": "NameFromAnnotation" },
            "adr": {
                "code": { "Path": "ZipFromAnnotation" }
            },
            "nickname": { "Path": "NickNameFromAnnotation" }
        }
    },
    "GWSAMPLE_BASIC.Message": {
        "com.sap.vocabularies.Communication.v1.Message": {
            "from": { "Path": "FromFromAnnotation" }
        }
    },
    "GWSAMPLE_BASIC.CT_Message": {
        "com.sap.vocabularies.Communication.v1.Message": {
            "from": { "Path": "FromFromAnnotation" }
        }
    },
    "propertyAnnotations": {
        "GWSAMPLE_BASIC.Contact": {
            "EMail": {
                "com.sap.vocabularies.Communication.v1.IsEmailAddress": {
                    "Bool": "false"
                }
            },
            "Tel": {
                "com.sap.vocabularies.Communication.v1.IsPhoneNumber": {
                    "Bool": "false"
                }
            }
        }
    },
    "EntityContainer": {
        "GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities": {}
    }
}, sLoggingModule = "sap.ui.model.odata.ODataMetaModel";
function clone(o) {
    return JSON.parse(JSON.stringify(o));
}
QUnit.module("sap.ui.model.odata._ODataMetaModelUtils", {
    before: function () {
        this.__ignoreIsolatedCoverage__ = true;
    },
    beforeEach: function () {
        this.iOldLogLevel = Log.getLevel(sLoggingModule);
        Log.setLevel(Log.Level.ERROR, sLoggingModule);
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
    },
    afterEach: function () {
        Log.setLevel(this.iOldLogLevel, sLoggingModule);
    }
});
[
    {
        sOutput: "com.sap.vocabularies.Communication.v1.PhoneType/cell",
        sSemantics: "tel",
        sTypes: "cell"
    },
    {
        sOutput: "com.sap.vocabularies.Communication.v1.PhoneType/fax",
        sSemantics: "tel",
        sTypes: "fax"
    },
    {
        sOutput: "com.sap.vocabularies.Communication.v1.PhoneType/home",
        sSemantics: "tel",
        sTypes: "home"
    },
    {
        sOutput: "com.sap.vocabularies.Communication.v1.PhoneType/preferred",
        sSemantics: "tel",
        sTypes: "pref"
    },
    {
        sOutput: "com.sap.vocabularies.Communication.v1.PhoneType/video",
        sSemantics: "tel",
        sTypes: "video"
    },
    {
        sOutput: "com.sap.vocabularies.Communication.v1.PhoneType/voice",
        sSemantics: "tel",
        sTypes: "voice"
    },
    {
        sOutput: "com.sap.vocabularies.Communication.v1.PhoneType/work",
        sSemantics: "tel",
        sTypes: "work"
    },
    {
        oExpectedMessage: "pager",
        sOutput: "",
        sSemantics: "tel",
        sTypes: "pager"
    },
    {
        oExpectedMessage: "text",
        sOutput: "",
        sSemantics: "tel",
        sTypes: "text"
    },
    {
        oExpectedMessage: "textphone",
        sOutput: "",
        sSemantics: "tel",
        sTypes: "textphone"
    },
    {
        sOutput: "com.sap.vocabularies.Communication.v1.PhoneType/cell" + " com.sap.vocabularies.Communication.v1.PhoneType/home" + " com.sap.vocabularies.Communication.v1.PhoneType/work",
        sSemantics: "tel",
        sTypes: "cell,home,work"
    },
    {
        oExpectedMessage: "xyz",
        sOutput: "com.sap.vocabularies.Communication.v1.PhoneType/cell" + " com.sap.vocabularies.Communication.v1.PhoneType/work",
        sSemantics: "tel",
        sTypes: "cell,xyz,work"
    },
    {
        oExpectedMessage: "xyz",
        sOutput: "com.sap.vocabularies.Communication.v1.PhoneType/home",
        sSemantics: "tel",
        sTypes: "xyz,home"
    },
    {
        sOutput: "com.sap.vocabularies.Communication.v1.ContactInformationType/home",
        sSemantics: "email",
        sTypes: "home"
    },
    {
        sOutput: "com.sap.vocabularies.Communication.v1.ContactInformationType/preferred",
        sSemantics: "email",
        sTypes: "pref"
    },
    {
        sOutput: "com.sap.vocabularies.Communication.v1.ContactInformationType/work",
        sSemantics: "email",
        sTypes: "work"
    },
    {
        sOutput: "com.sap.vocabularies.Communication.v1.ContactInformationType/preferred" + " com.sap.vocabularies.Communication.v1.ContactInformationType/work",
        sSemantics: "email",
        sTypes: "pref,work"
    },
    {
        oExpectedMessage: "xyz",
        sOutput: "com.sap.vocabularies.Communication.v1.ContactInformationType/preferred" + " com.sap.vocabularies.Communication.v1.ContactInformationType/work",
        sSemantics: "email",
        sTypes: "pref,xyz,work"
    },
    {
        oExpectedMessage: "xyz",
        sOutput: "com.sap.vocabularies.Communication.v1.ContactInformationType/home",
        sSemantics: "email",
        sTypes: "xyz,home"
    }
].forEach(function (oFixture) {
    var sSemanticsValue = oFixture.sSemantics + ";type=" + oFixture.sTypes;
    QUnit.test("getV4TypesForV2Semantics: " + sSemanticsValue, function (assert) {
        var bLogExpected = oFixture.sOutput === "" || oFixture.oExpectedMessage, oType = { "name": "Foo" }, oProperty = { "name": "bar", "sap:semantics": sSemanticsValue };
        this.oLogMock.expects("isLoggable").exactly(bLogExpected ? 1 : 0).withExactArgs(Log.Level.WARNING, sLoggingModule).returns(true);
        this.oLogMock.expects("warning").exactly(bLogExpected ? 1 : 0).withExactArgs("Unsupported type for sap:semantics: " + oFixture.oExpectedMessage, "Foo.bar", sLoggingModule);
        assert.strictEqual(Utils.getV4TypesForV2Semantics(oFixture.sSemantics, oFixture.sTypes, oProperty, oType), oFixture.sOutput, sSemanticsValue);
    });
});
QUnit.test("getV4TypesForV2Semantics: ignores unknown semantic with type", function (assert) {
    var sSemantic = "tle;type=cell", oProperty = { "name": "bar", "sap:semantics": sSemantic }, oType = { "name": "Foo" };
    assert.strictEqual(Utils.getV4TypesForV2Semantics("tle", "cell", oProperty, oType), "", sSemantic);
});
QUnit.test("addSapSemantics: url", function (assert) {
    var oType = {
        "name": "BusinessPartner",
        "property": [{
                "name": "WebAddress",
                "sap:semantics": "url"
            }]
    };
    Utils.addSapSemantics(oType);
    assert.deepEqual(oType.property[0]["Org.OData.Core.V1.IsURL"], { "Bool": "true" });
});
[{
        expectedAnnotations: { "Contact": oContactAnnotationFromV2 },
        type: oContactType
    }, {
        expectedAnnotations: { "Event": oEventAnnotationFromV2 },
        type: oEventType
    }, {
        expectedAnnotations: { "Message": oMessageAnnotationFromV2 },
        type: oMessageType
    }, {
        expectedAnnotations: { "Task": oTaskAnnotationFromV2 },
        type: oTaskType
    }].forEach(function (oFixture) {
    var sTypeName = oFixture.type.name;
    QUnit.test("addSapSemantics: " + sTypeName, function (assert) {
        var oType = clone(oFixture.type);
        oType.property.forEach(function (oProperty) {
            Utils.liftSAPData(oProperty, "Property");
        });
        Utils.addSapSemantics(oType);
        ["Contact", "Event", "Message", "Task"].forEach(function (sAnnotationTerm) {
            assert.deepEqual(oType["com.sap.vocabularies.Communication.v1." + sAnnotationTerm], oFixture.expectedAnnotations[sAnnotationTerm], sAnnotationTerm + " is as expected");
        });
        if (sTypeName === "Contact") {
            assert.deepEqual(oType.property[3]["com.sap.vocabularies.Communication.v1.IsEmailAddress"], { "Bool": "true" });
            assert.deepEqual(oType.property[4]["com.sap.vocabularies.Communication.v1.IsEmailAddress"], { "Bool": "true" });
            assert.deepEqual(oType.property[20]["com.sap.vocabularies.Communication.v1.IsPhoneNumber"], { "Bool": "true" });
            assert.deepEqual(oType.property[22]["com.sap.vocabularies.Communication.v1.IsPhoneNumber"], { "Bool": "true" });
        }
    });
});
[{
        semantics: "fiscalyear",
        term: "com.sap.vocabularies.Common.v1.IsFiscalYear"
    }, {
        semantics: "fiscalyearperiod",
        term: "com.sap.vocabularies.Common.v1.IsFiscalYearPeriod"
    }, {
        semantics: "year",
        term: "com.sap.vocabularies.Common.v1.IsCalendarYear"
    }, {
        semantics: "yearmonth",
        term: "com.sap.vocabularies.Common.v1.IsCalendarYearMonth"
    }, {
        semantics: "yearmonthday",
        term: "com.sap.vocabularies.Common.v1.IsCalendarDate"
    }, {
        semantics: "yearquarter",
        term: "com.sap.vocabularies.Common.v1.IsCalendarYearQuarter"
    }, {
        semantics: "yearweek",
        term: "com.sap.vocabularies.Common.v1.IsCalendarYearWeek"
    }].forEach(function (oFixture) {
    var sSemantics = oFixture.semantics, sTerm = oFixture.term;
    QUnit.test("addSapSemantics: " + sSemantics, function (assert) {
        var oType = {
            "name": "Type",
            "property": [{
                    "name": "Property",
                    "sap:semantics": sSemantics,
                    "type": "Edm.String"
                }]
        }, oExpectedResult = clone(oType);
        Utils.addSapSemantics(oType);
        oExpectedResult.property[0][sTerm] = { "Bool": "true" };
        assert.deepEqual(oType, oExpectedResult);
    });
});
[false, true].forEach(function (bIsLoggable) {
    QUnit.test("addSapSemantics: unsupported sap:semantics, log = " + bIsLoggable, function (assert) {
        var oType = {
            "name": "Foo",
            "property": [
                {
                    "name": "Bar",
                    "extensions": [{
                            "name": "semantics",
                            "value": "*",
                            "namespace": sNamespace
                        }]
                }
            ]
        };
        oType.property.forEach(function (oProperty) {
            Utils.liftSAPData(oProperty, "Property");
        });
        this.oLogMock.expects("isLoggable").withExactArgs(Log.Level.WARNING, sLoggingModule).returns(bIsLoggable);
        this.oLogMock.expects("warning").exactly(bIsLoggable ? 1 : 0).withExactArgs("Unsupported sap:semantics: *", "Foo.Bar", sLoggingModule);
        Utils.addSapSemantics(oType);
    });
});
[false, true].forEach(function (bIsLoggable) {
    QUnit.test("addSapSemantics: unsupported sap:semantics type, log = " + bIsLoggable, function (assert) {
        var oType = {
            "name": "Foo",
            "property": [
                {
                    "name": "Bar",
                    "extensions": [{
                            "name": "semantics",
                            "value": "tel;type=foo",
                            "namespace": sNamespace
                        }]
                }
            ]
        };
        oType.property.forEach(function (oProperty) {
            Utils.liftSAPData(oProperty, "Property");
        });
        this.oLogMock.expects("isLoggable").withExactArgs(Log.Level.WARNING, sLoggingModule).returns(bIsLoggable);
        this.oLogMock.expects("warning").exactly(bIsLoggable ? 1 : 0).withExactArgs("Unsupported type for sap:semantics: foo", "Foo.Bar", sLoggingModule);
        Utils.addSapSemantics(oType);
    });
});
[{
        test: "and V4 wins",
        annotations: oAnnotations,
        expectedTypeAnnotations: oAnnotations["GWSAMPLE_BASIC.Contact"]["com.sap.vocabularies.Communication.v1.Contact"],
        expectedComplexTypeAnnotations: oAnnotations["GWSAMPLE_BASIC.CT_Contact"]["com.sap.vocabularies.Communication.v1.Contact"]
    }, {
        test: "without V4 annotations",
        expectedTypeAnnotations: oContactAnnotationFromV2,
        expectedComplexTypeAnnotations: oContactAnnotationFromV2
    }].forEach(function (oFixture) {
    QUnit.test("merge: addSapSemantics called " + oFixture.test, function (assert) {
        var oData = clone(oDataSchema), oContact = oData.dataServices.schema[0].entityType[0], oCTContact = oData.dataServices.schema[0].complexType[0];
        this.spy(Utils, "addSapSemantics");
        Utils.merge(oFixture.annotations || {}, oData);
        assert.deepEqual(oContact["com.sap.vocabularies.Communication.v1.Contact"], oFixture.expectedTypeAnnotations, "Contact annotations for EntityType");
        assert.deepEqual(oCTContact["com.sap.vocabularies.Communication.v1.Contact"], oFixture.expectedComplexTypeAnnotations, "Contact annotations for ComplexType");
        assert.strictEqual(Utils.addSapSemantics.callCount, 9);
        assert.ok(Utils.addSapSemantics.calledWithExactly(oCTContact), "called addSapSemantics with ComplexType");
        assert.ok(Utils.addSapSemantics.calledWithExactly(oContact), "called addSapSemantics with EntityType");
        assert.deepEqual(oContact.property[3]["com.sap.vocabularies.Communication.v1.IsEmailAddress"], { "Bool": (oFixture.annotations ? "false" : "true") });
        assert.deepEqual(oContact.property[20]["com.sap.vocabularies.Communication.v1.IsPhoneNumber"], { "Bool": (oFixture.annotations ? "false" : "true") });
    });
});
QUnit.test("merge: order of visiting nodes", function (assert) {
    var oLift0, oLift1, oVisitAssociation0, oVisitAssociation1, oVisitComplexType0, oVisitComplexType1, oVisitEntityContainer0, oVisitEntityContainer1, oVisitEntityType0, oVisitEntityType1, oAnnotations = {}, oComplexType = { property: "~property" }, oEntityContainer = {
        associationSet: "~associationSet",
        entitySet: "~entitySet",
        functionImport: "~functionImport"
    }, oSchema0 = {}, oSchema1 = {}, aSchemas = [oSchema0, oSchema1], oData = {
        dataServices: {
            schema: aSchemas
        }
    }, oUtilsMock = this.mock(Utils);
    oLift0 = oUtilsMock.expects("liftSAPData").withExactArgs(sinon.match.same(oSchema0));
    oVisitAssociation0 = oUtilsMock.expects("visitParents").withExactArgs(sinon.match.same(oSchema0), sinon.match.same(oAnnotations), "association", sinon.match.func);
    oVisitComplexType0 = oUtilsMock.expects("visitParents").withExactArgs(sinon.match.same(oSchema0), sinon.match.same(oAnnotations), "complexType", sinon.match.func);
    oVisitEntityType0 = oUtilsMock.expects("visitParents").withExactArgs(sinon.match.same(oSchema0), sinon.match.same(oAnnotations), "entityType", sinon.match.same(Utils.visitEntityType));
    oLift1 = oUtilsMock.expects("liftSAPData").withExactArgs(sinon.match.same(oSchema1));
    oVisitAssociation1 = oUtilsMock.expects("visitParents").withExactArgs(sinon.match.same(oSchema1), sinon.match.same(oAnnotations), "association", sinon.match.func);
    oVisitComplexType1 = oUtilsMock.expects("visitParents").withExactArgs(sinon.match.same(oSchema1), sinon.match.same(oAnnotations), "complexType", sinon.match.func);
    oVisitEntityType1 = oUtilsMock.expects("visitParents").withExactArgs(sinon.match.same(oSchema1), sinon.match.same(oAnnotations), "entityType", sinon.match.same(Utils.visitEntityType));
    oVisitEntityContainer0 = oUtilsMock.expects("visitParents").withExactArgs(sinon.match.same(oSchema0), sinon.match.same(oAnnotations), "entityContainer", sinon.match.func);
    oVisitEntityContainer1 = oUtilsMock.expects("visitParents").withExactArgs(sinon.match.same(oSchema1), sinon.match.same(oAnnotations), "entityContainer", sinon.match.func);
    Utils.merge(oAnnotations, oData);
    assert.ok(oVisitAssociation0.calledAfter(oLift0));
    assert.ok(oVisitComplexType0.calledAfter(oVisitAssociation0));
    assert.ok(oVisitEntityType0.calledAfter(oVisitComplexType0));
    assert.ok(oLift1.calledAfter(oVisitEntityType0));
    assert.ok(oVisitAssociation1.calledAfter(oLift1));
    assert.ok(oVisitComplexType1.calledAfter(oVisitAssociation1));
    assert.ok(oVisitEntityType1.calledAfter(oVisitComplexType1));
    assert.ok(oVisitEntityContainer0.calledAfter(oVisitEntityType1));
    assert.ok(oVisitEntityContainer1.calledAfter(oVisitEntityContainer0));
    oUtilsMock.expects("visitChildren").withExactArgs("~end", "~mChildAnnotations");
    oVisitAssociation0.args[0][3]({ end: "~end" }, "~mChildAnnotations");
    oUtilsMock.expects("visitChildren").withExactArgs("~property", "~mChildAnnotations", "Property");
    oUtilsMock.expects("addSapSemantics").withExactArgs(sinon.match.same(oComplexType));
    oVisitComplexType0.args[0][3](oComplexType, "~mChildAnnotations");
    oUtilsMock.expects("visitChildren").withExactArgs("~associationSet", "~mChildAnnotations");
    oUtilsMock.expects("visitChildren").withExactArgs("~entitySet", "~mChildAnnotations", "EntitySet", sinon.match.same(aSchemas));
    oUtilsMock.expects("visitChildren").withExactArgs("~functionImport", "~mChildAnnotations", "", null, sinon.match.func);
    oVisitEntityContainer0.args[0][3](oEntityContainer, "~mChildAnnotations");
});
QUnit.test("addFilterRestriction: adding valid filter-restrictions", function (assert) {
    var aFilterRestrictions, oEntitySet = {}, oProperty;
    [
        { i: "single-value", o: "SingleValue" },
        { i: "multi-value", o: "MultiValue" },
        { i: "interval", o: "SingleInterval" }
    ].forEach(function (oFixture, i) {
        oProperty = {
            "name": "Foo" + i,
            "sap:filter-restriction": oFixture.i
        };
        Utils.addFilterRestriction(oProperty, oEntitySet);
        aFilterRestrictions = oEntitySet["com.sap.vocabularies.Common.v1.FilterExpressionRestrictions"];
        assert.ok(aFilterRestrictions, "FilterExpressionRestrictions are available");
        assert.ok(Array.isArray(aFilterRestrictions), "FilterExpressionRestrictions is an array");
        assert.deepEqual(aFilterRestrictions[i], {
            "Property": { "PropertyPath": "Foo" + i },
            "AllowedExpressions": {
                "EnumMember": "com.sap.vocabularies.Common.v1.FilterExpressionType/" + oFixture.o
            }
        }, oFixture.i + " properly converted");
    });
});
[false, true].forEach(function (bIsLoggable) {
    QUnit.test("addFilterRestriction: unsupported sap:filter-restriction, log = " + bIsLoggable, function (assert) {
        var oEntitySet = { entityType: "Baz" }, oProperty = {
            "name": "Foo",
            "sap:filter-restriction": "Bar"
        };
        this.oLogMock.expects("isLoggable").withExactArgs(Log.Level.WARNING, sLoggingModule).returns(bIsLoggable);
        this.oLogMock.expects("warning").exactly(bIsLoggable ? 1 : 0).withExactArgs("Unsupported sap:filter-restriction: " + "Bar", "Baz.Foo", sLoggingModule);
        Utils.addFilterRestriction(oProperty, oEntitySet);
        assert.deepEqual(oEntitySet, { entityType: "Baz" }, "No V4 annotation created in case of unsupported value");
    });
});
QUnit.test("calculateEntitySetAnnotations: call addFilterRestriction", function (assert) {
    var aSchemas = clone(oDataSchema).dataServices.schema, oEntitySet = aSchemas[0].entityContainer[0].entitySet[1], oEntityType = aSchemas[0].entityType[4], oProperty = oEntityType.property[0];
    aSchemas[0].entityType.forEach(function (oEntityType) {
        Utils.liftSAPData(oEntityType);
        oEntityType.property.forEach(function (oProperty) {
            Utils.liftSAPData(oProperty);
        });
    });
    this.mock(Utils).expects("addFilterRestriction").withExactArgs(sinon.match.same(oProperty), oEntitySet).returns("");
    Utils.calculateEntitySetAnnotations(oEntitySet, oEntityType);
});
QUnit.test("merge: addFilterRestriction called", function (assert) {
    var oAnnotations = {
        "EntityContainer": { "GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities": {
                "ProductSet": {
                    "com.sap.vocabularies.Common.v1.FilterExpressionRestrictions": [{
                            "Property": { "PropertyPath": "Foo" },
                            "AllowedExpressions": {
                                "EnumMember": "com.sap.vocabularies.Common.v1." + "FilterExpressionType/MultiValue"
                            }
                        }, {
                            "Property": { "PropertyPath": "Bar" },
                            "AllowedExpressions": {
                                "EnumMember": "com.sap.vocabularies.Common.v1." + "FilterExpressionType/SingleValue"
                            }
                        }]
                }
            } }
    }, oData = clone(oDataSchema), oProductSet = oData.dataServices.schema[0].entityContainer[0].entitySet[1];
    Utils.merge({}, oData);
    assert.deepEqual(oProductSet["com.sap.vocabularies.Common.v1.FilterExpressionRestrictions"], [{
            "Property": { "PropertyPath": "Foo" },
            "AllowedExpressions": {
                "EnumMember": "com.sap.vocabularies.Common.v1.FilterExpressionType/" + "SingleInterval"
            }
        }], "no additional V4 annotations");
    oData = clone(oDataSchema);
    oProductSet = oData.dataServices.schema[0].entityContainer[0].entitySet[1];
    Utils.merge(oAnnotations, oData);
    assert.deepEqual(oProductSet["com.sap.vocabularies.Common.v1.FilterExpressionRestrictions"], oAnnotations["EntityContainer"]["GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities"]["ProductSet"]["com.sap.vocabularies.Common.v1.FilterExpressionRestrictions"], "with additional V4 annotations");
});
QUnit.test("Non-Insertable NavigationProperty found", function (assert) {
    var oEntitySet = {}, oEntityType = {
        navigationProperty: [
            { "sap:creatable": "true" },
            { "sap:bar": "false" }
        ]
    }, oUtilsMock = this.mock(Utils);
    oUtilsMock.expects("handleCreatableNavigationProperty").withExactArgs(sinon.match.same(oEntitySet), sinon.match.same(oEntityType.navigationProperty[0]));
    oUtilsMock.expects("handleCreatableNavigationProperty").withExactArgs(sinon.match.same(oEntitySet), sinon.match.same(oEntityType.navigationProperty[1]));
    Utils.calculateEntitySetAnnotations(oEntitySet, oEntityType);
});
[undefined, {
        "Insertable": { "Bool": "false" }
    }, {
        "NonInsertableNavigationProperties": [{
                "NavigationPropertyPath": "foo"
            }]
    }, {
        "Insertable": { "Bool": "false" },
        "NonInsertableNavigationProperties": [{
                "NavigationPropertyPath": "bar"
            }]
    }].forEach(function (oInsertRestrictions) {
    [{
            navigationProperty: { "name": "creatableTrue", "sap:creatable": "true" },
            expectedNewNonInsertableNavigationProperty: undefined
        }, {
            navigationProperty: { "name": "creatableFalse", "sap:creatable": "false" },
            expectedNewNonInsertableNavigationProperty: {
                "NavigationPropertyPath": "creatableFalse"
            }
        }, {
            navigationProperty: {
                "name": "creatablePath",
                "sap:creatable-path": "AnyPathExpression"
            },
            expectedNewNonInsertableNavigationProperty: {
                "If": [{
                        "Not": { "Path": "AnyPathExpression" }
                    }, {
                        "NavigationPropertyPath": "creatablePath"
                    }]
            }
        }, {
            navigationProperty: {
                "name": "inconsistent",
                "sap:creatable": "false",
                "sap:creatable-path": "AnyPathExpression"
            },
            expectedNewNonInsertableNavigationProperty: {
                "NavigationPropertyPath": "inconsistent"
            },
            withWarning: true
        }].forEach(function (oFixture) {
        var oEntitySet = {
            "entityType": "mySchema.Type"
        }, oNavigationProperty = oFixture.navigationProperty;
        if (oInsertRestrictions) {
            oEntitySet[sInsertRestrictions] = oInsertRestrictions;
        }
        QUnit.test("handleCreatableNavigationProperty: InsertRestrictions: " + JSON.stringify(oInsertRestrictions) + "; property '" + oNavigationProperty.name + "'", function (assert) {
            var oExpectedEntitySet = JSON.parse(JSON.stringify(oEntitySet)), oExpectedInsertRestrictions, aNavigationProperties, oNewProperty = oFixture.expectedNewNonInsertableNavigationProperty;
            if (oNewProperty) {
                oExpectedInsertRestrictions = oExpectedEntitySet[sInsertRestrictions] = oExpectedEntitySet[sInsertRestrictions] || {};
                aNavigationProperties = oExpectedInsertRestrictions["NonInsertableNavigationProperties"] = oExpectedInsertRestrictions["NonInsertableNavigationProperties"] || [];
                aNavigationProperties.push(oNewProperty);
            }
            if (oFixture.withWarning) {
                this.oLogMock.expects("warning").withExactArgs("Inconsistent service", "Use either 'sap:creatable' or 'sap:creatable-path'" + " at navigation property 'mySchema.Type/inconsistent'", sLoggingModule);
            }
            Utils.handleCreatableNavigationProperty(oEntitySet, oNavigationProperty);
            assert.deepEqual(oEntitySet, oExpectedEntitySet);
        });
    });
});
[{
        name: "deletable",
        expectedProperty: "Deletable",
        expectedTerm: "Org.OData.Capabilities.V1.DeleteRestrictions"
    }, {
        name: "deletable-path",
        expectedProperty: "Deletable",
        expectedTerm: "Org.OData.Capabilities.V1.DeleteRestrictions"
    }, {
        name: "updatable",
        expectedProperty: "Updatable",
        expectedTerm: "Org.OData.Capabilities.V1.UpdateRestrictions"
    }, {
        name: "updatable-path",
        expectedProperty: "Updatable",
        expectedTerm: "Org.OData.Capabilities.V1.UpdateRestrictions"
    }].forEach(function (oFixture) {
    QUnit.test("addV4Annotation: " + oFixture.name, function (assert) {
        var oEntitySet = {}, oExtension = {
            name: oFixture.name
        }, sTypeClass = "EntitySet";
        this.mock(Utils).expects("handleXableAndXablePath").withExactArgs(sinon.match.same(oEntitySet), sinon.match.same(oExtension), sTypeClass, oFixture.expectedTerm, oFixture.expectedProperty);
        Utils.addV4Annotation(oEntitySet, oExtension, sTypeClass);
    });
});
[{
        extension: { name: "deletable", value: "false" },
        property: "Deletable",
        term: "Org.OData.Capabilities.V1.DeleteRestrictions",
        expectedValue: { "Deletable": { "Bool": "false" } }
    }, {
        extension: { name: "deletable", value: "true" },
        property: "Deletable",
        term: "Org.OData.Capabilities.V1.DeleteRestrictions",
        expectedValue: undefined
    }, {
        extension: { name: "deletable-path", value: "AnyPathExpression" },
        property: "Deletable",
        term: "Org.OData.Capabilities.V1.DeleteRestrictions",
        expectedValue: { "Deletable": { "Path": "AnyPathExpression" } }
    }].forEach(function (oFixture) {
    var oExtension = oFixture.extension;
    QUnit.test("handleXableAndXablePath: " + JSON.stringify(oExtension), function (assert) {
        var oEntitySet = {};
        oEntitySet["sap:" + oExtension.name] = oExtension.value;
        Utils.handleXableAndXablePath(oEntitySet, oExtension, "EntitySet", oFixture.term, oFixture.property);
        assert.deepEqual(oEntitySet[oFixture.term], oFixture.expectedValue);
    });
});
QUnit.test("handleXableAndXablePath: inconsistent service", function (assert) {
    var oEntitySet = {
        "name": "Foo.Bar",
        "sap:deletable": "foo",
        "sap:deletable-path": "bar"
    }, sTerm = "Org.OData.Capabilities.V1.DeleteRestrictions";
    this.oLogMock.expects("warning").withExactArgs("Inconsistent service", "Use either 'sap:deletable' or 'sap:deletable-path' at entity set 'Foo.Bar'", sLoggingModule);
    Utils.handleXableAndXablePath(oEntitySet, {}, "EntitySet", sTerm, "Deletable");
    assert.deepEqual(oEntitySet[sTerm], { "Deletable": { "Bool": "false" } });
});
QUnit.test("handleXableAndXablePath: with type Property", function (assert) {
    var oExtension = { name: "updatable-path", value: "AnyPathExpression" }, oProperty = {
        "name": "foo",
        "sap:updatable-path": "AnyPathExpression"
    };
    Utils.handleXableAndXablePath(oProperty, oExtension, "Property", "Org.OData.Capabilities.V1.UpdateRestrictions", "Updatable");
    assert.notOk("Org.OData.Capabilities.V1.UpdateRestrictions" in oProperty);
});
[{
        role: "dimension",
        term: "com.sap.vocabularies.Analytics.v1.Dimension"
    }, {
        role: "measure",
        term: "com.sap.vocabularies.Analytics.v1.Measure"
    }, {
        role: "foo",
        term: "must.not.exist"
    }].forEach(function (oFixture) {
    var sRole = oFixture.role;
    QUnit.test("addV4Annotation: sap:aggregation-role = " + sRole, function (assert) {
        var oExtension = { name: "aggregation-role", value: sRole }, oProperty = { name: "Foo.Bar", "sap:aggregation-role": sRole };
        Utils.addV4Annotation(oProperty, oExtension, "Property");
        assert.deepEqual(oProperty[oFixture.term], sRole === "foo" ? undefined : { "Bool": "true" });
    });
});
QUnit.test("addUnitAnnotations", function (assert) {
    var oAnnotationHelperBasicsMock = this.mock(_AnnotationHelperBasics), oMetaModel = { getProperty: function () { } }, oMetaModelMock = this.mock(oMetaModel), sPathToEntity0 = "/dataServices/schema/0/entityType/0", sPathToEntity1 = "/dataServices/schema/1/entityType/0", sTargetEntityPath = "/dataServices/schema/0/entityType/1", sTargetPropertyCode = sTargetEntityPath + "/property/0", sTargetPropertyMeasure = sTargetEntityPath + "/property/1", aSchemas = [{
            complexType: [{
                    $path: "/dataServices/schema/0/complexType/0",
                    property: [{
                            name: "Price",
                            "sap:unit": "currency/Code"
                        }]
                }, {
                    property: [{
                            name: "Code",
                            "sap:semantics": "currency-code"
                        }]
                }],
            entityType: [{
                    $path: sPathToEntity0,
                    property: [{
                            name: "ID"
                        }, {
                            name: "Currency",
                            "sap:unit": "toProduct/Code"
                        }, {
                            name: "Price",
                            "sap:unit": "PriceCode",
                            "Org.OData.Measures.V1.ISOCurrency": { Path: "AnnotationsPriceCode" }
                        }, {
                            name: "missingTarget",
                            "sap:unit": "foo/bar"
                        }, {
                            name: "unresolvedTarget",
                            "sap:unit": "foo2/bar2"
                        }, {
                            name: "PriceCode",
                            "sap:semantics": "currency-code"
                        }]
                }, {
                    $path: sTargetEntityPath,
                    property: [{
                            name: "Code",
                            "sap:semantics": "currency-code"
                        }, {
                            name: "Measure",
                            "sap:semantics": "unit-of-measure"
                        }]
                }, {}]
        }, {
            entityType: [{
                    $path: sPathToEntity1,
                    property: [{
                            name: "Length",
                            "sap:unit": "toProduct/Measure"
                        }, {
                            name: "Width",
                            "sap:unit": "WidthUnit",
                            "Org.OData.Measures.V1.Unit": { Path: "AnnotationsWidthUnit" }
                        }, {
                            name: "WidthUnit",
                            "sap:semantics": "unit-of-measure"
                        }]
                }]
        }, {}];
    oAnnotationHelperBasicsMock.expects("followPath").withExactArgs(sinon.match(function (oInterface) {
        return oInterface.getModel() === oMetaModel && oInterface.getPath() === "/dataServices/schema/0/complexType/0";
    }), { Path: "currency/Code" }).returns({ resolvedPath: "/dataServices/schema/0/complexType/1/property/0" });
    oAnnotationHelperBasicsMock.expects("followPath").withExactArgs(sinon.match(function (oInterface) {
        return oInterface.getModel() === oMetaModel && oInterface.getPath() === sPathToEntity0;
    }), { Path: "toProduct/Code" }).returns({ resolvedPath: sTargetPropertyCode });
    oAnnotationHelperBasicsMock.expects("followPath").withExactArgs(sinon.match(function (oInterface) {
        return oInterface.getModel() === oMetaModel && oInterface.getPath() === sPathToEntity0;
    }), { Path: "PriceCode" }).returns({ resolvedPath: "/dataServices/schema/0/entityType/0/property/5" });
    oAnnotationHelperBasicsMock.expects("followPath").withExactArgs(sinon.match(function (oInterface) {
        return oInterface.getModel() === oMetaModel && oInterface.getPath() === sPathToEntity1;
    }), { Path: "toProduct/Measure" }).returns({ resolvedPath: sTargetPropertyMeasure });
    oAnnotationHelperBasicsMock.expects("followPath").withExactArgs(sinon.match(function (oInterface) {
        return oInterface.getModel() === oMetaModel && oInterface.getPath() === sPathToEntity0;
    }), { Path: "foo/bar" }).returns(undefined);
    oAnnotationHelperBasicsMock.expects("followPath").withExactArgs(sinon.match(function (oInterface) {
        return oInterface.getModel() === oMetaModel && oInterface.getPath() === sPathToEntity0;
    }), { Path: "foo2/bar2" }).returns({});
    oAnnotationHelperBasicsMock.expects("followPath").withExactArgs(sinon.match(function (oInterface) {
        return oInterface.getModel() === oMetaModel && oInterface.getPath() === "/dataServices/schema/1/entityType/0";
    }), { Path: "WidthUnit" }).returns({ resolvedPath: "/dataServices/schema/1/entityType/0/property/2" });
    oMetaModelMock.expects("getProperty").withExactArgs("/dataServices/schema/0/complexType/1/property/0").returns(aSchemas[0].complexType[1].property[0]);
    oMetaModelMock.expects("getProperty").withExactArgs(sTargetPropertyCode).returns(aSchemas[0].entityType[1].property[0]);
    oMetaModelMock.expects("getProperty").withExactArgs("/dataServices/schema/0/entityType/0/property/5").returns(aSchemas[0].entityType[0].property[5]);
    oMetaModelMock.expects("getProperty").withExactArgs(sTargetPropertyMeasure).returns(aSchemas[0].entityType[1].property[1]);
    oMetaModelMock.expects("getProperty").withExactArgs("/dataServices/schema/1/entityType/0/property/2").returns(aSchemas[1].entityType[0].property[2]);
    Utils.addUnitAnnotations(aSchemas, oMetaModel);
    assert.deepEqual(aSchemas[0].entityType[0].property[1]["Org.OData.Measures.V1.ISOCurrency"], { Path: "toProduct/Code" });
    assert.deepEqual(aSchemas[0].entityType[0].property[2]["Org.OData.Measures.V1.ISOCurrency"], { Path: "AnnotationsPriceCode" });
    assert.deepEqual(aSchemas[1].entityType[0].property[0]["Org.OData.Measures.V1.Unit"], { Path: "toProduct/Measure" });
    assert.deepEqual(aSchemas[1].entityType[0].property[1]["Org.OData.Measures.V1.Unit"], { Path: "AnnotationsWidthUnit" });
});
QUnit.test("addNavigationFilterRestriction", function (assert) {
    var oEntitySet = {}, oNavigationRestrictions, oProperty0 = {
        "name": "Bar"
    }, oProperty1 = {
        "name": "Foo"
    };
    Utils.addNavigationFilterRestriction(oProperty0, oEntitySet);
    Utils.addNavigationFilterRestriction(oProperty1, oEntitySet);
    oNavigationRestrictions = oEntitySet["Org.OData.Capabilities.V1.NavigationRestrictions"];
    assert.deepEqual(oNavigationRestrictions, {
        "RestrictedProperties": [{
                "NavigationProperty": {
                    "NavigationPropertyPath": "Bar"
                },
                "FilterRestrictions": {
                    "Filterable": { "Bool": "false" }
                }
            }, {
                "NavigationProperty": {
                    "NavigationPropertyPath": "Foo"
                },
                "FilterRestrictions": {
                    "Filterable": { "Bool": "false" }
                }
            }]
    });
});
QUnit.test("calculateEntitySetAnnotations: calls addNavigationFilterRestriction", function (assert) {
    var oEntitySet = {}, oEntityType = {
        navigationProperty: [
            { "sap:filterable": "false" },
            { "sap:filterable": "true" }
        ]
    };
    this.mock(Utils).expects("addNavigationFilterRestriction").withExactArgs(sinon.match.same(oEntityType.navigationProperty[0]), sinon.match.same(oEntitySet));
    Utils.calculateEntitySetAnnotations(oEntitySet, oEntityType);
});
[
    { aArray: null, vValue: "foo", iResult: -1 },
    { aArray: undefined, vValue: "foo", iResult: -1 },
    { aArray: [], vValue: "foo", iResult: -1 },
    { aArray: [], sPropertyName: "bar", vValue: "foo", iResult: -1 },
    { aArray: [{ name: "bar" }, { name: "foo" }], vValue: "foo", iResult: 1 },
    {
        aArray: [{
                bar: "foo"
            }, {
                bar: "foo"
            }],
        sPropertyName: "bar",
        vValue: "foo",
        iResult: 0
    }
].forEach(function (oFixture, i) {
    QUnit.test("findIndex: " + i, function (assert) {
        assert.strictEqual(Utils.findIndex(oFixture.aArray, oFixture.vValue, oFixture.sPropertyName), oFixture.iResult);
    });
});
QUnit.test("findIndex: vExpectedPropertyValue is same object", function (assert) {
    var oValue = {}, aArray = [{ foo: {} }, { foo: oValue }, { foo: {} }];
    assert.strictEqual(Utils.findIndex(aArray, oValue, "foo"), 1);
});