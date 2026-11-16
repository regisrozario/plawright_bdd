Feature: Buy iPhone configurator

  # Read-only by design: the scenario stops once "Add to Bag" becomes enabled
  # and never clicks it (CLAUDE.md: never add to bag on live apple.com).

  Scenario: Configure an iPhone 17 in Black up to Add to Bag
    Given I am on the Apple home page
    When I search for "iPhone 17"
    And I open the "iPhone 17" product page from the search results
    And I choose to buy "iPhone 17"
    And I select the "Black1" color
    And I choose the following options:
      | option       | choice                       |
      | Storage      | 256GB                        |
      | Trade-in     | No trade-in                  |
      | Payment      | Buy                          |
      | Connectivity | Connect to any carrier later |
      | AppleCare    | No AppleCare coverage        |
    Then the "Add to Bag" button should be enabled
