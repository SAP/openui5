/*!
 * ${copyright}
 */

sap.ui.define(["./library"],
	function(library) {
	"use strict";

	/**
	 * ActionTileContentRenderer
	 * @namespace
	 */
	var ActionTileContentRenderer = {
		apiVersion: 2    // enable in-place DOM patching
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ActionTileContent} oControl An object representation of the control that is rendered
	 */
	ActionTileContentRenderer.render = function(oRm, oControl) {
		var Priority = library.Priority;

		oRm.openStart("div",oControl );
		oRm.class("sapMATC");
		oRm.openEnd();
		if (oControl.getPriority() !== Priority.None && oControl.getPriorityText()) {
			this._renderPriority(oRm,oControl);
		}
		this._renderContent(oRm,oControl);
		oRm.close("div");
	};

	/**
	 * Renders the priority inside the ActionTileContent
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ActionTileContent} oControl The control that is rendered
	 * @private
	 */
	ActionTileContentRenderer._renderPriority = function(oRm, oControl) {
		var sPriority = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("TEXT_CONTENT_PRIORITY"),
			sPriorityText = oControl.getPriorityText();
		oRm.openStart("div", oControl.getId() + "-priority-value");
		oRm.class("sapMTilePriorityValue");
		oRm.class(oControl.getPriority());
		oRm.openEnd();
		oRm.text(sPriorityText + " " + sPriority);
		oRm.close("div");
	};

	/**
	 * Renders the CustomAttributes inside the ActionTileContent
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ActionTileContent} oControl The control that is rendered
	 * @private
	 */
	ActionTileContentRenderer._renderContent = function(oRm, oControl) {
		oRm.openStart("div",oControl.getId() + "-contentContainer");
		oRm.class("sapMContainer");
		oRm.openEnd();
		oControl.getAttributes().forEach(function(oAttribute,iIndex) {
			this._renderAttribute(oRm,oControl,oAttribute,iIndex);
		}.bind(this));
		oRm.close("div");
	};

	/**
	 * Renders the individual attribute inside the CustomAttribute
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ActionTileContent} oControl The control that is rendered
	 * @param {sap.m.ActionTileContent} oAttribute It represents a custom attribute
	 * @param {sap.m.ActionTileContent} iIndex It represents the index of the individual attribute
	 * @private
	 */
	ActionTileContentRenderer._renderAttribute = function(oRm, oControl,oAttribute,iIndex) {
		oRm.openStart("div",oControl.getId() + "-wrapper-" + iIndex);
		oRm.class("sapMElementWrapper");
		oRm.openEnd();
		this._renderElement(oRm,oControl,oAttribute,iIndex,true);
		this._renderElement(oRm,oControl,oAttribute,iIndex,false);
		oRm.close("div");
	};

	/**
	 * Renders label and value properties inside the CustomAttribute
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ActionTileContent} oControl The control that is rendered
	 * @param {sap.m.ActionTileContent} oAttribute It represents a custom attribute
	 * @param {sap.m.ActionTileContent} iIndex It represents the index of the individual attribute
	 * @param {sap.m.ActionTileContent} bLabel If true, it renders a label, otherwise it renders a value
	 * @private
	 */
	ActionTileContentRenderer._renderElement = function(oRm, oControl,oAttribute,iIndex,bLabel) {
		var sClassName = (bLabel) ? "sapMATCLabel" : "sapMATCValue",
			sId = (bLabel) ? "-label" : "-value",
			sText = (bLabel) ? oAttribute.getLabel() : oAttribute.getValue();
		oRm.openStart("div", oControl.getId() + "-" + iIndex + sId);
		oRm.class(sClassName);
		oRm.openEnd();
		oRm.text(sText);
		oRm.close("div");
	};
	return ActionTileContentRenderer;
}, /* bExport= */ true);