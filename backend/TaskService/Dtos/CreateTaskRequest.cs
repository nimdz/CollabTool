using System.ComponentModel.DataAnnotations;
using TaskService.Models;

namespace TaskService.Dtos
{
    public class CreateTaskRequest
    {
        [Required(ErrorMessage = "Project ID is required.")]
        public string ProjectId { get; set; } = string.Empty;

        [Required(ErrorMessage = "Task title is required.")]
        [StringLength(200, MinimumLength = 3, ErrorMessage = "Title must be between 3 and 200 characters.")]
        public string Title { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters.")]
        public string Description { get; set; } = string.Empty;

        public string Assignee { get; set; } = string.Empty;
    }
}