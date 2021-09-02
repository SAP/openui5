sap.ui.define(['exports', '../lit-html', '../../directive-22e48b2f'], function (exports, litHtml, directive) { 'use strict';

    /**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
    const HTML_RESULT = 1;
    class UnsafeHTMLDirective extends directive.Directive {
        constructor(partInfo) {
            super(partInfo);
            this._value = litHtml.nothing;
            if (partInfo.type !== directive.PartType.CHILD) {
                throw new Error(`${this.constructor.directiveName}() can only be used in child bindings`);
            }
        }
        render(value) {
            if (value === litHtml.nothing) {
                this._templateResult = undefined;
                return (this._value = value);
            }
            if (value === litHtml.noChange) {
                return value;
            }
            if (typeof value != 'string') {
                throw new Error(`${this.constructor.directiveName}() called with a non-string value`);
            }
            if (value === this._value) {
                return this._templateResult;
            }
            this._value = value;
            const strings = [value];
            strings.raw = strings;
            return (this._templateResult = {
                _$litType$: this.constructor
                    .resultType,
                strings,
                values: [],
            });
        }
    }
    UnsafeHTMLDirective.directiveName = 'unsafeHTML';
    UnsafeHTMLDirective.resultType = HTML_RESULT;
    const unsafeHTML = directive.directive(UnsafeHTMLDirective);

    exports.UnsafeHTMLDirective = UnsafeHTMLDirective;
    exports.unsafeHTML = unsafeHTML;

    Object.defineProperty(exports, '__esModule', { value: true });

});
