sap.ui.define(() => {
    "use strict";

    return {
        name: "Test suite for Illustration Explorer",
        defaults: {
            page: "ui5://test-resources/sap/ui/demo/illustrationExplorer/Test.qunit.html?testsuite={suite}&test={name}",
            qunit: {
                version: 2
            },
            sinon: {
                version: 1
            },
            ui5: {
                theme: "sap_horizon"
            },
            loader: {
                paths: {
                    "sap/ui/demo/illustrationExplorer": "../"
                }
            }
        },
        tests: {
            "integration/opaTests": {
                title: "Integration tests for Illustration Explorer"
            }
        }
    };
});