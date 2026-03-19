Feature: Wikipedia App E2E Tests

  Background:
    Given I launch the application
    Given I am on the home screen

  # ─────────────────────────────────────────
  # Scenario 1: Home feed loads correctly
  # ─────────────────────────────────────────
  Scenario: App launches and displays the Explore feed
    Then I should see the text "Search Wikipedia" on the screen
    Then I extract all text from the current page

  # ─────────────────────────────────────────
  # Scenario 2: Search for an article
  # ─────────────────────────────────────────
  Scenario: Search for an article using keyboard input
    When I tap on the search bar
    When I send keys "Indian Literature" to the active input
    When I press the "Search" key
    Then I should see search results for "Indian"
    Then I extract all text from the current page