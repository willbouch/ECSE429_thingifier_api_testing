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
