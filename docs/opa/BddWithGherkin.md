# Behaviour Driven Development with Gherkin

Gherkin is:

   * a [Behaviour Driven Development (BDD)](https://en.wikipedia.org/wiki/Behavior-driven_development) test framework
   * written in [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
   * fully compatible with [SAPUI5](https://openui5nightly.hana.ondemand.com), [OPA5](https://sapui5.hana.ondemand.com/sdk/#docs/guide/2696ab50faad458f9b4027ec2f9b884d.html) and [QUnit](https://qunitjs.com/)
   * a SAPUI5 port of the [Cucumber](https://cucumber.io/) tool (which was originally written in the Ruby programming language)

Advantages of using Gherkin:

   * **Executable Specifications:** write easy-to-understand and maintain integration tests
   * **Living Documentation:** ensure that your product specifications are always up-to-date as your software development project evolves
   * **Single Source of Truth:** reduce communication errors across your development team, because the product owner, developers and testers are all working from the same specification. As you know, errors at the requirements stage of the software development process are the most costly to fix!
   * **Business Value:** maximize the business value you get out of the time spent writing tests, and keep your focus on the customer and their requirements

# Gherkin Overview

The Gherkin library is composed of several parts:

   1. **Feature File:** this is the software specification, written in a special syntax itself called [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin). Feature files are human readable specifications, but what makes them special is that they are also machine readable. Features are composed of *test scenarios*, which are themselves composed of *test steps*.
   2. **Steps File:** the Steps file is a Rosetta stone that translates the Feature file into something a computer can understand and execute. Simultaneously, the Steps file contains the tests to be executed to ensure that the software behaves according to its specification. The main elements of a Steps file are called *step definitions*.
   3. **Test Harness:** stitches together the Feature file and Steps file and executes runtime tests on the result using a test framework such as QUnit.
   4. **DataTableUtils:** a convenience library for handling data tables and string normalization.

Here are a sample Feature file and Steps file, just to give you an idea of what they look like:

**Sample Feature File:**

```gherkin
Feature: Wearing sunscreen stops skin cancer

  Scenario: Apply sunscreen
    Given the sun is dangerous
    When I apply sunscreen
    Then I protect my skin
```
 
**Sample Steps File (Excerpt):**

```javascript
this.register(/^I protect my skin$/i, function() {
  this.assert.assertEqual(this.mySkin, 'protected');
});
```

# Getting Started

In the following sections, we will help you get started using Gherkin by guiding you through a practical example. We will assume that you are a developer that is reasonably familiar with JavaScript and SAPUI5. To follow the examples you will need a text editor, web browser (our examples will use Chrome) and Internet access.

After the practical example, we will cover multiple advanced topics in greater detail.

# Feature File Basics

The Gherkin syntax is a simple one. Each major software feature is written in a separate file. You will need to decide how you want to split up your software into features. For example, if you are testing a coffee machine, features might include: serving coffee, accepting money, dispensing change, setting the cost of each beverage, serving hot chocolate, serving hot water, etc. Each one of these features could have its own Feature file.

A Feature file contains exactly one *feature*, and this feature contains one or more *test scenarios*. Each test scenario contains one or more *test steps*. Test steps are the workhorse of a Feature file, as they describe the practical steps that the user needs to perform to execute the overall test scenario.

For example, for the accepting money feature, a test scenario might be that (1) the user must insert enough money into the machine before (2) the machine will serve a coffee. You could create a second test scenario, where the user (1) doesn't insert enough money and (2) the machine does not serve coffee. Each scenario in this example is composed of two steps.

Here is a sample Feature file that demonstrates its structure. Keywords are highlighted, everything else is free text that should be adapted to your specific case. You should write one or more scenarios:

```gherkin
Feature: this is the name of the feature

    Here you can describe the feature. Indentation is purely to make this
    more readable for you. This section will not be used for testing,
    it is solely for human consumption.

  Scenario: this is the scenario's name

      This is a comment about the scenario

    Given you make a certain assumption here
    And you make another assumption
    When some action is taken
    Then there is an expected response that you write here
    But there is an exception you should test for
    
  # comment lines must start with a #, and will be skipped by the parser

  Scenario: another scenario's name
    * you can also just create a bulleted list of steps
    * if you find the keywords tiresome
```

Feature files:

   * End with the file extension ".feature"
   * Have a specific structure characterized by new lines that begin with a keyword. Features start with `Feature:` and test scenarios start with `Scenario:`. Indentation is purely for readability and will not be parsed. Similarly, blank lines will be ignored by the parser.
   * Can include comments by beginning a line with the pound (`#`) symbol
   * Are composed of one or more test scenarios, which walk the user through using the software, what the user does, and what the expected results are. These scenarios are themselves composed of lines starting with the keywords `Given`, `When`, `Then`, `And`, `But` and `*`.

# Basic Tutorial

Let's dive into the specifics of using Gherkin by following an example. This tutorial is built from a [SAPUI5 Explored sample](http://veui5infra.dhcp.wdf.sap.corp:8080/demokit/explored.html#/sample/sap.ui.core.sample.gherkin.GherkinWithOPA5/preview). Feel free to take a look at the sample, as it includes all the code from this tutorial and more.

## Writing Your First Feature File

Do you like [lemmings](https://en.wikipedia.org/wiki/Lemming)? They are cute artic creatures similar to a hamster. According to legend, they occasionally throw themselves into the sea in a mass suicide attempt. Imagine that you are writing a web app that allows the user to save lemmings' lives by clicking on a button. In the Behaviour Driven Development (BDD) style, the first thing you should do is write Feature files to document what it is your app is supposed to do. A Feature file is written in the Gherkin syntax.
Try writing the following Feature file (make sure to give it the file extension `.feature`):

```gherkin
Feature: Clicking Buttons Is a Life Saving Activity

    Let's save some lemmings' lives

  Scenario: Click a button, save a life!
    Given I have started the app
      And I can see the life saving button
      And I check how many lemmings have been saved already
     When I click on the life saving button
     Then I save a lemming's life
```

## Executing a Test

In the Behaviour Driven Development (BDD) style, the next thing we should do is execute the test. This might seem strange since we haven't actually written a test yet, but this way we can see that our Feature file works. Also, if you can imagine working in the middle of a large project, sometimes some of the tests might already have been written by a colleague. So executing the tests immediately makes sense. Gherkin will notify us of all of the missing tests, and then we can proceed to write the missing tests one by one.

To actually execute the test we will need to create an HTML bootstrap test runner file, and a stub Steps file.

Here is a stub Steps file to get your started, with no step definitions included. You will need to adjust the path and filename in the call to `extend` to match your situation:

```javascript
sap.ui.define([
  "jquery.sap.global",
  "sap/ui/test/gherkin/StepDefinitions",
  "sap/ui/test/Opa5",
  "sap/ui/test/gherkin/dataTableUtils"
], function($, StepDefinitions, Opa5, dataTableUtils) {
  "use strict";

  return StepDefinitions.extend("GherkinWithOPA5.Steps", {
    init: function() {
    }
  });

});
```

To execute Gherkin tests, you will need to find a version of SAPUI5 that works for you. Here are some possibilities, sorted in order from most stable to least stable (but most cutting edge):

   * **Stable:** https://sapui5.hana.ondemand.com/resources/sap-ui-core.js
   * **Beta:** https://openui5beta.hana.ondemand.com/resources/sap-ui-core.js
   * **Nightly:** https://openui5nightly.hana.ondemand.com/resources/sap-ui-core.js

At the time of writing (September 2016), Gherkin is only available in the Beta and Nightly builds. At the moment I would recommend using the Nightly build. However, Gherkin will eventually become available in the Stable build as well, at which time I would recommend that version. All examples in this text will use the Nightly build, please correct this with whatever you prefer.

You can also see the [OpenUI5 Download Page](http://openui5.org/download.html) for more SAPUI5 download options.

Here is a sample HTML bootstrap file for Gherkin. In this example, the Feature file and Steps file are named `Requirements.feature` and `Steps.js`, respectively, and are located in the same directory as your HTML bootstrap. You will need to adjust the SAPUI5 `src` (if you don't want to use my suggestion), SAPUI5 `resourceroots`, and the Feature and Steps file names to match your situation and your app:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Using Gherkin with OPA5</title>

    <script
      id="sap-ui-bootstrap"
      src="https://openui5nightly.hana.ondemand.com/resources/sap-ui-core.js"
      data-sap-ui-resourceroots='{"GherkinWithOPA5": "./"}'
      data-sap-ui-loglevel="INFO"
    ></script>

    <script>
      sap.ui.require([
        "jquery.sap.global",
        "sap/ui/test/gherkin/opa5TestHarness",
        "GherkinWithOPA5/Steps"
      ], function($, opa5TestHarness, Steps) {
        "use strict";

        opa5TestHarness.test({
          featurePath: "GherkinWithOPA5/Requirements",
          steps: Steps
        });

      });
    </script>

  </head>
  <body>
    <div id="qunit"></div>
    <div id="qunit-fixture"></div>
  </body>
</html>
```

When you load the HTML file in your browser the Gherkin tests will be automatically executed. If you are using Chrome, you may need to start it with the command line flags `--allow-file-access-from-files --disable-web-security`. Once everything is working correctly, you should see something like the following in your browser:

![IMAGE SHOWING INITIAL TEST EXECUTION](/images-bdd/executing-a-test.png)

As we already said, we expect the testing to fail because we haven't written any tests yet. You'll notice that Gherkin has helpfully told you that for the first test step, `I have started the app`, it was not able to find a matching step definition in the Steps file. Scrolling down, you should see that none of the test steps have been found. We will need to write these step definitions.

Looking back at the Feature file we wrote, `I have started the app` is the first test step in the test scenario. Hence, it makes sense that we would see this test step first in the test results. You can also see the exact wording of the Feature and Scenario text that you entered: `Feature: Clicking Buttons Is a Life Saving Activity: Scenario: Click a button, save a life!` This should make it easier for you to find your way around in the test results.

## Writing Your First (Failing) Test

To verify the Feature file we will implement a Steps file, which to recap is both the translation that allows the computer to understand the human-readable Feature file, and also the verification steps (tests) to be run. Once you have a working Feature file and can execute the test suite, then in BDD you are ready to write your first test. We will start by writing a simple test that we expect to fail.

In the Steps file, inside the `init` method, add code like the following:

```javascript
this.register(/^I have started the app$/i, function() {
  Opa5.assert.ok(false, 'This test will fail!');
});
```

The register method defines a new step definition and takes two arguments: (1) a *regular expression* to match against the test steps in the Feature file, and (2) a function to execute when there is a match. It's at test execution time that the Gherkin test harness will try to find a step definition with a matching regular expression, and execute the step definition's test function.

Try executing the test now. You should see something like this:

![IMAGE SHOWING THE RESULT OF WRITING YOUR FIRST FAILING TEST](/images-bdd/writing-your-first-failing-test.png)
 
In the above screenshot, step 1 is green because a matching step definition was successfully found in the Steps file. In Gherkin, the test harness always checks for the step definition existence first, before executing the step definition's function. After Gherkin has found a step definition, it will subsequently execute the step definition's function, and thus execute any QUnit assertions inside the function.

**Tip:** to avoid confusion, remember that the above screenshot is of a failing test. The step definition was found (hence step 1 is green) but the test verification failed, which is why step 2 is red.

In step 2, notice how the text `This test will fail!` is copied verbatim from the Steps file. You can use this functionality to make it easier to debug your test. We recommend that you start any QUnit assertion comment with the word `Verified` to make it easier to read your test executions later.

## Writing Your Second Failing Test

Let's write a bit more test code. To make a test useful, it will need to load your web app and verify its properties. We will use OPA5 for this purpose. Replace the code inside your Steps file's `init` method with the following code:

```javascript
var oOpa5 = new Opa5();

this.register(/^I have started the app$/i, function() {
  oOpa5.iStartMyAppInAFrame("Website.html");
});

this.register(/^I can see the life saving button$/i, function() {
  oOpa5.waitFor({
    id: "life-saving-button",
    success: function(oButton) {
      Opa5.assert.strictEqual(oButton.getText(), "Save a Lemming",
      "Verified that we can see the life saving button");
    }
  });
});
```

You will need to adapt the above code to fit your situation. When you execute this code you should see something like this:

![IMAGE SHOWING RESULTS FROM YOUR SECOND FAILING TEST](/images-bdd/writing-your-second-failing-test.png)
 
There are several important things to note here. For one, now that you are actually testing the app, you will see a popup overlay of the application under test appear in the bottom right corner of the window. This overlay is interactive, although you should wait until the test is complete before trying to interact with it. The overlay is extremely helpful for debugging your tests since at any given point in time you can see what state the app is in, particularly when the debugger is running and execution is paused. If the overlay is getting in the way, then after the tests have finished executing you can get rid of it by clicking on the `Close Frame` button at the top right.

In the above screenshot, steps 1 and 2 are passing because Gherkin was able to match the Feature file test step to a step definition in the Steps file. The test step `I have started the app` does not actually execute any verifications (*i.e.* it does not call any QUnit assertion functions) and hence there is no verification occurring between `I have started the app` and `I can see the life saving button`. Step 3 is the actual verification of the web app executed inside the step definition `I can see the life saving button` function, and since in this example the web app is an empty webpage, the test is failing. The error message `Failed to wait for check` is an OPA5 error that happens when the `waitFor` function fails to find the SAPUI5 control that's being searched for.

## Writing Your First Passing Test

To make the `I can see the life saving button` test pass, you will need to implement the web app that is under test.

Here is a simple stub for a test website (`Website.html`). You will need to update the SAPUI5 bootstrap source:

```html
<html>
  <head>
    <title>Using Gherkin with OPA5 Website</title>
    <script
      id="sap-ui-bootstrap"
      src="https://openui5nightly.hana.ondemand.com/resources/sap-ui-core.js"
      data-sap-ui-libs="sap.m,sap.ui.layout"
    ></script>
    <script src="WebsiteCode.js"></script>
  </head>
  <body class="sapUiBody">
    <div id="uiArea"></div>
  </body>
</html>
```

Here is some simple code for a web app (`WebsiteCode.js`):

```javascript
sap.ui.getCore().attachInit(function() {
  "use strict";

  var oLayout = new sap.ui.layout.VerticalLayout({id: "layout"});

  var oButton = new sap.m.Button({
    id: "life-saving-button",
    text: "Save a Lemming",
    press: function() {}
  });

  oLayout.addContent(oButton);
  oLayout.placeAt("uiArea");

});
```

Now when you execute the test you should see a passed verification step:

![IMAGE SHOWING PASSED VERIFICATION](/images-bdd/writing-your-first-passing-test.png)

Steps 1 and 2 passed because the corresponding step definitions were found in the Steps file. Here Gherkin is just confirming that it was able to find the step definitions. Step 3 was an actual verification step that executed a QUnit assertion to verify a property of the webpage. Step 4 is failing because you haven't written that step definition yet.

Your next activity would be to write a step definition for step 4, execute the test and see it fail, then write the new code in the app, execute the test and see it pass, and so on. 

## Conclusion on Implementing and Testing Features

Congratulations! You now know the basics of how to use Gherkin to execute integration tests in a Behaviour Driven Development (BDD) style.

We have just walked through one iteration of the BDD life cycle. Like Test Driven Development (TDD), BDD encourages us to write more tests by writing them first. Having more tests makes it cheaper and easier to maintain the code over time.

The ideal pattern for BDD iteration goes like this:

1.	Write a scenario in the Feature file
2.	Execute the test, see that the step definition is not found
3.	Write the step definition in the Steps file
4.	Execute the test, see the test fail
5.	Develop the missing code in the application
6.	Execute the test and watch it pass
7.	Return to step 1

# Advanced Topics

There are many topics that were not covered in the basic tutorial above. In this section we will go over all of the other Gherkin features, one by one.

## Tags

Gherkin supports the concept of tags. A tag is meta-data that can augment a feature or scenario with contextual information. Tags begin with an `at` symbol (`@`), appear on the line above the entity to which they apply, and are delimited by spaces. Tags can be added before a feature, scenario, scenario outline, or example.

For example:

```gherkin
@lemmings
Feature: Clicking Buttons Is a Life Saving Activity

  @saved @button
  Scenario: Click a button, save a life!
    Then  I save a lemming's life
```
    
Tags on a feature are inherited by all of its scenarios and scenario outlines. In addition, tags on a scenario outline are inherited by its examples. So in the above Feature file, the scenario has **three** tags: `@lemmings`, `@saved` and `@button`.

Tags have a number of potentially interesting uses:

   * Tags can be used like a category to create collections of features or scenarios, for example: `@sales` or `@human-resources`.
   * Tags can be used to refer to numbered documents, for example: `@BCP-1234567890`.
   * Tags can refer to the stage of the development process for that feature, for example: `@requirements`, `@development` or `@testing`.

Tags are generally just for helping humans understand the feature file. There is, however, one exception: the `@wip` tag. This tag indicates to the Gherkin test harness that it should skip that test during test execution. A skipped test is not executed and passes automatically. The special `@wip` tag is intended to be used when you're in the middle of implementing the tests for a Feature file. You can also use it on scenarios or features that you have no intention of testing.

Here's an example of a test execution with a skipped test:

![IMAGE SHOWING A SKIPPED TEST SCENARIO](/images-bdd/tags.png)

## Logging and Troubleshooting

During test execution, any errors will be logged to the test execution webpage. These error messages will usually be sufficient to figure out what is going on, for example, if an OPA5 `waitFor` call is failing.

Gherkin also logs information to the JavaScript console with the prefix `[GHERKIN]`. Please note that the Gherkin console logs are written at priority `INFO`. If at test execution time you don't see the logs then it's possible that SAPUI5 is not logging down to this level. The sample HTML bootstrap test runner file (shown in the section **Executing a Test**) includes the necessary attribute to add when loading SAPUI5, in order to ensure that you will see the logs.

Here are some examples of Gherkin console logs:

```
[GHERKIN] Running feature: 'Feature: Clicking Buttons Is a Life Saving Activity'
[GHERKIN] Running scenario: 'Scenario: Click a button, save a life!'
[GHERKIN] Running step: text='I see Alice' regex='/^I see (.*?)$/i'
```

These logs are particularly helpful for telling you what regular expression (the `regex` attribute, above, from a Steps file step definition) was matched with a particular Feature file test step (the `text` attribute, above). This can help you search for the right regular expression among your step definitions (for the case where your test code has gotten rather large), and could also help with troubleshooting if an unexpected regular expression is being matched.

## Background Scenarios

When writing a Feature file, some test steps might need to be executed for every scenario. In particular, the test step that loads the app is very frequently repeated for each test scenario. For example:

```gherkin
Feature: Clicking Buttons Is a Life Saving Activity

  Scenario: Click a button, save a life!
    Given I have started the app
    Then I save a lemming's life

  Scenario: The saved lemming has a name
    Given I have started the app
    Then I see Alice at the end of the list
```

In this case, you can consolidate all of the repeated steps into a single special scenario called a *background scenario*, which uses the keyword `Background`. The test steps in the background scenario get executed at the beginning of every other scenario in the feature. For example, the following Feature file is equivalent to the one shown above:

```gherkin
Feature: Clicking Buttons Is a Life Saving Activity

  Background:
    Given I have started the app

  Scenario: Click a button, save a life!
    Then I save a lemming's life

  Scenario: The saved lemming has a name
    Then I see Alice at the end of the list
```

## Step Arguments and Regular Expressions

When writing Feature file test steps, you might end up in a situation where test steps are frequently repeated, but with a slight variation between each step. For example:

```gherkin
Scenario: Save one lemming
  When I click on the life saving button 1 time
  Then I see Alice at the end of the list of saved lemmings

Scenario: Save two lemmings
  When I click on the life saving button 2 times
  Then I see Bob at the end of the list of saved lemmings
```

If you were to write a Steps file for the above Feature file, in the worst case you might have to write 4 separate step definitions. The problem would only get worse if you needed to write more scenarios. However, using *step arguments* you can consolidate the 4 step definitions into only 2 step definitions (written here in pseudo-code):

```
I click on the life saving button X time(s)
I see <NAME> at the end of the list of saved lemmings
```

How does this work in real JavaScript code? When you write the step definition's regular expression, you can use a regular expression concept called capturing groups to specify arguments to extract from the natural language of the test step. If you've never worked with regular expressions before there is definitely a learning curve here, but it's a really powerful tool that is worth learning. These capturing groups will be passed to the test function as parameters (of type string) that you can name whatever you want. Continuing the example above, here are the step definitions you could write:

```javascript
this.register(
  /^I click on the life saving button (\d+) times?$/i,
  function(sNumTimes) {}
);

this.register(
  /^I see (.*?) at the end of the list of saved lemmings$/i,
  function(sName) {}
);
```

**Caveat:** all parameters extracted from capturing groups are of the JavaScript type `string`. Hence, you will need to use (for example) `parseInt` to convert numbers into type `int` before you do a numerical comparison.

It is beyond the scope of this document to explain regular expressions in detail. There is more [regular expression documentation](https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions) online and you can easily test regular expressions at [Regex 101](http://regex101.com). To get you started, here are a few regular expression concepts that are especially useful in Gherkin:

```
(.*?) – captures any text into a parameter
(\d+) – captures any number into a parameter
\s* - will match 0 or more spaces
s? – will match the character "s" if it's there (replace "s" with any character)
(text)? – will capture "text" into a parameter if it's there
(?:text)? – will match "text" if it's there, without capturing into a parameter
```

**Caveat:** a common pitfall in regular expressions is that many characters are reserved and have a special meaning, in particular backslash (`\`), period (`.`), asterisk (`*`), plus (`+`), dash (`-`) and braces (`[]`, `()` and `{}` ). Put the backslash character in front of a special character to escape it so it is treated as plain text, for example: `\-` or `\+`.

If your regular expression contains multiple parameters, then they will be passed to the test function in the same order as they appear in the regular expression. For example:

```javascript
this.register(
  /^I click (\d+) times and see (.*?) at the end of the list$/i,
  function(sNumTimes, sName) {}
);
```

## Context

Imagine that you have the following Feature file scenario:

```gherkin
Scenario: some steps depend on each other
  Given I have a Latte Capuchino in front of me
  When I drink the coffee
  Then I feel less sleepy
```

Trying to implement the step definitions might be a bit challenging because in the second step, `I drink the coffee`, there is no mention of *which* coffee. Sometimes, to make a Feature file sound more natural, or just to reduce repetition, it can be beneficial to retain the context from one test step to the next. Fortunately, Gherkin makes this easy.

In Gherkin, the JavaScript `this` variable is unique for each scenario. Hence, any variables assigned to one step definition can be used in any subsequently executed step definitions within the same scenario. Every new scenario in the feature will start with a fresh `this` object. As a result, we could implement the above Feature file's step definitions like so:

```javascript
this.register(/^I have a (.*?) in front of me$/i, function(coffeeType) {
  this.coffeeType = coffeeType;
});

this.register(/^I drink the coffee$/i, function() {
  this.sleepinessBefore = user.getSleepiness();
  user.drink(this.coffeeType);
});

this.register(/^I feel less sleepy$/i, function() {
  Opa5.assert.ok(user.getSleepiness() < this.sleepinessBefore, "Verified...");
});
```

## QUnit Assert Object

To use QUnit for automated testing, it is necessary to use [QUnit's built-in assertion methods](https://api.qunitjs.com/assert/). QUnit defines these assertion methods in the [QUnit.assert](https://api.qunitjs.com/config/QUnit.assert) object. QUnit makes this object globally available to your test code, but it's a good practice to refer to the local `assert` object (particularly when you're doing asynchronous testing).

Gherkin makes the assert object available to you in two different ways, depending on whether you are using Opa5 or not. If you are using pure QUnit (no Opa5), then you can access the QUnit `assert` object inside of a step definition with `this.assert`. For example:

```javascript
this.register(/^I have launched my wombat$/i, function() {
  this.assert.strictEqual(this.myWombat.state, "launched");
});
```

If you are using Opa5, then Opa5 makes the QUnit assert object available to you inside of a step definition via `Opa5.assert`. For example:

```javascript
this.register(/^My wombat is currently in orbit$/i, function() {
  Opa5.assert.strictEqual(this.myWombat.state, "orbit");
});
```

## Data Tables
There might be times when you want to use a large amount of structured data in your test. For this you can use a concept called a *data table*. In a Feature file, a data table is placed underneath a test step and is composed of rows and columns, with rows delimited by new lines, and columns surrounded by the pipe (`|`) character. For example:

```gherkin
Scenario: lots of data
  Given I see the following lemmings:
    | Name    | Age in Months | Role         |
    | Alice   | 24            | Support      |
    | Bob     | 70            |              |
    | Charlie | 120           | Stories      |
```

In the Steps file, if a data table is included in the test scenario then an extra parameter will be passed at the end of the step definition function (after any step arguments that appear in the regular expression). For example:

```javascript
this.register(
  /^I see the following (.*?):$/i,
  function(sAnimalType, aDataTable) {}
);
```

Data tables are usually passed to the test function as a 2-dimensional array (an array of arrays). For example, the above Feature file data table would produce the following array in variable `aDataTable` at runtime:

```javascript
[
  ["Name", "Age in Months", "Role"],
  ["Alice", "24", "Support"],
  ["Bob", "70", ""],
  ["Charlie", "120", "Stories"]
]
```

If the Feature file data was a single row or a single column, then the test function will receive a simple array instead of a 2-dimensional array. For example, in this Feature file scenario:

```gherkin
Scenario: lots of data

  Given I see the following lemmings:
    | Alice   |
    | Bob     |
    | Charlie |

  And I see the following lemmings:
    | Alice | Bob | Charlie |
```

Both test steps will provide the following runtime value for `aDataTable`:

```javascript
["Alice", "Bob", "Charlie"]
```

## Data Table Utilities

The contents of the data table in the Feature file are sent to the step definition function in a raw form, with no modification. This raw format is often useful, however, sometimes a different format would be more helpful. Fortunately, there is a Gherkin namespace called `dataTableUtils` that makes this reformatting task easy. This namespace provides several utilities that might come in handy, including the function `toTable`, which transforms the 2D array into a simple array of objects. In the array of objects, each object's attribute names are derived from the header line in the table. For example, consider the following Feature file:

```gherkin
Scenario: lots of data
  Given I see the following lemmings:
    | Name    | Age in Months | Role         |
    | Alice   | 24            | Support      |
    | Bob     | 70            |              |
    | Charlie | 120           | Stories      |
```

And the following Steps file

```javascript
this.register(
  /^I see the following lemmings:$/i, function(aRawData) {
    var aData = dataTableUtils.toTable(aRawData, "camelCase");
  }
);
```

In the above Steps code, we ask the `dataTableUtils` to use camel case when setting the names of the object attributes. For those familiar with coding conventions, camel case transforms the string `Hello World` into `helloWorld`. During runtime, the variable `aData` will be assigned the following value:

```javascript
[
  {
    ageInMonths: "24"
    name: "Alice"
    role: "Support"
  },
  {
    ageInMonths: "70"
    name: "Bob"
    role: ""
  },
  {
    ageInMonths: "120"
    name: "Charlie"
    role: "Stories"
  }
]
```

In this `toTable` format, the data is now easier to work with. There are other transformation functions and normalization functions available. Full documentation for `dataTableUtils` is available in the [API reference](http://veui5infra.dhcp.wdf.sap.corp:8080/demokit/#docs/api/symbols/sap.ui.test.gherkin.html).

If you have specialized normalization needs, it is also possible to create your own normalization function. This is simply a function that accepts a single string parameter and returns a string. You could pass your custom normalization function into a `toTable` call (for example), like so:

```javascript
var aData = dataTableUtils.toTable(aRawData, function(s) {
  return dataTableUtils.normalization.camelCase(s).replace("role", "job");
});
```

## Scenario Outlines

Sometimes you need to test a repeating pattern of steps. For example:

```gherkin
Scenario: Save 1 Lemming
  When I click on the life saving button 1 time
  Then I see Alice at the end of the list of saved lemmings

Scenario: Save 2 Lemmings
  When I click on the life saving button 2 times
  Then I see Bob at the end of the list of saved lemmings

Scenario: Save 3 Lemmings
  When I click on the life saving button 3 times
  Then I see Charlie at the end of the list of saved lemmings
```

Step arguments will make it easier to implement this in the Steps file, but what about in the Feature file itself? The constant repetition looks awful and is difficult to maintain. The solution is to use a *scenario outline*. With a scenario outline you can write the above test scenarios only once, and during test execution Gherkin will actually execute the test as many times as you like, for whatever input *examples* you have given. Here's how it looks in the Feature file:

```gherkin
Scenario Outline: Using a scenario outline to Save Lemmings
  When I click on the life saving button <NUM CLICKS> times
  Then I see <NAME> at the end of the list of saved lemmings

Examples: list of lemmings
  | NUM CLICKS | NAME     |
  |  1         |  Alice   |
  |  2         |  Bob     |
  |  3         |  Charlie |
```

The above scenario outline is equivalent to writing out the 3 scenarios individually. In the above Feature file, `NUM CLICKS` and `NAME` are called *placeholders*. At test execution, these placeholders get automatically replaced by the values in the examples table. For each row in the examples one new test scenario will be generated. Also keep in mind the following details:

1.	Placeholders are case sensitive, and can use spaces or punctuation.
2.	Placeholders appear surrounded by angle brackets (`< >`) in the scenario outline steps, and without angle brackets in the examples table.
3.	Each placeholder found in the scenario outline will require one column in the examples table, with the header row holding the placeholders themselves.
4.	In the Feature file, the examples must be the next section after the scenario outline.
5.	You can specify multiple sets of examples for a single scenario outline.

## Gherkin and OPA Page Objects

Gherkin is compatible with the concept of OPA5 Page Objects. The Demo Kit contains a [sample implementation](http://veui5infra.dhcp.wdf.sap.corp:8080/demokit/explored.html#/sample/sap.ui.core.sample.gherkin.GherkinWithPageObjects/preview).

Page Objects are explained in detail elsewhere (see the [Developer Guide](https://sapui5.hana.ondemand.com/sdk/#docs/guide/ce4b180d97064ad088a901b53ed48b21.html), section **Structuring OPA Tests With Page Objects**) and are outside of the scope of this documentation. In brief, Page Objects are a method for architecting integration testing to make test components more intuitive and reusable.

To make Gherkin work with Page Objects, you should load your OPA5 Page Objects normally in the HTML bootstrap file, as shown in the Demo Kit sample. The only adaptation you need to make when starting the Gherkin testing is to add the parameter `generateMissingSteps` when calling `opa5TestHarness.test`:

```javascript
opa5TestHarness.test({
  featurePath: "GherkinWithPageObjects/Requirements1",
  generateMissingSteps: true
});
```

This signals to Gherkin that if it cannot find a matching step definition in the Steps file then it should try to use an Opa5 Page Object call instead. In the example above, no Steps file is specified, which means that Gherkin will expect to make a Page Objects call for every test step. However, it's easy to take a hybrid approach where each test step in the Feature file either matches a Gherkin step definition or executes an OPA5 Page Object call. In addition, you can combine OPA5 Page Object calls with a Gherkin data table or scenario outline to achieve powerful results (both ideas are illustrated in the Demo Kit sample). Here is a sample Feature file scenario that takes advantage of Page Objects:

```gherkin
Scenario: Page 1 journey
  When on the overview: I press on "Go to Page 1"
  Then on page 1: I should see the page 1 text
```

Note how the Feature file text `on the overview` and `on page 1` corresponds to the page objects `onTheOverview` and `onPage1`, respectively. Use the colon (`:`) to separate the page object from its method. The above Feature file test steps will be converted automatically into these OPA5 Page Object calls:

```javascript
When.onTheOverview.iPressOnGoToPage1();
Then.onPage1.iShouldSeeThePage1Text();
```

Use the Gherkin console logs to help you debug your OPA5 Page Object calls.

**Caveat:** at this time OPA5 Page Object and chaining is not supported by Gherkin Feature files. For example: `When.onTheOverview.iPressOnGoToPage1().and.onPage1.iShouldSeeThePage1Text()`

## Code Coverage

It can be handy to calculate the code coverage of your integration tests, for example, to figure out if you forgot to test something or to provide statistics on your test quality. At test execution time, Gherkin offers the option `Enable coverage` near the top left of the test results. Enabling the option will re-run the tests and then list the files that were tested at the bottom of the page. Here's a screenshot:

![IMAGE SHOWING CODE COVERAGE TOOL IN ACTION](/images-bdd/code-coverage.png)
 
Gherkin will calculate code coverage for any JavaScript file that is loaded after the test harness. This may cause some system libraries to appear in the results. If you wish to adjust which files have code coverage calculated for them then you can add code like the following to your HTML bootstrap file (after loading SAPUI5 but before running your tests):

```html
<script
  src="path/to/resources/sap/ui/qunit/qunit-coverage.js"
  data-sap-ui-cover-only="GherkinWithOPA5/"
  data-sap-ui-cover-never="sap/ui/">
</script>
```

For more detailed documentation see the [official documentation for Blanket.js](https://github.com/alex-seville/blanket/blob/master/docs/options.md#data-cover-only). Just keep in mind that the attribute name is slightly different in the SAPUI5 implementation (*i.e.* `data-sap-ui-cover-only` instead of `data-cover-only`)

## Timeouts

There are two important ways that you might have trouble with timeouts:

1.	When loading your app
2.	When trying to find SAPUI5 controls in the app

When loading the app, the OPA5 command can accept a second parameter, which is the number of seconds to wait for the application to load. For example:

```javascript
var opa5 = new Opa5();
opa5.iStartMyAppInAFrame("path/to/your/app.html", 30); // wait time in seconds
```

When trying to find SAPUI5 controls in the app, you can add the following settings to cause OPA5 to wait a different amount of time for a control to become available on the screen. You also need to set the QUnit timeout (to a time equal to or greater than the OPA5 setting), otherwise QUnit might give up early:

```javascript
sap.ui.test.Opa.config.timeout = 20; // wait time in seconds
QUnit.config.testTimeout = 20000; // wait time in milliseconds
```

# Frequently Asked Questions

**Who should write Feature files?** Ideally, the Product Owner (PO) develops Feature files in collaboration with developers. Depending on the PO's level of comfort, they can upload the `.feature` files directly to source control, or let the developers take care of that.

**When writing the step definitions, the Feature file is inadequate! What to do?** You will usually find that there is a gap between what the PO has written, and the information that the developer requires to implement an integration test. It's ok for the developer to modify the Feature file to enable testing, so long as they check back with the PO to ensure that the Feature file is still correct.

**Every time the PO modifies the Feature file it breaks the tests: what can we do about this?** Actually, this is the point of Gherkin. When modifications to a Feature file are uploaded to source control, we expect this to break existing tests, as it should, since the application's expected behaviour has changed—but the application itself has *not* changed yet. Gherkin is forcing the application to stay in sync with the Feature file. Consider that this also encourages you to be more honest about accepting new feature changes into your product—and the amount of extra work that this entails. We recommend that you use your formal code review process (for example: Gerrit, ReviewNinja) to allow developers to change the application and fix the tests, and then submit all the new code together with the Feature file changes at the same time into the master branch

# Conclusion

At first, as you are learning BDD it will take a long time to implement new tests. Resist the temptation to abandon automated testing. The most important software development phase for *successful* software is the maintenance phase. Automated tests are the best way to ensure an effective maintenance phase, and help ensure that the code quality remains high over time.

It's true that when you first try automated testing it might take a long time, but even this first attempt will be worthwhile and pay dividends later. On your future projects, when you will implement your tests much faster, then your initial investment in learning how to do integration testing will really pay off.

One good way to ensure that you get the most value for your investment of time into automated testing is to ensure that you test the right things. Integration testing is best for testing the main path of the major business scenarios. These are what are called "face-saving tests," in the sense that you will lose face (be embarrassed) if you try to deliver the software when these major business scenarios are failing. Hence, integration tests are a great way to do a quick and painless smoke test every time you commit a change to your software, to ensure that you haven't broken anything important.

Since writing integration tests can be quite time-consuming, it's better to use unit testing to test all of the nuances and failure cases of your software. Unit tests are cheap and easy to write, and hence are better suited to achieving full test coverage for the software.