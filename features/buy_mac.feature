Feature: Buy Mac configurator

  # Read-only by design: the Mac configurator shows an enabled "Continue"
  # (a form submit to the add-ons step) once all choices are made. The
  # scenario asserts that state and never clicks it (CLAUDE.md).

  Scenario: Configure a Mac mini up to Continue
    Given I am on the Apple home page
    When I click "Mac" in the global navigation
    And I open the "Mac mini" product page from the Mac lineup
    And I choose to buy "Mac mini"
    And I choose the following options:
      | option   | choice               |
      | Chip     | M6 chip              |
      | Memory   | 16GB                 |
      | Storage  | 256GB                |
      | Ethernet | 2.5 Gigabit Ethernet |
      | Trade-in | No trade-in          |
      | Payment  | Buy                  |
    Then the "Continue" button should be enabled
