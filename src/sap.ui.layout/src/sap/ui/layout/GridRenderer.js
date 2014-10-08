/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @class
	 * @author SAP SE
	 * @version
	 * ${version}
	 * @static
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
		var INDENTPATTERN = /^([L](?:[0-9]|1[0-1]))? ?([M](?:[0-9]|1[0-1]))? ?([S](?:[0-9]|1[0-1]))?$/i;
		var SPANPATTERN = /^([L](?:[1-9]|1[0-2]))? ?([M](?:[1-9]|1[0-2]))? ?([S](?:[1-9]|1[0-2]))?$/i;
		
		// write the HTML into the render manager
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapUiRespGrid");
		
		var  sMedia = sap.ui.Device.media.getCurrentRange(sap.ui.Device.media.RANGESETS.SAP_STANDARD).name;
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
		oRm.write(">");
	
		var aItems = oControl.getContent();
	
		var defaultSpan = oControl.getDefaultSpan();
		var defaultIndent = oControl.getDefaultIndent();
		var aDIndent = INDENTPATTERN.exec(defaultIndent);
	
		// Default Span if nothing is specified at all, not on Grid , not on the
		// cell.
		var aDefColSpan = [ "", "L3", "M6", "S12" ];
	
		// Default Span values defined on the whole Grid, that is used if there is
		// no individual span defined for the cell.
		var aDSpan = SPANPATTERN.exec(defaultSpan);
	
		for ( var i = 0; i < aItems.length; i++) { // loop over all child controls
			oRm.write("<div");
			var oLay = oControl._getLayoutDataForControl(aItems[i]);
	
			if (oLay) {
	
				// Line break
				if (oLay.getLinebreak() === true) {
					oRm.addClass("sapUiRespGridBreak");
				} else {
					if (oLay.getLinebreakL() === true) {
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
				var sSpan = oLay.getSpan();
				if (!sSpan || !sSpan.lenght == 0) {
					aSpan = aDSpan;
				} else {
					aSpan = SPANPATTERN.exec(sSpan);
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
	
						// Catch the Individual Spans
						var iSpanLarge = oLay.getSpanL();
						var iSpanMedium = oLay.getSpanM();
						var iSpanSmall = oLay.getSpanS();
	
						span = span.toUpperCase();
						if ((span.substr(0, 1) === "L") && (iSpanLarge > 0)	&& (iSpanLarge < 13)) {
							oRm.addClass("sapUiRespGridSpanL" + iSpanLarge);
						} else if ((span.substr(0, 1) === "M") && (iSpanMedium > 0)	&& (iSpanMedium < 13)) {
							oRm.addClass("sapUiRespGridSpanM" + iSpanMedium);
						} else if ((span.substr(0, 1) === "S") && (iSpanSmall > 0) && (iSpanSmall < 13)) {
							oRm.addClass("sapUiRespGridSpanS" + iSpanSmall);
						} else {
							oRm.addClass("sapUiRespGridSpan" + span);
						}
					}
				}
	
				// Indent
				var aIndent;
	
				var sIndent = oLay.getIndent();
				if (!sIndent || sIndent.length == 0) {
					aIndent = aDIndent;
				} else {
					aIndent = INDENTPATTERN.exec(sIndent);
				}
	
				if (!aIndent) {
					aIndent = aDIndent;
					if (!aIndent) {
						aIndent = undefined; // no indent
					}
				}
	
				if (aIndent) {
					for ( var j = 1; j < aIndent.length; j++) {
						var indent = aIndent[j];
						if (!indent) {
							if (aDIndent && aDIndent[j]) {
								indent = aDIndent[j];
							}
						}
						if (indent) {
							indent = indent.toUpperCase();
	
							// Catch the Individual Indents
							var iIndentLarge = oLay.getIndentL();
							var iIndentMedium = oLay.getIndentM();
							var iIndentSmall = oLay.getIndentS();
	
							if ((indent.substr(0, 1) === "L") && (iIndentLarge > 0)
									&& (iIndentLarge < 12)) {
								oRm.addClass("sapUiRespGridIndentL" + iIndentLarge);
							} else if ((indent.substr(0, 1) === "M")
									&& (iIndentMedium > 0) && (iIndentMedium < 12)) {
								oRm.addClass("sapUiRespGridIndentM"	+ iIndentMedium);
							} else if ((indent.substr(0, 1) === "S")
									&& (iIndentSmall > 0) && (iIndentSmall < 12)) {
								oRm.addClass("sapUiRespGridIndentS" + iIndentSmall);
							} else {
								if (!(/^(L0)? ?(M0)? ?(S0)?$/.exec(indent))) {
									oRm.addClass("sapUiRespGridIndent" + indent);
								}
							}
						}
					}
				}
				
				
				
				
				// Visibility
				var l = oLay.getVisibleL(),
				m = oLay.getVisibleM(),
				s = oLay.getVisibleS();
	
				if (!l && m && s) {
					oRm.addClass("sapUiRespGridHiddenL");
				} else if (!l && !m && s) {
					oRm.addClass("sapUiRespGridVisibleS");
				} else if (l && !m && !s) {
					oRm.addClass("sapUiRespGridVisibleL");
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
				if (aDIndent) {
					for ( var j = 1; j < aDIndent.length; j++) {
						indent = aDIndent[j];
						if (indent && (indent.substr(1,1) !== "0")) {
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
