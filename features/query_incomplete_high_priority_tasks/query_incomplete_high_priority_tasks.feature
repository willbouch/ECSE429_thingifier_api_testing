Feature: THING-008: Query incomplete HIGH priority tasks

    As a student, I query all incomplete HIGH priority tasks from all my
    classes, to identity my short-term goals.

    Background:
        Given the system is running on localhost and is clean
        And tasks with the following details are created:
            | title              | doneStatus | description                  |
            | ECSE429 Part A     | true       | Api test suite               |
            | ECSE429 Part B     | false      | Write gherkin scripts        |
            | COMP551 Project 2  | false      | Implement softmax regression |
            | Climbing           | false      | Go climbing                  |
            | Submit class work  | true       | In-class every monday        |
            | COMP360 midterm    | true       | Finish and Submit mideterm   |
            | ECSE326 P3         | true       | Project Part 3               |
            | Run                | false      | Go running                   |
            | DPM beta           | false      | Beta demo friday             |
            | COMP251 assignment | false      | Go climbing                  |
        And category with title 'HIGH Priority' is created
        And the category 'HIGH Priority' is assigned to each todo

    Scenario Outline: As a student, I can query incomplete HIGH Priority tasks for all classes (normal flow)
        When student queries all incomplete and <category_title> tasks
        Then the system returns incomplete tasks of category <category_title>
        Examples:
            | category_title  |
            | 'HIGH Priority' |

    Scenario Outline: As a student, once I have marked a task as done it is no longer in the list of incomplete HIGH Priority tasks (alternative flow)
        Given student marks task with title <task_title> as done
        When student queries all incomplete and <category_title> tasks
        Then the system returns incomplete tasks of category <category_title>
        Examples:
            | category_title  | task_title         |
            | 'HIGH Priority' | 'ECSE429 Part B'   |
            | 'HIGH Priority' | 'DPM beta'         |
            | 'HIGH Priority' | 'COMP360 midterm ' |


    Scenario: As a student, once I have marked a task as done it is no longer in the list of incomplete HIGH Priority tasks (alternative flow)
        Given student marks task with title 'ECSE429 Part B' as done
        When student queries all incomplete and 'HIGH Priority' tasks
        Then the system returns incomplete tasks of category 'HIGH Priority'

