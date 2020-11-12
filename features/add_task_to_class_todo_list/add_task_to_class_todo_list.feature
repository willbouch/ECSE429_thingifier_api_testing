Feature: THING-002: Add a task to a class todo list

    As a student, I add a task to a course to do list, so I can remember
    it.

    Background:
        Given the system is running on localhost and is clean
        And courses with the following details are created:
            | title   | completed | active | description         |
            | ECSE429 | false     | true   | Software validation |
        And categories with the following details are created:
            | title            |
            | ECSE429 Category |

    Scenario Outline: As a student, I can add a task to a class todo list (normal flow)
        Given task with title <task_title> and description <task_description> is created
        When student adds task with title <task_title> to class todo list
        Then class todo list should have task with title <task_title>
        Examples:
            | task_title                      | task_description          |
            | 'Start part B'                  | ''                        |
            | 'Understand cucumber on NodeJs' | 'Focus on implementation' |
            | 'Write Gherkin scripts'         | ''                        |

    Scenario Outline: As a student, I can add a task to a class todo list represented as category (alternate flow)
        Given task with title <task_title> and description <task_description> is created
        When student adds task with title <task_title> to class todo list represented as category
        Then the category class todo list should have task with title <task_title>
        Examples:
            | task_title                      | task_description          |
            | 'Start part B'                  | ''                        |
            | 'Understand cucumber on NodeJs' | 'Focus on implementation' |
            | 'Write Gherkin scripts'         | ''                        |

    Scenario Outline: As a student, I cannot add unexisting task to class todo list (error flow)
        When student adds unexisting task with id <id> to class todo list
        Then the system should send <error> as error message
        Examples:
            | id        | error                                                                  |
            | 123456789 | 'Could not find parent thing for relationship todos/123456789/tasksof' |
            | 987654321 | 'Could not find parent thing for relationship todos/987654321/tasksof' |
            | 192837465 | 'Could not find parent thing for relationship todos/192837465/tasksof' |

