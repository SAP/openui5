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
         * @name sap.m.NotificationListBase.init
         * @method
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
         * @overwrites
         * @name sap.m.NotificationListBase.setTitle
         * @method
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
         * @overwrites
         * @name sap.m.NotificationListBase.setDatetime
         * @method
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
         * @name sap.m.NotificationListBase.setAuthorName
         * @method
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
         * @name sap.m.NotificationListBase.clone
         * @method
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
         * @name sap.m.NotificationListBase.close
         * @method
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

        /**
         * Binds aggregation.
         *
         * @name sap.m.NotificationListBase.bindAggregation
         * @method
         * @public
         * @param {string} aggregationName The name of the aggregation.
         * @param {object} bindingInfo The binding information for the aggregation.
         */
        NotificationListBase.prototype.bindAggregation = function (aggregationName, bindingInfo) {
            if (aggregationName == 'buttons') {
                this.getAggregation('_overflowToolbar').bindAggregation('content', bindingInfo);
                return this;
            } else {
                return Control.prototype.bindAggregation.call(this, aggregationName, bindingInfo);
            }
        };

        /**
         * Validates aggregation.
         *
         * @name sap.m.NotificationListBase.validateAggregation
         * @method
         * @public
         * @param {string} aggregationName The name of the aggregation.
         * @param {object} object The object from which the aggregation will be validated.
         * @param {boolean} multiple Indicator for multiple aggregation validation.
         */
        NotificationListBase.prototype.validateAggregation = function (aggregationName, object, multiple) {
            if (aggregationName == 'buttons') {
                this.getAggregation('_overflowToolbar').validateAggregation('content', object, multiple);
                return this;
            } else {
                return Control.prototype.validateAggregation.call(this, aggregationName, object, multiple);
            }
        };

        /**
         * Sets aggregation.
         *
         * @name sap.m.NotificationListBase.setAggregation
         * @method
         * @public
         * @param {string} aggregationName The name of the aggregation.
         * @param {object} object Object.
         * @param {boolean} suppressInvalidate Indicator for suppressing invalidation.
         */
        NotificationListBase.prototype.setAggregation = function (aggregationName, object, suppressInvalidate) {
            if (aggregationName == 'buttons') {
                this.getAggregation('_overflowToolbar').setAggregation('content', object, suppressInvalidate);
                return this;
            } else {
                return Control.prototype.setAggregation.call(this, aggregationName, object, suppressInvalidate);
            }
        };

        /**
         * Gets aggregation.
         *
         * @name sap.m.NotificationListBase.getAggregation
         * @method
         * @public
         * @param {string} aggregationName The name of the aggregation.
         * @param {object} defaultObjectToBeCreated Default objects to be created.
         * @returns {Array|sap.m.NotificationListBase|null} Either the aggregation array in case of 0 through n-aggregations or in case of 0 to 1-aggregations <code>this</code> pointer or null.
         */
        NotificationListBase.prototype.getAggregation = function (aggregationName, defaultObjectToBeCreated) {
            if (aggregationName == 'buttons') {
                var toolbar = this.getAggregation('_overflowToolbar');

                return toolbar.getContent().filter(function (item) {
                    return item instanceof sap.m.Button;
                });
            } else {
                return Control.prototype.getAggregation.call(this, aggregationName, defaultObjectToBeCreated);
            }
        };

        /**
         * Gets index of an aggregation.
         *
         * @name sap.m.NotificationListBase.indexOfAggregation
         * @method
         * @public
         * @param {string} aggregationName The name of the aggregation.
         * @param {object} object The object with the aggregation.
         */
        NotificationListBase.prototype.indexOfAggregation = function (aggregationName, object) {
            if (aggregationName == 'buttons') {
                return this.getAggregation('_overflowToolbar').indexOfAggregation('content', object);
            } else {
                return Control.prototype.indexOfAggregation.call(this, aggregationName, object);
            }
        };

        /**
         * Inserts aggregation.
         *
         * @name sap.m.NotificationListBase.insertAggregation
         * @method
         * @public
         * @param {string} aggregationName The name of the aggregation.
         * @param {object} object The object with the aggregation.
         * @param {int} index The index of the aggregation.
         * @param {boolean} suppressInvalidate Indicator for suppressing invalidation.
         * @returns {sap.m.NotificationListBase} <code>this</code> NotificationListBase reference for chaining.
         */
        NotificationListBase.prototype.insertAggregation = function (aggregationName, object, index, suppressInvalidate) {
            if (aggregationName == 'buttons') {
                this.getAggregation('_overflowToolbar').insertAggregation('content', object, index, suppressInvalidate);
                return this;
            } else {
                return Control.prototype.insertAggregation.call(this, object, index, suppressInvalidate);
            }
        };

        /**
         * Adds aggregation.
         *
         * @name sap.m.NotificationListBase.addAggregation
         * @method
         * @public
         * @param {string} aggregationName The name of the aggregation.
         * @param {object} object The object containing the aggregation.
         * @param {boolean} suppressInvalidate Indicator for suppressing invalidation.
         * @returns {sap.m.NotificationListBase} <code>this</code> NotificationListBase reference for chaining.
         */
        NotificationListBase.prototype.addAggregation = function (aggregationName, object, suppressInvalidate) {
            if (aggregationName == 'buttons') {
                var toolbar = this.getAggregation('_overflowToolbar');

                return toolbar.addAggregation('content', object, suppressInvalidate);
            } else {
                return Control.prototype.addAggregation.call(this, aggregationName, object, suppressInvalidate);
            }
        };

        /**
         * Removes aggregation.
         *
         * @name sap.m.NotificationListBase.removeAggregation
         * @method
         * @public
         * @param {string} aggregationName The name of the aggregation.
         * @param {object} object The object containing the aggregation.
         * @param {boolean} suppressInvalidate Indicator for suppressing invalidation.
         * @returns {any} The removed aggregation.
         */
        NotificationListBase.prototype.removeAggregation = function (aggregationName, object, suppressInvalidate) {
            if (aggregationName == 'buttons') {
                return this.getAggregation('_overflowToolbar').removeAggregation('content', object, suppressInvalidate);
            } else {
                return Control.prototype.removeAggregation.call(this, aggregationName, object, suppressInvalidate);
            }
        };

        /**
         * Removes all aggregations.
         *
         * @name sap.m.NotificationListBase.removeAllAggregation
         * @method
         * @public
         * @param {string} aggregationName The name of the aggregation.
         * @param {boolean} suppressInvalidate Indicator for suppressing invalidation.
         * @returns {any} The removed aggregations.
         */
        NotificationListBase.prototype.removeAllAggregation = function (aggregationName, suppressInvalidate) {
            if (aggregationName == 'buttons') {
                return this.getAggregation('_overflowToolbar').removeAllAggregation('content', suppressInvalidate);
            } else {
                return Control.prototype.removeAllAggregation.call(this, aggregationName, suppressInvalidate);
            }
        };

        /**
         * Destroys aggregation.
         *
         * @name sap.m.NotificationListBase.destroyAggregation
         * @method
         * @public
         * @param {string} aggregationName The name of the aggregation.
         * @param {boolean} suppressInvalidate Indicator for suppressing invalidation.
         * @returns {sap.m.NotificationListBase} <code>this</code> NotificationListBase reference for chaining.
         */
        NotificationListBase.prototype.destroyAggregation = function (aggregationName, suppressInvalidate) {
            if (aggregationName == 'buttons') {
                return this.getAggregation('_overflowToolbar').destroyAggregation('content', suppressInvalidate);
            } else {
                return Control.prototype.destroyAggregation.call(this, aggregationName, suppressInvalidate);
            }
        };

        /**
         * Gets binding.
         *
         * @name sap.m.NotificationListBase.getBinding
         * @method
         * @public
         * @param {string} aggregationName The name of the aggregation.
         * @returns {any} The binding.
         */
        NotificationListBase.prototype.getBinding = function (aggregationName) {
            if (aggregationName == 'buttons') {
                return this.getAggregation('_overflowToolbar').getBinding('content');
            } else {
                return Control.prototype.getBinding.call(this, aggregationName);
            }
        };

        /**
         * Gets binding information.
         *
         * @name sap.m.NotificationListBase.getBindingInfo
         * @method
         * @public
         * @param {string} aggregationName The name of the aggregation.
         * @returns {any} The binding information.
         */
        NotificationListBase.prototype.getBindingInfo = function (aggregationName) {
            if (aggregationName == 'buttons') {
                return this.getAggregation('_overflowToolbar').getBindingInfo('content');
            } else {
                return Control.prototype.getBindingInfo.call(this, aggregationName);
            }
        };

        /**
         * Gets the binding path.
         *
         * @name sap.m.NotificationListBase.getBindingPath
         * @method
         * @public
         * @param {string} aggregationName The name of the aggregation.
         * @returns {any} The binding path.
         */
        NotificationListBase.prototype.getBindingPath = function (aggregationName) {
            if (aggregationName == 'buttons') {
                return this.getAggregation('_overflowToolbar').getBindingPath('content');
            } else {
                return Control.prototype.getBindingPath.call(this, aggregationName);
            }
        };

        //================================================================================
        // Private and protected getters and setters
        //================================================================================

        /**
         * Returns the sap.m.Text control used in the NotificationListBase's header title.
         *
         * @name sap.m.NotificationListBase._getHeaderTitle
         * @method
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
         * @name sap.m.NotificationListBase._getDateTimeText
         * @method
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
         * @name sap.m.NotificationListBase._getAuthorName
         * @method
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
         * @name sap.m.NotificationListBase._getAuthorImage
         * @method
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
         * @name sap.m.NotificationListBase._getToolbar
         * @method
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
         * @name isIcon
         * @function
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
