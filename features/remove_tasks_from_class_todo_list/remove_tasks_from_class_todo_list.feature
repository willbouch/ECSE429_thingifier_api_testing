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

    Scenario Outline: As a student, I can mark a task from a class to do list as done (alternate flow)
        When student marks task with title <task_title> as done
        Then the task with title <task_title> should be marked as done
        Examples:
            | task_title                      |
            | 'Start part B'                  |
            | 'Understand cucumber on NodeJs' |
            | 'Write Gherkin scripts'         |

    Scenario Outline: As a student, I cannot remove a task from unexisting class todo list (error flow)
        When student removes task with id '1' from unexisting class todo list with id <id>
        Then the system should send <error> as error message
        Examples:
            | id        | error                                                         |
            | 123456789 | 'Could not find any instances with todos/1/tasksof/123456789' |
            | 987654321 | 'Could not find any instances with todos/1/tasksof/987654321' |
            | 192837465 | 'Could not find any instances with todos/1/tasksof/192837465' |
