Feature: THING-001: Categorize tasks with priority

    As a student, I categorize tasks as HIGH, MEDIUM or LOW priority, so I
    can better manage my time.

    Background:
        Given the system is running on localhost and is clean
        And tasks with the following details are created:
            | title             | doneStatus | description                  |
            | ECSE429 Part B    | false      | Write gherkin scripts        |
            | COMP551 Project 2 | false      | Implement softmax regression |
            | Climbing          | false      | Go climbing                  |

    Scenario Outline: As a student, I can categorize tasks with priority (normal flow)
        Given category with title <cat_title> and description <cat_description> is created
        When student categorizes existing tasks with priority <cat_title>
        Then the corresponding tasks should be categorized with priority <cat_title>
        Examples:
            | cat_title         | cat_description    |
            | 'HIGH Priority'   | 'most important'   |
            | 'MEDIUM Priority' | 'medium important' |
            | 'LOW Priority'    | 'least important'  |

    Scenario Outline: As a student, I can categorize tasks using projects with priority (alternate flow)
        Given project with title <proj_title> and description <proj_description> is created
        When student categorizes as project existing tasks with priority <proj_title>
        Then the corresponding tasks should be categorized as project with priority <proj_title>
        Examples:
            | proj_title        | proj_description   |
            | 'HIGH Priority'   | 'most important'   |
            | 'MEDIUM Priority' | 'medium important' |
            | 'LOW Priority'    | 'least important'  |

    Scenario Outline: As a student, I cannot categorize a unexisting task (error flow)
        Given category with title 'HIGH Priority' is created
        When student creates an instance of relationship for unexisting task with id <id>
        Then the system should send <error> as error message
        Examples:
            | id        | error                                                                     |
            | 123456789 | 'Could not find parent thing for relationship todos/123456789/categories' |
            | 987654321 | 'Could not find parent thing for relationship todos/987654321/categories' |
            | 192837465 | 'Could not find parent thing for relationship todos/192837465/categories' |
