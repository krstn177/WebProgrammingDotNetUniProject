using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ProjectBackend.DTOs.UserDTOs;
using ProjectBackend.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Bank")]
    public class BankUserController : ControllerBase
    {
        private readonly UserManager<BankUser> _userManager;

        public BankUserController(UserManager<BankUser> userManager)
        {
            _userManager = userManager;
        }

        // GET: api/BankUser
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BankUserDtoForAdmin>>> GetAllBankUsers()
        {
            var users = _userManager.Users.ToList();
            var userDtos = new List<BankUserDtoForAdmin>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userDtos.Add(new BankUserDtoForAdmin
                {
                    Id = user.Id,
                    Email = user.Email ?? string.Empty,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    PersonalIdentificationNumber = user.PersonalIdentificationNumber,
                    Roles = roles.ToArray()
                });
            }

            return Ok(userDtos);
        }

        // GET: api/BankUser/{id}
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<BankUserDtoForAdmin>> GetBankUserById(Guid id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                return NotFound();
            }

            var roles = await _userManager.GetRolesAsync(user);
            var userDto = new BankUserDtoForAdmin
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PersonalIdentificationNumber = user.PersonalIdentificationNumber,
                Roles = roles.ToArray()
            };

            return Ok(userDto);
        }

        // PUT: api/BankUser/{id}
        [HttpPut("{id:guid}")]
        public async Task<ActionResult> UpdateBankUser(Guid id, [FromBody] BankUserUpdateDtoForAdmin updatedUser)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                return NotFound();
            }

            user.FirstName = updatedUser.FirstName;
            user.LastName = updatedUser.LastName;
            user.Email = updatedUser.Email;
            user.UserName = updatedUser.Email; // Keep username in sync with email
            user.PersonalIdentificationNumber = updatedUser.PersonalIdentificationNumber;

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                return BadRequest(updateResult.Errors);
            }

            if (updatedUser.Roles != null && updatedUser.Roles.Length > 0)
            {
                var currentRoles = await _userManager.GetRolesAsync(user);

                var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
                if (!removeResult.Succeeded)
                {
                    return BadRequest(removeResult.Errors);
                }

                var addResult = await _userManager.AddToRolesAsync(user, updatedUser.Roles);
                if (!addResult.Succeeded)
                {
                    return BadRequest(addResult.Errors);
                }
            }

            return NoContent();
        }

        // DELETE: api/BankUser/{id}
        [HttpDelete("{id:guid}")]
        public async Task<ActionResult> DeleteBankUser(Guid id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                return NotFound();
            }

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return NoContent();
        }
    }
}
