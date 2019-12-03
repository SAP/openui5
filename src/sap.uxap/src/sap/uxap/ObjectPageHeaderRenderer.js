/*!
 * ${copyright}
 */

sap.ui.define(["./ObjectImageHelper", "sap/ui/Device"], function (ObjectImageHelper, Device) {
	"use strict";

	/**
	 * @class HeaderBase renderer.
	 * @static
	 */
	var ObjectPageHeaderRenderer = {
		apiVersion: 2
	};

	ObjectPageHeaderRenderer.render = function (oRm, oControl) {

		var oNavigationBar = oControl.getNavigationBar(),
			bTitleVisible = (oControl.getIsObjectIconAlwaysVisible() || oControl.getIsObjectTitleAlwaysVisible() || oControl.getIsObjectSubtitleAlwaysVisible() || oControl.getIsActionAreaAlwaysVisible()),
			oParent = oControl.getParent(),
			oExpandButton = oControl.getAggregation("_expandButton"),
			oObjectImage = oControl._lazyLoadInternalAggregation("_objectImage", true),
			oPlaceholder,
			bIsDesktop = Device.system.desktop,
			bIsHeaderContentVisible = oParent && oParent.isA("sap.uxap.ObjectPageLayout") && ((oParent.getHeaderContent()
				&& oParent.getHeaderContent().length > 0 && oParent.getShowHeaderContent()) ||
			(oParent.getShowHeaderContent() && oParent.getShowTitleInHeaderContent()));

		oRm.openStart("div", oControl)
			.class('sapUxAPObjectPageHeader')
			.class('sapUxAPObjectPageHeaderDesign-' + oControl.getHeaderDesign())
			.openEnd();

		// if a navigationBar has been provided display it
		if (oNavigationBar) {
			oRm.openStart("div")
				.class("sapUxAPObjectPageHeaderNavigation")
				.openEnd();
			oRm.renderControl(oNavigationBar);
			oRm.close("div");
		}

		// first line
		oRm.openStart("div", oControl.getId() + "-identifierLine")
			.class('sapUxAPObjectPageHeaderIdentifier');

		if (bTitleVisible) {
			oRm.class('sapUxAPObjectPageHeaderIdentifierForce');
		}
		oRm.openEnd();

		if (oParent && oParent.isA("sap.uxap.ObjectPageLayout") && oParent.getIsChildPage()) {
			oRm.openStart("div")
				.class("sapUxAPObjectChildPage")
				.openEnd()
				.close("div");
		}

		if (oControl.getShowPlaceholder()) {
			oPlaceholder = oControl._lazyLoadInternalAggregation("_placeholder", true);
		}

		// If picturePath is provided show image
		ObjectImageHelper._renderImageAndPlaceholder(oRm, {
			oHeader: oControl,
			oObjectImage: oObjectImage,
			oPlaceholder: oPlaceholder,
			bIsObjectIconAlwaysVisible: oControl.getIsObjectIconAlwaysVisible(),
			bAddSubContainer: true,
			sBaseClass: 'sapUxAPObjectPageHeaderObjectImageContainer'
		});

		oRm.openStart("span", oControl.getId() + "-identifierLineContainer")
			.class('sapUxAPObjectPageHeaderIdentifierContainer')
			.openEnd();

		this._renderObjectPageTitle(oRm, oControl);
		oRm.close("span");

		oRm.openStart("span", oControl.getId() + "-actions")
			.class('sapUxAPObjectPageHeaderIdentifierActions');

		if (oControl.getIsActionAreaAlwaysVisible()) {
			oRm.class('sapUxAPObjectPageHeaderIdentifierActionsForce');
		}
		oRm.openEnd();

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

		oRm.close("span");

		oRm.close("div");

		oRm.close("div");
	};


	/**
	 * Renders the SelectTitleArrow icon.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.uxap.ObjecPageHeader} oControl The ObjectPageHeader
	 *
	 * @private
	 */
	ObjectPageHeaderRenderer._renderObjectPageTitle = function (oRm, oControl, bTitleInContent) {
		var sOHTitle = oControl.getObjectTitle(),
			bMarkers = (oControl.getShowMarkers() && (oControl.getMarkFavorite() || oControl.getMarkFlagged())),
			oBreadCrumbsAggregation = oControl._getBreadcrumbsAggregation(),
			sTooltip = oControl.getTooltip_Text(),
			sIdSuffix = bTitleInContent ? "-content" : "";

		if (!bTitleInContent && oBreadCrumbsAggregation) {
			oRm.renderControl(oBreadCrumbsAggregation);
		}

		oRm.openStart("h2", oControl.getId() + "-title" + sIdSuffix)
			.class('sapUxAPObjectPageHeaderIdentifierTitle');

		if (oControl.getIsObjectTitleAlwaysVisible()) {
			oRm.class('sapUxAPObjectPageHeaderIdentifierTitleForce');
		}
		if (bTitleInContent) {
			oRm.class('sapUxAPObjectPageHeaderIdentifierTitleInContent');
		}
		if (oControl.getShowTitleSelector()) { // if we have arrow to render, the subtitle should have smaller top margin
			oRm.class('sapUxAPObjectPageHeaderTitleFollowArrow');
		}
		oRm.openEnd();

		oRm.openStart("span", oControl.getId() + "-innerTitle" + sIdSuffix)
			.class("sapUxAPObjectPageHeaderTitleText")
			.class("sapUxAPObjectPageHeaderTitleTextWrappable");

		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		oRm.openEnd();

		// if we have markers or arrow we have to cut the last word and bind it to the markers and arrow so that the icons never occur in one line but are accompanied by the last word of the title.

		if (bMarkers || oControl.getShowTitleSelector() || oControl.getMarkLocked() || oControl.getMarkChanges()) {
			var sOHTitleEnd = sOHTitle.substr(sOHTitle.lastIndexOf(" ") + 1);
			var sOHTitleStart = sOHTitle.substr(0, sOHTitle.lastIndexOf(" ") + 1);

			if (sOHTitleEnd.length === 1) {
				sOHTitleEnd = sOHTitle;
				sOHTitleStart = '';
			}
			oRm.text(sOHTitleStart);
			oRm.close("span");

			oRm.openStart("span")
				.class('sapUxAPObjectPageHeaderNowrapMarkers');

			if (oControl.getMarkLocked() || oControl.getMarkChanges()) {
				oRm.class('sapUxAPObjectPageHeaderMarks');
			}
			oRm.openEnd();

			oRm.openStart("span")
				.class("sapUxAPObjectPageHeaderTitleText")
				.openEnd()
				.text(sOHTitleEnd)
				.close("span");

			this._renderMarkers(oRm, oControl);

			// if someone has set both Locked and Unsaved Changes icons, then show only Locked icon
			if (oControl.getMarkLocked()) {
				this._renderLock(oRm, oControl, bTitleInContent);
			} else if (oControl.getMarkChanges()) {
				this._renderMarkChanges(oRm, oControl, bTitleInContent);
			}

			this._renderSelectTitleArrow(oRm, oControl, bTitleInContent);
			oRm.close("span");
		} else {
			oRm.text(sOHTitle);
			oRm.close("span");
		}

		oRm.close("h2");

		oRm.openStart("span", oControl.getId() + "-subtitle" + sIdSuffix)
			.class('sapUxAPObjectPageHeaderIdentifierDescription');

		if (oControl.getIsObjectSubtitleAlwaysVisible() && oControl.getObjectSubtitle()) {
			oRm.class('sapUxAPObjectPageHeaderIdentifierDescriptionForce');
		}
		if (bTitleInContent) {
			oRm.class('sapUxAPObjectPageHeaderIdentifierSubTitleInContent');
		}
		oRm.openEnd();
		oRm.text(oControl.getObjectSubtitle());
		oRm.close("span");
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
			oRm.openStart("span")
				.class("sapUxAPObjectPageHeaderTitleArrow")
				.openEnd();

			if (bTitleInContent) {
				oRm.renderControl(oControl._oTitleArrowIconCont);
			} else {
				oRm.renderControl(oControl._oTitleArrowIcon);
			}
			oRm.close("span");
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
			oRm.openStart("span"); // Start button and separator container
			oRm.class("sapUxAPObjectPageHeaderSideContentBtn");
			oRm.openEnd();

			oRm.openStart("span")
				.class("sapUxAPObjectPageHeaderSeparator")
				.openEnd()
				.close("span");

			oRm.renderControl(oSideBtn);
			oRm.close("span");
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
		oRm.openStart("span")
			.class("sapUxAPObjectPageHeaderChangesBtn")
			.class("sapUiSizeCompact")
			.openEnd();

		if (bTitleInContent) {
			oRm.renderControl(oControl._oChangesIconCont);
		} else {
			oRm.renderControl(oControl._oChangesIcon);
		}

		oRm.close("span");
	};

	/**
	 * Renders the Lock icon.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.uxap.ObjectPageHeader} oControl the ObjectPageHeader
	 * @param {boolean} bTitleInContent the lock will be rendered in content or in title
	 * @private
	 */
	ObjectPageHeaderRenderer._renderLock = function (oRm, oControl, bTitleInContent) {
		oRm.openStart("span")
			.class("sapUxAPObjectPageHeaderLockBtn")
			.class("sapUiSizeCompact")
			.openEnd();

		if (bTitleInContent) {
			oRm.renderControl(oControl._oLockIconCont);
		} else {
			oRm.renderControl(oControl._oLockIcon);
		}

		oRm.close("span");
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
			oRm.openStart("span", oControl.getId() + "-markers")
				.class("sapMObjStatusMarker")
				.attr("aria-describedby", oControl.getId() + "-markers-aria")
				.openEnd();

			for (var i = 0; i < aIcons.length; i++) {
				oRm.renderControl(aIcons[i]);
			}

			oRm.close("span");
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

			oRm.openStart("div", oControl.getId() + "-markers-aria")
				.attr("aria-hidden", "false")
				.class("sapUiHidden")
				.openEnd()
				.text(sAriaDescription)
				.close("div");
			// END ARIA hidden node
		}
	};


	return ObjectPageHeaderRenderer;

}, /* bExport= */ true);
