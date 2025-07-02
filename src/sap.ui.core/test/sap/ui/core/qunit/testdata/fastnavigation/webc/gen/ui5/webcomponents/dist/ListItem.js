/*!
 * ${copyright}
 */
sap.ui.define(
    [
        "testdata/fastnavigation/webc/gen/ui5/webcomponents/dist/ListItemBase",
        "testdata/fastnavigation/webc/gen/ui5/webcomponents"
    ],
    function (WebComponentBaseClass) {
        "use strict";

        const WrapperClass = WebComponentBaseClass.extend(
            "testdata.fastnavigation.webc.gen.ui5.webcomponents.dist.ListItem",
            {
                metadata: {
                    namespace:
                        "testdata/fastnavigation/webc/gen/ui5/webcomponents",
                    qualifiedNamespace:
                        "testdata.fastnavigation.webc.gen.ui5.webcomponents",
                    interfaces: [],
                    properties: {
                        type: {
                            type: "testdata.fastnavigation.webc.gen.ui5.webcomponents.ListItemType",
                            mapping: "property",
                            defaultValue: "Active"
                        },
                        accessibilityAttributes: {
                            type: "object",
                            mapping: "property",
                            defaultValue: {}
                        },
                        navigated: {
                            type: "boolean",
                            mapping: "property",
                            defaultValue: false
                        },
                        tooltip: {
                            type: "string",
                            mapping: "property"
                        },
                        highlight: {
                            type: "testdata.fastnavigation.webc.gen.ui5.webcomponents.Highlight",
                            mapping: "property",
                            defaultValue: "None"
                        },
                        selected: {
                            type: "boolean",
                            mapping: "property",
                            defaultValue: false
                        },
                        text: {
                            type: "string",
                            mapping: "textContent"
                        },
                        width: {
                            type: "sap.ui.core.CSSSize",
                            mapping: "style"
                        },
                        height: {
                            type: "sap.ui.core.CSSSize",
                            mapping: "style"
                        }
                    },
                    aggregations: {
                        deleteButton: {
                            type: "testdata.fastnavigation.webc.gen.ui5.webcomponents.IButton",
                            multiple: true,
                            slot: "deleteButton"
                        }
                    },
                    associations: {},
                    events: {
                        detailClick: {
                            allowPreventDefault: false,
                            enableEventBubbling: true,
                            parameters: {}
                        }
                    },
                    getters: [],
                    methods: [],
                    designtime:
                        "testdata/fastnavigation/webc/gen/ui5/webcomponents/designtime/ListItem.designtime"
                }
            }
        );

        return WrapperClass;
    }
);
