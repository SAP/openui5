/*global QUnit, sinon */
sap.ui.define([
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/MessageToast",
	"sap/m/Table",
	"sap/m/Text",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/util/Mobile"
], function(Column, ColumnListItem, Input, Label, MessageToast, Table, Text, nextUIUpdate, Mobile) {
	"use strict";

	Mobile.init();

	QUnit.module("");

	QUnit.test("Should remove a popin", async function(assert) {
		const oListItem = new ColumnListItem(),
			column = [new Column({
				demandPopin : true,
				// make the column bigger than the screen
				minScreenWidth : "48000px"
			}), new Column()],
			table = new Table({
				columns : column,
				items : oListItem
			});

		table.placeAt("qunit-fixture");
		await nextUIUpdate();
		const hasPopin = oListItem.hasPopin();

		oListItem.removePopin();

		assert.ok(hasPopin, "did have a popin before deleting it");
		assert.equal(oListItem.$Popin().length, 0,"popin got removed from dom");

		table.destroy();
	});

	QUnit.test("Should toggle active class", async function(assert) {
		const testCase = async function(sFunctionName,hasClass) {
			const className = "sapMLIBActive",
				oListItem = new ColumnListItem({
					cells: new Text()
				}),
				column = [new Column({
					demandPopin : true,
					// make the column bigger than the screen
					minScreenWidth : "48000px"
				}), new Column()],
				table = new Table({
					columns : column,
					items : oListItem
				});

			table.placeAt("qunit-fixture");
			await nextUIUpdate();

			//Act
			oListItem[sFunctionName]();

			//Assert
			assert.equal(oListItem.$Popin().hasClass(className), hasClass);

			table.destroy();
		};

		await testCase("_activeHandlingInheritor",true);
		await testCase("_inactiveHandlingInheritor",false);
	});

	QUnit.test("Should calculate drop area rectangle", async function(assert) {
		const oListItem = new ColumnListItem({
				cells: new Text()
			}),
			column = [new Column({
				demandPopin : true,
				// make the column bigger than the screen
				minScreenWidth : "48000px"
			}), new Column()],
			table = new Table({
				columns : column,
				items : oListItem
			});

		table.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(oListItem.getDropAreaRect().bottom > oListItem.getDomRef().getBoundingClientRect().bottom + 16);
		assert.ok(oListItem.getDropAreaRect().height > oListItem.getDomRef().getBoundingClientRect().height + 16);

		table.destroy();
	});

	QUnit.test("Should not clone headers for popinDisplay:WithoutHeader", async function(assert) {
		const oListItem = new ColumnListItem({
				cells : [new Text({
					text: "Cell1"
				}), new Text({
					text: "Cell2"
				})]
			}),
			column1 = new Column({
				header : new Text({
					text : "Header1"
				}),

				// make the size bigger than the screen to force to go to popin
				minScreenWidth : "48000px",
				demandPopin : true
			}),
			column2 = new Column({
				header : new Text({
					text : "Header2"
				})
			}),
			table = new Table({
				columns : [column1, column2],
				items : oListItem
			});

		table.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(oListItem.hasPopin(), "Popin is generated");
		assert.strictEqual(oListItem._aClonedHeaders.length, 1, "Popin has cloned header");
		assert.strictEqual(oListItem.$Popin().find(".sapMListTblSubRowCell").length, 1, "sapMListTblSubRowCell added to popin cell");
		assert.strictEqual(oListItem.$Popin().find(".sapMListTblSubCntHdr").length, 1, "Popin header is found in the dom");
		assert.strictEqual(oListItem.$Popin().find(".sapMListTblSubCntSpr").length, 1, "Popin separator is found in the dom");
		assert.strictEqual(oListItem.$Popin().find(".sapMListTblSubCntVal").length, 1, "Popin cell content found in the dom");
		assert.equal(oListItem.getContentAnnouncement(), "Header2 Cell2 . Header1 Cell1", "content announcement is correct");

		column1.setPopinDisplay("WithoutHeader");
		await nextUIUpdate();

		assert.strictEqual(oListItem._aClonedHeaders.length, 0, "Does not have any cloned headers");
		assert.strictEqual(oListItem.$Popin().find(".sapMListTblSubCntHdr").length, 0, "Popin header is not found in the dom");
		assert.strictEqual(oListItem.$Popin().find(".sapMListTblSubCntSpr").length, 0, "Popin separator is not found in the dom");
		assert.strictEqual(oListItem.$Popin().find(".sapMListTblSubCntVal").length, 1, "Popin cell content found in the dom");

		column1.destroy();
		await nextUIUpdate();

		assert.strictEqual(oListItem._aClonedHeaders.length, 0, "Does not have any cloned headers");
		assert.strictEqual(oListItem.$Popin().length, 0, "No popin in the dom");

		table.destroy();
	});

	QUnit.test("Cloned header should be added as dependent to the column", async function(assert) {
		const oListItem = new ColumnListItem({
			cells : [new Text({
				text: "Cell1"
			}), new Text({
				text: "Cell2"
			})]
		}),
		column1 = new Column({
			header : new Text({
				text : "Header1"
			}),

			// make the size bigger than the screen to force to go to popin
			minScreenWidth : "48000px",
			demandPopin : true
		}),
		column2 = new Column({
			header : new Text({
				text : "Header2"
			})
		}),
		sut2 = new ColumnListItem({
			cells : [new Text({
				text: "Cell1"
			}), new Text({
				text: "Cell2"
			})]
		}),
		table = new Table({
			columns : [column1, column2],
			items : [oListItem, sut2]
		});

		table.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(column1.getDependents()[0], oListItem._aClonedHeaders[0], "cloned popin header is added as a dependent");
		assert.strictEqual(column1.getDependents()[1], sut2._aClonedHeaders[0], "cloned popin header is added as a dependent");

		table.destroy();
	});

	QUnit.test("Popin column headers are added to oTable._aPopinHeaders which is used later for accessibility", async function(assert) {
		const oListItem = new ColumnListItem({
			cells : [
				new Input(),
				new Text({
					text: "Cell2"
				})
			]
		}),
		column1Header = new Text({
			text : "Header1"
		}),
		column1 = new Column({
			header : column1Header,
			// make the size bigger than the screen to force to go to popin
			minScreenWidth : "48000px",
			demandPopin : true
		}),
		column2 = new Column({
			header : new Text({
				text : "Header2"
			})
		}),
		sut2 = new ColumnListItem({
			cells : [
				new Input(),
				new Text({
					text: "Cell2"
				})
			]
		}),
		table = new Table({
			columns : [column1, column2],
			items : [oListItem, sut2]
		});

		table.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(table._aPopinHeaders.length, 1, "1 column header control is added to the array");
		assert.strictEqual(table._aPopinHeaders[0], column1Header, "expected column header control is added to the array");

		assert.ok(oListItem.getCells()[0].getAriaLabelledBy().indexOf(column1Header.getId()) > -1, "expected ariaLabelledBy association found");
		assert.ok(sut2.getCells()[0].getAriaLabelledBy().indexOf(column1Header.getId()) > -1, "expected ariaLabelledBy association found");

		table.invalidate();
		await nextUIUpdate();

		assert.equal(oListItem.getCells()[0].getAriaLabelledBy(), column1Header.getId(), "expected and the only ariaLabelledBy association found");
		assert.equal(sut2.getCells()[0].getAriaLabelledBy(), column1Header.getId(), "expected and the only ariaLabelledBy association found");

		column1.setMinScreenWidth();
		column1.setDemandPopin();
		await nextUIUpdate();

		assert.equal(oListItem.getCells()[0].getAriaLabelledBy(), column1Header.getId(), "expected and the only ariaLabelledBy association found");
		assert.equal(sut2.getCells()[0].getAriaLabelledBy(), column1Header.getId(), "expected and the only ariaLabelledBy association found");

		table.destroy();
	});

	QUnit.test("Test for correct column id", async function(assert) {
		const oListItem = new ColumnListItem({
			cells: [
				new Text({text: "Cell data"})
			]
		});
		const oCol = new Column("testColumn", {
			header: new Label({text: "Column Header"})
		});
		const oTable = new Table("idResponsiveTable", {
			columns: [oCol],
			items: [oListItem]
		});
		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		const $cell = oListItem.getCells()[0].getDomRef();
		const $td = $cell.parentElement;
		assert.equal($td.getAttribute("data-sap-ui-column"), oCol.getId(), "Column id is correctly associated with cell (data-sap-ui-column)");
		assert.notOk($td.getAttribute("headers"), "There is no need for the headers attribute");

		oTable.destroy();
	});

	QUnit.test("No press event on text selection", async function(assert) {
		this.clock = sinon.useFakeTimers();
		const oListItem = new ColumnListItem({
			type: "Active",
			press: function(e) {
				MessageToast.show("Item pressed");
			},
			cells: [
				new Text({text: "Hello World"}),
				new Text({text: "Hello World"})
			]
		});
		const oCol = new Column({
			header: new Label({text: "Column Header"}),
			demandPopin: true,
			minScreenWidth: "4000000px"
		});
		const oTable = new Table({
			columns: [oCol, new Column()],
			items: [oListItem]
		});
		oTable.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		const fnPress = this.spy(oListItem, "firePress");
		oListItem.focus();
		let bHasSelection;
		this.stub(window, "getSelection").callsFake(function() {
			return {
				toString: function() {
					return bHasSelection ? "Hello World" : "";
				},
				focusNode: oListItem.getDomRef("subcell")
			};
		});

		bHasSelection = true;
		assert.equal(window.getSelection().toString(), "Hello World");
		oListItem.$("sub").trigger("tap");
		assert.notOk(fnPress.called, "Press event not fired");

		bHasSelection = false;
		assert.equal(window.getSelection().toString(), "");
		oListItem.$("sub").trigger("tap");
		this.clock.tick(0);
		assert.ok(fnPress.called, "Press event fired");

		this.clock.restore();
		oTable.destroy();
	});

	QUnit.test("PopinDisplay inline should have correct class to render items inline", async function(assert) {
		const oListItem = new ColumnListItem({
			cells : [new Text({
				text: "Cell1"
			}), new Text({
				text: "Cell2"
			})]
		}),
		column1 = new Column({
			header : new Text({
				text : "Header1"
			}),

			// make the size bigger than the screen to force to go to popin
			minScreenWidth : "48000px",
			demandPopin : true,
			popinDisplay: "Inline"
		}),
		column2 = new Column({
			header : new Text({
				text : "Header2"
			})
		}),
		column3 = new Column({
			header : new Text({
				text : "Header2"
			}),
			// make the size bigger than the screen to force to go to popin
			minScreenWidth : "48000px",
			demandPopin : true
		}),
		table = new Table({
			columns : [column1, column2, column3],
			items : oListItem
		});

		table.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(oListItem.hasPopin(), "Popin is generated");
		const $oSubCntRow = oListItem.$("subcell").find(".sapMListTblSubCntRow");
		assert.strictEqual($oSubCntRow.length, 2, "2 popins items found");
		assert.ok($oSubCntRow[0].classList.contains("sapMListTblSubCntRowInline"), "sapMListTblSubCntRowInline styleClass added since column's popinLayout=Inline");
		assert.notOk($oSubCntRow[1].classList.contains("sapMListTblSubCntRowInline"), "sapMListTblSubCntRowInline styleClass not added since column's popinLayou=Block");

		table.destroy();
	});

	QUnit.test("test getAriaRole", async function(assert) {
		const oListItem = new ColumnListItem({
			cells : [new Text({
				text: "Cell1"
			})]
		});

		const table = new Table({
			mode: "MultiSelect",
			items: [oListItem]
		});

		table.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.notOk(oListItem.$().attr("role"), "role attribute not added");

		table.destroy();
	});

	QUnit.module("Dummy Column", {
		beforeEach: async function() {
			this.oListItem = new ColumnListItem({
				cells : [new Text({
					text: "Cell"
				}), new Text({
					text: "Cell"
				})]
			});
			this.table = new Table({
				columns : [
					new Column({width: "15rem"}),
					new Column({width: "150px"})
				],
				items : this.oListItem,
				fixedLayout: "Strict"
			});


			this.table.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.table.destroy();
		}
	});

	QUnit.test("When there is a dummy col rendered, the dummy cells should also be created", function(assert) {
		assert.ok(this.oListItem.$().find(".sapMListTblDummyCell").length > 0, "Dummy cell are rendered");
	});

	QUnit.test("Dummy column position when table does not have popins", function(assert) {
		const aTdElements = this.oListItem.$().children();
		assert.ok(aTdElements[aTdElements.length - 1].classList.contains("sapMListTblDummyCell"), "Dummy cell is rendered as the last td element");
	});

	QUnit.test("Dummy column position when table does has popins", async function(assert) {
		const oColumn = this.table.getColumns()[1];
		oColumn.setMinScreenWidth("48000px");
		oColumn.setDemandPopin(true);
		await nextUIUpdate();

		const aTdElements = this.oListItem.$().children();
		assert.notOk(aTdElements[aTdElements.length - 1].classList.contains("sapMListTblDummyCell"), "Dummy cell is rendered as the last td element");
	});

	QUnit.test("Focus should stay in the popin area", async function(assert) {
		const oListItem = new ColumnListItem({
			cells : [new Input({
				value: "Cell1"
			}), new Text({
				text: "Cell2"
			})]
		}),
		column1 = new Column({
			header : new Text({
				text : "Header1"
			}),
			minScreenWidth : "48000px",
			demandPopin : true
		}),
		column2 = new Column({
			header : new Text({
				text : "Header2"
			})
		}),
		table = new Table({
			columns : [column1, column2],
			items : [oListItem]
		});

		table.placeAt("qunit-fixture");
		await nextUIUpdate();

		oListItem.getCells()[0].focus();
		assert.equal(document.activeElement, oListItem.getCells()[0].getFocusDomRef(), "focus is set to the input");

		oListItem.invalidate();
		await nextUIUpdate();

		assert.equal(document.activeElement, oListItem.getCells()[0].getFocusDomRef(), "focus is not change and still on the input");

		table.destroy();
	});
});