/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsView",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/UserSettingsNotificationsView"
  ],
  function (UserSettingsView) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-user-settings-notifications-view` represents a view displayed in the
     * `ui5-user-settings-item` that lists notification preferences. Individual settings
     * are represented by `ui5-user-settings-notifications-view-item` elements, optionally
     * grouped by `ui5-user-settings-notifications-view-group`.
     *
     * When a navigable item is clicked, the view drills into a sibling secondary view of
     * its parent `ui5-user-settings-item`. When an item's `item-key` matches a target
     * view's `id`, that view is opened and keeps its own `text`. Otherwise the first
     * sibling marked as `secondary` is opened and its `text` is set to the clicked
     * item's `text` so the drill-in header reflects the origin.
     *
     * Apps can override this behavior by preventing the `item-click` event.
     *
     * Applications should listen to the item's `switch-change` event (which bubbles) to
     * be notified when a switch is toggled.
     *
     * Additional content (e.g. an information message strip) can be placed via the
     * `additionalContent` slot, which is rendered above the list.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents-fiori/dist/UserSettingsNotificationsView.js";`
     *
     * @extends module:sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsView
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsNotificationsView
     */

    const UserSettingsNotificationsView = UserSettingsView.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsNotificationsView",
      {
        metadata: {
          tag: "ui5-user-settings-notifications-view-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/UserSettingsNotificationsView.designtime",

          interfaces: [],

          defaultAggregation: "items",

          properties: {
            /**
             * Indicates whether the view is secondary. It is relevant only if the view is used in `pages` slot of `ui5-user-settings-item`
             * and controls the visibility of the back button.
             */
            secondary: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines whether the view is selected. There can be just one selected view at a time.
             */
            selected: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines the title text of the user settings view.
             */
            text: { type: "string", mapping: "property" },
            /**
             * The 'width' of the Web Component in <code>sap.ui.core.CSSSize</code>.
             */
            width: { type: "sap.ui.core.CSSSize", mapping: "style" },
            /**
             * The 'height' of the Web Component in <code>sap.ui.core.CSSSize</code>.
             */
            height: { type: "sap.ui.core.CSSSize", mapping: "style" }
          },

          aggregations: {
            /**
             * Defines additional content displayed above the items list.
             * @type module:sap/ui/core/Control
             */
            additionalContent: {
              type: "sap.ui.core.Control",
              multiple: true,
              slot: "additionalContent"
            },
            /**
             * Defines the items of the component. Can be a mix of
             * `ui5-user-settings-notifications-view-item` and
             * `ui5-user-settings-notifications-view-group` elements.
             * @type module:sap/ui/core/webc/WebComponent
             */
            items: { type: "sap.ui.core.webc.WebComponent", multiple: true },
            /**
             * Defines header items rendered above the grouped items list.
             * Each item is wrapped in a `role="form"` landmark — a separate Tab stop.
             * Use this slot for product-level toggles (e.g. "Allow Notifications") that appear
             * above the notification-type groups.
             * @type module:sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsNotificationsViewItem
             */
            headerItems: {
              type: "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsNotificationsViewItem",
              multiple: true,
              slot: "headerItems"
            }
          },

          associations: {},

          events: {
            /**
             * Fired when a navigable item in the list is clicked.
             *
             * The event is cancelable: preventing it skips the built-in drill-in to the
             * parent's secondary view, allowing the application to take over.
             */
            itemClick: {
              allowPreventDefault: true,
              parameters: {
                /**
                 * The clicked notifications view item.
                 */
                item: {
                  type: "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsNotificationsViewItem",
                  types: [
                    {
                      origType: "UserSettingsNotificationsViewItem",
                      multiple: false,
                      dedicatedTypes: [
                        {
                          dtsType: "UserSettingsNotificationsViewItem",
                          ui5Type:
                            "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsNotificationsViewItem",
                          moduleType:
                            "module:ui5/webcomponents_fiori/dist/UserSettingsNotificationsViewItem",
                          packageName:
                            "sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsNotificationsViewItem",
                          isClass: true
                        }
                      ]
                    }
                  ],
                  dtsParamDescription: "The clicked notifications view item."
                }
              }
            }
          },

          getters: [],

          methods: []
        }
      }
    );

    return UserSettingsNotificationsView;
  }
);
