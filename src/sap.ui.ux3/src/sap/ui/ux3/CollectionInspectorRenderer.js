/*!
 * ${copyright}
 */

// Provides default renderer for the sap.ui.ux3.Collection
sap.ui.define([],
	function() {
	"use strict";


	/**
	 * Collection renderer.
	 * @namespace
	 */
	var CollectionInspectorRenderer = {};

	/**
	 * Renders the Collection
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.ui.core.Control}
	 *            oControl an object representation of the control that should be
	 *            rendered
	 */
	CollectionInspectorRenderer.render = function(rm,
			oControl) {

		rm.write("<div");
		rm.addClass("sapUiUx3CI");
		if (oControl.getSidebarVisible()) {
			rm.addClass("sapUiUx3CISidebarOpened");
		} else {
			rm.addClass("sapUiUx3CISidebarClosed");
		}
		if (oControl.getFitParent()) {
			rm.addClass("sapUiUx3CIFitParent");
		}
		rm.writeClasses();
		rm.writeControlData(oControl);
		rm.write(">");

		rm.write("<div");
		rm.addClass("sapUiUx3CIToolBar");
		rm.writeClasses();
		rm.write(">");

		this.renderToggleButton(rm, oControl);
		this.renderCollectionSelector(rm, oControl);

		rm.write("</div>");

		rm.write('<div');
		rm.addClass("sapUiUx3CISidebar");
		rm.writeClasses();
		rm.writeAttribute("id", oControl.getId() + "-sidebar");
		rm.write(">");
		this.renderSidebar(rm, oControl);
		rm.write("</div>");

		rm.write("<div");
		rm.addClass("sapUiUx3CIContent");
		rm.writeAttribute("id", oControl.getId() + "-content");
		rm.writeClasses();
		rm.write(">");
		this.renderContent(rm, oControl);
		rm.write("</div>");
		rm.write("<div");
		rm.addClass("sapUiUx3CIClear");
		rm.writeClasses();
		rm.write(">");
		rm.write("</div>");
		rm.write("</div>");
	};

	/**
	 * Renders the ToggleButton to open and close the sidebar
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.ui.core.Control}
	 *            oControl an object representation of the control that should be
	 *            rendered
	 */
	CollectionInspectorRenderer.renderToggleButton = function(rm, oControl) {
		// render Togglebutton
		if (oControl.getToggleButton()) {
			rm.write("<div");
			rm.writeAttribute("id", oControl.getId() + "-togglebutton");
			rm.addClass("sapUiUx3CIToggleButton");
			rm.writeClasses();
			rm.write(">");
			rm.renderControl(oControl.getToggleButton());
			rm.write("</div>");
		}
	};

	/**
	 * Renders the collection selector which selects the current collection
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.ui.core.Control}
	 *            oControl an object representation of the control that should be
	 *            rendered
	 */
	CollectionInspectorRenderer.renderCollectionSelector = function(rm, oControl) {
		// render collection selector
		if (oControl.getCollectionSelector()) {
			rm.write("<div");
			rm.addClass("sapUiUx3CICollectionSelector");
			rm.writeClasses();
			rm.write(">");
			rm.renderControl(oControl.getCollectionSelector());
			rm.write("</div>");
		}
	};

	/**
	 * Renders the Sidebar which displays all collections
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.ui.core.Control}
	 *            oControl an object representation of the control that should be
	 *            rendered
	 */
	CollectionInspectorRenderer.renderSidebar = function(rm, oControl) {
		rm.write("<div");
		rm.addClass("sapUiUx3CICollectionListContainer");
		rm.writeClasses();
		rm.write(">");
		rm.write('<ul tabindex="-1"');
		rm.addClass("sapUiUx3CICollectionList");
		rm.writeClasses();
		var oCollection = sap.ui.getCore().byId(oControl.getSelectedCollection());

		//ARIA
		if (oControl.getSelectedCollection()) {
			rm.writeAccessibilityState(oCollection, {
				role: "listbox",
				multiselectable: oCollection.getMultiSelection()
			});
		}
		rm.write(">");
		if (oControl.getSelectedCollection()) {
			var iItemCount = oCollection.getItems().length;
			oCollection.getItems().forEach(function(oCollectionItem, iIndex) {
				rm.write('<li tabindex="-1"');
				rm.writeElementData(oCollectionItem);
				rm.writeAttributeEscaped("title",oCollectionItem.getText());
				rm.addClass("sapUiUx3CICollectionListItem");
				rm.writeClasses();

				// ARIA
				rm.writeAccessibilityState(oCollectionItem, {
					role: "option",
					selected: oCollection.getSelectedItems().indexOf(oCollectionItem.getId()) >= 0,
					setsize: iItemCount,
					posinset: iIndex
				});

				rm.write(">");
				rm.writeEscaped(oCollectionItem.getText());
				rm.write("</li>");
			});
		}
		rm.write("</ul></div>");
		rm.renderControl(oControl.getEditButton());
	};

	/**
	 * Renders the Content that is displayed
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.ui.core.Control}
	 *            oControl an object representation of the control that should be
	 *            rendered
	 */
	CollectionInspectorRenderer.renderContent = function(rm, oControl) {
		oControl.getContent().forEach(function(oContent) {
			rm.renderControl(oContent);
		});
	};

	return CollectionInspectorRenderer;

}, /* bExport= */ true);
