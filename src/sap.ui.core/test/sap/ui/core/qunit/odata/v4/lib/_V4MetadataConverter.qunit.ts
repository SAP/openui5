import jQuery from "jquery.sap.global";
import Log from "sap/base/Log";
import _V4MetadataConverter from "sap/ui/model/odata/v4/lib/_V4MetadataConverter";
import TestUtils from "sap/ui/test/TestUtils";
import XMLHelper from "sap/ui/util/XMLHelper";
var sEdmx = "<edmx:Edmx Version=\"4.0\" xmlns:edmx=\"http://docs.oasis-open.org/odata/ns/edmx\"" + " xmlns=\"http://docs.oasis-open.org/odata/ns/edm\">", mFixture = {
    "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/$metadata": { source: "metadata.xml" },
    "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/metadata.json": { source: "metadata.json" }
};
function testConversion(assert, sXmlSnippet, oExpected) {
    var oXML = xml(assert, sEdmx + sXmlSnippet + "</edmx:Edmx>"), oResult = new _V4MetadataConverter().convertXMLMetadata(oXML);
    oExpected.$Version = "4.0";
    assert.deepEqual(oResult, oExpected);
}
function xml(assert, sXml) {
    var oDocument = XMLHelper.parse(sXml);
    assert.strictEqual(oDocument.parseError.errorCode, 0, "XML parsed correctly");
    return oDocument;
}
QUnit.module("sap.ui.model.odata.v4.lib._V4MetadataConverter", {
    beforeEach: function () {
        TestUtils.useFakeServer(this._oSandbox, "sap/ui/core/qunit/odata/v4/data", mFixture);
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
    }
});
QUnit.test("convertXMLMetadata: Singleton", function (assert) {
    testConversion(assert, "\t\t\t\t<edmx:DataServices>\t\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\">\t\t\t\t\t\t<EntityContainer Name=\"Container\">\t\t\t\t\t\t\t<Singleton Name=\"Me\" Type=\"f.Worker\">\t\t\t\t\t\t\t\t<NavigationPropertyBinding Path=\"Manager\" Target=\"f.Manager\"/>\t\t\t\t\t\t\t</Singleton>\t\t\t\t\t\t</EntityContainer>\t\t\t\t\t</Schema>\t\t\t\t</edmx:DataServices>", {
        "$EntityContainer": "foo.Container",
        "foo.": {
            "$kind": "Schema"
        },
        "foo.Container": {
            "$kind": "EntityContainer",
            "Me": {
                "$kind": "Singleton",
                "$NavigationPropertyBinding": {
                    "Manager": "foo.Manager"
                },
                "$Type": "foo.Worker"
            }
        }
    });
});
QUnit.test("convertXMLMetadata: Reference", function (assert) {
    testConversion(assert, "\t\t\t\t<edmx:Reference Uri=\"/qux/$metadata\">\t\t\t\t\t<edmx:Include Namespace=\"qux.foo\"/>\t\t\t\t\t<edmx:Include Namespace=\"qux.bar\"/>\t\t\t\t\t<edmx:IncludeAnnotations TermNamespace=\"qux.foo\"/>\t\t\t\t\t<edmx:IncludeAnnotations TermNamespace=\"qux.bar\" TargetNamespace=\"qux.bar\"\t\t\t\t\t\tQualifier=\"Tablet\"/>\t\t\t\t</edmx:Reference>\t\t\t\t<edmx:Reference Uri=\"/bla/$metadata\">\t\t\t\t\t<edmx:Include Namespace=\"bla\"/>\t\t\t\t</edmx:Reference>", {
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
    testConversion(assert, "\t\t\t\t<edmx:Reference Uri=\"/qux/$metadata\">\t\t\t\t\t<edmx:Include Namespace=\"qux\" Alias=\"q\"/>\t\t\t\t</edmx:Reference>\t\t\t\t<edmx:DataServices>\t\t\t\t\t<Schema Namespace=\"bar\">\t\t\t\t\t\t<ComplexType Name=\"Worker\">\t\t\t\t\t\t\t<Property Name=\"Something\" Type=\"q.Something\"/>\t\t\t\t\t\t\t<Property Name=\"ManyThings\" Type=\"Collection(q.Something)\"/>\t\t\t\t\t\t\t<NavigationProperty Name=\"DefaultAddress\" Type=\"f.Address\"/>\t\t\t\t\t\t\t<NavigationProperty Name=\"AllAddresses\" Type=\"Collection(f.Address)\"/>\t\t\t\t\t\t</ComplexType>\t\t\t\t\t</Schema>\t\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\"/>\t\t\t\t</edmx:DataServices>", {
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
                "$Type": "qux.Something"
            },
            "ManyThings": {
                "$kind": "Property",
                "$isCollection": true,
                "$Type": "qux.Something"
            },
            "DefaultAddress": {
                "$kind": "NavigationProperty",
                "$Type": "foo.Address"
            },
            "AllAddresses": {
                "$kind": "NavigationProperty",
                "$isCollection": true,
                "$Type": "foo.Address"
            }
        },
        "foo.": {
            "$kind": "Schema"
        }
    });
});
QUnit.test("convertXMLMetadata: aliases in container", function (assert) {
    testConversion(assert, "\t\t\t\t<edmx:DataServices>\t\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\">\t\t\t\t\t\t<EntityContainer Name=\"Container\">\t\t\t\t\t\t\t<EntitySet Name=\"SpecialTeams\" EntityType=\"f.Team\">\t\t\t\t\t\t\t</EntitySet>\t\t\t\t\t\t\t<EntitySet Name=\"Teams\" EntityType=\"f.Team\">\t\t\t\t\t\t\t\t<NavigationPropertyBinding Path=\"Manager\"\t\t\t\t\t\t\t\t\tTarget=\"f.Container/Managers\"/>\t\t\t\t\t\t\t\t<NavigationPropertyBinding Path=\"Foo\"\t\t\t\t\t\t\t\t\tTarget=\"other.Container/Foo\"/>\t\t\t\t\t\t\t\t<NavigationPropertyBinding Path=\"Bar\"\t\t\t\t\t\t\t\t\tTarget=\"f.Container/Foo/Bar\"/>\t\t\t\t\t\t\t\t<NavigationPropertyBinding Path=\"Baz\"\t\t\t\t\t\t\t\t\tTarget=\"f.Container/Manager/f.Employee\"/>\t\t\t\t\t\t\t</EntitySet>\t\t\t\t\t\t</EntityContainer>\t\t\t\t\t</Schema>\t\t\t\t</edmx:DataServices>", {
        "$EntityContainer": "foo.Container",
        "foo.": {
            "$kind": "Schema"
        },
        "foo.Container": {
            "$kind": "EntityContainer",
            "SpecialTeams": {
                "$kind": "EntitySet",
                "$Type": "foo.Team"
            },
            "Teams": {
                "$kind": "EntitySet",
                "$NavigationPropertyBinding": {
                    "Manager": "Managers",
                    "Foo": "other.Container/Foo",
                    "Bar": "foo.Container/Foo/Bar",
                    "Baz": "foo.Container/Manager/foo.Employee"
                },
                "$Type": "foo.Team"
            }
        }
    });
});
QUnit.test("convertXMLMetadata: IncludeInServiceDocument", function (assert) {
    testConversion(assert, "\t\t\t\t<edmx:DataServices>\t\t\t\t\t<Schema Namespace=\"foo\">\t\t\t\t\t\t<EntityContainer Name=\"Container\">\t\t\t\t\t\t\t<EntitySet Name=\"Teams\" EntityType=\"foo.Team\"\t\t\t\t\t\t\t\tIncludeInServiceDocument=\"false\"/>\t\t\t\t\t\t\t<EntitySet Name=\"Teams2\" EntityType=\"foo.Team\"\t\t\t\t\t\t\t\tIncludeInServiceDocument=\"true\"/>\t\t\t\t\t\t\t<EntitySet Name=\"Teams3\" EntityType=\"foo.Team\"/>\t\t\t\t\t\t</EntityContainer>\t\t\t\t\t</Schema>\t\t\t\t</edmx:DataServices>", {
        "$EntityContainer": "foo.Container",
        "foo.": {
            "$kind": "Schema"
        },
        "foo.Container": {
            "$kind": "EntityContainer",
            "Teams": {
                "$kind": "EntitySet",
                "$Type": "foo.Team",
                "$IncludeInServiceDocument": false
            },
            "Teams2": {
                "$kind": "EntitySet",
                "$Type": "foo.Team"
            },
            "Teams3": {
                "$kind": "EntitySet",
                "$Type": "foo.Team"
            }
        }
    });
});
QUnit.test("convertXMLMetadata: EntityType attributes, key alias", function (assert) {
    testConversion(assert, "\t\t\t\t<edmx:DataServices>\t\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\">\t\t\t\t\t\t<EntityType Name=\"Worker\" OpenType=\"true\" HasStream=\"true\">\t\t\t\t\t\t\t<Key>\t\t\t\t\t\t\t\t<PropertyRef Name=\"Bar/Baz\" Alias=\"qux\"/>\t\t\t\t\t\t\t</Key>\t\t\t\t\t\t</EntityType>\t\t\t\t\t\t<EntityType Name=\"Base\" Abstract=\"true\"/>\t\t\t\t\t\t<EntityType Name=\"Derived\" BaseType=\"f.Base\"/>\t\t\t\t\t</Schema>\t\t\t\t</edmx:DataServices>", {
        "foo.": {
            "$kind": "Schema"
        },
        "foo.Worker": {
            "$kind": "EntityType",
            "$Key": [
                { "qux": "Bar/Baz" }
            ],
            "$OpenType": true,
            "$HasStream": true
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
QUnit.test("convertXMLMetadata: ComplexType attributes", function (assert) {
    testConversion(assert, "\t\t\t\t<edmx:DataServices>\t\t\t\t\t<Schema Namespace=\"foo\">\t\t\t\t\t\t<ComplexType Name=\"Worker\" OpenType=\"true\" HasStream=\"true\"/>\t\t\t\t\t\t<ComplexType Name=\"Base\" Abstract=\"true\"/>\t\t\t\t\t\t<ComplexType Name=\"Derived\" BaseType=\"foo.Base\"/>\t\t\t\t\t</Schema>\t\t\t\t</edmx:DataServices>", {
        "foo.": {
            "$kind": "Schema"
        },
        "foo.Worker": {
            "$kind": "ComplexType",
            "$OpenType": true,
            "$HasStream": true
        },
        "foo.Base": {
            "$kind": "ComplexType",
            "$Abstract": true
        },
        "foo.Derived": {
            "$kind": "ComplexType",
            "$BaseType": "foo.Base"
        }
    });
});
QUnit.test("processFacetAttributes", function (assert) {
    function localTest(sProperty, sValue, vExpectedValue) {
        var oXml = xml(assert, "<Foo " + sProperty + "=\"" + sValue + "\"/>"), oResult = {}, oExpectedResult = {};
        if (vExpectedValue !== undefined) {
            oExpectedResult["$" + sProperty] = vExpectedValue;
        }
        new _V4MetadataConverter().processFacetAttributes(oXml.documentElement, oResult);
        assert.deepEqual(oResult, oExpectedResult);
    }
    localTest("Precision", "8", 8);
    localTest("Scale", "2", 2);
    localTest("Scale", "variable", "variable");
    localTest("Unicode", "false", false);
    localTest("Unicode", "true", undefined);
    localTest("MaxLength", "12345", 12345);
    localTest("MaxLength", "max", undefined);
    localTest("SRID", "42", "42");
});
["ComplexType", "EntityType"].forEach(function (sType) {
    QUnit.test("convertXMLMetadata: " + sType + ": (Navigation)Property", function (assert) {
        var oExpected = {
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
                    "$DefaultValue": "<a>",
                    "$Unicode": false
                },
                "p2": {
                    "$kind": "Property",
                    "$Type": "Edm.String"
                },
                "p3": {
                    "$kind": "Property",
                    "$Type": "Edm.Geometry",
                    "$SRID": "42"
                },
                "p4": {
                    "$kind": "Property",
                    "$Type": "Edm.Int32",
                    "$DefaultValue": "42"
                },
                "team1": {
                    "$kind": "NavigationProperty",
                    "$Type": "foo.Team",
                    "$Partner": "worker",
                    "$OnDelete": "SetDefault",
                    "$ReferentialConstraint": {
                        "p1": "p1Key",
                        "p2": "p2Key"
                    }
                },
                "team2": {
                    "$kind": "NavigationProperty",
                    "$Type": "foo.Team",
                    "$ContainsTarget": true
                },
                "team3": {
                    "$kind": "NavigationProperty",
                    "$Type": "foo.Team"
                }
            }
        };
        testConversion(assert, "\t\t\t\t\t<edmx:DataServices>\t\t\t\t\t\t<Schema Namespace=\"foo\">\t\t\t\t\t\t\t<" + sType + " Name=\"Worker\">\t\t\t\t\t\t\t\t<Property Name=\"Salary\" Type=\"Edm.Decimal\" Precision=\"8\"\t\t\t\t\t\t\t\t\tScale=\"2\"/>\t\t\t\t\t\t\t\t<Property Name=\"p1\" Type=\"Edm.String\" DefaultValue=\"&lt;a&gt;\"\t\t\t\t\t\t\t\t\tUnicode=\"false\" />\t\t\t\t\t\t\t\t<Property Name=\"p2\" Type=\"Edm.String\" Unicode=\"true\" />\t\t\t\t\t\t\t\t<Property Name=\"p3\" Type=\"Edm.Geometry\" SRID=\"42\" />\t\t\t\t\t\t\t\t<Property Name=\"p4\" Type=\"Edm.Int32\" DefaultValue=\"42\"/>\t\t\t\t\t\t\t\t<NavigationProperty Name=\"team1\" Type=\"foo.Team\" Partner=\"worker\">\t\t\t\t\t\t\t\t\t<OnDelete Action=\"SetDefault\"/>\t\t\t\t\t\t\t\t\t<ReferentialConstraint Property=\"p1\"\t\t\t\t\t\t\t\t\t\tReferencedProperty=\"p1Key\" />\t\t\t\t\t\t\t\t\t<ReferentialConstraint Property=\"p2\"\t\t\t\t\t\t\t\t\t\tReferencedProperty=\"p2Key\" />\t\t\t\t\t\t\t\t</NavigationProperty>\t\t\t\t\t\t\t\t<NavigationProperty Name=\"team2\" Type=\"foo.Team\"\t\t\t\t\t\t\t\t\tContainsTarget=\"true\" />\t\t\t\t\t\t\t\t<NavigationProperty Name=\"team3\" Type=\"foo.Team\"\t\t\t\t\t\t\t\t\tContainsTarget=\"false\" />\t\t\t\t\t\t\t</" + sType + ">\t\t\t\t\t\t</Schema>\t\t\t\t\t</edmx:DataServices>", oExpected);
    });
});
QUnit.test("convertXMLMetadata: EnumType", function (assert) {
    testConversion(assert, "\t\t\t\t<edmx:DataServices>\t\t\t\t\t<Schema Namespace=\"foo\">\t\t\t\t\t\t<EnumType Name=\"Bar1\" IsFlags=\"true\">\t\t\t\t\t\t\t<Member Name=\"p_1\" Value=\"1\" />\t\t\t\t\t\t</EnumType>\t\t\t\t\t\t<EnumType Name=\"Bar2\" UnderlyingType=\"Edm.Int32\" >\t\t\t\t\t\t\t<Member Name=\"_1\" />\t\t\t\t\t\t\t<Member Name=\"_2\" />\t\t\t\t\t\t</EnumType>\t\t\t\t\t\t<EnumType Name=\"Baz1\"  IsFlags=\"false\" UnderlyingType=\"Edm.Int64\">\t\t\t\t\t\t\t<Member Name=\"_1\" Value=\"9007199254740991\" />\t\t\t\t\t\t\t<Member Name=\"_2\" Value=\"9007199254740992\" />\t\t\t\t\t\t</EnumType>\t\t\t\t\t\t<EnumType Name=\"Baz2\" UnderlyingType=\"Edm.Int64\">\t\t\t\t\t\t\t<Member Name=\"_1\" />\t\t\t\t\t\t\t<Member Name=\"_2\" />\t\t\t\t\t\t</EnumType>\t\t\t\t\t\t<EnumType Name=\"Qux1\" UnderlyingType=\"Edm.Int16\">\t\t\t\t\t\t\t<Member Name=\"_1\" />\t\t\t\t\t\t</EnumType>\t\t\t\t\t\t<EnumType Name=\"Qux2\" UnderlyingType=\"Edm.Byte\">\t\t\t\t\t\t\t<Member Name=\"_1\" />\t\t\t\t\t\t</EnumType>\t\t\t\t\t\t<EnumType Name=\"Qux3\" UnderlyingType=\"Edm.SByte\">\t\t\t\t\t\t\t<Member Name=\"_1\" />\t\t\t\t\t\t</EnumType>\t\t\t\t\t</Schema>\t\t\t\t</edmx:DataServices>", {
        "foo.": {
            "$kind": "Schema"
        },
        "foo.Bar1": {
            "$kind": "EnumType",
            "$IsFlags": true,
            "p_1": 1
        },
        "foo.Bar2": {
            "$kind": "EnumType",
            "_1": 0,
            "_2": 1
        },
        "foo.Baz1": {
            "$kind": "EnumType",
            "$UnderlyingType": "Edm.Int64",
            "_1": 9007199254740991,
            "_2": "9007199254740992"
        },
        "foo.Baz2": {
            "$kind": "EnumType",
            "$UnderlyingType": "Edm.Int64",
            "_1": 0,
            "_2": 1
        },
        "foo.Qux1": {
            "$kind": "EnumType",
            "$UnderlyingType": "Edm.Int16",
            "_1": 0
        },
        "foo.Qux2": {
            "$kind": "EnumType",
            "$UnderlyingType": "Edm.Byte",
            "_1": 0
        },
        "foo.Qux3": {
            "$kind": "EnumType",
            "$UnderlyingType": "Edm.SByte",
            "_1": 0
        }
    });
});
QUnit.test("convertXMLMetadata: TypeDefinition", function (assert) {
    this.mock(_V4MetadataConverter.prototype).expects("processFacetAttributes").withExactArgs(sinon.match.has("localName", "TypeDefinition"), {
        $kind: "TypeDefinition",
        $UnderlyingType: "Edm.String"
    });
    testConversion(assert, "\t\t\t\t<edmx:DataServices>\t\t\t\t\t<Schema Namespace=\"foo\">\t\t\t\t\t\t<TypeDefinition Name=\"Bar\" UnderlyingType=\"Edm.String\"/>\t\t\t\t\t</Schema>\t\t\t\t</edmx:DataServices>", {
        "foo.": {
            "$kind": "Schema"
        },
        "foo.Bar": {
            "$kind": "TypeDefinition",
            "$UnderlyingType": "Edm.String"
        }
    });
});
["Action", "Function"].forEach(function (sRunnable) {
    QUnit.test("convertXMLMetadata: " + sRunnable, function (assert) {
        testConversion(assert, "\t\t\t\t\t<edmx:DataServices>\t\t\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\">\t\t\t\t\t\t\t<" + sRunnable + " Name=\"Baz\" EntitySetPath=\"Employees\"\t\t\t\t\t\t\t\tIsBound=\"true\" >\t\t\t\t\t\t\t\t<Parameter Name=\"p1\" Type=\"f.Bar\" Nullable=\"false\"/>\t\t\t\t\t\t\t\t<Parameter Name=\"p2\" Type=\"Collection(f.Bar)\" MaxLength=\"10\"\t\t\t\t\t\t\t\t\tPrecision=\"2\" Scale=\"variable\" SRID=\"42\"/>\t\t\t\t\t\t\t\t<ReturnType Type=\"Collection(Edm.String)\" Nullable=\"false\"\t\t\t\t\t\t\t\t\tMaxLength=\"10\" Precision=\"2\" Scale=\"variable\" SRID=\"42\"/>\t\t\t\t\t\t\t</" + sRunnable + ">\t\t\t\t\t\t\t<" + sRunnable + " Name=\"Baz\" IsComposable=\"true\" IsBound=\"false\"/>\t\t\t\t\t\t</Schema>\t\t\t\t\t</edmx:DataServices>", {
            "foo.": {
                "$kind": "Schema"
            },
            "foo.Baz": [{
                    "$kind": sRunnable,
                    "$IsBound": true,
                    "$EntitySetPath": "Employees",
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
                            "$Scale": "variable",
                            "$SRID": "42"
                        }],
                    "$ReturnType": {
                        "$isCollection": true,
                        "$Type": "Edm.String",
                        "$Nullable": false,
                        "$MaxLength": 10,
                        "$Precision": 2,
                        "$Scale": "variable",
                        "$SRID": "42"
                    }
                }, {
                    "$kind": sRunnable,
                    "$IsComposable": true
                }]
        });
    });
});
["Action", "Function"].forEach(function (sWhat) {
    QUnit.test("convertXMLMetadata: " + sWhat + "Import", function (assert) {
        var oExpected = {
            "$EntityContainer": "foo.Container",
            "foo.": {
                "$kind": "Schema"
            },
            "foo.Container": {
                "$kind": "EntityContainer",
                "Baz1": {
                    "$EntitySet": "Employees",
                    "$IncludeInServiceDocument": true
                },
                "Baz2": {},
                "Baz3": {
                    "$EntitySet": "Employees"
                },
                "Baz4": {
                    "$EntitySet": "some.other.Container/Employees"
                },
                "Baz5": {
                    "$EntitySet": "foo.Container/Employees/Team"
                }
            }
        }, oContainer = oExpected["foo.Container"];
        Object.keys(oContainer).forEach(function (sKey) {
            var oValue = oContainer[sKey];
            if (sKey !== "$kind") {
                oValue.$kind = sWhat + "Import";
                oValue["$" + sWhat] = "foo.Baz";
            }
        });
        testConversion(assert, "\t\t\t\t\t<edmx:DataServices>\t\t\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\">\t\t\t\t\t\t\t<EntityContainer Name=\"Container\">\t\t\t\t\t\t\t\t<" + sWhat + "Import Name=\"Baz1\" " + sWhat + "=\"foo.Baz\"\t\t\t\t\t\t\t\t\tEntitySet=\"Employees\" IncludeInServiceDocument=\"true\"/>\t\t\t\t\t\t\t\t<" + sWhat + "Import Name=\"Baz2\" " + sWhat + "=\"f.Baz\"\t\t\t\t\t\t\t\t\tIncludeInServiceDocument=\"false\"/>\t\t\t\t\t\t\t\t<" + sWhat + "Import Name=\"Baz3\" " + sWhat + "=\"f.Baz\"\t\t\t\t\t\t\t\t\tEntitySet=\"f.Container/Employees\"/>\t\t\t\t\t\t\t\t<" + sWhat + "Import Name=\"Baz4\" " + sWhat + "=\"f.Baz\"\t\t\t\t\t\t\t\t\tEntitySet=\"some.other.Container/Employees\"/>\t\t\t\t\t\t\t\t<" + sWhat + "Import Name=\"Baz5\" " + sWhat + "=\"f.Baz\"\t\t\t\t\t\t\t\t\tEntitySet=\"f.Container/Employees/Team\"/>\t\t\t\t\t\t\t</EntityContainer>\t\t\t\t\t\t</Schema>\t\t\t\t\t</edmx:DataServices>", oExpected);
    });
});
QUnit.test("convertXMLMetadata: Term", function (assert) {
    testConversion(assert, "\t\t\t\t<edmx:DataServices>\t\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\">\t\t\t\t\t\t<Term Name=\"Term1\" Type=\"Collection(Edm.String)\" Nullable=\"false\"\t\t\t\t\t\t\tMaxLength=\"10\" Precision=\"2\" Scale=\"variable\" SRID=\"42\"/>\t\t\t\t\t\t<Term Name=\"Term2\" Type=\"f.Bar\" BaseTerm=\"f.Term1\" Nullable=\"true\"/>\t\t\t\t\t</Schema>\t\t\t\t</edmx:DataServices>", {
        "foo.": {
            "$kind": "Schema"
        },
        "foo.Term1": {
            "$kind": "Term",
            "$isCollection": true,
            "$Type": "Edm.String",
            "$Nullable": false,
            "$MaxLength": 10,
            "$Precision": 2,
            "$Scale": "variable",
            "$SRID": "42"
        },
        "foo.Term2": {
            "$kind": "Term",
            "$Type": "foo.Bar",
            "$BaseTerm": "foo.Term1"
        }
    });
});
QUnit.test("convertXMLMetadata: Annotations", function (assert) {
    testConversion(assert, "\t\t\t\t<edmx:DataServices>\t\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\">\t\t\t\t\t\t<Annotations Target=\"f.Bar/f.Baz\">\t\t\t\t\t\t\t<Annotation Term=\"f.Binary\" Binary=\"T0RhdGE\"/>\t\t\t\t\t\t\t<Annotation Term=\"f.Bool\" Bool=\"false\"/>\t\t\t\t\t\t\t<Annotation Term=\"f.Date\" Date=\"2015-01-01\" />\t\t\t\t\t\t\t<Annotation Term=\"f.DateTimeOffset\"\t\t\t\t\t\t\t\tDateTimeOffset=\"2000-01-01T16:00:00.000-09:00\" />\t\t\t\t\t\t\t<Annotation Term=\"f.Decimal\" Decimal=\"3.14\" />\t\t\t\t\t\t\t<Annotation Term=\"f.Duration\" Duration=\"P11D23H59M59S\" />\t\t\t\t\t\t\t<Annotation Term=\"f.EnumMember\"\t\t\t\t\t\t\t\tEnumMember=\"f.Enum/Member1 f.Enum/Member2\"/>\t\t\t\t\t\t\t<Annotation Term=\"f.Float1\" Float=\"2.718\" />\t\t\t\t\t\t\t<Annotation Term=\"f.Float2\" Float=\"NaN\" />\t\t\t\t\t\t\t<Annotation Term=\"f.Float3\" Float=\"INF\" />\t\t\t\t\t\t\t<Annotation Term=\"f.Float4\" Float=\"-INF\" />\t\t\t\t\t\t\t<Annotation Term=\"f.Guid\"\t\t\t\t\t\t\t\tGuid=\"21EC2020-3AEA-1069-A2DD-08002B30309D\" />\t\t\t\t\t\t\t<Annotation Term=\"f.Int1\" Int=\"42\"/>\t\t\t\t\t\t\t<Annotation Term=\"f.Int2\" Int=\"9007199254740991\" />\t\t\t\t\t\t\t<Annotation Term=\"f.Int3\" Int=\"9007199254740992\" />\t\t\t\t\t\t\t<Annotation Term=\"f.String\" String=\"foobar\" />\t\t\t\t\t\t\t<Annotation Term=\"f.TimeOfDay\" TimeOfDay=\"21:45:00\" />\t\t\t\t\t\t\t<Annotation Term=\"f.AnnotationPath\"\t\t\t\t\t\t\t\tAnnotationPath=\"Path/f.Bar/f.Baz@f.Term\" />\t\t\t\t\t\t\t<Annotation Term=\"f.NavigationPropertyPath\"\t\t\t\t\t\t\t\tNavigationPropertyPath=\"Path/f.Bar/f.Baz\" />\t\t\t\t\t\t\t<Annotation Term=\"f.Path\" Path=\"Path/f.Bar/f.Baz\" />\t\t\t\t\t\t\t<Annotation Term=\"f.PropertyPath\" PropertyPath=\"Path/f.Bar/f.Baz\" />\t\t\t\t\t\t\t<Annotation Term=\"f.UrlRef\" UrlRef=\"http://foo.bar\" />\t\t\t\t\t\t\t<Annotation Term=\"f.Invalid\" Invalid=\"foo\" />\t\t\t\t\t\t\t<Annotation Term=\"f.Baz\" Qualifier=\"Employee\"/>\t\t\t\t\t\t</Annotations>\t\t\t\t\t\t<Annotations Target=\"f.Bar/Abc\" Qualifier=\"Employee\">\t\t\t\t\t\t\t<Annotation Term=\"f.Baz\"/>\t\t\t\t\t\t</Annotations>\t\t\t\t\t</Schema>\t\t\t\t</edmx:DataServices>", {
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
QUnit.test("inline annotations: Schema, EntityType, ComplexType", function (assert) {
    testConversion(assert, "\t\t\t\t<edmx:DataServices>\t\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\">\t\t\t\t\t\t<Annotation Term=\"f.Term1\" String=\"Schema\"/>\t\t\t\t\t\t<EntityType Name=\"EntityType\">\t\t\t\t\t\t\t<Property Name=\"Property\" Type=\"Edm.String\">\t\t\t\t\t\t\t\t<Annotation Term=\"f.Term\" String=\"Property\"/>\t\t\t\t\t\t\t</Property>\t\t\t\t\t\t\t<NavigationProperty Name=\"NavigationProperty\" Type=\"foo.Target\">\t\t\t\t\t\t\t\t<Annotation Term=\"f.Term\" String=\"NavigationProperty\"/>\t\t\t\t\t\t\t\t<ReferentialConstraint Property=\"p\" ReferencedProperty=\"r\">\t\t\t\t\t\t\t\t\t<Annotation Term=\"f.Term\" String=\"ReferentialConstraint\"/>\t\t\t\t\t\t\t\t</ReferentialConstraint>\t\t\t\t\t\t\t\t<OnDelete Action=\"a\">\t\t\t\t\t\t\t\t\t<Annotation Term=\"f.Term\" String=\"OnDelete\"/>\t\t\t\t\t\t\t\t</OnDelete>\t\t\t\t\t\t\t</NavigationProperty>\t\t\t\t\t\t\t<Annotation Term=\"f.Term\" String=\"EntityType\"/>\t\t\t\t\t\t</EntityType>\t\t\t\t\t\t<ComplexType Name=\"ComplexType\">\t\t\t\t\t\t\t<Annotation Term=\"f.Term\" String=\"ComplexType\"/>\t\t\t\t\t\t</ComplexType>\t\t\t\t\t\t<Annotation Term=\"f.Term2\" String=\"Schema\"/>\t\t\t\t\t</Schema>\t\t\t\t</edmx:DataServices>", {
        "foo.": {
            "$kind": "Schema",
            "@foo.Term1": "Schema",
            "@foo.Term2": "Schema",
            "$Annotations": {
                "foo.EntityType": {
                    "@foo.Term": "EntityType"
                },
                "foo.EntityType/Property": {
                    "@foo.Term": "Property"
                },
                "foo.EntityType/NavigationProperty": {
                    "@foo.Term": "NavigationProperty"
                },
                "foo.ComplexType": {
                    "@foo.Term": "ComplexType"
                }
            }
        },
        "foo.EntityType": {
            "$kind": "EntityType",
            "Property": {
                "$kind": "Property",
                "$Type": "Edm.String"
            },
            "NavigationProperty": {
                "$kind": "NavigationProperty",
                "$Type": "foo.Target",
                "$ReferentialConstraint": {
                    "p": "r",
                    "p@foo.Term": "ReferentialConstraint"
                },
                "$OnDelete": "a",
                "$OnDelete@foo.Term": "OnDelete"
            }
        },
        "foo.ComplexType": {
            "$kind": "ComplexType"
        }
    });
});
QUnit.test("inline annotations: EnumType, Term, TypeDefinition", function (assert) {
    testConversion(assert, "\t\t\t\t<edmx:DataServices>\t\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\">\t\t\t\t\t\t<EnumType Name=\"EnumType\">\t\t\t\t\t\t\t<Member Name=\"Member\">\t\t\t\t\t\t\t\t<Annotation Term=\"f.Term\" String=\"Member\"/>\t\t\t\t\t\t\t</Member>\t\t\t\t\t\t\t<Annotation Term=\"f.Term\" String=\"EnumType\"/>\t\t\t\t\t\t</EnumType>\t\t\t\t\t\t<Term Name=\"Term\" Type=\"Edm.String\">\t\t\t\t\t\t\t<Annotation Term=\"f.Term\" String=\"Term\"/>\t\t\t\t\t\t</Term>\t\t\t\t\t\t<TypeDefinition Name=\"TypeDefinition\" UnderlyingType=\"Edm.String\">\t\t\t\t\t\t\t<Annotation Term=\"f.Term\" String=\"TypeDefinition\"/>\t\t\t\t\t\t</TypeDefinition>\t\t\t\t\t</Schema>\t\t\t\t</edmx:DataServices>", {
        "foo.": {
            "$kind": "Schema",
            "$Annotations": {
                "foo.EnumType": {
                    "@foo.Term": "EnumType"
                },
                "foo.EnumType/Member": {
                    "@foo.Term": "Member"
                },
                "foo.Term": {
                    "@foo.Term": "Term"
                },
                "foo.TypeDefinition": {
                    "@foo.Term": "TypeDefinition"
                }
            }
        },
        "foo.EnumType": {
            "$kind": "EnumType",
            "Member": 0
        },
        "foo.Term": {
            "$kind": "Term",
            "$Type": "Edm.String"
        },
        "foo.TypeDefinition": {
            "$kind": "TypeDefinition",
            "$UnderlyingType": "Edm.String"
        }
    });
});
QUnit.test("inline annotations: Action, Function", function (assert) {
    testConversion(assert, "\t\t\t\t<edmx:DataServices>\t\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\">\t\t\t\t\t\t<Action IsBound=\"true\" Name=\"Action\">\t\t\t\t\t\t\t<Parameter Name=\"_it\" Type=\"Edm.String\">\t\t\t\t\t\t\t\t<Annotation Term=\"f.Term\" String=\"Parameter\"/>\t\t\t\t\t\t\t</Parameter>\t\t\t\t\t\t\t<ReturnType Type=\"Edm.String\">\t\t\t\t\t\t\t\t<Annotation Term=\"f.Term\" String=\"ReturnType\"/>\t\t\t\t\t\t\t</ReturnType>\t\t\t\t\t\t\t<Annotation Term=\"f.Term\" String=\"Action1\"/>\t\t\t\t\t\t</Action>\t\t\t\t\t\t<Action Name=\"Action\">\t\t\t\t\t\t\t<Annotation Term=\"f.Term\" String=\"Action2\"/>\t\t\t\t\t\t</Action>\t\t\t\t\t\t<Action IsBound=\"true\" Name=\"Action\">\t\t\t\t\t\t\t<Parameter Name=\"_it\" Type=\"Collection(f.Type)\"/>\t\t\t\t\t\t\t<Parameter Name=\"NonBinding\" Type=\"Edm.Int\"/>\t\t\t\t\t\t\t<Annotation Term=\"f.Term\" String=\"Action3\"/>\t\t\t\t\t\t</Action>\t\t\t\t\t\t<Function Name=\"Function\">\t\t\t\t\t\t\t<Annotation Term=\"f.Term\" String=\"Function1\"/>\t\t\t\t\t\t</Function>\t\t\t\t\t\t<Function IsBound=\"true\" Name=\"Function\">\t\t\t\t\t\t\t<Parameter Name=\"Parameter\" Type=\"f.Type\"/>\t\t\t\t\t\t\t<Annotation Term=\"f.Term\" String=\"Function2\"/>\t\t\t\t\t\t</Function>\t\t\t\t\t\t<Function IsBound=\"true\" Name=\"Function\">\t\t\t\t\t\t\t<Parameter Name=\"A\" Type=\"f.Type\"/>\t\t\t\t\t\t\t<Parameter Name=\"B\" Type=\"Collection(f.Int)\"/>\t\t\t\t\t\t\t<Annotation Term=\"f.Term\" String=\"Function3\"/>\t\t\t\t\t\t</Function>\t\t\t\t\t</Schema>\t\t\t\t</edmx:DataServices>", {
        "foo.": {
            "$Annotations": {
                "foo.Action(Edm.String)": {
                    "@foo.Term": "Action1"
                },
                "foo.Action(Edm.String)/_it": {
                    "@foo.Term": "Parameter"
                },
                "foo.Action(Edm.String)/$ReturnType": {
                    "@foo.Term": "ReturnType"
                },
                "foo.Action()": {
                    "@foo.Term": "Action2"
                },
                "foo.Action(Collection(foo.Type))": {
                    "@foo.Term": "Action3"
                },
                "foo.Function()": {
                    "@foo.Term": "Function1"
                },
                "foo.Function(foo.Type)": {
                    "@foo.Term": "Function2"
                },
                "foo.Function(foo.Type,Collection(foo.Int))": {
                    "@foo.Term": "Function3"
                }
            },
            "$kind": "Schema"
        },
        "foo.Action": [{
                "$kind": "Action",
                "$IsBound": true,
                "$Parameter": [{
                        "$Name": "_it",
                        "$Type": "Edm.String"
                    }],
                "$ReturnType": {
                    "$Type": "Edm.String"
                }
            }, {
                "$kind": "Action"
            }, {
                "$kind": "Action",
                "$IsBound": true,
                "$Parameter": [{
                        "$Name": "_it",
                        "$Type": "foo.Type",
                        "$isCollection": true
                    }, {
                        "$Name": "NonBinding",
                        "$Type": "Edm.Int"
                    }]
            }],
        "foo.Function": [{
                "$kind": "Function"
            }, {
                "$kind": "Function",
                "$IsBound": true,
                "$Parameter": [{
                        "$Name": "Parameter",
                        "$Type": "foo.Type"
                    }]
            }, {
                "$kind": "Function",
                "$IsBound": true,
                "$Parameter": [{
                        "$Name": "A",
                        "$Type": "foo.Type"
                    }, {
                        "$Name": "B",
                        "$Type": "foo.Int",
                        "$isCollection": true
                    }]
            }]
    });
});
QUnit.test("inline annotations: EntityContainer and children", function (assert) {
    testConversion(assert, "\t\t\t\t<edmx:DataServices>\t\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\">\t\t\t\t\t\t<EntityContainer Name=\"Container\">\t\t\t\t\t\t\t<EntitySet Name=\"EntitySet\" EntityType=\"f.EntityType\">\t\t\t\t\t\t\t\t<Annotation Term=\"f.Term1\" String=\"EntitySet\"/>\t\t\t\t\t\t\t</EntitySet>\t\t\t\t\t\t\t<Singleton Name=\"Singleton\" Type=\"f.EntityType\">\t\t\t\t\t\t\t\t<Annotation Term=\"f.Term\" String=\"Singleton\"/>\t\t\t\t\t\t\t</Singleton>\t\t\t\t\t\t\t<ActionImport Name=\"ActionImport\" Action=\"f.Action\">\t\t\t\t\t\t\t\t<Annotation Term=\"f.Term\" String=\"ActionImport\"/>\t\t\t\t\t\t\t</ActionImport>\t\t\t\t\t\t\t<FunctionImport Name=\"FunctionImport\" Function=\"f.Function\">\t\t\t\t\t\t\t\t<Annotation Term=\"f.Term\" String=\"FunctionImport\"/>\t\t\t\t\t\t\t</FunctionImport>\t\t\t\t\t\t\t<Annotation Term=\"f.Term\" String=\"EntityContainer\"/>\t\t\t\t\t\t</EntityContainer>\t\t\t\t\t\t<Annotations Target=\"foo.Container/EntitySet\">\t\t\t\t\t\t\t<Annotation Term=\"f.Term2\" String=\"EntitySet\"/>\t\t\t\t\t\t</Annotations>\t\t\t\t\t</Schema>\t\t\t\t</edmx:DataServices>", {
        "$EntityContainer": "foo.Container",
        "foo.": {
            "$kind": "Schema",
            "$Annotations": {
                "foo.Container": {
                    "@foo.Term": "EntityContainer"
                },
                "foo.Container/EntitySet": {
                    "@foo.Term1": "EntitySet",
                    "@foo.Term2": "EntitySet"
                },
                "foo.Container/Singleton": {
                    "@foo.Term": "Singleton"
                },
                "foo.Container/ActionImport": {
                    "@foo.Term": "ActionImport"
                },
                "foo.Container/FunctionImport": {
                    "@foo.Term": "FunctionImport"
                }
            }
        },
        "foo.Container": {
            "$kind": "EntityContainer",
            "EntitySet": {
                "$kind": "EntitySet",
                "$Type": "foo.EntityType"
            },
            "Singleton": {
                "$kind": "Singleton",
                "$Type": "foo.EntityType"
            },
            "ActionImport": {
                "$kind": "ActionImport",
                "$Action": "foo.Action"
            },
            "FunctionImport": {
                "$kind": "FunctionImport",
                "$Function": "foo.Function"
            }
        }
    });
});
QUnit.test("inline annotations: Reference", function (assert) {
    testConversion(assert, "\t\t\t\t<edmx:Reference Uri=\"qux/$metadata\">\t\t\t\t\t<Annotation Term=\"foo.Term\" String=\"Reference\"/>\t\t\t\t</edmx:Reference>", {
        "$Reference": {
            "qux/$metadata": {
                "@foo.Term": "Reference"
            }
        }
    });
});
QUnit.test("annotated annotations", function (assert) {
    testConversion(assert, "\t\t\t\t<edmx:DataServices>\t\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\">\t\t\t\t\t\t<Annotation Term=\"f.Term1\" String=\"Schema\" Qualifier=\"q1\">\t\t\t\t\t\t\t<Annotation Term=\"f.Term2\" Qualifier=\"q2\" String=\"Annotation2\">\t\t\t\t\t\t\t\t<Annotation Term=\"f.Term3\" Qualifier=\"q3\" String=\"Annotation3\"/>\t\t\t\t\t\t\t</Annotation>\t\t\t\t\t\t</Annotation>\t\t\t\t\t\t<ComplexType Name=\"ComplexType\">\t\t\t\t\t\t\t<Annotation Term=\"f.Term1\" String=\"ComplexType\">\t\t\t\t\t\t\t\t<Annotation Term=\"f.Term2\" String=\"Annotation\"/>\t\t\t\t\t\t\t</Annotation>\t\t\t\t\t\t</ComplexType>\t\t\t\t\t</Schema>\t\t\t\t</edmx:DataServices>", {
        "foo.": {
            "$kind": "Schema",
            "@foo.Term1#q1": "Schema",
            "@foo.Term1#q1@foo.Term2#q2": "Annotation2",
            "@foo.Term1#q1@foo.Term2#q2@foo.Term3#q3": "Annotation3",
            "$Annotations": {
                "foo.ComplexType": {
                    "@foo.Term1": "ComplexType",
                    "@foo.Term1@foo.Term2": "Annotation"
                }
            }
        },
        "foo.ComplexType": {
            "$kind": "ComplexType"
        }
    });
});
QUnit.test("try to read some random XML as V4", function (assert) {
    var sUrl = "/some/random/xml", oXML = xml(assert, "<foo xmlns=\"http://docs.oasis-open.org/odata/ns/edmx\"/>");
    assert.throws(function () {
        new _V4MetadataConverter().convertXMLMetadata(oXML, sUrl);
    }, new Error(sUrl + ": expected <Edmx> in namespace 'http://docs.oasis-open.org/odata/ns/edmx'"));
});
QUnit.test("try to read V2 as V4", function (assert) {
    var sUrl = "/some/v2/service/$metadata", oXML = xml(assert, "<Edmx xmlns=\"http://schemas.microsoft.com/ado/2007/06/edmx\"/>");
    assert.throws(function () {
        new _V4MetadataConverter().convertXMLMetadata(oXML, sUrl);
    }, new Error(sUrl + ": expected <Edmx> in namespace 'http://docs.oasis-open.org/odata/ns/edmx'"));
});
QUnit.test("try to read V4.01 as V4", function (assert) {
    var sUrl = "/some/v2/service/$metadata", oXML = xml(assert, "<Edmx Version=\"4.01\" xmlns=\"http://docs.oasis-open.org/odata/ns/edmx\"/>");
    assert.throws(function () {
        new _V4MetadataConverter().convertXMLMetadata(oXML, sUrl);
    }, new Error(sUrl + ": Unsupported OData version 4.01"));
});
QUnit.test("ignore foreign namespaces", function (assert) {
    testConversion(assert, "\t\t\t\t<edmx:DataServices>\t\t\t\t\t<Schema Namespace=\"foo\" Alias=\"f\" xmlns:foo=\"http://foo.bar\">\t\t\t\t\t\t<ComplexType Name=\"Worker\" foo:OpenType=\"true\"/>\t\t\t\t\t\t<foo:ComplexType Name=\"Ignore\"/>\t\t\t\t\t</Schema>\t\t\t\t</edmx:DataServices>", {
        "foo.": {
            "$kind": "Schema"
        },
        "foo.Worker": {
            "$kind": "ComplexType"
        }
    });
});
QUnit.test("convertXMLMetadata: test service", function (assert) {
    return Promise.all([
        Promise.resolve(jQuery.ajax("/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/$metadata")).then(function (oXML) {
            return new _V4MetadataConverter().convertXMLMetadata(oXML);
        }),
        jQuery.ajax("/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/metadata.json")
    ]).then(function (aResults) {
        assert.deepEqual(aResults[0], aResults[1]);
    });
});
QUnit.test("duplicate schema children; last one wins", function (assert) {
    var that = this;
    [
        "Duplicate qualified name duplicates.",
        "Duplicate qualified name $EntityContainer",
        "Duplicate qualified name duplicates.ArtistsType",
        "Duplicate qualified name duplicates.Address",
        "Duplicate qualified name duplicates.Enumeration",
        "Duplicate qualified name duplicates.Term",
        "Duplicate qualified name duplicates.TypeDefinition",
        "Duplicate qualified name duplicates.GetDefaults",
        "Duplicate qualified name duplicates.Container"
    ].forEach(function (sWarning) {
        that.oLogMock.expects("warning").withExactArgs(sWarning, undefined, "sap.ui.model.odata.v4.lib._MetadataConverter");
    });
    testConversion(assert, "<edmx:DataServices>\t<Schema Namespace=\"duplicates\"/>\t<Schema Namespace=\"duplicates\">\t\t<ComplexType Name=\"ArtistsType\"/>\t\t<EntityType Name=\"ArtistsType\">\t\t\t<Key>\t\t\t\t<PropertyRef Name=\"ArtistID\"/>\t\t\t\t<PropertyRef Name=\"IsActiveEntity\"/>\t\t\t</Key>\t\t\t<Property Name=\"ArtistID\" Type=\"Edm.String\" Nullable=\"false\"/>\t\t\t<Property Name=\"IsActiveEntity\" Type=\"Edm.Boolean\" Nullable=\"false\"/>\t\t</EntityType>\t\t<EntityType Name=\"Address\"/>\t\t<ComplexType Name=\"Address\">\t\t\t<Property Name=\"City\" Type=\"Edm.String\"/>\t\t</ComplexType>\t\t<ComplexType Name=\"Enumeration\"/>\t\t<EnumType Name=\"Enumeration\" UnderlyingType=\"Edm.Int32\">\t\t\t<Member Name=\"ENO\"/>\t\t</EnumType>\t\t<ComplexType Name=\"Term\"/>\t\t<Term Name=\"Term\" Type=\"Edm.String\"/>\t\t<ComplexType Name=\"TypeDefinition\"/>\t\t<TypeDefinition Name=\"TypeDefinition\" UnderlyingType=\"Edm.String\"/>\t\t<ComplexType Name=\"GetDefaults\"/>\t\t<Function Name=\"GetDefaults\" EntitySetPath=\"_it\" IsBound=\"true\">\t\t\t<Parameter Name=\"_it\" Type=\"Collection(duplicates.ArtistsType)\" Nullable=\"false\"/>\t\t\t<ReturnType Type=\"duplicates.ArtistsType\" Nullable=\"false\"/>\t\t</Function>\t\t<Function Name=\"GetDefaults\" EntitySetPath=\"_it\" IsBound=\"true\">\t\t\t<Parameter Name=\"_it\" Type=\"duplicates.ArtistsType\" Nullable=\"false\"/>\t\t\t<ReturnType Type=\"duplicates.ArtistsType\" Nullable=\"false\"/>\t\t</Function>\t\t<ComplexType Name=\"Container\"/>\t\t<EntityContainer Name=\"YetAnotherContainer\"/>\t\t<EntityContainer Name=\"Container\">\t\t\t<EntitySet Name=\"Artists\" EntityType=\"duplicates.ArtistsType\"/>\t\t</EntityContainer>\t</Schema></edmx:DataServices>", {
        "$EntityContainer": "duplicates.Container",
        "duplicates.": {
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
            }
        },
        "duplicates.Enumeration": {
            "$kind": "EnumType",
            "ENO": 0
        },
        "duplicates.GetDefaults": [{
                "$EntitySetPath": "_it",
                "$IsBound": true,
                "$Parameter": [{
                        "$Name": "_it",
                        "$Nullable": false,
                        "$Type": "duplicates.ArtistsType",
                        "$isCollection": true
                    }],
                "$ReturnType": {
                    "$Nullable": false,
                    "$Type": "duplicates.ArtistsType"
                },
                "$kind": "Function"
            }, {
                "$EntitySetPath": "_it",
                "$IsBound": true,
                "$Parameter": [{
                        "$Name": "_it",
                        "$Nullable": false,
                        "$Type": "duplicates.ArtistsType"
                    }],
                "$ReturnType": {
                    "$Nullable": false,
                    "$Type": "duplicates.ArtistsType"
                },
                "$kind": "Function"
            }],
        "duplicates.Term": {
            "$Type": "Edm.String",
            "$kind": "Term"
        },
        "duplicates.TypeDefinition": {
            "$UnderlyingType": "Edm.String",
            "$kind": "TypeDefinition"
        },
        "duplicates.YetAnotherContainer": {
            "$kind": "EntityContainer"
        }
    });
});