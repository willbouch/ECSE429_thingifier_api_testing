Feature: THING-010: Change task description

    As a student, I want to change a task description, to better represent
    the work to do.

    Background:
        Given the system is running on localhost and is clean

    Scenario Outline: As a student, I can change a task description (normal flow)
        And task with title <task_title> and description <task_description> is created
        When student changes the task description to <new_task_description>
        Then the corresponding task should have the new description <new_task_description>
        Examples:
            | task_title          | task_description          | new_task_description           |
            | 'ECSE429 Part B'    | 'to be changed'           | 'write gherkin scripts'        |
            | 'COMP551 Project 2' | 'to be changed again'     | 'implement softmax regression' |
            | 'Climbing'          | 'to be changed yet again' | 'go climbing'                  |

    Scenario: As a student, I cannot change description of unexisting task (error flow)
        When student changes description of a unexisting task with description 'new task description'
        Then the system should send 'No such todo entity instance with GUID or ID' as error message

    # MISSING alternate flow
