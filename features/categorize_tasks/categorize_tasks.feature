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

    Scenario: As a student, I cannot categorize a task with an unexisting category (error flow)
        When student creates an instance of relationship between a task and unexisting category
        Then the system should send 'Could not find thing matching value for id' as error message

    Scenario: As a student, I cannot categorize a unexisting task (error flow)
        Given category with title 'HIGH Priority' is created
        When student creates an instance of relationship for unexisting task
        Then the system should send 'Could not find parent thing for relationship' as error message

# Scenario Outline: As a student, I can recategorize a task that is already categorized (alternative flow)
#     Given category with title <old_cat_title> is created
#     And existing task is already categorized as <old_cat_title>
#     And category with title <new_cat_title> is created
#     When student categorizes existing task with priority <new_cat_title>
#     Then the corresponding task should be categorized with priority <new_cat_title>
#     And should no longer be categorized with priority <old_cat_title>
#     Examples:
#         | old_cat_title     | new_cat_title     |
#         | 'HIGH Priority'   | 'MEDIUM Priority' |
#         | 'MEDIUM Priority' | 'LOW Priority'    |
#         | 'LOW Priority'    | 'HIGH Priority'   |