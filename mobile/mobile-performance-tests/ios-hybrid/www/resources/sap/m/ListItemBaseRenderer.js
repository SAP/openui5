/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.m.ListItemBaseRenderer");

/**
 * @class ListitemBase renderer.
 * @static
 */
sap.m.ListItemBaseRenderer = {};

/**
 * Renders the HTML for the given control, using the provided
 * {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager}
 *          oRenderManager the RenderManager that can be used for writing to the
 *          Render-Output-Buffer
 * @param {sap.ui.core.Control}
 *          oControl an object representation of the control that should be
 *          rendered
 */
sap.m.ListItemBaseRenderer.render = function(rm, oLI) {
	// return immediately if control is invisible
	if (!oLI.getVisible()) {
		return;
	}

	rm.write("<li");
	rm.writeControlData(oLI);
	rm.addClass("sapMLIB");
	rm.addClass("sapMLIB-CTX");

	// LI attributes hook
	if (this.renderLIAttributes) {
		this.renderLIAttributes(rm, oLI);
	}
	

	// LI content hook
	if (this.renderLIContent) {

		// depending on the mode of the list a checkbox or radiobutton will be
		// rendered. If a switch between list modes happens, an animation will be
		// added for the selection area

		switch (oLI._mode) {
		case sap.m.ListMode.SingleSelect:
			var radioButton = oLI._getRadioButton((oLI.getId() + "-selectSingle"), "Group1");
			if(radioButton.getSelected())
				rm.addClass("sapMLIBSelected");
			rm.writeClasses();
			rm.write(">");
		
			rm.write("<div");
			rm.addClass("sapMLIBSelectS");
			if (oLI._oldMode === sap.m.ListMode.None) {
				rm.addClass("sapMLIBSelectAnimation");
			}
			rm.writeAttribute("id", oLI.getId() + "-mode");
			rm.writeClasses();
			rm.write(">");
			
			rm.renderControl(radioButton);
			rm.write("</div>");
			oLI._oldMode = oLI._mode;
			break;
		case sap.m.ListMode.MultiSelect:
			var checkBox = oLI._getCheckBox((oLI.getId() + "-selectMulti"));
			if(checkBox.getSelected())
				rm.addClass("sapMLIBSelected");
			
			rm.writeClasses();
			rm.write(">");
			rm.write("<div");
			rm.addClass("sapMLIBSelectM");
			if (oLI._oldMode === sap.m.ListMode.None) {
				rm.addClass("sapMLIBSelectAnimation");
			}
			rm.writeAttribute("id", oLI.getId() + "-mode");
			rm.writeClasses();
			rm.write(">");
			rm.renderControl(checkBox);
			rm.write("</div>");
			oLI._oldMode = oLI._mode;
			break;
		case sap.m.ListMode.Delete:
			rm.writeClasses();
			rm.write(">");
			rm.write("<div");
			rm.addClass("sapMLIBSelectD");
			if (oLI._oldMode === sap.m.ListMode.None ) {
				rm.addClass("sapMLIBSelectAnimation");
			}
			rm.writeAttribute("id", oLI.getId() + "-mode");
			rm.writeClasses();
			rm.write(">");
			var delIcon = oLI._getDelImage((oLI.getId() + "-imgDel"), "sapMLIBImgDel", "delete_icon.png");
			if (delIcon) {
				rm.renderControl(delIcon);
			}
			rm.write("</div>");
			oLI._oldMode = oLI._mode;		
			break;
		case sap.m.ListMode.None:
			rm.writeClasses();
			rm.write(">");
			if (oLI._oldMode && oLI._oldMode !== sap.m.ListMode.None) {
				rm.write("<div");
				rm.addClass("sapMLIBUnselectAnimation");
				rm.writeAttribute("id", oLI.getId() + "-mode");
				rm.writeClasses();
				rm.write(">");
				rm.write("</div>");
			}
			oLI._oldMode = oLI._mode;
			break;
		}

		rm.write("<div");
		rm.addClass("sapMLIBContent");

		var type = oLI.getType();
		var navIcon;
		switch (type) {
		case sap.m.ListType.Navigation:
			navIcon = oLI._getNavImage((oLI.getId() + "-imgNav"), "sapMLIBImgNav", "disclosure_indicator.png");
			break;
		case sap.m.ListType.Detail:
		case sap.m.ListType.DetailAndActive:
			navIcon = oLI._getNavImage((oLI.getId() + "-imgDet"), "sapMLIBImgDet", "detail_disclosure.png", "detail_disclosure_pressed.png");
			break;
		case sap.m.ListType.Inactive:
		case sap.m.ListType.Active:
			// there will be a margin on the right, if no navigation icon is shown
			rm.addClass("sapMLIBContentMargin");
		default:
		}
		rm.writeClasses();
		rm.write(">");
		this.renderLIContent(rm, oLI);
		rm.write("</div>");

		if (navIcon)
			rm.renderControl(navIcon);
		}
	else{
		rm.writeClasses();
		rm.write(">");
	}
	rm.write("</li>");
};
