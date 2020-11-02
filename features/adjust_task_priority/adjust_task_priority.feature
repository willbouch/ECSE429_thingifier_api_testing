Feature: THING-009: Adjust the priority of a task

    As a student, I want to adjust the priority of a task, to help better
    manage my time.

    Background:
        Given the system is running on localhost and is clean
        And tasks with the following details are created:
            | title             | doneStatus | description                  |
            | ECSE429 Part B    | false      | Write gherkin scripts        |
            | COMP551 Project 2 | false      | Implement softmax regression |
            | Climbing          | false      | Go climbing                  |
        And category with title 'HIGH Priority' is created
        And previously created tasks are categorized as 'HIGH Priority'

    Scenario Outline: As a student, can adjust the priority of a task (normal flow)
        Given category with title <new_cat_title> is created
        When student categorizes existing tasks with priority <new_cat_title>
        And student removes previous categorization with priority <old_cat_title>
        Then the corresponding tasks should be categorized with priority <new_cat_title>
        And the corresponding tasks should no longer be categorized with priority <old_cat_title>
        Examples:
            | new_cat_title     | old_cat_title   |
            | 'MEDIUM Priority' | 'HIGH Priority' |
            | 'LOW Priority'    | 'HIGH Priority' |

    Scenario: As a student, I cannot adjust priority of unexisting task (error flow)
        When student adjusts priority of unexisting task
        Then the system should send 'Could not find parent thing for relationship' as error message
