/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/f/gen/ui5/webcomponents_fiori/dist/SearchField",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/ShellBarSearch"
  ],
  function (SearchField) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * A `ui5-search` is an input with suggestions, used for user search.
     *
     * The `ui5-search` consists of several elements parts:
     * - Scope - displays a select in the beggining of the component, used for filtering results by their scope.
     * - Input field - for user input value
     * - Clear button - gives the possibility for deleting the entered value
     * - Search button - a primary button for performing search, when the user has entered a search term
     * - Suggestions - a list with available search suggestions
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-fiori/dist/Search.js";`
     *
     * @extends module:sap/f/gen/ui5/webcomponents_fiori/dist/SearchField
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/Search
     */

    const Search = SearchField.extend("sap.f.gen.ui5.webcomponents_fiori.dist.Search", {
      metadata: {
        tag: "ui5-search-29d33248",

        namespace: "sap.f.gen.ui5.webcomponents_fiori",

        library: "sap.f",

        designtime: "sap/f/gen/ui5/webcomponents_fiori/designtime/Search.designtime",

        interfaces: [],

        defaultAggregation: "items",

        properties: {
          /**
           * Defines the accessible ARIA description of the field.
           */
          accessibleDescription: { type: "string", mapping: "property" },
          /**
           * Defines the accessible ARIA name of the component.
           */
          accessibleName: { type: "string", mapping: "property" },
          /**
           * Indicates whether a loading indicator should be shown in the input field.
           */
          fieldLoading: {
            type: "boolean",
            mapping: "property",
            defaultValue: false
          },
          /**
           * Indicates whether a loading indicator should be shown in the popup.
           */
          loading: {
            type: "boolean",
            mapping: "property",
            defaultValue: false
          },
          /**
           * Defines whether the value will be autcompleted to match an item.
           */
          noTypeahead: {
            type: "boolean",
            mapping: "property",
            defaultValue: false
          },
          /**
           * Indicates whether the items picker is open.
           */
          open: { type: "boolean", mapping: "property", defaultValue: false },
          /**
           * Defines a short hint intended to aid the user with data entry when the
           * component has no value.
           *
           * **Note:** When `scopes` are defined and no custom placeholder is provided,
           * the placeholder automatically displays "Search in: \{selected scope name\}".
           * Setting a custom placeholder will override this automatic behavior.
           */
          placeholder: { type: "string", mapping: "property" },
          /**
           * Defines the value of the component:
           *
           * Applications are responsible for setting the correct scope value.
           *
           * **Note:** If the given value does not match any existing scopes,
           * no scope will be selected and the SearchField scope component will be displayed as empty.
           */
          scopeValue: { type: "string", mapping: "property", defaultValue: "" },
          /**
           * Defines whether the clear icon of the search will be shown.
           */
          showClearIcon: {
            type: "boolean",
            mapping: "property",
            defaultValue: false
          },
          /**
           * Defines the value of the component.
           *
           * **Note:** The property is updated upon typing.
           */
          value: { type: "string", mapping: "property", defaultValue: "" },
          /**
           * The text-content of the Web Component.
           */
          text: { type: "string", mapping: "textContent" },
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
           * Defines the popup footer action button.
           * @type module:sap/f/gen/ui5/webcomponents/dist/Button
           */
          action: {
            type: "sap.f.gen.ui5.webcomponents.dist.Button",
            multiple: true,
            slot: "action"
          },
          /**
           * Defines the Search suggestion items.
           * @type module:sap/ui/core/webc/WebComponent
           */
          items: { type: "sap.ui.core.webc.WebComponent", multiple: true },
          /**
           * Defines the filter button slot, used to display an additional filtering button.
           * This slot is intended for passing a `ui5-button` with a filter icon to provide extended filtering options.
           *
           * **Note:** Scope button and Filter button are mutually exclusive.
           * @type module:sap/f/gen/ui5/webcomponents/dist/Button
           */
          filterButton: {
            type: "sap.f.gen.ui5.webcomponents.dist.Button",
            multiple: true,
            slot: "filterButton"
          },
          /**
           * Defines the illustrated message to be shown in the popup.
           * @type module:sap/f/gen/ui5/webcomponents_fiori/dist/IllustratedMessage
           */
          illustration: {
            type: "sap.f.gen.ui5.webcomponents_fiori.dist.IllustratedMessage",
            multiple: true,
            slot: "illustration"
          },
          /**
           * Defines the illustrated message to be shown in the popup.
           * @type module:sap/f/gen/ui5/webcomponents_fiori/dist/SearchMessageArea
           */
          messageArea: {
            type: "sap.f.gen.ui5.webcomponents_fiori.dist.SearchMessageArea",
            multiple: true,
            slot: "messageArea"
          },
          /**
           * Defines the component scope options.
           * @type sap/f/gen/ui5/webcomponents_fiori/dist/SearchField
           */
          scopes: {
            type: "sap.f.gen.ui5.webcomponents_fiori.dist.SearchField.ISearchScope",
            multiple: true,
            slot: "scopes"
          }
        },

        associations: {},

        events: {
          /**
           * Fired when the popup is closed.
           */
          close: {
            parameters: {}
          },

          /**
           * Fired when typing in input or clear icon is pressed.
           */
          input: {
            enableEventBubbling: true,
            parameters: {}
          },

          /**
           * Fired when the popup is opened.
           */
          onOpen: {
            mapping: "open",
            parameters: {}
          },

          /**
           * Fired when the scope has changed.
           */
          scopeChange: {
            enableEventBubbling: true,
            parameters: {
              /**
               * The newly selected scope
               */
              scope: {
                type: "sap.ui.core.Control",
                types: [
                  {
                    origType: "HTMLElement",
                    multiple: false,
                    dedicatedTypes: [
                      {
                        dtsType: "Control",
                        packageName: "sap/ui/core/Control",
                        moduleType: "module:sap/ui/core/Control",
                        ui5Type: "sap.ui.core.Control",
                        isClass: true
                      }
                    ]
                  }
                ],
                dtsParamDescription: "The newly selected scope"
              }
            }
          },

          /**
           * Fired when the user has triggered search with Enter key or Search Button press.
           */
          search: {
            allowPreventDefault: true,
            enableEventBubbling: true,
            parameters: {}
          }
        },

        getters: [],

        methods: []
      }
    });

    return Search;
  }
);
