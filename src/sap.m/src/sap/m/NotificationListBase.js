/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', './ListItemBase', './Text',
        './Image', './OverflowToolbar', 'sap/ui/core/Icon'],
    function (jQuery, library, Control, ListItemBase, Text, Image, OverflowToolbar, Icon) {

        'use strict';

        /**
         * Constructor for a new NotificationListBase.
         *
         * @param {string} [sId] ID for the new control, generated automatically if no ID is given
         * @param {object} [mSettings] Initial settings for the new control
         *
         * @class
         * The NotificationListBase is the base class for NotificationListItem and NotificationListGroup.
         * @extends sap.m.ListItemBase
         *
         * @author SAP SE
         * @version ${version}
         *
         * @constructor
         * @public
         * @since 1.38
         * @alias sap.m.NotificationListBase
         * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
         */
        var NotificationListBase = ListItemBase.extend('sap.m.NotificationListBase', /** @lends sap.m.NotificationListBase.prototype */ {
            metadata: {
                library: 'sap.m',
                properties: {
                    // unread is inherit from the ListItemBase.

                    /**
                     * Determines the priority of the Notification.
                     */
                    priority: {
                        type: 'sap.ui.core.Priority',
                        group: 'Appearance',
                        defaultValue: sap.ui.core.Priority.None
                    },

                    /**
                     * Determines the title of the NotificationListBase item.
                     */
                    title: {type: 'string', group: 'Appearance', defaultValue: ''},

                    /**
                     * Determines the due date of the NotificationListItem.
                     */
                    datetime: {type: 'string', group: 'Appearance', defaultValue: ''},

                    /**
                     * Determines the action buttons visibility.
                     */
                    showButtons: {type: 'boolean', group: 'Behavior', defaultValue: true},

                    /**
                     * Determines the visibility of the close button.
                     */
                    showCloseButton: {type: 'boolean', group: 'Behavior', defaultValue: true},

                    /**
                     * Determines the notification group's author name.
                     */
                    authorName: {type: 'string', group: 'Appearance', defaultValue: ''},

                    /**
                     * Determines the URL of the notification group's author picture.
                     */
                    authorPicture: {type: 'sap.ui.core.URI',  multiple: false}

                },
                aggregations: {
                    /**
                     * Action buttons.
                     */
                    buttons: {type: 'sap.m.Button', multiple: true},

                    /**
                     * The title control that holds the datetime text of the NotificationListBase item.
                     * @private
                     */
                    _headerTitle: {type: 'sap.m.Text', multiple: false, visibility: "hidden"},

                    /**
                     * The timestamp string that will be displayed in the NotificationListBase item.
                     */
                    _dateTime: {type: 'sap.m.Text', multiple: false, visibility: 'hidden'},

                    /**
                     * The sap.m.Text that holds the author name.
                     * @private
                     */
                    _authorName: {type: 'sap.m.Text', multiple: false, visibility: "hidden"},

                    /**
                     * The sap.m.Image or sap.ui.core.Control control that holds the author image or icon.
                     * @private
                     */
                    _authorImage: {type: 'sap.ui.core.Control', multiple: false, visibility: "hidden"},

                    /**
                     * The OverflowToolbar control that holds the footer buttons.
                     * @private
                     */
                    _overflowToolbar: {type: 'sap.m.OverflowToolbar', multiple: false, visibility: "hidden"}
                },
                events: {
                    /**
                     * Fired when the notification is closed.
                     */
                    close: {}

                    // 'tap' and 'press' events are inherited from ListItemBase.
                }
            }
        });

        NotificationListBase.prototype.init = function () {
            this.setAggregation('_overflowToolbar', new OverflowToolbar());
        };

        //================================================================================
        // Overwritten setters and getters
        //================================================================================

        NotificationListBase.prototype.setTitle = function (title) {
            var result = this.setProperty('title', title, true);

            this._getHeaderTitle().setText(title);

            return result;
        };

        NotificationListBase.prototype.setDatetime = function (dateTime) {
            var result = this.setProperty('datetime', dateTime, true);

            this._getDateTimeText().setText(dateTime);

            return result;
        };

        NotificationListBase.prototype.setAuthorName = function(authorName) {
            var result = this.setProperty('authorName', authorName, true);

            this._getAuthorName().setText(authorName);

            return result;
        };

        //================================================================================
        // Control methods
        //================================================================================

        NotificationListBase.prototype.clone = function () {
            var clonedObject = Control.prototype.clone.apply(this, arguments);

            // "_overflowToolbar" aggregation is hidden and it is not cloned by default
            var overflowToolbar = this.getAggregation('_overflowToolbar');
            clonedObject.setAggregation("_overflowToolbar", overflowToolbar.clone(), true);

            return clonedObject;
        };

        NotificationListBase.prototype.close = function () {
            var parent = this.getParent();
            this.fireClose();

            if (parent && parent instanceof sap.ui.core.Element) {
                parent.focus();
            }

            this.destroy();
        };

        //================================================================================
        // Delegation aggregation methods to the Overflow Toolbar
        //================================================================================

        NotificationListBase.prototype.bindAggregation = function (aggregationName, bindingInfo) {
            if (aggregationName == 'buttons') {
                this.getAggregation('_overflowToolbar').bindAggregation('content', bindingInfo);
                return this;
            } else {
                return sap.ui.core.Control.prototype.bindAggregation.call(this, aggregationName, bindingInfo);
            }
        };

        NotificationListBase.prototype.validateAggregation = function (aggregationName, object, multiple) {
            if (aggregationName == 'buttons') {
                this.getAggregation('_overflowToolbar').validateAggregation('content', object, multiple);
                return this;
            } else {
                return sap.ui.core.Control.prototype.validateAggregation.call(this, aggregationName, object, multiple);
            }
        };

        NotificationListBase.prototype.setAggregation = function (aggregationName, object, suppressInvalidate) {
            if (aggregationName == 'buttons') {
                this.getAggregation('_overflowToolbar').setAggregation('content', object, suppressInvalidate);
                return this;
            } else {
                return sap.ui.core.Control.prototype.setAggregation.call(this, aggregationName, object, suppressInvalidate);
            }
        };

        NotificationListBase.prototype.getAggregation = function (aggregationName, defaultObjectToBeCreated) {
            if (aggregationName == 'buttons') {
                var toolbar = this.getAggregation('_overflowToolbar');

                return toolbar.getContent().filter(function (item) {
                    return item instanceof sap.m.Button;
                });
            } else {
                return sap.ui.core.Control.prototype.getAggregation.call(this, aggregationName, defaultObjectToBeCreated);
            }
        };

        NotificationListBase.prototype.indexOfAggregation = function (aggregationName, object) {
            if (aggregationName == 'buttons') {
                this.getAggregation('_overflowToolbar').indexOfAggregation('content', object);
                return this;
            } else {
                return sap.ui.core.Control.prototype.indexOfAggregation.call(this, aggregationName, object);
            }
        };

        NotificationListBase.prototype.insertAggregation = function (aggregationName, object, index, suppressInvalidate) {
            if (aggregationName == 'buttons') {
                this.getAggregation('_overflowToolbar').insertAggregation('content', object, index, suppressInvalidate);
                return this;
            } else {
                return sap.ui.core.Control.prototype.insertAggregation.call(this, object, index, suppressInvalidate);
            }
        };

        NotificationListBase.prototype.addAggregation = function (aggregationName, object, suppressInvalidate) {
            if (aggregationName == 'buttons') {
                var toolbar = this.getAggregation('_overflowToolbar');

                return toolbar.addAggregation('content', object, suppressInvalidate);
            } else {
                return sap.ui.core.Control.prototype.addAggregation.call(this, aggregationName, object, suppressInvalidate);
            }
        };

        NotificationListBase.prototype.removeAggregation = function (aggregationName, object, suppressInvalidate) {
            if (aggregationName == 'buttons') {
                return this.getAggregation('_overflowToolbar').removeAggregation('content', object, suppressInvalidate);
            } else {
                return sap.ui.core.Control.prototype.removeAggregation.call(this, aggregationName, object, suppressInvalidate);
            }
        };

        NotificationListBase.prototype.removeAllAggregation = function (aggregationName, suppressInvalidate) {
            if (aggregationName == 'buttons') {
                return this.getAggregation('_overflowToolbar').removeAllAggregation('content', suppressInvalidate);
            } else {
                return sap.ui.core.Control.prototype.removeAllAggregation.call(this, aggregationName, suppressInvalidate);
            }
        };

        NotificationListBase.prototype.destroyAggregation = function (aggregationName, suppressInvalidate) {
            if (aggregationName == 'buttons') {
                return this.getAggregation('_overflowToolbar').destroyAggregation('content', suppressInvalidate);
            } else {
                return sap.ui.core.Control.prototype.destroyAggregation.call(this, aggregationName, suppressInvalidate);
            }
        };

        NotificationListBase.prototype.getBinding = function (aggregationName) {
            if (aggregationName == 'buttons') {
                return this.getAggregation('_overflowToolbar').getBinding('content');
            } else {
                return sap.ui.core.Control.prototype.getBinding.call(this, aggregationName);
            }
        };

        NotificationListBase.prototype.getBindingInfo = function (aggregationName) {
            if (aggregationName == 'buttons') {
                return this.getAggregation('_overflowToolbar').getBindingInfo('content');
            } else {
                return sap.ui.core.Control.prototype.getBindingInfo.call(this, aggregationName);
            }
        };

        NotificationListBase.prototype.getBindingPath = function (aggregationName) {
            if (aggregationName == 'buttons') {
                return this.getAggregation('_overflowToolbar').getBindingPath('content');
            } else {
                return sap.ui.core.Control.prototype.getBindingPath.call(this, aggregationName);
            }
        };

        //================================================================================
        // Private and protected getters and setters
        //================================================================================

        /**
         * Returns the sap.m.Text control used in the NotificationListBase's header title.
         * @returns {sap.m.Text} The title control inside the Notification List Base control
         * @protected
         */
        NotificationListBase.prototype._getHeaderTitle = function () {
            var title = this.getAggregation("_headerTitle");

            if (!title) {
                title = new Text({
                    id: this.getId() + '-title',
                    text: this.getTitle(),
                    maxLines: 2
                });

                this.setAggregation("_headerTitle", title, true);
            }

            return title;
        };

        /**
         * Returns the sap.m.Text control used in the NotificationListBase's header title.
         * @returns {sap.m.Text} The datetime control inside the Notification List Base control
         * @protected
         */
        NotificationListBase.prototype._getDateTimeText = function () {
            /** @type {sap.m.Text} */
            var dateTime = this.getAggregation('_dateTime');

            if (!dateTime) {
                dateTime = new sap.m.Text({
                    id: this.getId() + '-datetime',
                    text: this.getDatetime()
                }).addStyleClass('sapMNLI-Datetime');

                this.setAggregation('_dateTime', dateTime, true);
            }

            return dateTime;
        };

        /**
         * Returns the sap.m.Text control used in the NotificationListBase's author name.
         * @returns {sap.m.Text} The notification author name text
         * @protected
         */
        NotificationListBase.prototype._getAuthorName = function() {
            /** @type {sap.m.Text} */
            var authorName = this.getAggregation('_authorName');

            if (!authorName) {
                authorName = new Text({
                    text: this.getAuthorName()
                }).addStyleClass('sapMNLI-Text');

                this.setAggregation('_authorName', authorName, true);
            }

            return authorName;
        };

        /**
         * Returns the sap.m.Image or the sap.ui.core.Control used in the NotificationListBase's author picture.
         * @returns {sap.m.Image|sap.ui.core.Control} The notification author picture text
         * @protected
         */
        NotificationListBase.prototype._getAuthorImage = function() {
            /** @type {sap.m.Image|sap.ui.core.Control} */
            var authorImage = this.getAggregation('_authorImage');

            if (!authorImage) {
                var authorPicture = this.getAuthorPicture();
                var authorName = this.getAuthorName();

                if (isIcon(authorPicture)) {
                    authorImage = new Icon({
                        src: authorPicture,
                        alt: authorName
                    });
                } else {
                    authorImage = new Image({
                        src: authorPicture,
                        alt: authorName
                    });
                }

                this.setAggregation('_authorImage', authorImage, true);
            }

            return authorImage;
        };

        /**
         * Returns the sap.m.OverflowToolbar control used in the NotificationListBase.
         * @returns {sap.m.OverflowToolbar} The footer toolbar
         * @protected
         */
        NotificationListBase.prototype._getToolbar = function () {
            var toolbar = this.getAggregation("_overflowToolbar");

            if (!toolbar) {
                toolbar = new OverflowToolbar();

                this.setAggregation("_overflowToolbar", toolbar, true);
            }

            return toolbar;
        };

        //================================================================================
        // Helper methods
        //================================================================================

        /**
         * Checks is a sap.ui.core.URI parameter is a icon src or not.
         * @param {string} source The source to be checked.
         * @returns {boolean} The result of the check
         * @protected
         */
        function isIcon(source) {
            if (!source) {
                return false;
            }

            var result = window.URI.parse(source);
            return (result.protocol && result.protocol == 'sap-icon');
        }

        return NotificationListBase;
    }, /* bExport= */ true);
