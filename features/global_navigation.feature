Feature: Global navigation

  Scenario Outline: Global nav links open the matching product page
    Given I am on the Apple home page
    When I click "<link>" in the global navigation
    Then the page title should be "<title>"
    And the URL path should be "<path>"

    Examples:
      | link   | title          | path     |
      | Mac    | Mac - Apple    | /mac/    |
      | iPhone | iPhone - Apple | /iphone/ |
