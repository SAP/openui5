/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.demokit.FileUploadIntrospector
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @class FileUploadIntrospector renderer. 
	 * @static
	 */
	var FileUploadIntrospectorRenderer = function() {
	};
	
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	FileUploadIntrospectorRenderer.render = function(oRenderManager, oControl) {
	
		// convenience variable
		var rm = oRenderManager;
	
		function format(iDate) {
		  var oDate = new Date(iDate),
			sMonth = (oDate.getMonth() + 1) < 10 ? "0" + (oDate.getMonth() + 1) : "" + (oDate.getMonth() + 1),
			sYear = oDate.getFullYear() < 10 ? "0" + oDate.getFullYear() : "" + oDate.getFullYear(),
			sDate = oDate.getDate() < 10 ? "0" + oDate.getDate() : "" + oDate.getDate(),
			sHours = oDate.getHours() < 10 ? "0" + oDate.getHours() : "" + oDate.getHours(),
			sMinutes = oDate.getMinutes() < 10 ? "0" + oDate.getMinutes() : "" + oDate.getMinutes(),
			sSeconds = oDate.getSeconds() < 10 ? "0" + oDate.getSeconds() : "" + oDate.getSeconds();
			return sYear + "-" + sMonth + "-" + sDate + " " + sHours + ":" + sMinutes + ":" + sSeconds;
		}
	
		// write the HTML into the render manager  
		rm.write("<div");
		rm.writeControlData(oControl);
		rm.write(" class='sapUiDkitFileList'");
		if ( oControl.getWidth() ) {
			rm.addStyle("width", oControl.getWidth());
		}
		rm.writeStyles();
		rm.write(">");
		var aFiles = oControl._aFiles || [];
		rm.write("<div");
		if ( oControl.getHeight() ) {
			rm.addStyle("height", oControl.getHeight());
			rm.addStyle("overflow-y", "auto");
		}
		rm.writeStyles();
		rm.write(">");
		rm.write("<table border='0'>");
		rm.write("<tr class='sapUiDkitFileItem'>");
		rm.write("<th>Filename</th>");
		rm.write("<th>Date</th>");
		rm.write("<th>Size</th>");
		rm.write("</tr>");
		for (var i = 0; i < aFiles.length; i++) {
			rm.write("<tr class='sapUiDkitFileItem'>");
			rm.write("<td style='padding:1px 3px;'><span style='white-space:nowrap'>" + aFiles[i].name + "</span></td>");
			rm.write("<td style='border-left:1px solid #ccc;padding:1px 3px;width:12ex'><span style='white-space:nowrap'>" + format(aFiles[i].time) + "</span></td>");
			rm.write("<td style='border-left:1px solid #ccc;padding:1px 3px;width:8ex;text-align:right'><span style='white-space:nowrap'>" + aFiles[i].size + "</span></td>");
			rm.write("</tr>");
		}
		rm.write("</table>");
		rm.write("</div>");
		rm.write("<div class='sapUiDkitBottomLine'>");
		rm.write("Last Refresh: " + (format(new Date().getTime())));
		rm.write("</div>");
		
		rm.write("</div>");
	
	};
	

	return FileUploadIntrospectorRenderer;

}, /* bExport= */ true);
