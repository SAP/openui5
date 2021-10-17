import Log from "sap/base/Log";
import MockServer from "sap/ui/core/util/MockServer";
import jQuery from "jquery.sap.sjax";
QUnit.module("sap/ui/core/util/MockServer: given data and complex filter features in MockServer", {
    beforeEach: function () {
        this.oMockServer = new MockServer({
            rootUri: "/myService/"
        });
        this.simpleXML = "test-resources/sap/ui/core/qunit/mockserver/testdata/apfapp/tMockServerFeatureTestingMetadata.xml";
        this.simpleJSON = "test-resources/sap/ui/core/qunit/mockserver/testdata/apfapp/";
        this.oMockServer.simulate(this.simpleXML, this.simpleJSON);
        this.oMockServer.start();
        this.log = function (text) {
            var prevLevel = Log.getLevel();
            Log.setLevel(Log.Level.DEBUG);
            Log.debug("  ##test: " + text);
            Log.setLevel(prevLevel);
        };
        this.post = function (object, type) {
            var oSettings = JSON.stringify(object);
            this.oResponse = jQuery.sap.syncPost("/myService/" + type, oSettings, "json");
        };
        this.postSet = function (aSet, type) {
            var i = 0;
            for (i; i < aSet.length; ++i) {
                this.oResponse = jQuery.sap.syncPost("/myService/" + type, JSON.stringify(aSet[i]), "json");
            }
        };
        this.postTable = function (aTable, oTemplate, sType) {
            var row, attr = 0, member;
            var obj;
            for (row = 0; row < aTable.length; ++row) {
                obj = {};
                attr = 0;
                for (member in oTemplate) {
                    if (oTemplate.hasOwnProperty(member)) {
                        var value = (aTable[row])[attr];
                        obj["" + member] = value;
                        ++attr;
                    }
                }
                this.oResponse = jQuery.sap.syncPost("/myService/" + sType, JSON.stringify(obj), "json");
            }
        };
    },
    afterEach: function () {
        this.oMockServer.stop();
        this.oMockServer.destroy();
    }
});
QUnit.test("row filter condition", function (assert) {
    var rowExpr = "(SAPClient eq 'SAPClient_0') and (Currency_E eq 6287.57)";
    var wcaQuery = "TestQueryResults?$filter=" + rowExpr;
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, 200);
    assert.equal(this.oResponse.data.d.results.length, 1, "1 row");
});
QUnit.test("row filter condition", function (assert) {
    var rowExpr = "(SAPClient EQ 'SAPClient_0')";
    var wcaQuery = "TestQueryResults?$filter=" + rowExpr;
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.equal(this.oResponse.statusCode, 400, "is as expected");
});
QUnit.test("AND not supported", function (assert) {
    var rowExpr = "(SAPClient eq 'SAPClient_0') AND (Currency_E eq 6287.57)";
    var wcaQuery = "TestQueryResults?$filter=" + rowExpr;
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.equal(this.oResponse.statusCode, 400);
});
QUnit.test("row filter condition", function (assert) {
    var rowExpr = "(SAPClient eq 'SAPClient_0')";
    var wcaQuery = "TestQueryResults?$filter=" + rowExpr;
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "200");
    assert.equal(this.oResponse.data.d.results.length, 1, "1 row");
});
QUnit.test("row filter condition w/o brackets", function (assert) {
    var rowExpr = "SAPClient eq 'SAPClient_0' and Currency_E eq 6287.57 and P_SAPClient eq 776";
    var wcaQuery = "TestQueryResults?$filter=" + rowExpr;
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "200");
    assert.equal(this.oResponse.data.d.results.length, 1, "1 row");
});
QUnit.test("BUG row filter condition w/o brackets shall fail", function (assert) {
    var row1 = "SAPClient eq 'SAPClient_0' and Currency_E eq 6287.57 and P_SAPClient eq 776";
    var row2 = "SAPClient eq 'SAPClient_1' and Currency_E eq 3878.94 and P_SAPClient eq 776";
    var wcaQuery = "TestQueryResults?$filter=" + row1 + " or " + row2;
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "200");
    assert.equal(this.oResponse.data.d.results.length, 1, "correct 2 rows <<<<< BUG");
    assert.equal(this.oResponse.data.d.results[0].ID, "ID_1", " correct ID_0 <<<<< BUG");
});
QUnit.test("row filter condition with brackets", function (assert) {
    var row1 = "(SAPClient eq 'SAPClient_0' and Currency_E eq 6287.57 and P_SAPClient eq 776)";
    var row2 = "(SAPClient eq 'SAPClient_1' and Currency_E eq 3878.94 and P_SAPClient eq 776)";
    var wcaQuery = "TestQueryResults?$filter=" + row1 + " or " + row2;
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "200", "200 expected");
    assert.equal(this.oResponse.data.d.results.length, 2, "2 row");
});
QUnit.test("multi rows, 1", function (assert) {
    var orExpr = "SAPClient eq 'SAPClient_0' or Currency_E eq 6287.57 or P_SAPClient eq 776";
    var wcaQuery = "TestQueryResults?$filter=" + orExpr;
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.equal(this.oResponse.statusCode, "200");
    assert.equal(this.oResponse.data.d.results[0].ID, "ID_0");
});
QUnit.test("multi rows, 2", function (assert) {
    var orExpr = "SAPClient eq 'SAPClient_0' or SAPClient eq 'SAPClient_1'";
    var wcaQuery = "TestQueryResults?$filter=" + orExpr;
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.equal(this.oResponse.statusCode, "200");
    assert.equal(this.oResponse.data.d.results[0].ID, "ID_0");
});
QUnit.test("multi rows, 2", function (assert) {
    var orExpr = "(SAPClient eq 'SAPClient_0' and P_SAPClient eq 776) or (SAPClient eq 'SAPClient_1'  and P_SAPClient eq 776)";
    var wcaQuery = "TestQueryResults?$filter=" + orExpr;
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.equal(this.oResponse.statusCode, "200", "200 expected");
    assert.equal(this.oResponse.data.d.results.length, 2, "2 row");
});
QUnit.test("multi rows, 2", function (assert) {
    var orExpr = "SAPClient eq 'SAPClient_0' and P_SAPClient eq 776 or SAPClient eq 'SAPClient_1'  and P_SAPClient eq 776";
    var wcaQuery = "TestQueryResults?$filter=" + orExpr;
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.equal(this.oResponse.statusCode, "200");
    assert.equal(this.oResponse.data.d.results[0].ID, "ID_0");
    assert.equal(this.oResponse.data.d.results[1].ID, "ID_1");
});
QUnit.test("multi rows, 2, brackets around or", function (assert) {
    var orExpr = "(SAPClient eq 'SAPClient_0' and P_SAPClient eq 776 or SAPClient eq 'SAPClient_1'  and P_SAPClient eq 776)";
    var wcaQuery = "TestQueryResults?$filter=" + orExpr;
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.equal(this.oResponse.statusCode, "200");
    assert.equal(this.oResponse.data.d.results[0].ID, "ID_0");
    assert.equal(this.oResponse.data.d.results[1].ID, "ID_1");
});
QUnit.test("multi rows, 2, brackets around or", function (assert) {
    var orExpr = "((SAPClient eq 'SAPClient_0') and P_SAPClient eq 776 or SAPClient eq 'SAPClient_1'  and P_SAPClient eq 776)";
    var wcaQuery = "TestQueryResults?$filter=" + orExpr;
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.equal(this.oResponse.statusCode, "200");
    assert.equal(this.oResponse.data.d.results[0].ID, "ID_0");
    assert.equal(this.oResponse.data.d.results.length, 1, "1 row  <<<<<<<<<<< BUG");
});
QUnit.test("multi rows, 2, brackets around or AND eq ", function (assert) {
    var orExpr = "(SAPClient eq 'SAPClient_0' and P_SAPClient eq 776 or SAPClient eq 'SAPClient_1'  and P_SAPClient eq 776) and P_SAPClient eq 776";
    var wcaQuery = "TestQueryResults?$filter=" + orExpr;
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.equal(this.oResponse.statusCode, "200");
    assert.equal(this.oResponse.data.d.results[0].ID, "ID_0");
    assert.equal(this.oResponse.data.d.results[1].ID, "ID_1");
});
QUnit.test("multi rows, 2, brackets around or AND eq in brackets", function (assert) {
    var orExpr = "(SAPClient eq 'SAPClient_0' and P_SAPClient eq 776 or SAPClient eq 'SAPClient_1' and P_SAPClient eq 776) and (P_SAPClient eq 776 or P_SAPClient eq 776)";
    var wcaQuery = "TestQueryResults?$filter=" + orExpr;
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.equal(this.oResponse.statusCode, "200", "200 expected");
    assert.equal(this.oResponse.data.d.results.length, 2, "2 row");
});
QUnit.test("POST object", function (assert) {
    var myData = {
        "ID": "ID_100",
        "P_SAPClient": 778,
        "SAPClient": "SAPClient_100",
        "Currency_E": 1234
    };
    this.post(myData, "TestQueryResults");
    assert.ok(this.oResponse !== undefined, "response undefined");
    var rowExpr = "(SAPClient eq 'SAPClient_100')";
    var wcaQuery = "TestQueryResults?$filter=" + rowExpr;
    var response = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.equal(response.statusCode, "200");
    var atomId = "/myService/TestQueryResults(ID='ID_100',P_SAPClient=778)";
    response = jQuery.sap.sjax({ url: atomId });
    assert.equal(response.statusCode, "200");
});
QUnit.test("POST set of objects", function (assert) {
    var aSet = [];
    aSet.push({
        "ID": "ID_101",
        "P_SAPClient": 999,
        "SAPClient": "SAPClient_999",
        "Currency_E": 1234
    });
    aSet.push({
        "ID": "ID_102",
        "P_SAPClient": 999,
        "SAPClient": "SAPClient_999",
        "Currency_E": 11234
    });
    this.postSet(aSet, "TestQueryResults");
    var response = jQuery.sap.sjax({ url: "/myService/TestQueryResults?$filter=(SAPClient eq 'SAPClient_999')" });
    assert.equal(response.statusCode, "200");
    assert.equal(response.data.d.results.length, 2, "many");
    response = jQuery.sap.sjax({ url: "/myService/TestQueryResults(ID='ID_101',P_SAPClient=999)" });
    assert.ok(response.data.d !== undefined, "match");
    response = jQuery.sap.sjax({ url: "/myService/TestQueryResults(ID='ID_102',P_SAPClient=999)" });
    assert.ok(response.data.d !== undefined, "match");
});
QUnit.test("POST table", function (assert) {
    var aTable = [
        ["ID_101", 999, "SAPClient_999", 11234],
        ["ID_102", 999, "SAPClient_999", 111234]
    ];
    var template = { "ID": null, "P_SAPClient": null, SAPClient: null, "Currency_E": null };
    this.postTable(aTable, template, "TestQueryResults");
    var response = jQuery.sap.sjax({ url: "/myService/TestQueryResults?$filter=(SAPClient eq 'SAPClient_999')" });
    assert.equal(response.statusCode, "200");
    assert.equal(response.data.d.results.length, 2, "many");
    response = jQuery.sap.sjax({ url: "/myService/TestQueryResults(ID='ID_101',P_SAPClient=999)" });
    assert.ok(response.data.d !== undefined, "match");
    response = jQuery.sap.sjax({ url: "/myService/TestQueryResults(ID='ID_102',P_SAPClient=999)" });
    assert.ok(response.data.d !== undefined, "match");
});
QUnit.module("MockServer URI ", {
    beforeEach: function () {
        this.simpleXML = "test-resources/sap/ui/core/qunit/mockserver/testdata/apfapp/tMockServerFeatureTestingMetadata.xml";
        this.simpleJSON = "test-resources/sap/ui/core/qunit/mockserver/testdata/apfapp/";
        this.localhost = "http://localhost:9999";
        this.path = "/mickeyMouse";
        this.absUri = this.simpleXML;
        this.metaUri = "/$metadata";
    }
});
QUnit.test("test full URL path", function (assert) {
    var stubbedServer = new MockServer({
        rootUri: this.localhost + this.path + "/"
    });
    var sMetadataUrl = this.localhost + this.path + this.metaUri;
    stubbedServer.simulate(this.simpleXML);
    stubbedServer.start();
    assert.ok(stubbedServer.isStarted(), "Mock server is started");
    var oResponse = jQuery.sap.sjax({ url: sMetadataUrl });
    assert.ok(oResponse !== undefined, "response not undefined");
    assert.equal(oResponse.statusCode, "200", "200 http status");
    stubbedServer.destroy();
});
QUnit.test("test w/0 horst URL path", function (assert) {
    var stubbedServer = new MockServer({
        rootUri: this.path + "/"
    });
    var sMetadataUrl = this.path + this.metaUri;
    stubbedServer.simulate(this.simpleXML);
    stubbedServer.start();
    assert.ok(stubbedServer.isStarted(), "Mock server is started");
    var oResponse = jQuery.sap.sjax({ url: sMetadataUrl });
    assert.ok(oResponse !== undefined, "response not undefined");
    assert.equal(oResponse.statusCode, "200", "200 http status");
    stubbedServer.destroy();
});
QUnit.module("MockServer requests", {
    beforeEach: function () {
        this.oMockServer = new MockServer({
            rootUri: "/myService/"
        });
        this.simpleXML = "test-resources/sap/ui/core/qunit/mockserver/testdata/apfapp/tMockServerFeatureTestingMetadata.xml";
        this.simpleJSON = "test-resources/sap/ui/core/qunit/mockserver/testdata/apfapp/";
        this.oMockServer.simulate(this.simpleXML, {
            sMockdataBaseUrl: this.simpleJSON,
            bHasIndexFile: true
        });
        this.oMockServer.start();
    },
    afterEach: function () {
        this.oResponse = undefined;
        this.oMessageHandler = undefined;
        this.oFilter = undefined;
        this.oCoreApi = undefined;
        this.oMetadata = undefined;
        this.oMockServer.destroy();
    }
});
QUnit.test("request TestQuery", function (assert) {
    this.oResponse = jQuery.sap.sjax({ url: "/myService/TestQuery" });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "200", "200 http status");
});
QUnit.test("request TestQuery", function (assert) {
    this.oResponse = jQuery.sap.sjax({ url: "/myService/TestQueryResults" });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "200", "200 http status");
});
QUnit.test("request with predicate", function (assert) {
    this.oResponse = jQuery.sap.sjax({ url: "/myService/TestQuery(P_SAPClient=777)" });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "200", "200 http status");
});
QUnit.test("request TestQuery & predicate & navigate", function (assert) {
    this.oResponse = jQuery.sap.sjax({ url: "/myService/TestQuery(P_SAPClient=777)/Results" });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "200", "200 http status");
});
QUnit.test("request TestQuery & predicate & navigate & paging", function (assert) {
    this.oResponse = jQuery.sap.sjax({ url: "/myService/TestQuery(P_SAPClient=777)/Results?$top=2" });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "200", "200 http status");
});
QUnit.test("request TestQuery & predicate & navigate & 2nd page", function (assert) {
    this.oResponse = jQuery.sap.sjax({ url: "/myService/TestQuery(P_SAPClient=777)/Results?$top=2&$skip=2" });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "200", "200 http status");
});
QUnit.test("request TestQuery & predicate & navigate & inlinecount", function (assert) {
    this.oResponse = jQuery.sap.sjax({ url: "/myService/TestQuery(P_SAPClient=777)/Results?$inlinecount=allpages" });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "200", "200 http status");
});
QUnit.test("$format=json", function (assert) {
    var wcaQuery = "TestQueryResults?$format=json";
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "200");
});
QUnit.test("$filter=(...)", function (assert) {
    var wcaQuery = "TestQueryResults?$filter=(P_SAPClient eq 777)";
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "200");
});
QUnit.test("request of WCA query & filter & no navigation", function (assert) {
    var wcaQuery = "TestQueryResults?$filter=P_SAPClient eq 777";
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "200", "200 http status");
    assert.equal(this.oResponse.data.d.results.length, 53, "all 777");
});
QUnit.test("request of WCA query & orderby", function (assert) {
    var wcaQuery = "TestQueryResults?$orderby=Currency_E";
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "200", "200 http status");
    assert.equal(this.oResponse.data.d.results.length, 100, "all 777");
    assert.ok(this.oResponse.data.d.results[0].Currency_E <= this.oResponse.data.d.results[1].Currency_E, "ascending");
});
QUnit.test("1 filter & orderby", function (assert) {
    var wcaQuery = "TestQueryResults?$filter=P_SAPClient eq 777&$orderby=Currency_E";
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "200", "200 http status");
    assert.equal(this.oResponse.data.d.results.length, 53, "all 777");
    assert.ok(this.oResponse.data.d.results[0].Currency_E <= this.oResponse.data.d.results[1].Currency_E, "ascending");
});
QUnit.test("BUG spaces in system query handling", function (assert) {
    var wcaQuery = "TestQueryResults?$filter=P_SAPClient eq 777 & $orderby=Currency_E";
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "200", "200 http status");
    assert.equal(this.oResponse.data.d.results.length, 53, "all 777");
    var ordered = this.oResponse.data.d.results[0].Currency_E <= this.oResponse.data.d.results[1].Currency_E;
    assert.ok(!ordered, "un ordered");
});
QUnit.test("probably BUG malformed filter", function (assert) {
    var wcaQuery = "TestQueryResults?$filter=P_SAPClient eq 777&$filter=SAPClient eq 'SAPClient_22'";
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "200", "200 http status");
    assert.equal(this.oResponse.data.d.results.length, 1, "all 777");
});
QUnit.test("400 when malformed filter", function (assert) {
    var wcaQuery = "TestQueryResults?$filter=P_SAPClient eq 777 and $filter=P_SAPClient eq 777";
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "400", "400 http status is correct");
});
QUnit.test("BUG malformed filter", function (assert) {
    var wcaQuery = "TestQueryResults?$filter=SAPClient eq 'SAPClient_21' MickeyMouse and SAPClient eq 'SAPClient_22'";
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.equal(this.oResponse.statusCode, "200", "400 expected resp. malformed URI");
});
QUnit.test("request of WCA query & filter match 1 element", function (assert) {
    var wcaQuery = "TestQueryResults?$filter=SAPClient eq 'SAPClient_22'";
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "200", "200 http status");
    assert.equal(this.oResponse.data.d.results.length, 1, "1 match");
});
QUnit.test("request of WCA query & 2 filters match 0 element", function (assert) {
    var wcaQuery = "TestQueryResults?$filter=SAPClient eq 'SAPClient_22'";
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "200", "200 http status");
    assert.equal(this.oResponse.data.d.results.length, 1, "1 match");
});
QUnit.test("request of WCA query & 2 filters by and", function (assert) {
    var wcaQuery = "TestQueryResults?$filter=P_SAPClient eq 776 and SAPClient eq 'SAPClient_22'";
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.equal(this.oResponse.statusCode, "200", "200 http status");
    assert.equal(this.oResponse.data.d.results.length, 1, "shall be 1");
});
QUnit.test("request of WCA query & 2 filters by or", function (assert) {
    var wcaQuery = "TestQueryResults?$filter=SAPClient eq 'SAPClient_21' or SAPClient eq 'SAPClient_22'";
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.equal(this.oResponse.statusCode, "200", "200 http status");
    assert.equal(this.oResponse.data.d.results.length, 2, "shall be 2");
});
QUnit.test("request of WCA query w/o encoding", function (assert) {
    var wcaQuery = "TestQuery(P_SAPClient=777)/Results?$select=ID,P_SAPClient&$filter=P_SAPClient eq 777";
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "200", "200 http status");
});
QUnit.test("request of WCA query w/o $batch", function (assert) {
    var wcaQuery = "TestQuery(P_SAPClient=777)/Results?$select=ID,Currency_E,SAPClient&$filter=SAPClient%20eq%20%27SAPClient_53%27";
    this.oResponse = jQuery.sap.sjax({ url: "/myService/" + wcaQuery });
    assert.ok(this.oResponse !== undefined, "response not undefined");
    assert.equal(this.oResponse.statusCode, "200", "200 http status");
});