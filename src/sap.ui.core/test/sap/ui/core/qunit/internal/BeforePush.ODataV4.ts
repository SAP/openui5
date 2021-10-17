import oFeatureSuite from "sap/ui/core/qunit/internal/testsuite.feature-odata-v4.qunit";
import oODataSuite from "sap/ui/core/qunit/odata/v4/testsuite.odatav4.qunit";
export class mTests {
}
function addOPATests(oSuite) {
    Object.keys(oSuite.tests).forEach(function (sTest) {
        if (sTest.startsWith("OPA.")) {
            var sFile = oSuite.tests[sTest].module[0].replace("sap/ui/core/", "demokit/") + ".html";
            mTests[sFile + "?supportAssistant=true"] = "both";
            if (oSuite.tests[sTest].realOData !== false) {
                mTests[sFile + "?realOData=true"] = "both";
            }
        }
    });
}
addOPATests(oODataSuite);
addOPATests(oFeatureSuite);