/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/library",
	"sap/ui/Device"
],
function (library, Device) {
	"use strict";

	// shortcut for sap.m.ListGrowingDirection
	var ListGrowingDirection = library.ListGrowingDirection;

	// shortcut for sap.m.ListKeyboardMode
	var ListKeyboardMode = library.ListKeyboardMode;

	// shortcut for sap.m.ToolbarDesign
	var ToolbarDesign = library.ToolbarDesign;

	var SPAN_PATTERN = /^([X][L](?:[1-9]|1[0-2]))? ?([L](?:[1-9]|1[0-2]))? ?([M](?:[1-9]|1[0-2]))? ?([S](?:[1-9]|1[0-2]))?$/i;
	var DEFAULT_SPAN_CLASSES = {
		"XL": "sapTntBoxContainerSpanXL7",
		"L": "sapTntBoxContainerSpanL6",
		"M": "sapTntBoxContainerSpanM4",
		"S": "sapTntBoxContainerSpanS2"
	};

	var DEFAULT_SPAN_PATTERN = SPAN_PATTERN.exec("XL7 L6 M4 S2");

	/**
	 * BoxContainerListRenderer renderer.
	 * @namespace
	 */
	var BoxContainerListRenderer = {};

	BoxContainerListRenderer.render = function (rm, oControl) {

		// container
		rm.write("<div");
		rm.addClass("sapMList");
		rm.addClass("sapTntBoxContainerList");
		this.addSpanClasses(rm, oControl);
		rm.writeControlData(oControl);

		if (oControl.getWidth()) {
			rm.addStyle("width", oControl.getWidth());
		}

		// tooltip
		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			rm.writeAttributeEscaped("title", sTooltip);
		}

		rm.writeStyles();
		rm.writeClasses();
		rm.write(">");

		// render header
		var sHeaderText = oControl.getHeaderText();
		var oHeaderTBar = oControl.getHeaderToolbar();
		if (oHeaderTBar) {
			oHeaderTBar.setDesign(ToolbarDesign.Transparent, true);
			oHeaderTBar.addStyleClass("sapMListHdrTBar");
			oHeaderTBar.addStyleClass("sapMTBHeader-CTX");
			rm.renderControl(oHeaderTBar);
		} else if (sHeaderText) {
			rm.write("<header class='sapMListHdrText'");
			rm.writeAttribute("id", oControl.getId("header"));
			rm.write(">");
			rm.writeEscaped(sHeaderText);
			rm.write("</header>");
		}

		// determine items rendering
		var oConfig = this.getRenderingConfiguration(oControl);

		// render top growing
		if (oConfig.upwardGrowing) {
			this.renderGrowing(rm, oControl);
		}

		// dummy keyboard handling area
		if (oConfig.renderItems || oConfig.showNoData) {
			this.renderDummyArea(rm, oControl, "before", -1);
		}

		// render list
		this.renderList(rm, oControl);

		// dummy keyboard handling area
		if (oConfig.renderItems || oConfig.showNoData) {
			this.renderDummyArea(rm, oControl, "after", oConfig.tabIndex);
		}

		// render bottom growing
		if (!oConfig.upwardGrowing) {
			this.renderGrowing(rm, oControl);
		}

		// done
		rm.write("</div>");
	};

	// Renders the list holding all the items
	BoxContainerListRenderer.renderList = function (rm, oControl) {
		// determine items rendering
		var aItems = oControl.getItems(),
			oConfig = this.getRenderingConfiguration(oControl);

		rm.write("<ul");
		rm.addClass("sapMListItems");
		oControl.addNavSection(oControl.getId("listUl"));

		// When grouping is enabled the groups will apply the grid attributes
		if (!oConfig.grouped) {
			this.renderGrid(rm, oControl);
		}

		// write accessibility state
		rm.writeAttribute("id", oControl.getId("listUl"));
		rm.writeAccessibilityState(oControl, this.getAccessibilityState(oControl));
		if (oConfig.renderItems || oConfig.showNoData) {
			rm.writeAttribute("tabindex", oConfig.tabIndex);
		}

		rm.addClass("sapMListUl");

		// write inserted styles and classes
		rm.writeClasses();
		rm.writeStyles();
		rm.write(">");

		// render child controls
		if (oConfig.grouped) {
			this.renderGroupedList(rm, oControl);
		} else if (oConfig.renderItems) {
			if (oConfig.upwardGrowing) {
				aItems.reverse();
			}

			for (var i = 0; i < aItems.length; i++) {
				rm.renderControl(aItems[i]);
			}
		}

		// render no-data if needed
		if (!oConfig.renderItems && oConfig.showNoData) {
			this.renderNoData(rm, oControl);
		}

		rm.write("</ul>");
	};

	// Renders a list which have a sub list for every group
	// Used when grouping is enabled
	BoxContainerListRenderer.renderGroupedList = function (rm, oControl) {
		var aItems = oControl.getItems(),
			aGroupTmp = [],
			aGroupedItems = [],
			oItem;

		// Create groups
		for (var i = 0; i < aItems.length; i++) {
			oItem = aItems[i];

			if (oItem.isGroupHeader() && i !== 0) {
				aGroupedItems.push(aGroupTmp);
				aGroupTmp = [];
			}

			aGroupTmp.push(oItem);
		}
		aGroupedItems.push(aGroupTmp);

		// Render groups
		aGroupedItems.forEach(function (aGroup) {
			rm.write("<li>");
			this.renderGroup(rm, oControl, aGroup);
			rm.write("</li>");
		}, this);
	};

	// Renders a single group for a grouped list
	// Used when grouping is enabled
	BoxContainerListRenderer.renderGroup = function (rm, oControl, aItems) {
		var oConfig = this.getRenderingConfiguration(oControl);

		rm.write("<ul");
		rm.addClass("sapMListItems");
		rm.addClass("sapMListUl");

		this.renderGrid(rm, oControl);

		// write inserted styles and classes
		rm.writeClasses();
		rm.writeStyles();
		rm.write(">");

		// render child controls
		if (oConfig.renderItems) {
			if (oConfig.upwardGrowing) {
				aItems.reverse();
			}

			for (var i = 0; i < aItems.length; i++) {
				rm.renderControl(aItems[i]);
			}
		}

		rm.write("</ul>");
	};

	// Adds the classes and attributes for the grid
	BoxContainerListRenderer.renderGrid = function (rm, oControl) {
		var sWidth = oControl.getBoxWidth();

		if (!sWidth) {
			rm.addClass("sapTntBoxContainerRelativeWidth");
		}

		rm.addClass("sapTntBoxContainerGrid");

		if (oControl.isGrouped()) {
			rm.addClass("sapTntBoxContainerGridGrouped");
		}

		if (!Device.browser.msie && sWidth) {
			rm.addStyle("grid-template-columns", "repeat(auto-fit, " + sWidth + ")");
		}
	};

	/**
	 * ===========================================================
	 * Helper functions
	 * ===========================================================
	 */

	// Adds the breakpoint classes depending on boxesPerRowConfig property
	BoxContainerListRenderer.addSpanClasses = function (rm, oControl) {
		var aSpan,
			sSpan,
			sSpanPattern = oControl.getBoxesPerRowConfig(),
			sSpanXLargeClass,
			sSpanLargeClass,
			sSpanMediumClass,
			sSpanSmallClass;

		// Span classes are used only when no boxWidth is being set.
		if (oControl.getBoxWidth()) {
			return;
		}

		if (!sSpanPattern || !sSpanPattern.lenght === 0) {
			aSpan = DEFAULT_SPAN_PATTERN;
		} else {
			aSpan = SPAN_PATTERN.exec(sSpanPattern);
		}

		if (aSpan) {
			for (var i = 1; i < aSpan.length; i++) {
				sSpan = aSpan[i];

				if (sSpan) {
					sSpan = sSpan.toUpperCase();

					switch (sSpan.substr(0, 1)) {
						case "X":
							if (sSpan.substr(1, 1) === "L") {
								sSpanXLargeClass = this.getBoxesPerRowClass(sSpan, 2);
							}
							break;
						case "L": sSpanLargeClass = this.getBoxesPerRowClass(sSpan, 1); break;
						case "M": sSpanMediumClass = this.getBoxesPerRowClass(sSpan, 1); break;
						case "S": sSpanSmallClass = this.getBoxesPerRowClass(sSpan, 1); break;
						default: break;
					}
				}
			}
		}

		sSpanXLargeClass = sSpanXLargeClass || DEFAULT_SPAN_CLASSES.XL;
		sSpanLargeClass = sSpanLargeClass || DEFAULT_SPAN_CLASSES.L;
		sSpanMediumClass = sSpanMediumClass || DEFAULT_SPAN_CLASSES.M;
		sSpanSmallClass = sSpanSmallClass || DEFAULT_SPAN_CLASSES.S;

		rm.addClass([
			sSpanXLargeClass,
			sSpanLargeClass,
			sSpanMediumClass,
			sSpanSmallClass
		].join(" "));
	};

	BoxContainerListRenderer.getBoxesPerRowClass = function (sSpan, iIndex) {
		var iSpan = parseInt(sSpan.substr(iIndex, sSpan.length), 10);
		if (iSpan && iSpan > 0 && iSpan < 13) {
			return "sapTntBoxContainerSpan" + sSpan;
		}
	};

	BoxContainerListRenderer.getAccessibilityState = function (oControl) {
		return {
			role: "listbox"
		};
	};

	BoxContainerListRenderer.getRenderingConfiguration = function (oControl) {
		return {
			grouped: oControl.isGrouped(),
			showNoData: oControl.getShowNoData(),
			renderItems: oControl.shouldRenderItems() && oControl.getItems() && oControl.getItems().length,
			tabIndex: oControl.getKeyboardMode() == ListKeyboardMode.Edit ? -1 : 0,
			upwardGrowing: oControl.getGrowingDirection() == ListGrowingDirection.Upwards && oControl.getGrowing()
		};
	};

	/**
	 * ===========================================================
	 * Render functions taken from ListBase
	 * ===========================================================
	 */

	BoxContainerListRenderer.renderNoData = function(rm, oControl) {
		rm.write("<li");
		rm.writeAttribute("tabindex", oControl.getKeyboardMode() == ListKeyboardMode.Navigation ? -1 : 0);
		rm.writeAttribute("id", oControl.getId("nodata"));
		rm.addClass("sapMLIB sapMListNoData sapMLIBTypeInactive");
		rm.writeClasses();
		rm.write(">");

		rm.write("<div");
		rm.addClass("sapMListNoDataText");
		rm.writeAttribute("id", oControl.getId("nodata-text"));
		rm.writeClasses();
		rm.write(">");
		rm.writeEscaped(oControl.getNoDataText(true));
		rm.write("</div>");

		rm.write("</li>");
	};

	// Used for keyboard navigation
	BoxContainerListRenderer.renderDummyArea = function(rm, oControl, sAreaId, iTabIndex) {
		rm.write("<div");
		rm.writeAttribute("id", oControl.getId(sAreaId));
		rm.writeAttribute("tabindex", iTabIndex);

		if (Device.system.desktop) {
			rm.addClass("sapMListDummyArea").writeClasses();
		}

		rm.write("></div>");
	};

	BoxContainerListRenderer.renderGrowing = function(rm, oControl) {
		var oGrowingDelegate = oControl._oGrowingDelegate;
		if (!oGrowingDelegate) {
			return;
		}

		oGrowingDelegate.render(rm);
	};

	return BoxContainerListRenderer;

}, true);
