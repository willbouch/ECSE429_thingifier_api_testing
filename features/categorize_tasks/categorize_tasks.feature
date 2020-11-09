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

    Scenario: As a student, I cannot categorize a task with an unexisting category (error flow)
        When student creates an instance of relationship between a task and unexisting category
        Then the system should send 'Could not find thing matching value for id' as error message

    Scenario: As a student, I cannot categorize a unexisting task (error flow)
        Given category with title 'HIGH Priority' is created
        When student creates an instance of relationship for unexisting task
        Then the system should send 'Could not find parent thing for relationship' as error message
