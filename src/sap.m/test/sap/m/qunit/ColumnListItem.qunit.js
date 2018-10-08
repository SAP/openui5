/*global QUnit */
sap.ui.define([
	"sap/ui/util/Mobile",
	"sap/ui/Device",
	"sap/m/ColumnListItem",
	"sap/m/Column",
	"sap/m/Table",
	"sap/m/Text",
	"sap/m/Label"
], function(Mobile, Device, ColumnListItem, Column, Table, Text, Label) {
	"use strict";



	Mobile.init();
	var core = sap.ui.getCore();

	QUnit.test("ShouldRemoveAPopin", function(assert) {
		// SUT
		var hasPopin,
			sut = new ColumnListItem(),
			column = new Column({
				demandPopin : true,
				// make the column bigger than the screen
				minScreenWidth : "48000px"
			}),
			table = new Table({
				columns : column,
				items : sut
			});

		table.placeAt("qunit-fixture");
		core.applyChanges();
		hasPopin = sut.hasPopin();

		// Act
		sut.removePopin();

		// Assert
		assert.ok(hasPopin, "did have a popin before deleting it");
		assert.equal(sut.$Popin().length, 0,"popin got removed from dom");

		//Cleanup
		table.destroy();
	});

	QUnit.test("ShouldToggleActiveClass", function(assert) {
		var testCase = function(sFunctionName,hasClass){
			//Arrange
			var className = "sapMLIBActive",
				sut = new ColumnListItem({
					cells: new Text()
				}),
				column = new Column({
					demandPopin : true,
					// make the column bigger than the screen
					minScreenWidth : "48000px"
				}),
				table = new Table({
					columns : column,
					items : sut
				});

			table.placeAt("qunit-fixture");
			core.applyChanges();

			//Act
			sut[sFunctionName]();

			//Assert
			assert.equal(sut.$Popin().hasClass(className), hasClass);

			table.destroy();
		};

		testCase("_activeHandlingInheritor",true);
		testCase("_inactiveHandlingInheritor",false);
	});

	QUnit.test("Should not clone headers for popinDisplay:WithoutHeader", function(assert) {
		// SUT
		var sut = new ColumnListItem({
				cells : new Text({
					text: "Cell"
				})
			}),
			column = new Column({
				header : new Text({
					text : "Header"
				}),

				// make the size bigger than the screen to force to go to popin
				minScreenWidth : "48000px",
				demandPopin : true
			}),
			table = new Table({
				columns : column,
				items : sut
			});

		table.placeAt("qunit-fixture");
		core.applyChanges();

		// Assert
		assert.ok(sut.hasPopin(), "Popin is generated");
		assert.strictEqual(sut._aClonedHeaders.length, 1, "Popin has cloned header");
		assert.strictEqual(sut.$Popin().find(".sapMListTblSubCntHdr").length, 1, "Popin header is found in the dom");
		assert.strictEqual(sut.$Popin().find(".sapMListTblSubCntSpr").length, 1, "Popin separator is found in the dom");
		assert.strictEqual(sut.$Popin().find(".sapMListTblSubCntVal").length, 1, "Popin cell content found in the dom");

		column.setPopinDisplay("WithoutHeader");
		core.applyChanges();

		assert.strictEqual(sut._aClonedHeaders.length, 0, "Does not have any cloned headers");
		assert.strictEqual(sut.$Popin().find(".sapMListTblSubCntHdr").length, 0, "Popin header is not found in the dom");
		assert.strictEqual(sut.$Popin().find(".sapMListTblSubCntSpr").length, 0, "Popin separator is not found in the dom");
		assert.strictEqual(sut.$Popin().find(".sapMListTblSubCntVal").length, 1, "Popin cell content found in the dom");

		column.destroy();
		core.applyChanges();

		assert.strictEqual(sut._aClonedHeaders.length, 0, "Does not have any cloned headers");
		assert.strictEqual(sut.$Popin().length, 0, "No popin in the dom");

		//Cleanup
		table.destroy();
	});

	QUnit.test("RenderOulineClassButNotLegacyOutlineClass", function(assert) {
		this.stub(Device.system, "desktop", true);
		this.stub(Device, "browser", {"msie": true});

		// SUT
		var sut = new ColumnListItem(),
			column = new Column(),
			table = new Table({
				columns : column,
				items : sut
			});

		table.placeAt("qunit-fixture");
		core.applyChanges();

		// Assert
		assert.ok(sut.$().hasClass("sapMLIBFocusable"), "Outline class is added");
		assert.ok(!sut.$().hasClass("sapMLIBLegacyOutline"), "Legacy outline class is not added");

		//Cleanup
		table.destroy();
	});

	QUnit.test("Test for correct column id", function(assert) {
		var oCLI = new ColumnListItem({
			cells: [
				new Text({text: "Cell data"})
			]
		});
		var oCol = new Column("testColumn", {
			header: new Label({text: "Column Header"})
		});
		var sut = new Table("idResponsiveTable", {
			columns: [oCol],
			items: [oCLI]
		});
		sut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var $cell = oCLI.getCells()[0].getDomRef();
		var $td = $cell.parentElement;
		assert.equal($td.getAttribute("data-sap-ui-column"), oCol.getId(), "Column id is correctly associated with cell");

		// cleanup
		sut.destroy();
	});
});