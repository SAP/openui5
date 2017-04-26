Feature: Buy a Product

  Background:
    Given I start my App

  Scenario: Buy it
    When on home: I press on "The second category"
    When on the category: I press on "The first Product"
    When on the product: I add the displayed product to the cart
    When on the category: I go to the cart page

    When on the cart: i press on the proceed button
    Then on checkout: i should see the wizard step contents step

    When on checkout: i press on the next step button
    Then on checkout: i should see the wizard step payment type step

    When on checkout: i press on the next step button
    Then on checkout: i should see the credit card step

    When on checkout: i enter credit card text
    Then on checkout: i should see the step4 button enabled

    When on checkout: i press on the next step button
    Then on checkout: i should see the billing step

    When on checkout: i enter billing address text
    Then on checkout: i should see the step5 button validated

    When on checkout: i press on the next step button
    Then on checkout: i should see the delivery type step

    When on checkout: i press on the next step button
    Then on checkout: i should see the order summary

    When on checkout: i press on the edit button backto list
    Then on checkout: i should see the wizard step contents step

    When on checkout: i press on the bank transfer button
    When on checkout: i press on the yes button
    Then on checkout: i should see the step3 button enabled

    When on checkout: i press on the next step button
    Then on checkout: i should see the step4 button enabled

    When on checkout: i press on the next step button
    Then on checkout: i should see the step5 button enabled

    When on checkout: i press on the next step button
    Then on checkout: i should see the delivery type step

    When on checkout: i press on the next step button
    Then on checkout: i should see the order summary

    When on checkout: i press on the edit button back to payment type
    Then on checkout: i should see the wizard step contents step

    When on checkout: i press on the cash on delivery button
    When on checkout: i press on the yes button
    Then on checkout: i should see the step3 button enabled

    When on checkout: i press on the next step button
    Then on checkout: i should see the cash on delivery step

    When on checkout: i enter cash on delivery text
    Then on checkout: i should see the step4 button enabled

    When on checkout: i press on the next step button
    Then on checkout: i should see the billing step

    When on checkout: i enter billing address text
    Then on checkout: i should see the step5 button validated

    When on checkout: i press on the next step button
    Then on checkout: i should see the delivery type step

    When on checkout: i press on the next step button
    Then on checkout: i should see the order summary

    When on checkout: i press on the edit button back to billing address
    Then on checkout: i should see the wizard step contents step

    When on checkout: i check different address text
    When on checkout: i press on the yes button
    When on checkout: i press on the next step button
    Then on checkout: i should see the delivery address step

    When on checkout: i enter delivery address text
    Then on checkout: i should see the step6 button validated

    When on checkout: i press on the next step button
    Then on checkout: i should see the delivery type step

    When on checkout: i press on the next step button
    Then on checkout: i should see the order summary

    When on checkout: i press on the edit button back to delivery type
    Then on checkout: i should see the wizard step contents step

    When on checkout: i press on the express delivery button
    When on checkout: i press on the next step button
    Then on checkout: i should see the order summary
    Then on checkout: i should see express delivery

    When on checkout: i press on the submit button
    When on checkout: i press on the yes button
    Then on order completed: i should see the order completed page

    When on order completed: i press on the return to shop button
    Then on the welcome page: i should see the welcome page
    Then on the welcome page: i teardown my app
