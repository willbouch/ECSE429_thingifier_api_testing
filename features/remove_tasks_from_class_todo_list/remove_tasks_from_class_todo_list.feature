Feature: THING-004: Remove tasks from a class todo list

    As a student, I remove an unnecessary task from my course to do list,
    so I can forget about it.

    Background:
        Given the system is running on localhost and is clean
        And courses with the following details are created:
            | title   | completed | active | description         |
            | ECSE429 | false     | true   | Software validation |
        And tasks with the following details are created:
            | title                         | description             |
            | Start part B                  |                         |
            | Understand cucumber on NodeJs | Focus on implementation |
            | Write Gherkin scripts         |                         |
        And previously created tasks are added to class todo list 'ECSE429'

    Scenario Outline: As a student, I can remove a task from a class todo list (normal flow)
        When student removes task with title <task_title> from class <class_title>
        Then class <class_title> should no longer have task with title <task_title>
        Examples:
            | task_title                      | class_title |
            | 'Start part B'                  | 'ECSE429'   |
            | 'Understand cucumber on NodeJs' | 'ECSE429'   |
            | 'Write Gherkin scripts'         | 'ECSE429'   |

    Scenario: As a student, I cannot remove unexisting task to class todo list (error flow)
        When student removes unexisting task to class todo list
        Then the system should send 'Could not find any instances' as error message
