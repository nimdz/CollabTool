using TaskService.Models;

namespace TaskService.DTOs
{
    public class TaskUpdateDto
    {
        public string? Title { get; set; }

        public string? Description { get; set; }

        public string? Assignee { get; set; }

        public Models.TaskStatus? Status { get; set; }
    }
}
