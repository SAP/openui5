# Integration Testing with One Page Acceptance Tests (OPA5)
OPA5 is an API for SAPUI5 controls. It hides asynchronicity and eases access to SAPUI5 elements. This makes OPA especially helpful for testing user interactions, integration with SAPUI5, navigation, and data binding.

The OPA5 library is JavaScript-based. This means that you can write your tests in the same language in which your app is written. This has the following advantages:
Quick and easy access to JavaScript functions

* Easy ramp-up as it can be used with any JavaScript unit test framework, such as QUnit or Jasmine

* Using the same runtime enables debugging

* Good SAPUI5 integration

* Feedback within seconds makes it possible to execute tests directly after a change

* Asynchronicity is handled with polling instead of timeouts, which makes it faster

* Enables test-driven development (TDD)

Developers write OPA tests during app development. The test-driven development (TDD) results in less fragile tests, because the app is better isolated and supports less fragile APIs for testing:

* It follows the arrange act assert pattern (corresponds to given when then), which improves readability and understanding of the test cases.

* It is easy to run on mobile devices as no plugins/apps are needed; you can as easily just run it in the browser.

* Saves time for the developer as regressions decrease

In short: Writing acceptance tests with OPA5 is very easy – Give it a try!

## Limitations of OPA5
Note the following limitations of OPA:

* Screen capturing
* Testing across more than one page
* Remote test execution
* End-to-end tests are not recommended with OPA due to authentication issues and fragility of test data

~~ INTERNAL
## Comparing OPA and Selenium
Selenium is an excellent library for UI testing. It is succinct, easy to use, well-thought-out and reliable. Assuming that the UI is easily testable, meaning that every UI element has a unique ID, tests are easy to write and maintain, and are reliable. When the UI is less testable, for example, because UI elements have repeated IDs or IDs that change over time, Selenium still makes it possible to test. Development time increases, and reliability and maintainability decrease, but at least it is still possible to test. Thanks to its simulation of user interaction, Selenium enables a complete top-to-bottom integration test of the app. After running a Selenium test on a feature, you can feel very confident that the feature works as prescribed and that users will not run into problems. Similarly, Selenium offers a lot of support during refactoring, since it's easy to tell if you broke any part of the app while making changes. If you stick to testing the major use-cases of the app, Selenium tests will not require a lot of maintenance and will provide very good value for money/time spent. These are all valid reasons for using selenium, especially for end-to-end testing scenarios.

However, the authors of How Google Tests Software state: "But overinvesting in end-to-end test automation often ties you to a product’s specific design and isn’t particularly useful until the entire product is built and in stable form. And it’s still browser testing. It’s slow, you need hooks in the API, and tests are pretty remote from the thing being tested." [How Google Tests Software, James Whittaker, Jason Arbin, Jeff Carollo, 2014]. Furthermore, we have observed that it is rather inefficient if there are people that write only tests while others are doing the coding without eating their own dog food. Testing apps with JavaScript-based tools, on the other hand, has benefits and this brings OPA5 into play.

Thanks for Klaus Häuptle for writing "Comparing OPA an Selenium" and "Limitations of OPA". 
END INTERNAL  ~~