/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './TabStripItem', './TabStrip'], function(jQuery, TabStripItem, TabStrip) {
	"use strict";

	/**
	 * <code>TabStrip</code> renderer.
	 * @namespace
	 */
	var TabStripRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
	 * @param oControl {sap.m.TabStrip} An object representation of the <code>TabStrip</code> control that should be rendered
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
			this.beginTabsContainer(oRm, oControl);
			this.renderItems(oRm, oControl);
			this.endTabsContainer(oRm);
			this.renderRightOverflowButtons(oRm, oControl);
			this.renderTouchArea(oRm, oControl);
		}
		this.endTabStrip(oRm);
	};

	/**
	 * Renders all <code>TabStripItems</code>.
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
	 * @param oControl {sap.m.TabStrip} An object representation of the <code>TabStrip</code> control that should be rendered
	 */
	TabStripRenderer.renderItems = function (oRm, oControl) {
		var aItems = oControl.getItems(),
			sSelectedItemId = oControl.getSelectedItem();

		aItems.forEach(function (oItem) {
			var bIsSelected = sSelectedItemId && sSelectedItemId === oItem.getId();
			this.renderItem(oRm, oControl, oItem, bIsSelected);
		}, this);
	};

	/**
	 * Renders the tab.
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
	 * @param oControl {sap.m.TabStrip} An object representation of the <code>TabStrip</code> control that should be rendered
	 * @param oItem {sap.m.TabStripItem} <code>TabStripItem</code> instance for which text is to be rendered
	 * @param bSelected {boolean} Flag indicating if this is the currently selected item
	 */
	TabStripRenderer.renderItem = function (oRm, oControl, oItem, bSelected) {
		oRm.write("<div id='" + oItem.getId() + "'");
		oRm.addClass(TabStripItem.CSS_CLASS);
		if (oItem.getModified()) {
			oRm.addClass(TabStripItem.CSS_CLASS_MODIFIED);
		}
		if (bSelected) {
			oRm.addClass(TabStripItem.CSS_CLASS_SELECTED);
		}
		oRm.writeClasses();

		oRm.writeElementData(oItem);

		oRm.writeAccessibilityState(oItem, getTabStripItemAccAttributes(oItem, oControl.getParent(), sap.ui.getCore().byId(oControl.getSelectedItem())));

		oRm.write(">");


		oRm.write("<span id='" + getTabTextDomId(oItem) + "' class='" + TabStripItem.CSS_CLASS_LABEL + "'>");

		this.renderItemText(oRm, oItem);

		oRm.write("</span>");

		this.renderItemCloseButton(oRm, oItem);

		oRm.write("</div>");
	};

	/**
	 * Renders the text of a passed <code>TabStripItem</code>.
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
	 * @param oItem {sap.m.TabStripItem} <code>TabStripItem</code> instance which text to be rendered
	 */
	TabStripRenderer.renderItemText = function (oRm, oItem) {
		var sItemText = oItem.getText();

		if (sItemText.length > TabStripItem.DISPLAY_TEXT_MAX_LENGTH) {
			oRm.writeEscaped(sItemText.slice(0, TabStripItem.DISPLAY_TEXT_MAX_LENGTH));
			oRm.write('...');
		} else {
			oRm.writeEscaped(sItemText);
		}
	};

	/**
	 * Renders the Close button of a passed <code>TabStripItem</code>.
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
	 * @param oItem {sap.m.TabStripItem} <code>TabStripItem</code> instance for which text is to be rendered
	 */
	TabStripRenderer.renderItemCloseButton = function (oRm, oItem) {
		oRm.write("<div class='sapMTSItemCloseBtnCnt'>");
		oRm.renderControl(oItem.getAggregation("_closeButton"));
		oRm.write("</div>");
	};

	/**
	 * Begins <code>TabStrip</code> control rendering.
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
	 * @param oControl {sap.m.TabStrip} An object representation of the <code>TabStrip</code> control that should be rendered
	 */
	TabStripRenderer.beginTabStrip = function (oRm, oControl) {
		oRm.write("<div");
		oRm.addClass("sapMTabStrip");
		oRm.writeControlData(oControl);
		oRm.writeClasses();
		oRm.write(">");
	};

	/**
	 * Ends <code>TabStrip</code> control rendering.
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
	 */
	TabStripRenderer.endTabStrip = function (oRm) {
		oRm.write("</div>");
	};

	/**
	 * Begins rendering the <code>TabsContainer</code> region.
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
	 * @param oControl {sap.m.TabStrip} An object representation of the <code>TabStrip</code> control that should be rendered
	 */
	TabStripRenderer.beginTabsContainer = function (oRm, oControl) {
		oRm.write("<div id='" + oControl.getId() + "-tabsContainer' class='sapMTSTabsContainer'>");
		oRm.write("<div id='" + oControl.getId() + "-tabs'  class='sapMTSTabs'");
		oRm.writeAccessibilityState(oControl, {
			role: "tablist"
		});
		oRm.write(">");
	};

	/**
	 * Ends rendering the <code>TabsContainer</code> region.
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
	 */
	TabStripRenderer.endTabsContainer = function (oRm) {
		oRm.write("</div>");
		oRm.write("</div>");
	};

	/**
	 * Renders the overflow buttons on the left.
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
	 * @param oControl {sap.m.TabStrip} An object representation of the <code>TabStrip</code> control that should be rendered
	 */
	TabStripRenderer.renderLeftOverflowButtons = function (oRm, oControl) {
		oRm.write("<div id='" + oControl.getId() + "-leftOverflowButtons' class='sapMTSLeftOverflowButtons'>");
		if (!sap.ui.Device.system.phone) {
			oRm.renderControl(oControl._oLeftArrowButton);
		}
		oRm.write("</div>");
	};

	/**
	 * Renders the overflow buttons on the right.
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
	 * @param oControl {sap.m.TabStrip} An object representation of the <code>TabStrip</code> control that should be rendered
	 */
	TabStripRenderer.renderRightOverflowButtons = function (oRm, oControl) {
		oRm.write("<div id='" + oControl.getId() + "-rightOverflowButtons'  class='sapMTSRightOverflowButtons'>");

		if (!sap.ui.Device.system.phone) {
			oRm.renderControl(oControl._oRightArrowButton);
		}

		oRm.write("</div>");
	};

	/**
	 * Renders the touch area.
	 *
	 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
	 * @param oControl {sap.m.TabStrip} An object representation of the <code>TabStrip</code> control that should be rendered
	 */
	TabStripRenderer.renderTouchArea = function (oRm, oControl) {
		oRm.write("<div id='" + oControl.getId() + "-touchArea'  class='sapMTSTouchArea'>");

		oRm.renderControl(oControl.getAggregation('_select'));
		oRm.renderControl(oControl.getAddButton());

		oRm.write("</div>");
	};

	/**
	 * Finds the ID of the DOM element that holds the text for a <code>TabStripItem</code>
	 *
	 * @param oItem {sap.m.TabStripItem} The <code>TabStripItem</code> to search
	 * @returns {string} The ID of the DOM element that holds the text for a <code>TabStripItem</code>
	 * @private
	 */
	function getTabTextDomId (oItem) {
		return oItem.getId() + "-label";
	}

	/**
	 * Returns the accessibility attributes for a given <code>TabStripItem</code>.
	 *
	 * @param oItem {sap.m.TabStripItem} The <code>TabStripItem</code> to prepare accessibility attributes for
	 * @param oTabStripParent {sap.ui.Control} The <code>TabStrip</code> parent control
	 * @param oSelectedItem {sap.m.TabStripItem} The <code>TabStripItem</code> that is currently selected
	 * @returns {Object} The accessibility attributes for given <code>TabStripItem</code>
	 * @private
	 */
	function getTabStripItemAccAttributes(oItem, oTabStripParent, oSelectedItem) {
		var mAccAttributes = { role: "tab"},
			sDescribedBy = TabStrip.ARIA_STATIC_TEXTS.closable.getId() + " ";

		sDescribedBy += oItem.getModified() ? TabStrip.ARIA_STATIC_TEXTS.modified.getId() : TabStrip.ARIA_STATIC_TEXTS.notModified.getId();
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
