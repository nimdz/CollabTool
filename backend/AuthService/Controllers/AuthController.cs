using Microsoft.AspNetCore.Mvc;
using AuthService.DTOs;
using AuthService.Services;
using AuthService.Exceptions;
using Microsoft.AspNetCore.Authorization;
using AuthService.Data;
using System.Linq;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IProfileService _profileService;

        public AuthController(IAuthService authService, IProfileService profileService)
        {
            _authService = authService;
            _profileService = profileService;
        }

        //Register new user API
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            if (!ModelState.IsValid) throw new BadRequestException("Invalid registration data.");
            var result = await _authService.RegisterAsync(request);
            if (result == null) throw new BadRequestException("User already exists.");

            return Ok(result);
        }

        //Login API
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            if (!ModelState.IsValid) throw new BadRequestException("Invalid login data.");
            var result = await _authService.LoginAsync(request);
            if (result == null) throw new UnauthorizedException("Invalid email or password.");

            return Ok(result);
        }

        //Get current logged-in user profile
        [HttpGet("me")]
        [Authorize]
        public IActionResult GetCurrentUser()
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username)) throw new UnauthorizedException("Invalid token.");

            var user = _profileService.GetProfile(username);
            if (user == null) throw new NotFoundException("User not found.");

            return Ok(user);
        }
    }
}
