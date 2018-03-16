# Structuring OPA Tests With Page Objects

The page object design pattern supports UI-based tests with improved readability, fostering the don't repeat yourself (DRY) principle of software development that is aimed at reducing repetition of any kind of information. A page object wraps an HTML page or fragment with an application-specific API, which makes it easy to find a control and provide reuse across multiple tests. If you have multiple pages or UI areas that have several operations, you can place them as reuse functionality in page object. The page object groups all OPA arrangements, actions, and assertions that logically belong to some part of the screen. Since only the test will know if an action is used to set up the test case or to act on the application under test, the page object will combine actions and arrangements into actions. In contrast to the general guidance of Selenium and Martin Fowler, OPA page objects also provide assertions, as the corresponding testing via waitFor statements better fit into the page objects. When you define actions or assertions in your page object, have in mind how the test would spell them and if that would be similar to the way you would explain a scenario to your colleagues.

Page objects accept parameters, so you can parametrize your tests either by writing multiple tests, or by repeating your test being on a set of parameters defined in the code. It is also possible to put test fragments into a separate file and refer to this file in the test. This enables you to reuse the same test fragments in different test pages with different setups.

You can also share utility functionality between page objects. Simulating clicks, for example, is useful for most page objects and should be placed in a base class that you can create. As the page objects extend the base class, the functions provided in the base class are available for the page objects. If, for example, you want to share tree handling functions in all tree-based page objects, create a TreeBase class by extending the base class. Tree-based page objects such as repository browser and outline then specify TreeBase as baseClass instead of the generic base class.

OPA5 provides a static method to create page objects, see the OPA [Samples](https://openui5nightly.hana.ondemand.com/#/entity/sap.ui.test.Opa5) in the Demo Kit.

```javascript
Opa5.createPageObjects({
    //give a meaningfull name for the test code
    inThe<Page Object> : {
         //Optional: a class extending Opa5, with utility functionality
         baseClass : fnSomeClassExtendingOpa5,

         actions : {
            //place all arrangements and actions here
            <iDoSomething> : function(){
                //always return this or a waitFor to allow chaining
                 return this.waitFor({
                     //see documentation for possibilities
                 });
             }
        },
        assertions : {
            //place all assertions here
            <iCheckSomething> : function(){
                //always return this or a waitFor to allow chaining
                 return this.waitFor({
                     //see documentation for possibilities
                 });
             }
        }
    }
});
```

The method in your test finds all actions at the `Given` and `When` object, the assertions will be at the `Then` object. Everything is prefixed with the page object name.

```javascript
When.inThe<Page Object>.<iDoSomething>();

Then.inThe<Page Object>.<iCheckSomething>();
```

Be careful with `Opa5.extendConfig()` if you give arrangements, actions, or assertions, all previously loaded page objects will be overwritten. So if you mix them, call `extendConfig` before loading the page objects. See the [Samples](https://openui5nightly.hana.ondemand.com/#/entity/sap.ui.test.Opa5) in the Demo Kit.
