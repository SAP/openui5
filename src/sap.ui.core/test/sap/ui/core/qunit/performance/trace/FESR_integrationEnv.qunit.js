/* global QUnit, sinon */
QUnit.config.autostart = false;

globalThis.fnInit = () => {
	"use strict";

	sap.ui.require([
		"sap/ui/Device",
		"sap/ui/performance/trace/Interaction"
	], function (
		Device,
		Interaction
	) {

		let requestCounter = 0;

		QUnit.module("FESR", {
			dummyRequest: function(bUseUrlObject) {
				var xhr = new XMLHttpRequest();
				const sUrl = "resources/ui5loader.js?noCache=" + Date.now() + "-" + (++requestCounter);
				xhr.open("GET", bUseUrlObject ?  new URL(sUrl, document.location.origin) : sUrl, false);
				xhr.send();
				return xhr;
			}
		});

		QUnit.test("Scenario for Integration Environment", function (assert) {
			const sIntegrationEnv = new URLSearchParams(globalThis.location.search).get("sap-ui-fesr-env"),
				oSinonSandbox = sinon.createSandbox(),
				oHeaderSpy = oSinonSandbox.spy(XMLHttpRequest.prototype, "setRequestHeader");

			let aValues;

			// create new interaction
			Interaction.start("new_interaction");

			// trigger at least one request for header creation
			const oXhrHandle = this.dummyRequest();

			// first interaction ends with end
			Interaction.end(true);
			oXhrHandle.abort();

			// trigger another request to send FESR using URL object to ensure isCORSRequest can handle URL objects as well
			this.dummyRequest(/* bUseUrlObject */ true);

			assert.ok(oHeaderSpy.args.some((args) => {
				if (args[0] === "SAP-Perf-FESRec-opt") {
					aValues = args[1].split(",");
					// Integration environment
					return aValues[3] === `${Device.browser.reportingName}_${Device.browser.version}${sIntegrationEnv ? ":" + sIntegrationEnv : ""}`.substring(0, 20);
				}
				return false;
			}), `Found the FESR header field value and the integration environemnt is ${aValues[3]}.`);

			oSinonSandbox.restore();
		});

		QUnit.start();
	});
};
