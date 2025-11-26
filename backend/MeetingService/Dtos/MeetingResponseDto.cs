
namespace MeetingService.Dtos
{
    public class MeetingResponseDto
    {
        public required MeetingDto Meeting { get; set; }
        public required AttendeeDto Attendee { get; set; }
    }

    public class MeetingDto
    {
        public required string MeetingId { get; set; }
        public required string ExternalMeetingId { get; set; }
        public required MediaPlacementDto MediaPlacement { get; set; }
        public required string MediaRegion { get; set; }
    }

    public class MediaPlacementDto
    {
        public required string AudioHostUrl { get; set; }
        public required string AudioFallbackUrl { get; set; }
        public required string ScreenDataUrl { get; set; }
        public required string ScreenSharingUrl { get; set; }
        public required string ScreenViewingUrl { get; set; }
        public required string SignalingUrl { get; set; }
        public required string TurnControlUrl { get; set; }
    }

    public class AttendeeDto
    {
        public required string AttendeeId { get; set; }
        public required string ExternalUserId { get; set; }
        public required string JoinToken { get; set; }
    }
}