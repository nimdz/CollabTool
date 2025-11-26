
using System.ComponentModel.DataAnnotations;

namespace MeetingService.Dtos
{
    public class CreateMeetingRequest
    {
        [Required]
        [MinLength(2)]
        [MaxLength(64)]
        public required string MeetingName { get; set; }

        [Required]
        [MinLength(2)]
        [MaxLength(64)]
        public required string AttendeeName { get; set; }

        public string MediaRegion { get; set; } = "us-east-1";
    }
}