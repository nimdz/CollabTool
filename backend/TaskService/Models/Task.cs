using Amazon.DynamoDBv2.DataModel;

namespace TaskService.Models
{
    [DynamoDBTable("Tasks")]
    public class Task
    {
        [DynamoDBHashKey]
        public string TaskId { get; set; } = Guid.NewGuid().ToString();

        [DynamoDBProperty]
        public string Title { get; set; } = string.Empty;

        [DynamoDBProperty]
        public string Description { get; set; } = string.Empty;

        [DynamoDBProperty]
        public TaskStatus Status { get; set; } = TaskStatus.Pending;

        [DynamoDBProperty]
        public string Assignee { get; set; } = string.Empty;

        [DynamoDBProperty]
        public string ProjectId { get; set; } = string.Empty;
    }

    public enum TaskStatus
    {
        Pending,
        InProgress,
        Completed
    }
}
