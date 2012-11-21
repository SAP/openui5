/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.m.PopoverRenderer");

/**
 * @class Popover renderer. 
 * @static
 */
sap.m.PopoverRenderer = {
};


/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.m.PopoverRenderer.render = function(rm, oControl){ 
	var sId = oControl.getId(),
		i = 0,
		contents = oControl.getContent(),
		oFooter = oControl.getFooter(),
		oHeaderControl;
		
	if(oControl.getShowHeader()){
		oHeaderControl = oControl._getAnyHeader();
	}

	//container
	rm.write("<div");
	rm.writeControlData(oControl);
	rm.addClass("sapMPopover");
	if(oHeaderControl){
		rm.addClass("sapMPopoverWithBar")
	}else{
		rm.addClass("sapMPopoverWithoutBar");
	}
	if(oControl._hasNavContent()){
		rm.addClass("sapMPopoverNav");
	}
	if(oFooter){
		rm.addClass("sapMPopoverWithFooter");
	}
	
	if(oControl.getPlacement() === sap.m.PlacementType.Top){
		rm.addClass("sapMPopoverPlacedTop");
	}
	rm.writeClasses();
	rm.write(">");
	
	
	if(!jQuery.os.ios){
		//arrow
		rm.write("<span");
		rm.writeAttribute("id", sId+"-arrow");
		rm.addClass("sapMPopoverArr");
		rm.writeClasses();
		rm.write("></span>");//arrow tip
	}

	//header
	if(oHeaderControl){
		rm.renderControl(oControl._getAnyHeader());
	}//header
	
	// content container
	rm.write("<div");
	rm.writeAttribute("id",sId + "-cont");
	rm.addClass("sapMPopoverCont");
	rm.writeClasses();
//	rm.writeAttribute("tabindex","-1");
	rm.write(">");
	for(i = 0 ; i < contents.length ; i++){
		rm.renderControl(contents[i]);
	}
	
	rm.write("</div>");//content container
	
	//footer
	if (oFooter) {
		oFooter._context = 'footer';
		rm.renderControl(oFooter);
	}//footer
	
	if(jQuery.os.ios){
		//arrow
		rm.write("<span");
		rm.writeAttribute("id", sId+"-arrow");
		rm.addClass("sapMPopoverArr");
		rm.writeClasses();
		rm.write("></span>");//arrow tip
	}
	

	rm.write("</div>");// container
};
