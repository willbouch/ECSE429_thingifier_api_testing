Feature: THING-005: Create a todo list for a class

  As a student, I create a to do list for a new class I am taking, so I
  can manage course work.

  Background:
    Given the system is running on localhost and is clean

  Scenario Outline: As a student, I can create a todo list for a class (normal flow)
    When course to do list with title <project_title> and description <project_description> is created
    Then corresponding course todo list with title <project_title> should be created
    Examples:
        | project_title    | project_description        |
        | 'ECSE429'        | 'Software validation'      |
        | 'MATH240'        | 'Mathematics'              |
        | 'COMP302'        | 'Functional programming'   |