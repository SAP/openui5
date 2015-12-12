/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './TabStripItem', './TabStrip'], function(jQuery, TabStripItem, TabStrip) {
	"use strict";

	/**
	 * TabStrip renderer.
	 * @namespace
	 */
	var TabStripRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.TabStrip} oControl An object representation of the <code>TabStrip</code> control that should be rendered.
	 */
	TabStripRenderer.render = function(oRm, oControl) {
		if (!oControl.getVisible()) {
			return;
		}
		this.beginTabStrip(oRm, oControl);

		// for phones show only the select component of the strip
		if (sap.ui.Device.system.phone === true) {
			oRm.renderControl(oControl.getAggregation('_select'));
		} else {
			this.renderLeftOverflowButtons(oRm, oControl);
			this.beginTabContainer(oRm, oControl);
			this.renderTabs(oRm, oControl);
			this.endTabContainer(oRm);
			this.renderRightOverflowButtons(oRm, oControl);
			this.renderTouchArea(oRm, oControl);
		}
		this.endTabStrip(oRm);
	};

	/**
	 * Render all tabs
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer.
	 * @param oControl {sap.m.TabStrip} An object representation of the <code>TabStrip</code> control that should be rendered.
	 */
	TabStripRenderer.renderTabs = function (oRm, oControl) {
		var aTabs = oControl.getItems(),
			sSelectedItemId = oControl.getSelectedItem();

		aTabs.forEach(function (oTab, iIndex, aTabs) {
			var bIsSelected = sSelectedItemId && sSelectedItemId === oTab.getId();
			this.renderTab(oRm, oControl, oTab, bIsSelected);
		}.bind(this));
	};

	/**
	 * Renders the tab
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer.
	 * @param oControl {sap.m.TabStrip} An object representation of the <code>TabStrip</code> control that should be rendered.
	 * @param oTab {sap.m.TabStripItem} TabsStripItem instance which text to be rendered
	 * @param bSelected {boolean} Flag indicating if this is the currently selected item
	 *
	 * ToDo: rename "tab" to "item" everywhere
	 */
	TabStripRenderer.renderTab = function (oRm, oControl, oTab, bSelected) {
		var sItemClass = TabStripItem._CSS_CLASS + (bSelected ? " selected" : ""),
			bIsTabModified = oTab.getModified(),
			oSelectedItem = sap.ui.getCore().byId(oControl.getSelectedItem());


		// ToDo: fix the hilarious concatenation..
		if (bIsTabModified) {
			sItemClass += " " + sItemClass + " sapMTabContainerItemModified"; // ToDo: move the string to a constant
		}

		oRm.write("<div id='" + oTab.getId() + "' class='" + sItemClass + "'");
		oRm.writeElementData(oTab);

		oRm.writeAccessibilityState(oTab, getTabStripItemAccAttributes(oTab, oControl.getParent(), oSelectedItem));

		oRm.write(">");


		oRm.write("<span id='" + getTabTextDomId(oTab) + "' class='" + TabStripItem._CSS_CLASS_LABEL + "'>");

		this.renderTabText(oRm, oTab);

		oRm.write("</span>");

		this.renderTabCloseButton(oRm, oTab);

		oRm.write("</div>");
	};

	/**
	 * Renders the text of a passed TabStripItem
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer.
	 * @param oTab {sap.m.TabStripItem} TabsStrinItem instance which text to be rendered
	 */
	TabStripRenderer.renderTabText = function (oRm, oTab) {
		var sTabText = oTab.getText();

		if (sTabText.length > TabStripItem.DISPLAY_TEXT_MAX_LENGHT) {
			oRm.writeEscaped(sTabText.slice(0, TabStripItem.DISPLAY_TEXT_MAX_LENGHT));
			oRm.write('...');
		} else {
			oRm.writeEscaped(sTabText);
		}
	};

	/**
	 * Renders the close button of a passed TabStripItem
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer.
	 * @param oTab {sap.m.TabStripItem} TabsStrinItem instance which text to be rendered
	 */
	TabStripRenderer.renderTabCloseButton = function (oRm, oTab) {
		oRm.write("<div class='sapMTSTabCloseBtnCnt'>");
		oRm.renderControl(oTab.getAggregation("_closeButton"));
		oRm.write("</div>");
	};

	/**
	 * Begins TabStrip control rendering
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer.
	 * @param oControl {sap.m.TabStrip} An object representation of the <code>TabStrip</code> control that should be rendered.
	 */
	TabStripRenderer.beginTabStrip = function (oRm, oControl) {
		oRm.write("<div");
		oRm.addClass("sapMTabStrip");
		oRm.writeControlData(oControl);
		oRm.writeClasses();
		oRm.write(">");
	};

	/**
	 * Ends TabStrip control rendering
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer.
	 */
	TabStripRenderer.endTabStrip = function (oRm) {
		oRm.write("</div>");
	};

	/**
	 * Begins rendering the tabContainer region
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer.
	 * @param oControl {sap.m.TabStrip} An object representation of the <code>TabStrip</code> control that should be rendered.
	 */
	TabStripRenderer.beginTabContainer = function (oRm, oControl) {
		oRm.write("<div id='" + oControl.getId() + "-tabContainer' class='sapMTSTabContainer'>");
		oRm.write("<div id='" + oControl.getId() + "-tabs'  class='sapMTSTabs'");
		oRm.writeAccessibilityState(oControl, {
			role: "tablist"
		});
		oRm.write(">");
	};

	/**
	 * Ends rendering the tabContainer region
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer.
	 */
	TabStripRenderer.endTabContainer = function (oRm) {
		oRm.write("</div>");
		oRm.write("</div>");
	};

	/**
	 * Renders left overflow buttons
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer.
	 * @param oControl {sap.m.TabStrip} An object representation of the <code>TabStrip</code> control that should be rendered.
	 */
	TabStripRenderer.renderLeftOverflowButtons = function (oRm, oControl) {
		oRm.write("<div id='" + oControl.getId() + "-leftOverflowButtons' class='sapMTSLeftOverflowButtons'>");
		if (!sap.ui.Device.system.phone) {
			oRm.renderControl(oControl._oLeftArrowButton);
		}
		oRm.write("</div>");
	};

	/**
	 * Renders right overflow buttons
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer.
	 * @param oControl {sap.m.TabStrip} An object representation of the <code>TabStrip</code> control that should be rendered.
	 */
	TabStripRenderer.renderRightOverflowButtons = function (oRm, oControl) {
		oRm.write("<div id='" + oControl.getId() + "-rightOverflowButtons'  class='sapMTSRightOverflowButtons'>");

		if (!sap.ui.Device.system.phone) {
			oRm.renderControl(oControl._oRightArrowButton);
		}

		oRm.write("</div>");
	};

	/**
	 * Renders touch area
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer.
	 * @param oControl {sap.m.TabStrip} An object representation of the <code>TabStrip</code> control that should be rendered.
	 */
	TabStripRenderer.renderTouchArea = function (oRm, oControl) {
		oRm.write("<div id='" + oControl.getId() + "-touchArea'  class='sapMTSTouchArea'>");

		oRm.renderControl(oControl.getAggregation('_select'));
		oRm.renderControl(oControl.getAddButton());

		oRm.write("</div>");
	};

	/**
	 * Returns the id of the dom element that holds the text for a tab strip item.
	 * @param oTab
	 * @returns {string} the id of the dom element that holds the text for a tab strip item.
	 * @private
	 */
	function getTabTextDomId (oTab) {
		return oTab.getId() + "-label";
	}

	/**
	 * Returns the accessability attributes for given tab strip item.
	 * @param {sap.m.TabStripItem} oItem the tab item to prepare accessability attributes for
	 * @param {sap.ui.Control} oTabStripParent the TabStrip parent control
	 * @param {sap.m.TabStripItem} the tab item that is currently selected
	 * @returns {Object} the accessability attributes for given tab strip item.
	 * @private
	 */
	function getTabStripItemAccAttributes(oItem, oTabStripParent, oSelectedItem) {
		var mAccAttributes = { role: "tab"},
			sDescribedBy = TabStrip._ariaStaticTexts.closable.getId() + " ";

		sDescribedBy += oItem.getModified() ? TabStrip._ariaStaticTexts.modified.getId() : TabStrip._ariaStaticTexts.notModified.getId();
		mAccAttributes["describedby"] = sDescribedBy;
		mAccAttributes["labelledby"] = getTabTextDomId(oItem);
		if (oTabStripParent && oTabStripParent.getRenderer && oTabStripParent.getRenderer().getContentDomId) {
			mAccAttributes["controls"] = oTabStripParent.getRenderer().getContentDomId(oTabStripParent);
		}
		if (oSelectedItem && oSelectedItem.getId() === oItem.getId()) {
			mAccAttributes["selected"] = "true";
		} else {
			mAccAttributes["selected"] = "false";
		}
		return mAccAttributes;
	}

	return TabStripRenderer;

}, /* bExport= */ true);
