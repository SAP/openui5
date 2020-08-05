sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/mdc/integrations/pages/CommonActions",
	"sap/ui/mdc/integrations/pages/CommonAssertions",
	"sap/ui/mdc/integrations/pages/table/TableActions",
	"sap/ui/mdc/integrations/pages/table/TableAssertions",
	"sap/ui/mdc/integrations/pages/Common"
], function (Opa5, CommonActions, CommonAssertions, TableActions, TableAssertions, Common) {

	"use strict";

	Opa5.createPageObjects({
		onTheCommonPage: {
			baseClass: Common,
			actions: CommonActions(),
			assertions: CommonAssertions()
		}
	});
	Opa5.createPageObjects({
		onTheTablePage: {
			baseClass: Common,
			actions: TableActions(),
			assertions: TableAssertions()
		}
	});
});
