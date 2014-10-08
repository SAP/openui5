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
should be enabled for the projects.
You can create different rules for your project.

Ruleset
----------------

### Possible Errors

|**Rule** |**ESLint default**|**SAPUI5 Core**|**Comment**|
|---------|------------------|---------------|-----------|
|[no-cond-assign](http://eslint.org/docs/rules/no-cond-assign.html) |error |error | |
|[no-console](http://eslint.org/docs/rules/no-console.html) |error |error | |
|[no-constant-condition](http://eslint.org/docs/rules/no-constant-condition.html)|error |error | |
|[no-comma-dangle](http://eslint.org/docs/rules/no-comma-dangle.html) |error |**error/warning**|can be set to warning if lib only supports IE9|
|[no-control-regex](http://eslint.org/docs/rules/no-control-regex.html) |error |error | |
|[no-debugger](http://eslint.org/docs/rules/no-debugger.html) |error |error | |
|[no-dupe-keys](http://eslint.org/docs/rules/no-dupe-keys.html) |error |error | |
|[no-empty](http://eslint.org/docs/rules/no-empty.html) |error |error | |
|[no-empty-class](http://eslint.org/docs/rules/no-empty-class.html) |error |error | |
|[no-ex-assign](http://eslint.org/docs/rules/no-ex-assign.html) |error |error | |
|[no-extra-boolean-cast](http://eslint.org/docs/rules/no-extra-boolean-cast.html)|error |**warning** | |
|[no-extra-parens](http://eslint.org/docs/rules/no-extra-parens.html) |off |off | |
|[no-extra-semi](http://eslint.org/docs/rules/no-extra-semi.html) |error |error | |
|[no-func-assign](http://eslint.org/docs/rules/no-func-assign.html) |error |error | |
|[no-inner-declarations](http://eslint.org/docs/rules/no-inner-declarations.html)|error |error | |
|[no-invalid-regexp](http://eslint.org/docs/rules/no-invalid-regexp.html) |error |error | |
|[no-negated-in-lhs](http://eslint.org/docs/rules/no-negated-in-lhs.html) |error |error | |
|[no-obj-calls](http://eslint.org/docs/rules/no-obj-calls.html) |error |error | |
|[no-regex-spaces](http://eslint.org/docs/rules/no-regex-spaces.html) |error |error | |
|[no-sparse-arrays](http://eslint.org/docs/rules/no-sparse-arrays.html) |error |error | |
|[no-unreachable](http://eslint.org/docs/rules/no-unreachable.html) |error |error | |
|[use-isnan](http://eslint.org/docs/rules/use-isnan.html) |error |error | |
|[valid-jsdoc](http://eslint.org/docs/rules/valid-jsdoc.html) |off |**warning** |requireReturn = false|
|[valid-typeof](http://eslint.org/docs/rules/valid-typeof.html) |error |error |  |


### Best practices

|**Rule** |**ESLint default**|**SAPUI5 Core**|**Comment**|
|---------|------------------|---------------|-----------|
|[block-scoped-var](http://eslint.org/docs/rules/block-scoped-var.html) |off |**error** |currently only warning because of wrong behaviour in switch statement|
|[complexity](http://eslint.org/docs/rules/complexity.html) |off |off | |
|[consistent-return](http://eslint.org/docs/rules/consistent-return.html) |error |**warning** | |
|[curly](http://eslint.org/docs/rules/curly.html) |error |error | |
|[default-case](http://eslint.org/docs/rules/default-case.html) |off |**warning** | |
|[dot-notation](http://eslint.org/docs/rules/dot-notation.html) |error |**off** | |
|[eqeqeq](http://eslint.org/docs/rules/eqeqeq.html) |error |**warning** |smart |
|[guard-for-in](http://eslint.org/docs/rules/guard-for-in.html) |off |**error** | |
|[no-alert](http://eslint.org/docs/rules/no-alert.html) |error |error | |
|[no-caller](http://eslint.org/docs/rules/no-caller.html) |error |error | |
|[no-div-regex](http://eslint.org/docs/rules/no-div-regex.html) |off |**error** | |
|[no-else-return](http://eslint.org/docs/rules/no-else-return.html) |off |off | |
|[no-empty-label](http://eslint.org/docs/rules/no-empty-label.html) |error |error | |
|[no-eq-null](http://eslint.org/docs/rules/no-eq-null.html) |off |off | |
|[no-eval](http://eslint.org/docs/rules/no-eval.html) |error |error | |
|[no-extend-native](http://eslint.org/docs/rules/no-extend-native.html) |error |error | |
|[no-fallthrough](http://eslint.org/docs/rules/no-fallthrough.html) |error |error | |
|[no-floating-decimal](http://eslint.org/docs/rules/no-floating-decimal.html) |off |**error** | |
|[no-implied-eval](http://eslint.org/docs/rules/no-implied-eval.html) |error |error | |
|[no-labels](http://eslint.org/docs/rules/no-labels.html) |error |error | |
|[no-iterator](http://eslint.org/docs/rules/no-iterator.html) |error |error | |
|[no-lone-blocks](http://eslint.org/docs/rules/no-lone-blocks.html) |error |error | |
|[no-loop-func](http://eslint.org/docs/rules/no-loop-func.html) |error |error | |
|[no-multi-str](http://eslint.org/docs/rules/no-multi-str.html) |error |error | |
|[no-native-reassign](http://eslint.org/docs/rules/no-native-reassign.html) |error |error | |
|[no-new](http://eslint.org/docs/rules/no-new.html) |error |error | |
|[no-new-func](http://eslint.org/docs/rules/no-new-func.html) |error |error | |
|[no-new-wrappers](http://eslint.org/docs/rules/no-new-wrappers.html) |error |**warning** | |
|[no-octal](http://eslint.org/docs/rules/no-octal.html) |error |error | |
|[no-octal-escape](http://eslint.org/docs/rules/no-octal-escape.html) |error |error | |
|[no-proto](http://eslint.org/docs/rules/no-proto.html) |error |error | |
|[no-redeclare](http://eslint.org/docs/rules/no-redeclare.html) |error |**warning** | |
|[no-return-assign](http://eslint.org/docs/rules/no-return-assign.html) |error |error | |
|[no-script-url](http://eslint.org/docs/rules/no-script-url.html) |error |error | |
|[no-self-compare](http://eslint.org/docs/rules/no-self-compare.html) |off |**error** | |
|[no-sequences](http://eslint.org/docs/rules/no-sequences.html) |error |error | |
|[no-unused-expressions](http://eslint.org/docs/rules/no-unused-expressions.html)|error |**warning** | |
|[no-warning-comments](http://eslint.org/docs/rules/no-warning-comments.html) |off |**warning** | |
|[no-with](http://eslint.org/docs/rules/no-with.html) |error |error | |
|[radix](http://eslint.org/docs/rules/radix.html) |off |**error** | |
|[wrap-iife](http://eslint.org/docs/rules/wrap-iife.html) |off |**error** |any |
|[yoda](http://eslint.org/docs/rules/yoda.html) |error |error | |

### Strict mode

|**Rule** |**ESLint default**|**SAPUI5 Core**|**Comment**|
|---------|------------------|---------------|-----------|
|[global-strict](http://eslint.org/docs/rules/global-strict.html) |off |**error** | |
|[no-extra-strict](http://eslint.org/docs/rules/no-extra-strict.html)|error |error | |
|[strict](http://eslint.org/docs/rules/strict.html) |error |**warning** | |

### Variables

|**Rule** |**ESLint default**|**SAPUI5 Core**|**Comment**|
|---------|------------------|---------------|-----------|
|[no-catch-shadow](http://eslint.org/docs/rules/no-catch-shadow.html) |error |error | |
|[no-delete-var](http://eslint.org/docs/rules/no-delete-var.html) |error |error | |
|[no-label-var](http://eslint.org/docs/rules/no-label-var.html) |error |error | |
|[no-shadow](http://eslint.org/docs/rules/no-shadow.html) |error |error | |
|[no-shadow-restricted-names](http://eslint.org/docs/rules/no-shadow-restricted-names.html)|error |error | |
|[no-undef](http://eslint.org/docs/rules/no-undef.html) |error |error | |
|[no-undefined](http://eslint.org/docs/rules/no-undefined.html) |off |off | |
|[no-undef-init](http://eslint.org/docs/rules/no-undef-init.html) |error |error | |
|[no-unused-vars](http://eslint.org/docs/rules/no-unused-vars.html) |error |error |vars=all, args=none|
|[no-use-before-define](http://eslint.org/docs/rules/no-use-before-define.html) |error |**warning** | |

### Node.js

|**Rule** |**ESLint default**|**SAPUI5 Core**|**Comment**|
|---------|------------------|---------------|-----------|
|[handle-callback-err](http://eslint.org/docs/rules/handle-callback-err.html) |off |off | |
|[no-mixed-requires](http://eslint.org/docs/rules/no-mixed-requires.html) |off |off | |
|[no-new-require](http://eslint.org/docs/rules/no-new-require.html) |off |off | |
|[no-path-concat](http://eslint.org/docs/rules/no-path-concat.html) |off |off | |
|[no-process-exit](http://eslint.org/docs/rules/no-process-exit.html) |off |off | |
|[no-restricted-modules](http://eslint.org/docs/rules/no-restricted-modules.html)|off |off | |
|[no-sync](http://eslint.org/docs/rules/no-sync.html) |off |off | |

### Stylistic

|**Rule** |**ESLint default**|**SAPUI5 Core**|**Comment**|
|---------|------------------|---------------|-----------|
|[brace-style](http://eslint.org/docs/rules/brace-style.html) |off |**error** |singleLine = false|
|[camelcase](http://eslint.org/docs/rules/camelcase.html) |error |warning | |
|[consistent-this](http://eslint.org/docs/rules/consistent-this.html) |off |**error** |that |
|[eol-last](http://eslint.org/docs/rules/eol-last.html) |error |**off** | |
|[func-names](http://eslint.org/docs/rules/func-names.html) |off |off | |
|[func-style](http://eslint.org/docs/rules/func-style.html) |off |off | |
|[new-cap](http://eslint.org/docs/rules/new-cap.html) |error |**warning** | |
|[new-parens](http://eslint.org/docs/rules/new-parens.html) |error |error | |
|[no-nested-ternary](http://eslint.org/docs/rules/no-nested-ternary.html) |off |**error** | |
|[no-array-constructor](http://eslint.org/docs/rules/no-array-constructor.html) |error |error | |
|[no-lonely-if](http://eslint.org/docs/rules/no-lonely-if.html) |off |**error** | |
|[no-new-object](http://eslint.org/docs/rules/no-new-object.html) |error |error | |
|[no-spaced-func](http://eslint.org/docs/rules/no-spaced-func.html) |error |error | |
|[no-space-before-semi](http://eslint.org/docs/rules/no-space-before-semi.html) |error |error | |
|[no-ternary](http://eslint.org/docs/rules/no-ternary.html) |off |off | |
|[no-trailing-spaces](http://eslint.org/docs/rules/no-trailing-spaces.html) |error |**off** |error but too many places to change|
|[no-underscore-dangle](http://eslint.org/docs/rules/no-underscore-dangle.html) |error |**off** | |
|[no-wrap-func](http://eslint.org/docs/rules/no-wrap-func.html) |error |error | |
|[no-mixed-spaces-and-tabs](http://eslint.org/docs/rules/no-mixed-spaces-and-tabs.html)|error |error |smart |
|[quotes](http://eslint.org/docs/rules/quotes.html) |off |off | |
|[quote-props](http://eslint.org/docs/rules/quote-props.html) |off |off | |
|[semi](http://eslint.org/docs/rules/semi.html) |error |error | |
|[sort-vars](http://eslint.org/docs/rules/sort-vars.html) |off |off | |
|[space-after-keywords](http://eslint.org/docs/rules/space-after-keywords.html) |off |**error** |always |
|[space-in-brackets](http://eslint.org/docs/rules/space-in-brackets.html) |off |off | |
|[space-infix-ops](http://eslint.org/docs/rules/space-infix-ops.html) |error |error | |
|[space-return-throw-case](http://eslint.org/docs/rules/space-return-throw-case.html) |error |error | |
|[space-unary-word-ops](http://eslint.org/docs/rules/space-unary-word-ops.html) |off |**error** | |
|[max-nested-callbacks](http://eslint.org/docs/rules/max-nested-callbacks.html) |off |**warning** |3 |
|[one-var](http://eslint.org/docs/rules/one-var.html) |off |off | |
|[wrap-regex](http://eslint.org/docs/rules/wrap-regex.html) |off |off | |

### Legacy

|**Rule** |**ESLint default**|**SAPUI5 Core**|**Comment**|
|---------|------------------|---------------|-----------|
|[max-depth](http://eslint.org/docs/rules/max-depth.html) |off |off | |
|[max-len](http://eslint.org/docs/rules/max-len.html) |off |off | |
|[max-params](http://eslint.org/docs/rules/max-params.html) |off |off | |
|[max-statements](http://eslint.org/docs/rules/max-statements.html)|off |off | |
|[no-bitwise](http://eslint.org/docs/rules/no-bitwise.html) |off |off | |
|[no-plusplus](http://eslint.org/docs/rules/no-plusplus.html) |off |off | |


Technical Ruleset
----------------

To apply these rules in other projects, you can use the following ESLint settings:
```
{
	"env": {
		"browser": true
	},
	"globals": {
		"sap": true,
		"jQuery": true
	},
	"rules": {
		"block-scoped-var": 1,
		"brace-style": [2, "1tbs", { "allowSingleLine": true }],
		"consistent-this": 2,
		"global-strict": 2,
		"no-div-regex": 2,
		"no-floating-decimal": 2,
		"no-self-compare": 2,
		"no-mixed-spaces-and-tabs": [2, true],
		"no-nested-ternary": 2,
		"no-unused-vars": [2, {"vars":"all", "args":"none"}],
		"radix": 2,
		"space-after-keywords": [2, "always"],
		"space-unary-word-ops": 2,
		"wrap-iife": [2, "any"],

		"camelcase": 1,
		"consistent-return": 1,
		"max-nested-callbacks": [1, 3],
		"new-cap": 1,
		"no-extra-boolean-cast": 1,
		"no-lonely-if": 1,
		"no-new": 1,
		"no-new-wrappers": 1,
		"no-redeclare": 1,
		"no-unused-expressions": 1,
		"no-use-before-define": [1, "nofunc"],
		"no-warning-comments": 1,
		"strict": 1,
		"valid-jsdoc": [1, {
			"requireReturn": false
		}],
		"default-case": 1,

		"dot-notation": 0,
		"eol-last": 0,
		"eqeqeq": 0,
		"no-trailing-spaces": 0,
		"no-underscore-dangle": 0,
		"quotes": 0
	}
}
```


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
