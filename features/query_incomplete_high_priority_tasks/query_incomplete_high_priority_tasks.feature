Feature: THING-008: Query incomplete HIGH priority tasks

    As a student, I query all incomplete HIGH priority tasks from all my
    classes, to identity my short-term goals.

    Background:
        Given the system is running on localhost and is clean
        And tasks with the following details are created:
            | title             | doneStatus | description                  |
            | ECSE429 Part B    | false      | Write gherkin scripts        |
            | COMP551 Project 2 | false      | Implement softmax regression |
            | Climbing          | false      | Go climbing                  |
        And category with title 'HIGH Priority' is created
        And the category 'HIGH Priority' is assigned to each todo
        # And previously created tasks are categorized as 'HIGH Priority'

    Scenario: As a student, I can query incomplete HIGH priority tasks for all classes
    When student queries all incomplete and 'HIGH Priority' priority tasks
    Then the system returns a list of 'HIGH Priority' tasks including 'ECSE429 Part B', 'COMP551 Project 2', and 'Climbing'

