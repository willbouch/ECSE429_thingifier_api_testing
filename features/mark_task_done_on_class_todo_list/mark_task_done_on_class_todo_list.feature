Feature: THING-003: Mark a task done on class todo list

As a student, I mark a task as done on my course to do list, so I can
track my accomplishments.

  Background: 
    Given the system is running on localhost and is clean
    Given tasks with the following details are created (none other exist):
      | title             | doneStatus | description                  | id | 
      | ECSE429 Part B    | false      | Write gherkin scripts        | 1  | 
      | COMP551 Project 2 | false      | Implement softmax regression | 2  | 
      | Climbing          | false      | Go climbing                  | 3  | 
  
  Scenario Outline: Mark a task as done (normal flow)
    Given task with id <task_id>'s status <old_status> is not done
     When student requests to have task with id <task_id> be set to done
     Then task with id <task_id> will have its status <new_status> be set to done
    Examples: 
      | task_id | old_status | new_status | 
      | 1       | false      | true       | 
  
  Scenario Outline: Attempt to mark an unexisting task as done (error flow)
    Given task with id <task_id> does not exist
     When student requests to have task with id <task_id> be set to done
     Then the system should raise the error 'No such todo entity instance with GUID or ID <task_id> found'
    Examples: 
      | task_id | 
      | 4       | 
  
  Scenario Outline: Mark a task that is already done as done (alternative flow)
    Given task with id <task_id>'s status <old_status> is done
     When student requests to have task with id <task_id> be set to done
     Then nothing happens
     #SHOULD WE INSTEAD SAY THAT IT RETURNS AN OK MSG (MEANING WE WOULD NEED TO ASSESS EACH RETURN CODE)
    Examples: 
      | task_id | old_status | new_status | 
      | 1       | true       | true       | 
  
  
