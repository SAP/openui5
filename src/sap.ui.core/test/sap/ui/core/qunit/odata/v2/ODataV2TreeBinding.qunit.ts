import Log from "sap/base/Log";
import MockServer from "sap/ui/core/util/MockServer";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import Sorter from "sap/ui/model/Sorter";
import CountMode from "sap/ui/model/odata/CountMode";
import OperationMode from "sap/ui/model/odata/OperationMode";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ODataTreeBinding from "sap/ui/model/odata/v2/ODataTreeBinding";
var sMockBaseUrl = "test-resources/sap/ui/core/qunit/model/";
var oNavPropMockServer = new MockServer({
    rootUri: "/navprop/"
});
oNavPropMockServer.simulate(sMockBaseUrl + "metadata_odtb.xml", sMockBaseUrl + "odtb/");
var oAnnotationMockServer = new MockServer({
    rootUri: "/metadata/"
});
oAnnotationMockServer.simulate(sMockBaseUrl + "metadata_odtbmd.xml", sMockBaseUrl + "odtbmd/");
var aAnnotationsMockdata = oAnnotationMockServer._oMockdata.GLAccountHierarchyInChartOfAccountsLiSet;
aAnnotationsMockdata.forEach(function (oMockdata) {
    oMockdata.FinStatementHierarchyLevelVal = parseInt(oMockdata.FinStatementHierarchyLevelVal);
});
var oAnnotationMockServerGUID = new MockServer({
    rootUri: "/metadata_guid/"
});
oAnnotationMockServerGUID.simulate(sMockBaseUrl + "metadata_odtbmd_guid.xml", sMockBaseUrl + "odtbmd/");
var aAnnotationsMockdataGUID = oAnnotationMockServerGUID._oMockdata.GLAccountHierarchyInChartOfAccountsLiSet;
aAnnotationsMockdataGUID.forEach(function (oMockData) {
    oMockData.FinStatementHierarchyLevelVal = parseInt(oMockData.FinStatementHierarchyLevelVal);
});
var oModel, oBinding;
function createTreeBinding(sPath, oContext, aFilters, mParameters, aSorters) {
    oBinding = oModel.bindTree(sPath, oContext, aFilters, mParameters, aSorters).initialize();
}
function requestData(oBinding, iStartIndex, iLength, iThreshold) {
    oBinding.attachEventOnce("refresh", function () {
        oBinding.getContexts(iStartIndex, iLength, iThreshold);
    });
}
QUnit.module("ODataTreeBinding with navigation properties", {
    beforeEach: function () {
        oNavPropMockServer.start();
        oModel = new ODataModel("/navprop/", { useBatch: false });
        return oModel.metadataLoaded();
    },
    afterEach: function () {
        oNavPropMockServer.stop();
        oModel = undefined;
    }
});
QUnit.test("Properties", function (assert) {
    createTreeBinding("/Employees(2)", null, [], {
        navigation: {}
    });
    assert.equal(oBinding.getPath(), "/Employees(2)", "TreeBinding path");
    assert.equal(oBinding.getModel(), oModel, "TreeBinding model");
    assert.ok(oBinding instanceof ODataTreeBinding, "treeBinding class check");
});
QUnit.test("TreeBinding getTreeAnnotation", function (assert) {
    createTreeBinding("/Employees(2)", null, [], {
        navigation: {
            Employees: "Employees1",
            Employees1: "Employees1"
        },
        displayRootNode: true
    });
    assert.equal(oBinding.bHasTreeAnnotations, false, "TreeAnnotation unavailable");
    assert.equal(oBinding.getTreeAnnotation("hierarchy-level-for"), undefined, "TreeAnnotation unavailable");
    assert.equal(oBinding.getTreeAnnotation("hierarchy-parent-node-for"), undefined, "TreeAnnotation unavailable");
    assert.equal(oBinding.getTreeAnnotation("hierarchy-node-for"), undefined, "TreeAnnotation unavailable");
    assert.equal(oBinding.getTreeAnnotation("hierarchy-drill-state-for"), undefined, "TreeAnnotation unavailable");
    assert.equal(oBinding.getTreeAnnotation("foo"), undefined, "TreeAnnotation property incorrect/unavailable");
});
QUnit.test("getRootContexts getNodeContexts", function (assert) {
    var done = assert.async();
    createTreeBinding("/Employees(2)", null, [], {
        navigation: {
            Employees: "Employees1",
            Employees1: "Employees1"
        },
        displayRootNode: false
    });
    var oContext;
    var handler1 = function (oEvent) {
        var aContexts = oBinding.getRootContexts();
        assert.equal(aContexts.length, 5, "TreeBinding rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FirstName", oContext), "Nancy", "TreeBinding root content");
        assert.equal(oModel.getProperty("LastName", oContext), "Davolio", "TreeBinding root content");
        oContext = aContexts[1];
        assert.equal(oModel.getProperty("FirstName", oContext), "Janet", "TreeBinding root content");
        assert.equal(oModel.getProperty("LastName", oContext), "Leverling", "TreeBinding root content");
        oContext = aContexts[2];
        assert.equal(oModel.getProperty("FirstName", oContext), "Margaret", "TreeBinding root content");
        assert.equal(oModel.getProperty("LastName", oContext), "Peacock", "TreeBinding root content");
        oContext = aContexts[3];
        assert.equal(oModel.getProperty("FirstName", oContext), "Steven", "TreeBinding root content");
        assert.equal(oModel.getProperty("LastName", oContext), "Buchanan", "TreeBinding root content");
        oContext = aContexts[4];
        assert.equal(oModel.getProperty("FirstName", oContext), "Laura", "TreeBinding root content");
        assert.equal(oModel.getProperty("LastName", oContext), "Callahan", "TreeBinding root content");
        oBinding.detachChange(handler1);
        oBinding.attachChange(handler2);
        oContext = aContexts[3];
        oBinding.getNodeContexts(oContext);
    };
    var handler2 = function (oEvent) {
        var aContexts = oBinding.getNodeContexts(oContext);
        assert.equal(aContexts.length, 3, "TreeBinding nodeContexts length");
        assert.equal(oBinding.getChildCount(oContext), 3, "TreeBinding childcount");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FirstName", oContext), "Michael", "TreeBinding node content");
        assert.equal(oModel.getProperty("LastName", oContext), "Suyama", "TreeBinding node content");
        oContext = aContexts[1];
        assert.equal(oModel.getProperty("FirstName", oContext), "Robert", "TreeBinding node content");
        assert.equal(oModel.getProperty("LastName", oContext), "King", "TreeBinding node content");
        oContext = aContexts[2];
        assert.equal(oModel.getProperty("FirstName", oContext), "Anne", "TreeBinding node content");
        assert.equal(oModel.getProperty("LastName", oContext), "Dodsworth", "TreeBinding node content");
        oBinding.detachChange(handler2);
        done();
    };
    oBinding.attachChange(handler1);
    oBinding.getRootContexts();
});
QUnit.test("Check if CountMode can be set", function (assert) {
    oModel.setDefaultCountMode(CountMode.Inline);
    createTreeBinding("/Employees(2)", null, [], {
        navigation: {
            Employees: "Employees1",
            Employees1: "Employees1"
        },
        displayRootNode: true
    });
    assert.equal(oBinding.sCountMode, CountMode.Inline, "CountMode propagation works. CountMode.Inline was set.");
});
QUnit.test("Display root node - CountMode.Request", function (assert) {
    var done = assert.async();
    createTreeBinding("/Employees(2)", null, [], {
        navigation: {
            Employees: "Employees1",
            Employees1: "Employees1"
        },
        displayRootNode: true
    });
    function handler1(oEvent) {
        oBinding.detachChange(handler1);
        var aContexts = oBinding.getRootContexts();
        assert.equal(aContexts.length, 1, "TreeBinding rootContexts length is correct (1)");
        var oContext = aContexts[0];
        assert.equal(oModel.getProperty("FirstName", oContext), "Andrew", "Root node is correct (Andrew)");
        oBinding.attachChange(handler2);
        aContexts = oBinding.getNodeContexts(oContext);
    }
    function handler2() {
        oBinding.detachChange(handler2);
        var aContexts = oBinding.getRootContexts();
        var oRootContext = aContexts[0];
        var aChildContexts = oBinding.getNodeContexts(oRootContext);
        var oContext;
        assert.equal(aChildContexts.length, 5, "TreeBinding rootContexts length");
        oContext = aChildContexts[0];
        assert.equal(oModel.getProperty("FirstName", oContext), "Nancy", "Child-Context[0] is correct (Nancy)");
        oContext = aChildContexts[2];
        assert.equal(oModel.getProperty("FirstName", oContext), "Margaret", "Child-Context[2] is correct (Margaret)");
        oContext = aChildContexts[4];
        assert.equal(oModel.getProperty("FirstName", oContext), "Laura", "Child-Context[4] is correct (Laura)");
        oBinding.detachChange(handler1);
        done();
    }
    oBinding.attachChange(handler1);
    oBinding.getRootContexts();
});
QUnit.test("Display root node - CountMode.Inline", function (assert) {
    var done = assert.async();
    oModel.setDefaultCountMode(CountMode.Inline);
    createTreeBinding("/Employees(2)", null, [], {
        navigation: {
            Employees: "Employees1",
            Employees1: "Employees1"
        },
        displayRootNode: true
    });
    function handler1(oEvent) {
        oBinding.detachChange(handler1);
        var aContexts = oBinding.getRootContexts();
        assert.equal(aContexts.length, 1, "TreeBinding rootContexts length is correct (1)");
        var oContext = aContexts[0];
        assert.equal(oModel.getProperty("FirstName", oContext), "Andrew", "Root node is correct (Andrew)");
        oBinding.attachChange(handler2);
        aContexts = oBinding.getNodeContexts(oContext);
    }
    function handler2() {
        oBinding.detachChange(handler2);
        var aContexts = oBinding.getRootContexts();
        var oRootContext = aContexts[0];
        var aChildContexts = oBinding.getNodeContexts(oRootContext);
        var oContext;
        assert.equal(aChildContexts.length, 5, "TreeBinding rootContexts length");
        oContext = aChildContexts[0];
        assert.equal(oModel.getProperty("FirstName", oContext), "Nancy", "Child-Context[0] is correct (Nancy)");
        oContext = aChildContexts[2];
        assert.equal(oModel.getProperty("FirstName", oContext), "Margaret", "Child-Context[2] is correct (Margaret)");
        oContext = aChildContexts[4];
        assert.equal(oModel.getProperty("FirstName", oContext), "Laura", "Child-Context[4] is correct (Laura)");
        oBinding.detachChange(handler1);
        done();
    }
    oBinding.attachChange(handler1);
    oBinding.getRootContexts();
});
QUnit.test("Bind an aggregation", function (assert) {
    var done = assert.async();
    createTreeBinding("/Employees", null, [], {
        navigation: {
            Employees: "Employees1",
            Employees1: "Employees1"
        },
        displayRootNode: true
    });
    function handler1(oEvent) {
        oBinding.detachChange(handler1);
        var aRootContexts = oBinding.getRootContexts();
        var oContext;
        assert.equal(aRootContexts.length, 9, "TreeBinding rootContexts length = 9");
        oContext = aRootContexts[0];
        assert.equal(oModel.getProperty("FirstName", oContext), "Nancy", "TreeBinding root contexts[0] is correct (Nancy)");
        oContext = aRootContexts[4];
        assert.equal(oModel.getProperty("FirstName", oContext), "Steven", "TreeBinding root contexts[4] is correct (Steven)");
        oContext = aRootContexts[8];
        assert.equal(oModel.getProperty("FirstName", oContext), "Anne", "TreeBinding root contexts[8] is correct (Anne)");
        oContext = aRootContexts[1];
        oBinding.attachChange(handler2);
        oBinding.getNodeContexts(oContext);
    }
    function handler2() {
        oBinding.detachChange(handler2);
        var aRootContexts = oBinding.getRootContexts();
        var oContext = aRootContexts[1];
        var aChildContexts = oBinding.getNodeContexts(oContext);
        assert.equal(aChildContexts.length, 5, "TreeBinding rootContexts length");
        oContext = aChildContexts[0];
        assert.equal(oModel.getProperty("FirstName", oContext), "Nancy", "TreeBinding root contexts[0] is correct (Nancy)");
        oContext = aChildContexts[2];
        assert.equal(oModel.getProperty("FirstName", oContext), "Margaret", "TreeBinding root contexts[2] is correct (Margaret)");
        oContext = aChildContexts[4];
        assert.equal(oModel.getProperty("FirstName", oContext), "Laura", "TreeBinding root contexts[4] is correct (Laura)");
        oBinding.detachChange(handler1);
        done();
    }
    oBinding.attachChange(handler1);
    oBinding.getRootContexts();
});
QUnit.test("Refresh", function (assert) {
    var done = assert.async();
    createTreeBinding("/Employees(2)", null, [], {
        navigation: {
            Employees: "Employees1",
            Employees1: "Employees1"
        }
    });
    var oContext;
    var handler1 = function (oEvent) {
        oBinding.detachChange(handler1);
        var aContexts = oBinding.getRootContexts();
        assert.equal(aContexts.length, 5, "TreeBinding rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FirstName", oContext), "Nancy", "TreeBinding root contexts[0] is correct (Nancy)");
        oContext = aContexts[4];
        assert.equal(oModel.getProperty("FirstName", oContext), "Laura", "TreeBinding root contexts[4] is correct (Laura)");
        assert.deepEqual(oBinding.oKeys, {
            "/Employees(2)/Employees1": [
                "Employees(1)",
                "Employees(3)",
                "Employees(4)",
                "Employees(5)",
                "Employees(8)"
            ]
        }, "Keys object has value for root");
        assert.deepEqual(oBinding.oLengths, {
            "/Employees(1)": 1,
            "/Employees(2)/Employees1": 5,
            "/Employees(3)": 1,
            "/Employees(4)": 1,
            "/Employees(5)": 1,
            "/Employees(8)": 1
        }, "Lengths object has value for root");
        assert.deepEqual(oBinding.oFinalLengths, {
            "/Employees(1)": true,
            "/Employees(2)/Employees1": true,
            "/Employees(3)": true,
            "/Employees(4)": true,
            "/Employees(5)": true,
            "/Employees(8)": true
        }, "FinalLengths object has value for root");
        oBinding.attachRefresh(handler2);
        oBinding.refresh();
        assert.deepEqual(oBinding.oKeys, {}, "Keys object has been reset");
        assert.deepEqual(oBinding.oLengths, {}, "Lengths object has value for root");
        assert.deepEqual(oBinding.oFinalLengths, {}, "FinalLengths object has value for root");
    };
    var handler2 = function (oEvent) {
        oBinding.detachRefresh(handler2);
        oBinding.attachChange(handler3);
        var aContexts = oBinding.getRootContexts();
        assert.equal(aContexts.length, 0, "No contexts are available, data has been reset");
    };
    var handler3 = function (oEvent) {
        oBinding.detachChange(handler3);
        var aContexts = oBinding.getRootContexts();
        assert.equal(aContexts.length, 5, "TreeBinding rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FirstName", oContext), "Nancy", "After refresh: TreeBinding root contexts[0] is correct (Nancy)");
        oContext = aContexts[4];
        assert.equal(oModel.getProperty("FirstName", oContext), "Laura", "After refresh: TreeBinding root contexts[4] is correct (Laura)");
        assert.deepEqual(oBinding.oKeys, {
            "/Employees(2)/Employees1": [
                "Employees(1)",
                "Employees(3)",
                "Employees(4)",
                "Employees(5)",
                "Employees(8)"
            ]
        }, "Keys object has value for root");
        assert.deepEqual(oBinding.oLengths, {
            "/Employees(1)": 1,
            "/Employees(2)/Employees1": 5,
            "/Employees(3)": 1,
            "/Employees(4)": 1,
            "/Employees(5)": 1,
            "/Employees(8)": 1
        }, "Lengths object has value for root");
        assert.deepEqual(oBinding.oFinalLengths, {
            "/Employees(1)": true,
            "/Employees(2)/Employees1": true,
            "/Employees(3)": true,
            "/Employees(4)": true,
            "/Employees(5)": true,
            "/Employees(8)": true
        }, "FinalLengths object has value for root");
        done();
    };
    oBinding.attachChange(handler1);
    oBinding.getRootContexts();
});
QUnit.test("Init binding with deferred group ID", function (assert) {
    assert.expect(0);
    var done = assert.async();
    oModel.setDeferredGroups(["PONY"]);
    createTreeBinding("/Employees(2)", null, [], {
        navigation: {
            Employees: "Employees1",
            Employees1: "Employees1"
        },
        groupId: "PONY"
    });
    var handler1 = function (oEvent) {
        oBinding.detachChange(handler1);
        assert.ok(false, "Change event should not get fired");
    };
    oBinding.attachChange(handler1);
    oBinding.getRootContexts();
    setTimeout(done, 11);
});
QUnit.test("Init binding with deferred group ID in Client mode", function (assert) {
    assert.expect(0);
    var done = assert.async();
    oModel.setDeferredGroups(["PONY"]);
    createTreeBinding("/Employees(2)", null, [], {
        navigation: {
            Employees: "Employees1",
            Employees1: "Employees1"
        },
        groupId: "PONY",
        operationMode: OperationMode.Client
    });
    var handler1 = function (oEvent) {
        oBinding.detachChange(handler1);
        assert.ok(false, "Change event should not get fired");
    };
    oBinding.attachChange(handler1);
    oBinding.getRootContexts();
    setTimeout(done, 11);
});
QUnit.test("Refresh binding with deferred group ID", function (assert) {
    assert.expect(2);
    var done = assert.async();
    oModel.setDeferredGroups(["PONY"]);
    createTreeBinding("/Employees(2)", null, [], {
        navigation: {
            Employees: "Employees1",
            Employees1: "Employees1"
        }
    });
    var handler1 = function (oEvent) {
        oBinding.detachChange(handler1);
        assert.ok(true, "Data loaded");
        oBinding.attachRefresh(handler2);
        oBinding.refresh("PONY");
        setTimeout(done, 11);
    };
    var handler2 = function (oEvent) {
        oBinding.detachChange(handler2);
        assert.ok(true, "Refresh fired");
        oBinding.attachRefresh(handler3);
        oBinding.getRootContexts();
    };
    var handler3 = function (oEvent) {
        oBinding.detachChange(handler3);
        assert.ok(false, "Change event should not get fired after refresh");
    };
    oBinding.attachChange(handler1);
    oBinding.getRootContexts();
});
QUnit.test("No navigation object specified", function (assert) {
    var iErrorCount = 0, sErrorMessage = "";
    sinon.stub(Log, "error", function (sMsg) {
        iErrorCount++;
        sErrorMessage = sMsg;
    });
    createTreeBinding("/Employees(2)");
    assert.equal(iErrorCount, 1, "TreeBinding one error should have occured");
    assert.equal(sErrorMessage, "Neither navigation paths parameters, nor (complete/valid) tree hierarchy annotations where provided to the TreeBinding.", "TreeBinding navigation error was thrown");
    Log.error.restore();
});
QUnit.test("Application filtering allowed", function (assert) {
    var done = assert.async();
    createTreeBinding("/Employees", null, [new Filter("FirstName", "EQ", "Nancy")], {
        navigation: {}
    });
    var handler1 = function (oEvent) {
        oBinding.detachChange(handler1);
        var aContexts = oBinding.getRootContexts();
        assert.equal(aContexts.length, 1, "TreeBinding rootContexts length is 1 after application filtering");
        var oContext = aContexts[0];
        assert.equal(oModel.getProperty("FirstName", oContext), "Nancy", "After refresh: TreeBinding root contexts[0] is correct (Tom)");
        done();
    };
    oBinding.attachChange(handler1);
    oBinding.getRootContexts();
});
QUnit.test("Control filtering prohibited in OperationMode.Server", function (assert) {
    var iWarningCount = 0;
    sinon.stub(Log, "warning", function (sMsg) {
        iWarningCount++;
    });
    createTreeBinding("/Employees(2)", null, [], {
        navigation: {}
    });
    oBinding.filter(new Filter("FirstName", "EQ", "Tom"));
    assert.equal(iWarningCount, 1, "One warning (that filtering is not enabled) should have fired");
    Log.warning.restore();
});
QUnit.test("Paging - CountMode.Request", function (assert) {
    var done = assert.async();
    createTreeBinding("/Employees", null, [], {
        navigation: {
            Employees: "Employees1",
            Employees1: "Employees1"
        },
        displayRootNode: true
    });
    function handler1(oEvent) {
        oBinding.detachChange(handler1);
        var aContexts = oBinding.getRootContexts(1, 4);
        var oContext;
        assert.equal(aContexts.length, 4, "TreeBinding returned rootContexts length");
        assert.equal(oBinding.getChildCount(null), 9, "TreeBinding actual rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FirstName", oContext), "Andrew", "TreeBinding root context[0] is correct (Andrew)");
        oContext = aContexts[3];
        assert.equal(oModel.getProperty("FirstName", oContext), "Steven", "TreeBinding root context[3] is correct (Steven)");
        oContext = aContexts[0];
        assert.equal(oBinding.getChildCount(oContext), undefined, "Child count of /Employees(2) is still unknown");
        oBinding.attachChange(handler2);
        aContexts = oBinding.getNodeContexts(oContext, 2, 3);
    }
    function handler2() {
        oBinding.detachChange(handler2);
        var aRootContexts = oBinding.getRootContexts(1, 4);
        var oAndrew = aRootContexts[0];
        assert.equal(oBinding.getChildCount(oAndrew), 5, "Child count of /Employees(2) is now 5");
        var aContexts = oBinding.getNodeContexts(oAndrew, 2, 3);
        var oContext;
        assert.equal(aContexts.length, 3, "TreeBinding rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FirstName", oContext), "Margaret", "TreeBinding child context[0] is correct (Margaret)");
        oContext = aContexts[2];
        assert.equal(oModel.getProperty("FirstName", oContext), "Laura", "TreeBinding child context[2] is correct (Laura)");
        done();
    }
    oBinding.attachChange(handler1);
    oBinding.getRootContexts(1, 4);
});
QUnit.test("Paging - CountMode.Inline", function (assert) {
    var done = assert.async();
    oModel.setDefaultCountMode(CountMode.Inline);
    createTreeBinding("/Employees", null, [], {
        navigation: {
            Employees: "Employees1",
            Employees1: "Employees1"
        },
        displayRootNode: true
    });
    function handler1(oEvent) {
        oBinding.detachChange(handler1);
        var aContexts = oBinding.getRootContexts(1, 4);
        var oContext;
        assert.equal(aContexts.length, 4, "TreeBinding returned rootContexts length");
        assert.equal(oBinding.getChildCount(null), 9, "TreeBinding actual rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FirstName", oContext), "Andrew", "TreeBinding root context[0] is correct (Andrew)");
        oContext = aContexts[3];
        assert.equal(oModel.getProperty("FirstName", oContext), "Steven", "TreeBinding root context[3] is correct (Steven)");
        oContext = aContexts[0];
        assert.equal(oBinding.getChildCount(oContext), undefined, "Child count of /Employees(2) is still unknown");
        oBinding.attachChange(handler2);
        aContexts = oBinding.getNodeContexts(oContext, 2, 3);
    }
    function handler2() {
        oBinding.detachChange(handler2);
        var aRootContexts = oBinding.getRootContexts(1, 4);
        var oAndrew = aRootContexts[0];
        assert.equal(oBinding.getChildCount(oAndrew), 5, "Child count of /Employees(2) is now 5");
        var aContexts = oBinding.getNodeContexts(oAndrew, 2, 3);
        var oContext;
        assert.equal(aContexts.length, 3, "TreeBinding rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FirstName", oContext), "Margaret", "TreeBinding child context[0] is correct (Margaret)");
        oContext = aContexts[2];
        assert.equal(oModel.getProperty("FirstName", oContext), "Laura", "TreeBinding child context[2] is correct (Laura)");
        done();
    }
    oBinding.attachChange(handler1);
    oBinding.getRootContexts(1, 4);
});
QUnit.test("Paging - CountMode.InlineRepeat", function (assert) {
    var done = assert.async();
    oModel.setDefaultCountMode(CountMode.InlineRepeat);
    createTreeBinding("/Employees", null, [], {
        navigation: {
            Employees: "Employees1",
            Employees1: "Employees1"
        },
        displayRootNode: true
    });
    function handler1(oEvent) {
        oBinding.detachChange(handler1);
        var aContexts = oBinding.getRootContexts(1, 4);
        var oContext;
        assert.equal(aContexts.length, 4, "TreeBinding returned rootContexts length");
        assert.equal(oBinding.getChildCount(null), 9, "TreeBinding actual rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FirstName", oContext), "Andrew", "TreeBinding root context[0] is correct (Andrew)");
        oContext = aContexts[3];
        assert.equal(oModel.getProperty("FirstName", oContext), "Steven", "TreeBinding root context[3] is correct (Steven)");
        oContext = aContexts[0];
        assert.equal(oBinding.getChildCount(oContext), undefined, "Child count of /Employees(2) is still unknown");
        oBinding.attachChange(handler2);
        aContexts = oBinding.getNodeContexts(oContext, 2, 3);
    }
    function handler2() {
        oBinding.detachChange(handler2);
        var aRootContexts = oBinding.getRootContexts(1, 4);
        var oAndrew = aRootContexts[0];
        assert.equal(oBinding.getChildCount(oAndrew), 5, "Child count of /Employees(2) is now 5");
        var aContexts = oBinding.getNodeContexts(oAndrew, 2, 3);
        var oContext;
        assert.equal(aContexts.length, 3, "TreeBinding rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FirstName", oContext), "Margaret", "TreeBinding child context[0] is correct (Margaret)");
        oContext = aContexts[2];
        assert.equal(oModel.getProperty("FirstName", oContext), "Laura", "TreeBinding child context[2] is correct (Laura)");
        done();
    }
    oBinding.attachChange(handler1);
    oBinding.getRootContexts(1, 4);
});
[[new Sorter("FirstName", true)], new Sorter("FirstName", true)].forEach(function (vSorter, i) {
    QUnit.test("Sorting: Initial Sorter; # " + i, function (assert) {
        var done = assert.async();
        createTreeBinding("/Employees", null, [], {
            navigation: {
                Employees: "Employees1",
                Employees1: "Employees1"
            },
            displayRootNode: true
        }, vSorter);
        function handler1(oEvent) {
            oBinding.detachChange(handler1);
            var aContexts = oBinding.getRootContexts(0, 10);
            var oContext;
            assert.equal(aContexts.length, 9, "Retrieved contexts after sorting length = 9");
            assert.equal(oBinding.getChildCount(null), 9, "Internal rootContexts length");
            oContext = aContexts[0];
            assert.equal(oModel.getProperty("FirstName", oContext), "Steven", "TreeBinding root context[0] is correct (Steven)");
            oContext = aContexts[8];
            assert.equal(oModel.getProperty("FirstName", oContext), "Andrew", "TreeBinding root context[3] is correct (Andrew)");
            oBinding.attachChange(handler2);
            aContexts = oBinding.getNodeContexts(aContexts[8], 0, 5);
        }
        function handler2() {
            oBinding.detachChange(handler2);
            var aRootContexts = oBinding.getRootContexts(0, 10);
            var oAndrew = aRootContexts[8];
            assert.equal(oBinding.getChildCount(oAndrew), 5, "Child count of /Employees(2) is now 5");
            var aChildContexts = oBinding.getNodeContexts(oAndrew, 0, 5);
            var oContext;
            oContext = aChildContexts[0];
            assert.equal(oModel.getProperty("FirstName", oContext), "Steven", "/Employee(2) child context[0] is correct (Steven)");
            oContext = aChildContexts[4];
            assert.equal(oModel.getProperty("FirstName", oContext), "Janet", "/Employee(2) child context[4] is correct (Janet)");
            done();
        }
        oBinding.attachChange(handler1);
        oBinding.getRootContexts(0, 10);
    });
});
QUnit.test("Sorting: sort() call on binding", function (assert) {
    var done = assert.async();
    createTreeBinding("/Employees", null, [], {
        navigation: {
            Employees: "Employees1",
            Employees1: "Employees1"
        },
        displayRootNode: true
    });
    function handler0() {
        oBinding.detachRefresh(handler0);
        oBinding.attachChange(handler1);
        oBinding.getRootContexts(0, 10);
    }
    function handler1(oEvent) {
        oBinding.detachChange(handler1);
        var aContexts = oBinding.getRootContexts(0, 10);
        var oContext;
        assert.equal(aContexts.length, 9, "Retrieved contexts after sorting length = 9");
        assert.equal(oBinding.getChildCount(null), 9, "Internal rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FirstName", oContext), "Steven", "TreeBinding root context[0] is correct (Steven)");
        oContext = aContexts[8];
        assert.equal(oModel.getProperty("FirstName", oContext), "Andrew", "TreeBinding root context[3] is correct (Andrew)");
        oBinding.attachChange(handler2);
        aContexts = oBinding.getNodeContexts(aContexts[8], 0, 5);
    }
    function handler2() {
        oBinding.detachChange(handler2);
        var aRootContexts = oBinding.getRootContexts(0, 10);
        var oAndrew = aRootContexts[8];
        assert.equal(oBinding.getChildCount(oAndrew), 5, "Child count of /Employees(2) is now 5");
        var aChildContexts = oBinding.getNodeContexts(oAndrew, 0, 5);
        var oContext;
        oContext = aChildContexts[0];
        assert.equal(oModel.getProperty("FirstName", oContext), "Steven", "/Employee(2) child context[0] is correct (Steven)");
        oContext = aChildContexts[4];
        assert.equal(oModel.getProperty("FirstName", oContext), "Janet", "/Employee(2) child context[4] is correct (Janet)");
        done();
    }
    oBinding.attachRefresh(handler0);
    oBinding.sort(new Sorter("FirstName", true));
});
QUnit.module("ODataTreeBinding with annotations", {
    beforeEach: function () {
        oAnnotationMockServer.start();
        oModel = new ODataModel("/metadata/", { useBatch: false });
        return oModel.metadataLoaded();
    },
    afterEach: function () {
        oAnnotationMockServer.stop();
        oModel = undefined;
    }
});
QUnit.test("Properties", function (assert) {
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], {
        navigation: {}
    });
    assert.ok(oBinding instanceof ODataTreeBinding, "treeBinding class check");
    assert.equal(oBinding.getPath(), "/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", "TreeBinding path");
    assert.equal(oBinding.getModel(), oModel, "TreeBinding model");
    assert.equal(oBinding.bHasTreeAnnotations, true, "TreeBinding Metadata should be available");
});
QUnit.test("TreeBinding getTreeAnnotation", function (assert) {
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], {
        navigation: {}
    });
    assert.equal(oBinding.bHasTreeAnnotations, true, "TreeAnnotation available");
    assert.equal(oBinding.getTreeAnnotation("hierarchy-level-for"), "FinStatementHierarchyLevelVal", "TreeAnnotation available");
    assert.equal(oBinding.getTreeAnnotation("hierarchy-parent-node-for"), "ParentNode", "TreeAnnotation available");
    assert.equal(oBinding.getTreeAnnotation("hierarchy-node-for"), "HierarchyNode", "TreeAnnotation available");
    assert.equal(oBinding.getTreeAnnotation("hierarchy-drill-state-for"), "DrilldownState", "TreeAnnotation available");
    assert.equal(oBinding.getTreeAnnotation("foo"), undefined, "TreeAnnotation property unavailable/incorrect");
});
QUnit.test("TreeBinding getRootContexts getNodeContexts", function (assert) {
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], {
        rootLevel: 2
    });
    var oContext;
    var handler1 = function (oEvent) {
        var aContexts = oBinding.getRootContexts();
        assert.equal(aContexts.length, 9, "TreeBinding rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000002", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "1000000", "TreeBinding node content");
        oContext = aContexts[1];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000362", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "2000000", "TreeBinding node content");
        oContext = aContexts[8];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "001180", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "1", "TreeBinding node content");
        oBinding.detachChange(handler1);
        done();
    };
    oBinding.attachChange(handler1);
    oBinding.getRootContexts();
});
QUnit.test("Display root node - CountMode.Request", function (assert) {
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
        displayRootNode: true,
        rootLevel: 1
    });
    var oContext;
    var handler1 = function (oEvent) {
        var aContexts = oBinding.getRootContexts();
        assert.equal(aContexts.length, 1, "TreeBinding rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "01", "TreeBinding root content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000001", "TreeBinding root content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "INT", "TreeBinding root content");
        oBinding.detachChange(handler1);
        oBinding.attachChange(handler2);
        oContext = aContexts[0];
        oBinding.getNodeContexts(oContext);
    };
    var handler2 = function (oEvent) {
        var aContexts = oBinding.getNodeContexts(oContext);
        assert.equal(aContexts.length, 9, "TreeBinding nodeContexts length");
        assert.equal(oBinding.getChildCount(oContext), 9, "TreeBinding childcount");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000002", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "1000000", "TreeBinding node content");
        oContext = aContexts[1];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000362", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "2000000", "TreeBinding node content");
        oContext = aContexts[8];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "001180", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "1", "TreeBinding node content");
        oBinding.detachChange(handler2);
        done();
    };
    oBinding.attachChange(handler1);
    oBinding.getRootContexts();
});
QUnit.test("Display root node - CountMode.Inline", function (assert) {
    var done = assert.async();
    oModel.setDefaultCountMode(CountMode.Inline);
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
        displayRootNode: true,
        rootLevel: 1
    });
    var oContext;
    var handler1 = function (oEvent) {
        var aContexts = oBinding.getRootContexts();
        assert.equal(aContexts.length, 1, "TreeBinding rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "01", "TreeBinding root content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000001", "TreeBinding root content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "INT", "TreeBinding root content");
        oBinding.detachChange(handler1);
        oBinding.attachChange(handler2);
        oContext = aContexts[0];
        oBinding.getNodeContexts(oContext);
    };
    var handler2 = function (oEvent) {
        var aContexts = oBinding.getNodeContexts(oContext);
        assert.equal(aContexts.length, 9, "TreeBinding nodeContexts length");
        assert.equal(oBinding.getChildCount(oContext), 9, "TreeBinding childcount");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000002", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "1000000", "TreeBinding node content");
        oContext = aContexts[1];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000362", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "2000000", "TreeBinding node content");
        oContext = aContexts[8];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "001180", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "1", "TreeBinding node content");
        oBinding.detachChange(handler2);
        done();
    };
    oBinding.attachChange(handler1);
    oBinding.getRootContexts();
});
QUnit.test("_getParentMap: Should return all parent keys", function (assert) {
    var done = assert.async(), mExpectedParentMap = {
        "000001": "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000001')",
        "000002": "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000002')",
        "000362": "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000362')",
        "000682": "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000682')",
        "001073": "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='001073')",
        "001131": "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='001131')",
        "001136": "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='001136')",
        "001153": "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='001153')",
        "001179": "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='001179')"
    };
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], {
        rootLevel: 1,
        numberOfExpandedLevels: 2
    });
    var fnHandler1 = function (oEvent) {
        oBinding.detachChange(fnHandler1);
        oBinding.attachChange(fnHandler2);
        oBinding.getContexts(0, 9);
    };
    var fnHandler2 = function (oEvent) {
        oBinding.detachChange(fnHandler2);
        var aContexts = oBinding.getContexts(0, 9);
        var aData = aContexts.map(function (oContext) {
            return oContext.getProperty();
        });
        var mParentMap = oBinding._getParentMap(aData);
        assert.deepEqual(mParentMap, mExpectedParentMap, "Correct parent map");
        done();
    };
    oBinding.attachChange(fnHandler1);
    requestData(oBinding, 0, 9);
});
QUnit.test("_loadSubTree: Should abort repetitive identical requests", function (assert) {
    assert.expect(2);
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], {
        rootLevel: 1,
        numberOfExpandedLevels: 2
    });
    oBinding.oModel.read = function () {
        return {
            abort: function () {
                assert.ok(true, "Requests got aborted");
                done();
            }
        };
    };
    var aParams = ["PONY", "PINKY PIE"];
    oBinding._loadSubTree(null, aParams);
    setTimeout(function () {
        assert.equal(Object.keys(oBinding.mRequestHandles).length, 1, "One request handle got added");
        oBinding._loadSubTree(null, aParams);
    }, 0);
});
QUnit.test("_loadSubTree: Should reject if binding is missing tree annotations", function (assert) {
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], {
        rootLevel: 1,
        numberOfExpandedLevels: 2
    });
    oBinding.bHasTreeAnnotations = false;
    oBinding._loadSubTree().catch(function (err) {
        assert.equal(err.message, "_loadSubTree: doesn't support hierarchies without tree annotations", "Rejected with correct error");
        done();
    });
});
QUnit.test("_loadSubTree: Should fire correct events in error scenario", function (assert) {
    assert.expect(3);
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], {
        rootLevel: 1,
        numberOfExpandedLevels: 2
    });
    oBinding.oModel.read = function (sPath, mParameters) {
        setTimeout(function () {
            mParameters.error();
        }, 0);
        return {};
    };
    var dataRequestedEventSpy = sinon.spy(oBinding, "fireDataRequested");
    var dataReceivedEventSpy = sinon.spy(oBinding, "fireDataReceived");
    var aParams = ["PONY", "PINKY PIE"];
    oBinding._loadSubTree(null, aParams).catch(function () {
        assert.equal(Object.keys(oBinding.mRequestHandles).length, 0, "Request handle got removed");
        assert.ok(dataRequestedEventSpy.calledOnce, "fireDataRequested was called once");
        assert.ok(dataReceivedEventSpy.calledOnce, "fireDataReceived was called once");
        done();
    });
});
QUnit.test("_loadSubTree: Should process expansion correctly", function (assert) {
    assert.expect(11);
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], {
        rootLevel: 1,
        numberOfExpandedLevels: 2
    });
    var oFakeData = {
        results: ["APPLE JACK", "RAINBOW DASH"]
    };
    var sFakeParentKey = "PARENT KEY";
    var oFakeKeys = {
        foo: "bar"
    };
    oBinding.oModel.read = function (sPath, mParameters) {
        setTimeout(function () {
            mParameters.success(oFakeData);
        }, 0);
        return {};
    };
    oBinding.oModel.getKey = function () {
        return sFakeParentKey;
    };
    oBinding.oModel.callAfterUpdate = function (callback) {
        callback();
    };
    var dataReceivedEventSpy = sinon.spy(oBinding, "fireDataReceived");
    var dataRequestedEventSpy = sinon.spy(oBinding, "fireDataRequested");
    var updateNodeKeyStub = sinon.stub(oBinding, "_updateNodeKey");
    var createKeyMapStub = sinon.stub(oBinding, "_createKeyMap").returns(oFakeKeys);
    var importCompleteKeysHierarchyStub = sinon.stub(oBinding, "_importCompleteKeysHierarchy");
    var aParams = ["PONY", "PINKY PIE"];
    oBinding._loadSubTree(null, aParams).then(function (oData) {
        assert.deepEqual(oData.results, oFakeData.results, "Resolved with correct data");
        assert.equal(Object.keys(oBinding.mRequestHandles).length, 0, "Request handle got removed");
        assert.equal(oBinding.bNeedsUpdate, true, "Binding flagged as \"bNeedsUpdate\"");
        assert.ok(dataRequestedEventSpy.calledOnce, "fireDataRequested was called once");
        assert.ok(dataReceivedEventSpy.calledOnce, "fireDataReceived was called once");
        assert.ok(updateNodeKeyStub.calledOnce, "_updateNodeKey was called once");
        assert.ok(updateNodeKeyStub.alwaysCalledWith(null, sFakeParentKey), "_updateNodeKey was called with correct arguments");
        assert.ok(createKeyMapStub.calledOnce, "_createKeyMap was called once");
        assert.ok(createKeyMapStub.alwaysCalledWith(oFakeData.results), "_createKeyMap was called with correct arguments");
        assert.ok(importCompleteKeysHierarchyStub.calledOnce, "_importCompleteKeysHierarchy was called once");
        assert.ok(importCompleteKeysHierarchyStub.alwaysCalledWith(oFakeKeys), "_importCompleteKeysHierarchy was called with correct arguments");
        done();
    });
});
QUnit.test("_importCompleteKeysHierarchy: Should add keys to internal structures", function (assert) {
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], {
        rootLevel: 1
    });
    var mKeys = {
        "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000001')": [
            "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000002')"
        ],
        "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000002')": [
            "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000003')",
            "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000008')",
            "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000015')",
            "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000135')",
            "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000350')",
            "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000352')",
            "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000360')"
        ]
    };
    var oExpectedLengths = {
        "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000001')": 1,
        "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000002')": 7
    };
    var oExpectedFinalLengths = {
        "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000001')": true,
        "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000002')": true
    };
    var mExpectedSections = {
        "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000001')": [{ startIndex: 0, length: 1 }],
        "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000002')": [{ startIndex: 0, length: 7 }]
    };
    oBinding._importCompleteKeysHierarchy(mKeys);
    assert.deepEqual(oBinding.oKeys, mKeys, "Key maps are correct");
    assert.deepEqual(oBinding.oLengths, oExpectedLengths, "Keys lengths are correct");
    assert.deepEqual(oBinding.oFinalLengths, oExpectedFinalLengths, "Final lengths is correct");
    assert.deepEqual(oBinding._mLoadedSections, mExpectedSections, "Loaded sections are correct");
});
QUnit.test("_updateNodeKey: Should update node keys", function (assert) {
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], {
        rootLevel: 1
    });
    var fnHandler = function (oEvent) {
        oBinding.detachChange(fnHandler);
        oBinding.getContexts(0, 1);
        var oNode = oBinding.getNodeByIndex(0);
        oBinding._updateNodeKey(oNode, "Pony");
        assert.deepEqual(oBinding.oKeys["null"], ["Pony"], "Correct child keys");
        done();
    };
    oBinding.attachChange(fnHandler);
    requestData(oBinding, 0, 1);
});
QUnit.test("_createKeyMap: Should create key map", function (assert) {
    var done = assert.async(), mExpectedKeyMap = {
        "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000001')": [
            "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000002')"
        ],
        "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000002')": [
            "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000003')",
            "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000008')",
            "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000015')",
            "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000135')",
            "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000350')",
            "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000352')",
            "GLAccountHierarchyInChartOfAccountsLiSet(FinancialStatementVariant='undefined',HierarchyNode='000360')"
        ]
    };
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], {
        rootLevel: 1,
        numberOfExpandedLevels: 3
    });
    var fnHandler1 = function (oEvent) {
        oBinding.detachChange(fnHandler1);
        oBinding.attachChange(fnHandler2);
        oBinding.getContexts(0, 15);
    };
    var fnHandler2 = function (oEvent) {
        oBinding.detachChange(fnHandler2);
        oBinding.attachChange(fnHandler3);
        oBinding.getContexts(0, 9);
    };
    var fnHandler3 = function (oEvent) {
        oBinding.detachChange(fnHandler3);
        var aContexts = oBinding.getContexts(0, 9);
        var aData = aContexts.map(function (oContext) {
            return oContext.getProperty();
        });
        var mKeyMap = oBinding._createKeyMap(aData, true);
        assert.deepEqual(mKeyMap, mExpectedKeyMap, "Correct key map");
        done();
    };
    oBinding.attachChange(fnHandler1);
    requestData(oBinding, 0, 9);
});
QUnit.test("Sequential expand over 3 levels", function (assert) {
    var done = assert.async();
    var oContext;
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
        displayRootNode: true,
        numberOfExpandedLevels: 2,
        rootLevel: 1
    });
    var handler1 = function (oEvent) {
        oBinding.detachChange(handler1);
        var aContexts = oBinding.getRootContexts();
        assert.equal(aContexts.length, 1, "TreeBinding rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "01", "TreeBinding root content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000001", "TreeBinding root content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "INT", "TreeBinding root content");
        oBinding.attachChange(handler2);
        aContexts = oBinding.getNodeContexts(oContext);
    };
    var handler2 = function (oEvent) {
        oBinding.detachChange(handler2);
        var aContexts = oBinding.getNodeContexts(oContext);
        assert.equal(aContexts.length, 9, "TreeBinding nodeContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000002", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "1000000", "TreeBinding node content");
        oBinding.attachChange(handler3);
        aContexts = oBinding.getNodeContexts(oContext);
    };
    var handler3 = function (oEvent) {
        oBinding.detachChange(handler3);
        var aSubContexts = oBinding.getNodeContexts(oContext);
        assert.equal(aSubContexts.length, 7, "TreeBinding nodeContexts length");
        oContext = aSubContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "03", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000003", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000002", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "1010000", "TreeBinding node content");
        oContext = aSubContexts[6];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "03", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000360", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000002", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "1070000", "TreeBinding node content");
        done();
    };
    oBinding.attachChange(handler1);
    oBinding.getRootContexts();
});
QUnit.test("Paging - CountMode.Request", function (assert) {
    var done = assert.async();
    var oContext;
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, null, {
        rootLevel: 2
    });
    var handler1 = function (oEvent) {
        var aContexts = oBinding.getRootContexts(1, 4);
        assert.equal(aContexts.length, 4, "TreeBinding returned rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000362", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "2000000", "TreeBinding node content");
        oContext = aContexts[1];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000682", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "3000000", "TreeBinding node content");
        oContext = aContexts[2];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "001073", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "4000000", "TreeBinding node content");
        oContext = aContexts[3];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "001131", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "5000000", "TreeBinding node content");
        oBinding.detachChange(handler1);
        oContext = aContexts[0];
        oBinding.attachChange(handler2);
        oBinding.getNodeContexts(oContext, 2, 3);
    };
    var handler2 = function (oEvent) {
        var aContexts = oBinding.getNodeContexts(oContext, 2, 3);
        assert.equal(aContexts.length, 3, "TreeBinding rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "03", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000413", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000362", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "2030000", "TreeBinding node content");
        oContext = aContexts[1];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "03", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000447", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000362", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "2040000", "TreeBinding node content");
        oContext = aContexts[2];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "03", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000680", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000362", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "2050000", "TreeBinding node content");
        oBinding.detachChange(handler2);
        done();
    };
    oBinding.attachChange(handler1);
    oBinding.getRootContexts(1, 4);
});
QUnit.test("Paging - CountMode.Inline", function (assert) {
    var done = assert.async();
    oModel.setDefaultCountMode(CountMode.Inline);
    var oContext;
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, null, {
        rootLevel: 2
    });
    var handler1 = function (oEvent) {
        var aContexts = oBinding.getRootContexts(1, 4);
        assert.equal(aContexts.length, 4, "TreeBinding returned rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000362", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "2000000", "TreeBinding node content");
        oContext = aContexts[1];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000682", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "3000000", "TreeBinding node content");
        oContext = aContexts[2];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "001073", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "4000000", "TreeBinding node content");
        oContext = aContexts[3];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "001131", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "5000000", "TreeBinding node content");
        oBinding.detachChange(handler1);
        oContext = aContexts[0];
        oBinding.attachChange(handler2);
        oBinding.getNodeContexts(oContext, 2, 3);
    };
    var handler2 = function (oEvent) {
        var aContexts = oBinding.getNodeContexts(oContext, 2, 3);
        assert.equal(aContexts.length, 3, "TreeBinding rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "03", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000413", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000362", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "2030000", "TreeBinding node content");
        oContext = aContexts[1];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "03", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000447", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000362", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "2040000", "TreeBinding node content");
        oContext = aContexts[2];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "03", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000680", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000362", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "2050000", "TreeBinding node content");
        oBinding.detachChange(handler2);
        done();
    };
    oBinding.attachChange(handler1);
    oBinding.getRootContexts(1, 4);
});
QUnit.test("Sorting: Initial Sorter", function (assert) {
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, null, {
        rootLevel: 2
    }, [new Sorter("HierarchyNode", true)]);
    function handler1() {
        oBinding.detachChange(handler1);
        var aRootContexts = oBinding.getRootContexts();
        assert.ok(true, "Sorted descending test:");
        assert.equal(aRootContexts.length, 9, "Exactly 9 contexts returned");
        assert.equal(aRootContexts[0].getProperty("HierarchyNode"), "001180", "First Root Node is 001180");
        assert.equal(aRootContexts[4].getProperty("HierarchyNode"), "001131", "Root from the middle is 001131");
        assert.equal(aRootContexts[8].getProperty("HierarchyNode"), "000002", "Last Root Node is 000002");
        oBinding.attachChange(handler2);
        oBinding.getNodeContexts(aRootContexts[4]);
    }
    function handler2() {
        oBinding.detachChange(handler2);
        var aRootContexts = oBinding.getRootContexts();
        var aChildContexts = oBinding.getNodeContexts(aRootContexts[4]);
        assert.ok(true, "Check if sorting is still applied after expanding a node:");
        assert.equal(aChildContexts.length, 2, "Exactly 2 contexts returned.");
        assert.equal(aChildContexts[0].getProperty("HierarchyNode"), "001134", "aChildContexts[0] of expanded node is also sorted: 001134");
        assert.equal(aChildContexts[1].getProperty("HierarchyNode"), "001132", "aChildContexts[1] of expanded node is also sorted: 001132");
        done();
    }
    oBinding.attachChange(handler1);
    oBinding.getRootContexts();
});
QUnit.test("Sorting: sort() call on binding", function (assert) {
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, null, {
        rootLevel: 2
    });
    function handler0() {
        oBinding.attachChange(handler1);
        oBinding.getRootContexts();
    }
    function handler1() {
        oBinding.detachChange(handler1);
        var aRootContexts = oBinding.getRootContexts();
        assert.ok(true, "Sorted descending test:");
        assert.equal(aRootContexts.length, 9, "Exactly 9 contexts returned");
        assert.equal(aRootContexts[0].getProperty("HierarchyNode"), "001180", "First Root Node is 001180");
        assert.equal(aRootContexts[4].getProperty("HierarchyNode"), "001131", "Root from the middle is 001131");
        assert.equal(aRootContexts[8].getProperty("HierarchyNode"), "000002", "Last Root Node is 000002");
        oBinding.attachChange(handler2);
        oBinding.getNodeContexts(aRootContexts[4]);
    }
    function handler2() {
        oBinding.detachChange(handler2);
        var aRootContexts = oBinding.getRootContexts();
        var aChildContexts = oBinding.getNodeContexts(aRootContexts[4]);
        assert.ok(true, "Check if sorting is still applied after expanding a node:");
        assert.equal(aChildContexts.length, 2, "Exactly 2 contexts returned.");
        assert.equal(aChildContexts[0].getProperty("HierarchyNode"), "001134", "aChildContexts[0] of expanded node is also sorted: 001134");
        assert.equal(aChildContexts[1].getProperty("HierarchyNode"), "001132", "aChildContexts[1] of expanded node is also sorted: 001132");
        done();
    }
    var fnCallbackRefresh = function () {
        oBinding.attachRefresh(handler0);
        oBinding.sort([new Sorter("HierarchyNode", true)]);
    };
    oBinding.attachEventOnce("refresh", fnCallbackRefresh);
});
QUnit.test("filter() API - OperationMode.Server - Application Filter - initial", function (assert) {
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], { rootLevel: 2 });
    var aFilters = [new Filter("FinancialStatementItemText", "StartsWith", "A")];
    var handler1 = function (oEvent) {
        oBinding.detachChange(handler1);
        var oContext;
        assert.equal(oEvent.getParameter("reason"), "filter", "Change even should have the reason 'filter', since filter() was called before data was available.");
        var aContexts = oBinding.getRootContexts(0, 10);
        assert.equal(aContexts.length, 2, "TreeBinding returned rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 2, "Level filter was correct");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000002", "HierachyNode ID is correct");
        assert.equal(oModel.getProperty("FinancialStatementItemText", oContext)[0], "A", "Item Text filter was correct");
        oContext = aContexts[1];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 2, "Level filter was correct");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "001131", "HierachyNode ID is correct");
        assert.equal(oModel.getProperty("FinancialStatementItemText", oContext)[0], "A", "Item Text filter was correct");
        done();
    };
    oBinding.filter(aFilters, "Application");
    oBinding.attachChange(handler1);
    oBinding.getRootContexts(0, 10);
});
QUnit.test("filter() API - OperationMode.Server - Application Filter - afterwards", function (assert) {
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], { rootLevel: 2 });
    var aFilters = [new Filter("FinancialStatementItemText", "StartsWith", "A")];
    var handler1 = function (oEvent) {
        oBinding.detachChange(handler1);
        assert.equal(oEvent.getParameter("reason"), "change", "Change even should have the reason 'filter', since filter() was called before data was available.");
        oBinding.attachRefresh(handler2);
        oBinding.filter(aFilters, "Application");
    };
    var handler2 = function (oEvent) {
        oBinding.detachRefresh(handler2);
        assert.equal(oEvent.getParameter("reason"), "filter", "Refresh even should have the reason 'filter'.");
        oBinding.attachChange(handler3);
        oBinding.getRootContexts(0, 10);
    };
    var handler3 = function (oEvent) {
        oBinding.detachChange(handler3);
        assert.equal(oEvent.getParameter("reason"), "change", "Change even should have the reason 'change'.");
        var aContexts = oBinding.getRootContexts(0, 10);
        assert.equal(aContexts.length, 2, "TreeBinding returned rootContexts length");
        var oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 2, "Level filter was correct");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000002", "HierachyNode ID is correct");
        assert.equal(oModel.getProperty("FinancialStatementItemText", oContext)[0], "A", "Item Text filter was correct");
        oContext = aContexts[1];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 2, "Level filter was correct");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "001131", "HierachyNode ID is correct");
        assert.equal(oModel.getProperty("FinancialStatementItemText", oContext)[0], "A", "Item Text filter was correct");
        done();
    };
    oBinding.attachChange(handler1);
    oBinding.getRootContexts(0, 10);
});
QUnit.test("filter() API - OperationMode.Server - Control Filter - afterwards", function (assert) {
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], { rootLevel: 2 });
    var iWarningCount = 0, sMessage = "";
    sinon.stub(Log, "warning", function (sMsg) {
        iWarningCount++;
        sMessage = sMsg;
    });
    var aFilters = [new Filter("FinancialStatementItemText", "StartsWith", "A")];
    oBinding.filter(aFilters, "Control");
    assert.equal(iWarningCount, 1, "Exactly one warning logged.");
    assert.equal(sMessage, "Filtering with ControlFilters is ONLY possible if the ODataTreeBinding is running in OperationMode.Client or " + "OperationMode.Auto, in case the given threshold is lower than the total number of tree nodes.");
    Log.warning.restore();
});
QUnit.test("filter() API - OperationMode.Client - Application Filter - useServersideApplicationFilters=true - initial", function (assert) {
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], {
        rootLevel: 2,
        operationMode: "Client",
        useServersideApplicationFilters: true
    });
    var aFilters = [new Filter("FinancialStatementItemText", "StartsWith", "A")];
    var handler1 = function (oEvent) {
        var oContext;
        assert.equal(oEvent.getParameter("reason"), "filter", "Change even should have the reason 'filter', since filter() was called before data was available.");
        var aContexts = oBinding.getRootContexts(0, 10);
        assert.equal(aContexts.length, 2, "TreeBinding returned rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 2, "Level filter was correct");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000002", "HierachyNode ID is correct");
        assert.equal(oModel.getProperty("FinancialStatementItemText", oContext)[0], "A", "Item Text filter was correct");
        oContext = aContexts[1];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 2, "Level filter was correct");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "001131", "HierachyNode ID is correct");
        assert.equal(oModel.getProperty("FinancialStatementItemText", oContext)[0], "A", "Item Text filter was correct");
        oBinding.detachChange(handler1);
        done();
    };
    oBinding.filter(aFilters, "Application");
    oBinding.attachChange(handler1);
    oBinding.getRootContexts(0, 10);
});
QUnit.test("filter() API - OperationMode.Client - Application & Control Filter - useServersideApplicationFilters=true - initial", function (assert) {
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], {
        rootLevel: 2,
        operationMode: "Client",
        useServersideApplicationFilters: true
    });
    var aFilters = [new Filter("FinancialStatementItemText", "StartsWith", "A")];
    var handler1 = function (oEvent) {
        var oContext;
        assert.equal(oEvent.getParameter("reason"), "filter", "Change even should have the reason 'filter', since filter() was called before data was available.");
        var aContexts = oBinding.getRootContexts(0, 10);
        assert.equal(aContexts.length, 1, "TreeBinding returned rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 2, "Level filter was correct");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "001131", "HierachyNode ID is correct");
        assert.equal(oModel.getProperty("FinancialStatementItemText", oContext)[0], "A", "Item Text filter was correct");
        oBinding.detachChange(handler1);
        done();
    };
    oBinding.filter(aFilters, "Application");
    oBinding.filter([new Filter("HierarchyNode", "EQ", "001131")], "Control");
    oBinding.attachChange(handler1);
    oBinding.getRootContexts(0, 10);
});
QUnit.test("filter() API - OperationMode.Client - Application Filter - useServersideApplicationFilters=true - afterwards", function (assert) {
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], {
        rootLevel: 2,
        operationMode: "Client",
        useServersideApplicationFilters: true
    });
    var handler1 = function (oEvent) {
        oBinding.detachChange(handler1);
        assert.equal(oEvent.getParameter("reason"), "change", "Change event should have the reason 'change'.");
        var aContexts = oBinding.getRootContexts(0, 10);
        assert.equal(aContexts.length, 9, "TreeBinding returned rootContexts length 9 -> unfiltered tree");
        var aFilters = [new Filter("FinancialStatementItemText", "StartsWith", "A")];
        oBinding.attachRefresh(handler2);
        oBinding.filter(aFilters, "Application");
    };
    var handler2 = function (oEvent) {
        oBinding.detachRefresh(handler2);
        assert.equal(oEvent.getParameter("reason"), "filter", "Refresh event should have the reason 'filter'.");
        oBinding.attachChange(handler3);
        oBinding.getRootContexts(0, 10);
    };
    var handler3 = function (oEvent) {
        oBinding.detachChange(handler3);
        assert.equal(oEvent.getParameter("reason"), "change", "Change event should have the reason 'change'.");
        var aContexts = oBinding.getRootContexts(0, 10);
        assert.equal(aContexts.length, 2, "TreeBinding returned rootContexts length");
        var oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 2, "Level filter was correct");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000002", "HierachyNode ID is correct");
        assert.equal(oModel.getProperty("FinancialStatementItemText", oContext)[0], "A", "Item Text filter was correct");
        oContext = aContexts[1];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 2, "Level filter was correct");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "001131", "HierachyNode ID is correct");
        assert.equal(oModel.getProperty("FinancialStatementItemText", oContext)[0], "A", "Item Text filter was correct");
        done();
    };
    oBinding.attachChange(handler1);
    oBinding.getRootContexts(0, 10);
});
QUnit.test("filter() API - OperationMode.Client - Application Filter - useServersideApplicationFilters=false (default) - Initial", function (assert) {
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], {
        rootLevel: 2,
        operationMode: "Client",
        useServersideApplicationFilters: false
    });
    var aFilters = [new Filter("FinancialStatementItemText", "StartsWith", "A")];
    var handler1 = function (oEvent) {
        var oContext;
        assert.equal(oEvent.getParameter("reason"), "filter", "Change event should have the reason 'filter', since filter() was called before data was available.");
        var aContexts = oBinding.getRootContexts(0, 10);
        assert.equal(aContexts.length, 7, "TreeBinding returned rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 2, "Level filter was correct");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000002", "HierachyNode ID is correct");
        assert.equal(oModel.getProperty("FinancialStatementItemText", oContext)[0], "A", "Item Text filter was correct");
        aContexts = oBinding.getNodeContexts(aContexts[0], 0, 20);
        assert.equal(aContexts.length, 5, "Correct child count on level 1");
        assert.notEqual(aContexts[3].getProperty("FinancialStatementItemText")[0], "A", "0.3 - doesn't match filter - it's an inner node");
        assert.equal(aContexts[4].getProperty("FinancialStatementItemText")[0], "A", "0.4 - FinancialStatementItemText starts with 'A'");
        aContexts = oBinding.getNodeContexts(aContexts[3], 0, 20);
        assert.equal(aContexts.length, 1, "Inner node has exactly 1 child");
        oBinding.detachChange(handler1);
        done();
    };
    oBinding.filter(aFilters, "Application");
    oBinding.attachChange(handler1);
    oBinding.getRootContexts(0, 10);
});
QUnit.test("filter() API - OperationMode.Client - Application & Control Filter - useServersideApplicationFilters=false (default) - Initial", function (assert) {
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], {
        rootLevel: 2,
        operationMode: "Client",
        useServersideApplicationFilters: false
    });
    var aFilters = [new Filter("FinancialStatementItemText", "StartsWith", "A")];
    var handler1 = function (oEvent) {
        var oContext;
        assert.equal(oEvent.getParameter("reason"), "filter", "Change event should have the reason 'filter', since filter() was called before data was available.");
        var aContexts = oBinding.getRootContexts(0, 10);
        assert.equal(aContexts.length, 5, "TreeBinding returned rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 2, "Level filter was correct");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000002", "HierachyNode ID is correct");
        assert.equal(oModel.getProperty("FinancialStatementItemText", oContext)[0], "A", "Item Text filter was correct");
        aContexts = oBinding.getNodeContexts(aContexts[0], 0, 20);
        assert.equal(aContexts.length, 3, "Correct child count on level 1");
        assert.equal(aContexts[1].getProperty("FinancialStatementItemText")[0], "A", "0.1 - FinancialStatementItemText starts with 'A'");
        assert.notEqual(aContexts[2].getProperty("FinancialStatementItemText")[0], "A", "0.2 - doesn't match filter - it's an inner node");
        aContexts = oBinding.getNodeContexts(aContexts[2], 0, 20);
        assert.equal(aContexts.length, 1, "Inner node has exactly 1 child");
        oBinding.detachChange(handler1);
        done();
    };
    oBinding.filter(aFilters, "Application");
    oBinding.filter([new Filter("FinancialStatementItemText", "EndsWith", "n")], "Control");
    oBinding.attachChange(handler1);
    oBinding.getRootContexts(0, 10);
});
QUnit.test("filter() API - OperationMode.Client - Control Filter - useServersideApplicationFilters=false (default) - afterwards", function (assert) {
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], {
        rootLevel: 2,
        operationMode: "Client",
        useServersideApplicationFilters: false
    });
    var handler1 = function (oEvent) {
        oBinding.detachChange(handler1);
        assert.equal(oEvent.getParameter("reason"), "change", "Change event should have the reason 'change'.");
        var aContexts = oBinding.getRootContexts(0, 10);
        assert.equal(aContexts.length, 9, "TreeBinding returned rootContexts length 9 -> unfiltered tree");
        oBinding.attachChange(handler2);
        var aFilters = [new Filter("FinancialStatementItemText", "StartsWith", "A")];
        oBinding.filter(aFilters, "Control");
    };
    var handler2 = function (oEvent) {
        oBinding.detachChange(handler2);
        var aContexts = oBinding.getRootContexts(0, 10);
        assert.equal(aContexts.length, 7, "TreeBinding returned rootContexts length");
        var oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 2, "Level filter was correct");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000002", "HierachyNode ID is correct");
        assert.equal(oModel.getProperty("FinancialStatementItemText", oContext)[0], "A", "Item Text filter was correct");
        aContexts = oBinding.getNodeContexts(aContexts[0], 0, 20);
        assert.equal(aContexts.length, 5, "Correct child count on level 1");
        assert.notEqual(aContexts[3].getProperty("FinancialStatementItemText")[0], "A", "0.3 - doesn't match filter - it's an inner node");
        assert.equal(aContexts[4].getProperty("FinancialStatementItemText")[0], "A", "0.4 - FinancialStatementItemText starts with 'A'");
        aContexts = oBinding.getNodeContexts(aContexts[3], 0, 20);
        assert.equal(aContexts.length, 1, "Inner node has exactly 1 child");
        done();
    };
    oBinding.attachChange(handler1);
    oBinding.getRootContexts(0, 10);
});
QUnit.test("getFilterParams: Correct application filter parameter generation", function (assert) {
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, []);
    var aAppFilters = [new Filter("FinancialStatementItemText", "StartsWith", "Po"), new Filter("FinancialStatementItemText", "EndsWith", "ny")];
    var sExpectedFilterParams = "(startswith(FinancialStatementItemText,%27Po%27)%20or%20endswith(FinancialStatementItemText,%27ny%27))";
    oBinding.filter(aAppFilters, "Application");
    var sFilterParams = oBinding.getFilterParams();
    assert.equal(sFilterParams, sExpectedFilterParams, "Correct filter params returned");
});
QUnit.test("Tried filtering - incomplete Annotations/Navigation Property Definitions", function (assert) {
    var iErrorCount = 0;
    sinon.stub(Log, "error", function (sMsg) {
        iErrorCount++;
    });
    var iWarningCount = 0;
    sinon.stub(Log, "warning", function (sMsg) {
        iWarningCount++;
    });
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, null, {
        rootLevel: 1,
        treeAnnotationProperties: {
            hierarchyNodeFor: "Test"
        }
    });
    oBinding.filter(new Filter("ParentNode", "EQ", "000000"));
    assert.equal(iErrorCount, 1, "One error logged, if no navigation path properties are given, and hierarchy annotations are missing/incomplete.");
    assert.equal(iWarningCount, 2, "One warning (that filtering is not enabled) and One for the incomplete annotations.");
    Log.warning.restore();
    Log.error.restore();
});
QUnit.test("getDownload URL ", function (assert) {
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
        displayRootNode: true,
        numberOfExpandedLevels: 2,
        rootLevel: 1
    });
    var handler1 = function (oEvent) {
        oBinding.detachChange(handler1);
        assert.equal(oBinding.getDownloadUrl(), "/metadata/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", "check download URL");
        assert.equal(oBinding.getDownloadUrl("json"), "/metadata/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result?$format=json", "check download URL JSON");
        done();
    };
    oBinding.attachChange(handler1);
    oBinding.getRootContexts();
});
QUnit.test("OperationMode.Client: initial load + expanding nodes", function (assert) {
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
        displayRootNode: true,
        rootLevel: 1,
        operationMode: OperationMode.Client
    });
    oBinding.attachChange(fnChangeHandler);
    oBinding.getRootContexts();
    function fnChangeHandler() {
        var aContexts = oBinding.getRootContexts();
        assert.equal(aContexts.length, 1, "rootContexts length is correct = 1");
        var oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "01", "1st node sits on the correct level = '01'");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000001", "1st node has correct ID");
        aContexts = oBinding.getNodeContexts(oContext);
        assert.equal(aContexts.length, 9, "nodeContexts length is correct = 9");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "Node context for root children could be loaded instantly");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000002", "Retrieved node is correct = 000002");
        var aSubContexts = oBinding.getNodeContexts(oContext);
        assert.equal(aSubContexts.length, 7, "nodeContexts length is correct = 7");
        oContext = aSubContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "03", "3rd level expanded node is on the correct level");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000003", "3rd level expanded node is correct");
        oContext = aSubContexts[6];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "03", "last 3rd level node is also loaded, nothing missing");
        done();
    }
});
QUnit.test("OperationMode.Client: initial load + sorter", function (assert) {
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
        rootLevel: 2,
        operationMode: OperationMode.Client
    }, [new Sorter("HierarchyNode", true)]);
    oBinding.attachChange(fnChangeHandler);
    oBinding.getRootContexts();
    function fnChangeHandler(oEvent) {
        var aRootContexts = oBinding.getRootContexts();
        assert.ok(true, "Sorted descending test:");
        assert.equal(aRootContexts.length, 9, "Exactly 9 contexts returned");
        assert.equal(aRootContexts[0].getProperty("HierarchyNode"), "001180", "First Root Node is 001180");
        assert.equal(aRootContexts[4].getProperty("HierarchyNode"), "001131", "Root from the middle is 001131");
        assert.equal(aRootContexts[8].getProperty("HierarchyNode"), "000002", "Last Root Node is 000002");
        var aChildContexts = oBinding.getNodeContexts(aRootContexts[4]);
        assert.ok(true, "Check if sorting is still applied after expanding a node:");
        assert.equal(aChildContexts.length, 2, "Exactly 2 contexts returned.");
        assert.equal(aChildContexts[0].getProperty("HierarchyNode"), "001134", "aChildContexts[0] of expanded node is also sorted: 001134");
        assert.equal(aChildContexts[1].getProperty("HierarchyNode"), "001132", "aChildContexts[1] of expanded node is also sorted: 001132");
        done();
    }
});
QUnit.test("OperationMode.Auto: Backend has fewer entries than the threshold.", function (assert) {
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
        rootLevel: 2,
        operationMode: OperationMode.Auto,
        threshold: 20000
    });
    oBinding.attachChange(fnChangeHandler);
    oBinding.getRootContexts();
    function fnChangeHandler(oEvent) {
        oBinding.detachChange(fnChangeHandler);
        assert.equal(oBinding.bClientOperation, true, "Binding switched to clientside operations");
        oBinding.attachChange(fnChangeHandler2);
        oBinding.getRootContexts();
    }
    function fnChangeHandler2(oEvent) {
        oBinding.detachChange(fnChangeHandler2);
        var aRootContexts = oBinding.getRootContexts();
        assert.ok(true, "Sorted descending test:");
        assert.equal(aRootContexts.length, 9, "Exactly 9 contexts returned");
        assert.equal(aRootContexts[0].getProperty("HierarchyNode"), "000002", "First Root Node is 000002");
        assert.equal(aRootContexts[4].getProperty("HierarchyNode"), "001131", "Root from the middle is 001131");
        assert.equal(aRootContexts[8].getProperty("HierarchyNode"), "001180", "Last Root Node is 001180");
        var aChildContexts = oBinding.getNodeContexts(aRootContexts[4]);
        assert.ok(true, "Check if sorting is still applied after expanding a node:");
        assert.equal(aChildContexts.length, 2, "Exactly 2 contexts returned.");
        assert.equal(aChildContexts[0].getProperty("HierarchyNode"), "001132", "aChildContexts[0] of expanded node is also sorted: 001134");
        assert.equal(aChildContexts[1].getProperty("HierarchyNode"), "001134", "aChildContexts[1] of expanded node is also sorted: 001132");
        assert.ok(true, "Sorting on the client");
        oBinding.sort([new Sorter("HierarchyNode", true)]);
        aRootContexts = oBinding.getRootContexts();
        assert.equal(aRootContexts.length, 9, "Still exactly 9 contexts after sorting - No Request sent");
        assert.equal(aRootContexts[0].getProperty("HierarchyNode"), "001180", "First Root Node is 001180");
        assert.equal(aRootContexts[4].getProperty("HierarchyNode"), "001131", "Root from the middle is 001131");
        assert.equal(aRootContexts[8].getProperty("HierarchyNode"), "000002", "Last Root Node is 000002");
        done();
    }
});
QUnit.test("Reset followed by Request - Should fire a single pair of data* events", function (assert) {
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], {
        rootLevel: 1,
        numberOfExpandedLevels: 0
    });
    var fireDataRequestedSpy = sinon.spy(oBinding, "fireDataRequested");
    var fireDataReceivedSpy = sinon.spy(oBinding, "fireDataReceived");
    function handler1(oEvent) {
        oBinding.detachChange(handler1);
        var aContexts = oBinding.getContexts(0, 9);
        assert.equal(aContexts.length, 1, "Correct context is loaded");
        window.setTimeout(function () {
            assert.equal(fireDataRequestedSpy.callCount, 1, "fireDataRequested fired once");
            assert.equal(fireDataReceivedSpy.callCount, 1, "fireDataReceivedSpy fired once");
            done();
        }, 100);
    }
    oBinding.attachChange(handler1);
    oBinding.attachEventOnce("refresh", function () {
        oBinding.getContexts(0, 9);
        oBinding.resetData();
        oBinding.getContexts(0, 9);
    });
});
QUnit.module("ODataTreeBinding with annotations - Edm Type support", {
    beforeEach: function () {
        oAnnotationMockServerGUID.start();
        oModel = new ODataModel("/metadata_guid/", { useBatch: false });
        return oModel.metadataLoaded();
    },
    afterEach: function () {
        oAnnotationMockServerGUID.stop();
        oModel = undefined;
    }
});
QUnit.test("Paging", function (assert) {
    var done = assert.async();
    var oContext;
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, null, {
        rootLevel: 2
    });
    var handler1 = function (oEvent) {
        var aContexts = oBinding.getRootContexts(1, 4);
        assert.equal(aContexts.length, 4, "TreeBinding returned rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000362", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "2000000", "TreeBinding node content");
        oContext = aContexts[1];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000682", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "3000000", "TreeBinding node content");
        oContext = aContexts[2];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "001073", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "4000000", "TreeBinding node content");
        oContext = aContexts[3];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "001131", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "5000000", "TreeBinding node content");
        oBinding.detachChange(handler1);
        oContext = aContexts[0];
        oBinding.attachChange(handler2);
        oBinding.getNodeContexts(oContext, 2, 3);
    };
    var handler2 = function (oEvent) {
        var aContexts = oBinding.getNodeContexts(oContext, 2, 3);
        assert.equal(aContexts.length, 3, "TreeBinding rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "03", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000413", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000362", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "2030000", "TreeBinding node content");
        oContext = aContexts[1];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "03", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000447", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000362", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "2040000", "TreeBinding node content");
        oContext = aContexts[2];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "03", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000680", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000362", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "2050000", "TreeBinding node content");
        oBinding.detachChange(handler2);
        done();
    };
    oBinding.attachChange(handler1);
    oBinding.getRootContexts(1, 4);
});
QUnit.test("Data Received Parameters", function (assert) {
    var done = assert.async();
    createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, null, {
        rootLevel: 2
    });
    function handler1(oEvent) {
        oBinding.detachDataReceived(handler1);
        var oData = oEvent.getParameter("data");
        assert.equal(oData.results.length, 4, "Data is set as an event-parameter of dataReceive event (getRootContexts)");
        oBinding.attachDataReceived(handler2);
        var oContext = oBinding.getRootContexts(1, 4)[0];
        oBinding.getNodeContexts(oContext, 0, 3);
    }
    function handler2(oEvent) {
        oBinding.detachDataReceived(handler2);
        var oData = oEvent.getParameter("data");
        assert.equal(oData.results.length, 3, "Data is set as an event-parameter of dataReceive event (getNodeContexts)");
        done();
    }
    oBinding.attachDataReceived(handler1);
    oBinding.getRootContexts(1, 4);
});
QUnit.module("ODataTreeBinding - General Databinding", {
    beforeEach: function () {
        oAnnotationMockServer.start();
        oModel = new ODataModel("/metadata/", { useBatch: false });
        return oModel.metadataLoaded();
    },
    afterEach: function () {
        oAnnotationMockServer.stop();
        oModel = undefined;
    }
});
QUnit.test("Relative Binding", function (assert) {
    var done = assert.async();
    createTreeBinding("Result", null, null, {
        displayRootNode: true,
        numberOfExpandedLevels: 2,
        rootLevel: 1
    });
    var oContext;
    var handler0 = function () {
        oBinding.detachChange(handler0);
        oBinding.attachChange(handler1);
        oBinding.getRootContexts();
    };
    var handler1 = function (oEvent) {
        oBinding.detachChange(handler1);
        var aContexts = oBinding.getRootContexts();
        assert.equal(aContexts.length, 1, "TreeBinding rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "01", "TreeBinding root content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000001", "TreeBinding root content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "INT", "TreeBinding root content");
        oBinding.attachChange(handler2);
        aContexts = oBinding.getNodeContexts(oContext);
    };
    var handler2 = function (oEvent) {
        oBinding.detachChange(handler2);
        var aContexts = oBinding.getNodeContexts(oContext);
        assert.equal(aContexts.length, 9, "TreeBinding nodeContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000002", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "1000000", "TreeBinding node content");
        oBinding.attachChange(handler3);
        aContexts = oBinding.getNodeContexts(oContext);
    };
    var handler3 = function (oEvent) {
        oBinding.detachChange(handler3);
        var aSubContexts = oBinding.getNodeContexts(oContext);
        assert.equal(aSubContexts.length, 7, "TreeBinding nodeContexts length");
        oContext = aSubContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "03", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000003", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000002", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "1010000", "TreeBinding node content");
        oContext = aSubContexts[6];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "03", "TreeBinding node content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000360", "TreeBinding node content");
        assert.equal(oModel.getProperty("ParentNode", oContext), "000002", "TreeBinding node content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "1070000", "TreeBinding node content");
        done();
    };
    assert.ok(oBinding.isRelative(), "Binding is relative");
    oBinding.attachChange(handler0);
    var aRootContexts = oBinding.getRootContexts();
    assert.deepEqual(aRootContexts, [], "Initial root context call has no return value without a context");
    var sContextPath = "/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')";
    oModel.createBindingContext(sContextPath, null, function (oCreatedContext) {
        oBinding.setContext(oCreatedContext);
    });
});
QUnit.test("Relative Binding - setContext(undefined)", function (assert) {
    var done = assert.async();
    createTreeBinding("Result", null, null, {
        displayRootNode: true,
        numberOfExpandedLevels: 2,
        rootLevel: 1
    });
    var oContext;
    var handler0 = function () {
        oBinding.detachChange(handler0);
        oBinding.attachChange(handler1);
        oBinding.getRootContexts();
    };
    var handler1 = function (oEvent) {
        oBinding.detachChange(handler1);
        var aContexts = oBinding.getRootContexts();
        assert.equal(aContexts.length, 1, "TreeBinding rootContexts length");
        oContext = aContexts[0];
        assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "01", "TreeBinding root content");
        assert.equal(oModel.getProperty("HierarchyNode", oContext), "000001", "TreeBinding root content");
        assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "INT", "TreeBinding root content");
        oBinding.setContext(undefined);
        done();
    };
    assert.ok(oBinding.isRelative(), "Binding is relative");
    oBinding.attachChange(handler0);
    var aRootContexts = oBinding.getRootContexts();
    assert.deepEqual(aRootContexts, [], "Initial root context call has no return value without a context");
    var sContextPath = "/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')";
    oModel.createBindingContext(sContextPath, null, function (oCreatedContext) {
        oBinding.setContext(oCreatedContext);
    });
});
QUnit.module("Unsupported Filter Operators", {
    beforeEach: function () {
        oModel = new ODataModel("/metadata/");
    },
    afterEach: function () {
        oModel = undefined;
    },
    getErrorWithMessage: function (sFilter) {
        return new Error("Filter instances contain an unsupported FilterOperator: " + sFilter);
    }
});
QUnit.test("constructor - Any/All are rejected", function (assert) {
    assert.throws(function () {
        var oFilter = new Filter("lastName", FilterOperator.NE, "Foo");
        var oFilter2 = new Filter({ path: "firstName", operator: FilterOperator.Any, variable: "id1", condition: new Filter() });
        var oMultiFilter = new Filter([oFilter, oFilter2], true);
        oModel.bindTree("/teamMembers", undefined, [oMultiFilter]);
    }, this.getErrorWithMessage(FilterOperator.Any), "Error thrown if filter instances contain an unsupported FilterOperator");
});
QUnit.test("filter() - Any/All are rejected", function (assert) {
    var oTreeBinding = oModel.bindTree("/teamMembers", undefined, []);
    assert.throws(function () {
        var oFilter = new Filter("lastName", FilterOperator.GT, "Wallace");
        var oFilter2 = new Filter({ path: "firstName", operator: FilterOperator.Any, variable: "id1", condition: new Filter() });
        oTreeBinding.filter([oFilter, oFilter2]);
    }, this.getErrorWithMessage(FilterOperator.Any), "Error thrown if filter instances contain an unsupported FilterOperator");
    assert.throws(function () {
        var oFilter = new Filter({ path: "lastName", operator: FilterOperator.All, variable: "id2", condition: new Filter() });
        var oFilter2 = new Filter("firstName", FilterOperator.EQ, "Rush");
        oTreeBinding.filter([oFilter, oFilter2]);
    }, this.getErrorWithMessage(FilterOperator.All), "Error thrown if filter instances contain an unsupported FilterOperator");
    assert.throws(function () {
        var oFilter = new Filter({ path: "lastName", operator: FilterOperator.All, variable: "id3", condition: new Filter() });
        var oFilter2 = new Filter("firstName", FilterOperator.EQ, "Bar");
        var oMultiFilter = new Filter({
            filters: [oFilter, oFilter2],
            and: false
        });
        oTreeBinding.filter([oMultiFilter]);
    }, this.getErrorWithMessage(FilterOperator.All), "Error thrown if filter instances contain an unsupported FilterOperator");
    assert.throws(function () {
        var oFilter = new Filter("lastName", FilterOperator.NE, "Foo");
        var oFilter2 = new Filter({ path: "firstName", operator: FilterOperator.Any, variable: "id4", condition: new Filter() });
        var oMultiFilter = new Filter([oFilter, oFilter2], true);
        oTreeBinding.filter([oMultiFilter]);
    }, this.getErrorWithMessage(FilterOperator.Any), "Error thrown if filter instances contain an unsupported FilterOperator");
});
QUnit.test("Multi Filters (Complex) 1 - Unsupported are not OK", function (assert) {
    var oTreeBinding = oModel.bindTree("/teamMembers", undefined, []);
    var oFilter1 = new Filter("x", FilterOperator.EQ, "Foo");
    var oFilter2 = new Filter({ path: "y", operator: FilterOperator.All, variable: "id1", condition: new Filter() });
    var oFilter3 = new Filter("z", FilterOperator.NE, "Bla");
    var oFilter4 = new Filter("t", FilterOperator.LE, "ZZZ");
    var oMultiFilter1 = new Filter({
        filters: [oFilter1, oFilter2],
        and: true
    });
    var oMultiFilter2 = new Filter([oMultiFilter1, oFilter3], false);
    var oMultiFilter3 = new Filter({
        filters: [oMultiFilter2, oFilter4],
        and: true
    });
    assert.throws(function () {
        oTreeBinding.filter([oMultiFilter3]);
    }, this.getErrorWithMessage(FilterOperator.All), "Error thrown if  multi-filter instances contain an unsupported FilterOperator");
});
QUnit.test("Multi Filters (Complex) 2 - Unsupported are not OK", function (assert) {
    var oTreeBinding = oModel.bindTree("/teamMembers", undefined, []);
    var oFilter1 = new Filter("x", FilterOperator.EQ, "Foo");
    var oFilter2 = new Filter({
        path: "y",
        operator: FilterOperator.All,
        variable: "id1",
        condition: new Filter([
            new Filter("t", FilterOperator.GT, 66),
            new Filter({ path: "g", operator: FilterOperator.Any, variable: "id2", condition: new Filter("f", FilterOperator.NE, "hello") })
        ], true)
    });
    var oFilter3 = new Filter("z", FilterOperator.NE, "Bla");
    var oFilter4 = new Filter("t", FilterOperator.LE, "ZZZ");
    var oMultiFilter1 = new Filter({
        filters: [oFilter1, oFilter2],
        and: true
    });
    var oMultiFilter2 = new Filter([oMultiFilter1, oFilter3], false);
    var oMultiFilter3 = new Filter({
        filters: [oMultiFilter2, oFilter4],
        and: true
    });
    assert.throws(function () {
        oTreeBinding.filter([oMultiFilter3]);
    }, this.getErrorWithMessage(FilterOperator.All), "Error thrown if  multi-filter instances contain an unsupported FilterOperator");
});
QUnit.test("abortPendingRequest - Aborts all pending requests", function (assert) {
    createTreeBinding("/orgHierarchy", null, [], {
        threshold: 10,
        countMode: "Inline",
        operationMode: "Server",
        numberOfExpandedLevels: 2
    });
    var iAbortCalled = 0;
    var oFakeRequestHandle = {
        abort: function () {
            iAbortCalled++;
        }
    };
    oBinding.mRequestHandles = {
        request1: oFakeRequestHandle,
        request2: oFakeRequestHandle
    };
    oBinding._abortPendingRequest();
    assert.equal(iAbortCalled, 2, "All four fake requests got aborted");
    assert.equal(Object.keys(oBinding.mRequestHandles).length, 0, "There are no more pending requests");
});