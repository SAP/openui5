/*!
 * ${copyright}
 */

sap.ui.define(["./ObjectPageLayout", "sap/ui/core/Icon"], function (ObjectPageLayout, Icon) {
	"use strict";

	/**
	 * @class HeaderBase renderer.
	 * @static
	 */
	var ObjectPageHeaderRenderer = {};

	ObjectPageHeaderRenderer.render = function (oRm, oControl) {

		var oNavigationBar = oControl.getNavigationBar(),
			bTitleVisible = (oControl.getIsObjectIconAlwaysVisible() || oControl.getIsObjectTitleAlwaysVisible() || oControl.getIsObjectSubtitleAlwaysVisible() || oControl.getIsActionAreaAlwaysVisible()),
			oParent = oControl.getParent(),
			oExpandButton = oControl.getAggregation("_expandButton"),
			oObjectImage = oControl._getInternalAggregation("_objectImage"),
			bIsDesktop = sap.ui.Device.system.desktop,
			bIsHeaderContentVisible = oParent && oParent instanceof ObjectPageLayout && ((oParent.getHeaderContent()
				&& oParent.getHeaderContent().length > 0 && oParent.getShowHeaderContent()) ||
			(oParent.getShowHeaderContent() && oParent.getShowTitleInHeaderContent()));

		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass('sapUxAPObjectPageHeader');
		oRm.addClass('sapUxAPObjectPageHeaderDesign-' + oControl.getHeaderDesign());
		oRm.writeClasses();
		oRm.write(">");
		// if an navigationBar has been provided display it

		if (oNavigationBar) {
			oRm.write("<div");
			oRm.addClass('sapUxAPObjectPageHeaderNavigation');
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oNavigationBar);
			oRm.write("</div>");
		}

		// first line
		oRm.write("<div");
		oRm.writeAttributeEscaped("id", oControl.getId() + "-identifierLine");
		oRm.addClass('sapUxAPObjectPageHeaderIdentifier');
		if (bTitleVisible) {
			oRm.addClass('sapUxAPObjectPageHeaderIdentifierForce');
		}
		oRm.writeClasses();
		oRm.write(">");

		if (oParent && oParent instanceof ObjectPageLayout && oParent.getIsChildPage()) {
			oRm.write("<div");
			oRm.addClass('sapUxAPObjectChildPage');
			oRm.writeClasses();
			oRm.write("></div>");
		}

		// If picturePath is provided show image
		if (oControl.getObjectImageURI() || oControl.getShowPlaceholder()) {
			oRm.write("<span ");
			oRm.addClass('sapUxAPObjectPageHeaderObjectImageContainer');
			oRm.addClass('sapUxAPObjectPageHeaderObjectImage-' + oControl.getObjectImageShape());
			if (oControl.getIsObjectIconAlwaysVisible()) {
				oRm.addClass('sapUxAPObjectPageHeaderObjectImageForce');
			}
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("<span class='sapUxAPObjectPageHeaderObjectImageContainerSub'>");

			ObjectPageHeaderRenderer._renderInProperContainer(function () {
				oRm.renderControl(oObjectImage);
				ObjectPageHeaderRenderer._renderPlaceholder(oRm, oControl, !(oControl.getObjectImageShape() || oControl.getShowPlaceholder()));
			}, oObjectImage, oRm);

			oRm.write("</span>");
			oRm.write("</span>");
		}
		oRm.write("<span ");
		oRm.writeAttributeEscaped("id", oControl.getId() + "-identifierLineContainer");
		oRm.addClass('sapUxAPObjectPageHeaderIdentifierContainer');
		oRm.writeClasses();
		oRm.write(">");

		this._renderObjectPageTitle(oRm, oControl);
		oRm.write("</span>");

		oRm.write("<span");
		oRm.writeAttributeEscaped("id", oControl.getId() + "-actions");
		oRm.addClass('sapUxAPObjectPageHeaderIdentifierActions');
		if (oControl.getIsActionAreaAlwaysVisible()) {
			oRm.addClass('sapUxAPObjectPageHeaderIdentifierActionsForce');
		}
		if (oControl._getActionsPaddingStatus()) {
			oRm.addClass("sapUxAPObjectPageHeaderIdentifierActionsNoPadding");
		}
		oRm.writeClasses();
		oRm.write(">");

		// Render the expand button only if there is a content to expand and we are on desktop
		if (bIsDesktop && bIsHeaderContentVisible) {
			oExpandButton.addStyleClass("sapUxAPObjectPageHeaderExpandButton");
			oRm.renderControl(oExpandButton);
		}

		var aActions = oControl.getActions();
		for (var i = 0; i < aActions.length; i++) {
			var oAction = aActions[i];

			oRm.renderControl(oAction);
		}
		var oOverflowButton = oControl.getAggregation("_overflowButton");
		oRm.renderControl(oOverflowButton);

		this._renderSideContentBtn(oRm, oControl);

		oRm.write("</span>");

		oRm.write("</div>");

		oRm.write("</div>");
	};

	ObjectPageHeaderRenderer._renderInProperContainer = function (fnRender, oObjectImage, oRm) {
		if (oObjectImage instanceof Icon) {
			oRm.write("<div");
			oRm.addClass("sapUxAPObjectPageHeaderObjectImage");
			oRm.addClass("sapUxAPObjectPageHeaderPlaceholder");
			oRm.writeClasses();
			oRm.write(">");
			fnRender();
			oRm.write("</div>");
		} else {
			fnRender();
		}
	};


	/**
	 * Renders the SelectTitleArrow icon.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRm the RenderManager that can be used for writing to the render output buffer
	 *
	 * @param {sap.uxap.ObjecPageHeader}
	 *            oControl the ObjectPageHeader
	 *
	 * @param {bVisible}  if the placeholder will be visible
	 *
	 * @private
	 */
	ObjectPageHeaderRenderer._renderPlaceholder = function (oRm, oControl, bVisible, bTitleInContent) {
		oRm.write("<div");
		oRm.addClass('sapUxAPObjectPageHeaderPlaceholder');
		oRm.addClass('sapUxAPObjectPageHeaderObjectImage');
		if (!bVisible) {
			oRm.addClass('sapUxAPHidePlaceholder');
		}
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oControl._oPlaceholder);
		oRm.write("</div>");
	};

	/**
	 * Renders the SelectTitleArrow icon.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRm the RenderManager that can be used for writing to the render output buffer
	 *
	 * @param {sap.uxap.ObjecPageHeader}
	 *            oControl the ObjectPageHeader
	 *
	 * @private
	 */
	ObjectPageHeaderRenderer._renderObjectPageTitle = function (oRm, oControl, bTitleInContent) {
		var sOHTitle = oControl.getObjectTitle(),
			bMarkers = (oControl.getShowMarkers() && (oControl.getMarkFavorite() || oControl.getMarkFlagged())),
			oBreadCrumbs = oControl._getInternalAggregation('_breadCrumbs');

		if (!bTitleInContent && oBreadCrumbs && oBreadCrumbs.getLinks().length) {
			oRm.renderControl(oBreadCrumbs);
		}
		oRm.write("<h1");
		oRm.addClass('sapUxAPObjectPageHeaderIdentifierTitle');
		if (oControl.getIsObjectTitleAlwaysVisible()) {
			oRm.addClass('sapUxAPObjectPageHeaderIdentifierTitleForce');
		}
		if (bTitleInContent) {
			oRm.addClass('sapUxAPObjectPageHeaderIdentifierTitleInContent');
		}
		if (oControl.getShowTitleSelector()) { // if we have arrow to render, the subtitle should have smaller top margin
			oRm.addClass('sapUxAPObjectPageHeaderTitleFollowArrow');
		}

		oRm.writeClasses();
		oRm.writeAttributeEscaped("id", oControl.getId() + "-title");
		oRm.write(">");
		oRm.write("<span");
		oRm.addClass("sapUxAPObjectPageHeaderTitleTextWrappable");
		oRm.writeClasses();
		oRm.writeAttributeEscaped("id", oControl.getId() + "-innerTitle");
		oRm.write(">");

		// if we have markers or arrow we have to cut the last word and bind it to the markers and arrow so that the icons never occur in one line but are accompanied by the last word of the title.

		if (bMarkers || oControl.getShowTitleSelector() || oControl.getMarkLocked() || oControl.getMarkChanges()) {
			var sOHTitleEnd = sOHTitle.substr(sOHTitle.lastIndexOf(" ") + 1);
			var sOHTitleStart = sOHTitle.substr(0, sOHTitle.lastIndexOf(" ") + 1);

			if (sOHTitleEnd.length === 1) {
				sOHTitleEnd = sOHTitle;
				sOHTitleStart = '';
			}

			oRm.writeEscaped(sOHTitleStart);
			oRm.write("</span>");
			oRm.write("<span");
			oRm.addClass('sapUxAPObjectPageHeaderNowrapMarkers');
			if (oControl.getMarkLocked() || oControl.getMarkChanges()) {
				oRm.addClass('sapUxAPObjectPageHeaderMarks');
			}
			oRm.writeClasses();
			oRm.write(">");
			oRm.writeEscaped(sOHTitleEnd);

			// if someone has set both Locked and Unsaved Changes icons, then show only Locked icon
			if (oControl.getMarkLocked()) {
				this._renderLock(oRm, oControl, bTitleInContent);
			} else if (oControl.getMarkChanges()) {
				this._renderMarkChanges(oRm, oControl, bTitleInContent);
			}

			this._renderMarkers(oRm, oControl);
			this._renderSelectTitleArrow(oRm, oControl, bTitleInContent);
			oRm.write("</span>");
		} else {
			oRm.writeEscaped(sOHTitle);
			oRm.write("</span>");
		}
		oRm.write("</h1>");

		oRm.write("<span");
		oRm.addClass('sapUxAPObjectPageHeaderIdentifierDescription');
		if (oControl.getIsObjectSubtitleAlwaysVisible() && oControl.getObjectSubtitle()) {
			oRm.addClass('sapUxAPObjectPageHeaderIdentifierDescriptionForce');
		}
		if (bTitleInContent) {
			oRm.addClass('sapUxAPObjectPageHeaderIdentifierSubTitleInContent');
		}
		oRm.writeClasses();
		oRm.writeAttributeEscaped("id", oControl.getId() + "-subtitle");
		oRm.write(">");
		oRm.writeEscaped(oControl.getObjectSubtitle());
		oRm.write("</span>");
	};
	/**
	 * Renders the SelectTitleArrow icon.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRm the RenderManager that can be used for writing to the render output buffer
	 *
	 * @param {sap.uxap.ObjectPageHeader}
	 *            oControl the ObjectPageHeader
	 * @param {boolean}
	 *      bTitleInContent - if the arrow will be rendered in content or in title
	 * @private
	 */
	ObjectPageHeaderRenderer._renderSelectTitleArrow = function (oRm, oControl, bTitleInContent) {
		if (oControl.getShowTitleSelector()) { // render select title arrow
			oRm.write("<span"); // Start title arrow container
			oRm.addClass("sapUxAPObjectPageHeaderTitleArrow");
			oRm.writeClasses();
			oRm.write(">");
			if (bTitleInContent) {
				oRm.renderControl(oControl._oTitleArrowIconCont);
			} else {
				oRm.renderControl(oControl._oTitleArrowIcon);
			}
			oRm.write("</span>"); // end title arrow container
		}
	};

	/**
	 * Renders the sideContentButton button.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRm the RenderManager that can be used for writing to the render output buffer
	 *
	 * @param {sap.uxap.ObjectPageHeader}
	 *            oControl the ObjectPageHeader
	 * @private
	 */
	ObjectPageHeaderRenderer._renderSideContentBtn = function (oRm, oControl) {
		var oSideBtn = oControl.getSideContentButton();

		if (oSideBtn) { // render sideContent button and separator
			oRm.write("<span"); // Start button and separator container
			oRm.addClass("sapUxAPObjectPageHeaderSideContentBtn");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("<span");
			oRm.addClass("sapUxAPObjectPageHeaderSeparator");
			oRm.writeClasses();
			oRm.write("></span>");
			oRm.renderControl(oSideBtn);
			oRm.write("</span>"); // end container
		}
	};


	/**
	 * Renders the Unsaved Changes icon.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRm the RenderManager that can be used for writing to the render output buffer
	 *
	 * @param {sap.uxap.ObjectPageHeader}
	 *            oControl the ObjectPageHeader
	 * @param {boolean}
	 *      bTitleInContent - if the Unsaved changes icon will be rendered in content or in title
	 * @private
	 */
	ObjectPageHeaderRenderer._renderMarkChanges = function (oRm, oControl, bTitleInContent) {
		oRm.write("<span");
		oRm.addClass("sapUxAPObjectPageHeaderChangesBtn");
		oRm.addClass("sapUiSizeCompact");
		oRm.writeClasses();
		oRm.write(">");
		if (bTitleInContent) {
			oRm.renderControl(oControl._oChangesIconCont);
		} else {
			oRm.renderControl(oControl._oChangesIcon);
		}
		oRm.write("</span>");
	};

	/**
	 * Renders the Lock icon.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRm the RenderManager that can be used for writing to the render output buffer
	 *
	 * @param {sap.uxap.ObjectPageHeader}
	 *            oControl the ObjectPageHeader
	 * @param {boolean}
	 *      bTitleInContent - if the lock will be rendered in content or in title
	 * @private
	 */
	ObjectPageHeaderRenderer._renderLock = function (oRm, oControl, bTitleInContent) {
		oRm.write("<span");
		oRm.addClass("sapUxAPObjectPageHeaderLockBtn");
		oRm.addClass("sapUiSizeCompact");
		oRm.writeClasses();
		oRm.write(">");
		if (bTitleInContent) {
			oRm.renderControl(oControl._oLockIconCont);
		} else {
			oRm.renderControl(oControl._oLockIcon);
		}
		oRm.write("</span>");
	};

	/**
	 * Renders the favorite and flag icons.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRm the RenderManager that can be used for writing to the render output buffer
	 *
	 * @param {sap.m.ObjectHeader}
	 *            oControl the ObjectPageHeader
	 *
	 * @private
	 */
	ObjectPageHeaderRenderer._renderMarkers = function (oRm, oControl) {
		var aIcons = [];

		// load icons based on control state
		if (oControl.getShowMarkers()) {
			aIcons.push(oControl._oFavIcon);
			aIcons.push(oControl._oFlagIcon);

			this._renderMarkersAria(oRm, oControl); // render hidden aria description of flag and favorite icons

			// render icons
			oRm.write("<span");
			oRm.addClass("sapMObjStatusMarker");

			oRm.writeClasses();
			oRm.writeAttributeEscaped("id", oControl.getId() + "-markers");
			oRm.writeAttributeEscaped("aria-describedby", oControl.getId() + "-markers-aria");

			oRm.write(">");
			for (var i = 0; i < aIcons.length; i++) {
				oRm.renderControl(aIcons[i]);
			}
			oRm.write("</span>");
		}
	};

	/**
	 * Renders hidden div with ARIA descriptions of the favorite and flag icons.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRm the RenderManager that can be used for writing to the render output buffer
	 *
	 * @param {sap.m.ObjectHeader}
	 *            oControl the ObjectPageHeader
	 *
	 * @private
	 */
	ObjectPageHeaderRenderer._renderMarkersAria = function (oRm, oControl) {
		var sAriaDescription = ""; // ARIA description message

		// check if flag mark is set
		if (oControl.getMarkFlagged()) {
			sAriaDescription += (oControl.oLibraryResourceBundle.getText("ARIA_FLAG_MARK_VALUE") + " ");
		}

		// check if favorite mark is set
		if (oControl.getMarkFavorite()) {
			sAriaDescription += (oControl.oLibraryResourceBundle.getText("ARIA_FAVORITE_MARK_VALUE") + " ");
		}

		// if there is a description render ARIA node
		if (sAriaDescription !== "") {
			// BEGIN ARIA hidden node
			oRm.write("<div");

			oRm.writeAttributeEscaped("id", oControl.getId() + "-markers-aria");
			oRm.writeAttribute("aria-hidden", "false");
			oRm.addClass("sapUiHidden");
			oRm.writeClasses();
			oRm.write(">");
			oRm.writeEscaped(sAriaDescription);

			oRm.write("</div>");
			// END ARIA hidden node
		}
	};


	return ObjectPageHeaderRenderer;

}, /* bExport= */ true);
