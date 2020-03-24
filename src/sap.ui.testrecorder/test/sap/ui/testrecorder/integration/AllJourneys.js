sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/testrecorder/integration/pages/Common",
	"sap/ui/testrecorder/integration/journeys/TreeInspectionJourney",
	"sap/ui/testrecorder/integration/journeys/AppInspectionJourney"
], function (Opa5, Common) {
	"use strict";

	Opa5.extendConfig({
		autoWait: true,
		arrangements: new Common()
	});
});
