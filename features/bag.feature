Feature: Shopping bag

  Scenario: A new visitor's bag is empty
    Given I am on the shopping bag page
    Then the bag heading should be "Your bag is empty."
