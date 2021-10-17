import App from "sap/m/App";
import Bar from "sap/m/Bar";
import HBox from "sap/m/HBox";
import Label from "sap/m/Label";
import Link from "sap/m/Link";
import Page from "sap/m/Page";
import SearchField from "sap/m/SearchField";
import SegmentedButton from "sap/m/SegmentedButton";
import SegmentedButtonItem from "sap/m/SegmentedButtonItem";
import Text from "sap/m/Text";
import Toolbar from "sap/m/Toolbar";
import Table from "sap/ui/table/Table";
import Column from "sap/ui/table/Column";
import Filter from "sap/ui/model/Filter";
import JSONModel from "sap/ui/model/json/JSONModel";
import Log from "sap/base/Log";
import includeStylesheet from "sap/ui/dom/includeStylesheet";
import Storage from "sap/ui/util/Storage";
import _utils from "sap/ui/test/starter/_utils";
import require from "require";
import discovery from "./discovery";
import makeFilterFunction from "./filter";
function compare(s1, s2) {
    if (s1 === s2) {
        return 0;
    }
    return s1 < s2 ? -1 : 1;
}
function removeWebContext(pathname) {
    if (pathname.startsWith("/")) {
        pathname = pathname.slice(1);
    }
    if (!pathname.startsWith("resources/") && !pathname.startsWith("test-resources/")) {
        pathname = pathname.split("/").slice(1).join("/");
    }
    return pathname;
}
function makeNameFromURL(urlStr) {
    let name;
    try {
        const url = new URL(urlStr, document.baseURI);
        const search = url.searchParams;
        let path = removeWebContext(url.pathname);
        search.delete("hidepassed");
        if (path.includes("resources/sap/ui/test/starter/Test.qunit.html") && search.has("testsuite") && search.has("test")) {
            path = search.get("testsuite") + "/" + search.get("test");
            search.delete("testsuite");
            search.delete("test");
        }
        name = decodeURIComponent(path) + decodeURIComponent(url.search);
        if (name.startsWith("/")) {
            name = name.slice(1);
        }
        if (url.protocol === "about:") {
            name = url.protocol + name;
        }
    }
    catch (e) {
        name = urlStr;
    }
    return name;
}
function formatModulesShort(module) {
    let result;
    if (!Array.isArray(module) || module.length === 1) {
        return "";
    }
    function shorten(str) {
        return String(str).replace(/\.qunit$/, "").split(/\s*[-/]\s*/).pop();
    }
    result = module.map(shorten).join(", ");
    if (result.length > 40) {
        result = result.slice(0, 15) + "..." + result.slice(-15) + "(" + module.length + ")";
    }
    return result;
}
function formatModules(module) {
    if (Array.isArray(module)) {
        return module.join(" ");
    }
    return String(module);
}
function formatQUnitVersion(v) {
    return v != null ? "qunit" + v : "";
}
function formatSinonVersion(v) {
    return v != null ? "sinon" + v : "";
}
const oModel = new JSONModel({ data: [] });
let oTable;
let oTreeMapChart;
function fnSearch(oEvent) {
    var oFilter = new Filter("", makeFilterFunction([
        {
            path: "fullpage",
            formatter: makeNameFromURL
        },
        {
            path: "module",
            formatter: formatModules
        },
        {
            path: "qunit/version",
            formatter: formatQUnitVersion
        },
        {
            path: "sinon/version",
            formatter: formatSinonVersion
        }
    ], oEvent.getParameter("newValue")));
    oTable.getBinding("rows").filter(oFilter);
    oModel.setProperty("/filteredTestCount", oTable.getBinding("rows").getLength());
}
function createUI(showSuite) {
    new App("app", {
        models: oModel,
        busy: true,
        busyIndicatorDelay: 0,
        initialPage: "page",
        pages: [
            new Page("page", {
                enableScrolling: false,
                showHeader: true,
                customHeader: new Bar({
                    contentLeft: [
                        new Label({
                            text: "Find Test Case",
                            labelFor: "search"
                        }),
                        new SearchField("search", {
                            showSearchButton: false,
                            width: "500px",
                            placeholder: "Enter parts of a class name or test case name or an abbreviation (e.g. CB for ComboBox)",
                            liveChange: fnSearch
                        }),
                        new Text("info", {
                            text: "{= ${/filteredTestCount} < ${/testCount} ? ${/filteredTestCount} + \" of \" + ${/testCount} : ${/testCount}} Tests"
                        })
                    ],
                    contentRight: [
                        new SegmentedButton("view", {
                            selectionChange: function (e) {
                                const key = e.getSource().getSelectedKey();
                                if (key === "table") {
                                    oTable.setVisible(true);
                                    if (oTreeMapChart) {
                                        oTreeMapChart.setVisible(false);
                                    }
                                }
                                else {
                                    oTable.setVisible(false);
                                    if (oTreeMapChart) {
                                        oTreeMapChart.setVisible(true);
                                        oTreeMapChart.setData(oModel.getData().tests);
                                        oTreeMapChart.invalidate();
                                    }
                                }
                            },
                            items: [
                                new SegmentedButtonItem({
                                    key: "table",
                                    icon: "sap-icon://table-view"
                                }),
                                new SegmentedButtonItem({
                                    key: "treemap",
                                    icon: "sap-icon://Chart-Tree-Map",
                                    enabled: false
                                })
                            ]
                        }).addStyleClass("sapUiSmallMarginBottom")
                    ]
                }),
                content: [
                    oTable = new Table("table", {
                        selectionMode: "None",
                        columnHeaderHeight: 24,
                        columnHeaderVisible: true,
                        visibleRowCountMode: "Auto",
                        rowHeight: 20,
                        columns: [
                            new Column("test", {
                                label: new Label({ text: "Testcase" }),
                                template: new HBox({
                                    items: [
                                        new Link({
                                            text: { path: "fullpage", formatter: makeNameFromURL },
                                            href: { path: "fullpage" },
                                            target: "test"
                                        }),
                                        new Link({
                                            text: "(suite)",
                                            href: { path: "testsuite" },
                                            target: "test",
                                            visible: showSuite
                                        }).addStyleClass("decorator")
                                    ]
                                }),
                                sortProperty: "page"
                            }),
                            new Column("modules", {
                                label: new Label({ text: "Modules" }),
                                width: "40ex",
                                template: new Text({
                                    text: { path: "module", formatter: formatModulesShort },
                                    tooltip: { path: "module", formatter: formatModules }
                                }),
                                sortProperty: "page"
                            }),
                            new Column("qunitVersion", {
                                label: new Label({ text: "Q" }),
                                width: "4ex",
                                template: new Text({
                                    text: { path: "qunit/version" }
                                }),
                                sortProperty: "qunit/version"
                            }),
                            new Column("sinonVersion", {
                                label: new Label({ text: "S" }),
                                width: "4ex",
                                template: new Text({
                                    text: { path: "sinon/version" }
                                }),
                                sortProperty: "sinon/version"
                            })
                        ],
                        rows: {
                            path: "/tests"
                        },
                        footer: ""
                    })
                ]
            })
        ]
    }).placeAt("content");
    return Promise.resolve();
}
function progress(state) {
    if (oTable) {
        oTable.setFooter("Refresh: checking " + state + "...");
    }
}
const SCHEMA_VERSION = "0.0.3";
const store = new Storage(Storage.Type.local, "sap-ui-find-tests");
function restoreData(entryPage) {
    const data = store.get("data");
    if (data && data.entryPage === entryPage && data._$schemaVersion === SCHEMA_VERSION) {
        oModel.setData(data);
        return true;
    }
    return false;
}
function saveData() {
    store.put("data", oModel.oData);
}
function cleanURL(urlStr) {
    if (urlStr == null) {
        return urlStr;
    }
    const url = new URL(urlStr, document.baseURI);
    if (url.origin === window.location.origin) {
        return url.href;
    }
    return undefined;
}
includeStylesheet(require.toUrl("./main.css"));
const url = new URL(window.location.href);
const uiCreated = new Promise((resolve, reject) => {
    sap.ui.getCore().attachInit(() => {
        const showSuite = url.searchParams.has("showSuite");
        createUI(showSuite).then(resolve, reject);
    });
});
uiCreated.then(() => {
    const search = sap.ui.getCore().byId("search");
    search.setValue(cleanURL(url.searchParams.get("testpage")) || "");
    const entryPage = cleanURL(url.searchParams.get("root")) || _utils.getAttribute("data-sap-ui-root-testsuite") || "test-resources/qunit/testsuite.qunit.html";
    if (restoreData(entryPage)) {
        sap.ui.getCore().byId("app").setBusy(false);
    }
    discovery.findTests(entryPage, progress).then((aTests) => {
        sap.ui.getCore().byId("app").setBusy(false);
        oTable.setFooter("Refresh: done.");
        const aTestPageUrls = [];
        aTests = aTests.filter((e, i, a) => {
            return aTestPageUrls.indexOf(e.fullpage) === -1 && aTestPageUrls.push(e.fullpage) > 0;
        }).sort((t1, t2) => compare(t1.fullpage, t2.fullpage));
        oModel.setData({
            _$schemaVersion: SCHEMA_VERSION,
            entryPage,
            timeOfLastUpdate: Date.now(),
            tests: aTests,
            testCount: aTests.length,
            filteredTestCount: aTests.length
        });
        saveData();
        setTimeout(function () {
            oTable.setFooter("");
        }, 5000);
    });
});