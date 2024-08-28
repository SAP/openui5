sap.ui.define([
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Lib",
	"sap/ui/core/Theming",
	"sap/m/List",
	"sap/m/table/Util",
	"sap/m/Table",
	"sap/ui/core/theming/Parameters",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONListBinding",
	"sap/ui/model/odata/type/Boolean",
	"sap/ui/model/odata/type/Byte",
	"sap/ui/model/odata/type/Date",
	"sap/ui/model/odata/type/DateTime",
	"sap/ui/model/odata/type/DateTimeWithTimezone",
	"sap/ui/model/odata/type/Decimal",
	"sap/ui/model/odata/type/Double",
	"sap/ui/model/odata/type/Single",
	"sap/ui/model/odata/type/Guid",
	"sap/ui/model/odata/type/Int16",
	"sap/ui/model/odata/type/Int32",
	"sap/ui/model/odata/type/Int64",
	"sap/ui/model/odata/type/SByte",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/type/Time",
	"sap/ui/model/odata/type/TimeOfDay",
	"sap/ui/model/odata/v2/ODataListBinding",
	"sap/ui/core/InvisibleMessage",
	"sap/m/Text",
	"sap/m/HBox"
], function(nextUIUpdate, Library, Theming, List, Util, Table, ThemeParameters, Filter, JSONListBinding, BooleanType, Byte, DateType, DateTime, DateTimeWithTimezone, Decimal, Double, Single, Guid, Int16, Int32, Int64, SByte, StringType, Time, TimeOfDay, ODataListBinding, InvisibleMessage, Text, HBox) {
	"use strict";
	/* global QUnit,sinon */

	function Str(iMaxLength) {
		return new StringType(null, {maxLength: iMaxLength});
	}

	function Chars(iLength) {
		return "A".repeat(iLength);
	}

	function Size(iLength) {
		return Util.measureText(Chars(iLength));
	}

	function OuterWidth(fInnerWidth) {
		return fInnerWidth + 1.0625 + "rem";
	}

	QUnit.test("measureText", function(assert) {
		const done = assert.async();

		assert.ok(Util.measureText("aaa") > Util.measureText("aa"));
		assert.ok(Util.measureText("w".repeat(50)) > 30);
		assert.ok(Util.measureText("i") < 0.5);

		assert.ok(Util.measureText("0") < Util.measureText("0", "bold 16px Arial"));
		assert.ok(Util.measureText("w", "12px Arial") > Util.measureText("w", "10px Arial"));

		const fSizeBeforeNewThemeApplied = Util.measureText("Text");
		const oThemeParametersStub = sinon.stub(ThemeParameters, "get");
		oThemeParametersStub.withArgs({ name: "sapMFontMediumSize" }).returns("1rem");
		oThemeParametersStub.withArgs({ name: "sapUiFontFamily" }).returns("Helvetica");

		const fnNewThemeApplied = function() {
			const fSizeAfterNewThemeApplied = Util.measureText("Text");
			assert.ok(fSizeAfterNewThemeApplied > fSizeBeforeNewThemeApplied);

			oThemeParametersStub.restore();
			Theming.detachApplied(fnNewThemeApplied);
			Theming.notifyContentDensityChanged();
			done();
		};

		Theming.notifyContentDensityChanged();
		Theming.attachApplied(fnNewThemeApplied);
	});

	QUnit.test("calcTypeWidth - Boolean", function(assert) {
		const done = assert.async();
		const oThemeParametersStub = sinon.stub(ThemeParameters, "get");
		const fYesBeforeNewThemeApplied = Util.measureText("Yes");
		const fnNewThemeApplied = function() {
			assert.ok(Util.calcTypeWidth(new BooleanType()) > fYesBeforeNewThemeApplied);

			oThemeParametersStub.restore();
			Theming.detachApplied(fnNewThemeApplied);
			Theming.notifyContentDensityChanged();
			done();
		};
		assert.equal(Util.calcTypeWidth(new BooleanType()), fYesBeforeNewThemeApplied);

		oThemeParametersStub.withArgs({ name: "sapMFontMediumSize" }).returns("1rem");
		oThemeParametersStub.withArgs({ name: "sapUiFontFamily" }).returns("Arial");
		Theming.notifyContentDensityChanged();
		Theming.attachApplied(fnNewThemeApplied);
	});

	QUnit.test("calcTypeWidth - String", function(assert) {

		assert.equal(Util.calcTypeWidth(Str()), 19);
		assert.equal(Util.calcTypeWidth(Str(), {maxWidth: 40}), 40);

		assert.equal(Util.calcTypeWidth(Str(25), {maxWidth: 5}), 5);

		assert.equal(Util.calcTypeWidth(Str(18)), Size(18));
		assert.equal(Util.calcTypeWidth(Str(1)), Size(1));

		assert.equal(Util.calcTypeWidth(Str(15), {maxWidth: 4}), 4);

		assert.ok(Util.calcTypeWidth(Str(40), {maxWidth: 25}) > Util.calcTypeWidth(Str(40), {maxWidth: 20}));
		assert.ok(Util.calcTypeWidth(Str(40)) > Util.calcTypeWidth(Str(40), {maxWidth: 15}));
		assert.ok(Util.calcTypeWidth(Str(70)) > 18);
		assert.ok(Util.calcTypeWidth(Str(60)) > 17);
		assert.ok(Util.calcTypeWidth(Str(50)) > 16);
		assert.ok(Util.calcTypeWidth(Str(40)) > 14);
		assert.ok(Util.calcTypeWidth(Str(30)) > 12);
		assert.ok(Util.calcTypeWidth(Str(20)) > 10);
	});

	QUnit.test("calcTypeWidth - Date&Time", function(assert) {
		assert.ok(Util.calcTypeWidth(new DateType({style: "medium"})) > Util.calcTypeWidth(new DateType({style: "short"})));
		assert.equal(Util.calcTypeWidth(new DateType({pattern : "dd.MM.yyyy"})), Util.measureText("26.10.2023"));

		assert.ok(Util.calcTypeWidth(new Time({style: "long"})) > Util.calcTypeWidth(new Time({style: "short"})));
		assert.equal(Util.calcTypeWidth(new Time({UTC: true})), Util.calcTypeWidth(new Time()));

		assert.ok(Util.calcTypeWidth(new DateTime()) > Util.calcTypeWidth(new Time()) + Util.calcTypeWidth(new DateType(null, { displayFormat : "Date" })));

		// \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.equal(Util.calcTypeWidth(new TimeOfDay()), Util.measureText("10:47:58\u202fPM"));

		assert.ok(Util.calcTypeWidth(new DateTimeWithTimezone()) > Util.calcTypeWidth(new DateTime()), "Column with timezone has a higher width");
		assert.ok(Util.calcTypeWidth(new DateTimeWithTimezone()) > Util.calcTypeWidth(new DateTimeWithTimezone({
			showDate: false,
			showTime: false
		})), "Column with timezone has a higher width");
	});

	QUnit.test("calcTypeWidth - Numeric", function(assert) {
		assert.equal(Util.calcTypeWidth(new Byte()), Util.calcTypeWidth(new SByte()));
		assert.ok(Util.calcTypeWidth(new Int16()) < Util.calcTypeWidth(new Int32()));
		assert.ok(Util.calcTypeWidth(new Int32()) < Util.calcTypeWidth(new Int64()));
		assert.ok(Util.calcTypeWidth(new Double()) < Util.calcTypeWidth(new Decimal()));
		assert.ok(Util.calcTypeWidth(new Int16()) < Util.calcTypeWidth(new Single()));
		assert.ok(Util.calcTypeWidth(new Int32()) > Util.calcTypeWidth(new Single()));

		assert.equal(Util.calcTypeWidth(new Decimal(null, {precision: 10, scale: 3})), Util.measureText("2.000.000,000"));
		assert.equal(Util.calcTypeWidth(new Decimal(null, {precision: 5})), Util.measureText("20,000"));
	});

	QUnit.test("calcTypeWidth - Other", function(assert) {
		const done = assert.async();

		sap.ui.require(["sap/ui/comp/odata/type/FiscalDate"], function(FiscalDate) {
			assert.equal(Util.calcTypeWidth(new FiscalDate(null, {maxLength: 10}, {
				anotationType: "com.sap.vocabularies.Common.v1.IsFiscalYearPeriod"
			})), Util.measureText("A".repeat(10)));
			assert.equal(Util.calcTypeWidth(new Guid()), 8);
			done();
		}, function(oError) {
			assert.ok(oError.message, "Test Skipped");
			done();
		});
	});

	QUnit.test("calcHeaderWidth", function(assert) {
		let fSizeAfterNewThemeApplied;
		const done = assert.async();

		const sFontRequired = ThemeParameters.get({ name: "sapMFontLargeSize" }) || "normal";
		const sFontHeader = ThemeParameters.get({ name: "sapUiColumnHeaderFontWeight" }) || "normal";

		assert.equal(Util.calcHeaderWidth("Header"), Util.measureText("Header", sFontHeader), "Column header width calculation without parameters");
		assert.equal(Util.calcHeaderWidth("Header", 2, 19, 2, true), Util.measureText("Header", sFontHeader) + Util.measureText("*", sFontRequired) + 0.125, "Column header width calculation with required parameter");
		assert.equal(Util.calcHeaderWidth("Header", 11, 10), 10, "fContentWidth > iMaxWidth");
		assert.equal(Util.calcHeaderWidth("Hea", 2, 0, 4), 4, "iMinWidth > iHeaderLength");
		assert.equal(Util.calcHeaderWidth("He", 3, 0, 5), 5, "min width");

		assert.notEqual(Util.calcHeaderWidth("A", 5), 5, "no fContentWidth > iHeaderLength optimization");

		assert.equal(Util.calcHeaderWidth("A".repeat(100), 10, 8), 8);
		assert.ok(Util.calcHeaderWidth("A".repeat(100), 10) > Util.calcHeaderWidth("A".repeat(100), 5));
		assert.ok(Util.calcHeaderWidth("A".repeat(25), 15) > Util.calcHeaderWidth("A".repeat(20), 15));

		const fSizeBeforeNewThemeApplied = Util.calcHeaderWidth("Some Long Header Text", 9);
		const oThemeParametersStub = sinon.stub(ThemeParameters, "get");
		oThemeParametersStub.withArgs({ name: "sapMFontMediumSize" }).returns("1rem");
		oThemeParametersStub.withArgs({ name: "sapUiFontFamily" }).returns("Arial");
		oThemeParametersStub.withArgs({ name: "sapUiColumnHeaderFontWeight" }).returns("bold");

		const fnNewThemeApplied = function() {
			fSizeAfterNewThemeApplied = Util.calcHeaderWidth("Some Long Header Text", 9);
			assert.ok(fSizeAfterNewThemeApplied > fSizeBeforeNewThemeApplied);

			oThemeParametersStub.restore();
			Theming.detachApplied(fnNewThemeApplied);
			Theming.notifyContentDensityChanged();
			done();
		};

		Theming.notifyContentDensityChanged();
		Theming.attachApplied(fnNewThemeApplied);
	});

	QUnit.test("calcColumnWidth", function(assert) {
		const ccw = Util.calcColumnWidth.bind(Util);
		assert.equal(ccw(new Byte()), OuterWidth(2), "Byte Type < Min width");
		assert.equal(ccw(new BooleanType()), OuterWidth(2), "BooleanType Type < Min width");

		assert.ok(parseFloat(ccw(new SByte())) < parseFloat(ccw(new Byte(), Chars(4))), "Byte type width < 4 character column header width");
		assert.ok(parseFloat(ccw(new SByte(), Chars(1000))) < 8, "Long column headers can only push small column widths logarithmically");
		assert.equal(ccw(new SByte(), Chars(1000), {truncateLabel: false, maxWidth: 10}), OuterWidth(10), "Long column headers could push up to max width");
		assert.equal(parseInt(ccw(new SByte(), "HeaderText", {truncateLabel: false})), parseInt(Util.calcHeaderWidth("HeaderText") + 1));
		assert.equal(parseInt(ccw(new SByte(), "HeaderText", {truncateLabel: false, headerGap: true})), parseInt(Util.calcHeaderWidth("HeaderText") + 1 + 1.375));

		[new BooleanType(), new Byte(), new Int16(), new Int32(), new Int64(), new Double(), new Decimal(), Str(10), new Time(), new DateType(), new Guid()].forEach(function(oType) {
			const fWidth = parseFloat(ccw(oType, "", {padding: 0}));
			assert.equal(parseFloat(ccw(oType, "", {padding: 4})), fWidth + 4, "Field Padding: " + oType);

			assert.equal(parseFloat(ccw(oType, "", {maxWidth: 2, padding: 0})), 2, "Field Max Width: " + oType);
			assert.equal(parseFloat(ccw(oType, "", {maxWidth: 2, padding: 0, gap: 4})), 2, "Field Max Width With Gap: " + oType);
			assert.equal(parseFloat(ccw(oType, "", {maxWidth: 2, padding: 4, gap: 0})), 6, "Field Max Width With Padding: " + oType);
			assert.equal(parseFloat(ccw(oType, "", {maxWidth: 2, padding: 4, gap: 4})), 6, "Field Max Width With Padding and Gap: " + oType);

			assert.equal(parseFloat(ccw(oType, "", {minWidth: 20, padding: 0})), 20, "Field Min Width: " + oType);
			assert.equal(parseFloat(ccw(oType, "", {minWidth: 20, padding: 0, gap: 4})), 20, "Field Min Width With Gap: " + oType);
			assert.equal(parseFloat(ccw(oType, "", {minWidth: 20, padding: 4, gap: 0})), 24, "Field Min Width With Padding: " + oType);
			assert.equal(parseFloat(ccw(oType, "", {minWidth: 20, padding: 4, gap: 4})), 24, "Field Min Width With Padding and Gap: " + oType);

			assert.ok(parseFloat(ccw([oType, oType], "", {padding: 0})) < 2 * fWidth + 0.52, "2 Complex Fields: " + oType);
			assert.ok(parseFloat(ccw([oType, oType], "", {padding: 0, gap: -0.52})) < 2 * fWidth, "2 Complex Fields With Gap: " + oType);
			assert.equal(parseFloat(ccw([oType, oType], "", {padding: 0, verticalArrangement: true})), fWidth, "Complex Fields Vertical: " + oType);
		});

		assert.equal(ccw([[Str(10), {maxWidth: 3}], [Str(10), {maxWidth: 2}]]), OuterWidth(5.5), "Type related settings");
		assert.equal(ccw([[Str(10), {maxWidth: 3}], [Str(10), {maxWidth: 2}]], "", {minWidth: 10, padding: 0}), "10rem", "Type related and column related settings");

		assert.ok(parseFloat(ccw([[new Byte(), {gap: 10}]])) > 12, "Gap taken into account 10rem gap + 1rem padding + ~1rem Byte width ");
		assert.equal(ccw([[new Byte(), {gap: 10, maxWidth: 5}]]), OuterWidth(5), "Gap and maxWidth taken into account");

		assert.equal(ccw([[Str(10), {maxWidth: 3}], [Str(10), {maxWidth: 2}]], "", {treeColumn: true}), OuterWidth(8.5), "Type related settings for the tree column");
		assert.equal(ccw([[Str(10), {maxWidth: 3}], [Str(10), {maxWidth: 2}]], "", {maxWidth: 5, treeColumn: true}), OuterWidth(5), "Column maxWidth taken into account for the treeColumn");
	});

	QUnit.test("showSelectionLimitPopover & hideSelectionLimitPopover", async function(assert) {
		const done = assert.async();
		const fnGetSelectAllPopoverSpy = sinon.spy(Util, "getSelectAllPopover");
		const fnInvisibleMessageAnnounce = sinon.spy(InvisibleMessage.prototype, "announce");
		const oElement = new List();
		oElement.placeAt("qunit-fixture");
		await nextUIUpdate();

		Util.showSelectionLimitPopover(10, oElement);
		const oSelectAllPopover = await Util.getSelectAllPopover();

		const oPopover = oSelectAllPopover.oSelectAllNotificationPopover;
		const oResourceBundle = oSelectAllPopover.oResourceBundle;
		const sMessage = oResourceBundle.getText("TABLE_SELECT_LIMIT", [10]);

		oPopover.attachEventOnce("afterOpen", function() {
			assert.strictEqual(fnGetSelectAllPopoverSpy.callCount, 2, "Util#getSelectAllPopover is called when showSelectionLimitPopovers is called");
			assert.strictEqual(oPopover.getContent()[0].getText(), sMessage, "Correct warning message displayed on the popover");
			assert.ok(oPopover.isOpen(), "Popover should be open");
			assert.ok(fnInvisibleMessageAnnounce.calledOnceWith(sMessage), "The message text is announced");
			Util.hideSelectionLimitPopover();
			fnInvisibleMessageAnnounce.restore();
		});
		oPopover.attachEventOnce("afterClose", function() {
			assert.notOk(oPopover.isOpen(), "Popover should be closed");
			done();
		});
	});

	QUnit.test("announceTableUpdate", function(assert) {
		const oRb = Library.getResourceBundleFor("sap.m"),
			sText = "Testing Text",
			fnInvisibleMessageAnnounce = sinon.spy(InvisibleMessage.prototype, "announce");

		// rowCount - undefined
		Util.announceTableUpdate(sText);
		assert.ok(fnInvisibleMessageAnnounce.calledWith(oRb.getText("table.ANNOUNCEMENT_TABLE_UPDATED", [sText])), "Row count was not announced");

		// rowCount > 1
		let iRowCount = 10;
		Util.announceTableUpdate(sText, iRowCount);
		assert.ok(fnInvisibleMessageAnnounce.calledWith(oRb.getText("table.ANNOUNCEMENT_TABLE_UPDATED_MULT", [sText, iRowCount])), "Multiple updated rows were announced");

		// rowCount == 1
		iRowCount = 1;
		Util.announceTableUpdate(sText, iRowCount);
		assert.ok(fnInvisibleMessageAnnounce.calledWith(oRb.getText("table.ANNOUNCEMENT_TABLE_UPDATED_SING", [sText, iRowCount])), "Row update was announced");

		// rowCount == 0
		iRowCount = 0;
		Util.announceTableUpdate(sText, iRowCount);
		assert.ok(fnInvisibleMessageAnnounce.calledWith(oRb.getText("table.ANNOUNCEMENT_TABLE_UPDATED_NOITEMS", [sText])), "No updated items was announced");

		fnInvisibleMessageAnnounce.restore();
	});

	QUnit.test("announceEmptyColumnMenu", function(assert) {
		const oRb = Library.getResourceBundleFor("sap.m"),
			fnInvisibleMessageAnnounce = sinon.spy(InvisibleMessage.prototype, "announce");

		Util.announceEmptyColumnMenu();
		assert.ok(fnInvisibleMessageAnnounce.calledWith(oRb.getText("table.ANNOUNCEMENT_EMPTY_COLUMN_MENU")), "Correct message is announced");
		fnInvisibleMessageAnnounce.restore();
	});

	QUnit.test("isEmpty", function(assert) {
		let iLength = 0,
			sType = "";
		const bIsFinal = true;
		const oRowBinding = {
			getLength: function() { return iLength; },
			isA: function(sClass) { return sType == sClass; },
			isLengthFinal: function() { return bIsFinal; }
		};

		assert.ok(Util.isEmpty(oRowBinding), "Row binding is empty");

		// bConsiderTotal - false, not AnalyticalBinding
		iLength = 10;
		assert.notOk(Util.isEmpty(oRowBinding), "Row binding is not empty");

		// bConsiderTotal - false, AnalyticalBinding. Provides no grand total and has totaled measures.
		sType = "sap.ui.model.analytics.AnalyticalBinding";
		oRowBinding.providesGrandTotal = function() {
			return false;
		};
		oRowBinding.hasTotaledMeasures = function() { return false; };

		assert.notOk(Util.isEmpty(oRowBinding), "Row binding is not empty");

		// bConsiderTotal - false, AnalyticalBinding. Only grand total is available.
		iLength = 1;
		oRowBinding.providesGrandTotal = function() {
			return true;
		};
		oRowBinding.hasTotaledMeasures = function() {
			return true;
		};

		assert.ok(Util.isEmpty(oRowBinding), "Row binding is empty");
	});

	QUnit.test("isExportable", function(assert) {
		const oJSONListBinding = sinon.createStubInstance(JSONListBinding);
		const oODataListBinding = sinon.createStubInstance(ODataListBinding);

		oODataListBinding.getDownloadUrl.returns("http://some.fake.path/service");
		oODataListBinding.isResolved.returns(true);

		/* Test before Util.isEmpty is stubbed */
		assert.notOk(Util.isExportable(), "Returns false when binding is unavailable");

		sinon.stub(Util, "isEmpty").returns(false);

		assert.equal(typeof oJSONListBinding.getDownloadUrl, "undefined", "No getDownloadUrl function available");
		assert.equal(typeof oODataListBinding.getDownloadUrl, "function", "Function getDownloadUrl is available");

		assert.ok(Util.isExportable(oJSONListBinding), "Non-empty JSONListBinding results in true");
		assert.ok(Util.isExportable(oODataListBinding), "Non-empty ODataListBinding with download Url results in true");

		/* Check for unresolved binding */
		oODataListBinding.isResolved.returns(false);
		oODataListBinding.getDownloadUrl.reset();

		assert.ok(Util.isExportable(oJSONListBinding), "isResolved has no impact on JSONListBinding");
		assert.notOk(Util.isExportable(oODataListBinding), "Unresolved ODataListBinding returns false");
		assert.ok(oODataListBinding.getDownloadUrl.notCalled, "getDownloadUrl was not called on unresolved binding");

		/* Test getDownloadUrl -> null (Filter.None scenario) */
		oODataListBinding.isResolved.returns(true);
		oODataListBinding.getDownloadUrl.returns(null);

		assert.notOk(Util.isExportable(oODataListBinding), "Download URL null results in not exportable");
		assert.ok(oODataListBinding.getDownloadUrl.calledOnce, "getDownloadUrl was called on resolved binding");

		/* Test empty binding scenario */
		oODataListBinding.isResolved.reset();
		Util.isEmpty.returns(true);

		assert.notOk(Util.isExportable(oJSONListBinding), "Empty JSONListBinding results in false");
		assert.notOk(Util.isExportable(oODataListBinding), "Empty ODataListBinding without download Url results in false");

		/* Test empty binding with download URL */
		oODataListBinding.getDownloadUrl.returns("http://some.fake.path/service");

		assert.notOk(Util.isExportable(oODataListBinding), "Empty ODataListBinding with download Url results in false");
		assert.ok(oODataListBinding.isResolved.notCalled, "Function isResolved is not called for empty binding");

		Util.isEmpty.restore();
	});

	QUnit.test("isThemeApplied", function(assert) {
		const done = assert.async();
		let sCurrentTheme, iPass = 0;

		const fnThemeChanged = (oEvent) => {
			const sTheme = oEvent.theme;

			if (iPass == 0) {
				sCurrentTheme = Theming.getTheme();
				iPass++;
				assert.strictEqual(sTheme, sCurrentTheme, "Initial: Correct current Theme: " + sTheme);
				assert.ok(Util.isThemeApplied(), sTheme + " is applied");
				// use an artifical theme because a real theme might already in the cache and is then applied sync
				// (next check would fail depending on the scenario).
				Theming.setTheme("my_dummy_theme");
				assert.notOk(Util.isThemeApplied(), "sap_horizon_hcb is not applied after setTheme");
			} else if (iPass == 1) {
				iPass++;
				assert.strictEqual(sTheme, "my_dummy_theme", "After Change: Correct current Theme: " + sTheme);
				assert.ok(Util.isThemeApplied(), sTheme + " is applied");
				Theming.setTheme(sCurrentTheme); // Just reset theme back to the standard one to cleanup for later tests
			} else {
				assert.strictEqual(sTheme, sCurrentTheme, "Final: Correct current Theme: " + sTheme);
				Theming.detachApplied(fnThemeChanged);
				done();
			}
		};

		Theming.attachApplied(fnThemeChanged);
	});

	QUnit.test("createOrUpdateMultiUnitPopover - use table with id", async function(assert) {
		var oTable = new Table("TestTable");
		oTable.addStyleClass("sapUiSizeCompact");
		oTable.placeAt("qunit-fixture");

		await nextUIUpdate();

		var oItemsBindingInfo = {
			path: "/names",
			filters: [
				new Filter("SomeFilterPath", "EQ", "SomeValue"),
				new Filter("Customer", "EQ", "test")
			],
			parameters: {
				select: "foo,bar",
				custom: {
					search: "searchText",
					"search-focus": "FocusedField4Search"
				}
			}
		};

		const oAmountText = new Text({
			textDirection: "LTR",
			wrapping: false,
			textAlign: "End"
		});

		const oUnitText = new Text({
			textDirection: "LTR",
			wrapping: false,
			textAlign: "End",
			width: "3em"
		});

		const oTemplate = new HBox({
			renderType: "Bare",
			justifyContent: "End",
			items: [
				oAmountText,
				oUnitText
			]
		});

		var mSettings = {
			control: oTable,
			itemsBindingInfo: oItemsBindingInfo,
			listItemContentTemplate: oTemplate
		};

		var oPopover = await Util.createOrUpdateMultiUnitPopover(oTable.getId() + "-multiUnitPopover", mSettings);
		var oDetailsList = oPopover.getContent()[0];
		var oDetailsListBindingInfo = oDetailsList.getBindingInfo("items");

		assert.ok(oPopover, "Popover was created");
		assert.ok(oDetailsList, "List was created");

		const oResourceBundle = Library.getResourceBundleFor("sap.m");
		var sTitle = oResourceBundle.getText("TABLE_MULTI_GROUP_TITLE");
		var sPlacement = "VerticalPreferredBottom";

		assert.equal(oPopover.getTitle(), sTitle, "Popover title is correct");
		assert.equal(oPopover.getPlacement(), sPlacement, "Popover placement is correct");
		assert.equal(oPopover.getId(), oTable.getId() + "-multiUnitPopover", "Popover created with table id");

		assert.deepEqual(oDetailsListBindingInfo.filters, oItemsBindingInfo.filters, "Filter values as expected");
		assert.equal(oDetailsListBindingInfo.path, oItemsBindingInfo.path, "Binding path as expected");
		assert.deepEqual(oDetailsListBindingInfo.parameters, oItemsBindingInfo.parameters, "Parameters as expected");

		assert.ok(oPopover.hasStyleClass("sapMResponsivePopover"), "Correct styleClass popover (sapMResponsivePopover)");
		assert.ok(oPopover.hasStyleClass("sapMMultiUnitPopover"), "Correct styleClass popover (sapMMultiUnitPopover)");
		assert.ok(oPopover.hasStyleClass("sapUiSizeCompact"), "Correct styleClass popover (sapUiSizeCompact)");
		assert.ok(oDetailsList.hasStyleClass("sapUiContentPadding"), "Correct styleClass detailsList (sapUiContentPadding)");
	});
});