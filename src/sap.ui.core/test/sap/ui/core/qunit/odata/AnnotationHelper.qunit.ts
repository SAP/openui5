import Log from "sap/base/Log";
import ObjectPath from "sap/base/util/ObjectPath";
import BindingParser from "sap/ui/base/BindingParser";
import ManagedObject from "sap/ui/base/ManagedObject";
import JSONModel from "sap/ui/model/json/JSONModel";
import Basics from "sap/ui/model/odata/_AnnotationHelperBasics";
import Expression from "sap/ui/model/odata/_AnnotationHelperExpression";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import TestUtils from "sap/ui/test/TestUtils";
var AnnotationHelper = sap.ui.model.odata.AnnotationHelper, oCIRCULAR = {}, oBoolean = {
    name: "sap.ui.model.odata.type.Boolean",
    constraints: { "nullable": false }
}, oByte = {
    name: "sap.ui.model.odata.type.Byte",
    constraints: { "nullable": false }
}, oDateTime = {
    name: "sap.ui.model.odata.type.DateTime",
    constraints: { "nullable": false, "isDateOnly": true }
}, oDateTimeOffset = {
    name: "sap.ui.model.odata.type.DateTimeOffset",
    constraints: { "nullable": false }
}, oDecimal = {
    name: "sap.ui.model.odata.type.Decimal",
    constraints: { "nullable": false, "precision": 13, "scale": 3 }
}, oDouble = {
    name: "sap.ui.model.odata.type.Double",
    constraints: { "nullable": false }
}, oFloat = {
    name: "sap.ui.model.odata.type.Single"
}, oGuid = {
    name: "sap.ui.model.odata.type.Guid",
    constraints: { "nullable": false }
}, oInt16 = {
    name: "sap.ui.model.odata.type.Int16",
    constraints: { "nullable": false }
}, oInt32 = {
    name: "sap.ui.model.odata.type.Int32",
    constraints: { "nullable": false }
}, oInt64 = {
    name: "sap.ui.model.odata.type.Int64",
    constraints: { "nullable": false }
}, oSByte = {
    name: "sap.ui.model.odata.type.SByte",
    constraints: { "nullable": false }
}, oSingle = {
    name: "sap.ui.model.odata.type.Single",
    constraints: { "nullable": false }
}, oString10 = {
    name: "sap.ui.model.odata.type.String",
    constraints: { "nullable": false, "maxLength": 10 }
}, oString80 = {
    name: "sap.ui.model.odata.type.String",
    constraints: { "maxLength": 80 }
}, oTime = {
    name: "sap.ui.model.odata.type.Time",
    constraints: { "nullable": false }
}, sGwsampleTestAnnotations = "<?xml version=\"1.0\" encoding=\"utf-8\"?><edmx:Edmx Version=\"4.0\"\txmlns=\"http://docs.oasis-open.org/odata/ns/edm\"\txmlns:edmx=\"http://docs.oasis-open.org/odata/ns/edmx\"><edmx:DataServices><Schema Namespace=\"zanno4sample_anno_mdl.v1\">\t<Annotations Target=\"GWSAMPLE_BASIC.BusinessPartner\">\t\t<Annotation Term=\"com.sap.vocabularies.UI.v1.Identification\">\t\t\t<Collection>\t\t\t\t<!-- standalone fillUriTemplate -->\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataFieldWithUrl\">\t\t\t\t\t<PropertyValue Property=\"Url\">\t\t\t\t\t\t<Apply Function=\"odata.fillUriTemplate\">\t\t\t\t\t\t\t<String><![CDATA[#BusinessPartner-displayFactSheet?BusinessPartnerID={ID1}]]></String>\t\t\t\t\t\t\t<LabeledElement Name=\"ID1\">\t\t\t\t\t\t\t\t<Path>BusinessPartnerID</Path>\t\t\t\t\t\t\t</LabeledElement>\t\t\t\t\t\t</Apply>\t\t\t\t\t</PropertyValue>\t\t\t\t\t<PropertyValue Property=\"Value\" String=\"n/a\"/>\t\t\t\t</Record>\t\t\t\t<!-- concat embeds concat & uriEncode -->\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t<Apply Function=\"odata.concat\">\t\t\t\t\t\t\t<Path>CompanyName</Path>\t\t\t\t\t\t\t<Apply Function=\"odata.concat\">\t\t\t\t\t\t\t\t<String> </String>\t\t\t\t\t\t\t</Apply>\t\t\t\t\t\t\t<Apply Function=\"odata.uriEncode\">\t\t\t\t\t\t\t\t<Path>LegalForm</Path>\t\t\t\t\t\t\t</Apply>\t\t\t\t\t\t</Apply>\t\t\t\t\t</PropertyValue>\t\t\t\t</Record>\t\t\t\t<!-- uriEncode embeds concat -->\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t<Apply Function=\"odata.uriEncode\">\t\t\t\t\t\t\t<Apply Function=\"odata.concat\">\t\t\t\t\t\t\t\t<Path>CompanyName</Path>\t\t\t\t\t\t\t\t<String> </String>\t\t\t\t\t\t\t\t<Path>LegalForm</Path>\t\t\t\t\t\t\t</Apply>\t\t\t\t\t\t</Apply>\t\t\t\t\t</PropertyValue>\t\t\t\t</Record>\t\t\t\t<!-- concat w/ constants -->\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t<Apply Function=\"odata.concat\">\t\t\t\t\t\t\t<Bool>true</Bool>\t\t\t\t\t\t\t<String>|</String>\t\t\t\t\t\t\t<Date>2015-03-24</Date>\t\t\t\t\t\t\t<String>|</String>\t\t\t\t\t\t\t<DateTimeOffset>2015-03-24T14:03:27Z</DateTimeOffset>\t\t\t\t\t\t\t<String>|</String>\t\t\t\t\t\t\t<Decimal>-123456789012345678901234567890.1234567890</Decimal>\t\t\t\t\t\t\t<String>|</String>\t\t\t\t\t\t\t<Float>-7.4503e-36</Float>\t\t\t\t\t\t\t<String>|</String>\t\t\t\t\t\t\t<Guid>0050568D-393C-1ED4-9D97-E65F0F3FCC23</Guid>\t\t\t\t\t\t\t<String>|</String>\t\t\t\t\t\t\t<!-- Number.MAX_SAFE_INTEGER + 1 -->\t\t\t\t\t\t\t<Int>9007199254740992</Int>\t\t\t\t\t\t\t<String>|</String>\t\t\t\t\t\t\t<TimeOfDay>13:57:06</TimeOfDay>\t\t\t\t\t\t</Apply>\t\t\t\t\t</PropertyValue>\t\t\t\t</Record>\t\t\t\t<!-- fillUriTemplate w/ constants -->\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataFieldWithUrl\">\t\t\t\t\t<PropertyValue Property=\"Url\">\t\t\t\t\t\t<Apply Function=\"odata.fillUriTemplate\">\t\t\t\t\t\t\t<String><![CDATA[#{Bool}/{Date}/{DateTimeOffset}/{Decimal}/{Float}/{Guid}/{Int}/{String}/{TimeOfDay}]]></String>\t\t\t\t\t\t\t<LabeledElement Name=\"Bool\">\t\t\t\t\t\t\t\t<Bool>true</Bool>\t\t\t\t\t\t\t</LabeledElement>\t\t\t\t\t\t\t<LabeledElement Name=\"Date\">\t\t\t\t\t\t\t\t<Date>2015-03-24</Date>\t\t\t\t\t\t\t</LabeledElement>\t\t\t\t\t\t\t<LabeledElement Name=\"DateTimeOffset\">\t\t\t\t\t\t\t\t<DateTimeOffset>2015-03-24T14:03:27Z</DateTimeOffset>\t\t\t\t\t\t\t</LabeledElement>\t\t\t\t\t\t\t<LabeledElement Name=\"Decimal\">\t\t\t\t\t\t\t\t<Decimal>-123456789012345678901234567890.1234567890</Decimal>\t\t\t\t\t\t\t</LabeledElement>\t\t\t\t\t\t\t<LabeledElement Name=\"Float\">\t\t\t\t\t\t\t\t<Float>-7.4503e-36</Float>\t\t\t\t\t\t\t</LabeledElement>\t\t\t\t\t\t\t<LabeledElement Name=\"Guid\">\t\t\t\t\t\t\t\t<Guid>0050568D-393C-1ED4-9D97-E65F0F3FCC23</Guid>\t\t\t\t\t\t\t</LabeledElement>\t\t\t\t\t\t\t<LabeledElement Name=\"Int\">\t\t\t\t\t\t\t\t<Int>9007199254740992</Int>\t\t\t\t\t\t\t</LabeledElement>\t\t\t\t\t\t\t<LabeledElement Name=\"String\">\t\t\t\t\t\t\t\t<String>hello, world</String>\t\t\t\t\t\t\t</LabeledElement>\t\t\t\t\t\t\t<LabeledElement Name=\"TimeOfDay\">\t\t\t\t\t\t\t\t<TimeOfDay>13:57:06</TimeOfDay>\t\t\t\t\t\t\t</LabeledElement>\t\t\t\t\t\t</Apply>\t\t\t\t\t</PropertyValue>\t\t\t\t\t<PropertyValue Property=\"Value\" String=\"n/a\"/>\t\t\t\t</Record>\t\t\t\t<!-- fillUriTemplate + uriEncode w/ constants -->\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataFieldWithUrl\">\t\t\t\t\t<PropertyValue Property=\"Url\">\t\t\t\t\t\t<Apply Function=\"odata.fillUriTemplate\">\t\t\t\t\t\t\t<String>/sap/opu/odata/sap/ZUI5_EDM_TYPES/EdmTypesCollection?$filter=Boolean+eq+{Bool}+and+Date+eq+{Date}+and+DateTimeOffset+eq+{DateTimeOffset}+and+Decimal+eq+{Decimal}+and+Double+eq+{Float}+and+GlobalUID+eq+{Guid}+and+Int64+eq+{Int}+and+String40+eq+{String}+and+Time+eq+{TimeOfDay}</String>\t\t\t\t\t\t\t<LabeledElement Name=\"Bool\">\t\t\t\t\t\t\t\t<Apply Function=\"odata.uriEncode\">\t\t\t\t\t\t\t\t\t<Bool>false</Bool>\t\t\t\t\t\t\t\t</Apply>\t\t\t\t\t\t\t</LabeledElement>\t\t\t\t\t\t\t<LabeledElement Name=\"Date\">\t\t\t\t\t\t\t\t<Apply Function=\"odata.uriEncode\">\t\t\t\t\t\t\t\t\t<Date>2033-03-25</Date>\t\t\t\t\t\t\t\t</Apply>\t\t\t\t\t\t\t</LabeledElement>\t\t\t\t\t\t\t<LabeledElement Name=\"DateTimeOffset\">\t\t\t\t\t\t\t\t<Apply Function=\"odata.uriEncode\">\t\t\t\t\t\t\t\t\t<!-- TODO split seconds, e.g. \".123456789012\" -->\t\t\t\t\t\t\t\t\t<DateTimeOffset>2033-01-06T07:25:21Z</DateTimeOffset>\t\t\t\t\t\t\t\t</Apply>\t\t\t\t\t\t\t</LabeledElement>\t\t\t\t\t\t\t<LabeledElement Name=\"Decimal\">\t\t\t\t\t\t\t\t<Apply Function=\"odata.uriEncode\">\t\t\t\t\t\t\t\t\t<Decimal>-12345678901234567.12345678901234</Decimal>\t\t\t\t\t\t\t\t</Apply>\t\t\t\t\t\t\t</LabeledElement>\t\t\t\t\t\t\t<LabeledElement Name=\"Float\">\t\t\t\t\t\t\t\t<Apply Function=\"odata.uriEncode\">\t\t\t\t\t\t\t\t\t<Float>1.69E+308</Float>\t\t\t\t\t\t\t\t</Apply>\t\t\t\t\t\t\t</LabeledElement>\t\t\t\t\t\t\t<LabeledElement Name=\"Guid\">\t\t\t\t\t\t\t\t<Apply Function=\"odata.uriEncode\">\t\t\t\t\t\t\t\t\t<Guid>0050568D-393C-1EE4-A5AE-9AAE85248FF1</Guid>\t\t\t\t\t\t\t\t</Apply>\t\t\t\t\t\t\t</LabeledElement>\t\t\t\t\t\t\t<LabeledElement Name=\"Int\">\t\t\t\t\t\t\t\t<Apply Function=\"odata.uriEncode\">\t\t\t\t\t\t\t\t\t<Int>-9223372036854775800</Int>\t\t\t\t\t\t\t\t</Apply>\t\t\t\t\t\t\t</LabeledElement>\t\t\t\t\t\t\t<LabeledElement Name=\"String\">\t\t\t\t\t\t\t\t<Apply Function=\"odata.uriEncode\">\t\t\t\t\t\t\t\t\t<String>String Filtered Maxlength 40</String>\t\t\t\t\t\t\t\t</Apply>\t\t\t\t\t\t\t</LabeledElement>\t\t\t\t\t\t\t<LabeledElement Name=\"TimeOfDay\">\t\t\t\t\t\t\t\t<Apply Function=\"odata.uriEncode\">\t\t\t\t\t\t\t\t\t<!-- TODO split seconds, e.g. \".123456789012\" -->\t\t\t\t\t\t\t\t\t<TimeOfDay>11:11:11</TimeOfDay>\t\t\t\t\t\t\t\t</Apply>\t\t\t\t\t\t\t</LabeledElement>\t\t\t\t\t\t</Apply>\t\t\t\t\t</PropertyValue>\t\t\t\t\t<PropertyValue Property=\"Value\" String=\"n/a\"/>\t\t\t\t</Record>\t\t\t\t<!-- Comparison Operators -->\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t<And>\t\t\t\t\t\t\t<Eq>\t\t\t\t\t\t\t\t<Lt>\t\t\t\t\t\t\t\t\t<Path>p1</Path>\t\t\t\t\t\t\t\t\t<Path>p2</Path>\t\t\t\t\t\t\t\t</Lt>\t\t\t\t\t\t\t\t<Gt>\t\t\t\t\t\t\t\t\t<Path>p4</Path>\t\t\t\t\t\t\t\t\t<Path>p5</Path>\t\t\t\t\t\t\t\t</Gt>\t\t\t\t\t\t\t</Eq>\t\t\t\t\t\t\t<Ne>\t\t\t\t\t\t\t\t<Ge>\t\t\t\t\t\t\t\t\t<Path>p6</Path>\t\t\t\t\t\t\t\t\t<Path>p7</Path>\t\t\t\t\t\t\t\t</Ge>\t\t\t\t\t\t\t\t<Le>\t\t\t\t\t\t\t\t\t<Path>p8</Path>\t\t\t\t\t\t\t\t\t<Path>p9</Path>\t\t\t\t\t\t\t\t</Le>\t\t\t\t\t\t\t</Ne>\t\t\t\t\t\t</And>\t\t\t\t\t</PropertyValue>\t\t\t\t</Record>\t\t\t\t<!-- Logical Operators -->\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t<Or>\t\t\t\t\t\t\t<Not>\t\t\t\t\t\t\t\t<Eq>\t\t\t\t\t\t\t\t\t<Path>p1</Path>\t\t\t\t\t\t\t\t\t<Path>p2</Path>\t\t\t\t\t\t\t\t</Eq>\t\t\t\t\t\t\t</Not>\t\t\t\t\t\t\t<And>\t\t\t\t\t\t\t\t<Eq>\t\t\t\t\t\t\t\t\t<Path>p3</Path>\t\t\t\t\t\t\t\t\t<Path>p4</Path>\t\t\t\t\t\t\t\t</Eq>\t\t\t\t\t\t\t\t<Eq>\t\t\t\t\t\t\t\t\t<Path>p5</Path>\t\t\t\t\t\t\t\t\t<Path>p6</Path>\t\t\t\t\t\t\t\t</Eq>\t\t\t\t\t\t\t</And>\t\t\t\t\t\t</Or>\t\t\t\t\t</PropertyValue>\t\t\t\t</Record>\t\t\t\t<!-- If and types -->\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t<If>\t\t\t\t\t\t\t<Path>p1</Path>\t\t\t\t\t\t\t<Path>p2</Path>\t\t\t\t\t\t\t<Path>p3</Path>\t\t\t\t\t\t</If>\t\t\t\t\t</PropertyValue>\t\t\t\t</Record>\t\t\t\t<!-- odata.concat w/ strings and single path -->\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t<Apply Function=\"odata.concat\">\t\t\t\t\t\t\t<String>Business Partner(ID=</String>\t\t\t\t\t\t\t<Path>BusinessPartnerID</Path>\t\t\t\t\t\t\t<String>)</String>\t\t\t\t\t\t</Apply>\t\t\t\t\t</PropertyValue>\t\t\t\t</Record>\t\t\t</Collection>\t\t</Annotation>\t</Annotations>\t<Annotations Target=\"GWSAMPLE_BASIC.Contact\">\t\t<!-- edm:If -->\t\t<Annotation Term=\"com.sap.vocabularies.UI.v1.HeaderInfo\">\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.HeaderInfoType\">\t\t\t\t<PropertyValue Property=\"Title\">\t\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t\t<PropertyValue Property=\"Label\" String=\"Name\"/>\t\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t\t<If>\t\t\t\t\t\t\t\t<Eq>\t\t\t\t\t\t\t\t\t<Path>Sex</Path>\t\t\t\t\t\t\t\t\t<String>M</String>\t\t\t\t\t\t\t\t</Eq>\t\t\t\t\t\t\t\t<String>Mr. </String>\t\t\t\t\t\t\t\t<If>\t\t\t\t\t\t\t\t\t<Eq>\t\t\t\t\t\t\t\t\t\t<Path>Sex</Path>\t\t\t\t\t\t\t\t\t\t<String>F</String>\t\t\t\t\t\t\t\t\t</Eq>\t\t\t\t\t\t\t\t\t<String>Mrs. </String>\t\t\t\t\t\t\t\t\t<String></String>\t\t\t\t\t\t\t\t</If>\t\t\t\t\t\t\t</If>\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t</Record>\t\t\t\t</PropertyValue>\t\t\t\t<PropertyValue Property=\"Description\">\t\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataFieldForAction\">\t\t\t\t\t\t<PropertyValue Property=\"Action\"\t\t\t\t\t\t\tString=\"GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/RegenerateAllData\"/>\t\t\t\t\t\t<PropertyValue Property=\"Action2\"\t\t\t\t\t\t\tString=\"GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Foo\"/>\t\t\t\t\t</Record>\t\t\t\t</PropertyValue>\t\t\t\t<PropertyValue Property=\"ImageUrl\">\t\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataFieldWithUrl\">\t\t\t\t\t\t<PropertyValue Property=\"Url\">\t\t\t\t\t\t\t<If>\t\t\t\t\t\t\t\t<Ne>\t\t\t\t\t\t\t\t\t<Path>EmailAddress</Path>\t\t\t\t\t\t\t\t\t<Null/>\t\t\t\t\t\t\t\t</Ne>\t\t\t\t\t\t\t\t<Apply Function=\"odata.concat\">\t\t\t\t\t\t\t\t\t<String>mailto:</String>\t\t\t\t\t\t\t\t\t<Path>EmailAddress</Path>\t\t\t\t\t\t\t\t</Apply>\t\t\t\t\t\t\t\t<Null/>\t\t\t\t\t\t\t</If>\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t\t<PropertyValue Property=\"Value\" String=\"n/a\"/>\t\t\t\t\t</Record>\t\t\t\t</PropertyValue>\t\t\t</Record>\t\t</Annotation>\t</Annotations></Schema></edmx:DataServices></edmx:Edmx>\t\t", sTestMetadata = "<?xml version=\"1.0\" encoding=\"utf-8\"?><edmx:Edmx Version=\"1.0\" xmlns:edmx=\"http://schemas.microsoft.com/ado/2007/06/edmx\"\t\txmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\"\t\txmlns:sap=\"http://www.sap.com/Protocols/SAPData\">\t<edmx:DataServices m:DataServiceVersion=\"2.0\">\t\t<Schema Namespace=\"GWSAMPLE_BASIC\" xml:lang=\"en\" sap:schema-version=\"0000\"\t\t\t\txmlns=\"http://schemas.microsoft.com/ado/2008/09/edm\">\t\t\t<ComplexType Name=\"Foo\">\t\t\t\t<Property Name=\"bar\" Type=\"GWSAMPLE_BASIC.Bar\"/>\t\t\t</ComplexType>\t\t\t<ComplexType Name=\"Bar\">\t\t\t\t<Property Name=\"baz\" Type=\"Edm.String\"/>\t\t\t</ComplexType>\t\t\t<EntityType Name=\"BusinessPartner\" sap:content-version=\"1\"/>\t\t\t<EntityType Name=\"Product\" sap:content-version=\"1\">\t\t\t\t<Property Name=\"_Boolean\" Type=\"Edm.Boolean\" Nullable=\"false\"/>\t\t\t\t<Property Name=\"_Byte\" Type=\"Edm.Byte\" Nullable=\"false\"/>\t\t\t\t<Property Name=\"_DateTime\" Type=\"Edm.DateTime\" Nullable=\"false\"\t\t\t\t\tsap:display-format=\"Date\"/>\t\t\t\t<Property Name=\"_DateTimeOffset\" Type=\"Edm.DateTimeOffset\" Nullable=\"false\"/>\t\t\t\t<Property Name=\"_Decimal\" Type=\"Edm.Decimal\" Nullable=\"false\" Precision=\"13\"\t\t\t\t\tScale=\"3\"/>\t\t\t\t<Property Name=\"_Double\" Type=\"Edm.Double\" Nullable=\"false\"/>\t\t\t\t<Property Name=\"_Float\" Type=\"Edm.Float\"/>\t\t\t\t<Property Name=\"_Guid\" Type=\"Edm.Guid\" Nullable=\"false\"/>\t\t\t\t<Property Name=\"_Int16\" Type=\"Edm.Int16\" Nullable=\"false\"/>\t\t\t\t<Property Name=\"_Int32\" Type=\"Edm.Int32\" Nullable=\"false\"/>\t\t\t\t<Property Name=\"_Int64\" Type=\"Edm.Int64\" Nullable=\"false\"/>\t\t\t\t<Property Name=\"_Int64Small\" Type=\"Edm.Int64\" Nullable=\"false\"/>\t\t\t\t<Property Name=\"_SByte\" Type=\"Edm.SByte\" Nullable=\"false\"/>\t\t\t\t<Property Name=\"_Single\" Type=\"Edm.Single\" Nullable=\"false\"/>\t\t\t\t<Property Name=\"_String10\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"10\"/>\t\t\t\t<Property Name=\"_String80\" Type=\"Edm.String\" MaxLength=\"80\"/>\t\t\t\t<Property Name=\"_Time\" Type=\"Edm.Time\" Nullable=\"false\"/>\t\t\t</EntityType>\t\t</Schema>\t</edmx:DataServices></edmx:Edmx>\t\t", sTestAnnotations = "<?xml version=\"1.0\" encoding=\"utf-8\"?><edmx:Edmx Version=\"4.0\"\t\txmlns=\"http://docs.oasis-open.org/odata/ns/edm\"\t\txmlns:edmx=\"http://docs.oasis-open.org/odata/ns/edmx\">\t<edmx:DataServices>\t\t<Schema Namespace=\"zanno4sample_anno_mdl.v1\">\t\t\t<Annotations Target=\"GWSAMPLE_BASIC.Product\">\t\t\t\t<Annotation Term=\"com.sap.vocabularies.UI.v1.Identification\">\t\t\t\t\t<Collection>\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t\t\t<Eq><Path>_Boolean</Path><Bool>true</Bool></Eq>\t\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t\t</Record>\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t\t\t<Eq><Path>_Byte</Path><Int>255</Int></Eq>\t\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t\t</Record>\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t\t\t<Eq><Path>_DateTime</Path>\t\t\t\t\t\t\t\t<DateTimeOffset>2015-04-22T12:43:07.236Z</DateTimeOffset></Eq>\t\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t\t</Record>\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t\t\t<Eq><Path>_DateTimeOffset</Path>\t\t\t\t\t\t\t\t<DateTimeOffset>2015-04-22T12:43:07.236Z</DateTimeOffset></Eq>\t\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t\t</Record>\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t\t\t<Eq><Path>_Decimal</Path>\t\t\t\t\t\t\t\t<Decimal>104245025234234502435.6430345</Decimal></Eq>\t\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t\t</Record>\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t\t\t<Eq><Path>_Double</Path><Float>3.1415927</Float></Eq>\t\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t\t</Record>\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t\t\t<Eq><Path>_Float</Path><Float>0.30103</Float></Eq>\t\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t\t</Record>\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t\t\t<Eq><Path>_Guid</Path>\t\t\t\t\t\t\t\t<Guid>0050568D-393C-1ED4-9D97-E65F0F3FCC23</Guid></Eq>\t\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t\t</Record>\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t\t\t<Eq><Path>_Int16</Path><Int>16</Int></Eq>\t\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t\t</Record>\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t\t\t<Eq><Path>_Int32</Path><Int>32</Int></Eq>\t\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t\t</Record>\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t\t\t<Eq><Path>_Int64</Path><Int>9007199254740992</Int></Eq>\t\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t\t</Record>\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t\t\t<Eq><Path>_Int64Small</Path><Int>64</Int></Eq>\t\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t\t</Record>\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t\t\t<Eq><Path>_SByte</Path><Int>-126</Int></Eq>\t\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t\t</Record>\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t\t\t<Eq><Path>_Single</Path><Float>2.7182818</Float></Eq>\t\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t\t</Record>\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t\t\t<Eq><Path>_String10</Path><String>foo</String></Eq>\t\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t\t</Record>\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t\t\t<Eq><Path>_String80</Path><String>bar</String></Eq>\t\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t\t</Record>\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.UI.v1.DataField\">\t\t\t\t\t\t\t<PropertyValue Property=\"Value\">\t\t\t\t\t\t\t\t<Eq><Path>_Time</Path><TimeOfDay>12:43:07.236</TimeOfDay></Eq>\t\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t\t</Record>\t\t\t\t\t</Collection>\t\t\t\t</Annotation>\t\t\t</Annotations>\t\t</Schema>\t</edmx:DataServices></edmx:Edmx>\t\t", sPath2BusinessPartner = "/dataServices/schema/0/entityType/0", sPath2Product = "/dataServices/schema/0/entityType/1", sPath2SalesOrder = "/dataServices/schema/0/entityType/2", sPath2SalesOrderLineItem = "/dataServices/schema/0/entityType/3", sPath2Contact = "/dataServices/schema/0/entityType/4", fnEscape = BindingParser.complexParser.escape, fnGetNavigationPath = AnnotationHelper.getNavigationPath, fnIsMultiple = AnnotationHelper.isMultiple, fnSimplePath = AnnotationHelper.simplePath, TestControl = ManagedObject.extend("TestControl", {
    metadata: {
        properties: {
            any: "any",
            text: "string"
        }
    }
}), mHeaders = { "Content-Type": "application/xml" }, mFixture = {
    "/GWSAMPLE_BASIC/$metadata": { source: "GWSAMPLE_BASIC.metadata.xml" },
    "/GWSAMPLE_BASIC/annotations": { source: "GWSAMPLE_BASIC.annotations.xml" },
    "/GWSAMPLE_BASIC/test_annotations": { headers: mHeaders, message: sGwsampleTestAnnotations },
    "/test/$metadata": { headers: mHeaders, message: sTestMetadata },
    "/test/annotations": { headers: mHeaders, message: sTestAnnotations }
};
oCIRCULAR.circle = oCIRCULAR;
function format(vValue, oCurrentContext, fnMethod, bSkipRawValue) {
    if (typeof oCurrentContext === "function") {
        fnMethod = oCurrentContext;
        oCurrentContext = null;
    }
    fnMethod = fnMethod || AnnotationHelper.format;
    if (fnMethod.requiresIContext === true) {
        return bSkipRawValue ? fnMethod(oCurrentContext) : fnMethod(oCurrentContext, vValue);
    }
    return fnMethod(vValue);
}
function parse(sBinding) {
    return BindingParser.complexParser(sBinding, undefined, true) || sBinding;
}
function formatAndParse(vValue, oCurrentContext, fnMethod, bSkipRawValue) {
    return parse(format(vValue, oCurrentContext, fnMethod, bSkipRawValue));
}
function testBinding(assert, oCurrentContext, vExpected, oModelData) {
    var oModel = new JSONModel(oModelData), oControl = new TestControl({
        models: oModel,
        bindingContexts: oModel.createBindingContext("/")
    }), oRawValue = oCurrentContext.getObject(), sBinding = format(oRawValue, oCurrentContext), oSingleBindingInfo = parse(sBinding);
    oControl.bindProperty("text", oSingleBindingInfo);
    assert.strictEqual(oControl.getText(), vExpected, sBinding);
}
function withGwsampleModel(assert, fnCodeUnderTest) {
    return withGivenService(assert, "/GWSAMPLE_BASIC", "/GWSAMPLE_BASIC/annotations", fnCodeUnderTest);
}
function withGwsampleModelAndTestAnnotations(assert, fnCodeUnderTest) {
    return withGivenService(assert, "/GWSAMPLE_BASIC", "/GWSAMPLE_BASIC/test_annotations", fnCodeUnderTest);
}
function withTestModel(assert, fnCodeUnderTest) {
    return withGivenService(assert, "/test", "/test/annotations", fnCodeUnderTest);
}
function withGivenService(assert, sServiceUrl, vAnnotationUrl, fnCodeUnderTest) {
    var oModel = new ODataModel(sServiceUrl, {
        annotationURI: vAnnotationUrl,
        json: true,
        loadMetadataAsync: true
    });
    function onFailed(oEvent) {
        var oParameters = oEvent.getParameters();
        while (oParameters.getParameters) {
            oParameters = oParameters.getParameters();
        }
        assert.ok(false, "Failed to load: " + JSON.stringify(oParameters));
    }
    oModel.attachMetadataFailed(onFailed);
    oModel.attachAnnotationsFailed(onFailed);
    return oModel.getMetaModel().loaded().then(function () {
        return fnCodeUnderTest(oModel.getMetaModel(), oModel);
    });
}
QUnit.module("sap.ui.model.odata.AnnotationHelper", {
    after: function () {
        delete window.foo;
    },
    before: function () {
        window.foo = {
            Helper: {
                help: function help(oRawValue) {
                    return "_" + oRawValue + "_";
                }
            }
        };
    },
    beforeEach: function () {
        var oModel = new JSONModel({ bar: "world", foo: "hello" }), oControl = new TestControl({
            models: {
                "undefined": oModel,
                "model": oModel
            }
        });
        this.oControl = oControl;
        this.formatter = function formatter() {
            var aArray = Array.prototype.slice.apply(arguments);
            return JSON.stringify.call(JSON, aArray);
        };
        TestUtils.useFakeServer(this._oSandbox, "sap/ui/core/qunit/model", mFixture);
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
    },
    checkMultiple: function checkMultiple(assert, aParts, aExpectedValues) {
        var oControl = this.oControl;
        [undefined, this.formatter].forEach(function (fnRootFormatter) {
            var sExpectedText = fnRootFormatter ? JSON.stringify(aExpectedValues) : aExpectedValues.join(" ");
            oControl.applySettings({
                "text": AnnotationHelper.createPropertySetting(aParts, fnRootFormatter)
            });
            assert.strictEqual(oControl.getText(), sExpectedText);
        });
    },
    checkSingle: function checkSingle(assert, sBinding, sExpectedText) {
        var oControl = this.oControl, aParts = [sBinding];
        [undefined, this.formatter].forEach(function (fnRootFormatter) {
            if (fnRootFormatter) {
                sExpectedText = JSON.stringify([sExpectedText]);
            }
            oControl.applySettings({
                "text": AnnotationHelper.createPropertySetting(aParts, fnRootFormatter)
            });
            assert.strictEqual(oControl.getText(), sExpectedText, "sBinding: " + sBinding);
            assert.strictEqual(aParts[0], sBinding, "array argument unchanged");
        });
    }
});
[true, false].forEach(function (bWithRawValue) {
    var sTitle = "format: forward to getExpression: with RawValue " + bWithRawValue;
    QUnit.test(sTitle, function (assert) {
        var oInterface = {
            getObject: function () { }
        }, oRawValue = {}, sResult = {}, oGetObjectMock = this.mock(oInterface).expects("getObject");
        this.mock(Expression).expects("getExpression").withExactArgs(sinon.match.same(oInterface), sinon.match.same(oRawValue), true).returns(sResult);
        if (bWithRawValue) {
            oGetObjectMock.never();
            assert.strictEqual(AnnotationHelper.format(oInterface, oRawValue), sResult, "result");
        }
        else {
            oGetObjectMock.withExactArgs("").returns(oRawValue);
            assert.strictEqual(AnnotationHelper.format(oInterface), sResult, "result");
        }
    });
});
["", "foo", "{path : 'foo'}", "path : \"{\\f,o,o}\""].forEach(function (sString) {
    QUnit.test("format: 14.4.11 Expression edm:String: " + sString, function (assert) {
        return withGwsampleModel(assert, function (oMetaModel) {
            var sMetaPath = sPath2Product + "/com.sap.vocabularies.UI.v1.FieldGroup#Dimensions/Data/0/Label", oCurrentContext = oMetaModel.getContext(sMetaPath), oRawValue = oMetaModel.getProperty(sMetaPath);
            oRawValue.String = sString;
            assert.strictEqual(formatAndParse(oRawValue, oCurrentContext), sString);
        });
    });
});
QUnit.test("format: forward to getExpression: raw value auto-determined", function (assert) {
    var that = this;
    return withGwsampleModel(assert, function (oMetaModel) {
        var sMetaPath = sPath2Product + "/com.sap.vocabularies.UI.v1.FieldGroup#Dimensions/Data/0/Label", oCurrentContext = oMetaModel.getContext(sMetaPath), sString = "{path : 'foo'}", oRawValue = oMetaModel.getProperty(sMetaPath);
        that.mock(Expression).expects("getExpression").withExactArgs(sinon.match.same(oCurrentContext), sinon.match.same(oRawValue), true).returns(sString);
        AnnotationHelper.format(oCurrentContext);
    });
});
QUnit.test("format: 14.4.11 Expression edm:String: references", function (assert) {
    return withGwsampleModel(assert, function (oMetaModel) {
        var sMetaPath = sPath2Product + "/com.sap.vocabularies.UI.v1.FieldGroup#Dimensions/Data/0/Label", oCurrentContext = oMetaModel.getContext(sMetaPath), oEntityTypeBP, oRawValue = oMetaModel.getProperty(sMetaPath), oSingleBindingInfo;
        function getSetting(sName) {
            assert.strictEqual(sName, "bindTexts");
            return true;
        }
        oCurrentContext.getSetting = getSetting;
        oSingleBindingInfo = formatAndParse(oRawValue, oCurrentContext);
        assert.deepEqual(oSingleBindingInfo, {
            path: "/##/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']/entityType/" + "[${name}==='Product']/com.sap.vocabularies.UI.v1.FieldGroup" + "#Dimensions/Data/[${Value/Path}==='Width']/Label/String"
        });
        assert.ok(AnnotationHelper.format(oCurrentContext, oRawValue).indexOf("\"") < 0);
        oEntityTypeBP = oMetaModel.getObject(sPath2Product);
        oEntityTypeBP["foo{Dimensions}"] = oEntityTypeBP["com.sap.vocabularies.UI.v1.FieldGroup#Dimensions"];
        sMetaPath = sPath2Product + "/foo{Dimensions}/Data/0/Label";
        oCurrentContext = oMetaModel.getContext(sMetaPath);
        oRawValue = oMetaModel.getProperty(sMetaPath);
        oCurrentContext.getSetting = getSetting;
        oSingleBindingInfo = formatAndParse(oRawValue, oCurrentContext);
        assert.deepEqual(oSingleBindingInfo, {
            path: "/##/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']/entityType/" + "[${name}==='Product']/foo{Dimensions}/Data/[${Value/Path}==='Width']" + "/Label/String"
        });
    });
});
[
    { typeName: "Bool", result: "true" },
    { typeName: "Date", result: "2015-03-24" },
    { typeName: "DateTimeOffset", result: "2015-03-24T14:03:27Z" },
    { typeName: "Decimal", result: "-123456789012345678901234567890.1234567890" },
    { typeName: "Float", result: "-7.4503e-36" },
    { typeName: "Guid", result: "0050568D-393C-1ED4-9D97-E65F0F3FCC23" },
    { typeName: "Int", result: "9007199254740992" },
    { typeName: "TimeOfDay", result: "13:57:06" }
].forEach(function (oFixture, index) {
    var sTitle = "format: 14.4.x Constant Expression edm:" + oFixture.typeName;
    QUnit.test(sTitle, function (assert) {
        return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
            var sMetaPath = sPath2BusinessPartner + "/com.sap.vocabularies.UI.v1.Identification/3/Value/Apply/Parameters/" + (2 * index), oCurrentContext = oMetaModel.getContext(sMetaPath), oRawValue = oMetaModel.getObject(sMetaPath);
            assert.strictEqual(formatAndParse(oRawValue, oCurrentContext), oFixture.result);
        });
    });
});
["", "/", ".", "foo", "path : 'foo'", "path : \"{\\f,o,o}\""].forEach(function (sPath) {
    var sTitle = "format: 14.5.12 Expression edm:Path: " + JSON.stringify(sPath);
    QUnit.test(sTitle, function (assert) {
        var oMetaModel = new JSONModel({
            "Value": {
                "Path": sPath
            }
        }), sMetaPath = "/Value", oCurrentContext = oMetaModel.getContext(sMetaPath), oRawValue = oMetaModel.getProperty(sMetaPath), oSingleBindingInfo;
        this.oLogMock.expects("warning").withExactArgs("Could not find property '" + sPath + "' starting from '/Value/Path'", null, "sap.ui.model.odata.AnnotationHelper");
        oSingleBindingInfo = formatAndParse(oRawValue, oCurrentContext);
        assert.strictEqual(typeof oSingleBindingInfo, "object", "got a binding info");
        assert.strictEqual(oSingleBindingInfo.path, sPath);
        assert.strictEqual(oSingleBindingInfo.type, undefined);
    });
});
[
    oBoolean,
    oByte,
    oDateTime,
    oDateTimeOffset,
    oDecimal,
    oDouble,
    oFloat,
    oGuid,
    oInt16,
    oInt32,
    oInt64,
    oInt64,
    oSByte,
    oSingle,
    oString10,
    oString80,
    oTime
].forEach(function (oType, i) {
    var sPath = sPath2Product + "/com.sap.vocabularies.UI.v1.Identification/" + i + "/Value/Eq/0";
    QUnit.test("format: 14.5.12 Expression edm:Path w/ type, path = " + sPath + ", type = " + oType.name, function (assert) {
        return withTestModel(assert, function (oMetaModel) {
            var oCurrentContext = oMetaModel.getContext(sPath), oRawValue = oMetaModel.getObject(sPath), sBinding, oSingleBindingInfo;
            sBinding = format(oRawValue, oCurrentContext);
            assert.ok(!/constraints\s*:\s*{}/.test(sBinding), "No empty constraints in binding");
            oSingleBindingInfo = parse(sBinding);
            assert.strictEqual(oSingleBindingInfo.path, oRawValue.Path);
            assert.ok(oSingleBindingInfo.type instanceof ObjectPath.get(oType.name), "type is " + oType.name);
            assert.deepEqual(oSingleBindingInfo.type.oConstraints, oType.constraints);
            assert.ok(AnnotationHelper.format(oCurrentContext, oRawValue).indexOf("\"") < 0);
        });
    });
});
[
    { Apply: null },
    { Apply: "unsupported" },
    { Apply: { Name: "unsupported" } },
    { Apply: { Name: "odata.concat" } },
    { Apply: { Name: "odata.concat", Parameters: {} } },
    { Apply: { Name: "odata.fillUriTemplate" } },
    { Apply: { Name: "odata.fillUriTemplate", Parameters: {} } },
    { Apply: { Name: "odata.fillUriTemplate", Parameters: [] } },
    { Apply: { Name: "odata.fillUriTemplate", Parameters: [{}] } },
    { Apply: { Name: "odata.fillUriTemplate", Parameters: [null] } },
    { Apply: { Name: "odata.fillUriTemplate", Parameters: ["no object"] } },
    { Apply: { Name: "odata.fillUriTemplate", Parameters: [{ Type: "NoString" }] } },
    { Apply: { Name: "odata.uriEncode" } },
    { Apply: { Name: "odata.uriEncode", Parameters: {} } },
    { Apply: { Name: "odata.uriEncode", Parameters: [] } },
    { Apply: { Name: "odata.uriEncode", Parameters: [null] } }
].forEach(function (oApply) {
    var sError = "Unsupported: " + Basics.toErrorString(oApply);
    QUnit.test("format: 14.5.3 Expression edm:Apply: " + sError, function (assert) {
        this.mock(Basics).expects("error").throws(new SyntaxError());
        return withGwsampleModel(assert, function (oMetaModel) {
            var sPath = sPath2Contact + "/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value", oCurrentContext = oMetaModel.getContext(sPath);
            assert.strictEqual(formatAndParse(oApply, oCurrentContext), sError);
        });
    });
});
QUnit.test("format: 14.5.3.1.1 Function odata.concat", function (assert) {
    return withGwsampleModel(assert, function (oMetaModel) {
        var sPath = sPath2Contact + "/com.sap.vocabularies.UI.v1.Badge/Title/Value", oRawValue = oMetaModel.getObject(sPath);
        oRawValue.Apply.Parameters[1].Value = " ";
        testBinding(assert, oMetaModel.getContext(sPath), "John Doe", {
            FirstName: "John",
            LastName: "Doe"
        });
    });
});
QUnit.test("format: 14.5.3.1.1 Function odata.concat: escaping & unsupported type", function (assert) {
    this.mock(Basics).expects("error").throws(new SyntaxError());
    return withGwsampleModel(assert, function (oMetaModel) {
        var sPath = sPath2Contact + "/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value", oCurrentContext = oMetaModel.getContext(sPath), oParameter = { Type: "Int16", Value: 42 }, oRawValue = {
            Apply: {
                Name: "odata.concat",
                Parameters: [{ Type: "String", Value: "{foo}" }, oParameter]
            }
        };
        assert.strictEqual(formatAndParse(oRawValue, oCurrentContext), "Unsupported: " + Basics.toErrorString(oRawValue));
    });
});
QUnit.test("format: 14.5.3.1.1 Function odata.concat: null parameter", function (assert) {
    this.mock(Basics).expects("error").throws(new SyntaxError());
    return withGwsampleModel(assert, function (oMetaModel) {
        var sPath = sPath2Contact + "/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value", oCurrentContext = oMetaModel.getContext(sPath), oRawValue = {
            Apply: {
                Name: "odata.concat",
                Parameters: [{ Type: "String", Value: "*foo*" }, null]
            }
        };
        assert.strictEqual(formatAndParse(oRawValue, oCurrentContext), "Unsupported: " + Basics.toErrorString(oRawValue));
    });
});
QUnit.test("format: 14.5.3.1.1 Function odata.concat: various constants", function (assert) {
    return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
        var sMetaPath = sPath2BusinessPartner + "/com.sap.vocabularies.UI.v1.Identification/3/Value", oCurrentContext = oMetaModel.getContext(sMetaPath), oRawValue = oMetaModel.getObject(sMetaPath);
        assert.strictEqual(formatAndParse(oRawValue, oCurrentContext), "true|" + "2015-03-24|" + "2015-03-24T14:03:27Z|" + "-123456789012345678901234567890.1234567890|" + "-7.4503e-36|" + "0050568D-393C-1ED4-9D97-E65F0F3FCC23|" + "9007199254740992|" + "13:57:06");
    });
});
QUnit.test("format: 14.5.3.1.2 odata.fillUriTemplate: fake annotations", function (assert) {
    return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
        var sMetaPath = sPath2BusinessPartner + "/com.sap.vocabularies.UI.v1.Identification/0/Url", oContext = oMetaModel.getContext(sMetaPath);
        testBinding(assert, oContext, "#BusinessPartner-displayFactSheet?BusinessPartnerID=0815", {
            BusinessPartnerID: "0815"
        });
        oContext.getSetting = function (sSetting) {
            return sSetting === "bindTexts";
        };
        assert.strictEqual(format(oContext.getObject(), oContext), "{=odata.fillUriTemplate(${path:" + "'/##/dataServices/schema/[${namespace}===\\'GWSAMPLE_BASIC\\']/entityType/" + "[${name}===\\'BusinessPartner\\']/com.sap.vocabularies.UI.v1.Identification/" + "0/Url/Apply/Parameters/0/Value'},{'ID1':${BusinessPartnerID}})}");
    });
});
QUnit.test("format: 14.5.3.1.2 odata.fillUriTemplate: various constants", function (assert) {
    return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
        var sMetaPath = sPath2BusinessPartner + "/com.sap.vocabularies.UI.v1.Identification/4/Url", oCurrentContext = oMetaModel.getContext(sMetaPath), oRawValue = oMetaModel.getObject(sMetaPath);
        assert.strictEqual(formatAndParse(oRawValue, oCurrentContext), "#true/2015-03-24/" + encodeURIComponent("2015-03-24T14:03:27Z") + "/-123456789012345678901234567890.1234567890/-7.4503e-36" + "/0050568D-393C-1ED4-9D97-E65F0F3FCC23/9007199254740992/" + encodeURIComponent("hello, world") + "/" + encodeURIComponent("13:57:06"));
    });
});
[
    { type: "String", value: "foo\\bar", result: "'foo\\bar'" },
    { type: "Unsupported", value: "foo\\bar", error: true }
].forEach(function (oFixture) {
    QUnit.test("format: 14.5.3.1.3 Function odata.uriEncode: " + JSON.stringify(oFixture.type), function (assert) {
        if (oFixture.error) {
            this.mock(Basics).expects("error").throws(new SyntaxError());
        }
        return withGwsampleModel(assert, function (oMetaModel) {
            var oExpectedResult, sMetaPath = sPath2BusinessPartner + "/com.sap.vocabularies.UI.v1.Identification/0/Url", oCurrentContext = oMetaModel.getContext(sMetaPath), oRawValue = {
                Apply: {
                    Name: "odata.uriEncode",
                    Parameters: [{
                            Type: oFixture.type,
                            Value: oFixture.value
                        }]
                }
            };
            oExpectedResult = oFixture.error ? "Unsupported: " + Basics.toErrorString(oRawValue) : oFixture.result;
            assert.strictEqual(formatAndParse(oRawValue, oCurrentContext), oExpectedResult);
        });
    });
});
QUnit.test("format: 14.5.3.1.3 Function odata.uriEncode", function (assert) {
    return withGwsampleModel(assert, function (oMetaModel) {
        var sMetaPath = sPath2BusinessPartner + "/com.sap.vocabularies.UI.v1.Identification/2" + "/Url/Apply/Parameters/1/Value";
        testBinding(assert, oMetaModel.getContext(sMetaPath), "'Domplatz'", {
            Address: {
                Street: "Domplatz",
                City: "Speyer"
            }
        });
    });
});
[
    { type: "Bool", result: "false" },
    { type: "Date", result: "datetime'2033-03-25T00:00:00'" },
    { type: "DateTimeOffset", result: "datetimeoffset'2033-01-06T07:25:21Z'" },
    { type: "Decimal", result: "-12345678901234567.12345678901234m" },
    { type: "Float", result: "1.69e+308d" },
    { type: "Guid", result: "guid'0050568D-393C-1EE4-A5AE-9AAE85248FF1'" },
    { type: "Int", result: "-9223372036854775800l" },
    { type: "String", result: "'String Filtered Maxlength 40'" },
    { type: "TimeOfDay", result: "time'PT11H11M11S'" }
].forEach(function (oFixture, index) {
    QUnit.test("format: 14.5.3.1.3 odata.uriEncode of edm:" + oFixture.type, function (assert) {
        return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
            var sMetaPath = sPath2BusinessPartner + "/com.sap.vocabularies.UI.v1.Identification/5/Url/Apply/" + "Parameters/" + (index + 1) + "/Value", oCurrentContext = oMetaModel.getContext(sMetaPath), oRawValue = oMetaModel.getObject(sMetaPath);
            assert.strictEqual(formatAndParse(oRawValue, oCurrentContext), oFixture.result);
        });
    });
});
QUnit.test("format: 14.5.3.1.3 odata.uriEncode: integration-like test", function (assert) {
    function encode(s) {
        return encodeURIComponent(s).replace(/'/g, "%27");
    }
    return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
        var sExpectedUrl, sMetaPath = sPath2BusinessPartner + "/com.sap.vocabularies.UI.v1.Identification/5/Url", oCurrentContext = oMetaModel.getContext(sMetaPath), oRawValue = oMetaModel.getObject(sMetaPath);
        sExpectedUrl = "/sap/opu/odata/sap/ZUI5_EDM_TYPES/EdmTypesCollection?$filter=" + "Boolean+eq+false" + "+and+Date+eq+" + encode("datetime'2033-03-25T00:00:00'") + "+and+DateTimeOffset+eq+" + encode("datetimeoffset'2033-01-06T07:25:21Z'") + "+and+Decimal+eq+" + encode("-12345678901234567.12345678901234m") + "+and+Double+eq+" + encode("1.69e+308d") + "+and+GlobalUID+eq+" + encode("guid'0050568D-393C-1EE4-A5AE-9AAE85248FF1'") + "+and+Int64+eq+" + encode("-9223372036854775800l") + "+and+String40+eq+" + encode("'String Filtered Maxlength 40'") + "+and+Time+eq+" + encode("time'PT11H11M11S'");
        assert.strictEqual(formatAndParse(oRawValue, oCurrentContext), sExpectedUrl, sExpectedUrl);
    });
});
QUnit.test("format: 14.5.3 Nested apply (fillUriTemplate embeds uriEncode)", function (assert) {
    return withGwsampleModel(assert, function (oMetaModel) {
        var sMetaPath = sPath2BusinessPartner + "/com.sap.vocabularies.UI.v1.Identification/2" + "/Url";
        testBinding(assert, oMetaModel.getContext(sMetaPath), "https://www.google.de/maps/place/%27Domplatz%27,%27Speyer%27", {
            Address: {
                Street: "Domplatz",
                City: "Speyer"
            }
        });
    });
});
QUnit.test("format: 14.5.3 Nested apply (odata.fillUriTemplate & invalid uriEncode)", function (assert) {
    this.mock(Basics).expects("error").throws(new SyntaxError());
    return withGwsampleModel(assert, function (oMetaModel) {
        var sMetaPath = sPath2BusinessPartner + "/com.sap.vocabularies.UI.v1." + "Identification/2/Url", oCurrentContext = oMetaModel.getContext(sMetaPath), oRawValue = {
            Apply: {
                Name: "odata.fillUriTemplate",
                Parameters: [{
                        Type: "String",
                        Value: "http://foo.bar/{x}"
                    }, {
                        Name: "x",
                        Value: {
                            Apply: { Name: "odata.uriEncode" }
                        }
                    }]
            }
        };
        assert.strictEqual(formatAndParse(oRawValue, oCurrentContext), "Unsupported: " + Basics.toErrorString(oRawValue));
    });
});
QUnit.test("format: 14.5.3 Nested apply (concat embeds concat & uriEncode)", function (assert) {
    return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
        var sMetaPath = sPath2BusinessPartner + "/com.sap.vocabularies.UI.v1.Identification/1/Value";
        testBinding(assert, oMetaModel.getContext(sMetaPath), "SAP 'SE'", {
            CompanyName: "SAP",
            LegalForm: "SE"
        });
    });
});
QUnit.test("format: 14.5.3 Nested apply (uriEncode embeds concat)", function (assert) {
    return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
        var sMetaPath = sPath2BusinessPartner + "/com.sap.vocabularies.UI.v1.Identification/2/Value";
        testBinding(assert, oMetaModel.getContext(sMetaPath), "'SAP SE'", {
            CompanyName: "SAP",
            LegalForm: "SE"
        });
    });
});
QUnit.test("format: 14.5.1 Comparison and Logical Operators: part 1, comparison", function (assert) {
    var that = this;
    return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
        var sMetaPath = sPath2BusinessPartner + "/com.sap.vocabularies.UI.v1.Identification/6/Value", oCurrentContext = oMetaModel.getContext(sMetaPath), oRawValue = oMetaModel.getObject(sMetaPath);
        that.mock(Expression).expects("path").atLeast(1).callsFake(function (oInterface, oPathValue) {
            return { result: "binding", value: oPathValue.value, type: "Edm.String" };
        });
        assert.strictEqual(format(oRawValue, oCurrentContext), "{=((${p1}<${p2})===(${p4}>${p5}))&&((${p6}>=${p7})!==(${p8}<=${p9}))}");
    });
});
QUnit.test("format: 14.5.1 Comparison and Logical Operators: part 2, logical", function (assert) {
    var that = this;
    return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
        var sMetaPath = sPath2BusinessPartner + "/com.sap.vocabularies.UI.v1.Identification/7/Value", oCurrentContext = oMetaModel.getContext(sMetaPath), oRawValue = oMetaModel.getObject(sMetaPath);
        that.mock(Expression).expects("path").atLeast(1).callsFake(function (oInterface, oPathValue) {
            return { result: "binding", value: oPathValue.value };
        });
        assert.strictEqual(format(oRawValue, oCurrentContext), "{=(!(${p1}===${p2}))||((${p3}===${p4})&&(${p5}===${p6}))}");
    });
});
[
    { path: "_Boolean", value: true },
    { path: "_Byte", value: 255 },
    { path: "_DateTime", value: new Date(Date.UTC(2015, 3, 22, 12, 43, 7, 236)) },
    { path: "_DateTimeOffset", value: new Date(Date.UTC(2015, 3, 22, 12, 43, 7, 236)) },
    { path: "_Decimal", value: "104245025234234502435.6430345" },
    { path: "_Double", value: 3.1415927 },
    { path: "_Float", value: 0.30103 },
    { path: "_Guid", value: "0050568D-393C-1ED4-9D97-E65F0F3FCC23" },
    { path: "_Int16", value: 16 },
    { path: "_Int32", value: 32 },
    { path: "_Int64", value: "9007199254740992" },
    { path: "_Int64Small", value: "64" },
    { path: "_SByte", value: -126 },
    { path: "_Single", value: 2.7182818 },
    { path: "_String10", value: "foo" },
    { path: "_String80", value: "bar" },
    { path: "_Time", value: { __edmType: "Edm.Time", ms: Date.UTC(1970, 0, 1, 12, 43, 7, 236) } }
].forEach(function (oFixture, i) {
    QUnit.test("format: 14.5.1 Comparison and Logical Operators: Eq on" + oFixture.path, function (assert) {
        return withTestModel(assert, function (oMetaModel) {
            var sPath = sPath2Product + "/com.sap.vocabularies.UI.v1.Identification/" + i + "/Value/", oCurrentContext = oMetaModel.getContext(sPath), oTestData = {};
            testBinding(assert, oCurrentContext, "false", oTestData);
            oTestData[oFixture.path] = oFixture.value;
            testBinding(assert, oCurrentContext, "true", oTestData);
        });
    });
});
QUnit.test("format: 14.5.6 Expression edm:If", function (assert) {
    return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
        var sMetaPath = sPath2Contact + "/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value", oCurrentContext = oMetaModel.getContext(sMetaPath);
        testBinding(assert, oCurrentContext, "Mr. ", { Sex: "M" });
        testBinding(assert, oCurrentContext, "Mrs. ", { Sex: "F" });
        testBinding(assert, oCurrentContext, "", { Sex: "" });
    });
});
QUnit.test("format: 14.5.6 Expression edm:If: types", function (assert) {
    var that = this;
    return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
        var sMetaPath = sPath2BusinessPartner + "/com.sap.vocabularies.UI.v1.Identification/8/Value", oCurrentContext = oMetaModel.getContext(sMetaPath), oRawValue = oMetaModel.getObject(sMetaPath);
        that.mock(Expression).expects("path").atLeast(1).callsFake(function (oInterface, oPathValue) {
            return { result: "binding", value: oPathValue.value, type: "Edm.Boolean" };
        });
        assert.strictEqual(format(oRawValue, oCurrentContext), "{=${p1}?${path:'p2',type:'sap.ui.model.odata.type.Boolean'}" + ":${path:'p3',type:'sap.ui.model.odata.type.Boolean'}}");
    });
});
QUnit.test("format: 14.5.10 Expression edm:Null", function (assert) {
    return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
        var sMetaPath = sPath2Contact + "/com.sap.vocabularies.UI.v1.HeaderInfo/ImageUrl/Url", oCurrentContext = oMetaModel.getContext(sMetaPath);
        testBinding(assert, oCurrentContext, undefined, { EmailAddress: null }, "null from formatter converted to property's default value");
        testBinding(assert, oCurrentContext, "mailto:foo@bar.com", { EmailAddress: "foo@bar.com" });
    });
});
[true, false].forEach(function (bWithRawValue) {
    var sTitle = "simplePath: forward to getExpression: with RawValue " + bWithRawValue;
    QUnit.test(sTitle, function (assert) {
        var oInterface = {
            getObject: function () { }
        }, oRawValue = {}, sResult = {}, oGetObjectMock = this.mock(oInterface).expects("getObject");
        this.mock(Expression).expects("getExpression").withExactArgs(sinon.match.same(oInterface), sinon.match.same(oRawValue), false).returns(sResult);
        if (bWithRawValue) {
            oGetObjectMock.never();
            assert.strictEqual(AnnotationHelper.simplePath(oInterface, oRawValue), sResult, "result");
        }
        else {
            oGetObjectMock.withExactArgs("").returns(oRawValue);
            assert.strictEqual(AnnotationHelper.simplePath(oInterface), sResult, "result");
        }
    });
});
["", "/", ".", "foo", "{\\}", "path : 'foo'", "path : \"{\\f,o,o}\""].forEach(function (sPath) {
    var sTitle = "simplePath: 14.5.12 Expression edm:Path: " + JSON.stringify(sPath);
    QUnit.test(sTitle, function (assert) {
        var bIsSimple = sPath.indexOf(":") < 0 && fnEscape(sPath) === sPath, oMetaModel = new JSONModel({
            "Value": {
                "Path": sPath
            }
        }), sMetaPath = "/Value", oCurrentContext = oMetaModel.getContext(sMetaPath), oRawValue = oMetaModel.getProperty(sMetaPath), oSingleBindingInfo;
        this.oLogMock.expects("warning").exactly(bIsSimple ? 2 : 1).withExactArgs("Could not find property '" + sPath + "' starting from '/Value/Path'", null, "sap.ui.model.odata.AnnotationHelper");
        oSingleBindingInfo = formatAndParse(oRawValue, oCurrentContext, fnSimplePath);
        assert.strictEqual(typeof oSingleBindingInfo, "object", "got a binding info");
        assert.strictEqual(oSingleBindingInfo.path, sPath);
        assert.strictEqual(oSingleBindingInfo.type, undefined);
        assert.strictEqual(oSingleBindingInfo.constraints, undefined);
        if (bIsSimple) {
            assert.strictEqual(fnSimplePath(oCurrentContext, oRawValue), "{" + sPath + "}", "make sure that simple cases look simple");
        }
    });
});
[{
        AnnotationPath: "",
        metaPath: sPath2Product + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
        navigationPath: "",
        resolvedPath: sPath2Product
    }, {
        AnnotationPath: "ToSupplier",
        metaPath: sPath2Product + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
        entitySet: "BusinessPartnerSet",
        isMultiple: false,
        navigationPath: "ToSupplier",
        resolvedPath: sPath2BusinessPartner
    }, {
        AnnotationPath: "ToSupplier/@com.sap.vocabularies.Communication.v1.Address",
        metaPath: sPath2Product + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
        entitySet: "BusinessPartnerSet",
        isMultiple: false,
        navigationPath: "ToSupplier",
        resolvedPath: sPath2BusinessPartner + "/com.sap.vocabularies.Communication.v1.Address"
    }, {
        AnnotationPath: "ToLineItems/ToProduct/ToSupplier/ToContacts/@com.sap.vocabularies.UI.v1.HeaderInfo",
        metaPath: sPath2SalesOrder + "/com.sap.vocabularies.UI.v1.Facets/0/Target",
        entitySet: "ContactSet",
        isMultiple: Error,
        navigationPath: "ToLineItems/ToProduct/ToSupplier/ToContacts",
        resolvedPath: sPath2Contact + "/com.sap.vocabularies.UI.v1.HeaderInfo"
    }, {
        AnnotationPath: "ToLineItems/@foo.Bar",
        metaPath: sPath2SalesOrder + "/com.sap.vocabularies.UI.v1.Facets/0/Target",
        entitySet: "SalesOrderLineItemSet",
        isMultiple: true,
        navigationPath: "ToLineItems",
        resolvedPath: sPath2SalesOrderLineItem + "/foo.Bar"
    }, {
        AnnotationPath: "ToProduct/ToSupplier/ToContacts/@com.sap.vocabularies.UI.v1.HeaderInfo",
        metaPath: sPath2SalesOrderLineItem + "/com.sap.vocabularies.UI.v1.Facets/0/Target",
        entitySet: "ContactSet",
        isMultiple: true,
        navigationPath: "ToProduct/ToSupplier/ToContacts",
        resolvedPath: sPath2Contact + "/com.sap.vocabularies.UI.v1.HeaderInfo"
    }, {
        AnnotationPath: "@com.sap.vocabularies.UI.v1.FieldGroup#Dimensions",
        metaPath: sPath2Product + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
        navigationPath: "",
        resolvedPath: sPath2Product + "/com.sap.vocabularies.UI.v1.FieldGroup#Dimensions"
    }, {
        AnnotationPath: "unsupported.type.cast",
        metaPath: sPath2Product + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
        navigationPath: "",
        resolvedPath: undefined
    }, {
        AnnotationPath: "invalid_property",
        metaPath: sPath2Product + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
        navigationPath: "",
        resolvedPath: undefined
    }, {
        AnnotationPath: "invalid_property/@some.Annotation",
        metaPath: sPath2Product + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
        navigationPath: "",
        resolvedPath: undefined
    }, {
        NavigationPropertyPath: "ToBusinessPartner",
        metaPath: sPath2Contact + "/com.sap.vocabularies.UI.v1.LineItem/0/Target",
        entitySet: "BusinessPartnerSet",
        isMultiple: false,
        navigationPath: "ToBusinessPartner",
        resolvedPath: sPath2BusinessPartner
    }, {
        Path: "Address",
        metaPath: sPath2BusinessPartner + "/com.sap.vocabularies.Communication.v1.Address/street",
        navigationPath: "",
        resolvedPath: sPath2BusinessPartner + "/property/0"
    }, {
        Path: "Address/Street",
        metaPath: sPath2BusinessPartner + "/com.sap.vocabularies.Communication.v1.Address/street",
        navigationPath: "",
        resolvedPath: "/dataServices/schema/0/complexType/0/property/2"
    }, {
        PropertyPath: "Address/Street",
        metaPath: sPath2BusinessPartner + "/com.sap.vocabularies.Communication.v1.Address/street",
        navigationPath: "",
        resolvedPath: "/dataServices/schema/0/complexType/0/property/2"
    }, {
        Path: "",
        metaPath: "/dataServices/schema/0/entityContainer/0/entitySet/1" + "/com.sap.vocabularies.UI.v1.DataPoint/Value",
        navigationPath: "",
        resolvedPath: "/dataServices/schema/0/entityContainer/0/entitySet/1"
    }, {
        Path: "ProductID",
        metaPath: "/dataServices/schema/0/entityContainer/0/entitySet/1" + "/com.sap.vocabularies.UI.v1.DataPoint/Value",
        navigationPath: "",
        resolvedPath: "/dataServices/schema/0/entityType/1/property/0"
    }].forEach(function (oFixture) {
    var sPath, sTitle;
    if (oFixture.hasOwnProperty("AnnotationPath")) {
        sPath = oFixture.AnnotationPath;
        sTitle = "14.5.2 Expression edm:AnnotationPath: " + sPath;
    }
    else if (oFixture.hasOwnProperty("Path")) {
        sPath = oFixture.Path;
        sTitle = "14.5.12 Expression edm:Path: " + sPath;
    }
    else if (oFixture.hasOwnProperty("PropertyPath")) {
        sPath = oFixture.PropertyPath;
        sTitle = "14.5.13 Expression edm:PropertyPath: " + sPath;
    }
    else if (oFixture.hasOwnProperty("NavigationPropertyPath")) {
        sPath = oFixture.NavigationPropertyPath;
        sTitle = "14.5.11 Expression edm:NavigationPropertyPath: " + sPath;
    }
    if (oFixture.navigationPath === "") {
        oFixture.entitySet = undefined;
        oFixture.isMultiple = false;
    }
    QUnit.test("followPath: " + sTitle, function (assert) {
        var that = this;
        return withGwsampleModel(assert, function (oMetaModel) {
            var oContext = oMetaModel.createBindingContext(oFixture.metaPath), oRawValue = oMetaModel.getProperty(oFixture.metaPath), oSingleBindingInfo;
            if (oRawValue) {
                delete oRawValue.AnnotationPath;
                delete oRawValue.Path;
                delete oRawValue.PropertyPath;
                delete oRawValue.NavigationPropertyPath;
                if (oFixture.hasOwnProperty("AnnotationPath")) {
                    oRawValue.AnnotationPath = oFixture.AnnotationPath;
                }
                else if (oFixture.hasOwnProperty("Path")) {
                    oRawValue.Path = oFixture.Path;
                }
                else if (oFixture.hasOwnProperty("PropertyPath")) {
                    oRawValue.PropertyPath = oFixture.PropertyPath;
                }
                else if (oFixture.hasOwnProperty("NavigationPropertyPath")) {
                    oRawValue.NavigationPropertyPath = oFixture.NavigationPropertyPath;
                }
            }
            [false, true].forEach(function (bSkipRawValue) {
                oSingleBindingInfo = formatAndParse(oRawValue, oContext, fnGetNavigationPath, bSkipRawValue);
                assert.strictEqual(typeof oSingleBindingInfo, "object", "getNavigationPath: got a binding info; skip raw value: " + bSkipRawValue);
                assert.strictEqual(oSingleBindingInfo.path, oFixture.navigationPath, "getNavigationPath; skip raw value: " + bSkipRawValue);
                assert.strictEqual(oSingleBindingInfo.type, undefined, "getNavigationPath: no type; skip raw value: " + bSkipRawValue);
            });
            if (!oFixture.entitySet) {
                that.oLogMock.expects("warning").withExactArgs(oFixture.metaPath + ": found 'undefined' which is not a name of an entity set", undefined, "sap.ui.model.odata.AnnotationHelper");
            }
            assert.strictEqual(AnnotationHelper.gotoEntitySet(oContext), oFixture.entitySet ? oMetaModel.getODataEntitySet(oFixture.entitySet, true) : undefined, "gotoEntitySet");
            [false, true].forEach(function (bSkipRawValue) {
                if (oFixture.isMultiple === Error) {
                    try {
                        formatAndParse(oRawValue, oContext, fnIsMultiple, bSkipRawValue);
                        assert.ok(false, "Exception expected");
                    }
                    catch (e) {
                        assert.strictEqual(e.message, "Association end with multiplicity \"*\" is not the last one: " + sPath);
                    }
                }
                else {
                    assert.strictEqual(formatAndParse(oRawValue, oContext, fnIsMultiple, bSkipRawValue), String(oFixture.isMultiple), "isMultiple");
                }
            });
            assert.strictEqual(AnnotationHelper.resolvePath(oContext), oFixture.resolvedPath, "resolvePath");
        });
    });
});
[{
        metaPath: "/foo",
        isMultiple: "",
        navigationPath: undefined,
        resolvedPath: undefined
    }, {
        metaPath: sPath2Product + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
        isMultiple: "",
        navigationPath: undefined,
        resolvedPath: undefined
    }, {
        metaPath: "/dataServices/schema/0/@foo.Bar",
        isMultiple: "",
        navigationPath: undefined,
        resolvedPath: undefined
    }].forEach(function (oFixture) {
    var sTitle = "followPath: Missing path expression, context: " + oFixture.metaPath;
    QUnit.test(sTitle, function (assert) {
        var that = this;
        return withGwsampleModel(assert, function (oMetaModel) {
            var oContext = oMetaModel.createBindingContext(oFixture.metaPath), oRawValue = oMetaModel.getProperty(oFixture.metaPath);
            if (oRawValue) {
                delete oRawValue.AnnotationPath;
            }
            else if (oFixture.metaPath === "/dataServices/schema/0/@foo.Bar") {
                oRawValue = {
                    "AnnotationPath": "n/a"
                };
                oMetaModel.getProperty("/dataServices/schema/0")["foo.Bar"] = oRawValue;
            }
            assert.strictEqual(AnnotationHelper.getNavigationPath(oContext, oRawValue), "", "getNavigationPath");
            that.oLogMock.expects("warning").withExactArgs(oFixture.metaPath + ": found 'undefined' which is not a name of an entity set", undefined, "sap.ui.model.odata.AnnotationHelper");
            assert.strictEqual(AnnotationHelper.gotoEntitySet(oContext), undefined, "gotoEntitySet");
            assert.strictEqual(formatAndParse(oRawValue, oContext, fnIsMultiple), "", "isMultiple");
            that.oLogMock.expects("warning").withExactArgs(oFixture.metaPath + ": Path could not be resolved ", undefined, "sap.ui.model.odata.AnnotationHelper");
            assert.strictEqual(AnnotationHelper.resolvePath(oContext), undefined, "resolvePath");
        });
    });
});
QUnit.test("followPath: starting at complex type", function (assert) {
    return withTestModel(assert, function (oMetaModel) {
        var oContext = oMetaModel.createBindingContext("/dataServices/schema/0/complexType/0/"), oResult;
        oResult = Basics.followPath(oContext, { Path: "bar/baz" });
        assert.strictEqual(oResult.resolvedPath, "/dataServices/schema/0/complexType/1/property/0");
    });
});
QUnit.test("gotoEntityType: called directly on the entity type's qualified name", function (assert) {
    return withGwsampleModel(assert, function (oMetaModel) {
        var sMetaPath = "/dataServices/schema/0/entityContainer/0/entitySet/0/entityType", sQualifiedName = "GWSAMPLE_BASIC.BusinessPartner", oContext = oMetaModel.createBindingContext(sMetaPath);
        assert.strictEqual(oMetaModel.getProperty(sMetaPath), sQualifiedName);
        assert.strictEqual(AnnotationHelper.gotoEntityType(oContext), oMetaModel.getODataEntityType(sQualifiedName, true));
    });
});
QUnit.test("gotoEntityType: entity type's qualified name not found", function (assert) {
    var that = this;
    return withGwsampleModel(assert, function (oMetaModel) {
        var sMetaPath = "/dataServices/schema/0/entityContainer/0/associationSet/0/end/0/entitySet", oContext = oMetaModel.createBindingContext(sMetaPath);
        that.oLogMock.expects("warning").withExactArgs(sMetaPath + ": found 'VH_LanguageSet' which is not a name of an entity type", undefined, "sap.ui.model.odata.AnnotationHelper");
        assert.strictEqual(AnnotationHelper.gotoEntityType(oContext), undefined);
    });
});
QUnit.test("gotoEntitySet: called directly on the entity set's name", function (assert) {
    return withGwsampleModel(assert, function (oMetaModel) {
        var sMetaPath = "/dataServices/schema/0/entityContainer/0/associationSet/1/end/1/entitySet", oContext = oMetaModel.createBindingContext(sMetaPath);
        assert.strictEqual(oMetaModel.getProperty(sMetaPath), "ProductSet");
        assert.strictEqual(AnnotationHelper.gotoEntitySet(oContext), oMetaModel.getODataEntitySet("ProductSet", true));
    });
});
QUnit.test("gotoEntitySet: entity set's name not found", function (assert) {
    var that = this;
    return withGwsampleModel(assert, function (oMetaModel) {
        var sMetaPath = "/dataServices/schema/0/entityContainer/0/functionImport/0/parameter/0/name", oContext = oMetaModel.createBindingContext(sMetaPath);
        that.oLogMock.expects("warning").withExactArgs(sMetaPath + ": found 'NoOfSalesOrders' which is not a name of an entity set", undefined, "sap.ui.model.odata.AnnotationHelper");
        assert.strictEqual(AnnotationHelper.gotoEntitySet(oContext), undefined);
    });
});
QUnit.test("gotoFunctionImport", function (assert) {
    return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
        var sMetaPath = sPath2Contact + "/com.sap.vocabularies.UI.v1.HeaderInfo/Description/Action", oContext = oMetaModel.createBindingContext(sMetaPath);
        assert.strictEqual(AnnotationHelper.gotoFunctionImport(oContext), oMetaModel.getODataFunctionImport("RegenerateAllData", true));
    });
});
QUnit.test("gotoFunctionImport: function import not found", function (assert) {
    var that = this;
    return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
        var sMetaPath = sPath2Contact + "/com.sap.vocabularies.UI.v1.HeaderInfo/Description/Action2", oContext = oMetaModel.createBindingContext(sMetaPath);
        that.oLogMock.expects("warning").withExactArgs(sMetaPath + ": found 'GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Foo' which is not a name of a " + "function import", undefined, "sap.ui.model.odata.AnnotationHelper");
        assert.strictEqual(AnnotationHelper.gotoFunctionImport(oContext), undefined);
    });
});
QUnit.test("createPropertySetting: some basics", function (assert) {
    assert.deepEqual(AnnotationHelper.createPropertySetting(["{/foo/bar}"]), {
        formatter: undefined,
        parts: [{
                path: "/foo/bar"
            }]
    }, "{/foo/bar}");
    assert.deepEqual(AnnotationHelper.createPropertySetting(["{meta>foo/bar}"]), {
        formatter: undefined,
        parts: [{
                model: "meta",
                path: "foo/bar"
            }]
    }, "{meta>foo/bar}");
    assert.deepEqual(AnnotationHelper.createPropertySetting(["{path:'foo/bar'}"]), {
        formatter: undefined,
        parts: [{
                path: "foo/bar"
            }]
    }, "{path:'foo/bar'}");
    assert.deepEqual(AnnotationHelper.createPropertySetting(["{path:'meta>/foo/bar'}"]), {
        formatter: undefined,
        parts: [{
                path: "meta>/foo/bar"
            }]
    }, "{path:'meta>/foo/bar'}");
});
QUnit.test("createPropertySetting: simple binding syntax", function (assert) {
    this.checkSingle(assert, "{/foo}", "hello");
    this.checkSingle(assert, "{model>/foo}", "hello");
});
QUnit.test("createPropertySetting: complex binding syntax", function (assert) {
    this.checkSingle(assert, "{path : 'model>/foo', formatter : 'foo.Helper.help'}", "_hello_");
    this.checkSingle(assert, "{model : 'model', path : '/bar', formatter : 'foo.Helper.help'}", "_world_");
    this.checkSingle(assert, "{parts : [{path : '/foo', formatter : 'foo.Helper.help'}]}", "_hello_");
});
QUnit.test("createPropertySetting: composite binding", function (assert) {
    this.checkSingle(assert, "hello {path : '/bar', formatter : 'foo.Helper.help'}", "hello _world_");
    this.checkSingle(assert, "hello {path : 'model>/bar', formatter : 'foo.Helper.help'}", "hello _world_");
    this.checkSingle(assert, "hello {model : 'model', path : '/bar', formatter : 'foo.Helper.help'}", "hello _world_");
});
QUnit.test("createPropertySetting: expression binding", function (assert) {
    this.checkSingle(assert, "{:= ${/foo} + ' ' + ${path:'/bar'}}", "hello world");
    this.checkSingle(assert, "{:= ${model>/foo} + ' ' + ${path:'model>/bar'}}", "hello world");
    this.checkSingle(assert, "{:= ${model>/foo} + ' ' + ${model:'model',path:'/bar'}}", "hello world");
});
QUnit.test("createPropertySetting: empty array of parts", function (assert) {
    assert.strictEqual(AnnotationHelper.createPropertySetting([]), undefined);
    assert.strictEqual(AnnotationHelper.createPropertySetting([], this.formatter), "[]");
});
QUnit.test("createPropertySetting: multiple parts: simple binding syntax", function (assert) {
    this.checkMultiple(assert, ["{/foo}", "{model>/bar}"], ["hello", "world"]);
});
QUnit.test("createPropertySetting: multiple parts: complex binding syntax", function (assert) {
    this.checkMultiple(assert, [
        "{path : '/foo', formatter : 'foo.Helper.help'}",
        "{model : 'model', path : '/bar', formatter : 'foo.Helper.help'}"
    ], ["_hello_", "_world_"]);
});
QUnit.test("createPropertySetting: multiple parts: composite binding", function (assert) {
    this.checkMultiple(assert, [
        "hello {model : 'model', path : '/bar', formatter : 'foo.Helper.help'}",
        "{path : 'model>/foo', formatter : 'foo.Helper.help'} world"
    ], ["hello _world_", "_hello_ world"]);
});
QUnit.test("createPropertySetting: multiple parts: expression binding", function (assert) {
    this.checkMultiple(assert, [
        "{:= ${/foo} + '>' + ${path:'/bar'}}",
        "{:= ${model>/bar} + '<' + ${model:'model',path:'/foo'}}"
    ], ["hello>world", "world<hello"]);
});
QUnit.test("createPropertySetting: single constant string value", function (assert) {
    var that = this;
    ["", "hello, world!", "}{"].forEach(function (sConstant) {
        that.checkSingle(assert, BindingParser.complexParser.escape(sConstant), sConstant);
        that.checkSingle(assert, "{:= '" + sConstant + "'}", sConstant);
    });
});
QUnit.test("createPropertySetting: single constant non-string value", function (assert) {
    var oControl = this.oControl, that = this;
    function strictEqualOrNaN(vActual, vExpected) {
        if (vExpected !== vExpected) {
            assert.ok(vActual !== vActual);
        }
        else {
            assert.strictEqual(vActual, vExpected);
        }
    }
    [false, true, 0, 1, NaN, null, undefined, []].forEach(function (vConstant) {
        var sBinding, vPropertySetting;
        [undefined, that.formatter].forEach(function (fnRootFormatter) {
            var vExpectedValue = fnRootFormatter ? JSON.stringify([vConstant]) : vConstant, aParts = [vConstant];
            vPropertySetting = AnnotationHelper.createPropertySetting(aParts, fnRootFormatter);
            assert.deepEqual(aParts, [vConstant], "array argument unchanged");
            strictEqualOrNaN(vPropertySetting, vExpectedValue);
            oControl.applySettings({ "any": vPropertySetting });
            strictEqualOrNaN(oControl.getAny(), oControl.validateProperty("any", vExpectedValue));
            oControl.applySettings({ "text": vPropertySetting });
            strictEqualOrNaN(oControl.getText(), oControl.validateProperty("text", vExpectedValue));
        });
        sBinding = Array.isArray(vConstant) ? "{:= " + JSON.stringify(vConstant) + "}" : "{:= " + vConstant + "}";
        vPropertySetting = AnnotationHelper.createPropertySetting([sBinding]);
        strictEqualOrNaN(vPropertySetting, "" + vConstant);
    });
});
QUnit.test("createPropertySetting: multiple constant values", function (assert) {
    var aParts = ["", "hello, world!", false, true, 0, 1, NaN, null, undefined, []], aExpectedValues = aParts.slice();
    aParts.push(BindingParser.complexParser.escape("}{"));
    aExpectedValues.push("}{");
    this.checkMultiple(assert, aParts, aExpectedValues);
});
QUnit.test("createPropertySetting: Unsupported part", function (assert) {
    [Function].forEach(function (vPart) {
        assert.throws(function () {
            AnnotationHelper.createPropertySetting([vPart]);
        }, new Error("Unsupported part: " + vPart), "Unsupported part: " + vPart);
    });
});
QUnit.test("createPropertySetting: Function name(s) not found", function (assert) {
    var sBinding = "{path:'/foo',formatter:'foo'} {path:'/bar',formatter:'bar'}";
    assert.throws(function () {
        AnnotationHelper.createPropertySetting([sBinding]);
    }, new Error("Function name(s) foo, bar not found"), "Function name(s) not found");
});
QUnit.test("createPropertySetting: odata.concat w/ strings and single path", function (assert) {
    return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
        var oModel = new JSONModel({ BusinessPartnerID: "0815" }), oControl = new TestControl({
            models: oModel,
            bindingContexts: oModel.createBindingContext("/")
        }), sMetaPath = sPath2BusinessPartner + "/com.sap.vocabularies.UI.v1.Identification/9/Value", oCurrentContext = oMetaModel.getContext(sMetaPath), oRawValue = oMetaModel.getObject(sMetaPath), sBinding = format(oRawValue, oCurrentContext), oBindingInfo;
        assert.strictEqual(sBinding, "Business Partner(ID=" + "{path:'BusinessPartnerID',type:'sap.ui.model.odata.type.String'" + ",constraints:{'maxLength':'10','nullable':'false'}})");
        oBindingInfo = AnnotationHelper.createPropertySetting([sBinding]);
        assert.deepEqual(Object.keys(oBindingInfo), ["formatter", "parts"]);
        assert.strictEqual(oBindingInfo.parts.length, 1);
        assert.deepEqual(Object.keys(oBindingInfo.parts[0]), ["path", "type"]);
        oControl.applySettings({ "text": oBindingInfo });
        assert.strictEqual(oControl.getText(), "Business Partner(ID=0815)");
    });
});
QUnit.test("createPropertySetting: single part, but two formatters", function (assert) {
    return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
        var oModel = new JSONModel({ BusinessPartnerID: "0815" }), oControl = new TestControl({
            models: oModel,
            bindingContexts: oModel.createBindingContext("/")
        }), sMetaPath = sPath2BusinessPartner + "/com.sap.vocabularies.UI.v1.Identification/9/Value", oCurrentContext = oMetaModel.getContext(sMetaPath), oRawValue = oMetaModel.getObject(sMetaPath), sBinding = format(oRawValue, oCurrentContext), oBindingInfo;
        function help(oRawValue) {
            assert.strictEqual(this, oControl, "'this' is kept");
            return "_" + oRawValue + "_";
        }
        assert.strictEqual(sBinding, "Business Partner(ID=" + "{path:'BusinessPartnerID',type:'sap.ui.model.odata.type.String'" + ",constraints:{'maxLength':'10','nullable':'false'}})");
        oBindingInfo = AnnotationHelper.createPropertySetting([sBinding], help);
        assert.deepEqual(Object.keys(oBindingInfo), ["formatter", "parts"]);
        assert.strictEqual(oBindingInfo.parts.length, 1);
        assert.deepEqual(Object.keys(oBindingInfo.parts[0]), ["path", "type"]);
        oControl.applySettings({ "text": oBindingInfo });
        assert.strictEqual(oControl.getText(), "_Business Partner(ID=0815)_");
    });
});
QUnit.test("createPropertySetting: two formatters reduced to one", function (assert) {
    var oBindingInfo, oControl = this.oControl, aParts = [{
            formatter: window.foo.Helper.help,
            model: "model",
            path: "/foo"
        }];
    oBindingInfo = AnnotationHelper.createPropertySetting(aParts, this.formatter);
    assert.deepEqual(aParts[0], {
        formatter: window.foo.Helper.help,
        model: "model",
        path: "/foo"
    }, "array argument unchanged");
    assert.deepEqual(Object.keys(oBindingInfo), ["formatter", "parts"]);
    assert.strictEqual(oBindingInfo.parts.length, 1);
    assert.deepEqual(Object.keys(oBindingInfo.parts[0]), ["model", "path"]);
    oControl.applySettings({ "text": oBindingInfo });
    assert.strictEqual(oControl.getText(), JSON.stringify(["_hello_"]));
    assert.strictEqual(oBindingInfo.parts[0].mode, "OneWay", "determined by #applySettings");
});