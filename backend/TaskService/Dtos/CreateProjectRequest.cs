using System.ComponentModel.DataAnnotations;

namespace TaskService.Dtos
{
    public class CreateProjectRequest
    {
        [Required(ErrorMessage = "Project name is required.")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Project name must be between 3 and 100 characters.")]
        public string Name { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Creator ID is required.")]
        public string CreatedBy { get; set; } = string.Empty;

        public List<string> Members { get; set; } = new();
    }
}