sap.ui.define(function () {
	"use strict";

	return {
		name : "TestSuite for sap.ui.core.fieldhelp: GTP testcase CORE/FIELDHELP",
		defaults : {
			group : "Models",
			qunit : {
				versions : {
					"2.18" : {
						module : "test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18",
						css : "test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18.css"
					}
				},
				version : "2.18"
			},
			sinon : {
				versions : {
					"14.0" : {
						module : "test-resources/sap/ui/core/qunit/thirdparty/sinon-14.0",
						bridge : "sap/ui/qunit/sinon-qunit-bridge"
					}
				},
				version : "14.0",
				qunitBridge : true,
				useFakeTimer : false
			},
			ui5 : {
				language : "en-US",
				rtl : false,
				libs : [],
				"xx-waitForTheme" : "init"
			},
			coverage : {
				only : "[sap/ui/core/fieldhelp]",
				branchTracking : true
			},
			loader : {
				paths : {
					"sap/ui/core/qunit" : "test-resources/sap/ui/core/qunit"
				}
			},
			autostart : true
		},
		tests : {
			FieldHelp : {},
			FieldHelpUtil : {}
		}
	};
});
