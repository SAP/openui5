/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/P13nDialog",
	"sap/m/P13nGroupPanel",
	"sap/m/P13nFilterPanel",
	"sap/m/P13nSortPanel",
	"sap/m/library",
	"sap/m/P13nPanel",
	"sap/ui/Device",
	"sap/ui/model/resource/ResourceModel",
	"sap/m/P13nDimMeasurePanel",
	"sap/m/P13nColumnsPanel",
	"sap/m/P13nItem",
	"sap/m/P13nColumnsItem"
], function(
	qutils,
	createAndAppendDiv,
	P13nDialog,
	P13nGroupPanel,
	P13nFilterPanel,
	P13nSortPanel,
	mobileLibrary,
	P13nPanel,
	Device,
	ResourceModel,
	P13nDimMeasurePanel,
	P13nColumnsPanel,
	P13nItem,
	P13nColumnsItem
) {
	"use strict";

	// shortcut for sap.m.P13nPanelType
	var P13nPanelType = mobileLibrary.P13nPanelType;


	// prepare DOM
	createAndAppendDiv("content");



	QUnit.module("API", {
		beforeEach: function () {
			this.oP13nDialog = null;
		},
		afterEach: function () {
			sap.ui.Device.system.phone = false;
			this.oP13nDialog.destroy();
		}
	});
	QUnit.test("Constructor (Desktop)", function (assert) {
		sap.ui.Device.system.phone = false;
		this.oP13nDialog = new P13nDialog();

		// assertions
		var done = assert.async();
		this.oP13nDialog._oNavigationControlsPromise.then(function () {

			assert.strictEqual(this.oP13nDialog.getInitialVisiblePanelType(), "");
			assert.strictEqual(this.oP13nDialog.getShowReset(), false);
			assert.strictEqual(this.oP13nDialog.getShowResetEnabled(), false);
			assert.strictEqual(this.oP13nDialog.getValidationExecutor(), null);
			assert.deepEqual(this.oP13nDialog.getPanels(), []);
			assert.strictEqual(this.oP13nDialog.getVisiblePanel(), null);

			assert.strictEqual(this.oP13nDialog.getTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_VIEW_SETTINGS"));
			assert.strictEqual(this.oP13nDialog.getVerticalScrolling(), true, "getVerticalScrolling is true");
			assert.strictEqual(this.oP13nDialog.getButtons().length, 3, "OK, Cancel and Reset buttons");
			assert.strictEqual(this.oP13nDialog.getButtons()[0].getVisible(), true, "OK button is visible");
			assert.strictEqual(this.oP13nDialog.getButtons()[1].getVisible(), true, "Cancel button is visible");
			assert.strictEqual(this.oP13nDialog.getButtons()[2].getVisible(), false, "Reset button is not visible");

			assert.equal(this.oP13nDialog._isNavigationControlExists(), false, "segmented button does not exist");

			// cleanup
			done();
		}.bind(this));
	});
	QUnit.test("Constructor (Phone)", function (assert) {
		sap.ui.Device.system.phone = true;
		this.oP13nDialog = new P13nDialog();

		// assertions
		var done = assert.async();
		this.oP13nDialog._oNavigationControlsPromise.then(function () {
			assert.strictEqual(this.oP13nDialog.getInitialVisiblePanelType(), "");
			assert.strictEqual(this.oP13nDialog.getShowReset(), false);
			assert.strictEqual(this.oP13nDialog.getShowResetEnabled(), false);
			assert.strictEqual(this.oP13nDialog.getValidationExecutor(), null);
			assert.deepEqual(this.oP13nDialog.getPanels(), []);
			assert.strictEqual(this.oP13nDialog.getVisiblePanel(), null);

			assert.strictEqual(this.oP13nDialog.getCustomHeader().getContentMiddle()[0].getText(), sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_VIEW_SETTINGS"));
			assert.strictEqual(this.oP13nDialog.getVerticalScrolling(), false, "getVerticalScrolling is false");
			assert.strictEqual(this.oP13nDialog.getButtons().length, 3, "OK, Cancel and Reset buttons");
			assert.strictEqual(this.oP13nDialog.getButtons()[0].getVisible(), true, "OK button is visible");
			assert.strictEqual(this.oP13nDialog.getButtons()[1].getVisible(), true, "Cancel button is visible");
			assert.strictEqual(this.oP13nDialog.getButtons()[2].getVisible(), false, "Reset button is not visible");

			assert.equal(this.oP13nDialog._isNavigationControlExists(), false, "segmented button does not exist");

			// cleanup
			done();
		}.bind(this));
	});

	QUnit.test("Destroy (Desktop)", function (assert) {
		sap.ui.Device.system.phone = false;
		this.oP13nDialog = new P13nDialog({
			panels: [new P13nFilterPanel(), new P13nSortPanel()]
		});
		fTest01(assert, this.oP13nDialog);
	});
	QUnit.test("Destroy (Phone)", function (assert) {
		sap.ui.Device.system.phone = true;
		this.oP13nDialog = new P13nDialog({
			panels: [new P13nFilterPanel(), new P13nSortPanel()]
		});
		fTest01(assert, this.oP13nDialog);
	});
	var fTest01 = function (assert, oP13nDialog) {
		var done = assert.async();
		oP13nDialog._oNavigationControlsPromise.then(function () {
			// act
			oP13nDialog.destroy();

			// assertions
			assert.deepEqual(oP13nDialog.getPanels(), []);
			assert.deepEqual(oP13nDialog.getContent(), []);
			assert.equal(oP13nDialog.getSubHeader(), null);
//                assert.strictEqual(oP13nDialog.getButtons(), []);

			// cleanup
			done();
		});
	};

	QUnit.test("Show reset (Desktop)", function (assert) {
		sap.ui.Device.system.phone = false;
		this.oP13nDialog = new P13nDialog({
			showReset: true
		});
		fTest02(assert, this.oP13nDialog);
	});
	QUnit.test("Show reset (Phone)", function (assert) {
		sap.ui.Device.system.phone = true;
		this.oP13nDialog = new P13nDialog({
			showReset: true
		});
		fTest02(assert, this.oP13nDialog);
	});
	var fTest02 = function (assert, oP13nDialog) {
		// assertions
		assert.strictEqual(oP13nDialog.getButtons()[2].getVisible(), true, "Reset button is visible");
	};

	// --------------------------------------------------------------------------------------------------
	// ------------------------------ Add one Panel -----------------------------------------------------
	// --------------------------------------------------------------------------------------------------

	QUnit.module("Add one Panel", {
		beforeEach: function () {
			sap.ui.Device.system.phone = false;
			this.oP13nDialog = null;
		},
		afterEach: function () {
			this.oP13nDialog.destroy();
		}
	});
	QUnit.test("without initialVisiblePanelType", function (assert) {
		this.oP13nDialog = new P13nDialog({
			panels: [new P13nFilterPanel()]
		});

		// assertions
		var done = assert.async();
		this.oP13nDialog._oNavigationControlsPromise.then(function () {
			assert.equal(this.oP13nDialog.getPanels().length, 1);
			assert.equal(this.oP13nDialog.getInitialVisiblePanelType(), "");
			assert.equal(this.oP13nDialog._isNavigationControlExpected(), false, "segmented button does not exist for only one panel");
			assert.equal(this.oP13nDialog.getTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_TITLE_FILTER"));
			assert.equal(this.oP13nDialog.getVisiblePanel().getType(), P13nPanelType.filter);
			done();
		}.bind(this));
	});
	QUnit.test("with initialVisiblePanelType", function (assert) {
		this.oP13nDialog = new P13nDialog({
			initialVisiblePanelType: P13nPanelType.filter,
			panels: [new P13nFilterPanel()]
		});

		// assertions
		var done = assert.async();
		this.oP13nDialog._oNavigationControlsPromise.then(function () {
			assert.equal(this.oP13nDialog.getPanels().length, 1);
			assert.equal(this.oP13nDialog.getInitialVisiblePanelType(), P13nPanelType.filter);
			assert.equal(this.oP13nDialog._isNavigationControlExpected(), false, "segmented button does not exist for only one panel");
			assert.equal(this.oP13nDialog.getTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_TITLE_FILTER"));
			assert.equal(this.oP13nDialog.getVisiblePanel().getType(), P13nPanelType.filter);
			done();
		}.bind(this));
	});
	QUnit.test("with not existing initialVisiblePanelType", function (assert) {
		this.oP13nDialog = new P13nDialog({
			initialVisiblePanelType: "columns",
			panels: [new P13nFilterPanel()]
		});

		// assertions
		var done = assert.async();
		this.oP13nDialog._oNavigationControlsPromise.then(function () {
			assert.equal(this.oP13nDialog.getPanels().length, 1);
			assert.equal(this.oP13nDialog.getInitialVisiblePanelType(), "columns");
			assert.equal(this.oP13nDialog._isNavigationControlExpected(), false, "segmented button does not exist for only one panel");
			assert.equal(this.oP13nDialog.getTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_TITLE_FILTER"));
			assert.equal(this.oP13nDialog.getVisiblePanel().getType(), P13nPanelType.filter);
			done();
		}.bind(this));
	});
	QUnit.test("as custom panel", function (assert) {
		var CustomPanel = P13nPanel.extend("CustomPanel", {
			metadata: {},
			constructor: function (sId, mSettings) {
				P13nPanel.apply(this, arguments);
				this.setType("customPanel");
				this.setTitleLarge("Custom Panel Settings");
			},
			renderer: function (oRm, oControl) {
			}
		});
		this.oP13nDialog = new P13nDialog({
			panels: [new CustomPanel()]
		});

		// assertions
		var done = assert.async();
		this.oP13nDialog._oNavigationControlsPromise.then(function () {
			assert.equal(this.oP13nDialog.getPanels().length, 1);
			assert.equal(this.oP13nDialog.getInitialVisiblePanelType(), "");
			assert.equal(this.oP13nDialog._isNavigationControlExpected(), false, "segmented button does not exist for only one panel");
			assert.equal(this.oP13nDialog.getTitle(), "Custom Panel Settings");
			assert.equal(this.oP13nDialog.getVisiblePanel().getType(), "customPanel");
			done();
		}.bind(this));
	});
	QUnit.test("with invisible panel", function (assert) {
		this.oP13nDialog = new P13nDialog({
			panels: [new P13nFilterPanel({visible: false})]
		});

		// assertions
		var done = assert.async();
		this.oP13nDialog._oNavigationControlsPromise.then(function () {
			assert.equal(this.oP13nDialog.getPanels().length, 1);
			assert.equal(this.oP13nDialog.getInitialVisiblePanelType(), "");
			assert.equal(this.oP13nDialog._isNavigationControlExpected(), false, "segmented button does not exist for only one panel");
			assert.equal(this.oP13nDialog.getTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_VIEW_SETTINGS"));
			assert.equal(this.oP13nDialog.getVisiblePanel(), null);
			done();
		}.bind(this));
	});

	// --------------------------------------------------------------------------------------------------
	// ------------------------------ Add more than one Panel -------------------------------------------
	// --------------------------------------------------------------------------------------------------

	QUnit.module("Add more than one Panel", {
		beforeEach: function () {
			sap.ui.Device.system.phone = false;
			this.oP13nDialog = null;
		},
		afterEach: function () {
			this.oP13nDialog.destroy();
		}
	});
	QUnit.test("without initialVisiblePanelType", function (assert) {
		this.oP13nDialog = new P13nDialog({
			panels: [new P13nFilterPanel(), new P13nSortPanel()]
		});

		// assertions
		var done = assert.async();
		this.oP13nDialog._oNavigationControlsPromise.then(function () {
			assert.equal(this.oP13nDialog.getPanels().length, 2);
			assert.strictEqual(this.oP13nDialog.getInitialVisiblePanelType(), "");
			assert.equal(this.oP13nDialog._isNavigationControlExpected(), true);
			assert.equal(this.oP13nDialog.getTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_VIEW_SETTINGS"));
			assert.equal(this.oP13nDialog.getVisiblePanel().getType(), P13nPanelType.filter);

			assert.equal(Device.system.phone, false);
			assert.strictEqual(this.oP13nDialog._getNavigationControl().getSelectedItem(), this.oP13nDialog._getNavigationItemByPanel(this.oP13nDialog.getVisiblePanel()).getId());

			done();
		}.bind(this));
	});
	QUnit.test("with first initialVisiblePanelType", function (assert) {
		this.oP13nDialog = new P13nDialog({
			initialVisiblePanelType: P13nPanelType.filter,
			panels: [new P13nFilterPanel(), new P13nSortPanel()]
		});

		// assertions
		var done = assert.async();
		this.oP13nDialog._oNavigationControlsPromise.then(function () {
			assert.equal(this.oP13nDialog.getPanels().length, 2);
			assert.strictEqual(this.oP13nDialog.getInitialVisiblePanelType(), P13nPanelType.filter);
			assert.equal(this.oP13nDialog._isNavigationControlExpected(), true);
			assert.equal(this.oP13nDialog.getTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_VIEW_SETTINGS"));
			assert.equal(this.oP13nDialog.getVisiblePanel().getType(), P13nPanelType.filter);

			assert.equal(Device.system.phone, false);
			assert.strictEqual(this.oP13nDialog._getNavigationControl().getSelectedItem(), this.oP13nDialog._getNavigationItemByPanel(this.oP13nDialog.getVisiblePanel()).getId());

			done();
		}.bind(this));
	});
	QUnit.test("with second initialVisiblePanelType", function (assert) {
		this.oP13nDialog = new P13nDialog({
			initialVisiblePanelType: P13nPanelType.sort,
			panels: [new P13nFilterPanel(), new P13nSortPanel()]
		});

		// assertions
		var done = assert.async();
		this.oP13nDialog._oNavigationControlsPromise.then(function () {
			assert.equal(this.oP13nDialog.getPanels().length, 2);
			assert.strictEqual(this.oP13nDialog.getInitialVisiblePanelType(), P13nPanelType.sort);
			assert.equal(this.oP13nDialog._isNavigationControlExpected(), true);
			assert.equal(this.oP13nDialog.getTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_VIEW_SETTINGS"));
			assert.equal(this.oP13nDialog.getVisiblePanel().getType(), P13nPanelType.sort);

			assert.equal(Device.system.phone, false);
			assert.strictEqual(this.oP13nDialog._getNavigationControl().getSelectedItem(), this.oP13nDialog._getNavigationItemByPanel(this.oP13nDialog.getVisiblePanel()).getId());

			done();
		}.bind(this));
	});
	QUnit.test("with not existing initialVisiblePanelType", function (assert) {
		this.oP13nDialog = new P13nDialog({
			initialVisiblePanelType: "columns",
			panels: [new P13nFilterPanel(), new P13nSortPanel()]
		});

		// assertions
		var done = assert.async();
		this.oP13nDialog._oNavigationControlsPromise.then(function () {
			assert.equal(this.oP13nDialog.getPanels().length, 2);
			assert.strictEqual(this.oP13nDialog.getInitialVisiblePanelType(), "columns");
			assert.equal(this.oP13nDialog._isNavigationControlExpected(), true);
			assert.equal(this.oP13nDialog.getTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_VIEW_SETTINGS"));
			assert.equal(this.oP13nDialog.getVisiblePanel().getType(), P13nPanelType.filter);

			assert.equal(Device.system.phone, false);
			assert.strictEqual(this.oP13nDialog._getNavigationControl().getSelectedItem(), this.oP13nDialog._getNavigationItemByPanel(this.oP13nDialog.getVisiblePanel()).getId());

			done();
		}.bind(this));
	});
	QUnit.test("with invisible panel", function (assert) {
		this.oP13nDialog = new P13nDialog({
			panels: [new P13nFilterPanel({visible: false}), new P13nSortPanel()]
		});

		// assertions
		var done = assert.async();
		this.oP13nDialog._oNavigationControlsPromise.then(function () {
			assert.equal(this.oP13nDialog.getPanels().length, 2);
			assert.strictEqual(this.oP13nDialog.getInitialVisiblePanelType(), "");
			assert.equal(this.oP13nDialog._isNavigationControlExpected(), false);
			assert.equal(this.oP13nDialog.getTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_TITLE_SORT"));
			assert.equal(this.oP13nDialog.getVisiblePanel().getType(), P13nPanelType.sort);

			assert.equal(Device.system.phone, false);
			assert.strictEqual(this.oP13nDialog._getNavigationControl().getSelectedItem(), this.oP13nDialog._getNavigationItemByPanel(this.oP13nDialog.getVisiblePanel()).getId());

			done();
		}.bind(this));
	});

	QUnit.test("Add two 'P13nColumnsPanel' to the same P13nDialog (both visible)", function (assert) {
		this.oP13nDialog = new P13nDialog({
			panels: [new P13nColumnsPanel(), new P13nColumnsPanel()]
		});

		// arrange
		this.oP13nDialog.placeAt("content");
		this.oP13nDialog.open();
		sap.ui.getCore().applyChanges();

		//assertions
		var done = assert.async();
		this.oP13nDialog._oNavigationControlsPromise.then(function () {
			assert.equal(this.oP13nDialog.getPanels().length, 2);
			assert.strictEqual(this.oP13nDialog.getInitialVisiblePanelType(), "");

			//we expect both panels to be visible, therefore the navigation is required and the dialog needs to display 'View Settings'
			assert.equal(this.oP13nDialog._isNavigationControlExpected(), true);
			assert.equal(this.oP13nDialog.getTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_VIEW_SETTINGS"));
			assert.equal(this.oP13nDialog.getVisiblePanel().getType(), P13nPanelType.columns);

			assert.equal(Device.system.phone, false);
			assert.strictEqual(this.oP13nDialog._getNavigationControl().getSelectedItem(), this.oP13nDialog._getNavigationItemByPanel(this.oP13nDialog.getVisiblePanel()).getId());

			done();
		}.bind(this));
	});

	QUnit.test("Add two 'P13nColumnsPanel' to the same P13nDialog (only one visible)", function (assert) {
		this.oP13nDialog = new P13nDialog({
			panels: [new P13nColumnsPanel(), new P13nColumnsPanel({visible:false})]
		});

		// arrange
		this.oP13nDialog.placeAt("content");
		this.oP13nDialog.open();
		sap.ui.getCore().applyChanges();

		//assertions
		var done = assert.async();
		this.oP13nDialog._oNavigationControlsPromise.then(function () {
			assert.equal(this.oP13nDialog.getPanels().length, 2);
			assert.strictEqual(this.oP13nDialog.getInitialVisiblePanelType(), "");
			assert.equal(this.oP13nDialog._isNavigationControlExpected(), false);

			//same behavior expected as if there were two different panels
			assert.equal(this.oP13nDialog.getTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_TITLE_COLUMNS"));
			assert.equal(this.oP13nDialog.getVisiblePanel().getType(), P13nPanelType.columns);

			assert.equal(Device.system.phone, false);
			assert.strictEqual(this.oP13nDialog._getNavigationControl().getSelectedItem(), this.oP13nDialog._getNavigationItemByPanel(this.oP13nDialog.getVisiblePanel()).getId());

			done();
		}.bind(this));
	});

	QUnit.module("Switch Panel", {
		beforeEach: function () {
			sap.ui.Device.system.phone = false;
			this.oP13nDialog = null;
		},
		afterEach: function () {
			this.oP13nDialog.destroy();
		}
	});
	QUnit.test("from 'filter' to 'sort'", function (assert) {
		this.oP13nDialog = new P13nDialog({
			panels: [new P13nFilterPanel(), new P13nSortPanel()]
		});

		// arrange
		this.oP13nDialog.placeAt("content");
		this.oP13nDialog.open();
		sap.ui.getCore().applyChanges();

		var done = assert.async();
		this.oP13nDialog._oNavigationControlsPromise.then(function () {
			// Pre assertions
			assert.equal(Device.system.phone, false);
			assert.equal(this.oP13nDialog.getVisiblePanel().getType(), P13nPanelType.filter, "Filter panel is visible");

			// act
			var oNavigationItem = this.oP13nDialog._getNavigationItemByPanel(this.oP13nDialog.getPanels()[1]);
			this.oP13nDialog._switchPanel(oNavigationItem);

			// Post assertions
			assert.equal(Device.system.phone, false);
			assert.equal(this.oP13nDialog.getVisiblePanel().getType(), P13nPanelType.sort, "Sort panel is visible");

			done();
		}.bind(this));
	});

	QUnit.module("Binding of 'title'", {
		beforeEach: function () {
			sap.ui.Device.system.phone = false;
			this.oP13nDialog = null;
		},
		afterEach: function () {
			this.oP13nDialog.destroy();
		}
	});
	QUnit.test("test", function (assert) {
		var oP13nPanelF, oP13nPanelS, oP13nPanelD;
		sap.ui.getCore().setModel(new ResourceModel({
			bundleName: "resourceroot.data.i18n.i18n"
		}), "i18n");

		this.oP13nDialog = new P13nDialog({
			panels: [oP13nPanelD = new P13nDimMeasurePanel({
				title: "Without Binding"
			}), oP13nPanelF = new P13nFilterPanel({
				title: "{i18n>FilterTab}"
			}), oP13nPanelS = new P13nSortPanel({
				title: "{i18n>SortTab}"
			})]
		});

		// arrange
		this.oP13nDialog.placeAt("content");
		this.oP13nDialog.open();
		sap.ui.getCore().applyChanges();

		var done = assert.async();
		this.oP13nDialog._oNavigationControlsPromise.then(function () {
			assert.strictEqual(oP13nPanelF.getTitle(), "Filter Settings");
			assert.strictEqual(oP13nPanelS.getTitle(), "Sort Settings");
			assert.strictEqual(oP13nPanelD.getTitle(), "Without Binding");

			assert.strictEqual(this.oP13nDialog._getNavigationItemByPanel(oP13nPanelF).getText(), "Filter Settings");
			assert.strictEqual(this.oP13nDialog._getNavigationItemByPanel(oP13nPanelS).getText(), "Sort Settings");
			assert.strictEqual(this.oP13nDialog._getNavigationItemByPanel(oP13nPanelD).getText(), "Without Binding");

			done();
		}.bind(this));
	});

	QUnit.module("Validation dialog", {
		beforeEach: function () {
			sap.ui.Device.system.phone = false;
			this.oP13nDialog = new P13nDialog({
				panels: [new P13nColumnsPanel(), new P13nGroupPanel()]
			});
			this.oP13nDialog.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oP13nDialog.destroy();
		}
	});
	QUnit.test("show no bullet point for one message", function (assert) {
		// act
		var done = assert.async();
		this.oP13nDialog._showValidationDialog(function () {
		}, [], [
			{
				columnKey: "columnKey1",
				messageType: "Warning",
				messageText: "Dummy Warning..."
			}
		]).then(function () {
			var $Dialog = jQuery.find(".sapMMessageBoxWarning");
			var oDialog = jQuery($Dialog).control(0);

			// assertions
			assert.ok(oDialog);
			assert.strictEqual(oDialog.getContent()[0].getText(), "Dummy Warning..." + "\n" + sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_VALIDATION_MESSAGE_QUESTION"));

			done();
			oDialog.destroy();
		});
	});
	// BCP 1670188253
	QUnit.test("show only one message of many equal messages", function (assert) {
		// act
		var done = assert.async();
		this.oP13nDialog._showValidationDialog(function () {
		}, [], [
			{
				columnKey: "columnKey1",
				messageType: "Warning",
				messageText: "Dummy Warning..."
			}, {
				columnKey: "columnKey2",
				messageType: "Warning",
				messageText: "Dummy Warning..."
			}
		]).then(function () {
			var $Dialog = jQuery.find(".sapMMessageBoxWarning");
			var oDialog = jQuery($Dialog).control(0);

			// assertions
			assert.ok(oDialog);
			assert.strictEqual(oDialog.getContent()[0].getText(), "Dummy Warning..." + "\n" + sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_VALIDATION_MESSAGE_QUESTION"));

			done();
			oDialog.destroy();
		});
	});

	QUnit.test("show no dialog if no messages exist", function (assert) {
		// act
		var done = assert.async();
		this.oP13nDialog._showValidationDialog(function () {
		}, [], []).then(function () {
			var $Dialog = jQuery.find(".sapMMessageBoxWarning");
			var oDialog = jQuery($Dialog).control(0);

			// assertions
			assert.ok(!oDialog);
			done();
		});
	});

	QUnit.test("_prepareMessages", function (assert) {
		var aWarnings = [], aErrors = [];

		// act
		this.oP13nDialog._prepareMessages([], [
			{
				columnKey: "columnKey1",
				messageType: "Error",
				messageText: "A"
			}, {
				columnKey: "columnKey2",
				messageType: "Warning",
				messageText: "B"
			}, {
				columnKey: "columnKey3",
				messageType: "Error",
				messageText: "B"
			}, {
				columnKey: "columnKey4",
				messageType: "Warning",
				messageText: "A"
			}
		], aWarnings, aErrors);

		// assertions
		assert.deepEqual(aWarnings, [
			{
				columnKey: "columnKey4",
				messageType: "Warning",
				messageText: "A"
			}
		]);
		assert.deepEqual(aErrors, [
			{
				columnKey: "columnKey3",
				messageType: "Error",
				messageText: "B"
			}
		]);
	});

	QUnit.module("Stable IDs (Desktop)", {
		beforeEach: function () {
			sap.ui.Device.system.phone = false;
			this.oP13nDialog = new P13nDialog("PD1", {
				panels: [this.oPanel1 = new P13nFilterPanel("P1", {}), this.oPanel2 = new P13nSortPanel("P2", {})]
			});
			this.oP13nDialog.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oP13nDialog.destroy();
			sap.ui.Device.system.phone = false;
		}
	});
	QUnit.test("test", function (assert) {
		// assertions
		var done = assert.async();
		this.oP13nDialog._oNavigationControlsPromise.then(function () {

			assert.equal(this.oP13nDialog.getButtons().length, 3);
			assert.equal(this.oP13nDialog.getButtons()[0].getId(), "PD1-ok");
			assert.equal(this.oP13nDialog.getButtons()[1].getId(), "PD1-cancel");
			assert.equal(this.oP13nDialog.getButtons()[2].getId(), "PD1-reset");

			// Pre assertions
			assert.equal(this.oP13nDialog.getPanels().length, 2);
			assert.equal(this.oP13nDialog.getPanels()[0].getId(), "P1");
			assert.equal(this.oP13nDialog.getPanels()[1].getId(), "P2");

			assert.equal(this.oP13nDialog.getSubHeader().getId(), "PD1-navigationBar");
			assert.equal(this.oP13nDialog.getSubHeader().getContentLeft().length, 1);
			assert.equal(this.oP13nDialog.getSubHeader().getContentLeft()[0].getId(), "PD1-navigationItems");
			assert.equal(this.oP13nDialog.getSubHeader().getContentLeft()[0].getItems().length, 2);
			assert.equal(this.oP13nDialog.getSubHeader().getContentLeft()[0].getItems()[0].getId(), "P1-navItem");
			assert.equal(this.oP13nDialog.getSubHeader().getContentLeft()[0].getItems()[1].getId(), "P2-navItem");

			assert.equal(this.oP13nDialog.getCustomHeader(), null);
			assert.deepEqual(this.oP13nDialog.getContent(), []);

			// act
			this.oP13nDialog.removePanel(this.oPanel2);

			// Post assertions
			assert.equal(this.oP13nDialog.getPanels().length, 1);
			assert.equal(this.oP13nDialog.getPanels()[0].getId(), "P1");
			assert.notOk(!!sap.ui.getCore().byId("P2-navItem"), "navigation item destroyed after removing panel");

			assert.equal(this.oP13nDialog.getSubHeader().getId(), "PD1-navigationBar");
			assert.equal(this.oP13nDialog.getSubHeader().getContentLeft().length, 1);
			assert.equal(this.oP13nDialog.getSubHeader().getContentLeft()[0].getId(), "PD1-navigationItems");
			assert.equal(this.oP13nDialog.getSubHeader().getContentLeft()[0].getItems().length, 1);
			assert.equal(this.oP13nDialog.getSubHeader().getContentLeft()[0].getItems()[0].getId(), "P1-navItem");

			assert.equal(this.oP13nDialog.getCustomHeader(), null);
			assert.deepEqual(this.oP13nDialog.getContent(), []);

			// act
			this.oP13nDialog.insertPanel(this.oPanel2, 0);

			// Post assertions
			assert.equal(this.oP13nDialog.getPanels().length, 2);
			assert.equal(this.oP13nDialog.getPanels()[0].getId(), "P2");
			assert.equal(this.oP13nDialog.getPanels()[1].getId(), "P1");

			assert.equal(this.oP13nDialog.getSubHeader().getId(), "PD1-navigationBar");
			assert.equal(this.oP13nDialog.getSubHeader().getContentLeft().length, 1);
			assert.equal(this.oP13nDialog.getSubHeader().getContentLeft()[0].getId(), "PD1-navigationItems");
			assert.equal(this.oP13nDialog.getSubHeader().getContentLeft()[0].getItems().length, 2);
			assert.equal(this.oP13nDialog.getSubHeader().getContentLeft()[0].getItems()[0].getId(), "P2-navItem");
			assert.equal(this.oP13nDialog.getSubHeader().getContentLeft()[0].getItems()[1].getId(), "P1-navItem");

			assert.equal(this.oP13nDialog.getCustomHeader(), null);
			assert.deepEqual(this.oP13nDialog.getContent(), []);

			done();
		}.bind(this));
	});

	QUnit.module("Stable IDs (Phone)", {
		beforeEach: function () {
			sap.ui.Device.system.phone = true;
			this.oP13nDialog = new P13nDialog("PD1", {
				panels: [this.oPanel1 = new P13nFilterPanel("P1", {}), this.oPanel2 = new P13nSortPanel("P2", {})]
			});
			this.oP13nDialog.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oP13nDialog.destroy();
			sap.ui.Device.system.phone = false;
		}
	});
	QUnit.test("test", function (assert) {
		// assertions
		var done = assert.async();
		this.oP13nDialog._oNavigationControlsPromise.then(function () {

			assert.equal(this.oP13nDialog.getButtons().length, 3);
			assert.equal(this.oP13nDialog.getButtons()[0].getId(), "PD1-ok");
			assert.equal(this.oP13nDialog.getButtons()[1].getId(), "PD1-cancel");
			assert.equal(this.oP13nDialog.getButtons()[2].getId(), "PD1-reset");

			// Pre assertions
			assert.equal(this.oP13nDialog.getPanels().length, 2);
			assert.equal(this.oP13nDialog.getPanels()[0].getId(), "P1");
			assert.equal(this.oP13nDialog.getPanels()[1].getId(), "P2");

			assert.equal(this.oP13nDialog.getSubHeader(), undefined);

			assert.equal(this.oP13nDialog.getCustomHeader().getId(), "PD1-phoneHeader");
			assert.equal(this.oP13nDialog.getCustomHeader().getContentLeft().length, 1);
			assert.equal(this.oP13nDialog.getCustomHeader().getContentLeft()[0].getId(), "PD1-backToList", "Back button");
			assert.equal(this.oP13nDialog.getCustomHeader().getContentMiddle().length, 1);
			assert.equal(this.oP13nDialog.getCustomHeader().getContentMiddle()[0].getId(), "PD1-phoneTitle", "Title");

			assert.equal(this.oP13nDialog.getContent().length, 1);
			assert.equal(this.oP13nDialog.getContent()[0].getId(), "PD1-navigationItems", "ID of List");
			assert.equal(this.oP13nDialog.getContent()[0].getItems().length, 2);
			assert.equal(this.oP13nDialog.getContent()[0].getItems()[0].getId(), "P1-navItem");
			assert.equal(this.oP13nDialog.getContent()[0].getItems()[1].getId(), "P2-navItem");

			// act
			this.oP13nDialog.removePanel(this.oPanel2);

			// Post assertions
			assert.equal(this.oP13nDialog.getPanels().length, 1);
			assert.equal(this.oP13nDialog.getPanels()[0].getId(), "P1");
			assert.notOk(!!sap.ui.getCore().byId("P2-navItem"), "navigation item destroyed after removing panel");

			assert.equal(this.oP13nDialog.getSubHeader(), undefined);

			assert.equal(this.oP13nDialog.getCustomHeader().getId(), "PD1-phoneHeader");
			assert.equal(this.oP13nDialog.getCustomHeader().getContentLeft().length, 1);
			assert.equal(this.oP13nDialog.getCustomHeader().getContentLeft()[0].getId(), "PD1-backToList", "Back button");
			assert.equal(this.oP13nDialog.getCustomHeader().getContentMiddle().length, 1);
			assert.equal(this.oP13nDialog.getCustomHeader().getContentMiddle()[0].getId(), "PD1-phoneTitle", "Title");

			assert.equal(this.oP13nDialog.getContent().length, 1);
			assert.equal(this.oP13nDialog.getContent()[0].getId(), "PD1-navigationItems", "ID of List");
			assert.equal(this.oP13nDialog.getContent()[0].getItems().length, 1);
			assert.equal(this.oP13nDialog.getContent()[0].getItems()[0].getId(), "P1-navItem");

			// act
			this.oP13nDialog.insertPanel(this.oPanel2, 0);

			// Post assertions
			assert.equal(this.oP13nDialog.getPanels().length, 2);
			assert.equal(this.oP13nDialog.getPanels()[0].getId(), "P2");
			assert.equal(this.oP13nDialog.getPanels()[1].getId(), "P1");

			assert.equal(this.oP13nDialog.getSubHeader(), undefined);

			assert.equal(this.oP13nDialog.getCustomHeader().getId(), "PD1-phoneHeader");
			assert.equal(this.oP13nDialog.getCustomHeader().getContentLeft().length, 1);
			assert.equal(this.oP13nDialog.getCustomHeader().getContentLeft()[0].getId(), "PD1-backToList", "Back button");
			assert.equal(this.oP13nDialog.getCustomHeader().getContentMiddle().length, 1);
			assert.equal(this.oP13nDialog.getCustomHeader().getContentMiddle()[0].getId(), "PD1-phoneTitle", "Title");

			assert.equal(this.oP13nDialog.getContent().length, 1);
			assert.equal(this.oP13nDialog.getContent()[0].getId(), "PD1-navigationItems", "ID of List");
			assert.equal(this.oP13nDialog.getContent()[0].getItems().length, 2);
			assert.equal(this.oP13nDialog.getContent()[0].getItems()[0].getId(), "P2-navItem");
			assert.equal(this.oP13nDialog.getContent()[0].getItems()[1].getId(), "P1-navItem");

			done();
		}.bind(this));
	});

	QUnit.module("Desktop: Dialog with initially one panel", {
		beforeEach: function () {
			sap.ui.Device.system.phone = false;
			this.oP13nDialog = new P13nDialog({
				panels: [
					new P13nColumnsPanel({
						items: [new P13nItem({
							text: "Product ID",
							columnKey: "productId"
						}), new P13nItem({
							text: "Name",
							columnKey: "name"
						})],
						columnsItems: [new P13nColumnsItem({
							columnKey: "name",
							visible: true
						})]
					})
				]
			});
		},
		afterEach: function () {
			this.oP13nDialog.destroy();
		}
	});
	QUnit.test("show dialog with one panel", function (assert) {
		// Preconditions
		assert.equal(Device.system.phone, false);
		assert.equal(this.oP13nDialog.getPanels().length, 1);

		this.oP13nDialog.placeAt("content");
		sap.ui.getCore().applyChanges();

		var done = assert.async();
		this.oP13nDialog.attachAfterOpen(function () {
			assert.equal(this.oP13nDialog.getPanels().length, 1);
			assert.equal(this.oP13nDialog.$().find(".sapMDialogSubHeader").length, 1);
			assert.equal(this.oP13nDialog.$().find(".sapMP13nColumnsPanel").length, 1);
			done();
		}.bind(this));

		this.oP13nDialog.open();
	});
	QUnit.test("show dialog after panel has been added", function (assert) {
		// Preconditions
		assert.equal(Device.system.phone, false);
		assert.equal(this.oP13nDialog.getPanels().length, 1);

		this.oP13nDialog.setInitialVisiblePanelType("sort");
		this.oP13nDialog.addPanel(new P13nSortPanel({
			items: [new P13nItem({
				text: "Product ID",
				columnKey: "productId"
			}), new P13nItem({
				text: "Name",
				columnKey: "name"
			})]
		}));

		this.oP13nDialog.placeAt("content");
		sap.ui.getCore().applyChanges();

		var done = assert.async();
		this.oP13nDialog.attachAfterOpen(function () {
			assert.equal(this.oP13nDialog.getPanels().length, 2);
			assert.equal(this.oP13nDialog.$().find(".sapMDialogSubHeader").length, 1);
			assert.equal(this.oP13nDialog.$().find(".sapMSortPanel").length, 1);
			done();
		}.bind(this));

		this.oP13nDialog.open();
	});

	QUnit.module("Phone: Dialog with initially one panel", {
		beforeEach: function () {
			sap.ui.Device.system.phone = true;
			this.oP13nDialog = new P13nDialog({
				panels: [
					new P13nColumnsPanel({
						items: [new P13nItem({
							text: "Product ID",
							columnKey: "productId"
						}), new P13nItem({
							text: "Name",
							columnKey: "name"
						})],
						columnsItems: [new P13nColumnsItem({
							columnKey: "name",
							visible: true
						})]
					})
				]
			});
		},
		afterEach: function () {
			sap.ui.Device.system.phone = false;
			this.oP13nDialog.destroy();
		}
	});

	QUnit.test("show dialog with one panel", function (assert) {
		// Preconditions
		assert.equal(Device.system.phone, true);
		assert.equal(this.oP13nDialog.getPanels().length, 1);

		this.oP13nDialog.placeAt("content");
		sap.ui.getCore().applyChanges();

		var done = assert.async();
		this.oP13nDialog.attachAfterOpen(function () {
			assert.equal(this.oP13nDialog.getPanels().length, 1);
//                    assert.equal(this.oP13nDialog.$().find(".sapMList").length, 0);
			assert.equal(this.oP13nDialog.$().find(".sapMP13nColumnsPanel").length, 1);
			done();
		}.bind(this));

		this.oP13nDialog.open();
	});
	QUnit.test("show dialog after panel has been added", function (assert) {
		// Preconditions
		assert.equal(Device.system.phone, true);
		assert.equal(this.oP13nDialog.getPanels().length, 1);

		this.oP13nDialog.setInitialVisiblePanelType("sort");
		this.oP13nDialog.addPanel(new P13nSortPanel({
			items: [new P13nItem({
				text: "Product ID",
				columnKey: "productId"
			}), new P13nItem({
				text: "Name",
				columnKey: "name"
			})]
		}));

		this.oP13nDialog.placeAt("content");
		sap.ui.getCore().applyChanges();

		var done = assert.async();
		this.oP13nDialog.attachAfterOpen(function () {
			assert.equal(this.oP13nDialog.getPanels().length, 2);
//                    assert.equal(this.oP13nDialog.$().find(".sapMList").length, 1);
			assert.equal(this.oP13nDialog.$().find(".sapMSortPanel").length, 0);
			done();
		}.bind(this));

		this.oP13nDialog.open();
	});


	QUnit.module("Desktop: Dialog with initially more panels", {
		beforeEach: function () {
			this.oP13nDialog = new P13nDialog({
				panels: [
					new P13nColumnsPanel({
						items: [new P13nItem({
							text: "Product ID",
							columnKey: "productId"
						}), new P13nItem({
							text: "Name",
							columnKey: "name"
						})],
						columnsItems: [new P13nColumnsItem({
							columnKey: "name",
							visible: true
						})]
					}),
					new P13nFilterPanel({
						items: [new P13nItem({
							text: "Product ID",
							columnKey: "productId"
						})]
					})
				]
			});
		},
		afterEach: function () {
			this.oP13nDialog.destroy();
		}
	});
	QUnit.test("show dialog with two panel", function (assert) {
		// Preconditions
		assert.equal(Device.system.phone, false);
		assert.equal(this.oP13nDialog.getPanels().length, 2);

		this.oP13nDialog.placeAt("content");
		sap.ui.getCore().applyChanges();

		var done = assert.async();
		this.oP13nDialog.attachAfterOpen(function () {
			assert.equal(this.oP13nDialog.getPanels().length, 2);
			assert.equal(this.oP13nDialog.$().find(".sapMDialogSubHeader").length, 1);
			assert.equal(this.oP13nDialog.$().find(".sapMP13nColumnsPanel").length, 1);
			done();
		}.bind(this));

		this.oP13nDialog.open();
	});
	QUnit.test("show dialog after one panel has been removed", function (assert) {
		// Preconditions
		assert.equal(Device.system.phone, false);
		assert.equal(this.oP13nDialog.getPanels().length, 2);

		this.oP13nDialog.removePanel(this.oP13nDialog.getPanels()[1]);

		this.oP13nDialog.placeAt("content");
		sap.ui.getCore().applyChanges();

		var done = assert.async();
		this.oP13nDialog.attachAfterOpen(function () {
			assert.equal(this.oP13nDialog.getPanels().length, 1);
			assert.equal(this.oP13nDialog.$().find(".sapMDialogSubHeader").length, 1);
			assert.equal(this.oP13nDialog.$().find(".sapMP13nColumnsPanel").length, 1);
			done();
		}.bind(this));

		this.oP13nDialog.open();
	});

});