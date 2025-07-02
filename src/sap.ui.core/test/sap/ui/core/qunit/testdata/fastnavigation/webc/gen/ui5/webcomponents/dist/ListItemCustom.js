/*!
 * ${copyright}
 */
sap.ui.define(
    [
        "testdata/fastnavigation/webc/gen/ui5/webcomponents/dist/ListItem",
        "testdata/fastnavigation/webc/gen/ui5/webcomponents",
        "testdata/fastnavigation/webc/integration/ListItemCustom"
    ],
    function (WebComponentBaseClass) {
        "use strict";

        const WrapperClass = WebComponentBaseClass.extend(
            "testdata.fastnavigation.webc.gen.ui5.webcomponents.dist.ListItemCustom",
            {
                metadata: {
                    namespace:
                        "testdata/fastnavigation/webc/gen/ui5/webcomponents",
                    qualifiedNamespace:
                        "testdata.fastnavigation.webc.gen.ui5.webcomponents",
                    tag: "ui5-li-custom-5acb3449",
                    interfaces: [],
                    properties: {
                        movable: {
                            type: "boolean",
                            mapping: "property",
                            defaultValue: false
                        },
                        accessibleName: {
                            type: "string",
                            mapping: "property"
                        },
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
                        }
                    },
                    aggregations: {
                        content: {
                            type: "sap.ui.core.Control",
                            multiple: true
                        },
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
                    defaultAggregation: "content",
                    designtime:
                        "testdata/fastnavigation/webc/gen/ui5/webcomponents/designtime/ListItemCustom.designtime"
                }
            }
        );

        return WrapperClass;
    }
);
