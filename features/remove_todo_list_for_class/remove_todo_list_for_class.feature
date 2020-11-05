Feature: THING-006: Remove a todo list for a class

    As a student, I remove a to do list for a class which I am no longer
    taking, to declutter my schedule.

    Background:
        Given the system is running on localhost and is clean
        And courses with the following details are created:
            | title   | completed | active | description         |
            | ECSE429 | false     | true   | Software validation |

    Scenario Outline: As a student, I can remove a todo list for a class (normal flow)
        When course with title <project_title> is removed
        Then corresponding course with title <project_title> should be removed

    Scenario Outline: As a student, I can mark a to do list as inactive (alternate flow)
        When student changes course with title <project_title> to be inactive
        Then the corresponding course with title <project_title> should be inactive

    Scenario Outline: As a student, I can remove a todo list for a nonexistent class (error flow)
        When unexistent course is removed
        Then Then the system should send 'Could not find any instances with projects' as error message
