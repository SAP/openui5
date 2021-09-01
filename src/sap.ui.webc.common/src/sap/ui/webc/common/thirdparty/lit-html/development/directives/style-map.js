sap.ui.define(['exports', '../lit-html', '../../directive-22e48b2f'], function (exports, litHtml, directive) { 'use strict';

    /**
     * @license
     * Copyright 2018 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
    class StyleMapDirective extends directive.Directive {
        constructor(partInfo) {
            var _a;
            super(partInfo);
            if (partInfo.type !== directive.PartType.ATTRIBUTE ||
                partInfo.name !== 'style' ||
                ((_a = partInfo.strings) === null || _a === void 0 ? void 0 : _a.length) > 2) {
                throw new Error('The `styleMap` directive must be used in the `style` attribute ' +
                    'and must be the only part in the attribute.');
            }
        }
        render(styleInfo) {
            return Object.keys(styleInfo).reduce((style, prop) => {
                const value = styleInfo[prop];
                if (value == null) {
                    return style;
                }
                prop = prop
                    .replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, '-$&')
                    .toLowerCase();
                return style + `${prop}:${value};`;
            }, '');
        }
        update(part, [styleInfo]) {
            const { style } = part.element;
            if (this._previousStyleProperties === undefined) {
                this._previousStyleProperties = new Set();
                for (const name in styleInfo) {
                    this._previousStyleProperties.add(name);
                }
                return this.render(styleInfo);
            }
            this._previousStyleProperties.forEach((name) => {
                if (styleInfo[name] == null) {
                    this._previousStyleProperties.delete(name);
                    if (name.includes('-')) {
                        style.removeProperty(name);
                    }
                    else {
                        style[name] = '';
                    }
                }
            });
            for (const name in styleInfo) {
                const value = styleInfo[name];
                if (value != null) {
                    this._previousStyleProperties.add(name);
                    if (name.includes('-')) {
                        style.setProperty(name, value);
                    }
                    else {
                        style[name] = value;
                    }
                }
            }
            return litHtml.noChange;
        }
    }
    const styleMap = directive.directive(StyleMapDirective);

    exports.styleMap = styleMap;

    Object.defineProperty(exports, '__esModule', { value: true });

});
