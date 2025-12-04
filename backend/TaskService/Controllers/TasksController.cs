using Microsoft.AspNetCore.Mvc;
using TaskService.Models;
using TaskService.Services;
using TaskService.Dtos;
using TaskService.Exceptions;
using Microsoft.AspNetCore.Authorization;


namespace TaskService.Controllers
{
    [ApiController]
    [Route("api/taskservice/[controller]")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly ITaskService _taskService;

        public TasksController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpGet("project/{projectId}")]
        public async Task<ActionResult<IEnumerable<Models.Task>>> GetTasksByProject(string projectId)
        {
            if (string.IsNullOrEmpty(projectId)) throw new BadRequestException("Project ID is required.");
            var tasks = await _taskService.GetTasksByProjectAsync(projectId);
            return Ok(tasks);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Models.Task>> GetTask(string id)
        {
            if (string.IsNullOrEmpty(id)) throw new BadRequestException("Task ID is required.");
            var task = await _taskService.GetTaskAsync(id);
            if (task == null) throw new NotFoundException("Task not found.");
            return Ok(task);
        }

        [HttpPost]
        public async Task<ActionResult<Models.Task>> CreateTask(CreateTaskRequest request)
        {
            if (!ModelState.IsValid) throw new BadRequestException("Invalid task data.");
            if (string.IsNullOrEmpty(request.Title)) throw new BadRequestException("Task title is required.");
            if (string.IsNullOrEmpty(request.ProjectId)) throw new BadRequestException("Project ID is required.");
            
            var task = new Models.Task
            {
                ProjectId = request.ProjectId,
                Title = request.Title,
                Description = request.Description,
                Assignee = request.Assignee
            };

            var createdTask = await _taskService.CreateTaskAsync(task);
            return CreatedAtAction(nameof(GetTask), new { id = createdTask.TaskId }, createdTask);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Models.Task>> UpdateTask(string id, Models.Task task)
        {
            if (string.IsNullOrEmpty(id)) throw new BadRequestException("Task ID is required.");
            if (!ModelState.IsValid) throw new BadRequestException("Invalid task data.");
            task.TaskId = id;
            var updatedTask = await _taskService.UpdateTaskAsync(task);
            return Ok(updatedTask);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(string id)
        {
            if (string.IsNullOrEmpty(id)) throw new BadRequestException("Task ID is required.");
            await _taskService.DeleteTaskAsync(id);
            return NoContent();
        }

        [HttpGet("user/{userEmail}")]
        public async Task<ActionResult<IEnumerable<Models.Task>>> GetTasksByUser(string userEmail)
        {
            if (string.IsNullOrEmpty(userEmail)) throw new BadRequestException("User email is required.");
            var tasks = await _taskService.GetTasksByUserAsync(userEmail);
            return Ok(tasks);
        }

    }
}