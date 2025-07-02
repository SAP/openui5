/*!
 * ${copyright}
 */
sap.ui.define(
    [
        "sap/ui/core/webc/WebComponent",
        "testdata/fastnavigation/webc/gen/ui5/webcomponents",
        "testdata/fastnavigation/webc/integration/Panel"
    ],
    function (WebComponentBaseClass) {
        "use strict";

        const WrapperClass = WebComponentBaseClass.extend(
            "testdata.fastnavigation.webc.gen.ui5.webcomponents.dist.Panel",
            {
                metadata: {
                    namespace:
                        "testdata/fastnavigation/webc/gen/ui5/webcomponents",
                    qualifiedNamespace:
                        "testdata.fastnavigation.webc.gen.ui5.webcomponents",
                    tag: "ui5-panel-5acb3449",
                    interfaces: [],
                    properties: {
                        headerText: {
                            type: "string",
                            mapping: "property"
                        },
                        fixed: {
                            type: "boolean",
                            mapping: "property",
                            defaultValue: false
                        },
                        collapsed: {
                            type: "boolean",
                            mapping: "property",
                            defaultValue: false
                        },
                        noAnimation: {
                            type: "boolean",
                            mapping: "property",
                            defaultValue: false
                        },
                        accessibleRole: {
                            type: "testdata.fastnavigation.webc.gen.ui5.webcomponents.PanelAccessibleRole",
                            mapping: "property",
                            defaultValue: "Form"
                        },
                        headerLevel: {
                            type: "testdata.fastnavigation.webc.gen.ui5.webcomponents.TitleLevel",
                            mapping: "property",
                            defaultValue: "H2"
                        },
                        accessibleName: {
                            type: "string",
                            mapping: "property"
                        },
                        stickyHeader: {
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
                        content: {
                            type: "sap.ui.core.Control",
                            multiple: true
                        },
                        header: {
                            type: "sap.ui.core.Control",
                            multiple: true,
                            slot: "header"
                        }
                    },
                    associations: {},
                    events: {
                        toggle: {
                            allowPreventDefault: false,
                            enableEventBubbling: true,
                            parameters: {}
                        }
                    },
                    getters: [],
                    methods: [],
                    defaultAggregation: "content",
                    designtime:
                        "testdata/fastnavigation/webc/gen/ui5/webcomponents/designtime/Panel.designtime"
                }
            }
        );

        return WrapperClass;
    }
);
