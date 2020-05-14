/*global QUnit sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	'jquery.sap.global',
	'sap/base/Log',
	'sap/ui/layout/BlockLayoutCell',
	'sap/ui/layout/BlockLayoutCellData',
	'sap/ui/layout/BlockLayoutRow',
	'sap/ui/layout/BlockLayout',
	'sap/m/Dialog',
	'sap/m/Link',
	'sap/m/Text',
	'sap/ui/core/Core'
], function(
	jQuery,
	log,
	BlockLayoutCell,
	BlockLayoutCellData,
	BlockLayoutRow,
	BlockLayout,
	Dialog,
	Link,
	Text,
	Core) {
	'use strict';

	QUnit.module("Block Layout Public and Private API", {
		blockId: "block-layout-id",
		blockRowId: "block-row-id",
		beforeEach: function () {

			this.cells = [
				new BlockLayoutCell("firstCell"),
				new BlockLayoutCell("secondCell"),
				new BlockLayoutCell(),
				new BlockLayoutCell()];
			this.BlockLayoutRow = new BlockLayoutRow(this.blockRowId, {
				content: this.cells
			});
			this.BlockLayout = new BlockLayout(this.blockId, {
				content: this.BlockLayoutRow
			});
			this.logSpy = sinon.spy(jQuery.sap.log, "error");

			this.BlockLayoutConstants = sap.ui.layout.BlockLayout.CONSTANTS;
			this.BlockLayoutRowConstants = sap.ui.layout.BlockLayoutRow.CONSTANTS;

			this.BlockLayout.placeAt("qunit-fixture");
			Core.applyChanges();
			this.clock = sinon.useFakeTimers();

			this._fixtureWidth = jQuery("#qunit-fixture").width();
		},
		afterEach: function () {
			this.BlockLayout.destroy();
			this.BlockLayoutRow.destroy();
			this.logSpy.restore();
			this.cells = null;
			this.logSpy = null;
			this.BlockLayoutConstants = null;
			this.BlockLayoutRowConstants = null;
			this.BlockLayoutRow = null;
			this.BlockLayout = null;
			this.clock.restore();
			jQuery("#qunit-fixture").width(this._fixtureWidth);
		}
	});

	QUnit.test("BlockLayout Default values", function (assert) {
		assert.strictEqual(this.BlockLayout.getBackground(), "Default", "Background's default value should be equal to Default");
		assert.strictEqual(this.BlockLayout.getKeepFontSize(), false, "KeepFontSize's default value should be equal to Default");
		assert.strictEqual(this.BlockLayoutConstants.SIZES.S, 600, "Break point M should be equal to 600");
		assert.strictEqual(this.BlockLayoutConstants.SIZES.M, 1024, "Break point M should be equal to 1024");
	});

	QUnit.test("BlockLayoutRow Default values", function (assert) {
		assert.strictEqual(this.BlockLayoutRow.getScrollable(), false, "Default rendering should be horizontal.");
	});

	QUnit.test("BlockLayoutCell Default values", function (assert) {
		var oCell = new BlockLayoutCell().setLayoutData(new BlockLayoutCellData());
		assert.strictEqual(oCell.getTitleAlignment(), "Begin", "Title Alignment should be Begin by default");
		assert.strictEqual(oCell.getWidth(), 0, "Should be equal to 0 by default");
		assert.strictEqual(oCell.getTitleLevel(), "Auto", "Should be equal to Auto by default");
		assert.strictEqual(oCell.getBackgroundColorSet(), undefined, "The default bg color set should be 0");
		assert.strictEqual(oCell.getBackgroundColorShade(), undefined, "The default bg color index should be 0");
		assert.strictEqual(oCell.getLayoutData()['breakRowOnSSize'], true, "Has to break on S size");
		assert.strictEqual(oCell.getLayoutData()['breakRowOnMSize'], false, "Doesn't have to break on M size");

		// Cleanup
		oCell.destroy();
	});

	QUnit.test("BlockLayoutCell setLayoutData", function (assert) {

		// Arrange
		var oCell = new BlockLayoutCell({
			width: 5,
			layoutData: new BlockLayoutCellData()
		});

		// Act
		oCell.setLayoutData(null);

		// Assert
		assert.equal(oCell.getLayoutData(), null, "Should have correctly set layoutData to null.");

		// Cleanup
		oCell.destroy();
	});

	QUnit.test("BlockLayoutCell cloning", function (assert) {

		// Arrange
		var oCell = new BlockLayoutCell({ width: 5 });

		// Act
		var oClone = oCell.clone();

		// Assert
		assert.ok(oClone, "Should have successfully cloned the BlockLayoutCell.");

		// Cleanup
		oCell.destroy();
		oClone.destroy();
	});

	QUnit.test("S Breakpoint case", function (assert) {
		jQuery("#qunit-fixture").width(500);
		this.BlockLayout._onParentResize();
		Core.applyChanges();

		assert.expect(9);
		assert.strictEqual(this.BlockLayoutRow._arrangements["S"].length, 4, "The arrangement should contain 4 rows");
		this.BlockLayoutRow._arrangements["S"].forEach(function (aRow) {
			assert.strictEqual(aRow.length, 1, "Each row should contain 1 arrays with the width of cells inside");
			aRow.forEach(function (iCellWidth) {
				assert.strictEqual(iCellWidth, 1, "The cell should be with width of 1 (flex) ");
			});
		});
	});

	QUnit.test("M Breakpoint case", function (assert) {
		jQuery("#qunit-fixture").width(1000);
		this.BlockLayout._onParentResize();
		Core.applyChanges();

		assert.expect(7);
		assert.strictEqual(this.BlockLayoutRow._arrangements["M"].length, 2, "The arrangement should contain 2 rows");
		this.BlockLayoutRow._arrangements["M"].forEach(function (aRow) {
			assert.strictEqual(aRow.length, 2, "Each row should contain 2 arrays with the width of cells inside");
			aRow.forEach(function (iCellWidth) {
				assert.strictEqual(iCellWidth, 1, "The cell should be with width of 1 (flex) ");
			});
		});
	});

	QUnit.test("Setting titleLink aggregation", function (assert) {
		//setting title text
		var oFirstCell = this.BlockLayoutRow.getContent()[0];
		oFirstCell.setTitle("test title");
		Core.applyChanges();

		assert.strictEqual(oFirstCell.getTitle(), "test title", "Property title should be \"test title\"");
		assert.strictEqual(jQuery("#firstCell-Title").text(), "test title", "Title of the cell should be \"test title\"");
		assert.strictEqual(jQuery("#firstCell .sapUiBlockCellContent").attr("aria-labelledby"), "firstCell-Title", "There should be aria-labelledby attribute on the cell content, pointing to the title");

		//setting link as title
		var oLinkTitle = new Link({text: "test link", href: "http://www.sap.com"});
		oFirstCell.setTitleLink(oLinkTitle);
		Core.applyChanges();

		assert.strictEqual(oFirstCell.getTitle(), "test title", "When there is titleLink aggregation provided property title shouldn't change and should be \"test title\"");
		assert.strictEqual(jQuery("#firstCell-Title").text(), "test link", "When there is titleLink aggregation provided title of the cell should be \"test link\"");
		assert.strictEqual(jQuery("#firstCell .sapUiBlockCellContent").attr("aria-labelledby"), "firstCell-Title", "There should be aria-labelledby attribute on the cell content, pointing to the linked title");

		//setting sap.m.Text as title - should produce warning
		var oSecondCell = this.BlockLayoutRow.getContent()[1];
		var oTextTitle = new Text({text: "test text"});
		var warningFunctionSpy = sinon.spy(log, "warning");

		oSecondCell.setTitle("test title 2");
		oSecondCell.setTitleLink(oTextTitle);
		Core.applyChanges();

		assert.strictEqual(jQuery("#secondCell-Title").text(), "test title 2", "When there is invalid titleLink aggregation provided title of the cell should be \"test title 2\"");
		sinon.assert.calledWith(warningFunctionSpy, sinon.match(/sap.ui.layout.BlockLayoutCell secondCell: Can't add value for titleLink aggregation different than sap.m.Link./));
		log.warning.restore();

		//title is not set, the titleLink is set
		oSecondCell.setTitle("");
		oSecondCell.setTitleLink(oLinkTitle);
		Core.applyChanges();

		assert.strictEqual(jQuery("#secondCell-Title").text(), "test link", "When there no title provided and titleLink aggregation is provided title of the cell should be \"test link\"");
		assert.strictEqual(jQuery("#secondCell .sapUiBlockCellContent").attr("aria-labelledby"), "secondCell-Title", "When there no title provided and titleLink aggregation is provided, there should be aria-labelledby attribute on the cell content, pointing to the linked title");

		//title and titleLink are not set
		oSecondCell.setTitle("");
		oSecondCell.setTitleLink("");
		Core.applyChanges();

		assert.strictEqual(jQuery("#secondCell-Title").text(), "", "When there is no title or titleLink provided title of the cell should be empty");
		assert.strictEqual(jQuery("#secondCell .sapUiBlockCellContent").attr("aria-labelledby"), undefined, "When there is no title or titleLink, there should be no aria-labelledby.");

		//When the title is set, then the link is set and removed and destroyed
		oSecondCell.setTitle("test title 2");
		oSecondCell.setTitleLink(oLinkTitle);
		Core.applyChanges();

		assert.strictEqual(jQuery("#secondCell-Title").text(), "test link", "When there is no title or titleLink provided title of the cell should be \"test title 2\"");

		oSecondCell.destroyAggregation("titleLink");
		Core.applyChanges();

		assert.strictEqual(jQuery("#secondCell-Title").text(), "test title 2", "When there is no title or titleLink provided title of the cell should be \"test title 2\"");

	});

	QUnit.test("Setting title alignment", function (assert) {
		// Arrange
		var oFirstCell = this.BlockLayoutRow.getContent()[0];
		oFirstCell.setTitle("test title");
		Core.applyChanges();

		// Assert default state
		assert.strictEqual(oFirstCell.getTitleAlignment(), "Begin", "Property title alignement is \"Begin\"");
		assert.strictEqual(jQuery("#firstCell .sapUiBlockCellContent").hasClass("sapUiBlockCellCenteredContent"), false, "When title alignment is Begin, there should be no class sapUiBlockCellCenteredContent");

		// Act
		oFirstCell.setTitleAlignment("Center");
		Core.applyChanges();

		assert.strictEqual(oFirstCell.getTitleAlignment(), "Center", "Property title alignement is \"Center\"");
		assert.ok(jQuery("#firstCell .sapUiBlockCellContent").hasClass("sapUiBlockCellCenteredContent"), "When title alignment is Center, there should be class sapUiBlockCellCenteredContent");
	});

	QUnit.module("Background types");

	QUnit.test("BlockLayout default type dynamically change", function (assert) {
		// Arrange
		var sType = sap.ui.layout.BlockBackgroundType.Default;

		// System under Test
		var oBlockLayout = new BlockLayout({}).placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.strictEqual(oBlockLayout.getBackground(), sType, "Background with undefined argument should be of Default type");
		assert.ok(oBlockLayout.getDomRef().classList.contains("sapUiBlockLayoutBackground" + sType), "Should have set proper CSS classes");

		// Act
		sType = sap.ui.layout.BlockBackgroundType.Accent;
		oBlockLayout.setBackground(sType);
		Core.applyChanges();

		// Assert
		assert.strictEqual(oBlockLayout.getBackground(), sType, "Background to be set of Accent type");
		assert.ok(oBlockLayout.getDomRef().classList.contains("sapUiBlockLayoutBackground" + sType), "Should have set proper CSS classes");

		// Cleanup
		oBlockLayout.destroy();
	});

	QUnit.test("BlockLayout with predefined type", function (assert) {
		// Arrange
		var sType = sap.ui.layout.BlockBackgroundType.Accent;

		// System under Test
		var oBlockLayout = new BlockLayout({background: sType}).placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.strictEqual(oBlockLayout.getBackground(), sType, "Background to be set of Accent type");
		assert.ok(oBlockLayout.getDomRef().classList.contains("sapUiBlockLayoutBackground" + sType), "Should have set proper CSS classes");

		// Cleanup
		oBlockLayout.destroy();
	});

	QUnit.test("BlockLayoutRow predefined Color Set", function (assert) {
		var sColorSet = sap.ui.layout.BlockRowColorSets.ColorSet2,
			oBlockRow = new BlockLayoutRow({rowColorSet: sColorSet});
		Core.applyChanges();

		// Assert
		assert.strictEqual(oBlockRow.getRowColorSet(), sColorSet, "Color set should be of type " + sColorSet);
		assert.ok(oBlockRow.hasStyleClass("sapUiBlockLayoutBackground" + sColorSet), "Should have set proper CSS classes");

		// Cleanup
		oBlockRow.destroy();
	});

	QUnit.test("BlockLayoutRow dynamically change Color Set", function (assert) {
		var sColorSet = sap.ui.layout.BlockRowColorSets.ColorSet2;
		var oBlockRow = new BlockLayoutRow({rowColorSet: sColorSet});
		Core.applyChanges();

		// Act
		sColorSet = sap.ui.layout.BlockRowColorSets.ColorSet3;
		oBlockRow.setRowColorSet(sColorSet);

		// Assert
		assert.strictEqual(oBlockRow.getRowColorSet(), sColorSet, "Color set should be of type " + sColorSet);
		assert.ok(oBlockRow.hasStyleClass("sapUiBlockLayoutBackground" + sColorSet), "Should have set proper CSS classes");

		// Cleanup
		oBlockRow.destroy();
	});

	QUnit.module("BlockLayout + BlockLayoutRow + BlockLayoutCell integrations");

	QUnit.test("BlockLayout + 2 sequent BlockLayoutRow-s with the same color set", function (assert) {
		var sColorSet = sap.ui.layout.BlockRowColorSets.ColorSet1,
			oRow1 = new BlockLayoutRow({rowColorSet: sColorSet}),
			oRow2 = new BlockLayoutRow({rowColorSet: sColorSet}),
			oBlockLayout = new BlockLayout({
				background: sap.ui.layout.BlockBackgroundType.Accent,
				content: [oRow1, oRow2]
			}).placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.strictEqual(oRow1.getRowColorSet(), sColorSet, "Color set should be of type " + sColorSet);
		assert.ok(oRow1.hasStyleClass("sapUiBlockLayoutBackground" + sColorSet), "Should have set proper CSS classes");

		assert.strictEqual(oRow2.getRowColorSet(), sColorSet, "Color set should be of type " + sColorSet);
		assert.ok(oRow2.hasStyleClass("sapUiBlockLayoutBackground" + sColorSet + "Inverted"), "Should have set proper CSS classes");

		// Act
		sColorSet = sap.ui.layout.BlockRowColorSets.ColorSet3;
		oRow2.setRowColorSet(sColorSet);

		// Assert
		assert.strictEqual(oRow2.getRowColorSet(), sColorSet, "Color set should be of type " + sColorSet);
		assert.ok(oRow2.hasStyleClass("sapUiBlockLayoutBackground" + sColorSet), "Should have set proper CSS classes");

		// Cleanup
		oRow1 = null;
		oRow2 = null;
		oBlockLayout.destroy();
	});

	QUnit.test("BlockLayout + 2 sequent BlockLayoutRow-s with different color sets", function (assert) {
		var sColorSet1 = sap.ui.layout.BlockRowColorSets.ColorSet21,
			sColorSet2 = sap.ui.layout.BlockRowColorSets.ColorSet2,
			oRow1 = new BlockLayoutRow({rowColorSet: sColorSet1}),
			oRow2 = new BlockLayoutRow({rowColorSet: sColorSet2}),
			oBlockLayout = new BlockLayout({
				background: sap.ui.layout.BlockBackgroundType.Accent,
				content: [oRow1, oRow2]
			}).placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.strictEqual(oRow1.getRowColorSet(), sColorSet1, "Color set should be of type " + sColorSet1);
		assert.ok(oRow1.hasStyleClass("sapUiBlockLayoutBackground" + sColorSet1), "Should have set proper CSS classes");

		assert.strictEqual(oRow2.getRowColorSet(), sColorSet2, "Color set should be of type " + sColorSet2);
		assert.ok(oRow2.hasStyleClass("sapUiBlockLayoutBackground" + sColorSet2), "Should have set proper CSS classes");

		// Act
		oRow1.setRowColorSet(sColorSet2);
		Core.applyChanges();

		// Assert
		assert.strictEqual(oRow1.getRowColorSet(), sColorSet2, "Color set should be of type " + sColorSet2);
		assert.ok(oRow1.hasStyleClass("sapUiBlockLayoutBackground" + sColorSet2), "Should have set proper CSS classes");

		assert.strictEqual(oRow2.getRowColorSet(), sColorSet2, "Color set should be of type " + sColorSet2);
		assert.ok(oRow2.hasStyleClass("sapUiBlockLayoutBackground" + sColorSet2 + "Inverted"), "Should have set proper CSS classes");

		// Cleanup
		oRow1 = null;
		oRow2 = null;
		oBlockLayout.destroy();
	});

	QUnit.test("Mixed BlockLayout with an accent cell", function (assert) {
		jQuery("#qunit-fixture").width(1200);
		var oCell1 = new BlockLayoutCell({width: 1}),
			oCell2 = new BlockLayoutCell({width: 1}),
			oRow = new BlockLayoutRow({
				content: [oCell1, oCell2],
				accentCells: [oCell1]
			}),
			oBlockLayout = new BlockLayout({
				background: sap.ui.layout.BlockBackgroundType.Mixed,
				content: [oRow]
			}).placeAt("qunit-fixture");

		var oSpy = sinon.spy(oRow, "_processMixedCellStyles");


		Core.applyChanges();

		// Assert
		assert.ok(oSpy.called, "Mixed layout cell processor has been called");
		assert.strictEqual(oRow.getAccentCells()[0], oCell1.getId(), "Should have set Cell1 as an accent cell");
		assert.ok(oCell1.hasStyleClass("sapContrast"), "Should have set proper CSS classes");
		assert.ok(oCell1.hasStyleClass("sapContrastPlus"), "Should have set proper CSS classes");

		// Act
		oRow.addAccentCell(oCell2);
		oBlockLayout.addStyleClass("sapUiBlockLayoutSizeL"); //Mock the screen size
		Core.applyChanges();

		// Assert
		assert.notEqual(oRow.getAccentCells()[0], oCell1.getId(), "Should have removed Cell1 as an accent cell");
		assert.ok(!oCell1.hasStyleClass("sapContrast"), "Should have removed the contrast containers from Cell1");
		assert.ok(!oCell1.hasStyleClass("sapContrastPlus"), "Should have removed the contrast containers from Cell1");

		assert.strictEqual(oRow.getAccentCells()[0], oCell2.getId(), "Should have set Cell2 as an accent cell");
		assert.ok(oCell2.hasStyleClass("sapContrast"), "Should have set proper CSS classes");
		assert.ok(oCell2.hasStyleClass("sapContrastPlus"), "Should have set proper CSS classes");

		// Cleanup
		oSpy.restore();
		oCell1 = null;
		oRow = null;
		oBlockLayout.destroy();
	});

	QUnit.test("Accent BlockLayout with an accent cells", function (assert) {
		var oCell1 = new BlockLayoutCell({width: 1}),
			oCell2 = new BlockLayoutCell({width: 1}),
			oRow = new BlockLayoutRow({
				content: [oCell1, oCell2],
				accentCells: [oCell1]
			}),
			oBlockLayout = new BlockLayout({
				background: sap.ui.layout.BlockBackgroundType.Accent,
				content: [oRow]
			}).placeAt("qunit-fixture");

		var oSpy = sinon.spy(oRow, "_processAccentCellStyles");
		Core.applyChanges();

		// Assert
		assert.ok(oSpy.called, "Accent layout cell processor has been called");
		assert.strictEqual(oRow.getAccentCells()[0], oCell1.getId(), "Should have set Cell1 as an accent cell");
		assert.ok(oCell1.hasStyleClass("sapUiBlockLayoutBackgroundColorSetGray2"), "Should have set proper CSS classes");


		// Act
		oRow.addAccentCell(oCell2);
		Core.applyChanges();

		// Assert
		assert.strictEqual(oRow.getAccentCells()[1], oCell2.getId(), "Should have set Cell2 as an accent cell");
		assert.ok(oCell2.hasStyleClass("sapUiBlockLayoutBackgroundColorSetGray1"), "Should have set proper CSS classes");

		// Cleanup
		oSpy.restore();
		oCell1 = null;
		oRow = null;
		oBlockLayout.destroy();
	});

	QUnit.test("Blocklayout cell margins with and without content", function (assert) {
		// System under test
		var oContainer = new BlockLayoutCell({
				title: "Dummy"
			}),
			$cell;

		// Act
		oContainer.placeAt("qunit-fixture");
		Core.applyChanges();
		$cell = oContainer.$("Title");

		// Assert
		assert.strictEqual($cell.css("margin-bottom"), "0px", "The bottom margin is 0 when the content of the cell is not filled");

		// Act
		oContainer.addContent(new BlockLayoutCell());
		Core.applyChanges();
		$cell = oContainer.$("Title");

		// Assert
		assert.strictEqual($cell.css("margin-bottom"), "16px", "The bottom margin is 16px when the content of the cell is filled");
	});

	QUnit.test("Container Padding Classes", function (assert) {
		// System under Test + Act
		var oContainer = new BlockLayoutCell(),
			sSize = sap.ui.Device.resize.width <= 1023 ? "16px" : "16px 32px",
			sResponsiveSize = sap.ui.Device.resize.width <= 599 ? "0px" : sSize,
			aResponsiveSize = sResponsiveSize.split(" "),
			$containerContent;

		// Act
		oContainer.placeAt("qunit-fixture");

		Core.applyChanges();
		oContainer.addStyleClass("sapUiNoContentPadding");
		$containerContent = oContainer.$().find(".sapUiBlockCellContent");

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), "0px", "The container has no left content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-right"), "0px", "The container has no right content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-top"), "0px", "The container has no top content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-bottom"), "0px", "The container has no bottom content padding when class \"sapUiNoContentPadding\" is set");

		// Act
		oContainer.removeStyleClass("sapUiNoContentPadding");
		oContainer.addStyleClass("sapUiContentPadding");

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), "32px", "The container has 2rem left content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-right"), "32px", "The container has 2rem right content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-top"), "32px", "The container has 2rem top content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-bottom"), "32px", "The container has 2rem bottom content padding when class \"sapUiContentPadding\" is set");

		// Act
		oContainer.removeStyleClass("sapUiContentPadding");
		oContainer.addStyleClass("sapUiResponsiveContentPadding");

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), (aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0]), "The container has " + sResponsiveSize + " left content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-right"), (aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0]), "The container has " + sResponsiveSize + " right content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-top"), aResponsiveSize[0], "The container has " + sResponsiveSize + " top content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-bottom"), aResponsiveSize[0], "The container has " + sResponsiveSize + " bottom content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");

		// Cleanup
		oContainer.destroy();
	});

	QUnit.test("Should not add the font modifying style classes if keepFontSize is off", function (assert) {
		// System under test
		var blockLayout = new BlockLayout({
			keepFontSize: true
		});

		// Act
		blockLayout.placeAt("qunit-fixture");
		Core.applyChanges();


		assert.ok(blockLayout.$().hasClass("sapUiBlockLayoutKeepFontSize"), "style class is added");

		// Act part 2 - change the property - style class should be gone
		blockLayout.setKeepFontSize(false);
		Core.applyChanges();

		assert.ok(!blockLayout.$().hasClass("sapUiBlockLayoutKeepFontSize"), "no style class is added");
	});

	QUnit.test("Generating arrangement for M size case", function (assert) {
		var oBlockLayout = new BlockLayout(),
			oBlockLayoutRow = new BlockLayoutRow();

		oBlockLayoutRow.insertContent(new BlockLayoutCell(), 0);
		oBlockLayoutRow.insertContent(new BlockLayoutCell(), 1);
		oBlockLayoutRow.insertContent(new BlockLayoutCell(), 2);

		oBlockLayout.addContent(oBlockLayoutRow);
		oBlockLayout.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.deepEqual(oBlockLayoutRow._getCellArangementForCurrentSize(), [[1, 1, 1]], "Arrangement should be [1, 1, 1] for cells with equal height on size M");
	});

	QUnit.module("BlockLayoutCell configuration");

	QUnit.test("Width of the cell is applied correctly ", function (assert) {
		var oBlockLayout = new BlockLayout(),
			oBlockLayoutCell = new BlockLayoutCell(),
			oBlockLayoutRow = new BlockLayoutRow();

		assert.ok(!oBlockLayoutCell.getLayoutData(), "Initial layout data is not set");

		oBlockLayout.addContent(oBlockLayoutRow);
		oBlockLayout.placeAt("qunit-fixture");
		oBlockLayoutRow.insertContent(oBlockLayoutCell);
		oBlockLayoutCell.setWidth(4);

		Core.applyChanges();

		assert.strictEqual(oBlockLayoutCell.getWidth(), 4, "The width of the cell is applied correctly");
		assert.strictEqual(oBlockLayoutCell.getLayoutData().getSSize(), 1, "The width of the cell in S size is set");
		assert.strictEqual(oBlockLayoutCell.getLayoutData().getMSize(), 4, "The width of the cell in M size is set");
		assert.strictEqual(oBlockLayoutCell.getLayoutData().getLSize(), 4, "The width of the cell in L size is set");
		assert.strictEqual(oBlockLayoutCell.getLayoutData().getXlSize(), 4, "The width of the cell in XL size is set");

	});

	QUnit.module("BlockLayout in a Dialog", {
		beforeEach: function () {
			this.oBlockLayout = new BlockLayout({
				content: [
					new BlockLayoutRow({
						content: [
							new BlockLayoutCell({
								width: 1,
								content: [
									new Text({text: "button 1"})
								]
							}),
							new BlockLayoutCell({
								width: 2,
								content: [
									new Text({text: "button 2"})
								]
							})
						]
					})
				]
			});

			this.oDialog = new Dialog({
				contentHeight: '50px',
				content: this.oBlockLayout
			});

			this.clock = sinon.useFakeTimers();
		},
		afterEach: function () {
			this.oDialog.destroy();
			this.oDialog = null;
			this.oBlockLayout = null;

			this.clock.restore();
		}
	});

	QUnit.test("BlockLayout auto size", function (assert) {
		this.oDialog.open();

		this.clock.tick(1000);

		assert.ok(this.oBlockLayout.$().width() > 0, 'auto width is correct');
	});

	QUnit.module("Sizing");

	QUnit.test("Cells width with different content but same size", function (assert) {

		// Arrange
		var oCell1 = new BlockLayoutCell({ width: 2, content: new Text({ text: "Text with length" }) });
		var oCell2 = new BlockLayoutCell({ width: 2, content: new Text({ text: "Text with length different length" }) });
		var oBlockLayout = new BlockLayout({
			content: [
				new BlockLayoutRow({
					content: [ oCell1, new BlockLayoutCell({ width: 6}) ]
				}),
				new BlockLayoutRow({
					content: [ oCell2, new BlockLayoutCell({ width: 6}) ]
				})
			]
		});

		// Act
		oBlockLayout.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.strictEqual(oCell1.$().width(), oCell2.$().width(), "Cells with same width should be sized the same.");

		// Clean up
		oBlockLayout.destroy();
	});
});