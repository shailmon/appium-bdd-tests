Feature: DuckDuckGo Android App E2E Tests

  Background:
    Given I launch the application
    Given I bypass the onboarding screens
    Given I am on the browser home screen

  # ─────────────────────────────────────────
  # Scenario 1: Basic Search
  # ─────────────────────────────────────────
  Scenario: Search for WebdriverIO and validate results
    When I tap the Fire button
    Then I wait 5 seconds
     When I tap the Clear Tabs and Data button from Bottom sheet
    Then I wait 5 seconds
    Then I should see the text "Search or type URL" on the screen


  