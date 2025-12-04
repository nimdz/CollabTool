using Amazon.DynamoDBv2.DataModel;

namespace TaskService.Models
{
    public class ActiveMeetingInfo
    {
        [DynamoDBProperty]
        public string ChimeMeetingId { get; set; } = string.Empty;

        [DynamoDBProperty]
        public string ApplicationMeetingId { get; set; } = string.Empty;

        [DynamoDBProperty]
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;

        [DynamoDBProperty]
        public string StartedBy { get; set; } = string.Empty;
    }
    [DynamoDBTable("Projects")]
    public class Project
    {
        [DynamoDBHashKey]
        public string ProjectId { get; set; } = Guid.NewGuid().ToString();

        [DynamoDBProperty]
        public string Name { get; set; } = string.Empty;

        [DynamoDBProperty]
        public string Description { get; set; } = string.Empty;

        [DynamoDBProperty]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [DynamoDBProperty]
        public string CreatedBy { get; set; } = string.Empty;

        [DynamoDBProperty]
        public List<string> Members { get; set; } = new List<string>();

        [DynamoDBProperty(AttributeName = "ActiveMeeting")]
        public ActiveMeetingInfo? ActiveMeeting { get; set; }
    }
}
