/*!
 * ${copyright}
 */
/* global QUnit*/
(function() {
    "use strict";

    // we want to be able to load our tests asynchronously - pause QUnit until we loaded everything
    QUnit.config.autostart = false;

    sap.ui.require(["sap/ui/core/Core"], function(Core) {

        window['sap-ui-documentation-static'] = true;
        //We preset the path to api-index.json file to be the local mock folder
        window['sap-ui-documentation-config'] = {
            apiInfoRootURL: 'test-resources/sap/ui/documentation/sdk/integration/mock/docs/api/api-index.json'
        };
        Core.ready(function () {

            sap.ui.require([
                "sap/ui/documentation/sdk/test/configureOpa",
                "sap/ui/documentation/sdk/test/AllJourneys",
                "sap/ui/documentation/sdk/test/DownloadJourney"
            ], function () {
                // configuration has been applied and the tests in the journeys have been loaded - start QUnit
                QUnit.start();
            });
        });
    });
})();
