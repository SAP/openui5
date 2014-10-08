/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/IconPool', 'sap/ui/core/theming/Parameters'],
	function(jQuery, IconPool, Parameters) {
	"use strict";


	/**
	 * @class ListitemBase renderer.
	 *
	 * @static
	 */
	var ListItemBaseRenderer = {};
	
	/**
	 * Renders the HTML for the given control, using the provided.
	 *
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oLI an object representation of the control that should be rendered.
	 */
	ListItemBaseRenderer.render = function(rm, oLI) {
	
		// return immediately if control is invisible
		if (!oLI.getVisible()) {
			return;
		}
	
		// define behavior: list or table
		var sId = oLI.getId(),
			oParent = oLI.getParent(),
			isTable = !oLI.hasOwnProperty("_renderInList") && oParent && oParent.getColumns && oParent.getColumns().length,
			bNoFlex = oLI._bNoFlex, // IE9 does not support flex-box: render as a table
			rowEndTag, rowStartTag, openCellTag, closeCellTag, hasPopin = false,
			sTooltip = oLI.getTooltip_AsString();
	
		if (!isTable) {
			rowEndTag = "</li>";
			rowStartTag = "<li tabindex='-1'";
	
			openCellTag = function() {
				rm.write("<div");
			};
	
			closeCellTag = function() {
				rm.write("</div>");
			};
	
		} else {
			rowEndTag = "</tr>";
			rowStartTag = "<tr tabindex='-1'";
			hasPopin = oParent.hasPopin() && sap.m.ColumnListItem && oLI instanceof sap.m.ColumnListItem;
	
			openCellTag = function(cls, bDontCreateDiv) {
				rm.write("<td");
	
				if (cls) {
					rm.addClass(cls);
					rm.writeClasses();
				}
	
				if (!bDontCreateDiv) {
					rm.write("><div");
				}
			};
	
			closeCellTag = function(bDontCreateDiv) {
	
				if (!bDontCreateDiv) {
					rm.write("</div>");
				}
	
				rm.write("</td>");
			};
		}
	
		rm.write(rowStartTag);
	
		if (sTooltip) {
			rm.writeAttributeEscaped("title", sTooltip);
		}
	
		rm.writeControlData(oLI);
		rm.addClass("sapMLIB");
		rm.addClass("sapMLIB-CTX");
	
		if (!isTable && bNoFlex) { // switch to the no-flex rendering
			rm.addClass("sapMLIBNoFlex");
		}
	
		rm.addClass("sapMLIBShowSeparator");
	
		if (oLI._includeItemInSelection || oLI._mode == "SingleSelectMaster" || (oLI.getType() != "Inactive" && oLI.getType() != "Detail")) {
			rm.addClass("sapMLIBCursor");
		}
	
		//unread switch... bubble or is shown as bold text
		if (oLI._showUnread && oLI.getUnread()) {
			rm.addClass("sapMLIBUnread");
			rm.addClass("sapMLIBUnreadBold");
		}
	
		if (hasPopin) {
			rm.addClass("sapMListTblSupRow");
		}
	
		// TODO: Remove this unnecessary class name sapMLIBUnread is enough
		if (oLI._showUnread && oLI.getUnread()) {
			rm.addClass("sapMLIBUnreadRow");
		}
	
		// LI attributes hook
		if (this.renderLIAttributes) {
			this.renderLIAttributes(rm, oLI);
		}
	
		rm.addClass("sapMLIBType" + oLI.getType());
	
		// LI content hook
		if (this.renderLIContent) {
	
			// depending on the mode of the list a checkbox or radiobutton will be
			// rendered. If a switch between list modes happens, an animation will be
			// added for the selection area
			var oSelectControl = null;
	
			switch (oLI._mode) {
	
			case "SingleSelectLeft":
				oSelectControl = oLI._getRadioButton((sId + "-selectSingle"), oLI._listId + "_selectGroup");
	
				if (oLI.getSelected()) {
					rm.addClass("sapMLIBSelected");
				}
	
				rm.writeClasses();
				rm.write(">");
	
				openCellTag("sapMListTblSelCol");
				rm.addClass("sapMLIBSelectSL");
	
				if (oLI._oldMode === "None" && oLI._modeAnimationOn) {
					rm.addClass("sapMLIBSelectAnimation");
				}
	
				rm.writeAttribute("id", sId + "-mode");
				rm.writeClasses();
				rm.write(">");
				rm.renderControl(oSelectControl);
				closeCellTag();
				oLI._oldMode = oLI._mode;
				break;
	
			case "SingleSelect":
				oSelectControl = oLI._getRadioButton((sId + "-selectSingle"), oLI._listId + "_selectGroup");
	
				if (oLI.getSelected()) {
					rm.addClass("sapMLIBSelected");
				}
	
				rm.writeClasses();
				rm.write(">");
				break;
	
			case "SingleSelectMaster":
				oSelectControl = oLI._getRadioButton((sId + "-selectSingleMaster"), oLI._listId + "_selectMasterGroup");
	
				if (oLI.getSelected()) {
					rm.addClass("sapMLIBSelected");
				}
	
				rm.writeClasses();
				rm.write(">");
				openCellTag("sapMListTblNone");
				rm.addClass("sapMLIBSelectSM");
				rm.writeAttribute("id", sId + "-mode");
				rm.writeClasses();
				rm.write(">");
				rm.renderControl(oSelectControl);
				closeCellTag();
				oLI._oldMode = oLI._mode;
				break;
	
			case "MultiSelect":
				oSelectControl = oLI._getCheckBox((sId + "-selectMulti"));
	
				if (oLI.getSelected()) {
					rm.addClass("sapMLIBSelected");
				}
	
				rm.writeClasses();
				rm.write(">");
				openCellTag("sapMListTblSelCol");
				rm.addClass("sapMLIBSelectM");
	
				if (oLI._oldMode === "None" && oLI._modeAnimationOn) {
					rm.addClass("sapMLIBSelectAnimation");
				}
	
				rm.writeAttribute("id", sId + "-mode");
				rm.writeClasses();
				rm.write(">");
				rm.renderControl(oSelectControl);
				closeCellTag();
				oLI._oldMode = oLI._mode;
				break;
	
			case "Delete":
				rm.writeClasses();
				rm.write(">");
				break;
	
			case "None":
				rm.writeClasses();
				rm.write(">");
	
				if (!isTable && !bNoFlex && oLI._oldMode && oLI._oldMode !== "None"
						&& oLI._oldMode !== "SingleSelect" && oLI._oldMode !== "SingleSelectMaster"
						&& oLI._oldMode !== "Delete" && oLI._modeAnimationOn) {
	
					openCellTag();
					rm.addClass("sapMLIBUnselectAnimation");
					rm.writeAttribute("id", sId + "-mode");
					rm.writeClasses();
					rm.write(">");
					closeCellTag();
				}
	
				break;
			}
	
			var type = oLI.getType(), navIcon = "";
	
			switch (type) {
				case "Navigation":
					navIcon = "NAV";
					break;
				case "Detail":
				case "DetailAndActive":
					navIcon = "DET";
					break;
			}
	
			if (isTable) {
				this.renderLIContent(rm, oLI, oParent);
			} else {
				openCellTag();
				rm.addClass("sapMLIBContent");
	
				// there will be a margin on the right, if no navigation icon or counter is shown
				if ((type == "Active" || type == "Inactive")  && !oLI.getCounter()) {
					rm.addClass("sapMLIBContentMargin");
				}
	
				rm.writeClasses();
				rm.write(">");
	
				if (bNoFlex) {
	
					// additional content table inside for the no-flex case
					rm.write('<div class="sapMLIBContentNF">');
				}
	
				this.renderLIContent(rm, oLI);
	
				if (bNoFlex) {
					rm.write("</div>");
				}
	
				closeCellTag();
			}
	
			// if we are not in table mode than counter different than 0 bubble will be shown
			if (!isTable && oLI.getCounter()) {
				rm.write("<div");
				rm.writeAttribute("id", sId + "-counter");
				rm.addClass("sapMLIBCounter");
	
				if (!navIcon) {
					rm.addClass("sapMLIBContentMargin");
				}
	
				rm.writeClasses();
				rm.write(">");
				rm.write(oLI.getCounter());
				rm.write("</div>");
			}
	
			var detailIcon = null;
			if (navIcon == "NAV" && oLI.getType() == "Navigation") {
	
				isTable && openCellTag("sapMListTblNavCol", true);
	
				isTable && rm.write(">");
				var sURI = IconPool.getIconURI("slim-arrow-right");
				var	oNavIcon = oLI._navIcon || new sap.ui.core.Icon(sId + "-imgNav",{src:sURI}).setParent(oLI, null, true).addStyleClass("sapMLIBImgNav");
	
				if (oNavIcon) {
					oLI._navIcon = oNavIcon;
					rm.renderControl(oNavIcon);
				}
	
				isTable && closeCellTag(true);
				oParent._navRenderedBy = sId + "-imgNav";
			} else if (navIcon == "DET") {
	
				openCellTag("sapMListTblNavCol");
				rm.addClass("sapMLIBCursor");
				rm.writeClasses();
				rm.write(">");
	
				if (Parameters.get("sapUiLIDetailIcon") == "false") {
					detailIcon = oLI._getNavImage((sId + "-imgDet"), "sapMLIBImgDet", "detail_disclosure.png", "detail_disclosure_pressed.png");
				} else {
					var sURI = IconPool.getIconURI("edit");
					detailIcon = oLI._detailIcon || new sap.ui.core.Icon(sId + "-imgDet",{src:sURI}).setParent(oLI, null, true).addStyleClass("sapMLIBIconDet");
				}
	
				if (detailIcon) {
					oLI._detailIcon = detailIcon;
					rm.renderControl(detailIcon);
				}
	
				closeCellTag();
				oParent._navRenderedBy = sId + "-imgDet";
			} else if (isTable) {
	
				// create empty cells for table
				rm.write("<td></td>");
			}
	
			switch (oLI._mode) {
	
			case "SingleSelect":
				openCellTag("sapMListTblSelCol");
				rm.addClass("sapMLIBSelectS");
	
				if (oLI._oldMode === "None" && oLI._modeAnimationOn) {
					rm.addClass("sapMLIBSelectAnimation");
				}
	
				rm.writeAttribute("id", sId + "-mode");
				rm.writeClasses();
				rm.write(">");
				rm.renderControl(oSelectControl);
				closeCellTag();
				oLI._oldMode = oLI._mode;
				break;
	
			case "Delete":
	
				openCellTag("sapMListTblSelCol");
				rm.addClass("sapMLIBSelectD");
	
				if (oLI._oldMode === "None" && oLI._modeAnimationOn) {
					rm.addClass("sapMLIBSelectAnimation");
				}
	
				rm.writeAttribute("id", sId + "-mode");
				rm.writeClasses();
				rm.write(">");
	
				//toDo: this happens twice...put it in a method...
				var delIcon = null;
	
				if (Parameters.get("sapUiLIDelIcon") == "false") {
					delIcon = oLI._getDelImage((sId + "-imgDel"), "sapMLIBImgDel", "delete_icon.png");
				} else {
					var sURI = IconPool.getIconURI("sys-cancel");
					delIcon = oLI._delIcon || new sap.ui.core.Icon(sId + "-imgDel",{src:sURI}).setParent(oLI, null, true).addStyleClass("sapMLIBIconDel").attachPress(oLI._delete);
				}
	
				if (delIcon) {
					oLI._delIcon = delIcon;
					rm.renderControl(delIcon);
				}
	
				closeCellTag();
				oLI._oldMode = oLI._mode;
	
	
				break;
	
			case "None":
	
				if (!isTable && !bNoFlex && oLI._oldMode && oLI._oldMode !== "None" && (oLI._oldMode === "SingleSelect" || oLI._oldMode === "Delete") && oLI._modeAnimationOn) {
					openCellTag();
					rm.addClass("sapMLIBUnselectAnimation");
					rm.writeAttribute("id", sId + "-mode");
					rm.writeClasses();
					rm.write(">");
					closeCellTag();
				}
	
				oLI._oldMode = oLI._mode;
				break;
			}
		} else {
			rm.writeClasses();
			rm.write(">");
		}
	
		rm.write(rowEndTag);
	
		if (hasPopin) {
			this.renderPopin(rm, oLI, oParent);
		}
	};

	return ListItemBaseRenderer;

}, /* bExport= */ true);
