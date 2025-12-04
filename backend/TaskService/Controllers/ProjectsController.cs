using Microsoft.AspNetCore.Mvc;
using TaskService.Models;
using TaskService.Services;
using TaskService.Dtos;
using TaskService.Exceptions;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;



namespace TaskService.Controllers
{
    [ApiController]
    [Route("api/taskservice/[controller]")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;

        public ProjectsController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        //Get all projects where a specific user is a member
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjectsByUser(string userId)
        {
            if (string.IsNullOrEmpty(userId)) throw new BadRequestException("User ID is required.");
            var projects = await _projectService.GetProjectsByUserAsync(userId);
            return Ok(projects);
        }

        // Get a single project by project ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetProject(string id)
        {
            if (string.IsNullOrEmpty(id)) throw new BadRequestException("Project ID is required.");
            var project = await _projectService.GetProjectByIdAsync(id);
            if (project == null) throw new NotFoundException("Project not found.");
            return Ok(project);
        }

        //Create a new project
        [HttpPost]
        public async Task<ActionResult<Project>> CreateProject(CreateProjectRequest request)
        {
            if (!ModelState.IsValid) throw new BadRequestException("Invalid project data.");
            if (string.IsNullOrEmpty(request.Name)) throw new BadRequestException("Project name is required.");
            var project = await _projectService.CreateProjectAsync(request);
            return CreatedAtAction(nameof(GetProject), new { id = project.ProjectId }, project);
        }

        //Update an existing project by ID
        [HttpPut("{id}")]
        public async Task<ActionResult<Project>> UpdateProject(string id, Project project)
        {
            if (string.IsNullOrEmpty(id)) throw new BadRequestException("Project ID is required.");
            if (!ModelState.IsValid) throw new BadRequestException("Invalid project data.");
            var updated = await _projectService.UpdateProjectAsync(id, project);
            if (updated == null) throw new NotFoundException("Project not found.");
            return Ok(updated);
        }

        //Add a user as a member to the project
        [HttpPost("{id}/members")]
        public async Task<ActionResult<Project>> AddMember(string id, AddMemberRequest request)
        {
            if (string.IsNullOrEmpty(id)) throw new BadRequestException("Project ID is required.");
            if (string.IsNullOrEmpty(request.UserId)) throw new BadRequestException("User ID is required.");
            var project = await _projectService.AddMemberToProjectAsync(id, request.UserId);
            if (project == null) throw new NotFoundException("Project not found.");
            return Ok(project);
        }

        //Remove a user from project members
        [HttpDelete("{id}/members/{userId}")]
        public async Task<ActionResult<Project>> RemoveMember(string id, string userId)
        {
            if (string.IsNullOrEmpty(id)) throw new BadRequestException("Project ID is required.");
            if (string.IsNullOrEmpty(userId)) throw new BadRequestException("User ID is required.");
            var project = await _projectService.RemoveMemberFromProjectAsync(id, userId);
            if (project == null) throw new NotFoundException("Project not found.");
            return Ok(project);
        }

        //Delete a project completely
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(string id)
        {
            if (string.IsNullOrEmpty(id)) throw new BadRequestException("Project ID is required.");
            var deleted = await _projectService.DeleteProjectAsync(id);
            if (!deleted) throw new NotFoundException("Project not found.");
            return NoContent();
        }

        //Get all projects in the system
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<Project>>> GetAllProjects()
        {
            var projects = await _projectService.GetAllProjectsAsync();
            return Ok(projects);
        }

        //Start or join a meeting inside a project
        // Only logged in user can start/join, username & ID read from JWT token
        [HttpPost("{id}/meetings/start")]
        public async Task<ActionResult<MeetingJoinInfo>> StartMeeting(string id)
        {
            if (string.IsNullOrEmpty(id)) throw new BadRequestException("Project ID is required.");
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userName = User.FindFirstValue(ClaimTypes.Name);

            if (userId is null || userName is null) throw new UnauthorizedException("User identity missing from token.");

            var result = await _projectService.StartMeetingAsync(id, userId, userName);

            if (result is null) throw new BadRequestException("Failed to start or join meeting. Ensure you are a project member.");

            return Ok(result);
        }

        //End a meeting in a project (only allowed if user is authenticated)
        [HttpDelete("{id}/meetings")]
        public async Task<IActionResult> EndMeeting(string id)
        {
            if (string.IsNullOrEmpty(id)) throw new BadRequestException("Project ID is required.");
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId)) throw new UnauthorizedException("Invalid token.");

            var success = await _projectService.EndMeetingAsync(id, userId);
            if (!success) throw new BadRequestException("Failed to end meeting.");
            return NoContent();
        }
    }
}