Feature: THING-005: Create a todo list for a class

    As a student, I create a to do list for a new class I am taking, so I
    can manage course work.

    Background:
        Given the system is running on localhost and is clean

    Scenario Outline: As a student, I can create a todo list for a class (normal flow)
        When course to do list with title <project_title> and description <project_description> is created
        Then corresponding course todo list with title <project_title> should be created
        Examples:
            | project_title | project_description      |
            | 'ECSE429'     | 'Software validation'    |
            | 'MATH240'     | 'Mathematics'            |
            | 'COMP302'     | 'Functional programming' |

    Scenario Outline: As a student, I can create a todo list for a class represented as category (alternate flow)
        When course to do list with title <category_title> and description <category_description> is created as a category
        Then corresponding course todo list with title <category_title> should be created with description <category_description>
        Examples:
            | category_title | category_description     |
            | 'ECSE429'      | 'Software validation'    |
            | 'MATH240'      | 'Mathematics'            |
            | 'COMP302'      | 'Functional programming' |

    Scenario Outline: As a student, I cannot create a todo list for a class with a 'term' property (error flow)
        When course to do list with title <title>, description <description> and term <term> is created
        Then the system should send 'Could not find field: term' as error message
        Examples:
            | title     | description                | term       |
            | 'ECSE429' | 'Software validation'      | 'Fall2020' |
            | 'COMP551' | 'Applied machine learning' | 'Fall2019' |
            | 'ECSE223' | 'Model based programming'  | 'Fall2018' |