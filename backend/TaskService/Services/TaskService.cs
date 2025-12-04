using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using TaskService.Models;

namespace TaskService.Services
{
    public class TaskService : ITaskService
    {
        private readonly DynamoDBContext _context;

        public TaskService(IAmazonDynamoDB dynamoDb)
        {
            _context = new DynamoDBContext(dynamoDb);
        }

        public async System.Threading.Tasks.Task<Models.Task> GetTaskAsync(string taskId)
        {
            return await _context.LoadAsync<Models.Task>(taskId);
        }

        public async System.Threading.Tasks.Task<IEnumerable<Models.Task>> GetTasksByProjectAsync(string projectId)
        {
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("ProjectId", ScanOperator.Equal, projectId)
            };
            return await _context.ScanAsync<Models.Task>(conditions).GetRemainingAsync();
        }

        public async Task<IEnumerable<Models.Task>> GetTasksByUserAsync(string email)
        {
                    var conditions = new List<ScanCondition>
            {
                new ScanCondition("Assignee", ScanOperator.Equal, email)
            };
                    var tasks = await _context.ScanAsync<Models.Task>(conditions).GetRemainingAsync();

            return tasks.GroupBy(t => t.TaskId).Select(g => g.First());
        }


        public async System.Threading.Tasks.Task<Models.Task> CreateTaskAsync(Models.Task task)
        {
            await _context.SaveAsync(task);
            return task;
        }
        public async System.Threading.Tasks.Task<Models.Task> UpdateTaskAsync(Models.Task updatedTask)
        {
            var existingTask = await _context.LoadAsync<Models.Task>(updatedTask.TaskId);
            if (existingTask == null)
                throw new Exception("Task not found");

            if (!string.IsNullOrEmpty(updatedTask.Title))
                existingTask.Title = updatedTask.Title;

            if (!string.IsNullOrEmpty(updatedTask.Description))
                existingTask.Description = updatedTask.Description;

        
            if (updatedTask.Status != existingTask.Status)
                existingTask.Status = updatedTask.Status;

            if (!string.IsNullOrEmpty(updatedTask.Assignee))
                existingTask.Assignee = updatedTask.Assignee;

            if (!string.IsNullOrEmpty(updatedTask.ProjectId))
                existingTask.ProjectId = updatedTask.ProjectId;

            await _context.SaveAsync(existingTask);

            return existingTask;
        }



        public async System.Threading.Tasks.Task DeleteTaskAsync(string taskId)
        {
            await _context.DeleteAsync<Models.Task>(taskId);
        }
    }
}