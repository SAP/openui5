/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(
    [
        "sap/ui/core/Core",
        "sap/ui/demo/bulletinboard/test/integration/AllJourneys"
    ],
    async function (Core, ComponentContainer) {
        "use strict";

		await Core.ready();

        QUnit.start();
    }
);
