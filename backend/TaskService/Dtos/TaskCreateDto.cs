namespace TaskService.DTOs
{
    public class TaskCreateDto
    {
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Assignee { get; set; } = string.Empty;
    }
}
