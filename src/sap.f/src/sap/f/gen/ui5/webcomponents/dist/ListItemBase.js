/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/f/gen/ui5/webcomponents",
    "sap/f/thirdparty/SearchItem"
  ],
  function (WebComponent) {
    "use strict";

    /**
     * @class
     * A class to serve as a foundation
     * for the `ListItem` and `ListItemGroupHeader` classes.
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents/dist/ListItemBase
     */

    const ListItemBase = WebComponent.extend(
      "sap.f.gen.ui5.webcomponents.dist.ListItemBase",
      {
        metadata: {
          tag: "",

          namespace: "sap.f.gen.ui5.webcomponents",

          library: "sap.f",

          designtime: "sap/f/gen/ui5/webcomponents/designtime/ListItemBase.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * The text-content of the Web Component.
             */
            text: { type: "string", mapping: "textContent" }
          },

          aggregations: {},

          associations: {},

          events: {
            /**
             * Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.
             *
             * **Note:** The event will not be fired if the `disabled` property is set to `true`.
             */
            click: {
              enableEventBubbling: true,
              parameters: {
                /**
                 * The original event from the user interaction.
                 */
                originalEvent: {
                  type: "object",
                  types: [
                    {
                      origType: "Event",
                      multiple: false,
                      dedicatedTypes: [{ dtsType: "Event", ui5Type: "object" }]
                    }
                  ],
                  dtsParamDescription:
                    "The original event from the user interaction."
                }
              }
            }
          },

          getters: [],

          methods: []
        }
      }
    );

    return ListItemBase;
  }
);
