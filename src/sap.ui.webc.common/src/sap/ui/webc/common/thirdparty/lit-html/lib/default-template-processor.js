sap.ui.define(['exports', './parts'], function (exports, parts) { 'use strict';

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    class DefaultTemplateProcessor {
        handleAttributeExpressions(element, name, strings, options) {
            const prefix = name[0];
            if (prefix === '.') {
                const committer = new parts.PropertyCommitter(element, name.slice(1), strings);
                return committer.parts;
            }
            if (prefix === '@') {
                return [new parts.EventPart(element, name.slice(1), options.eventContext)];
            }
            if (prefix === '?') {
                return [new parts.BooleanAttributePart(element, name.slice(1), strings)];
            }
            const committer = new parts.AttributeCommitter(element, name, strings);
            return committer.parts;
        }
        handleTextExpression(options) {
            return new parts.NodePart(options);
        }
    }
    const defaultTemplateProcessor = new DefaultTemplateProcessor();

    exports.DefaultTemplateProcessor = DefaultTemplateProcessor;
    exports.defaultTemplateProcessor = defaultTemplateProcessor;

    Object.defineProperty(exports, '__esModule', { value: true });

});
