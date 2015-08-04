
ESLint Code Checks
==================

<!--
#### Table of Contents

1.  [Ruleset](#Ruleset)
    1.  [Possible Errors](#PossibleErrors)
    2.  [Best practices](#Bestpractices)
    3.  [Strict mode](#Strictmode)
    4.  [Variables](#Variables)
    5.  [Node.js](#Node.js)
    6.  [Stylistic](#Stylistic)
    7.  [Legacy](#Legacy)

2.  [Eclipse Integration](#EclipseIntegration)
    1.  [Validation](#Validation)
        1.  [Install](#Install)
        2.  [Configuration](#Configuration)
        3.  [Validating files](#Validatingfiles)

    2.  [Formatter](#Formatter)

3.  [Maven Integration](#MavenIntegration)
-->

UI5 uses ESLint to check JavaScript sources. We agreed to a set of rules which
should be enabled for our projects.

In the tables below, each rule is linked to its description and we added some short reasoning whenever our configuration differs from the ESLint default settings.
You can create different rules for your project.

Ruleset
----------------

### Possible Errors

|**Rule** |**ESLint default**|**UI5**|**Comment**|
|---------|------------------|---------------|-----------|
|[no-cond-assign](http://eslint.org/docs/rules/no-cond-assign.html) |error |error | |
|[no-console](http://eslint.org/docs/rules/no-console.html) |error |error | |
|[no-constant-condition](http://eslint.org/docs/rules/no-constant-condition.html)|error |error | |
|[no-comma-dangle](http://eslint.org/docs/rules/no-comma-dangle.html) |error |**error/warning**|Since ECMASCript5, this is no longer an error. So we enforce it only in those libraries that declare support for IE8 (sap.ui.core, sap.ui.commons, sap.ui.ux3, sap.ui.table). Default is off.|
|[no-control-regex](http://eslint.org/docs/rules/no-control-regex.html) |error |error | |
|[no-debugger](http://eslint.org/docs/rules/no-debugger.html) |error |error | |
|[no-dupe-keys](http://eslint.org/docs/rules/no-dupe-keys.html) |error |error | |
|[no-empty](http://eslint.org/docs/rules/no-empty.html) |error |error | |
|[no-empty-class](http://eslint.org/docs/rules/no-empty-class.html) |error |error | |
|[no-ex-assign](http://eslint.org/docs/rules/no-ex-assign.html) |error |error | |
|[no-extra-boolean-cast](http://eslint.org/docs/rules/no-extra-boolean-cast.html)|error |**warning** |Too many findings in UI5. Need to be fixed, then we might return to the default setting|
|[no-extra-parens](http://eslint.org/docs/rules/no-extra-parens.html) |off |off | |
|[no-extra-semi](http://eslint.org/docs/rules/no-extra-semi.html) |error |error | |
|[no-func-assign](http://eslint.org/docs/rules/no-func-assign.html) |error |error | |
|[no-inner-declarations](http://eslint.org/docs/rules/no-inner-declarations.html)|error |error | |
|[no-invalid-regexp](http://eslint.org/docs/rules/no-invalid-regexp.html) |error |error | |
|[no-irregular-whitespace](http://eslint.org/docs/rules/no-irregular-whitespace) |error |error | |
|[no-negated-in-lhs](http://eslint.org/docs/rules/no-negated-in-lhs.html) |error |error | |
|[no-obj-calls](http://eslint.org/docs/rules/no-obj-calls.html) |error |error | |
|[no-regex-spaces](http://eslint.org/docs/rules/no-regex-spaces.html) |error |error | |
|[no-sparse-arrays](http://eslint.org/docs/rules/no-sparse-arrays.html) |error |error | |
|[no-unreachable](http://eslint.org/docs/rules/no-unreachable.html) |error |error | |
|[use-isnan](http://eslint.org/docs/rules/use-isnan.html) |error |error | |
|[valid-jsdoc](http://eslint.org/docs/rules/valid-jsdoc.html) |off |**warning** |Activated as a warning for testing purposes (with option requireReturn = false). The results of the current rule implementation have not been satisfying. Our main focus is on @public and @protected documentation. The @private documentation is done more lazily, so we get too many warnings for it (we don’t really care if all parameters of a private method are documented. A comment that describes the intent of the method is sometimes helpful enough). Other aspects that are relevant for us are not checked at all (correct usage of @private @public without additional content for example). That's why we run this rule with level warning only. Maybe we'll contribute or implement our own rule in future.|
|[valid-typeof](http://eslint.org/docs/rules/valid-typeof.html) |error |error |  |


### Best practices

|**Rule** |**ESLint default**|**UI5**|**Comment**|
|---------|------------------|---------------|-----------|
|[block-scoped-var](http://eslint.org/docs/rules/block-scoped-var.html) |off |**warning** |as long as block scope is not really available in Javascript, we think we shouldn't use var declarations that only _seem_ to use it. Therefore we would like to activate this rule with level error, but unfortunately there is a bug in it which complains about variables in switch cases. So it is currently only activated as a warning |
|[complexity](http://eslint.org/docs/rules/complexity.html) |off |off | |
|[consistent-return](http://eslint.org/docs/rules/consistent-return.html) |error |**warning** |some of our methods return a result only under certain circumstances and _undefined_ otherwise. We find it a valid implementation not to return anything or just to write “return;” in the undefined case. But the rule complains about that, so we've reduced its level to warning |
|[curly](http://eslint.org/docs/rules/curly.html) |error |error | |
|[default-case](http://eslint.org/docs/rules/default-case.html) |off |**warning** |we regard a missing default case as an error, but first wanted to analyze how common this error is in our code. So we configured it as warning only. Might be raised to level error again in future |
|[dot-notation](http://eslint.org/docs/rules/dot-notation.html) |error |**off** |Performance considerations suggest to prefer dot notation for accessing properties (Optimizers / JIT compilers are said to produce faster code for dot access). Nevertheless, there are some cases where we think consistency is worth more than ultimately fast property access. E.g. when some properties in an object are invalid as Javascript names while other names in the same object are. Then the code would be less readable when it used dot access for half of the names while using string access for the others (common example: HTTP headers in the Model layer). We plan to check whether locations with a need for string access are isolated enough to enable the rule for the remainder of our code.|
|[eqeqeq](http://eslint.org/docs/rules/eqeqeq.html) |error |**off** |We don't run this rule as we like the semantic of the “something == null” check and heavily rely on “==” for string comparison (as we by design support string and String wrappers in parallel). We also haven't been able to give a precise, easy to evaluate specification of when to use "===" and when not. So while enhancing the rule would be nice, it currently is not very likely. |
|[guard-for-in](http://eslint.org/docs/rules/guard-for-in.html) |off |off |From jQuery we inherited the decision not to support scenarios where the Object.prototype has been enhanced with enumerable properties. so we don't activate this rule. |
|[no-alert](http://eslint.org/docs/rules/no-alert.html) |error |error | |
|[no-caller](http://eslint.org/docs/rules/no-caller.html) |error |error | |
|[no-div-regex](http://eslint.org/docs/rules/no-div-regex.html) |off |**error** |A rare edge case of regular expression literals. Relatively easy to avoid and improves readability. |
|[no-else-return](http://eslint.org/docs/rules/no-else-return.html) |off |off | |
|[no-empty-label](http://eslint.org/docs/rules/no-empty-label.html) |error |error | |
|[no-eq-null](http://eslint.org/docs/rules/no-eq-null.html) |off |off | |
|[no-eval](http://eslint.org/docs/rules/no-eval.html) |error |error | |
|[no-extend-native](http://eslint.org/docs/rules/no-extend-native.html) |error |error | |
|[no-fallthrough](http://eslint.org/docs/rules/no-fallthrough.html) |error |error | |
|[no-floating-decimal](http://eslint.org/docs/rules/no-floating-decimal.html) |off |**error** |Easy to avoid, improves readability |
|[no-implied-eval](http://eslint.org/docs/rules/no-implied-eval.html) |error |error | |
|[no-labels](http://eslint.org/docs/rules/no-labels.html) |error |error | |
|[no-iterator](http://eslint.org/docs/rules/no-iterator.html) |error |error | |
|[no-lone-blocks](http://eslint.org/docs/rules/no-lone-blocks.html) |error |error | |
|[no-loop-func](http://eslint.org/docs/rules/no-loop-func.html) |error |error | |
|[no-multi-str](http://eslint.org/docs/rules/no-multi-str.html) |error |error | |
|[no-native-reassign](http://eslint.org/docs/rules/no-native-reassign.html) |error |error | |
|[no-new](http://eslint.org/docs/rules/no-new.html) |error |error | |
|[no-new-func](http://eslint.org/docs/rules/no-new-func.html) |error |error | |
|[no-new-wrappers](http://eslint.org/docs/rules/no-new-wrappers.html) |error |**warning** |in general we agree to this rule but UI5 has features that rely on the use of new String(...). As soon as we have analyzed how isolated the usage of wrappers is, we might enforce this rule again |
|[no-octal](http://eslint.org/docs/rules/no-octal.html) |error |error | |
|[no-octal-escape](http://eslint.org/docs/rules/no-octal-escape.html) |error |error | |
|[no-proto](http://eslint.org/docs/rules/no-proto.html) |error |error | |
|[no-redeclare](http://eslint.org/docs/rules/no-redeclare.html) |error |**warning** |we really would like to activate this rule but there are still too many findings |
|[no-return-assign](http://eslint.org/docs/rules/no-return-assign.html) |error |error | |
|[no-script-url](http://eslint.org/docs/rules/no-script-url.html) |error |error | |
|[no-self-compare](http://eslint.org/docs/rules/no-self-compare.html) |off |**error** |Also seemed reasonable to us, but recently there are discussions whether we should allow it for the fast NaN check by x === x |
|[no-sequences](http://eslint.org/docs/rules/no-sequences.html) |error |error | |
|[no-unused-expressions](http://eslint.org/docs/rules/no-unused-expressions.html)|error |**warning** |we often use statements like _something && something.doSomething()_ and we like it |
|[no-warning-comments](http://eslint.org/docs/rules/no-warning-comments.html) |off |**warning** |we use TODO markers |
|[no-with](http://eslint.org/docs/rules/no-with.html) |error |error | |
|[radix](http://eslint.org/docs/rules/radix.html) |off |**error** |potential source of error |
|[wrap-iife](http://eslint.org/docs/rules/wrap-iife.html) |off |**error** |readability is better when wrapping an immediately-invoked function expression (IIFE). As we couldn’t agree on a specific style, we use option "any". Most of our IIFEs use “outside” style |
|[yoda](http://eslint.org/docs/rules/yoda.html) |error |error | |

### Strict mode

|**Rule** |**ESLint default**|**UI5**|**Comment**|
|---------|------------------|---------------|-----------|
|[global-strict](http://eslint.org/docs/rules/global-strict.html) |off |**error** |We want to avoid the risk when merging strict and non-strict code in a single file – although our current way of merging by design avoids this issue |
|[no-extra-strict](http://eslint.org/docs/rules/no-extra-strict.html)|error |error | |
|[strict](http://eslint.org/docs/rules/strict.html) |error |**warning** |Outside the OpenUI5 repository, a lot of code doesn’t use strict mode yet, so we reduced it to a warning. Within OpenUI5 we might even use level error. |

### Variables

|**Rule** |**ESLint default**|**UI5**|**Comment**|
|---------|------------------|---------------|-----------|
|[no-catch-shadow](http://eslint.org/docs/rules/no-catch-shadow.html) |error |error | |
|[no-delete-var](http://eslint.org/docs/rules/no-delete-var.html) |error |error | |
|[no-label-var](http://eslint.org/docs/rules/no-label-var.html) |error |error | |
|[no-shadow](http://eslint.org/docs/rules/no-shadow.html) |error |error | |
|[no-shadow-restricted-names](http://eslint.org/docs/rules/no-shadow-restricted-names.html)|error |error | |
|[no-undef](http://eslint.org/docs/rules/no-undef.html) |error |error | |
|[no-undefined](http://eslint.org/docs/rules/no-undefined.html) |off |off | |
|[no-undef-init](http://eslint.org/docs/rules/no-undef-init.html) |error |error | |
|[no-unused-vars](http://eslint.org/docs/rules/no-unused-vars.html) |error |error |vars=all, args=none; we allow unused function arguments for two reasons: it improves readability when overriding inherited methods and it is common to name all dependencies in the signature of the factory function of an AMD module |
|[no-use-before-define](http://eslint.org/docs/rules/no-use-before-define.html) |error |**warning** |improves readability, but we have too many findings. We explicitly allow out of order function declarations |

### Node.js

|**Rule** |**ESLint default**|**UI5**|**Comment**|
|---------|------------------|---------------|-----------|
|[handle-callback-err](http://eslint.org/docs/rules/handle-callback-err.html) |off |off | |
|[no-mixed-requires](http://eslint.org/docs/rules/no-mixed-requires.html) |off |off | |
|[no-new-require](http://eslint.org/docs/rules/no-new-require.html) |off |off | |
|[no-path-concat](http://eslint.org/docs/rules/no-path-concat.html) |off |off | |
|[no-process-exit](http://eslint.org/docs/rules/no-process-exit.html) |off |off | |
|[no-restricted-modules](http://eslint.org/docs/rules/no-restricted-modules.html)|off |off | |
|[no-sync](http://eslint.org/docs/rules/no-sync.html) |off |off |  |

### Stylistic

|**Rule** |**ESLint default**|**UI5**|**Comment**|
|---------|------------------|---------------|-----------|
|[brace-style](http://eslint.org/docs/rules/brace-style.html) |off |**error** |singleLine = false;  For developers that newly join a team this might be an annoying topic, but defining a commonly expected brace-style helps a lot to make the sources look more uniform (which in turn should improve readability) |
|[camelcase](http://eslint.org/docs/rules/camelcase.html) |error |warning | |
|[consistent-this](http://eslint.org/docs/rules/consistent-this.html) |off |**error** |We enforce 'that'. Again, we think it is helpful to standardize on that. Nevertheless, this rule is not without trouble. There are a few cases where naming the substitute with a more appropriate name than "that" can help to understand the code. We deactivated the rule around such code locations, they have been isolated enough to do so |
|[eol-last](http://eslint.org/docs/rules/eol-last.html) |error |**off** | |
|[func-names](http://eslint.org/docs/rules/func-names.html) |off |off | |
|[func-style](http://eslint.org/docs/rules/func-style.html) |off |off | |
|[new-cap](http://eslint.org/docs/rules/new-cap.html) |error |**warning** |in general, we like that rule but there are many places where we access classes in a generic way and then there is a conflict between lower case for variables and upper case for class constructors |
|[new-parens](http://eslint.org/docs/rules/new-parens.html) |error |error | |
|[no-nested-ternary](http://eslint.org/docs/rules/no-nested-ternary.html) |off |**error** |Again, this rule has been activated to improve code readability - although we would like to support fully parenthesized nested ternaries. But the rule currently doesn’t allow that |
|[no-array-constructor](http://eslint.org/docs/rules/no-array-constructor.html) |error |error | |
|[no-lonely-if](http://eslint.org/docs/rules/no-lonely-if.html) |off |**warning** |We prefer if else if cascades, but there are currently too many findings |
|[no-new-object](http://eslint.org/docs/rules/no-new-object.html) |error |error | |
|[no-spaced-func](http://eslint.org/docs/rules/no-spaced-func.html) |error |error | |
|[no-space-before-semi](http://eslint.org/docs/rules/no-space-before-semi.html) |error |error | |
|[no-ternary](http://eslint.org/docs/rules/no-ternary.html) |off |off | |
|[no-trailing-spaces](http://eslint.org/docs/rules/no-trailing-spaces.html) |error |**off** |we wanted to avoid the noise when changing this and there are some places where we would like the rule to accept trailing spaces, e.g. in JSDoc comments|
|[no-underscore-dangle](http://eslint.org/docs/rules/no-underscore-dangle.html) |error |**off** |we often (but not always) use a leading underscore for private methods |
|[no-wrap-func](http://eslint.org/docs/rules/no-wrap-func.html) |error |error | |
|[no-mixed-spaces-and-tabs](http://eslint.org/docs/rules/no-mixed-spaces-and-tabs.html)|error |error |smart |
|[quotes](http://eslint.org/docs/rules/quotes.html) |off |off | |
|[quote-props](http://eslint.org/docs/rules/quote-props.html) |off |off | |
|[semi](http://eslint.org/docs/rules/semi.html) |error |error | |
|[sort-vars](http://eslint.org/docs/rules/sort-vars.html) |off |off | |
|[space-after-keywords](http://eslint.org/docs/rules/space-after-keywords.html) |off |**error** |a majority in the team voted for this rule for better readability |
|[space-in-brackets](http://eslint.org/docs/rules/space-in-brackets.html) |off |off | |
|[space-infix-ops](http://eslint.org/docs/rules/space-infix-ops.html) |error |error | |
|[space-return-throw-case](http://eslint.org/docs/rules/space-return-throw-case.html) |error |error | |
|[space-unary-ops](http://eslint.org/docs/rules/space-unary-ops.html) |off |**error** |again, a majority in the team voted for this rule for better readability |
|[max-nested-callbacks](http://eslint.org/docs/rules/max-nested-callbacks.html) |off |**warning** |3 |
|[one-var](http://eslint.org/docs/rules/one-var.html) |off |off | |
|[wrap-regex](http://eslint.org/docs/rules/wrap-regex.html) |off |off | |

### Legacy

|**Rule** |**ESLint default**|**UI5**|**Comment**|
|---------|------------------|---------------|-----------|
|[max-depth](http://eslint.org/docs/rules/max-depth.html) |off |off | |
|[max-len](http://eslint.org/docs/rules/max-len.html) |off |off | |
|[max-params](http://eslint.org/docs/rules/max-params.html) |off |off | |
|[max-statements](http://eslint.org/docs/rules/max-statements.html)|off |off | |
|[no-bitwise](http://eslint.org/docs/rules/no-bitwise.html) |off |off | |
|[no-plusplus](http://eslint.org/docs/rules/no-plusplus.html) |off |off | |


Technical Ruleset
----------------

To apply these rules in other projects, you can use the [.eslintrc](/.eslintrc) file from this repository.

<!-- TODO

Eclipse Integration
-------------------

**The Eclipse integration is still in development!**

### Validation

You can use the ESLint Eclipse validator to validate your code on-the-fly.

#### Install

-   Open Eclipse and go to "Help" —\> "Install New software…"
-   Enter "[            /eslint-eclipse/](http://veui5infra.dhcp.wdf.sap.corp:1080/repository/update-sites/eslint-eclipse/)" as URL.
-   Select "ESLint Eclipse Features"
-   Follow the wizard.

#### Configuration

By default the validator is enabled for all project. This can cause performance problems for projects which are not set up to use ESLint. This happens because Eclipse also tries to validate the target and all test resources if these files aren't ignored. Therefore it is recommended to disable the validator for builds in the general configuration.

-   Goto Windows —\> Preferences
-   Select "Validation"
-   Remove the checkmark for the ESLint Validator in the "build" column

If you want to see the markers directly after saving files in a project, go to the project settings and enable project specific validation settings. There the ESLint validator can be activated.

#### Validating files

The validation is either triggered by the validation build or manually. To trigger a validation manually right click on the file or folder and select validate. The errors are displayed in the "Markers" view.
-->



<!--
### Formatter

You can download a formatter for Eclipse [here](/trac/sapui5/attachment/wiki/InternalDocumentation/TestingEnvironment/ESLint/SAPUI5_Formatter.xml "Attachment 'SAPUI5_Formatter.xml' in InternalDocumentation/TestingEnvironment/ESLint")<span class="noprint"> [![Download](/trac/sapui5/chrome/common/download.png)](/trac/sapui5/raw-attachment/wiki/InternalDocumentation/TestingEnvironment/ESLint/SAPUI5_Formatter.xml "Download")</span>.

-->

<!--
Maven Integration
-----------------

You can validate the JS files during the maven build using the ESLint Maven Plugin. You should use a profile for the eslint validation.

``` wiki
<profile>
    <id>eslint.build</id>
    <build>
        <plugins>
            <plugin>
                <groupId>com.sap.eslint</groupId>
                <artifactId>eslint-maven-plugin</artifactId>
                <executions>
                    <execution>
                        <phase>verify</phase>
                        <goals>
                            <goal>eslint</goal>
                        </goals>
                    </execution>
                </executions>
                <configuration>
                    <includes>
                        <include>src/main/uilib/**</include>
                    </includes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</profile>
```
-->
