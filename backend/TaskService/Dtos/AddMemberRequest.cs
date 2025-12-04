using System.ComponentModel.DataAnnotations;

namespace TaskService.Dtos
{
    public class AddMemberRequest
    {
        [Required(ErrorMessage = "User ID is required.")]
        public string UserId { get; set; } = string.Empty;
    }
}