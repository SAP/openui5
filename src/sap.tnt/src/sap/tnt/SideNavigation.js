/*!
 * ${copyright}
 */

// Provides control sap.t.SideNavigation.
sap.ui.define(['./library', 'sap/ui/core/Control', 'sap/ui/core/ResizeHandler', './NavigationList'],
    function (library, Control, ResizeHandler) {
        'use strict';

        /**
         * Constructor for a new SideNavigation.
         *
         * @param {string} [sId] id for the new control, generated automatically if no id is given
         * @param {object} [mSettings] initial settings for the new control
         *
         * @class
         * The SideNavigation control builds the container for a layout with a fixed and a flexible part. The flexible container adapts its size to the fix container.
         *
         * In order for the SideNavigation to stretch properly, the parent element, in which the control is placed, needs to be "flex" based.
         * @extends sap.ui.core.Control
         *
         * @author SAP SE
         * @version ${version}
         *
         * @constructor
         * @public
         * @since 1.36
         * @alias sap.tnt.SideNavigation
         * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
         */
        var SideNavigation = Control.extend('sap.tnt.SideNavigation', /** @lends sap.t.SideNavigation.prototype */ {
            metadata: {
                library: 'sap.tnt',
                properties: {
                    /**
                     * Specifies if the control is expanded.
                     */
                    expanded: {type: 'boolean', group: 'Misc', defaultValue: true}
                },
                defaultAggregation: "item",
                aggregations: {
                    /**
                     * The content inside the flexible part.
                     */
                    item: {type: 'sap.tnt.NavigationList', multiple: false, bindable: "bindable"},
                    /**
                     * The content inside the fixed part.
                     */
                    fixedItem: {type: 'sap.tnt.NavigationList', multiple: false},
                    /**
                     * The content inside the footer.
                     */
                    footer: {type: 'sap.tnt.NavigationList', multiple: false}
                },
                events: {
                    /**
                     * Fires when an item is selected.
                     */
                    itemSelect: {
                        parameters: {
                            /**
                             * The selected item
                             */
                            item: {type: 'sap.ui.core.Item'}
                        }
                    }
                }
            }
        });

        SideNavigation.prototype.init = function () {
            // Define group for F6 handling
            this.data('sap-ui-fastnavgroup', 'true', true);
        };

        SideNavigation.prototype.setAggregation = function (aggregationName, object, suppressInvalidate) {
            if (object && object.attachItemSelect) {
                object.attachItemSelect(this._itemSelectionHandler.bind(this));
            }

            return sap.ui.base.ManagedObject.prototype.setAggregation.apply(this, arguments);
        };

        SideNavigation.prototype.setExpanded = function (isExpanded) {
            if (sap.ui.Device.media.getCurrentRange('StdExt').name === 'Phone') {
                isExpanded = true;
            }
            if (this.getExpanded() === isExpanded) {
                return this;
            }

            if (this.getAggregation('item')) {
                this.getAggregation('item').setExpanded(isExpanded);
            }

            if (this.getAggregation('fixedItem')) {
                this.getAggregation('fixedItem').setExpanded(isExpanded);
            }

            if (this.getDomRef()) {
                this.getDomRef().classList.toggle('sapMSideNavigationNotExpanded');
            }

            this.setProperty('expanded', isExpanded, true);

            return this;
        };

        /**
         * @private
         */
        SideNavigation.prototype.onBeforeRendering = function () {
            this._deregisterControl();
        };

        /**
         * @private
         */
        SideNavigation.prototype.onAfterRendering = function () {
            this._ResizeHandler = ResizeHandler.register(this.getDomRef(), this._changeScrolling.bind(this));
        };

        /**
         * @private
         */
        SideNavigation.prototype.exit = function () {
            this._deregisterControl();
        };

        /**
         * @private
         */
        SideNavigation.prototype._changeScrolling = function () {
            var minSideNavigationHeight = 256;
            var sideNavigation = document.getElementById(this.getId());
            var sideNavigationFlexibleContainer = sideNavigation.querySelector('#' + this.getId() + '-Flexible');

            if (sideNavigation.offsetHeight <= minSideNavigationHeight && sideNavigation.classList.contains('sapMSideNavigationVerticalScrolling')) {
                return;
            }

            if (sideNavigation.offsetHeight > minSideNavigationHeight && sideNavigationFlexibleContainer.classList.contains('sapMSideNavigationVerticalScrolling')) {
                return;
            }

            sideNavigation.classList.toggle('sapMSideNavigationVerticalScrolling');
            sideNavigationFlexibleContainer.classList.toggle('sapMSideNavigationVerticalScrolling');
        };

        /**
         *
         * @param event
         * @private
         */
        SideNavigation.prototype._itemSelectionHandler = function (event) {
            var listId = event.getSource().getId();
            var itemAggregation = this.getAggregation('item');
            var fixedItemAggregation = this.getAggregation('fixedItem');

            if (itemAggregation && listId === itemAggregation.getId()) {
                fixedItemAggregation.setSelectedItem(null);
            }

            if (fixedItemAggregation && listId === fixedItemAggregation.getId()) {
                itemAggregation.setSelectedItem(null);
            }

            this.fireItemSelect({
                item: event.getParameter('item')
            });
        };

        /**
         * @private
         */
        SideNavigation.prototype._deregisterControl = function () {
            if (this._ResizeHandler) {
                ResizeHandler.deregister(this._ResizeHandler);
                this._ResizeHandler = null;
            }
        };

        /**
         * @private
         * @param {Object} event
         */
        SideNavigation.prototype.ontouchmove = function (event) {
            // mark the event for components that needs to know if the event was handled
            event.setMarked();
        };

        return SideNavigation;

    }, /* bExport= */ true
);
