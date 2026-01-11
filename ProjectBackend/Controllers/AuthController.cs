using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using ProjectBackend.DTOs.UserDTOs;
using ProjectBackend.Infrastructure.Interfaces;
using ProjectBackend.Infrastructure.Models;
using ProjectBackend.Interfaces;
using ProjectBackend.Services;

namespace ProjectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<BankUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly ITokenService _tokenService;
        private readonly IBankAccountRepository _accountRepo;

        public AuthController(
            UserManager<BankUser> userManager,
            IConfiguration configuration,
            ITokenService tokenService,
            IBankAccountRepository accountRepo)
        {
            _userManager = userManager;
            _configuration = configuration;
            _tokenService = tokenService;
            _accountRepo = accountRepo;
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

            var roleResult = await _userManager.AddToRoleAsync(user, "Customer");
            if (!roleResult.Succeeded)
            {
                return BadRequest(roleResult.Errors);
            }

            var bankAccount = new BankAccount
            {
                IBAN = GenerateIBAN(),
                AccountNumber = GenerateAccountNumber(),
                Balance = 0m,
                BankUserId = user.Id
            };

            await _accountRepo.AddAsync(bankAccount, default);
            var savedAccount = await _accountRepo.SaveChangesAsync(default);
            if (!savedAccount)
            {
                await _userManager.DeleteAsync(user);
                return StatusCode(500, "Unable to create bank account for user.");
            }

            var roles = await _userManager.GetRolesAsync(user);
            var token = _tokenService.CreateToken(user);

            var userDto = new BankUserDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Token = token,
                Roles = roles.ToArray()
            };

            return Ok(userDto);
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

            var roles = await _userManager.GetRolesAsync(user);
            var token = _tokenService.CreateToken(user);

            var userDto = new BankUserDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Token = token,
                Roles = roles.ToArray()
            };

            return Ok(userDto);
        }

        // ---------- Helper methods for generating IBAN and Account Number ----------

        private static string GenerateIBAN()
        {
            var sb = new StringBuilder(22);
            sb.Append("BG");
            
            sb.Append(RandomNumberGenerator.GetInt32(10, 100).ToString("D2"));
            
            sb.Append("BANK");
            
            for (int i = 0; i < 14; i++)
            {
                sb.Append(RandomNumberGenerator.GetInt32(0, 10));
            }
            
            return sb.ToString();
        }

        private static string GenerateAccountNumber()
        {
            var sb = new StringBuilder(10);
            for (int i = 0; i < 10; i++)
            {
                sb.Append(RandomNumberGenerator.GetInt32(0, 10));
            }
            return sb.ToString();
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