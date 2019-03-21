/*global QUnit*/
var iOriginalMaxDepth = QUnit.dump.maxDepth;
QUnit.dump.maxDepth = 10;

sap.ui.define([
		"sap/ui/thirdparty/sinon-4",
		"sap/ui/fl/designtime/appVariant/ModuleModifier"
	],
	function (sinon, ModuleModifier) {
		"use strict";

		var sandbox = sinon.sandbox.create();

		QUnit.module("file filtering", {
			before: function () {
				this.oldReference = "old.reference";
				this.sCodeExt = "sap.ui.define([\n" +
					"        'old/reference'\n" +
					"        'sap/ui/core/mvc/ControllerExtension'\n" +
					"    ],\n" +
					"    function (\n" +
					"        ControllerExtension\n" +
					"    ) {\n" +
					"        \"use strict\";\n" +
					"        return ControllerExtension.extend(\"" + this.oldReference + "\", {\n" +
					"\n" +
					"        });\n" +
					"    });";
				this.sFragment = "<!-- Use stable and unique id's!-->\n" +
					"<core:FragmentDefinition xmlns:core='sap.ui.core' xmlns='sap.m'>\n" +
					"\t<Button id='text1' text='B1' press=\"" + this.oldReference + ".myController.onButtonPress" + "\" />\n" +
					"</core:FragmentDefinition>";
			},
			afterEach: function () {
				sandbox.restore();
			}
		}, function() {
			QUnit.test("does modify module files in the '/changes/coding/ and /changes/fragments/' folder", function (assert) {
				this.oChange = {
					"fileName": "change12",
					"fileType": "change",
					"changeType": "codeExt",
					"moduleName": "",
					"reference": "oldReference"
				};

				var aFiles = [{
					fileName: "/changes/coding/x11.js",
					content: this.sCodeExt
				},{
					fileName: "/changes/coding/x12.js",
					content: this.sCodeExt
				},{
					fileName: "/descriptorChanges/id_1550588173383_11_setTitle.change",
					content: "{}"
				},{
					fileName: "/changes/id_1550588173383_10_changeLabel.change",
					content: JSON.stringify(this.oChange)
				},{
					fileName: "/changes/id_1550588173383_11_changeLabel.change",
					content: JSON.stringify(this.oChange)
				}, {
					fileName: "/changes/coding/subfolder/x11.js",
					content: this.sCodeExt
				},{
					fileName: "/changes/fragments/my.fragment.xml",
					content: this.sFragment
				}
				];

				var modifyModuleFileStub = sandbox.stub(ModuleModifier, "_modifyModuleFile");

				ModuleModifier.modify("newReference", aFiles);
				assert.equal(modifyModuleFileStub.callCount, 3, "three files were modified");

			});

			QUnit.test("does nothing when no files are present'", function (assert) {

				var aFiles = [];

				var modifyModuleFileStub = sandbox.stub(ModuleModifier, "_modifyModuleFile");

				ModuleModifier.modify("newReference", aFiles);

				assert.equal(modifyModuleFileStub.callCount, 0, "no file was modified");
			});
		});

		QUnit.module("file modification", {
			beforeEach: function () {
				this.newReference = "new.reference";
				this.oldReference = "old.reference";

				this.sCodeExt = "sap.ui.define([\n" +
					"        'old/reference'\n" +
					"        'sap/ui/core/mvc/ControllerExtension'\n" +
					"    ],\n" +
					"    function (\n" +
					"        ControllerExtension\n" +
					"    ) {\n" +
					"        \"use strict\";\n" +
					"        return ControllerExtension.extend(\"" + this.oldReference + "\", {\n" +
					"\n" +
					"        });\n" +
					"    });";

				this.sExpectedCodeExt = "sap.ui.define([\n" +
					"        \'" + this.newReference + "\'\n" +
					"        'sap/ui/core/mvc/ControllerExtension'\n" +
					"    ],\n" +
					"    function (\n" +
					"        ControllerExtension\n" +
					"    ) {\n" +
					"        \"use strict\";\n" +
					"        return ControllerExtension.extend(\"" + this.newReference + "\", {\n" +
					"\n" +
					"        });\n" +
					"    });";

				this.sFragment = "<!-- Use stable and unique id's!-->\n" +
					"<core:FragmentDefinition xmlns:core='sap.ui.core' xmlns='sap.m'>\n" +
					"\t<Button id='text1' text='B1' press=\"" + this.oldReference + ".myController.onButtonPress" + "\" />\n" +
					"\t<Button id='text2' text='B1' press=\"" + this.oldReference + ".myController.onButtonPress" + "\" />\n" +
					"</core:FragmentDefinition>";

				this.sExpectedFragment = "<!-- Use stable and unique id's!-->\n" +
					"<core:FragmentDefinition xmlns:core='sap.ui.core' xmlns='sap.m'>\n" +
					"\t<Button id='text1' text='B1' press=\"" + this.newReference + ".myController.onButtonPress" + "\" />\n" +
					"\t<Button id='text2' text='B1' press=\"" + this.newReference + ".myController.onButtonPress" + "\" />\n" +
					"</core:FragmentDefinition>";
			},
			afterEach: function () {
				sandbox.restore();
			}
		}, function() {
			QUnit.test("does modify a single fragment correctly", function (assert) {
				var sModifiedModuleFileContent = ModuleModifier._modifyModuleFile(this.sFragment, this.oldReference, this.newReference);

				assert.equal(sModifiedModuleFileContent, this.sExpectedFragment, "reference got replaced correctly");
			});
			QUnit.test("does modify a single codeExt correctly", function (assert) {
				var sModifiedModuleFileContent = ModuleModifier._modifyModuleFile(this.sCodeExt, this.oldReference, this.newReference);

				assert.equal(sModifiedModuleFileContent, this.sExpectedCodeExt, "reference got replaced correctly");
			});
			QUnit.test("does nothing and return the original content", function (assert) {
				var sModuleFileContent = "Any String";
				var sModifiedModukeFileContent = ModuleModifier._modifyModuleFile(sModuleFileContent, this.oldReference, this.newReference);

				assert.equal(sModifiedModukeFileContent, sModuleFileContent, "sModuleFileContent is unchanged");
			});
		});

		QUnit.done(function() {
			jQuery("#qunit-fixture").hide();
			QUnit.dump.maxDepth = iOriginalMaxDepth;
		});
	});