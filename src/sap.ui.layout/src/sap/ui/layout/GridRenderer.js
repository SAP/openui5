/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @author SAP SE
	 * @version
	 * ${version}
	 * @namespace
	 */
	var GridRenderer = {};
	
	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager}
	 *            oRm the RenderManager that can be used for writing to the render
	 *            output buffer
	 * @param {sap.ui.core.Control}
	 *            oControl an object representation of the control that should be
	 *            rendered
	 */
	GridRenderer.render = function(oRm, oControl) {
		var INDENTPATTERN = /^([X][L](?:[0-9]|1[0-1]))? ?([L](?:[0-9]|1[0-1]))? ?([M](?:[0-9]|1[0-1]))? ?([S](?:[0-9]|1[0-1]))?$/i;
		var SPANPATTERN =   /^([X][L](?:[1-9]|1[0-2]))? ?([L](?:[1-9]|1[0-2]))? ?([M](?:[1-9]|1[0-2]))? ?([S](?:[1-9]|1[0-2]))?$/i;
		
		// write the HTML into the render manager
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapUiRespGrid");
		
		var  sMedia = sap.ui.Device.media.getCurrentRange(sap.ui.Device.media.RANGESETS.SAP_STANDARD_EXTENDED).name;
		oRm.addClass("sapUiRespGridMedia-Std-" + sMedia);
		
		var fHSpacing = oControl.getHSpacing();
		// Check for allowed values, if not matching, set to to default 1 rem.
		if (fHSpacing == 0.5) {
			fHSpacing = "05";
		} else if ((fHSpacing !== 0) && (fHSpacing !== 1) && (fHSpacing !== 2)) {
			fHSpacing = 1;
		}
		
		oRm.addClass("sapUiRespGridHSpace" + fHSpacing);
	
		var fVSpacing = oControl.getVSpacing();
		// Check for allowed values, if not matching, set to to default 1 rem.
		if (fVSpacing == 0.5) {
			fVSpacing = "05";
		} else if ((fVSpacing !== 0) && (fVSpacing !== 1) && (fVSpacing !== 2)) {
			fVSpacing = 1;
		} 
		
		oRm.addClass("sapUiRespGridVSpace" + fVSpacing);
	
		var sPosition = oControl.getPosition();
		if (sPosition) {
			sPosition = sPosition.toUpperCase();
			if (sPosition === sap.ui.layout.GridPosition.Center.toUpperCase()) {
				oRm.addClass("sapUiRespGridPosCenter");
			} else if (sPosition === sap.ui.layout.GridPosition.Right.toUpperCase()) {
				oRm.addClass("sapUiRespGridPosRight");
			}
		}
	
		oRm.writeClasses();
		var sWidth = oControl.getWidth();
		if (sWidth !== "100%" && sWidth !== "auto" && sWidth !== "inherit") {
			if (fHSpacing == 0) {
				sWidth = "width: " + sWidth;
			} else {
				sWidth = "width: -webkit-calc(" + sWidth + " - " + fHSpacing  + "rem); width: calc(" + sWidth + " - " + fHSpacing  + "rem); ";
			}
			oRm.writeAttribute("style", sWidth);
		}

		var sRole = oControl._getAccessibleRole();
		var mAriaProps;
		if (sRole) {
			mAriaProps = {role: sRole};
		}

		oRm.writeAccessibilityState(oControl, mAriaProps);

		oRm.write(">");
	
		var aItems = oControl.getContent();
	
		
		

		//************************************************************************
		//  SPAN
		//************************************************************************
		
		var defaultSpan = oControl.getDefaultSpan();
		
		// Default Span if nothing is specified at all, not on Grid , not on the
		// cell.
		var aDefColSpan = [ "", "XL3", "L3", "M6", "S12"];
	
		// Default Span values defined on the whole Grid, that is used if there is
		// no individual span defined for the cell.
		var aDSpan = SPANPATTERN.exec(defaultSpan);
	
		for ( var i = 0; i < aItems.length; i++) { // loop over all child controls
			oRm.write("<div");
			var oLay = oControl._getLayoutDataForControl(aItems[i]);
			
			if (oLay) {
	                          
				// Line break
				var bBreakXLChanged = false;
				if (oLay.getLinebreak() === true) {
					oRm.addClass("sapUiRespGridBreak");
				} else {
					if (oLay.getLinebreakXL() === true) {
						bBreakXLChanged = true;
						oRm.addClass("sapUiRespGridBreakXL");
					}
					if (oLay.getLinebreakL() === true) {
						if (!bBreakXLChanged){
							oRm.addClass("sapUiRespGridBreakXL");
						}
						oRm.addClass("sapUiRespGridBreakL");
					}
					if (oLay.getLinebreakM() === true) {
						oRm.addClass("sapUiRespGridBreakM");
					}
					if (oLay.getLinebreakS() === true) {
						oRm.addClass("sapUiRespGridBreakS");
					}
				}
	
				// Span
				var aSpan;
				// sSpanL needed for XL if XL is not defined at all
				var sSpanL, bDefaultSpanXLChanged = false;
				var sSpan = oLay.getSpan();
				if (!sSpan || !sSpan.lenght == 0) {
					aSpan = aDSpan;
					bDefaultSpanXLChanged = oControl._getSpanXLChanged();
				} else {
					aSpan = SPANPATTERN.exec(sSpan);
					if (/XL/gi.test(sSpan)) {
						bDefaultSpanXLChanged = true;
					}
				}	
					
	
				if (aSpan) {
					for ( var j = 1; j < aSpan.length; j++) {
						var span = aSpan[j];
						if (!span) {
							span = aDSpan[j];
							if (!span) {
								span = aDefColSpan[j];
							}
						}
						
						if (span.substr(0, 1) === "L") {
							sSpanL = span.substr(1, 2);
						} 
						
						// Catch the Individual Spans
						var iSpanXLarge = oLay.getSpanXL();
						var iSpanLarge = oLay.getSpanL();
						var iSpanMedium = oLay.getSpanM();
						var iSpanSmall = oLay.getSpanS();
	  
						span = span.toUpperCase();
						if ((span.substr(0, 2) === "XL") && (iSpanXLarge > 0)	&& (iSpanXLarge < 13)) {
							oRm.addClass("sapUiRespGridSpanXL" + iSpanXLarge);
							bDefaultSpanXLChanged = true;
						} else if ((span.substr(0, 1) === "L") && (iSpanLarge > 0)	&& (iSpanLarge < 13)) {
							oRm.addClass("sapUiRespGridSpanL" + iSpanLarge);
							sSpanL = iSpanLarge;
						} else if ((span.substr(0, 1) === "M") && (iSpanMedium > 0)	&& (iSpanMedium < 13)) {
							oRm.addClass("sapUiRespGridSpanM" + iSpanMedium);
						} else if ((span.substr(0, 1) === "S") && (iSpanSmall > 0) && (iSpanSmall < 13)) {
							oRm.addClass("sapUiRespGridSpanS" + iSpanSmall);
						} else {
							if ((span.substr(0, 2) !== "XL") || bDefaultSpanXLChanged ){
								oRm.addClass("sapUiRespGridSpan" + span);
							}
						}
					}
					
					if (!bDefaultSpanXLChanged) { 
						// Backwards compatibility - if the XL not defined - it should be as L.	
						oRm.addClass("sapUiRespGridSpanXL" + sSpanL);
					}	
				}
	
				
				
				
				//************************************************************************
				//  INDENT
				//************************************************************************
				
				// Default indent of the whole Grid control
				var sDefaultIndent = oControl.getDefaultIndent();
				var aDefaultIndent4Grid = INDENTPATTERN.exec(sDefaultIndent); 
				
				var aIndent;
				var sIndentL, bDefaultXLChanged = false;
				var sIndent = oLay.getIndent();
				if (!sIndent || sIndent.length == 0) {
					aIndent = aDefaultIndent4Grid;
					bDefaultXLChanged = oControl._getIndentXLChanged();
				} else {
					aIndent = INDENTPATTERN.exec(sIndent);
					if (/XL/gi.test(sIndent)) {
						bDefaultXLChanged = true;
					}
				}
	
				if (!aIndent) {
					aIndent = aDefaultIndent4Grid;
					if (!aIndent) {
						aIndent = undefined; // no indent
					} else {
						bDefaultXLChanged = oControl._getIndentXLChanged();	
					}
				}
	
				if (aIndent) {
					for ( var j = 1; j < aIndent.length; j++) {
						var indent = aIndent[j];
						if (!indent) {
							if (aDefaultIndent4Grid && aDefaultIndent4Grid[j]) {
								indent = aDefaultIndent4Grid[j];
							}
						}
						if (indent) {
							indent = indent.toUpperCase();
							if (indent.substr(0, 1) === "L") {
								sIndentL = indent.substr(1, 2);
							}
							
							// Catch the Individual Indents
							var iIndentXLarge = oLay.getIndentXL();
							var iIndentLarge = oLay.getIndentL();
							var iIndentMedium = oLay.getIndentM();
							var iIndentSmall = oLay.getIndentS();
	
							if ((indent.substr(0, 2) === "XL") && (iIndentXLarge > 0) && (iIndentXLarge < 12)) {
									oRm.addClass("sapUiRespGridIndentXL" + iIndentXLarge);
									bDefaultXLChanged = true;
							} else if ((indent.substr(0, 1) === "L") && (iIndentLarge > 0)
									&& (iIndentLarge < 12)) {
								oRm.addClass("sapUiRespGridIndentL" + iIndentLarge);
								sIndentL = iIndentLarge;
							} else if ((indent.substr(0, 1) === "M")
									&& (iIndentMedium > 0) && (iIndentMedium < 12)) {
								oRm.addClass("sapUiRespGridIndentM"	+ iIndentMedium);
							} else if ((indent.substr(0, 1) === "S")
									&& (iIndentSmall > 0) && (iIndentSmall < 12)) {
								oRm.addClass("sapUiRespGridIndentS" + iIndentSmall);
							} else {
								if (!(/^(XL0)? ?(L0)? ?(M0)? ?(S0)?$/.exec(indent))) {
									oRm.addClass("sapUiRespGridIndent" + indent);
								}
							}
						}
					}
					if (!bDefaultXLChanged) { 
						// Backwards compatibility - if the XL not defined - it should be as L.	
						if (sIndentL && sIndentL > 0) {
							oRm.addClass("sapUiRespGridIndentXL" + sIndentL);
						}
					}
					
				}
				
				
				
				
				// Visibility
				var  
				l = oLay.getVisibleL(),
				m = oLay.getVisibleM(),
				s = oLay.getVisibleS();
	           
				// TODO: visibility of XL //xl = oLay.getVisibleXL(),
				
				if (!l && m && s) {
					oRm.addClass("sapUiRespGridHiddenL");
					oRm.addClass("sapUiRespGridHiddenXL");
				} else if (!l && !m && s) {
					oRm.addClass("sapUiRespGridVisibleS");
				} else if (l && !m && !s) {
					oRm.addClass("sapUiRespGridVisibleL");
					oRm.addClass("sapUiRespGridVisibleXL");
				} else if (!l && m && !s) {
					oRm.addClass("sapUiRespGridVisibleM");
				} else if (l && !m && s) {
					oRm.addClass("sapUiRespGridHiddenM");
				} else if (l && m && !s) {
					oRm.addClass("sapUiRespGridHiddenS");
				}
					
				// Move - moveBwd shifts a grid element to the left in LTR mode and
				// opposite in RTL mode
	
				var sMoveB = oLay.getMoveBackwards();
	
				if (sMoveB && sMoveB.length > 0) {
					var aMoveB = INDENTPATTERN.exec(sMoveB);
					if (aMoveB) {
						for ( var j = 1; j < aMoveB.length; j++) {
							var moveB = aMoveB[j];
							if (moveB) {
								oRm.addClass("sapUiRespGridBwd"	+ moveB.toUpperCase());
							}
						}
					}
				}
				// ... while moveFwd shifts it to the right in LTR mode and opposite
				// in RTL
				var sMoveF = oLay.getMoveForward();
	
				if (sMoveF && sMoveF.length > 0) {
					var aMoveF = INDENTPATTERN.exec(sMoveF);
					if (aMoveF) {
						for ( var j = 1; j < aMoveF.length; j++) {
							var moveF = aMoveF[j];
							if (moveF) {
								oRm.addClass("sapUiRespGridFwd"	+ moveF.toUpperCase());
							}
						}
					}
				}
				
				// Internal additional classes
				if (oLay._sStylesInternal) {
					oRm.addClass(oLay._sStylesInternal);
				}
			}
	
			// No layoutData - just apply defaults
			if (!oLay) {
				var span = "";
				if (aDSpan) {
					for ( var j = 1; j < aDSpan.length; j++) {
						span = aDSpan[j];
						if (!span) {
							span = aDefColSpan[j];
						}
						oRm.addClass("sapUiRespGridSpan" + span.toUpperCase());
					}
				} else {
					for ( var j = 1; j < aDefColSpan.length; j++) {
						span = aDefColSpan[j];
						oRm.addClass("sapUiRespGridSpan" + span.toUpperCase());
					}
				}
				
				var indent = "";
				if (aDefaultIndent4Grid) {
					for ( var j = 1; j < aDefaultIndent4Grid.length; j++) {
						indent = aDefaultIndent4Grid[j];
						if (indent && ((indent.substr(0,1) !== "X") && (indent.substr(1,1) !== "0")) || ((indent.substr(0,1) == "X") && (indent.substr(2,1) !== "0"))) {
							oRm.addClass("sapUiRespGridIndent" + indent.toUpperCase());
						}
					}
				}
			}
	
			oRm.writeClasses();
			oRm.write(">");
	
			oRm.renderControl(aItems[i]); // render the child control (could even
											// be a big control tree, but you don't
											// need to care)
	
			oRm.write("</div>"); // end of the box around the respective child
		}
	
		oRm.write("</div>"); // end of the complete grid  control
	};

	return GridRenderer;

}, /* bExport= */ true);
