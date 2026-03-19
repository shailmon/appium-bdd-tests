Feature: Wikipedia App E2E Tests

  Background:
    Given I launch the application
    Given I bypass the onboarding
    Given I am on the home screen

  # ─────────────────────────────────────────
  # Scenario 1: Home feed loads correctly
  # ─────────────────────────────────────────
  Scenario: App launches and displays the Explore feed
    Then I should see the text "Search" on the screen
   


  