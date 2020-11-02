Feature: THING-003: Mark a task done on class todo list

    As a student, I mark a task as done on my course to do list, so I can
    track my accomplishments.

    Background:
        Given the system is running on localhost and is clean
        Given tasks with the following details are created:
            | title             | doneStatus | description                  |
            | ECSE429 Part B    | false      | Write gherkin scripts        |
            | COMP551 Project 2 | false      | Implement softmax regression |
            | Climbing          | false      | Go climbing                  |

    Scenario Outline: As a student, I can mark a task as done (normal flow)
        Given task with title <task_title> has doneStatus <old_status>
        When student marks task with title <task_title> as done
        Then task with title <task_title> will be marked as done
        Examples:
            | task_title          | old_status | new_status |
            | 'ECSE429 Part B'    | 'false'    | 'true'     |
            | 'COMP551 Project 2' | 'false'    | 'true'     |
            | 'Climbing'          | 'false'    | 'true'     |

    Scenario: As a student, I cannot mark a unexisting as done (error flow)
        When student marks a unexisting task as done
        Then the system should send 'No such todo entity instance with GUID or ID' as error message

    Scenario Outline: As a student, I can mark a task that is already done as done (alternative flow)
        Given task with title <task_title> already has doneStatus <old_status>
        When student marks task with title <task_title> as done
        Then task with title <task_title> should still be marked as done
        Examples:
            | task_title          | old_status | new_status |
            | 'ECSE429 Part B'    | 'true'     | 'true'     |
            | 'COMP551 Project 2' | 'true'     | 'true'     |
            | 'Climbing'          | 'true'     | 'true'     |
