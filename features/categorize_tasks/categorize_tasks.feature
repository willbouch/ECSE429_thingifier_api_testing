Feature: THING-001: Categorize tasks with priority

    As a student, I categorize tasks as HIGH, MEDIUM or LOW priority, so I
    can better manage my time.

    Scenario Outline: As a student, I can categorize tasks with priority
        Given the system is running on localhost and is clean
        And tasks with the following details are created:
            | title             | doneStatus | description                  |
            | ECSE429 Part B    | false      | Write gherkin scripts        |
            | COMP551 Project 2 | false      | Implement softmax regression |
            | Climbing          | false      | Go climbing                  |
        And category with title <cat_title> and description <cat_description>
        When student creates an instance of relationship between tasks and priority category
        Then the corresponding task should be categorized as <cat_title>
        Examples:
            | cat_title         | cat_description    |
            | 'HIGH Priority'   | 'most important'   |
            | 'MEDIUM Priority' | 'medium important' |
            | 'LOW Priority'    | 'least important'  |

    Scenario: As a student, I cannot categorize a task with an unexisting category
        Given the system is running on localhost and is clean
        And task with title 'ECSE429 Part B' is created
        When student creates an instance of relationship between tasks and unexisting category
        Then the system should send 'Could not find thing matching value for id' as error message

    Scenario: As a student, I cannot categorize a unexisting task
        Given the system is running on localhost and is clean
        And category with title 'HIGH Priority' is created
        When student creates an instance of relationship for unexisting task
        Then the system should send 'Could not find parent thing for relationship' as error message