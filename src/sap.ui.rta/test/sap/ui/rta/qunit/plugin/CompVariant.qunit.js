/* global QUnit */

sap.ui.define([
	"sap/ui/comp/smartvariants/SmartVariantManagement",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/events/KeyCodes",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/CompVariant",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	SmartVariantManagement,
	DesignTime,
	OverlayRegistry,
	KeyCodes,
	CommandFactory,
	CompVariant,
	Utils,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function waitForCommandToBeCreated(oPlugin) {
		return new Promise(function(resolve) {
			oPlugin.attachEventOnce("elementModified", function(oEvent) {
				resolve(oEvent.getParameters());
			});
		});
	}

	function getContextMenuEntryById(sId) {
		var aMenuItems = this.oPlugin.getMenuItems([this.oVariantManagementOverlay]);
		var oReturn;
		aMenuItems.some(function(oMenuItem) {
			if (oMenuItem.id === sId) {
				oReturn = oMenuItem;
				return true;
			}
		});
		return oReturn;
	}

	function setTextAndTriggerEnterOnEditableField(oPlugin, sText) {
		oPlugin._$oEditableControlDomRef.text(sText);
		oPlugin._$editableField.text(oPlugin._$oEditableControlDomRef.text());
		var oEvent = new Event("keydown");
		oEvent.keyCode = KeyCodes.ENTER;
		oPlugin._$editableField.get(0).dispatchEvent(oEvent);
	}

	QUnit.module("Given a designTime and ControlVariant plugin are instantiated", {
		beforeEach: function(assert) {
			var done = assert.async();
			this.oPlugin = new CompVariant({
				commandFactory: new CommandFactory()
			});
			this.oVariantManagementControl = new SmartVariantManagement("svm", {
				persistencyKey: "myPersistencyKey"
			});
			this.oVariantManagementControl.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVariantManagementControl],
				plugins: [this.oPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oVariantManagementOverlay = OverlayRegistry.getOverlay(this.oVariantManagementControl);
				done();
			}.bind(this));
			this.oGetAllVariantsStub = sandbox.stub(this.oVariantManagementControl, "getAllVariants").returns([]);
		},
		afterEach: function() {
			sandbox.restore();
			this.oPlugin.destroy();
			this.oVariantManagementControl.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("getMenuItems - readyOnly Variant", function(assert) {
			sandbox.stub(this.oVariantManagementControl, "isSpecialVariant").returns(true);

			var aMenuItems = this.oPlugin.getMenuItems([this.oVariantManagementOverlay]);
			assert.equal(aMenuItems.length, 3, "three context menu items are visible for readyOnly");
			assert.equal(aMenuItems[0].id, "CTX_COMP_VARIANT_SAVE_AS", "Save As is first");
			assert.equal(aMenuItems[1].id, "CTX_COMP_VARIANT_MANAGE", "Manage is second");
			assert.equal(aMenuItems[2].id, "CTX_COMP_VARIANT_SWITCH", "Switch is third");
		});

		QUnit.test("getMenuItems - not readOnly Variant", function(assert) {
			sandbox.stub(this.oVariantManagementControl, "isSpecialVariant").returns(false);

			var aMenuItems = this.oPlugin.getMenuItems([this.oVariantManagementOverlay]);
			assert.equal(aMenuItems.length, 5, "five context menu items are visible for readyOnly");
			assert.equal(aMenuItems[0].id, "CTX_COMP_VARIANT_RENAME", "Rename is first");
			assert.equal(aMenuItems[1].id, "CTX_COMP_VARIANT_SAVE", "Save is second");
			assert.equal(aMenuItems[2].id, "CTX_COMP_VARIANT_SAVE_AS", "Save As is third");
			assert.equal(aMenuItems[3].id, "CTX_COMP_VARIANT_MANAGE", "Manage is fourth");
			assert.equal(aMenuItems[4].id, "CTX_COMP_VARIANT_SWITCH", "Switch is fifth");
		});

		QUnit.test("Rename", function(assert) {
			var sNewText = "myFancyText";
			sandbox.stub(this.oVariantManagementControl, "getPresentVariantId").returns("myVariantId");
			var oResult = waitForCommandToBeCreated(this.oPlugin).then(function(oParameters) {
				var oCommand = oParameters.command;
				var mExpectedNewVariantProps = {
					myVariantId: {
						name: sNewText
					}
				};
				assert.deepEqual(oCommand.getNewVariantProperties(), mExpectedNewVariantProps, "the property newVariantProperties was set correctly");
			});

			var oMenuItem = getContextMenuEntryById.call(this, "CTX_COMP_VARIANT_RENAME");
			oMenuItem.handler([this.oVariantManagementOverlay]);
			setTextAndTriggerEnterOnEditableField(this.oPlugin, sNewText);
			return oResult;
		});

		QUnit.test("Save with not modified variant", function(assert) {
			sandbox.stub(this.oVariantManagementControl, "currentVariantGetModified").returns(false);
			var oMenuItem = getContextMenuEntryById.call(this, "CTX_COMP_VARIANT_SAVE");
			assert.equal(oMenuItem.enabled([this.oVariantManagementOverlay]), false, "the save is not enabled");
		});

		QUnit.test("Save with modified variant", function(assert) {
			var oContent = {foo: "bar"};
			var sVariantId = "myVariantId";
			sandbox.stub(this.oVariantManagementControl, "currentVariantGetModified").returns(true);
			sandbox.stub(this.oVariantManagementControl, "getPresentVariantContent").resolves(oContent);
			sandbox.stub(this.oVariantManagementControl, "getPresentVariantId").returns(sVariantId);

			var oMenuItem = getContextMenuEntryById.call(this, "CTX_COMP_VARIANT_SAVE");
			assert.equal(oMenuItem.enabled([this.oVariantManagementOverlay]), true, "the save is enabled");

			var oResult = waitForCommandToBeCreated(this.oPlugin).then(function(oParameters) {
				var mExpectedProperties = {};
				mExpectedProperties[sVariantId] = {
					content: oContent
				};
				var oCommand = oParameters.command;
				assert.equal(oCommand.getOnlySave(), true, "the saveOnly property is set");
				assert.deepEqual(oCommand.getNewVariantProperties(), mExpectedProperties, "the newVariantProperties property is set");
			});

			oMenuItem.handler([this.oVariantManagementOverlay]);
			return oResult;
		});

		QUnit.test("Switch with only standard", function(assert) {
			var aVariants = [{
				getId: function() {
					return "";
				},
				getText: function() {
					return "";
				}
			}];
			this.oGetAllVariantsStub.returns(aVariants);

			var oMenuItem = getContextMenuEntryById.call(this, "CTX_COMP_VARIANT_SWITCH");
			assert.equal(oMenuItem.enabled([this.oVariantManagementOverlay]), false, "the save is not enabled");
		});

		QUnit.test("Switch with multiple variants", function(assert) {
			var aVariants = [
				{
					getId: function() {
						return "id1";
					},
					getText: function() {
						return "text1";
					}
				},
				{
					getId: function() {
						return "id2";
					},
					getText: function() {
						return "text2";
					}
				},
				{
					getId: function() {
						return "id3";
					},
					getText: function() {
						return "text3";
					}
				}
			];
			this.oGetAllVariantsStub.returns(aVariants);
			sandbox.stub(this.oVariantManagementControl, "getPresentVariantId").returns("id2");

			var oMenuItem = getContextMenuEntryById.call(this, "CTX_COMP_VARIANT_SWITCH");
			assert.equal(oMenuItem.enabled([this.oVariantManagementOverlay]), true, "the save is enabled");
			assert.equal(oMenuItem.submenu.length, 3, "there are 3 entries in the submenu");
			assert.deepEqual(oMenuItem.submenu[0], {
				id: "id1",
				icon: "blank",
				enabled: true,
				text: "text1"
			}, "the first variant is there and correct");
			assert.deepEqual(oMenuItem.submenu[1], {
				id: "id2",
				icon: "sap-icon://accept",
				enabled: false,
				text: "text2"
			}, "the second variant is there and correct");
			assert.deepEqual(oMenuItem.submenu[2], {
				id: "id3",
				icon: "blank",
				enabled: true,
				text: "text3"
			}, "the third variant is there and correct");

			var oEvent = {
				data: function() {
					return {key: "id3"};
				}
			};

			var oResult = waitForCommandToBeCreated(this.oPlugin).then(function(oParameters) {
				var oCommand = oParameters.command;
				assert.equal(oCommand.getTargetVariantId(), "id3", "the targetVariantId property is set");
				assert.deepEqual(oCommand.getSourceVariantId(), "id2", "the sourceVariantId property is set");
			});

			oMenuItem.handler([this.oVariantManagementOverlay], {eventItem: oEvent});
			return oResult;
		});

		QUnit.test("SaveAs with return value from the dialog", function(assert) {
			var oContent = {foo: "bar"};
			var sPreviousVarId = "previousVariantId";
			var sPreviousDefaultVarId = "previousDefaultVariantId";
			var sName = "myFancyName";
			var sType = "myType";
			sandbox.stub(this.oVariantManagementControl, "getModified").returns(true);
			sandbox.stub(this.oVariantManagementControl, "getPresentVariantId").returns(sPreviousVarId);
			sandbox.stub(this.oVariantManagementControl, "getDefaultVariantId").returns(sPreviousDefaultVarId);
			sandbox.stub(this.oVariantManagementControl, "openSaveAsDialogForKeyUser").callsFake(function(sStyleClass, fCallback, oCompCont) {
				assert.equal(sStyleClass, Utils.getRtaStyleClassName(), "the style class is set");
				assert.notEqual(oCompCont, undefined, "the component container is set");
				fCallback({
					"default": true,
					executeOnSelect: false,
					content: oContent,
					type: sType,
					text: sName,
					contexts: []
				});
			});

			var oResult = waitForCommandToBeCreated(this.oPlugin).then(function(oParameters) {
				var oCommand = oParameters.command;
				var mExpectedNewVariantProps = {
					"default": true,
					executeOnSelect: false,
					content: oContent,
					type: sType,
					text: sName,
					contexts: []
				};
				assert.deepEqual(oCommand.getNewVariantProperties(), mExpectedNewVariantProps, "the newVariantProperties property is set");
				assert.equal(oCommand.getPreviousDirtyFlag(), true, "the previousDirtyFlag property is set");
				assert.equal(oCommand.getPreviousVariantId(), sPreviousVarId, "the previousVariantId property is set");
				assert.equal(oCommand.getPreviousDefault(), sPreviousDefaultVarId, "the previousDefault property is set");
			});

			var oMenuItem = getContextMenuEntryById.call(this, "CTX_COMP_VARIANT_SAVE_AS");
			oMenuItem.handler([this.oVariantManagementOverlay]);
			return oResult;
		});

		QUnit.test("configure variants", function(assert) {
			var sPreviousDefaultVarId = "previousDefaultVariantId";
			var sNewDefaultVarId = "newDefaultVar";
			sandbox.stub(this.oVariantManagementControl, "getDefaultVariantId").returns(sPreviousDefaultVarId);
			var oNewVariantProperties = {foo: "bar"};
			sandbox.stub(this.oVariantManagementControl, "openManageViewsDialogForKeyUser").callsFake(function(sStyleClass, fCallback, oCompCont) {
				assert.equal(sStyleClass, Utils.getRtaStyleClassName(), "the style class is set");
				assert.notEqual(oCompCont, undefined, "the component container is set");
				fCallback(Object.assign({}, oNewVariantProperties, {"default": sNewDefaultVarId}));
			});

			var oResult = waitForCommandToBeCreated(this.oPlugin).then(function(oParameters) {
				var oCommand = oParameters.command;
				assert.deepEqual(oCommand.getNewVariantProperties(), oNewVariantProperties, "the newVariantProperties property is set");
				assert.equal(oCommand.getNewDefaultVariantId(), sNewDefaultVarId, "the newDefaultVariantId property is set");
				assert.equal(oCommand.getOldDefaultVariantId(), sPreviousDefaultVarId, "the oldDefaultVariantId property is set");
			});

			var oMenuItem = getContextMenuEntryById.call(this, "CTX_COMP_VARIANT_MANAGE");
			oMenuItem.handler([this.oVariantManagementOverlay]);
			return oResult;
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});