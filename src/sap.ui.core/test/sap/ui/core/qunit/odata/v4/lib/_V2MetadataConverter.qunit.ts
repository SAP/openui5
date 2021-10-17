import jQuery from "jquery.sap.global";
import Log from "sap/base/Log";
import _Helper from "sap/ui/model/odata/v4/lib/_Helper";
import _V2MetadataConverter from "sap/ui/model/odata/v4/lib/_V2MetadataConverter";
import TestUtils from "sap/ui/test/TestUtils";
import XMLHelper from "sap/ui/util/XMLHelper";
var sClassName = "sap.ui.model.odata.v4.lib._V2MetadataConverter", sEdmx = "<edmx:Edmx Version=\"1.0\" xmlns=\"http://schemas.microsoft.com/ado/2008/09/edm\"" + " xmlns:edmx=\"http://schemas.microsoft.com/ado/2007/06/edmx\"" + " xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\"" + " xmlns:sap=\"http://www.sap.com/Protocols/SAPData\">", mFixture = {
    "/GWSAMPLE_BASIC/$metadata": { source: "GWSAMPLE_BASIC.metadata.xml" },
    "/GWSAMPLE_BASIC/annotations": { source: "GWSAMPLE_BASIC.annotations.xml" },
    "/GWSAMPLE_BASIC/metadata_v4.json": { source: "GWSAMPLE_BASIC.metadata_v4.json" }
}, sXmlnsEdm4 = "http://docs.oasis-open.org/odata/ns/edm", sXmlnsEdmx4 = "http://docs.oasis-open.org/odata/ns/edmx";
function testAnnotationConversion(assert, sXmlSnippet, oExpected) {
    var oXML = xml(assert, sEdmx + "<edmx:DataServices m:DataServiceVersion=\"2.0\">" + "<Schema Namespace=\"GWSAMPLE_BASIC\">" + sXmlSnippet + "</Schema></edmx:DataServices></edmx:Edmx>"), oResult = new _V2MetadataConverter().convertXMLMetadata(oXML, "/foo/bar/$metadata");
    assert.deepEqual(oResult["GWSAMPLE_BASIC."].$Annotations, oExpected);
}
function testConversion(assert, sXmlSnippet, oExpected, bSubset) {
    testConversionForInclude(assert, "<edmx:DataServices m:DataServiceVersion=\"2.0\">" + sXmlSnippet + "</edmx:DataServices>", oExpected, bSubset);
}
function testConversionForInclude(assert, sXmlSnippet, oExpected, bSubset) {
    var sProperty, oXML = xml(assert, sEdmx + sXmlSnippet + "</edmx:Edmx>"), oResult = new _V2MetadataConverter().convertXMLMetadata(oXML, "/foo/bar/$metadata");
    if (bSubset) {
        for (sProperty in oExpected) {
            if (sProperty in oResult) {
                assert.deepEqual(oResult[sProperty], oExpected[sProperty], sProperty);
            }
            else {
                assert.ok(false, "Missing property: " + sProperty);
            }
        }
    }
    else {
        oExpected.$Version = "4.0";
        assert.deepEqual(oResult, oExpected);
    }
}
function xml(assert, sXml) {
    var oDocument = XMLHelper.parse(sXml);
    assert.strictEqual(oDocument.parseError.errorCode, 0, "XML parsed correctly");
    return oDocument;
}
QUnit.module("sap.ui.model.odata.v4.lib._V2MetadataConverter", {
    beforeEach: function () {
        TestUtils.useFakeServer(this._oSandbox, "sap/ui/core/qunit/model", mFixture);
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
    }
});
QUnit.test("convertXMLMetadata: Reference", function (assert) {
    testConversionForInclude(assert, "\t\t\t\t<edmx:Reference xmlns:edmx=\"" + sXmlnsEdmx4 + "\" Uri=\"/qux/$metadata\">\t\t\t\t\t<edmx:Include Namespace=\"qux.foo\"/>\t\t\t\t\t<edmx:Include Namespace=\"qux.bar\"/>\t\t\t\t\t<edmx:IncludeAnnotations TermNamespace=\"qux.foo\"/>\t\t\t\t\t<edmx:IncludeAnnotations TermNamespace=\"qux.bar\" TargetNamespace=\"qux.bar\"\t\t\t\t\t\tQualifier=\"Tablet\"/>\t\t\t\t</edmx:Reference>\t\t\t\t<edmx:Reference xmlns:edmx=\"" + sXmlnsEdmx4 + "\" Uri=\"/bla/$metadata\">\t\t\t\t\t<edmx:Include Namespace=\"bla\"/>\t\t\t\t</edmx:Reference>", {
        "$Reference": {
            "/qux/$metadata": {
                "$Include": ["qux.foo.", "qux.bar."],
                "$IncludeAnnotations": [{
                        "$TermNamespace": "qux.foo."
                    }, {
                        "$TermNamespace": "qux.bar.",
                        "$TargetNamespace": "qux.bar.",
                        "$Qualifier": "Tablet"
                    }]
            },
            "/bla/$metadata": {
                "$Include": ["bla."]
            }
        }
    });
});
QUnit.test("convertXMLMetadata: aliases in types", function (assert) {
    testConversion(assert, "\t\t\t\t<Schema Namespace=\"bar\" Alias=\"b\">\t\t\t\t\t<ComplexType Name=\"Worker\">\t\t\t\t\t\t<Property Name=\"Something\" Type=\"b.Something\"/>\t\t\t\t\t</ComplexType>\t\t\t\t</Schema>\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\"/>", {
        "bar.": {
            "$kind": "Schema"
        },
        "bar.Worker": {
            "$kind": "ComplexType",
            "Something": {
                "$kind": "Property",
                "$Type": "bar.Something"
            }
        },
        "foo.": {
            "$kind": "Schema"
        }
    });
});
QUnit.test("convertXMLMetadata: aliases in include", function (assert) {
    testConversionForInclude(assert, "\t\t\t<edmx:Reference xmlns:edmx=\"" + sXmlnsEdmx4 + "\" Uri=\"/qux/$metadata\">\t\t\t\t<edmx:Include Namespace=\"qux\" Alias=\"q\"/>\t\t\t</edmx:Reference>\t\t\t<edmx:DataServices m:DataServiceVersion=\"2.0\">\t\t\t\t<Schema Namespace=\"bar\" Alias=\"b\">\t\t\t\t\t<ComplexType Name=\"Worker\">\t\t\t\t\t\t<Property Name=\"Something\" Type=\"b.Something\"/>\t\t\t\t\t\t<Property Name=\"ManyThings\" Type=\"Collection(q.Something)\"/>\t\t\t\t\t</ComplexType>\t\t\t\t</Schema>\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\"/>\t\t\t</edmx:DataServices>", {
        "$Reference": {
            "/qux/$metadata": {
                "$Include": ["qux."]
            }
        },
        "bar.": {
            "$kind": "Schema"
        },
        "bar.Worker": {
            "$kind": "ComplexType",
            "Something": {
                "$kind": "Property",
                "$Type": "bar.Something"
            },
            "ManyThings": {
                "$kind": "Property",
                "$isCollection": true,
                "$Type": "qux.Something"
            }
        },
        "foo.": {
            "$kind": "Schema"
        }
    });
});
QUnit.test("convertXMLMetadata: EntityType attributes", function (assert) {
    testConversion(assert, "\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\">\t\t\t\t\t<EntityType Name=\"Worker\">\t\t\t\t\t\t<Key>\t\t\t\t\t\t\t<PropertyRef Name=\"Bar\"/>\t\t\t\t\t\t</Key>\t\t\t\t\t</EntityType>\t\t\t\t\t<EntityType Name=\"Base\" Abstract=\"true\"/>\t\t\t\t\t<EntityType Name=\"Derived\" BaseType=\"f.Base\"/>\t\t\t\t</Schema>", {
        "foo.": {
            "$kind": "Schema"
        },
        "foo.Worker": {
            "$kind": "EntityType",
            "$Key": ["Bar"]
        },
        "foo.Base": {
            "$kind": "EntityType",
            "$Abstract": true
        },
        "foo.Derived": {
            "$kind": "EntityType",
            "$BaseType": "foo.Base"
        }
    });
});
QUnit.test("convertXMLMetadata: ComplexType", function (assert) {
    testConversion(assert, "\t\t\t\t<Schema Namespace=\"foo\">\t\t\t\t\t<ComplexType Name=\"Worker\" />\t\t\t\t</Schema>", {
        "foo.": {
            "$kind": "Schema"
        },
        "foo.Worker": {
            "$kind": "ComplexType"
        }
    });
});
QUnit.test("processFacetAttributes", function (assert) {
    function localTest(sProperty, sValue, vExpectedValue) {
        var oExpectedResult = {}, oResult = {}, oXml = xml(assert, "<Foo " + sProperty + "=\"" + sValue + "\"/>");
        if (typeof vExpectedValue === "object") {
            oExpectedResult = vExpectedValue;
        }
        else if (vExpectedValue !== undefined) {
            oExpectedResult["$" + sProperty] = vExpectedValue;
        }
        new _V2MetadataConverter().processFacetAttributes(oXml.documentElement, oResult);
        assert.deepEqual(oResult, oExpectedResult);
    }
    localTest("Nullable", "false", false);
    localTest("Nullable", "true", undefined);
    localTest("DefaultValue", "foo", "foo");
    localTest("Precision", "8", 8);
    localTest("Scale", "2", 2);
    localTest("Unicode", "false", false);
    localTest("Unicode", "true", undefined);
    localTest("MaxLength", "12345", 12345);
    localTest("MaxLength", "Max", undefined);
    localTest("FixedLength", "true", undefined);
    localTest("FixedLength", "false", { $Scale: "variable" });
});
["ComplexType", "EntityType"].forEach(function (sType) {
    ["", "Edm."].forEach(function (sNamespace) {
        var sTitle = "convertXMLMetadata: " + sType + ": Property, Namespace=" + sNamespace;
        QUnit.test(sTitle, function (assert) {
            testConversion(assert, "\t\t\t\t\t\t<Schema Namespace=\"foo\">\t\t\t\t\t\t\t<" + sType + " Name=\"Worker\">\t\t\t\t\t\t\t\t<Property Name=\"Salary\" Type=\"" + sNamespace + "Decimal\"\t\t\t\t\t\t\t\t\tPrecision=\"8\" Scale=\"2\"/>\t\t\t\t\t\t\t\t<Property Name=\"p1\" Type=\"" + sNamespace + "String\"\t\t\t\t\t\t\t\t\tUnicode=\"false\" />\t\t\t\t\t\t\t\t<Property Name=\"p2\" Type=\"" + sNamespace + "String\"\t\t\t\t\t\t\t\t\tUnicode=\"true\" />\t\t\t\t\t\t\t\t<Property Name=\"p3\" Type=\"" + sNamespace + "Int32\"\t\t\t\t\t\t\t\t\tDefaultValue=\"42\"/>\t\t\t\t\t\t\t\t<Property Name=\"p4\" Type=\"" + sNamespace + "Time\"/>\t\t\t\t\t\t\t\t<Property Name=\"p5\" Type=\"" + sNamespace + "DateTime\"/>\t\t\t\t\t\t\t\t<Property Name=\"p6\" Type=\"" + sNamespace + "DateTime\"\t\t\t\t\t\t\t\t\tPrecision=\"0\" sap:display-format=\"Date\"/>\t\t\t\t\t\t\t\t<Property Name=\"p7\" Type=\"" + sNamespace + "Float\"/>\t\t\t\t\t\t\t</" + sType + ">\t\t\t\t\t\t</Schema>", {
                "foo.": {
                    "$kind": "Schema"
                },
                "foo.Worker": {
                    "$kind": sType,
                    "Salary": {
                        "$kind": "Property",
                        "$Type": "Edm.Decimal",
                        "$Precision": 8,
                        "$Scale": 2
                    },
                    "p1": {
                        "$kind": "Property",
                        "$Type": "Edm.String",
                        "$Unicode": false
                    },
                    "p2": {
                        "$kind": "Property",
                        "$Type": "Edm.String"
                    },
                    "p3": {
                        "$kind": "Property",
                        "$Type": "Edm.Int32",
                        "$DefaultValue": "42"
                    },
                    "p4": {
                        "$kind": "Property",
                        "$Type": "Edm.TimeOfDay",
                        "$v2Type": "Edm.Time"
                    },
                    "p5": {
                        "$kind": "Property",
                        "$Type": "Edm.DateTimeOffset",
                        "$v2Type": "Edm.DateTime"
                    },
                    "p6": {
                        "$kind": "Property",
                        "$Type": "Edm.Date",
                        "$v2Type": "Edm.DateTime"
                    },
                    "p7": {
                        "$kind": "Property",
                        "$Type": "Edm.Single",
                        "$v2Type": "Edm.Float"
                    }
                }
            });
        });
    });
});
QUnit.test("convertXMLMetadata: NavigationProperty & Assocation", function (assert) {
    var sXML = "\t\t\t\t<Schema Namespace=\"GWSAMPLE_BASIC.0001\" Alias=\"GWSAMPLE_BASIC\">\t\t\t\t\t<EntityType Name=\"BusinessPartner\">\t\t\t\t\t\t<NavigationProperty Name=\"ToSalesOrders\"\t\t\t\t\t\t\tRelationship=\"GWSAMPLE_BASIC.Assoc_BusinessPartner_SalesOrders\"\t\t\t\t\t\t\tFromRole=\"FromRole_Assoc_BusinessPartner_SalesOrders\"\t\t\t\t\t\t\tToRole=\"ToRole_Assoc_BusinessPartner_SalesOrders\" />\t\t\t\t\t</EntityType>\t\t\t\t\t<EntityType Name=\"SalesOrder\">\t\t\t\t\t\t<NavigationProperty Name=\"ToBusinessPartner\"\t\t\t\t\t\t\t\tRelationship=\"GWSAMPLE_BASIC.Assoc_BusinessPartner_SalesOrders\"\t\t\t\t\t\t\t\tFromRole=\"ToRole_Assoc_BusinessPartner_SalesOrders\"\t\t\t\t\t\t\t\tToRole=\"FromRole_Assoc_BusinessPartner_SalesOrders\" />\t\t\t\t\t</EntityType>\t\t\t\t\t<Association Name=\"Assoc_BusinessPartner_SalesOrders\">\t\t\t\t\t\t<End Type=\"GWSAMPLE_BASIC.BusinessPartner\" Multiplicity=\"1\"\t\t\t\t\t\t\tRole=\"FromRole_Assoc_BusinessPartner_SalesOrders\" />\t\t\t\t\t\t<End Type=\"GWSAMPLE_BASIC.SalesOrder\" Multiplicity=\"*\"\t\t\t\t\t\t\tRole=\"ToRole_Assoc_BusinessPartner_SalesOrders\" />\t\t\t\t\t\t<ReferentialConstraint>\t\t\t\t\t\t\t<Principal Role=\"FromRole_Assoc_BusinessPartner_SalesOrders\">\t\t\t\t\t\t\t\t<PropertyRef Name=\"BusinessPartnerID\" />\t\t\t\t\t\t\t</Principal>\t\t\t\t\t\t\t<Dependent Role=\"ToRole_Assoc_BusinessPartner_SalesOrders\">\t\t\t\t\t\t\t\t<PropertyRef Name=\"CustomerID\" />\t\t\t\t\t\t\t</Dependent>\t\t\t\t\t\t</ReferentialConstraint>\t\t\t\t\t</Association>\t\t\t\t</Schema>", oExpectedResult = {
        "GWSAMPLE_BASIC.0001.": {
            "$kind": "Schema"
        },
        "GWSAMPLE_BASIC.0001.BusinessPartner": {
            "$kind": "EntityType",
            "ToSalesOrders": {
                "$Type": "GWSAMPLE_BASIC.0001.SalesOrder",
                "$isCollection": true,
                "$kind": "NavigationProperty"
            }
        },
        "GWSAMPLE_BASIC.0001.SalesOrder": {
            "$kind": "EntityType",
            "ToBusinessPartner": {
                "$Nullable": false,
                "$ReferentialConstraint": {
                    "CustomerID": "BusinessPartnerID"
                },
                "$Type": "GWSAMPLE_BASIC.0001.BusinessPartner",
                "$kind": "NavigationProperty"
            }
        }
    };
    testConversion(assert, sXML, oExpectedResult);
});
QUnit.test("convertXMLMetadata: multiple EntityContainer", function (assert) {
    testConversion(assert, "\t\t\t\t<Schema Namespace=\"Schema1\">\t\t\t\t\t<EntityContainer Name=\"Container\" m:IsDefaultEntityContainer=\"true\"/>\t\t\t\t</Schema>\t\t\t\t<Schema Namespace=\"Schema2\">\t\t\t\t\t<EntityContainer Name=\"Container\"/>\t\t\t\t</Schema>", {
        "$EntityContainer": "Schema1.Container",
        "Schema1.": {
            "$kind": "Schema"
        },
        "Schema1.Container": {
            "$kind": "EntityContainer"
        },
        "Schema2.": {
            "$kind": "Schema"
        },
        "Schema2.Container": {
            "$kind": "EntityContainer"
        }
    });
});
QUnit.test("convertXMLMetadata: AssociationSets", function (assert) {
    testConversion(assert, "\t\t\t\t<Schema Namespace=\"GWSAMPLE_BASIC.0001\" Alias=\"GWSAMPLE_BASIC\">\t\t\t\t\t<EntityType Name=\"BusinessPartner\">\t\t\t\t\t\t<NavigationProperty Name=\"Foo\"\t\t\t\t\t\t\tRelationship=\"GWSAMPLE_BASIC.Foo\"\t\t\t\t\t\t\tFromRole=\"Foo1\"\t\t\t\t\t\t\tToRole=\"Foo2\"/>\t\t\t\t\t\t<NavigationProperty Name=\"ToProducts\"\t\t\t\t\t\t\tRelationship=\"GWSAMPLE_BASIC.Assoc_BusinessPartner_Products\"\t\t\t\t\t\t\tFromRole=\"FromRole_Assoc_BusinessPartner_Products\"\t\t\t\t\t\t\tToRole=\"ToRole_Assoc_BusinessPartner_Products\"/>\t\t\t\t\t</EntityType>\t\t\t\t\t<EntityType Name=\"Product\"/>\t\t\t\t\t<Association Name=\"Assoc_BusinessPartner_Products\">\t\t\t\t\t\t<End Type=\"GWSAMPLE_BASIC.BusinessPartner\" Multiplicity=\"1\"\t\t\t\t\t\t\t\tRole=\"FromRole_Assoc_BusinessPartner_Products\"/>\t\t\t\t\t\t<End Type=\"GWSAMPLE_BASIC.Product\" Multiplicity=\"*\"\t\t\t\t\t\t\t\tRole=\"ToRole_Assoc_BusinessPartner_Products\"/>\t\t\t\t\t</Association>\t\t\t\t\t<Association Name=\"Foo\">\t\t\t\t\t\t<End Type=\"GWSAMPLE_BASIC.BusinessPartner\" Multiplicity=\"1\"\t\t\t\t\t\t\t\tRole=\"Foo1\"/>\t\t\t\t\t\t<End Type=\"GWSAMPLE_BASIC.Product\" Multiplicity=\"*\"\t\t\t\t\t\t\t\tRole=\"Foo2\"/>\t\t\t\t\t</Association>\t\t\t\t\t<EntityContainer Name=\"Container\" m:IsDefaultEntityContainer=\"true\">\t\t\t\t\t\t<EntitySet Name=\"BusinessPartnerSet\"\t\t\t\t\t\t\t\tEntityType=\"GWSAMPLE_BASIC.BusinessPartner\"/>\t\t\t\t\t\t<EntitySet Name=\"ProductSet\" EntityType=\"GWSAMPLE_BASIC.Product\"/>\t\t\t\t\t\t<AssociationSet Name=\"Assoc_BusinessPartner_Products_AssocSet\"\t\t\t\t\t\t\t\tAssociation=\"GWSAMPLE_BASIC.Assoc_BusinessPartner_Products\">\t\t\t\t\t\t\t<End EntitySet=\"BusinessPartnerSet\"\t\t\t\t\t\t\t\tRole=\"FromRole_Assoc_BusinessPartner_Products\"/>\t\t\t\t\t\t\t<End EntitySet=\"ProductSet\"\t\t\t\t\t\t\t\tRole=\"ToRole_Assoc_BusinessPartner_Products\"/>\t\t\t\t\t\t</AssociationSet>\t\t\t\t\t</EntityContainer>\t\t\t\t</Schema>\t\t\t\t<Schema Namespace=\"AnotherSchema\">\t\t\t\t\t<EntityContainer Name=\"Container\"/>\t\t\t\t</Schema>", {
        "$EntityContainer": "GWSAMPLE_BASIC.0001.Container",
        "GWSAMPLE_BASIC.0001.": {
            "$Annotations": {
                "GWSAMPLE_BASIC.0001.Container/BusinessPartnerSet": {
                    "@Org.OData.Capabilities.V1.SearchRestrictions": {
                        "Searchable": false
                    }
                },
                "GWSAMPLE_BASIC.0001.Container/ProductSet": {
                    "@Org.OData.Capabilities.V1.SearchRestrictions": {
                        "Searchable": false
                    }
                }
            },
            "$kind": "Schema"
        },
        "GWSAMPLE_BASIC.0001.BusinessPartner": {
            "$kind": "EntityType",
            "Foo": {
                "$kind": "NavigationProperty",
                "$isCollection": true,
                "$Type": "GWSAMPLE_BASIC.0001.Product"
            },
            "ToProducts": {
                "$kind": "NavigationProperty",
                "$isCollection": true,
                "$Type": "GWSAMPLE_BASIC.0001.Product"
            }
        },
        "GWSAMPLE_BASIC.0001.Product": {
            "$kind": "EntityType"
        },
        "GWSAMPLE_BASIC.0001.Container": {
            "$kind": "EntityContainer",
            "BusinessPartnerSet": {
                "$kind": "EntitySet",
                "$Type": "GWSAMPLE_BASIC.0001.BusinessPartner",
                "$NavigationPropertyBinding": {
                    "ToProducts": "ProductSet"
                }
            },
            "ProductSet": {
                "$kind": "EntitySet",
                "$Type": "GWSAMPLE_BASIC.0001.Product"
            }
        },
        "AnotherSchema.": {
            "$kind": "Schema"
        },
        "AnotherSchema.Container": {
            "$kind": "EntityContainer"
        }
    });
});
["DELETE", "GET", "MERGE", "PATCH", "POST", "PUT"].forEach(function (sHttpMethod) {
    QUnit.test("convert: FunctionImport, Method=" + sHttpMethod, function (assert) {
        var sWhat = sHttpMethod !== "GET" ? "Action" : "Function", sXml = "\t\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\">\t\t\t\t\t\t<EntityContainer Name=\"Container\">\t\t\t\t\t\t\t<FunctionImport Name=\"Baz\" ReturnType=\"Collection(Edm.String)\"" + " m:HttpMethod=\"" + sHttpMethod + "\">\t\t\t\t\t\t\t\t<Parameter Name=\"p1\" Type=\"f.Bar\" Nullable=\"false\"/>\t\t\t\t\t\t\t\t<Parameter Name=\"p2\" Type=\"Collection(f.Bar)\" MaxLength=\"10\"\t\t\t\t\t\t\t\t\tPrecision=\"2\" FixedLength=\"false\"/>\t\t\t\t\t\t\t</FunctionImport>\t\t\t\t\t\t</EntityContainer>\t\t\t\t\t</Schema>", oExpected = {
            "$EntityContainer": "foo.Container",
            "foo.": {
                "$kind": "Schema"
            },
            "foo.Container": {
                "$kind": "EntityContainer",
                "Baz": {
                    "$kind": sWhat + "Import"
                }
            },
            "foo.Baz": [{
                    "$kind": sWhat,
                    "$Parameter": [{
                            "$Name": "p1",
                            "$Type": "foo.Bar",
                            "$Nullable": false
                        }, {
                            "$Name": "p2",
                            "$isCollection": true,
                            "$Type": "foo.Bar",
                            "$MaxLength": 10,
                            "$Precision": 2,
                            "$Scale": "variable"
                        }],
                    "$ReturnType": {
                        "$isCollection": true,
                        "$Type": "Edm.String"
                    }
                }]
        };
        oExpected["foo.Container"]["Baz"]["$" + sWhat] = "foo.Baz";
        if (sHttpMethod !== "GET" && sHttpMethod !== "POST") {
            oExpected["foo.Baz"][0].$v2HttpMethod = sHttpMethod;
        }
        testConversion(assert, sXml, oExpected);
    });
});
QUnit.test("convert: FunctionImport w/ EntitySet", function (assert) {
    testConversion(assert, "\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\">\t\t\t\t\t<EntityContainer Name=\"Container\">\t\t\t\t\t\t<FunctionImport m:HttpMethod=\"GET\" Name=\"Baz\" ReturnType=\"Edm.String\"\t\t\t\t\t\t\tEntitySet=\"Bar\"/>\t\t\t\t\t</EntityContainer>\t\t\t\t</Schema>", {
        "$EntityContainer": "foo.Container",
        "foo.": {
            "$kind": "Schema"
        },
        "foo.Container": {
            "$kind": "EntityContainer",
            "Baz": {
                "$EntitySet": "Bar",
                "$Function": "foo.Baz",
                "$kind": "FunctionImport"
            }
        },
        "foo.Baz": [{
                "$kind": "Function",
                "$ReturnType": {
                    "$Type": "Edm.String"
                }
            }]
    });
});
QUnit.test("convert: FunctionImport w/ sap:action-for", function (assert) {
    testConversion(assert, "\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\">\t\t\t\t\t<EntityContainer Name=\"Container\">\t\t\t\t\t\t<FunctionImport m:HttpMethod=\"GET\" Name=\"Bar\"/>\t\t\t\t\t\t<FunctionImport m:HttpMethod=\"GET\" Name=\"SalesOrderLineItemFunction\"\t\t\t\t\t\t\tReturnType=\"Edm.String\"\t\t\t\t\t\t\tsap:action-for=\"f.SalesOrderLineItem\" sap:label=\"S.O.L.I.F.\">\t\t\t\t\t\t\t<Parameter Name=\"ItemPosition\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\t\t\t\tsap:label=\"Item Pos.\"/>\t\t\t\t\t\t\t<Parameter Name=\"SalesOrderID\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\t\t\t\tsap:label=\"Sales Order ID\"/>\t\t\t\t\t\t</FunctionImport>\t\t\t\t\t\t<FunctionImport m:HttpMethod=\"POST\" Name=\"SalesOrderLineItemAction\"\t\t\t\t\t\t\tReturnType=\"Edm.String\" sap:action-for=\"f.SalesOrderLineItem\"\t\t\t\t\t\t\tsap:label=\"S.O.L.I.A.\">\t\t\t\t\t\t\t<Parameter Name=\"SalesOrderID\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\t\t\t\tsap:label=\"Sales Order ID\"/>\t\t\t\t\t\t\t<Parameter Name=\"NoteLanguage\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\t\t\t\tsap:label=\"Note Language\"/>\t\t\t\t\t\t\t<Parameter Name=\"ItemPosition\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\t\t\t\tsap:label=\"Item Pos.\"/>\t\t\t\t\t\t</FunctionImport>\t\t\t\t\t</EntityContainer>\t\t\t\t\t<EntityType Name=\"SalesOrderLineItem\">\t\t\t\t\t\t<Key>\t\t\t\t\t\t\t<PropertyRef Name=\"SalesOrderID\"/>\t\t\t\t\t\t\t<PropertyRef Name=\"ItemPosition\"/>\t\t\t\t\t\t</Key>\t\t\t\t\t\t<Property Name=\"SalesOrderID\" Type=\"Edm.String\" Nullable=\"false\"/>\t\t\t\t\t\t<Property Name=\"ItemPosition\" Type=\"Edm.String\" Nullable=\"false\"/>\t\t\t\t\t</EntityType>\t\t\t\t</Schema>", {
        "$EntityContainer": "foo.Container",
        "foo.": {
            "$kind": "Schema"
        },
        "foo.Bar": [{
                "$kind": "Function"
            }],
        "foo.SalesOrderLineItem": {
            "$Key": [
                "SalesOrderID",
                "ItemPosition"
            ],
            "$kind": "EntityType",
            "ItemPosition": {
                "$Nullable": false,
                "$Type": "Edm.String",
                "$kind": "Property"
            },
            "SalesOrderID": {
                "$Nullable": false,
                "$Type": "Edm.String",
                "$kind": "Property"
            }
        },
        "foo.SalesOrderLineItemAction": [{
                "$kind": "Action",
                "$IsBound": true,
                "$Parameter": [{
                        "$Name": null,
                        "$Nullable": false,
                        "$Type": "foo.SalesOrderLineItem"
                    }, {
                        "$Name": "NoteLanguage",
                        "$Nullable": false,
                        "$Type": "Edm.String",
                        "@com.sap.vocabularies.Common.v1.Label": "Note Language"
                    }],
                "$ReturnType": {
                    "$Type": "Edm.String"
                },
                "@com.sap.vocabularies.Common.v1.Label": "S.O.L.I.A."
            }],
        "foo.SalesOrderLineItemFunction": [{
                "$kind": "Function",
                "$IsBound": true,
                "$Parameter": [{
                        "$Name": null,
                        "$Nullable": false,
                        "$Type": "foo.SalesOrderLineItem"
                    }],
                "$ReturnType": {
                    "$Type": "Edm.String"
                },
                "@com.sap.vocabularies.Common.v1.Label": "S.O.L.I.F."
            }],
        "foo.Container": {
            "$kind": "EntityContainer",
            "Bar": {
                "$kind": "FunctionImport",
                "$Function": "foo.Bar"
            }
        }
    });
});
[undefined, "FOO"].forEach(function (sHttpMethod) {
    QUnit.test("convert: FunctionImport w/ m:HttpMethod = " + sHttpMethod, function (assert) {
        var sMethodAttribute = sHttpMethod ? " m:HttpMethod=\"" + sHttpMethod + "\"" : "";
        this.oLogMock.expects("warning").withExactArgs("Unsupported HttpMethod at FunctionImport 'Baz'," + " removing this FunctionImport", undefined, sClassName);
        testConversion(assert, "\t\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\">\t\t\t\t\t\t<EntityContainer Name=\"Container\">\t\t\t\t\t\t\t<FunctionImport" + sMethodAttribute + " Name=\"Baz\">\t\t\t\t\t\t\t</FunctionImport>\t\t\t\t\t\t</EntityContainer>\t\t\t\t\t</Schema>", {
            "$EntityContainer": "foo.Container",
            "foo.": {
                "$kind": "Schema"
            },
            "foo.Container": {
                "$kind": "EntityContainer"
            }
        });
    });
});
QUnit.test("try to read some random XML as V2", function (assert) {
    var sUrl = "/some/random/xml", oXML = xml(assert, "<foo xmlns=\"http://schemas.microsoft.com/ado/2007/06/edmx\"/>");
    assert.throws(function () {
        new _V2MetadataConverter().convertXMLMetadata(oXML, sUrl);
    }, new Error(sUrl + ": expected <Edmx> in namespace 'http://schemas.microsoft.com/ado/2007/06/edmx'"));
});
QUnit.test("try to read V3 as V2", function (assert) {
    var sUrl = "/some/v3/service/$metadata", oXML = xml(assert, "\t\t\t\t\t<Edmx xmlns=\"http://schemas.microsoft.com/ado/2007/06/edmx\"\t\t\t\t\t\txmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\">\t\t\t\t\t\t<DataServices m:DataServiceVersion=\"3.0\"/>\t\t\t\t\t</Edmx>");
    assert.throws(function () {
        new _V2MetadataConverter().convertXMLMetadata(oXML, sUrl);
    }, new Error(sUrl + ": expected DataServiceVersion=\"2.0\": <DataServices m:DataServiceVersion=\"3.0\"/>"));
});
QUnit.test("try to read V4 as V2", function (assert) {
    var sUrl = "/some/v4/service/$metadata", oXML = xml(assert, "<Edmx xmlns=\"http://docs.oasis-open.org/odata/ns/edmx\"/>");
    assert.throws(function () {
        new _V2MetadataConverter().convertXMLMetadata(oXML, sUrl);
    }, new Error(sUrl + ": expected <Edmx> in namespace 'http://schemas.microsoft.com/ado/2007/06/edmx'"));
});
QUnit.test("convertXMLMetadata: test service", function (assert) {
    var oLogMock = this.oLogMock, sUrl = "/GWSAMPLE_BASIC/$metadata";
    ["filterable", "sortable"].forEach(function (sAnnotation) {
        oLogMock.expects("warning").withExactArgs("Unsupported SAP annotation at a complex type in '" + sUrl + "'", "sap:" + sAnnotation + " at property 'GWSAMPLE_BASIC.CT_String/String'", sClassName);
    });
    return Promise.all([
        jQuery.ajax(sUrl).then(function (oXML) {
            return new _V2MetadataConverter().convertXMLMetadata(oXML, sUrl);
        }),
        jQuery.ajax("/GWSAMPLE_BASIC/metadata_v4.json")
    ]).then(function (aResults) {
        assert.deepEqual(aResults[0], aResults[1]);
    });
});
[{
        annotationsV2: "sap:aggregation-role=\"dimension\"",
        expectedAnnotationsV4: {
            "@com.sap.vocabularies.Analytics.v1.Dimension": true
        }
    }, {
        annotationsV2: "sap:aggregation-role=\"measure\"",
        expectedAnnotationsV4: {
            "@com.sap.vocabularies.Analytics.v1.Measure": true
        }
    }, {
        annotationsV2: "sap:aggregation-role=\"foo\"",
        expectedAnnotationsV4: null
    }, {
        annotationsV2: "sap:display-format=\"NonNegative\"",
        expectedAnnotationsV4: {
            "@com.sap.vocabularies.Common.v1.IsDigitSequence": true
        }
    }, {
        annotationsV2: "sap:display-format=\"UpperCase\"",
        expectedAnnotationsV4: {
            "@com.sap.vocabularies.Common.v1.IsUpperCase": true
        }
    }, {
        annotationsV2: "sap:heading=\"Value\"",
        expectedAnnotationsV4: {
            "@com.sap.vocabularies.Common.v1.Heading": "Value"
        }
    }, {
        annotationsV2: "sap:label=\"Value\"",
        expectedAnnotationsV4: {
            "@com.sap.vocabularies.Common.v1.Label": "Value"
        }
    }, {
        annotationsV2: "sap:quickinfo=\"Value\"",
        expectedAnnotationsV4: {
            "@com.sap.vocabularies.Common.v1.QuickInfo": "Value"
        }
    }, {
        annotationsV2: "sap:field-control=\"PathExpression\"",
        expectedAnnotationsV4: {
            "@com.sap.vocabularies.Common.v1.FieldControl": {
                $Path: "PathExpression"
            }
        }
    }, {
        annotationsV2: "sap:precision=\"PathExpression\"",
        expectedAnnotationsV4: {
            "@Org.OData.Measures.V1.Scale": {
                $Path: "PathExpression"
            }
        }
    }, {
        annotationsV2: "sap:text=\"PathExpression\"",
        expectedAnnotationsV4: {
            "@com.sap.vocabularies.Common.v1.Text": {
                $Path: "PathExpression"
            }
        }
    }, {
        annotationsV2: "sap:visible=\"true\"",
        expectedAnnotationsV4: null
    }, {
        annotationsV2: "sap:visible=\"false\"",
        expectedAnnotationsV4: {
            "@com.sap.vocabularies.Common.v1.FieldControl": {
                $EnumMember: "com.sap.vocabularies.Common.v1.FieldControlType/Hidden"
            },
            "@com.sap.vocabularies.UI.v1.Hidden": true
        }
    }, {
        annotationsV2: "sap:text=\"PathExpression\" sap:label=\"Value\"",
        expectedAnnotationsV4: {
            "@com.sap.vocabularies.Common.v1.Label": "Value",
            "@com.sap.vocabularies.Common.v1.Text": {
                $Path: "PathExpression"
            }
        }
    }].forEach(function (oFixture) {
    var sTitle = "convert: V2 annotation at Property: " + oFixture.annotationsV2;
    QUnit.test(sTitle, function (assert) {
        var oExpectedResult = {
            "GWSAMPLE_BASIC.0001.": {
                "$Annotations": {
                    "GWSAMPLE_BASIC.0001.Foo/Bar": oFixture.expectedAnnotationsV4
                },
                "$kind": "Schema"
            },
            "GWSAMPLE_BASIC.0001.Foo": {
                "$kind": "EntityType",
                "Bar": {
                    "$kind": "Property",
                    "$Type": "Edm.String"
                }
            }
        }, sXML = "\t\t\t\t\t<Schema Namespace=\"GWSAMPLE_BASIC.0001\">\t\t\t\t\t\t<EntityType Name=\"Foo\">\t\t\t\t\t\t\t<Property Name=\"Bar\" Type=\"Edm.String\" \t\t\t\t\t\t\t\t" + oFixture.annotationsV2 + " />\t\t\t\t\t\t</EntityType>\t\t\t\t\t</Schema>";
        this.mock(_V2MetadataConverter.prototype).expects("mergeAnnotations").never();
        if (!oFixture.expectedAnnotationsV4) {
            delete oExpectedResult["GWSAMPLE_BASIC.0001."].$Annotations;
        }
        testConversion(assert, sXML, oExpectedResult);
    });
});
[{
        v2Semantics: "sap:semantics=\"name\"",
        expectedSemanticsV4: {
            "@com.sap.vocabularies.Communication.v1.Contact": {
                "fn": { "$Path": "Bar" }
            }
        }
    }, {
        v2Semantics: "sap:semantics=\"note\"",
        expectedSemanticsV4: {
            "@com.sap.vocabularies.Communication.v1.Contact": {
                "note": { "$Path": "Bar" }
            }
        }
    }, {
        v2Semantics: "sap:semantics=\"givenname\"",
        expectedSemanticsV4: {
            "@com.sap.vocabularies.Communication.v1.Contact": {
                "n": {
                    "given": {
                        "$Path": "Bar"
                    }
                }
            }
        }
    }, {
        v2Semantics: "sap:semantics=\"middlename\"",
        expectedSemanticsV4: {
            "@com.sap.vocabularies.Communication.v1.Contact": {
                "n": {
                    "additional": {
                        "$Path": "Bar"
                    }
                }
            }
        }
    }, {
        v2Semantics: "sap:semantics=\"familyname\"",
        expectedSemanticsV4: {
            "@com.sap.vocabularies.Communication.v1.Contact": {
                "n": {
                    "surname": {
                        "$Path": "Bar"
                    }
                }
            }
        }
    }, {
        v2Semantics: "sap:semantics=\"nickname\"",
        expectedSemanticsV4: {
            "@com.sap.vocabularies.Communication.v1.Contact": {
                "nickname": {
                    "$Path": "Bar"
                }
            }
        }
    }, {
        v2Semantics: "sap:semantics=\"honorific\"",
        expectedSemanticsV4: {
            "@com.sap.vocabularies.Communication.v1.Contact": {
                "n": {
                    "prefix": {
                        "$Path": "Bar"
                    }
                }
            }
        }
    }, {
        v2Semantics: "sap:semantics=\"suffix\"",
        expectedSemanticsV4: {
            "@com.sap.vocabularies.Communication.v1.Contact": {
                "n": {
                    "suffix": {
                        "$Path": "Bar"
                    }
                }
            }
        }
    }].forEach(function (oFixture) {
    var sTitle = "convert: V2 annotation at Property: " + oFixture.v2Semantics;
    QUnit.test("convert sap:semantics=" + sTitle, function (assert) {
        this.mock(_V2MetadataConverter.prototype).expects("mergeAnnotations").never();
        testAnnotationConversion(assert, "\t\t\t\t\t\t<EntityType Name=\"Foo\">\t\t\t\t\t\t\t<Property Name=\"Bar\" Type=\"Edm.String\" " + oFixture.v2Semantics + " />\t\t\t\t\t\t</EntityType>", {
            "GWSAMPLE_BASIC.Foo": oFixture.expectedSemanticsV4
        });
    });
});
QUnit.test("convert sap:semantics=* to contact", function (assert) {
    this.mock(_V2MetadataConverter.prototype).expects("mergeAnnotations").never();
    testAnnotationConversion(assert, "\t\t\t\t<EntityType Name=\"Foo\">\t\t\t\t\t<Property Name=\"P01\" Type=\"Edm.String\" sap:semantics=\"name\"/>\t\t\t\t\t<Property Name=\"P02\" Type=\"Edm.String\" sap:semantics=\"givenname\"/>\t\t\t\t\t<Property Name=\"P03\" Type=\"Edm.String\" sap:semantics=\"middlename\"/>\t\t\t\t\t<Property Name=\"P04\" Type=\"Edm.String\" sap:semantics=\"familyname\"/>\t\t\t\t\t<Property Name=\"P05\" Type=\"Edm.String\" sap:semantics=\"nickname\"/>\t\t\t\t\t<Property Name=\"P06\" Type=\"Edm.String\" sap:semantics=\"honorific\"/>\t\t\t\t\t<Property Name=\"P07\" Type=\"Edm.String\" sap:semantics=\"suffix\"/>\t\t\t\t\t<Property Name=\"P08\" Type=\"Edm.String\" sap:semantics=\"note\"/>\t\t\t\t\t<Property Name=\"P09\" Type=\"Edm.String\" sap:semantics=\"photo\"/>\t\t\t\t\t<Property Name=\"P10\" Type=\"Edm.String\" sap:semantics=\"org\"/>\t\t\t\t\t<Property Name=\"P11\" Type=\"Edm.String\" sap:semantics=\"org-unit\"/>\t\t\t\t\t<Property Name=\"P12\" Type=\"Edm.String\" sap:semantics=\"org-role\"/>\t\t\t\t\t<Property Name=\"P13\" Type=\"Edm.String\" sap:semantics=\"title\"/>\t\t\t\t\t<Property Name=\"P14\" Type=\"Edm.String\" sap:semantics=\"bday\"/>\t\t\t\t\t<Property Name=\"P15\" Type=\"Edm.String\" sap:semantics=\"city\"/>\t\t\t\t\t<Property Name=\"P16\" Type=\"Edm.String\" sap:semantics=\"street\"/>\t\t\t\t\t<Property Name=\"P17\" Type=\"Edm.String\" sap:semantics=\"country\"/>\t\t\t\t\t<Property Name=\"P18\" Type=\"Edm.String\" sap:semantics=\"region\"/>\t\t\t\t\t<Property Name=\"P19\" Type=\"Edm.String\" sap:semantics=\"zip\"/>\t\t\t\t\t<Property Name=\"P20\" Type=\"Edm.String\" sap:semantics=\"pobox\"/>\t\t\t\t</EntityType>", {
        "GWSAMPLE_BASIC.Foo": {
            "@com.sap.vocabularies.Communication.v1.Contact": {
                "adr": {
                    "code": { "$Path": "P19" },
                    "country": { "$Path": "P17" },
                    "locality": { "$Path": "P15" },
                    "pobox": { "$Path": "P20" },
                    "region": { "$Path": "P18" },
                    "street": { "$Path": "P16" }
                },
                "bday": { "$Path": "P14" },
                "fn": { "$Path": "P01" },
                "n": {
                    "given": { "$Path": "P02" },
                    "additional": { "$Path": "P03" },
                    "surname": { "$Path": "P04" },
                    "prefix": { "$Path": "P06" },
                    "suffix": { "$Path": "P07" }
                },
                "nickname": { "$Path": "P05" },
                "note": { "$Path": "P08" },
                "photo": { "$Path": "P09" },
                "org": { "$Path": "P10" },
                "orgunit": { "$Path": "P11" },
                "role": { "$Path": "P12" },
                "title": { "$Path": "P13" }
            }
        }
    });
});
QUnit.test("convert sap:semantics=tel, email to Contact", function (assert) {
    this.mock(_V2MetadataConverter.prototype).expects("mergeAnnotations").never();
    testAnnotationConversion(assert, "\t\t\t\t<EntityType Name=\"Foo\">\t\t\t\t\t<Property Name=\"P01\" Type=\"Edm.String\" sap:semantics=\"tel\"/>\t\t\t\t\t<Property Name=\"P02\" Type=\"Edm.String\" sap:semantics=\"email\"/>\t\t\t\t</EntityType>", {
        "GWSAMPLE_BASIC.Foo": {
            "@com.sap.vocabularies.Communication.v1.Contact": {
                "tel": [{
                        uri: { "$Path": "P01" }
                    }],
                "address": [{
                        uri: { "$Path": "P02" }
                    }]
            }
        },
        "GWSAMPLE_BASIC.Foo/P01": {
            "@com.sap.vocabularies.Communication.v1.IsPhoneNumber": true
        },
        "GWSAMPLE_BASIC.Foo/P02": {
            "@com.sap.vocabularies.Communication.v1.IsEmailAddress": true
        }
    });
});
QUnit.test("convert sap:semantics=tel with type to Contact", function (assert) {
    this.mock(_V2MetadataConverter.prototype).expects("mergeAnnotations").never();
    testAnnotationConversion(assert, "\t\t\t\t<EntityType Name=\"Foo\">\t\t\t\t\t<Property Name=\"P01\" Type=\"Edm.String\" sap:semantics=\"tel;type=cell,work\"/>\t\t\t\t</EntityType>", {
        "GWSAMPLE_BASIC.Foo": {
            "@com.sap.vocabularies.Communication.v1.Contact": {
                "tel": [{
                        "type": {
                            "EnumMember": "com.sap.vocabularies.Communication.v1.PhoneType/cell " + "com.sap.vocabularies.Communication.v1.PhoneType/work"
                        },
                        uri: { "$Path": "P01" }
                    }]
            }
        },
        "GWSAMPLE_BASIC.Foo/P01": {
            "@com.sap.vocabularies.Communication.v1.IsPhoneNumber": true
        }
    });
});
QUnit.test("convert sap:semantics=email with type to Contact", function (assert) {
    this.mock(_V2MetadataConverter.prototype).expects("mergeAnnotations").never();
    testAnnotationConversion(assert, "\t\t\t\t<EntityType Name=\"Foo\">\t\t\t\t\t<Property Name=\"P01\" Type=\"Edm.String\" sap:semantics=\"email;type=work,pref,home\"/>\t\t\t\t</EntityType>", {
        "GWSAMPLE_BASIC.Foo": {
            "@com.sap.vocabularies.Communication.v1.Contact": {
                "address": [{
                        "type": {
                            "EnumMember": "com.sap.vocabularies.Communication.v1.ContactInformationType/work " + "com.sap.vocabularies.Communication.v1.ContactInformationType/preferred " + "com.sap.vocabularies.Communication.v1.ContactInformationType/home"
                        },
                        uri: { "$Path": "P01" }
                    }]
            }
        },
        "GWSAMPLE_BASIC.Foo/P01": {
            "@com.sap.vocabularies.Communication.v1.IsEmailAddress": true
        }
    });
});
QUnit.test("convert sap:semantics=email with unsupported type", function (assert) {
    this.mock(_V2MetadataConverter.prototype).expects("mergeAnnotations").never();
    this.oLogMock.expects("warning").withExactArgs("Unsupported semantic type: foo", undefined, sClassName);
    testAnnotationConversion(assert, "\t\t\t\t<EntityType Name=\"Foo\">\t\t\t\t\t<Property Name=\"P01\" Type=\"Edm.String\" sap:semantics=\"email;type=foo\"/>\t\t\t\t</EntityType>", {
        "GWSAMPLE_BASIC.Foo": {
            "@com.sap.vocabularies.Communication.v1.Contact": {
                "address": [{
                        uri: { "$Path": "P01" }
                    }]
            }
        },
        "GWSAMPLE_BASIC.Foo/P01": {
            "@com.sap.vocabularies.Communication.v1.IsEmailAddress": true
        }
    });
});
QUnit.test("convert sap:semantics=email with un/supported type", function (assert) {
    this.mock(_V2MetadataConverter.prototype).expects("mergeAnnotations").never();
    this.oLogMock.expects("warning").withExactArgs("Unsupported semantic type: foo", undefined, sClassName);
    testAnnotationConversion(assert, "\t\t\t\t<EntityType Name=\"Foo\">\t\t\t\t\t<Property Name=\"P01\" Type=\"Edm.String\" sap:semantics=\"email;type=foo,work\"/>\t\t\t\t</EntityType>", {
        "GWSAMPLE_BASIC.Foo": {
            "@com.sap.vocabularies.Communication.v1.Contact": {
                "address": [{
                        uri: { "$Path": "P01" },
                        "type": {
                            "EnumMember": "com.sap.vocabularies.Communication.v1.ContactInformationType/work"
                        }
                    }]
            }
        },
        "GWSAMPLE_BASIC.Foo/P01": {
            "@com.sap.vocabularies.Communication.v1.IsEmailAddress": true
        }
    });
});
QUnit.test("convert sap:semantics=* to Event", function (assert) {
    this.mock(_V2MetadataConverter.prototype).expects("mergeAnnotations").never();
    testAnnotationConversion(assert, "\t\t\t\t<EntityType Name=\"Foo\">\t\t\t\t\t<Property Name=\"P01\" Type=\"Edm.String\" sap:semantics=\"dtstart\"/>\t\t\t\t\t<Property Name=\"P02\" Type=\"Edm.String\" sap:semantics=\"dtend\"/>\t\t\t\t\t<Property Name=\"P03\" Type=\"Edm.String\" sap:semantics=\"duration\"/>\t\t\t\t\t<Property Name=\"P04\" Type=\"Edm.String\" sap:semantics=\"class\"/>\t\t\t\t\t<Property Name=\"P05\" Type=\"Edm.String\" sap:semantics=\"status\"/>\t\t\t\t\t<Property Name=\"P06\" Type=\"Edm.String\" sap:semantics=\"transp\"/>\t\t\t\t\t<Property Name=\"P07\" Type=\"Edm.String\" sap:semantics=\"fbtype\"/>\t\t\t\t\t<Property Name=\"P08\" Type=\"Edm.String\" sap:semantics=\"wholeday\"/>\t\t\t\t\t<Property Name=\"P09\" Type=\"Edm.String\" sap:semantics=\"location\"/>\t\t\t\t</EntityType>", {
        "GWSAMPLE_BASIC.Foo": {
            "@com.sap.vocabularies.Communication.v1.Event": {
                "dtstart": { "$Path": "P01" },
                "dtend": { "$Path": "P02" },
                "duration": { "$Path": "P03" },
                "class": { "$Path": "P04" },
                "status": { "$Path": "P05" },
                "transp": { "$Path": "P06" },
                "fbtype": { "$Path": "P07" },
                "wholeday": { "$Path": "P08" },
                "location": { "$Path": "P09" }
            }
        }
    });
});
QUnit.test("convert sap:semantics=* to Task", function (assert) {
    this.mock(_V2MetadataConverter.prototype).expects("mergeAnnotations").never();
    testAnnotationConversion(assert, "\t\t\t\t<EntityType Name=\"Foo\">\t\t\t\t\t<Property Name=\"P01\" Type=\"Edm.String\" sap:semantics=\"due\"/>\t\t\t\t\t<Property Name=\"P02\" Type=\"Edm.String\" sap:semantics=\"completed\"/>\t\t\t\t\t<Property Name=\"P03\" Type=\"Edm.String\" sap:semantics=\"percent-complete\"/>\t\t\t\t\t<Property Name=\"P04\" Type=\"Edm.String\" sap:semantics=\"priority\"/>\t\t\t\t</EntityType>", {
        "GWSAMPLE_BASIC.Foo": {
            "@com.sap.vocabularies.Communication.v1.Task": {
                "due": { "$Path": "P01" },
                "completed": { "$Path": "P02" },
                "percentcomplete": { "$Path": "P03" },
                "priority": { "$Path": "P04" }
            }
        }
    });
});
QUnit.test("convert sap:semantics=* to Message", function (assert) {
    this.mock(_V2MetadataConverter.prototype).expects("mergeAnnotations").never();
    testAnnotationConversion(assert, "\t\t\t\t<EntityType Name=\"Foo\">\t\t\t\t\t<Property Name=\"P01\" Type=\"Edm.String\" sap:semantics=\"from\"/>\t\t\t\t\t<Property Name=\"P02\" Type=\"Edm.String\" sap:semantics=\"sender\"/>\t\t\t\t\t<Property Name=\"P03\" Type=\"Edm.String\" sap:semantics=\"subject\"/>\t\t\t\t\t<Property Name=\"P04\" Type=\"Edm.String\" sap:semantics=\"body\"/>\t\t\t\t\t<Property Name=\"P05\" Type=\"Edm.String\" sap:semantics=\"received\"/>\t\t\t\t</EntityType>", {
        "GWSAMPLE_BASIC.Foo": {
            "@com.sap.vocabularies.Communication.v1.Message": {
                "from": { "$Path": "P01" },
                "sender": { "$Path": "P02" },
                "subject": { "$Path": "P03" },
                "body": { "$Path": "P04" },
                "received": { "$Path": "P05" }
            }
        }
    });
});
QUnit.test("convert sap:semantics=* to Contact, Event, Task, Message", function (assert) {
    this.mock(_V2MetadataConverter.prototype).expects("mergeAnnotations").never();
    testAnnotationConversion(assert, "\t\t\t\t<EntityType Name=\"Foo\">\t\t\t\t\t<Property Name=\"P01\" Type=\"Edm.String\" sap:semantics=\"name\"/>\t\t\t\t\t<Property Name=\"P02\" Type=\"Edm.String\" sap:semantics=\"dtend\"/>\t\t\t\t\t<Property Name=\"P03\" Type=\"Edm.String\" sap:semantics=\"percent-complete\"/>\t\t\t\t\t<Property Name=\"P04\" Type=\"Edm.String\" sap:semantics=\"body\"/>\t\t\t\t</EntityType>", {
        "GWSAMPLE_BASIC.Foo": {
            "@com.sap.vocabularies.Communication.v1.Contact": {
                "fn": { "$Path": "P01" }
            },
            "@com.sap.vocabularies.Communication.v1.Event": {
                "dtend": { "$Path": "P02" }
            },
            "@com.sap.vocabularies.Communication.v1.Task": {
                "percentcomplete": { "$Path": "P03" }
            },
            "@com.sap.vocabularies.Communication.v1.Message": {
                "body": { "$Path": "P04" }
            }
        }
    });
});
[{
        annotationsV2: "sap:creatable=\"false\"",
        expectedAnnotationsV4: {
            "@Org.OData.Capabilities.V1.InsertRestrictions": {
                "Insertable": false
            }
        }
    }, {
        annotationsV2: "sap:deletable=\"false\"",
        expectedAnnotationsV4: {
            "@Org.OData.Capabilities.V1.DeleteRestrictions": {
                "Deletable": false
            }
        }
    }, {
        annotationsV2: "sap:deletable-path=\"PathExpression\"",
        expectedAnnotationsV4: {
            "@Org.OData.Capabilities.V1.DeleteRestrictions": {
                "Deletable": {
                    $Path: "PathExpression"
                }
            }
        }
    }, {
        annotationsV2: "sap:deletable=\"foo-bar\" sap:deletable-path=\"PathExpression\"",
        expectedAnnotationsV4: {
            "@Org.OData.Capabilities.V1.DeleteRestrictions": {
                "Deletable": false
            }
        },
        message: "Use either 'sap:deletable' or 'sap:deletable-path' at entity set" + " 'GWSAMPLE_BASIC.Container/FooSet'"
    }, {
        annotationsV2: "sap:deletable-path=\"PathExpression\" sap:deletable=\"foo-bar\"",
        expectedAnnotationsV4: {
            "@Org.OData.Capabilities.V1.DeleteRestrictions": {
                "Deletable": false
            }
        },
        message: "Use either 'sap:deletable' or 'sap:deletable-path' at entity set" + " 'GWSAMPLE_BASIC.Container/FooSet'"
    }, {
        annotationsV2: "sap:label=\"Value\"",
        expectedAnnotationsV4: {
            "@com.sap.vocabularies.Common.v1.Label": "Value"
        }
    }, {
        annotationsV2: "sap:pageable=\"false\"",
        expectedAnnotationsV4: {
            "@Org.OData.Capabilities.V1.SkipSupported": false,
            "@Org.OData.Capabilities.V1.TopSupported": false
        }
    }, {
        annotationsV2: "sap:pageable=\"true\"",
        expectedAnnotationsV4: {}
    }, {
        annotationsV2: "sap:requires-filter=\"true\"",
        expectedAnnotationsV4: {
            "@Org.OData.Capabilities.V1.FilterRestrictions": {
                "RequiresFilter": true
            }
        }
    }, {
        annotationsV2: "sap:requires-filter=\"false\"",
        expectedAnnotationsV4: {}
    }, {
        annotationsV2: "",
        expectedAnnotationsV4: {
            "@Org.OData.Capabilities.V1.SearchRestrictions": {
                "Searchable": false
            }
        }
    }, {
        annotationsV2: "sap:searchable=\"false\"",
        expectedAnnotationsV4: {
            "@Org.OData.Capabilities.V1.SearchRestrictions": {
                "Searchable": false
            }
        }
    }, {
        annotationsV2: "sap:searchable=\"true\"",
        expectedAnnotationsV4: null
    }, {
        annotationsV2: "sap:topable=\"false\"",
        expectedAnnotationsV4: {
            "@Org.OData.Capabilities.V1.TopSupported": false
        }
    }, {
        annotationsV2: "sap:topable=\"true\"",
        expectedAnnotationsV4: {}
    }, {
        annotationsV2: "sap:updatable=\"false\"",
        expectedAnnotationsV4: {
            "@Org.OData.Capabilities.V1.UpdateRestrictions": {
                "Updatable": false
            }
        }
    }, {
        annotationsV2: "sap:updatable-path=\"PathExpression\"",
        expectedAnnotationsV4: {
            "@Org.OData.Capabilities.V1.UpdateRestrictions": {
                "Updatable": {
                    $Path: "PathExpression"
                }
            }
        }
    }, {
        annotationsV2: "sap:updatable-path=\"PathExpression\" sap:updatable=\"foo-bar\"",
        expectedAnnotationsV4: {
            "@Org.OData.Capabilities.V1.UpdateRestrictions": {
                "Updatable": false
            }
        },
        message: "Use either 'sap:updatable' or 'sap:updatable-path' at entity set" + " 'GWSAMPLE_BASIC.Container/FooSet'"
    }, {
        annotationsV2: "sap:updatable=\"foo-bar\" sap:updatable-path=\"PathExpression\"",
        expectedAnnotationsV4: {
            "@Org.OData.Capabilities.V1.UpdateRestrictions": {
                "Updatable": false
            }
        },
        message: "Use either 'sap:updatable' or 'sap:updatable-path' at entity set" + " 'GWSAMPLE_BASIC.Container/FooSet'"
    }].forEach(function (oFixture) {
    var sTitle = "convert: V2 annotation at EntitySet: " + oFixture.annotationsV2;
    QUnit.test(sTitle, function (assert) {
        var mAnnotations = Object.assign({
            "@Org.OData.Capabilities.V1.SearchRestrictions": {
                "Searchable": false
            }
        }, oFixture.expectedAnnotationsV4), sXML = "\t\t\t\t\t<Schema Namespace=\"GWSAMPLE_BASIC\">\t\t\t\t\t\t<EntityType Name=\"Foo\"/>\t\t\t\t\t\t<EntityContainer Name=\"Container\">\t\t\t\t\t\t\t<EntitySet Name=\"FooSet\" EntityType=\"GWSAMPLE_BASIC.Foo\" " + oFixture.annotationsV2 + "/>\t\t\t\t\t\t\t</EntityContainer>\t\t\t\t\t</Schema>", oExpectedResult = {
            "$EntityContainer": "GWSAMPLE_BASIC.Container",
            "GWSAMPLE_BASIC.": {
                "$Annotations": {
                    "GWSAMPLE_BASIC.Container/FooSet": mAnnotations
                },
                "$kind": "Schema"
            },
            "GWSAMPLE_BASIC.Foo": {
                "$kind": "EntityType"
            },
            "GWSAMPLE_BASIC.Container": {
                "$kind": "EntityContainer",
                "FooSet": {
                    "$kind": "EntitySet",
                    "$Type": "GWSAMPLE_BASIC.Foo"
                }
            }
        };
        if (!oFixture.expectedAnnotationsV4) {
            delete oExpectedResult["GWSAMPLE_BASIC."].$Annotations;
        }
        if (oFixture.message) {
            this.oLogMock.expects("warning").withExactArgs("Inconsistent metadata in '/foo/bar/$metadata'", oFixture.message, sClassName);
        }
        testConversion(assert, sXML, oExpectedResult);
    });
});
[{
        convertedV2Annotations: {
            "GWSAMPLE_BASIC.0001.Foo/Bar": {
                "@com.sap.vocabularies.Common.v1.Label": "Value"
            }
        },
        v4Annotations: {},
        result: {
            "GWSAMPLE_BASIC.0001.Foo/Bar": {
                "@com.sap.vocabularies.Common.v1.Label": "Value"
            }
        }
    }, {
        convertedV2Annotations: {
            "GWSAMPLE_BASIC.0001.Foo/Bar": {
                "@com.sap.vocabularies.Common.v1.Label": "Value"
            }
        },
        v4Annotations: {
            "GWSAMPLE_BASIC.0001.Foo/tango": {
                "@com.sap.vocabularies.Common.v1.Label": "Value"
            }
        },
        result: {
            "GWSAMPLE_BASIC.0001.Foo/Bar": {
                "@com.sap.vocabularies.Common.v1.Label": "Value"
            },
            "GWSAMPLE_BASIC.0001.Foo/tango": {
                "@com.sap.vocabularies.Common.v1.Label": "Value"
            }
        }
    }, {
        convertedV2Annotations: {
            "GWSAMPLE_BASIC.0001.Foo/Bar": {
                "@com.sap.vocabularies.Common.v1.Label": "ValueV2"
            }
        },
        v4Annotations: {
            "GWSAMPLE_BASIC.0001.Foo/Bar": {
                "@com.sap.vocabularies.Common.v1.Label": "ValueV4"
            }
        },
        result: {
            "GWSAMPLE_BASIC.0001.Foo/Bar": {
                "@com.sap.vocabularies.Common.v1.Label": "ValueV4"
            }
        }
    }, {
        convertedV2Annotations: {
            "GWSAMPLE_BASIC.0001.Foo/Bar": {
                "@com.sap.vocabularies.Common.v1.Label": "Label"
            }
        },
        v4Annotations: {
            "GWSAMPLE_BASIC.0001.Foo/Bar": {
                "@com.sap.vocabularies.Common.v1.IsDigitSequence": true
            }
        },
        result: {
            "GWSAMPLE_BASIC.0001.Foo/Bar": {
                "@com.sap.vocabularies.Common.v1.IsDigitSequence": true,
                "@com.sap.vocabularies.Common.v1.Label": "Label"
            }
        }
    }, {
        convertedV2Annotations: {
            "GWSAMPLE_BASIC.0001.Foo/Bar": {
                "@Org.OData.Capabilities.V1.DeleteRestrictions": {
                    "Deletable": false
                },
                "@com.sap.vocabularies.Common.v1.Label": "Label",
                "@com.sap.vocabularies.Common.v1.QuickInfo": "Value"
            },
            "GWSAMPLE_BASIC.0001.Foo/ChaChaCha": {
                "@com.sap.vocabularies.Common.v1.Heading": "ValueV2",
                "@com.sap.vocabularies.Common.v1.Label": "LabelV2"
            }
        },
        v4Annotations: {
            "GWSAMPLE_BASIC.0001.Foo/Bar": {
                "@Org.OData.Capabilities.V1.DeleteRestrictions": {
                    "NonDeletableNavigationProperties": []
                },
                "@com.sap.vocabularies.Common.v1.IsDigitSequence": true,
                "@com.sap.vocabularies.Common.v1.Label": "LabelV4"
            },
            "GWSAMPLE_BASIC.0001.Foo/Jive": {
                "@com.sap.vocabularies.Common.v1.IsDigitSequence": true,
                "@com.sap.vocabularies.Common.v1.QuickInfo": "ValueV4"
            }
        },
        result: {
            "GWSAMPLE_BASIC.0001.Foo/Bar": {
                "@Org.OData.Capabilities.V1.DeleteRestrictions": {
                    "NonDeletableNavigationProperties": []
                },
                "@com.sap.vocabularies.Common.v1.IsDigitSequence": true,
                "@com.sap.vocabularies.Common.v1.Label": "LabelV4",
                "@com.sap.vocabularies.Common.v1.QuickInfo": "Value"
            },
            "GWSAMPLE_BASIC.0001.Foo/ChaChaCha": {
                "@com.sap.vocabularies.Common.v1.Heading": "ValueV2",
                "@com.sap.vocabularies.Common.v1.Label": "LabelV2"
            },
            "GWSAMPLE_BASIC.0001.Foo/Jive": {
                "@com.sap.vocabularies.Common.v1.IsDigitSequence": true,
                "@com.sap.vocabularies.Common.v1.QuickInfo": "ValueV4"
            }
        }
    }].forEach(function (oFixture, i) {
    QUnit.test("mergeAnnotations: complex merge - " + i, function (assert) {
        new _V2MetadataConverter().mergeAnnotations(oFixture.convertedV2Annotations, oFixture.v4Annotations);
        assert.deepEqual(oFixture.v4Annotations, oFixture.result);
    });
});
QUnit.test("convert: V4 Annotations", function (assert) {
    testConversion(assert, "\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\">\t\t\t\t\t<Annotations xmlns=\"" + sXmlnsEdm4 + "\" Target=\"f.Bar/f.Baz\">\t\t\t\t\t\t<Annotation Term=\"f.Binary\" Binary=\"T0RhdGE\"/>\t\t\t\t\t\t<Annotation Term=\"f.Bool\" Bool=\"false\"/>\t\t\t\t\t\t<Annotation Term=\"f.Date\" Date=\"2015-01-01\" />\t\t\t\t\t\t<Annotation Term=\"f.DateTimeOffset\"\t\t\t\t\t\t\tDateTimeOffset=\"2000-01-01T16:00:00.000-09:00\" />\t\t\t\t\t\t<Annotation Term=\"f.Decimal\" Decimal=\"3.14\" />\t\t\t\t\t\t<Annotation Term=\"f.Duration\" Duration=\"P11D23H59M59S\" />\t\t\t\t\t\t<Annotation Term=\"f.EnumMember\"\t\t\t\t\t\t\tEnumMember=\"f.Enum/Member1 f.Enum/Member2\"/>\t\t\t\t\t\t<Annotation Term=\"f.Float1\" Float=\"2.718\" />\t\t\t\t\t\t<Annotation Term=\"f.Float2\" Float=\"NaN\" />\t\t\t\t\t\t<Annotation Term=\"f.Float3\" Float=\"INF\" />\t\t\t\t\t\t<Annotation Term=\"f.Float4\" Float=\"-INF\" />\t\t\t\t\t\t<Annotation Term=\"f.Guid\"\t\t\t\t\t\t\tGuid=\"21EC2020-3AEA-1069-A2DD-08002B30309D\" />\t\t\t\t\t\t<Annotation Term=\"f.Int1\" Int=\"42\"/>\t\t\t\t\t\t<Annotation Term=\"f.Int2\" Int=\"9007199254740991\" />\t\t\t\t\t\t<Annotation Term=\"f.Int3\" Int=\"9007199254740992\" />\t\t\t\t\t\t<Annotation Term=\"f.String\" String=\"foobar\" />\t\t\t\t\t\t<Annotation Term=\"f.TimeOfDay\" TimeOfDay=\"21:45:00\" />\t\t\t\t\t\t<Annotation Term=\"f.AnnotationPath\"\t\t\t\t\t\t\tAnnotationPath=\"Path/f.Bar/f.Baz@f.Term\" />\t\t\t\t\t\t<Annotation Term=\"f.NavigationPropertyPath\"\t\t\t\t\t\t\tNavigationPropertyPath=\"Path/f.Bar/f.Baz\" />\t\t\t\t\t\t<Annotation Term=\"f.Path\" Path=\"Path/f.Bar/f.Baz\" />\t\t\t\t\t\t<Annotation Term=\"f.PropertyPath\" PropertyPath=\"Path/f.Bar/f.Baz\" />\t\t\t\t\t\t<Annotation Term=\"f.UrlRef\" UrlRef=\"http://foo.bar\" />\t\t\t\t\t\t<Annotation Term=\"f.Invalid\" Invalid=\"foo\" />\t\t\t\t\t\t<Annotation Term=\"f.Baz\" Qualifier=\"Employee\"/>\t\t\t\t\t</Annotations>\t\t\t\t\t<Annotations xmlns=\"" + sXmlnsEdm4 + "\"  Target=\"f.Bar/Abc\" \t\t\t\t\t\t\tQualifier=\"Employee\">\t\t\t\t\t\t<Annotation Term=\"f.Baz\"/>\t\t\t\t\t</Annotations>\t\t\t\t</Schema>", {
        "foo.": {
            "$kind": "Schema",
            "$Annotations": {
                "foo.Bar/foo.Baz": {
                    "@foo.Binary": { "$Binary": "T0RhdGE" },
                    "@foo.Bool": false,
                    "@foo.Date": { "$Date": "2015-01-01" },
                    "@foo.DateTimeOffset": {
                        "$DateTimeOffset": "2000-01-01T16:00:00.000-09:00"
                    },
                    "@foo.Decimal": { "$Decimal": "3.14" },
                    "@foo.Duration": { "$Duration": "P11D23H59M59S" },
                    "@foo.EnumMember": {
                        "$EnumMember": "foo.Enum/Member1 foo.Enum/Member2"
                    },
                    "@foo.Float1": 2.718,
                    "@foo.Float2": { "$Float": "NaN" },
                    "@foo.Float3": { "$Float": "INF" },
                    "@foo.Float4": { "$Float": "-INF" },
                    "@foo.Guid": { "$Guid": "21EC2020-3AEA-1069-A2DD-08002B30309D" },
                    "@foo.Int1": 42,
                    "@foo.Int2": 9007199254740991,
                    "@foo.Int3": { "$Int": "9007199254740992" },
                    "@foo.String": "foobar",
                    "@foo.TimeOfDay": { "$TimeOfDay": "21:45:00" },
                    "@foo.AnnotationPath": {
                        "$AnnotationPath": "Path/foo.Bar/foo.Baz@foo.Term"
                    },
                    "@foo.NavigationPropertyPath": {
                        "$NavigationPropertyPath": "Path/foo.Bar/foo.Baz"
                    },
                    "@foo.Path": { "$Path": "Path/foo.Bar/foo.Baz" },
                    "@foo.PropertyPath": { "$PropertyPath": "Path/foo.Bar/foo.Baz" },
                    "@foo.UrlRef": { "$UrlRef": "http://foo.bar" },
                    "@foo.Invalid": true,
                    "@foo.Baz#Employee": true
                },
                "foo.Bar/Abc": { "@foo.Baz#Employee": true }
            }
        }
    });
});
QUnit.test("inline annotations: Reference", function (assert) {
    testConversionForInclude(assert, "\t\t\t\t<edmx:Reference xmlns:edmx=\"" + sXmlnsEdmx4 + "\" Uri=\"qux/$metadata\">\t\t\t\t\t<Annotation xmlns=\"" + sXmlnsEdm4 + "\" Term=\"foo.Term\" String=\"Reference\"/>\t\t\t\t</edmx:Reference>", {
        "$Reference": {
            "qux/$metadata": {
                "@foo.Term": "Reference"
            }
        }
    });
});
QUnit.test("convert: sap:label at EntityType", function (assert) {
    testConversion(assert, "\t\t\t\t<Schema Namespace=\"foo\">\t\t\t\t\t<EntityType Name=\"Bar\" sap:label=\"LabelEntityType\"/>\t\t\t\t</Schema>", {
        "foo.": {
            "$Annotations": {
                "foo.Bar": {
                    "@com.sap.vocabularies.Common.v1.Label": "LabelEntityType"
                }
            },
            "$kind": "Schema"
        },
        "foo.Bar": {
            "$kind": "EntityType"
        }
    });
});
QUnit.test("convert: sap:label at FunctionImport and Parameter", function (assert) {
    testConversion(assert, "\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\">\t\t\t\t\t<EntityContainer Name=\"Container\">\t\t\t\t\t\t<FunctionImport m:HttpMethod=\"GET\" Name=\"FunctionImport\"\t\t\t\t\t\t\t\tsap:label=\"LabelFunctionImport\">\t\t\t\t\t\t\t<Parameter Name=\"Parameter\" Type=\"Edm.String\"\t\t\t\t\t\t\t\t\tsap:label=\"LabelParameter\">\t\t\t\t\t\t\t</Parameter>\t\t\t\t\t\t</FunctionImport>\t\t\t\t\t</EntityContainer>\t\t\t\t</Schema>", {
        "$EntityContainer": "foo.Container",
        "foo.": {
            "$kind": "Schema",
            "$Annotations": {
                "foo.Container/FunctionImport": {
                    "@com.sap.vocabularies.Common.v1.Label": "LabelFunctionImport"
                }
            }
        },
        "foo.Container": {
            "$kind": "EntityContainer",
            "FunctionImport": {
                "$kind": "FunctionImport",
                "$Function": "foo.FunctionImport"
            }
        },
        "foo.FunctionImport": [{
                "$kind": "Function",
                "$Parameter": [{
                        "$Name": "Parameter",
                        "$Type": "Edm.String",
                        "@com.sap.vocabularies.Common.v1.Label": "LabelParameter"
                    }]
            }]
    });
});
QUnit.test("convert sap:semantics=* from mV2toV4SimpleSemantics", function (assert) {
    this.mock(_V2MetadataConverter.prototype).expects("mergeAnnotations").never();
    testAnnotationConversion(assert, "\t\t\t\t<EntityType Name=\"Foo\">\t\t\t\t\t<Property Name=\"P01\" Type=\"Edm.String\" sap:semantics=\"fiscalyear\"/>\t\t\t\t\t<Property Name=\"P02\" Type=\"Edm.String\" sap:semantics=\"fiscalyearperiod\"/>\t\t\t\t\t<Property Name=\"P03\" Type=\"Edm.String\" sap:semantics=\"url\"/>\t\t\t\t\t<Property Name=\"P04\" Type=\"Edm.String\" sap:semantics=\"year\"/>\t\t\t\t\t<Property Name=\"P05\" Type=\"Edm.String\" sap:semantics=\"yearmonth\"/>\t\t\t\t\t<Property Name=\"P06\" Type=\"Edm.String\" sap:semantics=\"yearmonthday\"/>\t\t\t\t\t<Property Name=\"P07\" Type=\"Edm.String\" sap:semantics=\"yearquarter\"/>\t\t\t\t\t<Property Name=\"P08\" Type=\"Edm.String\" sap:semantics=\"yearweek\"/>\t\t\t\t</EntityType>", {
        "GWSAMPLE_BASIC.Foo/P01": {
            "@com.sap.vocabularies.Common.v1.IsFiscalYear": true
        },
        "GWSAMPLE_BASIC.Foo/P02": {
            "@com.sap.vocabularies.Common.v1.IsFiscalYearPeriod": true
        },
        "GWSAMPLE_BASIC.Foo/P03": {
            "@Org.OData.Core.V1.IsURL": true
        },
        "GWSAMPLE_BASIC.Foo/P04": {
            "@com.sap.vocabularies.Common.v1.IsCalendarYear": true
        },
        "GWSAMPLE_BASIC.Foo/P05": {
            "@com.sap.vocabularies.Common.v1.IsCalendarYearMonth": true
        },
        "GWSAMPLE_BASIC.Foo/P06": {
            "@com.sap.vocabularies.Common.v1.IsCalendarDate": true
        },
        "GWSAMPLE_BASIC.Foo/P07": {
            "@com.sap.vocabularies.Common.v1.IsCalendarYearQuarter": true
        },
        "GWSAMPLE_BASIC.Foo/P08": {
            "@com.sap.vocabularies.Common.v1.IsCalendarYearWeek": true
        }
    });
});
QUnit.test("mergeAnnotations called", function (assert) {
    this.mock(_V2MetadataConverter.prototype).expects("mergeAnnotations").withExactArgs({ "GWSAMPLE_BASIC.Foo/P01": { "@Org.OData.Core.V1.IsURL": true } }, { "GWSAMPLE_BASIC.Foo/P01": { "@Org.OData.Core.V1.IsURL": false } });
    testAnnotationConversion(assert, "\t\t\t\t<EntityType Name=\"Foo\">\t\t\t\t\t<Property Name=\"P01\" Type=\"Edm.String\" sap:semantics=\"url\"/>\t\t\t\t</EntityType>\t\t\t\t<Annotations xmlns=\"" + sXmlnsEdm4 + "\" Target=\"GWSAMPLE_BASIC.Foo/P01\">\t\t\t\t\t<Annotation Term=\"Org.OData.Core.V1.IsURL\" Bool=\"false\"/>\t\t\t\t</Annotations>", {
        "GWSAMPLE_BASIC.Foo/P01": {
            "@Org.OData.Core.V1.IsURL": false
        }
    });
});
QUnit.test("sap:creatable, sap:creatable-path at NavigationProperty;" + " sap:filterable, sap:sortable at Property", function (assert) {
    var sXML = "\t\t\t\t<Schema Namespace=\"GWSAMPLE_BASIC.0001\" Alias=\"GWSAMPLE_BASIC\">\t\t\t\t\t<ComplexType Name=\"Address\">\t\t\t\t\t\t<Property Name=\"Street\" Type=\"Edm.String\" sap:filterable=\"false\"\t\t\t\t\t\t\tsap:filter-restriction=\"interval\" sap:required-in-filter=\"true\"\t\t\t\t\t\t\tsap:sortable=\"false\"/>\t\t\t\t\t</ComplexType>\t\t\t\t\t<EntityContainer Name=\"Container\" m:IsDefaultEntityContainer=\"true\"><!-- ALL EntitySets in an EntityContainers of a Schema are handled -->\t\t\t\t\t\t<EntitySet Name=\"Customers\" EntityType=\"GWSAMPLE_BASIC.BusinessPartner\"\t\t\t\t\t\t\tsap:creatable=\"false\" sap:searchable=\"false\"/>\t\t\t\t\t\t<EntitySet Name=\"Suppliers\" EntityType=\"GWSAMPLE_BASIC.BusinessPartner\"\t\t\t\t\t\t\tsap:searchable=\"true\"/><!-- loop over EntityContainer's children does not fail for non-EntitySets -->\t\t\t\t\t\t<FunctionImport m:HttpMethod=\"GET\" Name=\"Foo\" ReturnType=\"Edm.String\"/>\t\t\t\t\t</EntityContainer><!-- EntitySets in ALL EntityContainers of a Schema are handled -->\t\t\t\t\t<EntityContainer Name=\"YetAnotherContainer\">\t\t\t\t\t\t<EntitySet Name=\"Suppliers\" EntityType=\"GWSAMPLE_BASIC.BusinessPartner\"\t\t\t\t\t\t\tsap:searchable=\"true\"/>\t\t\t\t\t</EntityContainer>\t\t\t\t\t<EntityType Name=\"BusinessPartner\">\t\t\t\t\t\t<Property Name=\"IsCreatable\" Type=\"Edm.Boolean\"/>\t\t\t\t\t\t<NavigationProperty Name=\"CreatableA\"\t\t\t\t\t\t\tsap:creatable=\"false\" sap:filterable=\"true\"\t\t\t\t\t\t\tRelationship=\"GWSAMPLE_BASIC.Assoc\" FromRole=\"From\" ToRole=\"To\"/>\t\t\t\t\t\t<NavigationProperty Name=\"CreatablePathA\"\t\t\t\t\t\t\tsap:creatable-path=\"IsCreatable\"\t\t\t\t\t\t\tRelationship=\"GWSAMPLE_BASIC.Assoc\" FromRole=\"From\" ToRole=\"To\"/>\t\t\t\t\t\t<NavigationProperty Name=\"ConflictA\" sap:creatable=\"true\"\t\t\t\t\t\t\tsap:creatable-path=\"n/a\"\t\t\t\t\t\t\tRelationship=\"GWSAMPLE_BASIC.Assoc\" FromRole=\"From\" ToRole=\"To\"/>\t\t\t\t\t\t<Property Name=\"FilterableA\" Type=\"Edm.String\" sap:filterable=\"false\"/>\t\t\t\t\t\t<Property Name=\"FilterableB\" Type=\"Edm.String\" sap:filterable=\"true\"/>\t\t\t\t\t\t<Property Name=\"FilterableSortable\" Type=\"Edm.String\"\t\t\t\t\t\t\tsap:filterable=\"false\" sap:sortable=\"false\"/>\t\t\t\t\t\t<Property Name=\"FilterRestrictionInterval\" Type=\"Edm.String\"\t\t\t\t\t\t\tsap:filter-restriction=\"interval\"/>\t\t\t\t\t\t<Property Name=\"FilterRestrictionMulti\" Type=\"Edm.String\"\t\t\t\t\t\t\tsap:filter-restriction=\"multi-value\"/>\t\t\t\t\t\t<Property Name=\"FilterRestrictionSingle\" Type=\"Edm.String\"\t\t\t\t\t\t\tsap:filter-restriction=\"single-value\"/>\t\t\t\t\t\t<Property Name=\"FilterRestrictionUnsupported\" Type=\"Edm.String\"\t\t\t\t\t\t\tsap:filter-restriction=\"unsupported\"/>\t\t\t\t\t\t<Property Name=\"RequiredInFilterA\" Type=\"Edm.String\"\t\t\t\t\t\t\tsap:required-in-filter=\"true\"/>\t\t\t\t\t\t<Property Name=\"RequiredInFilterB\" Type=\"Edm.String\"\t\t\t\t\t\t\tsap:required-in-filter=\"false\"/>\t\t\t\t\t\t<Property Name=\"RequiredInFilterC\" Type=\"Edm.String\"\t\t\t\t\t\t\tsap:required-in-filter=\"true\"/>\t\t\t\t\t\t<Property Name=\"SortableA\" Type=\"Edm.String\" sap:sortable=\"false\"/>\t\t\t\t\t\t<Property Name=\"SortableB\" Type=\"Edm.String\" sap:sortable=\"true\"/>\t\t\t\t\t\t<NavigationProperty Name=\"CreatableB\" sap:creatable=\"false\"\t\t\t\t\t\t\tRelationship=\"GWSAMPLE_BASIC.Assoc\" FromRole=\"From\" ToRole=\"To\"/>\t\t\t\t\t\t<NavigationProperty Name=\"CreatablePathB\"\t\t\t\t\t\t\tsap:creatable-path=\"IsCreatable\"\t\t\t\t\t\t\tRelationship=\"GWSAMPLE_BASIC.Assoc\" FromRole=\"From\" ToRole=\"To\"/>\t\t\t\t\t\t<NavigationProperty Name=\"ConflictB\" sap:creatable=\"false\"\t\t\t\t\t\t\tsap:creatable-path=\"n/a\"\t\t\t\t\t\t\tRelationship=\"GWSAMPLE_BASIC.Assoc\" FromRole=\"From\" ToRole=\"To\"/>\t\t\t\t\t\t<NavigationProperty Name=\"CreatableTrue\" sap:creatable=\"true\"\t\t\t\t\t\t\tRelationship=\"GWSAMPLE_BASIC.Assoc\" FromRole=\"From\" ToRole=\"To\"/>\t\t\t\t\t\t<NavigationProperty Name=\"FilterableFalse\" sap:filterable=\"false\"\t\t\t\t\t\t\tRelationship=\"GWSAMPLE_BASIC.Assoc\" FromRole=\"From\" ToRole=\"To\"/>\t\t\t\t\t\t<NavigationProperty Name=\"FilterableTrue\" sap:filterable=\"true\"\t\t\t\t\t\t\tRelationship=\"GWSAMPLE_BASIC.Assoc\" FromRole=\"From\" ToRole=\"To\"/>\t\t\t\t\t</EntityType>\t\t\t\t\t<Association Name=\"Assoc\">\t\t\t\t\t\t<End Type=\"GWSAMPLE_BASIC.BusinessPartner\" Multiplicity=\"1\" Role=\"From\"/>\t\t\t\t\t\t<End Type=\"GWSAMPLE_BASIC.BusinessPartner\" Multiplicity=\"0..1\" Role=\"To\"/>\t\t\t\t\t</Association>\t\t\t\t</Schema><!-- EntitySets in EntityContainers of ALL Schemas are handled -->\t\t\t\t<Schema Namespace=\"GWSAMPLE_BASIC.0002\">\t\t\t\t\t<EntityContainer Name=\"Container\">\t\t\t\t\t\t<EntitySet Name=\"Suppliers\" EntityType=\"GWSAMPLE_BASIC.BusinessPartner\"\t\t\t\t\t\t\tsap:searchable=\"true\"/>\t\t\t\t\t</EntityContainer>\t\t\t\t</Schema>", mAnnotations = {
        "@com.sap.vocabularies.Common.v1.FilterExpressionRestrictions": [{
                "AllowedExpressions": {
                    "EnumMember": "com.sap.vocabularies.Common.v1.FilterExpressionType/SingleInterval"
                },
                "Property": { "$PropertyPath": "FilterRestrictionInterval" }
            }, {
                "AllowedExpressions": {
                    "EnumMember": "com.sap.vocabularies.Common.v1.FilterExpressionType/MultiValue"
                },
                "Property": { "$PropertyPath": "FilterRestrictionMulti" }
            }, {
                "AllowedExpressions": {
                    "EnumMember": "com.sap.vocabularies.Common.v1.FilterExpressionType/SingleValue"
                },
                "Property": { "$PropertyPath": "FilterRestrictionSingle" }
            }],
        "@Org.OData.Capabilities.V1.FilterRestrictions": {
            "NonFilterableProperties": [{
                    "$PropertyPath": "FilterableA"
                }, {
                    "$PropertyPath": "FilterableSortable"
                }],
            "RequiredProperties": [{
                    "$PropertyPath": "RequiredInFilterA"
                }, {
                    "$PropertyPath": "RequiredInFilterC"
                }]
        },
        "@Org.OData.Capabilities.V1.InsertRestrictions": {
            "NonInsertableNavigationProperties": [{
                    "$NavigationPropertyPath": "CreatableA"
                }, {
                    "$If": [{
                            "$Not": {
                                "$Path": "IsCreatable"
                            }
                        }, {
                            "$NavigationPropertyPath": "CreatablePathA"
                        }]
                }, {
                    "$NavigationPropertyPath": "ConflictA"
                }, {
                    "$NavigationPropertyPath": "CreatableB"
                }, {
                    "$If": [{
                            "$Not": {
                                "$Path": "IsCreatable"
                            }
                        }, {
                            "$NavigationPropertyPath": "CreatablePathB"
                        }]
                }, {
                    "$NavigationPropertyPath": "ConflictB"
                }]
        },
        "@Org.OData.Capabilities.V1.NavigationRestrictions": {
            "RestrictedProperties": [{
                    "NavigationProperty": {
                        "$NavigationPropertyPath": "FilterableFalse"
                    },
                    "FilterRestrictions": {
                        "Filterable": false
                    }
                }]
        },
        "@Org.OData.Capabilities.V1.SortRestrictions": {
            "NonSortableProperties": [{
                    "$PropertyPath": "FilterableSortable"
                }, {
                    "$PropertyPath": "SortableA"
                }]
        }
    }, oExpectedResult = {
        "GWSAMPLE_BASIC.0001.": {
            "$Annotations": {
                "GWSAMPLE_BASIC.0001.Container/Customers": _Helper.merge({
                    "@Org.OData.Capabilities.V1.InsertRestrictions": {
                        "Insertable": false
                    },
                    "@Org.OData.Capabilities.V1.SearchRestrictions": {
                        "Searchable": false
                    }
                }, mAnnotations),
                "GWSAMPLE_BASIC.0001.Container/Suppliers": mAnnotations,
                "GWSAMPLE_BASIC.0001.YetAnotherContainer/Suppliers": mAnnotations
            },
            "$kind": "Schema"
        },
        "GWSAMPLE_BASIC.0002.": {
            "$Annotations": {
                "GWSAMPLE_BASIC.0002.Container/Suppliers": mAnnotations
            },
            "$kind": "Schema"
        }
    };
    this.oLogMock.expects("warning").withExactArgs("Unsupported SAP annotation at a complex type in '/foo/bar/$metadata'", "sap:filterable at property 'GWSAMPLE_BASIC.0001.Address/Street'", sClassName);
    this.oLogMock.expects("warning").withExactArgs("Unsupported SAP annotation at a complex type in '/foo/bar/$metadata'", "sap:filter-restriction at property 'GWSAMPLE_BASIC.0001.Address/Street'", sClassName);
    this.oLogMock.expects("warning").withExactArgs("Unsupported SAP annotation at a complex type in '/foo/bar/$metadata'", "sap:required-in-filter at property 'GWSAMPLE_BASIC.0001.Address/Street'", sClassName);
    this.oLogMock.expects("warning").withExactArgs("Unsupported SAP annotation at a complex type in '/foo/bar/$metadata'", "sap:sortable at property 'GWSAMPLE_BASIC.0001.Address/Street'", sClassName);
    this.oLogMock.expects("warning").withExactArgs("Inconsistent metadata in '/foo/bar/$metadata'", "Use either 'sap:creatable' or 'sap:creatable-path' at navigation property" + " 'GWSAMPLE_BASIC.0001.BusinessPartner/ConflictA'", sClassName);
    this.oLogMock.expects("warning").withExactArgs("Inconsistent metadata in '/foo/bar/$metadata'", "Use either 'sap:creatable' or 'sap:creatable-path' at navigation property" + " 'GWSAMPLE_BASIC.0001.BusinessPartner/ConflictB'", sClassName);
    this.oLogMock.expects("warning").withExactArgs("Inconsistent metadata in '/foo/bar/$metadata'", "Unsupported sap:filter-restriction=\"unsupported\" at property" + " 'GWSAMPLE_BASIC.0001.BusinessPartner/FilterRestrictionUnsupported'", sClassName);
    testConversion(assert, sXML, oExpectedResult, true);
});
QUnit.test("sap:updatable and sap:creatable at Property", function (assert) {
    var sXML = "\t\t\t\t<Schema Namespace=\"GWSAMPLE_BASIC.0001\" Alias=\"GWSAMPLE_BASIC\">\t\t\t\t\t<EntityType Name=\"BusinessPartner\">\t\t\t\t\t\t<Property Name=\"Computed\" Type=\"Edm.String\" sap:creatable=\"false\"\t\t\t\t\t\t\tsap:label=\"Computed\" sap:updatable=\"false\"/>\t\t\t\t\t\t<Property Name=\"Immutable\" Type=\"Edm.String\" sap:creatable=\"true\"\t\t\t\t\t\t\tsap:label=\"Immutable\" sap:updatable=\"false\"/>\t\t\t\t\t</EntityType>\t\t\t\t</Schema>", oExpectedResult = {
        "GWSAMPLE_BASIC.0001.": {
            "$Annotations": {
                "GWSAMPLE_BASIC.0001.BusinessPartner/Computed": {
                    "@com.sap.vocabularies.Common.v1.Label": "Computed",
                    "@Org.OData.Core.V1.Computed": true
                },
                "GWSAMPLE_BASIC.0001.BusinessPartner/Immutable": {
                    "@com.sap.vocabularies.Common.v1.Label": "Immutable",
                    "@Org.OData.Core.V1.Immutable": true
                }
            },
            "$kind": "Schema"
        }
    };
    testConversion(assert, sXML, oExpectedResult, true);
});
QUnit.test("sap:unit", function (assert) {
    var sXML = "\t\t\t\t<Schema Namespace=\"GWSAMPLE_BASIC.0001\" Alias=\"GWSAMPLE_BASIC\">\t\t\t\t\t<ComplexType Name=\"CT_Parts\">\t\t\t\t\t\t<Property Name=\"Weight\" Type=\"Edm.Decimal\"\t\t\t\t\t\t\tsap:unit=\"WeightUnit\"/>\t\t\t\t\t\t<Property Name=\"WeightUnit\" Type=\"Edm.String\"\t\t\t\t\t\t\tsap:semantics=\"unit-of-measure\"/>\t\t\t\t\t</ComplexType>\t\t\t\t\t<EntityType Name=\"Product\">\t\t\t\t\t\t<Property Name=\"Parts\" Type=\"GWSAMPLE_BASIC.CT_Parts\"/>\t\t\t\t\t\t<Property Name=\"GrossWeight\" Type=\"Edm.Decimal\"\t\t\t\t\t\t\tsap:unit=\"Parts/WeightUnit\"/>\t\t\t\t\t\t<Property Name=\"Depth\" Type=\"Edm.Decimal\" sap:unit=\"DepthUnit\"\t\t\t\t\t\t\tsap:label=\"Depth\"/>\t\t\t\t\t\t<Property Name=\"DepthUnit\" Type=\"Edm.String\"\t\t\t\t\t\t\tsap:semantics=\"unit-of-measure\"/>\t\t\t\t\t\t<Property Name=\"Price\" Type=\"Edm.Decimal\" sap:unit=\"PriceCurrency\"/>\t\t\t\t\t\t<Property Name=\"NetPrice\" Type=\"Edm.Decimal\" sap:unit=\"PriceCurrency\"/>\t\t\t\t\t\t<Property Name=\"PriceCurrency\" Type=\"Edm.String\"\t\t\t\t\t\t\tsap:semantics=\"currency-code\"/>\t\t\t\t\t\t<Property Name=\"NetWeight\" Type=\"Edm.Decimal\"\t\t\t\t\t\t\tsap:unit=\"toMeasure/WeightUnit\" sap:label=\"Net Weight\"/>\t\t\t\t\t\t<Property Name=\"PackagingWeight\" Type=\"Edm.Decimal\"\t\t\t\t\t\t\tsap:unit=\"toMeasure/Parts/WeightUnit\" sap:label=\"Packaging Weight\"/>\t\t\t\t\t\t<NavigationProperty Name=\"toMeasure\"\t\t\t\t\t\t\tRelationship=\"GWSAMPLE_BASIC.Assoc_Product_Measure\"\t\t\t\t\t\t\tFromRole=\"FromRole_Assoc_Product_Measure\"\t\t\t\t\t\t\tToRole=\"ToRole_Assoc_Product_Measure\" /><!-- invalid sap:unit -->\t\t\t\t\t\t<Property Name=\"WeightMissingUnit0\" Type=\"Edm.Decimal\"\t\t\t\t\t\t\tsap:unit=\"Parts/MissingUnit/Foo\"/>\t\t\t\t\t\t<Property Name=\"Width\" Type=\"Edm.Decimal\" sap:unit=\"InvalidUnit\"/>\t\t\t\t\t\t<Property Name=\"InvalidUnit\" Type=\"Edm.String\"\t\t\t\t\t\t\tsap:semantics=\"invalid\"/>\t\t\t\t\t\t<Property Name=\"WeightMissingUnit1\" Type=\"Edm.Decimal\"\t\t\t\t\t\t\tsap:unit=\"MissingUnit/Foo\" sap:label=\"Weight Missing Unit\"/>\t\t\t\t\t</EntityType>\t\t\t\t\t<EntityType Name=\"Measure\">\t\t\t\t\t\t<Property Name=\"Parts\" Type=\"GWSAMPLE_BASIC.CT_Parts\"/>\t\t\t\t\t\t<Property Name=\"WeightUnit\" Type=\"Edm.String\"\t\t\t\t\t\t\tsap:semantics=\"unit-of-measure\"/>\t\t\t\t\t</EntityType>\t\t\t\t\t<Association Name=\"Assoc_Product_Measure\">\t\t\t\t\t\t<End Type=\"GWSAMPLE_BASIC.0001.Product\" Multiplicity=\"1\"\t\t\t\t\t\t\tRole=\"FromRole_Assoc_Products_Measure\" />\t\t\t\t\t\t<End Type=\"GWSAMPLE_BASIC.0001.Measure\" Multiplicity=\"*\"\t\t\t\t\t\t\tRole=\"ToRole_Assoc_Product_Measure\" />\t\t\t\t\t</Association>\t\t\t\t\t<Annotations xmlns=\"" + sXmlnsEdm4 + "\" Target=\"GWSAMPLE_BASIC.Product/NetPrice\">\t\t\t\t\t\t<Annotation Term=\"Org.OData.Measures.V1.ISOCurrency\" Path=\"Foo/Bar\"/>\t\t\t\t\t</Annotations>\t\t\t\t</Schema><!-- Test for empty $Annotation map -->\t\t\t\t<Schema Namespace=\"GWSAMPLE_BASIC.0002\">\t\t\t\t\t<EntityType Name=\"Product\">\t\t\t\t\t\t<Property Name=\"Depth\" Type=\"Edm.Decimal\" sap:unit=\"DepthUnit\"/>\t\t\t\t\t\t<Property Name=\"DepthUnit\" Type=\"Edm.String\"\t\t\t\t\t\t\tsap:semantics=\"unit-of-measure\"/>\t\t\t\t\t</EntityType>\t\t\t\t</Schema>", oExpectedResult = {
        "GWSAMPLE_BASIC.0001.": {
            "$Annotations": {
                "GWSAMPLE_BASIC.0001.Product/Depth": {
                    "@Org.OData.Measures.V1.Unit": {
                        "$Path": "DepthUnit"
                    },
                    "@com.sap.vocabularies.Common.v1.Label": "Depth"
                },
                "GWSAMPLE_BASIC.0001.Product/GrossWeight": {
                    "@Org.OData.Measures.V1.Unit": {
                        "$Path": "Parts/WeightUnit"
                    }
                },
                "GWSAMPLE_BASIC.0001.Product/PackagingWeight": {
                    "@Org.OData.Measures.V1.Unit": {
                        "$Path": "toMeasure/Parts/WeightUnit"
                    },
                    "@com.sap.vocabularies.Common.v1.Label": "Packaging Weight"
                },
                "GWSAMPLE_BASIC.0001.Product/Price": {
                    "@Org.OData.Measures.V1.ISOCurrency": {
                        "$Path": "PriceCurrency"
                    }
                },
                "GWSAMPLE_BASIC.0001.Product/NetPrice": {
                    "@Org.OData.Measures.V1.ISOCurrency": {
                        "$Path": "Foo/Bar"
                    }
                },
                "GWSAMPLE_BASIC.0001.CT_Parts/Weight": {
                    "@Org.OData.Measures.V1.Unit": {
                        "$Path": "WeightUnit"
                    }
                },
                "GWSAMPLE_BASIC.0001.Product/WeightMissingUnit1": {
                    "@com.sap.vocabularies.Common.v1.Label": "Weight Missing Unit"
                },
                "GWSAMPLE_BASIC.0001.Product/NetWeight": {
                    "@Org.OData.Measures.V1.Unit": {
                        "$Path": "toMeasure/WeightUnit"
                    },
                    "@com.sap.vocabularies.Common.v1.Label": "Net Weight"
                }
            },
            "$kind": "Schema"
        },
        "GWSAMPLE_BASIC.0002.": {
            "$Annotations": {
                "GWSAMPLE_BASIC.0002.Product/Depth": {
                    "@Org.OData.Measures.V1.Unit": {
                        "$Path": "DepthUnit"
                    }
                }
            },
            "$kind": "Schema"
        }
    };
    this.oLogMock.expects("warning").withExactArgs("Unsupported sap:semantics at sap:unit='InvalidUnit';" + " expected 'currency-code' or 'unit-of-measure'", "GWSAMPLE_BASIC.0001.Product/Width", sClassName);
    this.oLogMock.expects("warning").withExactArgs("Path 'MissingUnit/Foo' for sap:unit cannot be resolved", "GWSAMPLE_BASIC.0001.Product/WeightMissingUnit1", sClassName);
    this.oLogMock.expects("warning").withExactArgs("Path 'Parts/MissingUnit/Foo' for sap:unit cannot be resolved", "GWSAMPLE_BASIC.0001.Product/WeightMissingUnit0", sClassName);
    this.oLogMock.expects("warning").withExactArgs("Unsupported annotation 'sap:semantics'", sinon.match(/<Property.*sap:semantics="invalid".*\/>/), sClassName);
    testConversion(assert, sXML, oExpectedResult, true);
});
QUnit.test("collectSapAnnotations/warnUnusedSapAnnotations", function (assert) {
    var oLogMock = this.oLogMock;
    function warn(rElement, sName) {
        oLogMock.expects("warning").withExactArgs("Unsupported annotation 'sap:" + sName + "'", sinon.match(rElement), sClassName);
    }
    warn(/<Schema.*sap:bar="baz".*>/, "bar");
    warn(/<ComplexType.*sap:bar="baz".*\/>/, "bar");
    warn(/<EntityType.*sap:bar="baz".*>/, "bar", "baz");
    warn(/<Association.*sap:bar="baz".*>/, "bar", "baz");
    warn(/<Property.*sap:bar="baz".*\/>/, "bar", "baz");
    warn(/<NavigationProperty.*sap:bar="baz".*\/>/, "bar", "baz");
    warn(/<EntityContainer.*sap:bar="baz".*>/, "bar", "baz");
    warn(/<EntityContainer.*sap:foo="fuz".*>/, "foo", "fuz");
    warn(/<EntitySet.*sap:bar="baz".*\/>/, "bar", "baz");
    warn(/<FunctionImport.*sap:applicable-path="foo".*\/>/, "applicable-path", "foo");
    oLogMock.expects("warning").withExactArgs("Unsupported HttpMethod at FunctionImport" + " 'BoundFunctionNoGET', removing this FunctionImport", undefined, sClassName);
    testConversion(assert, "\t\t\t<Schema Namespace=\"foo\" sap:bar=\"baz\">\t\t\t\t<ComplexType Name=\"MyComplexType\" sap:bar=\"baz\"/>\t\t\t\t<EntityType Name=\"MyEntityType\" sap:content-version=\"1\" sap:bar=\"baz\">\t\t\t\t\t<Key>\t\t\t\t\t\t<PropertyRef Name=\"MyProperty\"/>\t\t\t\t\t</Key>\t\t\t\t\t<Property Name=\"MyProperty\" Type=\"Edm.String\" sap:bar=\"baz\"/>\t\t\t\t\t<NavigationProperty Name=\"ToSomewhere\" Relationship=\"foo.Assoc\" \t\t\t\t\t\tToRole=\"A\" sap:bar=\"baz\"/>\t\t\t\t</EntityType>\t\t\t\t<Association Name=\"Assoc\" sap:content-version=\"1\" sap:bar=\"baz\">\t\t\t\t\t<End Type=\"foo.MyEntityType\" Role=\"A\"/>\t\t\t\t\t<End Type=\"foo.MyEntityType\" Role=\"B\"/>\t\t\t\t</Association>\t\t\t\t<EntityContainer Name=\"Container\" sap:bar=\"baz\" sap:foo=\"fuz\">\t\t\t\t\t<EntitySet Name=\"MyEntitySet\" EntityType=\"foo.MyEntityType\" \t\t\t\t\t\tsap:content-version=\"1\" sap:bar=\"baz\"/>\t\t\t\t\t<FunctionImport Name=\"BoundFunctionNoGET\"\t\t\t\t\t\tsap:action-for=\"foo.MyEntityType\" sap:applicable-path=\"bar\"/>\t\t\t\t\t<FunctionImport m:HttpMethod=\"GET\" Name=\"MyFunction\"\t\t\t\t\t\tsap:applicable-path=\"foo\"/>\t\t\t\t\t<FunctionImport m:HttpMethod=\"GET\" Name=\"BoundFunction\"\t\t\t\t\t\tsap:action-for=\"foo.MyEntityType\" sap:applicable-path=\"bar\"/>\t\t\t\t\t<AssociationSet Name=\"MyAssociationSet\" Association=\"foo.Assoc\"\t\t\t\t\t\t\tsap:creatable=\"false\" sap:deletable=\"false\" sap:updatable=\"false\">\t\t\t\t\t\t<End EntitySet=\"MyEntitySet\" Role=\"A\"/>\t\t\t\t\t\t<End EntitySet=\"MyEntitySet\" Role=\"B\"/>\t\t\t\t\t</AssociationSet>\t\t\t\t</EntityContainer>\t\t\t</Schema>", {}, true);
});
QUnit.test("sap:schema-version", function (assert) {
    testConversion(assert, "<Schema Namespace=\"foo\" sap:schema-version=\"1\"/>", {
        "foo.": {
            $kind: "Schema",
            "@Org.Odata.Core.V1.SchemaVersion": "1"
        }
    });
});
QUnit.test("duplicate schema children; last one wins", function (assert) {
    var that = this;
    [
        "Duplicate qualified name duplicates.",
        "Duplicate qualified name duplicates.ArtistsType",
        "Duplicate qualified name duplicates.Address",
        "Duplicate qualified name duplicates.GetDefaults",
        "Duplicate qualified name duplicates.Container"
    ].forEach(function (sWarning) {
        that.oLogMock.expects("warning").withExactArgs(sWarning, undefined, "sap.ui.model.odata.v4.lib._MetadataConverter");
    });
    testConversion(assert, "<Schema Namespace=\"duplicates\"/><Schema Namespace=\"duplicates\">\t<ComplexType Name=\"ArtistsType\"/>\t<EntityType Name=\"ArtistsType\">\t\t<Key>\t\t\t<PropertyRef Name=\"ArtistID\"/>\t\t\t<PropertyRef Name=\"IsActiveEntity\"/>\t\t</Key>\t\t<Property Name=\"ArtistID\" Type=\"Edm.String\" Nullable=\"false\"/>\t\t<Property Name=\"IsActiveEntity\" Type=\"Edm.Boolean\" Nullable=\"false\"/>\t</EntityType>\t<EntityType Name=\"Address\"/>\t<ComplexType Name=\"Address\">\t\t<Property Name=\"City\" Type=\"Edm.String\"/>\t</ComplexType>\t<ComplexType Name=\"GetDefaults\"/>\t<ComplexType Name=\"Container\"/>\t<EntityContainer Name=\"Container\">\t\t<EntitySet Name=\"Artists\" EntityType=\"duplicates.ArtistsType\"/>\t\t<FunctionImport Name=\"GetDefaults\" ReturnType=\"duplicates.ArtistsType\" m:HttpMethod=\"GET\">\t\t\t<Parameter Name=\"_it\" Type=\"Collection(duplicates.ArtistsType)\" Nullable=\"false\"/>\t\t</FunctionImport>\t</EntityContainer></Schema>", {
        "$EntityContainer": "duplicates.Container",
        "duplicates.": {
            "$Annotations": {
                "duplicates.Container/Artists": {
                    "@Org.OData.Capabilities.V1.SearchRestrictions": {
                        "Searchable": false
                    }
                }
            },
            "$kind": "Schema"
        },
        "duplicates.Address": {
            "$kind": "ComplexType",
            "City": {
                "$Type": "Edm.String",
                "$kind": "Property"
            }
        },
        "duplicates.ArtistsType": {
            "$Key": [
                "ArtistID",
                "IsActiveEntity"
            ],
            "$kind": "EntityType",
            "ArtistID": {
                "$Nullable": false,
                "$Type": "Edm.String",
                "$kind": "Property"
            },
            "IsActiveEntity": {
                "$Nullable": false,
                "$Type": "Edm.Boolean",
                "$kind": "Property"
            }
        },
        "duplicates.Container": {
            "$kind": "EntityContainer",
            "Artists": {
                "$Type": "duplicates.ArtistsType",
                "$kind": "EntitySet"
            },
            "GetDefaults": {
                "$Function": "duplicates.GetDefaults",
                "$kind": "FunctionImport"
            }
        },
        "duplicates.GetDefaults": [{
                "$Parameter": [{
                        "$Name": "_it",
                        "$Nullable": false,
                        "$Type": "duplicates.ArtistsType",
                        "$isCollection": true
                    }],
                "$ReturnType": {
                    "$Type": "duplicates.ArtistsType"
                },
                "$kind": "Function"
            }]
    });
});