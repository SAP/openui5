/* global QUnit */

sap.ui.define([
	"sap/ui/fl/variants/VariantManagement", "sap/ui/fl/variants/VariantModel", "sap/ui/fl/Utils", "sap/ui/layout/Grid", "sap/m/OverflowToolbar", "sap/m/Input", "sap/m/RadioButton", "sap/ui/core/Icon", "sap/ui/thirdparty/jquery", "sap/ui/thirdparty/sinon-4"
], function(VariantManagement, VariantModel, flUtils, Grid, OverflowToolbar, Input, RadioButton, Icon, jQuery, sinon) {
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
		beforeEach: function() {
			this.oVariantManagement = new VariantManagement("One", {});

			oModel = new VariantModel({
				One: {
					currentVariant: "Standard",
					originalCurrentVariant: "Standard",
					defaultVariant: "Standard",
					originalDefaultVariant: "Standard",
					modified: false,
					variantsEditable: true,
					showFavorites: true,
					variants: [
						{
							key: "Standard",
							title: "Standard",
							author: "A",
							layer: "VENDOR",
							favorite: true,
							originalFavorite: true,
							visible: true
						}, {
							key: "1",
							title: "One",
							author: "A",
							layer: "USER",
							favorite: true,
							originalFavorite: true,
							visible: true
						}, {
							key: "2",
							title: "Two",
							author: "V",
							layer: "CUSTOMER",
							favorite: true,
							originalFavorite: true,
							visible: true
						}, {
							key: "3",
							title: "Three",
							author: "U",
							layer: "CUSTOMER",
							favorite: true,
							originalFavorite: true,
							visible: true
						}, {
							key: "4",
							title: "Four",
							author: "Z",
							layer: "PARTNER",
							favorite: true,
							originalFavorite: true,
							visible: true
						}
					]
				}
			}, {
				setVariantSwitchPromise: function() {},
				_oChangePersistence: {
					_oVariantController: {
						assignResetMapListener: function() {
						}
					}
				}
			});

			sinon.stub(oModel, "updateCurrentVariant").returns(Promise.resolve());
			// to suppress "manage" event listener in VariantModel
			sinon.stub(oModel, "_initializeManageVariantsEvents");
			oModel.fnManageClick = function() {
			};
		},
		afterEach: function() {
			this.oVariantManagement.destroy();
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
			this.oVariantManagement.destroy();

			assert.ok(!this.oVariantManagement._oRb);
		});

		QUnit.test("Check rendering", function(assert) {
			var sString = "";
			var oRm = {
				write: function(s) {
					sString += s;
				},
				writeControlData: function() {
				},
				addClass: function(s) {
					sString += ('class=\"' + s + '\"');
				},
				writeClasses: function() {
				},
				writeAccessibilityState: function() {
				},
				renderControl: function() {
				}
			};

			var oRenderer = this.oVariantManagement.getMetadata().getRenderer();
			assert.ok(oRenderer);
			oRenderer.render(oRm, this.oVariantManagement);
			assert.ok(sString);
		});

		QUnit.test("Check getFocusDomRef", function(assert) {
			assert.ok(this.oVariantManagement.oVariantPopoverTrigger);
			sinon.stub(this.oVariantManagement.oVariantPopoverTrigger, "getFocusDomRef");

			this.oVariantManagement.getFocusDomRef();

			assert.ok(this.oVariantManagement.oVariantPopoverTrigger.getFocusDomRef.called);
		});

		QUnit.test("Check onclick", function(assert) {
			assert.ok(this.oVariantManagement.oVariantPopoverTrigger);
			sinon.stub(this.oVariantManagement.oVariantPopoverTrigger, "focus");

			sinon.stub(this.oVariantManagement, "handleOpenCloseVariantPopover");

			this.oVariantManagement.onclick({});

			assert.ok(this.oVariantManagement.oVariantPopoverTrigger.focus.called);
			assert.ok(this.oVariantManagement.handleOpenCloseVariantPopover.called);
		});

		QUnit.test("Check onkeyup", function(assert) {
			sinon.stub(this.oVariantManagement, "_openVariantList");

			this.oVariantManagement.onkeyup({
				which: 32
			});

			assert.ok(this.oVariantManagement._openVariantList.called);
		});

		QUnit.test("Check getTitle", function(assert) {
			assert.equal(this.oVariantManagement.getTitle(), this.oVariantManagement.oVariantText);
		});

		QUnit.test("Check getVariants", function(assert) {
			var aItems = this.oVariantManagement.getVariants();
			assert.ok(aItems);
			assert.equal(aItems.length, 0);

			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);

			aItems = this.oVariantManagement.getVariants();
			assert.ok(aItems);
			assert.equal(aItems.length, 5);
			assert.equal(aItems[0].key, this.oVariantManagement.getStandardVariantKey());
			assert.equal(aItems[1].key, "1");
			assert.equal(aItems[1].visible, true);
			assert.equal(aItems[1].originalTitle, aItems[1].title);
			assert.equal(aItems[2].key, "2");
		});

		QUnit.test("Check acc text", function(assert) {
			var oConfiguration = sap.ui.getCore().getConfiguration();
			var sLanguage = oConfiguration.getLanguage();

			oConfiguration.setLanguage("en_EN");

			this.oVariantManagement._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");

			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);

			assert.equal(this.oVariantManagement.oVariantInvisibleText.getText(), "View Standard. To open, press spacebar.");

			this.oVariantManagement.setCurrentVariantKey("2");
			assert.equal(this.oVariantManagement.oVariantInvisibleText.getText(), "View Two. To open, press spacebar.");

			oConfiguration.setLanguage(sLanguage);
		});

		QUnit.test("Check 'initialized' event", function(assert) {
			var bInitialized = false;

			this.oVariantManagement.attachInitialized(function() {
				bInitialized = true;
			});
			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);

			assert.ok(bInitialized);
		});

		QUnit.test("Check setDefaultVariantKey", function(assert) {
			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);

			assert.equal(this.oVariantManagement.getDefaultVariantKey(), "Standard");

			this.oVariantManagement.setDefaultVariantKey("3");

			assert.equal(this.oVariantManagement.getDefaultVariantKey(), "3");
		});

		QUnit.test("Check _checkVariantNameConstraints", function(assert) {
			var oInput = new Input();

			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);

			oInput.setValue("New");
			this.oVariantManagement._checkVariantNameConstraints(oInput, null, "1");
			assert.equal(oInput.getValueState(), "None");

			oInput.setValue("");
			this.oVariantManagement._checkVariantNameConstraints(oInput, null, "1");
			assert.equal(oInput.getValueState(), "Error");

			oInput.setValue("One");
			this.oVariantManagement._checkVariantNameConstraints(oInput, null, "1");
			assert.equal(oInput.getValueState(), "None");

			this.oVariantManagement._checkVariantNameConstraints(oInput, null, "2");
			assert.equal(oInput.getValueState(), "Error");
			oInput.destroy();
		});

		QUnit.test("Create Variants List", function(assert) {
			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);

			assert.ok(!this.oVariantManagement.oVariantPopOver);
			this.oVariantManagement._createVariantList();

			assert.ok(this.oVariantManagement.oVariantPopOver);
			sinon.stub(this.oVariantManagement.oVariantPopOver, "openBy");

			assert.equal(this.oVariantManagement.getCurrentVariantKey(), this.oVariantManagement.getStandardVariantKey());

			this.oVariantManagement._openVariantList();

			assert.ok(!this.oVariantManagement.oVariantSaveBtn.getVisible());
			assert.ok(this.oVariantManagement.oVariantSaveAsBtn.getVisible());

			this.oVariantManagement._openVariantList();

			assert.ok(!this.oVariantManagement.getModified());
			assert.ok(!this.oVariantManagement.oVariantSaveBtn.getVisible());
			assert.ok(this.oVariantManagement.oVariantSaveAsBtn.getVisible());

			this.oVariantManagement.setModified(true);
			assert.ok(this.oVariantManagement.getModified());
			assert.ok(this.oVariantManagement.oVariantSaveBtn.getVisible());
			assert.ok(this.oVariantManagement.oVariantSaveAsBtn.getVisible());

			this.oVariantManagement.setCurrentVariantKey("4");
			this.oVariantManagement._openVariantList();
			assert.ok(!this.oVariantManagement.oVariantSaveBtn.getVisible());
			assert.ok(this.oVariantManagement.oVariantSaveAsBtn.getVisible());

			this.oVariantManagement.setCurrentVariantKey("1");
			this.oVariantManagement._openVariantList();
			assert.ok(this.oVariantManagement.oVariantSaveBtn.getVisible());
			assert.ok(this.oVariantManagement.oVariantSaveAsBtn.getVisible());
		});

		QUnit.test("Create Variants List with favorited Standard", function(assert) {
			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);

			assert.ok(!this.oVariantManagement.oVariantPopOver);
			this.oVariantManagement._createVariantList();

			assert.ok(this.oVariantManagement.oVariantPopOver);
			sinon.stub(this.oVariantManagement.oVariantPopOver, "openBy");

			assert.equal(this.oVariantManagement.getCurrentVariantKey(), this.oVariantManagement.getStandardVariantKey());

			this.oVariantManagement._openVariantList();

			assert.equal(this.oVariantManagement._oVariantList.getItems()[0].getText(), "Standard");

			var aFilters = this.oVariantManagement._getFilters();
			assert.equal(aFilters.length, 2);
			assert.equal(aFilters[0].sPath, "visible");
			assert.equal(aFilters[1].sPath, "favorite");
		});

		QUnit.test("Create Variants List with non favorited Standard", function(assert) {
			oModel.oData.One.variants[0].favorite = false;

			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);

			assert.ok(!this.oVariantManagement.oVariantPopOver);
			this.oVariantManagement._createVariantList();

			assert.ok(this.oVariantManagement.oVariantPopOver);
			sinon.stub(this.oVariantManagement.oVariantPopOver, "openBy");

			assert.equal(this.oVariantManagement.getCurrentVariantKey(), this.oVariantManagement.getStandardVariantKey());

			this.oVariantManagement._openVariantList();

			assert.equal(this.oVariantManagement._oVariantList.getItems()[0].getText(), "One");
		});

		QUnit.test("Check 'variantsEditable'", function(assert) {
			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);
			this.oVariantManagement._openVariantList();

			assert.ok(this.oVariantManagement.oVariantSelectionPage.getShowFooter());

			var oData = this.oVariantManagement.getBindingContext(flUtils.VARIANT_MODEL_NAME).getObject();
			oData.variantsEditable = !oData.variantsEditable;

			oModel.checkUpdate(true);

			assert.ok(!this.oVariantManagement.oVariantSelectionPage.getShowFooter());
		});


		QUnit.test("Check 'variantBusy'", function(assert) {
			var oInput = new Input();

			this.oVariantManagement.addAssociation("for", oInput);

			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);
			this.oVariantManagement._openVariantList();

			assert.ok(!oInput.getBusy());

			var oData = this.oVariantManagement.getBindingContext(flUtils.VARIANT_MODEL_NAME).getObject();
			oData.variantBusy = !oData.variantBusy;

			oModel.checkUpdate(true);

			assert.ok(oInput.getBusy());

			oData.variantBusy = !oData.variantBusy;
			oModel.checkUpdate(true);

			assert.ok(!oInput.getBusy());


			oInput.destroy();
		});

		QUnit.test("Check 'editable'", function(assert) {
			assert.ok(this.oVariantManagement.getEditable());

			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);
			this.oVariantManagement._openVariantList();

			assert.ok(this.oVariantManagement.oVariantSelectionPage.getShowFooter());

			this.oVariantManagement.setEditable(false);
			assert.ok(!this.oVariantManagement.getEditable());

			var oInnerModel = this.oVariantManagement.getModel(VariantManagement.INNER_MODEL_NAME);
			oInnerModel.checkUpdate(true);

			assert.ok(!this.oVariantManagement.oVariantSelectionPage.getShowFooter());
		});

		QUnit.test("Create SaveAs Dialog", function(assert) {
			assert.ok(!this.oVariantManagement.oSaveAsDialog);
			this.oVariantManagement._createSaveAsDialog();

			assert.ok(this.oVariantManagement.oSaveAsDialog);
			sinon.stub(this.oVariantManagement.oSaveAsDialog, "open");

			this.oVariantManagement._openSaveAsDialog();

			assert.ok(this.oVariantManagement.oInputName.getVisible());
			assert.ok(!this.oVariantManagement.oLabelKey.getVisible());
			assert.ok(!this.oVariantManagement.oInputManualKey.getVisible());

			var oGrid = fGetGrid(this.oVariantManagement.oSaveAsDialog);
			var oGridContent = oGrid.getContent();
			assert.ok(oGridContent);
			assert.equal(oGridContent.length, 1);

			this.oVariantManagement.oSaveAsDialog.destroy();
			this.oVariantManagement.oSaveAsDialog = undefined;
			this.oVariantManagement.oExecuteOnSelect.destroy();

			this.oVariantManagement.setShowExecuteOnSelection(true);
			this.oVariantManagement._createSaveAsDialog();

			assert.ok(this.oVariantManagement.oSaveAsDialog);
			sinon.stub(this.oVariantManagement.oSaveAsDialog, "open");

			this.oVariantManagement._openSaveAsDialog();
			oGrid = fGetGrid(this.oVariantManagement.oSaveAsDialog);
			oGridContent = oGrid.getContent();
			assert.ok(oGridContent);
			assert.equal(oGridContent.length, 2);

			assert.ok(!this.oVariantManagement.getManualVariantKey());
			assert.ok(!this.oVariantManagement.oInputManualKey.getVisible());
			assert.ok(!this.oVariantManagement.oLabelKey.getVisible());

			this.oVariantManagement.setManualVariantKey(true);
			this.oVariantManagement._openSaveAsDialog();

			assert.ok(this.oVariantManagement.oInputManualKey.getVisible());
			assert.ok(this.oVariantManagement.oLabelKey.getVisible());
		});

		QUnit.test("Checking _handleVariantSaveAs", function(assert) {
			sinon.stub(oModel, "_handleSave");
			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);

			var bCalled = false;
			this.oVariantManagement.attachSave(function() {
				bCalled = true;
			});

			this.oVariantManagement._createSaveAsDialog();

			assert.ok(this.oVariantManagement.oSaveAsDialog);
			sinon.stub(this.oVariantManagement.oSaveAsDialog, "open");

			this.oVariantManagement._openSaveAsDialog();
			assert.equal(this.oVariantManagement.oInputName.getValueState(), "Error");

			var aItems = this.oVariantManagement._getItems();
			assert.ok(aItems);
			assert.equal(aItems.length, 5);

			this.oVariantManagement._handleVariantSaveAs("1");
			assert.ok(bCalled);
			assert.ok(oModel._handleSave.calledOnce);

			this.oVariantManagement._handleVariantSaveAs(" ");
			assert.equal(this.oVariantManagement.oInputName.getValueState(), "Error");

			this.oVariantManagement.setManualVariantKey(true);
			this.oVariantManagement._handleVariantSaveAs("1");
			assert.equal(this.oVariantManagement.oInputManualKey.getValueState(), "Error");
		});

		QUnit.test("Checking _handleVariantSave", function(assert) {
			sinon.stub(oModel, "_handleSave");
			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);

			var bCalled = false;
			this.oVariantManagement.attachSave(function() {
				bCalled = true;
			});

			this.oVariantManagement._createSaveAsDialog();

			assert.ok(this.oVariantManagement.oSaveAsDialog);
			sinon.stub(this.oVariantManagement.oSaveAsDialog, "open");

			this.oVariantManagement.setCurrentVariantKey("1");

			this.oVariantManagement._openSaveAsDialog();

			this.oVariantManagement._handleVariantSave();
			assert.ok(bCalled);
			assert.ok(oModel._handleSave.calledOnce);
		});

		QUnit.test("Checking openManagementDialog", function(assert) {
			var bDestroy = false;
			this.oVariantManagement.oManagementDialog = {
				destroy: function() {
					bDestroy = true;
				}
			};

			sinon.stub(this.oVariantManagement, "_openManagementDialog");

			this.oVariantManagement.openManagementDialog();
			assert.ok(this.oVariantManagement._openManagementDialog.calledOnce);
			assert.ok(!bDestroy);

			this.oVariantManagement.openManagementDialog(true);
			assert.ok(this.oVariantManagement._openManagementDialog.calledTwice);
			assert.ok(bDestroy);
			assert.equal(this.oVariantManagement.oManagementDialog, undefined);
		});

		QUnit.test("Checking create management dialog", function(assert) {
			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);

			this.oVariantManagement._createManagementDialog();

			openDialogAndCheckContent(this.oVariantManagement, assert);
		});

		QUnit.test("Checking create management dialog, when dialog already exists", function(assert) {
			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);

			this.oVariantManagement._createManagementDialog();

			this.oVariantManagement._createManagementDialog();

			openDialogAndCheckContent(this.oVariantManagement, assert);
		});

		QUnit.test("Checking create management dialog, when dialog is already destroyed", function(assert) {
			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);

			this.oVariantManagement._createManagementDialog();

			this.oVariantManagement.getManageDialog().destroy();

			this.oVariantManagement._createManagementDialog();

			openDialogAndCheckContent(this.oVariantManagement, assert);
		});

		QUnit.test("Checking _handleManageDefaultVariantChange", function(assert) {
			var bEnabled = false;
			sinon.stub(this.oVariantManagement, "_anyInErrorState").returns(false);

			this.oVariantManagement.oManagementSave = {
				setEnabled: function() {
					bEnabled = true;
				}
			};

			this.oVariantManagement._handleManageDefaultVariantChange(null, "1");
			assert.ok(bEnabled);

			this.oVariantManagement._anyInErrorState.restore();
			sinon.stub(this.oVariantManagement, "_anyInErrorState").returns(true);
			bEnabled = false;
			this.oVariantManagement._handleManageDefaultVariantChange(null, "1");
			assert.ok(!bEnabled);

			this.oVariantManagement.oManagementSave = undefined;
		});

		QUnit.test("Checking _handleManageDefaultVariantChange, ensure favorites are flagged for default variant", function(assert) {
			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);

			var oItem = this.oVariantManagement._getItemByKey("1");

			sinon.stub(this.oVariantManagement, "_setFavoriteIcon");
			sinon.stub(this.oVariantManagement, "_anyInErrorState").returns(false);

			this.oVariantManagement.oManagementSave = {
				setEnabled: function() {
				}
			};

			var oDefaultRadioButton = new RadioButton();

			oDefaultRadioButton.getParent = function() {
				return {
					getCells: function() {
						return [
							"ICON"
						];
					}
				};
			};

			assert.ok(oItem.favorite);
			this.oVariantManagement._handleManageDefaultVariantChange(oDefaultRadioButton, oItem);
			assert.ok(oItem.favorite);

			oItem.favorite = false;
			assert.ok(!oItem.favorite);
			this.oVariantManagement._handleManageDefaultVariantChange(oDefaultRadioButton, oItem);
			assert.ok(oItem.favorite);

			this.oVariantManagement.oManagementSave = undefined;
			oDefaultRadioButton.destroy();
		});

		QUnit.test("Checking _handleManageCancelPressed", function(assert) {
			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);

			var oItemDel = this.oVariantManagement._getItemByKey("1");
			var oItemRen = this.oVariantManagement._getItemByKey("3");

			var aItems = this.oVariantManagement._getItems();
			assert.ok(aItems);
			assert.equal(aItems.length, 5);

			// oItemDel.visible = false;
			oItemRen.title = "Not Three";

			this.oVariantManagement._createManagementDialog();
			assert.ok(this.oVariantManagement.oManagementDialog);
			sinon.stub(this.oVariantManagement.oManagementDialog, "open");

			this.oVariantManagement._openManagementDialog();

			assert.ok(oItemDel.visible);
			this.oVariantManagement._handleManageDeletePressed(oItemDel);
			assert.ok(!oItemDel.visible);

			var aRows = this.oVariantManagement.oManagementTable.getItems();
			assert.ok(aRows);
			assert.equal(aRows.length, 5);

			this.oVariantManagement._handleManageCancelPressed();
			assert.ok(oItemDel.visible);


			this.oVariantManagement._openManagementDialog();
			aRows = this.oVariantManagement.oManagementTable.getItems();
			assert.ok(aRows);
			assert.equal(aRows.length, 5);

			var oItem = this.oVariantManagement._getItemByKey("3");
			assert.ok(oItem);
			assert.equal(oItem.title, "Three");
			assert.equal(oItem.originalTitle, oItem.title);
		});

		QUnit.test("Checking _handleManageSavePressed; deleted item is NOT selected", function(assert) {
			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);

			this.oVariantManagement.attachManage(function() {
				var aDelItems = [];
				var aRenamedItems = [];
				var oData = this.oVariantManagement.getBindingContext(flUtils.VARIANT_MODEL_NAME).getObject();

				oData["variants"].forEach(function(oItem) {
					if (!oItem.visible) {
						aDelItems.push(oItem.key);
					} else if (oItem.title !== oItem.originalTitle) {
						aRenamedItems.push(oItem.key);
					}
				});

				assert.ok(aDelItems);
				assert.equal(aDelItems.length, 2);
				assert.equal(aDelItems[0], "1");
				assert.equal(aDelItems[1], "4");

				assert.ok(aRenamedItems);
				assert.equal(aRenamedItems.length, 1);
				assert.equal(aRenamedItems[0], "3");
				assert.equal(oData["variants"][aRenamedItems[0]].title, "New 3");
			}.bind(this));

			this.oVariantManagement._createManagementDialog();
			assert.ok(this.oVariantManagement.oManagementDialog);
			sinon.stub(this.oVariantManagement.oManagementDialog, "open");

			this.oVariantManagement._openManagementDialog();

			var oItemRen = this.oVariantManagement._getItemByKey("3");
			assert.ok(oItemRen);
			oItemRen.title = "New 3";
			this.oVariantManagement._handleManageTitleChanged(oItemRen);

			var oItemDel = this.oVariantManagement._getItemByKey("1");
			assert.ok(oItemDel);

			oItemDel.title = "New 1";
			this.oVariantManagement._handleManageTitleChanged(oItemDel);

			this.oVariantManagement._handleManageDeletePressed(oItemDel);
			this.oVariantManagement._handleManageDeletePressed(this.oVariantManagement._getItemByKey("4"));

			this.oVariantManagement._handleManageSavePressed();

			assert.ok(!this.oVariantManagement.bFireSelect);
		});

		QUnit.test("Checking _handleManageSavePressed; deleted item is selected", function(assert) {
			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);

			this.oVariantManagement.attachManage(function() {
				var aDelItems = [];
				var aRenamedItems = [];
				var aFavItems = [];

				var oData = this.oVariantManagement.getBindingContext(flUtils.VARIANT_MODEL_NAME).getObject();

				oData["variants"].forEach(function(oItem) {
					if (!oItem.visible) {
						aDelItems.push(oItem.key);
					} else {
						if (oItem.title !== oItem.originalTitle) {
							aRenamedItems.push(oItem.key);
						}
						if (oItem.favorite !== oItem.originalFavorite) {
							aFavItems.push(oItem.key);
						}
					}
				});

				assert.ok(aDelItems);
				assert.equal(aDelItems.length, 2);
				assert.equal(aDelItems[0], "1");
				assert.equal(aDelItems[1], "2");

				assert.ok(aRenamedItems);
				assert.equal(aRenamedItems.length, 1);
				assert.equal(aRenamedItems[0], "3");
				assert.equal(oData["variants"][aRenamedItems[0]].title, "New 3");

				assert.ok(aFavItems);
				assert.equal(aFavItems.length, 1);
				assert.equal(aFavItems[0], "4");
				assert.ok(!oData["variants"][aFavItems[0]].favorite);
			}.bind(this));

			this.oVariantManagement._createManagementDialog();
			assert.ok(this.oVariantManagement.oManagementDialog);
			sinon.stub(this.oVariantManagement.oManagementDialog, "open");

			this.oVariantManagement._openManagementDialog();

			var oItemRen = this.oVariantManagement._getItemByKey("3");
			assert.ok(oItemRen);
			oItemRen.title = "New 3";
			this.oVariantManagement._handleManageTitleChanged(oItemRen);

			var oItemDel = this.oVariantManagement._getItemByKey("1");
			assert.ok(oItemDel);

			oItemDel.title = "New 1";
			this.oVariantManagement._handleManageTitleChanged(oItemDel);

			this.oVariantManagement._handleManageDeletePressed(oItemDel);
			this.oVariantManagement._handleManageDeletePressed(this.oVariantManagement._getItemByKey("2"));

			var oItemFav = this.oVariantManagement._getItemByKey("4");
			assert.ok(oItemFav);
			this.oVariantManagement._handleManageFavoriteChanged(null, oItemFav);

			this.oVariantManagement.setCurrentVariantKey("1");

			this.oVariantManagement._handleManageSavePressed();

			assert.equal(this.oVariantManagement.getCurrentVariantKey(), this.oVariantManagement.getStandardVariantKey());
		});

		QUnit.test("Checking _triggerSearch", function(assert) {
			var oEvent = {
				params: {
					newValue: "e"
				},
				getParameters: function() {
					return this.params;
				}
			};

			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);
			this.oVariantManagement._createVariantList();
			var aItems = this.oVariantManagement._oVariantList.getItems();
			assert.ok(aItems);
			assert.equal(aItems.length, 5);

			sinon.spy(this.oVariantManagement._oVariantList, "getBinding");

			this.oVariantManagement._triggerSearch(null, this.oVariantManagement._oVariantList);
			assert.ok(!this.oVariantManagement._oVariantList.getBinding.called);

			this.oVariantManagement._triggerSearch({
				getParameters: function() {
					return null;
				}
			}, this.oVariantManagement._oVariantList);
			assert.ok(!this.oVariantManagement._oVariantList.getBinding.called);

			this.oVariantManagement._triggerSearch(oEvent, this.oVariantManagement._oVariantList);
			assert.ok(this.oVariantManagement._oVariantList.getBinding.called);
			aItems = this.oVariantManagement._oVariantList.getItems();
			assert.ok(aItems);
			assert.equal(aItems.length, 2);
		});

		QUnit.test("Checking _setFavoriteIcon", function(assert) {
			var oIcon = new Icon();

			this.oVariantManagement._setFavoriteIcon(oIcon, true);
			assert.equal(oIcon.getSrc(), "sap-icon://favorite");

			this.oVariantManagement._setFavoriteIcon(oIcon, false);
			assert.equal(oIcon.getSrc(), "sap-icon://unfavorite");
		});

		QUnit.test("Checking handleOpenCloseVariantPopover ", function(assert) {
			var bListClosed = false;
			var bErrorListClosed = false;

			sinon.stub(this.oVariantManagement, "_openVariantList");

			this.oVariantManagement.bPopoverOpen = true;
			this.oVariantManagement.handleOpenCloseVariantPopover();
			assert.ok(!this.oVariantManagement._openVariantList.called);

			this.oVariantManagement.bPopoverOpen = false;
			this.oVariantManagement.handleOpenCloseVariantPopover();
			assert.ok(this.oVariantManagement._openVariantList.calledOnce);

			// -
			this.oVariantManagement._openVariantList.restore();
			sinon.stub(this.oVariantManagement, "_openVariantList");

			this.oVariantManagement.oVariantPopOver = {
				isOpen: function() {
					return true;
				},
				close: function() {
					bListClosed = true;
				}
			};
			this.oVariantManagement.bPopoverOpen = true;

			this.oVariantManagement.handleOpenCloseVariantPopover();
			assert.ok(!this.oVariantManagement._openVariantList.called);
			assert.ok(bListClosed);
			assert.ok(!bErrorListClosed);

			// --
			bListClosed = false;
			this.oVariantManagement.oVariantPopOver = null;
			this.oVariantManagement.oErrorVariantPopOver = {
				isOpen: function() {
					return true;
				},
				close: function() {
					bErrorListClosed = true;
				}
			};
			this.oVariantManagement.handleOpenCloseVariantPopover();
			assert.ok(!this.oVariantManagement._openVariantList.called);
			assert.ok(!bListClosed);
			assert.ok(!bErrorListClosed);

			// -
			this.oVariantManagement.setInErrorState(true);
			this.oVariantManagement.handleOpenCloseVariantPopover();
			assert.ok(!this.oVariantManagement._openVariantList.called);
			assert.ok(!bListClosed);
			assert.ok(bErrorListClosed);
		});

		QUnit.test("Checking _openVariantList in errorState", function(assert) {
			this.oVariantManagement.setInErrorState(true);
			assert.ok(!this.oVariantManagement.oErrorVariantPopOver);
			this.oVariantManagement._openVariantList();
			assert.ok(this.oVariantManagement.oErrorVariantPopOver);

			this.oVariantManagement.oErrorVariantPopOver.destroy();
			this.oVariantManagement.oErrorVariantPopOver = null;
		});

		QUnit.test("Checking _openInErrorState", function(assert) {
			assert.ok(!this.oVariantManagement.oErrorVariantPopOver);
			this.oVariantManagement._openInErrorState();
			assert.ok(this.oVariantManagement.oErrorVariantPopOver);

			this.oVariantManagement.oErrorVariantPopOver.destroy();
			this.oVariantManagement.oErrorVariantPopOver = null;
		});

		QUnit.test("Checking _triggerSearchInManageDialog", function(assert) {
			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);

			assert.ok(!this.oVariantManagement._bDeleteOccured);

			this.oVariantManagement._createManagementDialog();
			this.oVariantManagement._triggerSearchInManageDialog(null, this.oVariantManagement.oManagementTable);
			assert.ok(!this.oVariantManagement._bDeleteOccured);

			var oEvent = {
				getParameters: function() {
					return null;
				}
			};
			this.oVariantManagement._triggerSearchInManageDialog(oEvent, this.oVariantManagement.oManagementTable);
			assert.ok(!this.oVariantManagement._bDeleteOccured);

			sinon.stub(oEvent, "getParameters").returns({});

			this.oVariantManagement._triggerSearchInManageDialog(oEvent, this.oVariantManagement.oManagementTable);
			assert.ok(this.oVariantManagement._bDeleteOccured);
		});

		QUnit.test("Checking _handleManageExecuteOnSelectionChanged ", function(assert) {
			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);
			this.oVariantManagement._createManagementDialog();

			this.oVariantManagement._handleManageExecuteOnSelectionChanged({});
			assert.ok(this.oVariantManagement.oManagementSave.getEnabled());
		});

		QUnit.test("Checking _handleManageSavePressed; deleted item is default variant and Standard marked as non favorite", function(assert) {
			oModel.oData.One.variants[0].favorite = false;
			oModel.oData.One.currentVariant = "1";
			oModel.oData.One.defaultVariant = "1";

			this.oVariantManagement.setModel(oModel, flUtils.VARIANT_MODEL_NAME);

			this.oVariantManagement._createManagementDialog();
			assert.ok(this.oVariantManagement.oManagementDialog);
			sinon.stub(this.oVariantManagement.oManagementDialog, "open");


			this.oVariantManagement._openManagementDialog();

			assert.equal(this.oVariantManagement.getDefaultVariantKey(), "1");
			var oItem = this.oVariantManagement._getItemByKey("Standard");
			assert.ok(oItem);
			assert.ok(!oItem.favorite);

			this.oVariantManagement._handleManageDeletePressed(this.oVariantManagement._getItemByKey("1"));

			assert.equal(this.oVariantManagement.getDefaultVariantKey(), "Standard");
			oItem = this.oVariantManagement._getItemByKey("Standard");
			assert.ok(oItem);
			assert.ok(oItem.favorite);
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
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
