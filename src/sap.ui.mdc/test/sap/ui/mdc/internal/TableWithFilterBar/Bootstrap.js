sap.ui.define(["test-resources/sap/ui/mdc/qunit/util/V4ServerHelper"], function (V4ServerHelper) {

	"use strict";

	(async () => {
		const oUriParams = new URLSearchParams(window.location.search);

		if (oUriParams.get("service") === "tenant") {
			const sTenantId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
			const sTenantBaseUrl = await V4ServerHelper.requestServerURLForTenant(sTenantId, true);
			self['sap-ui-mdc-config'] = {tenantBaseUrl: sTenantBaseUrl};
		}
		sap.ui.require(["sap/ui/core/ComponentSupport"]);
	})();
});