using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using TaskService.Models;
using TaskService.Dtos;

namespace TaskService.Services
{
    public class ProjectService : IProjectService
    {
        private readonly DynamoDBContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public ProjectService(IAmazonDynamoDB dynamoDb, IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _context = new DynamoDBContext(dynamoDb);
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        // Find projects where CreatedBy == userId
        public async System.Threading.Tasks.Task<IEnumerable<Project>> GetProjectsByUserAsync(string userId)
        {
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("CreatedBy", ScanOperator.Equal, userId)
            };
            var createdProjects = await _context.ScanAsync<Project>(conditions).GetRemainingAsync();

            conditions = new List<ScanCondition>
            {
                new ScanCondition("Members", ScanOperator.Contains, userId)
            };
            var memberProjects = await _context.ScanAsync<Project>(conditions).GetRemainingAsync();

            return createdProjects.Union(memberProjects).Distinct();
        }

        // Loads a single project from DynamoDB using primary key (projectId)
        public async System.Threading.Tasks.Task<Project?> GetProjectByIdAsync(string projectId)
        {
            return await _context.LoadAsync<Project>(projectId);
        }

        public async System.Threading.Tasks.Task<Project> CreateProjectAsync(CreateProjectRequest request)
        {
            var members = request.Members?.Where(m => !string.IsNullOrEmpty(m)).ToList() ?? new List<string>();


            var project = new Project
            {
                Name = request.Name,
                Description = request.Description ?? string.Empty,
                CreatedBy = request.CreatedBy,
                Members = members
            };

            await _context.SaveAsync(project);
            return project;
        }

        //Update the Project
        public async System.Threading.Tasks.Task<Project?> UpdateProjectAsync(string projectId, Project project)
        {
            var existing = await _context.LoadAsync<Project>(projectId);
            if (existing == null) return null;

            existing.Name = project.Name;
            existing.Description = project.Description;
            await _context.SaveAsync(existing);
            return existing;
        }

        //Add member to project
        public async System.Threading.Tasks.Task<Project?> AddMemberToProjectAsync(string projectId, string userId)
        {
            var project = await _context.LoadAsync<Project>(projectId);
            if (project == null || project.Members.Contains(userId)) return project;

            project.Members.Add(userId);
            await _context.SaveAsync(project);
            return project;
        }

        //Remove member from project
        public async System.Threading.Tasks.Task<Project?> RemoveMemberFromProjectAsync(string projectId, string userId)
        {
            var project = await _context.LoadAsync<Project>(projectId);
            if (project == null) return null;

            project.Members.Remove(userId);
            await _context.SaveAsync(project);
            return project;
        }

        //Delete Project
        public async System.Threading.Tasks.Task<bool> DeleteProjectAsync(string projectId)
        {
            var project = await _context.LoadAsync<Project>(projectId);
            if (project == null) return false;

            await _context.DeleteAsync(project);
            return true;
        }

        //Get All Projects
        public async System.Threading.Tasks.Task<IEnumerable<Project>> GetAllProjectsAsync()
        {
            var conditions = new List<ScanCondition>();
            var allProjects = await _context.ScanAsync<Project>(conditions).GetRemainingAsync();
            return allProjects;
        }

        public async Task<MeetingJoinInfo?> StartMeetingAsync(string projectId, string userId, string userName)
        {

            var project = await _context.LoadAsync<Project>(projectId);


            if (project == null || !project.Members.Contains(userId))
            {

                return null;
            }

            if (project.ActiveMeeting != null)
            {

                return await JoinMeetingAsync(projectId, userId, userName);
            }

            var meetingServiceUrl = _configuration["ServiceUrls:MeetingService"];

            var httpClient = _httpClientFactory.CreateClient();
            var requestBody = new { meetingName = projectId, attendeeName = userName };

            var response = await httpClient.PostAsJsonAsync($"{meetingServiceUrl}/api/meetings/join", requestBody);


            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var joinInfo = await response.Content.ReadFromJsonAsync<MeetingJoinInfo>();


            if (joinInfo == null) return null;


            project.ActiveMeeting = new ActiveMeetingInfo
            {
                ChimeMeetingId = joinInfo.Meeting.MeetingId,
                ApplicationMeetingId = joinInfo.Meeting.ExternalMeetingId,
                StartedBy = userId
            };


            await _context.SaveAsync(project);

            return joinInfo;
        }


        public async Task<MeetingJoinInfo?> JoinMeetingAsync(string projectId, string userId, string userName)
        {
            var project = await _context.LoadAsync<Project>(projectId);
            if (project == null || !project.Members.Contains(userId))
            {
                return null;
            }

            if (project.ActiveMeeting == null)
            {

                return null;
            }


            var meetingServiceUrl = _configuration["ServiceUrls:MeetingService"];
            var httpClient = _httpClientFactory.CreateClient();


            var requestBody = new { meetingName = projectId, attendeeName = userName };
            var response = await httpClient.PostAsJsonAsync($"{meetingServiceUrl}/api/meetings/join", requestBody);

            if (!response.IsSuccessStatusCode) return null;

            return await response.Content.ReadFromJsonAsync<MeetingJoinInfo>();
        }

        public async Task<bool> EndMeetingAsync(string projectId, string userId)
        {
            var project = await _context.LoadAsync<Project>(projectId);
            if (project == null || !project.Members.Contains(userId))
            {
                return false;
            }

            if (project.ActiveMeeting == null)
            {
                return true;
            }


            var meetingServiceUrl = _configuration["ServiceUrls:MeetingService"];
            var httpClient = _httpClientFactory.CreateClient();

            var response = await httpClient.DeleteAsync($"{meetingServiceUrl}/api/meetings/{projectId}");


            project.ActiveMeeting = null;
            await _context.SaveAsync(project);

            return true;
        }
    }
}
