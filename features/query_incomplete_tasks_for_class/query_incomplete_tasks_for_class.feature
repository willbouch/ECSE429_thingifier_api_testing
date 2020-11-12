Feature: THING-007: Query incomplete tasks for a class

    As a student, I query the incomplete tasks for a class I am taking, to
    help manage my time.

    Background:
        Given the system is running on localhost and is clean
        And courses with the following details are created:
            | title   | completed | active | description         |
            | ECSE429 | false     | true   | Software validation |
        And tasks with the following details are created:
            | title             | doneStatus | description           |
            | ECSE429 Part B    | false      | Write gherkin scripts |
            | Submit class work | true       | In-class every monday |
            | Study for Test    | false      | 20% timed test        |
        And previously created tasks are added to class todo list 'ECSE429'

    Scenario Outline: As a student, I can query incomplete tasks for a class
        When student queries incomplete tasks of class with class title <class_title>
        Then the system returns incomplete tasks of class <class_title>
        Examples:
            | class_title |
            | 'ECSE429'   |

    Scenario Outline: As a student, I cannot query incomplete tasks for an unexisting class (error flow)
        When student queries incomplete tasks of unexisting class
        Then the system should return all incomplete todos

    Scenario Outline: As a student, I can query incomplete tasks for a class that is marked as complete (alternative flow)
        Given the class of title <class_title> is set to complete
        When student queries incomplete tasks of class with class title <class_title>
        Then the system returns incomplete tasks of class <class_title>
        Examples:
            | class_title |
            | 'ECSE429'   |
