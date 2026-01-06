using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ProjectBackend.Infrastructure.Models;
using ProjectBackend.Interfaces;
using System.ComponentModel.DataAnnotations;

namespace ProjectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<BankUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly ITokenService _tokenService;

        public AuthController(UserManager<BankUser> userManager, IConfiguration configuration, ITokenService tokenService)
        {
            _userManager = userManager;
            _configuration = configuration;
            _tokenService = tokenService;
        }

        // POST: api/Auth/Register
        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = new BankUser
            {
                UserName = request.Email,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PersonalIdentificationNumber = request.PersonalIdentificationNumber
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            // Ensure role name matches seeded roles (case-sensitive in your seeding)
            var roleResult = await _userManager.AddToRoleAsync(user, "Customer");
            if (!roleResult.Succeeded)
            {
                return BadRequest(roleResult.Errors);
            }

            return Ok(new { token = _tokenService.CreateToken(user)});
        }

        // POST: api/Auth/Login
        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
            {
                return Unauthorized("Invalid email or password.");
            }

            return Ok(new { token = _tokenService.CreateToken(user) });
        }
    }

    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }

    public class RegisterRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }

        [Required]
        [MaxLength(40)]
        [MinLength(2)]
        public string FirstName { get; set; }

        [Required]
        [MaxLength(40)]
        [MinLength(2)]
        public string LastName { get; set; }

        [Required]
        [RegularExpression(@"[0-9]{2}(?:0[1-9]|1[0-2]|2[1-9]|3[0-2]|4[1-9]|5[0-2])(?:0[1-9]|[1-2][0-9]|3[0-1])[0-9]{4}")]
        public string PersonalIdentificationNumber { get; set; }
    }
}