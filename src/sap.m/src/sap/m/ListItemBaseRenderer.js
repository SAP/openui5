/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/IconPool', 'sap/ui/core/theming/Parameters'],
	function(jQuery, IconPool, Parameters) {
	"use strict";


	/**
	 * ListitemBase renderer.
	 *
	 * @namespace
	 */
	var ListItemBaseRenderer = {};
	
	/**
	 * Writes necessary invisible placeholder HTML attributes and styles.
	 * TODO: Why this functionality does not come from RenderManager
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oLI an object representation of the control that should be rendered.
	 * @private
	 */
	ListItemBaseRenderer.writeInvisiblePlaceholderData = function(rm, oLI) {
		var sPlaceholderId = sap.ui.core.RenderPrefixes.Invisible + oLI.getId();
		var sPlaceholderHtml = ' ' +
			'id="' + sPlaceholderId + '" ' + 
			'data-sap-ui="' + sPlaceholderId + '" ' + 
			'style="display: none;"' + 
			'aria-hidden="true"';
		
		rm.write(sPlaceholderHtml);
	};
	
	ListItemBaseRenderer.renderInvisible = function(rm, oLI) {
		this.openItemTag(rm, oLI);
		this.writeInvisiblePlaceholderData(rm, oLI);
		rm.write(">");
		this.closeItemTag(rm, oLI);
	};
	
	ListItemBaseRenderer.isModeMatched = function(sMode, iOrder) {
		var mOrderConfig = (sap.m.ListBaseRenderer || {}).ModeOrder || {};
		return (mOrderConfig[sMode] == iOrder);
	};

	/**
	 * Renders the mode when item mode is in correct order
	 * 
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oLI an object representation of the control that should be rendered.
	 * @param {int} [iOrder] expected order for the rendering
	 * @protected
	 */
	ListItemBaseRenderer.renderMode = function(rm, oLI, iOrder) {
		var sMode = oLI.getMode();
		if (!this.isModeMatched(sMode, iOrder)) {
			return;
		}
		
		var oModeControl = oLI.getModeControl();
		if (oModeControl) {
			this.renderModeContent(rm, oLI, oModeControl);
		}
	};

	ListItemBaseRenderer.renderModeContent = function(rm, oLI, oModeControl) {
		var sMode = oLI.getMode(),
			mModeConfig = {
				Delete : "D",
				MultiSelect : "M",
				SingleSelect : "S",
				SingleSelectLeft : "SL"
			};

		rm.write("<div");
		rm.writeAttribute("id", oLI.getId() + "-mode");
		rm.addClass("sapMLIBSelect" + mModeConfig[sMode]);
		this.decorateMode(rm, oLI);
		rm.writeClasses();
		rm.writeStyles();
		rm.write(">");
		rm.renderControl(oModeControl);
		rm.write("</div>");
	};

	ListItemBaseRenderer.decorateMode = function(rm, oLI) {
		if (!oLI.getListProperty("modeAnimationOn")) {
			return;
		}

		var sMode = oLI.getMode(),
			sLastListMode = oLI.getListProperty("lastMode");
		
		// determine whether list mode is changed or not
		if (!sLastListMode || sLastListMode == sMode) {
			return;
		}

		if (sMode == sap.m.ListMode.None) {
			rm.addClass("sapMLIBUnselectAnimation");
		} else {
			rm.addClass("sapMLIBSelectAnimation");
		}
	};

	/**
	 * Renders counter if it is not empty
	 * 
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oLI an object representation of the control that should be rendered.
	 * @protected
	 */
	ListItemBaseRenderer.renderCounter = function(rm, oLI) {
		var iCounter = oLI.getCounter();
		if (iCounter) {
			this.renderCounterContent(rm, oLI, iCounter);
		}
	};

	ListItemBaseRenderer.renderCounterContent = function(rm, oLI, iCounter) {
		rm.write("<div");
		rm.writeAttribute("id", oLI.getId() + "-counter");
		rm.addClass("sapMLIBCounter");
		rm.writeClasses();
		rm.write(">");
		rm.write(iCounter);
		rm.write("</div>");
	};

	/**
	 * Renders type for the list item
	 * 
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oLI an object representation of the control that should be rendered.
	 * @protected
	 */
	ListItemBaseRenderer.renderType = function(rm, oLI) {
		var oTypeControl = oLI.getTypeControl();
		if (oTypeControl) {
			this.renderTypeContent(rm, oLI, oTypeControl);
			oLI.informList("TypeRender");
		}
	};

	ListItemBaseRenderer.renderTypeContent = function(rm, oLI, oTypeControl) {
		var bDetail = oLI.getType().indexOf("Detail") != -1;
		if (bDetail) {
			rm.write("<div class='sapMLIBCursor'>");
		}

		rm.renderControl(oTypeControl);

		if (bDetail) {
			rm.write("</div>");
		}
	};

	/**
	 * Renders list item HTML starting tag
	 * 
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oLI an object representation of the control that should be rendered.
	 * @protected
	 */
	ListItemBaseRenderer.openItemTag = function(rm, oLI) {
		rm.write("<li");
	};

	/**
	 * Renders list item HTML closing tag
	 * 
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oLI an object representation of the control that should be rendered.
	 * @protected
	 */
	ListItemBaseRenderer.closeItemTag = function(rm, oLI) {
		rm.write("</li>");
	};

	/**
	 * Determines whether flex box wrapper is necessary or not.
	 * 
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oLI an object representation of the control that should be rendered.
	 * @protected
	 */
	ListItemBaseRenderer.handleNoFlex = function(rm, oLI) {
		return !jQuery.support.hasFlexBoxSupport;
	};

	ListItemBaseRenderer.renderTabIndex = function(rm, oLI) {
		rm.writeAttribute("tabindex", "-1");
	};

	ListItemBaseRenderer.renderTooltip = function(rm, oLI) {
		var sTooltip = oLI.getTooltip_AsString();
		if (sTooltip) {
			rm.writeAttributeEscaped("title", sTooltip);
		}
	};
	
	ListItemBaseRenderer.writeAccessibilityState = function(rm, oLI) {
		// TODO
	};
	
	/**
	 * Hook for rendering list item contents
	 * 
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oLI an object representation of the control that should be rendered.
	 * @protected
	 */
	ListItemBaseRenderer.renderLIContent = function(rm, oLI) {
	};
	
	/**
	 * Hook for changing list item attributes
	 * 
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oLI an object representation of the control that should be rendered.
	 * @protected
	 */
	ListItemBaseRenderer.renderLIAttributes = function(rm, oLI) {
	};

	
	ListItemBaseRenderer.renderLIContentWrapper = function(rm, oLI) {
		rm.write('<div class="sapMLIBContent">');

		// additional content with class for no-flex case
		if (this.handleNoFlex()) {
			rm.write('<div class="sapMLIBContentNF">');
		}

		this.renderLIContent(rm, oLI);

		if (this.handleNoFlex()) {
			rm.write('</div>');
		}

		rm.write('</div>');
	};


	/**
	 * Renders the HTML for the given control, using the provided.
	 *
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oLI an object representation of the control that should be rendered.
	 * @public
	 */
	ListItemBaseRenderer.render = function(rm, oLI) {

		// render invisible placeholder
		if (!oLI.getVisible()) {
			this.renderInvisible(rm, oLI);
			return false;
		}

		// start
		this.openItemTag(rm, oLI);
		this.renderTabIndex(rm, oLI);
		rm.writeControlData(oLI);

		// classes
		rm.addClass("sapMLIB");
		rm.addClass("sapMLIB-CTX");
		rm.addClass("sapMLIBShowSeparator");
		rm.addClass("sapMLIBType" + oLI.getType());

		if (oLI.isClickable()) {
			rm.addClass("sapMLIBCursor");
		}

		if (oLI.getSelected()) {
			rm.addClass("sapMLIBSelected");
		}

		if (this.handleNoFlex()) {
			rm.addClass("sapMLIBNoFlex");
		}

		if (oLI.getListProperty("showUnread") && oLI.getUnread()) {
			rm.addClass("sapMLIBUnread");
		}

		// attributes
		this.renderTooltip(rm, oLI);
		this.renderTabIndex(rm, oLI);
		this.writeAccessibilityState(rm, oLI);

		// item attributes hook
		this.renderLIAttributes(rm, oLI);

		rm.writeClasses();
		rm.writeStyles();
		rm.write(">");

		// mode for left hand side of the content
		this.renderMode(rm, oLI, -1);
		
		this.renderLIContentWrapper(rm, oLI);
		this.renderCounter(rm, oLI);
		this.renderType(rm, oLI);

		// mode for right hand side of the content
		this.renderMode(rm, oLI, 1);

		this.closeItemTag(rm, oLI);
	};

	return ListItemBaseRenderer;

}, /* bExport= */ true);
