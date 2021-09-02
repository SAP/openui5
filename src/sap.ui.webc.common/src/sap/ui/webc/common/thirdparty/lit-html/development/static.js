sap.ui.define(['exports', './lit-html'], function (exports, litHtml) { 'use strict';

    /**
     * @license
     * Copyright 2020 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
    const unsafeStatic = (value) => ({
        _$litStatic$: value,
    });
    const textFromStatic = (value) => {
        if (value._$litStatic$ !== undefined) {
            return value._$litStatic$;
        }
        else {
            throw new Error(`Value passed to 'literal' function must be a 'literal' result: ${value}. Use 'unsafeStatic' to pass non-literal values, but
            take care to ensure page security.`);
        }
    };
    const literal = (strings, ...values) => ({
        _$litStatic$: values.reduce((acc, v, idx) => acc + textFromStatic(v) + strings[idx + 1], strings[0]),
    });
    const stringsCache = new Map();
    const withStatic = (coreTag) => (strings, ...values) => {
        var _a;
        const l = values.length;
        let staticValue;
        let dynamicValue;
        const staticStrings = [];
        const dynamicValues = [];
        let i = 0;
        let hasStatics = false;
        let s;
        while (i < l) {
            s = strings[i];
            while (i < l &&
                ((dynamicValue = values[i]),
                    (staticValue = (_a = dynamicValue) === null || _a === void 0 ? void 0 : _a._$litStatic$)) !== undefined) {
                s += staticValue + strings[++i];
                hasStatics = true;
            }
            dynamicValues.push(dynamicValue);
            staticStrings.push(s);
            i++;
        }
        if (i === l) {
            staticStrings.push(strings[l]);
        }
        if (hasStatics) {
            const key = staticStrings.join('$$lit$$');
            strings = stringsCache.get(key);
            if (strings === undefined) {
                stringsCache.set(key, (strings = staticStrings));
            }
            values = dynamicValues;
        }
        return coreTag(strings, ...values);
    };
    const html = withStatic(litHtml.html);
    const svg = withStatic(litHtml.svg);

    exports.html = html;
    exports.literal = literal;
    exports.svg = svg;
    exports.unsafeStatic = unsafeStatic;
    exports.withStatic = withStatic;

    Object.defineProperty(exports, '__esModule', { value: true });

});
