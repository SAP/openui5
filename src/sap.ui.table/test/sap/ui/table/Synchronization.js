// Note: the HTML page 'Synchronization.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/core/RenderManager",
	"sap/ui/model/json/JSONModel",
	"sap/ui/table/TreeTable",
	"sap/ui/table/Column",
	"sap/m/Text",
	"sap/m/Link",
	"sap/ui/core/Icon",
	"sap/m/Toolbar",
	"sap/m/Label",
	"sap/ui/layout/Splitter",
	"sap/ui/core/Control",
	"sap/ui/thirdparty/jquery"
], function(RenderManager, JSONModel, TreeTable, Column, Text, Link, Icon, Toolbar, Label, Splitter, Control, jQuery) {
	"use strict";
	/*global TABLESETTINGS */
	let iGeneratedSizeFactors = 0;

	function getSizeFactor() {
		iGeneratedSizeFactors++;
		if (iGeneratedSizeFactors % 3 === 0 && iGeneratedSizeFactors % 5 === 0) {
			return 2;
		} else if (iGeneratedSizeFactors % 6 === 0) {
			return 3;
		} else {
			return 1;
		}
	}

	function enrichTreeData(oNode) {
		oNode.sizeFactor = getSizeFactor();
		for (const sPropertyName in oNode) {
			if (!isNaN(sPropertyName)) {
				enrichTreeData(oNode[sPropertyName]);
			} else if (Array.isArray(oNode[sPropertyName])) {
				oNode[sPropertyName].forEach(function(oChildNode) {
					oChildNode.sizeFactor = getSizeFactor();
				});
			} else {
				oNode[sPropertyName].sizeFactor = getSizeFactor();
			}
		}
	}

	enrichTreeData(TABLESETTINGS.treeTestData.root);

	const oModel = new JSONModel();
	oModel.setData(TABLESETTINGS.treeTestData.root);

	const SyncedControl = Control.extend("sap.ui.table.test.SyncedControl", /** @lends sap.ui.table.test.SyncedControl.prototype */ {
		renderer: function(oRm, oControl) {
			oRm.openStart("div", oControl);
			oRm.style("height", "0"); // height=0 allows shrinking in row mode Auto
			oRm.openEnd();
				oRm.openStart("div").style("display", "flex").openEnd();
					oRm.openStart("div").style("display", "flex").style("flex-direction", "column").style("overflow", "hidden").openEnd();
						oRm.openStart("div", "table").style("overflow", "hidden").openEnd()
							oRm.openStart("div", "table-header")
								.style("width", "1000px")
								.style("height", (oControl.state.layout.top + oControl.state.layout.headerHeight) + "px")
								.style("background-color", "#e8e8e8")
								.style("border-bottom", "1px solid lightgray")
								.openEnd()
								.text("head")
								.close("div");
							oRm.openStart("div", "table-content")
								.style("width", "1000px")
								.style("height", oControl.state.layout.contentHeight + "px")
								.style("overflow", "hidden")
								.openEnd()
								.close("div");
						oRm.close("div");
						oRm.openStart("div", "table-hsb-container").openEnd().close("div");
					oRm.close("div");
					oRm.openStart("div", "table-vsb-container")
						.style("margin-top", (oControl.state.layout.top + oControl.state.layout.headerHeight) + "px")
						.openEnd()
						.close("div");
				oRm.close("div");
			oRm.close("div");
		},
		init: function() {
			this.oSyncInterface = null;
			this.state = {
				rows: [], /* row:{height:int, selected:boolean, hovered:boolean} */
				innerVerticalScrollPosition: 0,
				horizontalScrollPosition: 0,
				layout: {
					top: 0,
					headerHeight: 0,
					contentHeight: 0
				}
			};
		},
		onAfterRendering: function() {
			const oDomRef = this.getDomRef();

			this.oTable = oDomRef.querySelector("#table");
			this.oHeader = oDomRef.querySelector("#table-header");
			this.oContent = oDomRef.querySelector("#table-content");
			this.oVSbContainer = oDomRef.querySelector("#table-vsb-container");
			this.oHSbContainer = oDomRef.querySelector("#table-hsb-container");

			if (this.oSyncInterface) {
				this.oSyncInterface.registerVerticalScrolling({
					wheelAreas: [this.oContent],
					touchAreas: [this.oContent]
				});

				this.oSyncInterface.placeVerticalScrollbarAt(this.oVSbContainer);

				const oRenderManager = new RenderManager().getInterface();
				this.oSyncInterface.renderHorizontalScrollbar(oRenderManager, this.getId() + "-hsb", 1000);
				oRenderManager.flush(this.oHSbContainer);
			}

			this.oHSb = this.getDomRef("hsb");
			if (this.oHSb) {
				this.oHSb.addEventListener("scroll", function(oEvent) {
					this.state.horizontalScrollPosition = oEvent.target.scrollLeft;
					this.oTable.scrollLeft = oEvent.target.scrollLeft;
				}.bind(this));
			}

			this.updateRows();
			this.updateScrollPositions();
		},
		updateLayout: function() {
			if (!this.oHeader || !this.oContent || !this.oVSbContainer) {
				return;
			}
			this.oHeader.style.height = (this.state.layout.top + this.state.layout.headerHeight) + "px";
			this.oContent.style.height = this.state.layout.contentHeight + "px";
			this.oVSbContainer.style.marginTop = (this.state.layout.top + this.state.layout.headerHeight) + "px";
		},
		updateScrollPositions: function() {
			if (!this.oTable || !this.oHSb || !this.oContent) {
				return;
			}
			this.oHSb.scrollLeft = this.state.horizontalScrollPosition;
			this.oTable.scrollLeft = this.state.horizontalScrollPosition;
			this.oContent.scrollTop = this.state.innerVerticalScrollPosition;
		},
		updateRows: function() {
			if (!this.oContent) {
				return;
			}

			const that = this;
			const aRows = this.oContent.querySelectorAll("div");
			const aRowStates = this.state.rows;
			const iLength = Math.max(aRows.length, aRowStates.length);

			function updateRow(oRow, oState, iIndex) {
				oRow.style.width = "100%";
				oRow.style.height = oState.height + "px";
				oRow.setAttribute("data-sap-ui-index", iIndex);
				oRow.setAttribute("data-selected", oState.selected);
				if (oState.selected && oState.hovered) {
					oRow.style.backgroundColor = "gray";
				} else if (oState.selected) {
					oRow.style.backgroundColor = "lightblue";
				} else if (oState.hovered) {
					oRow.style.backgroundColor = "lightgray";
				} else {
					oRow.style.backgroundColor = "white";
				}
				oRow.style.borderBottom = "1px solid lightgray";
				oRow.style.boxSizing = "border-box";
				oRow.textContent = "row";
			}

			function attachEventListener(oRow) {
				jQuery(oRow).on("mouseenter", function(oEvent) {
					const iIndex = parseInt(oEvent.target.getAttribute("data-sap-ui-index"));
					that.oSyncInterface.syncRowHover(iIndex, true);
				}).on("mouseleave", function(oEvent) {
					const iIndex = parseInt(oEvent.target.getAttribute("data-sap-ui-index"));
					that.oSyncInterface.syncRowHover(iIndex, false);
				});
				jQuery(oRow).on("click", function(oEvent) {
					const iIndex = parseInt(oEvent.target.getAttribute("data-sap-ui-index"));
					const bSelected = oEvent.target.getAttribute("data-selected") === "true";
					that.oSyncInterface.syncRowSelection(iIndex, !bSelected);
				});
			}

			for (let i = 0; i < iLength; i++) {
				const oRow = aRows[i];
				const oRowState = aRowStates[i];

				if (!oRowState) { // Remove row
					jQuery(oRow).remove();
				} else if (!oRow) { // Add row
					var oNewRow = document.createElement("div");
					updateRow(oNewRow, oRowState, i);
					attachEventListener(oNewRow);
					this.oContent.appendChild(oNewRow);
				} else { // Update row
					updateRow(oRow, oRowState, i);
				}
			}
		},
		syncWith: function(oTable) {
			const that = this;
			oTable._enableSynchronization().then(function(oSyncInterface) {
				that.oSyncInterface = oSyncInterface;

				oSyncInterface.rowCount = function(iCount) {
					const iOldCount = that.state.rows.length;

					if (iOldCount < iCount) {
						for (let i = 0; i < iCount - iOldCount; i++) {
							that.state.rows.push({
								height: 0,
								selected: false,
								hovered: false
							});
						}
					} else if (iOldCount > iCount) {
						for (let i = iOldCount - 1; i >= iCount; i--) {
							that.state.rows.pop();
						}
					}

					that.updateRows();
				};

				oSyncInterface.rowSelection = function(iIndex, bSelected) {
					that.state.rows[iIndex].selected = bSelected;
					that.updateRows();
				};

				oSyncInterface.rowHover = function(iIndex, bHovered) {
					that.state.rows[iIndex].hovered = bHovered;
					that.updateRows();
				};

				oSyncInterface.rowHeights = function(aHeights) {
					oSyncInterface.rowCount(aHeights.length);
					aHeights[0] = Math.max(aHeights[0], 123); // The first rendered row will always have at least a height of 123px.
					aHeights.forEach(function(iHeight, iIndex) {
						that.state.rows[iIndex].height = iHeight;
					});
					that.updateRows();
					return aHeights;
				};

				oSyncInterface.innerVerticalScrollPosition = function(iScrollPosition) {
					that.state.innerVerticalScrollPosition = iScrollPosition;
					that.updateScrollPositions();
				};

				oSyncInterface.layout = function(mLayoutData) {
					that.state.layout = mLayoutData;
					that.updateLayout();
				};

				that.invalidate();
			});
		}
	});

	const oTable = new TreeTable({
		rows: {
			path: "/",
			parameters: {
				numberOfExpandedLevels: 2
			}
		},
		rowMode: "Auto",
		selectionBehavior: "Row",
		columns: [
			new Column({
				label: new Label({text: "Name"}),
				template: new Text({text: "{name}", wrapping: false}),
				sortProperty: "name",
				filterProperty: "name",
				width: "250px"
			}),
			new Column({
				label: new Label({text: "Description"}),
				template: new Text({text: "{description}", wrapping: false}),
				sortProperty: "description",
				filterProperty: "description",
				width: "400px"
			}),
			new Column({
				label: new Label({text: "State"}),
				template: new Text({text: "{highlightState}", wrapping: false}),
				sortProperty: "highlightState",
				filterProperty: "highlightState",
				width: "250px"
			}),
			new Column({
				label: new Label({text: "Icon"}),
				template: new Icon({
					src: "sap-icon://account",
					size: {path: "sizeFactor", formatter: function(iFactor) { return (iFactor * 48) + "px"; }}
				}),
				width: "100px"
			})
		],
		fixedColumnCount: 1,
		models: oModel
	});
	oTable._bVariableRowHeightEnabled = true;

	const oTable2 = new TreeTable({
		rows: {
			path: "/",
			parameters: {
				numberOfExpandedLevels: 2
			}
		},
		rowMode: "Auto",
		selectionBehavior: "Row",
		columns: [
			new Column({
				label: new Label({text: "Name"}),
				template: new Text({text: "{name}", wrapping: false}),
				sortProperty: "name",
				filterProperty: "name",
				width: "250px"
			})
		],
		fixedColumnCount: 1,
		models: oModel
	});
	oTable2._bVariableRowHeightEnabled = true;

	const oSyncedControl = new SyncedControl();
	oSyncedControl.syncWith(oTable);

	const oSyncedControl2 = new SyncedControl();
	oSyncedControl2.syncWith(oTable2);

	new Splitter({
		contentAreas: [
			new Splitter({
				contentAreas: [oTable, oSyncedControl]
			}),
			new Splitter({
				contentAreas: [oTable2, oSyncedControl2]
			})
		],
		orientation: "Vertical"
	}).placeAt("content");

	oTable.addExtension(new Toolbar());
	TABLESETTINGS.init(oTable, function(oButton) {
		oTable.getExtension()[0].addContent(oButton);
	});

	window.oTable = oTable;
	window.oSyncedControl = oSyncedControl;
});