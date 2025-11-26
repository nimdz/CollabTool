
using Amazon.ChimeSDKMeetings;
using Amazon.ChimeSDKMeetings.Model;
using MeetingService.Data;
using MeetingService.Dtos;
using MeetingService.Models;

namespace MeetingService.Services
{
    public class ChimeMeetingService : IChimeMeetingService
    {
        private readonly IAmazonChimeSDKMeetings _chimeSdk;
        private readonly IMeetingRepository _meetingRepository;
        private readonly ILogger<ChimeMeetingService> _logger;

        public ChimeMeetingService(
            IAmazonChimeSDKMeetings chimeSdk,
            IMeetingRepository meetingRepository,
            ILogger<ChimeMeetingService> logger)
        {
            _chimeSdk = chimeSdk;
            _meetingRepository = meetingRepository;
            _logger = logger;
        }

        public async Task<MeetingResponseDto> CreateOrJoinMeetingAsync(MeetingService.Dtos.CreateMeetingRequest request)
        {
            Meeting meeting;
            var activeMeeting = await _meetingRepository.GetMeetingAsync(request.MeetingName);

            if (activeMeeting != null)
            {
                _logger.LogInformation("Found existing meeting for '{MeetingName}'.", request.MeetingName);
                try
                {
                    var getMeetingResponse = await _chimeSdk.GetMeetingAsync(new GetMeetingRequest { MeetingId = activeMeeting.ChimeMeetingId });
                    meeting = getMeetingResponse.Meeting;
                }
                catch (NotFoundException)
                {
                    _logger.LogWarning("Meeting '{MeetingName}' found in repository but not in AWS. Creating a new one.", request.MeetingName);
                    meeting = await CreateNewMeeting(request);
                }
            }
            else
            {
                _logger.LogInformation("No existing meeting found for '{MeetingName}'. Creating a new one.", request.MeetingName);
                meeting = await CreateNewMeeting(request);
            }

            _logger.LogInformation("Creating attendee '{AttendeeName}' for meeting '{MeetingName}'.", request.AttendeeName, request.MeetingName);

            var createAttendeeResponse = await _chimeSdk.CreateAttendeeAsync(new CreateAttendeeRequest
            {
                MeetingId = meeting.MeetingId,
                ExternalUserId = $"{request.AttendeeName}#{Guid.NewGuid()}"
            });

            return new MeetingResponseDto
            {
                Meeting = new MeetingDto
                {
                    MeetingId = meeting.MeetingId,
                    ExternalMeetingId = meeting.ExternalMeetingId,
                    MediaRegion = meeting.MediaRegion,
                    MediaPlacement = new MediaPlacementDto
                    {
                        AudioHostUrl = meeting.MediaPlacement.AudioHostUrl,
                        AudioFallbackUrl = meeting.MediaPlacement.AudioFallbackUrl,
                        ScreenDataUrl = meeting.MediaPlacement.ScreenDataUrl,
                        ScreenSharingUrl = meeting.MediaPlacement.ScreenSharingUrl,
                        ScreenViewingUrl = meeting.MediaPlacement.ScreenViewingUrl,
                        SignalingUrl = meeting.MediaPlacement.SignalingUrl,
                        TurnControlUrl = meeting.MediaPlacement.TurnControlUrl
                    }
                },
                Attendee = new AttendeeDto
                {
                    AttendeeId = createAttendeeResponse.Attendee.AttendeeId,
                    ExternalUserId = createAttendeeResponse.Attendee.ExternalUserId,
                    JoinToken = createAttendeeResponse.Attendee.JoinToken
                }
            };
        }

        public async Task EndMeetingAsync(string meetingName)
        {
            var activeMeeting = await _meetingRepository.GetMeetingAsync(meetingName);
            if (activeMeeting == null)
            {
                _logger.LogWarning("Attempted to end a meeting that does not exist in the repository: {MeetingName}", meetingName);
                return;
            }

            try
            {
                await _chimeSdk.DeleteMeetingAsync(new DeleteMeetingRequest { MeetingId = activeMeeting.ChimeMeetingId });
                _logger.LogInformation("Successfully deleted meeting from AWS Chime: {MeetingId}", activeMeeting.ChimeMeetingId);
            }
            catch (NotFoundException)
            {
                _logger.LogWarning("Attempted to delete a meeting from AWS Chime that was already deleted: {MeetingId}", activeMeeting.ChimeMeetingId);
            }
            finally
            {
                await _meetingRepository.RemoveMeetingAsync(meetingName);
            }
        }

        private async Task<Meeting> CreateNewMeeting(MeetingService.Dtos.CreateMeetingRequest request)
        {
            var chimeMeetingRequest = new Amazon.ChimeSDKMeetings.Model.CreateMeetingRequest
            {
                ExternalMeetingId = request.MeetingName,
                ClientRequestToken = Guid.NewGuid().ToString(),
                MediaRegion = request.MediaRegion
            };

            var createMeetingResponse = await _chimeSdk.CreateMeetingAsync(chimeMeetingRequest);

            var newMeeting = new ActiveMeeting
            {
                ApplicationMeetingId = request.MeetingName,
                ChimeMeetingId = createMeetingResponse.Meeting.MeetingId
            };

            await _meetingRepository.AddMeetingAsync(newMeeting);

            return createMeetingResponse.Meeting;
        }
    }
}