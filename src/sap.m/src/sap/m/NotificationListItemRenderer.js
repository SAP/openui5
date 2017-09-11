/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/library"], function(coreLibrary) {
    'use strict';

    // shortcut for sap.ui.core.Priority
    var Priority = coreLibrary.Priority;

    /**
     * NotificationListItem renderer.
     * @namespace
     */
    var NotificationListItemRenderer = {};

    var classNameItem = 'sapMNLI';
    var classNameBase = 'sapMNLB';
    var classNameTextWrapper = 'sapMNLI-TextWrapper';
    var classNameListBaseItem = 'sapMLIB';
    var classNameAuthor = 'sapMNLB-AuthorPicture';
    var classNamePriority = 'sapMNLB-Priority';
    var classNameBaseHeader = 'sapMNLB-Header';
    var classNameHeader = 'sapMNLI-Header';
    var classNameBody = 'sapMNLI-Body';
    var classNameDescription = 'sapMNLI-Description';
    var classNameDetails = 'sapMNLI-Details';
    var classNameBullet = 'sapMNLB-Bullet';
    var classNameBaseFooter = 'sapMNLB-Footer';
    var classNameFooter = 'sapMNLI-Footer';
    var classNameNoFooter = 'sapMNLI-No-Footer';
    var classNameCloseButton = 'sapMNLB-CloseButton';
    var classNameCollapseButton = 'sapMNLI-CollapseButton';
    var classNameInitialOverwriteTitle = 'sapMNLI-TitleWrapper--initial-overwrite';
    var classNameInitialOverwriteText = 'sapMNLI-TextWrapper--initial-overwrite';

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
     */
    NotificationListItemRenderer.render = function (oRm, oControl) {
        if (oControl.getVisible()) {
            var id = oControl.getId();
            var labelledBy = (id + '-title') + ' ' + (id + '-body') + ' ' + (id + '-info');

            oRm.write('<li');
            oRm.addClass(classNameItem);
            oRm.addClass(classNameBase);
            oRm.addClass(classNameListBaseItem);
            oRm.writeControlData(oControl);
            oRm.writeAttribute('tabindex', '0');

            // ARIA
            oRm.writeAccessibilityState(oControl, {
                role: "listitem",
                labelledby: labelledBy
            });

            oRm.writeClasses();
            oRm.write('>');

            this.renderPriorityArea(oRm, oControl);
            this.renderMessageStrip(oRm, oControl);
            this.renderHeader(oRm, oControl);
            this.renderBody(oRm, oControl);
            this.renderFooter(oRm, oControl);

            oRm.write('</li>');
        } else {
            this.renderInvisibleItem(oRm, oControl);
        }
    };

    //================================================================================
    // Priority and picture rendering methods
    //================================================================================

    /**
     * Renders the visual representation of the priority of the NotificationListItem.
     *
     * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
     */
    NotificationListItemRenderer.renderPriorityArea = function (oRm, oControl) {
        oRm.write('<div');

        var classPriority = '';

        switch (oControl.getPriority()) {
            case (Priority.Low):
                classPriority = 'sapMNLB-Low';
                break;
            case (Priority.Medium):
                classPriority = 'sapMNLB-Medium';
                break;
            case (Priority.High):
                classPriority = 'sapMNLB-High';
                break;
            default:
                classPriority = 'sapMNLB-None';
                break;
        }

        oRm.addClass(classNamePriority);
        oRm.addClass(classPriority);

        oRm.writeClasses();
        oRm.write('>');
        oRm.write('</div>');
    };

    /**
     * Renders the MessageStrip of the notification if such exists.
     *
     * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
     */
    NotificationListItemRenderer.renderMessageStrip = function (oRm, oControl) {
        oRm.renderControl(oControl.getProcessingMessage());
    };

    /**
     * Renders the picture of the author of the Notification.
     *
     * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
     */
    NotificationListItemRenderer.renderAuthorPicture = function (oRm, oControl) {
        if (!oControl.getAuthorPicture()) {
            return;
        }

        oRm.write('<div');
        oRm.addClass(classNameAuthor);
        oRm.writeClasses();
        oRm.write('>');
        oRm.renderControl(oControl._getAuthorImage());
        oRm.write('</div>');
    };

    /**
     * Renders the close button of the NotificationListItem.
     *
     * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
     */
    NotificationListItemRenderer.renderCloseButton = function (oRm, oControl) {
        if (oControl.getShowCloseButton()) {
            oRm.renderControl(oControl.getAggregation('_closeButton').addStyleClass(classNameCloseButton));
        }
    };

    /**
     * Renders the close button of the NotificationListItem.
     *
     * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
     */
    NotificationListItemRenderer.renderCollapseButton = function (oRm, oControl) {
        oRm.renderControl(oControl.getAggregation('_collapseButton').addStyleClass(classNameCollapseButton));
    };

    //================================================================================
    // Header rendering methods
    //================================================================================

    /**
     * Renders the header content of the NotificationListItem.
     *
     * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
     */
    NotificationListItemRenderer.renderHeader = function (oRm, oControl) {
        oRm.write('<div');
        oRm.addClass(classNameBaseHeader);
        oRm.addClass(classNameHeader);
        oRm.addClass(classNameInitialOverwriteTitle);

        if (buttonsShouldBeRendered(oControl)) {
            oRm.addClass(classNameNoFooter);
        }

        oRm.writeClasses();
        oRm.write('>');

        this.renderCloseButton(oRm, oControl);
        this.renderTitle(oRm, oControl);
        oRm.write('</div>');
    };

    /**
     * Renders the title of the NotificationListItem.
     *
     * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
     */
    NotificationListItemRenderer.renderTitle = function (oRm, oControl) {
        oRm.renderControl(oControl._getHeaderTitle());
    };

    //================================================================================
    // Body rendering methods
    //================================================================================

    /**
     * Renders the body content of the NotificationListItem.
     *
     * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
     */
    NotificationListItemRenderer.renderBody = function (oRm, oControl) {
        if (!oControl._getDescriptionText().getText() && !oControl.getAuthorName() && !oControl.getDatetime() && !oControl.getAuthorPicture()) {
            return;
        }
        oRm.write('<div');
        oRm.addClass(classNameBody);

        if (buttonsShouldBeRendered(oControl)) {
            oRm.addClass(classNameNoFooter);
        }

        oRm.writeClasses();
        oRm.write('>');

        this.renderAuthorPicture(oRm, oControl);
        oRm.write('<div class=' + classNameDescription + '>');
        this.renderDescription(oRm, oControl);
        this.renderDetails(oRm, oControl);
        oRm.write('</div>');
        this.renderAriaText(oRm, oControl);

        oRm.write('</div>');

    };

    /**
     * Renders the description text inside the body of the NotificationListItem.
     *
     * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
     */
    NotificationListItemRenderer.renderDescription = function (oRm, oControl) {
        if (!oControl._getDescriptionText().getText()) {
            return;
        }
        oRm.write('<div');
        oRm.addClass(classNameTextWrapper);
        oRm.addClass(classNameInitialOverwriteText);

        oRm.writeClasses();
        oRm.write('>');

        oRm.renderControl(oControl._getDescriptionText());
        oRm.write('</div>');
    };

    /**
     * Renders the details, such as author name and timestamp of the NotificationListItem.
     *
     * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
     */
    NotificationListItemRenderer.renderDetails = function (oRm, oControl) {
        if (!oControl.getAuthorName() && !oControl.getDatetime()) {
            return;
        }

        oRm.write('<div class="' + classNameDetails + '">');
        this.renderAuthorName(oRm, oControl);

        if (oControl.getAuthorName()) {
            oRm.write('<span class="' + classNameBullet + '">&#x00B7</span>');
        }

        this.renderDatetime(oRm, oControl);
        oRm.write('</div>');

    };

    /**
     * Renders the timestamp of the NotificationListItem.
     *
     * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
     */
    NotificationListItemRenderer.renderDatetime = function (oRm, oControl) {
        oRm.renderControl(oControl._getDateTimeText());
    };

    /**
     * Renders the name of the author of the notification.
     *
     * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
     */
    NotificationListItemRenderer.renderAuthorName = function (oRm, oControl) {
        oRm.renderControl(oControl._getAuthorName());
    };

    /**
     * Provides ARIA support for the additional control information information, such as, read status, due date, and priority.
     *
     * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
     * @param {sap.m.NotificationListItem} oControl An object representation of the Notification List Item that should be rendered
     */
    NotificationListItemRenderer.renderAriaText = function (oRm, oControl) {
        oRm.renderControl(oControl._ariaDetailsText);
    };

    //================================================================================
    // Footer rendering methods
    //================================================================================

    /**
     * Renders the footer content of the NotificationListItem.
     *
     * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
     */
    NotificationListItemRenderer.renderFooter = function (oRm, oControl) {
        var aButtons = oControl.getButtons();

        oRm.write('<div');
        oRm.addClass(classNameFooter);
        oRm.addClass(classNameBaseFooter);

        oRm.writeClasses();
        oRm.write('>');

        this.renderCollapseButton(oRm, oControl);

        if (aButtons && aButtons.length && oControl.getShowButtons()) {
            oRm.renderControl(oControl.getAggregation('_overflowToolbar'));
        }
        oRm.write('</div>');
    };

    /**
     * Renders the invisible item when the visible property is false.
     *
     * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
     */
    NotificationListItemRenderer.renderInvisibleItem = function (oRm, oControl) {
        oRm.write("<li");
        oRm.writeInvisiblePlaceholderData(oControl);
        oRm.write(">");
        oRm.write("</li>");
    };

    /**
     * Checks if the body width should be 100%
     * @param {sap.m.NotificationListItem} oControl The NotificationListItem to be checked
     * @returns {boolean} If all the buttons are hidden
     */
    function buttonsShouldBeRendered(oControl) {
        return oControl.getHideShowMoreButton() && (!oControl.getShowButtons() || !oControl.getButtons());
    }

    return NotificationListItemRenderer;
}, /* bExport= */ true);
