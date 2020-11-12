Feature: THING-006: Remove a todo list for a class

    As a student, I remove a to do list for a class which I am no longer
    taking, to declutter my schedule.

    Background:
        Given the system is running on localhost and is clean
        And courses with the following details are created:
            | title   | completed | active | description         |
            | ECSE429 | false     | true   | Software validation |
            | ECSE428 | false     | true   | Software practice   |
            | MATH240 | false     | true   | Mathematics         |

    Scenario Outline: As a student, I can remove a todo list for a class (normal flow)
        When course with title <project_title> is removed
        Then corresponding course with title <project_title> should be removed
        Examples:
            | project_title |
            | 'ECSE429'     |
            | 'ECSE428'     |
            | 'MATH240'     |

    Scenario Outline: As a student, I can mark a to do list as inactive instead of removing it (alternate flow)
        When student changes course with title <project_title> to be inactive
        Then the corresponding course with title <project_title> should be inactive
        Examples:
            | project_title |
            | 'ECSE429'     |
            | 'ECSE428'     |
            | 'MATH240'     |

    Scenario Outline: As a student, I can remove a todo list for a nonexistent class (error flow)
        When student removes unexistent course with id <id>
        Then the system should send <error> as error message
        Examples:
            | id        | error                                                  |
            | 123456789 | 'Could not find any instances with projects/123456789' |
            | 987654321 | 'Could not find any instances with projects/987654321' |
            | 192837465 | 'Could not find any instances with projects/192837465' |
