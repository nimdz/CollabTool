
namespace TaskService.Dtos
{
    public class MeetingRequestDto
    {
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
    }

    public class MeetingJoinInfo
    {
        public MeetingInfo Meeting { get; set; } = new();
        public AttendeeInfo Attendee { get; set; } = new();
    }

    public class MeetingInfo
    {
        public string MeetingId { get; set; } = string.Empty;
        public string ExternalMeetingId { get; set; } = string.Empty;
        public MediaPlacementInfo MediaPlacement { get; set; } = new();
        public string MediaRegion { get; set; } = string.Empty;
    }

    public class MediaPlacementInfo
    {
        public string AudioHostUrl { get; set; } = string.Empty;
        public string AudioFallbackUrl { get; set; } = string.Empty;
        public string ScreenDataUrl { get; set; } = string.Empty;
        public string ScreenSharingUrl { get; set; } = string.Empty;
        public string ScreenViewingUrl { get; set; } = string.Empty;
        public string SignalingUrl { get; set; } = string.Empty;
        public string TurnControlUrl { get; set; } = string.Empty;
    }

    public class AttendeeInfo
    {
        public string AttendeeId { get; set; } = string.Empty;
        public string ExternalUserId { get; set; } = string.Empty;
        public string JoinToken { get; set; } = string.Empty;

    }
}