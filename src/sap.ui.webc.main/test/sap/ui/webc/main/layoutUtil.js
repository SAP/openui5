/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/layout/BlockLayout",
	"sap/ui/layout/BlockLayoutRow",
	"sap/ui/layout/BlockLayoutCell",
	"sap/ui/layout/Grid",
	"sap/ui/layout/GridData",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/m/VBox",
	"sap/ui/layout/cssgrid/CSSGrid",
	"sap/ui/layout/cssgrid/GridResponsiveLayout",
	"sap/ui/layout/cssgrid/ResponsiveColumnItemLayoutData",
	"sap/ui/layout/cssgrid/GridSettings",
	"sap/ui/webc/main/Select",
	"sap/ui/webc/main/Option",
	"sap/ui/webc/main/Label",
	"sap/ui/core/HTML"
], function(
	BlockLayout,
	BlockLayoutRow,
	BlockLayoutCell,
	Grid,
	GridData,
	HorizontalLayout,
	VerticalLayout,
	VBox,
	CSSGrid,
	GridResponsiveLayout,
	ResponsiveColumnItemLayoutData,
	GridSettings,
	Select,
	Option,
	Label,
	HTML
) {
	"use strict";

	var oCurrentLayout,
		layoutFactory = {
			createBlockLayout: createBlockLayout,
			createGrid: createGrid,
			createCSSGrid: createCSSGrid,
			createVerticalLayout: createVerticalLayout,
			createHorizontalLayout: createHorizontalLayout
		};

	var Row = function(sTitle, aCells) {
		aCells || (aCells = []);
		this.title = sTitle;
		this.cells = aCells;
	};

	var Cell = function(sTitle, aContent) {
		aContent || (aContent = []);
		this.title = sTitle;
		this.content = aContent;
	};

	function createBlockLayout(aRows) {
		var blockLayout = new BlockLayout();

		function createRowWithTitle(sTitle) {
			return new BlockLayoutRow({
				accentCells: "Accent1",
				content: [
					new BlockLayoutCell({
						backgroundColorSet: "ColorSet10",
						backgroundColorShade: "ShadeD",
						title: sTitle
					})
				]
			});
		}

		aRows.forEach(function(oRow) {
			if (oRow.title) {
				blockLayout.addContent(createRowWithTitle(oRow.title));
			}

			if (oRow.cells) {
				var oLayoutRow = new BlockLayoutRow({ accentCells: "Accent1" });
				oRow.cells.forEach(function(oCell) {
					oLayoutRow.addContent(new BlockLayoutCell(oCell));
				});
				blockLayout.addContent(oLayoutRow);
			}
		});

		return blockLayout;
	}

	function createGrid(aRows) {
		var grid = new Grid();

		function createRowWithTitle(sTitle) {
			return new HTML({ content: "<h1>" + sTitle + "</h1>"})
				.setLayoutData(new GridData({ span: "XL12 L12 M12 S12" }));
		}

		function createCellWithContent(aContent) {
			if (aContent.length === 1) {
				return aContent[0];
			}

			if (aContent.length > 1) {
				return new VBox({items: aContent});
			}

			return aContent;
		}

		aRows.forEach(function(oRow) {
			if (oRow.title) {
				grid.addContent(createRowWithTitle(oRow.title));
			}

			if (oRow.cells) {
				oRow.cells.forEach(function(oCell) {
					grid.addContent(createCellWithContent(oCell.content));
				});
			}
		});

		return grid;
	}

	function createVerticalLayout(aRows) {
		// wrapping container is VBox
		var layout = new VBox();

		function createRowWithTitle(sTitle) {
			return new HTML({ content: "<h1>" + sTitle + "</h1>"});
		}

		function createCellWithContent(aContent) {
			if (aContent.length === 1) {
				return aContent[0];
			}

			if (aContent.length > 1) {
				return new VerticalLayout({content: aContent});
			}

			return aContent;
		}

		aRows.forEach(function(oRow) {
			if (oRow.title) {
				layout.addItem(createRowWithTitle(oRow.title));
			}

			if (oRow.cells) {
				oRow.cells.forEach(function(oCell) {
					layout.addItem(createCellWithContent(oCell.content));
				});
			}
		});

		return layout;
	}

	function createHorizontalLayout(aRows) {
		// wrapping container is VBox
		var layout = new VBox();

		function createRowWithTitle(sTitle) {
			return new HTML({ content: "<h1>" + sTitle + "</h1>"});
		}

		function createCellWithContent(aContent) {
			if (aContent.length === 1) {
				return aContent[0];
			}

			if (aContent.length > 1) {
				return new VerticalLayout({content: aContent});
			}

			return aContent;
		}

		aRows.forEach(function(oRow) {
			if (oRow.title) {
				layout.addItem(createRowWithTitle(oRow.title));
			}

			if (oRow.cells) {
				var oRowLayout = new HorizontalLayout();
				oRow.cells.forEach(function(oCell) {
					oRowLayout.addContent(createCellWithContent(oCell.content));
				});
				layout.addItem(oRowLayout);
			}
		});

		return layout;
	}

	function createCSSGrid(aRows) {
		var grid = new CSSGrid();
		grid.setCustomLayout(
			new GridResponsiveLayout({
				layoutS: new GridSettings({
					gridTemplateColumns: "1fr",
					gridRowGap: "1rem",
					gridColumnGap: "1rem"
				}),
				layout: new GridSettings({
					gridTemplateColumns: "repeat(auto-fit, 12rem)",
					gridAutoRows: "5rem",
					gridColumnGap: "1rem"
				}),
				layoutM: new GridSettings({
					gridTemplateColumns: "repeat(2, 1fr)",
					gridRowGap: "1rem",
					gridColumnGap: "1rem"
				}),
				layoutL: new GridSettings({
					gridTemplateColumns: "repeat(3, 1fr)",
					gridRowGap: "1rem",
					gridColumnGap: "1rem"
				}),
				layoutXL: new GridSettings({
					gridTemplateColumns: "repeat(4, 1fr)",
					gridRowGap: "1rem",
					gridColumnGap: "1rem"
				})
			}));

		function createRowWithTitle(sTitle) {
			return new HTML({ content: "<h1>" + sTitle + "</h1>"})
				.setLayoutData(new ResponsiveColumnItemLayoutData({ columns: 5 }));
		}

		function createCellWithContent(aContent) {
			if (aContent.length === 1) {
				return aContent[0];
			}

			if (aContent.length > 1) {
				return new VBox({items: aContent});
			}

			return aContent;
		}

		aRows.forEach(function(oRow) {
			if (oRow.title) {
				grid.addItem(createRowWithTitle(oRow.title));
			}
			if (oRow.cells) {
				oRow.cells.forEach(function(oCell) {
					grid.addItem(createCellWithContent(oCell.content));
				});
			}
		});

		return grid;
	}

	function createLayoutsSelect() {
		var oSelect = new Select({
			width: "300px",
			options: [
				new Option({text: "sap.ui.layout.BlockLayout", value: "BlockLayout"}),
				new Option({text: "sap.ui.layout.Grid", value: "Grid"}),
				new Option({text: "sap.ui.layout.cssgrid.CSSGrid", value: "CSSGrid"}),
				new Option({text: "sap.ui.layout.VerticalLayout", value: "VerticalLayout"}),
				new Option({text: "sap.ui.layout.HorizontalLayout", value: "HorizontalLayout"})
			]
		});
		return oSelect;
	}

	function enableLayout(sLayoutName, aRows, oContainerDomRef) {
		var fnCreateLayout = "create" + sLayoutName;
		displayLayout(layoutFactory[fnCreateLayout](aRows), oContainerDomRef);
	}

	function displayLayout(oLayout, oContainerDomRef) {
		if (oCurrentLayout) {
			oCurrentLayout.setVisible(false);
		}
		oCurrentLayout = oLayout;
		oCurrentLayout.placeAt(oContainerDomRef);
	}

	function addLayoutOptions(aRows, oContainerDomRef) {
		var oSelect = createLayoutsSelect().attachChange(function(oEvent) {
			var sNewLayout = oEvent.getParameter("selectedOption").getValue();
			enableLayout(sNewLayout, aRows, oContainerDomRef);
		});
		new Label({text: "Swtch layout: "}).addStyleClass("sapUiTinyMargin").placeAt(oContainerDomRef);
		oSelect.placeAt(oContainerDomRef);
		enableLayout(oSelect.getOptions()[0].getValue(), aRows, oContainerDomRef);
	}

	return {
		addLayoutOptions: addLayoutOptions,
		Row: Row,
		Cell: Cell
	};
});
