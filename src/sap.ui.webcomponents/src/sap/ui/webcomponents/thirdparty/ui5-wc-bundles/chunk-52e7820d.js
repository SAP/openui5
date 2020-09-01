sap.ui.define(['exports', './chunk-7ceb84db'], function (exports, __chunk_1) { 'use strict';

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
    var directives = new WeakMap();
    /**
     * Brands a function as a directive factory function so that lit-html will call
     * the function during template rendering, rather than passing as a value.
     *
     * A _directive_ is a function that takes a Part as an argument. It has the
     * signature: `(part: Part) => void`.
     *
     * A directive _factory_ is a function that takes arguments for data and
     * configuration and returns a directive. Users of directive usually refer to
     * the directive factory as the directive. For example, "The repeat directive".
     *
     * Usually a template author will invoke a directive factory in their template
     * with relevant arguments, which will then return a directive function.
     *
     * Here's an example of using the `repeat()` directive factory that takes an
     * array and a function to render an item:
     *
     * ```js
     * html`<ul><${repeat(items, (item) => html`<li>${item}</li>`)}</ul>`
     * ```
     *
     * When `repeat` is invoked, it returns a directive function that closes over
     * `items` and the template function. When the outer template is rendered, the
     * return directive function is called with the Part for the expression.
     * `repeat` then performs it's custom logic to render multiple items.
     *
     * @param f The directive factory function. Must be a function that returns a
     * function of the signature `(part: Part) => void`. The returned function will
     * be called with the part object.
     *
     * @example
     *
     * import {directive, html} from 'lit-html';
     *
     * const immutable = directive((v) => (part) => {
     *   if (part.value !== v) {
     *     part.setValue(v)
     *   }
     * });
     */

    var directive = function directive(f) {
      return function () {
        var d = f.apply(void 0, arguments);
        directives.set(d, true);
        return d;
      };
    };
    var isDirective = function isDirective(o) {
      return typeof o === 'function' && directives.has(o);
    };

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

    /**
     * True if the custom elements polyfill is in use.
     */
    var isCEPolyfill = window.customElements !== undefined && window.customElements.polyfillWrapFlushCallback !== undefined;
    /**
     * Reparents nodes, starting from `start` (inclusive) to `end` (exclusive),
     * into another container (could be the same container), before `before`. If
     * `before` is null, it appends the nodes to the container.
     */

    var reparentNodes = function reparentNodes(container, start) {
      var end = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var before = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

      while (start !== end) {
        var n = start.nextSibling;
        container.insertBefore(start, before);
        start = n;
      }
    };
    /**
     * Removes nodes, starting from `start` (inclusive) to `end` (exclusive), from
     * `container`.
     */

    var removeNodes = function removeNodes(container, start) {
      var end = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      while (start !== end) {
        var n = start.nextSibling;
        container.removeChild(start);
        start = n;
      }
    };

    /**
     * @license
     * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
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

    /**
     * A sentinel value that signals that a value was handled by a directive and
     * should not be written to the DOM.
     */
    var noChange = {};
    /**
     * A sentinel value that signals a NodePart to fully clear its content.
     */

    var nothing = {};

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

    /**
     * An expression marker with embedded unique key to avoid collision with
     * possible text in templates.
     */
    var marker = "{{lit-".concat(String(Math.random()).slice(2), "}}");
    /**
     * An expression marker used text-positions, multi-binding attributes, and
     * attributes with markup-like text values.
     */

    var nodeMarker = "<!--".concat(marker, "-->");
    var markerRegex = new RegExp("".concat(marker, "|").concat(nodeMarker));
    /**
     * Suffix appended to all bound attribute names.
     */

    var boundAttributeSuffix = '$lit$';
    /**
     * An updateable Template that tracks the location of dynamic parts.
     */

    var Template = function Template(result, element) {
      __chunk_1._classCallCheck(this, Template);

      this.parts = [];
      this.element = element;
      var nodesToRemove = [];
      var stack = []; // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null

      var walker = document.createTreeWalker(element.content, 133
      /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */
      , null, false); // Keeps track of the last index associated with a part. We try to delete
      // unnecessary nodes, but we never want to associate two different parts
      // to the same index. They must have a constant node between.

      var lastPartIndex = 0;
      var index = -1;
      var partIndex = 0;
      var strings = result.strings,
          length = result.values.length;

      while (partIndex < length) {
        var node = walker.nextNode();

        if (node === null) {
          // We've exhausted the content inside a nested template element.
          // Because we still have parts (the outer for-loop), we know:
          // - There is a template in the stack
          // - The walker will find a nextNode outside the template
          walker.currentNode = stack.pop();
          continue;
        }

        index++;

        if (node.nodeType === 1
        /* Node.ELEMENT_NODE */
        ) {
            if (node.hasAttributes()) {
              var attributes = node.attributes;
              var _length = attributes.length; // Per
              // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
              // attributes are not guaranteed to be returned in document order.
              // In particular, Edge/IE can return them out of order, so we cannot
              // assume a correspondence between part index and attribute index.

              var count = 0;

              for (var i = 0; i < _length; i++) {
                if (endsWith(attributes[i].name, boundAttributeSuffix)) {
                  count++;
                }
              }

              while (count-- > 0) {
                // Get the template literal section leading up to the first
                // expression in this attribute
                var stringForPart = strings[partIndex]; // Find the attribute name

                var name = lastAttributeNameRegex.exec(stringForPart)[2]; // Find the corresponding attribute
                // All bound attributes have had a suffix added in
                // TemplateResult#getHTML to opt out of special attribute
                // handling. To look up the attribute value we also need to add
                // the suffix.

                var attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
                var attributeValue = node.getAttribute(attributeLookupName);
                node.removeAttribute(attributeLookupName);
                var statics = attributeValue.split(markerRegex);
                this.parts.push({
                  type: 'attribute',
                  index: index,
                  name: name,
                  strings: statics
                });
                partIndex += statics.length - 1;
              }
            }

            if (node.tagName === 'TEMPLATE') {
              stack.push(node);
              walker.currentNode = node.content;
            }
          } else if (node.nodeType === 3
        /* Node.TEXT_NODE */
        ) {
            var data = node.data;

            if (data.indexOf(marker) >= 0) {
              var parent = node.parentNode;

              var _strings = data.split(markerRegex);

              var lastIndex = _strings.length - 1; // Generate a new text node for each literal section
              // These nodes are also used as the markers for node parts

              for (var _i = 0; _i < lastIndex; _i++) {
                var insert = void 0;
                var s = _strings[_i];

                if (s === '') {
                  insert = createMarker();
                } else {
                  var match = lastAttributeNameRegex.exec(s);

                  if (match !== null && endsWith(match[2], boundAttributeSuffix)) {
                    s = s.slice(0, match.index) + match[1] + match[2].slice(0, -boundAttributeSuffix.length) + match[3];
                  }

                  insert = document.createTextNode(s);
                }

                parent.insertBefore(insert, node);
                this.parts.push({
                  type: 'node',
                  index: ++index
                });
              } // If there's no text, we must insert a comment to mark our place.
              // Else, we can trust it will stick around after cloning.


              if (_strings[lastIndex] === '') {
                parent.insertBefore(createMarker(), node);
                nodesToRemove.push(node);
              } else {
                node.data = _strings[lastIndex];
              } // We have a part for each match found


              partIndex += lastIndex;
            }
          } else if (node.nodeType === 8
        /* Node.COMMENT_NODE */
        ) {
            if (node.data === marker) {
              var _parent = node.parentNode; // Add a new marker node to be the startNode of the Part if any of
              // the following are true:
              //  * We don't have a previousSibling
              //  * The previousSibling is already the start of a previous part

              if (node.previousSibling === null || index === lastPartIndex) {
                index++;

                _parent.insertBefore(createMarker(), node);
              }

              lastPartIndex = index;
              this.parts.push({
                type: 'node',
                index: index
              }); // If we don't have a nextSibling, keep this node so we have an end.
              // Else, we can remove it to save future costs.

              if (node.nextSibling === null) {
                node.data = '';
              } else {
                nodesToRemove.push(node);
                index--;
              }

              partIndex++;
            } else {
              var _i2 = -1;

              while ((_i2 = node.data.indexOf(marker, _i2 + 1)) !== -1) {
                // Comment node has a binding marker inside, make an inactive part
                // The binding won't work, but subsequent bindings will
                // TODO (justinfagnani): consider whether it's even worth it to
                // make bindings in comments work
                this.parts.push({
                  type: 'node',
                  index: -1
                });
                partIndex++;
              }
            }
          }
      } // Remove text binding nodes after the walk to not disturb the TreeWalker


      for (var _i3 = 0, _nodesToRemove = nodesToRemove; _i3 < _nodesToRemove.length; _i3++) {
        var n = _nodesToRemove[_i3];
        n.parentNode.removeChild(n);
      }
    };

    var endsWith = function endsWith(str, suffix) {
      var index = str.length - suffix.length;
      return index >= 0 && str.slice(index) === suffix;
    };

    var isTemplatePartActive = function isTemplatePartActive(part) {
      return part.index !== -1;
    }; // Allows `document.createComment('')` to be renamed for a
    // small manual size-savings.

    var createMarker = function createMarker() {
      return document.createComment('');
    };
    /**
     * This regex extracts the attribute name preceding an attribute-position
     * expression. It does this by matching the syntax allowed for attributes
     * against the string literal directly preceding the expression, assuming that
     * the expression is in an attribute-value position.
     *
     * See attributes in the HTML spec:
     * https://www.w3.org/TR/html5/syntax.html#elements-attributes
     *
     * " \x09\x0a\x0c\x0d" are HTML space characters:
     * https://www.w3.org/TR/html5/infrastructure.html#space-characters
     *
     * "\0-\x1F\x7F-\x9F" are Unicode control characters, which includes every
     * space character except " ".
     *
     * So an attribute is:
     *  * The name: any character except a control character, space character, ('),
     *    ("), ">", "=", or "/"
     *  * Followed by zero or more space characters
     *  * Followed by "="
     *  * Followed by zero or more space characters
     *  * Followed by:
     *    * Any character except space, ('), ("), "<", ">", "=", (`), or
     *    * (") then any non-("), or
     *    * (') then any non-(')
     */

    var lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

    /**
     * An instance of a `Template` that can be attached to the DOM and updated
     * with new values.
     */

    var TemplateInstance =
    /*#__PURE__*/
    function () {
      function TemplateInstance(template, processor, options) {
        __chunk_1._classCallCheck(this, TemplateInstance);

        this.__parts = [];
        this.template = template;
        this.processor = processor;
        this.options = options;
      }

      __chunk_1._createClass(TemplateInstance, [{
        key: "update",
        value: function update(values) {
          var i = 0;
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = this.__parts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var part = _step.value;

              if (part !== undefined) {
                part.setValue(values[i]);
              }

              i++;
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                _iterator["return"]();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = this.__parts[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var _part = _step2.value;

              if (_part !== undefined) {
                _part.commit();
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                _iterator2["return"]();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
      }, {
        key: "_clone",
        value: function _clone() {
          // There are a number of steps in the lifecycle of a template instance's
          // DOM fragment:
          //  1. Clone - create the instance fragment
          //  2. Adopt - adopt into the main document
          //  3. Process - find part markers and create parts
          //  4. Upgrade - upgrade custom elements
          //  5. Update - set node, attribute, property, etc., values
          //  6. Connect - connect to the document. Optional and outside of this
          //     method.
          //
          // We have a few constraints on the ordering of these steps:
          //  * We need to upgrade before updating, so that property values will pass
          //    through any property setters.
          //  * We would like to process before upgrading so that we're sure that the
          //    cloned fragment is inert and not disturbed by self-modifying DOM.
          //  * We want custom elements to upgrade even in disconnected fragments.
          //
          // Given these constraints, with full custom elements support we would
          // prefer the order: Clone, Process, Adopt, Upgrade, Update, Connect
          //
          // But Safari dooes not implement CustomElementRegistry#upgrade, so we
          // can not implement that order and still have upgrade-before-update and
          // upgrade disconnected fragments. So we instead sacrifice the
          // process-before-upgrade constraint, since in Custom Elements v1 elements
          // must not modify their light DOM in the constructor. We still have issues
          // when co-existing with CEv0 elements like Polymer 1, and with polyfills
          // that don't strictly adhere to the no-modification rule because shadow
          // DOM, which may be created in the constructor, is emulated by being placed
          // in the light DOM.
          //
          // The resulting order is on native is: Clone, Adopt, Upgrade, Process,
          // Update, Connect. document.importNode() performs Clone, Adopt, and Upgrade
          // in one step.
          //
          // The Custom Elements v1 polyfill supports upgrade(), so the order when
          // polyfilled is the more ideal: Clone, Process, Adopt, Upgrade, Update,
          // Connect.
          var fragment = isCEPolyfill ? this.template.element.content.cloneNode(true) : document.importNode(this.template.element.content, true);
          var stack = [];
          var parts = this.template.parts; // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null

          var walker = document.createTreeWalker(fragment, 133
          /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */
          , null, false);
          var partIndex = 0;
          var nodeIndex = 0;
          var part;
          var node = walker.nextNode(); // Loop through all the nodes and parts of a template

          while (partIndex < parts.length) {
            part = parts[partIndex];

            if (!isTemplatePartActive(part)) {
              this.__parts.push(undefined);

              partIndex++;
              continue;
            } // Progress the tree walker until we find our next part's node.
            // Note that multiple parts may share the same node (attribute parts
            // on a single element), so this loop may not run at all.


            while (nodeIndex < part.index) {
              nodeIndex++;

              if (node.nodeName === 'TEMPLATE') {
                stack.push(node);
                walker.currentNode = node.content;
              }

              if ((node = walker.nextNode()) === null) {
                // We've exhausted the content inside a nested template element.
                // Because we still have parts (the outer for-loop), we know:
                // - There is a template in the stack
                // - The walker will find a nextNode outside the template
                walker.currentNode = stack.pop();
                node = walker.nextNode();
              }
            } // We've arrived at our part's node.


            if (part.type === 'node') {
              var _part2 = this.processor.handleTextExpression(this.options);

              _part2.insertAfterNode(node.previousSibling);

              this.__parts.push(_part2);
            } else {
              var _this$__parts;

              (_this$__parts = this.__parts).push.apply(_this$__parts, __chunk_1._toConsumableArray(this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options)));
            }

            partIndex++;
          }

          if (isCEPolyfill) {
            document.adoptNode(fragment);
            customElements.upgrade(fragment);
          }

          return fragment;
        }
      }]);

      return TemplateInstance;
    }();

    var commentMarker = " ".concat(marker, " ");
    /**
     * The return type of `html`, which holds a Template and the values from
     * interpolated expressions.
     */

    var TemplateResult =
    /*#__PURE__*/
    function () {
      function TemplateResult(strings, values, type, processor) {
        __chunk_1._classCallCheck(this, TemplateResult);

        this.strings = strings;
        this.values = values;
        this.type = type;
        this.processor = processor;
      }
      /**
       * Returns a string of HTML used to create a `<template>` element.
       */


      __chunk_1._createClass(TemplateResult, [{
        key: "getHTML",
        value: function getHTML() {
          var l = this.strings.length - 1;
          var html = '';
          var isCommentBinding = false;

          for (var i = 0; i < l; i++) {
            var s = this.strings[i]; // For each binding we want to determine the kind of marker to insert
            // into the template source before it's parsed by the browser's HTML
            // parser. The marker type is based on whether the expression is in an
            // attribute, text, or comment poisition.
            //   * For node-position bindings we insert a comment with the marker
            //     sentinel as its text content, like <!--{{lit-guid}}-->.
            //   * For attribute bindings we insert just the marker sentinel for the
            //     first binding, so that we support unquoted attribute bindings.
            //     Subsequent bindings can use a comment marker because multi-binding
            //     attributes must be quoted.
            //   * For comment bindings we insert just the marker sentinel so we don't
            //     close the comment.
            //
            // The following code scans the template source, but is *not* an HTML
            // parser. We don't need to track the tree structure of the HTML, only
            // whether a binding is inside a comment, and if not, if it appears to be
            // the first binding in an attribute.

            var commentOpen = s.lastIndexOf('<!--'); // We're in comment position if we have a comment open with no following
            // comment close. Because <-- can appear in an attribute value there can
            // be false positives.

            isCommentBinding = (commentOpen > -1 || isCommentBinding) && s.indexOf('-->', commentOpen + 1) === -1; // Check to see if we have an attribute-like sequence preceeding the
            // expression. This can match "name=value" like structures in text,
            // comments, and attribute values, so there can be false-positives.

            var attributeMatch = lastAttributeNameRegex.exec(s);

            if (attributeMatch === null) {
              // We're only in this branch if we don't have a attribute-like
              // preceeding sequence. For comments, this guards against unusual
              // attribute values like <div foo="<!--${'bar'}">. Cases like
              // <!-- foo=${'bar'}--> are handled correctly in the attribute branch
              // below.
              html += s + (isCommentBinding ? commentMarker : nodeMarker);
            } else {
              // For attributes we use just a marker sentinel, and also append a
              // $lit$ suffix to the name to opt-out of attribute-specific parsing
              // that IE and Edge do for style and certain SVG attributes.
              html += s.substr(0, attributeMatch.index) + attributeMatch[1] + attributeMatch[2] + boundAttributeSuffix + attributeMatch[3] + marker;
            }
          }

          html += this.strings[l];
          return html;
        }
      }, {
        key: "getTemplateElement",
        value: function getTemplateElement() {
          var template = document.createElement('template');
          template.innerHTML = this.getHTML();
          return template;
        }
      }]);

      return TemplateResult;
    }();
    /**
     * A TemplateResult for SVG fragments.
     *
     * This class wraps HTML in an `<svg>` tag in order to parse its contents in the
     * SVG namespace, then modifies the template to remove the `<svg>` tag so that
     * clones only container the original fragment.
     */

    var SVGTemplateResult =
    /*#__PURE__*/
    function (_TemplateResult) {
      __chunk_1._inherits(SVGTemplateResult, _TemplateResult);

      function SVGTemplateResult() {
        __chunk_1._classCallCheck(this, SVGTemplateResult);

        return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(SVGTemplateResult).apply(this, arguments));
      }

      __chunk_1._createClass(SVGTemplateResult, [{
        key: "getHTML",
        value: function getHTML() {
          return "<svg>".concat(__chunk_1._get(__chunk_1._getPrototypeOf(SVGTemplateResult.prototype), "getHTML", this).call(this), "</svg>");
        }
      }, {
        key: "getTemplateElement",
        value: function getTemplateElement() {
          var template = __chunk_1._get(__chunk_1._getPrototypeOf(SVGTemplateResult.prototype), "getTemplateElement", this).call(this);

          var content = template.content;
          var svgElement = content.firstChild;
          content.removeChild(svgElement);
          reparentNodes(content, svgElement.firstChild);
          return template;
        }
      }]);

      return SVGTemplateResult;
    }(TemplateResult);

    var isPrimitive = function isPrimitive(value) {
      return value === null || !(__chunk_1._typeof(value) === 'object' || typeof value === 'function');
    };
    var isIterable = function isIterable(value) {
      return Array.isArray(value) || // tslint:disable-next-line:no-any
      !!(value && value[Symbol.iterator]);
    };
    /**
     * Writes attribute values to the DOM for a group of AttributeParts bound to a
     * single attibute. The value is only set once even if there are multiple parts
     * for an attribute.
     */

    var AttributeCommitter =
    /*#__PURE__*/
    function () {
      function AttributeCommitter(element, name, strings) {
        __chunk_1._classCallCheck(this, AttributeCommitter);

        this.dirty = true;
        this.element = element;
        this.name = name;
        this.strings = strings;
        this.parts = [];

        for (var i = 0; i < strings.length - 1; i++) {
          this.parts[i] = this._createPart();
        }
      }
      /**
       * Creates a single part. Override this to create a differnt type of part.
       */


      __chunk_1._createClass(AttributeCommitter, [{
        key: "_createPart",
        value: function _createPart() {
          return new AttributePart(this);
        }
      }, {
        key: "_getValue",
        value: function _getValue() {
          var strings = this.strings;
          var l = strings.length - 1;
          var text = '';

          for (var i = 0; i < l; i++) {
            text += strings[i];
            var part = this.parts[i];

            if (part !== undefined) {
              var v = part.value;

              if (isPrimitive(v) || !isIterable(v)) {
                text += typeof v === 'string' ? v : String(v);
              } else {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                  for (var _iterator = v[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var t = _step.value;
                    text += typeof t === 'string' ? t : String(t);
                  }
                } catch (err) {
                  _didIteratorError = true;
                  _iteratorError = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                      _iterator["return"]();
                    }
                  } finally {
                    if (_didIteratorError) {
                      throw _iteratorError;
                    }
                  }
                }
              }
            }
          }

          text += strings[l];
          return text;
        }
      }, {
        key: "commit",
        value: function commit() {
          if (this.dirty) {
            this.dirty = false;
            this.element.setAttribute(this.name, this._getValue());
          }
        }
      }]);

      return AttributeCommitter;
    }();
    /**
     * A Part that controls all or part of an attribute value.
     */

    var AttributePart =
    /*#__PURE__*/
    function () {
      function AttributePart(committer) {
        __chunk_1._classCallCheck(this, AttributePart);

        this.value = undefined;
        this.committer = committer;
      }

      __chunk_1._createClass(AttributePart, [{
        key: "setValue",
        value: function setValue(value) {
          if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
            this.value = value; // If the value is a not a directive, dirty the committer so that it'll
            // call setAttribute. If the value is a directive, it'll dirty the
            // committer if it calls setValue().

            if (!isDirective(value)) {
              this.committer.dirty = true;
            }
          }
        }
      }, {
        key: "commit",
        value: function commit() {
          while (isDirective(this.value)) {
            var directive$$1 = this.value;
            this.value = noChange;
            directive$$1(this);
          }

          if (this.value === noChange) {
            return;
          }

          this.committer.commit();
        }
      }]);

      return AttributePart;
    }();
    /**
     * A Part that controls a location within a Node tree. Like a Range, NodePart
     * has start and end locations and can set and update the Nodes between those
     * locations.
     *
     * NodeParts support several value types: primitives, Nodes, TemplateResults,
     * as well as arrays and iterables of those types.
     */

    var NodePart =
    /*#__PURE__*/
    function () {
      function NodePart(options) {
        __chunk_1._classCallCheck(this, NodePart);

        this.value = undefined;
        this.__pendingValue = undefined;
        this.options = options;
      }
      /**
       * Appends this part into a container.
       *
       * This part must be empty, as its contents are not automatically moved.
       */


      __chunk_1._createClass(NodePart, [{
        key: "appendInto",
        value: function appendInto(container) {
          this.startNode = container.appendChild(createMarker());
          this.endNode = container.appendChild(createMarker());
        }
        /**
         * Inserts this part after the `ref` node (between `ref` and `ref`'s next
         * sibling). Both `ref` and its next sibling must be static, unchanging nodes
         * such as those that appear in a literal section of a template.
         *
         * This part must be empty, as its contents are not automatically moved.
         */

      }, {
        key: "insertAfterNode",
        value: function insertAfterNode(ref) {
          this.startNode = ref;
          this.endNode = ref.nextSibling;
        }
        /**
         * Appends this part into a parent part.
         *
         * This part must be empty, as its contents are not automatically moved.
         */

      }, {
        key: "appendIntoPart",
        value: function appendIntoPart(part) {
          part.__insert(this.startNode = createMarker());

          part.__insert(this.endNode = createMarker());
        }
        /**
         * Inserts this part after the `ref` part.
         *
         * This part must be empty, as its contents are not automatically moved.
         */

      }, {
        key: "insertAfterPart",
        value: function insertAfterPart(ref) {
          ref.__insert(this.startNode = createMarker());

          this.endNode = ref.endNode;
          ref.endNode = this.startNode;
        }
      }, {
        key: "setValue",
        value: function setValue(value) {
          this.__pendingValue = value;
        }
      }, {
        key: "commit",
        value: function commit() {
          while (isDirective(this.__pendingValue)) {
            var directive$$1 = this.__pendingValue;
            this.__pendingValue = noChange;
            directive$$1(this);
          }

          var value = this.__pendingValue;

          if (value === noChange) {
            return;
          }

          if (isPrimitive(value)) {
            if (value !== this.value) {
              this.__commitText(value);
            }
          } else if (value instanceof TemplateResult) {
            this.__commitTemplateResult(value);
          } else if (value instanceof Node) {
            this.__commitNode(value);
          } else if (isIterable(value)) {
            this.__commitIterable(value);
          } else if (value === nothing) {
            this.value = nothing;
            this.clear();
          } else {
            // Fallback, will render the string representation
            this.__commitText(value);
          }
        }
      }, {
        key: "__insert",
        value: function __insert(node) {
          this.endNode.parentNode.insertBefore(node, this.endNode);
        }
      }, {
        key: "__commitNode",
        value: function __commitNode(value) {
          if (this.value === value) {
            return;
          }

          this.clear();

          this.__insert(value);

          this.value = value;
        }
      }, {
        key: "__commitText",
        value: function __commitText(value) {
          var node = this.startNode.nextSibling;
          value = value == null ? '' : value; // If `value` isn't already a string, we explicitly convert it here in case
          // it can't be implicitly converted - i.e. it's a symbol.

          var valueAsString = typeof value === 'string' ? value : String(value);

          if (node === this.endNode.previousSibling && node.nodeType === 3
          /* Node.TEXT_NODE */
          ) {
              // If we only have a single text node between the markers, we can just
              // set its value, rather than replacing it.
              // TODO(justinfagnani): Can we just check if this.value is primitive?
              node.data = valueAsString;
            } else {
            this.__commitNode(document.createTextNode(valueAsString));
          }

          this.value = value;
        }
      }, {
        key: "__commitTemplateResult",
        value: function __commitTemplateResult(value) {
          var template = this.options.templateFactory(value);

          if (this.value instanceof TemplateInstance && this.value.template === template) {
            this.value.update(value.values);
          } else {
            // Make sure we propagate the template processor from the TemplateResult
            // so that we use its syntax extension, etc. The template factory comes
            // from the render function options so that it can control template
            // caching and preprocessing.
            var instance = new TemplateInstance(template, value.processor, this.options);

            var fragment = instance._clone();

            instance.update(value.values);

            this.__commitNode(fragment);

            this.value = instance;
          }
        }
      }, {
        key: "__commitIterable",
        value: function __commitIterable(value) {
          // For an Iterable, we create a new InstancePart per item, then set its
          // value to the item. This is a little bit of overhead for every item in
          // an Iterable, but it lets us recurse easily and efficiently update Arrays
          // of TemplateResults that will be commonly returned from expressions like:
          // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
          // If _value is an array, then the previous render was of an
          // iterable and _value will contain the NodeParts from the previous
          // render. If _value is not an array, clear this part and make a new
          // array for NodeParts.
          if (!Array.isArray(this.value)) {
            this.value = [];
            this.clear();
          } // Lets us keep track of how many items we stamped so we can clear leftover
          // items from a previous render


          var itemParts = this.value;
          var partIndex = 0;
          var itemPart;
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = value[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var item = _step2.value;
              // Try to reuse an existing part
              itemPart = itemParts[partIndex]; // If no existing part, create a new one

              if (itemPart === undefined) {
                itemPart = new NodePart(this.options);
                itemParts.push(itemPart);

                if (partIndex === 0) {
                  itemPart.appendIntoPart(this);
                } else {
                  itemPart.insertAfterPart(itemParts[partIndex - 1]);
                }
              }

              itemPart.setValue(item);
              itemPart.commit();
              partIndex++;
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                _iterator2["return"]();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }

          if (partIndex < itemParts.length) {
            // Truncate the parts array so _value reflects the current state
            itemParts.length = partIndex;
            this.clear(itemPart && itemPart.endNode);
          }
        }
      }, {
        key: "clear",
        value: function clear() {
          var startNode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.startNode;
          removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
        }
      }]);

      return NodePart;
    }();
    /**
     * Implements a boolean attribute, roughly as defined in the HTML
     * specification.
     *
     * If the value is truthy, then the attribute is present with a value of
     * ''. If the value is falsey, the attribute is removed.
     */

    var BooleanAttributePart =
    /*#__PURE__*/
    function () {
      function BooleanAttributePart(element, name, strings) {
        __chunk_1._classCallCheck(this, BooleanAttributePart);

        this.value = undefined;
        this.__pendingValue = undefined;

        if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
          throw new Error('Boolean attributes can only contain a single expression');
        }

        this.element = element;
        this.name = name;
        this.strings = strings;
      }

      __chunk_1._createClass(BooleanAttributePart, [{
        key: "setValue",
        value: function setValue(value) {
          this.__pendingValue = value;
        }
      }, {
        key: "commit",
        value: function commit() {
          while (isDirective(this.__pendingValue)) {
            var directive$$1 = this.__pendingValue;
            this.__pendingValue = noChange;
            directive$$1(this);
          }

          if (this.__pendingValue === noChange) {
            return;
          }

          var value = !!this.__pendingValue;

          if (this.value !== value) {
            if (value) {
              this.element.setAttribute(this.name, '');
            } else {
              this.element.removeAttribute(this.name);
            }

            this.value = value;
          }

          this.__pendingValue = noChange;
        }
      }]);

      return BooleanAttributePart;
    }();
    /**
     * Sets attribute values for PropertyParts, so that the value is only set once
     * even if there are multiple parts for a property.
     *
     * If an expression controls the whole property value, then the value is simply
     * assigned to the property under control. If there are string literals or
     * multiple expressions, then the strings are expressions are interpolated into
     * a string first.
     */

    var PropertyCommitter =
    /*#__PURE__*/
    function (_AttributeCommitter) {
      __chunk_1._inherits(PropertyCommitter, _AttributeCommitter);

      function PropertyCommitter(element, name, strings) {
        var _this;

        __chunk_1._classCallCheck(this, PropertyCommitter);

        _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(PropertyCommitter).call(this, element, name, strings));
        _this.single = strings.length === 2 && strings[0] === '' && strings[1] === '';
        return _this;
      }

      __chunk_1._createClass(PropertyCommitter, [{
        key: "_createPart",
        value: function _createPart() {
          return new PropertyPart(this);
        }
      }, {
        key: "_getValue",
        value: function _getValue() {
          if (this.single) {
            return this.parts[0].value;
          }

          return __chunk_1._get(__chunk_1._getPrototypeOf(PropertyCommitter.prototype), "_getValue", this).call(this);
        }
      }, {
        key: "commit",
        value: function commit() {
          if (this.dirty) {
            this.dirty = false; // tslint:disable-next-line:no-any

            this.element[this.name] = this._getValue();
          }
        }
      }]);

      return PropertyCommitter;
    }(AttributeCommitter);
    var PropertyPart =
    /*#__PURE__*/
    function (_AttributePart) {
      __chunk_1._inherits(PropertyPart, _AttributePart);

      function PropertyPart() {
        __chunk_1._classCallCheck(this, PropertyPart);

        return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(PropertyPart).apply(this, arguments));
      }

      return PropertyPart;
    }(AttributePart); // Detect event listener options support. If the `capture` property is read
    // from the options object, then options are supported. If not, then the thrid
    // argument to add/removeEventListener is interpreted as the boolean capture
    // value so we should only pass the `capture` property.

    var eventOptionsSupported = false;

    try {
      var options = {
        get capture() {
          eventOptionsSupported = true;
          return false;
        }

      }; // tslint:disable-next-line:no-any

      window.addEventListener('test', options, options); // tslint:disable-next-line:no-any

      window.removeEventListener('test', options, options);
    } catch (_e) {}

    var EventPart =
    /*#__PURE__*/
    function () {
      function EventPart(element, eventName, eventContext) {
        var _this2 = this;

        __chunk_1._classCallCheck(this, EventPart);

        this.value = undefined;
        this.__pendingValue = undefined;
        this.element = element;
        this.eventName = eventName;
        this.eventContext = eventContext;

        this.__boundHandleEvent = function (e) {
          return _this2.handleEvent(e);
        };
      }

      __chunk_1._createClass(EventPart, [{
        key: "setValue",
        value: function setValue(value) {
          this.__pendingValue = value;
        }
      }, {
        key: "commit",
        value: function commit() {
          while (isDirective(this.__pendingValue)) {
            var directive$$1 = this.__pendingValue;
            this.__pendingValue = noChange;
            directive$$1(this);
          }

          if (this.__pendingValue === noChange) {
            return;
          }

          var newListener = this.__pendingValue;
          var oldListener = this.value;
          var shouldRemoveListener = newListener == null || oldListener != null && (newListener.capture !== oldListener.capture || newListener.once !== oldListener.once || newListener.passive !== oldListener.passive);
          var shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);

          if (shouldRemoveListener) {
            this.element.removeEventListener(this.eventName, this.__boundHandleEvent, this.__options);
          }

          if (shouldAddListener) {
            this.__options = getOptions(newListener);
            this.element.addEventListener(this.eventName, this.__boundHandleEvent, this.__options);
          }

          this.value = newListener;
          this.__pendingValue = noChange;
        }
      }, {
        key: "handleEvent",
        value: function handleEvent(event) {
          if (typeof this.value === 'function') {
            this.value.call(this.eventContext || this.element, event);
          } else {
            this.value.handleEvent(event);
          }
        }
      }]);

      return EventPart;
    }(); // We copy options because of the inconsistent behavior of browsers when reading
    // the third argument of add/removeEventListener. IE11 doesn't support options
    // at all. Chrome 41 only reads `capture` if the argument is an object.

    var getOptions = function getOptions(o) {
      return o && (eventOptionsSupported ? {
        capture: o.capture,
        passive: o.passive,
        once: o.once
      } : o.capture);
    };

    /**
     * Creates Parts when a template is instantiated.
     */

    var DefaultTemplateProcessor =
    /*#__PURE__*/
    function () {
      function DefaultTemplateProcessor() {
        __chunk_1._classCallCheck(this, DefaultTemplateProcessor);
      }

      __chunk_1._createClass(DefaultTemplateProcessor, [{
        key: "handleAttributeExpressions",

        /**
         * Create parts for an attribute-position binding, given the event, attribute
         * name, and string literals.
         *
         * @param element The element containing the binding
         * @param name  The attribute name
         * @param strings The string literals. There are always at least two strings,
         *   event for fully-controlled bindings with a single expression.
         */
        value: function handleAttributeExpressions(element, name, strings, options) {
          var prefix = name[0];

          if (prefix === '.') {
            var _committer = new PropertyCommitter(element, name.slice(1), strings);

            return _committer.parts;
          }

          if (prefix === '@') {
            return [new EventPart(element, name.slice(1), options.eventContext)];
          }

          if (prefix === '?') {
            return [new BooleanAttributePart(element, name.slice(1), strings)];
          }

          var committer = new AttributeCommitter(element, name, strings);
          return committer.parts;
        }
        /**
         * Create parts for a text-position binding.
         * @param templateFactory
         */

      }, {
        key: "handleTextExpression",
        value: function handleTextExpression(options) {
          return new NodePart(options);
        }
      }]);

      return DefaultTemplateProcessor;
    }();
    var defaultTemplateProcessor = new DefaultTemplateProcessor();

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
    /**
     * The default TemplateFactory which caches Templates keyed on
     * result.type and result.strings.
     */

    function templateFactory(result) {
      var templateCache = templateCaches.get(result.type);

      if (templateCache === undefined) {
        templateCache = {
          stringsArray: new WeakMap(),
          keyString: new Map()
        };
        templateCaches.set(result.type, templateCache);
      }

      var template = templateCache.stringsArray.get(result.strings);

      if (template !== undefined) {
        return template;
      } // If the TemplateStringsArray is new, generate a key from the strings
      // This key is shared between all templates with identical content


      var key = result.strings.join(marker); // Check if we already have a Template for this key

      template = templateCache.keyString.get(key);

      if (template === undefined) {
        // If we have not seen this key before, create a new Template
        template = new Template(result, result.getTemplateElement()); // Cache the Template for this key

        templateCache.keyString.set(key, template);
      } // Cache all future queries for this TemplateStringsArray


      templateCache.stringsArray.set(result.strings, template);
      return template;
    }
    var templateCaches = new Map();

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
    var parts = new WeakMap();
    /**
     * Renders a template result or other value to a container.
     *
     * To update a container with new values, reevaluate the template literal and
     * call `render` with the new result.
     *
     * @param result Any value renderable by NodePart - typically a TemplateResult
     *     created by evaluating a template tag like `html` or `svg`.
     * @param container A DOM parent to render to. The entire contents are either
     *     replaced, or efficiently updated if the same result type was previous
     *     rendered there.
     * @param options RenderOptions for the entire render tree rendered to this
     *     container. Render options must *not* change between renders to the same
     *     container, as those changes will not effect previously rendered DOM.
     */

    var render = function render(result, container, options) {
      var part = parts.get(container);

      if (part === undefined) {
        removeNodes(container, container.firstChild);
        parts.set(container, part = new NodePart(Object.assign({
          templateFactory: templateFactory
        }, options)));
        part.appendInto(container);
      }

      part.setValue(result);
      part.commit();
    };

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
    // This line will be used in regexes to search for lit-html usage.
    // TODO(justinfagnani): inject version number at build time

    (window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.1.2');
    /**
     * Interprets a template literal as an HTML template that can efficiently
     * render to and update a container.
     */

    var html = function html(strings) {
      for (var _len = arguments.length, values = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        values[_key - 1] = arguments[_key];
      }

      return new TemplateResult(strings, values, 'html', defaultTemplateProcessor);
    };
    /**
     * Interprets a template literal as an SVG template that can efficiently
     * render to and update a container.
     */

    var svg = function svg(strings) {
      for (var _len2 = arguments.length, values = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        values[_key2 - 1] = arguments[_key2];
      }

      return new SVGTemplateResult(strings, values, 'svg', defaultTemplateProcessor);
    };

    var cache = new Map();

    var scopeHTML = function scopeHTML(strings, tags, suffix) {
      if (suffix && tags && tags.length) {
        strings = strings.map(function (string) {
          if (cache.has(string)) {
            return cache.get(string);
          }
          /*
          const allTags = [...string.matchAll(/<(ui5-.*?)[> ]/g)].map(x => x[1]);
          allTags.forEach(t => {
          	if (!tags.includes(t)) {
          		throw new Error(`${t} not found in ${string}`);
          		// console.log(t, " in ", string);
          	}
          });
          */


          var result = string;
          tags.forEach(function (tag) {
            result = result.replace(new RegExp("(</?)(".concat(tag, ")(/?[> \t\n])"), "g"), "$1$2-".concat(suffix, "$3"));
          });
          cache.set(string, result);
          return result;
        });
      }

      return strings;
    };

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
    // TODO(kschaaf): Refactor into Part API?

    var createAndInsertPart = function createAndInsertPart(containerPart, beforePart) {
      var container = containerPart.startNode.parentNode;
      var beforeNode = beforePart === undefined ? containerPart.endNode : beforePart.startNode;
      var startNode = container.insertBefore(createMarker(), beforeNode);
      container.insertBefore(createMarker(), beforeNode);
      var newPart = new NodePart(containerPart.options);
      newPart.insertAfterNode(startNode);
      return newPart;
    };

    var updatePart = function updatePart(part, value) {
      part.setValue(value);
      part.commit();
      return part;
    };

    var insertPartBefore = function insertPartBefore(containerPart, part, ref) {
      var container = containerPart.startNode.parentNode;
      var beforeNode = ref ? ref.startNode : containerPart.endNode;
      var endNode = part.endNode.nextSibling;

      if (endNode !== beforeNode) {
        reparentNodes(container, part.startNode, endNode, beforeNode);
      }
    };

    var removePart = function removePart(part) {
      removeNodes(part.startNode.parentNode, part.startNode, part.endNode.nextSibling);
    }; // Helper for generating a map of array item to its index over a subset
    // of an array (used to lazily generate `newKeyToIndexMap` and
    // `oldKeyToIndexMap`)


    var generateMap = function generateMap(list, start, end) {
      var map = new Map();

      for (var i = start; i <= end; i++) {
        map.set(list[i], i);
      }

      return map;
    }; // Stores previous ordered list of parts and map of key to index


    var partListCache = new WeakMap();
    var keyListCache = new WeakMap();
    /**
     * A directive that repeats a series of values (usually `TemplateResults`)
     * generated from an iterable, and updates those items efficiently when the
     * iterable changes based on user-provided `keys` associated with each item.
     *
     * Note that if a `keyFn` is provided, strict key-to-DOM mapping is maintained,
     * meaning previous DOM for a given key is moved into the new position if
     * needed, and DOM will never be reused with values for different keys (new DOM
     * will always be created for new keys). This is generally the most efficient
     * way to use `repeat` since it performs minimum unnecessary work for insertions
     * amd removals.
     *
     * IMPORTANT: If providing a `keyFn`, keys *must* be unique for all items in a
     * given call to `repeat`. The behavior when two or more items have the same key
     * is undefined.
     *
     * If no `keyFn` is provided, this directive will perform similar to mapping
     * items to values, and DOM will be reused against potentially different items.
     */

    var repeat = directive(function (items, keyFnOrTemplate, template) {
      var keyFn;

      if (template === undefined) {
        template = keyFnOrTemplate;
      } else if (keyFnOrTemplate !== undefined) {
        keyFn = keyFnOrTemplate;
      }

      return function (containerPart) {
        if (!(containerPart instanceof NodePart)) {
          throw new Error('repeat can only be used in text bindings');
        } // Old part & key lists are retrieved from the last update
        // (associated with the part for this instance of the directive)


        var oldParts = partListCache.get(containerPart) || [];
        var oldKeys = keyListCache.get(containerPart) || []; // New part list will be built up as we go (either reused from
        // old parts or created for new keys in this update). This is
        // saved in the above cache at the end of the update.

        var newParts = []; // New value list is eagerly generated from items along with a
        // parallel array indicating its key.

        var newValues = [];
        var newKeys = [];
        var index = 0;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var item = _step.value;
            newKeys[index] = keyFn ? keyFn(item, index) : index;
            newValues[index] = template(item, index);
            index++;
          } // Maps from key to index for current and previous update; these
          // are generated lazily only when needed as a performance
          // optimization, since they are only required for multiple
          // non-contiguous changes in the list, which are less common.

        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        var newKeyToIndexMap;
        var oldKeyToIndexMap; // Head and tail pointers to old parts and new values

        var oldHead = 0;
        var oldTail = oldParts.length - 1;
        var newHead = 0;
        var newTail = newValues.length - 1; // Overview of O(n) reconciliation algorithm (general approach
        // based on ideas found in ivi, vue, snabbdom, etc.):
        //
        // * We start with the list of old parts and new values (and
        //   arrays of their respective keys), head/tail pointers into
        //   each, and we build up the new list of parts by updating
        //   (and when needed, moving) old parts or creating new ones.
        //   The initial scenario might look like this (for brevity of
        //   the diagrams, the numbers in the array reflect keys
        //   associated with the old parts or new values, although keys
        //   and parts/values are actually stored in parallel arrays
        //   indexed using the same head/tail pointers):
        //
        //      oldHead v                 v oldTail
        //   oldKeys:  [0, 1, 2, 3, 4, 5, 6]
        //   newParts: [ ,  ,  ,  ,  ,  ,  ]
        //   newKeys:  [0, 2, 1, 4, 3, 7, 6] <- reflects the user's new
        //                                      item order
        //      newHead ^                 ^ newTail
        //
        // * Iterate old & new lists from both sides, updating,
        //   swapping, or removing parts at the head/tail locations
        //   until neither head nor tail can move.
        //
        // * Example below: keys at head pointers match, so update old
        //   part 0 in-place (no need to move it) and record part 0 in
        //   the `newParts` list. The last thing we do is advance the
        //   `oldHead` and `newHead` pointers (will be reflected in the
        //   next diagram).
        //
        //      oldHead v                 v oldTail
        //   oldKeys:  [0, 1, 2, 3, 4, 5, 6]
        //   newParts: [0,  ,  ,  ,  ,  ,  ] <- heads matched: update 0
        //   newKeys:  [0, 2, 1, 4, 3, 7, 6]    and advance both oldHead
        //                                      & newHead
        //      newHead ^                 ^ newTail
        //
        // * Example below: head pointers don't match, but tail
        //   pointers do, so update part 6 in place (no need to move
        //   it), and record part 6 in the `newParts` list. Last,
        //   advance the `oldTail` and `oldHead` pointers.
        //
        //         oldHead v              v oldTail
        //   oldKeys:  [0, 1, 2, 3, 4, 5, 6]
        //   newParts: [0,  ,  ,  ,  ,  , 6] <- tails matched: update 6
        //   newKeys:  [0, 2, 1, 4, 3, 7, 6]    and advance both oldTail
        //                                      & newTail
        //         newHead ^              ^ newTail
        //
        // * If neither head nor tail match; next check if one of the
        //   old head/tail items was removed. We first need to generate
        //   the reverse map of new keys to index (`newKeyToIndexMap`),
        //   which is done once lazily as a performance optimization,
        //   since we only hit this case if multiple non-contiguous
        //   changes were made. Note that for contiguous removal
        //   anywhere in the list, the head and tails would advance
        //   from either end and pass each other before we get to this
        //   case and removals would be handled in the final while loop
        //   without needing to generate the map.
        //
        // * Example below: The key at `oldTail` was removed (no longer
        //   in the `newKeyToIndexMap`), so remove that part from the
        //   DOM and advance just the `oldTail` pointer.
        //
        //         oldHead v           v oldTail
        //   oldKeys:  [0, 1, 2, 3, 4, 5, 6]
        //   newParts: [0,  ,  ,  ,  ,  , 6] <- 5 not in new map: remove
        //   newKeys:  [0, 2, 1, 4, 3, 7, 6]    5 and advance oldTail
        //         newHead ^           ^ newTail
        //
        // * Once head and tail cannot move, any mismatches are due to
        //   either new or moved items; if a new key is in the previous
        //   "old key to old index" map, move the old part to the new
        //   location, otherwise create and insert a new part. Note
        //   that when moving an old part we null its position in the
        //   oldParts array if it lies between the head and tail so we
        //   know to skip it when the pointers get there.
        //
        // * Example below: neither head nor tail match, and neither
        //   were removed; so find the `newHead` key in the
        //   `oldKeyToIndexMap`, and move that old part's DOM into the
        //   next head position (before `oldParts[oldHead]`). Last,
        //   null the part in the `oldPart` array since it was
        //   somewhere in the remaining oldParts still to be scanned
        //   (between the head and tail pointers) so that we know to
        //   skip that old part on future iterations.
        //
        //         oldHead v        v oldTail
        //   oldKeys:  [0, 1, -, 3, 4, 5, 6]
        //   newParts: [0, 2,  ,  ,  ,  , 6] <- stuck: update & move 2
        //   newKeys:  [0, 2, 1, 4, 3, 7, 6]    into place and advance
        //                                      newHead
        //         newHead ^           ^ newTail
        //
        // * Note that for moves/insertions like the one above, a part
        //   inserted at the head pointer is inserted before the
        //   current `oldParts[oldHead]`, and a part inserted at the
        //   tail pointer is inserted before `newParts[newTail+1]`. The
        //   seeming asymmetry lies in the fact that new parts are
        //   moved into place outside in, so to the right of the head
        //   pointer are old parts, and to the right of the tail
        //   pointer are new parts.
        //
        // * We always restart back from the top of the algorithm,
        //   allowing matching and simple updates in place to
        //   continue...
        //
        // * Example below: the head pointers once again match, so
        //   simply update part 1 and record it in the `newParts`
        //   array.  Last, advance both head pointers.
        //
        //         oldHead v        v oldTail
        //   oldKeys:  [0, 1, -, 3, 4, 5, 6]
        //   newParts: [0, 2, 1,  ,  ,  , 6] <- heads matched: update 1
        //   newKeys:  [0, 2, 1, 4, 3, 7, 6]    and advance both oldHead
        //                                      & newHead
        //            newHead ^        ^ newTail
        //
        // * As mentioned above, items that were moved as a result of
        //   being stuck (the final else clause in the code below) are
        //   marked with null, so we always advance old pointers over
        //   these so we're comparing the next actual old value on
        //   either end.
        //
        // * Example below: `oldHead` is null (already placed in
        //   newParts), so advance `oldHead`.
        //
        //            oldHead v     v oldTail
        //   oldKeys:  [0, 1, -, 3, 4, 5, 6] <- old head already used:
        //   newParts: [0, 2, 1,  ,  ,  , 6]    advance oldHead
        //   newKeys:  [0, 2, 1, 4, 3, 7, 6]
        //               newHead ^     ^ newTail
        //
        // * Note it's not critical to mark old parts as null when they
        //   are moved from head to tail or tail to head, since they
        //   will be outside the pointer range and never visited again.
        //
        // * Example below: Here the old tail key matches the new head
        //   key, so the part at the `oldTail` position and move its
        //   DOM to the new head position (before `oldParts[oldHead]`).
        //   Last, advance `oldTail` and `newHead` pointers.
        //
        //               oldHead v  v oldTail
        //   oldKeys:  [0, 1, -, 3, 4, 5, 6]
        //   newParts: [0, 2, 1, 4,  ,  , 6] <- old tail matches new
        //   newKeys:  [0, 2, 1, 4, 3, 7, 6]   head: update & move 4,
        //                                     advance oldTail & newHead
        //               newHead ^     ^ newTail
        //
        // * Example below: Old and new head keys match, so update the
        //   old head part in place, and advance the `oldHead` and
        //   `newHead` pointers.
        //
        //               oldHead v oldTail
        //   oldKeys:  [0, 1, -, 3, 4, 5, 6]
        //   newParts: [0, 2, 1, 4, 3,   ,6] <- heads match: update 3
        //   newKeys:  [0, 2, 1, 4, 3, 7, 6]    and advance oldHead &
        //                                      newHead
        //                  newHead ^  ^ newTail
        //
        // * Once the new or old pointers move past each other then all
        //   we have left is additions (if old list exhausted) or
        //   removals (if new list exhausted). Those are handled in the
        //   final while loops at the end.
        //
        // * Example below: `oldHead` exceeded `oldTail`, so we're done
        //   with the main loop.  Create the remaining part and insert
        //   it at the new head position, and the update is complete.
        //
        //                   (oldHead > oldTail)
        //   oldKeys:  [0, 1, -, 3, 4, 5, 6]
        //   newParts: [0, 2, 1, 4, 3, 7 ,6] <- create and insert 7
        //   newKeys:  [0, 2, 1, 4, 3, 7, 6]
        //                     newHead ^ newTail
        //
        // * Note that the order of the if/else clauses is not
        //   important to the algorithm, as long as the null checks
        //   come first (to ensure we're always working on valid old
        //   parts) and that the final else clause comes last (since
        //   that's where the expensive moves occur). The order of
        //   remaining clauses is is just a simple guess at which cases
        //   will be most common.
        //
        // * TODO(kschaaf) Note, we could calculate the longest
        //   increasing subsequence (LIS) of old items in new position,
        //   and only move those not in the LIS set. However that costs
        //   O(nlogn) time and adds a bit more code, and only helps
        //   make rare types of mutations require fewer moves. The
        //   above handles removes, adds, reversal, swaps, and single
        //   moves of contiguous items in linear time, in the minimum
        //   number of moves. As the number of multiple moves where LIS
        //   might help approaches a random shuffle, the LIS
        //   optimization becomes less helpful, so it seems not worth
        //   the code at this point. Could reconsider if a compelling
        //   case arises.

        while (oldHead <= oldTail && newHead <= newTail) {
          if (oldParts[oldHead] === null) {
            // `null` means old part at head has already been used
            // below; skip
            oldHead++;
          } else if (oldParts[oldTail] === null) {
            // `null` means old part at tail has already been used
            // below; skip
            oldTail--;
          } else if (oldKeys[oldHead] === newKeys[newHead]) {
            // Old head matches new head; update in place
            newParts[newHead] = updatePart(oldParts[oldHead], newValues[newHead]);
            oldHead++;
            newHead++;
          } else if (oldKeys[oldTail] === newKeys[newTail]) {
            // Old tail matches new tail; update in place
            newParts[newTail] = updatePart(oldParts[oldTail], newValues[newTail]);
            oldTail--;
            newTail--;
          } else if (oldKeys[oldHead] === newKeys[newTail]) {
            // Old head matches new tail; update and move to new tail
            newParts[newTail] = updatePart(oldParts[oldHead], newValues[newTail]);
            insertPartBefore(containerPart, oldParts[oldHead], newParts[newTail + 1]);
            oldHead++;
            newTail--;
          } else if (oldKeys[oldTail] === newKeys[newHead]) {
            // Old tail matches new head; update and move to new head
            newParts[newHead] = updatePart(oldParts[oldTail], newValues[newHead]);
            insertPartBefore(containerPart, oldParts[oldTail], oldParts[oldHead]);
            oldTail--;
            newHead++;
          } else {
            if (newKeyToIndexMap === undefined) {
              // Lazily generate key-to-index maps, used for removals &
              // moves below
              newKeyToIndexMap = generateMap(newKeys, newHead, newTail);
              oldKeyToIndexMap = generateMap(oldKeys, oldHead, oldTail);
            }

            if (!newKeyToIndexMap.has(oldKeys[oldHead])) {
              // Old head is no longer in new list; remove
              removePart(oldParts[oldHead]);
              oldHead++;
            } else if (!newKeyToIndexMap.has(oldKeys[oldTail])) {
              // Old tail is no longer in new list; remove
              removePart(oldParts[oldTail]);
              oldTail--;
            } else {
              // Any mismatches at this point are due to additions or
              // moves; see if we have an old part we can reuse and move
              // into place
              var oldIndex = oldKeyToIndexMap.get(newKeys[newHead]);
              var oldPart = oldIndex !== undefined ? oldParts[oldIndex] : null;

              if (oldPart === null) {
                // No old part for this value; create a new one and
                // insert it
                var newPart = createAndInsertPart(containerPart, oldParts[oldHead]);
                updatePart(newPart, newValues[newHead]);
                newParts[newHead] = newPart;
              } else {
                // Reuse old part
                newParts[newHead] = updatePart(oldPart, newValues[newHead]);
                insertPartBefore(containerPart, oldPart, oldParts[oldHead]); // This marks the old part as having been used, so that
                // it will be skipped in the first two checks above

                oldParts[oldIndex] = null;
              }

              newHead++;
            }
          }
        } // Add parts for any remaining new values


        while (newHead <= newTail) {
          // For all remaining additions, we insert before last new
          // tail, since old pointers are no longer valid
          var _newPart = createAndInsertPart(containerPart, newParts[newTail + 1]);

          updatePart(_newPart, newValues[newHead]);
          newParts[newHead++] = _newPart;
        } // Remove any remaining unused old parts


        while (oldHead <= oldTail) {
          var _oldPart = oldParts[oldHead++];

          if (_oldPart !== null) {
            removePart(_oldPart);
          }
        } // Save order of new parts for next round


        partListCache.set(containerPart, newParts);
        keyListCache.set(containerPart, newKeys);
      };
    });

    /**
     * @license
     * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
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
    /**
     * Stores the ClassInfo object applied to a given AttributePart.
     * Used to unset existing values when a new ClassInfo object is applied.
     */

    var classMapCache = new WeakMap();
    /**
     * A directive that applies CSS classes. This must be used in the `class`
     * attribute and must be the only part used in the attribute. It takes each
     * property in the `classInfo` argument and adds the property name to the
     * element's `classList` if the property value is truthy; if the property value
     * is falsey, the property name is removed from the element's `classList`. For
     * example
     * `{foo: bar}` applies the class `foo` if the value of `bar` is truthy.
     * @param classInfo {ClassInfo}
     */

    var classMap = directive(function (classInfo) {
      return function (part) {
        if (!(part instanceof AttributePart) || part instanceof PropertyPart || part.committer.name !== 'class' || part.committer.parts.length > 1) {
          throw new Error('The `classMap` directive must be used in the `class` attribute ' + 'and must be the only part in the attribute.');
        }

        var committer = part.committer;
        var element = committer.element; // handle static classes

        if (!classMapCache.has(part)) {
          element.className = committer.strings.join(' ');
        }

        var classList = element.classList; // remove old classes that no longer apply

        var oldInfo = classMapCache.get(part);

        for (var name in oldInfo) {
          if (!(name in classInfo)) {
            classList.remove(name);
          }
        } // add new classes


        for (var _name in classInfo) {
          var value = classInfo[_name];

          if (!oldInfo || value !== oldInfo[_name]) {
            // We explicitly want a loose truthy check here because
            // it seems more convenient that '' and 0 are skipped.
            var method = value ? 'add' : 'remove';
            classList[method](_name);
          }
        }

        classMapCache.set(part, classInfo);
      };
    });

    /**
     * @license
     * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
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
    /**
     * Stores the StyleInfo object applied to a given AttributePart.
     * Used to unset existing values when a new StyleInfo object is applied.
     */

    var styleMapCache = new WeakMap();
    /**
     * A directive that applies CSS properties to an element.
     *
     * `styleMap` can only be used in the `style` attribute and must be the only
     * expression in the attribute. It takes the property names in the `styleInfo`
     * object and adds the property values as CSS propertes. Property names with
     * dashes (`-`) are assumed to be valid CSS property names and set on the
     * element's style object using `setProperty()`. Names without dashes are
     * assumed to be camelCased JavaScript property names and set on the element's
     * style object using property assignment, allowing the style object to
     * translate JavaScript-style names to CSS property names.
     *
     * For example `styleMap({backgroundColor: 'red', 'border-top': '5px', '--size':
     * '0'})` sets the `background-color`, `border-top` and `--size` properties.
     *
     * @param styleInfo {StyleInfo}
     */

    var styleMap = directive(function (styleInfo) {
      return function (part) {
        if (!(part instanceof AttributePart) || part instanceof PropertyPart || part.committer.name !== 'style' || part.committer.parts.length > 1) {
          throw new Error('The `styleMap` directive must be used in the style attribute ' + 'and must be the only part in the attribute.');
        }

        var committer = part.committer;
        var style = committer.element.style; // Handle static styles the first time we see a Part

        if (!styleMapCache.has(part)) {
          style.cssText = committer.strings.join(' ');
        } // Remove old properties that no longer exist in styleInfo


        var oldInfo = styleMapCache.get(part);

        for (var name in oldInfo) {
          if (!(name in styleInfo)) {
            if (name.indexOf('-') === -1) {
              // tslint:disable-next-line:no-any
              style[name] = null;
            } else {
              style.removeProperty(name);
            }
          }
        } // Add or update properties


        for (var _name in styleInfo) {
          if (_name.indexOf('-') === -1) {
            // tslint:disable-next-line:no-any
            style[_name] = styleInfo[_name];
          } else {
            style.setProperty(_name, styleInfo[_name]);
          }
        }

        styleMapCache.set(part, styleInfo);
      };
    });

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
    // unsafeHTML directive, and the DocumentFragment that was last set as a value.
    // The DocumentFragment is used as a unique key to check if the last value
    // rendered to the part was with unsafeHTML. If not, we'll always re-render the
    // value passed to unsafeHTML.

    var previousValues = new WeakMap();
    /**
     * Renders the result as HTML, rather than text.
     *
     * Note, this is unsafe to use with any user-provided input that hasn't been
     * sanitized or escaped, as it may lead to cross-site-scripting
     * vulnerabilities.
     */

    var unsafeHTML = directive(function (value) {
      return function (part) {
        if (!(part instanceof NodePart)) {
          throw new Error('unsafeHTML can only be used in text bindings');
        }

        var previousValue = previousValues.get(part);

        if (previousValue !== undefined && isPrimitive(value) && value === previousValue.value && part.value === previousValue.fragment) {
          return;
        }

        var template = document.createElement('template');
        template.innerHTML = value; // innerHTML casts to string internally

        var fragment = document.importNode(template.content, true);
        part.setValue(fragment);
        previousValues.set(part, {
          value: value,
          fragment: fragment
        });
      };
    });

    function _templateObject() {
      var data = __chunk_1._taggedTemplateLiteral(["<style>", "</style>", ""]);

      _templateObject = function _templateObject() {
        return data;
      };

      return data;
    }
    var tags;
    var suffix;

    var setTags = function setTags(t) {
      tags = t;
    };

    var setSuffix = function setSuffix(s) {
      suffix = s;
    };

    var litRender = function litRender(templateResult, domNode, styles) {
      var _ref = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
          eventContext = _ref.eventContext;

      if (styles) {
        templateResult = html(_templateObject(), styles, templateResult);
      }

      render(templateResult, domNode, {
        eventContext: eventContext
      });
    };

    var scopedHtml = function scopedHtml(strings) {
      for (var _len = arguments.length, values = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        values[_key - 1] = arguments[_key];
      }

      return html.apply(void 0, [scopeHTML(strings, tags, suffix)].concat(values));
    };

    var scopedSvg = function scopedSvg(strings) {
      for (var _len2 = arguments.length, values = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        values[_key2 - 1] = arguments[_key2];
      }

      return svg.apply(void 0, [scopeHTML(strings, tags, suffix)].concat(values));
    };

    /*
    	lit-html directive that removes and attribute if it is undefined
    */

    var ifDefined = directive(function (value) {
      return function (part) {
        if (value === undefined && part instanceof AttributePart) {
          if (value !== part.value) {
            var name = part.committer.name;
            part.committer.element.removeAttribute(name);
          }
        } else if (part.committer && part.committer.element && part.committer.element.getAttribute(part.committer.name) === value) {
          part.setValue(noChange);
        } else {
          part.setValue(value);
        }
      };
    });

    exports.scopedHtml = scopedHtml;
    exports.styleMap = styleMap;
    exports.ifDefined = ifDefined;
    exports.setTags = setTags;
    exports.setSuffix = setSuffix;
    exports.litRender = litRender;
    exports.scopedSvg = scopedSvg;
    exports.classMap = classMap;
    exports.repeat = repeat;
    exports.unsafeHTML = unsafeHTML;

});
//# sourceMappingURL=chunk-52e7820d.js.map
