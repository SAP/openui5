/* global QUnit */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/Layer",
	"sap/ui/fl/registry/Settings",
	"sap/ui/layout/Grid",
	"sap/m/OverflowToolbar",
	"sap/m/Input",
	"sap/m/Text",
	"sap/m/RadioButton",
	"sap/ui/core/Icon",
	"sap/ui/core/Lib",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	Localization,
	ControlVariantApplyAPI,
	ManifestUtils,
	VariantManagement,
	VariantModel,
	Layer,
	flSettings,
	Grid,
	OverflowToolbar,
	Input,
	Text,
	RadioButton,
	Icon,
	Lib,
	sinon,
	nextUIUpdate
) {
	"use strict";

	var oModel;

	function fGetGrid(oDialog) {
		var oGrid = null;
		var aContent = oDialog.getContent();
		aContent.some(function(oContent) {
			if (oContent instanceof Grid) {
				oGrid = oContent;
			}

			return (oGrid !== null);
		});

		return oGrid;
	}

	function openDialogAndCheckContent(oVariantManagementControl, assert) {
		sinon.stub(oVariantManagementControl.oManagementDialog, "open");
		oVariantManagementControl._openManagementDialog();
		// content check
		assert.ok(oVariantManagementControl.oManagementTable);
		var aRows = oVariantManagementControl.oManagementTable.getItems();
		assert.ok(aRows);
		assert.equal(aRows.length, 5);
		// dialog check
		assert.ok(oVariantManagementControl.getManageDialog().isA("sap.m.Dialog"));
		assert.notOk(oVariantManagementControl.getManageDialog().bIsDestroyed, "then the dialog is not destroyed");
		assert.deepEqual(oVariantManagementControl.getManageDialog(), oVariantManagementControl.oManagementDialog, "then getManageDialog returns the manage dialog");
	}

	QUnit.module("sap.ui.fl.variants.VariantManagement", {
		beforeEach() {
			sinon.stub(flSettings, "getInstance").returns(Promise.resolve({
				isVariantPersonalizationEnabled() { return true; },
				isPublicFlVariantEnabled() { return true; }
			}));

			this.oVariantManagement = new VariantManagement("One", {});
			sinon.stub(ManifestUtils, "getFlexReferenceForControl").returns("mockComponentName");

			this._oVM = this.oVariantManagement._getEmbeddedVM();

			oModel = new VariantModel({
				One: {
					currentVariant: "One",
					originalCurrentVariant: "One",
					defaultVariant: "One",
					originalDefaultVariant: "One",
					modified: false,
					variantsEditable: true,
					showFavorites: true,
					showExecuteOnSelection: false,
					variants: [
						{
							key: "One",
							title: "Standard",
							author: "A",
							layer: Layer.VENDOR,
							favorite: true,
							visible: true
						}, {
							key: "1",
							title: "One",
							author: "A",
							layer: Layer.USER,
							change: true,
							favorite: true,
							visible: true,
							executeOnSelect: true
						}, {
							key: "2",
							title: "Two",
							author: "V",
							layer: Layer.CUSTOMER,
							favorite: true,
							visible: true,
							contexts: { role: ["V"] }
						}, {
							key: "3",
							title: "Three",
							author: "U",
							layer: Layer.CUSTOMER,
							favorite: true,
							visible: true,
							contexts: { role: [] }
						}, {
							key: "4",
							title: "Four",
							author: "Z",
							layer: Layer.USER,
							change: true,
							favorite: true,
							visible: true
						}
					]
				}
			}, {
				flexController: {},
				appComponent: {
					getId: () => {}
				}
			});

			sinon.stub(oModel, "updateCurrentVariant").returns(Promise.resolve());
			// to suppress "manage" event listener in VariantModel
			sinon.stub(oModel, "_initializeManageVariantsEvents");
			oModel.fnManageClick = function() {
			};
			return oModel.initialize();
		},
		afterEach() {
			this.oVariantManagement.destroy();
			flSettings.getInstance.restore();
			ManifestUtils.getFlexReferenceForControl.restore();
		}
	}, function() {
		QUnit.test("Shall be instantiable", function(assert) {
			assert.ok(this.oVariantManagement);
		});

		QUnit.test("Check property 'updateVariantInURL'", function(assert) {
			assert.ok(!this.oVariantManagement.getUpdateVariantInURL());

			this.oVariantManagement.setUpdateVariantInURL(true);
			assert.ok(this.oVariantManagement.getUpdateVariantInURL());
		});

		QUnit.test("Shall be destroyable", function(assert) {
			assert.ok(this.oVariantManagement._oRb);
			assert.ok(this._oVM);
			this.oVariantManagement.destroy();

			assert.ok(!this.oVariantManagement._oVM);
			assert.ok(!this.oVariantManagement._oRb);
		});

		QUnit.test("Check rendering", function(assert) {
			var sString = "";
			var oRm = {
				openStart(s) {
					sString += s;
					return this;
				},
				style(p, v) {
					sString += (`style=\"\{${p}=${v}\}\"`);
					return this;
				},
				"class": function(s) {
					sString += (`class=\"${s}\"`);
					return this;
				},
				attr() {
					return this;
				},
				openEnd() {
					return this;
				},
				close(s) {
					sString += s;
					return this;
				},
				renderControl() {
					return this;
				}
			};

			var oRenderer = this.oVariantManagement.getMetadata().getRenderer();
			assert.ok(oRenderer);
			oRenderer.render(oRm, this.oVariantManagement);
			assert.ok(sString);
		});

		QUnit.test("Check getFocusDomRef", function(assert) {
			assert.ok(this._oVM.oVariantPopoverTrigger);
			sinon.stub(this._oVM.oVariantPopoverTrigger, "getFocusDomRef");

			this.oVariantManagement.getFocusDomRef();

			assert.ok(this._oVM.oVariantPopoverTrigger.getFocusDomRef.called);
		});

		QUnit.test("Check onclick", function(assert) {
			assert.ok(this._oVM.oVariantPopoverTrigger);
			sinon.stub(this._oVM.oVariantPopoverTrigger, "focus");

			sinon.stub(this._oVM, "handleOpenCloseVariantPopover");

			this._oVM.onclick({});

			assert.ok(this._oVM.oVariantPopoverTrigger.focus.called);
			assert.ok(this._oVM.handleOpenCloseVariantPopover.called);
		});

		QUnit.test("Check onkeyup", function(assert) {
			sinon.stub(this._oVM, "_obtainControl").returns(null);
			sinon.stub(this._oVM, "_openVariantList");

			this._oVM.onkeyup({
				which: 32
			});

			assert.ok(this._oVM._openVariantList.called);
		});

		QUnit.test("Check title", async function(assert) {
			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			this.oVariantManagement.setCurrentVariantKey("2");
			await nextUIUpdate();

			assert.equal(this.oVariantManagement.getTitle(), this._oVM.oVariantText);
			assert.equal(this.oVariantManagement.getTitle().getText(), "Two");

			var aItems = this.oVariantManagement._getInnerItems();
			assert.ok(aItems);
			assert.equal(aItems.length, 5);

			aItems[2].title = "Hugo";
			oModel.getData().One.currentVariant = "2"; // one way binding!
			oModel.checkUpdate(true);
			await nextUIUpdate();

			assert.equal(this.oVariantManagement.getTitle().getText(), "Hugo");
		});

		QUnit.test("Check getVariants", async function(assert) {
			var aItems = this.oVariantManagement.getVariants();
			assert.ok(aItems);
			assert.equal(aItems.length, 0);

			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());
			await nextUIUpdate();

			aItems = this.oVariantManagement.getVariants();
			assert.ok(aItems);
			assert.equal(aItems.length, 5);
			assert.equal(aItems[0].getKey(), this.oVariantManagement.getStandardVariantKey());
			assert.equal(aItems[1].getKey(), "1");
			assert.equal(aItems[1].getVisible(), true);
			assert.equal(aItems[1]._getOriginalTitle(), aItems[1].getTitle());
			assert.equal(aItems[2].getKey(), "2");
		});

		QUnit.test("Check acc text", function(assert) {
			var sLanguage = Localization.getLanguage();

			Localization.setLanguage("en_EN");

			this.oVariantManagement._oRb = Lib.getResourceBundleFor("sap.m");

			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			var oFLRB = Lib.getResourceBundleFor("sap.ui.fl");
			var sStandardText = oFLRB.getText("STANDARD_VARIANT_TITLE");
			assert.equal(this._oVM.oVariantInvisibleText.getText(), this.oVariantManagement._oRb.getText("VARIANT_MANAGEMENT_SEL_VARIANT", sStandardText));

			this.oVariantManagement.setCurrentVariantKey("2");
			assert.equal(this._oVM.oVariantInvisibleText.getText(), this.oVariantManagement._oRb.getText("VARIANT_MANAGEMENT_SEL_VARIANT", "Two"));

			Localization.setLanguage(sLanguage);
		});

		QUnit.test("Check 'initialized' event", function(assert) {
			var bInitialized = false;

			this.oVariantManagement.attachInitialized(function() {
				bInitialized = true;
			});
			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			assert.ok(bInitialized);
		});

		QUnit.test("Check setDefaultVariantKey", function(assert) {
			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			assert.equal(this.oVariantManagement.getDefaultVariantKey(), "One");

			this.oVariantManagement.setDefaultVariantKey("3");

			assert.equal(this.oVariantManagement.getDefaultVariantKey(), "3");
		});

		QUnit.test("Check _checkVariantNameConstraints", function(assert) {
			var oInput = new Input();

			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			oInput.setValue("New");
			this._oVM._checkVariantNameConstraints(oInput, "1");
			assert.equal(oInput.getValueState(), "None");

			oInput.setValue("");
			this._oVM._checkVariantNameConstraints(oInput, "1");
			assert.equal(oInput.getValueState(), "Error");

			oInput.setValue("One");
			this._oVM._checkVariantNameConstraints(oInput, "1");
			assert.equal(oInput.getValueState(), "None");

			this._oVM._checkVariantNameConstraints(oInput, "2");
			assert.equal(oInput.getValueState(), "Error");
			oInput.destroy();
		});

		QUnit.test("Create Variants List", function(assert) {
			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			assert.ok(!this._oVM.oVariantPopOver);
			this._oVM._createVariantList();

			assert.ok(this._oVM.oVariantPopOver);

			assert.equal(this.oVariantManagement.getCurrentVariantKey(), this.oVariantManagement.getStandardVariantKey());

			assert.equal(this._oVM.oVariantSaveBtn.getVisible(), false);
			assert.equal(this._oVM.oVariantSaveAsBtn.getVisible(), true);

			assert.equal(this.oVariantManagement.getModified(), false);
			assert.equal(this._oVM.oVariantSaveBtn.getVisible(), false);
			assert.equal(this._oVM.oVariantSaveAsBtn.getVisible(), true);

			this.oVariantManagement.setModified(true);
			assert.equal(this.oVariantManagement.getModified(), true);
			assert.equal(this._oVM.oVariantSaveBtn.getVisible(), false);
			assert.equal(this._oVM.oVariantSaveAsBtn.getVisible(), true);

			this.oVariantManagement.setCurrentVariantKey("4");
			assert.equal(this._oVM.oVariantSaveBtn.getVisible(), false);
			this.oVariantManagement.setModified(true);
			assert.equal(this._oVM.oVariantSaveBtn.getVisible(), true);

			assert.equal(this._oVM.oVariantSaveAsBtn.getVisible(), true);

			this.oVariantManagement.setCurrentVariantKey("1");
			assert.equal(this._oVM.oVariantSaveBtn.getVisible(), false);
			assert.equal(this._oVM.oVariantSaveAsBtn.getVisible(), true);

			this._oVM.setShowSaveAs(false);
			assert.equal(this._oVM.oVariantSaveAsBtn.getVisible(), false);
		});

		QUnit.test("Create Variants List with favorited Standard", function(assert) {
			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			assert.ok(!this._oVM.oVariantPopOver);
			this._oVM._createVariantList();

			assert.ok(this._oVM.oVariantPopOver);
			sinon.stub(this._oVM.oVariantPopOver, "openBy");

			assert.equal(this.oVariantManagement.getCurrentVariantKey(), this.oVariantManagement.getStandardVariantKey());

			this._oVM._openVariantList();

			assert.equal(this._oVM.oVariantList.getItems()[0].getText(), "Standard");

			var aFilters = this._oVM._getFilters();
			assert.equal(aFilters.length, 2);
			assert.equal(aFilters[0].sPath, "visible");
			assert.equal(aFilters[1].sPath, "favorite");
		});

		QUnit.test("Create Variants List with non favorited Standard", function(assert) {
			oModel.oData.One.variants[0].favorite = false;

			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			assert.ok(!this._oVM.oVariantPopOver);
			this._oVM._createVariantList();

			assert.ok(this._oVM.oVariantPopOver);
			sinon.stub(this._oVM.oVariantPopOver, "openBy");

			assert.equal(this.oVariantManagement.getCurrentVariantKey(), this.oVariantManagement.getStandardVariantKey());

			this._oVM._openVariantList();

			assert.equal(this._oVM.oVariantList.getItems()[0].getText(), "One");
		});

		QUnit.test("check opening the varian list display in simulated designmode", function(assert) {
			sinon.stub(this._oVM, "_openVariantList");

			this.oVariantManagement.enteringDesignMode();
			this._oVM.onclick();
			assert.ok(!this._oVM._openVariantList.called);

			this.oVariantManagement.leavingDesignMode();
			this._oVM.onclick();
			assert.ok(this._oVM._openVariantList.called);
		});

		QUnit.test("Check 'variantsEditable'", function(assert) {
			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());
			this._oVM._openVariantList();

			assert.ok(this._oVM.oVariantSelectionPage.getShowFooter());

			var oData = this.oVariantManagement.getBindingContext(ControlVariantApplyAPI.getVariantModelName()).getObject();
			oData.variantsEditable = !oData.variantsEditable;

			oModel.checkUpdate(true);

			assert.ok(!this._oVM.oVariantSelectionPage.getShowFooter());
		});

		QUnit.test("Check 'editable'", function(assert) {
			assert.ok(this.oVariantManagement.getEditable());

			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());
			this._oVM._openVariantList();

			assert.ok(this._oVM.oVariantSelectionPage.getShowFooter());

			this.oVariantManagement.setEditable(false);
			assert.ok(!this._oVM.getShowFooter());

			assert.ok(!this._oVM.oVariantSelectionPage.getShowFooter());
		});

		QUnit.test("Create SaveAs Dialog", function(assert) {
			assert.ok(!this._oVM.oSaveAsDialog);

			return flSettings.getInstance().then(function() {
				this._oVM._createSaveAsDialog();

				assert.ok(this._oVM.oSaveAsDialog);
				sinon.stub(this._oVM.oSaveAsDialog, "open");

				this._oVM._openSaveAsDialog();

				assert.ok(this._oVM.oInputName.getVisible());

				assert.ok(this._oVM.getSupportApplyAutomatically());
				assert.ok(this._oVM.getSupportPublic());

				var oGrid = fGetGrid(this._oVM.oSaveAsDialog);

				var oGridContent = oGrid.getContent();
				assert.ok(oGridContent);
				assert.equal(oGridContent.length, 4);
				assert.ok(oGridContent[0].getVisible());
				assert.ok(oGridContent[1].getVisible());
				assert.ok(oGridContent[2].getVisible());
				assert.ok(!oGridContent[3].getVisible());

				this._oVM.oSaveAsDialog.destroy();
				this._oVM.oSaveAsDialog = undefined;
				this._oVM.oExecuteOnSelect.destroy();
				this._oVM.oPublic.destroy();

				this._oVM.setSupportApplyAutomatically(false);
				this._oVM.setSupportPublic(false);
				this._oVM._createSaveAsDialog();

				assert.ok(this._oVM.oSaveAsDialog);
				sinon.stub(this._oVM.oSaveAsDialog, "open");

				this._oVM._openSaveAsDialog();

				assert.ok(!this._oVM.getSupportApplyAutomatically());
				assert.ok(!this._oVM.getSupportPublic());

				oGrid = fGetGrid(this._oVM.oSaveAsDialog);
				oGridContent = oGrid.getContent();
				assert.ok(oGridContent);
				assert.equal(oGridContent.length, 4);
				assert.ok(oGridContent[0].getVisible());
				assert.ok(!oGridContent[1].getVisible());
				assert.ok(!oGridContent[2].getVisible());
				assert.ok(!oGridContent[3].getVisible());

				this._oVM._openSaveAsDialog();
			}.bind(this));
		});

		QUnit.test("Create public checkbox on SaveAs Dialog for End - and KeyUser", function(assert) {
			// end user
			assert.ok(!this._oVM.oSaveAsDialog);

			this._oVM.setSupportApplyAutomatically(false);
			this._oVM._createSaveAsDialog();

			this._oVM._openSaveAsDialog();
			assert.ok(this._oVM.oPublic.getVisible());

			this._oVM.oSaveAsDialog.destroy();
			this._oVM.oSaveAsDialog = undefined;
			this._oVM.oExecuteOnSelect.destroy();
			this._oVM.oPublic.destroy();
			this._oVM._createSaveAsDialog();

			// key user
			this._oVM.setSupportApplyAutomatically(true);
			assert.ok(!this._oVM._bShowPublic);
			assert.ok(this._oVM.oPublic.getVisible());
			this.oVariantManagement.openSaveAsDialogForKeyUser("KeyUserStyleClass");
			assert.ok(this._oVM._bShowPublic);
			assert.ok(!this._oVM.oPublic.getVisible());
		});

		QUnit.test("Checking openSaveAsDialogForKeyUser", function(assert) {
			var sSyleClassName = "testStyle";
			this.oVariantManagement.openSaveAsDialogForKeyUser(sSyleClassName);
			assert.ok(this._oVM.oSaveAsDialog, "then save as dialog is created");
			assert.ok(this._oVM.oSaveAsDialog.hasStyleClass(sSyleClassName), "then save as dialog is extended by the rta styleclass");
		});

		QUnit.test("Checking _handleVariantSaveAs", function(assert) {
			sinon.stub(oModel, "_handleSave");
			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			var bCalled = false;
			this.oVariantManagement.attachSave(function(oEvent) {
				bCalled = true;
				assert.ok(!oEvent.getParameter("public"));
			});

			this._oVM._createSaveAsDialog();

			assert.ok(this._oVM.oSaveAsDialog);
			sinon.stub(this._oVM.oSaveAsDialog, "open");

			this._oVM._openSaveAsDialog();
			assert.equal(this._oVM.oInputName.getValueState(), "None");
			assert.ok(this._oVM.oSaveSave.getEnabled());

			var aItems = this.oVariantManagement.getVariants();
			assert.ok(aItems);
			assert.equal(aItems.length, 5);

			this._oVM._handleVariantSaveAs("1");
			assert.ok(bCalled);
			assert.ok(oModel._handleSave.calledOnce);

			this._oVM._handleVariantSaveAs(" ");
			assert.equal(this._oVM.oInputName.getValueState(), "Error");
		});

		QUnit.test("Checking _handleVariantSaveAs with cancel", function(assert) {
			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			var bCalled = false;
			this.oVariantManagement.attachCancel(function() {
				bCalled = true;
			});

			this._oVM._createSaveAsDialog();

			assert.ok(this._oVM.oSaveAsDialog);
			sinon.stub(this._oVM.oSaveAsDialog, "open");

			this._oVM._openSaveAsDialog();

			this._oVM._cancelPressed();
			assert.ok(bCalled);
		});

		QUnit.test("Checking _handleVariantSave", function(assert) {
			sinon.stub(oModel, "_handleSave");
			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			var bCalled = false;
			this.oVariantManagement.attachSave(function() {
				bCalled = true;
			});

			this._oVM._createSaveAsDialog();

			assert.ok(this._oVM.oSaveAsDialog);
			sinon.stub(this._oVM.oSaveAsDialog, "open");

			this.oVariantManagement.setCurrentVariantKey("1");

			this._oVM._openSaveAsDialog();

			this._oVM._handleVariantSave();
			assert.ok(bCalled);
			assert.ok(oModel._handleSave.calledOnce);
		});

		QUnit.test("Checking openManagementDialog", function(assert) {
			var bDestroy = false;
			this._oVM.oManagementDialog = {
				destroy() {
					bDestroy = true;
				}
			};

			sinon.stub(this._oVM, "_openManagementDialog");

			this.oVariantManagement.openManagementDialog();
			assert.ok(this._oVM._openManagementDialog.calledOnce);
			assert.ok(!bDestroy);

			this.oVariantManagement.openManagementDialog(true);
			assert.ok(this._oVM._openManagementDialog.calledTwice);
			assert.ok(bDestroy);
			assert.equal(this._oVM.oManagementDialog, undefined);
		});

		QUnit.test("Checking create management dialog", function(assert) {
			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			this._oVM._createManagementDialog();

			openDialogAndCheckContent(this._oVM, assert);
		});

		QUnit.test("Checking create management dialog, when dialog already exists", function(assert) {
			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			this._oVM._createManagementDialog();

			this._oVM._createManagementDialog();

			openDialogAndCheckContent(this._oVM, assert);
		});

		QUnit.test("Checking create management dialog, when dialog is already destroyed", async function(assert) {
			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			this._oVM._createManagementDialog();

			this.oVariantManagement.getManageDialog().destroy();
			await nextUIUpdate();

			this._oVM._createManagementDialog();

			openDialogAndCheckContent(this._oVM, assert);
		});

		QUnit.test("Checking _handleManageDefaultVariantChange", function(assert) {
			sinon.stub(this._oVM, "setDefaultKey");

			assert.ok(!this._oVM.setDefaultKey.called);

			var oIcon = new Icon();
			var oParent = {
				getCells() { return [oIcon];}
			};
			var oRadioButton = {
				getParent() { return oParent;}
			};

			var oItem = {
				bFavorite: false,
				getKey() { return "";},
				getFavorite() { return this.bFavorite; },
				setFavorite(bValue) { this.bFavorite = bValue;}
			};

			this._oVM._handleManageDefaultVariantChange(oRadioButton, oItem, true);
			assert.ok(this._oVM.setDefaultKey.called);

			oIcon.destroy();
		});

		QUnit.test("Checking _handleManageDefaultVariantChange, ensure favorites are flagged for default variant", function(assert) {
			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			var oItem = this._oVM._getItemByKey("1");

			sinon.stub(this._oVM, "_setFavoriteIcon");
			sinon.stub(this._oVM, "_anyInErrorState").returns(false);

			this._oVM.oManagementSave = {
				setEnabled() {}
			};

			var oDefaultRadioButton = new RadioButton();

			var oIcon = new Icon();
			oDefaultRadioButton.getParent = function() {
				return {
					getCells() {
						return [oIcon];
					}
				};
			};

			assert.ok(oItem.getFavorite());
			this._oVM._handleManageDefaultVariantChange(oDefaultRadioButton, oItem, true);
			assert.ok(oItem.getFavorite());

			oItem.setFavorite(false);
			assert.ok(!oItem.getFavorite());
			this._oVM._handleManageDefaultVariantChange(oDefaultRadioButton, oItem, true);
			assert.ok(oItem.getFavorite());

			this._oVM.oManagementSave = undefined;
			oDefaultRadioButton.destroy();
			oIcon.destroy();
		});

		QUnit.test("Checking _handleManageCancelPressed", function(assert) {
			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			var oItemDel = this._oVM._getItemByKey("1");
			var oItemRen = this._oVM._getItemByKey("3");

			var aItems = this.oVariantManagement.getVariants();
			assert.ok(aItems);
			assert.equal(aItems.length, 5);

			this._oVM._createManagementDialog();
			assert.ok(this._oVM.oManagementDialog);
			sinon.stub(this._oVM.oManagementDialog, "open");

			this._oVM._openManagementDialog();

			oItemRen.setTitle("Not Three");

			var sItemKey = "1";
			var oListItem = this._oVM._getRowForKey(sItemKey);
			assert.ok(oListItem, "manage table item exists");
			assert.ok(oListItem.getVisible(), "manage table item is visible");

			assert.ok(oItemDel.getVisible());
			this._oVM._handleManageDeletePressed(oItemDel);
			assert.ok(oItemDel.getVisible());

			oListItem = this._oVM._getRowForKey(sItemKey);
			assert.ok(oListItem, "manage table item exists");
			assert.ok(!oListItem.getVisible(), "manage table item is not visible");

			var aRows = this._oVM.oManagementTable.getItems();
			assert.ok(aRows);
			assert.equal(aRows.length, 5);

			this._oVM._handleManageCancelPressed();
			assert.ok(oItemDel.getVisible());

			this._oVM._openManagementDialog();
			aRows = this._oVM._getItems();
			assert.ok(aRows);
			assert.equal(aRows.length, 5);

			var oItem = this._oVM._getItemByKey("3");
			assert.ok(oItem);
			assert.equal(oItem.getTitle(), "Three");
			assert.equal(oItem._getOriginalTitle(), oItem.getTitle());
		});

		QUnit.test("Checking _handleManageSavePressed; deleted item is NOT selected", function(assert) {
			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			this.oVariantManagement.attachManage(function(oEvent) {
				var oData = oEvent.getParameters();

				var aDelItems = oData.deleted;
				assert.ok(oData.deleted);
				assert.equal(aDelItems.length, 2);
				assert.equal(aDelItems[0], "1");
				assert.equal(aDelItems[1], "4");

				var aRenamedItems = oData.renamed;
				assert.ok(aRenamedItems);
				assert.equal(aRenamedItems.length, 1);
				assert.equal(aRenamedItems[0].key, "3");
				assert.equal(aRenamedItems[0].name, "New 3");
			});

			this._oVM._createManagementDialog();
			assert.ok(this._oVM.oManagementDialog);
			sinon.stub(this._oVM.oManagementDialog, "open");

			this._oVM._openManagementDialog();

			var oItemRen = this._oVM._getItemByKey("3");
			assert.ok(oItemRen);
			oItemRen.setTitle("New 3");

			var oItemDel = this._oVM._getItemByKey("1");
			assert.ok(oItemDel);

			oItemDel.setTitle("New 1");

			this._oVM._handleManageDeletePressed(oItemDel);
			this._oVM._handleManageDeletePressed(this._oVM._getItemByKey("4"));

			this._oVM._handleManageSavePressed();

			assert.ok(!this._oVM.bFireSelect);
		});

		QUnit.test("Checking _handleManageSavePressed: deleted after search", function(assert) {
			var oEvent = {
				getParameters() { return { newValue: "One" }; }
			};

			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			this._oVM._createManagementDialog();
			assert.ok(this._oVM.oManagementDialog);
			sinon.stub(this._oVM.oManagementDialog, "open");

			this._oVM._openManagementDialog();

			this._oVM._triggerSearchInManageDialog(oEvent, this._oVM.oManagementTable);

			var oItemDel = this._oVM._getItemByKey("1");
			assert.ok(oItemDel);

			var aDeletedItems = this._oVM._getDeletedItems();
			assert.ok(aDeletedItems);
			assert.equal(aDeletedItems.length, 0);

			this._oVM._handleManageDeletePressed(oItemDel);
			aDeletedItems = this._oVM._getDeletedItems();
			assert.ok(aDeletedItems);
			assert.equal(aDeletedItems.length, 1);

			// check for Standard
			oItemDel = this._oVM._getItemByKey("One");
			assert.ok(oItemDel);

			this._oVM._clearDeletedItems();

			oEvent = {
				getParameters() { return { newValue: "One" }; }
			};

			this._oVM._triggerSearchInManageDialog(oEvent, this._oVM.oManagementTable);
			aDeletedItems = this._oVM._getDeletedItems();
			assert.ok(aDeletedItems);
			assert.equal(aDeletedItems.length, 0);
			this._oVM._handleManageDeletePressed(oItemDel);
			aDeletedItems = this._oVM._getDeletedItems();
			assert.ok(aDeletedItems);
			assert.equal(aDeletedItems.length, 0);
		});

		QUnit.test("Checking _handleManageSavePressed; deleted item is selected", function(assert) {
			oModel.fnManageClick = function() {
				this.oVariantManagement.setCurrentVariantKey(this.oVariantManagement.getStandardVariantKey());
			}.bind(this);

			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			this.oVariantManagement.attachManage(function(oEvent) {
				var oData = oEvent.getParameters();

				var aDelItems = oData.deleted;
				assert.ok(aDelItems);
				assert.equal(aDelItems.length, 1);
				assert.equal(aDelItems[0], "1");

				var aRenamedItems = oData.renamed;
				assert.ok(aRenamedItems);
				assert.equal(aRenamedItems.length, 1);
				assert.equal(aRenamedItems[0].key, "3");
				assert.equal(aRenamedItems[0].name, "New 3");

				var aFavItems = oData.fav;
				assert.ok(aFavItems);
				assert.equal(aFavItems.length, 1);
				assert.equal(aFavItems[0].key, "4");
				assert.ok(!aFavItems[0].visible);
			});

			this._oVM._createManagementDialog();
			assert.ok(this._oVM.oManagementDialog);
			sinon.stub(this._oVM.oManagementDialog, "open");

			this._oVM._openManagementDialog();

			var oItemRen = this._oVM._getItemByKey("3");
			assert.ok(oItemRen);
			oItemRen.setTitle("New 3");

			var oItemDel = this._oVM._getItemByKey("1");
			assert.ok(oItemDel);

			oItemDel.setTitle("New 1");

			this._oVM._handleManageDeletePressed(oItemDel);
			this._oVM._handleManageDeletePressed(this._oVM._getItemByKey("2")); // will not be deleted, because different layer

			var oItemFav = this._oVM._getItemByKey("4");
			assert.ok(oItemFav);
			this._oVM._handleManageFavoriteChanged(null, oItemFav);

			this.oVariantManagement.setCurrentVariantKey("1");

			this._oVM._handleManageSavePressed();

			assert.equal(this.oVariantManagement.getCurrentVariantKey(), this.oVariantManagement.getStandardVariantKey());
		});

		QUnit.test("Checking _triggerSearch", function(assert) {
			var oEvent = {
				params: {
					newValue: "e"
				},
				getParameters() {
					return this.params;
				}
			};

			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());
			this._oVM._createVariantList();
			var aItems = this._oVM.oVariantList.getItems();
			assert.ok(aItems);
			assert.equal(aItems.length, 5);

			sinon.spy(this._oVM.oVariantList, "getBinding");

			this._oVM._triggerSearch(null, this._oVM.oVariantList);
			assert.ok(!this._oVM.oVariantList.getBinding.called);

			this._oVM._triggerSearch({
				getParameters() {
					return null;
				}
			}, this.oVariantManagement.oVariantList);
			assert.ok(!this._oVM.oVariantList.getBinding.called);

			this._oVM._triggerSearch(oEvent, this._oVM.oVariantList);
			assert.ok(this._oVM.oVariantList.getBinding.called);
			aItems = this._oVM.oVariantList.getItems();
			assert.ok(aItems);
			assert.equal(aItems.length, 2);
		});

		QUnit.test("Checking _setFavoriteIcon", function(assert) {
			var oIcon = new Icon();

			this._oVM._setFavoriteIcon(oIcon, true);
			assert.equal(oIcon.getSrc(), "sap-icon://favorite");

			this._oVM._setFavoriteIcon(oIcon, false);
			assert.equal(oIcon.getSrc(), "sap-icon://unfavorite");
		});

		QUnit.test("Checking handleOpenCloseVariantPopover ", function(assert) {
			var bListClosed = false;
			var bErrorListClosed = false;

			sinon.stub(this._oVM, "_openVariantList");

			this._oVM.bPopoverOpen = true;
			this._oVM.handleOpenCloseVariantPopover();
			assert.ok(!this._oVM._openVariantList.called);

			this._oVM.bPopoverOpen = false;
			this._oVM.handleOpenCloseVariantPopover();
			assert.ok(this._oVM._openVariantList.calledOnce);

			// -
			this._oVM._openVariantList.restore();
			sinon.stub(this._oVM, "_openVariantList");

			this._oVM.oVariantPopOver = {
				isOpen() {
					return true;
				},
				close() {
					bListClosed = true;
				}
			};
			this._oVM.bPopoverOpen = true;

			this._oVM.handleOpenCloseVariantPopover();
			assert.ok(!this._oVM._openVariantList.called);
			assert.ok(bListClosed);
			assert.ok(!bErrorListClosed);

			// --
			bListClosed = false;
			this._oVM.oVariantPopOver = null;
			this._oVM.oErrorVariantPopOver = {
				isOpen() {
					return true;
				},
				close() {
					bErrorListClosed = true;
				}
			};
			this._oVM.handleOpenCloseVariantPopover();
			assert.ok(!this._oVM._openVariantList.called);
			assert.ok(!bListClosed);
			assert.ok(!bErrorListClosed);

			// -
			this._oVM.setInErrorState(true);
			this._oVM.handleOpenCloseVariantPopover();
			assert.ok(!this._oVM._openVariantList.called);
			assert.ok(!bListClosed);
			assert.ok(bErrorListClosed);
		});

		QUnit.test("Checking _openVariantList in errorState", function(assert) {
			this._oVM.setInErrorState(true);
			assert.ok(!this._oVM.oErrorVariantPopOver);
			this._oVM._openVariantList();
			assert.ok(this._oVM.oErrorVariantPopOver);

			this._oVM.oErrorVariantPopOver.destroy();
			this._oVM.oErrorVariantPopOver = null;
		});

		QUnit.test("Checking _openInErrorState", function(assert) {
			assert.ok(!this._oVM.oErrorVariantPopOver);
			this._oVM._openInErrorState();
			assert.ok(this._oVM.oErrorVariantPopOver);

			this._oVM.oErrorVariantPopOver.destroy();
			this._oVM.oErrorVariantPopOver = null;
		});

		QUnit.test("Checking _triggerSearchInManageDialog", function(assert) {
			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			assert.ok(!this._oVM._bRebindRequired);

			this._oVM._createManagementDialog();
			this._oVM._triggerSearchInManageDialog(null, this._oVM.oManagementTable);
			assert.ok(!this._oVM._bRebindRequired);

			var oEvent = {
				getParameters() {
					return null;
				}
			};
			this._oVM._triggerSearchInManageDialog(oEvent, this._oVM.oManagementTable);
			assert.ok(!this._oVM._bRebindRequired);

			sinon.stub(oEvent, "getParameters").returns({});

			this._oVM._triggerSearchInManageDialog(oEvent, this._oVM.oManagementTable);
			assert.ok(this._oVM._bRebindRequired);
		});

		QUnit.test("Checking _handleManageSavePressed; deleted item is default variant and Standard marked as non favorite", function(assert) {
			oModel.oData.One.variants[0].favorite = false;
			oModel.oData.One.currentVariant = "1";
			oModel.oData.One.defaultVariant = "1";

			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			this._oVM._createManagementDialog();
			assert.ok(this._oVM.oManagementDialog);
			sinon.stub(this._oVM.oManagementDialog, "open");

			this._oVM._openManagementDialog();

			assert.equal(this.oVariantManagement.getDefaultVariantKey(), "1");
			var oItem = this._oVM._getItemByKey("One");
			assert.ok(oItem);
			assert.ok(!oItem.getFavorite());

			this._oVM._handleManageDeletePressed(this._oVM._getItemByKey("1"));

			assert.equal(this.oVariantManagement.getDefaultVariantKey(), "One");
			oItem = this._oVM._getItemByKey("One");
			assert.ok(oItem);
			assert.ok(oItem.getFavorite());
		});

		QUnit.test("Checking usage inside OverflowToolBar", function(assert) {
			var oOverflowToolbar = new OverflowToolbar();

			var oContext = this.oVariantManagement.getOverflowToolbarConfig();
			assert.ok(oContext);
			assert.ok(oContext.invalidationEvents);
			assert.equal(oContext.invalidationEvents.length, 3);
			assert.equal(oContext.invalidationEvents[0], "save");
			assert.equal(oContext.invalidationEvents[1], "manage");
			assert.equal(oContext.invalidationEvents[2], "select");

			assert.ok(!this.oVariantManagement.hasListeners(oContext.invalidationEvents[0]));
			assert.ok(!this.oVariantManagement.hasListeners(oContext.invalidationEvents[1]));
			assert.ok(!this.oVariantManagement.hasListeners(oContext.invalidationEvents[2]));

			oOverflowToolbar.addContent(this.oVariantManagement);

			assert.ok(this.oVariantManagement.hasListeners(oContext.invalidationEvents[0]));
			assert.ok(this.oVariantManagement.hasListeners(oContext.invalidationEvents[1]));
			assert.ok(this.oVariantManagement.hasListeners(oContext.invalidationEvents[2]));

			oOverflowToolbar.removeContent(this.oVariantManagement);
			oOverflowToolbar.destroy();
		});

		QUnit.test("Check property 'executeOnSelectionForStandardDefault'", function(assert) {
			assert.ok(!this.oVariantManagement.getExecuteOnSelectionForStandardDefault());

			this.oVariantManagement.setExecuteOnSelectionForStandardDefault(true);
			assert.ok(this.oVariantManagement.getExecuteOnSelectionForStandardDefault());
		});

		QUnit.test("Check save in manage dialog with renaming", function(assert) {
			var bSavePressed = false;
			var fmSavePressed = function() {
				bSavePressed = true;
			};

			this._oVM.attachManage(fmSavePressed);

			oModel.oData.One.variants[0].favorite = false;
			oModel.oData.One.currentVariant = "1";
			oModel.oData.One.defaultVariant = "1";

			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			this._oVM._createManagementDialog();
			assert.ok(this._oVM.oManagementDialog);
			sinon.stub(this._oVM.oManagementDialog, "open");

			sinon.stub(this._oVM.oManagementDialog, "isOpen").returns(true);

			this._oVM._openManagementDialog();

			this._oVM._handleManageSavePressed();
			assert.ok(bSavePressed);

			assert.ok(this._oVM.oManagementTable);

			var [, oInput] = this._oVM.oManagementTable.getItems()[1].getCells();
			assert.ok(oInput);
			assert.equal(oInput.getValue(), "One");
			oInput.setValue("Two");

			// setValue destroys the input while list binding is recreated....
			[, oInput] = this._oVM.oManagementTable.getItems()[1].getCells();
			assert.ok(oInput);
			assert.equal(oInput.getValue(), "Two");
			this._oVM._checkVariantNameConstraints(oInput, "2");

			bSavePressed = false;
			this._oVM._handleManageSavePressed();
			assert.ok(!bSavePressed);

			// setValue destroys the input while list binding is recreated....
			[, oInput] = this._oVM.oManagementTable.getItems()[1].getCells();
			assert.ok(oInput);
			assert.equal(oInput.getValue(), "Two");

			oInput.setValue("TEN");
			[, oInput] = this._oVM.oManagementTable.getItems()[1].getCells();

			this._oVM._checkVariantNameConstraints(oInput, "2");
			this._oVM._handleManageSavePressed();
			assert.ok(bSavePressed);
		});

		QUnit.test("check displayTextForOnSelectionForStandardVariant property", function(assert) {
			assert.ok(!this.oVariantManagement.getDisplayTextForExecuteOnSelectionForStandardVariant());

			this.oVariantManagement.setDisplayTextForExecuteOnSelectionForStandardVariant("TEST");
			assert.equal(this.oVariantManagement.getDisplayTextForExecuteOnSelectionForStandardVariant(), "TEST");

			this.oVariantManagement.setDisplayTextForExecuteOnSelectionForStandardVariant(null);
			assert.ok(!this.oVariantManagement.getDisplayTextForExecuteOnSelectionForStandardVariant());
		});

		QUnit.test("Checking the sharing text", function(assert) {
			var sLanguage = Localization.getLanguage();

			Localization.setLanguage("en_EN");

			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			this._oVM._openManagementDialog();
			var aRows = this._oVM.oManagementTable.getItems();
			assert.ok(aRows);
			assert.equal(aRows.length, 5);

			var aCells = aRows[0].getCells();
			assert.ok(aCells);
			assert.equal(aCells.length, 9);

			assert.ok(aCells[2].isA("sap.m.Text"));
			assert.equal(aCells[2].getText(), "Public");

			aCells = aRows[1].getCells();
			assert.ok(aCells[2].isA("sap.m.Text"));
			assert.equal(aCells[2].getText(), "Private");

			Localization.setLanguage(sLanguage);
		});

		QUnit.test("Checking the apply automatic text for standard", function(assert) {
			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			this.oVariantManagement.setDisplayTextForExecuteOnSelectionForStandardVariant("TEST");

			this._oVM._openManagementDialog();
			var aRows = this._oVM.oManagementTable.getItems();
			var aCells = aRows[0].getCells();
			assert.ok(aCells);
			assert.equal(aCells.length, 9);

			assert.ok(aCells[4].isA("sap.m.CheckBox"));
			assert.equal(aCells[4].getText(), "TEST");
		});

		QUnit.test("check getApplyAutomaticallyOnVariant method", function(assert) {
			var nCount = 0;
			var fCallBack = function(oVariant) { assert.ok(oVariant); nCount++; return true; };

			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			assert.equal(nCount, 0);
			var oStdVariant = this.oVariantManagement._getInnerItemByKey("One");
			assert.ok(oStdVariant);
			assert.ok(!this.oVariantManagement.getApplyAutomaticallyOnVariant(oStdVariant));

			var oVariant = this.oVariantManagement._getInnerItemByKey("1");
			assert.ok(oVariant);
			assert.ok(this.oVariantManagement.getApplyAutomaticallyOnVariant(oVariant));

			this.oVariantManagement.registerApplyAutomaticallyOnStandardVariant(fCallBack);
			assert.ok(!this.oVariantManagement.getApplyAutomaticallyOnVariant(oStdVariant));

			this.oVariantManagement.setDisplayTextForExecuteOnSelectionForStandardVariant("TEST");
			assert.ok(this.oVariantManagement.getApplyAutomaticallyOnVariant(oStdVariant));
			assert.equal(nCount, 1);

			assert.ok(this.oVariantManagement.getApplyAutomaticallyOnVariant(oVariant));
			assert.equal(nCount, 1);
		});

		QUnit.test("Checking management dialog with roles component", function(assert) {
			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			var done = assert.async();

			sinon.stub(this._oVM, "_getSelectedContexts");
			sinon.stub(this._oVM, "_setSelectedContexts");
			sinon.stub(this._oVM, "_isInErrorContexts").returns(false);

			var oComponentPromise = new Promise(function(resolve) {
				resolve({});
			});

			assert.ok(!this._oVM.getSupportContexts());
			this._oVM.setSupportContexts(true);

			this._oVM._sStyleClass = "KUStyle";
			this._oVM._createManagementDialog();
			assert.ok(this._oVM.oManagementDialog);

			this._oVM.oManagementDialog.attachAfterOpen(function() {
				assert.ok(this._oVM.getSupportContexts());

				var aRows = this._oVM.oManagementTable.getItems();
				assert.ok(aRows);
				assert.equal(aRows.length, 5);

				// standard
				var aCells = aRows[0].getCells();
				assert.ok(aCells);
				assert.equal(aCells.length, 9);

				assert.ok(aCells[5].isA("sap.m.Text"));
				assert.equal(aCells[5].getText(), "");

				// restricted
				aCells = aRows[2].getCells();
				assert.ok(aCells);
				assert.equal(aCells.length, 9);

				var aItems = aCells[5].getItems();
				assert.ok(aItems);
				assert.ok(aItems.length);

				assert.ok(aItems[0].isA("sap.m.Text"));
				assert.equal(aItems[0].getText(), this._oVM._oRb.getText("VARIANT_MANAGEMENT_VISIBILITY_RESTRICTED"));

				// unrestricted
				aCells = aRows[3].getCells();
				assert.ok(aCells);
				assert.equal(aCells.length, 9);

				aItems = aCells[5].getItems();
				assert.ok(aItems);
				assert.ok(aItems.length);

				assert.ok(aItems[0].isA("sap.m.Text"));
				assert.equal(aItems[0].getText(), this._oVM._oRb.getText("VARIANT_MANAGEMENT_VISIBILITY_NON_RESTRICTED"));

				done();
			}.bind(this));

			this.oVariantManagement.openManagementDialog(false, "KUStyle", oComponentPromise);
		});

		QUnit.test("Checking save as dialog with roles component", function(assert) {
			this.oVariantManagement.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());

			var done = assert.async();

			sinon.stub(this._oVM, "_getSelectedContexts");
			sinon.stub(this._oVM, "_setSelectedContexts");
			sinon.stub(this._oVM, "_isInErrorContexts").returns(false);

			var oComponentPromise = new Promise(function(resolve) {
				resolve(new Text({ text: "SAVE_AS"}));
			});

			this._oVM._createSaveAsDialog();
			assert.ok(this._oVM.oSaveAsDialog);

			var aContent = this._oVM.oSaveAsDialog.getContent();
			assert.ok(aContent);
			assert.equal(aContent.length, 3);

			this._oVM.oSaveAsDialog.attachAfterOpen(function() {
				assert.ok(true);

				aContent = this._oVM.oSaveAsDialog.getContent();
				assert.ok(aContent);
				assert.equal(aContent.length, 4);
				assert.ok(aContent[3].isA("sap.m.Text"));
				assert.ok(aContent[3].getText(), "SAVE_AS");

				done();
			}.bind(this));

			this.oVariantManagement.openSaveAsDialogForKeyUser("KUStyle", oComponentPromise);
		});

		QUnit.test("Checking roles dialog destroy when exiting the VM", function(assert) {
			var oVariantManagement = new VariantManagement("Two", {});
			var oVM = oVariantManagement._getEmbeddedVM();

			oVariantManagement._oVM._oRolesDialog = {
				destroy() {}
			};
			assert.ok(oVariantManagement._oVM._oRolesDialog);

			oVariantManagement.destroy();
			assert.equal(oVariantManagement._oVM, null);
			assert.equal(oVM._oRolesDialog, null);

			oVM = null;
		});

		QUnit.test("check setHeaderLevel", function(assert) {
			assert.ok(this.oVariantManagement.getHeaderLevel(), "Auto");
			assert.ok(this.oVariantManagement._getEmbeddedVM().oVariantText.getLevel(), "Auto");

			this.oVariantManagement.setHeaderLevel("H1");

			assert.ok(this.oVariantManagement.getHeaderLevel(), "H1");
			assert.ok(this.oVariantManagement._getEmbeddedVM().oVariantText.getLevel(), "H1");
		});

		QUnit.test("check setTitleStyle", function(assert) {
			assert.ok(this.oVariantManagement.getTitleStyle(), "Auto");
			assert.ok(this.oVariantManagement._getEmbeddedVM().oVariantText.getTitleStyle(), "Auto");

			this.oVariantManagement.setTitleStyle("H1");

			assert.ok(this.oVariantManagement.getTitleStyle(), "H1");
			assert.ok(this.oVariantManagement._getEmbeddedVM().oVariantText.getTitleStyle(), "H1");
		});

		QUnit.test("VariantManagement check get-/setShowAsText", function(assert) {
			assert.equal(this.oVariantManagement.getShowAsText(), false, "expected default value");

			assert.ok(this.oVariantManagement.getTitle());
			assert.ok(this.oVariantManagement.getTitle().isA("sap.m.Title"), "expected type 'sap.m.Title'.");

			this.oVariantManagement.setShowAsText(true);
			assert.equal(this.oVariantManagement.getShowAsText(), true, "expected assigned value");

			assert.ok(this.oVariantManagement.getTitle());
			assert.ok(this.oVariantManagement.getTitle().isA("sap.m.Text"), "expected type 'sap.m.Text'.");

			this.oVariantManagement.setShowAsText(false);
			assert.equal(this.oVariantManagement.getShowAsText(), false, "expected assigned value");

			assert.ok(this.oVariantManagement.getTitle());
			assert.ok(this.oVariantManagement.getTitle().isA("sap.m.Title"), "expected type 'sap.m.Title'.");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});