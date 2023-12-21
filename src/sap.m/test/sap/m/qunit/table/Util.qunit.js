sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/Lib",
	"sap/ui/core/Theming",
	"sap/m/List",
	"sap/m/table/Util",
	"sap/ui/core/theming/Parameters",
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
	"sap/ui/core/InvisibleMessage"
], function(Core, Library, Theming, List, Util, ThemeParameters, JSONListBinding, BooleanType, Byte, DateType, DateTime, DateTimeWithTimezone, Decimal, Double, Single, Guid, Int16, Int32, Int64, SByte, StringType, Time, TimeOfDay, ODataListBinding, InvisibleMessage) {
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
		var oThemeParametersStub, fSizeBeforeNewThemeApplied;
		var done = assert.async();
		var fnNewThemeApplied = function() {
			var fSizeAfterNewThemeApplied = Util.measureText("Text");
			assert.ok(fSizeAfterNewThemeApplied > fSizeBeforeNewThemeApplied);

			oThemeParametersStub.restore();
			Theming.detachApplied(fnNewThemeApplied);
			Theming.notifyContentDensityChanged();
			done();
		};
		assert.ok(Util.measureText("aaa") > Util.measureText("aa"));
		assert.ok(Util.measureText("w".repeat(50)) > 30);
		assert.ok(Util.measureText("i") < 0.5);

		assert.ok(Util.measureText("0") < Util.measureText("0", "bold 16px Arial"));
		assert.ok(Util.measureText("w", "12px Arial") > Util.measureText("w", "10px Arial"));

		fSizeBeforeNewThemeApplied = Util.measureText("Text");

		oThemeParametersStub = sinon.stub(ThemeParameters, "get");
		oThemeParametersStub.withArgs({ name: "sapMFontMediumSize" }).returns("1rem");
		oThemeParametersStub.withArgs({ name: "sapUiFontFamily" }).returns("Helvetica");
		Theming.notifyContentDensityChanged();
		Theming.attachApplied(fnNewThemeApplied);
	});

	QUnit.test("calcTypeWidth - Boolean", function(assert) {
		var done = assert.async();
		var oThemeParametersStub = sinon.stub(ThemeParameters, "get");
		var fYesBeforeNewThemeApplied = Util.measureText("Yes");
		var fnNewThemeApplied = function() {
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
		var done = assert.async();

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
		var fSizeBeforeNewThemeApplied, fSizeAfterNewThemeApplied, oThemeParametersStub;
		var done = assert.async();
		var fnNewThemeApplied = function() {
			fSizeAfterNewThemeApplied = Util.calcHeaderWidth("Some Long Header Text", 9);
			assert.ok(fSizeAfterNewThemeApplied > fSizeBeforeNewThemeApplied);

			oThemeParametersStub.restore();
			Theming.detachApplied(fnNewThemeApplied);
			Theming.notifyContentDensityChanged();
			done();
		};
		var sFontRequired = ThemeParameters.get({ name: "sapMFontLargeSize" }) || "normal";
		var sFontHeader = ThemeParameters.get({ name: "sapUiColumnHeaderFontWeight" }) || "normal";

		assert.equal(Util.calcHeaderWidth("Header"), Util.measureText("Header", sFontHeader), "Column header width calculation without parameters");
		assert.equal(Util.calcHeaderWidth("Header", 2, 19, 2, true), Util.measureText("Header", sFontHeader) + Util.measureText("*", sFontRequired) + 0.125, "Column header width calculation with required parameter");
		assert.equal(Util.calcHeaderWidth("Header", 11, 10), 10, "fContentWidth > iMaxWidth");
		assert.equal(Util.calcHeaderWidth("Hea", 2, 0, 4), 4, "iMinWidth > iHeaderLength");
		assert.equal(Util.calcHeaderWidth("He", 3, 0, 5), 5, "fContentWidth > iHeaderLength");

		assert.equal(Util.calcHeaderWidth("A".repeat(100), 10, 8), 8);
		assert.ok(Util.calcHeaderWidth("A".repeat(100), 10) > Util.calcHeaderWidth("A".repeat(100), 5));
		assert.ok(Util.calcHeaderWidth("A".repeat(25), 15) > Util.calcHeaderWidth("A".repeat(20), 15));

		fSizeBeforeNewThemeApplied = Util.calcHeaderWidth("Some Long Header Text", 9);

		oThemeParametersStub = sinon.stub(ThemeParameters, "get");
		oThemeParametersStub.withArgs({ name: "sapMFontMediumSize" }).returns("1rem");
		oThemeParametersStub.withArgs({ name: "sapUiFontFamily" }).returns("Arial");
		oThemeParametersStub.withArgs({ name: "sapUiColumnHeaderFontWeight" }).returns("bold");
		Theming.notifyContentDensityChanged();
		Theming.attachApplied(fnNewThemeApplied);
	});

	QUnit.test("calcColumnWidth", function(assert) {
		var ccw = Util.calcColumnWidth.bind(Util);
		assert.equal(ccw(new Byte()), OuterWidth(2), "Byte Type < Min width");
		assert.equal(ccw(new BooleanType()), OuterWidth(2), "BooleanType Type < Min width");

		assert.ok(parseFloat(ccw(new SByte())) < parseFloat(ccw(new Byte(), Chars(4))), "Byte type width < 4 character column header width");
		assert.ok(parseFloat(ccw(new SByte(), Chars(1000))) < 8, "Long column headers can only push small column widths logarithmically");
		assert.equal(ccw(new SByte(), Chars(1000), {truncateLabel: false, maxWidth: 10}), OuterWidth(10), "Long column headers could push up to max width");
		assert.equal(parseInt(ccw(new SByte(), "HeaderText", {truncateLabel: false})), parseInt(Util.calcHeaderWidth("HeaderText") + 1));
		assert.equal(parseInt(ccw(new SByte(), "HeaderText", {truncateLabel: false, headerGap: true})), parseInt(Util.calcHeaderWidth("HeaderText") + 1 + 1.375));

		[new BooleanType(), new Byte(), new Int16(), new Int32(), new Int64(), new Double(), new Decimal(), Str(10), new Time(), new DateType(), new Guid()].forEach(function(oType) {
			var fWidth = parseFloat(ccw(oType, "", {padding: 0}));
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

	QUnit.test("showSelectionLimitPopover & hideSelectionLimitPopover", function(assert) {
		var done = assert.async();
		var fnGetSelectAllPopoverSpy = sinon.spy(Util, "getSelectAllPopover");
		var oElement = new List();
		oElement.placeAt("qunit-fixture");
		Core.applyChanges();
		Util.showSelectionLimitPopover(10, oElement);
		Util.getSelectAllPopover().then(function(oResult) {
			var oPopover = oResult.oSelectAllNotificationPopover;
			var oResourceBundle = oResult.oResourceBundle;
			var sMessage = oResourceBundle.getText("TABLE_SELECT_LIMIT", [10]);
			oPopover.attachEventOnce("afterOpen", function() {
				assert.strictEqual(fnGetSelectAllPopoverSpy.callCount, 2, "Util#getSelectAllPopover is called when showSelectionLimitPopovers is called");
				assert.strictEqual(oPopover.getContent()[0].getText(), sMessage, "Correct warning message displayed on the popover");
				assert.ok(oPopover.isOpen(), sMessage, "Popover is opened");
				Util.hideSelectionLimitPopover();
			});
			oPopover.attachEventOnce("afterClose", function() {
				assert.notOk(oPopover.isOpen(), sMessage, "Popover is opened");
				done();
			});
		});
	});

	QUnit.test("announceTableUpdate", function(assert) {
		var oRb = Library.getResourceBundleFor("sap.m"),
			sText = "Testing Text",
			fnInvisibleMessageAnnounce = sinon.spy(InvisibleMessage.prototype, "announce");

		// rowCount - undefined
		Util.announceTableUpdate(sText);
		assert.ok(fnInvisibleMessageAnnounce.calledWith(oRb.getText("table.ANNOUNCEMENT_TABLE_UPDATED", [sText])), "Row count was not announced");

		// rowCount > 1
		var iRowCount = 10;
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

	QUnit.test("isEmpty", function(assert) {
		var iLength = 0,
			sType = "",
			bIsFinal = true;
		var oRowBinding = {
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
});