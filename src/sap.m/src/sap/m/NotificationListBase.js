/*!
 * ${copyright}
 */

sap.ui.define(['./library', 'sap/ui/core/Control', './ListItemBase', './Text',
        './Image', './OverflowToolbar', 'sap/ui/core/Icon', 'sap/ui/core/library', 'sap/ui/core/Element'],
    function (library, Control, ListItemBase, Text, Image, OverflowToolbar, Icon, coreLibrary, Element) {
        'use strict';

        // shortcut for sap.ui.core.Priority
        var Priority = coreLibrary.Priority;

        /**
         * Constructor for a new NotificationListBase.
         *
         * @param {string} [sId] ID for the new control, generated automatically if no ID is given
         * @param {object} [mSettings] Initial settings for the new control
         *
         * @class
         * The NotificationListBase is the abstract base class for {@link sap.m.NotificationListItem} and {@link sap.m.NotificationListGroup}.
         *
         * The NotificationList controls are designed for the SAP Fiori notification center.
         * <h4>Overview</h4>
         * NotificationListBase defines the general structure of a notification item. Most of the behavioral logic is defined for the single items or groups.
         * <h4>Structure</h4>
         * The base holds properties for the following elements:
         * <ul>
         * <li>Author name</li>
         * <li>Author picture</li>
         * <li>Time stamp</li>
         * <li>Priority</li>
         * <li>Title</li>
         * </ul>
         * Additionally, by setting these properties you can determine if buttons are shown:
         * <ul>
         * <li><code>showButtons</code> - action buttons visibility</li>
         * <li><code>showCloseButton</code> - close button visibility</li>
         * </ul>
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
                        defaultValue: Priority.None
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
                    _overflowToolbar: {type: 'sap.m.OverflowToolbar', multiple: false, visibility: "hidden"},

                    /**
                     * The close button of the notification item/group.
                     * @private
                     */
                    _closeButton: {type: 'sap.m.Button', multiple: false, visibility: "hidden"},

                    /**
                     * The collapse button of the notification item/group.
                     * @private
                     */
                    _collapseButton: {type: 'sap.m.Button', multiple: false, visibility: "hidden"}
                },
                events: {
                    /**
                     * Fired when the close button of the notification is pressed.<br><b>Note:</b> Pressing the close button doesn't destroy the notification automatically.
                     */
                    close: {}

                    // 'tap' and 'press' events are inherited from ListItemBase.
                }
            }
        });

        /**
         * Sets initial values of the control.
         *
         * @protected
         */
        NotificationListBase.prototype.init = function () {
            this.setAggregation('_overflowToolbar', new OverflowToolbar());
        };

        //================================================================================
        // Overwritten setters and getters
        //================================================================================

        /**
         * Overwrites the setter of the title property.
         *
         * @public
         * @param {string} title Title.
         * @returns {sap.m.NotificationListBase} NotificationListBase reference for chaining.
         */
        NotificationListBase.prototype.setTitle = function (title) {
            var result = this.setProperty('title', title);

            this._getHeaderTitle().setText(title);

            return result;
        };

        /**
         * Overwrites the setter for the datetime property.
         *
         * @public
         * @param {string} dateTime The datetime in string format.
         * @returns {string} The set datetime value.
         */
        NotificationListBase.prototype.setDatetime = function (dateTime) {
            var result = this.setProperty('datetime', dateTime);

            this._getDateTimeText().setText(dateTime);

            return result;
        };

        /**
         * Overwrites the authorName property.
         *
         * @public
         * @param {string} authorName The author name in string format.
         * @returns {string} The set author name.
         */
        NotificationListBase.prototype.setAuthorName = function(authorName) {
            var result = this.setProperty('authorName', authorName);

            this._getAuthorName().setText(authorName);

            return result;
        };

        //================================================================================
        // Control methods
        //================================================================================

        /**
         * Clones the NotificationListBase.
         *
         * @public
         * @returns {sap.m.NotificationListBase} The cloned NotificationListBase.
         */
        NotificationListBase.prototype.clone = function () {
            var clonedObject = Control.prototype.clone.apply(this, arguments);

            // "_overflowToolbar" aggregation is hidden and it is not cloned by default
            var overflowToolbar = this.getAggregation('_overflowToolbar');
            clonedObject.setAggregation("_overflowToolbar", overflowToolbar.clone(), true);

            return clonedObject;
        };

        /**
         * Closes the NotificationListBase.
         *
         * @public
         */
        NotificationListBase.prototype.close = function () {
            var parent = this.getParent();
            this.fireClose();

            if (parent && parent instanceof Element) {
                var delegate = {
                    onAfterRendering: function() {
                        parent.focus();
                        parent.removeEventDelegate(delegate);
                    }
                };
                parent.addEventDelegate(delegate);
            }
        };

        //================================================================================
        // Delegation aggregation methods to the Overflow Toolbar
        //================================================================================

        NotificationListBase.getMetadata().forwardAggregation(
            "buttons",
            {
                getter: function() {
                    return this.getAggregation('_overflowToolbar');
                },
                aggregation: "content",
                forwardBinding: true
            }
        );

        //================================================================================
        // Private and protected getters and setters
        //================================================================================

        /**
         * Returns the sap.m.Text control used in the NotificationListBase's header title.
         *
         * @protected
         * @returns {sap.m.Text} The title control inside the NotificationListBase control.
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
         *
         * @protected
         * @returns {sap.m.Text} The datetime control inside the NotificationListBase control.
         */
        NotificationListBase.prototype._getDateTimeText = function () {
            /** @type {sap.m.Text} */
            var dateTime = this.getAggregation('_dateTime');

            if (!dateTime) {
                dateTime = new Text({
                    id: this.getId() + '-datetime',
                    text: this.getDatetime()
                }).addStyleClass('sapMNLI-Datetime');

                this.setAggregation('_dateTime', dateTime, true);
            }

            return dateTime;
        };

        /**
         * Returns the sap.m.Text control used in the NotificationListBase's author name.
         *
         * @protected
         * @returns {sap.m.Text} The notification author name text.
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
         *
         * @protected
         * @returns {sap.m.Image|sap.ui.core.Control} The notification author picture text.
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
         *
         * @protected
         * @returns {sap.m.OverflowToolbar} The footer toolbar.
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
         * Checks if an sap.ui.core.URI parameter is an icon src or not.
         *
         * @protected
         * @param {string} source The source to be checked.
         * @returns {boolean} The result of the check.
         */
        function isIcon(source) {
            if (!source) {
                return false;
            }

            var result = window.URI.parse(source);
            return (result.protocol && result.protocol == 'sap-icon');
        }

        return NotificationListBase;
    });
