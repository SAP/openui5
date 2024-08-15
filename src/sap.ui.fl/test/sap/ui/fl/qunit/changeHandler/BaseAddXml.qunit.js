/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/m/Button",
	"sap/m/HBox",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/changeHandler/BaseAddXml",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/util/XMLHelper",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	Button,
	HBox,
	JsControlTreeModifier,
	XmlTreeModifier,
	Component,
	FlexObjectFactory,
	BaseAddXml,
	nextUIUpdate,
	XMLHelper,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	const mPreloadedModules = {};

	const sFragmentPath = "sap/ui/fl/qunit/changeHander/BaseAddXml/changes/fragments/Fragment.fragment.xml";
	mPreloadedModules[sFragmentPath] = `<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core"><Button xmlns="sap.m" id="button" text="Hello World"></Button></core:FragmentDefinition>`;
	const sFragmentInvalidTypePath = "sap/ui/fl/qunit/changeHander/BaseAddXml/changes/fragments/FragmentInvalidType.fragment.xml";
	mPreloadedModules[sFragmentInvalidTypePath] = '<ManagedObject xmlns="sap.ui.base" id="managedObject"></ManagedObject>';
	const sFragmentMultiplePath = "sap/ui/fl/qunit/changeHander/BaseAddXml/changes/fragments/FragmentMultiple.fragment.xml";
	mPreloadedModules[sFragmentMultiplePath] = '<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">' +
		'<Button xmlns="sap.m" id="button1" text="Hello World"></Button>' +
		'<Button xmlns="sap.m" id="button2" text="Hello World"></Button>' +
		'<Button xmlns="sap.m" id="button3" text="Hello World"></Button>' +
		"</core:FragmentDefinition>";
	const sFragmentMultipleInvalidTypesPath = `sap/ui/fl/qunit/changeHander/BaseAddXml/changes/fragments/FragmentMultipleInvalidTypes.fragment.xml`;
	mPreloadedModules[sFragmentMultipleInvalidTypesPath] = `<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core" xmlns:base="sap.ui.base">` +
		'<Button xmlns="sap.m" id="button" text="Hello World"></Button>' +
		'<Button xmlns="sap.m" id="button2" text="Hello World"></Button>' +
		'<base:ManagedObject id="managedObject"></base:ManagedObject>' +
		"</core:FragmentDefinition>";
	const sFragmentInvalidPath = "sap/ui/fl/qunit/changeHander/BaseAddXml/changes/fragments/FragmentInvalid.fragment.xml";
	mPreloadedModules[sFragmentInvalidPath] = "invalidFragment";
	const sNonExistingPath = "sap/ui/fl/qunit/changeHander/BaseAddXml/changes/fragments/NonExisting";

	sap.ui.require.preload(mPreloadedModules);

	const sTypeError = "The content of the xml fragment does not match the type of the targetAggregation: ";
	const sWrongAggregationError = "The given Aggregation is not available in the given control: hbox";

	// the completeChangeContent function ignores the fragment property, but in applyChange we still need the information.
	// that's why we need to patch it in there before a change is applied.
	// in the code this is done in the command.

	QUnit.module("Given a BaseAddXml Change Handler", {
		beforeEach() {
			this.oChangeHandler = BaseAddXml;
			this.oHBox = new HBox("hbox", {
				items: [this.oButton]
			});

			const oChangeJson = {
				reference: "sap.ui.fl.qunit.changeHander.BaseAddXml",
				selector: {
					id: this.oHBox.getId(),
					type: "sap.m.HBox"
				},
				changeType: "addXML",
				fileName: "addXMLChange",
				projectId: "projectId"
			};

			this.oChangeSpecificContent = {
				fragmentPath: "fragments/Fragment.fragment.xml",
				targetAggregation: "items",
				index: 1
			};

			this.oChange = FlexObjectFactory.createFromFileContent(oChangeJson);
		},
		afterEach() {
			this.oHBox.destroy();
		}
	}, function() {
		QUnit.test("When calling 'completeChangeContent' with complete information", function(assert) {
			const oExpectedChangeContent = {
				fragmentPath: "fragments/Fragment.fragment.xml"
			};

			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent, this.oChange.getContent());
			assert.deepEqual(
				this.oChange.getContent(),
				oExpectedChangeContent,
				"then the change specific content is in the change, but the fragment not"
			);
			assert.equal(
				this.oChange.getFlexObjectMetadata().moduleName,
				"sap/ui/fl/qunit/changeHander/BaseAddXml/changes/fragments/Fragment.fragment.xml",
				"and the module name is set correct in change"
			);
		});

		QUnit.test("When calling 'completeChangeContent' without complete information", function(assert) {
			this.oChangeSpecificContent.fragmentPath = null;
			assert.throws(
				() => {this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent, this.oChange.getContent());},
				Error("Attribute missing from the change specific content 'fragmentPath'"),
				"without fragmentPath 'completeChangeContent' throws an error"
			);
		});
	});

	QUnit.module("Given a BaseAddXml Change Handler with JSTreeModifier", {
		async beforeEach() {
			// general modifier beforeEach (can be extracted as soon as nested modules are supported)
			this.oChangeHandler = BaseAddXml;

			this.sHBoxId = "hbox";

			this.oChangeJson = {
				moduleName: sFragmentPath,
				selector: {
					id: this.sHBoxId,
					type: "sap.m.HBox"
				},
				reference: "sap.ui.fl.qunit.changeHander.BaseAddXml",
				changeType: "addXML",
				fileName: "addXMLChange",
				projectId: "projectId"
			};

			this.oChangeSpecificContent = {
				fragmentPath: "fragments/Fragment.fragment.xml",
				targetAggregation: "items",
				index: 1
			};
			this.mChangeInfo = {
				aggregationName: this.oChangeSpecificContent.targetAggregation,
				index: this.oChangeSpecificContent.index
			};

			this.oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent, this.oChange.getContent());

			// JSTreeModifier specific beforeEach
			this.oButton = new Button();
			this.oHBox = new HBox(this.sHBoxId, {
				items: [this.oButton]
			});
			this.sAggregationType = this.oHBox.getMetadata().getAggregation("items").type;
			this.oHBox.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oPropertyBag = {
				modifier: JsControlTreeModifier, view: {
					getController() {
					}, getId() {
					}
				}
			};
		},
		afterEach() {
			this.oHBox.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When applying the change on a js control tree", function(assert) {
			const mRevertData = {
				id: "projectId.button",
				aggregationName: "items"
			};
			return this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.then(function() {
				assert.equal(this.oHBox.getItems().length, 2, "after the change there are 2 items in the hbox");
				assert.equal(this.oHBox.getItems()[1].getId(), "projectId.button", "the fragments control id is prefixed with project id");
				assert.deepEqual(this.oChange.getRevertData(), [mRevertData], "then the revert data is build properly");
			}.bind(this));
		});

		QUnit.test("When applying the change on a js control tree with an invalid targetAggregation", function(assert) {
			sandbox.stub(Log, "error");
			this.mChangeInfo.aggregationName = "invalidAggregation";
			return this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.catch(function(oError) {
				assert.equal(oError.message, sWrongAggregationError, "then apply change throws an error");
			});
		});

		QUnit.test("When applying the change on a js control tree with multiple root elements and one invalid type inside", function(assert) {
			sandbox.stub(Log, "error");
			this.oChangeJson.moduleName = sFragmentMultipleInvalidTypesPath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			return this.oChangeHandler.applyChange(oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.catch(function(oError) {
				assert.equal(oError.message,
					`${sTypeError}${this.sAggregationType}`,
					"then apply change throws an error");
				assert.equal(this.oHBox.getItems().length, 1, "after the change there is still only 1 item in the hbox");
			}.bind(this));
		});

		QUnit.test("When reverting the change on a js control tree", function(assert) {
			return this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.then(this.oChangeHandler.revertChange.bind(this.oChangeHandler, this.oChange, this.oHBox, this.oPropertyBag))
			.then(function() {
				assert.equal(this.oHBox.getItems().length, 1, "after reversal there is again only one child of the HBox");
				assert.equal(this.oChange.getRevertData(), undefined, "and the revert data got reset");
			}.bind(this));
		});

		QUnit.test("When reverting the change on a js control tree with multiple root elements", function(assert) {
			this.oChangeJson.moduleName = sFragmentMultiplePath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			return this.oChangeHandler.applyChange(oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.then(this.oChangeHandler.revertChange.bind(this.oChangeHandler, oChange, this.oHBox, this.oPropertyBag))
			.then(function() {
				assert.equal(this.oHBox.getItems().length, 1, "after reversal there is again only one child of the HBox");
				assert.equal(this.oChange.getRevertData(), undefined, "and the revert data got reset");
			}.bind(this));
		});

		QUnit.test("When reverting a change that failed on a js control tree with multiple root elements", function(assert) {
			sandbox.stub(Log, "error");
			this.oChangeJson.moduleName = sFragmentMultipleInvalidTypesPath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			return this.oChangeHandler.applyChange(oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.catch(function(oError) {
				assert.equal(oError.message,
					`${sTypeError}${this.sAggregationType}`,
					"then apply change throws an error");
				assert.equal(this.oHBox.getItems().length, 1, "after the change there is still only 1 item in the hbox");
				return this.oChangeHandler.revertChange(oChange, this.oHBox, this.oPropertyBag);
			}.bind(this))
			.then(function() {
				assert.equal(this.oHBox.getItems().length, 1, "after reversal there is again only one child of the HBox");
			}.bind(this));
		});
	});

	QUnit.module("Given a BaseAddXml Change Handler with XMLTreeModifier", {
		beforeEach() {
			// general modifier beforeEach (can be extracted as soon as nested modules are supported)
			this.oChangeHandler = BaseAddXml;

			this.sHBoxId = "hbox";

			this.oChangeJson = {
				moduleName: sFragmentPath,
				selector: {
					id: this.sHBoxId,
					type: "sap.m.HBox"
				},
				reference: "sap.ui.fl.qunit.changeHander.BaseAddXml",
				changeType: "addXML",
				fileName: "addXMLChange",
				projectId: "projectId"
			};

			this.oChangeSpecificContent = {
				fragmentPath: "fragments/Fragment.fragment.xml",
				targetAggregation: "items",
				index: 1
			};
			this.mChangeInfo = {
				aggregationName: this.oChangeSpecificContent.targetAggregation,
				index: this.oChangeSpecificContent.index
			};

			this.oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent, this.oChange.getContent());

			// XMLTreeModifier specific beforeEach
			return Component.create({
				name: "testComponentAsync",
				id: "testComponentAsync",
				metadata: {
					manifest: "json"
				}
			}).then(function(oComponent) {
				this.oComponent = oComponent;
				this.oXmlString =
					`<mvc:View id="testComponentAsync---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">` +
						`<HBox id="${this.sHBoxId}">` +
							`<tooltip>` +	// 0..1 aggregation
								`<TooltipBase xmlns="sap.ui.core"></TooltipBase>` + // inline namespace as sap.ui.core is use case for not existing namespace
							`</tooltip>` +
							`<items>` +
								`<Button id="button123"></Button>` + // content in default aggregation
							`</items>` +
						`</HBox>` +
					`</mvc:View>`;
				this.oXmlView = XMLHelper.parse(this.oXmlString, "application/xml").documentElement;
				[this.oHBox] = this.oXmlView.childNodes;
				this.sAggregationType = "sap.ui.core.Control";

				this.oPropertyBag = {
					modifier: XmlTreeModifier,
					view: this.oXmlView,
					appComponent: this.oComponent
				};
			}.bind(this));
		},
		afterEach() {
			this.oComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When applying the change on a xml control tree", function(assert) {
			const oInsertAggregationSpy = sandbox.spy(XmlTreeModifier, "insertAggregation");
			const oHBoxItems = this.oHBox.childNodes[1];
			const mRevertData = {
				id: "projectId.button",
				aggregationName: "items"
			};
			return this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.then(function() {
				assert.notOk(oInsertAggregationSpy.args[0][5], "insertAggregation is called with falsy bSkipAdjustIndex");
				assert.equal(oHBoxItems.childNodes.length, 2, "after the BaseAddXml there are two children of the HBox");
				assert.deepEqual(this.oChange.getRevertData(), [mRevertData], "then the revert data is build properly");
			}.bind(this));
		});

		QUnit.test("When applying the change on a xml control tree with an invalid targetAggregation", function(assert) {
			sandbox.stub(Log, "error");
			this.mChangeInfo.aggregationName = "invalidAggregation";

			return this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.catch(function(oError) {
				assert.equal(oError.message,
					sWrongAggregationError,
					"then apply change throws an error");
			});
		});

		QUnit.test("When applying the change on a xml control tree with an invalid type", function(assert) {
			sandbox.stub(Log, "error");
			this.oChangeJson.moduleName = sFragmentInvalidTypePath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			return this.oChangeHandler.applyChange(oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.catch(function(oError) {
				assert.equal(oError.message,
					`${sTypeError}${this.sAggregationType}`,
					"then apply change throws an error");
			}.bind(this));
		});

		QUnit.test("When reverting the change on an xml control tree", function(assert) {
			const oHBoxItems = this.oHBox.childNodes[1];

			return this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.then(this.oChangeHandler.revertChange.bind(this.oChangeHandler, this.oChange, this.oHBox, this.oPropertyBag))
			.then(function() {
				assert.equal(oHBoxItems.childNodes.length, 1, "after reversal there is again only one child of the HBox");
				assert.equal(this.oChange.getRevertData(), undefined, "and the revert data got reset");
			}.bind(this));
		});

		QUnit.test("When applying the change on a xml control tree with multiple root elements", function(assert) {
			this.oChangeJson.moduleName = sFragmentMultiplePath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			return this.oChangeHandler.applyChange(oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.then(function() {
				const oHBoxItems = this.oHBox.childNodes[1];
				assert.equal(oHBoxItems.childNodes.length, 4, "after the change there are 4 items in the hbox");
				assert.equal(
					oHBoxItems.childNodes[1].getAttribute("id"),
					"projectId.button1",
					"then the first button in the fragment has the correct index and ID"
				);
				assert.equal(
					oHBoxItems.childNodes[2].getAttribute("id"),
					"projectId.button2",
					"then the second button in the fragment has the correct index and ID"
				);
				assert.equal(
					oHBoxItems.childNodes[3].getAttribute("id"),
					"projectId.button3",
					"then the third button in the fragment has the correct index and ID"
				);
			}.bind(this));
		});

		QUnit.test("When applying the change on a xml control tree with multiple root elements and one invalid type inside", function(assert) {
			sandbox.stub(Log, "error");
			this.oChangeJson.moduleName = sFragmentMultipleInvalidTypesPath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			return this.oChangeHandler.applyChange(oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.catch(function(oError) {
				assert.equal(oError.message, `${sTypeError}${this.sAggregationType}`, "then apply change throws an error");
				const oHBoxItems = this.oHBox.childNodes[1];
				assert.equal(oHBoxItems.childNodes.length, 1, "after the change there is still only 1 item in the hbox");
			}.bind(this));
		});

		QUnit.test("When reverting the change on an xml control tree with multiple root elements", function(assert) {
			this.oChangeJson.moduleName = sFragmentMultiplePath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			return this.oChangeHandler.applyChange(oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.then(this.oChangeHandler.revertChange.bind(this.oChangeHandler, oChange, this.oHBox, this.oPropertyBag))
			.then(function() {
				const oHBoxItems = this.oHBox.childNodes[1];
				assert.equal(oHBoxItems.childNodes.length, 1, "after reversal there is again only one child of the HBox");
				assert.equal(oChange.getRevertData(), undefined, "and the revert data got reset");
			}.bind(this));
		});

		QUnit.test("When reverting a failed change on an xml control tree with multiple root elements", function(assert) {
			sandbox.stub(Log, "error");
			this.oChangeJson.moduleName = sFragmentMultipleInvalidTypesPath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			return this.oChangeHandler.applyChange(oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.catch(function(oError) {
				assert.equal(oError.message, `${sTypeError}${this.sAggregationType}`, "then apply change throws an error");
				return this.oChangeHandler.revertChange(this.oChange, this.oHBox, this.oPropertyBag);
			}.bind(this))
			.then(function() {
				const oHBoxItems = this.oHBox.childNodes[1];
				assert.equal(oHBoxItems.childNodes.length, 1, "after reversal there is again only one child of the HBox");
			}.bind(this));
		});

		QUnit.test("When applying the change with a not found module", function(assert) {
			this.oChangeJson.moduleName = sNonExistingPath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			return this.oChangeHandler.applyChange(oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.catch(function(oError) {
				const sErrorMessage = "resource sap/ui/fl/qunit/changeHander/BaseAddXml/" +
						"changes/fragments/NonExisting could not be loaded from";
				assert.ok(oError.message.indexOf(sErrorMessage) === 0, "then apply change throws an error");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
