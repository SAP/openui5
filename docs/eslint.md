
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

In the tables below, each rule is linked to its description and we added some short reasoning for some rules.
You can create different rules for your project.

Ruleset
----------------

ESLint v1.6.0

### Possible Errors

|**Rule** |**ESLint recommended**|**UI5**|**Comment**|
|---------|------------------|---------------|-----------|
|[comma-dangle](http://eslint.org/docs/rules/comma-dangle)|error, "never" | error, "never" |  |
|[no-cond-assign](http://eslint.org/docs/rules/no-cond-assign) |error |error | |
|[no-console](http://eslint.org/docs/rules/no-console) |error |error | |
|[no-constant-condition](http://eslint.org/docs/rules/no-constant-condition)|error |error | |
|[no-control-regex](http://eslint.org/docs/rules/no-control-regex) |error |error | |
|[no-debugger](http://eslint.org/docs/rules/no-debugger) |error |error | |
|[no-dupe-args](http://eslint.org/docs/rules/no-dupe-args) |error |error | |
|[no-dupe-keys](http://eslint.org/docs/rules/no-dupe-keys) |error |error | |
|[no-duplicate-case](http://eslint.org/docs/rules/no-duplicate-case) |error | error | |
|[no-empty-character-class](http://eslint.org/docs/rules/no-empty-character-class) |error |error | |
|[no-empty](http://eslint.org/docs/rules/no-empty) |error |**~~error~~ warning** |`Note: Set to "warning" for compatibility with this release branch.` |
|[no-ex-assign](http://eslint.org/docs/rules/no-ex-assign) |error |error | |
|[no-extra-boolean-cast](http://eslint.org/docs/rules/no-extra-boolean-cast)|error |**warning** |Too many findings in UI5. Need to be fixed, then we might return to the default setting|
|[no-extra-parens](http://eslint.org/docs/rules/no-extra-parens) |off |**error, "functions"** |  |
|[no-extra-semi](http://eslint.org/docs/rules/no-extra-semi) |error |error | |
|[no-func-assign](http://eslint.org/docs/rules/no-func-assign) |error |error | |
|[no-inner-declarations](http://eslint.org/docs/rules/no-inner-declarations)|error, "functions" |error, "functions" | |
|[no-invalid-regexp](http://eslint.org/docs/rules/no-invalid-regexp) |error |error | |
|[no-irregular-whitespace](http://eslint.org/docs/rules/no-irregular-whitespace) |error |**~~error~~ warning** |`Note: Set to "warning" for compatibility with this release branch.` |
|[no-negated-in-lhs](http://eslint.org/docs/rules/no-negated-in-lhs) |error |error | |
|[no-obj-calls](http://eslint.org/docs/rules/no-obj-calls) |error |error | |
|[no-regex-spaces](http://eslint.org/docs/rules/no-regex-spaces) |error |error | |
|[no-sparse-arrays](http://eslint.org/docs/rules/no-sparse-arrays) |error |error | |
|[no-unexpected-multiline](http://eslint.org/docs/rules/no-unexpected-multiline) |off |TBD (off) | |
|[no-unreachable](http://eslint.org/docs/rules/no-unreachable) |error |error | |
|[use-isnan](http://eslint.org/docs/rules/use-isnan) |error |error | |
|[valid-jsdoc](http://eslint.org/docs/rules/valid-jsdoc) |off |**warning, "requireReturn": false** |Activated as a warning for testing purposes. The results of the current rule implementation have not been satisfying. Our main focus is on @public and @protected documentation. The @private documentation is done more lazily, so we get too many warnings for it (we don’t really care if all parameters of a private method are documented. A comment that describes the intent of the method is sometimes helpful enough). Other aspects that are relevant for us are not checked at all (correct usage of @private @public without additional content for example). That's why we run this rule with level warning only. Maybe we'll contribute or implement our own rule in future. |
|[valid-typeof](http://eslint.org/docs/rules/valid-typeof) |error |error | |


### Best practices

|**Rule** |**ESLint default**|**UI5**|**Comment**|
|---------|------------------|---------------|-----------|
|[accessor-pairs](http://eslint.org/docs/rules/accessor-pairs) |off |error | |
|[block-scoped-var](http://eslint.org/docs/rules/block-scoped-var) |off |**warning** |As long as block scope is not really available in Javascript, we think we shouldn't use var declarations that only _seem_ to use it. Therefore we would like to activate this rule with level error, but unfortunately there is a bug in it which complains about variables in switch cases. So it is currently only activated as a warning. |
|[complexity](http://eslint.org/docs/rules/complexity) |off |off | |
|[consistent-return](http://eslint.org/docs/rules/consistent-return) |off |**warning** |Some of our methods return a result only under certain circumstances and _undefined_ otherwise. We find it a valid implementation not to return anything or just to write “return;” in the undefined case. But the rule complains about that, so we've reduced its level to warning. |
|[curly](http://eslint.org/docs/rules/curly) |off, "all" |**error, "all"** | |
|[default-case](http://eslint.org/docs/rules/default-case) |off |**warning** |We regard a missing default case as an error, but first wanted to analyze how common this error is in our code. So we configured it as warning only. Might be raised to level error again in future. |
|[dot-notation](http://eslint.org/docs/rules/dot-notation) |off |off |Performance considerations suggest to prefer dot notation for accessing properties (Optimizers / JIT compilers are said to produce faster code for dot access). Nevertheless, there are some cases where we think consistency is worth more than ultimately fast property access. E.g. when some properties in an object are invalid as Javascript names while other names in the same object are. Then the code would be less readable when it used dot access for half of the names while using string access for the others (common example: HTTP headers in the Model layer). We plan to check whether locations with a need for string access are isolated enough to enable the rule for the remainder of our code.|
|[dot-location](http://eslint.org/docs/rules/dot-location) |off |off | |
|[eqeqeq](http://eslint.org/docs/rules/eqeqeq) |off |off |We don't run this rule as we like the semantic of the “something == null” check and heavily rely on “==” for string comparison (as we by design support string and String wrappers in parallel). We also haven't been able to give a precise, easy to evaluate specification of when to use "===" and when not. So while enhancing the rule would be nice, it currently is not very likely. |
|[guard-for-in](http://eslint.org/docs/rules/guard-for-in) |off |off |From jQuery we inherited the decision not to support scenarios where the Object.prototype has been enhanced with enumerable properties. So we don't activate this rule. |
|[no-alert](http://eslint.org/docs/rules/no-alert) |off |**error** | |
|[no-caller](http://eslint.org/docs/rules/no-caller) |off |**error** | |
|[no-div-regex](http://eslint.org/docs/rules/no-div-regex) |off |**error** |A rare edge case of regular expression literals. Relatively easy to avoid and improves readability. |
|[no-else-return](http://eslint.org/docs/rules/no-else-return) |off |off | |
|[no-empty-label](http://eslint.org/docs/rules/no-empty-label) |off |**error** | |
|[no-eq-null](http://eslint.org/docs/rules/no-eq-null) |off |off | |
|[no-eval](http://eslint.org/docs/rules/no-eval) |off |**error** | |
|[no-extend-native](http://eslint.org/docs/rules/no-extend-native) |off |**error** | |
|[no-extra-bind](http://eslint.org/docs/rules/no-extra-bind) |off |**error** | |
|[no-fallthrough](http://eslint.org/docs/rules/no-fallthrough) |error |error | |
|[no-floating-decimal](http://eslint.org/docs/rules/no-floating-decimal) |off |**error** |Easy to avoid, improves readability. |
|[no-implicit-coercion](http://eslint.org/docs/rules/no-implicit-coercion) |off |TBD (off) | |
|[no-implied-eval](http://eslint.org/docs/rules/no-implied-eval) |off |**error** | |
|[no-invalid-this](http://eslint.org/docs/rules/no-invalid-this) |off |TBD (off) | |
|[no-iterator](http://eslint.org/docs/rules/no-iterator) |off |**error** | |
|[no-labels](http://eslint.org/docs/rules/no-labels) |off |**error** | |
|[no-lone-blocks](http://eslint.org/docs/rules/no-lone-blocks) |off |**error** | |
|[no-loop-func](http://eslint.org/docs/rules/no-loop-func) |off |**error** | |
|[no-multi-spaces](http://eslint.org/docs/rules/no-multi-spaces) |off |TBD (off) | ~2000 findings |
|[no-multi-str](http://eslint.org/docs/rules/no-multi-str) |off |**error** | |
|[no-native-reassign](http://eslint.org/docs/rules/no-native-reassign) |off |**error** | |
|[no-new-func](http://eslint.org/docs/rules/no-new-func) |off |**error** | |
|[no-new-wrappers](http://eslint.org/docs/rules/no-new-wrappers) |off |**warning** |In general we agree to this rule but UI5 has features that rely on the use of new String(...). As soon as we have analyzed how isolated the usage of wrappers is, we might enforce this rule again. |
|[no-new](http://eslint.org/docs/rules/no-new) |off |**warning** | |
|[no-octal-escape](http://eslint.org/docs/rules/no-octal-escape) |off |**error** | |
|[no-octal](http://eslint.org/docs/rules/no-octal) |error |error | |
|[no-param-reassign](http://eslint.org/docs/rules/no-param-reassign) |off |TBD (off) | ~1000 findings |
|[no-process-env](http://eslint.org/docs/rules/no-process-env) |off |TBD (off) | 0 findings |
|[no-proto](http://eslint.org/docs/rules/no-proto) |off |**error** | |
|[no-redeclare](http://eslint.org/docs/rules/no-redeclare) |error |**warning** |We really would like to activate this rule but there are still too many findings. |
|[no-return-assign](http://eslint.org/docs/rules/no-return-assign) |off |**error** | |
|[no-script-url](http://eslint.org/docs/rules/no-script-url) |off |**error** | |
|[no-self-compare](http://eslint.org/docs/rules/no-self-compare) |off |**error** |Also seemed reasonable to us, but recently there are discussions whether we should allow it for the fast NaN check by x === x. |
|[no-sequences](http://eslint.org/docs/rules/no-sequences) |off |**error** | |
|[no-throw-literal](http://eslint.org/docs/rules/no-throw-literal) |off |TBD (off) | ~25 findings |
|[no-unused-expressions](http://eslint.org/docs/rules/no-unused-expressions)|off |**warning** |We often use statements like _something && something.doSomething()_ and we like it. |
|[no-useless-call](http://eslint.org/docs/rules/no-useless-call) |off |TBD (off) | |
|[no-useless-concat](http://eslint.org/docs/rules/no-useless-concat) |off |TBD (off) | |
|[no-void](http://eslint.org/docs/rules/no-void)|off |**error** | |
|[no-warning-comments](http://eslint.org/docs/rules/no-warning-comments) |off |**warning** |We use TODO markers. |
|[no-with](http://eslint.org/docs/rules/no-with) |off |**error** | |
|[radix](http://eslint.org/docs/rules/radix) |off |**error** |Potential source of errors. |
|[vars-on-top](http://eslint.org/docs/rules/vars-on-top) |off |TBD (off) | ~10000 findings |
|[wrap-iife](http://eslint.org/docs/rules/wrap-iife) |off |**error, "any"** |Readability is better when wrapping an immediately-invoked function expression (IIFE). As we couldn’t agree on a specific style, we use option "any". Most of our IIFEs use “outside” style. |
|[yoda](http://eslint.org/docs/rules/yoda) |off |**error** | |


### Strict mode

|**Rule** |**ESLint default**|**UI5**|**Comment**|
|---------|------------------|---------------|-----------|
|[strict](http://eslint.org/docs/rules/strict) |off |**~~error~~ warning, "function"** |`Note: Set to "warning" for compatibility with this release branch.` We want to avoid the risk when merging strict and non-strict code in a single file – although our current way of merging by design avoids this issue. |


### Variables

|**Rule** |**ESLint default**|**UI5**|**Comment**|
|---------|------------------|---------------|-----------|
|[init-declarations](http://eslint.org/docs/rules/init-declarations) |off |TBD (off) | |
|[no-catch-shadow](http://eslint.org/docs/rules/no-catch-shadow) |off |**error** | |
|[no-delete-var](http://eslint.org/docs/rules/no-delete-var) |error |error | |
|[no-label-var](http://eslint.org/docs/rules/no-label-var) |off |**error** | |
|[no-shadow-restricted-names](http://eslint.org/docs/rules/no-shadow-restricted-names)|off |**error** | |
|[no-shadow](http://eslint.org/docs/rules/no-shadow) |off |off | |
|[no-undef-init](http://eslint.org/docs/rules/no-undef-init) |off |**error** | |
|[no-undef](http://eslint.org/docs/rules/no-undef) |error |error | |
|[no-undefined](http://eslint.org/docs/rules/no-undefined) |off |off | |
|[no-unused-vars](http://eslint.org/docs/rules/no-unused-vars) |error, "vars": "all", "args": "after-used" |**error, "vars": "all", "args": "none"** |We allow unused function arguments for two reasons: it improves readability when overriding inherited methods and it is common to name all dependencies in the signature of the factory function of an AMD module. |
|[no-use-before-define](http://eslint.org/docs/rules/no-use-before-define) |off |**warning, "nofunc"** |Improves readability, but we have too many findings. We explicitly allow out of order function declarations. |


### Stylistic

|**Rule** |**ESLint default**|**UI5**|**Comment**|
|---------|------------------|---------------|-----------|
|[array-bracket-spacing](http://eslint.org/docs/rules/array-bracket-spacing) |off |TBD (off) | |
|[block-spacing](http://eslint.org/docs/rules/block-spacing) |off |TBD (off) | |
|[brace-style](http://eslint.org/docs/rules/brace-style) |off, "1tbs" |**error, "1tbs", { "allowSingleLine": true }** |For developers that newly join a team this might be an annoying topic, but defining a commonly expected brace-style helps a lot to make the sources look more uniform (which in turn should improve readability). |
|[camelcase](http://eslint.org/docs/rules/camelcase) |off |**warning** | |
|[comma-spacing](http://eslint.org/docs/rules/comma-spacing) |off |TBD (off) | ~2000 findings |
|[comma-style](http://eslint.org/docs/rules/comma-style) |off |TBD (off) | |
|[computed-property-spacing](http://eslint.org/docs/rules/computed-property-spacing) |off |TBD (off) | |
|[consistent-this](http://eslint.org/docs/rules/consistent-this) |off, "that" |**warning, "that"** |We like to enforce 'that'. Again, we think it is helpful to standardize on that. Nevertheless, this rule is not without trouble. There are a few cases where naming the substitute with a more appropriate name than "that" can help to understand the code. Therefore we set the rule to warning. |
|[eol-last](http://eslint.org/docs/rules/eol-last) |off |off | |
|[func-names](http://eslint.org/docs/rules/func-names) |off |off | |
|[func-style](http://eslint.org/docs/rules/func-style) |off |off | |
|[id-length](http://eslint.org/docs/rules/id-length) |off |TBD (off) | |
|[id-match](http://eslint.org/docs/rules/id-match) |off |TBD (off) | |
|[indent](http://eslint.org/docs/rules/indent) |off |TBD (off) | ~150000 findings |
|[jsx-quotes](http://eslint.org/docs/rules/jsx-quotes) |off |off | We don't use JSX. |
|[key-spacing](http://eslint.org/docs/rules/key-spacing) |off | TBD (off) | ~15000 findings |
|[lines-around-comment](http://eslint.org/docs/rules/lines-around-comment) |off |TBD (off) | ~10000 findings |
|[linebreak-style](http://eslint.org/docs/rules/linebreak-style) |off |**error** | |
|[max-nested-callbacks](http://eslint.org/docs/rules/max-nested-callbacks) |off, 2 |**warning, 3** | |
|[new-cap](http://eslint.org/docs/rules/new-cap) |off |**warning** |In general, we like that rule but there are many places where we access classes in a generic way and then there is a conflict between lower case for variables and upper case for class constructors. |
|[new-parens](http://eslint.org/docs/rules/new-parens) |off |**error** | |
|[newline-after-var](http://eslint.org/docs/rules/newline-after-var) |off |TBD (off) | ~7000 findings |
|[no-array-constructor](http://eslint.org/docs/rules/no-array-constructor) |off |**error** | |
|[no-continue](http://eslint.org/docs/rules/no-continue) |off |TBD (off) | ~100 findings |
|[no-inline-comments](http://eslint.org/docs/rules/no-inline-comments) |off |TBD (off) | ~4000 findings |
|[no-lonely-if](http://eslint.org/docs/rules/no-lonely-if) |off |**warning** |We prefer if else if cascades, but there are currently too many findings. |
|[no-mixed-spaces-and-tabs](http://eslint.org/docs/rules/no-mixed-spaces-and-tabs)|error |**error, "smart-tabs" | |
|[no-multiple-empty-lines](http://eslint.org/docs/rules/no-multiple-empty-lines) |off |TBD (off) | ~563 findings |
|[no-nested-ternary](http://eslint.org/docs/rules/no-nested-ternary) |off |**error** |Again, this rule has been activated to improve code readability - although we would like to support fully parenthesized nested ternaries. But the rule currently doesn’t allow that. |
|[no-negated-condition](http://eslint.org/docs/rules/no-negated-condition) |off |TBD (off) | |
|[no-new-object](http://eslint.org/docs/rules/no-new-object) |off |**error** | |
|[no-restricted-syntax](http://eslint.org/docs/rules/no-restricted-syntax) |off |TBD (off) | |
|[no-spaced-func](http://eslint.org/docs/rules/no-spaced-func) |off |**error** | |
|[no-ternary](http://eslint.org/docs/rules/no-ternary) |off |off | |
|[no-trailing-spaces](http://eslint.org/docs/rules/no-trailing-spaces) |off |off |We wanted to avoid the noise when changing this and there are some places where we would like the rule to accept trailing spaces, e.g. in JSDoc comments. |
|[no-underscore-dangle](http://eslint.org/docs/rules/no-underscore-dangle) |off |off |We often (but not always) use a leading underscore for private methods. |
|[no-unneeded-ternary](http://eslint.org/docs/rules/no-unneeded-ternary) |off |TBD (off) | ~50 findings |
|[object-curly-spacing](http://eslint.org/docs/rules/object-curly-spacing) |off |TBD (off) | ~1000 findings |
|[one-var](http://eslint.org/docs/rules/one-var) |off |off | |
|[operator-assignment](http://eslint.org/docs/rules/operator-assignment) |off |TBD (off) | ~100 findings |
|[operator-linebreak](http://eslint.org/docs/rules/operator-linebreak) |off |TBD | ~400 findings |
|[padded-blocks](http://eslint.org/docs/rules/padded-blocks) |off |TBD (off) | ~75000 findings |
|[quote-props](http://eslint.org/docs/rules/quote-props) |off |**error, "as-needed", { "keywords": true, "unnecessary": false }** |Security Scan Tool requires ES3 syntax. |
|[quotes](http://eslint.org/docs/rules/quotes) |off |TBD (off) | |
|[require-jsdoc](http://eslint.org/docs/rules/require-jsdoc) |off |TBD (off) | |
|[semi-spacing](http://eslint.org/docs/rules/semi-spacing) |off |**warning** |Set to warning as there are still a few occurrences. We would like to set this to error in future. |
|[semi](http://eslint.org/docs/rules/semi) |off |**error** | |
|[sort-vars](http://eslint.org/docs/rules/sort-vars) |off |off | |
|[space-after-keywords](http://eslint.org/docs/rules/space-after-keywords) |off, "always" |**error, "always"** |A majority in the team voted for this rule for better readability. |
|[space-before-keywords](http://eslint.org/docs/rules/space-before-keywords) |off, "always" |off | |
|[space-before-blocks](http://eslint.org/docs/rules/space-before-blocks) |off |TBD (off) | ~2000 findings |
|[space-before-function-paren](http://eslint.org/docs/rules/space-before-function-paren) |off |TBD (off) | ~10000 findings |
|[space-in-parens](http://eslint.org/docs/rules/space-in-parens) |off |TBD (off) | ~3000 findings |
|[space-infix-ops](http://eslint.org/docs/rules/space-infix-ops) |off |**error** | |
|[space-return-throw-case](http://eslint.org/docs/rules/space-return-throw-case) |off |**error** | |
|[space-unary-ops](http://eslint.org/docs/rules/space-unary-ops) |off, "words": true, "nonwords": false |**error, "words": true, "nonwords": false** |Again, a majority in the team voted for this rule for better readability. |
|[spaced-comment](http://eslint.org/docs/rules/spaced-comment) |off |TBD (off) | |
|[wrap-regex](http://eslint.org/docs/rules/wrap-regex) |off |off | |


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
