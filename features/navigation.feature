Feature: Navigation Flow
  As a logged-in user
  I want to navigate through different sections of the app
  So that I can find what I am looking for

  @regression
  Scenario: Navigate between main tabs
    Given I am on the home screen
    When I tap on the Profile tab
    Then I should see the Profile screen
    When I tap on the Settings tab
    Then I should see the Settings screen
    When I tap on the Home tab
    Then I should see the Home screen
